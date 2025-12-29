
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
  { name: 'Red', color: '#f28b82' },
  { name: 'Orange', color: '#fbbc04' },
  { name: 'Yellow', color: '#fff475' },
  { name: 'Green', color: '#ccff90' },
  { name: 'Teal', color: '#a7ffeb' },
  { name: 'Blue', color: '#cbf0f8' },
  { name: 'Dark Blue', color: '#aecbfa' },
  { name: 'Purple', color: '#d7aefb' },
  { name: 'Pink', color: '#fdcfe8' },
  { name: 'Brown', color: '#e6c9a8' },
  { name: 'Gray', color: '#e8eaed' },
];
