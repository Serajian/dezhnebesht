# پلن پیاده‌سازی دانشنامه کریپتو و بلاکچین

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**هدف:** یک وب‌سایت ایستای دوزبانه (فارسی/انگلیسی) که مدخل‌های کریپتو و بلاکچین را از فایل‌های JSON می‌خواند و روی GitHub Pages منتشر می‌شود، طوری که افزودن یک مدخل جدید فقط ویرایش یک فایل JSON باشد.

**معماری:** ES moduleهای خام در مرورگر، بدون فریم‌ورک و بدون build. `data.js` داده را با `fetch` می‌خواند و اعتبارسنجی می‌کند ولی DOM نمی‌سازد؛ `render.js` DOM می‌سازد ولی داده لود نمی‌کند؛ `app.js` این‌ها را به هم وصل می‌کند. منطق خالص (اعتبارسنجی، فیلتر جستجو، تجزیه‌ی مسیر) با تست‌رانر داخلی Node تست می‌شود و بقیه از طریق صفحه‌ی `#/self-test` در مرورگر بررسی می‌شود.

**تک‌استک:** HTML5، CSS3، JavaScript ES2022 (ES modules)، Node.js ۲۲ فقط برای سرور محلی و اجرای تست‌ها.

**سند طراحی:** `docs/superpowers/specs/2026-07-29-crypto-glossary-design.md` — مرجع نهایی است. اگر این پلن با آن تناقض داشت، سند برنده است مگر در موردی که پایین صریحاً ذکر شده.

**وضعیت راستی‌آزمایی کد این پلن:** بلاک‌های کد `data.js`، `search.js`، `router.js`، `i18n.js` و تست‌هایشان از همین سند بیرون کشیده و روی Node ۲۲.۲۲ اجرا شده‌اند: ۴۷ تست، همه PASS (به‌علاوه‌ی ۵ تست `data-files.test.mjs` که به داده‌ی واقعی نیاز دارد و در تسک ۲ ساخته می‌شود ← مجموع ۵۲). `render.js` و `app.js` به DOM نیاز دارند و فقط با `node --check` بررسی نحوی شده‌اند؛ درستی رفتاری‌شان از طریق بررسی‌های دستی مرورگر در تسک‌های ۶ تا ۹ تأیید می‌شود.

### انحراف اعلام‌شده از سند طراحی

سند نوشته بود «تست‌رانر برای این اندازه پروژه توجیه ندارد». این پلن برای سه تابع خالص تست واحد می‌گذارد و از `node --test` استفاده می‌کند که داخل خود Node است — هیچ پکیجی نصب نمی‌شود، هیچ مرحله‌ی build اضافه نمی‌شود، و فایل‌های تست هرگز به مرورگر نمی‌روند. محدودیت‌های سند («بدون npm، بدون build، بدون فریم‌ورک») دست‌نخورده باقی می‌مانند. صفحه‌ی `#/self-test` هم طبق سند ساخته می‌شود و برای رندر و یکپارچگی مسئول است.

---

## Global Constraints

این‌ها روی همه‌ی تسک‌ها اعمال می‌شوند و در هر تسک تکرار نمی‌شوند:

- **بدون فریم‌ورک، بدون بسته‌ی npm، بدون مرحله‌ی build.** `package.json` فقط `{"type": "module", "private": true}` دارد و هرگز فیلد `dependencies` یا `devDependencies` نمی‌گیرد. `node_modules/` هرگز ساخته نمی‌شود.
- **بدون درخواست به دامنه‌ی خارجی.** بدون CDN، بدون فونت آنلاین، بدون تصویر ریموت. هر `http://` یا `https://` در کد یا CSS یا HTML خطاست، مگر در متن محتوای یک مدخل به عنوان لینک بیرونی.
- **فونت‌های سیستمی.** فقط `font-family` با نام‌های عمومی و فونت‌های نصب‌شده روی سیستم.
- **دیاگرام‌ها فقط SVG درون‌خطی.** هیچ `<img>`ی به فایل تصویری، هیچ PNG/JPG.
- **زبان پیش‌فرض فارسی.** `dir="rtl"` و `lang="fa"` حالت اولیه‌ی `<html>` است.
- **هشتگ‌ها همیشه انگلیسی، حروف کوچک، بدون `#` در داده.** `#` فقط موقع نمایش اضافه می‌شود.
- **دسته‌ی مدخل از نام فایلش می‌آید،** نه از فیلدی داخل خود مدخل. هیچ مدخلی نباید فیلد `category` در JSON داشته باشد.
- **افزودن یک مدخل نباید هیچ فایل JS‌ای را دست بزند.** هر تسکی که این را نقض کند اشتباه است.
- **مسیرها نسبی‌اند.** `assets/js/...` و `data/...` بدون `/` ابتدایی، چون GitHub Pages ممکن است سایت را زیر مسیر `/<repo>/` سرو کند.
- **`fetch` روی `file://` کار نمی‌کند.** هر بار تست دستی یعنی اول `node serve.js`.
- **محتوای `body` و `example` و `svg` به صورت HTML خام رندر می‌شوند** (`innerHTML`). این آگاهانه است چون محتوا در خودِ ریپو نوشته می‌شود و ورودی کاربر نیست. هرگز محتوای بیرونی یا ورودی کاربر را به این مسیر ندهید.
- **کامیت‌های مکرر.** هر تسک با حداقل یک کامیت تمام می‌شود.
- **اجرای تست‌ها با `node --test` بدون آرگومان است.** روی Node ۲۲، دادن مسیر پوشه (`node --test test/`) خطای `MODULE_NOT_FOUND` می‌دهد چون پوشه را به‌عنوان ماژول لود می‌کند. بدون آرگومان، خودش فایل‌های `*.test.mjs` را پیدا می‌کند. دادن مسیر یک یا چند *فایل* کار می‌کند و برای اجرای تست یک ماژول خاص استفاده می‌شود.

---

## نقشه‌ی فایل‌ها

| فایل | مسئولیت |
|---|---|
| `package.json` | فقط `type: module` تا Node بتواند فایل‌های `.js` را به عنوان ES module بخواند |
| `serve.js` | سرور استاتیک محلی با `node:http`؛ بدون وابستگی |
| `index.html` | اسکلت صفحه: هدر، نوار خطا، نوار جستجو، `<main>` خالی |
| `assets/css/style.css` | تمام استایل‌ها؛ تنها فایل CSS |
| `assets/js/data.js` | `loadAll()`، `validate()`، `localized()` — بدون DOM |
| `assets/js/i18n.js` | زبان جاری، `t()`، اعمال `dir`/`lang` روی `<html>` |
| `assets/js/search.js` | `normalize()`، `filterEntries()` — خالص، بدون DOM |
| `assets/js/router.js` | `parseHash()`، `start()`، `go()` |
| `assets/js/render.js` | همه‌ی ساخت DOM؛ بدون `fetch` |
| `assets/js/app.js` | حالت برنامه و اتصال ماژول‌ها؛ تنها فایلی که رویداد DOM می‌بندد |
| `data/categories.json` | فهرست و ترتیب دسته‌ها |
| `data/entries/<category>.json` | مدخل‌های هر دسته |
| `test/data.test.mjs` | تست `validate()` و `localized()` |
| `test/search.test.mjs` | تست `normalize()` و `filterEntries()` |
| `test/router.test.mjs` | تست `parseHash()` |

مرز مهم: `data.js` هیچ‌وقت `document` را لمس نمی‌کند و `render.js` هیچ‌وقت `fetch` نمی‌زند. اگر موقع پیاده‌سازی وسوسه شدید این مرز را بشکنید، یعنی تابع در فایل اشتباهی است.

---

## Task 1: اسکلت پروژه، سرور محلی و مخزن git

**Files:**
- Create: `package.json`
- Create: `serve.js`
- Create: `index.html`
- Create: `assets/css/style.css`
- Create: `.gitignore`

**Interfaces:**
- Consumes: هیچ‌چیز
- Produces: سروری که روی `http://localhost:8000` فایل‌های ریپو را سرو می‌کند؛ `index.html` با idهای `#main`، `#errors`، `#searchbar`، `#search`، `#lang-toggle`، `#view-toggle` که تسک‌های بعدی به آن‌ها وصل می‌شوند.

- [ ] **Step 1: راه‌اندازی مخزن git**

```bash
git init -b main
```

- [ ] **Step 2: ساخت `.gitignore`**

```
.DS_Store
node_modules/
```

`node_modules/` هرگز نباید ساخته شود؛ این خط فقط بیمه است.

- [ ] **Step 3: ساخت `package.json`**

```json
{
  "name": "crypto-glossary",
  "private": true,
  "type": "module"
}
```

بدون `dependencies`. تنها دلیل وجودش این است که Node فایل‌های `.js` را ES module بخواند تا تست‌ها بتوانند از `assets/js/` import کنند.

- [ ] **Step 4: نوشتن `serve.js`**

```js
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname);
const PORT = Number(process.env.PORT) || 8000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    // درصدکد خراب مثل /%zz — بدون این، URIError پرتاب می‌شود، به
    // rejection مدیریت‌نشده تبدیل می‌شود و کل سرور را می‌کشد.
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }

  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = join(ROOT, normalize(pathname));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`سرو می‌شود روی http://localhost:${PORT}`);
});
```

`Cache-Control: no-store` عمدی است: موقع نوشتن مدخل، کش مرورگر باعث می‌شود تغییرات JSON دیده نشوند و وقت زیادی هدر برود.

- [ ] **Step 5: نوشتن `index.html`**

```html
<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>دانشنامه کریپتو</title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <header class="topbar">
    <a class="brand" id="brand" href="#/">دانشنامه کریپتو</a>
    <div class="controls">
      <div class="viewtoggle" id="view-toggle" hidden>
        <button type="button" data-view="topical"></button>
        <button type="button" data-view="alphabetical"></button>
      </div>
      <button type="button" class="langtoggle" id="lang-toggle">English</button>
    </div>
  </header>

  <div class="errors" id="errors" hidden></div>

  <div class="searchbar" id="searchbar" hidden>
    <input type="search" id="search" autocomplete="off" spellcheck="false">
  </div>

  <main id="main"></main>

  <script type="module" src="assets/js/app.js"></script>
</body>
</html>
```

`#view-toggle` و `#searchbar` با `hidden` شروع می‌شوند چون فقط در نمای فهرست معنی دارند؛ `app.js` در تسک ۸ آن‌ها را کنترل می‌کند. `<script>` هنوز به فایلی اشاره می‌کند که وجود ندارد — این تا تسک ۶ یک خطای ۴۰۴ در کنسول می‌دهد که انتظارش را داریم.

- [ ] **Step 6: نوشتن `assets/css/style.css` (پایه)**

