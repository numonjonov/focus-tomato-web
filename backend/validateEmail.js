// Простая, но достаточная проверка формата email на сервере.
// Не претендует на полное соответствие RFC 5322 — отсекает явный мусор.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && email.trim().length <= 254 && EMAIL_RE.test(email.trim());
}

// Единая нормализация email для сравнения/хранения — используется и при
// валидации, и при записи в БД, чтобы "Dup@Example.com" и "dup@example.com"
// считались одной подпиской.
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

module.exports = { isValidEmail, normalizeEmail };
