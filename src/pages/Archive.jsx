import React, { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import { useSearch } from '../hooks/useSearch';
import NoteCard from '../components/features/notes/NoteCard';
import EditNoteModal from '../components/features/notes/EditNoteModal';
import { useOutletContext } from 'react-router-dom';
import { createNoteHandler, getEmptyStateMessage } from '../utils/noteHelpers';

/**
 * 보관함 페이지 컴포넌트
 * 보관된 메모들을 표시하고 관리하는 페이지
 */
function Archive() {
    // 메모 관련 훅과 상태 관리
    const { notes, loading, updateNote, moveToTrash, unarchiveNote } = useNotes();
    const [editingNote, setEditingNote] = useState(null);
    const [addingNote, setAddingNote] = useState(false);

    // 검색어 및 정렬 순서 가져오기 (상위 컴포넌트에서 전달)
    const { searchQuery, sortOrder, viewMode } = useOutletContext();

    // 보관되었지만 휴지통에 있지 않은 메모만 필터링 및 정렬
    const archivedNotes = notes.filter(note => note.isArchived && !note.inTrash);
    const filteredNotes = useSearch(archivedNotes, searchQuery);

    const sortedNotes = [...filteredNotes].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    // 메모 삭제 핸들러 (휴지통으로 이동)
    const handleDeleteNote = createNoteHandler(
        moveToTrash,
        '삭제 실패',
        '노트를 삭제할 수 없습니다. 다시 시도해주세요.'
    );

    // 메모 보관 해제 핸들러
    const handleUnarchiveNote = createNoteHandler(
        unarchiveNote,
        '보관 해제 실패',
        '노트를 보관 해제할 수 없습니다. 다시 시도해주세요.'
    );

    // 메모 수정 핸들러
    const handleUpdateNote = createNoteHandler(
        updateNote,
        '수정 실패',
        '노트를 수정할 수 없습니다. 다시 시도해주세요.',
        true // 성공 시 true 반환
    );

    // 빈 상태 체크
    const isEmpty = sortedNotes.length === 0 && !loading;
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

    return (
        <>
            {/* 메모 그리드 */}
            <div className={`notes-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {sortedNotes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={setEditingNote}
                        onDelete={handleDeleteNote}
                        onArchive={handleUnarchiveNote}
                        addingNote={addingNote}
                        isArchived={true}
                        searchQuery={searchQuery}
                    />
                ))}
            </div>

            {loading && (
                <div className="empty-state">
                    <p>데이터를 불러오는 중입니다...</p>
                </div>
            )}

            {/* 빈 상태 메시지 */}
            {isEmpty && (
                <div className="empty-state">
                    <p>
                        {getEmptyStateMessage(
                            hasSearchQuery,
                            searchQuery,
                            '보관된 메모가 없습니다.'
                        )}
                    </p>
                </div>
            )}

            {/* 메모 수정 모달 */}
            {editingNote && (
                <EditNoteModal
                    note={editingNote}
                    onUpdate={handleUpdateNote}
                    onClose={() => setEditingNote(null)}
                />
            )}
        </>
    );
}

export default Archive;
