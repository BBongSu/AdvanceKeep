import { useState, useEffect } from 'react';
import { fetchNotes, createNote, deleteNote as deleteNoteAPI } from '../utils/api';
// import { DEFAULT_NOTE_COLOR } from '../constants';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError(err.message);
      console.error('노트 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (title, text, image) => {
    const newNote = {
      title: title.trim() || null,
      text: text.trim() || null,
      image,
      // color: DEFAULT_NOTE_COLOR,
      createdAt: new Date().toISOString(),
    };

    try {
      setLoading(true);
      const savedNote = await createNote(newNote);
      setNotes((prevNotes) => [savedNote, ...prevNotes]);
      return savedNote;
    } catch (err) {
      setError(err.message);
      console.error('노트 추가 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeNote = async (id) => {
    try {
      setLoading(true);
      await deleteNoteAPI(id);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('노트 삭제 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    removeNote,
    loadNotes,
  };
};

