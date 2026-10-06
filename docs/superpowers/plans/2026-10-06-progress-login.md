# پلن پیاده‌سازی ذخیره‌ی پیشرفت با ایمیل

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**هدف:** کاربر با زدن ایمیل، تیک‌های نقشه‌ی راه را روی سرور نگه دارد و در دستگاه دیگر با همان ایمیل پس بگیرد.

**معماری:** منطق محض (ایمیل، اعتبارسنجی بدنه، ادغام) در `assets/js/sync.js` است و هم مرورگر و هم سرور آن را import می‌کنند. سرور: `server/progress-store.js` روی `node:sqlite` و `server/api.js` برای مسیرهای `/api/`؛ `serve.js` فقط وقتی `DB_PATH` هست API را با import پویا بار می‌کند. مرورگر: `assets/js/account.js` پنل ورود و همگام‌سازی را دارد و `app.js` فقط سیم‌کشی می‌کند. `localStorage` منبع اصلی می‌ماند.

**تک‌استک:** JavaScript ES modules، Node.js ۲۲ با `node:sqlite` و `node:http`، `node --test`. بدون بسته‌ی npm.

**سند طراحی:** `docs/superpowers/specs/2026-10-06-progress-login-design.md` — اگر این پلن با آن تناقض داشت، سند برنده است.

## محدودیت‌های سراسری

- بدون بسته‌ی npm، بدون build، بدون میزبان خارجی. آیکون SVG درون‌خطی.
- ایمیل: `trim` + `toLowerCase`؛ حداکثر ۲۵۴ کاراکتر؛ دقیقاً یک `@`؛ بخش محلی و دامنه ناخالی؛ دامنه دست‌کم یک `.` دارد.
- `topicId`: رشته‌ی ناخالی تا ۶۴ کاراکتر. `readIds`: آرایه‌ی رشته، هر کدام تا ۱۲۸ کاراکتر، حداکثر ۵۰۰۰ عضو.
- بدنه بیش از ۶۴KB (`65536` بایت) → `413`. محدودیت نرخ: ۶۰ درخواست در پنجره‌ی ثابت ۶۰ ثانیه به‌ازای IP → `429`.
- IP: اولین مقدار `X-Forwarded-For`، وگرنه `socket.remoteAddress`.
- کلید `localStorage` ایمیل: `dezhnebesht:account`. debounce نوشتن: ۸۰۰ میلی‌ثانیه به‌ازای هر موضوع.
- هر دسترسی به `localStorage` در try/catch. هر خطای شبکه در مرورگر بی‌صدا.
- متن‌های رابط در هر دو جدول `STRINGS` در `i18n.js`؛ فیلد ایمیل `dir="ltr"`. هرگز `letter-spacing` یا monospace روی فارسی.
- پیام commitها انگلیسی به سبک Conventional Commits، با خط `Co-Authored-By` جلسه.

## تمرکز بازبینی

1. **تیک و بستن فوری تب در فاصله‌ی debounce** — انتظار: تیک به سرور برسد. `account.js` روی `pagehide` نوشتن‌های معلق را با `fetch(..., { keepalive: true })` بفرستد (تسک ۳، مرحله‌ی دستی).
2. **ورود وقتی سرور همان لحظه در دسترس نیست** — انتظار: ایمیل ذخیره شود و ادغام در بارگذاری بعدی انجام شود؛ پنل خطا نشان ندهد و تیک‌های محلی دست نخورند (تسک ۳، مرحله‌ی دستی).
3. **یک ایمیل با حروف و فاصله‌ی متفاوت در دو دستگاه** — انتظار: همان ردیف (تسک ۲، `api: ایمیل با حروف بزرگ همان ردیف را می‌خواند`).
4. **بدنه‌ی JSON خراب، بدنه‌ی غیرشیء، GET بدون `email`** — انتظار: `400`، و سرور بعد از آن هنوز جواب بدهد (تسک ۲).
5. **پاسخ سرور با شکل غیرمنتظره** (مثلاً HTML یک proxy یا شیء با مقدار غیرآرایه) — انتظار: `mergeProgress` آن موضوع را نادیده بگیرد و استثنا ندهد (تسک ۱).

