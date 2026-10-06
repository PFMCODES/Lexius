/**
 * IndexedDB wrapper for file storage with optional Electron filesystem sync.
 * @module db
 */

import { isElectron, fs } from './langs.js.js';

const params = new URLSearchParams(window.location.search);

// Workspace database (separate from files database)
export const WORKSPACE_DB_NAME = 'lexius-workspaces';
export const WORKSPACE_STORE_NAME = 'workspaces';
export const WORKSPACE_DB_VERSION = 1;

// Files database (per workspace)
export const STORE_NAME = 'files';
export const DB_VERSION = 1;

// Current workspace ID (from URL or default)
export function getWorkspaceName() {
  const params = new URLSearchParams(window.location.search);
  return params.get('workspaceName') || 'default';
}

export function getDBName(workspaceName = getWorkspaceName()) {
  return `lexius-files-${workspaceName}`;
}

export function getProjectName(workspaceName = getWorkspaceName()) {
  const params = new URLSearchParams(window.location.search);
  return params.get('projectName') || workspaceName;
}

// Singleton database connections (one per workspace)
const dbInstances = new Map();
const dbOpenPromises = new Map();

/**
 * Opens (or creates) the IndexedDB database for a workspace.
 * Reuses existing connection if already open.
 * @param {string} workspaceName - Workspace ID
 * @param {number} version - Database version (must be >= 1)
 * @returns {Promise<IDBDatabase>} Database instance
 */
export function openDB(workspaceName = getWorkspaceName(), version = DB_VERSION) {
  // Return existing connection if available
  if (dbInstances.has(workspaceName)) {
    return Promise.resolve(dbInstances.get(workspaceName));
  }

  // Return in-flight open promise if already opening
  if (dbOpenPromises.has(workspaceName)) {
    return dbOpenPromises.get(workspaceName);
  }

  const dbName = getDBName(workspaceName);
  
  const openPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'path' });
      }
    };

    request.onsuccess = () => {
      const dbInstance = request.result;

      // Verify store exists
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.close();
        indexedDB.deleteDatabase(dbName);
        reject(new Error(`Missing store "${STORE_NAME}". Database deleted. Please refresh.`));
        return;
      }

      // Handle unexpected version changes
      dbInstance.onversionchange = () => {
        dbInstance.close();
        dbInstances.delete(workspaceName);
        dbOpenPromises.delete(workspaceName);
        console.warn('Database version changed externally. Connection closed.');
      };

      dbInstances.set(workspaceName, dbInstance);
      resolve(dbInstance);
    };

    request.onerror = () => {
      dbOpenPromises.delete(workspaceName);
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn('Database open blocked. Close other tabs with this database.');
    };
  });

  dbOpenPromises.set(workspaceName, openPromise);
  return openPromise;
}

/**
 * Closes the database connection for a workspace.
 * @param {string} workspaceName - Workspace ID (optional, closes all if not provided)
 */
export function closeDB(workspaceName) {
  if (workspaceName) {
    const dbInstance = dbInstances.get(workspaceName);
    if (dbInstance) {
      dbInstance.close();
      dbInstances.delete(workspaceName);
      dbOpenPromises.delete(workspaceName);
    }
  } else {
    // Close all
    for (const [id, dbInstance] of dbInstances) {
      dbInstance.close();
    }
    dbInstances.clear();
    dbOpenPromises.clear();
  }
}

/**
 * Creates a transaction and returns the object store.
 * @param {'readonly' | 'readwrite'} mode - Transaction mode
 * @param {string} workspaceName - Workspace ID
 * @returns {Promise<IDBObjectStore>} Object store
 */
async function getStore(mode = 'readonly', workspaceName = getWorkspaceName()) {
  const db = await openDB(workspaceName);
  const tx = db.transaction(STORE_NAME, mode);
  return tx.objectStore(STORE_NAME);
}

