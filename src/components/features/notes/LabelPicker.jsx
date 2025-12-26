import React, { useRef, useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useLabels } from '../../../hooks/useLabels';

const LabelPicker = ({ selectedLabelIds = [], onToggleLabel, onClose }) => {
    const { labels } = useLabels();
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const filteredLabels = labels.filter(label =>
        label.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="label-picker-popover" onClick={(e) => e.stopPropagation()}>
            <div className="label-picker-header">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="라벨 입력"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="label-search-input"
                />
            </div>
            <div className="label-picker-list">
                {filteredLabels.length === 0 ? (
                    <div className="label-picker-empty">검색 결과 없음</div>
                ) : (
                    filteredLabels.map(label => {
                        const isSelected = selectedLabelIds.includes(label.id);
                        return (
                            <div
                                key={label.id}
                                className="label-picker-item"
                                onClick={() => onToggleLabel(label.id)}
                            >
                                <div className={`checkbox-box ${isSelected ? 'checked' : ''}`}>
                                    {isSelected && <FiCheck size={12} color="white" />}
                                </div>
                                <span className="label-picker-name">{label.name}</span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LabelPicker;
