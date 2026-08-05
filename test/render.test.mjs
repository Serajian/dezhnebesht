import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onThisPageSections, isShortFormula, hardenSpaces } from '../assets/js/render.js';

// render.js نیاز به document دارد، اما onThisPageSections منطق محضی
// است که هیچ DOM نمی‌سازد — همان چیزی که رِیل «در این صفحه»ی نمای
// مدخل از رویش ساخته می‌شود. وارد کردن خودِ ماژول در Node مشکلی ندارد
// چون هیچ فراخوانی DOM در سطح بالای فایل نیست، فقط داخل بدنه‌ی توابع؛
// این تست فقط تابع محض را صدا می‌زند، نه چیزی که document بخواهد.

test('مدخل بدون مثال، دیاگرام و مرتبط فقط «تعریف» را دارد', () => {
  const sections = onThisPageSections({ hasExample: false, diagramCount: 0, hasRelated: false });
  assert.deepEqual(sections, [{ id: 'entry-title', key: 'rail.definition' }]);
});

test('هر بخش موجود دقیقاً یک‌بار و به ترتیب تعریف/مثال/دیاگرام/مرتبط اضافه می‌شود', () => {
  const sections = onThisPageSections({ hasExample: true, diagramCount: 1, hasRelated: true });
  assert.deepEqual(sections.map((s) => s.id), ['entry-title', 'entry-example', 'entry-diagram', 'entry-related']);
});

test('فقط بخش‌های موجود اضافه می‌شوند — مدخلی با مثال ولی بدون دیاگرام/مرتبط لینک مرده نمی‌گیرد', () => {
  const sections = onThisPageSections({ hasExample: true, diagramCount: 0, hasRelated: false });
  assert.deepEqual(sections.map((s) => s.id), ['entry-title', 'entry-example']);
});

test('دیاگرام بدون مثال هم به‌تنهایی اضافه می‌شود', () => {
  const sections = onThisPageSections({ hasExample: false, diagramCount: 1, hasRelated: false });
  assert.deepEqual(sections.map((s) => s.id), ['entry-title', 'entry-diagram']);
});

test('هر آیتم یک id یکتا و متناظر با انکر واقعی صفحه دارد', () => {
  const sections = onThisPageSections({ hasExample: true, diagramCount: 1, hasRelated: true });
  const ids = sections.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.match(id, /^entry-(title|example|diagram|related)$/);
  }
});

test('برچسب رِیل با تعداد دیاگرام جمع می‌شود', () => {
  const one = onThisPageSections({ hasExample: false, diagramCount: 1, hasRelated: false });
  const many = onThisPageSections({ hasExample: false, diagramCount: 2, hasRelated: false });
  assert.equal(one.find((s) => s.id === 'entry-diagram').key, 'entry.diagram');
  assert.equal(many.find((s) => s.id === 'entry-diagram').key, 'entry.diagrams');
});

test('بدون دیاگرام، لینکی در رِیل ساخته نمی‌شود', () => {
  const none = onThisPageSections({ hasExample: true, diagramCount: 0, hasRelated: true });
  assert.equal(none.some((s) => s.id === 'entry-diagram'), false);
});

// ── فرمول کوتاه در برابر رشته‌ی بلند ────────────────────────────────
// همان مرزی که keepFormulasWhole روی آن تصمیم می‌گیرد. راه‌رفتن روی DOM
// اینجا تست نمی‌شود (document لازم دارد)، ولی تصمیم — اینکه کدام <code>
// نباید بشکند — منطق محض است و همین‌جا بسته می‌شود.

test('عبارت کوتاهِ فاصله‌دار فرمول است و باید یکپارچه بماند', () => {
  for (const formula of ['p − y', 'n·G = O', 's·G = R + e·P', 'Gy² ≡ Gx³ + 7 (mod p)']) {
    assert.equal(isShortFormula(formula), true, formula);
  }
});

test('کلید ۶۴ کاراکتری هگز فرمول نیست و باید بشکند، وگرنه از ستون بیرون می‌زند', () => {
  const key = 'x = f028892bad7ed57d2fb57bf33081d5cfcf6f9ed3d3d7f159c2e2fff579dc341a';
  assert.equal(isShortFormula(key), false);
});

test('کدِ بدون فاصله دست نمی‌خورد — جای شکستنی ندارد که حفظ شود', () => {
  assert.equal(isShortFormula('secp256k1'), false);
});

test('بلندترین فرمولِ واقعیِ مدخل‌ها هم یکپارچه می‌ماند', () => {
  // ۴۳ کاراکتر — از مدخل حمله‌ی تمدید طول
  assert.equal(isShortFormula('hash(secret ‖ message ‖ padding ‖ anything)'), true);
});

test('hardenSpaces فقط فاصله‌ها را نشکن می‌کند و بقیه را دست نمی‌زند', () => {
  assert.equal(hardenSpaces('a = 0'), 'a\u00a0=\u00a00');
  assert.equal(hardenSpaces('secp256k1'), 'secp256k1');
});