```css
:root {
  --bg: #0d1117;
  --surface: #161b22;
  --border: #262d38;
  --text: #d5dae1;
  --muted: #8a94a3;
  --accent: #2dd4bf;
  --danger: #f87171;
  --radius: 10px;
  --measure: 70ch;
}

* { box-sizing: border-box; }

html, body { margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: "Vazirmatn", "IRANSans", "Segoe UI", Tahoma, system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.9;
  -webkit-text-size-adjust: 100%;
}

code, kbd, .mono {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.92em;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.brand { font-weight: 700; font-size: 1.1rem; color: var(--text); }
.controls { display: flex; align-items: center; gap: 0.75rem; }

button {
  font: inherit;
  color: var(--text);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.35rem 0.8rem;
  cursor: pointer;
}
button:hover { border-color: var(--accent); }

main {
  max-width: var(--measure);
  margin: 0 auto;
  padding: 1.5rem 1.25rem 4rem;
}

.errors {
  border: 1px solid var(--danger);
  background: rgba(248, 113, 113, 0.08);
  color: var(--danger);
  margin: 1rem;
  padding: 0.9rem 1.1rem;
  border-radius: var(--radius);
}

.searchbar { max-width: var(--measure); margin: 1.25rem auto 0; padding: 0 1.25rem; }

.searchbar input {
  width: 100%;
  font: inherit;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.6rem 0.9rem;
}
/* outline فقط برای فوکوس ماوس برداشته می‌شود. بدون :not(:focus-visible)
   این قانون با specificity بالاترش حلقه‌ی فوکوس کیبورد را می‌خورد —
   دقیقاً روی عنصری که میان‌بر / به آن فوکوس می‌دهد. */
.searchbar input:focus { border-color: var(--accent); }
.searchbar input:focus:not(:focus-visible) { outline: none; }
```

فونت‌های `Vazirmatn` و `IRANSans` عمداً فقط به عنوان نام محلی می‌آیند — اگر روی سیستم کاربر نصب باشند استفاده می‌شوند، وگرنه به فونت سیستمی برمی‌گردد. هیچ `@font-face` و هیچ دانلودی در کار نیست.

- [ ] **Step 7: اجرای سرور و بررسی**

```bash
node serve.js
```

در ترمینال دیگری:

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:8000/
```

انتظار: `200 text/html; charset=utf-8`

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8000/assets/css/style.css
```

انتظار: `200`

```bash
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:8000/../../../etc/passwd'
```

انتظار: `404` (نه `200`). اگر `200` گرفتید، بررسی مسیر در `serve.js` شکسته است و باید قبل از ادامه درست شود.

```bash
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:8000/%zz'
```

انتظار: `400`. بلافاصله بعدش:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8000/
```

انتظار: `200`. این دومی تست اصلی است — سرور باید هنوز زنده باشد. اگر `000` گرفتید یعنی `decodeURIComponent` بیرون از `try` مانده و پروسه را کشته.

سرور را با `Ctrl+C` ببندید.

- [ ] **Step 8: کامیت**

```bash
git add .gitignore package.json serve.js index.html assets/css/style.css
git commit -m "chore: project skeleton, static dev server, base styles"
```

---

## Task 2: داده‌های نمونه و ماژول `data.js`

**Files:**
- Create: `data/categories.json`
- Create: `data/entries/basics.json`
- Create: `data/entries/consensus.json`
- Create: `assets/js/data.js`
- Test: `test/data.test.mjs`

**Interfaces:**
- Consumes: هیچ‌چیز از تسک‌های قبل
- Produces:
  - `validate(categories, entries) -> Array<{file: string, id: string, message: string}>` — خالص
  - `localized(entry, lang) -> {title, short, body, example, svg, untranslated}` — خالص
  - `loadAll(basePath = 'data') -> Promise<{categories, entries, errors}>` — `entries` هر عضوش فیلد `category` گرفته که برابر `id` دسته است

- [ ] **Step 1: نوشتن تست‌های شکست‌خورده در `test/data.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, localized } from '../assets/js/data.js';

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
  assert.equal(localized(e, 'fa').svg, '<svg id="shared"></svg>');
  assert.equal(localized(e, 'en').svg, '<svg id="en"></svg>');
});

test('example اختیاری است و نبودش رشته‌ی خالی می‌دهد', () => {
  assert.equal(localized(entry(), 'fa').example, '');
});
```

- [ ] **Step 2: اجرای تست‌ها برای اطمینان از شکست**

```bash
node --test test/data.test.mjs
```

انتظار: شکست با پیامی شبیه `Cannot find module .../assets/js/data.js`

- [ ] **Step 3: نوشتن `assets/js/data.js`**

```js
const REQUIRED_FIELDS = ['title', 'short', 'body'];

/**
 * اعتبارسنجی خالص. هیچ fetch و هیچ DOM.
 * @returns آرایه‌ی خطاها؛ خالی یعنی سالم.
 */
export function validate(categories, entries) {
  const errors = [];
  const seenIds = new Map();

  for (const entry of entries) {
    if (typeof entry !== 'object' || entry === null) {
      errors.push({ file: '?', id: '(نامعتبر)', message: 'مدخل یک آبجکت نیست' });
      continue;
    }

    const file = `${entry.category ?? '?'}.json`;

    if (!entry.id) {
      errors.push({ file, id: '(بدون شناسه)', message: 'مدخل فیلد id ندارد' });
      continue;
    }

    if (seenIds.has(entry.id)) {
      errors.push({
        file,
        id: entry.id,
        message: `id تکراری است؛ قبلاً در ${seenIds.get(entry.id)} آمده`,
      });
    } else {
      seenIds.set(entry.id, file);
    }

    if (!entry.fa) {
      errors.push({ file, id: entry.id, message: 'بلاک fa وجود ندارد' });
    } else {
      for (const field of REQUIRED_FIELDS) {
        if (!entry.fa[field]) {
          errors.push({ file, id: entry.id, message: `fa.${field} خالی یا جاافتاده است` });
        }
      }
    }

    if (entry.en) {
      for (const field of REQUIRED_FIELDS) {
        if (!entry.en[field]) {
          errors.push({ file, id: entry.id, message: `en.${field} خالی یا جاافتاده است` });
        }
      }
    }
  }

  const knownIds = new Set(entries.map((entry) => entry.id).filter(Boolean));
  for (const entry of entries) {
    if (!entry.id) continue;
    for (const ref of entry.related ?? []) {
      if (!knownIds.has(ref)) {
        errors.push({
          file: `${entry.category ?? '?'}.json`,
          id: entry.id,
          message: `related به «${ref}» اشاره می‌کند که هیچ مدخلی با آن id وجود ندارد`,
        });
      }
    }
  }

  return errors;
}

/**
 * محتوای یک مدخل در زبان خواسته‌شده، با برگشت به فارسی اگر آن زبان نباشد.
 */
export function localized(entry, lang) {
  const block = entry[lang] ?? entry.fa;
  return {
    title: block.title,
    short: block.short,
    body: block.body,
    example: block.example ?? '',
    svg: block.svg ?? entry.svg ?? '',
    untranslated: !entry[lang],
  };
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`خوانده نشد (HTTP ${response.status})`);
  try {
    return await response.json();
  } catch {
    throw new Error('JSON نامعتبر است');
  }
}

/**
 * همه‌ی دسته‌ها و مدخل‌ها را لود می‌کند. هرگز throw نمی‌کند —
 * هر شکستی به صورت یک خطا در آرایه‌ی errors برمی‌گردد تا سایت بالا بیاید.
 */
