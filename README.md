# FocusForge Web

Веб-версия FocusForge — Pomodoro-таймер с задачами и геймификацией, лендинг на русском/узбекском.

Разработка ведётся по тикетам из `focus-tomato/.scratch/web-landing/`.

## Статус

Готово (тикет 01 — «Каркас лендинга и рабочий таймер»):

- `frontend/` — статический лендинг без сборщика (hero, секция фич, рабочий Pomodoro-таймер).
- Таймер: кольцевой прогресс, старт/пауза/сброс, режимы «Работа»/«Отдых», модалка по завершении помидора.
- Завершённая рабочая сессия сохраняется в `localStorage` в форме, совместимой со схемой `{ sessions, tasks, stats, settings }` из macOS-приложения.

Готово (тикет 02 — «Задачи: ввод, отметка, drag-and-drop»):

- `src/core/gamification.js` и `src/renderer/tasks.js` перенесены из `focus-tomato` без переписывания логики (UMD-модули, тот же контракт); `frontend/js/gamification.js` и `frontend/js/tasks.js` — символические ссылки на них, чтобы модули оставались источником правды и для тестов, и для браузера.
- Массовый ввод задач текстом (маркеры `-`/`[ ]` срезаются), инлайн-добавление по одной (Enter), отметка выполнено/не выполнено с начислением/списанием XP (`applyTaskToggleXP`), drag-and-drop переупорядочивание, табы «Задачи»/«Сделано» со счётчиками.
- Список задач и их порядок хранятся в `localStorage`, переживают перезагрузку страницы.
- Названия задач экранируются (`escapeHTML`) перед вставкой в разметку.
- Видимого XP-бара/уровня пока нет (следующий тикет) — XP-состояние можно проверить в консоли через `FocusForgeStorage.loadData().stats.totalXP`.

Готово (тикет 03 — «Геймификация: уровень, XP-бар, стрик, конфетти»):

- Блок статов рядом с задачами: текущий уровень и его название (`getLevel`), прогресс-бар XP до следующего уровня (`getLevelProgress`), стрик дней подряд и счётчик сессий за сегодня (`getTodaySessions`).
- Стрик пересчитывается через `updateStreak`/`PRODUCTIVE_DAY_SESSIONS` при загрузке страницы (сравнение `lastActiveDate` с сегодняшней датой) — источник истины та же `src/core/gamification.js`, без переписывания. Если вкладка остаётся открытой через полночь, пересчёт произойдёт только при следующей перезагрузке страницы, а не «на лету».
- `frontend/js/gamificationPanel.js` — единая точка рендера блока статов; вызывается из `tasksPanel.js` (после любого изменения XP по задачам) и из `timer.js` (после завершения помидора), отслеживает переход через границу уровня и при пересечении показывает анимацию конфетти (`frontend/vendor/confetti.browser.js`, локальная копия, без npm-зависимости) на 2 секунды.
- Завершение помидора само по себе XP не начисляет — как и в текущей версии macOS-приложения (`src/app.js`/`src/core/gamification.js`): XP даёт только отметка задач (`applyTaskToggleXP`, 25 XP за задачу). Поле `session.xp` сохраняется в сессии для совместимости схемы, но остаётся 0.

Текст интерфейса пока только на русском. История дней, переключатель языка RU/UZ и `backend/` — в следующих тикетах.

## Запуск фронтенда локально

Статические файлы, сборщик не нужен — достаточно любого файлового HTTP-сервера:

```bash
cd frontend
python3 -m http.server 8123
```

Открыть `http://localhost:8123/index.html`.

## Тесты

Юнит-тесты для перенесённых core-модулей (`node:test`, без внешних зависимостей):

```bash
npm test
```

## Структура

```
src/
  core/gamification.js      — XP, уровни, стрик (UMD, источник правды)
  renderer/tasks.js         — парсинг ввода задач, createTask/toggleTask/reorderTasks (UMD)
tests/
  gamification.test.js
  tasks.test.js
frontend/
  index.html
  css/styles.css
  vendor/confetti.browser.js — локальная копия canvas-confetti для анимации level-up
  js/
    storage.js           — чтение/запись состояния в localStorage
    gamification.js      — symlink → ../../src/core/gamification.js
    tasks.js              — symlink → ../../src/renderer/tasks.js
    timer.js               — логика Pomodoro-таймера
    tasksPanel.js           — UI задач: рендер, ввод, drag-and-drop, табы
    gamificationPanel.js   — блок уровня/XP/стрика, конфетти на level-up
    app.js                  — bootstrap
```
