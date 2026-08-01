import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onThisPageSections } from '../assets/js/render.js';

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
