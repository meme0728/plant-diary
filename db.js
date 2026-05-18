// Plant Diary — localStorage data layer (no JSX)
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

  function store(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch (e) { console.warn('Storage full:', e); }
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
