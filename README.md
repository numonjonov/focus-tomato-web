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

Готово (тикет 04 — «История по дням»):

- `src/renderer/history.js` перенесён из `focus-tomato` без переписывания логики (UMD-модуль, `aggregateDayStats`/`getHistoryDays`); `frontend/js/history.js` — symlink на него, как и для остальных core-модулей.
- Кнопка «История» в карточке таймера открывает оверлей (`frontend/js/historyPanel.js`) со списком последних 14 дней: для каждого дня — закрытые/всего задач, число помидоров, заработанный XP. Дни без активности показывают нули, а не пропадают из списка.
- Оверлей закрывается кнопкой ✕ без потери состояния страницы (задачи/таймер/статы не перерисовываются заново).

Готово (тикет 06 — «Google Analytics»):

- В `<head>` `frontend/index.html` подключён стандартный сниппет GA4 (`gtag.js`) с placeholder-идентификатором `G-XXXXXXXXXX` — перед деплоем в продакшен замените его на реальный GA4 ID (константа `GA4_MEASUREMENT_ID` и `src` скрипта в `index.html`).

Готово (тикет 05 — «Email-подписка и бэкенд»):

- `backend/` — Node.js + Express-приложение: отдаёт статику `frontend/` и принимает email-подписки.
- `POST /api/subscribe` принимает `{ email }`, валидирует формат на сервере (`backend/validateEmail.js`), пишет в SQLite-таблицу `subscribers (id, email, created_at)` через встроенный `node:sqlite` (`backend/db.js`) — без внешнего драйвера. Уникальное ограничение на `email` (после нормализации в нижний регистр) — повторная отправка не создаёт дубликат и не возвращает ошибку. Невалидный email — `400` с сообщением `{ error }`.
- В hero-секции лендинга (`frontend/index.html`) — форма email; `frontend/js/subscribePanel.js` шлёт `POST /api/subscribe` через `fetch` и показывает подтверждение или ошибку под формой.
- Бэкенд не хранит и не принимает данные таймера/задач/XP — только email.

Готово (тикет 07 — «Языковой переключатель RU/UZ»):

- `frontend/js/i18n.js` — словарь переводов (RU/UZ, один ключ на строку интерфейса) и функции `applyLanguage`/`setLanguage`/`t`/`tFormat`. Видимый текст размечен атрибутами `data-i18n` / `data-i18n-placeholder` / `data-i18n-aria-label` / `data-i18n-content` в `frontend/index.html`; текст, генерируемый в JS (тексты табов со счётчиками, модалка завершения помидора, статы/уровень, строки истории, сообщения формы email), берётся из словаря через `t()`/`tFormat()` в соответствующих панелях и пересчитывается по событию `focusforge:langchange`.
- Переключатель RU/UZ — в hero-секции. Выбор языка сохраняется в `localStorage` (`focusforge:lang`) и применяется без перезагрузки страницы. При первом визите (нет сохранённого выбора) язык определяется по `navigator.language`: `uz-*` → узбекский, всё остальное — русский.
- Названия месяца/дня недели в истории форматируются вручную из словаря, а не через `Intl.DateTimeFormat` с локалью `uz` — в части браузеров для нестандартных локалей нет данных ICU, и `Intl` отдаёт нечитаемый фолбэк вместо названий.
- `tests/i18n.test.js` проверяет, что у каждого ключа словаря есть перевод и на `ru`, и на `uz`.

## Запуск бэкенда локально

Бэкенд отдаёт `frontend/` сам — отдельный файловый сервер больше не нужен.

```bash
npm install
npm start
```

Открыть `http://localhost:3000/`. Порт настраивается переменной окружения `PORT` (по умолчанию `3000`).

SQLite-файл с подписками создаётся автоматически в `backend/data/subscribers.sqlite` (путь настраивается через `DB_PATH` или `DB_DIR`; директория и файл не коммитятся — см. `.gitignore`).

## Тесты

Юнит-тесты для перенесённых core-модулей и бэкенда (`node:test`, без внешних тестовых зависимостей):

```bash
npm test
```

## Структура

```
src/
  core/gamification.js      — XP, уровни, стрик (UMD, источник правды)
  renderer/tasks.js         — парсинг ввода задач, createTask/toggleTask/reorderTasks (UMD)
  renderer/history.js       — агрегация метрик по дням, aggregateDayStats/getHistoryDays (UMD)
tests/
  gamification.test.js
  tasks.test.js
  history.test.js
  subscribe.test.js
frontend/
  index.html
  css/styles.css
  vendor/confetti.browser.js — локальная копия canvas-confetti для анимации level-up
  js/
    storage.js           — чтение/запись состояния в localStorage
    gamification.js      — symlink → ../../src/core/gamification.js
    tasks.js              — symlink → ../../src/renderer/tasks.js
    history.js             — symlink → ../../src/renderer/history.js
    timer.js               — логика Pomodoro-таймера
    tasksPanel.js           — UI задач: рендер, ввод, drag-and-drop, табы
    gamificationPanel.js   — блок уровня/XP/стрика, конфетти на level-up
    historyPanel.js         — оверлей истории по дням
    subscribePanel.js       — форма email в hero, POST /api/subscribe
    app.js                  — bootstrap
backend/
  app.js         — createApp({ dbPath, frontendDir }): статика + POST /api/subscribe
  server.js       — entrypoint (PORT/DB_PATH из env), npm start
  db.js            — SQLite через встроенный node:sqlite, таблица subscribers
  validateEmail.js — серверная валидация формата email
```
