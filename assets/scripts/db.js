const params = new URLSearchParams(window.location.search);

export const DB_NAME = params.get('projectName');
export const STORE_NAME = 'files';

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: 'path' }); // path = folder/file name
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFile(path, content) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.put({ path, content });
  return tx.complete;
}

export async function getAllFiles() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(params.get('projectName'), 1);

    request.onsuccess = function () {
      const db = request.result;
      const tx = db.transaction("files", "readonly");
      const store = tx.objectStore("files");

      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = function () {
        resolve(getAllRequest.result); // Should be an array of { name, content }
      };

      getAllRequest.onerror = function () {
        reject("Failed to get files");
      };
    };

    request.onerror = function () {
      reject("IndexedDB open error");
    };
  });
}

export function getFile(filename) {
  return new Promise((resolve, reject) => {
    const request = openDB(); // Make sure openDB() returns an IDBOpenDBRequest

    request.onerror = () => reject("Failed to open DB");

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');

      const getRequest = store.get(filename);

      getRequest.onsuccess = () => {
        resolve(getRequest.result); // Returns file or undefined
      };

      getRequest.onerror = () => {
        reject("Failed to get file");
      };
    };
  });
}

export async function deleteFile(path) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(path);
  
  return tx.complete;
}

export function isIndexedDBEmpty() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onerror = () => reject("Failed to open DB");
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        resolve(countRequest.result === 0); // true if empty
      };

      countRequest.onerror = () => {
        reject("Count failed");
      };
    };
  });
}