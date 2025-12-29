import React from 'react';
import { KEEP_COLORS } from '../../../constants';

/**
 * 색상 선택 컴포넌트
 * NoteForm과 EditNoteModal에서 공통으로 사용
 * 
 * @param {Object} props
 * @param {string} props.color - 현재 선택된 색상
 * @param {Function} props.onChange - 색상 변경 핸들러 (color string 반환)
 * @param {Function} props.onClose - 닫기 핸들러
 */
const ColorPicker = ({ color, onChange, onClose }) => {
    return (
        <>
            <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={onClose}
            />
            <div className="color-picker-popover">
                {KEEP_COLORS.map((c) => (
                    <div
                        key={c.color}
                        className={`color-option ${color === c.color ? 'selected' : ''}`}
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                        onClick={() => {
                            onChange(c.color);
                            if (onClose) onClose();
                        }}
                    />
                ))}
            </div>
        </>
    );
};

export default ColorPicker;
