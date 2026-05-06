import { useState, useEffect } from 'react';

export const useStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
};

// User-scoped version: reads/writes under "u_{username}_{key}"
export const useUserStorage = (baseKey, defaultValue, username) => {
  const scopedKey = username ? `u_${username}_${baseKey}` : baseKey;
  return useStorage(scopedKey, defaultValue);
};
