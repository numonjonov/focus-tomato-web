(function exportTimer(root) {
  const TIMER_RADIUS = 96;
  const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

  // Звук завершения помидора — портировано из focus-tomato/src/app.js
  // (ensureAudioReady/playBeep/playBellNote), только для mode === 'work',
  // как того требует тикет 10.
  const WORK_END_NOTES = [523.25, 659.25, 783.99];
  const NOTE_STRIDE_SECONDS = 0.22;
  const NOTE_DECAY_SECONDS = 0.85;
  const NOTE_PEAK_GAIN = 0.95;
  const CHIME_REPEAT_COUNT = 3;
  const CHIME_REPEAT_GAP_SECONDS = 0.3;

  let data = null;
  let elements = {};
  let intervalId = null;
  let mode = 'work';
  let isRunning = false;
  let remainingSeconds = 25 * 60;
  let endTime = 0;
  let audioContext = null;
  let audioCompressor = null;

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
    document.addEventListener('focusforge:langchange', renderTimer);
    document.addEventListener('focusforge:settingschange', onSettingsChange);

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
    ensureAudioReady();
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
      playBeep();
      recordPomodoroSession();
      renderSessionsCount();
      root.FocusForgeGamification.refresh();
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

  // frontend/js/settingsPanel.js сохраняет новую длительность в localStorage
  // и шлёт это событие сразу по клику на сегмент. Если таймер сейчас идёт,
  // текущий отсчёт не трогаем — только подтягиваем свежие settings, чтобы
  // следующий вызов getModeDurationSeconds() (после финиша помидора/отдыха)
  // взял уже новое значение. Если таймер стоит — применяем сразу, как и
  // в исходном Electron-приложении (см. saveSettings() в focus-tomato/src/app.js).
  function onSettingsChange() {
    data = root.FocusForgeStorage.loadData();
    if (!isRunning) {
      remainingSeconds = getModeDurationSeconds();
      renderTimer();
    }
  }

  function renderTimer() {
    const { t } = root.FocusForgeI18n;
    elements.timerTime.textContent = formatTimer(remainingSeconds);
    elements.startPauseButton.textContent = isRunning ? t('timer_pause') : t('timer_start');
    elements.modeText.textContent = mode === 'work' ? t('timer_mode_focus') : t('mode_break');
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

  function ensureAudioReady() {
    try {
      if (!audioContext) {
        const AudioContextCtor = root.AudioContext || root.webkitAudioContext;
        if (!AudioContextCtor) {
          return;
        }
        audioContext = new AudioContextCtor();
        audioCompressor = audioContext.createDynamicsCompressor();
        audioCompressor.threshold.value = -10;
        audioCompressor.knee.value = 8;
        audioCompressor.ratio.value = 4;
        audioCompressor.attack.value = 0.003;
        audioCompressor.release.value = 0.1;
        audioCompressor.connect(audioContext.destination);
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (error) {
      // Web Audio API недоступен/заблокирован политикой автовоспроизведения —
      // таймер и модалка должны продолжать работать без звука.
    }
  }

  function playBeep() {
    try {
      if (!audioContext || !audioCompressor) {
        return;
      }
      const cycleDuration = WORK_END_NOTES.length * NOTE_STRIDE_SECONDS + CHIME_REPEAT_GAP_SECONDS;
      for (let cycle = 0; cycle < CHIME_REPEAT_COUNT; cycle += 1) {
        const cycleStart = audioContext.currentTime + cycle * cycleDuration;
        for (let index = 0; index < WORK_END_NOTES.length; index += 1) {
          playBellNote(WORK_END_NOTES[index], cycleStart + index * NOTE_STRIDE_SECONDS);
        }
      }
    } catch (error) {
      // См. ensureAudioReady — звук не должен ронять завершение помидора.
    }
  }

  function playBellNote(frequency, startAt) {
    const fundamental = audioContext.createOscillator();
    const overtone = audioContext.createOscillator();
    const fundamentalGain = audioContext.createGain();
    const overtoneGain = audioContext.createGain();
    const envelope = audioContext.createGain();

    fundamental.type = 'sine';
    overtone.type = 'sine';
    fundamental.frequency.value = frequency;
    overtone.frequency.value = frequency * 2;
    fundamentalGain.gain.value = 0.75;
    overtoneGain.gain.value = 0.25;

    fundamental.connect(fundamentalGain).connect(envelope);
    overtone.connect(overtoneGain).connect(envelope);
    envelope.connect(audioCompressor);

    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(NOTE_PEAK_GAIN, startAt + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + NOTE_DECAY_SECONDS);

    fundamental.start(startAt);
    overtone.start(startAt);
    fundamental.stop(startAt + NOTE_DECAY_SECONDS + 0.05);
    overtone.stop(startAt + NOTE_DECAY_SECONDS + 0.05);
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
