// Firebase 앱 초기화 및 필요한 SDK 모듈 가져오기
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase 프로젝트 설정 정보
// Firebase Console > 프로젝트 설정 > 일반 > 내 앱에서 확인 가능합니다.
const firebaseConfig = {
  apiKey: "AIzaSyC6hCtfzHKhY9riBHc7I2mnZ23YwMGsAok",
  authDomain: "advancekeep-1e051.firebaseapp.com",
  projectId: "advancekeep-1e051",
  storageBucket: "advancekeep-1e051.firebasestorage.app",
  messagingSenderId: "246582604160",
  appId: "1:246582604160:web:3697b312cda57414d45165"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 다른 파일에서 사용할 수 있도록 인증(Auth) 및 데이터베이스(Firestore) 객체 내보내기
export const auth = getAuth(app);
auth.languageCode = 'ko'; // 이메일 템플릿 언어를 한국어로 설정

export const db = getFirestore(app);

export default app;
