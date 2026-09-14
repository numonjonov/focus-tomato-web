// Простая, но достаточная проверка формата email на сервере.
// Не претендует на полное соответствие RFC 5322 — отсекает явный мусор.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && email.trim().length <= 254 && EMAIL_RE.test(email.trim());
}

module.exports = { isValidEmail };
