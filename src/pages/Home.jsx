import React, { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import { useSearch } from '../hooks/useSearch';
import NoteForm from '../components/features/notes/NoteForm';
import NoteCard from '../components/features/notes/NoteCard';
import EditNoteModal from '../components/features/notes/EditNoteModal';
import { useOutletContext } from 'react-router-dom';
import { createNoteHandler, getEmptyStateMessage, showErrorAlert } from '../utils/noteHelpers';

/**
 * 홈 페이지 컴포넌트
 * 활성 상태의 메모들을 표시하고 관리하는 메인 페이지
 */
function Home() {
    // 메모 관련 훅과 상태 관리
    const { notes, loading, addNote, updateNote, moveToTrash, archiveNote } = useNotes();
    const [editingNote, setEditingNote] = useState(null);
    const [addingNote, setAddingNote] = useState(false);

    // 검색어 가져오기 (상위 컴포넌트에서 전달)
    const { searchQuery } = useOutletContext();

    // 휴지통과 보관함에 있지 않은 활성 메모만 필터링
    const activeNotes = notes.filter(note => !note.inTrash && !note.isArchived);
    const filteredNotes = useSearch(activeNotes, searchQuery);

    /**
     * 새 메모 추가 핸들러
     * @param {Object} noteData - 메모 데이터 (title, text, images)
     */
    const handleAddNote = async (noteData) => {
        setAddingNote(true);
        try {
            await addNote(noteData.title, noteData.text, noteData.images);
        } catch {
            await showErrorAlert('추가 실패', '노트를 추가할 수 없습니다. 다시 시도해주세요.');
            return false;
        } finally {
            setAddingNote(false);
        }
    };

    // 메모 삭제 핸들러 (휴지통으로 이동)
    const handleDeleteNote = createNoteHandler(
        moveToTrash,
        '삭제 실패',
        '노트를 삭제할 수 없습니다. 다시 시도해주세요.'
    );

    // 메모 보관 핸들러
    const handleArchiveNote = createNoteHandler(
        archiveNote,
        '보관 실패',
        '노트를 보관할 수 없습니다. 다시 시도해주세요.'
    );

    // 메모 수정 핸들러
    const handleUpdateNote = createNoteHandler(
        updateNote,
        '수정 실패',
        '노트를 수정할 수 없습니다. 다시 시도해주세요.',
        true // 성공 시 true 반환
    );

    // 빈 상태 체크
    const isEmpty = filteredNotes.length === 0 && !loading && !addingNote;
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

    return (
        <>
            {/* 메모 추가 폼 */}
            <NoteForm onAdd={handleAddNote} addingNote={addingNote} />

            {/* 메모 그리드 */}
            <div className="notes-grid">
                {filteredNotes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={setEditingNote}
                        onDelete={handleDeleteNote}
                        onArchive={handleArchiveNote}
                        addingNote={addingNote}
                    />
                ))}
            </div>

            {/* 빈 상태 메시지 */}
            {isEmpty && (
                <div className="empty-state">
                    <p>
                        {getEmptyStateMessage(
                            hasSearchQuery,
                            searchQuery,
                            '아직 메모가 없습니다. 여기서 메모를 추가해보세요!'
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

export default Home;
