import React from 'react';
import { FiFileText, FiTrash2, FiArchive } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { MENU_ITEMS, MENU_LABELS } from '../../constants';

const MENU_CONFIG = [
  { icon: FiFileText, id: MENU_ITEMS.NOTES, path: '/' },
  { icon: FiArchive, id: MENU_ITEMS.ARCHIVE, path: '/archive' },
  { icon: FiTrash2, id: MENU_ITEMS.TRASH, path: '/trash' },
];

const Sidebar = ({ isOpen, onMenuClick }) => {
  const handleItemClick = (menuId) => {
    if (onMenuClick) {
      onMenuClick(menuId);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => onMenuClick && onMenuClick(null)} // Close sidebar
          aria-label="사이드바 닫기"
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {MENU_CONFIG.map(({ icon: Icon, id, path }) => (
          <NavLink
            key={id}
            to={path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
            onClick={() => handleItemClick(id)}
          >
            <div className="sidebar-icon">
              <Icon size={24} />
            </div>
            <span className="sidebar-label">{MENU_LABELS[id]}</span>
          </NavLink>
        ))}
      </aside>
    </>
  );
};

export default Sidebar;
