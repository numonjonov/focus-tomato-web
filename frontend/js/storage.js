/**
 * Локальное хранилище состояния пользователя (localStorage), по аналогии со
 * схемой src/main/dataStore.js исходного Electron-приложения FocusForge:
 * { sessions, tasks, stats, settings }. Без слоя IPC/файловой системы —
 * читается и пишется напрямую из localStorage.
 */
(function exportStorage(root) {
  const STORAGE_KEY = 'focusforge:data';

  function createDefaultData() {
    return {
      sessions: [],
      tasks: [],
      stats: {
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        bestStreak: 0,
        lastActiveDate: ''
      },
      settings: {
        workDuration: 25,
        breakDuration: 5
      }
    };
  }

  function mergeWithDefaults(data) {
    const defaults = createDefaultData();
    const safeData = data && typeof data === 'object' ? data : {};
    return {
      ...defaults,
      ...safeData,
      sessions: Array.isArray(safeData.sessions) ? safeData.sessions : [],
      tasks: Array.isArray(safeData.tasks) ? safeData.tasks : [],
      stats: { ...defaults.stats, ...(safeData.stats || {}) },
      settings: { ...defaults.settings, ...(safeData.settings || {}) }
    };
  }

  function loadData() {
    let raw = null;
    try {
      raw = root.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('FocusForge: localStorage недоступен', error);
      return createDefaultData();
    }

    if (!raw) {
      const fresh = createDefaultData();
      saveData(fresh);
      return fresh;
    }

    try {
      return mergeWithDefaults(JSON.parse(raw));
    } catch (error) {
      console.error('FocusForge: не удалось разобрать данные из localStorage', error);
      return createDefaultData();
    }
  }

  function saveData(data) {
    const normalized = mergeWithDefaults(data);
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      console.error('FocusForge: не удалось сохранить данные в localStorage', error);
    }
    return normalized;
  }

  root.FocusForgeStorage = {
    STORAGE_KEY,
    createDefaultData,
    mergeWithDefaults,
    loadData,
    saveData
  };
})(window);
