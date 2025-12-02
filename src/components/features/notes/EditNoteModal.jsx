import React, { useEffect, useState } from 'react';
import { FiImage, FiX } from 'react-icons/fi';
import { useImageUpload } from '../../../hooks/useImageUpload';

const EditNoteModal = ({ note, onUpdate, onClose }) => {
  const [title, setTitle] = useState(note.title || '');
  const [text, setText] = useState(note.text || '');
  const { selectedImages, handleImageSelect, clearImages, removeImage } = useImageUpload(
    Array.isArray(note.images) ? note.images : note.image ? [note.image] : []
  );

  // 선택 영역을 토큰으로 감싸기
  const wrapSelection = (prefix, suffix = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value } = el;
    const before = value.slice(0, selectionStart);
    const selected = value.slice(selectionStart, selectionEnd);
    const after = value.slice(selectionEnd);
    const next = `${before}${prefix}${selected || ''}${suffix}${after}`;
    setText(next);
    const cursor = selectionEnd + prefix.length + suffix.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const applyBullet = (ordered = false) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value } = el;
    const lines = value.split('\n');
    let acc = 0;
    const newLines = lines.map((line) => {
      const lineStart = acc;
      const lineEnd = acc + line.length;
      acc += line.length + 1;
      const intersect = !(lineEnd < selectionStart || lineStart > selectionEnd);
      if (!intersect) return line;
      return ordered ? `1. ${line}` : `- ${line}`;
    });
    const next = newLines.join('\n');
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const handleSave = async () => {
    try {
      const ok = await onUpdate({
        ...note,
        title,
        text,
        images: selectedImages,
        image: selectedImages?.[0] || null, // 기존 필드 호환
      });
      if (ok !== false) {
        onClose();
      }
    } catch {
      // 상위 onUpdate에서 처리하도록 조용히 무시
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageSelect(Array.from(files));
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
        style={{ backgroundColor: note.color || 'var(--bg-secondary)' }}
      >
        <div className="image-preview-container">
          {selectedImages.map((img, idx) => (
            <div className="image-preview" key={`edit-preview-${idx}`}>
              <img src={img} alt="Preview" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="remove-image-btn"
                aria-label="이미지 삭제"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
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
            className="note-input modal-input modal-textarea"
            placeholder="메모를 입력해주세요."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
        </div>

        <div className="note-actions modal-actions">
          <div style={{ marginRight: 'auto' }}>
            <label className="image-upload-btn" aria-label="이미지 첨부">
              <FiImage size={20} />
              <input
                type="file"
                accept="image/*"
                multiple
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
