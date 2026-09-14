(function exportTimer(root) {
  const TIMER_RADIUS = 96;
  const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

  let data = null;
  let elements = {};
  let intervalId = null;
  let mode = 'work';
  let isRunning = false;
  let remainingSeconds = 25 * 60;
  let endTime = 0;

  function bindElements() {
    for (const element of document.querySelectorAll('[id]')) {
      elements[element.id] = element;
    }
    elements.timerProgress.style.strokeDasharray = String(TIMER_CIRCUMFERENCE);
  }

  function init() {
    data = root.FocusForgeStorage.loadData();
    bindElements();

    elements.startPauseButton.addEventListener('click', toggleTimer);
    elements.resetButton.addEventListener('click', resetTimer);
    elements.workModeButton.addEventListener('click', () => switchMode('work'));
    elements.breakModeButton.addEventListener('click', () => switchMode('break'));
    elements.pomodoroAgainButton.addEventListener('click', onPomodoroAgain);
    elements.pomodoroBreakButton.addEventListener('click', onPomodoroBreak);

    resetTimer();
    renderSessionsCount();
  }

  function toggleTimer() {
    if (isRunning) {
      pauseTimer();
      return;
    }
    startTimer();
  }

  function startTimer() {
    if (isRunning) {
      return;
    }
    isRunning = true;
    endTime = Date.now() + remainingSeconds * 1000;
    intervalId = setInterval(tickTimer, 1000);
    renderTimer();
  }

  function pauseTimer() {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    endTime = 0;
    renderTimer();
  }

  function resetTimer() {
    pauseTimer();
    remainingSeconds = getModeDurationSeconds();
    renderTimer();
  }

  function switchMode(nextMode) {
    if (nextMode === mode) {
      return;
    }
    pauseTimer();
    mode = nextMode;
    remainingSeconds = getModeDurationSeconds();
    renderTimer();
  }

  function tickTimer() {
    if (!isRunning) {
      return;
    }
    remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    renderTimer();

    if (remainingSeconds === 0) {
      finishCurrentMode();
    }
  }

  function finishCurrentMode() {
    pauseTimer();

    if (mode === 'work') {
      recordPomodoroSession();
      renderSessionsCount();
      showModal();
      return;
    }

    mode = 'work';
    remainingSeconds = getModeDurationSeconds();
    renderTimer();
  }

  function recordPomodoroSession() {
    // Перечитываем актуальные данные перед записью: к этому моменту задачи
    // (frontend/js/tasksPanel.js) могли уже сохранить в localStorage свои
    // изменения, а `data` здесь может быть их более старым снимком с init().
    const latest = root.FocusForgeStorage.loadData();
    latest.sessions.unshift({
      date: getTodayDateKey(),
      time: getCurrentTimeLabel(),
      xp: 0
    });
    data = root.FocusForgeStorage.saveData(latest);
  }

  function onPomodoroAgain() {
    hideModal();
    mode = 'work';
    remainingSeconds = getModeDurationSeconds();
    renderTimer();
    startTimer();
  }

  function onPomodoroBreak() {
    hideModal();
    mode = 'break';
    remainingSeconds = getModeDurationSeconds();
    startTimer();
  }

  function renderTimer() {
    elements.timerTime.textContent = formatTimer(remainingSeconds);
    elements.startPauseButton.textContent = isRunning ? 'Пауза' : 'Старт';
    elements.modeText.textContent = mode === 'work' ? 'Фокус' : 'Отдых';
    elements.workModeButton.classList.toggle('is-active', mode === 'work');
    elements.breakModeButton.classList.toggle('is-active', mode === 'break');
    elements.timerProgress.classList.toggle('is-break', mode === 'break');

    const progress = remainingSeconds / getModeDurationSeconds();
    elements.timerProgress.style.strokeDashoffset = String(TIMER_CIRCUMFERENCE * (1 - progress));
  }

  function renderSessionsCount() {
    const today = getTodayDateKey();
    const count = data.sessions.filter((session) => session.date === today).length;
    elements.todaySessionsCount.textContent = String(count);
  }

  function showModal() {
    elements.pomodoroDoneModal.classList.remove('hidden');
  }

  function hideModal() {
    elements.pomodoroDoneModal.classList.add('hidden');
  }

  function getModeDurationSeconds() {
    const minutes = mode === 'work' ? data.settings.workDuration : data.settings.breakDuration;
    return minutes * 60;
  }

  function formatTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const restSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`;
  }

  function getTodayDateKey() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getCurrentTimeLabel() {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());
  }

  root.FocusForgeTimer = { init };
})(window);