export async function loadAll(basePath = 'data') {
  let categories;
  try {
    categories = await fetchJson(`${basePath}/categories.json`);
  } catch (error) {
    return {
      categories: [],
      entries: [],
      errors: [{ file: 'categories.json', id: '', message: error.message }],
    };
  }

  // بدون این، یک categories.json که آرایه نیست حلقه‌ی پایین را با
  // TypeError می‌ترکاند و قرارداد «loadAll هرگز throw نمی‌کند» می‌شکند.
  if (!Array.isArray(categories)) {
    return {
      categories: [],
      entries: [],
      errors: [{ file: 'categories.json', id: '', message: 'محتوای فایل باید یک آرایه باشد' }],
    };
  }

  const errors = [];
  const entries = [];

  for (const category of categories) {
    try {
      const raw = await fetchJson(`${basePath}/entries/${category.file}`);
      if (!Array.isArray(raw)) throw new Error('محتوای فایل باید یک آرایه باشد');
      for (const entry of raw) {
        entries.push({ ...entry, category: category.id });
      }
    } catch (error) {
      errors.push({ file: category.file, id: '', message: error.message });
    }
  }

  errors.push(...validate(categories, entries));

  // مدخلی که fa.title ندارد در هیچ نمایی قابل رندر نیست — localized()
  // روی آن استثنا می‌دهد و چون استثنا از renderIndex بیرون می‌زند، یک
  // مدخل خراب کل فهرست را سفید می‌کند. سند طراحی این را ممنوع کرده:
  // «خطا نباید کل صفحه را از کار بیندازد». پس حذفش می‌کنیم ولی خطایش
  // در errors می‌ماند تا نوار قرمز و خودآزمایی گزارشش کنند.
  // خطاهای نرم‌تر (related شکسته، نبود بلاک en) مدخل را حذف نمی‌کنند.
  const renderable = entries.filter((entry) => entry.fa?.title);

  return { categories, entries: renderable, errors };
}
```

- [ ] **Step 4: اجرای تست‌ها برای اطمینان از قبولی**

```bash
node --test test/data.test.mjs
```

انتظار: همه‌ی ۱۳ تست PASS.

- [ ] **Step 5: ساخت `data/categories.json`**

```json
[
  { "id": "basics",    "file": "basics.json",    "fa": "مفاهیم پایه", "en": "Fundamentals" },
  { "id": "consensus", "file": "consensus.json", "fa": "اجماع",       "en": "Consensus" }
]
```

- [ ] **Step 6: ساخت `data/entries/basics.json`**

```json
[
  {
    "id": "blockchain",
    "tags": ["ledger", "bitcoin", "structure"],
    "related": ["hash", "proof-of-work"],
    "svg": "<svg viewBox=\"0 0 320 80\" role=\"img\" aria-label=\"زنجیره بلوک\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"8\" y=\"20\" width=\"80\" height=\"40\" rx=\"6\"/><rect x=\"120\" y=\"20\" width=\"80\" height=\"40\" rx=\"6\"/><rect x=\"232\" y=\"20\" width=\"80\" height=\"40\" rx=\"6\"/><path d=\"M88 40h32M200 40h32\"/></g><g fill=\"currentColor\" font-size=\"11\" text-anchor=\"middle\" font-family=\"monospace\"><text x=\"48\" y=\"44\">#1</text><text x=\"160\" y=\"44\">#2</text><text x=\"272\" y=\"44\">#3</text></g></svg>",
    "fa": {
      "title": "بلاکچین",
      "short": "دفتر کلی که رکوردها را در بلوک‌های زنجیرشده‌ی تغییرناپذیر نگه می‌دارد",
      "body": "<p>بلاکچین یک دفتر کل است که رکوردها را در دسته‌هایی به نام «بلوک» می‌نویسد. هر بلوک هش بلوک قبلی را در خودش دارد، پس بلوک‌ها مثل حلقه‌های یک زنجیر به هم وصل می‌شوند.</p><p>همین ارجاع به عقب است که دفتر را تغییرناپذیر می‌کند: اگر کسی یک بلوک قدیمی را دستکاری کند، هش آن عوض می‌شود، در نتیجه ارجاع بلوک بعدی نامعتبر می‌شود و همین‌طور تا انتهای زنجیره. برای پنهان ماندن دستکاری باید همه‌ی بلوک‌های بعدی هم دوباره ساخته شوند.</p><p>نسخه‌ای از این دفتر روی هر نود شبکه نگه‌داری می‌شود و نودها با یک الگوریتم <span dir=\"ltr\">consensus</span> سر اینکه کدام نسخه معتبر است به توافق می‌رسند.</p>",
      "example": "<p>در بیت‌کوین حدوداً هر ۱۰ دقیقه یک بلوک جدید ساخته می‌شود و تراکنش‌های آن بازه را در خود جا می‌دهد.</p>"
    },
    "en": {
      "title": "Blockchain",
      "short": "A ledger that stores records in an append-only chain of blocks",
      "body": "<p>A blockchain is a ledger that writes records in batches called blocks. Each block carries the hash of the block before it, which links them together like the links of a chain.</p><p>That backwards reference is what makes the ledger tamper-evident: altering an old block changes its hash, which invalidates the next block's reference, and so on to the tip. Hiding the change means rebuilding every block that follows.</p><p>Every node on the network keeps a copy, and the nodes agree on which copy is canonical through a consensus algorithm.</p>",
      "example": "<p>Bitcoin produces roughly one block every ten minutes, holding the transactions from that window.</p>"
    }
  },
  {
    "id": "hash",
    "tags": ["crypto", "structure"],
    "related": ["blockchain", "nonce"],
    "fa": {
      "title": "هش",
      "short": "اثر انگشتی با طول ثابت که از هر حجم داده‌ای ساخته می‌شود",
      "body": "<p>تابع هش رمزنگارانه هر ورودی با هر طولی را می‌گیرد و یک خروجی با طول ثابت می‌دهد — مثلاً <span dir=\"ltr\">SHA-256</span> همیشه ۲۵۶ بیت برمی‌گرداند.</p><p>سه خاصیت آن را در بلاکچین بنیادی می‌کند: یک ورودی مشخص همیشه همان خروجی را می‌دهد، از روی خروجی نمی‌شود ورودی را بازسازی کرد، و کوچک‌ترین تغییر در ورودی خروجی را به‌کلی عوض می‌کند.</p>",
      "example": "<p>هش <span dir=\"ltr\">SHA-256</span> واژه‌ی <span dir=\"ltr\">hello</span> با هش <span dir=\"ltr\">Hello</span> هیچ شباهتی ندارد، با اینکه فقط یک حرف فرق کرده‌اند.</p>"
    },
    "en": {
      "title": "Hash",
      "short": "A fixed-length fingerprint computed from data of any size",
      "body": "<p>A cryptographic hash function takes an input of any length and returns an output of fixed length — SHA-256 always returns 256 bits.</p><p>Three properties make it fundamental to blockchains: the same input always produces the same output, the input cannot be recovered from the output, and the smallest change to the input completely changes the output.</p>",
      "example": "<p>The SHA-256 hash of <code>hello</code> looks nothing like the hash of <code>Hello</code>, even though only one letter differs.</p>"
    }
  },
  {
    "id": "wallet",
    "tags": ["keys", "custody"],
    "related": ["hash"],
    "fa": {
      "title": "کیف پول",
      "short": "ابزاری که کلیدهای خصوصی را نگه می‌دارد، نه خود دارایی را",
      "body": "<p>برخلاف چیزی که اسمش القا می‌کند، کیف پول هیچ سکه‌ای در خود ندارد. دارایی‌ها روی خود بلاکچین ثبت‌اند؛ چیزی که کیف پول نگه می‌دارد <strong>کلید خصوصی</strong> است — عددی که با آن می‌شود تراکنش‌ها را امضا کرد.</p><p>از کلید خصوصی، کلید عمومی و از آن آدرس ساخته می‌شود. آدرس را می‌شود آزادانه منتشر کرد؛ کلید خصوصی را هرگز.</p><p>نتیجه‌ی مستقیم این ساختار: هرکس کلید خصوصی را داشته باشد مالک است. گم شدن کلید یعنی گم شدن دارایی، بدون هیچ راه بازیابی.</p>"
    },
    "en": {
      "title": "Wallet",
      "short": "A tool that holds private keys, not the assets themselves",
      "body": "<p>Despite the name, a wallet holds no coins. The assets live on the blockchain itself; what the wallet stores is a <strong>private key</strong> — the number used to sign transactions.</p><p>The private key derives a public key, which derives an address. The address can be shared freely; the private key never.</p><p>This has a direct consequence: whoever holds the private key is the owner. Losing the key means losing the assets, with no recovery path.</p>"
    }
  }
]
```

- [ ] **Step 7: ساخت `data/entries/consensus.json`**

```json
[
  {
    "id": "proof-of-work",
    "tags": ["mining", "consensus", "bitcoin"],
    "related": ["hash", "nonce", "blockchain"],
    "fa": {
      "title": "اثبات کار",
      "short": "اثبات اینکه برای ساخت یک بلوک، محاسبات واقعی خرج شده است",
      "body": "<p>اثبات کار سازوکاری است که مشخص می‌کند چه کسی حق دارد بلوک بعدی را به زنجیره اضافه کند. شبکه یک هدف عددی تعیین می‌کند و ماینرها باید بلوکی بسازند که هش آن از آن هدف کوچک‌تر باشد.</p><p>چون خروجی تابع هش قابل پیش‌بینی نیست، تنها راه، امتحان کردن است: عدد <span dir=\"ltr\">nonce</span> را عوض کن، دوباره هش بگیر، تکرار کن. این یعنی میلیاردها تلاش در ثانیه.</p><p>نکته‌ی اصلی در نامتقارن بودن است — پیدا کردن جواب بسیار پرهزینه است، ولی بررسی درستی آن برای بقیه‌ی شبکه فقط یک بار هش گرفتن است.</p>",
      "example": "<p>شبکه‌ی بیت‌کوین سختی این هدف را هر ۲۰۱۶ بلوک تنظیم می‌کند تا فاصله‌ی بلوک‌ها حدود ۱۰ دقیقه بماند.</p>"
    },
    "en": {
      "title": "Proof of Work",
      "short": "Evidence that real computation was spent to produce a block",
      "body": "<p>Proof of work decides who earns the right to append the next block. The network sets a numeric target, and miners must produce a block whose hash falls below it.</p><p>Because hash output is unpredictable, the only strategy is to try: change the nonce, hash again, repeat — billions of attempts per second.</p><p>The asymmetry is the point. Finding an answer is expensive; checking one costs the rest of the network a single hash.</p>",
      "example": "<p>Bitcoin retargets that difficulty every 2016 blocks to keep block spacing near ten minutes.</p>"
    }
  },
  {
    "id": "nonce",
    "tags": ["mining", "consensus"],
    "related": ["proof-of-work", "hash"],
    "fa": {
      "title": "نانس",
      "short": "عدد یک‌بارمصرفی که ماینر تغییرش می‌دهد تا هش دلخواه پیدا شود",
      "body": "<p><span dir=\"ltr\">nonce</span> کوتاه‌شده‌ی <span dir=\"ltr\">number used once</span> است — فیلدی در هدر بلوک که هیچ معنای دیگری ندارد جز اینکه بشود آزادانه عوضش کرد.</p><p>ماینر بقیه‌ی هدر بلوک را ثابت نگه می‌دارد و فقط نانس را یکی‌یکی بالا می‌برد و هر بار هش می‌گیرد. چون تغییر کوچک ورودی خروجی را کاملاً عوض می‌کند، هر نانس یک شانس تازه است.</p>"
    }
  }
]
```

مدخل `nonce` عمداً بلاک `en` ندارد — تسک‌های ۶، ۷ و ۹ باید نشان «ترجمه نشده» را روی همین مدخل نشان بدهند.

- [ ] **Step 8: نوشتن `test/data-files.test.mjs`**

این فایل برخلاف بقیه‌ی تست‌ها داده‌ی واقعی روی دیسک را می‌خواند. ارزشش این است که بعد از افزودن هر مدخل جدید، `node --test` قبل از باز کردن مرورگر خطا را بگیرد.

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validate } from '../assets/js/data.js';

function readJson(path) {
  return JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
}

const categories = readJson('data/categories.json');

const entries = categories.flatMap((category) =>
  readJson(`data/entries/${category.file}`).map((entry) => ({ ...entry, category: category.id })),
);

test('categories.json آرایه است و هر دسته فیلدهای لازم را دارد', () => {
  assert.ok(Array.isArray(categories));
  assert.ok(categories.length > 0);
  for (const category of categories) {
    for (const field of ['id', 'file', 'fa', 'en']) {
      assert.ok(category[field], `دسته‌ی ${category.id ?? '?'} فیلد ${field} ندارد`);
    }
  }
});

test('هر فایل مدخل یک آرایه‌ی معتبر است', () => {
  for (const category of categories) {
    assert.ok(Array.isArray(readJson(`data/entries/${category.file}`)), category.file);
  }
});

test('هیچ مدخلی فیلد category ندارد — دسته از نام فایل می‌آید', () => {
  for (const category of categories) {
    for (const entry of readJson(`data/entries/${category.file}`)) {
      assert.equal(entry.category, undefined, `${entry.id} نباید فیلد category داشته باشد`);
    }
  }
});

test('هشتگ‌ها انگلیسی، حروف کوچک و بدون # هستند', () => {
  for (const entry of entries) {
    for (const tag of entry.tags ?? []) {
      assert.match(tag, /^[a-z0-9-]+$/, `هشتگ نامعتبر «${tag}» در ${entry.id}`);
    }
  }
});

test('داده‌ی واقعی روی دیسک هیچ خطای اعتبارسنجی ندارد', () => {
  const errors = validate(categories, entries);
  assert.deepEqual(errors, [], errors.map((e) => `${e.file} › ${e.id} — ${e.message}`).join('\n'));
});
```

`readJson` عمداً `import.meta.url` را مبنا می‌گیرد تا تست از هر پوشه‌ای اجرا شود و به مسیر جاری وابسته نباشد.

- [ ] **Step 9: اجرای تست‌های داده**

```bash
node --test test/data.test.mjs test/data-files.test.mjs
```

