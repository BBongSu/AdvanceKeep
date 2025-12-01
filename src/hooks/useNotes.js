import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { fetchNotes, createNote, updateNote as updateNoteAPI, deleteNote as deleteNoteAPI } from '../services/api';
// import { DEFAULT_NOTE_COLOR } from '../constants';

const LOCAL_STORAGE_KEY = 'advancekeep-notes';

const readLocalNotes = () => {
  if (typeof localStorage === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const writeLocalNotes = (notes) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
};

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingActions, setPendingActions] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      const fallbackNotes = readLocalNotes();
      setNotes(fallbackNotes);
      setError('Server unreachable. Showing local notes.');
      console.error('Load notes failed, using local data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (title, text, image) => {
    const optimisticNote = {
      id: uuidv4(),
      title: title.trim() || null,
      text: text.trim() || null,
      image,
      // color: DEFAULT_NOTE_COLOR,
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [optimisticNote, ...prev]);

    try {
      const savedNote = await createNote(optimisticNote);
      setNotes((prev) =>
        prev.map((note) => (note.id === optimisticNote.id ? savedNote : note))
      );
      setLastSyncError(null);
      return savedNote;
    } catch (err) {
      setError('Saved locally only (server unreachable).');
      setLastSyncError('Sync failed, will retry soon.');
      setPendingActions((prev) => [
        ...prev,
        { type: 'create', payload: optimisticNote, attempts: 0 },
      ]);
      console.error('Add note failed, kept locally:', err);
      return optimisticNote;
    }
  };

  const updateNote = async (updatedNote) => {
    // Optimistic update.
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );

    try {
      const savedNote = await updateNoteAPI(updatedNote);
      setNotes((prev) =>
        prev.map((note) => (note.id === savedNote.id ? savedNote : note))
      );
      setLastSyncError(null);
      return savedNote;
    } catch (err) {
      setError('Update failed on server; keeping local changes and retrying.');
      setLastSyncError('Sync failed, will retry soon.');
      setPendingActions((prev) => [
        ...prev,
        { type: 'update', payload: updatedNote, attempts: 0 },
      ]);
      console.error('Update note failed, queued for retry:', err);
      return updatedNote;
    }
  };

  const moveToTrash = async (id) => {
    const noteToTrash = notes.find((n) => n.id === id);
    if (!noteToTrash) return;

    const updatedNote = { ...noteToTrash, inTrash: true };
    await updateNote(updatedNote);
  };

  const restoreNote = async (id) => {
    const noteToRestore = notes.find((n) => n.id === id);
    if (!noteToRestore) return;

    const updatedNote = { ...noteToRestore, inTrash: false };
    await updateNote(updatedNote);
  };

  const deleteForever = async (id) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));

    try {
      await deleteNoteAPI(id);
      setLastSyncError(null);
    } catch (err) {
      setError('Delete failed on server; kept deleted locally.');
      setLastSyncError('Sync failed, will retry soon.');
      setPendingActions((prev) => [
        ...prev,
        { type: 'delete', payload: { id }, attempts: 0 },
      ]);
      console.error('Delete note failed, local data only:', err);
    }
  };

  // Alias removeNote to deleteForever for backward compatibility if needed, 
  // but we should probably just use deleteForever explicitly.
  // Keeping removeNote as deleteForever for now to avoid breaking other things immediately, 
  // but I will export the new functions.
  const removeNote = deleteForever;

  useEffect(() => {
    writeLocalNotes(notes);
  }, [notes]);

  // Background retry for pending actions (exponential backoff, capped).
  useEffect(() => {
    if (pendingActions.length === 0) return undefined;

    const action = pendingActions[0];
    const delay = action.attempts === 0 ? 0 : Math.min(30000, 2000 * action.attempts);

    const timer = setTimeout(async () => {
      setSyncing(true);
      try {
        if (action.type === 'create') {
          const savedNote = await createNote(action.payload);
          setNotes((prev) =>
            prev.map((note) => (note.id === action.payload.id ? savedNote : note))
          );
        } else if (action.type === 'update') {
          const savedNote = await updateNoteAPI(action.payload);
          setNotes((prev) =>
            prev.map((note) => (note.id === savedNote.id ? savedNote : note))
          );
        } else if (action.type === 'delete') {
          await deleteNoteAPI(action.payload.id);
        }

        setPendingActions((prev) => prev.slice(1));
        setLastSyncError(null);
      } catch (err) {
        setPendingActions((prev) => {
          if (prev.length === 0) return prev;
          const [first, ...rest] = prev;
          return [...rest, { ...first, attempts: first.attempts + 1 }];
        });
        setLastSyncError('Sync failed, will retry soon.');
        console.error('Sync retry failed:', err);
      } finally {
        setSyncing(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [pendingActions]);

  return {
    notes,
    loading,
    error,
    syncing,
    pendingCount: pendingActions.length,
    lastSyncError,
    addNote,
    updateNote,
    removeNote,
    moveToTrash,
    restoreNote,
    deleteForever,
    loadNotes,
  };
};
