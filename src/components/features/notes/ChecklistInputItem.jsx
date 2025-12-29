import React from 'react';
import { FiX } from 'react-icons/fi';

/**
 * 체크리스트 항목 입력 컴포넌트
 * NoteForm과 EditNoteModal에서 공통으로 사용하기 위해 분리함 (재활용성 증대)
 * 
 * @param {Object} props
 * @param {Object} props.item - 체크리스트 아이템 객체 ({id, text, checked})
 * @param {Function} props.onChange - 텍스트 변경 핸들러
 * @param {Function} props.onToggle - 체크박스 토글 핸들러 (옵션)
 * @param {Function} props.onDelete - 삭제 핸들러
 * @param {Function} props.onKeyDown - 키보드 이벤트 핸들러 (Enter, Backspace 등)
 * @param {boolean} props.isCompleted - 완료된 항목 여부 (스타일링용)
 * @param {string} props.placeholder - 입력란 플레이스홀더
 */
const ChecklistInputItem = ({
    item,
    onChange,
    onToggle,
    onDelete,
    onKeyDown,
    isCompleted = false,
    placeholder = "할 일 항목"
}) => {
    return (
        <div className="checklist-item-input-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? '#5f6368' : 'inherit' }}>
            {onToggle && (
                <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => onToggle(item.id)}
                    style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }}
                />
            )}
            <input
                type="text"
                className="checklist-input note-input modal-checklist-input"
                value={item.text}
                onChange={(e) => onChange(item.id, e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    width: '100%',
                    outline: 'none',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    color: isCompleted ? '#aaa' : 'inherit'
                }}
            />
            <button
                type="button"
                onClick={onDelete}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: '4px', opacity: 0.5 }}
            >
                <FiX />
            </button>
        </div>
    );
};

export default React.memo(ChecklistInputItem);
