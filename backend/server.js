const path = require('node:path');
const fs = require('node:fs');
const { createApp } = require('./app');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DB_DIR || path.join(__dirname, 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'subscribers.sqlite');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const { app } = createApp({ dbPath: DB_PATH });

app.listen(PORT, () => {
  console.log(`FocusForge Web слушает на http://localhost:${PORT} (БД: ${DB_PATH})`);
});
