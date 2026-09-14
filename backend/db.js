const { DatabaseSync } = require('node:sqlite');
const { normalizeEmail } = require('./validateEmail');

// Единственная ответственность бэкенда за данные — таблица email-подписок.
// Никаких других сущностей (задачи/XP/таймер) здесь быть не должно.
function createDb(dbPath) {
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    )
  `);

  const insertStmt = db.prepare(
    'INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)'
  );

  // Повторная подписка тем же email — не ошибка, просто не создаёт дубликат
  // (INSERT OR IGNORE молча ничего не делает при конфликте UNIQUE).
  function insertSubscriber(email) {
    const normalized = normalizeEmail(email);
    const result = insertStmt.run(normalized, new Date().toISOString());
    return { created: result.changes > 0 };
  }

  function close() {
    db.close();
  }

  return { insertSubscriber, close };
}

module.exports = { createDb };