---

### تسک ۱: منطق محض همگام‌سازی

**Files:**
- Create: `assets/js/sync.js`
- Test: `test/sync.test.mjs`

**Interfaces:**
- Produces:
  - `MAX_EMAIL = 254`, `MAX_TOPIC_ID = 64`, `MAX_ENTRY_ID = 128`, `MAX_IDS = 5000`, `MAX_BODY_BYTES = 65536`
  - `normalizeEmail(raw: unknown): string` — غیررشته → `''`.
  - `isValidEmail(email: string): boolean` — روی ایمیل normalize‌شده.
  - `validateProgressBody(body: unknown): { ok: true, value: { email, topicId, readIds } } | { ok: false }` — ایمیل را خودش normalize می‌کند؛ `readIds` را dedupe می‌کند.
  - `mergeProgress(local: Record<string,string[]>, remote: unknown): Record<string,string[]>` — union به‌ازای هر موضوع؛ `remote` غیرشیء یا مقدار غیرآرایه نادیده؛ عضو غیررشته دور ریخته.
  - `topicsToPush(merged: Record<string,string[]>, remote: unknown): string[]` — موضوع‌هایی که مجموعه‌شان با remote فرق دارد (ترتیب مهم نیست).

- [ ] **مرحله ۱: تست‌های شکست‌خورنده**

در `test/sync.test.mjs`، به سبک `test/i18n.test.mjs` (عنوان فارسی، `node:assert/strict`):

```js
assert.equal(normalizeEmail('  A@B.Co '), 'a@b.co');
assert.equal(normalizeEmail(42), '');
for (const ok of ['a@b.co', 'x.y+z@sub.example.org']) assert.ok(isValidEmail(ok));
for (const bad of ['', 'ab.co', 'a@@b.co', 'a@b@c.co', '@b.co', 'a@', 'a@bco',
                   'a@b.co'.padStart(255, 'x')]) assert.ok(!isValidEmail(bad));
assert.ok(isValidEmail('a@b.co'.padStart(254, 'x')));

const good = { email: ' A@B.co', topicId: 'acid', readIds: ['x', 'x', 'y'] };
assert.deepEqual(validateProgressBody(good),
  { ok: true, value: { email: 'a@b.co', topicId: 'acid', readIds: ['x', 'y'] } });
// هر کدام { ok: false }:
null, [], 'str', { ...good, email: 'nope' }, { ...good, topicId: '' },
{ ...good, topicId: 'x'.repeat(65) }, { ...good, readIds: 'x' }, { ...good, readIds: [1] },
{ ...good, readIds: ['x'.repeat(129)] },
{ ...good, readIds: Array.from({ length: 5001 }, (_, i) => `e${i}`) }
// مرزها پذیرفته: topicId با ۶۴ کاراکتر، شناسه‌ی ۱۲۸ کاراکتری، ۵۰۰۰ شناسه، readIds خالی.

assert.deepEqual(mergeProgress({ a: ['1', '2'] }, { a: ['2', '3'], b: ['9'] }),
  { a: ['1', '2', '3'], b: ['9'] });   // مقایسه بعد از sort هر آرایه
assert.deepEqual(mergeProgress({ a: ['1'] }, '<html>'), { a: ['1'] });
assert.deepEqual(mergeProgress({ a: ['1'] }, { a: 'x', b: [1, '2'] }), { a: ['1'], b: ['2'] });
assert.deepEqual(topicsToPush({ a: ['1', '2'], b: ['9'] }, { a: ['2', '1'], b: [] }), ['b']);
assert.deepEqual(topicsToPush({ a: ['1'] }, null), ['a']);
```

- [ ] **مرحله ۲: اجرا و دیدن شکست**

Run: `node --test test/sync.test.mjs` — Expected: FAIL (`Cannot find module .../sync.js`).

