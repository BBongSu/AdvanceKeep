import React, { useState, useRef, useEffect } from 'react';
import { FiCheckSquare, FiImage, FiEdit2, FiBell, FiUserPlus, FiPalette, FiArchive, FiMoreVertical, FiRotateCcw, FiRotateCw } from 'react-icons/fi';

const NoteInput = ({ onAddNote }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const formRef = useRef(null);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    if (title.trim() || content.trim()) {
      onAddNote({
        title,
        content,
        color: 'white',
        isPinned: false,
        isArchived: false,
        createdAt: Date.now(),
      });
      setTitle('');
      setContent('');
    }
    setIsExpanded(false);
  };

  // Removed click outside handler for now

  return (
    <div className="note-input-container" ref={formRef}>
      <div className={`note-input-wrapper ${isExpanded ? 'expanded' : ''}`}>
        {isExpanded && (
          <div className="note-title">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        )}

        <div className="note-content">
          <textarea
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onClick={handleExpand}
            rows={isExpanded ? 3 : 1}
          />
          {!isExpanded && (
            <div className="collapsed-actions">
              <button className="icon-btn"><FiCheckSquare size={20} /></button>
              <button className="icon-btn"><FiEdit2 size={20} /></button>
              <button className="icon-btn"><FiImage size={20} /></button>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="note-actions">
            <div className="action-icons">
              <button className="icon-btn small"><FiBell size={18} /></button>
              <button className="icon-btn small"><FiUserPlus size={18} /></button>
              <button className="icon-btn small"><FiPalette size={18} /></button>
              <button className="icon-btn small"><FiImage size={18} /></button>
              <button className="icon-btn small"><FiArchive size={18} /></button>
              <button className="icon-btn small"><FiMoreVertical size={18} /></button>
              <button className="icon-btn small"><FiRotateCcw size={18} /></button>
              <button className="icon-btn small"><FiRotateCw size={18} /></button>
            </div>
            <button className="close-btn" onClick={handleCollapse}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteInput;