انتظار: ۱۸ تست PASS. اگر `SyntaxError` گرفتید، احتمالاً یک `"` داخل رشته‌ی SVG بدون `\` مانده است.

- [ ] **Step 10: کامیت**

```bash
git add assets/js/data.js test/data.test.mjs test/data-files.test.mjs data/
git commit -m "feat: data loading, validation, and seed entries"
```

---

## Task 3: ماژول `i18n.js`

**Files:**
- Create: `assets/js/i18n.js`

**Interfaces:**
- Consumes: هیچ‌چیز
- Produces:
  - `LANGS = ['fa', 'en']`
  - `current() -> 'fa' | 'en'`
  - `set(lang) -> void` — در `localStorage` ذخیره می‌کند و `dir`/`lang` را روی `<html>` اعمال می‌کند
  - `t(key) -> string`
  - `dirFor(lang) -> 'rtl' | 'ltr'`
  - `applyToDocument() -> void`

این ماژول به `document` و `localStorage` دست می‌زند، پس در Node تست نمی‌شود؛ بررسی‌اش در مرورگر و از طریق تسک ۸ انجام می‌شود.

- [ ] **Step 1: نوشتن `assets/js/i18n.js`**

```js
const STORAGE_KEY = 'glossary:lang';
const DEFAULT_LANG = 'fa';

export const LANGS = ['fa', 'en'];

/** export شده فقط برای اینکه تست بتواند همسانی کلیدهای دو زبان را بررسی کند. */
export const STRINGS = {
  fa: {
    'app.title': 'دانشنامه کریپتو',
    'lang.switch': 'English',
    'search.placeholder': 'جستجو در مدخل‌ها…',
    'search.empty': 'مدخلی یافت نشد',
    'search.clear': 'پاک کردن جستجو',
    'view.topical': 'موضوعی',
    'view.alphabetical': 'الفبایی',
    'nav.index': 'فهرست',
    'entry.example': 'مثال',
    'entry.related': 'مدخل‌های مرتبط',
    'entry.untranslated': 'این مدخل هنوز ترجمه‌ی انگلیسی ندارد؛ متن فارسی نمایش داده می‌شود.',
    'entry.notFound': 'مدخل یافت نشد',
    'entry.notFoundHint': 'مدخلی با این شناسه وجود ندارد. شاید هنوز نوشته نشده باشد.',
    'entry.back': 'بازگشت به فهرست',
    'tag.filtered': 'فیلترشده با هشتگ',
    'tag.clear': 'برداشتن فیلتر',
    'errors.heading': 'خطای اعتبارسنجی داده',
    'selftest.title': 'خودآزمایی',
    'selftest.counts': 'شمار مدخل‌ها به تفکیک دسته',
    'selftest.renderErrors': 'خطاهای رندر',
    'selftest.validation': 'خطاهای اعتبارسنجی',
    'selftest.untranslated': 'مدخل‌های بدون ترجمه‌ی انگلیسی',
    'selftest.pass': 'هیچ موردی نیست',
    'selftest.total': 'مجموع',
  },
  en: {
    'app.title': 'Crypto Glossary',
    'lang.switch': 'فارسی',
    'search.placeholder': 'Search entries…',
    'search.empty': 'No entries found',
    'search.clear': 'Clear search',
    'view.topical': 'By topic',
    'view.alphabetical': 'A–Z',
    'nav.index': 'Index',
    'entry.example': 'Example',
    'entry.related': 'Related entries',
    'entry.untranslated': 'This entry has no English translation yet; the Persian text is shown.',
    'entry.notFound': 'Entry not found',
    'entry.notFoundHint': 'No entry has this id. It may not be written yet.',
    'entry.back': 'Back to index',
    'tag.filtered': 'Filtered by tag',
    'tag.clear': 'Clear filter',
    'errors.heading': 'Data validation errors',
    'selftest.title': 'Self-test',
    'selftest.counts': 'Entry count per category',
    'selftest.renderErrors': 'Render errors',
    'selftest.validation': 'Validation errors',
    'selftest.untranslated': 'Entries without an English translation',
    'selftest.pass': 'Nothing to report',
    'selftest.total': 'Total',
  },
};

function readStored() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(stored) ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

let lang = readStored();

export function current() {
  return lang;
}

export function dirFor(which) {
  return which === 'fa' ? 'rtl' : 'ltr';
}

export function t(key) {
  return STRINGS[lang][key] ?? STRINGS[DEFAULT_LANG][key] ?? key;
}

export function applyToDocument() {
  document.documentElement.lang = lang;
  document.documentElement.dir = dirFor(lang);
}

export function set(next) {
  if (!LANGS.includes(next)) return;
  lang = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // حالت خصوصی مرورگر؛ زبان فقط در همین نشست می‌ماند
  }
  applyToDocument();
}

export function toggle() {
  set(lang === 'fa' ? 'en' : 'fa');
}
```

`try/catch` دور `localStorage` لازم است: در حالت مرور خصوصی بعضی مرورگرها روی خواندن یا نوشتن استثنا پرتاب می‌کنند و بدون آن کل برنامه بالا نمی‌آید.

- [ ] **Step 2: نوشتن `test/i18n.test.mjs`**

این ماژول در Node قابل import است چون هر دسترسی به `localStorage` داخل `try/catch` است و در محیط بدون مرورگر بی‌سروصدا به پیش‌فرض برمی‌گردد.

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS, LANGS, current, dirFor, t } from '../assets/js/i18n.js';

test('هر دو زبان دقیقاً یک مجموعه کلید دارند', () => {
  const [fa, en] = LANGS.map((lang) => Object.keys(STRINGS[lang]).sort());
  assert.deepEqual(fa, en);
});

test('هیچ رشته‌ای خالی نیست', () => {
  for (const lang of LANGS) {
    for (const [key, value] of Object.entries(STRINGS[lang])) {
      assert.ok(value.trim().length > 0, `${lang}.${key} خالی است`);
    }
  }
});

test('زبان پیش‌فرض بیرون از مرورگر فارسی است', () => {
  assert.equal(current(), 'fa');
});

test('dirFor جهت درست را می‌دهد', () => {
  assert.equal(dirFor('fa'), 'rtl');
  assert.equal(dirFor('en'), 'ltr');
});

test('t کلید ناشناخته را به جای پرتاب استثنا خودش را برمی‌گرداند', () => {
  assert.equal(t('no.such.key'), 'no.such.key');
});
```

- [ ] **Step 3: اجرای تست‌ها**

```bash
node --test test/i18n.test.mjs
```

انتظار: ۵ تست PASS. اگر تست اول شکست، پیام تفاوت دقیقاً می‌گوید کدام کلید در کدام زبان جا افتاده.

- [ ] **Step 4: کامیت**

```bash
git add assets/js/i18n.js test/i18n.test.mjs
git commit -m "feat: i18n module with fa/en UI strings and direction handling"
```

---

## Task 4: ماژول `search.js`

**Files:**
- Create: `assets/js/search.js`
- Test: `test/search.test.mjs`

**Interfaces:**
- Consumes: شکل مدخل از تسک ۲ (`entry.tags`، `entry.fa.title`، `entry.fa.short`، `entry.en?`)
- Produces:
  - `normalize(text) -> string` — خالص
  - `filterEntries(entries, { query, tag }) -> Array<entry>` — خالص، ترتیب ورودی را حفظ می‌کند

- [ ] **Step 1: نوشتن تست‌های شکست‌خورده در `test/search.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, filterEntries } from '../assets/js/search.js';

const ENTRIES = [
  {
    id: 'proof-of-work',
    tags: ['mining', 'consensus'],
    fa: { title: 'اثبات کار', short: 'اثبات خرج شدن محاسبات', body: '' },
    en: { title: 'Proof of Work', short: 'Evidence of spent computation', body: '' },
  },
  {
    id: 'nonce',
    tags: ['mining'],
    fa: { title: 'نانس', short: 'عدد یک‌بارمصرف', body: '' },
  },
  {
    id: 'wallet',
    tags: ['keys'],
    fa: { title: 'کیف پول', short: 'نگهدارنده‌ی کلید خصوصی', body: '' },
    en: { title: 'Wallet', short: 'Holder of private keys', body: '' },
  },
];

test('normalize یای عربی را به فارسی تبدیل می‌کند', () => {
  assert.equal(normalize('\u064Aک'), normalize('\u06CCک'));
});

test('normalize کاف عربی را به فارسی تبدیل می‌کند', () => {
  assert.equal(normalize('\u0643ار'), normalize('\u06A9ار'));
});

test('normalize نیم‌فاصله را به فاصله تبدیل می‌کند', () => {
  assert.equal(normalize('اثبات\u200Cکار'), 'اثبات کار');
});

test('normalize حروف بزرگ را کوچک می‌کند و فاصله‌ها را جمع می‌کند', () => {
  assert.equal(normalize('  Proof   OF  Work '), 'proof of work');
});

test('normalize ورودی خالی و undefined را تحمل می‌کند', () => {
  assert.equal(normalize(undefined), '');
  assert.equal(normalize(null), '');
});

test('جستجوی خالی همه را برمی‌گرداند', () => {
  assert.equal(filterEntries(ENTRIES, {}).length, 3);
  assert.equal(filterEntries(ENTRIES, { query: '   ' }).length, 3);
});

test('جستجو در عنوان فارسی کار می‌کند', () => {
  const found = filterEntries(ENTRIES, { query: 'اثبات' });
  assert.deepEqual(found.map((e) => e.id), ['proof-of-work']);
});

test('جستجوی انگلیسی مدخل را پیدا می‌کند حتی وقتی کاربر روی فارسی است', () => {
  const found = filterEntries(ENTRIES, { query: 'proof' });
  assert.deepEqual(found.map((e) => e.id), ['proof-of-work']);
});

test('جستجو در توضیح کوتاه هم انجام می‌شود', () => {
  const found = filterEntries(ENTRIES, { query: 'یک‌بارمصرف' });
  assert.deepEqual(found.map((e) => e.id), ['nonce']);
});

test('جستجو در هشتگ‌ها انجام می‌شود', () => {
  const found = filterEntries(ENTRIES, { query: 'mining' });
  assert.deepEqual(found.map((e) => e.id), ['proof-of-work', 'nonce']);
});

test('جستجو با یای عربی هم مدخل فارسی را پیدا می‌کند', () => {
  const found = filterEntries(ENTRIES, { query: 'ک\u064Aف' });
  assert.deepEqual(found.map((e) => e.id), ['wallet']);
});

test('مدخل بدون بلاک en باعث خطا نمی‌شود', () => {
  assert.doesNotThrow(() => filterEntries(ENTRIES, { query: 'x' }));
});

test('فیلتر هشتگ فقط مدخل‌های آن هشتگ را می‌دهد', () => {
  const found = filterEntries(ENTRIES, { tag: 'keys' });
  assert.deepEqual(found.map((e) => e.id), ['wallet']);
});

test('فیلتر هشتگ تطبیق کامل است نه جزئی', () => {
  assert.equal(filterEntries(ENTRIES, { tag: 'min' }).length, 0);
});

test('هشتگ و جستجو با هم اعمال می‌شوند', () => {
  const found = filterEntries(ENTRIES, { tag: 'mining', query: 'نانس' });
  assert.deepEqual(found.map((e) => e.id), ['nonce']);
});

test('نتیجه‌ی بی‌تطابق آرایه‌ی خالی است', () => {
  assert.deepEqual(filterEntries(ENTRIES, { query: 'zzzz' }), []);
});

test('ترتیب ورودی حفظ می‌شود', () => {
  const found = filterEntries(ENTRIES, { query: '' });
  assert.deepEqual(found.map((e) => e.id), ['proof-of-work', 'nonce', 'wallet']);
});

test('آرایه‌ی ورودی تغییر داده نمی‌شود', () => {
  const copy = [...ENTRIES];
  filterEntries(ENTRIES, { query: 'proof' });
  assert.deepEqual(ENTRIES, copy);
});
```