- [ ] **مرحله ۳: پیاده‌سازی `assets/js/sync.js`**

بدون DOM و بدون شبکه، با کامنت فارسی در سبک `roadmap.js`. اعتبارسنجی ایمیل با شمارش `@` و `split`، نه regex پیچیده.

- [ ] **مرحله ۴: اجرای همه‌ی تست‌ها**

Run: `node --test` — Expected: همه PASS.

- [ ] **مرحله ۵: Commit**

```bash
git add assets/js/sync.js test/sync.test.mjs
git commit -m "feat(sync): pure email, body and merge rules shared by browser and server"
```

---

### تسک ۲: API سرور روی SQLite

**Files:**
- Create: `server/progress-store.js`, `server/api.js`
- Modify: `serve.js` (پورت واقعی در لاگ؛ مسیرهای `/api/` پیش از فایل ایستا)
- Test: `test/api.test.mjs`

**Interfaces:**
- Consumes: `normalizeEmail`, `isValidEmail`, `validateProgressBody`, `MAX_BODY_BYTES` از `assets/js/sync.js`؛ `parseProgress`, `serializeProgress` از `assets/js/roadmap.js`.
- Produces:
  - `openStore(dbPath: string): { getAll(email): Record<string,string[]>, put(email, topicId, readIds: string[], now: number): void, close(): void }` — جدول دقیقاً همان `CREATE TABLE IF NOT EXISTS progress` سند طراحی؛ `put` با `INSERT ... ON CONFLICT(email, topic_id) DO UPDATE`.
  - `createApi({ dbPath, limit = 60, windowMs = 60_000, now = Date.now }): { handle(req, res): Promise<void>, close(): void }`
  - `serve.js`: اگر `process.env.DB_PATH` هست، `const { createApi } = await import('./server/api.js')` و هر `pathname` که با `/api/` شروع شود به `api.handle` می‌رود؛ اگر نیست، `node:sqlite` هرگز import نمی‌شود و `/api/health` مثل هر مسیر ناموجود `404` است. `PORT` پیش‌فرض ۸۰۰۰ می‌ماند ولی `PORT=0` باید پورت تصادفی بدهد (`Number(process.env.PORT ?? 8000)`) و لاگ شروع پورت را از `server.address().port` بخواند.

رفتار `handle` (پاسخ‌ها JSON با `Cache-Control: no-store`):

| درخواست | پاسخ |
|---|---|
| بیش از `limit` درخواست از یک IP در پنجره | `429` (پیش از هر چیز دیگر) |
| `GET /api/health` | `200 {"ok":true}` |
| `GET /api/progress?email=` نامعتبر یا غایب | `400` |
| `GET /api/progress?email=…` | `200` با `getAll` (ناشناخته → `{}`) |
| `PUT /api/progress` با `Content-Length` یا بدنه‌ی خوانده‌شده بیش از `MAX_BODY_BYTES` | `413` |
| `PUT` با JSON خراب یا `validateProgressBody` ناموفق | `400` |
| `PUT` معتبر | `put(...)`، سپس `204` |
| متد دیگر روی دو مسیر بالا | `405` |
| مسیر دیگری زیر `/api/` | `404` |

پنجره‌ی نرخ ثابت است: با شروع پنجره‌ی تازه کل `Map` شمارنده‌ها دور ریخته می‌شود.

- [ ] **مرحله ۱: تست‌های شکست‌خورنده**

`test/api.test.mjs`: در `before`، یک پوشه‌ی موقت با `mkdtemp(join(tmpdir(), 'dezh-'))`، `createApi({ dbPath: join(dir, 'p.db') })`، و `http.createServer(api.handle).listen(0)`. در `after`، `close` هر دو و `rm` پوشه. این تست‌ها با `fetch`:

