import React, { useMemo, useState } from 'react';
import { FiEdit2, FiX, FiRefreshCw, FiTrash2, FiArchive, FiShare2, FiUserX } from 'react-icons/fi';
import { BsPin, BsPinFill } from 'react-icons/bs';
import { HighlightText } from '../../common/HighlightText';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import NoteLabels from './NoteLabels';


/**
 * 메모 카드 컴포넌트
 * 개별 메모를 표시하고 수정/삭제/보관/복원 등을 제공
 */
function NoteCard({
    note,
    onEdit,
    onUpdate,
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
     * 날짜를 보기 좋은 형식으로 변환 (예: 2023. 12. 26. 오후 1:30)
     */
    const formattedDate = useMemo(() => {
        if (!note.createdAt) return '';
        const date = new Date(note.createdAt);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, [note.createdAt]);

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
                            <img src={img} alt="Note attachment" loading="lazy" />
                        </div>
                    ))}
                </div>
            )}

            {note.type === 'checklist' && note.items ? (
                <div className="note-checklist" style={{ width: '100%' }}>
                    {/* Active Items */}
                    {note.items.filter(item => !item.checked).map((item) => (
                        <div key={item.id} className="checklist-item-display"
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '4px' }}
                        >
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    // Make a copy of items
                                    const newItems = note.items.map(i =>
                                        i.id === item.id ? { ...i, checked: e.target.checked } : i
                                    );
                                    // Call update handler
                                    onUpdate && onUpdate({ ...note, items: newItems });
                                }}
                                style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }}
                            />
                            <span style={{ flex: 1, wordBreak: 'break-word' }}>
                                <HighlightText text={item.text} highlight={searchQuery} />
                            </span>
                        </div>
                    ))}

                    {/* Completed Items */}
                    {note.items.filter(item => item.checked).length > 0 && (
                        <div className="checklist-completed-section" style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.1)', width: '100%' }}>
                            <div style={{ fontSize: '0.85em', color: '#5f6368', marginBottom: '4px', marginLeft: '24px' }}>
                                완료된 항목 {note.items.filter(item => item.checked).length}개
                            </div>
                            {note.items.filter(item => item.checked).map((item) => (
                                <div key={item.id} className="checklist-item-display completed"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '4px', textDecoration: 'line-through', color: '#5f6368' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            const newItems = note.items.map(i =>
                                                i.id === item.id ? { ...i, checked: e.target.checked } : i
                                            );
                                            onUpdate && onUpdate({ ...note, items: newItems });
                                        }}
                                        style={{ marginTop: '4px', marginRight: '8px', cursor: 'pointer' }}
                                    />
                                    <span style={{ flex: 1, wordBreak: 'break-word' }}>
                                        <HighlightText text={item.text} highlight={searchQuery} />
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                note.text && (
                    <p className={`note-text ${shouldCollapse && isLongText ? 'collapsed-text' : ''}`}>
                        <HighlightText text={note.text} highlight={searchQuery} />
                    </p>
                )
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
                    title={expanded ? '내용 접기' : '내용 더보기'}
                >
                    {expanded ? '접기' : '더보기'}
                </button>
            )}

            {/* Label Chips */}
            {/* Label Chips */}
            {note.labels && note.labels.length > 0 && (
                <NoteLabels labelIds={note.labels} isSmall={true} />
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

            {/* 하단 정보 영역 (날짜 등) */}
            <div className="note-card-footer">
                {formattedDate && <span className="note-date">{formattedDate}</span>}
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

export default React.memo(NoteCard);
