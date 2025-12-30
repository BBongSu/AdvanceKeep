import React, { useEffect, useState, useRef } from 'react';
import { FiImage, FiX, FiDroplet, FiTag, FiCheckSquare, FiPlus } from 'react-icons/fi';
import { useImageUpload } from '../../../hooks/useImageUpload';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import LabelPicker from './LabelPicker';
import NoteLabels from './NoteLabels';
import ChecklistInputItem from './ChecklistInputItem';
import ColorPicker from './ColorPicker';
import { v4 as uuidv4 } from 'uuid';

const EditNoteModal = ({ note, onUpdate, onClose }) => {
  const [title, setTitle] = useState(note.title || '');
  const [text, setText] = useState(note.text || '');
  const [checklistItems, setChecklistItems] = useState(note.items || []);
  const isChecklist = note.type === 'checklist';

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
  const textareaRef = useRef(null);

  // 체크리스트 항목 텍스트 변경 핸들러 (ID 기반)
  const handleChecklistItemChange = (id, value) => {
    setChecklistItems(prev => prev.map(item =>
      item.id === id ? { ...item, text: value } : item
    ));
  };

  // 체크리스트 항목 완료 여부 토글 핸들러
  const handleChecklistToggle = (id) => {
    setChecklistItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  }

  // 체크리스트 항목 삭제 핸들러
  const handleDeleteChecklistItem = (index) => {
    if (checklistItems.length > 1) {
      const newItems = checklistItems.filter((_, i) => i !== index);
      setChecklistItems(newItems);
    }
  };

  // 체크리스트 키보드 조작 핸들러 (Enter: 추가, Backspace: 삭제)
  const handleChecklistKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newItem = { id: uuidv4(), text: '', checked: false };
      const newItems = [...checklistItems];
      newItems.splice(index + 1, 0, newItem);
      setChecklistItems(newItems);

      setTimeout(() => {
        const inputs = document.querySelectorAll('.modal-checklist-input');
        if (inputs[index + 1]) inputs[index + 1].focus();
      }, 0);
    } else if (e.key === 'Backspace' && checklistItems[index].text === '' && checklistItems.length > 1) {
      e.preventDefault();
      handleDeleteChecklistItem(index);

      setTimeout(() => {
        const inputs = document.querySelectorAll('.modal-checklist-input');
        if (inputs[index - 1]) {
          inputs[index - 1].focus();
        } else if (inputs[0]) {
          inputs[0].focus();
        }
      }, 0);
    }
  };

  const handleSave = () => {
    // 낙관적 업데이트 (Optimistic Update):
    // 서버 응답을 기다리지 않고 즉시 닫습니다.
    // 에러 발생 시 상위 핸들러(noteHelpers)에서 Swal Alert가 발생합니다.
    onUpdate({
      ...note,
      title,
      text: isChecklist ? null : text,
      items: isChecklist ? checklistItems.filter(item => item.text.trim()) : null,
      images: selectedImages,
      image: selectedImages?.[0] || null, // 기존 필드 호환
      color,
      labels: selectedLabelIds, // 수정된 라벨 목록 저장
    });
    onClose();
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
                title="이미지 삭제"
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
          {isChecklist ? (
            <div className="checklist-container" style={{ width: '100%' }}>
              {/* Active Items */}
              {checklistItems
                .map((item, index) => ({ ...item, originalIndex: index }))
                .filter(item => !item.checked)
                .map((item) => (
                  <ChecklistInputItem
                    key={item.id}
                    item={item}
                    onChange={handleChecklistItemChange}
                    onToggle={handleChecklistToggle}
                    onDelete={() => handleDeleteChecklistItem(item.originalIndex)}
                    onKeyDown={(e) => handleChecklistKeyDown(e, item.originalIndex)}
                    placeholder="할 일 항목"
                  />
                ))}

              {/* Completed Items */}
              {checklistItems.some(item => item.checked) && (
                <div className="checklist-completed-section" style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.1)', width: '100%' }}>
                  <div style={{ fontSize: '0.85em', color: '#5f6368', marginBottom: '4px', marginLeft: '24px' }}>
                    완료된 항목 {checklistItems.filter(item => item.checked).length}개
                  </div>
                  {checklistItems
                    .map((item, index) => ({ ...item, originalIndex: index }))
                    .filter(item => item.checked)
                    .map((item) => (
                      <ChecklistInputItem
                        key={item.id}
                        item={item}
                        onChange={handleChecklistItemChange}
                        onToggle={handleChecklistToggle}
                        onDelete={() => handleDeleteChecklistItem(item.originalIndex)}
                        onKeyDown={(e) => handleChecklistKeyDown(e, item.originalIndex)}
                        isCompleted={true}
                        placeholder="할 일 항목"
                      />
                    ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  const newItem = { id: uuidv4(), text: '', checked: false };
                  setChecklistItems([...checklistItems, newItem]);
                }}
                title="항목 추가"
                style={{ display: 'flex', alignItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer', padding: '8px 0', opacity: 0.6, marginTop: '8px' }}
              >
                <FiPlus style={{ marginRight: '8px' }} /> 항목 추가
              </button>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              className="note-input modal-input modal-textarea"
              placeholder="메모를 입력해주세요."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              style={{ backgroundColor: 'transparent' }}
            />
          )}
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
            <button
              type="button"
              className="image-upload-btn"
              title="배경색 변경"
              aria-label="배경색 변경"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <FiDroplet size={20} />
            </button>
            <button
              type="button"
              className="image-upload-btn"
              title="라벨 추가"
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
          <button className="close-btn" onClick={onClose} title="취소">취소</button>
          <button className="close-btn primary" onClick={handleSave} title="저장">저장</button>
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
