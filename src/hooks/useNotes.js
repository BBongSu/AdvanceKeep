import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createNote, updateNote as updateNoteAPI, deleteNote as deleteNoteAPI, subscribeNotes } from '../services/api';
import { findUserByEmail } from '../services/auth';
import { useAuth } from './useAuth';

// 로컬 스토리지 키
const LOCAL_STORAGE_KEY = 'advancekeep-notes';

const getStorageKey = (userId) => (userId ? `${LOCAL_STORAGE_KEY}-${userId}` : LOCAL_STORAGE_KEY);

/**
 * 로컬 스토리지에서 메모 읽기
 * @returns {Array} 저장된 메모 배열
 */
const readLocalNotes = (userId) => {
  if (typeof localStorage === 'undefined') return [];
  const stored = localStorage.getItem(getStorageKey(userId));
  return stored ? JSON.parse(stored) : [];
};

/**
 * 로컬 스토리지에 메모 저장
 * @param {Array} notes - 저장할 메모 배열
 */
const writeLocalNotes = (userId, notes) => {
  if (typeof localStorage === 'undefined') return;

  // 이미지(base64)는 용량이 커서 로컬스토리지 한도를 초과하므로 텍스트 메타데이터만 보관
  const lightweight = notes.map((note) => {
    const {
      images, // 제거
      image,  // 제거
      ...rest
    } = note;
    return rest;
  });

  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(lightweight));
  } catch (err) {
    // 용량 초과 시에는 로컬 백업을 생략하고 로그만 남김
    console.warn('Local backup skipped (quota exceeded):', err);
  }
};

/**
 * 메모 관리를 위한 커스텀 훅
 * 서버 동기화, 로컬 스토리지 백업, 낙관적 업데이트 기능 제공
 */
