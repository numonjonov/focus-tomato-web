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
    document.addEventListener('focusforge:langchange', refresh);

    let data = root.FocusForgeStorage.loadData();
    const today = formatDateKey(new Date());
    // updateStreak — no-op, если lastActiveDate уже сегодня; сохраняем только
    // когда день действительно сменился, чтобы не писать в localStorage зря.
    if (data.stats.lastActiveDate !== today) {
      data.stats = updateStreak(data.stats, data.sessions, today);
      data = root.FocusForgeStorage.saveData(data);
    }

    lastLevel = getLevel(data.stats.totalXP).level;
    render(data, today);
  }

  function refresh() {
    render(root.FocusForgeStorage.loadData(), formatDateKey(new Date()));
  }

  function render(data, today) {
    const { t, tFormat } = root.FocusForgeI18n;
    const level = getLevel(data.stats.totalXP);
    const progress = getLevelProgress(data.stats.totalXP);
    const todaySessions = getTodaySessions(data.sessions, today);
    const levelName = t(`level_name_${level.level}`);

    elements.levelNumber.textContent = `Lvl ${level.level}`;
    elements.levelName.textContent = levelName;
    elements.streakText.textContent = tFormat('stats_streak', { count: data.stats.currentStreak });
    elements.todaySessionsText.textContent = tFormat('stats_sessions_today', { count: todaySessions.length });
    elements.totalXPText.textContent = tFormat('stats_total_xp', { count: data.stats.totalXP });

    if (progress.required === 0) {
      elements.xpBarFill.style.width = '100%';
      elements.xpProgressText.textContent = t('stats_max_level');
    } else {
      elements.xpBarFill.style.width = `${Math.min(100, (progress.current / progress.required) * 100)}%`;
      elements.xpProgressText.textContent = tFormat('stats_xp_to_next', {
        current: progress.current,
        required: progress.required,
        next: progress.nextLevel
      });
    }

    if (lastLevel !== null && level.level > lastLevel) {
      showLevelUp(levelName);
    }
    lastLevel = level.level;
  }

  function showLevelUp(levelName) {
    elements.levelUpText.textContent = root.FocusForgeI18n.tFormat('level_up_text', { name: levelName });
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
