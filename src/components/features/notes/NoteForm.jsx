import React, { useState } from 'react';
import { FiImage, FiPlus, FiX, FiLoader } from 'react-icons/fi';
import { useImageUpload } from '../../../hooks/useImageUpload';

function NoteForm({ onAdd, addingNote }) {
    const [title, setTitle] = useState('');
    const [input, setInput] = useState('');
    const { selectedImage, handleImageSelect, clearImage } = useImageUpload();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageSelect(file);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() && !input.trim() && !selectedImage) return;

        const noteData = {
            title,
            text: input,
            image: selectedImage
        };

        setTitle('');
        setInput('');
        clearImage();

        onAdd(noteData);
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
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메모를 입력하세요..."
                    className="note-input"
                    disabled={addingNote}
                    rows={4}
                />
                <div className="input-hint">
                    <span className="hint-text">Enter로 등록, Shift + Enter로 줄바꿈</span>
                </div>

                <div className="image-preview-container">
                    {selectedImage && (
                        <div className="image-preview">
                            <img src={selectedImage} alt="Preview" />
                            <button
                                type="button"
                                onClick={clearImage}
                                className="remove-image-btn"
                                aria-label="이미지 제거"
                            >
                                <FiX size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="button-group">
                    <label className="image-upload-btn" aria-label="이미지 첨부">
                        <FiImage size={20} />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={addingNote}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <button
                        type="submit"
                        className="add-btn"
                        disabled={addingNote || (!title.trim() && !input.trim() && !selectedImage)}
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
