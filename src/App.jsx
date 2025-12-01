import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Archive from './pages/Archive';
import Trash from './pages/Trash';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          }
        >
          <Route index element={<Home />} />
          <Route path="archive" element={<Archive />} />
          <Route path="trash" element={<Trash />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
