import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { fetchNotes, createNote, updateNote as updateNoteAPI, deleteNote as deleteNoteAPI } from '../services/api';

// 로컬 스토리지 키
const LOCAL_STORAGE_KEY = 'advancekeep-notes';

/**
 * 로컬 스토리지에서 메모 읽기
 * @returns {Array} 저장된 메모 배열
 */
const readLocalNotes = () => {
  if (typeof localStorage === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * 로컬 스토리지에 메모 저장
 * @param {Array} notes - 저장할 메모 배열
 */
const writeLocalNotes = (notes) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
};

/**
 * 메모 관리를 위한 커스텀 훅
 * 서버 동기화, 로컬 스토리지 백업, 낙관적 업데이트 기능 제공
 */
export const useNotes = () => {
  // 상태 관리
  const [notes, setNotes] = useState([]);                    // 메모 목록
  const [loading, setLoading] = useState(false);             // 로딩 상태
  const [error, setError] = useState(null);                  // 에러 상태
  const [pendingActions, setPendingActions] = useState([]); // 대기 중인 동기화 작업
  const [syncing, setSyncing] = useState(false);             // 동기화 진행 중 여부
  const [lastSyncError, setLastSyncError] = useState(null);  // 마지막 동기화 에러

  useEffect(() => {
    loadNotes();
  }, []);

  /**
   * 서버에서 메모 불러오기
   * 실패 시 로컬 스토리지의 메모를 사용
   */
  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      // 서버 연결 실패 시 로컬 데이터 사용
      const fallbackNotes = readLocalNotes();
      setNotes(fallbackNotes);
      setError('Server unreachable. Showing local notes.');
      console.error('Load notes failed, using local data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 새 메모 추가
   * 낙관적 업데이트: UI에 즉시 반영 후 서버 동기화
   * @param {string} title - 메모 제목
   * @param {string} text - 메모 내용
   * @param {string} image - 이미지 URL
   */
  const addNote = async (title, text, image) => {
    // 낙관적 업데이트를 위한 임시 메모 생성
    const optimisticNote = {
      id: uuidv4(),
      title: title.trim() || null,
      text: text.trim() || null,
      image,
      createdAt: new Date().toISOString(),
    };

    // UI에 즉시 반영
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

  /**
   * 메모 수정
   * 낙관적 업데이트: UI에 즉시 반영 후 서버 동기화
   * @param {Object} updatedNote - 수정된 메모 객체
   */
  const updateNote = async (updatedNote) => {
    // 낙관적 업데이트: UI에 즉시 반영
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

  /**
   * 메모를 휴지통으로 이동
   * @param {string} id - 메모 ID
   */
  const moveToTrash = async (id) => {
    const noteToTrash = notes.find((n) => n.id === id);
    if (!noteToTrash) return;

    const updatedNote = { ...noteToTrash, inTrash: true };
    await updateNote(updatedNote);
  };

  /**
   * 휴지통에서 메모 복원
   * @param {string} id - 메모 ID
   */
  const restoreNote = async (id) => {
    const noteToRestore = notes.find((n) => n.id === id);
    if (!noteToRestore) return;

    const updatedNote = { ...noteToRestore, inTrash: false };
    await updateNote(updatedNote);
  };

  /**
   * 메모 보관
   * @param {string} id - 메모 ID
   */
  const archiveNote = async (id) => {
    const noteToArchive = notes.find((n) => n.id === id);
    if (!noteToArchive) return;

    const updatedNote = { ...noteToArchive, isArchived: true };
    await updateNote(updatedNote);
  };

  /**
   * 메모 보관 해제
   * @param {string} id - 메모 ID
   */
  const unarchiveNote = async (id) => {
    const noteToUnarchive = notes.find((n) => n.id === id);
    if (!noteToUnarchive) return;

    const updatedNote = { ...noteToUnarchive, isArchived: false };
    await updateNote(updatedNote);
  };


  /**
   * 메모 영구 삭제
   * @param {string} id - 메모 ID
   */
  const deleteForever = async (id) => {
    // UI에서 즉시 제거
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
    archiveNote,
    unarchiveNote,
    deleteForever,
    loadNotes,
  };
};
