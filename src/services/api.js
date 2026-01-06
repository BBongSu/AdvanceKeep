import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  setDoc,
  documentId,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

const NOTES_COLLECTION = 'notes';

/**
 * Firestore 문서를 앱에서 사용하는 Note 객체로 변환
 * - Timestamp 객체를 ISO 문자열로 변환하여 JSON 호환성 유지
 */
const docToNote = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  };
};


/**
 * 노트 배열에 작성자 및 공유 대상의 이름 정보를 주입합니다.
 * @param {Array} notes - 처리할 노트 배열
 * @returns {Promise<Array>} 이름 정보가 주입된 노트 배열
 */
export const enrichNotesWithNames = async (notes) => {
  if (!notes || notes.length === 0) return [];

  // unique UIDs 수집: 작성자(userId) 및 공유 대상(sharedWith)
  const userIdsToFetch = new Set();
  notes.forEach(note => {
    if (note.userId) userIdsToFetch.add(note.userId);
    if (note.sharedWith && Array.isArray(note.sharedWith)) {
      note.sharedWith.forEach(uid => userIdsToFetch.add(uid));
    }
  });

  // 사용자 정보 조회 (캐싱을 위해 Map 사용)
  const userMap = new Map();
  const userPromises = Array.from(userIdsToFetch).map(uid =>
    getDoc(doc(db, 'users', uid)).then(userSnap => {
      if (userSnap.exists()) {
        userMap.set(uid, userSnap.data().name || 'Unknown');
      }
    }).catch(err => console.error(`Failed to fetch user ${uid}`, err))
  );

  await Promise.all(userPromises);

  // 노트 객체에 이름 정보 주입
  return notes.map(note => {
    const ownerName = userMap.get(note.userId) || 'Unknown';
    const sharedWithNames = (note.sharedWith || [])
      .map(uid => userMap.get(uid) || 'Unknown');

    return {
      ...note,
      ownerName,
      sharedWithNames,
    };
  });
};

/**
 * 실시간 메모 구독
 * @param {string} userId - 현재 사용자 ID
 * @param {function} callback - 데이터 변경 시 실행할 콜백 함수
 * @returns {function} 구독 해제 함수
 */
export const subscribeNotes = (userId, callback) => {
  if (!userId) return () => { };

  const notesRef = collection(db, NOTES_COLLECTION);

  // 내가 작성한 메모 + 나에게 공유된 메모를 한꺼번에 구독하기 위해 
  // Firestore의 query 조합 한계를 고려하여 필터를 사용하거나, 
  // 여기서는 userId가 ownerId 또는 sharedWith에 포함된 문서를 실시간으로 추적합니다.
  // 참고: 복합 쿼리(OR)는 지원 범위가 한정적이므로, 
  // 가장 넓은 범위인 '전체'를 구독하고 클라이언트에서 필터링하거나 
  // 혹은 두 개의 스냅샷 구독을 관리할 수 있습니다.

  // 여기서는 사용자 경험을 위해 두 쿼리를 별도로 구독하고 병합하는 방식을 사용합니다.
  const ownedQuery = query(notesRef, where('userId', '==', userId));
  const sharedQuery = query(notesRef, where('sharedWith', 'array-contains', userId));

  let ownedNotes = [];
  let sharedNotes = [];

  const updateAndNotify = async () => {
    const allNotes = [...ownedNotes, ...sharedNotes];
    const uniqueNotesMap = new Map();
    allNotes.forEach(note => uniqueNotesMap.set(note.id, note));

    // 이름 정보 주입 후 콜백 실행
    const enriched = await enrichNotesWithNames(Array.from(uniqueNotesMap.values()));
    callback(enriched);
  };

  const unsubOwned = onSnapshot(ownedQuery, (snapshot) => {
    ownedNotes = snapshot.docs.map(docToNote);
    updateAndNotify();
  }, (err) => console.error('Owned notes subscription error:', err));

  const unsubShared = onSnapshot(sharedQuery, (snapshot) => {
    sharedNotes = snapshot.docs.map(docToNote);
    updateAndNotify();
  }, (err) => console.error('Shared notes subscription error:', err));

  return () => {
    unsubOwned();
    unsubShared();
  };
};

/**
 * 새 메모 생성
 * @param {Object} note - 메모 데이터
 */
export const createNote = async (note) => {
  const noteData = {
    ...note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // ID가 있으면 setDoc으로 지정된 ID 사용, 없으면 addDoc으로 자동 생성
  if (note.id) {
    await setDoc(doc(db, NOTES_COLLECTION, note.id), noteData);
    return { ...noteData };
  } else {
    const docRef = await addDoc(collection(db, NOTES_COLLECTION), noteData);
    return { id: docRef.id, ...noteData };
  }
};

/**
 * 메모 수정
 * @param {Object} note - 수정할 메모 데이터 (id 포함)
 */
export const updateNote = async (note) => {
  const noteRef = doc(db, NOTES_COLLECTION, note.id);
  const { id, ...updateData } = note;

  // 수정 시간 업데이트
  updateData.updatedAt = new Date().toISOString();

  await updateDoc(noteRef, updateData);

  // Return the updated note object
  return { id, ...updateData };
};

/**
 * 메모 삭제
 * @param {string} id - 삭제할 메모 ID
 */
export const deleteNote = async (id) => {
  await deleteDoc(doc(db, NOTES_COLLECTION, id));
  return { id }; // Return id to confirm deletion
};
