import { API_URL } from '../constants';

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchNotes = async (userId) => {
  if (!userId) return [];
  const [ownedRes, sharedRes] = await Promise.all([
    fetch(`${API_URL}?userId=${encodeURIComponent(userId)}`),
    fetch(`${API_URL}?sharedWith_like=${encodeURIComponent(userId)}`),
  ]);

  const [owned, shared] = await Promise.all([handleResponse(ownedRes), handleResponse(sharedRes)]);
  const seen = new Set();
  return [...owned, ...shared].filter((note) => {
    if (seen.has(note.id)) return false;
    seen.add(note.id);
    return true;
  });
};

export const updateNote = async (note) => {
  const response = await fetch(`${API_URL}/${note.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
  return handleResponse(response);
};

export const createNote = async (note) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
  return handleResponse(response);
};

export const deleteNote = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

