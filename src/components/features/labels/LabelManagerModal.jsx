import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiCheck, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { useLabels } from '../../../hooks/useLabels';

const LabelManagerModal = ({ onClose }) => {
    const { labels, addLabel, editLabel, removeLabel } = useLabels();
    const [newLabelName, setNewLabelName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const inputRef = useRef(null);

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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content label-manager-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>라벨 수정</h3>
                    <button onClick={onClose} className="close-btn-icon"><FiX size={20} /></button>
                </div>

                <div className="label-manager-body">
                    {/* 새 라벨 추가 */}
                    <div className="label-row new-label-row">
                        <button className="icon-btn-small" onClick={() => setNewLabelName('')}>
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
                                        <button className="icon-btn-small" onClick={() => setEditingId(null)}>
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
                                        >
                                            <FiCheck size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="label-icon-wrapper" onClick={() => removeLabel(label.id)}>
                                            <FiTrash2 size={16} className="trash-icon" />
                                            <div className="label-icon-placeholder"><FiEdit2 size={16} /></div>
                                            {/* 호버 효과는 CSS로 처리 */}
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
                    <button className="btn-text" onClick={onClose}>완료</button>
                </div>
            </div>
        </div>
    );
};

export default LabelManagerModal;
