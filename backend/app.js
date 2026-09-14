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

  app.close = () => db.close();

  return app;
}

module.exports = { createApp };
