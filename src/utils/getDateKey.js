// src/utils/getDateKey.js
export const getDateKey = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      console.error('Invalid date:', date);
      return 'invalid-date';
    }
    return date.toISOString().split('T')[0];
  };
  