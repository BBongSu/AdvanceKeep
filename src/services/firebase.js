// Firebase 앱 초기화 및 필요한 SDK 모듈 가져오기
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
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

// 브라우저 세션 지속성 설정: 브라우저를 닫으면 로그아웃 (기본값)
// 이 설정은 이제 useAuth.jsx의 login 함수에서 사용자의 선택에 따라 동적으로 처리됩니다.
// 초기값 설정을 유지하고 싶다면 아래 주석을 해제할 수 있습니다.
/*
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error('세션 지속성 설정 실패:', error);
});
*/

export const db = getFirestore(app);

export default app;
