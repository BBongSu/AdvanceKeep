import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';

/**
 * Firebase 사용자 객체를 앱에서 사용하는 형태로 변환
 * @param {Object} user - Firebase User 객체
 * @returns {Object} 앱 사용자 객체
 */
const formatUser = (user) => {
  return {
    id: user.uid,
    name: user.displayName || user.email.split('@')[0],
    email: user.email,
  };
};

/**
 * 회원가입 함수
 * 1. Firebase Auth에 계정 생성
 * 2. 사용자 프로필(이름) 업데이트
 * 3. Firestore 'users' 컬렉션에 사용자 정보 저장 (사용자 검색용)
 */
export const registerUser = async ({ name, email, password }) => {
  try {
    // 1. 계정 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. 프로필 업데이트
    await updateProfile(user, {
      displayName: name,
    });

    // 3. Firestore에 사용자 정보 저장
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: name,
      email: user.email,
      createdAt: new Date().toISOString(),
    });

    return formatUser(user);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('이미 가입된 이메일입니다.');
    }
    throw error;
  }
};

/**
 * 로그인 함수
 * - 로그인 성공 시 Firestore에 사용자 정보가 없으면 자동 생성 (자기 복구 로직)
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firestore에 사용자 정보가 있는지 확인 (기존 계정 호환성 및 복구용)
    const userDocRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      // 정보가 없으면 새로 생성
      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        createdAt: new Date().toISOString(),
      });
    }

    return formatUser(user);
  } catch (error) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
    throw error;
  }
};

/**
 * 로그아웃 함수
 */
export const logoutUser = async () => {
  await firebaseSignOut(auth);
};

/**
 * 이메일로 사용자 찾기 (공유 기능용)
 * @param {string} email - 검색할 이메일
 * @returns {Object|null} 찾은 사용자 정보 또는 null
 */
export const findUserByEmail = async (email) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0].data();
  return {
    id: userDoc.uid,
    name: userDoc.name,
    email: userDoc.email,
  };
};

/**
 * 이름으로 이메일 찾기
 * @param {string} name - 찾을 사용자 이름
 * @returns {Array} 찾은 이메일 목록 (동명이인 가능성)
 */
export const findEmailByName = async (name) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('name', '==', name));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return [];
  }

  // 동명이인이 있을 수 있으므로 배열로 반환
  return querySnapshot.docs.map(doc => doc.data().email);
};

// 현재 로그인된 사용자 확인 (세션 체크용)
export const getCurrentUser = () => {
  const user = auth.currentUser;
  return user ? formatUser(user) : null;
};
