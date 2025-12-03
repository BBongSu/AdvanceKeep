import React, { useMemo, useState } from 'react';
import { FiEdit2, FiX, FiRefreshCw, FiTrash2, FiArchive, FiShare2, FiUserX } from 'react-icons/fi';

/**
 * 메모 카드 컴포넌트
 * 개별 메모를 표시하고 수정/삭제/보관/복원 등을 제공
 */
function NoteCard({
    note,
    onEdit,
    onDelete,
    onRestore,
    onArchive,
    onShareToggle,
    addingNote,
    isTrash,
    isArchived,
    isOwner,
    sharedWithMe,
}) {
    // 단일 image 필드를 가진 기존 데이터도 images 배열로 호환
    const images = Array.isArray(note.images)
        ? note.images
        : note.image
            ? [note.image]
            : [];
    const [expanded, setExpanded] = useState(false);

    const isLongText = useMemo(() => (note.text ? note.text.length > 200 : false), [note.text]);
    const hasManyImages = images.length > 2;
    const shouldCollapse = !expanded && (isLongText || hasManyImages);
    const useHorizontalGallery = images.length > 2;

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
            {(sharedWithMe || (note.sharedWith && note.sharedWith.length > 0)) && (
                <div className={`note-share-badge ${sharedWithMe ? 'shared-with-me' : ''}`}>
                    {sharedWithMe ? '나와 공유됨' : '공유 중'}
                </div>
            )}

            {note.title && (
                <h3 className="note-title">{note.title}</h3>
            )}

            {images.length > 0 && (
                <div
                    className={`note-images-grid ${shouldCollapse && hasManyImages ? 'collapsed' : ''} ${useHorizontalGallery ? 'horizontal' : ''
                        }`}
                >
                    {images.map((img, idx) => (
                        <div className="note-image-multi" key={`${note.id}-img-${idx}`}>
                            <img src={img} alt="Note attachment" />
                        </div>
                    ))}
                </div>
            )}

            {note.text && (
                <p className={`note-text ${shouldCollapse && isLongText ? 'collapsed-text' : ''}`}>
                    {note.text}
                </p>
            )}

            {(isLongText || hasManyImages) && (
                <button
                    type="button"
                    className="note-expand-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((prev) => !prev);
                    }}
                    aria-label={expanded ? '내용 접기' : '내용 더보기'}
                >
                    {expanded ? '접기' : '더보기'}
                </button>
            )}

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
                                onShareToggle?.(note, sharedWithMe);
                            }}
                            className="note-action-btn btn-share"
                            disabled={addingNote || (!isOwner && !sharedWithMe)}
                            title={
                                isOwner
                                    ? note.sharedWith?.length > 0
                                        ? '공유 취소'
                                        : '공유'
                                    : sharedWithMe
                                        ? '공유 해제'
                                        : '소유자만 공유할 수 있습니다'
                            }
                            aria-label="메모 공유"
                        >
                            {sharedWithMe || (isOwner && (note.sharedWith || []).length > 0) ? (
                                <FiUserX size={18} />
                            ) : (
                                <FiShare2 size={18} />
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onArchive(note.id);
                            }}
                            className="note-action-btn btn-archive"
                            disabled={addingNote}
                            title={isArchived ? '보관 해제' : '보관'}
                            aria-label={isArchived ? '보관 해제' : '보관'}
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
