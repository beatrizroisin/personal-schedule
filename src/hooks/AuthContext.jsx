import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// All users are stored under "meu_cantinho_users"
const USERS_KEY = 'meu_cantinho_users';
const SESSION_KEY = 'meu_cantinho_session';

const getUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
  catch { return {}; }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (!session) return null;
      const { username } = JSON.parse(session);
      const users = getUsers();
      return users[username] ? { username, ...users[username] } : null;
    } catch { return null; }
  });

  // Register new user
  const register = useCallback((username, password, displayName, avatar) => {
    const users = getUsers();
    const key = username.toLowerCase().trim();
    if (!key || key.length < 3) return { ok: false, error: 'Usuário deve ter pelo menos 3 caracteres.' };
    if (users[key]) return { ok: false, error: 'Este usuário já existe! Escolha outro nome.' };
    if (!password || password.length < 4) return { ok: false, error: 'Senha deve ter pelo menos 4 caracteres.' };

    const user = { displayName: displayName || username, avatar: avatar || '🌸', createdAt: new Date().toISOString() };
    users[key] = { ...user, password };
    saveUsers(users);
    const sessionUser = { username: key, ...user };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: key }));
    setCurrentUser(sessionUser);
    return { ok: true };
  }, []);

  // Login
  const login = useCallback((username, password) => {
    const users = getUsers();
    const key = username.toLowerCase().trim();
    if (!users[key]) return { ok: false, error: 'Usuário não encontrado.' };
    if (users[key].password !== password) return { ok: false, error: 'Senha incorreta.' };
    const { password: _p, ...user } = users[key];
    const sessionUser = { username: key, ...user };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: key }));
    setCurrentUser(sessionUser);
    return { ok: true };
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  // Update profile
  const updateProfile = useCallback((displayName, avatar) => {
    if (!currentUser) return;
    const users = getUsers();
    users[currentUser.username] = { ...users[currentUser.username], displayName, avatar };
    saveUsers(users);
    setCurrentUser(u => ({ ...u, displayName, avatar }));
  }, [currentUser]);

  // Get all users (for admin-style listing — no passwords exposed)
  const listUsers = useCallback(() => {
    const users = getUsers();
    return Object.entries(users).map(([username, data]) => {
      const { password: _p, ...safe } = data;
      return { username, ...safe };
    });
  }, []);

  // User-scoped storage key
  const userKey = (key) => currentUser ? `u_${currentUser.username}_${key}` : key;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, updateProfile, listUsers, userKey }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
