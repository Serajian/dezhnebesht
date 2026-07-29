import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash } from '../assets/js/router.js';

test('هش خالی به فهرست می‌رود', () => {
  assert.deepEqual(parseHash(''), { view: 'index', tag: '' });
  assert.deepEqual(parseHash('#'), { view: 'index', tag: '' });
  assert.deepEqual(parseHash('#/'), { view: 'index', tag: '' });
});

test('undefined به فهرست می‌رود', () => {
  assert.deepEqual(parseHash(undefined), { view: 'index', tag: '' });
});

test('مسیر مدخل تجزیه می‌شود', () => {
  assert.deepEqual(parseHash('#/t/proof-of-work'), { view: 'entry', id: 'proof-of-work' });
});

test('مسیر هشتگ تجزیه می‌شود', () => {
  assert.deepEqual(parseHash('#/tag/mining'), { view: 'index', tag: 'mining' });
});

test('مسیر خودآزمایی تجزیه می‌شود', () => {
  assert.deepEqual(parseHash('#/self-test'), { view: 'self-test' });
});

test('اسلش انتهایی اضافه نادیده گرفته می‌شود', () => {
  assert.deepEqual(parseHash('#/t/hash/'), { view: 'entry', id: 'hash' });
});

test('مقدار درصدکدشده رمزگشایی می‌شود', () => {
  assert.deepEqual(parseHash('#/tag/proof%20of%20work'), { view: 'index', tag: 'proof of work' });
});

test('درصدکد نامعتبر باعث پرتاب استثنا نمی‌شود', () => {
  assert.doesNotThrow(() => parseHash('#/t/%E0%A4%A'));
});

test('t بدون شناسه به فهرست برمی‌گردد', () => {
  assert.deepEqual(parseHash('#/t'), { view: 'index', tag: '' });
  assert.deepEqual(parseHash('#/t/'), { view: 'index', tag: '' });
});

test('tag بدون مقدار به فهرست برمی‌گردد', () => {
  assert.deepEqual(parseHash('#/tag'), { view: 'index', tag: '' });
});

test('مسیر ناشناخته به فهرست برمی‌گردد', () => {
  assert.deepEqual(parseHash('#/چیز/عجیب'), { view: 'index', tag: '' });
});