- [ ] **Step 2: اجرای تست‌ها برای اطمینان از شکست**

```bash
node --test test/search.test.mjs
```

انتظار: شکست با `Cannot find module .../assets/js/search.js`

- [ ] **Step 3: نوشتن `assets/js/search.js`**

```js
// این‌ها عمداً با کد نوشته شده‌اند، نه با خود کاراکتر: یای عربی و یای
// فارسی روی صفحه دقیقاً یک‌شکل‌اند و نیم‌فاصله اصلاً دیده نمی‌شود.
const ARABIC_YEH  = /\u064A/g;   // ی عربی
const PERSIAN_YEH = '\u06CC';    // ی فارسی
const ARABIC_KAF  = /\u0643/g;   // ک عربی
const PERSIAN_KAF = '\u06A9';    // ک فارسی
const DIACRITICS  = /[\u064B-\u0652]/g; // اعراب
const ZWNJ        = /\u200C/g;   // نیم‌فاصله
// ارقام فارسی و عربی به ارقام لاتین — کاربر «۲۵۶» می‌زند و باید
// «SHA-256» را پیدا کند. متن فارسی مدخل‌ها خودش ارقام فارسی دارد.
const PERSIAN_DIGITS = /[\u06F0-\u06F9]/g;
const ARABIC_DIGITS  = /[\u0660-\u0669]/g;

/**
 * یکسان‌سازی متن برای مقایسه. فارسی روی صفحه‌کلیدهای مختلف با
 * کدهای متفاوتی تایپ می‌شود؛ بدون این تابع «کیف» تایپ‌شده با
 * صفحه‌کلید عربی هرگز «کیف» فارسی را پیدا نمی‌کند.
 */
export function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(ARABIC_YEH, PERSIAN_YEH)
    .replace(ARABIC_KAF, PERSIAN_KAF)
    .replace(DIACRITICS, '')
    .replace(ZWNJ, ' ')
    .replace(PERSIAN_DIGITS, (d) => String(d.codePointAt(0) - 0x06F0))
    .replace(ARABIC_DIGITS, (d) => String(d.codePointAt(0) - 0x0660))
    .replace(/\s+/g, ' ')
    .trim();
}

function haystack(entry) {
  const parts = [entry.id, ...(entry.tags ?? [])];
  for (const lang of ['fa', 'en']) {
    const block = entry[lang];
    if (block) parts.push(block.title, block.short);
  }
  return normalize(parts.filter(Boolean).join(' '));
}

/**
 * فیلتر مدخل‌ها بر اساس عبارت جستجو و هشتگ. هر دو زبان هم‌زمان
 * جستجو می‌شوند تا زبان جاری روی نتیجه اثر نگذارد.
 */
export function filterEntries(entries, { query = '', tag = '' } = {}) {
  const needle = normalize(query);
  const wantedTag = normalize(tag);

  return entries.filter((entry) => {
    if (wantedTag) {
      const tags = (entry.tags ?? []).map(normalize);
      if (!tags.includes(wantedTag)) return false;
    }
    if (!needle) return true;
    return haystack(entry).includes(needle);
  });
}
```

- [ ] **Step 4: اجرای تست‌ها برای اطمینان از قبولی**

```bash
node --test test/search.test.mjs
```

انتظار: همه‌ی ۱۸ تست PASS.

- [ ] **Step 5: کامیت**

```bash
git add assets/js/search.js test/search.test.mjs
git commit -m "feat: search filtering with Persian text normalization"
```

---

## Task 5: ماژول `router.js`

**Files:**
- Create: `assets/js/router.js`
- Test: `test/router.test.mjs`

**Interfaces:**
- Consumes: هیچ‌چیز
- Produces:
  - `parseHash(hash) -> {view: 'index'|'entry'|'self-test', id?: string, tag?: string}` — خالص
  - `start(onChange) -> void` — به `hashchange` گوش می‌دهد و یک بار هم فوراً صدا می‌زند
  - `go(path) -> void`

- [ ] **Step 1: نوشتن تست‌های شکست‌خورده در `test/router.test.mjs`**

```js
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

test('درصدکد نامعتبر باعث پرتاب استثنا نمی‌شود و بخش خام برمی‌گردد', () => {
  // فقط doesNotThrow کافی نیست — پیاده‌سازی‌ای که خطا را ببلعد و
  // شکل اشتباه برگرداند هم از آن رد می‌شود. شکل بازگشتی را ادعا کن.
  assert.deepEqual(parseHash('#/t/%E0%A4%A'), { view: 'entry', id: '%E0%A4%A' });
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
```

- [ ] **Step 2: اجرای تست‌ها برای اطمینان از شکست**

```bash
node --test test/router.test.mjs
```

انتظار: شکست با `Cannot find module .../assets/js/router.js`

- [ ] **Step 3: نوشتن `assets/js/router.js`**

```js
function decodePart(part) {
  try {
    return decodeURIComponent(part);
  } catch {
    return part; // درصدکد خراب؛ خام برگردان تا صفحه از کار نیفتد
  }
}

/**
 * تجزیه‌ی خالص هش. هر مسیر ناشناخته به فهرست برمی‌گردد،
 * چون صفحه‌ی سفید بدترین حالت ممکن است.
 */
export function parseHash(hash) {
  const raw = String(hash ?? '').replace(/^#/, '');
  const parts = raw.split('/').filter(Boolean).map(decodePart);

  if (parts[0] === 'self-test') return { view: 'self-test' };
  if (parts[0] === 't' && parts[1]) return { view: 'entry', id: parts[1] };
  if (parts[0] === 'tag' && parts[1]) return { view: 'index', tag: parts[1] };
  return { view: 'index', tag: '' };
}

export function start(onChange) {
  const fire = () => onChange(parseHash(window.location.hash));
  window.addEventListener('hashchange', fire);
  fire();
}

export function go(path) {
  window.location.hash = path;
}
```

- [ ] **Step 4: اجرای تست‌ها برای اطمینان از قبولی**

```bash
node --test test/router.test.mjs
```

انتظار: همه‌ی ۱۱ تست PASS.

- [ ] **Step 5: اجرای کل مجموعه‌ی تست**

```bash
node --test
```

انتظار: `pass 52`، `fail 0`

- [ ] **Step 6: کامیت**

```bash
git add assets/js/router.js test/router.test.mjs
git commit -m "feat: hash router with graceful fallback to index"
```

---

## Task 6: نمای فهرست و اولین اجرای واقعی سایت

پایان این تسک اولین باری است که سایت در مرورگر کار می‌کند.

**Files:**
- Create: `assets/js/render.js`
- Create: `assets/js/app.js`
- Modify: `assets/css/style.css` (افزودن استایل کارت‌ها و دسته‌ها)

**Interfaces:**
- Consumes: `loadAll`، `localized` از `data.js`؛ `t`، `current`، `applyToDocument` از `i18n.js`؛ `start` از `router.js`
- Produces:
  - `el(tag, attrs, ...children) -> HTMLElement` — سازنده‌ی کمکی DOM
  - `renderIndex(entries, categories, { lang, view, tag }) -> HTMLElement`
  - `renderErrorBanner(errors) -> HTMLElement`
  - `entryCard(entry, lang) -> HTMLElement`

- [ ] **Step 1: نوشتن `assets/js/render.js` (بخش فهرست)**

```js
import { localized } from './data.js';
import { t, dirFor } from './i18n.js';

/**
 * سازنده‌ی کوتاه المان. attrs کلید ویژه‌ی `html` دارد که innerHTML
 * را ست می‌کند — فقط برای محتوای مدخل‌ها که در خود ریپو نوشته شده.
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else node.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child);
  }
  return node;
}

/**
 * اگر محتوای نمایش‌داده‌شده فارسی است ولی رابط انگلیسی، جهت را
 * روی همان بلاک برمی‌گردانیم تا متن فارسی وارونه دیده نشود.
 */
function contentDirAttrs(content) {
  if (!content.untranslated) return {};
  return { dir: dirFor('fa'), lang: 'fa' };
}

export function entryCard(entry, lang) {
  const content = localized(entry, lang);
  return el(
    'a',
    { class: 'card', href: `#/t/${encodeURIComponent(entry.id)}`, ...contentDirAttrs(content) },
    el('span', { class: 'card-title' }, content.title),
    el('span', { class: 'card-short' }, content.short),
  );
}

function sortByTitle(entries, lang) {
  return [...entries].sort((a, b) =>
    localized(a, lang).title.localeCompare(localized(b, lang).title, lang),
  );
}

function renderTopical(entries, categories, lang) {
  const wrap = el('div', { class: 'groups' });
  for (const category of categories) {
    const inCategory = entries.filter((entry) => entry.category === category.id);
    if (inCategory.length === 0) continue;
    wrap.append(
      el(
        'section',
        { class: 'group' },
        el(
          'h2',
          { class: 'group-title' },
          el('span', {}, category[lang] ?? category.fa),
          el('span', { class: 'count' }, String(inCategory.length)),
        ),
        el('div', { class: 'cards' }, sortByTitle(inCategory, lang).map((e) => entryCard(e, lang))),
      ),
    );
  }
  return wrap;
}

function renderAlphabetical(entries, lang) {
  return el(
    'div',
    { class: 'cards' },
    sortByTitle(entries, lang).map((entry) => entryCard(entry, lang)),
  );
}

export function renderIndex(entries, categories, { lang, view, tag }) {
  const wrap = el('div', { class: 'index' });

  if (tag) {
    wrap.append(
      el(
        'p',
        { class: 'tagbanner' },
        `${t('tag.filtered')} `,
        el('span', { class: 'tag mono', dir: 'ltr' }, `#${tag}`),
        ' ',
        el('a', { href: '#/' }, t('tag.clear')),
      ),
    );
  }

  if (entries.length === 0) {
    wrap.append(el('p', { class: 'empty' }, t('search.empty')));
    return wrap;
  }

  wrap.append(
    view === 'alphabetical'
      ? renderAlphabetical(entries, lang)
      : renderTopical(entries, categories, lang),
  );
  return wrap;
}

export function renderErrorBanner(errors) {
  return el(
    'div',
    {},
    el('strong', {}, t('errors.heading')),
    el(
      'ul',
      {},
      errors.map((error) =>
        el(
          'li',
          {},
          el('span', { class: 'mono', dir: 'ltr' }, error.id ? `${error.file} › ${error.id}` : error.file),
          ' — ',
          error.message,
        ),
      ),
    ),
  );
}
```

- [ ] **Step 2: نوشتن `assets/js/app.js`**

```js
import { loadAll } from './data.js';
import * as i18n from './i18n.js';
import { filterEntries } from './search.js';
import * as router from './router.js';
import * as view from './render.js';

