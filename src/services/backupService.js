
import { db } from './firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

/**
 * 사용자 ID에 해당하는 모든 데이터를 백업용 객체로 추출
 * @param {string} userId
 * @returns {Promise<Object>} { date, data: { notes, labels } }
 */
export const exportBackupData = async (userId) => {
    if (!userId) throw new Error("User ID is required for backup.");

    // 1. Notes (Trash, Archive 포함 모든 상태의 노트)
    const notesRef = collection(db, 'notes');
    const notesQuery = query(notesRef, where('userId', '==', userId));
    const notesSnap = await getDocs(notesQuery);
    const notes = notesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // 2. Labels
    const labelsRef = collection(db, 'labels');
    const labelsQuery = query(labelsRef, where('userId', '==', userId));
    const labelsSnap = await getDocs(labelsQuery);
    const labels = labelsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return {
        backupDate: new Date().toISOString(),
        version: 1,
        data: {
            notes,
            labels
        }
    };
};

/**
 * 백업 데이터를 사용하여 복원
 * 주의: 기존 데이터를 모두 삭제하고 덮어씁니다.
 * @param {string} userId
 * @param {Object} backupData
 */
export const importBackupData = async (userId, backupData) => {
    if (!userId) throw new Error("User ID is required for restore.");
    if (!backupData || !backupData.data) throw new Error("Invalid backup data format.");

    const { notes, labels } = backupData.data;

    // 배치 작업을 청크(450개 단위)로 나누어 처리하는 헬퍼 함수
    const processBatchChunks = async (items, operationType) => {
        const CHUNK_SIZE = 450; // Firestore 배치 제한(500개) 대비 안전 마진 확보
        for (let i = 0; i < items.length; i += CHUNK_SIZE) {
            const chunk = items.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(db);

            chunk.forEach(item => {
                if (operationType === 'DELETE') {
                    // item은 QueryDocumentSnapshot
                    batch.delete(doc(db, item.collectionName, item.id));
                } else if (operationType === 'SET') {
                    // item은 id와 데이터를 포함하는 객체
                    const { id, ...data } = item;
                    const { collectionName } = item; // collectionName 추출
                    // 주의: item에 collectionName이 있어야 함.
                    batch.set(doc(db, collectionName, id), { ...data, userId });
                }
            });
            await batch.commit();
        }
    };

    // 1. 삭제할 모든 항목 수집
    const deleteOps = [];

    // 삭제할 노트 수집
    const notesRef = collection(db, 'notes');
    const existingNotesQuery = query(notesRef, where('userId', '==', userId));
    const existingNotesSnap = await getDocs(existingNotesQuery);
    existingNotesSnap.docs.forEach(d => deleteOps.push({ id: d.id, collectionName: 'notes' }));

    // 삭제할 라벨 수집
    const labelsRef = collection(db, 'labels');
    const existingLabelsQuery = query(labelsRef, where('userId', '==', userId));
    const existingLabelsSnap = await getDocs(existingLabelsQuery);
    existingLabelsSnap.docs.forEach(d => deleteOps.push({ id: d.id, collectionName: 'labels' }));

    // 삭제 실행
    await processBatchChunks(deleteOps, 'DELETE');

    // 2. 생성할 모든 항목 수집
    const createOps = [];
    notes.forEach(n => createOps.push({ ...n, collectionName: 'notes' }));
    labels.forEach(l => createOps.push({ ...l, collectionName: 'labels' }));

    // 생성 실행
    // 주의: createOps의 각 항목에 collectionName이 있어야 함.
    await processBatchChunks(createOps, 'SET');
};
