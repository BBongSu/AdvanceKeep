import React, { createContext, useContext, useEffect, useState } from 'react';
import { AUTH_STORAGE_KEY } from '../constants';
import { loginUser, registerUser, loginWithGoogle } from '../services/auth';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth as firebaseAuth } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 앱 시작 시 저장된 로그인 정보 불러오기 (localStorage -> 없으면 sessionStorage 순으로 확인)
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    const localStored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (localStored) return JSON.parse(localStored);

    const sessionStored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return sessionStored ? JSON.parse(sessionStored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  // 로그아웃 시 모든 저장소 정리
  const clearAuthStorage = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // 로그인 처리
  const login = async (email, password, stayLoggedIn = false) => {
    setLoading(true);
    setError(null);
    try {
      // Firebase 지속성 설정 적용
      const persistence = stayLoggedIn ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(firebaseAuth, persistence);

      const loggedInUser = await loginUser(email, password);

      // 사용자 선택에 따라 저장소 결정
      if (stayLoggedIn) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }

      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 처리
  const signup = async ({ name, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const registeredUser = await registerUser({ name, email, password });
      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
  };

  // 구글 로그인 처리
  const handleGoogleLogin = async (stayLoggedIn = false) => {
    setLoading(true);
    setError(null);
    try {
      // Firebase 지속성 설정 적용
      const persistence = stayLoggedIn ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(firebaseAuth, persistence);

      const loggedInUser = await loginWithGoogle();

      // 사용자 선택에 따라 저장소 결정
      if (stayLoggedIn) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }

      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, ready, login, signup, logout, loginWithGoogle: handleGoogleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
