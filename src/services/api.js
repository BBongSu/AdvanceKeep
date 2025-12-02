import { API_URL } from '../constants';

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchNotes = async (userId) => {
  if (!userId) return [];
  const response = await fetch(`${API_URL}?userId=${encodeURIComponent(userId)}`);
  return handleResponse(response);
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

