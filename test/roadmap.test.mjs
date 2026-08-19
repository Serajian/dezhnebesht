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
  pruneRoadmap,
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

test('pruneRoadmap مدخل رندرنشدنی را از مسیر برمی‌دارد', () => {
  const roadmap = {
    stages: [
      { id: 's1', entries: ['bit', 'ghost', 'byte'] },
      { id: 's2', entries: ['ghost'] },
    ],
  };
  const pruned = pruneRoadmap(roadmap, new Set(['bit', 'byte']));
  assert.deepEqual(pruned.stages[0].entries, ['bit', 'byte']);
  assert.deepEqual(pruned.stages[1].entries, []);
});

test('pruneRoadmap ترتیب و بقیه‌ی فیلدهای مرحله را دست نمی‌زند', () => {
  const roadmap = {
    stages: [{ id: 's1', fa: { title: 'یک' }, en: { title: 'One' }, entries: ['b', 'a', 'x'] }],
  };
  const pruned = pruneRoadmap(roadmap, ['a', 'b']);
  assert.deepEqual(pruned.stages[0].entries, ['b', 'a']);
  assert.equal(pruned.stages[0].fa.title, 'یک');
  assert.equal(pruned.stages[0].id, 's1');
});

test('pruneRoadmap نقشه‌ی اصلی را تغییر نمی‌دهد', () => {
  const roadmap = { stages: [{ id: 's1', entries: ['a', 'gone'] }] };
  pruneRoadmap(roadmap, ['a']);
  assert.deepEqual(roadmap.stages[0].entries, ['a', 'gone']);
});

test('pruneRoadmap روی ورودی خراب پرتاب نمی‌کند', () => {
  assert.equal(pruneRoadmap(null, ['a']), null);
  assert.deepEqual(pruneRoadmap({ stages: [{ id: 's' }] }, ['a']).stages[0].entries, []);
  assert.deepEqual(pruneRoadmap({ stages: [{ id: 's', entries: ['a'] }] }, null).stages[0].entries, []);
});

test('شمار مسیر با شمار رندرشدنی‌ها یکی می‌شود', () => {
  // همان باگ خفته. مدخلِ بدون fa.title از فهرست رندرشدنی‌ها می‌افتد ولی
  // در roadmap.json می‌ماند. تست هر دو حالت را می‌سنجد تا خودِ باگ را
  // ثبت کند، نه فقط رفعش را.
  const roadmap = { stages: [{ id: 's1', entries: ['a', 'titleless', 'b'] }] };
  const renderable = new Set(['a', 'b']);
  const totalOf = (rm) => rm.stages.reduce((n, s) => n + stageProgress(s, new Set()).total, 0);

  // پیش از هرس: مسیر سه قدم می‌شمرد ولی فقط دو تا رندر می‌شد —
  // «۲ از ۳» که هرگز کامل نمی‌شد.
  assert.equal(totalOf(roadmap), 3);
  assert.notEqual(totalOf(roadmap), renderable.size);

  const pruned = pruneRoadmap(roadmap, renderable);
  assert.equal(totalOf(pruned), renderable.size);
  // و قدم بعدی هم دیگر روی مدخلِ رندرنشدنی گیر نمی‌کند.
  assert.equal(nextUnreadId(roadmap, new Set(['a'])), 'titleless');
  assert.equal(nextUnreadId(pruned, new Set(['a'])), 'b');
});
