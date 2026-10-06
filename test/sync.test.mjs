import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeEmail,
  isValidEmail,
  validateProgressBody,
  mergeProgress,
  topicsToPush,
} from '../assets/js/sync.js';

/** ترتیب در مجموعه‌ی تیک‌ها معنا ندارد؛ برای مقایسه مرتب می‌کنیم. */
function sorted(record) {
  return Object.fromEntries(
    Object.entries(record).map(([topic, ids]) => [topic, [...ids].sort()]),
  );
}

test('normalizeEmail فاصله را می‌بُرد و حروف را کوچک می‌کند', () => {
  assert.equal(normalizeEmail('  A@B.Co '), 'a@b.co');
});

test('normalizeEmail برای غیررشته رشته‌ی خالی می‌دهد', () => {
  assert.equal(normalizeEmail(42), '');
  assert.equal(normalizeEmail(undefined), '');
});

test('isValidEmail ایمیل‌های معقول را می‌پذیرد', () => {
  for (const ok of ['a@b.co', 'x.y+z@sub.example.org']) {
    assert.ok(isValidEmail(ok), ok);
  }
});

test('isValidEmail شکل‌های نادرست را رد می‌کند', () => {
  for (const bad of ['', 'ab.co', 'a@@b.co', 'a@b@c.co', '@b.co', 'a@', 'a@bco']) {
    assert.ok(!isValidEmail(bad), bad);
  }
});

test('isValidEmail مرز ۲۵۴ کاراکتر را رعایت می‌کند', () => {
  assert.ok(isValidEmail('a@b.co'.padStart(254, 'x')));
  assert.ok(!isValidEmail('a@b.co'.padStart(255, 'x')));
});

const good = { email: ' A@B.co', topicId: 'acid', readIds: ['x', 'x', 'y'] };

test('validateProgressBody بدنه‌ی معتبر را normalize و dedupe می‌کند', () => {
  assert.deepEqual(validateProgressBody(good), {
    ok: true,
    value: { email: 'a@b.co', topicId: 'acid', readIds: ['x', 'y'] },
  });
});

test('validateProgressBody بدنه‌های نامعتبر را رد می‌کند', () => {
  const bads = [
    null,
    [],
    'str',
    { ...good, email: 'nope' },
    { ...good, topicId: '' },
    { ...good, topicId: 'x'.repeat(65) },
    { ...good, readIds: 'x' },
    { ...good, readIds: [1] },
    { ...good, readIds: ['x'.repeat(129)] },
    { ...good, readIds: Array.from({ length: 5001 }, (_, i) => `e${i}`) },
  ];
  for (const bad of bads) {
    assert.deepEqual(validateProgressBody(bad), { ok: false }, JSON.stringify(bad)?.slice(0, 60));
  }
});

test('validateProgressBody مرزها را می‌پذیرد', () => {
  const edges = [
    { ...good, topicId: 'x'.repeat(64) },
    { ...good, readIds: ['x'.repeat(128)] },
    { ...good, readIds: Array.from({ length: 5000 }, (_, i) => `e${i}`) },
    { ...good, readIds: [] },
  ];
  for (const edge of edges) {
    assert.equal(validateProgressBody(edge).ok, true);
  }
});

test('mergeProgress اجتماع هر موضوع را می‌دهد', () => {
  assert.deepEqual(
    sorted(mergeProgress({ a: ['1', '2'] }, { a: ['2', '3'], b: ['9'] })),
    { a: ['1', '2', '3'], b: ['9'] },
  );
});

test('mergeProgress پاسخ غیرشیء سرور را نادیده می‌گیرد', () => {
  assert.deepEqual(mergeProgress({ a: ['1'] }, '<html>'), { a: ['1'] });
  assert.deepEqual(mergeProgress({ a: ['1'] }, null), { a: ['1'] });
  assert.deepEqual(mergeProgress({ a: ['1'] }, ['x']), { a: ['1'] });
});

test('mergeProgress مقدار غیرآرایه و عضو غیررشته را دور می‌ریزد', () => {
  assert.deepEqual(
    sorted(mergeProgress({ a: ['1'] }, { a: 'x', b: [1, '2'] })),
    { a: ['1'], b: ['2'] },
  );
});

test('topicsToPush فقط موضوع‌هایی را می‌دهد که با سرور فرق دارند', () => {
  assert.deepEqual(topicsToPush({ a: ['1', '2'], b: ['9'] }, { a: ['2', '1'], b: [] }), ['b']);
});

test('topicsToPush با پاسخ نامعتبر سرور همه را می‌دهد', () => {
  assert.deepEqual(topicsToPush({ a: ['1'] }, null), ['a']);
});

test('validateProgressBody بدنه‌ی تغییری add/remove را می‌پذیرد', () => {
  assert.deepEqual(
    validateProgressBody({ email: 'a@b.co', topicId: 'acid', add: ['x', 'x'], remove: ['y'] }),
    { ok: true, value: { email: 'a@b.co', topicId: 'acid', add: ['x'], remove: ['y'] } },
  );
  assert.deepEqual(
    validateProgressBody({ email: 'a@b.co', topicId: 'acid', add: ['x'] }),
    { ok: true, value: { email: 'a@b.co', topicId: 'acid', add: ['x'], remove: [] } },
  );
});

test('validateProgressBody بدنه‌ی تغییری بد را رد می‌کند', () => {
  const base = { email: 'a@b.co', topicId: 'acid' };
  for (const bad of [
    base,
    { ...base, add: 'x' },
    { ...base, remove: [1] },
    { ...base, add: ['x'.repeat(129)] },
    { ...base, add: Array.from({ length: 3000 }, (_, i) => `a${i}`), remove: Array.from({ length: 2001 }, (_, i) => `r${i}`) },
  ]) {
    assert.deepEqual(validateProgressBody(bad), { ok: false }, JSON.stringify(bad).slice(0, 60));
  }
});
