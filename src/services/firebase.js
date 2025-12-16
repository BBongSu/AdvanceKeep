import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6hCtfzHKhY9riBHc7I2mnZ23YwMGsAok",
  authDomain: "advancekeep-1e051.firebaseapp.com",
  projectId: "advancekeep-1e051",
  storageBucket: "advancekeep-1e051.firebasestorage.app",
  messagingSenderId: "246582604160",
  appId: "1:246582604160:web:3697b312cda57414d45165"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
