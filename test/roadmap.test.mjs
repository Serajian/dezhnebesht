import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRoadmap, roadmapEntryIds } from '../assets/js/roadmap.js';

const entries = [
  { id: 'bit', topic: 'crypto' },
  { id: 'byte', topic: 'crypto' },
  { id: 'elsewhere', topic: 'other' },
];

const ok = {
  stages: [
    { id: 's1', fa: { title: 'یک', why: 'چرا' }, en: { title: 'One', why: 'Why' }, entries: ['bit', 'byte'] },
  ],
};

test('نقشهٔ سالم هیچ خطایی نمی‌دهد', () => {
  assert.deepEqual(validateRoadmap(ok, entries, 'crypto'), []);
});

test('شناسه‌ای که مدخل ندارد خطاست', () => {
  const bad = { stages: [{ id: 's1', fa: { title: 'یک' }, en: { title: 'One' }, entries: ['bit', 'ghost'] }] };
  const errors = validateRoadmap(bad, entries, 'crypto');
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /ghost/);
});

test('مدخلی که در دو مرحله آمده خطاست', () => {
  const bad = {
    stages: [
      { id: 's1', fa: { title: 'یک' }, en: { title: 'One' }, entries: ['bit'] },
      { id: 's2', fa: { title: 'دو' }, en: { title: 'Two' }, entries: ['bit'] },
    ],
  };
  const errors = validateRoadmap(bad, entries, 'crypto');
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /بیش از یک مرحله/);
});

test('مرحلهٔ بدون عنوان فارسی خطاست', () => {
  const bad = { stages: [{ id: 's1', fa: {}, en: { title: 'One' }, entries: ['bit'] }] };
  assert.equal(validateRoadmap(bad, entries, 'crypto').length, 1);
});

test('مرحلهٔ بدون شناسه خطاست', () => {
  const bad = { stages: [{ fa: { title: 'یک' }, en: { title: 'One' }, entries: ['bit'] }] };
  assert.equal(validateRoadmap(bad, entries, 'crypto').length, 1);
});

test('مدخلِ موضوع دیگر در نقشهٔ این موضوع خطاست', () => {
  const bad = { stages: [{ id: 's1', fa: { title: 'یک' }, en: { title: 'One' }, entries: ['elsewhere'] }] };
  assert.equal(validateRoadmap(bad, entries, 'crypto').length, 1);
});

test('نقشهٔ بی‌شکل خطا می‌دهد ولی throw نمی‌کند', () => {
  assert.equal(validateRoadmap(null, entries, 'crypto').length, 1);
  assert.equal(validateRoadmap({}, entries, 'crypto').length, 1);
  assert.equal(validateRoadmap({ stages: 'نه آرایه' }, entries, 'crypto').length, 1);
});

test('roadmapEntryIds ترتیب را حفظ می‌کند', () => {
  assert.deepEqual(roadmapEntryIds(ok), ['bit', 'byte']);
  assert.deepEqual(roadmapEntryIds(null), []);
});
