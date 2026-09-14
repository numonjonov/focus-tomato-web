const { test } = require('node:test');
const assert = require('node:assert/strict');
const { translations } = require('../frontend/js/i18n');

const LANGS = ['ru', 'uz'];

test('словарь i18n содержит и ru, и uz', () => {
  for (const lang of LANGS) {
    assert.ok(translations[lang], `нет секции для языка "${lang}"`);
  }
});

test('для каждого ключа есть перевод на обоих языках', () => {
  const allKeys = new Set([
    ...Object.keys(translations.ru),
    ...Object.keys(translations.uz)
  ]);

  assert.ok(allKeys.size > 0, 'словарь пуст');

  for (const key of allKeys) {
    for (const lang of LANGS) {
      const value = translations[lang][key];
      assert.equal(
        typeof value,
        'string',
        `ключ "${key}" отсутствует или не является строкой для языка "${lang}"`
      );
      assert.ok(value.length > 0, `ключ "${key}" пуст для языка "${lang}"`);
    }
  }
});
