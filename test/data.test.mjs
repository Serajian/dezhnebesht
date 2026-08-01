import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, localized, loadAll, figures } from '../assets/js/data.js';

const CATEGORIES = [
  { id: 'basics', file: 'basics.json', fa: 'مفاهیم پایه', en: 'Fundamentals' },
];

function entry(overrides = {}) {
  return {
    id: 'hash',
    category: 'basics',
    tags: ['crypto'],
    related: [],
    fa: { title: 'هش', short: 'اثر انگشت داده', body: '<p>…</p>' },
    ...overrides,
  };
}

test('داده‌ی سالم هیچ خطایی تولید نمی‌کند', () => {
  assert.deepEqual(validate(CATEGORIES, [entry()]), []);
});

test('id تکراری گزارش می‌شود', () => {
  const errors = validate(CATEGORIES, [entry(), entry()]);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].id, 'hash');
  assert.match(errors[0].message, /تکراری/);
});

test('مدخل بدون id گزارش می‌شود', () => {
  const broken = entry();
  delete broken.id;
  const errors = validate(CATEGORIES, [broken]);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /id/);
});

test('فیلد اجباری جاافتاده در بلاک fa گزارش می‌شود', () => {
  const broken = entry({ fa: { title: 'هش', short: '', body: '<p>…</p>' } });
  const errors = validate(CATEGORIES, [broken]);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /fa\.short/);
});

test('نبود کل بلاک fa گزارش می‌شود', () => {
  const broken = entry();
  delete broken.fa;
  const errors = validate(CATEGORIES, [broken]);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /fa/);
});

test('بلاک en اختیاری است ولی اگر بیاید ناقص نباشد', () => {
  assert.deepEqual(validate(CATEGORIES, [entry({ en: undefined })]), []);
  const errors = validate(CATEGORIES, [entry({ en: { title: 'Hash', short: 'x' } })]);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /en\.body/);
});

test('related شکسته گزارش می‌شود و نام مدخل غایب را می‌آورد', () => {
  const errors = validate(CATEGORIES, [entry({ related: ['nonce'] })]);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /nonce/);
});

test('related سالم خطا نمی‌دهد', () => {
  const a = entry({ id: 'hash', related: ['nonce'] });
  const b = entry({ id: 'nonce', related: ['hash'] });
  assert.deepEqual(validate(CATEGORIES, [a, b]), []);
});

test('مدخل null یا غیرشیء در validate باعث throw نمی‌شود و به‌جایش خطا گزارش می‌شود', () => {
  let errors;
  assert.doesNotThrow(() => {
    errors = validate(CATEGORIES, [null, 'رشته‌ی نامعتبر']);
  });
  assert.equal(errors.length, 2);
  assert.match(errors[0].message, /شیء معتبر نیست/);
  assert.match(errors[1].message, /شیء معتبر نیست/);
});

test('localized بلاک زبان خواسته‌شده را برمی‌گرداند', () => {
  const e = entry({ en: { title: 'Hash', short: 'fingerprint', body: '<p>x</p>' } });
  const view = localized(e, 'en');
  assert.equal(view.title, 'Hash');
  assert.equal(view.untranslated, false);
});

test('localized وقتی en نیست به fa برمی‌گردد و پرچم می‌زند', () => {
  const view = localized(entry(), 'en');
  assert.equal(view.title, 'هش');
  assert.equal(view.untranslated, true);
});

test('localized فارسی را هرگز ترجمه‌نشده علامت نمی‌زند', () => {
  assert.equal(localized(entry(), 'fa').untranslated, false);
});

test('svg داخل بلاک زبان جایگزین svg سطح بالا می‌شود', () => {
  const e = entry({
    svg: '<svg id="shared"></svg>',
    en: { title: 'Hash', short: 'x', body: '<p>x</p>', svg: '<svg id="en"></svg>' },
  });
  assert.deepEqual(localized(e, 'fa').figures, [{ svg: '<svg id="shared"></svg>', caption: '' }]);
  assert.deepEqual(localized(e, 'en').figures, [{ svg: '<svg id="en"></svg>', caption: '' }]);
});

test('svg رشته‌ای به آرایه‌ی یک‌عضوی تبدیل می‌شود', () => {
  const e = entry({ svg: '<svg id="one"></svg>' });
  assert.deepEqual(figures(e, 'fa'), [{ svg: '<svg id="one"></svg>', caption: '' }]);
});

test('نبود svg آرایه‌ی خالی می‌دهد، نه رشته‌ی خالی', () => {
  assert.deepEqual(figures(entry(), 'fa'), []);
});

test('آرایه‌ی رشته‌ها چند دیاگرام بدون عنوان می‌سازد', () => {
  const e = entry({ svg: ['<svg id="a"></svg>', '<svg id="b"></svg>'] });
  assert.deepEqual(figures(e, 'fa').map((f) => f.svg), ['<svg id="a"></svg>', '<svg id="b"></svg>']);
  assert.deepEqual(figures(e, 'fa').map((f) => f.caption), ['', '']);
});

