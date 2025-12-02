import React from 'react';
import { FiEdit2, FiX, FiRefreshCw, FiTrash2, FiArchive } from 'react-icons/fi';

/**
 * 메모 카드 컴포넌트
 * 개별 메모를 표시하고 수정, 삭제, 보관 등의 액션을 제공
 * 
 * @param {Object} note - 메모 객체
 * @param {Function} onEdit - 메모 수정 핸들러
 * @param {Function} onDelete - 메모 삭제 핸들러
 * @param {Function} onRestore - 메모 복원 핸들러 (휴지통에서만 사용)
 * @param {Function} onArchive - 메모 보관/보관 해제 핸들러
 * @param {boolean} addingNote - 메모 추가 중 여부 (버튼 비활성화용)
 * @param {boolean} isTrash - 휴지통 페이지 여부
 * @param {boolean} isArchived - 보관된 메모 여부
 */
function NoteCard({ note, onEdit, onDelete, onRestore, onArchive, addingNote, isTrash, isArchived }) {
    return (
        <div
            className="note-card"
            style={{ backgroundColor: note.color }}
            onClick={() => !isTrash && onEdit(note)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                // 키보드 접근성: Enter 또는 Space 키로 메모 수정
                if (!isTrash && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onEdit(note);
                }
            }}
        >
            {/* 메모 제목 */}
            {note.title && (
                <h3 className="note-title">{note.title}</h3>
            )}

            {/* 메모 이미지 */}
            {note.image && (
                <div className="note-image">
                    <img src={note.image} alt="Note attachment" />
                </div>
            )}

            {/* 메모 내용 */}
            {note.text && <p className="note-text">{note.text}</p>}

            {/* 액션 버튼들 */}
            <div className="note-card-actions">
                {isTrash ? (
                    // 휴지통 페이지: 복원 및 영구 삭제 버튼
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
                    // 일반 페이지: 수정, 보관, 삭제 버튼
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
                                onArchive(note.id);
                            }}
                            className="note-action-btn btn-archive"
                            disabled={addingNote}
                            title={isArchived ? "보관 해제" : "보관"}
                            aria-label={isArchived ? "보관 해제" : "보관"}
                        >
                            <FiArchive size={18} />
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
