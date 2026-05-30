// Plant Diary — data layer
//   - メタデータ（植物・記録・バッジ・設定）: localStorage
//   - 写真の実体: IndexedDB（PhotoStore）に Blob で保存し、記録には ID だけを持たせる
// 写真を base64 で localStorage に積むと約5MBの上限をすぐ超える（QuotaExceededError）ため、
// 写真は別ストアに分離する。

const DB = (function () {
  const KEYS = {
    plants: 'pd_plants',
    entries: 'pd_entries',
    badges: 'pd_badges',
    settings: 'pd_settings',
  };

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  // 失敗を握りつぶさず throw する。容量超過などは呼び出し側で捕捉して画面に通知する。
  function store(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('localStorage write failed:', key, e);
      throw e;
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  const plants = {
    getAll() { return load(KEYS.plants); },
    get(id) { return load(KEYS.plants).find(p => p.id === id) || null; },
    save(plant) {
      const list = load(KEYS.plants);
      const now = new Date().toISOString();
      if (!plant.id) {
        plant = { ...plant, id: uid(), createdAt: now };
        list.push(plant);
      } else {
        const i = list.findIndex(p => p.id === plant.id);
        if (i >= 0) list[i] = { ...list[i], ...plant, updatedAt: now };
        else list.push({ ...plant, createdAt: now });
      }
      store(KEYS.plants, list);
      return plant;
    },
    setAll(list) { store(KEYS.plants, list); },
    delete(id) { store(KEYS.plants, load(KEYS.plants).filter(p => p.id !== id)); },
  };

  const entries = {
    getAll() { return load(KEYS.entries); },
    getByPlant(plantId) { return load(KEYS.entries).filter(e => e.plantId === plantId); },
    getByDate(plantId, date) {
      return load(KEYS.entries).find(e => e.plantId === plantId && e.date === date) || null;
    },
    save(entry) {
      const list = load(KEYS.entries);
      const now = new Date().toISOString();
      if (!entry.id) {
        entry = { ...entry, id: uid(), createdAt: now };
        list.push(entry);
      } else {
        const i = list.findIndex(e => e.id === entry.id);
        if (i >= 0) list[i] = { ...list[i], ...entry, updatedAt: now };
        else list.push({ ...entry, createdAt: now });
      }
      store(KEYS.entries, list);
      return entry;
    },
    setAll(list) { store(KEYS.entries, list); },
    delete(id) { store(KEYS.entries, load(KEYS.entries).filter(e => e.id !== id)); },
  };

  const badges = {
    getAll() { return load(KEYS.badges); },
    isUnlocked(type) { return !!load(KEYS.badges).find(b => b.type === type); },
    unlock(type) {
      if (this.isUnlocked(type)) return false;
      const list = load(KEYS.badges);
      list.push({ type, unlockedAt: new Date().toISOString() });
      store(KEYS.badges, list);
      return true;
    },
  };

  const settings = {
    get() {
      try { return JSON.parse(localStorage.getItem(KEYS.settings) || '{}'); } catch { return {}; }
    },
    save(s) { localStorage.setItem(KEYS.settings, JSON.stringify(s)); },
  };

  return { plants, entries, badges, settings, uid };
})();

// ─────────────────────────────────────────────────────────────
// PhotoStore — 写真の実体を IndexedDB に Blob で保存する
//   put(blob)   -> Promise<id>   保存して ID を返す（メモリキャッシュにも objectURL を作る）
//   remove(id)  -> Promise       削除（objectURL も解放）
//   hydrate()   -> Promise       全 Blob を読み込み objectURL キャッシュを作る（描画前に呼ぶ）
//   url(id)     -> string        <img src> 用の URL を同期で返す（legacy の data: もそのまま通す）
// ─────────────────────────────────────────────────────────────
const PhotoStore = (function () {
  const DB_NAME = 'pd_photos';
  const STORE = 'photos';
  let _db = null;
  const urlCache = new Map(); // id -> objectURL

  function open() {
    return new Promise((resolve, reject) => {
      if (_db) return resolve(_db);
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => { _db = req.result; resolve(_db); };
      req.onerror = () => reject(req.error);
    });
  }

  function reqP(request) {
    return new Promise((res, rej) => {
      request.onsuccess = () => res(request.result);
      request.onerror = () => rej(request.error);
    });
  }

  async function tx(mode) {
    const db = await open();
    return db.transaction(STORE, mode).objectStore(STORE);
  }

  async function put(blob) {
    const id = 'ph_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    const os = await tx('readwrite');
    await reqP(os.put(blob, id));
    try { urlCache.set(id, URL.createObjectURL(blob)); } catch {}
    return id;
  }

  async function getBlob(id) {
    const os = await tx('readonly');
    return reqP(os.get(id));
  }

  async function remove(id) {
    try {
      const os = await tx('readwrite');
      await reqP(os.delete(id));
    } catch (e) { console.warn('photo delete failed', e); }
    const u = urlCache.get(id);
    if (u) { URL.revokeObjectURL(u); urlCache.delete(id); }
  }

  // 全写真を読み込み、id -> objectURL のキャッシュを構築する。
  // getAllKeys と getAll を同一トランザクション内で同時発行しないと、
  // await ごとに tx が auto-commit されて TransactionInactiveError になる。
  async function hydrate() {
    try {
      const db = await open();
      await new Promise((resolve, reject) => {
        const t = db.transaction(STORE, 'readonly');
        const os = t.objectStore(STORE);
        const keysReq = os.getAllKeys();
        const valsReq = os.getAll();
        t.oncomplete = () => {
          const keys = keysReq.result || [];
          const vals = valsReq.result || [];
          keys.forEach((k, i) => {
            if (!urlCache.has(k) && vals[i]) {
              try { urlCache.set(k, URL.createObjectURL(vals[i])); } catch {}
            }
          });
          resolve();
        };
        t.onerror = () => reject(t.error);
      });
    } catch (e) { console.warn('photo hydrate failed', e); }
  }

  function url(id) {
    if (!id) return '';
    // 旧データ（base64 の data: URL）はそのまま使える
    if (typeof id === 'string' && id.startsWith('data:')) return id;
    return urlCache.get(id) || '';
  }

  function has(id) {
    if (!id) return false;
    if (typeof id === 'string' && id.startsWith('data:')) return true;
    return urlCache.has(id);
  }

  return { put, getBlob, remove, hydrate, url, has };
})();

if (typeof window !== 'undefined') window.PhotoStore = PhotoStore;