- `api: health` → `200`، `{ ok: true }`.
- `api: رفت‌وبرگشت` → PUT `{ email: 'a@b.co', topicId: 'acid', readIds: ['x','y'] }` → `204`؛ GET → `{ acid: ['x','y'] }`.
- `api: PUT دوم جایگزین کامل است` → PUT با `readIds: []` → GET `{ acid: [] }`.
- `api: ایمیل با حروف بزرگ همان ردیف را می‌خواند` → GET با `email=%20A@B.CO` همان نتیجه.
- `api: ایمیل ناشناخته {}`.
- `api: ورودی بد 400` → GET بدون `email`؛ GET با `email=nope`؛ PUT با بدنه‌ی `'{'`؛ PUT با `'[]'`؛ PUT با `topicId: ''`. پس از همه، health هنوز `200`.
- `api: بدنه‌ی بزرگ 413` → بدنه‌ی ۷۰٬۰۰۰ بایتی.
- `api: متد غلط 405` → `DELETE /api/progress`؛ و `GET /api/nope` → `404`.
- `api: بیش از سقف نرخ 429` → یک `createApi` جدا با `limit: 3` و `now` دستی: سه درخواست `200`، چهارمی `429`؛ بعد از جلو بردن `now` به اندازه‌ی `60_000`، دوباره `200`.
- `api: داده بعد از بستن و باز کردن دوباره می‌ماند` → `close`، یک `createApi` تازه روی همان فایل، GET همان داده.
- `serve: بدون DB_PATH، /api/health 404 است` → `spawn(process.execPath, ['serve.js'], { env: { ...process.env, PORT: '0', DB_PATH: '' } })`، پورت را از لاگ stdout بخوان، `fetch` → `404`، سپس `kill`.

  توجه: در `serve.js` شرط باید روی مقدار ناخالی `DB_PATH` باشد، نه صرف وجودش.

- [ ] **مرحله ۲: اجرا و دیدن شکست**

Run: `node --test test/api.test.mjs` — Expected: FAIL (`Cannot find module .../server/api.js`).

- [ ] **مرحله ۳: پیاده‌سازی `server/progress-store.js`، `server/api.js` و تغییر `serve.js`**

تنها `import { DatabaseSync } from 'node:sqlite'` در `progress-store.js` است. خواندن بدنه با شمارش بایت‌ها روی `data` و قطع با `413` به محض عبور از سقف.

- [ ] **مرحله ۴: اجرای همه‌ی تست‌ها**

Run: `node --test` — Expected: همه PASS (هشدار `ExperimentalWarning` برای SQLite عادی است).

- [ ] **مرحله ۵: Commit**

```bash
git add server/ serve.js test/api.test.mjs
git commit -m "feat(server): store roadmap progress by email in SQLite behind /api/"
```

---

### تسک ۳: پنل ورود و همگام‌سازی در مرورگر

**Files:**
- Create: `assets/js/account.js`
- Modify: `assets/js/i18n.js` (کلیدهای `account.*` در هر دو زبان)، `index.html` (دکمه و پنل در `.chrome-end`، پیش از `#theme-toggle`)، `assets/css/style.css` (پنل)، `assets/js/app.js` (سیم‌کشی)

**Interfaces:**
- Consumes: `normalizeEmail`, `isValidEmail`, `mergeProgress`, `topicsToPush` از تسک ۱؛ API تسک ۲.
- Produces (`account.js`):
  - `initAccount({ button, panel, getLocal: () => Record<string,string[]>, setLocal: (topicId, ids: string[]) => void, onMerged: () => void }): Promise<void>` — `GET /api/health`؛ اگر موفق نبود، کاری نمی‌کند و `button` پنهان می‌ماند. اگر موفق بود، `button.hidden = false`، و اگر ایمیلی ذخیره است، ادغام می‌کند.
  - `pushTopic(topicId: string): void` — اگر وارد نشده‌ایم no-op؛ وگرنه debounce ۸۰۰ms و در لحظه‌ی ارسال مقدار تازه را از `getLocal()[topicId]` می‌خواند.
  - `refreshLabels(): void` — متن‌های دکمه و پنل را از `i18n.t` دوباره می‌نویسد.

کلیدهای i18n (فارسی / انگلیسی):

