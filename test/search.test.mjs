import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, filterEntries } from '../assets/js/search.js';

const ENTRIES = [
  {
    id: 'proof-of-work',
    tags: ['mining', 'consensus'],
    fa: { title: 'اثبات کار', short: 'اثبات خرج شدن محاسبات', body: '' },
    en: { title: 'Proof of Work', short: 'Evidence of spent computation', body: '' },
  },
  {
    id: 'nonce',
    tags: ['mining'],
    fa: { title: 'نانس', short: 'عدد یک‌بارمصرف', body: '' },
  },
  {
    id: 'wallet',
    tags: ['keys'],
    fa: { title: 'کیف پول', short: 'نگهدارنده‌ی کلید خصوصی', body: '' },
    en: { title: 'Wallet', short: 'Holder of private keys', body: '' },
  },
];

test('normalize یای عربی را به فارسی تبدیل می‌کند', () => {
  assert.equal(normalize('\u064Aک'), normalize('\u06CCک'));
});

test('normalize کاف عربی را به فارسی تبدیل می‌کند', () => {
  assert.equal(normalize('\u0643ار'), normalize('\u06A9ار'));
});

test('normalize نیم‌فاصله را به فاصله تبدیل می‌کند', () => {
  assert.equal(normalize('اثبات\u200Cکار'), 'اثبات کار');
});

test('normalize حروف بزرگ را کوچک می‌کند و فاصله‌ها را جمع می‌کند', () => {
  assert.equal(normalize('  Proof   OF  Work '), 'proof of work');
});

test('normalize ورودی خالی و undefined را تحمل می‌کند', () => {
  assert.equal(normalize(undefined), '');
  assert.equal(normalize(null), '');
});

test('جستجوی خالی همه را برمی‌گرداند', () => {
  assert.equal(filterEntries(ENTRIES, {}).length, 3);
  assert.equal(filterEntries(ENTRIES, { query: '   ' }).length, 3);
});

test('جستجو در عنوان فارسی کار می‌کند', () => {
  const found = filterEntries(ENTRIES, { query: 'اثبات' });
  assert.deepEqual(found.map((e) => e.id), ['proof-of-work']);
});

test('جستجوی انگلیسی مدخل را پیدا می‌کند حتی وقتی کاربر روی فارسی است', () => {
  const found = filterEntries(ENTRIES, { query: 'proof' });
  assert.deepEqual(found.map((e) => e.id), ['proof-of-work']);
});

test('جستجو در توضیح کوتاه هم انجام می‌شود', () => {
  const found = filterEntries(ENTRIES, { query: 'یک‌بارمصرف' });
  assert.deepEqual(found.map((e) => e.id), ['nonce']);
});

test('جستجو در هشتگ‌ها انجام می‌شود', () => {
  const found = filterEntries(ENTRIES, { query: 'mining' });
  assert.deepEqual(found.map((e) => e.id), ['proof-of-work', 'nonce']);
});

test('جستجو با یای عربی هم مدخل فارسی را پیدا می‌کند', () => {
  const found = filterEntries(ENTRIES, { query: 'ک\u064Aف' });
  assert.deepEqual(found.map((e) => e.id), ['wallet']);
});

test('مدخل بدون بلاک en باعث خطا نمی‌شود', () => {
  assert.doesNotThrow(() => filterEntries(ENTRIES, { query: 'x' }));
});

test('فیلتر هشتگ فقط مدخل‌های آن هشتگ را می‌دهد', () => {
  const found = filterEntries(ENTRIES, { tag: 'keys' });
  assert.deepEqual(found.map((e) => e.id), ['wallet']);
});

test('فیلتر هشتگ تطبیق کامل است نه جزئی', () => {
  assert.equal(filterEntries(ENTRIES, { tag: 'min' }).length, 0);
});

test('هشتگ و جستجو با هم اعمال می‌شوند', () => {
  const found = filterEntries(ENTRIES, { tag: 'mining', query: 'نانس' });
  assert.deepEqual(found.map((e) => e.id), ['nonce']);
});

test('نتیجه‌ی بی‌تطابق آرایه‌ی خالی است', () => {
  assert.deepEqual(filterEntries(ENTRIES, { query: 'zzzz' }), []);
});

test('ترتیب ورودی حفظ می‌شود', () => {
  const found = filterEntries(ENTRIES, { query: '' });
  assert.deepEqual(found.map((e) => e.id), ['proof-of-work', 'nonce', 'wallet']);
});

test('آرایه‌ی ورودی تغییر داده نمی‌شود', () => {
  const copy = [...ENTRIES];
  filterEntries(ENTRIES, { query: 'proof' });
  assert.deepEqual(ENTRIES, copy);
});
