(function exportSettingsPanel(root) {
  // Те же варианты длительности, что и в сегментированном выборе macOS-приложения
  // (`WORK_DURATIONS`/`BREAK_DURATIONS` в focus-tomato/src/app.js).
  const WORK_DURATIONS = [15, 25, 45];
  const BREAK_DURATIONS = [5, 10, 15];

  let elements = {};

  function bindElements() {
    for (const element of document.querySelectorAll('[id]')) {
      elements[element.id] = element;
    }
  }

  function init() {
    bindElements();
    elements.settingsButton.addEventListener('click', openSettings);
    elements.settingsCloseButton.addEventListener('click', closeSettings);
    document.addEventListener('focusforge:langchange', () => {
      if (!elements.settingsOverlay.classList.contains('hidden')) {
        render();
      }
    });
  }

  function openSettings() {
    render();
    elements.settingsOverlay.classList.remove('hidden');
  }

  function closeSettings() {
    elements.settingsOverlay.classList.add('hidden');
  }

  function render() {
    const data = root.FocusForgeStorage.loadData();
    renderSegment(elements.workDurationOptions, WORK_DURATIONS, data.settings.workDuration, (value) => {
      selectDuration('workDuration', value);
    });
    renderSegment(elements.breakDurationOptions, BREAK_DURATIONS, data.settings.breakDuration, (value) => {
      selectDuration('breakDuration', value);
    });
  }

  function renderSegment(container, values, selectedValue, onSelect) {
    const { tFormat } = root.FocusForgeI18n;
    container.innerHTML = '';
    for (const value of values) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `mode-toggle-btn ${value === selectedValue ? 'is-active' : ''}`;
      button.textContent = tFormat('duration_minutes', { count: value });
      button.addEventListener('click', () => onSelect(value));
      container.appendChild(button);
    }
  }

  // Значение сохраняется сразу по клику на вариант — без отдельной кнопки
  // «Сохранить», как и остальные действия в этом веб-приложении (отметка
  // задачи, смена языка). Таймер (frontend/js/timer.js) слушает это событие
  // сам и решает, применять ли новое значение немедленно или дождаться
  // следующей сессии — см. onSettingsChange там же.
  function selectDuration(key, value) {
    const data = root.FocusForgeStorage.loadData();
    data.settings[key] = value;
    root.FocusForgeStorage.saveData(data);
    render();
    document.dispatchEvent(new CustomEvent('focusforge:settingschange'));
  }

  root.FocusForgeSettingsPanel = { init };
})(window);
