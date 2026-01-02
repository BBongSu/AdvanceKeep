import { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useDarkMode } from './hooks/useDarkMode';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useBackButton } from './hooks/useBackButton';

// 페이지 지연 로딩
const Home = lazy(() => import('./pages/Home'));
const Archive = lazy(() => import('./pages/Archive'));
const Trash = lazy(() => import('./pages/Trash'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// 간단한 로딩 대체 컴포넌트
const PageLoader = () => (
  <div className="loading-container" style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <div className="loading">Loading...</div>
  </div>
);

// Router Context 내부에서 훅을 사용하기 위한 헬퍼 컴포넌트
const BackButtonHandler = () => {
  useBackButton();
  return null;
};

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AuthProvider>
      <BrowserRouter>
        <BackButtonHandler />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="todo" element={<Home />} />
              <Route path="archive" element={<Archive />} />
              <Route path="trash" element={<Trash />} />
              <Route path="label/:labelId" element={<Home />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
