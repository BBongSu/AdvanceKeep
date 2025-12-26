import React, { useEffect, useState } from 'react';
import { FiImage, FiX, FiDroplet, FiTag } from 'react-icons/fi';
import { useImageUpload } from '../../../hooks/useImageUpload';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import LabelPicker from './LabelPicker';
import NoteLabels from './NoteLabels';

const KEEP_COLORS = [
  { name: 'Default', color: '' }, // 투명(테마 기본색)
  { name: 'Red', color: '#f28b82' },
  { name: 'Orange', color: '#fbbc04' },
  { name: 'Yellow', color: '#fff475' },
  { name: 'Green', color: '#ccff90' },
  { name: 'Teal', color: '#a7ffeb' },
  { name: 'Blue', color: '#cbf0f8' },
  { name: 'Dark Blue', color: '#aecbfa' },
  { name: 'Purple', color: '#d7aefb' },
  { name: 'Pink', color: '#fdcfe8' },
  { name: 'Brown', color: '#e6c9a8' },
  { name: 'Gray', color: '#e8eaed' },
];

const EditNoteModal = ({ note, onUpdate, onClose }) => {
  const [title, setTitle] = useState(note.title || '');
  const [text, setText] = useState(note.text || '');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  // 라벨 선택 팝오버 표시 여부 및 선택된 라벨 ID 목록 상태
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState(note.labels || []);
  const [color, setColor] = useState(note.color || '');
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
        color,
        labels: selectedLabelIds, // 수정된 라벨 목록 저장
      });
      if (ok !== false) {
        onClose();
      }
    } catch {
      // 상위 onUpdate에서 처리하도록 조용히 무시
    }
  };

  const mouseDownTarget = React.useRef(null);

  const handleMouseDown = (e) => {
    mouseDownTarget.current = e.target;
  };

  const handleOverlayClick = (e) => {
    // 마우스가 오버레이에서 시작해서 오버레이에서 끝난 경우에만 닫기 (드래그 방지)
    if (e.target === e.currentTarget && mouseDownTarget.current === e.currentTarget) {
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
    // 모달 열릴 때 body 스크롤 방지
    document.body.style.overflow = 'hidden';

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      // 모달 닫힐 때 스크롤 복원
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} onMouseDown={handleMouseDown}>
      <div
        className="modal-content"
        style={{ backgroundColor: color }}
      >
        <div className="image-preview-container">
          {selectedImages.map((img, idx) => (
            <div className="image-preview" key={`edit-preview-${idx}`}>
              <img
                src={img}
                alt="Preview"
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
                style={{ cursor: 'pointer' }}
              />
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
            style={{ backgroundColor: 'transparent' }}
          />
        </div>

        <div className="note-content modal-body">
          <textarea
            className="note-input modal-input modal-textarea"
            placeholder="메모를 입력해주세요."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            style={{ backgroundColor: 'transparent' }}
          />
        </div>

        {/* 선택된 라벨들을 표시, 공통 컴포넌트 사용 (삭제 기능 포함) */}
        {selectedLabelIds.length > 0 && (
          <NoteLabels
            labelIds={selectedLabelIds}
            onRemove={(id) => setSelectedLabelIds(prev => prev.filter(lid => lid !== id))}
          />
        )}

        <div className="note-actions modal-actions">
          <div className="action-tools">
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
            <button
              type="button"
              className="image-upload-btn"
              aria-label="배경색 변경"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <FiDroplet size={20} />
            </button>
            <button
              type="button"
              className="image-upload-btn"
              aria-label="라벨 추가"
              onClick={() => setShowLabelPicker(!showLabelPicker)}
            >
              <FiTag size={20} />
            </button>
            {showColorPicker && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  onClick={() => setShowColorPicker(false)}
                />
                <div className="color-picker-popover">
                  {KEEP_COLORS.map((c) => (
                    <div
                      key={c.color}
                      className={`color-option ${color === c.color ? 'selected' : ''}`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                      onClick={() => {
                        setColor(c.color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
            {showLabelPicker && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  onClick={() => setShowLabelPicker(false)}
                />
                <LabelPicker
                  selectedLabelIds={selectedLabelIds}
                  onToggleLabel={(id) => {
                    setSelectedLabelIds(prev =>
                      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                    );
                  }}
                  onClose={() => setShowLabelPicker(false)}
                />
              </>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>취소</button>
          <button className="close-btn primary" onClick={handleSave}>저장</button>
        </div>

        {/* 이미지 라이트박스 */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={selectedImages.map(img => ({ src: img }))}
          index={lightboxIndex}
        />
      </div>
    </div>
  );
};

export default EditNoteModal;
