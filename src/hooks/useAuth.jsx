import React, { createContext, useContext, useEffect, useState } from 'react';
import { AUTH_STORAGE_KEY } from '../constants';
import { loginUser, registerUser } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 앱 시작 시 저장된 로그인 정보 불러오기 (sessionStorage 사용 - 브라우저 종료 시 삭제됨)
  const [user, setUser] = useState(() => {
    if (typeof sessionStorage === 'undefined') return null;
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  // 로그인 상태 변동 시 sessionStorage에 동기화 (브라우저 종료 시 자동 삭제)
  useEffect(() => {
    if (typeof sessionStorage === 'undefined') return;
    if (user) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  // 로그인 처리
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await loginUser(email, password);
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
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, ready, login, signup, logout }}>
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
