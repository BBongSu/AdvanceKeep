import React from 'react';
import { useNotes } from '../hooks/useNotes';
import { useSearch } from '../hooks/useSearch';
import NoteCard from '../components/features/notes/NoteCard';
import { useOutletContext } from 'react-router-dom';
import Swal from 'sweetalert2';

function Trash() {
    const { restoreNote, deleteForever, notes, loading } = useNotes();
    const { searchQuery, sortOrder, viewMode } = useOutletContext();

    // Filter notes that are in trash and sort
    const trashedNotes = notes.filter(note => note.inTrash);
    const filteredNotes = useSearch(trashedNotes, searchQuery);

    const sortedNotes = [...filteredNotes].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    const handleRestore = async (id) => {
        try {
            await restoreNote(id);
        } catch {
            await Swal.fire({
                icon: 'error',
                title: '복원 실패',
                text: '노트를 복원할 수 없습니다.',
                confirmButtonColor: '#667eea'
            });
        }
    };

    const handleDeleteForever = async (id) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: '영구 삭제할까요?',
            text: '삭제 후에는 되돌릴 수 없습니다.',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#9e9e9e',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                await deleteForever(id);
            } catch {
                await Swal.fire({
                    icon: 'error',
                    title: '삭제 실패',
                    text: '노트를 삭제할 수 없습니다.',
                    confirmButtonColor: '#667eea'
                });
            }
        }
    };

    const isEmpty = sortedNotes.length === 0 && !loading;
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

    return (
        <>
            {trashedNotes.length > 0 && (
                <div style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '12px',
                    marginBottom: '24px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 500
                }}>
                    휴지통의 메모는 30일 후 자동으로 삭제됩니다.
                </div>
            )}

            <div className={`notes-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {sortedNotes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        isTrash={true}
                        onRestore={handleRestore}
                        onDelete={handleDeleteForever}
                        searchQuery={searchQuery}
                    />
                ))}
            </div>

            {loading && (
                <div className="empty-state">
                    <p>데이터를 불러오는 중입니다...</p>
                </div>
            )}

            {isEmpty && (
                <div className="empty-state">
                    <p>
                        {hasSearchQuery
                            ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                            : trashedNotes.length === 0
                                ? '휴지통이 비어있습니다.'
                                : '검색 결과가 없습니다.'}
                    </p>
                </div>
            )}
        </>
    );
}

export default Trash;
