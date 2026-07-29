import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS, LANGS, current, dirFor, t } from '../assets/js/i18n.js';

test('هر دو زبان دقیقاً یک مجموعه کلید دارند', () => {
  const [fa, en] = LANGS.map((lang) => Object.keys(STRINGS[lang]).sort());
  assert.deepEqual(fa, en);
});

test('هیچ رشته‌ای خالی نیست', () => {
  for (const lang of LANGS) {
    for (const [key, value] of Object.entries(STRINGS[lang])) {
      assert.ok(value.trim().length > 0, `${lang}.${key} خالی است`);
    }
  }
});

test('زبان پیش‌فرض بیرون از مرورگر فارسی است', () => {
  assert.equal(current(), 'fa');
});

test('dirFor جهت درست را می‌دهد', () => {
  assert.equal(dirFor('fa'), 'rtl');
  assert.equal(dirFor('en'), 'ltr');
});

test('t کلید ناشناخته را به جای پرتاب استثنا خودش را برمی‌گرداند', () => {
  assert.equal(t('no.such.key'), 'no.such.key');
});
