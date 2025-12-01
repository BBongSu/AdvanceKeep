import React from 'react';
import { FiEdit2, FiX, FiRefreshCw, FiTrash2 } from 'react-icons/fi';

function NoteCard({ note, onEdit, onDelete, onRestore, addingNote, isTrash }) {
    return (
        <div
            className="note-card"
            style={{ backgroundColor: note.color }}
            onClick={() => !isTrash && onEdit(note)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (!isTrash && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onEdit(note);
                }
            }}
        >
            {note.title && (
                <h3 className="note-title">{note.title}</h3>
            )}
            {note.image && (
                <div className="note-image">
                    <img src={note.image} alt="Note attachment" />
                </div>
            )}
            {note.text && <p className="note-text">{note.text}</p>}
            <div className="note-card-actions">
                {isTrash ? (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRestore(note.id);
                            }}
                            className="note-action-btn btn-restore"
                            title="복원"
                            aria-label="메모 복원"
                        >
                            <FiRefreshCw size={18} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(note.id);
                            }}
                            className="note-action-btn btn-delete-forever"
                            title="영구 삭제"
                            aria-label="영구 삭제"
                        >
                            <FiTrash2 size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(note);
                            }}
                            className="note-action-btn btn-edit"
                            disabled={addingNote}
                            aria-label="메모 수정"
                        >
                            <FiEdit2 size={18} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(note.id);
                            }}
                            className="note-action-btn btn-delete"
                            disabled={addingNote}
                            aria-label="메모 삭제"
                        >
                            <FiX size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default NoteCard;
