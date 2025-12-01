import React, { useState, useRef, useEffect } from 'react';
import { FiImage, FiX } from 'react-icons/fi';
import { useImageUpload } from '../../../hooks/useImageUpload';

const EditNoteModal = ({ note, onUpdate, onClose }) => {
  const [title, setTitle] = useState(note.title || '');
  const [text, setText] = useState(note.text || '');
  const { selectedImage, handleImageSelect, clearImage } = useImageUpload(note.image);
  const modalRef = useRef(null);

  const handleSave = async () => {
    try {
      const ok = await onUpdate({ ...note, title, text, image: selectedImage });
      if (ok !== false) {
        onClose();
      }
    } catch {
      // onUpdate already handles its own error reporting
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageSelect(file);
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
        style={{ backgroundColor: note.color || 'var(--bg-secondary)' }}
      >
        <div className="image-preview-container">
          {selectedImage && (
            <div className="image-preview">
              <img src={selectedImage} alt="Preview" />
              <button
                type="button"
                onClick={clearImage}
                className="remove-image-btn"
                aria-label="이미지 제거"
              >
                <FiX size={16} />
              </button>
            </div>
          )}
        </div>

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
          <div style={{ marginRight: 'auto' }}>
            <label className="image-upload-btn" aria-label="이미지 첨부">
              <FiImage size={20} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <button className="close-btn" onClick={onClose}>취소</button>
          <button className="close-btn primary" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default EditNoteModal;
