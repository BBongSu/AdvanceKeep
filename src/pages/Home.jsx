import React, { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import { useSearch } from '../hooks/useSearch';
import NoteForm from '../components/features/notes/NoteForm';
import NoteCard from '../components/features/notes/NoteCard';
import EditNoteModal from '../components/features/notes/EditNoteModal';
import { useOutletContext } from 'react-router-dom';
import Swal from 'sweetalert2';

function Home() {
    const { notes, loading, addNote, updateNote, moveToTrash } = useNotes();
    const [editingNote, setEditingNote] = useState(null);
    const [addingNote, setAddingNote] = useState(false);

    const { searchQuery } = useOutletContext();

    // Filter out notes that are in trash
    const activeNotes = notes.filter(note => !note.inTrash);
    const filteredNotes = useSearch(activeNotes, searchQuery);

    const handleAddNote = async (noteData) => {
        setAddingNote(true);
        try {
            await addNote(noteData.title, noteData.text, noteData.image);
        } catch {
            await Swal.fire({
                icon: 'error',
                title: '추가 실패',
                text: '노트를 추가할 수 없습니다. 다시 시도해주세요.',
                confirmButtonColor: '#667eea'
            });
            return false;
        } finally {
            setAddingNote(false);
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            await moveToTrash(id);
        } catch {
            await Swal.fire({
                icon: 'error',
                title: '삭제 실패',
                text: '노트를 삭제할 수 없습니다. 다시 시도해주세요.',
                confirmButtonColor: '#667eea'
            });
        }
    };

    const handleUpdateNote = async (updated) => {
        try {
            await updateNote(updated);
            return true;
        } catch {
            await Swal.fire({
                icon: 'error',
                title: '수정 실패',
                text: '노트를 수정할 수 없습니다. 다시 시도해주세요.',
                confirmButtonColor: '#667eea'
            });
            return false;
        }
    };

    const isEmpty = filteredNotes.length === 0 && !loading && !addingNote;
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

    return (
        <>
            <NoteForm onAdd={handleAddNote} addingNote={addingNote} />

            <div className="notes-grid">
                {filteredNotes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={setEditingNote}
                        onDelete={handleDeleteNote}
                        addingNote={addingNote}
                    />
                ))}
            </div>

            {isEmpty && (
                <div className="empty-state">
                    <p>
                        {hasSearchQuery
                            ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                            : '아직 메모가 없습니다. 여기서 메모를 추가해보세요!'}
                    </p>
                </div>
            )}
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
