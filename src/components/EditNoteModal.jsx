import React, { useState, useRef, useEffect } from 'react';

const EditNoteModal = ({ note, onUpdate, onClose }) => {
  const [title, setTitle] = useState(note.title || '');
  const [text, setText] = useState(note.text || '');
  const modalRef = useRef(null);

  const handleSave = async () => {
    try {
      const ok = await onUpdate({ ...note, title, text });
      if (ok !== false) {
        onClose();
      }
    } catch (err) {
      // onUpdate already handles its own error reporting
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-content"
        ref={modalRef}
        style={{ backgroundColor: `var(--note-${note.color || 'white'})` }}
      >
        <div className="note-title modal-title">
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="note-title-input modal-input"
          />
        </div>

        <div className="note-content modal-body">
          <textarea
            placeholder="메모를 입력하세요..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={Math.max(3, text.split('\n').length)}
            className="note-input modal-input"
          />
        </div>

        <div className="note-actions modal-actions">
          <button className="close-btn" onClick={onClose}>취소</button>
          <button className="close-btn primary" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default EditNoteModal;
