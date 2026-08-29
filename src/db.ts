import type { Ledger } from './types';

const DB_NAME = 'matchbox-ledger';
const DEMO_DB_NAME = 'demo:matchbox-ledger';
const STORE = 'workspace';
const KEY = 'current';

export const emptyLedger = (): Ledger => ({ invoices: [], transactions: [], matches: [], updatedAt: new Date().toISOString() });

function openDb(demo = false): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(demo ? DEMO_DB_NAME : DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadLedger(demo = false): Promise<Ledger> {
  const db = await openDb(demo);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve(request.result ?? emptyLedger());
    request.onerror = () => reject(request.error);
  });
}

export async function saveLedger(ledger: Ledger, demo = false): Promise<void> {
  const db = await openDb(demo);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put({ ...ledger, updatedAt: new Date().toISOString() }, KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function clearLedger(demo = false): Promise<void> {
  const db = await openDb(demo);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete(KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
