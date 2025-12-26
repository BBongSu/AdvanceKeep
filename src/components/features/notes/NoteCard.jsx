import React, { useMemo, useState } from 'react';
import { FiEdit2, FiX, FiRefreshCw, FiTrash2, FiArchive, FiShare2, FiUserX } from 'react-icons/fi';
import { BsPin, BsPinFill } from 'react-icons/bs';
import { HighlightText } from '../../common/HighlightText';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';


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
    onPin,
    addingNote,
    isTrash,
    isArchived,
    isOwner,
    sharedWithMe,
    searchQuery,
}) {
    // 단일 image 필드를 가진 기존 데이터도 images 배열로 호환
    const images = Array.isArray(note.images)
        ? note.images
        : note.image
            ? [note.image]
            : [];
    const [expanded, setExpanded] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const isLongText = useMemo(() => (note.text ? note.text.length > 200 : false), [note.text]);
    const hasManyImages = images.length > 2;
    const shouldCollapse = !expanded && (isLongText || hasManyImages);
    const useHorizontalGallery = images.length > 2;

    /**
     * 이미지 클릭 핸들러 - 라이트박스 열기
     * @param {number} index - 클릭한 이미지의 인덱스
     */
    const handleImageClick = (e, index) => {
        e.stopPropagation(); // 메모 편집 모달 열리지 않도록 방지
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // 라이트박스용 이미지 배열 변환
    const lightboxSlides = images.map(img => ({ src: img }));

    return (
        <div
            className="note-card"
            style={{ backgroundColor: note.color }}
            onClick={() => {
                if (isTrash) return;
                // 모바일 환경(768px 이하)이면 카드 클릭으로 수정 모달이 뜨지 않도록 방지
                if (window.innerWidth <= 768) return;
                onEdit(note);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (!isTrash && (e.key === 'Enter' || e.key === ' ')) {
                    if (window.innerWidth <= 768) return;
                    e.preventDefault();
                    onEdit(note);
                }
            }}
        >
            {/* 공유 상태 배지 표시 */}
            {(sharedWithMe || (note.sharedWith && note.sharedWith.length > 0)) && (
                <div className={`note-share-badge ${sharedWithMe ? 'shared-with-me' : ''}`}>
                    {sharedWithMe
                        ? `${note.ownerName || '누군가'}에게 공유받음`
                        : `${note.sharedWithNames && note.sharedWithNames.length > 0 ? note.sharedWithNames[0] : '누군가'}${(note.sharedWithNames?.length || 0) > 1
                            ? ` 외 ${(note.sharedWithNames?.length || 0) - 1}명`
                            : ''
                        }에게 공유함`
                    }
                </div>
            )}



            {/* 고정 핀 버튼 */}
            {!isTrash && !addingNote && onPin && (
                <button
                    className={`pin-btn ${note.isPinned ? 'pinned' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPin(note.id);
                    }}
                    title={note.isPinned ? "고정 해제" : "메모 고정"}
                    aria-label={note.isPinned ? "고정 해제" : "메모 고정"}
                >
                    {note.isPinned ? <BsPinFill size={20} /> : <BsPin size={20} />}
                </button>
            )}

            {note.title && (
                <h3 className="note-title">
                    <HighlightText text={note.title} highlight={searchQuery} />
                </h3>
            )}

            {images.length > 0 && (
                <div
                    className={`note-images-grid ${shouldCollapse && hasManyImages ? 'collapsed' : ''} ${useHorizontalGallery ? 'horizontal' : ''
                        }`}
                >
                    {images.map((img, idx) => (
                        <div
                            className="note-image-multi"
                            key={`${note.id}-img-${idx}`}
                            onClick={(e) => handleImageClick(e, idx)}
                            style={{ cursor: 'pointer' }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleImageClick(e, idx);
                                }
                            }}
                        >
                            <img src={img} alt="Note attachment" />
                        </div>
                    ))}
                </div>
            )}

            {note.text && (
                <p className={`note-text ${shouldCollapse && isLongText ? 'collapsed-text' : ''}`}>
                    <HighlightText text={note.text} highlight={searchQuery} />
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

            {/* 액션 버튼 영역 */}
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
                            title="수정"
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
                            title="삭제"
                            aria-label="메모 삭제"
                        >
                            <FiX size={18} />
                        </button>
                    </>
                )}
            </div>

            {/* 이미지 라이트박스 */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={lightboxSlides}
                index={lightboxIndex}
            />
        </div>
    );
}

export default NoteCard;
