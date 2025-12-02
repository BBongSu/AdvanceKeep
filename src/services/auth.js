import { v4 as uuidv4 } from 'uuid';
import { USERS_URL } from '../constants';

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return toHex(hashBuffer);
};

const sanitizeUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingRes = await fetch(`${USERS_URL}?email=${encodeURIComponent(normalizedEmail)}`);
  const existingUsers = await handleResponse(existingRes);

  if (existingUsers.length > 0) {
    throw new Error('이미 가입된 이메일입니다.');
  }

  const passwordHash = await hashPassword(password);
  const newUser = {
    id: uuidv4(),
    name: name.trim() || '사용자',
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  const response = await fetch(USERS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newUser),
  });

  const savedUser = await handleResponse(response);
  return sanitizeUser(savedUser);
};

export const loginUser = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const response = await fetch(`${USERS_URL}?email=${encodeURIComponent(normalizedEmail)}`);
  const users = await handleResponse(response);

  if (users.length === 0) {
    throw new Error('등록된 이메일을 찾을 수 없습니다.');
  }

  const user = users[0];
  const passwordHash = await hashPassword(password);

  if (user.passwordHash !== passwordHash) {
    throw new Error('비밀번호가 일치하지 않습니다.');
  }

  return sanitizeUser(user);
};
