const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { DatabaseSync } = require('node:sqlite');
const { createApp } = require('../backend/app');

async function withServer(fn) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ff-web-'));
  const dbPath = path.join(dir, 'subscribers.sqlite');
  const app = createApp({ dbPath });
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    await fn(`http://127.0.0.1:${port}`, dbPath);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    app.close();
    await fs.rm(dir, { recursive: true, force: true });
  }
}

function postJSON(baseUrl, body) {
  return fetch(`${baseUrl}/api/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

test('валидный email сохраняется и возвращает успех', async () => {
  await withServer(async (baseUrl, dbPath) => {
    const res = await postJSON(baseUrl, { email: 'user@example.com' });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);

    const db = new DatabaseSync(dbPath);
    const rows = db.prepare('SELECT email FROM subscribers WHERE email = ?').all('user@example.com');
    assert.equal(rows.length, 1);
    db.close();
  });
});

test('невалидный email возвращает 400 с понятным сообщением', async () => {
  await withServer(async (baseUrl) => {
    const res = await postJSON(baseUrl, { email: 'не-email' });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(typeof json.error, 'string');
    assert.ok(json.error.length > 0);
  });
});

test('пустое тело/отсутствующий email тоже 400', async () => {
  await withServer(async (baseUrl) => {
    const res = await postJSON(baseUrl, {});
    assert.equal(res.status, 400);
  });
});

test('повторная отправка того же email (включая разный регистр) не дублирует запись и не возвращает ошибку', async () => {
  await withServer(async (baseUrl, dbPath) => {
    const first = await postJSON(baseUrl, { email: 'Dup@Example.com' });
    const second = await postJSON(baseUrl, { email: 'dup@example.com' });
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);

    const db = new DatabaseSync(dbPath);
    const rows = db.prepare('SELECT email FROM subscribers WHERE email = ?').all('dup@example.com');
    assert.equal(rows.length, 1);
    db.close();
  });
});
