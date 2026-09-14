document.addEventListener('DOMContentLoaded', () => {
  // Порядок важен: gamification.init() первым фиксирует стартовый уровень
  // (lastLevel) — timer/tasksPanel зовут FocusForgeGamification.refresh()
  // после своих изменений, и level-up должен определяться от этой точки.
  window.FocusForgeGamification.init();
  window.FocusForgeTimer.init();
  window.FocusForgeTasksPanel.init();
  window.FocusForgeHistoryPanel.init();
});
