import { useMemo } from 'react';

export const useSearch = (notes, searchQuery) => {
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }

    const query = searchQuery.toLowerCase();
    return notes.filter((note) => {
      const titleMatch = note.title && note.title.toLowerCase().includes(query);
      const textMatch = note.text && note.text.toLowerCase().includes(query);
      return titleMatch || textMatch;
    });
  }, [notes, searchQuery]);

  return filteredNotes;
};

