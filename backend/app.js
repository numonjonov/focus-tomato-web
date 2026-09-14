const path = require('node:path');
const express = require('express');
const { createDb } = require('./db');
const { isValidEmail } = require('./validateEmail');

const DEFAULT_FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// createApp — фабрика, а не singleton, чтобы тесты могли поднимать приложение
// на временной БД для каждого теста (по аналогии с createDataStore в Electron-проекте).
function createApp({ dbPath, frontendDir = DEFAULT_FRONTEND_DIR } = {}) {
  const app = express();
  const db = createDb(dbPath);

  app.use(express.json());
  app.use(express.static(frontendDir, { index: 'index.html' }));

  app.post('/api/subscribe', (req, res) => {
    const email = req.body && req.body.email;

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Введите корректный email адрес.' });
      return;
    }

    db.insertSubscriber(email);
    res.json({ success: true });
  });

  // Битый JSON в теле запроса — тоже понятная 400, а не дефолтная 500 от Express.
  app.use((err, req, res, next) => {
    if (err && err.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Некорректный формат запроса.' });
      return;
    }
    next(err);
  });

  return { app, close: () => db.close() };
}

module.exports = { createApp };
