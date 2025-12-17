import React, { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import { useSearch } from '../hooks/useSearch';
import NoteForm from '../components/features/notes/NoteForm';
import NoteCard from '../components/features/notes/NoteCard';
import EditNoteModal from '../components/features/notes/EditNoteModal';
import { useOutletContext } from 'react-router-dom';
import { createNoteHandler, getEmptyStateMessage, showErrorAlert } from '../utils/noteHelpers';
import Swal from 'sweetalert2';
import { useAuth } from '../hooks/useAuth';

/**
 * 홈 페이지 컴포넌트
 * 활성 상태의 메모들을 표시하고 관리하는 메인 페이지
 */
function Home() {
    // 메모 관련 훅과 상태 관리
    const {
        notes,
        loading,
        addNote,
        updateNote,
        moveToTrash,
        archiveNote,
        shareNoteWithEmail,
        unshareNoteWithEmail,
    } = useNotes();
    const [editingNote, setEditingNote] = useState(null);
    const [addingNote, setAddingNote] = useState(false);
    const { user } = useAuth();

    // 검색어 가져오기 (상위 컴포넌트에서 전달)
    const { searchQuery, viewMode } = useOutletContext();

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

    const handleShareNote = async (note) => {
        const { value: email } = await Swal.fire({
            title: '메모 공유',
            input: 'email',
            inputLabel: '공유할 사용자의 이메일을 입력하세요',
            inputPlaceholder: 'you@example.com',
            showCancelButton: true,
            confirmButtonText: '공유',
            confirmButtonColor: '#667eea',
            cancelButtonText: '취소',
            inputValidator: (value) => {
                if (!value || !value.trim()) return '이메일을 입력해 주세요.';
                const emailPattern = /^\S+@\S+\.\S+$/;
                if (!emailPattern.test(value.trim())) return '유효한 이메일 주소를 입력해 주세요.';
                return undefined;
            },
        });

        const trimmedEmail = email?.trim();
        if (!trimmedEmail) return;

        try {
            await shareNoteWithEmail(note.id, trimmedEmail);
            await Swal.fire({
                icon: 'success',
                title: '공유 완료',
                text: `${trimmedEmail} 사용자와 메모를 공유했습니다.`,
                confirmButtonColor: '#667eea',
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: '공유 실패',
                text: err.message || '공유에 실패했습니다. 다시 시도해주세요.',
                confirmButtonColor: '#667eea',
            });
        }
    };

    const handleShareToggle = async (note, sharedWithMe) => {
        const isOwner = note.userId === user?.id || note.ownerId === user?.id;
        const hasShared = (note.sharedWith || []).length > 0;

        // 공유받은 사용자: 본인 공유 해제
        if (!isOwner && sharedWithMe && user?.email) {
            const confirmed = await Swal.fire({
                title: '공유 해제',
                text: '이 메모 공유를 그만받으시겠어요?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '해제',
                confirmButtonColor: '#e53935',
                cancelButtonText: '취소',
            });

            if (confirmed.isConfirmed) {
                try {
                    await unshareNoteWithEmail(note.id, user.email);
                    await Swal.fire({
                        icon: 'success',
                        title: '공유 해제 완료',
                        text: '이제 더 이상 이 메모를 공유받지 않습니다.',
                        confirmButtonColor: '#667eea',
                    });
                } catch (err) {
                    await Swal.fire({
                        icon: 'error',
                        title: '공유 해제 실패',
                        text: err.message || '공유 해제에 실패했습니다. 다시 시도해주세요.',
                        confirmButtonColor: '#667eea',
                    });
                }
            }
            return;
        }

        if (!isOwner) return;

        // 소유자: 공유 상태에 따라 자동 분기 (아이콘 토글 느낌)
        if (!hasShared) {
            await handleShareNote(note);
            return;
        }

        // 이미 공유 중인 경우: 취소할 이메일 입력
        const { value: email } = await Swal.fire({
            title: '공유 취소',
            input: 'email',
            inputLabel: '공유를 취소할 사용자의 이메일을 입력하세요',
            inputPlaceholder: 'you@example.com',
            showCancelButton: true,
            confirmButtonText: '공유 취소',
            confirmButtonColor: '#667eea',
            cancelButtonText: '닫기',
            inputValidator: (value) => {
                if (!value || !value.trim()) return '이메일을 입력해 주세요.';
                const emailPattern = /^\S+@\S+\.\S+$/;
                if (!emailPattern.test(value.trim())) return '유효한 이메일 주소를 입력해 주세요.';
                return undefined;
            },
        });

        const trimmedEmail = email?.trim();
        if (!trimmedEmail) return;

        try {
            await unshareNoteWithEmail(note.id, trimmedEmail);
            await Swal.fire({
                icon: 'success',
                title: '공유 취소 완료',
                text: `${trimmedEmail} 사용자와의 공유를 해제했습니다.`,
                confirmButtonColor: '#667eea',
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: '공유 취소 실패',
                text: err.message || '공유 취소에 실패했습니다. 다시 시도해주세요.',
                confirmButtonColor: '#667eea',
            });
        }
    };

    // 빈 상태 체크
    const isEmpty = filteredNotes.length === 0 && !loading && !addingNote;
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

    return (
        <>
            {/* 메모 추가 폼 */}
            <NoteForm onAdd={handleAddNote} addingNote={addingNote} />

            {/* 메모 그리드 */}
            <div className={`notes-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {filteredNotes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={setEditingNote}
                        onDelete={handleDeleteNote}
                        onArchive={handleArchiveNote}
                        onShareToggle={handleShareToggle}
                        isOwner={note.userId === user?.id || note.ownerId === user?.id}
                        sharedWithMe={
                            note.userId !== user?.id &&
                            note.ownerId !== user?.id &&
                            (note.sharedWith || []).includes(user?.id)
                        }
                        addingNote={addingNote}
                        searchQuery={searchQuery}
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
