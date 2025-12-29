
export const AUTH_STORAGE_KEY = 'advancekeep-user';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const MENU_ITEMS = {
  NOTES: 'notes',
  TODO: 'todo',
  ARCHIVE: 'archive',
  TRASH: 'trash',
};

export const MENU_LABELS = {
  [MENU_ITEMS.NOTES]: '메모',
  [MENU_ITEMS.TODO]: '할 일 목록',
  [MENU_ITEMS.ARCHIVE]: '보관함',
  [MENU_ITEMS.TRASH]: '휴지통',
};

export const KEEP_COLORS = [
  { name: '기본', color: '' }, // 투명(테마 기본색)
  { name: '빨강', color: 'var(--note-red)' },
  { name: '주황', color: 'var(--note-orange)' },
  { name: '노랑', color: 'var(--note-yellow)' },
  { name: '초록', color: 'var(--note-green)' },
  { name: '청록', color: 'var(--note-teal)' },
  { name: '파랑', color: 'var(--note-blue)' },
  { name: '진한 파랑', color: 'var(--note-dark-blue)' },
  { name: '보라', color: 'var(--note-purple)' },
  { name: '분홍', color: 'var(--note-pink)' },
  { name: '갈색', color: 'var(--note-brown)' },
  { name: '회색', color: 'var(--note-gray)' },
];
