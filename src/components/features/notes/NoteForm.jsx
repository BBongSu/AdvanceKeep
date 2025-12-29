import React, { useState, useRef, useEffect } from 'react';
import { FiImage, FiPlus, FiX, FiLoader, FiDroplet, FiTag, FiCheckSquare } from 'react-icons/fi';
import { useImageUpload } from '../../../hooks/useImageUpload';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import LabelPicker from './LabelPicker'; // Import LabelPicker
import NoteLabels from './NoteLabels';
import ChecklistInputItem from './ChecklistInputItem';
import ColorPicker from './ColorPicker';
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from 'react-router-dom';

const LAST_COLOR_KEY = 'advancekeep-last-color';

function NoteForm({ onAdd, addingNote }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mode, setMode] = useState('text'); // 'text' | 'checklist'
  const [checklistItems, setChecklistItems] = useState([{ id: uuidv4(), text: '', checked: false }]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  // 라벨 관련 상태: 선택된 라벨 ID 목록과 라벨 선택기(Picker) 표시 여부 관리
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);

  // 기본값은 투명(테마 배경색 따름)으로 설정
  const [color, setColor] = useState('');
  const { selectedImages, handleImageSelect, clearImages, removeImage, uploading } = useImageUpload();
  const textareaRef = useRef(null);
  const location = useLocation();
  const isTodoPage = location.pathname === '/todo';

  // 페이지 이동 시 모드 초기화 또는 자동 설정
  useEffect(() => {
    if (isTodoPage) {
      setMode('checklist');
      if (checklistItems.length === 0) {
        setChecklistItems([{ id: uuidv4(), text: '', checked: false }]);
      }
    } else {
      setMode('text');
    }
  }, [isTodoPage]);

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageSelect(Array.from(files));
    }
  };

  const startChecklistMode = () => {
    setMode('checklist');
    setChecklistItems([{ id: uuidv4(), text: '', checked: false }]);
  };

  // 체크리스트 항목 텍스트 변경
  const handleChecklistItemChange = (id, value) => {
    setChecklistItems(prev => prev.map(item =>
      item.id === id ? { ...item, text: value } : item
    ));
  };

  // 체크리스트 키보드 동작 (Enter: 항목 추가, Backspace: 항목 삭제)
  const handleChecklistKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newItem = { id: uuidv4(), text: '', checked: false };
      const newItems = [...checklistItems];
      newItems.splice(index + 1, 0, newItem);
      setChecklistItems(newItems);

      // Focus next item logic would go here ideally
      setTimeout(() => {
        const inputs = document.querySelectorAll('.checklist-input');
        if (inputs[index + 1]) inputs[index + 1].focus();
      }, 0);
    } else if (e.key === 'Backspace' && checklistItems[index].text === '' && checklistItems.length > 1) {
      e.preventDefault();
      const newItems = checklistItems.filter((_, i) => i !== index);
      setChecklistItems(newItems);

      setTimeout(() => {
        const inputs = document.querySelectorAll('.checklist-input');
        if (inputs[index - 1]) {
          inputs[index - 1].focus();
        } else if (inputs[0]) {
          inputs[0].focus();
        }
      }, 0);
    }
  };

  // 체크리스트 항목 완료 여부 토글
  const handleChecklistToggle = (id) => {
    setChecklistItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // 체크리스트 항목 삭제
  const handleDeleteChecklistItem = (id) => {
    if (checklistItems.length > 1) {
      setChecklistItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Validate based on mode
    let isEmpty = false;
    if (mode === 'text') {
      isEmpty = !title.trim() && !text.trim() && selectedImages.length === 0;
    } else {
      const validItems = checklistItems.filter(item => item.text.trim());
      isEmpty = !title.trim() && validItems.length === 0 && selectedImages.length === 0;
    }

    if (isEmpty) return;

    const noteData = {
      title,
      text: mode === 'text' ? text : null,
      images: selectedImages,
      color,
      labels: selectedLabelIds, // Save label IDs
      type: mode === 'checklist' ? 'checklist' : 'text',
      items: mode === 'checklist' ? checklistItems.filter(item => item.text.trim()) : null,
    };

    setTitle('');
    setText('');
    setMode('text');
    setChecklistItems([{ id: uuidv4(), text: '', checked: false }]);
    clearImages();
    setColor('');
    setShowColorPicker(false);
    setShowLabelPicker(false);
    setSelectedLabelIds([]);

    onAdd(noteData);
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

        {mode === 'text' ? (
          <div className="markdown-editor">
            <textarea
              ref={textareaRef}
              className="note-input"
              placeholder="메모를 입력해주세요."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={addingNote}
              rows={4}
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
        ) : (
          <div className="checklist-container">
            {checklistItems.map((item, index) => (
              <ChecklistInputItem
                key={item.id}
                item={item}
                onChange={handleChecklistItemChange}
                onToggle={handleChecklistToggle}
                onDelete={() => handleDeleteChecklistItem(item.id)}
                onKeyDown={(e) => handleChecklistKeyDown(e, index)}
                placeholder="할 일 항목"
              />
            ))}
          </div>
        )}


        <div className="input-hint">
          {mode === 'text' ? (
            <span className="hint-text">Enter: 줄바꿈</span>
          ) : (
            <span className="hint-text">Enter: 항목 추가, Backspace: 항목 삭제</span>
          )}
        </div>

        {/* 선택된 라벨들을 표시, 공통 컴포넌트 사용 (삭제 기능 포함) */}
        {selectedLabelIds.length > 0 && (
          <NoteLabels
            labelIds={selectedLabelIds}
            onRemove={(id) => setSelectedLabelIds(prev => prev.filter(lid => lid !== id))}
          />
        )}

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
              <ColorPicker
                color={color}
                onChange={(newColor) => {
                  setColor(newColor);
                  setShowColorPicker(false);
                }}
                onClose={() => setShowColorPicker(false)}
              />
            )}
            {/* 라벨 선택 팝오버: 태그 아이콘 클릭 시 표시 */}
            {showLabelPicker && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  onClick={() => setShowLabelPicker(false)}
                />
                <LabelPicker
                  selectedLabelIds={selectedLabelIds}
                  onToggleLabel={(id) => {
                    // 라벨 토글: 이미 있으면 제거, 없으면 추가
                    setSelectedLabelIds(prev =>
                      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                    );
                  }}
                  onClose={() => setShowLabelPicker(false)}
                />
              </>
            )}
          </div>
          <button
            type="submit"
            className="add-btn"
            disabled={addingNote || uploading}
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
