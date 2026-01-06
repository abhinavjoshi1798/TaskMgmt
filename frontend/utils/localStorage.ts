const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export const getItem = (key: string): string | null => {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting item from localStorage: ${error}`);
    return null;
  }
};

export const setItem = (key: string, value: string): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting item in localStorage: ${error}`);
    return false;
  }
};

export const removeItem = (key: string): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item from localStorage: ${error}`);
    return false;
  }
};

export const clear = (): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
    return false;
  }
};

export const getJSON = <T = unknown>(key: string): T | null => {
  const item = getItem(key);
  if (!item) {
    return null;
  }
  try {
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error parsing JSON from localStorage: ${error}`);
    return null;
  }
};

export const setJSON = <T>(key: string, value: T): boolean => {
  try {
    const stringified = JSON.stringify(value);
    return setItem(key, stringified);
  } catch (error) {
    console.error(`Error stringifying JSON for localStorage: ${error}`);
    return false;
  }
};