| کلید | fa | en |
|---|---|---|
| `account.buttonLabel` | ذخیرهٔ پیشرفت با ایمیل | Save progress with your email |
| `account.emailLabel` | ایمیل | Email |
| `account.hint` | با همین ایمیل در هر دستگاهی تیک‌هایت برمی‌گردد. | Use the same email on any device to get your ticks back. |
| `account.submit` | ذخیرهٔ پیشرفت | Save progress |
| `account.invalid` | این ایمیل درست به نظر نمی‌رسد. | That doesn't look like an email address. |
| `account.signedInAs` | پیشرفت ذخیره می‌شود برای | Progress is saved for |
| `account.signOut` | خروج | Sign out |

رفتار:

- **ادغام** (`syncNow` داخلی): `GET /api/progress?email=` ← `mergeProgress(getLocal(), remote)` ← `setLocal` برای هر موضوع ← `PUT` برای هر `topicsToPush(merged, remote)` ← `onMerged()`. هر شکست در هر مرحله بی‌صدا رها می‌شود.
- **ارسال فرم:** `normalizeEmail` ← اگر `!isValidEmail`، `account.invalid` زیر فیلد با `aria-live="polite"` و پایان. وگرنه ذخیره در `dezhnebesht:account` (try/catch)، پنل به حالت «وارد شده»، و `syncNow` بدون منتظر ماندن رابط برای پاسخ.
- **خروج:** پاک کردن `dezhnebesht:account` و لغو تایمرهای معلق. پیشرفت محلی دست نمی‌خورد.
- **`pagehide`:** هر debounce معلق فوراً با `keepalive: true` فرستاده می‌شود.
- **پنل:** با کلیک دکمه باز/بسته، `aria-expanded` روی دکمه؛ `Escape` و کلیک بیرون می‌بندند و فوکوس به دکمه برمی‌گردد. با باز شدن، فوکوس روی فیلد ایمیل (یا دکمه‌ی خروج در حالت وارد شده).
- **آیکون:** یک SVG درون‌خطی ۲۰×۲۰ هم‌سبک آیکون‌های موجود (stroke `currentColor`، `stroke-width="1.5"`)، مثلاً پاکت نامه.

تغییرات `app.js`:

- `getLocal` = `Object.fromEntries([...state.roadmaps.keys()].map((t) => [t, [...readProgress(t)]]))`.
- `setLocal(t, ids)` = `saveProgress(t, new Set(ids))`.
- `onMerged` = `render()`.
- بعد از `router.start(...)` در `init()`: `initAccount(...)` بدون `await`، تا بارگذاری سایت منتظر سرور نماند.
- در شنونده‌ی کلیک نقشه، بعد از هر دو `saveProgress` (تیک و «از نو»): `pushTopic(topicId)`.
- جایی که برچسب‌های `themeToggle`/`langToggle` به‌روز می‌شوند (حدود `app.js:278`): `refreshLabels()`.

- [ ] **مرحله ۱: کلیدهای i18n و اجرای تست**

کلیدهای جدول بالا را به هر دو زبان اضافه کن. Run: `node --test test/i18n.test.mjs` — Expected: PASS (هم‌سانی کلیدها و رشته‌ی ناخالی).

- [ ] **مرحله ۲: پیاده‌سازی `account.js`، تغییرات `index.html`، `style.css` و `app.js`**

دکمه در `index.html` با `hidden` شروع می‌شود. پنل زیر دکمه، هم‌تراز با لبه‌ی انتهایی (`inset-inline-end`)، با همان متغیرهای رنگ پوسته تا در تیره و روشن درست باشد، و در عرض ۳۷۵px بیرون از صفحه نزند.

- [ ] **مرحله ۳: راستی‌آزمایی دستی با API**