/**
 * Saves a file to IndexedDB and optionally to Electron filesystem.
 * @param {string} path - File path (used as key)
 * @param {string} content - File content
 * @param {string} [filePath] - Absolute filesystem path (Electron only)
 * @param {string} [workspaceName] - Workspace ID
 * @returns {Promise<void>}
 */
export async function saveFile(path, content, filePath, workspaceName = getWorkspaceName()) {
  const store = await getStore('readwrite', workspaceName);
  
  return new Promise((resolve, reject) => {
    const request = store.put({ path, content });
    
    request.onsuccess = async () => {
      // Electron: also write to filesystem
      if (isElectron && filePath && fs) {
        try {
          await fs.promises.writeFile(filePath, content, 'utf8');
        } catch (err) {
          console.error('Failed to write to filesystem:', err);
          // Don't reject - IndexedDB save succeeded
        }
      }
      resolve();
    };
    
    request.onerror = () => reject(new Error('Save failed: ' + request.error?.message));
  });
}

/**
 * Retrieves a single file by path.
 * @param {string} path - File path
 * @param {string} [workspaceName] - Workspace ID
 * @returns {Promise<{path: string, content: string} | undefined>} File object or undefined
 */
export async function getFile(path, workspaceName = getWorkspaceName()) {
  const store = await getStore('readonly', workspaceName);
  
  return new Promise((resolve, reject) => {
    const request = store.get(path);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Get file failed: ' + request.error?.message));
  });
}

/**
 * Retrieves all files from the database.
 * @param {string} [workspaceName] - Workspace ID
 * @returns {Promise<Array<{path: string, content: string}>>} Array of file objects
 */
export async function getAllFiles(workspaceName = getWorkspaceName()) {
  const store = await getStore('readonly', workspaceName);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error('Get all files failed: ' + request.error?.message));
  });
}

/**
 * Deletes a file from the database.
 * @param {string} path - File path
 * @param {string} [workspaceName] - Workspace ID
 * @returns {Promise<void>}
 */
export async function deleteFile(path, workspaceName = getWorkspaceName()) {
  const store = await getStore('readwrite', workspaceName);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(path);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Delete failed: ' + request.error?.message));
  });
}

/**
 * Clears all files from the database.
 * @param {string} [workspaceName] - Workspace ID
 * @returns {Promise<void>}
 */
export async function clearAllFiles(workspaceName = getWorkspaceName()) {
  const store = await getStore('readwrite', workspaceName);
  
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Clear failed: ' + request.error?.message));
  });
}

/**
 * Checks if the database is empty.
 * @param {string} [workspaceName] - Workspace ID
 * @returns {Promise<boolean>} True if no files stored
 */
export async function isIndexedDBEmpty(workspaceName = getWorkspaceName()) {
  const store = await getStore('readonly', workspaceName);
  
  return new Promise((resolve, reject) => {
    const request = store.count();
    request.onsuccess = () => resolve(request.result === 0);
    request.onerror = () => reject(new Error('Count failed: ' + request.error?.message));
  });
}

/**
 * Gets the total number of files in the database.
 * @param {string} [workspaceName] - Workspace ID
 * @returns {Promise<number>} File count
 */
export async function getFileCount(workspaceName = getWorkspaceName()) {
  const store = await getStore('readonly', workspaceName);
  
  return new Promise((resolve, reject) => {
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Count failed: ' + request.error?.message));
  });
}

/**
 * Saves multiple files in a single transaction (batch operation).
 * @param {Array<{path: string, content: string}>} files - Array of file objects
 * @param {string} [workspaceName] - Workspace ID
 * @returns {Promise<void>}
 */
export async function saveFilesBatch(files, workspaceName = getWorkspaceName()) {
  const store = await getStore('readwrite', workspaceName);
  
  return new Promise((resolve, reject) => {
    const tx = store.transaction;
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error('Batch save failed: ' + tx.error?.message));
    
    for (const { path, content } of files) {
      store.put({ path, content });
    }
  });
}

