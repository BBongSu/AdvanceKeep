import { useState } from 'react';
import { FiImage, FiPlus, FiX, FiLoader, FiEdit2 } from 'react-icons/fi';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EditNoteModal from './components/EditNoteModal';
import { useNotes } from './hooks/useNotes';
import { useImageUpload } from './hooks/useImageUpload';
import { useSearch } from './hooks/useSearch';
import { useDarkMode } from './hooks/useDarkMode';
import { MENU_ITEMS } from './constants';

function App() {
  const [title, setTitle] = useState('');
  const [input, setInput] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(MENU_ITEMS.NOTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState(null);

  const { notes, loading, addNote: addNoteAPI, updateNote, removeNote } = useNotes();
  const { selectedImage, handleImageSelect, clearImage } = useImageUpload();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const filteredNotes = useSearch(notes, searchQuery);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() && !input.trim() && !selectedImage) return;

    const titleValue = title;
    const inputValue = input;
    const imageValue = selectedImage;

    setTitle('');
    setInput('');
    clearImage();

    setAddingNote(true);

    addNoteAPI(titleValue, inputValue, imageValue).catch(() => {
      alert('노트를 추가할 수 없습니다. 다시 시도해주세요.');
      setTitle(titleValue);
      setInput(inputValue);
      if (imageValue) {
        // 이미지 복원은 불가능하므로 안내만 남깁니다.
      }
    });

    // We don't block the UI while the network call happens.
    setAddingNote(false);
  };

  const handleDeleteNote = async (id) => {
    try {
      await removeNote(id);
    } catch (error) {
      alert('노트를 삭제할 수 없습니다. 다시 시도해주세요.');
    }
  };

  const handleUpdateNote = async (updated) => {
    try {
      await updateNote(updated);
      return true;
    } catch (error) {
      alert('노트를 수정할 수 없습니다. 다시 시도해주세요.');
      return false;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setSidebarOpen(false);
  };

  const isEmpty = filteredNotes.length === 0 && !loading && !addingNote;
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="app">
      <Header
        toggleSidebar={toggleSidebar}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onMenuClick={handleMenuClick}
        activeMenu={activeMenu}
      />

      <main className="main">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
              className="note-title-input"
              disabled={addingNote}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메모를 입력하세요..."
              className="note-input"
              disabled={addingNote}
              rows={4}
            />
            <div className="input-hint">
              <span className="hint-text">Enter로 등록, Shift + Enter로 줄바꿈</span>
            </div>

            <div className="image-preview-container">
              {selectedImage && (
                <div className="image-preview">
                  <img src={selectedImage} alt="Preview" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="remove-image-btn"
                    aria-label="이미지 제거"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="button-group">
              <label className="image-upload-btn" aria-label="이미지 첨부">
                <FiImage size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={addingNote}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                type="submit"
                className="add-btn"
                disabled={addingNote || (!title.trim() && !input.trim() && !selectedImage)}
                aria-label="메모 추가"
              >
                {addingNote ? (
                  <FiLoader size={20} className="spinning" />
                ) : (
                  <FiPlus size={20} />
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="note-card"
              style={{ backgroundColor: note.color }}
              onClick={() => setEditingNote(note)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setEditingNote(note);
                }
              }}
            >
              {note.title && (
                <h3 className="note-title">{note.title}</h3>
              )}
              {note.image && (
                <div className="note-image">
                  <img src={note.image} alt="Note attachment" />
                </div>
              )}
              {note.text && <p className="note-text">{note.text}</p>}
              <div className="note-card-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNote(note);
                  }}
                  className="note-action-btn"
                  disabled={addingNote}
                  aria-label="메모 수정"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  className="note-action-btn"
                  disabled={addingNote}
                  aria-label="메모 삭제"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {isEmpty && (
          <div className="empty-state">
            <p>
              {hasSearchQuery
                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                : '아직 메모가 없습니다. 여기에 메모를 추가해보세요!'}
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
      </main>
    </div>
  );
}

export default App;