const VIEW_KEY = 'glossary:index-view';

const dom = {
  main: document.getElementById('main'),
  errors: document.getElementById('errors'),
  brand: document.getElementById('brand'),
  searchbar: document.getElementById('searchbar'),
  search: document.getElementById('search'),
  langToggle: document.getElementById('lang-toggle'),
  viewToggle: document.getElementById('view-toggle'),
};

const state = {
  categories: [],
  entries: [],
  entriesById: new Map(),
  errors: [],
  route: { view: 'index', tag: '' },
  query: '',
  indexView: readIndexView(),
};

function readIndexView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'alphabetical' ? 'alphabetical' : 'topical';
  } catch {
    return 'topical';
  }
}

function render() {
  const lang = i18n.current();
  dom.main.replaceChildren();

  const isIndex = state.route.view === 'index';
  dom.searchbar.hidden = !isIndex;
  dom.viewToggle.hidden = !isIndex;

  if (isIndex) {
    const visible = filterEntries(state.entries, { query: state.query, tag: state.route.tag });
    dom.main.append(view.renderIndex(visible, state.categories, {
      lang,
      view: state.indexView,
      tag: state.route.tag,
    }));
  }
}

function renderChrome() {
  dom.brand.textContent = i18n.t('app.title');
  dom.langToggle.textContent = i18n.t('lang.switch');
  dom.search.placeholder = i18n.t('search.placeholder');
  for (const button of dom.viewToggle.querySelectorAll('button')) {
    button.textContent = i18n.t(`view.${button.dataset.view}`);
    button.classList.toggle('active', button.dataset.view === state.indexView);
  }
}

function refresh() {
  renderChrome();
  render();
}

dom.langToggle.addEventListener('click', () => {
  i18n.toggle();
  refresh();
});

dom.viewToggle.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-view]');
  if (!button) return;
  state.indexView = button.dataset.view;
  try {
    localStorage.setItem(VIEW_KEY, state.indexView);
  } catch {
    // حالت خصوصی؛ انتخاب فقط در همین نشست می‌ماند
  }
  refresh();
});

dom.search.addEventListener('input', () => {
  state.query = dom.search.value;
  render();
});

async function init() {
  i18n.applyToDocument();

  const { categories, entries, errors } = await loadAll();
  state.categories = categories;
  state.entries = entries;
  state.entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  state.errors = errors;

  if (errors.length > 0) {
    dom.errors.replaceChildren(view.renderErrorBanner(errors));
    dom.errors.hidden = false;
  }

  router.start((route) => {
    state.route = route;
    refresh();
    window.scrollTo(0, 0); // فقط موقع تغییر مسیر، نه با هر کلید جستجو
  });
}

init();
```

- [ ] **Step 3: افزودن استایل کارت‌ها به انتهای `assets/css/style.css`**

```css
.groups { display: grid; gap: 2.25rem; }

.group-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  color: var(--muted);
  font-weight: 600;
}

.group-title::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border);
}

.count {
  order: 3;
  font-size: 0.8rem;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0 0.5rem;
}

.cards { display: grid; gap: 0.6rem; }

.card {
  display: block;
  padding: 0.75rem 0.95rem;
  border: 1px solid var(--border);
  border-inline-start: 3px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  transition: border-color 0.12s ease;
}

.card:hover { border-inline-start-color: var(--accent); text-decoration: none; }
.card-title { display: block; font-weight: 600; }
.card-short { display: block; color: var(--muted); font-size: 0.9rem; line-height: 1.7; }

.viewtoggle { display: flex; }
.viewtoggle button { border-radius: 0; }
.viewtoggle button:first-child { border-start-start-radius: var(--radius); border-end-start-radius: var(--radius); }
.viewtoggle button:last-child { border-start-end-radius: var(--radius); border-end-end-radius: var(--radius); margin-inline-start: -1px; }
.viewtoggle button.active { color: var(--accent); border-color: var(--accent); }

.tagbanner { color: var(--muted); }
.tag { color: var(--accent); }
.empty { color: var(--muted); }

.errors ul { margin: 0.5rem 0 0; padding-inline-start: 1.2rem; }
.errors li { line-height: 1.8; }
```

`border-inline-start` به جای `border-left` عمدی است — با تغییر زبان به انگلیسی، نوار رنگی خودش به سمت درست می‌رود.

- [ ] **Step 4: اجرای سرور و بررسی دستی در مرورگر**

```bash
node serve.js
```

`http://localhost:8000/` را باز کنید و این‌ها را بررسی کنید:

1. پنج مدخل زیر دو عنوان دسته «مفاهیم پایه» (۳) و «اجماع» (۲) دیده می‌شوند
2. نوار قرمز خطا **ظاهر نمی‌شود** (اگر شد، متن خطا را بخوانید و داده‌ی تسک ۲ را درست کنید)
3. تایپ `اثبات` در نوار جستجو فقط «اثبات کار» را نگه می‌دارد
4. تایپ `mining` دو مدخل «اثبات کار» و «نانس» را نگه می‌دارد
5. کلیک روی «الفبایی» ترتیب را عوض می‌کند؛ رفرش صفحه همان نما را حفظ می‌کند
6. کلیک روی `English` عنوان‌ها را انگلیسی می‌کند، جهت صفحه چپ‌به‌راست می‌شود، و «نانس» با عنوان فارسی و جهت راست‌به‌چپ در فهرست باقی می‌ماند
7. در کنسول مرورگر هیچ خطایی نیست

- [ ] **Step 5: کامیت**

```bash
git add assets/js/render.js assets/js/app.js assets/css/style.css
git commit -m "feat: index view with categories, search, language and view toggles"
```

---

## Task 7: نمای مدخل

**Files:**
- Modify: `assets/js/render.js` (افزودن `renderEntry`، `renderNotFound`، `renderTags`)
- Modify: `assets/js/app.js` (اتصال مسیر `entry`)
- Modify: `assets/css/style.css` (استایل مدخل، هشتگ، دیاگرام)

**Interfaces:**
- Consumes: `el`، `entryCard` از تسک ۶؛ `localized` از تسک ۲
- Produces:
  - `renderEntry(entry, { lang, categories, entriesById }) -> HTMLElement`
  - `renderNotFound(id) -> HTMLElement`

- [ ] **Step 1: افزودن `renderTags`، `renderEntry` و `renderNotFound` به انتهای `assets/js/render.js`**

```js
function renderTags(tags) {
  return el(
    'div',
    { class: 'tags' },
    tags.map((tag) =>
      el(
        'a',
        { class: 'tag mono', dir: 'ltr', href: `#/tag/${encodeURIComponent(tag)}` },
        `#${tag}`,
      ),
    ),
  );
}

export function renderEntry(entry, { lang, categories, entriesById }) {
  const content = localized(entry, lang);
  const category = categories.find((item) => item.id === entry.category);

  const article = el('article', { class: 'entry' });

  article.append(
    el(
      'nav',
      { class: 'crumbs' },
      el('a', { href: '#/' }, t('nav.index')),
      el('span', { class: 'sep' }, '›'),
      category ? el('span', {}, category[lang] ?? category.fa) : null,
      category ? el('span', { class: 'sep' }, '›') : null,
      el('span', { class: 'here' }, content.title),
    ),
  );

  if (content.untranslated) {
    article.append(el('p', { class: 'notice' }, t('entry.untranslated')));
  }

  const body = el('div', { class: 'entry-body', ...contentDirAttrs(content) });
  body.append(el('h1', {}, content.title));
  body.append(el('p', { class: 'lead' }, content.short));

  if (entry.tags?.length) body.append(renderTags(entry.tags));

  body.append(el('div', { class: 'prose', html: content.body }));

  if (content.example) {
    body.append(
      el(
        'section',
        { class: 'example' },
        el('h2', {}, t('entry.example')),
        el('div', { class: 'prose', html: content.example }),
      ),
    );
  }

  if (content.svg) {
    body.append(el('figure', { class: 'diagram', html: content.svg }));
  }

  const related = (entry.related ?? [])
    .map((id) => entriesById.get(id))
    .filter(Boolean);

  if (related.length > 0) {
    body.append(
      el(
        'section',
        { class: 'related' },
        el('h2', {}, t('entry.related')),
        el('div', { class: 'cards' }, related.map((item) => entryCard(item, lang))),
      ),
    );
  }

  article.append(body);
  return article;
}

export function renderNotFound(id) {
  return el(
    'div',
    { class: 'notfound' },
    el('h1', {}, t('entry.notFound')),
    el('p', { class: 'mono', dir: 'ltr' }, id),
    el('p', {}, t('entry.notFoundHint')),
    el('p', {}, el('a', { href: '#/' }, t('entry.back'))),
  );
}
```

`renderEntry` عمداً از `entriesById.get(id)` استفاده می‌کند و نتیجه‌های `undefined` را با `filter(Boolean)` دور می‌ریزد: `related` شکسته در نوار خطا گزارش می‌شود ولی نباید صفحه‌ی مدخل را از کار بیندازد.

- [ ] **Step 2: اتصال مسیر مدخل در `assets/js/app.js`**

در تابع `render()`، بلاک `if (isIndex) { … }` را با این جایگزین کنید:

```js
  if (isIndex) {
    const visible = filterEntries(state.entries, { query: state.query, tag: state.route.tag });
    dom.main.append(view.renderIndex(visible, state.categories, {
      lang,
      view: state.indexView,
      tag: state.route.tag,
    }));
  } else if (state.route.view === 'entry') {
    const entry = state.entriesById.get(state.route.id);
    dom.main.append(
      entry
        ? view.renderEntry(entry, { lang, categories: state.categories, entriesById: state.entriesById })
        : view.renderNotFound(state.route.id),
    );
  }
```

و در بالای فایل، `view` را با `renderEntry` و `renderNotFound` استفاده می‌کنیم — نیازی به تغییر خط `import` نیست چون از `import * as view` استفاده شده.

- [ ] **Step 3: افزودن استایل مدخل به انتهای `assets/css/style.css`**

```css
.crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  color: var(--muted);
  margin-bottom: 1.25rem;
}
.crumbs .sep { opacity: 0.5; }
.crumbs .here { color: var(--text); }

.entry h1 { font-size: 1.75rem; line-height: 1.5; margin: 0 0 0.4rem; }

.lead {
  color: var(--muted);
  font-size: 1.05rem;
  margin: 0 0 1rem;
}

.notice {
  border: 1px solid var(--border);
  border-inline-start: 3px solid var(--accent);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--muted);
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
}

.tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem; }

.tags .tag {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.1rem 0.6rem;
  font-size: 0.82rem;
}
.tags .tag:hover { border-color: var(--accent); text-decoration: none; }

.prose p { margin: 0 0 1rem; }
.prose code {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.05rem 0.3rem;
}

