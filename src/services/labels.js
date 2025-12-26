import { db } from './firebase';
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
} from 'firebase/firestore';

const LABELS_COLLECTION = 'labels';

/**
 * 실시간 라벨 구독
 * @param {string} userId - 현재 사용자 ID
 * @param {function} callback - 데이터 변경 시 실행할 콜백 함수
 * @returns {function} 구독 해제 함수
 */
export const subscribeLabels = (userId, callback) => {
    if (!userId) return () => { };

    const labelsRef = collection(db, LABELS_COLLECTION);
    const q = query(labelsRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const labels = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateA - dateB; // 등록순 (오름차순) 정렬
        });
        callback(labels);
    }, (err) => console.error('Labels subscription error:', err));

    return unsubscribe;
};

/**
 * 새 라벨 생성
 * @param {string} userId - 사용자 ID
 * @param {string} name - 라벨 이름
 */
export const createLabel = async (userId, name) => {
    if (!name || !name.trim()) return;

    await addDoc(collection(db, LABELS_COLLECTION), {
        userId,
        name: name.trim(),
        createdAt: new Date().toISOString()
    });
};

/**
 * 라벨 이름 수정
 * @param {string} id - 라벨 ID
 * @param {string} name - 새 이름
 */
export const updateLabel = async (id, name) => {
    if (!name || !name.trim()) return;

    const labelRef = doc(db, LABELS_COLLECTION, id);
    await updateDoc(labelRef, {
        name: name.trim(),
        updatedAt: new Date().toISOString()
    });
};

/**
 * 라벨 삭제
 * @param {string} id - 라벨 ID
 */
export const deleteLabel = async (id) => {
    await deleteDoc(doc(db, LABELS_COLLECTION, id));
};
