import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';

// Helper to format Firebase user object to match app's expected user structure
const formatUser = (user) => {
  return {
    id: user.uid,
    name: user.displayName || user.email.split('@')[0],
    email: user.email,
  };
};

export const registerUser = async ({ name, email, password }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: name,
    });

    // Save user info to Firestore for searching by email
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



export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user exists in Firestore (Migration/Self-repair)
    const userDocRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      // If missing, create it now
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

export const logoutUser = async () => {
  await firebaseSignOut(auth);
};

// Re-implemented for sharing feature
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

// Optional: If you need to check session state directly
export const getCurrentUser = () => {
  const user = auth.currentUser;
  return user ? formatUser(user) : null;
};