.example, .related { margin-top: 2rem; }
.example h2, .related h2 {
  font-size: 0.95rem;
  color: var(--muted);
  font-weight: 600;
  margin: 0 0 0.75rem;
}

.example {
  border-inline-start: 3px solid var(--border);
  padding-inline-start: 1rem;
}

.diagram {
  margin: 2rem 0;
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--muted);
  text-align: center;
}
.diagram svg { max-width: 100%; height: auto; }

.notfound { color: var(--muted); }
.notfound h1 { color: var(--text); }
```

`.diagram { color: var(--muted) }` کلید کار است: SVGهای مدخل‌ها با `stroke="currentColor"` نوشته شده‌اند، پس رنگشان از این قانون می‌آید و در تم تاریک درست دیده می‌شوند.

- [ ] **Step 4: بررسی دستی در مرورگر**

```bash
node serve.js
```

1. از فهرست روی «بلاکچین» کلیک کنید — صفحه‌ی مدخل با breadcrumb `فهرست › مفاهیم پایه › بلاکچین` باز می‌شود
2. دیاگرام زنجیره‌ی سه بلوکی دیده می‌شود و رنگش با متن هماهنگ است
3. بخش «مثال» و «مدخل‌های مرتبط» با دو کارت «هش» و «اثبات کار» دیده می‌شوند
4. کلیک روی هشتگ `#ledger` به فهرست فیلترشده می‌رود و نوار «فیلترشده با هشتگ» بالای آن است
5. دکمه‌ی back مرورگر به مدخل قبلی برمی‌گردد
6. آدرس `http://localhost:8000/#/t/no-such-entry` صفحه‌ی «مدخل یافت نشد» می‌دهد، نه صفحه‌ی سفید
7. روی «نانس» بروید و زبان را انگلیسی کنید — نوار «ترجمه نشده» ظاهر می‌شود و متن فارسی راست‌به‌چپ می‌ماند در حالی که رابط چپ‌به‌راست است

- [ ] **Step 5: کامیت**

```bash
git add assets/js/render.js assets/js/app.js assets/css/style.css
git commit -m "feat: entry view with breadcrumbs, tags, diagram, and related entries"
```

---

## Task 8: میان‌برهای صفحه‌کلید و حالت خالی جستجو

**Files:**
- Modify: `assets/js/app.js`
- Modify: `assets/js/render.js` (دکمه‌ی پاک کردن در حالت خالی)

**Interfaces:**
- Consumes: `renderIndex` از تسک ۶
- Produces: امضای `renderIndex` تغییر نمی‌کند. حالت خالی حالا همیشه دکمه‌ی `.clear` را می‌سازد و `app.js` با delegation آن را می‌گیرد.

- [ ] **Step 1: افزودن دکمه‌ی پاک کردن به حالت خالی در `assets/js/render.js`**

`render.js` هیچ رویدادی نمی‌بندد — این قانون معماری پروژه است. دکمه فقط ساخته می‌شود و `app.js` در Step 2 با delegation آن را می‌گیرد.

در `renderIndex`، بلاک خالی را با این جایگزین کنید:

```js
  if (entries.length === 0) {
    // بدون addEventListener — بستن رویداد کار app.js است.
    // اینجا فقط دکمه ساخته می‌شود و app.js با delegation آن را می‌گیرد.
    wrap.append(el(
      'div',
      { class: 'empty' },
      el('p', {}, t('search.empty')),
      el('button', { type: 'button', class: 'clear' }, t('search.clear')),
    ));
    return wrap;
  }
```

و امضای تابع را به این تغییر دهید:

```js
export function renderIndex(entries, categories, { lang, view, tag }) {
```

- [ ] **Step 2: افزودن میان‌برها و شنونده‌ی delegation در `assets/js/app.js`**

در `render()`، فراخوانی `view.renderIndex` را به این تغییر دهید:

```js
    dom.main.append(view.renderIndex(visible, state.categories, {
      lang,
      view: state.indexView,
      tag: state.route.tag,
    }));
```

و این توابع و شنونده را قبل از `async function init()` اضافه کنید:

```js
function clearSearch() {
  state.query = '';
  dom.search.value = '';
  render();
  dom.search.focus();
}

function isTypingTarget(target) {
  return target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
}

// بستن رویداد در app.js متمرکز است. delegation روی dom.main کار می‌کند
// چون خودِ dom.main هرگز جایگزین نمی‌شود، فقط فرزندانش.
dom.main.addEventListener('click', (event) => {
  if (event.target.closest('.clear')) clearSearch();
});

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !isTypingTarget(event.target) && !dom.searchbar.hidden) {
    event.preventDefault();
    dom.search.focus();
    dom.search.select();
    return;
  }
  if (event.key === 'Escape' && document.activeElement === dom.search) {
    clearSearch();
  }
});
```

`event.preventDefault()` لازم است وگرنه خودِ `/` هم داخل نوار جستجو تایپ می‌شود. شرط `!dom.searchbar.hidden` جلوی این را می‌گیرد که در صفحه‌ی مدخل، `/` روی یک نوار پنهان فوکوس بگذارد.

- [ ] **Step 3: بررسی دستی در مرورگر**

```bash
node serve.js
```

1. در فهرست کلید `/` را بزنید — فوکوس روی نوار جستجو می‌رود و کاراکتر `/` تایپ **نمی‌شود**
2. `zzzz` تایپ کنید — پیام «مدخلی یافت نشد» با دکمه‌ی «پاک کردن جستجو» می‌آید
3. دکمه را بزنید — نوار خالی می‌شود، همه‌ی مدخل‌ها برمی‌گردند، فوکوس روی نوار می‌ماند
4. دوباره تایپ کنید و `Escape` بزنید — همان اثر
5. به صفحه‌ی یک مدخل بروید و `/` بزنید — هیچ اتفاقی نمی‌افتد و خطایی در کنسول نیست

- [ ] **Step 4: کامیت**

```bash
git add assets/js/app.js assets/js/render.js
git commit -m "feat: search keyboard shortcuts and empty-state clear button"
```

---

## Task 9: صفحه‌ی خودآزمایی `#/self-test`

**Files:**
- Modify: `assets/js/render.js` (افزودن `renderSelfTest`)
- Modify: `assets/js/app.js` (اتصال مسیر `self-test`)
- Modify: `assets/css/style.css` (استایل گزارش)

**Interfaces:**
- Consumes: `renderEntry` از تسک ۷، `localized` از تسک ۲، `LANGS` از تسک ۳
- Produces: `renderSelfTest(entries, categories, errors, entriesById) -> HTMLElement`

- [ ] **Step 1: افزودن `import` زبان‌ها به بالای `assets/js/render.js`**

خط import مربوط به i18n را به این تغییر دهید:

```js
import { t, dirFor, current, LANGS } from './i18n.js';
```

- [ ] **Step 2: افزودن `renderSelfTest` به انتهای `assets/js/render.js`**

```js
function reportSection(title, items) {
  return el(
    'section',
    { class: 'report' },
    el('h2', {}, title),
    items.length === 0
      ? el('p', { class: 'ok' }, `✓ ${t('selftest.pass')}`)
      : el('ul', { class: 'bad' }, items.map((item) => el('li', {}, item))),
  );
}

/**
 * هر مدخل را در هر دو زبان واقعاً رندر می‌کند تا خطاهای رندری که
 * فقط روی یک زبان یا یک شکل داده رخ می‌دهند بیرون بیفتند.
 */
export function renderSelfTest(entries, categories, errors, entriesById) {
  const renderFailures = [];
  const untranslated = [];

  for (const entry of entries) {
    for (const lang of LANGS) {
      try {
        renderEntry(entry, { lang, categories, entriesById });
      } catch (error) {
        renderFailures.push(`${entry.id} [${lang}] — ${error.message}`);
      }
    }
    if (!entry.en) untranslated.push(entry.id);
  }

  const counts = categories.map((category) => {
    const total = entries.filter((entry) => entry.category === category.id).length;
    return `${category[current()] ?? category.fa}: ${total}`;
  });
  counts.push(`${t('selftest.total')}: ${entries.length}`);

  return el(
    'div',
    { class: 'selftest' },
    el('h1', {}, t('selftest.title')),
    reportSection(t('selftest.renderErrors'), renderFailures),
    reportSection(t('selftest.validation'), errors.map((e) => `${e.file} › ${e.id} — ${e.message}`)),
    reportSection(t('selftest.untranslated'), untranslated),
    el('section', { class: 'report' }, el('h2', {}, t('selftest.counts')), el('ul', {}, counts.map((line) => el('li', {}, line)))),
  );
}
```

`renderEntry` اینجا فراخوانی می‌شود ولی نتیجه‌اش به DOM اضافه نمی‌شود — هدف فقط اجرا شدن مسیر کد و گرفتن استثناست.

- [ ] **Step 3: اتصال مسیر در `assets/js/app.js`**

در `render()`، آکولاد بسته‌ی بلاک `else if (state.route.view === 'entry') { … }` را با این جایگزین کنید — یعنی یک شاخه‌ی دیگر قبل از بسته شدن زنجیره اضافه می‌شود:

```js
  } else if (state.route.view === 'self-test') {
    dom.main.append(view.renderSelfTest(state.entries, state.categories, state.errors, state.entriesById));
  }
```

بعد از این تغییر، انتهای `render()` باید دقیقاً این شکل باشد:

```js
  } else if (state.route.view === 'entry') {
    const entry = state.entriesById.get(state.route.id);
    dom.main.append(
      entry
        ? view.renderEntry(entry, { lang, categories: state.categories, entriesById: state.entriesById })
        : view.renderNotFound(state.route.id),
    );
  } else if (state.route.view === 'self-test') {
    dom.main.append(view.renderSelfTest(state.entries, state.categories, state.errors, state.entriesById));
  }
}
```

- [ ] **Step 4: افزودن استایل گزارش به انتهای `assets/css/style.css`**

```css
.selftest h1 { font-size: 1.5rem; }
.report { margin-top: 1.75rem; }
.report h2 { font-size: 0.95rem; color: var(--muted); font-weight: 600; margin: 0 0 0.5rem; }
.report ul { margin: 0; padding-inline-start: 1.2rem; }
.report .ok { color: var(--accent); margin: 0; }
.report .bad { color: var(--danger); }
.report li { line-height: 1.8; }
```

- [ ] **Step 5: بررسی دستی در مرورگر**

```bash
node serve.js
```

`http://localhost:8000/#/self-test` را باز کنید:

1. «خطاهای رندر» → `✓ هیچ موردی نیست`
2. «خطاهای اعتبارسنجی» → `✓ هیچ موردی نیست`
3. «مدخل‌های بدون ترجمه‌ی انگلیسی» → فقط `nonce`
4. «شمار مدخل‌ها» → `مفاهیم پایه: 3`، `اجماع: 2`، `مجموع: 5`

- [ ] **Step 6: بررسی اینکه خودآزمایی واقعاً خطا را می‌گیرد**

