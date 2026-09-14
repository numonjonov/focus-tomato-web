(function exportGamificationPanel(root) {
  const {
    getLevel,
    getLevelProgress,
    getTodaySessions,
    updateStreak,
    formatDateKey
  } = root.FocusForgeCore;

  let elements = {};
  let lastLevel = null;

  function bindElements() {
    for (const element of document.querySelectorAll('[id]')) {
      elements[element.id] = element;
    }
  }

  function init() {
    bindElements();

    let data = root.FocusForgeStorage.loadData();
    const today = formatDateKey(new Date());
    const nextStats = updateStreak(data.stats, data.sessions, today);
    if (JSON.stringify(nextStats) !== JSON.stringify(data.stats)) {
      data.stats = nextStats;
      data = root.FocusForgeStorage.saveData(data);
    }

    lastLevel = getLevel(data.stats.totalXP).level;
    render(data);
  }

  function refresh() {
    render(root.FocusForgeStorage.loadData());
  }

  function render(data) {
    const today = formatDateKey(new Date());
    const level = getLevel(data.stats.totalXP);
    const progress = getLevelProgress(data.stats.totalXP);
    const todaySessions = getTodaySessions(data.sessions, today);

    elements.levelNumber.textContent = `Lvl ${level.level}`;
    elements.levelName.textContent = level.name;
    elements.streakText.textContent = `🔥 ${data.stats.currentStreak} дней`;
    elements.todaySessionsText.textContent = `Сессий сегодня: ${todaySessions.length}`;
    elements.totalXPText.textContent = `Всего XP: ${data.stats.totalXP}`;

    if (progress.required === 0) {
      elements.xpBarFill.style.width = '100%';
      elements.xpProgressText.textContent = 'Максимальный уровень';
    } else {
      elements.xpBarFill.style.width = `${Math.min(100, (progress.current / progress.required) * 100)}%`;
      elements.xpProgressText.textContent = `${progress.current} / ${progress.required} XP до Lvl ${progress.nextLevel}`;
    }

    if (lastLevel !== null && level.level > lastLevel) {
      showLevelUp(level.name);
    }
    lastLevel = level.level;
  }

  function showLevelUp(levelName) {
    elements.levelUpText.textContent = `Level Up! ${levelName} 🎉`;
    elements.levelUpOverlay.classList.remove('hidden');
    const confettiInstance = root.confetti?.create(elements.confettiCanvas, { resize: true });
    confettiInstance?.({
      particleCount: 140,
      spread: 75,
      origin: { y: 0.55 }
    });
    setTimeout(() => elements.levelUpOverlay.classList.add('hidden'), 2000);
  }

  root.FocusForgeGamification = { init, refresh };
})(window);
