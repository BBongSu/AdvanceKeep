import React from 'react';
import { FiFileText, FiTrash2 } from 'react-icons/fi';
import { MENU_ITEMS, MENU_LABELS } from '../constants';

const MENU_CONFIG = [
  { icon: FiFileText, id: MENU_ITEMS.NOTES },
  { icon: FiTrash2, id: MENU_ITEMS.TRASH },
];

const Sidebar = ({ isOpen, onMenuClick, activeMenu }) => {
  const handleItemClick = (menuId) => {
    if (onMenuClick) {
      onMenuClick(menuId);
    }
  };

  const handleOverlayClick = () => {
    handleItemClick(activeMenu);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={handleOverlayClick}
          aria-label="사이드바 닫기"
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {MENU_CONFIG.map(({ icon: Icon, id }) => (
          <div 
            key={id} 
            className={`sidebar-item ${activeMenu === id ? 'active' : ''}`}
            onClick={() => handleItemClick(id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleItemClick(id);
              }
            }}
          >
            <div className="sidebar-icon">
              <Icon size={24} />
            </div>
            <span className="sidebar-label">{MENU_LABELS[id]}</span>
          </div>
        ))}
      </aside>
    </>
  );
};

export default Sidebar;
