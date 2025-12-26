import React, { useState } from 'react';
import { FiImage, FiPlus, FiX, FiLoader, FiDroplet } from 'react-icons/fi';
import { useImageUpload } from '../../../hooks/useImageUpload';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

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

const LAST_COLOR_KEY = 'advancekeep-last-color';

function NoteForm({ onAdd, addingNote }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 기본값은 투명(테마 배경색 따름)으로 설정
  const [color, setColor] = useState('');
  const { selectedImages, handleImageSelect, clearImages, removeImage, uploading } = useImageUpload();

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageSelect(Array.from(files));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !text.trim() && selectedImages.length === 0) return;

    const noteData = {
      title,
      text,
      images: selectedImages,
      color,
    };

    setTitle('');
    setText('');
    clearImages();
    setColor('');
    setShowColorPicker(false);

    onAdd(noteData);
  };

  // 간단한 서식 적용: 선택 영역을 토큰으로 감싸기
  const wrapSelection = (prefix, suffix = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value } = el;
    const before = value.slice(0, selectionStart);
    const selected = value.slice(selectionStart, selectionEnd);
    const after = value.slice(selectionEnd);
    const next = `${before}${prefix}${selected || ''}${suffix}${after}`;
    setText(next);
    // 선택 영역 유지
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
    let start = selectionStart;
    let end = selectionEnd;
    let acc = 0;
    const newLines = lines.map((line) => {
      const lineStart = acc;
      const lineEnd = acc + line.length;
      acc += line.length + 1; // +1 for newline
      const intersect = !(lineEnd < selectionStart || lineStart > selectionEnd);
      if (!intersect) return line;
      return ordered ? `1. ${line}` : `- ${line}`;
    });
    const next = newLines.join('\n');
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, end + (ordered ? 3 : 2) * (newLines.length));
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="input-form"
      style={{ backgroundColor: color }}
    >
      <div className="input-container">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="note-title-input"
          disabled={addingNote}
          style={{ backgroundColor: 'transparent' }}
        />

        <div className="markdown-editor">
          <textarea
            className="note-input"
            placeholder="메모를 입력해주세요."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={addingNote}
            rows={4}
            style={{ backgroundColor: 'transparent' }}
          />
        </div>

        <div className="input-hint">
          <span className="hint-text">Enter: 줄바꿈</span>
        </div>

        <div className="image-preview-container">
          {selectedImages.map((img, idx) => (
            <div className="image-preview" key={`preview-${idx}`}>
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

        <div className="note-actions modal-actions">
          <div className="action-tools">
            <label className="image-upload-btn" aria-label="이미지 첨부">
              <FiImage size={20} />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={addingNote || uploading}
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
          </div>
          <button
            type="submit"
            className="add-btn"
            disabled={addingNote || uploading || (!title.trim() && !text.trim() && selectedImages.length === 0)}
            aria-label="메모 추가"
          >
            {addingNote ? (
              <FiLoader size={20} className="spinning" />
            ) : (
              <FiPlus size={20} />
            )}
          </button>
        </div>
      </div>

      {/* 이미지 라이트박스 */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={selectedImages.map(img => ({ src: img }))}
        index={lightboxIndex}
      />
    </form>
  );
}

export default NoteForm;