test('عنوان دیاگرام از زبان جاری می‌آید و به فارسی برمی‌گردد', () => {
  const e = entry({
    svg: [{ svg: '<svg id="a"></svg>', fa: 'نمودار یک', en: 'Figure one' },
          { svg: '<svg id="b"></svg>', fa: 'نمودار دو' }],
  });
  assert.deepEqual(figures(e, 'fa').map((f) => f.caption), ['نمودار یک', 'نمودار دو']);
  // دومی en ندارد، پس به fa برمی‌گردد — همان قاعده‌ی کل سایت
  assert.deepEqual(figures(e, 'en').map((f) => f.caption), ['Figure one', 'نمودار دو']);
});

test('عضو بدون svg کنار گذاشته می‌شود تا figure خالی رندر نشود', () => {
  const e = entry({ svg: ['<svg id="a"></svg>', '', { fa: 'بی‌تصویر' }] });
  assert.equal(figures(e, 'fa').length, 1);
});

test('example اختیاری است و نبودش رشته‌ی خالی می‌دهد', () => {
  assert.equal(localized(entry(), 'fa').example, '');
});

test('loadAll وقتی topics.json آرایه نیست throw نمی‌کند و آن را به خطا تبدیل می‌کند', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ basics: 'این یک آرایه نیست' }),
  });

  let result;
  try {
    await assert.doesNotReject(async () => {
      result = await loadAll('data');
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.deepEqual(result.entries, []);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].file, 'topics.json');
  assert.match(result.errors[0].message, /آرایه/);
});

const TOPICS = [{ id: 'crypto', fa: 'کریپتو', en: 'Crypto' }];

function stubEntriesFetch(rawEntries) {
  return async (path) => {
    if (path.endsWith('topics.json')) {
      return { ok: true, json: async () => TOPICS };
    }
    if (path.endsWith('categories.json')) {
      return { ok: true, json: async () => CATEGORIES };
    }
    if (path.endsWith('basics.json')) {
      return { ok: true, json: async () => rawEntries };
    }
    throw new Error(`fetch غیرمنتظره: ${path}`);
  };
}

test('loadAll مدخل سالم را نگه می‌دارد و مدخل بدون بلاک fa را از entries حذف می‌کند ولی در errors گزارش می‌کند', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = stubEntriesFetch([
    entry({ id: 'good' }),
    entry({ id: 'bad', fa: undefined }),
  ]);

  let result;
  try {
    result = await loadAll('data');
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.deepEqual(result.entries.map((e) => e.id), ['good']);
  assert.ok(result.errors.some((e) => e.id === 'bad' && /fa/.test(e.message)));
});

test('loadAll مدخلی که fa دارد ولی title ندارد را هم از entries حذف می‌کند ولی در errors گزارش می‌کند', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = stubEntriesFetch([
    entry({ id: 'good' }),
    entry({ id: 'bad', fa: { title: '', short: 'خ', body: '<p>…</p>' } }),
  ]);

  let result;
  try {
    result = await loadAll('data');
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.deepEqual(result.entries.map((e) => e.id), ['good']);
  assert.ok(result.errors.some((e) => e.id === 'bad'));
});

test('loadAll به‌خاطر related شکسته مدخل را از entries حذف نمی‌کند، فقط گزارشش می‌کند', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = stubEntriesFetch([
    entry({ id: 'hash', related: ['does-not-exist'] }),
  ]);

  let result;
  try {
    result = await loadAll('data');
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.deepEqual(result.entries.map((e) => e.id), ['hash']);
  assert.ok(result.errors.some((e) => e.id === 'hash' && /does-not-exist/.test(e.message)));
});

test('loadAll فایل‌ها را موازی می‌گیرد، نه پشت سر هم', async () => {
  // اگر درخواست‌ها زنجیره‌ای شوند، بیشترین هم‌پوشانی ۱ می‌ماند و صفحه
  // به‌ازای هر دسته یک رفت‌وبرگشت کامل منتظر می‌ماند.
  const originalFetch = globalThis.fetch;
  let inFlight = 0;
  let peak = 0;

  globalThis.fetch = async (path) => {
    inFlight += 1;
    peak = Math.max(peak, inFlight);
    await new Promise((resolve) => setTimeout(resolve, 15));
    inFlight -= 1;
    const body =
      path.endsWith('topics.json') ? [{ id: 'a', fa: 'الف', en: 'A' }, { id: 'b', fa: 'ب', en: 'B' }]
      : path.endsWith('categories.json') ? [
          { id: 'one', file: 'one.json', fa: 'یک', en: 'One' },
          { id: 'two', file: 'two.json', fa: 'دو', en: 'Two' },
        ]
      : [];
    return { ok: true, json: async () => body };
  };

  try {
    await loadAll('data');
  } finally {
    globalThis.fetch = originalFetch;
  }

  // دو categories.json با هم، بعد چهار فایل مدخل با هم.
  assert.ok(peak >= 4, `بیشترین درخواست هم‌زمان ${peak} بود؛ انتظار حداقل ۴`);
});
