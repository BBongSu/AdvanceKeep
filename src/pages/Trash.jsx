import React from 'react';
import { useNotes } from '../hooks/useNotes';
import { useSearch } from '../hooks/useSearch';
import NoteCard from '../components/features/notes/NoteCard';
import { useOutletContext } from 'react-router-dom';

function Trash() {
    const { notes, restoreNote, deleteForever } = useNotes();
    const { searchQuery } = useOutletContext();

    // Filter notes that are in trash
    const trashedNotes = notes.filter(note => note.inTrash);
    const filteredNotes = useSearch(trashedNotes, searchQuery);

    const handleRestore = async (id) => {
        try {
            await restoreNote(id);
        } catch {
            alert('노트를 복원할 수 없습니다.');
        }
    };

    const handleDeleteForever = async (id) => {
        if (window.confirm('이 메모를 영구적으로 삭제하시겠습니까?')) {
            try {
                await deleteForever(id);
            } catch {
                alert('노트를 삭제할 수 없습니다.');
            }
        }
    };

    const isEmpty = filteredNotes.length === 0;
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

    return (
        <>
            <div className="notes-grid">
                {filteredNotes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        isTrash={true}
                        onRestore={handleRestore}
                        onDelete={handleDeleteForever}
                    />
                ))}
            </div>

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
