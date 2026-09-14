document.addEventListener('DOMContentLoaded', () => {
  // i18n.init() первым — применяет сохранённый/автоопределённый язык и вешает
  // обработчики переключателя до того, как остальные панели отрендерят текст.
  window.FocusForgeI18n.init();
  // Порядок важен: gamification.init() первым фиксирует стартовый уровень
  // (lastLevel) — timer/tasksPanel зовут FocusForgeGamification.refresh()
  // после своих изменений, и level-up должен определяться от этой точки.
  window.FocusForgeGamification.init();
  window.FocusForgeTimer.init();
  window.FocusForgeTasksPanel.init();
  window.FocusForgeHistoryPanel.init();
  window.FocusForgeSettingsPanel.init();
  window.FocusForgeSubscribe.init();
});
