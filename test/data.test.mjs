import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, localized } from '../assets/js/data.js';

const CATEGORIES = [
  { id: 'basics', file: 'basics.json', fa: 'مفاهیم پایه', en: 'Fundamentals' },
];

function entry(overrides = {}) {
  return {
    id: 'hash',
    category: 'basics',
    tags: ['crypto'],
    related: [],
    fa: { title: 'هش', short: 'اثر انگشت داده', body: '<p>…</p>' },
    ...overrides,
  };
}

test('داده‌ی سالم هیچ خطایی تولید نمی‌کند', () => {
  assert.deepEqual(validate(CATEGORIES, [entry()]), []);
});

test('id تکراری گزارش می‌شود', () => {
  const errors = validate(CATEGORIES, [entry(), entry()]);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].id, 'hash');
  assert.match(errors[0].message, /تکراری/);
});

test('مدخل بدون id گزارش می‌شود', () => {
  const broken = entry();
  delete broken.id;
  const errors = validate(CATEGORIES, [broken]);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /id/);
});

test('فیلد اجباری جاافتاده در بلاک fa گزارش می‌شود', () => {
  const broken = entry({ fa: { title: 'هش', short: '', body: '<p>…</p>' } });
  const errors = validate(CATEGORIES, [broken]);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /fa\.short/);
});

test('نبود کل بلاک fa گزارش می‌شود', () => {
  const broken = entry();
  delete broken.fa;
  const errors = validate(CATEGORIES, [broken]);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /fa/);
});

test('بلاک en اختیاری است ولی اگر بیاید ناقص نباشد', () => {
  assert.deepEqual(validate(CATEGORIES, [entry({ en: undefined })]), []);
  const errors = validate(CATEGORIES, [entry({ en: { title: 'Hash', short: 'x' } })]);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /en\.body/);
});

test('related شکسته گزارش می‌شود و نام مدخل غایب را می‌آورد', () => {
  const errors = validate(CATEGORIES, [entry({ related: ['nonce'] })]);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /nonce/);
});

test('related سالم خطا نمی‌دهد', () => {
  const a = entry({ id: 'hash', related: ['nonce'] });
  const b = entry({ id: 'nonce', related: ['hash'] });
  assert.deepEqual(validate(CATEGORIES, [a, b]), []);
});

test('localized بلاک زبان خواسته‌شده را برمی‌گرداند', () => {
  const e = entry({ en: { title: 'Hash', short: 'fingerprint', body: '<p>x</p>' } });
  const view = localized(e, 'en');
  assert.equal(view.title, 'Hash');
  assert.equal(view.untranslated, false);
});

test('localized وقتی en نیست به fa برمی‌گردد و پرچم می‌زند', () => {
  const view = localized(entry(), 'en');
  assert.equal(view.title, 'هش');
  assert.equal(view.untranslated, true);
});

test('localized فارسی را هرگز ترجمه‌نشده علامت نمی‌زند', () => {
  assert.equal(localized(entry(), 'fa').untranslated, false);
});

test('svg داخل بلاک زبان جایگزین svg سطح بالا می‌شود', () => {
  const e = entry({
    svg: '<svg id="shared"></svg>',
    en: { title: 'Hash', short: 'x', body: '<p>x</p>', svg: '<svg id="en"></svg>' },
  });
  assert.equal(localized(e, 'fa').svg, '<svg id="shared"></svg>');
  assert.equal(localized(e, 'en').svg, '<svg id="en"></svg>');
});

test('example اختیاری است و نبودش رشته‌ی خالی می‌دهد', () => {
  assert.equal(localized(entry(), 'fa').example, '');
});
