// Stockage local : réglages dans localStorage, photo dans IndexedDB.
// Tout peut échouer (navigation privée, iframe restreinte) : chaque accès est protégé.

export const store = {
  get(key) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return null;
    }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* stockage indisponible */ }
  },
};

function openDb() {
  return new Promise((resolve, reject) => {
    let rq;
    try { rq = indexedDB.open('minitel-escape', 1); } catch (e) { reject(e); return; }
    rq.onupgradeneeded = () => rq.result.createObjectStore('files');
    rq.onsuccess = () => resolve(rq.result);
    rq.onerror = () => reject(rq.error);
  });
}

async function run(mode, fn) {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('files', mode);
      const rq = fn(tx.objectStore('files'));
      tx.oncomplete = () => resolve(rq ? rq.result : undefined);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    return null;
  }
}

export const files = {
  get: key => run('readonly', st => st.get(key)),
  put: (key, value) => run('readwrite', st => st.put(value, key)),
  del: key => run('readwrite', st => st.delete(key)),
};
