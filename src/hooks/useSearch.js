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
      // 체크리스트 아이템 검색 추가
      const itemsMatch = note.items && note.items.some(item => item.text && item.text.toLowerCase().includes(query));

      return titleMatch || textMatch || itemsMatch;
    });
  }, [notes, searchQuery]);

  return filteredNotes;
};

