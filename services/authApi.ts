import { AuthCredentials, AuthRegistration, AuthUser } from '../types';
import { AuthDatabaseUser, clearSession, getSessionUserId, getUsers, saveUsers, setSessionUserId } from './authDatabase';

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `user_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const sanitizeUser = (user: AuthDatabaseUser): AuthUser => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export const registerUser = async (payload: AuthRegistration): Promise<AuthUser> => {
  const users = getUsers();
  const exists = users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) {
    throw new Error('该邮箱已注册，请直接登录。');
  }

  const newUser: AuthDatabaseUser = {
    id: generateId(),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    createdAt: new Date().toISOString(),
  };

  const nextUsers = [...users, newUser];
  saveUsers(nextUsers);
  setSessionUserId(newUser.id);
  return sanitizeUser(newUser);
};

export const loginUser = async (payload: AuthCredentials): Promise<AuthUser> => {
  const users = getUsers();
  const matched = users.find(
    (user) => user.email.toLowerCase() === payload.email.toLowerCase() && user.password === payload.password
  );
  if (!matched) {
    throw new Error('账号或密码错误，请重试。');
  }
  setSessionUserId(matched.id);
  return sanitizeUser(matched);
};

export const getCurrentUser = (): AuthUser | null => {
  const userId = getSessionUserId();
  if (!userId) {
    return null;
  }
  const users = getUsers();
  const matched = users.find((user) => user.id === userId);
  return matched ? sanitizeUser(matched) : null;
};

export const logoutUser = () => {
  clearSession();
};
