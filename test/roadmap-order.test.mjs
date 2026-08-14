import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { roadmapEntryIds } from '../assets/js/roadmap.js';

function readJson(path) {
  return JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
}

const TOPIC = 'crypto';
const roadmap = readJson(`data/${TOPIC}/roadmap.json`);
const categories = readJson(`data/${TOPIC}/categories.json`);
const entries = categories.flatMap((category) => readJson(`data/${TOPIC}/entries/${category.file}`));

// جفت‌هایی که به هم ارجاع می‌دهند. هیچ ترتیب خطی‌ای راضی‌شان نمی‌کند، پس
// صریحاً استثنا می‌شوند — با دلیل، نه فقط با شناسه.
const MUTUAL = [
  // تراکنش و بلاک هرکدام به دیگری ارجاع می‌دهند. پرینستون (فصل ۳) و
  // استنفورد (جلسه‌ی ۲) هر دو تراکنش را اول می‌آورند؛ ما هم.
  ['transaction', 'block'],
];

// ارجاع‌هایی که تزئینی‌اند، نه پیش‌نیاز. هرکدام با دلیلش.
const DECORATIVE = [
  // «بایت» فقط یک هشِ ۳۲ بایتی را به عنوان نمونه‌ی بایت نشان می‌دهد.
  ['byte', 'hash'],
  // «درخت مرکل» در حاشیه‌ی آخرش به extraNonce اشاره می‌کند؛ خود درخت
  // هیچ چیزی از نانس لازم ندارد.
  ['merkle-tree', 'nonce'],
];

function isExempt(from, to) {
  return (
    DECORATIVE.some(([a, b]) => a === from && b === to) ||
    MUTUAL.some(([a, b]) => (a === from && b === to) || (b === from && a === to))
  );
}

/**
 * پیش‌نیازها را از خودِ متن بیرون می‌کشد: هر «مدخل ‹عنوان›» یعنی این
 * مدخل به آن یکی تکیه کرده. عنوان‌های بلندتر اول بررسی می‌شوند تا
 * «مدل حساب» بر «حساب» بچربد.
 */
function citationsOf(entry, titleToId) {
  const titles = [...titleToId.keys()].sort((a, b) => b.length - a.length);
  const text = (entry.fa?.body ?? '') + (entry.fa?.example ?? '');
  const found = new Set();
  for (const match of text.matchAll(/مدخل\s+([^\s،.<]+(?:\s+[^\s،.<]+)?)/g)) {
    const hit = titles.find((title) => match[1].startsWith(title));
    const id = hit ? titleToId.get(hit) : null;
    if (id && id !== entry.id) found.add(id);
  }
  return found;
}

const titleToId = new Map(entries.map((entry) => [entry.fa.title, entry.id]));
const order = roadmapEntryIds(roadmap);
const position = new Map(order.map((id, index) => [id, index]));

test('نقشه هر مدخل موضوع را دقیقاً یک بار دارد', () => {
  assert.equal(order.length, new Set(order).size, 'شناسه‌ی تکراری در نقشه');
  const missing = entries.map((entry) => entry.id).filter((id) => !position.has(id));
  assert.deepEqual(missing, [], `این مدخل‌ها در هیچ مرحله‌ای نیستند: ${missing.join(', ')}`);
});

test('هیچ مدخلی پیش از چیزی که به آن تکیه دارد نمی‌آید', () => {
  const violations = [];
  for (const entry of entries) {
    for (const needed of citationsOf(entry, titleToId)) {
      if (isExempt(entry.id, needed)) continue;
      if (position.get(needed) > position.get(entry.id)) {
        violations.push(
          `${entry.id} (قدم ${position.get(entry.id) + 1}) به ${needed} (قدم ${position.get(needed) + 1}) تکیه دارد`,
        );
      }
    }
  }
  assert.deepEqual(violations, [], `\n  ${violations.join('\n  ')}\n`);
});

test('فهرست استثناها کهنه نشده', () => {
  // اگر ارجاعی حذف شد، استثنایش هم باید برود؛ وگرنه استثناها بی‌صدا
  // انباشته می‌شوند و گارد را سوراخ می‌کنند.
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  for (const [from, to] of [...DECORATIVE, ...MUTUAL]) {
    const entry = byId.get(from);
    assert.ok(entry, `استثنا برای مدخل ناموجود ${from}`);
    assert.ok(
      citationsOf(entry, titleToId).has(to),
      `${from} دیگر به ${to} ارجاع نمی‌دهد — این استثنا را بردار`,
    );
  }
});
