import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiCheck, FiEdit2, FiTrash2, FiPlus, FiTag } from 'react-icons/fi';
import { useLabels } from '../../../hooks/useLabels';

const LabelManagerModal = ({ onClose }) => {
    const { labels, addLabel, editLabel, removeLabel } = useLabels();
    const [newLabelName, setNewLabelName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const inputRef = useRef(null);
    const mouseDownTarget = useRef(null);

    // 수정 시작 시 입력창에 포커스
    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingId]);

    const handleAddKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (newLabelName.trim()) {
                addLabel(newLabelName);
                setNewLabelName('');
            }
        }
    };

    const handleEditKey = (e, id) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleUpdate(id);
        }
    };

    const handleUpdate = (id) => {
        if (editName.trim()) {
            editLabel(id, editName);
        }
        setEditingId(null);
    };

    const startEditing = (label) => {
        setEditingId(label.id);
        setEditName(label.name);
    };

    const handleMouseDown = (e) => {
        mouseDownTarget.current = e.target;
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && mouseDownTarget.current === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick} onMouseDown={handleMouseDown}>
            <div className="modal-content label-manager-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>라벨 수정</h3>
                    <button onClick={onClose} className="close-btn-icon" title="닫기"><FiX size={20} /></button>
                </div>

                <div className="label-manager-body">
                    {/* 새 라벨 추가 */}
                    <div className="label-row new-label-row">
                        <button className="icon-btn-small" onClick={() => setNewLabelName('')} title={newLabelName ? "입력 취소" : "새 라벨"}>
                            {newLabelName ? <FiX size={16} /> : <FiPlus size={20} />}
                        </button>
                        <input
                            type="text"
                            placeholder="새 라벨 만들기"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            onKeyDown={handleAddKey}
                            autoFocus
                        />
                        <button
                            className="icon-btn-small confirm-check"
                            disabled={!newLabelName.trim()}
                            title="라벨 생성"
                            onClick={() => {
                                if (newLabelName.trim()) {
                                    addLabel(newLabelName);
                                    setNewLabelName('');
                                }
                            }}
                        >
                            <FiCheck size={18} />
                        </button>
                    </div>

                    <div className="label-list">
                        {labels.map(label => (
                            <div key={label.id} className="label-row">
                                {editingId === label.id ? (
                                    <>
                                        <button className="icon-btn-small" onClick={() => removeLabel(label.id)} title="라벨 삭제">
                                            <FiTrash2 size={16} />
                                        </button>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => handleEditKey(e, label.id)}
                                        />
                                        <button
                                            className="icon-btn-small confirm-check"
                                            onClick={() => handleUpdate(label.id)}
                                            title="이름 수정 변경"
                                        >
                                            <FiCheck size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="icon-btn-small" style={{ cursor: 'default' }}>
                                            <FiTag size={16} />
                                        </div>
                                        <span
                                            className="label-name-display"
                                            onClick={() => startEditing(label)}
                                        >
                                            {label.name}
                                        </span>
                                        <button
                                            className="icon-btn-small edit-icon-btn"
                                            onClick={() => startEditing(label)}
                                            title="라벨 이름 수정"
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-footer line-top">
                    <button className="btn-text" onClick={onClose} title="완료">완료</button>
                </div>
            </div>
        </div>
    );
};

export default LabelManagerModal;
