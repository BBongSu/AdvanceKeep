import React from 'react';
import { FiBell, FiUserPlus, FiPalette, FiImage, FiArchive, FiMoreVertical } from 'react-icons/fi';

const NoteCard = ({ note, onDelete }) => {
  return (
    <div className="note-card" style={{ backgroundColor: `var(--note-${note.color || 'white'})` }}>
      <div className="note-card-content">
        {note.title && <h3 className="note-card-title">{note.title}</h3>}
        <p className="note-card-body">{note.content}</p>
      </div>

      <div className="note-card-actions">
        <button className="icon-btn small"><FiBell size={16} /></button>
        <button className="icon-btn small"><FiUserPlus size={16} /></button>
        <button className="icon-btn small"><FiPalette size={16} /></button>
        <button className="icon-btn small"><FiImage size={16} /></button>
        <button className="icon-btn small"><FiArchive size={16} /></button>
        <button className="icon-btn small" onClick={() => onDelete(note.id)}><FiMoreVertical size={16} /></button>
      </div>
    </div>
  );
};

export default NoteCard;