`DB_PATH=$(mktemp -d)/p.db node serve.js` را بالا بیاور و در مرورگر:
1. دکمه دیده می‌شود. `abc` → پیام نامعتبر. ` Me@Example.com ` → حالت وارد شده با `me@example.com`.
2. سه مدخل نقشه‌ی یک موضوع را تیک بزن؛ بعد از ~۱ ثانیه `curl 'localhost:8000/api/progress?email=me@example.com'` همان سه را نشان می‌دهد.
3. `localStorage.clear()` در کنسول و بارگذاری دوباره → دکمه بدون ورود؛ با ورود همان ایمیل، سه تیک برمی‌گردند (همان سناریوی «دستگاه دیگر»).
4. تیک بزن و بلافاصله تب را ببند؛ `curl` تیک را نشان می‌دهد (تمرکز بازبینی ۱).
5. سرور را متوقف کن، ایمیل دیگری وارد کن و تیک بزن → بدون خطا، تیک‌ها محلی می‌مانند؛ سرور را بالا بیاور و صفحه را بارگذاری کن → تیک‌ها روی سرور می‌روند (تمرکز بازبینی ۲).
6. زبان انگلیسی، پوسته‌ی تیره، عرض ۳۷۵px: پنل خوانا و درون صفحه.
7. `Escape` و کلیک بیرون پنل را می‌بندند؛ «خروج» ایمیل را پاک می‌کند و تیک‌ها می‌مانند.

- [ ] **مرحله ۴: راستی‌آزمایی دستی بدون API**

`node serve.js` (بدون `DB_PATH`): دکمه دیده نمی‌شود، نقشه و تیک‌ها مثل قبل کار می‌کنند، کنسول بدون خطا (جز ۴۰۴ همان health). `#/self-test` هنوز سبز است. `node --test` همه PASS.

- [ ] **مرحله ۵: Commit**

```bash
git add assets/js/account.js assets/js/i18n.js assets/js/app.js assets/css/style.css index.html
git commit -m "feat(account): sign in with an email to keep roadmap ticks across devices"
```

---

### تسک ۴: دیپلوی و مستندات

**Files:**
- Modify: `Dockerfile`, `CLAUDE.md`, `README.md`

- [ ] **مرحله ۱: `Dockerfile`**

- `COPY server/ ./server/` کنار بقیه‌ی `COPY`ها.
- `ENV DB_PATH=/data/progress.db`.
- پیش از `USER node`: `RUN mkdir -p /data && chown node:node /data`.
- `CMD ["node", "--disable-warning=ExperimentalWarning", "serve.js"]`.
- کامنت بالای فایل: دیگر «سایت ایستا» نیست؛ یک API کوچک هم دارد و `/data` باید volume باشد.

- [ ] **مرحله ۲: راستی‌آزمایی کانتینر** (اگر Docker روی این ماشین هست؛ اگر نیست، بگو که اجرا نشد)

```bash
docker build -t dezh-test .
```

```bash
docker run --rm -d -p 8001:8000 -v dezh-data:/data --name dezh-test dezh-test
```

`curl localhost:8001/api/health` → `{"ok":true}`؛ یک PUT، `docker restart dezh-test`، GET همان داده را می‌دهد؛ `docker logs dezh-test` بدون `ExperimentalWarning`. سپس `docker rm -f dezh-test` و `docker volume rm dezh-data`.

- [ ] **مرحله ۳: مستندات**

- `CLAUDE.md`، بخش Running: جمله‌ی «Local serving is identical to what GitHub Pages runs» را اصلاح کن — ایستا یکی است، ولی `/api/` فقط با `DB_PATH` روشن می‌شود و روی GitHub Pages دکمه‌ی ورود پنهان است. در Architecture یک بند: `server/` و `sync.js` مشترک، و این‌که ایمیل تأیید نمی‌شود عمداً.
- `README.md`: یک بخش کوتاه دیپلوی — در Dokploy یک Volume با مسیر `/data` لازم است، وگرنه دیتابیس با هر دیپلوی پاک می‌شود؛ پشتیبان یعنی کپی `progress.db`.

- [ ] **مرحله ۴: Commit**

```bash
git add Dockerfile CLAUDE.md README.md
git commit -m "build: ship the progress API with a /data volume, and document it"
```
