import React, { useEffect, useRef, useState } from 'react';
import { FiMenu, FiSearch, FiX, FiMoon, FiSun, FiFileText, FiLogOut, FiGrid, FiList, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ toggleSidebar, searchQuery, onSearchChange, isDarkMode, onToggleDarkMode, viewMode, onViewModeChange, sortOrder, onSortOrderChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 프로필 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarLabel = user ? (user.name || user.email || '?').charAt(0).toUpperCase() : '?';

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
        <div className="brand-mark" aria-hidden="true">
          <FiFileText size={20} />
        </div>
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
        {onSortOrderChange && (
          <button
            className="icon-btn sort-order-btn"
            onClick={() => onSortOrderChange(sortOrder === 'latest' ? 'oldest' : 'latest')}
            aria-label={sortOrder === 'latest' ? '오래된 순으로 정렬' : '최신순으로 정렬'}
            title={sortOrder === 'latest' ? '최신순' : '오래된 순'}
          >
            <FiClock size={20} style={{ color: sortOrder === 'oldest' ? '#10b981' : 'inherit' }} />
          </button>
        )}
        {onViewModeChange && (
          <button
            className="icon-btn view-mode-btn"
            onClick={() => onViewModeChange(viewMode === 'list' ? 'card' : 'list')}
            aria-label={viewMode === 'list' ? '그리드 뷰로 전환' : '리스트 뷰로 전환'}
            title={viewMode === 'list' ? '그리드 뷰' : '리스트 뷰'}
          >
            {viewMode === 'list' ? <FiGrid size={20} /> : <FiList size={20} />}
          </button>
        )}
        <button
          className="icon-btn dark-mode-btn"
          onClick={onToggleDarkMode}
          aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
        {user ? (
          <div className="profile-wrapper" ref={profileRef}>
            <button
              className="profile-avatar"
              onClick={() => setProfileOpen((prev) => !prev)}
              type="button"
              aria-label="프로필 메뉴 열기"
            >
              {avatarLabel}
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-name">{user.name || '이름 없음'}</div>
                  <div className="profile-email">{user.email}</div>
                </div>
                <button className="profile-logout" onClick={handleLogout} type="button">
                  <FiLogOut size={16} />
                  <span>로그아웃</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="logout-btn" onClick={() => navigate('/login')} type="button">
            로그인
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
