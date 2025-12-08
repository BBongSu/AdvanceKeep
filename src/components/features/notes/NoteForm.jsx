import React, { useState } from 'react';
import { FiImage, FiPlus, FiX, FiLoader } from 'react-icons/fi';
import { useImageUpload } from '../../../hooks/useImageUpload';

function NoteForm({ onAdd, addingNote }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
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
    };

    setTitle('');
    setText('');
    clearImages();

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
    <form onSubmit={onSubmit} className="input-form">
      <div className="input-container">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="note-title-input"
          disabled={addingNote}
        />

        <div className="markdown-editor">
          <textarea
            className="note-input"
            placeholder="메모를 입력해주세요."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={addingNote}
            rows={4}
          />
        </div>

        <div className="input-hint">
          <span className="hint-text">Enter: 줄바꿈</span>
        </div>

        <div className="image-preview-container">
          {selectedImages.map((img, idx) => (
            <div className="image-preview" key={`preview-${idx}`}>
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

        <div className="button-group">
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
    </form>
  );
}

export default NoteForm;
