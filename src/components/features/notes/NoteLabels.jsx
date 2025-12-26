import React from 'react';
import { FiX } from 'react-icons/fi';
import { useLabels } from '../../../hooks/useLabels';

/**
 * 메모에 할당된 라벨들을 표시하는 컴포넌트
 * @param {string[]} labelIds - 표시할 라벨 ID 배열
 * @param {function} onRemove - 라벨 삭제 핸들러 (없으면 삭제 버튼 미표시)
 * @param {boolean} isSmall - 메모 카드용 작은 스타일 적용 여부
 */
const NoteLabels = ({ labelIds, onRemove, isSmall = false }) => {
    const { labels } = useLabels();

    if (!labelIds || labelIds.length === 0) return null;

    const containerClass = isSmall ? "note-card-labels" : "note-labels-container";
    const chipClass = isSmall ? "note-label-chip-small" : "note-label-chip";

    return (
        <div className={containerClass}>
            {labelIds.map(id => {
                const label = labels.find(l => l.id === id);
                if (!label) return null;

                return (
                    <span key={id} className={chipClass}>
                        {label.name}
                        {onRemove && !isSmall && (
                            <button
                                type="button"
                                className="note-label-remove"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(id);
                                }}
                            >
                                <FiX size={12} />
                            </button>
                        )}
                    </span>
                );
            })}
        </div>
    );
};

export default NoteLabels;
