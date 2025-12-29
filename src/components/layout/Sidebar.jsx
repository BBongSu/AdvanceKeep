import React, { useState } from 'react';
import { FiFileText, FiTrash2, FiArchive, FiTag, FiEdit2, FiCheckSquare } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { MENU_ITEMS, MENU_LABELS } from '../../constants';
import { useLabels } from '../../hooks/useLabels';
import LabelManagerModal from '../features/labels/LabelManagerModal';

const MENU_CONFIG = [
  { icon: FiFileText, id: MENU_ITEMS.NOTES, path: '/' },
  { icon: FiCheckSquare, id: MENU_ITEMS.TODO, path: '/todo' },
  { icon: FiArchive, id: MENU_ITEMS.ARCHIVE, path: '/archive' },
  { icon: FiTrash2, id: MENU_ITEMS.TRASH, path: '/trash' },
];

const Sidebar = ({ isOpen, onMenuClick }) => {
  const { labels } = useLabels();
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

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
          onClick={() => onMenuClick && onMenuClick(null)} // 사이드바 닫기
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

        {/* 라벨 영역 */}
        <div className="sidebar-labels-section">
          {labels.map(label => (
            <NavLink
              key={label.id}
              to={`/label/${label.id}`}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(`label-${label.id}`)}
            >
              <div className="sidebar-icon">
                <FiTag size={24} />
              </div>
              <span className="sidebar-label">{label.name}</span>
            </NavLink>
          ))}

          {/* 라벨 수정 버튼 */}
          <button
            className="sidebar-item"
            onClick={() => setIsLabelModalOpen(true)}
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <div className="sidebar-icon">
              <FiEdit2 size={24} />
            </div>
            <span className="sidebar-label">라벨 수정</span>
          </button>
        </div>
      </aside>

      {isLabelModalOpen && (
        <LabelManagerModal onClose={() => setIsLabelModalOpen(false)} />
      )}
    </>
  );
};


export default React.memo(Sidebar);
