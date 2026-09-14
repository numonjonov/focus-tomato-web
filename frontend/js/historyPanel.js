(function exportHistoryPanel(root) {
  const { getHistoryDays } = root.FocusForgeHistory;
  const { formatDateKey } = root.FocusForgeCore;

  const HISTORY_DAYS = 14;

  let elements = {};

  function bindElements() {
    for (const element of document.querySelectorAll('[id]')) {
      elements[element.id] = element;
    }
  }

  function init() {
    bindElements();
    elements.openHistoryButton.addEventListener('click', openHistory);
    elements.historyCloseButton.addEventListener('click', closeHistory);
    document.addEventListener('focusforge:langchange', () => {
      if (!elements.historyOverlay.classList.contains('hidden')) {
        renderHistory();
      }
    });
  }

  function openHistory() {
    renderHistory();
    elements.historyOverlay.classList.remove('hidden');
  }

  function closeHistory() {
    elements.historyOverlay.classList.add('hidden');
  }

  function renderHistory() {
    const data = root.FocusForgeStorage.loadData();
    const today = formatDateKey(new Date());
    const days = getHistoryDays(data.tasks, data.sessions, today, HISTORY_DAYS).reverse();

    elements.historyBody.innerHTML = '';
    for (const day of days) {
      elements.historyBody.appendChild(buildHistoryRow(day));
    }
  }

  function buildHistoryRow(day) {
    const { tFormat } = root.FocusForgeI18n;
    const row = document.createElement('div');
    row.className = 'history-row';
    row.innerHTML = `
      <span class="history-row-date">${formatHistoryDate(day.date)}</span>
      <span class="history-row-meta">${tFormat('history_row', { closed: day.closed, total: day.total, pomodoros: day.pomodoros, xp: day.xp })}</span>
    `;
    return row;
  }

  function formatHistoryDate(dateKey) {
    const date = new Date(`${dateKey}T12:00:00`);
    return root.FocusForgeI18n.formatHistoryDate(date);
  }

  root.FocusForgeHistoryPanel = { init };
})(window);