در `data/entries/consensus.json` مقدار `related` مدخل `nonce` را موقتاً به `["does-not-exist"]` تغییر دهید، صفحه را رفرش کنید.

انتظار: نوار قرمز بالای صفحه ظاهر می‌شود و بخش «خطاهای اعتبارسنجی» یک مورد قرمز نشان می‌دهد که در آن `does-not-exist` آمده. صفحه از کار نمی‌افتد و بقیه‌ی مدخل‌ها کار می‌کنند.

سپس تغییر را برگردانید و مطمئن شوید دوباره همه‌چیز سبز است:

```bash
git checkout data/entries/consensus.json
```

- [ ] **Step 7: اجرای کل مجموعه‌ی تست**

```bash
node --test
```

انتظار: `pass 52`، `fail 0`

- [ ] **Step 8: کامیت**

```bash
git add assets/js/render.js assets/js/app.js assets/css/style.css
git commit -m "feat: self-test page reporting render, validation, and translation gaps"
```

---

## Task 10: واکنش‌گرایی، پس‌زمینه‌ی نقطه‌ای و صیقل نهایی

**Files:**
- Modify: `assets/css/style.css`

**Interfaces:**
- Consumes: کلاس‌های تعریف‌شده در تسک‌های ۶، ۷ و ۹
- Produces: تغییری در API نیست

- [ ] **Step 1: افزودن پس‌زمینه‌ی نقطه‌ای و بهبود تمرکز به `assets/css/style.css`**

قانون `body` موجود را با این جایگزین کنید:

```css
body {
  background-color: var(--bg);
  background-image: radial-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 22px 22px;
  color: var(--text);
  font-family: "Vazirmatn", "IRANSans", "Segoe UI", Tahoma, system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.9;
  -webkit-text-size-adjust: 100%;
}
```

و این‌ها را به انتهای فایل اضافه کنید:

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}

@media (max-width: 640px) {
  .topbar { padding: 0.75rem 1rem; flex-wrap: wrap; }
  .brand { font-size: 1rem; }
  main { padding: 1.25rem 1rem 3rem; }
  .searchbar { padding: 0 1rem; }
  .entry h1 { font-size: 1.4rem; }
  .diagram { padding: 0.75rem; }
  .errors { margin: 0.75rem 1rem; }
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
```

`:focus-visible` لازم است چون میان‌بر `/` و پیمایش با Tab باید قابل دیدن باشند؛ بدون آن دکمه‌های سفارشی هیچ نشانه‌ی فوکوسی ندارند.

- [ ] **Step 2: زنجیرشدن بصری دسته‌ها**

سند طراحی خواسته بود دسته‌ها در نمای موضوعی به شکل بلاک‌های به‌هم‌زنجیرشده دیده شوند. این را به انتهای `assets/css/style.css` اضافه کنید:

```css
.group { position: relative; padding-inline-start: 1.35rem; }

/* خطی که دسته‌ها را مثل حلقه‌های یک زنجیر به هم وصل می‌کند */
.group::before {
  content: "";
  position: absolute;
  inset-inline-start: 4px;
  top: 0.55rem;
  bottom: -2.25rem;
  width: 1px;
  background: var(--border);
}
.group:last-child::before { bottom: auto; height: 1.25rem; }

/* گره‌ی لوزی‌شکل ابتدای هر دسته */
.group::after {
  content: "";
  position: absolute;
  inset-inline-start: 0;
  top: 0.45rem;
  width: 9px;
  height: 9px;
  background: var(--bg);
  border: 1px solid var(--accent);
  border-radius: 2px;
  transform: rotate(45deg);
}
```

`bottom: -2.25rem` دقیقاً اندازه‌ی `gap` در `.groups` است، پس خط از یک دسته تا دسته‌ی بعدی بدون شکاف ادامه پیدا می‌کند. قانون `:last-child` جلوی آویزان ماندن خط در انتها را می‌گیرد.

- [ ] **Step 3: بررسی واکنش‌گرایی**

```bash
node serve.js
```

در مرورگر، ابزار توسعه‌دهنده را باز کنید و عرض را روی ۳۷۵ پیکسل بگذارید:

1. هدر می‌شکند ولی از صفحه بیرون نمی‌زند
2. نوار افقی اسکرول در هیچ صفحه‌ای ظاهر نمی‌شود
3. دیاگرام بلاکچین داخل عرض صفحه جا می‌شود
4. با کلید Tab بین لینک‌ها و دکمه‌ها حرکت کنید — حلقه‌ی فیروزه‌ای فوکوس روی هرکدام دیده می‌شود

روی عرض دسکتاپ:

5. ستون متن حدود ۷۰ کاراکتر می‌ماند و تا لبه‌ی صفحه کش نمی‌آید
6. پس‌زمینه شبکه‌ی نقطه‌ای بسیار کم‌رنگ دارد که خوانایی متن را کم نمی‌کند
7. در نمای موضوعی، خط عمودی و گره‌های فیروزه‌ای دسته‌ها را به هم وصل می‌کنند و خط بعد از آخرین دسته ادامه پیدا نمی‌کند
8. با تغییر زبان به انگلیسی، خط زنجیر به سمت چپ منتقل می‌شود

- [ ] **Step 4: بررسی نبود منبع خارجی**

```bash
grep -rnE 'https?://' index.html assets/ | grep -v 'www.w3.org/2000/svg'
```

انتظار: هیچ خروجی. تنها `http` مجاز، فضای‌نام SVG است که درخواست شبکه‌ای تولید نمی‌کند.

- [ ] **Step 5: کامیت**

```bash
git add assets/css/style.css
git commit -m "style: chained category blocks, responsive layout, focus rings"
```

---

## Task 11: مستندسازی و انتشار روی GitHub Pages

**Files:**
- Create: `README.md`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: همه‌ی تسک‌های قبل
- Produces: سایت منتشرشده

- [ ] **Step 1: نوشتن `README.md`**

محتوای زیر را عیناً در `README.md` بنویسید (بلاک بیرونی چهار بک‌تیک دارد فقط برای اینکه بلاک‌های داخلی سالم بمانند؛ آن‌ها را در فایل نهایی ننویسید):

````markdown
# دانشنامه کریپتو و بلاکچین

واژه‌نامه‌ی شخصی مفاهیم کریپتو و بلاکچین. ایستا، بدون وابستگی، دوزبانه (فارسی/انگلیسی).

## اجرا

`fetch()` روی `file://` کار نمی‌کند، پس باز کردن مستقیم `index.html` صفحه‌ی خالی می‌دهد. حتماً سرو کنید:

```bash
node serve.js
```

سپس `http://localhost:8000`.

## افزودن یک مدخل

۱. فایل دسته‌ی مربوطه را در `data/entries/` باز کنید. برای دسته‌ی جدید، فایلش را بسازید و به `data/categories.json` اضافه کنید.
۲. یک آبجکت اضافه کنید:

```json
{
  "id": "slug-انگلیسی-یکتا",
  "tags": ["lowercase", "english"],
  "related": ["id-مدخل-دیگر"],
  "fa": { "title": "…", "short": "…", "body": "<p>…</p>", "example": "<p>…</p>" },
  "en": { "title": "…", "short": "…", "body": "<p>…</p>" }
}
```

`fa` اجباری است، `en` اختیاری. `example`، `svg` و `related` اختیاری‌اند.
۳. صفحه را رفرش کنید؛ نوار قرمز اعتبارسنجی نباید ظاهر شود.

هیچ فایل JS‌ای دست نمی‌خورد.

## قبل از انتشار

```bash
node --test
```

و صفحه‌ی `#/self-test` را باز کنید — باید همه‌ی بخش‌ها سبز باشند.
````

- [ ] **Step 2: به‌روزرسانی `CLAUDE.md`**

خط `Implementation has not started yet. Update this file as the real structure lands.` را حذف کنید و بخش `## Running` را به این تغییر دهید تا `node --test` را هم ذکر کند (باز هم بلاک بیرونی چهار بک‌تیکی است و در فایل نوشته نمی‌شود):

````markdown
## Running

`fetch()` cannot read local JSON over `file://`, so opening `index.html` directly will load an empty page. Always serve it:

```
node serve.js                  # dependency-free static server in the repo
python3 -m http.server 8000    # alternative
```

There is no build or install step. Local serving is identical to what GitHub Pages runs.

Unit tests cover the three pure modules (`validate`, `filterEntries`, `parseHash`) and use Node's built-in runner — no packages installed:

```
node --test
```

Before publishing, open `#/self-test` — it renders every entry in both languages and reports validation errors, render failures, and entries missing an English translation.
````

- [ ] **Step 3: بررسی نهایی قبل از انتشار**

```bash
node --test
```

انتظار: `pass 52`، `fail 0`

```bash
node serve.js
```

`#/self-test` را باز کنید — همه‌ی بخش‌ها به‌جز «مدخل‌های بدون ترجمه» باید `✓` باشند.

- [ ] **Step 4: کامیت**

```bash
git add README.md CLAUDE.md
git commit -m "docs: add README and update project instructions"
```

- [ ] **Step 5: اتصال به GitHub و push**

این مرحله به آدرس ریپوی کاربر نیاز دارد و بدون آن انجام نمی‌شود. اگر ریپو هنوز ساخته نشده:

```bash
gh repo create <نام-ریپو> --public --source=. --remote=origin --push
```

اگر ریپو از قبل هست:

```bash
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

- [ ] **Step 6: فعال‌سازی GitHub Pages**

```bash
gh api -X POST repos/<user>/<repo>/pages -f 'source[branch]=main' -f 'source[path]=/'
```

یا از طریق رابط وب: `Settings › Pages › Source: Deploy from a branch › main › / (root)`.

- [ ] **Step 7: بررسی سایت منتشرشده**

بعد از یکی دو دقیقه، `https://<user>.github.io/<repo>/` را باز کنید و بررسی کنید:

1. فهرست با پنج مدخل لود می‌شود (اگر خالی بود، یعنی مسیرهای `fetch` مطلق شده‌اند — باید نسبی باشند)
2. نوار قرمز خطا ظاهر نمی‌شود
3. `#/self-test` روی همان دامنه هم سبز است
4. در تب Network هیچ درخواستی به دامنه‌ی غیر از `github.io` نیست

---

## نقشه‌ی پوشش سند طراحی

| بخش سند | تسک |
|---|---|
| ساختار فایل‌ها | ۱، ۲، ۳، ۴، ۵، ۶ |
| مدل داده و زبان ناقص | ۲ |
| اعتبارسنجی | ۲، ۶ (نوار خطا) |
| مسیریابی و breadcrumb | ۵، ۷ |
| فهرست موضوعی/الفبایی | ۶ |
| جستجو و هشتگ | ۴، ۶، ۷، ۸ |
| زبان و `dir`/`lang` | ۳، ۶، ۷ |
| ظاهر و واکنش‌گرایی | ۱، ۶، ۷، ۱۰ |
| خودآزمایی | ۹ |
| اجرا و انتشار | ۱، ۱۱ |
| افزودن یک مدخل | ۱۱ (`README.md`) |
