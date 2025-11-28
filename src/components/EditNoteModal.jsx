import React, { useState, useRef } from 'react';
import { FiBell, FiUserPlus, FiPalette, FiImage, FiArchive, FiMoreVertical, FiRotateCcw, FiRotateCw } from 'react-icons/fi';

const EditNoteModal = ({ note, onUpdate, onClose }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const modalRef = useRef(null);

    const handleClose = () => {
        onUpdate({ ...note, title, content });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" ref={modalRef} style={{ backgroundColor: `var(--note-${note.color || 'white'})` }}>
                <div className="note-title">
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="note-content">
                    <textarea
                        placeholder="Note"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={Math.max(3, content.split('\n').length)}
                    />
                </div>

                <div className="note-actions">
                    <div className="action-icons">
                        <button className="icon-btn small"><FiBell size={18} /></button>
                        <button className="icon-btn small"><FiUserPlus size={18} /></button>
                        <button className="icon-btn small"><FiPalette size={18} /></button>
                        <button className="icon-btn small"><FiImage size={18} /></button>
                        <button className="icon-btn small"><FiArchive size={18} /></button>
                        <button className="icon-btn small"><FiMoreVertical size={18} /></button>
                        <button className="icon-btn small"><FiRotateCcw size={18} /></button>
                        <button className="icon-btn small"><FiRotateCw size={18} /></button>
                    </div>
                    <button className="close-btn" onClick={handleClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default EditNoteModal;
