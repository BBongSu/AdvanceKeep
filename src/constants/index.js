
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
  { name: 'Default', color: '' }, // 투명(테마 기본색)
  { name: 'Red', color: 'var(--note-red)' },
  { name: 'Orange', color: 'var(--note-orange)' },
  { name: 'Yellow', color: 'var(--note-yellow)' },
  { name: 'Green', color: 'var(--note-green)' },
  { name: 'Teal', color: 'var(--note-teal)' },
  { name: 'Blue', color: 'var(--note-blue)' },
  { name: 'Dark Blue', color: 'var(--note-dark-blue)' },
  { name: 'Purple', color: 'var(--note-purple)' },
  { name: 'Pink', color: 'var(--note-pink)' },
  { name: 'Brown', color: 'var(--note-brown)' },
  { name: 'Gray', color: 'var(--note-gray)' },
];
