import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash } from '../assets/js/router.js';
import { onThisPageSections } from '../assets/js/render.js';

test('هش خالی به فهرست می‌رود', () => {
  assert.deepEqual(parseHash(''), { view: 'index', topic: '', tag: '' });
  assert.deepEqual(parseHash('#'), { view: 'index', topic: '', tag: '' });
  assert.deepEqual(parseHash('#/'), { view: 'index', topic: '', tag: '' });
});

test('undefined به فهرست می‌رود', () => {
  assert.deepEqual(parseHash(undefined), { view: 'index', topic: '', tag: '' });
});

test('مسیر مدخل تجزیه می‌شود', () => {
  assert.deepEqual(parseHash('#/t/proof-of-work'), { view: 'entry', id: 'proof-of-work' });
});

test('مسیر هشتگ تجزیه می‌شود', () => {
  assert.deepEqual(parseHash('#/tag/mining'), { view: 'index', topic: '', tag: 'mining' });
});

test('مسیر خودآزمایی تجزیه می‌شود', () => {
  assert.deepEqual(parseHash('#/self-test'), { view: 'self-test' });
});

test('اسلش انتهایی اضافه نادیده گرفته می‌شود', () => {
  assert.deepEqual(parseHash('#/t/hash/'), { view: 'entry', id: 'hash' });
});

test('مقدار درصدکدشده رمزگشایی می‌شود', () => {
  assert.deepEqual(parseHash('#/tag/proof%20of%20work'), { view: 'index', topic: '', tag: 'proof of work' });
});

test('درصدکد نامعتبر باعث پرتاب استثنا نمی‌شود', () => {
  assert.doesNotThrow(() => parseHash('#/t/%E0%A4%A'));
  assert.deepEqual(parseHash('#/t/%E0%A4%A'), { view: 'entry', id: '%E0%A4%A' });
});

test('t بدون شناسه به فهرست برمی‌گردد', () => {
  assert.deepEqual(parseHash('#/t'), { view: 'index', topic: '', tag: '' });
  assert.deepEqual(parseHash('#/t/'), { view: 'index', topic: '', tag: '' });
});

test('tag بدون مقدار به فهرست برمی‌گردد', () => {
  assert.deepEqual(parseHash('#/tag'), { view: 'index', topic: '', tag: '' });
});

test('مسیر ناشناخته به فهرست برمی‌گردد', () => {
  assert.deepEqual(parseHash('#/چیز/عجیب'), { view: 'index', topic: '', tag: '' });
});

test('مسیر موضوع تجزیه می‌شود', () => {
  assert.deepEqual(parseHash('#/topic/crypto'), { view: 'index', topic: 'crypto', tag: '' });
});

test('topic بدون مقدار به فهرست برمی‌گردد', () => {
  assert.deepEqual(parseHash('#/topic'), { view: 'index', topic: '', tag: '' });
});

// ── لنگرهای داخل صفحه در برابر مسیرها ───────────────────────────────
// ریل «در این صفحه» به #entry-example و امثالش لینک می‌دهد، و مسیریابی
// این سایت هم روی hash است. هیچ‌کدام از این شناسه‌ها مسیر معتبری نیستند،
// پس اگر کلیک با preventDefault گرفته نشود، روتر آن‌ها را «مسیر ناشناخته»
// می‌بیند و مدخل را با فهرست عوض می‌کند — دقیقاً همان چیزی که یک‌بار اتفاق
// افتاد. این تست خطر را ثابت نگه می‌دارد: تا وقتی این شناسه‌ها به فهرست
// می‌افتند، آن رهگیری در app.js واجب است و حذفش باگ برمی‌گرداند.

test('هیچ لنگرِ ریلِ مدخل مسیر معتبری نیست — پس کلیکش باید رهگیری شود', () => {
  const ids = onThisPageSections({ hasExample: true, diagramCount: 2, hasRelated: true })
    .map((section) => section.id);
  assert.deepEqual(ids, ['entry-title', 'entry-example', 'entry-diagram', 'entry-related']);
  for (const id of ids) {
    assert.deepEqual(
      parseHash(`#${id}`),
      { view: 'index', topic: '', tag: '' },
      `${id} به فهرست می‌افتد`,
    );
  }
});

test('مسیر نقشهٔ راه با موضوع', () => {
  assert.deepEqual(parseHash('#/roadmap/crypto'), { view: 'roadmap', topic: 'crypto' });
});

test('مسیر نقشهٔ راه بدون موضوع، موضوع خالی می‌دهد', () => {
  assert.deepEqual(parseHash('#/roadmap'), { view: 'roadmap', topic: '' });
});

test('شناسه‌ی موضوع در مسیر نقشه دیکد می‌شود', () => {
  assert.deepEqual(parseHash('#/roadmap/%D8%A7%D9%84%D9%81'), { view: 'roadmap', topic: 'الف' });
});