/**
 * Deletes the files database for a workspace.
 * @param {string} [workspaceName] - Workspace ID (default: current)
 * @returns {Promise<void>}
 */
export async function deleteDatabase(workspaceName = getWorkspaceName()) {
  closeDB(workspaceName);
  const dbName = getDBName(workspaceName);
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Delete database failed: ' + request.error?.message));
    request.onblocked = () => console.warn('Database deletion blocked. Close other tabs.');
  });
}

// ========== WORKSPACE FUNCTIONS ==========

/**
 * Opens the workspace database.
 * @returns {Promise<IDBDatabase>} Workspace database instance
 */
async function openWorkspaceDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(WORKSPACE_DB_NAME, WORKSPACE_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(WORKSPACE_STORE_NAME)) {
        const store = db.createObjectStore(WORKSPACE_STORE_NAME, { keyPath: 'name' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Creates a new workspace.
 * @param {string} name - Workspace name
 * @returns {Promise<{id: number, name: string}>} Created workspace
 */
export async function createWorkspace(name) {
  const db = await openWorkspaceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKSPACE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(WORKSPACE_STORE_NAME);
    const request = store.add({ name, createdAt: Date.now() });
    request.onsuccess = () => resolve({ id: request.result, name });
    request.onerror = () => reject(new Error('Create workspace failed: ' + request.error?.message));
  });
}

/**
 * Gets all workspaces.
 * @returns {Promise<Array<{id: number, name: string, createdAt: number}>>} Array of workspaces
 */
export async function getAllWorkspaces() {
  const db = await openWorkspaceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKSPACE_STORE_NAME, 'readonly');
    const store = tx.objectStore(WORKSPACE_STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error('Get workspaces failed: ' + request.error?.message));
  });
}

/**
 * Gets a workspace by ID.
 * @param {number} id - Workspace ID
 * @returns {Promise<{id: number, name: string, createdAt: number} | undefined>} Workspace or undefined
 */
export async function getWorkspace(name) {
  const db = await openWorkspaceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKSPACE_STORE_NAME, 'readonly');
    const store = tx.objectStore(WORKSPACE_STORE_NAME);
    const request = store.get(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Get workspace failed: ' + request.error?.message));
  });
}

/**
 * Updates a workspace name.
 * @param {number} id - Workspace ID
 * @param {string} name - New name
 * @returns {Promise<void>}
 */
export async function renameWorkspace(id, name) {
  const db = await openWorkspaceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKSPACE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(WORKSPACE_STORE_NAME);
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const workspace = getRequest.result;
      if (!workspace) {
        reject(new Error('Workspace not found'));
        return;
      }
      workspace.name = name;
      const putRequest = store.put(workspace);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(new Error('Rename workspace failed: ' + putRequest.error?.message));
    };
    getRequest.onerror = () => reject(new Error('Get workspace failed: ' + getRequest.error?.message));
  });
}

/**
 * Deletes a workspace and its files database.
 * @param {number} id - Workspace ID
 * @returns {Promise<void>}
 */
export async function deleteWorkspace(name) {
  // First delete the files database
  const workspace = await getWorkspace(name);
  if (workspace) {
    await deleteDatabase(workspace.name);
  }
  
  // Then delete the workspace record
  const db = await openWorkspaceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKSPACE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(WORKSPACE_STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Delete workspace failed: ' + request.error?.message));
  });
}

/**
 * Switches to a workspace by updating URL and reloading.
 * @param {number} workspaceName - Workspace ID
 */
export function switchWorkspace(workspaceName) {
  const params = new URLSearchParams(window.location.search);
  params.set('workspaceName', workspaceName.toString());
  window.location.search = params.toString();
}

// Export singleton getter for advanced use cases
export function getDBInstance() {
  return dbInstance;
}