export const useNotes = () => {
  const { user } = useAuth();
  // 상태 관리
  const [notes, setNotes] = useState([]);                    // 메모 목록
  const [loading, setLoading] = useState(false);             // 로딩 상태
  const [error, setError] = useState(null);                  // 에러 상태
  const [pendingActions, setPendingActions] = useState([]); // 대기 중인 동기화 작업
  const [syncing, setSyncing] = useState(false);             // 동기화 진행 중 여부
  const [lastSyncError, setLastSyncError] = useState(null);  // 마지막 동기화 에러

  useEffect(() => {
    if (!user?.id) {
      setNotes([]);
      return () => { };
    }

    setLoading(true);
    // 실시간 구독 시작
    const unsubscribe = subscribeNotes(user.id, (realtimeNotes) => {
      setNotes(realtimeNotes);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);



  /**
   * 새 메모 추가
   * 낙관적 업데이트: UI에 즉시 반영 후 서버 동기화
   * @param {string} title - 메모 제목
   * @param {string} text - 메모 내용
   * @param {Array<string>} images - 이미지 배열(base64)
   */
  const addNote = async (title, text, images = [], color = '#ffffff') => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    // 낙관적 업데이트를 위한 임시 메모 생성
    const optimisticNote = {
      id: uuidv4(),
      title: title.trim() || null,
      text: text ? text.trim() : null, // 리치 텍스트(HTML)도 그대로 저장
      images,
      image: images?.[0] || null, // 기존 필드와 호환 유지
      color, // 배경색 저장
      createdAt: new Date().toISOString(),
      userId: user.id, // 기존 필드(소유자)
      ownerId: user.id, // 명확히 소유자를 구분하기 위한 필드
      sharedWith: [],
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
   * 메모 고정/해제 토글
   * @param {string} id - 메모 ID
   */
  const togglePin = async (id) => {
    const noteToToggle = notes.find((n) => n.id === id);
    if (!noteToToggle) return;

    const updatedNote = { ...noteToToggle, isPinned: !noteToToggle.isPinned };
    await updateNote(updatedNote);
  };

  /**
   * 공유 대상 사용자 목록을 한번에 설정
   * - 소유자는 전체 목록 변경 가능
   * - 공유받은 사용자는 본인 제거만 가능
   * @param {Array} nextSharedWithNames - (Optional) 공유 대상 이름 목록 (낙관적 업데이트용)
   */
  const setSharedUsers = async (id, nextSharedWithRaw = [], nextSharedWithNames = null) => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const noteToUpdate = notes.find((n) => n.id === id);
    if (!noteToUpdate) {
      throw new Error('메모를 찾을 수 없습니다.');
    }

    const nextSharedWith = Array.from(new Set(nextSharedWithRaw.filter(Boolean)));
    const isOwner = noteToUpdate.ownerId === user.id || noteToUpdate.userId === user.id;
    const prevShared = noteToUpdate.sharedWith || [];

    if (!isOwner) {
      // 소유자가 아니면 본인 제거만 허용
      const removingSelfOnly =
        prevShared.includes(user.id) &&
        !nextSharedWith.includes(user.id) &&
        nextSharedWith.length === prevShared.length - 1 &&
        prevShared.every((uid) => uid === user.id || nextSharedWith.includes(uid));

      if (!removingSelfOnly) {
        throw new Error('소유자만 공유를 변경할 수 있습니다.');
      }
    }

    const updatedNote = {
      ...noteToUpdate,
      sharedWith: nextSharedWith,
    };

    // 이름 목록도 함께 업데이트 (낙관적 UI용)
    if (nextSharedWithNames) {
      updatedNote.sharedWithNames = nextSharedWithNames;
    }

    return updateNote(updatedNote);
  };

  /**
   * 메모를 특정 사용자와 공유
   * @param {string} id - 메모 ID
   * @param {string} email - 공유 대상 이메일
   */
  const shareNoteWithEmail = async (id, email) => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const noteToShare = notes.find((n) => n.id === id);
    if (!noteToShare) {
      throw new Error('메모를 찾을 수 없습니다.');
    }

    // 서버 단에서도 공유는 소유자만 허용하도록 방어
    const isOwner = noteToShare.ownerId === user.id || noteToShare.userId === user.id;
    if (!isOwner) {
      throw new Error('소유자만 공유할 수 있습니다.');
    }

    const targetUser = await findUserByEmail(email);
    if (!targetUser) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    if (targetUser.id === user.id) {
      throw new Error('본인과는 공유할 수 없습니다.');
    }

    // 이미 공유된 사용자인지 확인
    const currentShared = noteToShare.sharedWith || [];
    if (currentShared.includes(targetUser.id)) {
      return noteToShare; // 이미 공유됨
    }

    const nextSharedWith = [...currentShared, targetUser.id];

    // 이름 목록 업데이트 (낙관적 UI용)
    const currentNames = noteToShare.sharedWithNames || [];
    // sharedWith와 sharedWithNames의 길이가 다르면(초기 로딩 등) 단순히 추가만 함
    const nextSharedWithNames = [...currentNames, targetUser.name];

    return setSharedUsers(id, nextSharedWith, nextSharedWithNames);
  };

  /**
   * 특정 사용자와의 공유 해제 (사용자 ID 기반)
   * @param {string} id - 메모 ID
   * @param {string} targetUserId - 공유 해제할 사용자 ID
   */
  const unshareNote = async (id, targetUserId) => {
    const noteToUpdate = notes.find((n) => n.id === id);
    if (!noteToUpdate) return;

    const currentShared = noteToUpdate.sharedWith || [];
    const targetIndex = currentShared.indexOf(targetUserId);

    if (targetIndex === -1) return; // 공유되지 않음

    const nextSharedWith = [...currentShared];
    nextSharedWith.splice(targetIndex, 1);

    // 이름 목록에서도 제거
    const currentNames = noteToUpdate.sharedWithNames || [];
    const nextSharedWithNames = [...currentNames];
    // 인덱스 안전 장치
    if (nextSharedWithNames.length > targetIndex) {
      nextSharedWithNames.splice(targetIndex, 1);
    }

    return setSharedUsers(id, nextSharedWith, nextSharedWithNames);
  };

  /**
   * 특정 사용자와의 공유 해제 (이메일 입력 기반)
   * - 소유자는 누구와도 공유 해제 가능
   * - 공유받은 사용자는 본인만 공유 해제 가능
   */
  const unshareNoteWithEmail = async (id, email) => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const trimmedEmail = email?.trim();
    if (!trimmedEmail) {
      throw new Error('이메일을 입력해 주세요.');
    }

    const noteToUpdate = notes.find((n) => n.id === id);
    if (!noteToUpdate) {
      throw new Error('메모를 찾을 수 없습니다.');
    }

    const isOwner = noteToUpdate.ownerId === user.id || noteToUpdate.userId === user.id;

    let targetUserId = user.id;
    if (isOwner) {
      const targetUser = await findUserByEmail(trimmedEmail);
      if (!targetUser) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      targetUserId = targetUser.id;
    }

    if (!isOwner && targetUserId !== user.id) {
      throw new Error('소유자만 공유를 해제할 수 있습니다.');
    }

    const alreadyShared = (noteToUpdate.sharedWith || []).includes(targetUserId);
    if (!alreadyShared) {
      throw new Error('해당 사용자와 공유되어 있지 않습니다.');
    }

    const currentShared = noteToUpdate.sharedWith || [];
    const targetIndex = currentShared.indexOf(targetUserId);

    if (targetIndex === -1) {
      // 이미 위에서 체크했으나 안전장치
      return noteToUpdate;
    }

    const nextSharedWith = [...currentShared];
    nextSharedWith.splice(targetIndex, 1);

    const currentNames = noteToUpdate.sharedWithNames || [];
    const nextSharedWithNames = [...currentNames];
    if (nextSharedWithNames.length > targetIndex) {
      nextSharedWithNames.splice(targetIndex, 1);
    }

    return setSharedUsers(id, nextSharedWith, nextSharedWithNames);
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
    if (!user) return;
    writeLocalNotes(user.id, notes);
  }, [notes, user]);

  // Background retry for pending actions (exponential backoff, capped).
  useEffect(() => {
    if (pendingActions.length === 0) return undefined;
    if (!user) return undefined;

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
    togglePin,
    setSharedUsers,
    shareNoteWithEmail,
    unshareNote,
    unshareNoteWithEmail,
    deleteForever,
  };
};
