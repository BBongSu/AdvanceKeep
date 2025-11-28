import React from 'react';
import { FiMenu, FiSearch, FiX, FiMoon, FiSun } from 'react-icons/fi';

const Header = ({ toggleSidebar, searchQuery, onSearchChange, isDarkMode, onToggleDarkMode }) => {
  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="icon-btn hamburger-btn" 
          onClick={toggleSidebar}
          aria-label="메뉴 열기"
        >
          <FiMenu size={24} />
        </button>
        <h1 className="header-title">AdvanceKeep</h1>
      </div>
      <div className="header-center">
        <div className="search-bar">
          <FiSearch className="search-icon" size={20} />
          <input
            type="text"
            placeholder="검색"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={handleClearSearch}
              type="button"
              aria-label="검색어 지우기"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="header-right">
        <button
          className="icon-btn dark-mode-btn"
          onClick={onToggleDarkMode}
          aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
