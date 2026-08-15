import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRoadmap,
  roadmapEntryIds,
  progressKey,
  parseProgress,
  serializeProgress,
  stageProgress,
  nextUnreadId,
  entriesMissingFromRoadmap,
} from '../assets/js/roadmap.js';

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

test('کلید ذخیره به‌ازای هر موضوع است', () => {
  assert.equal(progressKey('crypto'), 'dezhnebesht:roadmap:crypto');
  assert.notEqual(progressKey('crypto'), progressKey('other'));
});

test('parseProgress ورودی خراب را به مجموعه‌ی خالی تبدیل می‌کند', () => {
  assert.deepEqual([...parseProgress(null)], []);
  assert.deepEqual([...parseProgress('')], []);
  assert.deepEqual([...parseProgress('{ناقص')], []);
  assert.deepEqual([...parseProgress('{"a":1}')], []); // آرایه نیست
  assert.deepEqual([...parseProgress('[1,2]')], []); // رشته نیست
});

test('parseProgress آرایه‌ی شناسه را می‌خواند', () => {
  assert.deepEqual([...parseProgress('["bit","byte"]')], ['bit', 'byte']);
});

test('serializeProgress رفت‌وبرگشت را حفظ می‌کند', () => {
  const set = new Set(['bit', 'byte']);
  assert.deepEqual([...parseProgress(serializeProgress(set))], ['bit', 'byte']);
});

test('stageProgress فقط مدخل‌های همان مرحله را می‌شمارد', () => {
  const stage = { entries: ['bit', 'byte', 'hex'] };
  assert.deepEqual(stageProgress(stage, new Set(['bit', 'hex', 'hash'])), { done: 2, total: 3 });
  assert.deepEqual(stageProgress({ entries: [] }, new Set()), { done: 0, total: 0 });
  assert.deepEqual(stageProgress({}, new Set()), { done: 0, total: 0 });
});

test('nextUnreadId اولین مدخل تیک‌نخورده را می‌دهد', () => {
  const roadmap = {
    stages: [{ entries: ['bit', 'byte'] }, { entries: ['hex'] }],
  };
  assert.equal(nextUnreadId(roadmap, new Set()), 'bit');
  assert.equal(nextUnreadId(roadmap, new Set(['bit'])), 'byte');
  assert.equal(nextUnreadId(roadmap, new Set(['bit', 'byte'])), 'hex');
  assert.equal(nextUnreadId(roadmap, new Set(['bit', 'byte', 'hex'])), null);
});

test('entriesMissingFromRoadmap مدخل‌های جامانده را می‌دهد', () => {
  const roadmap = { stages: [{ entries: ['bit'] }] };
  const entries = [
    { id: 'bit', topic: 'crypto' },
    { id: 'byte', topic: 'crypto' },
    { id: 'other', topic: 'elsewhere' },
  ];
  assert.deepEqual(entriesMissingFromRoadmap(roadmap, entries, 'crypto'), ['byte']);
});

test('serializeProgress ورودی خراب را تحمل می‌کند', () => {
  // readSet باید Set باشد؛ اگر نیست، خالی فرض می‌کنیم
  assert.equal(serializeProgress(null), '[]');
  assert.equal(serializeProgress(undefined), '[]');
  assert.equal(serializeProgress({}), '[]');
  assert.equal(serializeProgress(42), '[]');
  assert.equal(serializeProgress(true), '[]');
});

test('stageProgress readSet خراب را تحمل می‌کند', () => {
  const stage = { entries: ['bit', 'byte'] };
  // readSet نیست؟ done صفر، total همان تعداد entries
  assert.deepEqual(stageProgress(stage, null), { done: 0, total: 2 });
  assert.deepEqual(stageProgress(stage, undefined), { done: 0, total: 2 });
  assert.deepEqual(stageProgress(stage, {}), { done: 0, total: 2 });
  assert.deepEqual(stageProgress(stage, 42), { done: 0, total: 2 });
  assert.deepEqual(stageProgress(stage, []), { done: 0, total: 2 });
});

test('nextUnreadId readSet خراب را تحمل می‌کند', () => {
  const roadmap = { stages: [{ entries: ['bit', 'byte'] }] };
  // readSet نیست؟ اولین مدخل را برمی‌دهد
  assert.equal(nextUnreadId(roadmap, null), 'bit');
  assert.equal(nextUnreadId(roadmap, undefined), 'bit');
  assert.equal(nextUnreadId(roadmap, {}), 'bit');
  assert.equal(nextUnreadId(roadmap, 42), 'bit');
  assert.equal(nextUnreadId(roadmap, []), 'bit');
});

test('entriesMissingFromRoadmap entries خراب را تحمل می‌کند', () => {
  const roadmap = { stages: [{ entries: ['bit'] }] };
  // entries باید آرایه باشد؛ اگر نیست، خالی فرض می‌کنیم
  assert.deepEqual(entriesMissingFromRoadmap(roadmap, null, 'crypto'), []);
  assert.deepEqual(entriesMissingFromRoadmap(roadmap, undefined, 'crypto'), []);
  assert.deepEqual(entriesMissingFromRoadmap(roadmap, {}, 'crypto'), []);
  assert.deepEqual(entriesMissingFromRoadmap(roadmap, 42, 'crypto'), []);
  assert.deepEqual(entriesMissingFromRoadmap(roadmap, true, 'crypto'), []);
});
