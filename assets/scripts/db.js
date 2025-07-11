const params = new URLSearchParams(window.location.search);

export const DB_NAME = params.get('projectName');
export const STORE_NAME = 'files';

export function openDB(version = 1) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, version); // Version must be >= 1

    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'path' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      // Double-check if store exists even after success
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close(); // Close before deleting
        indexedDB.deleteDatabase(DB_NAME); // Force recreate
        reject(`Missing store "${STORE_NAME}". Deleted DB. Please refresh.`);
        return;
      }

      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function saveFile(path, content) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ path, content });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject("Save transaction failed");
  });
}

export async function getAllFiles() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      resolve(getAllRequest.result); // array of { path, content }
    };

    getAllRequest.onerror = () => {
      reject("Failed to get files");
    };
  });
}

export async function getFile(filename) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const getRequest = store.get(filename);

    getRequest.onsuccess = () => {
      resolve(getRequest.result); // returns file or undefined
    };

    getRequest.onerror = () => {
      reject("Failed to get file");
    };
  });
}

export async function deleteFile(path) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(path);
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject("Failed to delete file");
  });
}

export function isIndexedDBEmpty() {
  return new Promise((resolve, reject) => {
    const request = openDB();

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

export async function clearAllFiles() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.clear();
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject("Failed to clear files");
  });
}
