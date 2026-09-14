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

Текст интерфейса пока только на русском. Геймификация (XP-бар/уровень/стрик на экране), история дней, переключатель языка RU/UZ и `backend/` — в следующих тикетах.

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
  js/
    storage.js       — чтение/запись состояния в localStorage
    gamification.js  — symlink → ../../src/core/gamification.js
    tasks.js          — symlink → ../../src/renderer/tasks.js
    timer.js          — логика Pomodoro-таймера
    tasksPanel.js      — UI задач: рендер, ввод, drag-and-drop, табы
    app.js             — bootstrap
```
