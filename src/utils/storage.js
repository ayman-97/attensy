// src/utils/storage.js
export const saveData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };
  
  export const loadData = (key, defaultValue) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  };
  