# Software Architecture Topic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** افزودن دومین موضوع سایت — «معماری نرم‌افزار» — با ۱۲۰ مدخل در ۷ دسته، روی یک مسیر یادگیری ۱۵ مرحله‌ای.

**Architecture:** کار کاملاً داده است. هر مرحلهٔ مسیر یادگیری یک تسک است: مدخل‌های آن مرحله در فایل دستهٔ خودشان نوشته می‌شوند، بعد مرحله به `roadmap.json` اضافه می‌شود. ترتیب تسک‌ها ترتیب مرحله‌هاست نه ترتیب دسته‌ها، تا هیچ مدخلی به شناسه‌ای که هنوز وجود ندارد `related` نشود.

**Tech Stack:** HTML/CSS/JS خام با ES module، بدون build، بدون npm. آزمون با `node --test` (runner داخلی Node). داده JSON خام زیر `data/`.

**Spec:** `docs/superpowers/specs/2026-08-19-software-architecture-topic-design.md`

## Global Constraints

این‌ها روی **هر** تسک اعمال می‌شوند و در تک‌تک تسک‌ها تکرار نمی‌شوند.

- **هیچ فایلی زیر `assets/` تغییر نمی‌کند.** تنها استثنای کل این نقشه، تسک ۱ است که یک فایل زیر `test/` را عوض می‌کند.
- **آزمون را با `node --test` بدون آرگومان مسیر اجرا کن.** `node --test test/` روی Node 22 با `MODULE_NOT_FOUND` می‌شکند.
- **سایت را با `node serve.js` بالا بیاور.** `fetch()` روی `file://` کار نمی‌کند و `index.html` مستقیم باز شود صفحهٔ خالی می‌دهد.
- **فارسی هرگز داخل `<pre>` یا `<code>` نیست.** `test/data-files.test.mjs` این را چک می‌کند و قرمز می‌شود. یعنی **کامنت‌های کد Go باید انگلیسی باشند.**
- **مدخل فیلد `category` یا `topic` ندارد.** هر دو از مسیر فایل می‌آیند و آزمون وجودشان را رد می‌کند.
- **`tags` اسلاگ انگلیسی lowercase بدون `#`.** مجموعهٔ مجاز این موضوع: `structure` `dependency` `boundary` `principle` `style` `domain` `communication` `async` `failure` `consistency` `scaling` `decision` `antipattern` `testing`. هر مدخل دو تا چهار برچسب. **پانزده مدخل در شرح خودشان فقط یک برچسب دارند** — `package`، `domain`، `synchronous-communication`، `rest`، `grpc`، `command`، `timeout`، `retry`، `transient-failure`، `exponential-backoff`، `consistency`، `strong-consistency`، `non-functional-requirements`، `trade-off`، `adr`. این کم‌گویی شرح است نه اجازه: آن برچسب می‌ماند و دست‌کم یکی دیگر از همین مجموعه که واقعاً درباره‌اش صدق می‌کند کنارش می‌آید. برچسبی که فقط برای رسیدن به عدد دو گذاشته شود بدتر از نبودنش است.
- **`related` فقط به شناسه‌ای که همان لحظه وجود دارد.** یعنی مدخل‌های مرحله‌های قبل، مدخل‌های همین مرحله، و ۴۷ شناسهٔ موضوع کریپتو. شناسهٔ ناموجود خطای اعتبارسنجی می‌سازد.
- **شناسه در کل سایت یکتاست.** `scalability`، `state`، `node`، `transaction`، `consensus`، `fork` و `block` در کریپتو گرفته‌اند و در این موضوع استفاده نمی‌شوند.
- **فیلدهای زبان‌خنثی بیرون از `fa`/`en` می‌نشینند:** `id`، `tags`، `related`، `svg`.

### دستور ساخت هر مدخل

هر مدخل این شکل را دارد و هر شش قسمت اجباری است:

```json
{
  "id": "...",
  "tags": ["...", "..."],
  "related": ["...", "..."],
  "svg": [{ "svg": "<svg ...>...</svg>" }],
  "fa": { "title": "...", "short": "...", "body": "...", "example": "..." },
  "en": { "title": "...", "short": "...", "body": "...", "example": "..." }
}
```

- **`short`** یک جمله: تعریف به‌علاوهٔ اینکه چرا مهم است.
- **`body`** این قوس را دارد: تعریف سادهٔ یک‌جمله‌ای ← مسئله‌ای که حل می‌کند با یک مثال بدِ مشخص ← مکانیزم ← جدول یا مقایسه ← دام رایج ← یک ابهام رایج که صریح رفع شود. هدف ۵ تا ۷ هزار کاراکتر فارسی، همان عمق مدخل‌های اخیر کریپتو مثل `nonce` و `transaction`.
- **`example`** کد Go کوتاه و واقعی داخل `<pre><code>`، با کامنت انگلیسی.
- **`svg`** دو تا سه دیاگرام inline. ریشه `direction="ltr"` می‌گیرد چون برچسب لاتین دارد، و هر `<text>` فارسی داخلش `direction="rtl"`.
- **`en`** ترجمهٔ کامل است نه خلاصه. `#/self-test` مدخل بدون ترجمه را گزارش می‌کند.
- هر اصطلاح انگلیسی جاافتاده، **اولین بار** در متن فارسی: `<span dir="ltr">(Circuit Breaker)</span>`. یک بار در هر مدخل.
- **ارجاع به مدخل دیگر را با عبارت «مدخل ‹عنوان فارسی›» بنویس.** `test/roadmap-order.test.mjs` دقیقاً همین الگو را از متن بیرون می‌کشد و پیش‌نیاز می‌شمارد. ارجاع به مدخلی که در مرحلهٔ بعدتر است، آزمون را قرمز می‌کند.
- در هر مرحله دست‌کم یک دیاگرام باید جعبه‌و‌فلش نباشد — خط زمانی، ماتریس، یا نمودار حالت.

### چرخهٔ تأیید هر تسک محتوایی

تسک‌های ۲ تا ۱۶ همه دقیقاً همین شش قدم را دارند، با ورودی متفاوت:

1. مدخل‌های مرحله را در فایل دسته بنویس (و اگر دستهٔ تازه‌ای است، `categories.json` و فایل خالی‌اش را بساز).
2. `node --test` → **باید قرمز شود** با «این مدخل‌ها در هیچ مرحله‌ای نیستند».
3. مرحله را به `data/architecture/roadmap.json` اضافه کن.
4. `node --test` → **باید سبز شود**.
5. `node serve.js` و `#/self-test` → صفر خطای اعتبارسنجی، صفر شکست رندر، صفر مدخل بدون ترجمه، صفر مدخل خارج از نقشه. و `git diff --stat` هیچ چیزی زیر `assets/` نشان ندهد.
6. کامیت.

قدم ۲ همان گاردی است که CLAUDE.md وعده می‌دهد. اگر قرمز نشد یعنی چیزی سر جایش نیست — نرو جلو.

---

## File Structure

| فایل | مسئولیت | تسک |
|---|---|---|
| `test/roadmap-order.test.mjs` | گارد ترتیب، برای همهٔ موضوع‌ها نه فقط کریپتو | ۱ |
| `data/topics.json` | یک سطر `architecture` | ۲ |
| `data/architecture/categories.json` | ۷ دسته، فاز‌به‌فاز | ۲، ۷، ۱۰، ۱۱، ۱۲ |
| `data/architecture/roadmap.json` | ۱۵ مرحله، یکی در هر تسک | ۲–۱۶ |
| `data/architecture/entries/foundations.json` | ۱۸ مدخل | ۲، ۳، ۴ |
| `data/architecture/entries/principles.json` | ۸ مدخل | ۲، ۵، ۶ |
| `data/architecture/entries/styles.json` | ۲۶ مدخل | ۷، ۸، ۱۰، ۱۴، ۱۵، ۱۶ |
| `data/architecture/entries/domain.json` | ۱۴ مدخل | ۷، ۹، ۱۱ |
| `data/architecture/entries/communication.json` | ۲۰ مدخل | ۱۱، ۱۲، ۱۳، ۱۴ |
| `data/architecture/entries/distributed.json` | ۲۰ مدخل | ۱۲، ۱۳ |
| `data/architecture/entries/decisions.json` | ۱۴ مدخل | ۱۰، ۱۶ |
| `data/crypto/entries/*.json` | فقط فیلد `related`، برای پل دوطرفه | ۱۲، ۱۳، ۱۴، ۱۵، ۱۶ |

---

## Task 1: گارد ترتیب را از کریپتو آزاد کن

`test/roadmap-order.test.mjs:10` با `const TOPIC = 'crypto'` به یک موضوع قفل است. تا این عوض نشود، ۱۲۰ مدخل بعدی هیچ گارد ترتیبی ندارند و می‌شود مدخلی نوشت که به چیزی تکیه دارد که خواننده هنوز نخوانده، بی‌آنکه آزمونی صدا کند.

فهرست‌های `MUTUAL` و `DECORATIVE` هم مخصوص کریپتو هستند و باید به‌ازای موضوع شوند، وگرنه استثنای یک موضوع گارد موضوع دیگر را سوراخ می‌کند.

**Files:**
- Modify: `test/roadmap-order.test.mjs` (کل فایل بازنویسی می‌شود)

**Interfaces:**
- Consumes: `roadmapEntryIds(roadmap)` از `assets/js/roadmap.js` — بدون تغییر
- Produces: آزمونی که روی هر موضوع `data/topics.json` می‌چرخد. تسک‌های ۲ تا ۱۶ روی قرمز‌شدن این آزمون حساب می‌کنند.

- [ ] **Step 1: فایل آزمون را بازنویسی کن**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { roadmapEntryIds } from '../assets/js/roadmap.js';

function readJson(path) {
  return JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
}

// جفت‌هایی که به هم ارجاع می‌دهند. هیچ ترتیب خطی‌ای راضی‌شان نمی‌کند، پس
// صریحاً استثنا می‌شوند — با دلیل، نه فقط با شناسه. به‌ازای موضوع، چون
// استثنای یک موضوع نباید گارد موضوع دیگر را سوراخ کند.
const MUTUAL = {
  crypto: [
    // تراکنش و بلاک هرکدام به دیگری ارجاع می‌دهند. پرینستون (فصل ۳) و
    // استنفورد (جلسه‌ی ۲) هر دو تراکنش را اول می‌آورند؛ ما هم.
    ['transaction', 'block'],
  ],
};

// ارجاع‌هایی که تزئینی‌اند، نه پیش‌نیاز. هرکدام با دلیلش.
const DECORATIVE = {
  crypto: [
    // «بایت» فقط یک هشِ ۳۲ بایتی را به عنوان نمونه‌ی بایت نشان می‌دهد.
    ['byte', 'hash'],
    // «درخت مرکل» در حاشیه‌ی آخرش به extraNonce اشاره می‌کند؛ خود درخت
    // هیچ چیزی از نانس لازم ندارد.
    ['merkle-tree', 'nonce'],
  ],
};

function exemptionsOf(topicId) {
  return { mutual: MUTUAL[topicId] ?? [], decorative: DECORATIVE[topicId] ?? [] };
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

for (const topic of readJson('data/topics.json')) {
  const TOPIC = topic.id;
  const roadmap = readJson(`data/${TOPIC}/roadmap.json`);
  const categories = readJson(`data/${TOPIC}/categories.json`);
  const entries = categories.flatMap((category) => readJson(`data/${TOPIC}/entries/${category.file}`));

  const { mutual, decorative } = exemptionsOf(TOPIC);
  const isExempt = (from, to) =>
    decorative.some(([a, b]) => a === from && b === to) ||
    mutual.some(([a, b]) => (a === from && b === to) || (b === from && a === to));

  const titleToId = new Map(entries.map((entry) => [entry.fa.title, entry.id]));
  const order = roadmapEntryIds(roadmap);
  const position = new Map(order.map((id, index) => [id, index]));

  test(`[${TOPIC}] نقشه هر مدخل موضوع را دقیقاً یک بار دارد`, () => {
    assert.equal(order.length, new Set(order).size, 'شناسه‌ی تکراری در نقشه');
    const missing = entries.map((entry) => entry.id).filter((id) => !position.has(id));
    assert.deepEqual(missing, [], `این مدخل‌ها در هیچ مرحله‌ای نیستند: ${missing.join(', ')}`);
  });

  test(`[${TOPIC}] هیچ مدخلی پیش از چیزی که به آن تکیه دارد نمی‌آید`, () => {
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

  test(`[${TOPIC}] فهرست استثناها کهنه نشده`, () => {
    // اگر ارجاعی حذف شد، استثنایش هم باید برود؛ وگرنه استثناها بی‌صدا
    // انباشته می‌شوند و گارد را سوراخ می‌کنند.
    const byId = new Map(entries.map((entry) => [entry.id, entry]));
    for (const [from, to] of [...decorative, ...mutual]) {
      const entry = byId.get(from);
      assert.ok(entry, `استثنا برای مدخل ناموجود ${from}`);
      assert.ok(
        citationsOf(entry, titleToId).has(to),
        `${from} دیگر به ${to} ارجاع نمی‌دهد — این استثنا را بردار`,
      );
    }
  });
}
```

- [ ] **Step 2: آزمون را اجرا کن**

Run: `node --test`
Expected: PASS. سه آزمون حالا با پیشوند `[crypto]` نام دارند. هیچ موضوع دیگری هنوز نیست، پس تعداد آزمون‌ها عوض نمی‌شود.

- [ ] **Step 3: ثابت کن گارد واقعاً به موضوع تازه می‌رسد**

این قدم موقتی است و برگردانده می‌شود. بدون آن، ادعای «گارد آزاد شد» آزموده نشده می‌ماند.

```bash
mkdir -p /tmp/guardcheck && cp data/topics.json /tmp/guardcheck/
python3 - <<'PY'
import json
p='data/topics.json'
t=json.load(open(p))
t.append({"id":"guardcheck","fa":"آزمایش","en":"Guard check"})
json.dump(t,open(p,'w'),ensure_ascii=False,indent=2)
PY
mkdir -p data/guardcheck/entries
echo '[{"id":"guardcheck-x","file":"x.json","fa":"آزمایش","en":"X"}]' > data/guardcheck/categories.json
printf '[{"id":"gx","tags":["structure"],"related":[],"fa":{"title":"گ","short":"s","body":"<p>b</p>"},"en":{"title":"G","short":"s","body":"<p>b</p>"}}]' > data/guardcheck/entries/x.json
echo '{"stages":[]}' > data/guardcheck/roadmap.json
node --test
```

Expected: FAIL روی `[guardcheck] نقشه هر مدخل موضوع را دقیقاً یک بار دارد` با پیام «این مدخل‌ها در هیچ مرحله‌ای نیستند: gx». اگر سبز ماند، آزمون هنوز روی همهٔ موضوع‌ها نمی‌چرخد و باید درست شود.

- [ ] **Step 4: آزمایش را پاک کن**

```bash
rm -rf data/guardcheck && cp /tmp/guardcheck/topics.json data/topics.json && rm -rf /tmp/guardcheck
node --test
```

Expected: PASS، و `git status` فقط `test/roadmap-order.test.mjs` را تغییریافته نشان دهد.

- [ ] **Step 5: کامیت**

```bash
git add test/roadmap-order.test.mjs
git commit -m "test: run the roadmap order guard on every topic

CLAUDE.md promises that a new entry keeps node --test red until it sits on
its topic's roadmap. The test pinned TOPIC to crypto, so that promise held
for exactly one topic and the next one would have been written with no
ordering guard at all.

Exemption lists are now per-topic, so one topic's decorative citation
cannot quietly punch a hole in another's guard."
```

---

## Task 2: مرحلهٔ ۱ — مسئله چیست (۶ مدخل)

اولین تسک محتوایی، پس اسکلت موضوع هم اینجاست: بدون آن، این شش مدخل جایی برای زندگی ندارند.

**Files:**
- Modify: `data/topics.json`
- Create: `data/architecture/categories.json`
- Create: `data/architecture/roadmap.json`
- Create: `data/architecture/entries/foundations.json`
- Create: `data/architecture/entries/principles.json` (آرایهٔ خالی `[]` — تسک ۵ پُرش می‌کند)

**Interfaces:**
- Consumes: ۴۷ شناسهٔ موضوع کریپتو برای `related` (`blockchain`، `hash`، `scalability`، …)
- Produces: شناسه‌های `software-architecture`، `complexity`، `accidental-complexity`، `coupling`، `cohesion`، `separation-of-concerns` — هر تسک بعدی می‌تواند به این‌ها `related` بدهد و در متن «مدخل ‹عنوان›» بنویسد.

### مدخل‌ها

**`software-architecture`** — معماری نرم‌افزار / Software Architecture · tags: `structure` `decision` · related: `complexity`، `coupling`، `cohesion`، `separation-of-concerns`
بدنه: معماری مجموعهٔ تصمیم‌هایی است که برگرداندنشان گران است — نه ساختار پوشه. مثال بدِ مشخص: پروژه‌ای با پوشه‌بندی تمیز که افزودن یک فیلد به سفارش، ده فایل را لمس می‌کند. فرق Architecture و Design دقیقاً روی همین محور هزینهٔ برگشت است، نه روی «بزرگ و کوچک». دام رایج: معماری خوب را با معماری پیچیده یکی گرفتن.
دیاگرام: **ماتریس** دو محوره — «هزینهٔ تغییر» در برابر «دامنهٔ اثر» — با چند تصمیم واقعی روی آن (نام فیلد، امضای تابع، انتخاب پایگاه داده، مرز سرویس). عمداً جعبه‌و‌فلش نیست.
مثال Go: دو ساختار پوشه کنار هم، یکی مرتب ولی بی‌مرز و یکی با مرز.

**`complexity`** — پیچیدگی / Complexity · tags: `structure` `decision` · related: `software-architecture`، `accidental-complexity`، `coupling`، `cohesion`
بدنه: پیچیدگی یعنی چقدر از سیستم را باید در سر نگه داری تا بتوانی یک تکه‌اش را با اطمینان عوض کنی. مثال بد: تابعی ۴۰ خطی که برای فهمیدنش باید سه فایل دیگر را هم باز کنی. مکانیزم: پیچیدگی با تعداد خط رشد نمی‌کند، با تعداد ارتباط رشد می‌کند. جدول: n جزء مستقل در برابر n جزء کاملاً به‌هم‌وصل و شمار ارتباط‌ها.
دیاگرام: رشد `n(n-1)/2` — چهار گراف کوچک با ۳، ۴، ۶ و ۸ گره کاملاً وصل، با شمار یال زیر هرکدام.
مثال Go: تابعی که سه وابستگی سراسری دارد، و همان تابع با ورودی صریح.

**`accidental-complexity`** — پیچیدگی عارضی و ذاتی / Accidental and Essential Complexity · tags: `structure` `decision` `antipattern` · related: `complexity`، `software-architecture`
بدنه: تفکیک بروکس: پیچیدگی ذاتی از خود مسئله می‌آید و حذف‌شدنی نیست؛ پیچیدگی عارضی را ما با ابزار و ساختار خودمان اضافه کرده‌ایم. مثال بد: پنج لایهٔ انتزاع روی یک `CREATE TABLE`. مکانیزم: تست تشخیص — اگر مسئله را برای یک آدم غیرفنی توضیح بدهی، کدام قسمت‌ها هنوز سخت می‌مانند؟ آن‌ها ذاتی‌اند. دام: هر پیچیدگی‌ای را عارضی فرض کردن و بعد از حذفش دیدن که مسئله واقعاً همان‌قدر سخت بود.
دیاگرام: یک ستون که به دو تکه تقسیم می‌شود، با چند نمونهٔ واقعی در هر تکه.
مثال Go: مقایسهٔ یک repository با پنج لایه و همان کار با یک تابع.

**`coupling`** — جفت‌شدگی / Coupling · tags: `structure` `dependency` · related: `cohesion`، `complexity`، `software-architecture`
بدنه: جفت‌شدگی یعنی وقتی یکی را عوض می‌کنی، مجبوری آن یکی را هم عوض کنی. مثال بد: سرویس گزارش که مستقیم به ستون‌های جدول سفارش نگاه می‌کند. مکانیزم و درجه‌بندی: جفت‌شدگی از طریق داده، از طریق قرارداد، از طریق زمان‌بندی، از طریق دانستنِ درونیات. جدول درجه‌ها از سست به سفت. نکتهٔ مهم: جفت‌شدگی همیشه بد نیست — چیزهایی که با هم عوض می‌شوند باید به هم چسبیده باشند؛ هزینه وقتی است که بی‌دلیل باشد.
دیاگرام: چهار جفت جعبه با انواع مختلف پیوند، از خط‌چین تا خط ضخیم.
مثال Go: تابعی که `*sql.Rows` می‌گیرد در برابر تابعی که یک struct دامنه می‌گیرد.

**`cohesion`** — انسجام / Cohesion · tags: `structure` `dependency` · related: `coupling`، `separation-of-concerns`، `complexity`
بدنه: انسجام یعنی چیزهایی که داخل یک واحدند واقعاً به هم مربوط‌اند. مثال بد: پکیج `utils` که همه‌چیز دارد. مکانیزم: معیارِ درست «هم‌موضوع بودن» نیست، «هم‌زمان تغییر کردن» است. رابطهٔ انسجام و جفت‌شدگی: بالا بردن انسجام معمولاً خودبه‌خود جفت‌شدگی را پایین می‌آورد، چون مرز را جایی می‌گذارد که تغییر واقعاً از آن رد نمی‌شود. دام: تقسیم بر اساس نوع فنی (همهٔ مدل‌ها، همهٔ کنترلرها) که انسجام را از بین می‌برد.
دیاگرام: **ماتریس تغییر** — سطرها فایل، ستون‌ها تغییرهای گذشته، خانه‌های پررنگ نشان می‌دهند کدام فایل‌ها با هم عوض شده‌اند و مرز درست کجاست.
مثال Go: پکیج `utils` در برابر پکیج `pricing`.

**`separation-of-concerns`** — تفکیک دغدغه‌ها / Separation of Concerns · tags: `structure` `principle` · related: `cohesion`، `coupling`، `complexity`
بدنه: هر تکه از کد باید دربارهٔ یک چیز تصمیم بگیرد. مثال بد: هندلر HTTP که JSON را می‌خواند، تخفیف را حساب می‌کند، به پایگاه داده می‌نویسد و ایمیل می‌فرستد. مکانیزم: تست ذهنی «اگر این بخش را عوض کنم، به چه دلیل؟» — اگر دو دلیل مستقل داشت، دو دغدغه است. تفاوت مهم: تفکیک دغدغه‌ها با لایه‌بندی یکی نیست؛ لایه یکی از راه‌های تفکیک است نه تعریفش.
دیاگرام: یک هندلر که به چهار دغدغهٔ نام‌دار شکسته می‌شود، با «دلیل تغییر» زیر هرکدام.
مثال Go: هندلر شلوغ، و همان هندلر بعد از جدا شدن محاسبه.

### مرحلهٔ نقشه

```json
{
  "id": "problem",
  "fa": {
    "title": "مسئله چیست",
    "why": "پیش از هر سبک و الگویی: معماری اصلاً دارد چه چیزی را حل می‌کند"
  },
  "en": {
    "title": "What the problem is",
    "why": "Before any style or pattern: what architecture is actually solving"
  },
  "entries": [
    "software-architecture",
    "complexity",
    "accidental-complexity",
    "coupling",
    "cohesion",
    "separation-of-concerns"
  ]
}
```

- [ ] **Step 1: اسکلت موضوع را بساز**

`data/topics.json` — سطر دوم اضافه می‌شود:

```json
[
  { "id": "crypto", "fa": "کریپتو و بلاکچین", "en": "Crypto & Blockchain" },
  { "id": "architecture", "fa": "معماری نرم‌افزار", "en": "Software Architecture" }
]
```

`data/architecture/categories.json`:

```json
[
  { "id": "foundations", "file": "foundations.json", "fa": "مبانی",        "en": "Fundamentals" },
  { "id": "principles",  "file": "principles.json",  "fa": "اصول و تزریق", "en": "Principles & Injection" }
]
```

`data/architecture/entries/principles.json` با `[]`، و `data/architecture/roadmap.json` با `{ "stages": [] }`.

- [ ] **Step 2: شش مدخل را بنویس**

`data/architecture/entries/foundations.json` را با آرایه‌ی شش مدخل بالا بساز، طبق «دستور ساخت هر مدخل» در Global Constraints.

- [ ] **Step 3: آزمون را اجرا کن — باید قرمز شود**

Run: `node --test`
Expected: FAIL روی `[architecture] نقشه هر مدخل موضوع را دقیقاً یک بار دارد` با «این مدخل‌ها در هیچ مرحله‌ای نیستند: software-architecture, complexity, accidental-complexity, coupling, cohesion, separation-of-concerns».

اگر سبز شد، یا تسک ۱ درست انجام نشده یا مدخل‌ها در فایلی هستند که `categories.json` به آن اشاره نمی‌کند.

- [ ] **Step 4: مرحله را به نقشه اضافه کن، آزمون سبز شود**

مرحلهٔ `problem` بالا را در آرایهٔ `stages` بگذار.

Run: `node --test`
Expected: PASS

- [ ] **Step 5: در مرورگر بررسی کن**

```bash
node serve.js
```

- `#/self-test` → صفر خطای اعتبارسنجی، صفر شکست رندر، صفر مدخل بدون ترجمهٔ انگلیسی، صفر مدخل خارج از نقشه.
- سوییچ موضوع میان کریپتو و معماری در هر دو زبان کار کند.
- `#/roadmap/architecture` مرحلهٔ اول را با ۰ از ۶ نشان دهد.
- `git diff --stat` هیچ چیزی زیر `assets/` نشان ندهد.

- [ ] **Step 6: کامیت**

```bash
git add data/topics.json data/architecture
git commit -m "feat: open the software architecture topic

Six entries on what architecture is for, before any style or pattern:
what makes a decision architectural, why complexity grows with
connections rather than lines, and why coupling is only a cost when it
is not paid for.

categories.json and roadmap.json carry only what has entries behind
them — roadmap.js:51 raises a validation error for any roadmap id with
no entry, so the full map cannot ship ahead of the writing."
```

---

## Task 3: مرحلهٔ ۲ — واحدهای ساختار (۶ مدخل)

**Files:**
- Modify: `data/architecture/entries/foundations.json` (شش مدخل اضافه می‌شود، جمع ۱۲)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `software-architecture`، `complexity`، `coupling`، `cohesion`، `separation-of-concerns`
- Produces: `module`، `information-hiding`، `package`، `component`، `layer`، `boundary`

### مدخل‌ها

**`module`** — ماژول / Module · tags: `structure` `boundary` · related: `information-hiding`، `package`، `component`، `cohesion`
بدنه: ماژول واحدی است که یک تصمیم را پشت خودش پنهان می‌کند. مثال بد: «ماژول» ی که فقط پوشه است و هر کسی از هر جایش هرچه بخواهد برمی‌دارد. مکانیزم: ماژول = سطح بیرونی کوچک + درون آزاد برای تغییر. جدول: چه چیزی ماژول است و چه چیزی فقط پوشه. دام: تقسیم بر اساس نوع فنی به‌جای تصمیم.
دیاگرام: یک ماژول با سطح بیرونی باریک و درون شلوغ، کنار یک پوشه با سطح بیرونی به‌اندازهٔ کل درونش.
مثال Go: پکیجی که فقط `type` صادر می‌کند در برابر پکیجی که همه‌چیزش export شده.

**`information-hiding`** — پنهان‌سازی اطلاعات / Information Hiding · tags: `structure` `boundary` `principle` · related: `module`، `boundary`، `coupling`
بدنه: قاعدهٔ پارناس (۱۹۷۲): سیستم را نه بر اساس مراحل اجرا، بلکه بر اساس تصمیم‌هایی که ممکن است عوض شوند تقسیم کن، و هر تصمیم را داخل یک ماژول پنهان کن. مثال بد: تقسیم بر اساس گام‌های پردازش، که هر تغییر قالب فایل همهٔ گام‌ها را لمس می‌کند. مکانیزم: «چه چیزی ممکن است عوض شود؟» تنها سؤال درست تقسیم‌بندی است. این ریشهٔ همهٔ چیزهایی است که بعداً می‌آید — مدخل کپسوله‌سازی، پورت، و مرز همه شکل‌های همین‌اند.
دیاگرام: **جدول تصمیم‌ها** — سطر: تصمیم (قالب فایل، الگوریتم مرتب‌سازی، پایگاه داده)، ستون: کدام ماژول می‌داند.
مثال Go: interface که فقط نتیجه را می‌دهد و نوع ذخیره‌سازی را پنهان می‌کند.

**`package`** — پکیج / Package · tags: `structure` · related: `module`، `component`، `cohesion`
بدنه: پکیج واحد نام‌گذاری و دسترسی زبان است — در Go همان پوشه با قاعدهٔ حرف بزرگ. تفاوت با ماژول: ماژول مفهوم طراحی است، پکیج ابزار زبان برای تحمیل آن. مثال بد: `models` و `services` و `handlers` به‌عنوان پکیج. مکانیزم: پکیج در Go تنها جایی است که «صادرشده / صادرنشده» واقعاً اجرا می‌شود، پس مرز طراحی باید روی مرز پکیج بنشیند وگرنه تحمیل نمی‌شود. جدول: نام‌گذاری بر اساس نوع در برابر نام‌گذاری بر اساس دامنه.
دیاگرام: درخت پوشه‌ای دو حالته، لایه‌ای در برابر دامنه‌ای.
مثال Go: `order/` با `Order` و `repo` خصوصی.

**`component`** — کامپوننت / Component · tags: `structure` `boundary` · related: `module`، `package`، `boundary`
بدنه: کامپوننت واحد استقرار و جایگزینی است — چیزی که می‌شود جدا ساخت، جدا نسخه داد، و با پیاده‌سازی دیگری عوض کرد. مثال بد: «کامپوننت» ی که بدون سه پکیج دیگر کامپایل نمی‌شود. مکانیزم: تست جایگزینی. جدول: ماژول، پکیج، کامپوننت — کدام مفهوم طراحی، کدام ابزار زبان، کدام واحد استقرار. اینجا هم معماری افزونه‌ای <span dir="ltr">(Plugin Architecture)</span> و ریزهسته <span dir="ltr">(Microkernel)</span> توضیح داده می‌شوند، چون هر دو کامپوننت‌محورند.
دیاگرام: یک هسته با سه کامپوننت قابل تعویض که در آن جا می‌شوند.
مثال Go: interface به‌علاوهٔ دو پیاده‌سازی که در زمان راه‌اندازی انتخاب می‌شوند.

**`layer`** — لایه / Layer · tags: `structure` `boundary` · related: `module`، `component`، `boundary`، `separation-of-concerns`
بدنه: لایه گروهی از ماژول‌ها با یک سطح انتزاع مشترک است، و قاعده‌اش این است که ارتباط فقط یک‌طرفه از بالا به پایین می‌رود. مثال بد: لایه‌ای که برای یک کار کوچک به لایهٔ بالای خودش زنگ می‌زند. تفاوت لایه و ماژول: لایه افقی می‌برد، ماژول عمودی — و همین است که بعداً برش عمودی را لازم می‌کند. دام: لایه را با پوشه یکی گرفتن.
دیاگرام: چهار نوار افقی با فلش‌های یک‌طرفه، و یک فلش قرمز رو به بالا که شکستن قاعده را نشان می‌دهد.
مثال Go: ساختار پوشهٔ لایه‌ای با یک import ممنوع که کامنتش می‌گوید چرا ممنوع است.

**`boundary`** — مرز / Boundary · tags: `boundary` `structure` · related: `layer`، `module`، `information-hiding`، `coupling`
بدنه: مرز جایی است که یک طرفش می‌تواند عوض شود بی‌آنکه طرف دیگر بفهمد. مثال بد: «مرز» ی که هر دو طرفش یک struct مشترک را import می‌کنند. مکانیزم: هر مرز واقعی سه چیز دارد — قراردادی صریح، ترجمه‌ای در عبور، و آزادی درونی در هر دو طرف. جدول: انواع مرز و هزینه‌شان، از فراخوانی تابع تا فراخوانی شبکه. دام: مرز گذاشتن جایی که تغییر از آن رد نمی‌شود، که فقط هزینه است بی‌فایده.
دیاگرام: **خط زمانی تغییر** — یک تغییر که به مرز می‌رسد و متوقف می‌شود، در برابر همان تغییر که از سه ماژول رد می‌شود.
مثال Go: دو struct، یکی دامنه و یکی DTO، با تابع ترجمه.

### مرحلهٔ نقشه

```json
{
  "id": "units",
  "fa": {
    "title": "واحدهای ساختار",
    "why": "کلمه‌هایی که همه به کار می‌برند و کمتر کسی دقیق تعریفشان می‌کند"
  },
  "en": {
    "title": "The units of structure",
    "why": "The words everyone uses and few define precisely"
  },
  "entries": ["module", "information-hiding", "package", "component", "layer", "boundary"]
}
```

- [ ] **Step 1: شش مدخل را به `foundations.json` اضافه کن**
- [ ] **Step 2: `node --test` → باید قرمز شود** با «این مدخل‌ها در هیچ مرحله‌ای نیستند: module, information-hiding, package, component, layer, boundary»
- [ ] **Step 3: مرحلهٔ `units` را به `roadmap.json` اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر؛ `git diff --stat` چیزی زیر `assets/` ندارد**
- [ ] **Step 6: کامیت**

```bash
git add data/architecture
git commit -m "feat: name the units of structure

Module, package, component, layer and boundary are used
interchangeably in most codebases and mean different things. Parnas's
rule sits underneath all of them: split by the decisions that might
change, not by the steps of execution."
```

---

## Task 4: مرحلهٔ ۳ — وابستگی و جهتش (۶ مدخل)

**Files:**
- Modify: `data/architecture/entries/foundations.json` (شش مدخل، جمع ۱۸ — این دسته کامل می‌شود)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: هر ۱۲ شناسهٔ مرحله‌های ۱ و ۲
- Produces: `dependency`، `interface`، `circular-dependency`، `dependency-direction`، `dependency-inversion`، `leaky-abstraction` — مرحله‌های ۴ تا ۷ سنگین به این‌ها تکیه دارند.

### مدخل‌ها

**`dependency`** — وابستگی / Dependency · tags: `dependency` `structure` · related: `coupling`، `module`، `boundary`
بدنه: A به B وابسته است اگر تغییر B بتواند A را بشکند. مثال بد: تصور اینکه وابستگی فقط `import` است. مکانیزم: وابستگی از راه‌های نامرئی هم می‌آید — نام جدول، کلید JSON، ترتیب فراخوانی، فرض دربارهٔ زمان پاسخ. جدول: انواع وابستگی و اینکه کامپایلر کدام‌ها را می‌بیند. دام: تکیه بر گراف import به‌عنوان تصویر کامل وابستگی.
دیاگرام: **جدول** — سطر: نوع وابستگی؛ ستون: آیا کامپایلر می‌بیند، آیا تست می‌گیرد، آیا فقط در تولید معلوم می‌شود.
مثال Go: دو سرویس بدون import مشترک که از یک نام صف مشترک استفاده می‌کنند.

**`interface`** — اینترفیس / Interface · tags: `dependency` `boundary` · related: `dependency`، `information-hiding`، `boundary`، `module`
بدنه: اینترفیس قراردادی است که مصرف‌کننده به آن تکیه می‌کند، نه به پیاده‌سازی. مثال بد: interface ی که دقیقاً متدهای یک پیاده‌سازی را آینه کرده. مکانیزم Go: interface در محل **مصرف** تعریف می‌شود نه در محل پیاده‌سازی — و همین یک قاعده بعداً پورت و وارونگی وابستگی را ممکن می‌کند. جدول: interfaceای که کوچک است در برابر interfaceای که فقط آینه است. دام: تعریف interface برای چیزی که فقط یک پیاده‌سازی دارد و هیچ‌وقت دومی نمی‌گیرد.
دیاگرام: مصرف‌کننده و دو پیاده‌سازی، با نشان‌دادن اینکه قرارداد در سمت مصرف‌کننده زندگی می‌کند.
مثال Go: interface یک‌متدی تعریف‌شده در پکیج مصرف‌کننده.

**`circular-dependency`** — وابستگی حلقوی / Circular Dependency · tags: `dependency` `antipattern` · related: `dependency`، `module`، `package`، `boundary`
بدنه: وقتی A به B و B به A وابسته است، هیچ‌کدام دیگر جدا فهمیده، تست یا جایگزین نمی‌شوند — عملاً یک ماژول‌اند با ظاهر دو تا. مثال بد: `user` و `order` که هرکدام struct دیگری را لازم دارند. مکانیزم: Go اصلاً کامپایل نمی‌کند، که رحمت است؛ در زبان‌های دیگر حلقه بی‌صدا می‌ماند. سه راه شکستن حلقه: بردن مفهوم مشترک به ماژول سوم، وارونه کردن یکی از دو جهت با قرارداد، یا پذیرفتن اینکه واقعاً یک ماژول است و ادغام کردنشان. دام: شکستن حلقه با یک پکیج `common` که خودش به گلولهٔ گِل تبدیل می‌شود.
دیاگرام: حلقهٔ دوتایی و سه‌تایی، و همان‌ها بعد از هر سه راه‌حل.
مثال Go: خطای واقعی `import cycle not allowed` و کد قبل و بعد.

**`dependency-direction`** — جهت وابستگی / Dependency Direction · tags: `dependency` `boundary` `principle` · related: `dependency`، `interface`، `circular-dependency`، `layer`، `boundary`
بدنه: سؤال اصلی معماری این نیست که چه چیزی به چه چیزی وصل است، بلکه این است که فلش رو به کدام طرف است. مثال بد: منطق کسب‌وکار که `database/sql` را import می‌کند. مکانیزم: قاعدهٔ ذهنی — فلش همیشه به سمت چیزی که کمتر عوض می‌شود. تفاوت مهمی که درس‌نامه رویش تأکید دارد: جهت وابستگی با جهت جریان داده یکی نیست؛ می‌شود داده از A به B برود در حالی که وابستگی از B به A است. دام: خواندن دیاگرام معماری به‌عنوان دیاگرام جریان داده.
دیاگرام: دو فلش روی یک ارتباط — یکی جریان داده، یکی وابستگی — که خلاف هم‌اند.
مثال Go: منطق دامنه با interface خودش، و پیاده‌سازی SQL که آن را برآورده می‌کند.

**`dependency-inversion`** — وارونگی وابستگی / Dependency Inversion · tags: `dependency` `principle` `boundary` · related: `dependency-direction`، `interface`، `information-hiding`
بدنه: به‌جای اینکه ماژول سطح‌بالا به سطح‌پایین وابسته باشد، هر دو به یک قرارداد وابسته می‌شوند — و آن قرارداد مال سطح‌بالاست. مثال بد: `OrderService` که `PostgresRepo` را می‌سازد. مکانیزم: فلش با اضافه‌کردن یک interface در سمت درست عملاً برمی‌گردد، بی‌آنکه جریان داده عوض شود. **این همان حرف D در سالید است؛ دو مفهوم نیستند.** دام: interface را در پکیج پیاده‌سازی گذاشتن، که وابستگی را دقیقاً همان‌جا که بود نگه می‌دارد.
دیاگرام: **نمودار قبل و بعد** — فلش که با ورود interface برمی‌گردد، در حالی که فلش داده ثابت مانده.
مثال Go: همان `OrderService` با interface خودش.

**`leaky-abstraction`** — انتزاع نشت‌کننده / Leaky Abstraction · tags: `dependency` `antipattern` `boundary` · related: `interface`، `boundary`، `information-hiding`، `dependency-inversion`
بدنه: انتزاعی که مجبورت می‌کند بدانی زیرش چیست، وعده‌اش را نگه نداشته. مثال بد: interface مخزن که یک متد `Query(sql string)` دارد. مکانیزم: نشت معمولاً از سه جا می‌آید — نوع خطا، رفتار زمانی، و ترتیب فراخوانی. جدول: نشت‌های رایج و اینکه کدام قابل رفع است و کدام ذاتی. نکتهٔ صادقانه: هیچ انتزاعی کاملاً بی‌نشت نیست؛ سؤال این است که نشت را آگاهانه انتخاب کرده‌ای یا نه. دام: افزودن لایهٔ انتزاع روی انتزاع نشت‌کننده، که فقط نشت را عمیق‌تر می‌کند.
دیاگرام: interface تمیز با سه سوراخ نام‌دار زیرش.
مثال Go: interface مخزن با متد `Query`، و همان با متدهای دامنه‌ای.

### مرحلهٔ نقشه

```json
{
  "id": "direction",
  "fa": {
    "title": "وابستگی و جهتش",
    "why": "مهم‌ترین سؤال معماری: فلش رو به کدام طرف است"
  },
  "en": {
    "title": "Dependency and its direction",
    "why": "The one architectural question that matters most: which way the arrow points"
  },
  "entries": [
    "dependency",
    "interface",
    "circular-dependency",
    "dependency-direction",
    "dependency-inversion",
    "leaky-abstraction"
  ]
}
```

- [ ] **Step 1: شش مدخل را به `foundations.json` اضافه کن (جمع ۱۸)**
- [ ] **Step 2: `node --test` → باید قرمز شود**
- [ ] **Step 3: مرحلهٔ `direction` را اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 6: کامیت**

```bash
git add data/architecture
git commit -m "feat: point the arrows

Dependency direction, not connection, is what a design decides. The
inversion entry and SOLID's D are one idea and get one entry; the
leaky-abstraction entry is the honest counterweight, since the
interfaces the next stages lean on do not seal perfectly."
```

---

## Task 5: مرحلهٔ ۴ — اصول SOLID (۵ مدخل)

**Files:**
- Modify: `data/architecture/entries/principles.json` (از `[]` به پنج مدخل)
- Modify: `data/architecture/roadmap.json`

`categories.json` دست نمی‌خورد — دستهٔ `principles` در تسک ۲ ساخته شد.

**Interfaces:**
- Consumes: `dependency-inversion`، `interface`، `cohesion`، `separation-of-concerns`، `module`
- Produces: `solid`، `single-responsibility`، `open-closed`، `liskov-substitution`، `interface-segregation`

### مدخل‌ها

**`solid`** — سالید / SOLID · tags: `principle` `structure` · related: `single-responsibility`، `open-closed`، `liskov-substitution`، `interface-segregation`، `dependency-inversion`
بدنه: پنج اصل طراحی شیءگرا که رابرت مارتین جمعشان کرد. اینجا نقش مدخل چتر است: هر حرف کجا کمک می‌کند و کجا نه. **D اینجا مدخل جدا ندارد و به مدخل وارونگی وابستگی می‌رود.** هشدار صادقانه که خود درس‌نامه هم می‌دهد: سالید قانون نیست، پنج پیش‌فرض است؛ اعمال کورکورانه‌اش دقیقاً همان پیچیدگی عارضی را می‌سازد که قرار بود کم کند. جدول: هر حرف، مسئله‌ای که حل می‌کند، و علامت اینکه داری زیاده‌روی می‌کنی.
دیاگرام: **جدول پنج‌سطری**، نه فلوچارت.
مثال Go: یک struct که هر پنج اصل را می‌شکند، برای اینکه مدخل‌های بعدی رویش کار کنند.

**`single-responsibility`** — اصل مسئولیت واحد / Single Responsibility Principle · tags: `principle` `structure` · related: `solid`، `cohesion`، `separation-of-concerns`
بدنه: هر ماژول باید فقط به یک دلیل عوض شود. مثال بد: `Report` که هم محاسبه می‌کند هم PDF می‌سازد — تغییر قالب PDF و تغییر فرمول، دو دلیل مستقل‌اند. مکانیزم: تعریف درست «مسئولیت» بر اساس *کسی که تغییر را می‌خواهد* است، نه بر اساس فعل‌های داخل کد. دام رایج و مهم: خواندن اصل به‌عنوان «هر کلاس یک متد»، که به انفجار کلاس‌های بی‌معنا می‌رسد.
دیاگرام: یک ماژول با دو پیکان ورودی از دو نقش سازمانی متفاوت.
مثال Go: جدا کردن محاسبه از قالب‌بندی.

**`open-closed`** — اصل باز/بسته / Open–Closed Principle · tags: `principle` `structure` · related: `solid`، `interface`، `component`
بدنه: باز برای گسترش، بسته برای تغییر — رفتار تازه با افزودن کد بیاید نه با ویرایش کد موجود. مثال بد: `switch` روی نوع پرداخت که با هر درگاه تازه ویرایش می‌شود. مکانیزم: نقطهٔ گسترش باید *قبلاً* پیش‌بینی شده باشد؛ باز/بسته پیشگویی نیست، تشخیص محور تغییر است. جدول: کجا ارزش دارد و کجا فقط انتزاع بی‌مصرف می‌سازد. دام: باز کردن هر نقطه به احتمال تغییر، که همان پیچیدگی عارضی است.
دیاگرام: `switch` که رشد می‌کند در برابر مجموعه‌ای از پیاده‌سازی‌ها که کنار هم اضافه می‌شوند.
مثال Go: interface `PaymentGateway` و ثبت پیاده‌سازی تازه.

**`liskov-substitution`** — اصل جایگزینی لیسکوف / Liskov Substitution Principle · tags: `principle` `structure` · related: `solid`، `interface`، `leaky-abstraction`
بدنه: هر پیاده‌سازی باید بتواند جای قرارداد بنشیند بی‌آنکه مصرف‌کننده غافلگیر شود. مثال بد: پیاده‌سازی مخزن که برای کلید ناموجود `nil, nil` می‌دهد در حالی که بقیه خطا می‌دهند. مکانیزم در Go: چون ارث‌بری نیست، لیسکوف به **رفتار** پیاده‌سازی‌های یک interface ترجمه می‌شود — خطاها، حالت صفر، و اثرات جانبی همه بخشی از قراردادند حتی وقتی در امضا نیستند. دام: فرض اینکه چون امضا یکی است، قرارداد هم یکی است.
دیاگرام: سه پیاده‌سازی یک interface با ستون «در حالت خالی چه می‌دهد» که یکی‌شان فرق دارد.
مثال Go: دو پیاده‌سازی با رفتار متفاوت در حالت not-found.

**`interface-segregation`** — اصل جداسازی اینترفیس / Interface Segregation Principle · tags: `principle` `dependency` · related: `solid`، `interface`، `coupling`
بدنه: هیچ مصرف‌کننده‌ای نباید مجبور باشد به متدهایی وابسته شود که به کارش نمی‌آیند. مثال بد: interface دوازده‌متدی `Storage` که هر مصرف‌کننده دو تایش را می‌خواهد و برای تست باید ده تای دیگر را هم بسازد. مکانیزم Go: interface کوچک در محل مصرف، همان چیزی که مدخل اینترفیس گفت — `io.Reader` نمونهٔ کامل. جدول: هزینهٔ interface بزرگ در تست و در تغییر.
دیاگرام: یک interface بزرگ با سه مصرف‌کننده و خط‌های استفادهٔ واقعی، بعد همان بعد از شکستن.
مثال Go: `Storage` دوازده‌متدی و همان با سه interface یک‌متدی.

### مرحلهٔ نقشه

```json
{
  "id": "solid",
  "fa": {
    "title": "اصول SOLID",
    "why": "پنج پیش‌فرض پرتکرار — و اینکه هرکدام کجا کمک می‌کند و کجا زیاده‌روی است"
  },
  "en": {
    "title": "The SOLID principles",
    "why": "Five common defaults — and where each helps rather than overshoots"
  },
  "entries": [
    "solid",
    "single-responsibility",
    "open-closed",
    "liskov-substitution",
    "interface-segregation"
  ]
}
```

- [ ] **Step 1: پنج مدخل را در `principles.json` بنویس (جایگزین `[]`)**
- [ ] **Step 2: `node --test` → باید قرمز شود**
- [ ] **Step 3: مرحلهٔ `solid` را اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 6: کامیت**

```bash
git add data/architecture
git commit -m "feat: add the SOLID principles

Four entries plus an umbrella; D is not among them because it is the
same idea as dependency inversion and already has an entry. Each one
carries the sign that you are overapplying it, since SOLID applied
without that brake is a reliable source of the accidental complexity
it was meant to remove."
```

---

## Task 6: مرحلهٔ ۵ — سیم‌کشی (۳ مدخل)

**Files:**
- Modify: `data/architecture/entries/principles.json` (سه مدخل، جمع ۸ — این دسته کامل می‌شود)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `dependency-inversion`، `interface`، `interface-segregation`، `component`
- Produces: `dependency-injection`، `composition-root`، `testability`

### مدخل‌ها

**`dependency-injection`** — تزریق وابستگی / Dependency Injection · tags: `principle` `dependency` · related: `dependency-inversion`، `composition-root`، `testability`، `interface`
بدنه: به‌جای اینکه یک جزء وابستگی‌اش را خودش بسازد، از بیرون می‌گیردش. مثال بد: `NewOrderService()` که داخلش به پایگاه داده وصل می‌شود — قابل تست نیست چون هیچ راهی برای جایگزینی نمانده. مکانیزم: سه شکل تزریق — سازنده، متد، و setter — با جدولی که می‌گوید کدام کِی. **تزریق وابستگی با وارونگی وابستگی یکی نیست** و این را صریح رفع کن: وارونگی دربارهٔ جهت فلش است، تزریق دربارهٔ اینکه چه کسی نمونه را می‌سازد؛ می‌شود تزریق داشت بدون وارونگی. دام: framework تزریق را با خود مفهوم یکی گرفتن.
دیاگرام: **جدول سه‌شکلی** تزریق با ستون «کِی مناسب است».
مثال Go: `NewOrderService(repo OrderRepo)` در برابر نسخه‌ای که خودش می‌سازد.

**`composition-root`** — ریشهٔ ترکیب / Composition Root · tags: `principle` `dependency` `structure` · related: `dependency-injection`، `dependency-direction`، `component`
بدنه: تنها یک جای برنامه باید بداند کدام پیاده‌سازی واقعی به کدام قرارداد وصل می‌شود، و آن جا نزدیک‌ترین نقطه به `main` است. مثال بد: `sql.Open` پخش در پنج پکیج. مکانیزم: هرچه ریشهٔ ترکیب بالاتر باشد، بقیهٔ کد کمتر دربارهٔ دنیای واقعی می‌داند. جدول: چه چیزهایی حق دارند در ریشه باشند و چه چیزهایی نه. دام: ریشهٔ ترکیب که کم‌کم منطق کسب‌وکار هم می‌گیرد.
دیاگرام: هرم وارونه — `main` بالا، همه‌چیز زیرش بی‌خبر از پیاده‌سازی.
مثال Go: `main.go` که همهٔ سیم‌کشی را انجام می‌دهد.

**`testability`** — آزمون‌پذیری / Testability · tags: `testing` `principle` `dependency` · related: `dependency-injection`، `interface`، `boundary`، `coupling`
بدنه: آزمون‌پذیری خاصیت کد است نه خاصیت تست — اینکه بشود یک جزء را در حالت دلخواه قرار داد و نتیجه‌اش را دید. مثال بد: تابعی که `time.Now()` را داخل خودش صدا می‌زند و هیچ‌وقت نمی‌شود رفتار نیمه‌شبش را آزمود. مکانیزم: سه چیزی که همیشه باید بتوانی از بیرون بدهی — زمان، تصادف، و ورودی/خروجی. **این توضیح می‌دهد که تزریق وابستگی اصلاً برای چه بود**؛ بدون این مدخل، تزریق فقط تشریفات به نظر می‌رسد. دام: تست‌های شکننده‌ای که به‌جای رفتار، سیم‌کشی را می‌آزمایند.
دیاگرام: **جدول سه‌سطری** — زمان، تصادف، I/O — با «نشانهٔ اینکه سفت‌شده» و «راه بیرون‌دادنش».
مثال Go: تابعی با `time.Now()` داخلش، و همان با `clock func() time.Time`.

### مرحلهٔ نقشه

```json
{
  "id": "wiring",
  "fa": {
    "title": "سیم‌کشی",
    "why": "قرارداد را نوشتی؛ حالا چه کسی تصمیم می‌گیرد کدام پیاده‌سازی وصل شود"
  },
  "en": {
    "title": "Wiring it up",
    "why": "The contract exists; now who decides which implementation gets plugged in"
  },
  "entries": ["dependency-injection", "composition-root", "testability"]
}
```

- [ ] **Step 1: سه مدخل را به `principles.json` اضافه کن (جمع ۸)**
- [ ] **Step 2: `node --test` → باید قرمز شود**
- [ ] **Step 3: مرحلهٔ `wiring` را اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر. فاز ۱ اینجا تمام است: ۲۶ مدخل، دو دستهٔ کامل، پنج مرحله.**
- [ ] **Step 6: کامیت**

```bash
git add data/architecture
git commit -m "feat: wire the dependencies up

Injection, the one place that knows the real implementations, and the
reason both exist. Testability comes last on purpose: without it,
injection reads as ceremony, and time, randomness and I/O are the three
things that make a unit untestable when they are reached for from the
inside."
```

---

## Task 7: مرحلهٔ ۶ — اولین سبک (۳ مدخل)

اولین سبک معماری. دو دستهٔ تازه اینجا باز می‌شوند، چون اولین مدخل‌هایشان همین‌جا نوشته می‌شوند.

**Files:**
- Modify: `data/architecture/categories.json` (افزودن `styles` و `domain`)
- Create: `data/architecture/entries/styles.json`
- Create: `data/architecture/entries/domain.json`
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `layer`، `boundary`، `separation-of-concerns`، `dependency-direction`، `dependency-injection`
- Produces: `layered-architecture`، `use-case`، `business-rule`

### `categories.json` بعد از این تسک

```json
[
  { "id": "foundations", "file": "foundations.json", "fa": "مبانی",         "en": "Fundamentals" },
  { "id": "principles",  "file": "principles.json",  "fa": "اصول و تزریق",  "en": "Principles & Injection" },
  { "id": "styles",      "file": "styles.json",      "fa": "سبک‌های معماری", "en": "Architectural Styles" },
  { "id": "domain",      "file": "domain.json",      "fa": "دامنه و DDD",   "en": "Domain & DDD" }
]
```

### مدخل‌ها

**`layered-architecture`** — معماری لایه‌ای / Layered Architecture · دستهٔ `styles` · tags: `style` `structure` `boundary` · related: `layer`، `boundary`، `separation-of-concerns`، `dependency-direction`
بدنه: قدیمی‌ترین و پرکاربردترین سبک: نمایش، کاربرد، دامنه، زیرساخت — با ارتباط یک‌طرفه از بالا به پایین. **چهار لایه اینجا توضیح داده می‌شوند و مدخل جدا ندارند.** مثال بد و مهم — همان اشتباهی که درس‌نامه رویش تأکید دارد: لایهٔ دامنه‌ای که `database/sql` را import می‌کند، یعنی لایه‌بندی روی کاغذ هست و در وابستگی نیست. مکانیزم: مشکل مدل ساده، اینکه زیرساخت پایین‌ترین لایه است و همه به آن وابسته‌اند — که مقدمهٔ مستقیم مرحلهٔ بعد است. جدول: مزیت و محدودیت.
دیاگرام: چهار نوار با فلش‌های وابستگی، و همان با فلش زیرساخت که برعکس شده.
مثال Go: ساختار پوشهٔ چهارلایه با import ممنوع.

**`use-case`** — مورد کاربرد / Use Case · دستهٔ `styles` · tags: `style` `domain` `structure` · related: `layered-architecture`، `single-responsibility`، `dependency-injection`
بدنه: یک مورد کاربرد یک کار کامل از دید کاربر است — «ثبت سفارش»، نه «ذخیره در جدول». مثال بد: لایهٔ کاربرد که فقط متدهای مخزن را جلو می‌فرستد و هیچ تصمیمی نمی‌گیرد. مکانیزم: هر مورد کاربرد یک ورودی، یک خروجی، و یک دنبالهٔ تصمیم دارد؛ همین است که بعداً واحد سازمان‌دهی معماری تمیز و برش عمودی می‌شود. دام: مورد کاربرد را با endpoint یکی گرفتن — یک مورد کاربرد می‌تواند از HTTP و از صف هر دو صدا شود.
دیاگرام: یک مورد کاربرد با سه ورودی متفاوت (HTTP، صف، CLI) که به یک هسته می‌رسند.
مثال Go: `type PlaceOrder struct` با متد `Execute`.

**`business-rule`** — قاعدهٔ کسب‌وکار / Business Rule · دستهٔ `domain` · tags: `domain` `structure` · related: `use-case`، `separation-of-concerns`، `layered-architecture`
بدنه: قاعده‌ای که اگر نرم‌افزار هم نبود باز درست بود — «سفارش زیر صد هزار تومان رایگان ارسال نمی‌شود». مثال بد: همان قاعده که داخل یک `if` در هندلر HTTP زندگی می‌کند و در سه جای دیگر کپی شده. مکانیزم: تست تشخیص — اگر فردا رابط کاربری عوض شود، این قاعده هم عوض می‌شود؟ اگر نه، قاعدهٔ کسب‌وکار است و جایش دامنه است. جدول: قاعدهٔ کسب‌وکار در برابر قاعدهٔ اعتبارسنجی ورودی در برابر قاعدهٔ نمایش. دام: اعتبارسنجی فرم را قاعدهٔ کسب‌وکار شمردن.
دیاگرام: **جدول سه‌ستونی** با نمونه‌های واقعی از هر نوع و اینکه هرکدام کجا زندگی می‌کند.
مثال Go: قاعده به‌عنوان متد روی نوع دامنه، نه به‌عنوان `if` در هندلر.

### مرحلهٔ نقشه

```json
{
  "id": "first-style",
  "fa": {
    "title": "اولین سبک",
    "why": "لایه‌بندی، و دو چیزی که بدون آن‌ها هیچ سبکی توضیح‌دادنی نیست"
  },
  "en": {
    "title": "The first style",
    "why": "Layering, and the two things without which no style can be explained"
  },
  "entries": ["layered-architecture", "use-case", "business-rule"]
}
```

- [ ] **Step 1: دو دسته را به `categories.json` اضافه کن و دو فایل مدخل را بساز**
- [ ] **Step 2: سه مدخل را بنویس**
- [ ] **Step 3: `node --test` → باید قرمز شود**
- [ ] **Step 4: مرحلهٔ `first-style` را اضافه کن؛ `node --test` → سبز**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر. فهرست باید حالا چهار دستهٔ معماری را نشان دهد.**
- [ ] **Step 6: کامیت**

```bash
git add data/architecture
git commit -m "feat: add layered architecture

The oldest style, plus the two ideas every later style is built on: a
use case is a whole job seen from outside, and a business rule is one
that would still hold with no software involved. The layered entry
carries its four layers rather than splitting them into entries that
would only ever be read together."
```

---

## Task 8: مرحلهٔ ۷ — سبک‌های مرزمحور (۶ مدخل)

**Files:**
- Modify: `data/architecture/entries/styles.json` (شش مدخل، جمع ۸)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `layered-architecture`، `use-case`، `dependency-inversion`، `interface`، `boundary`، `dependency-direction`، `composition-root`
- Produces: `port`، `adapter`، `hexagonal-architecture`، `dependency-rule`، `clean-architecture`، `onion-architecture`

### مدخل‌ها

**`port`** — پورت / Port · tags: `style` `boundary` `dependency` · related: `interface`، `dependency-inversion`، `boundary`، `use-case`
بدنه: پورت قراردادی است که هسته تعریف می‌کند تا با بیرون حرف بزند — و چون هسته تعریفش می‌کند، وابستگی به داخل می‌آید نه بیرون. **دو نوع پورت اینجا توضیح داده می‌شوند و مدخل جدا ندارند:** پورت ورودی همان کاری است که هسته بلد است انجام دهد، پورت خروجی همان چیزی که هسته از دنیا می‌خواهد. مثال بد: «پورت» ی که امضایش `Save(*gorm.DB)` است. دام مهم: هر interface پورت نیست — پورت واژگان دامنه دارد نه واژگان ابزار.
دیاگرام: هسته با پورت‌های ورودی سمت چپ و خروجی سمت راست، با جهت وابستگی روی هر کدام.
مثال Go: `type OrderPlacer interface` و `type PaymentGateway interface` کنار هم.

**`adapter`** — آداپتور / Adapter · tags: `style` `boundary` · related: `port`، `interface`، `leaky-abstraction`، `component`
بدنه: آداپتور تنها جایی است که ابزار واقعی را می‌شناسد و آن را به شکل پورت درمی‌آورد. مثال بد: آداپتوری که منطق کسب‌وکار هم دارد. مکانیزم: آداپتور دو کار می‌کند و بس — ترجمهٔ شکل داده، و ترجمهٔ خطا. جدول: آداپتور ورودی (HTTP، صف، CLI) در برابر آداپتور خروجی (SQL، SMTP، API). دام: نشت جزئیات ابزار از راه نوع خطا، که مستقیماً به مدخل انتزاع نشت‌کننده وصل است.
دیاگرام: یک پورت با سه آداپتور مختلف پشتش.
مثال Go: آداپتور SQL که خطای `sql.ErrNoRows` را به خطای دامنه ترجمه می‌کند.

**`hexagonal-architecture`** — معماری شش‌ضلعی / Hexagonal Architecture · tags: `style` `boundary` `structure` · related: `port`، `adapter`، `dependency-inversion`، `layered-architecture`، `use-case`
بدنه: همان سبک پورت و آداپتور: هسته وسط، همهٔ ورودی‌ها و خروجی‌ها بیرون، و هیچ فلشی از داخل به بیرون نمی‌رود. مثال بد که مشکل را می‌سازد: لایه‌بندی که در آن دامنه به زیرساخت وابسته است. مکانیزم: شش‌ضلع هیچ معنای خاصی ندارد — فقط می‌خواست بگوید بیش از دو طرف وجود دارد؛ این را صریح بگو چون خیلی‌ها دنبال معنای شش می‌گردند. دام رایج: ساختن پوشهٔ `ports` و `adapters` بدون برگرداندن هیچ وابستگی‌ای.
دیاگرام: شش‌ضلعی با آداپتورهای اطراف و فلش‌های وابستگی همه رو به داخل.
مثال Go: ساختار پوشهٔ کامل یک سرویس اعلان — `core/`، `ports/`، `adapters/`.

**`dependency-rule`** — قانون وابستگی / Dependency Rule · tags: `style` `dependency` `principle` · related: `dependency-direction`، `hexagonal-architecture`، `layered-architecture`، `boundary`
بدنه: تنها قانون معماری تمیز: کد داخلی‌تر هرگز چیزی از کد بیرونی‌تر نمی‌داند. مثال بد: موجودیت دامنه با تگ `json:"..."` — یعنی دامنه دربارهٔ قالب انتقال می‌داند. مکانیزم: قانون دربارهٔ *نام‌ها* است نه فقط import — اگر نام یک نوع داخلی از یک مفهوم بیرونی آمده، قانون شکسته حتی اگر کامپایلر ساکت باشد. جدول: چه چیزهایی مجازند از مرز رد شوند (نوع ساده، struct دامنه) و چه چیزهایی نه (نوع ORM، `http.Request`).
دیاگرام: **جدول عبور از مرز** — چه چیزی مجاز، چه چیزی ممنوع، با دلیل.
مثال Go: struct دامنه با تگ JSON، و همان با DTO جدا.

**`clean-architecture`** — معماری تمیز / Clean Architecture · tags: `style` `structure` `boundary` · related: `dependency-rule`، `hexagonal-architecture`، `use-case`، `business-rule`، `port`
بدنه: چهار حلقهٔ هم‌مرکز — موجودیت‌ها، موردهای کاربرد، آداپتورهای رابط، چارچوب‌ها و درایورها — با قانون وابستگی روی همه. مثال بد: پروژه‌ای با چهار پوشهٔ درست‌نام ولی import های آزاد. مکانیزم: تفاوت با شش‌ضلعی را صریح بگو، چون سؤال همیشگی است — شش‌ضلعی دربارهٔ مرز بیرونی است و تمیز همان ایده را با تقسیم درونی و ترتیب حلقه‌ها گسترش می‌دهد؛ رقیب نیستند. جدول: چه چیزی در کدام حلقه.
دیاگرام: چهار حلقهٔ هم‌مرکز با فلش‌های رو به داخل و مثال واقعی در هر حلقه.
مثال Go: ساختار پوشهٔ کامل.

**`onion-architecture`** — معماری پیازی / Onion Architecture · tags: `style` `structure` · related: `clean-architecture`، `hexagonal-architecture`، `dependency-rule`، `layered-architecture`
بدنه: نسخهٔ نزدیک به تمیز، با تأکید بیشتر بر اینکه مدل دامنه مرکز است و لایه‌های بیرونی‌تر فقط خدمتش می‌کنند. مکانیزم: تفاوت واقعی‌اش با تمیز و شش‌ضلعی بیشتر تاریخی و اصطلاحی است تا ساختاری — این را صادقانه بگو به‌جای ساختن تفاوت مصنوعی. جدول: سه سبک کنار هم، با ستون «چه چیزی را تأکید می‌کند» و «چه چیزی را نام‌گذاری می‌کند».
دیاگرام: **جدول مقایسهٔ سه‌ستونی** شش‌ضلعی، تمیز، پیازی — نه یک دیاگرام حلقه‌ای دیگر.
مثال Go: همان سرویس با نام‌گذاری پیازی، برای نشان‌دادن اینکه ساختار تقریباً یکی است.

### مرحلهٔ نقشه

```json
{
  "id": "boundaries",
  "fa": {
    "title": "سبک‌های مرزمحور",
    "why": "سه سبکی که همه یک حرف می‌زنند: هسته نباید بیرون را بشناسد"
  },
  "en": {
    "title": "Boundary-driven styles",
    "why": "Three styles making one argument: the core must not know the outside"
  },
  "entries": [
    "port",
    "adapter",
    "hexagonal-architecture",
    "dependency-rule",
    "clean-architecture",
    "onion-architecture"
  ]
}
```

- [ ] **Step 1: شش مدخل را به `styles.json` اضافه کن (جمع ۸)**
- [ ] **Step 2: `node --test` → باید قرمز شود**
- [ ] **Step 3: مرحلهٔ `boundaries` را اضافه کن؛ `node --test` → سبز**
- [ ] **Step 4: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 5: کامیت**

```bash
git add data/architecture
git commit -m "feat: add the boundary-driven styles

Ports and adapters, the dependency rule, clean and onion. The three
styles are presented as one argument rather than three competitors,
and the onion entry says plainly that most of its difference from
clean is historical — inventing a structural distinction there would
be dishonest."
```

---

## Task 9: مرحلهٔ ۸ — دامنه (۱۲ مدخل)

بزرگ‌ترین تسک مرحله‌ای. **ترتیب مدخل‌ها در آرایهٔ `entries` مرحله مهم است:** گارد ترتیب موقعیت را از همین آرایه می‌گیرد، پس هر مدخلی که به مدخل دیگری از همین مرحله ارجاع می‌دهد باید بعد از آن بیاید. ترتیب زیر همین را رعایت می‌کند.

**Files:**
- Modify: `data/architecture/entries/domain.json` (دوازده مدخل، جمع ۱۳)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `business-rule`، `use-case`، `clean-architecture`، `boundary`، `information-hiding`، `interface`، `port`
- Produces: هر دوازده شناسه؛ مرحله‌های ۹ تا ۱۳ به `bounded-context`، `aggregate`، `entity` و `repository` تکیه دارند.

### مدخل‌ها (به همین ترتیب)

**`domain`** — دامنه / Domain · tags: `domain` · related: `business-rule`، `use-case`
بدنه: دامنه همان حوزهٔ مسئله است — کاری که کسب‌وکار انجام می‌دهد، جدا از اینکه نرم‌افزار چطور انجامش می‌دهد. مثال بد: تیمی که «دامنه» را با «جدول‌های پایگاه داده» یکی می‌گیرد. جدول: دامنهٔ اصلی، پشتیبان، عمومی — و اینکه سرمایه‌گذاری کجا ارزش دارد.
دیاگرام: سه دایره با اندازهٔ متفاوت و مثال واقعی در هرکدام.
مثال Go: نام‌های پکیج که از زبان کسب‌وکار آمده‌اند.

**`domain-model`** — مدل دامنه / Domain Model · tags: `domain` `structure` · related: `domain`، `business-rule`، `layered-architecture`
بدنه: مدل دامنه بازنمایی اجرایی دانش کسب‌وکار است — نه نمودار، بلکه کدی که قاعده‌ها داخلش زندگی می‌کنند. مثال بد: مجموعه‌ای struct بی‌رفتار که همهٔ منطق در سرویس‌هاست (که مدخل بعدی‌تر اسمش را می‌گوید). مکانیزم: مدل باید بتواند «نه» بگوید. جدول: مدل دامنه در برابر مدل داده.
دیاگرام: یک struct بی‌رفتار و همان با رفتار، با قاعده‌ها روی هرکدام.
مثال Go: `Order` با متد `AddItem` که قاعده را اجرا می‌کند.

**`entity`** — موجودیت / Entity · tags: `domain` `structure` · related: `domain-model`، `domain`
بدنه: موجودیت چیزی است که هویتش با گذر زمان می‌ماند حتی وقتی همهٔ فیلدهایش عوض شود. مثال بد: مقایسهٔ دو مشتری با برابری فیلدها. مکانیزم: هویت یعنی شناسه، و شناسه یعنی چیزی که کسب‌وکار به آن اشاره می‌کند. جدول: موجودیت در برابر رکورد پایگاه داده.
دیاگرام: **خط زمانی** یک موجودیت که فیلدهایش عوض می‌شوند و شناسه‌اش نمی‌شود.
مثال Go: `type Customer struct { ID CustomerID; ... }` با متد `Equal`.

**`value-object`** — شیء مقداری / Value Object · tags: `domain` `structure` · related: `entity`، `domain-model`
بدنه: شیء مقداری هویت ندارد؛ *همان مقدارش* است. دو مبلغ ۱۰۰۰ تومانی قابل تفکیک نیستند. مثال بد: مبلغ به‌صورت `float64` که واحد پولش جایی نوشته نشده. مکانیزم: تغییرناپذیری، برابری بر اساس مقدار، و اعتبارسنجی در ساخت. جدول: چه چیزی موجودیت است و چه چیزی مقدار — با نمونه‌های مرزی.
دیاگرام: دو ستون با نمونه‌های واقعی و ستون سوم «چرا».
مثال Go: `type Money struct { Amount int64; Currency string }` با سازندهٔ اعتبارسنج.

**`invariant`** — نامتغیر / Invariant · tags: `domain` `principle` · related: `value-object`، `entity`، `business-rule`، `domain-model`
بدنه: نامتغیر گزاره‌ای است که باید همیشه درست باشد، نه فقط موقع ذخیره. مثال بد: بررسی «جمع اقلام نباید از سقف بیشتر شود» در هندلر، که با اضافه‌شدن مسیر دوم دور زده می‌شود. مکانیزم: نامتغیر باید *داخل* چیزی که مالکش است نگهبانی شود، و همین است که مرز تجمیع را تعیین می‌کند. دام: نامتغیر را با اعتبارسنجی ورودی یکی گرفتن.
دیاگرام: یک شیء با نامتغیر روی مرزش و دو مسیر ورودی که هر دو از همان دروازه رد می‌شوند.
مثال Go: متدی که پیش از تغییر حالت، نامتغیر را چک می‌کند.

**`aggregate`** — اگریگیت / Aggregate · tags: `domain` `boundary` `structure` · related: `invariant`، `entity`، `value-object`، `boundary`
بدنه: تجمیع گروهی از موجودیت‌ها و مقادیر است که با هم یک نامتغیر را نگه می‌دارند و از بیرون فقط از یک در دیده می‌شوند. **ریشهٔ تجمیع اینجا توضیح داده می‌شود و مدخل جدا ندارد.** مثال بد: تغییر مستقیم قلم سفارش از بیرون، که نامتغیر جمع کل را دور می‌زند. مکانیزم: مرز تجمیع را نامتغیر تعیین می‌کند نه نمودار جدول‌ها؛ قاعدهٔ عملی «یک تراکنش، یک تجمیع» و اینکه چرا. دام: تجمیع بزرگ که هر تغییر کوچکی را قفل می‌کند.
دیاگرام: یک تجمیع با ریشه و درِ واحد، و یک فلش قرمز که مستقیم به داخل می‌رود.
مثال Go: `Order` با اقلام خصوصی و متد `AddItem`.

**`repository`** — مخزن / Repository · tags: `domain` `boundary` `dependency` · related: `aggregate`، `port`، `interface`، `dependency-inversion`
بدنه: مخزن مجموعه‌ای از تجمیع‌ها را طوری نشان می‌دهد که انگار در حافظه است، و جزئیات ذخیره‌سازی را پنهان می‌کند. مثال بد: مخزنی با متد `Query(sql string)` — همان انتزاع نشت‌کننده. مکانیزم: مخزن به‌ازای *تجمیع* است نه به‌ازای جدول، و همین تفاوتش با DAO است. جدول: مخزن در برابر DAO در برابر ORM.
دیاگرام: **جدول سه‌ستونی** با «واحد کارش چیست» و «چه چیزی را پنهان می‌کند».
مثال Go: `type OrderRepo interface { Get(ctx, OrderID) (*Order, error); Save(ctx, *Order) error }`.

**`anemic-domain-model`** — مدل دامنهٔ کم‌خون / Anemic Domain Model · tags: `domain` `antipattern` `structure` · related: `domain-model`، `aggregate`، `invariant`، `business-rule`
بدنه: ضدالگویی که اکثر پروژه‌های «DDD دار» دقیقاً همان را دارند: struct هایی که فقط فیلد دارند و همهٔ رفتار در لایهٔ سرویس. مثال بد: `OrderService.AddItem(order, item)` که خودش قاعده را چک می‌کند. مکانیزم: چرا بد است — نامتغیر دیگر یک نگهبان ندارد، پس با هر مسیر تازه یک کپی از قاعده لازم می‌شود. نکتهٔ منصفانه: کم‌خونی همیشه اشتباه نیست؛ برای CRUD ساده کاملاً درست است، و مسئله وقتی است که قاعده وجود دارد ولی جایی برای زندگی ندارد. دام: افزودن متد بی‌معنا به struct برای «کم‌خون نبودن».
دیاگرام: **دو ستون** — همان قاعده در سرویس، و همان قاعده در مدل، با شمار جاهایی که باید تکرار شود.
مثال Go: نسخهٔ کم‌خون و نسخهٔ غنی کنار هم.

**`bounded-context`** — بافت محدود / Bounded Context · tags: `domain` `boundary` · related: `domain`، `boundary`، `aggregate`، `module`
بدنه: بافت محدود مرزی است که داخلش یک واژه یک معنی دارد. مثال بد که همیشه کار می‌کند: «مشتری» در فروش، در پشتیبانی، و در حسابداری سه چیز متفاوت است؛ یک مدل مشترک برای هر سه، مدلی است که هیچ‌کدام را درست نمی‌گوید. مکانیزم: بافت محدود مرز *زبان* است و بعد مرز کد؛ ترتیب برعکس نیست. دام: یکی گرفتن بافت محدود با میکروسرویس — یک بافت می‌تواند کاملاً داخل یک مونولیت باشد.
دیاگرام: واژهٔ «مشتری» با سه تعریف متفاوت در سه جعبه.
مثال Go: دو پکیج با دو `Customer` متفاوت و بدون نوع مشترک.

**`anti-corruption-layer`** — لایهٔ ضدفساد / Anti-Corruption Layer · tags: `domain` `boundary` `antipattern` · related: `bounded-context`، `adapter`، `boundary`، `domain-model`
بدنه: وقتی دو بافت باید حرف بزنند، یکی‌شان مدلش را تحمیل می‌کند مگر اینکه لایه‌ای وسط بگذاری که ترجمه کند. مثال بد: import کردن struct های سیستم قدیمی مستقیم داخل دامنهٔ جدید — که ظرف چند ماه مدل جدید را به شکل مدل قدیمی درمی‌آورد. مکانیزم: لایه فقط ترجمه است و هیچ قاعده‌ای ندارد؛ تفاوتش با آداپتور این است که آداپتور از ابزار محافظت می‌کند و این از *مدل*. دام: لایه‌ای که کم‌کم منطق می‌گیرد و خودش تبدیل به بافت سوم می‌شود.
دیاگرام: دو بافت با لایهٔ ترجمه وسط، و همان بدون لایه که مفاهیم نشت کرده‌اند.
مثال Go: تابع ترجمه از `legacy.Customer` به `sales.Customer`.

**`ubiquitous-language`** — زبان مشترک / Ubiquitous Language · tags: `domain` `principle` · related: `bounded-context`، `domain`، `domain-model`
بدنه: همان واژه‌ای که کسب‌وکار به کار می‌برد باید در کد هم همان باشد — بدون لایهٔ ترجمهٔ ذهنی. مثال بد: کسب‌وکار می‌گوید «مرجوعی» و کد `OrderStatus = 7` دارد. مکانیزم: زبان مشترک داخل یک بافت محدود معنی دارد، نه در کل شرکت؛ این را صریح بگو چون منشأ سردرگمی است. **رویدادطوفانی <span dir="ltr">(Event Storming)</span> اینجا به‌عنوان روش کشف زبان توضیح داده می‌شود.** دام: واژه‌نامه‌ای که نوشته می‌شود و کد به‌روزش نمی‌شود.
دیاگرام: **جدول** واژهٔ کسب‌وکار، نام در کد، و ستون «فاصله».
مثال Go: نام‌گذاری نوع و متد از روی زبان کسب‌وکار.

**`domain-driven-design`** — طراحی دامنه‌محور / Domain-Driven Design · tags: `domain` `principle` `structure` · related: `ubiquitous-language`، `bounded-context`، `aggregate`، `domain-model`، `entity`، `value-object`، `repository`
بدنه: مدخل چتر: DDD چه مسئله‌ای را حل می‌کند و دو سطحش. **DDD راهبردی** (بافت محدود، زبان مشترک، نقشهٔ بافت‌ها) و **DDD تاکتیکی** (موجودیت، مقدار، تجمیع، مخزن) — و اینکه شروع از تاکتیکی بدون راهبردی، همان چیزی است که به کم‌خونی می‌رسد. رفع ابهام صریح: **DDD یعنی میکروسرویس نیست**، و رابطه‌اش با تمیز و شش‌ضلعی رابطهٔ «چه چیزی مدل شود» با «کجا بنشیند» است، نه رقابت.
دیاگرام: **جدول دو‌سطحی** راهبردی و تاکتیکی با ابزارهای هرکدام.
مثال Go: ساختار پوشهٔ یک بافت کامل.

### مرحلهٔ نقشه

```json
{
  "id": "domain",
  "fa": {
    "title": "دامنه",
    "why": "کد را از روی کسب‌وکار مدل کن، نه از روی جدول‌ها"
  },
  "en": {
    "title": "The domain",
    "why": "Model the code on the business, not on the tables"
  },
  "entries": [
    "domain",
    "domain-model",
    "entity",
    "value-object",
    "invariant",
    "aggregate",
    "repository",
    "anemic-domain-model",
    "bounded-context",
    "anti-corruption-layer",
    "ubiquitous-language",
    "domain-driven-design"
  ]
}
```

- [ ] **Step 1: دوازده مدخل را به `domain.json` اضافه کن (جمع ۱۳)**
- [ ] **Step 2: `node --test` → باید قرمز شود**
- [ ] **Step 3: مرحلهٔ `domain` را با همین ترتیب اضافه کن؛ `node --test` → سبز**

اگر آزمون به‌جای «در هیچ مرحله‌ای نیستند» با «به … تکیه دارد» قرمز ماند، یعنی ترتیب داخل آرایه با ارجاع‌های متن نمی‌خواند — ترتیب را اصلاح کن، نه متن را.

- [ ] **Step 4: `node serve.js` و `#/self-test` → همه صفر. فاز ۲ اینجا تمام است: ۴۷ مدخل، هشت مرحله.**
- [ ] **Step 5: کامیت**

```bash
git add data/architecture
git commit -m "feat: add the domain modelling entries

Strategic and tactical DDD in twelve entries, with the anti-pattern
named rather than implied: an anemic model is what tactical DDD
without strategic DDD produces, and most projects that believe they
do DDD have one. Bounded context and anti-corruption layer travel
together, since a context boundary with no translation at it does not
hold."
```

---

## Task 10: مرحلهٔ ۹ — اندازهٔ سیستم (۸ مدخل)

دستهٔ `decisions` اینجا باز می‌شود، چون `conways-law` اولین مدخلش است.

**Files:**
- Modify: `data/architecture/categories.json` (افزودن `decisions`)
- Create: `data/architecture/entries/decisions.json`
- Modify: `data/architecture/entries/styles.json` (هفت مدخل، جمع ۱۵)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `bounded-context`، `module`، `boundary`، `coupling`، `layered-architecture`، `hexagonal-architecture`، `domain-driven-design`
- Produces: `monolith`، `big-ball-of-mud`، `modular-monolith`، `microservices`، `conways-law`، `api-gateway`، `backend-for-frontend`، `strangler-fig`

### مدخل‌ها (به همین ترتیب)

**`monolith`** — یکپارچه / Monolith · `styles` · tags: `style` `structure` · related: `layered-architecture`، `module`، `component`
بدنه: مونولیت یعنی همهٔ کد در یک واحد استقرار. مثال بد: تصور اینکه مونولیت یعنی بی‌ساختار. مکانیزم و رفع ابهام اصلی این مدخل: مونولیت دربارهٔ *استقرار* است، نه دربارهٔ ساختار داخلی — مونولیت می‌تواند بهتر از یک مجموعه میکروسرویس ماژولار باشد. جدول: چه چیزهایی با یک واحد استقرار ساده می‌شوند (تراکنش، refactor، تست).
دیاگرام: یک واحد استقرار با ماژول‌های داخلی مرزدار.
مثال Go: یک `main` با چند پکیج دامنه‌ای.

**`big-ball-of-mud`** — گلولهٔ گِل بزرگ / Big Ball of Mud · `styles` · tags: `antipattern` `structure` · related: `monolith`، `coupling`، `cohesion`، `circular-dependency`
بدنه: سیستمی بدون مرز قابل تشخیص، که هر تکه‌اش می‌تواند هر تکهٔ دیگر را صدا بزند. مثال بد: پکیج `common` که همه به آن وابسته‌اند و خودش به همه. مکانیزم: چطور ساخته می‌شود — نه با یک تصمیم بد، بلکه با هزار تصمیم کوچکِ «فعلاً همین‌جا بگذارم». نشانه‌های تشخیص. رفع ابهام: گلولهٔ گِل ضدِ مونولیت نیست؛ میکروسرویسِ گِلی هم فراوان است و فقط شبکه را هم به مشکل اضافه می‌کند.
دیاگرام: **ماتریس وابستگی** پکیج‌ها که تقریباً همهٔ خانه‌هایش پر است.
مثال Go: `common` با پانزده import.

**`modular-monolith`** — مونولیت ماژولار / Modular Monolith · `styles` · tags: `style` `structure` `boundary` · related: `monolith`، `big-ball-of-mud`، `module`، `bounded-context`، `boundary`
بدنه: یک واحد استقرار، ولی با مرزهای داخلی که واقعاً تحمیل می‌شوند. مثال بد: «ماژولار» ی که مرزش فقط قرارداد شفاهی است. مکانیزم: چطور مرز را در Go تحمیل کنی — پکیج داخلی، سطح صادراتی باریک، و عبور از یک نوع مشترک. ارتباط با بافت محدود: هر ماژول معمولاً یک بافت است. جدول: مونولیت ماژولار در برابر میکروسرویس روی محورهای هزینه.
دیاگرام: یک واحد استقرار با ماژول‌های مرزدار و درهای مشخص.
مثال Go: ساختار پوشه با `internal/` که مرز را کامپایلر تحمیل می‌کند.

**`microservices`** — میکروسرویس / Microservices · `styles` · tags: `style` `structure` `decision` · related: `modular-monolith`، `bounded-context`، `boundary`، `monolith`
بدنه: سرویس‌های مستقلاً مستقرشونده، هرکدام با داده و چرخهٔ انتشار خودش. مثال بد: ده سرویس که همه به یک پایگاه دادهٔ مشترک می‌نویسند — که فقط مونولیت است با شبکه وسطش. مکانیزم: چه چیزی واقعاً به دست می‌آید (استقرار مستقل، مقیاس مستقل، مرز تیمی) و چه چیزی حتماً هزینه می‌شود. جدول هزینه: تراکنش، تست سرتاسری، رصدپذیری، نسخه‌بندی قرارداد. دام: انتخاب میکروسرویس برای مسئله‌ای که هنوز مرزهایش کشف نشده.
دیاگرام: **جدول هزینه** — چه چیزی در مونولیت رایگان است و در میکروسرویس چقدر می‌ارزد.
مثال Go: دو سرویس با قرارداد صریح میانشان.

**`conways-law`** — قانون کانوی / Conway's Law · `decisions` · tags: `decision` `boundary` `structure` · related: `microservices`، `modular-monolith`، `bounded-context`، `boundary`
بدنه: سازمان‌ها سیستمی می‌سازند که کپی ساختار ارتباطی خودشان است. مثال: سه تیم که یک کامپایلر می‌سازند، سه‌گذره از آب درمی‌آید. مکانیزم: یعنی انتخاب مرز سرویس در واقع انتخاب مرز تیم است، و اگر این دو نخوانند، مرز طراحی‌شده دوام نمی‌آورد. «مانور معکوس کانوی»: اول تیم را طوری بچین که معماری دلخواهت طبیعی شود. جدول: ساختار تیم و معماری‌ای که از آن بیرون می‌آید.
دیاگرام: **جدول دو‌ستونی** ساختار تیم و شکل سیستمی که تولید می‌کند.
مثال Go: ساختار پوشه‌ای که مالکیت تیمی را آینه کرده.

**`api-gateway`** — دروازهٔ API / API Gateway · `styles` · tags: `style` `communication` `boundary` · related: `microservices`، `boundary`، `adapter`
بدنه: یک نقطهٔ ورود واحد جلوی مجموعه‌ای سرویس، که مسیریابی، احراز هویت، محدودسازی نرخ و تجمیع پاسخ را برمی‌دارد. مثال بد: کلاینت موبایل که مستقیم به هفت سرویس زنگ می‌زند و باید آدرس همه را بداند. مکانیزم: دروازه چه چیزهایی حق دارد بداند و چه چیزهایی نه. دام مهم: دروازه‌ای که منطق کسب‌وکار می‌گیرد و به گلوگاه استقرار تبدیل می‌شود — هر تیمی برای هر تغییر باید از آن رد شود.
دیاگرام: کلاینت‌ها، دروازه، و سرویس‌های پشتش، با فهرست مسئولیت‌های دروازه.
مثال Go: مسیریاب دروازه که فقط جلو می‌فرستد.

**`backend-for-frontend`** — بک‌اند برای فرانت‌اند / Backend for Frontend · `styles` · tags: `style` `communication` · related: `api-gateway`، `microservices`، `boundary`
بدنه: به‌جای یک دروازهٔ همه‌کاره، یک بک‌اند اختصاصی برای هر نوع کلاینت. مثال بد: یک API مشترک که هم موبایل و هم وب از آن استفاده می‌کنند و هر تغییرِ یکی، دیگری را می‌شکند. مکانیزم: مالکیت هر BFF با تیم همان کلاینت است — که مستقیماً کاربرد قانون کانوی است. جدول: دروازهٔ واحد در برابر BFF روی محور تعداد کلاینت و سرعت تغییر. دام: BFF به‌ازای هر صفحه، که انفجار سرویس می‌سازد.
دیاگرام: یک دروازهٔ مشترک در برابر دو BFF، با فلش مالکیت تیمی.
مثال Go: دو سرویس BFF که هستهٔ مشترک را صدا می‌زنند.

**`strangler-fig`** — الگوی انجیر خفه‌کن / Strangler Fig Pattern · `styles` · tags: `style` `decision` `boundary` · related: `monolith`، `microservices`، `modular-monolith`، `anti-corruption-layer`، `api-gateway`
بدنه: تنها راه واقعی مهاجرت از سیستم قدیمی: سیستم تازه دور قدیمی می‌روید و کارکردها را یکی‌یکی می‌گیرد تا قدیمی خالی شود. مثال بد: بازنویسی کامل، که تقریباً همیشه شکست می‌خورد چون سیستم قدیمی در همان مدت متوقف نمی‌شود. مکانیزم: نقطهٔ رهگیری (اغلب دروازه)، ترتیب انتخاب کارکردها، و اینکه لایهٔ ضدفساد اینجا اجباری است. جدول: کدام کارکرد را اول ببر — کم‌ریسک، پرارزش، یا کم‌وابسته.
دیاگرام: **خط زمانی سه‌مرحله‌ای** — قدیمی کامل، دوره‌ای که هر دو زنده‌اند، قدیمی خالی.
مثال Go: مسیریابی شرطی در دروازه بر اساس مسیر.

### مرحلهٔ نقشه

```json
{
  "id": "size",
  "fa": {
    "title": "اندازهٔ سیستم",
    "why": "یک واحد استقرار یا چند تا — و اینکه هزینهٔ واقعی این انتخاب کجاست"
  },
  "en": {
    "title": "The size of the system",
    "why": "One deployable or many — and where that choice actually costs"
  },
  "entries": [
    "monolith",
    "big-ball-of-mud",
    "modular-monolith",
    "microservices",
    "conways-law",
    "api-gateway",
    "backend-for-frontend",
    "strangler-fig"
  ]
}
```

- [ ] **Step 1: دستهٔ `decisions` را به `categories.json` اضافه کن و `decisions.json` را بساز**
- [ ] **Step 2: هشت مدخل را بنویس — هفت تا در `styles.json`، `conways-law` در `decisions.json`**
- [ ] **Step 3: `node --test` → باید قرمز شود**
- [ ] **Step 4: مرحلهٔ `size` را اضافه کن؛ `node --test` → سبز**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر. فهرست باید شش دستهٔ معماری داشته باشد.**
- [ ] **Step 6: کامیت**

```bash
git add data/architecture
git commit -m "feat: size the system

Monolith through microservices, with the cost table the choice
actually turns on. Conway's law sits in this stage rather than with
the other decision entries because it is what decides whether a
service boundary survives, and strangler fig is here because the
migration question follows the split question immediately."
```

---

## Task 11: مرحلهٔ ۱۰ — حرف زدن سرویس‌ها (۱۰ مدخل)

دستهٔ `communication` اینجا باز می‌شود.

**Files:**
- Modify: `data/architecture/categories.json` (افزودن `communication`)
- Create: `data/architecture/entries/communication.json`
- Modify: `data/architecture/entries/domain.json` (`domain-event`، جمع ۱۴ — این دسته کامل می‌شود)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `microservices`، `boundary`، `coupling`، `port`، `adapter`، `aggregate`، `use-case`
- Produces: `synchronous-communication`، `asynchronous-communication`، `rest`، `grpc`، `command`، `event`، `domain-event`، `message-broker`، `queue`، `pub-sub`

### مدخل‌ها (به همین ترتیب)

**`synchronous-communication`** — ارتباط همزمان / Synchronous Communication · tags: `communication` · related: `microservices`، `coupling`، `boundary`
بدنه: فرستنده منتظر پاسخ می‌ماند و تا آن نیاید کاری نمی‌کند. مثال بد: زنجیرهٔ چهار سرویس همزمان که در دسترس‌بودنشان ضرب می‌شود. مکانیزم: جفت‌شدگی زمانی — هر دو طرف باید *هم‌زمان* زنده باشند، و این گران‌ترین نوع جفت‌شدگی است. جدول: کِی همزمان درست است (نیاز به پاسخ فوری، تصمیم وابسته به نتیجه).
دیاگرام: **خط زمانی** دو سرویس، با بازهٔ انتظار پررنگ.
مثال Go: فراخوانی HTTP با `context` و مهلت.

**`asynchronous-communication`** — ارتباط غیرهمزمان / Asynchronous Communication · tags: `communication` `async` · related: `synchronous-communication`، `coupling`، `microservices`
بدنه: فرستنده پیام را می‌گذارد و می‌رود؛ گیرنده هر وقت توانست برمی‌دارد. مثال بد: استفاده از غیرهمزمان جایی که کاربر پشت صفحه منتظر جواب است. مکانیزم: جفت‌شدگی زمانی برداشته می‌شود ولی سه چیز تازه اضافه می‌شود — تأخیر نامعلوم، تکرار، و بی‌ترتیبی؛ که مرحله‌های بعد دربارهٔ همین‌هاست. جدول: همزمان در برابر غیرهمزمان روی پنج محور.
دیاگرام: همان خط زمانی، این بار بدون بازهٔ انتظار.
مثال Go: انتشار روی صف و بازگشت فوری.

**`rest`** — REST · tags: `communication` · related: `synchronous-communication`، `interface`، `adapter`
بدنه: سبک ارتباط منبع‌محور روی HTTP. مثال بد: `POST /doAction?type=17`. مکانیزم: منبع، فعل، کد وضعیت — و اینکه چرا این قرارداد مشترک ارزش دارد حتی وقتی کامل رعایت نمی‌شود. جدول: کد وضعیت‌های پرکاربرد و معنایشان در قرارداد. دام: REST را با «JSON روی HTTP» یکی گرفتن.
دیاگرام: **جدول** منبع و فعل و معنی، با نمونهٔ واقعی.
مثال Go: هندلر با کدهای وضعیت درست.

**`grpc`** — gRPC · tags: `communication` · related: `rest`، `synchronous-communication`، `interface`
بدنه: فراخوانی رویهٔ دور با قرارداد صریح و کدگذاری دودویی. مثال بد: تعریف قرارداد در ویکی به‌جای فایل proto. مکانیزم: قرارداد به‌عنوان کد، تولید کلاینت، و اینکه سرعتش بیشتر از کدگذاری، از *نبودن حدس* می‌آید. جدول: REST در برابر gRPC روی محورهای واقعی — قرارداد، مرورگر، نسخه‌بندی، خوانایی در دیباگ.
دیاگرام: **جدول مقایسه** دو‌ستونی.
مثال Go: یک `service` در فایل proto و امضای تولیدشده.

**`command`** — فرمان / Command · tags: `communication` · related: `use-case`، `synchronous-communication`، `business-rule`
بدنه: فرمان درخواست انجام کاری است — یک گیرنده دارد، می‌تواند رد شود، و به شکل امری نام‌گذاری می‌شود: `PlaceOrder`. مثال بد: نام‌گذاری فرمان به شکل رویداد، که مسئولیت را مبهم می‌کند. جدول: فرمان در برابر پرسش در برابر رویداد.
دیاگرام: یک فرستنده، یک گیرنده، و پیکان رد‌شدن.
مثال Go: `type PlaceOrder struct` و امضای گیرنده.

**`event`** — رویداد / Event · tags: `communication` `async` · related: `command`، `asynchronous-communication`، `coupling`
بدنه: رویداد گزارش چیزی است که *افتاده* — گذشته، غیرقابل رد، و ممکن است هیچ شنونده‌ای نداشته باشد یا ده تا. نام‌گذاری در زمان گذشته: `OrderPlaced`. **تفاوت سه‌گانهٔ فرمان، رویداد و حالت اینجا توضیح داده می‌شود و `state` مدخل جدا ندارد** (شناسه‌اش هم در کریپتو گرفته است). دام مهم که درس‌نامه رویش تأکید دارد: رویدادی که در واقع فرمان پنهان است — `SendEmailRequested` رویداد نیست.
دیاگرام: **جدول سه‌ستونی** فرمان، رویداد، حالت — با زمان فعل، تعداد گیرنده، و امکان رد.
مثال Go: `type OrderPlaced struct` با زمان و شناسه.

**`domain-event`** — رویداد دامنه / Domain Event · دستهٔ `domain` · tags: `domain` `communication` · related: `event`، `aggregate`، `invariant`، `bounded-context`، `ubiquitous-language`
بدنه: رویدادی که *داخل* یک بافت اتفاق می‌افتد و به زبان دامنه است، در برابر رویداد یکپارچه‌سازی که از مرز بافت بیرون می‌رود. مثال بد: انتشار مستقیم رویداد داخلی روی بروکر، که مدل داخلی را به قرارداد عمومی تبدیل می‌کند و از آن به بعد قابل تغییر نیست. مکانیزم: رویداد دامنه از تجمیع بیرون می‌آید و معمولاً پیش از انتشار به رویداد یکپارچه‌سازی ترجمه می‌شود. جدول: رویداد دامنه در برابر رویداد یکپارچه‌سازی روی مخاطب، پایداری قرارداد، و واژگان.
دیاگرام: تجمیع، رویداد داخلی، ترجمه، رویداد بیرونی — با مرز بافت روی مسیر.
مثال Go: `order.Events()` و تابع ترجمه به رویداد عمومی.

**`message-broker`** — بروکر پیام / Message Broker · tags: `communication` `async` · related: `asynchronous-communication`، `event`، `component`
بدنه: واسطی که پیام را می‌گیرد، نگه می‌دارد، و به گیرنده می‌رساند. مثال بد: تصور اینکه بروکر تحویل را تضمین می‌کند و دیگر لازم نیست به شکست فکر کرد. مکانیزم: سه کاری که بروکر واقعاً می‌کند — جدا کردن زمان، بافر کردن، و توزیع؛ و سه چیزی که *نمی‌کند*. جدول: خانوادهٔ بروکرها و اینکه هرکدام چه مدلی دارند (صف‌محور، لاگ‌محور، سبک).
دیاگرام: تولیدکننده، بروکر، مصرف‌کننده، با فهرست «چه چیزی تضمین است و چه چیزی نیست».
مثال Go: انتشار و اشتراک ساده.

**`queue`** — صف / Queue · tags: `communication` `async` · related: `message-broker`، `asynchronous-communication`
بدنه: هر پیام به *یک* مصرف‌کننده می‌رسد؛ صف کار را میان مصرف‌کننده‌ها پخش می‌کند. مثال بد: استفاده از صف جایی که سه سیستم باید همان خبر را بشنوند. مکانیزم: صف یعنی تقسیم کار، و همین است که مقیاس افقی مصرف را ممکن می‌کند. جدول: طول صف به‌عنوان علامت — رشد پیوسته یعنی مصرف کندتر از تولید است. **این نکته را بدون عبارت «مدخل ‹عنوان›» بنویس:** مدخلی که این مسئله را باز می‌کند هشت قدم بعدتر روی مسیر است و گارد ترتیب هر «مدخل ‹عنوان›» را پیش‌نیاز می‌شمارد، پس ارجاع صریح `node --test` را قرمز نگه می‌دارد. مفهوم را توضیح بده و نامش را نبر.
دیاگرام: یک صف با سه مصرف‌کننده و پیام‌هایی که میانشان پخش می‌شوند.
مثال Go: چند worker روی یک کانال.

**`pub-sub`** — انتشار و اشتراک / Publish–Subscribe · tags: `communication` `async` · related: `queue`، `message-broker`، `event`، `coupling`
بدنه: هر پیام به *همهٔ* مشترک‌ها می‌رسد؛ تولیدکننده نمی‌داند چند نفر گوش می‌دهند. مثال بد: تولیدکننده‌ای که برای هر مصرف‌کنندهٔ تازه باید عوض شود. مکانیزم: این همان جایی است که جفت‌شدگی واقعاً می‌شکند، و بهایش این است که دیگر از روی کد تولیدکننده نمی‌شود فهمید چه اتفاقی می‌افتد. جدول: صف در برابر انتشار/اشتراک روی تعداد گیرنده، افزودن مصرف‌کننده، و ردیابی.
دیاگرام: **جدول مقایسه** به‌علاوهٔ دو نمودار کوچک کنار هم.
مثال Go: یک موضوع با دو مشترک مستقل.

### مرحلهٔ نقشه

```json
{
  "id": "talking",
  "fa": {
    "title": "حرف زدن سرویس‌ها",
    "why": "دو سرویس چطور به هم خبر می‌دهند — و هر انتخاب چه چیزی را جفت می‌کند"
  },
  "en": {
    "title": "Services talking",
    "why": "How two services reach each other — and what each choice couples"
  },
  "entries": [
    "synchronous-communication",
    "asynchronous-communication",
    "rest",
    "grpc",
    "command",
    "event",
    "domain-event",
    "message-broker",
    "queue",
    "pub-sub"
  ]
}
```

- [ ] **Step 1: دستهٔ `communication` را اضافه کن و `communication.json` را بساز**
- [ ] **Step 2: ده مدخل را بنویس — `domain-event` در `domain.json` و بقیه در `communication.json`**
- [ ] **Step 3: `node --test` → باید قرمز شود**
- [ ] **Step 4: مرحلهٔ `talking` را اضافه کن؛ `node --test` → سبز**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر. فاز ۳ اینجا تمام است: ۶۵ مدخل، ده مرحله.**
- [ ] **Step 6: کامیت**

```bash
git add data/architecture
git commit -m "feat: let the services talk

Sync and async, REST and gRPC, command and event, queue and pub/sub.
The domain-event entry sits in this stage rather than with the DDD
entries because all of its value is in the contrast with an
integration event, and publishing an internal event straight onto a
broker is how a private model becomes a public contract nobody can
change."
```

---

## Task 12: مرحلهٔ ۱۱ — شکست توزیع‌شده (۱۲ مدخل)

دستهٔ `distributed` اینجا باز می‌شود. اولین پل دوطرفه به موضوع کریپتو هم اینجاست.

**Files:**
- Modify: `data/architecture/categories.json` (افزودن `distributed`)
- Create: `data/architecture/entries/distributed.json`
- Modify: `data/architecture/entries/communication.json` (`at-least-once-delivery`، `dead-letter-queue` — جمع ۱۱)
- Modify: `data/crypto/entries/consensus.json` (**فقط فیلد `related`** روی `nonce`، `block`، `fork`)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `asynchronous-communication`، `queue`، `message-broker`، `microservices`، `synchronous-communication`، `event`
- Produces: `distributed-system`، `timeout`، `retry`، `transient-failure`، `exponential-backoff`، `circuit-breaker`، `backpressure`، `idempotency`، `idempotency-key`، `at-least-once-delivery`، `dead-letter-queue`، `ordering`

### مدخل‌ها (به همین ترتیب)

**`distributed-system`** — سیستم توزیع‌شده / Distributed System · tags: `failure` `structure` · related: `microservices`، `synchronous-communication`، `boundary`
بدنه: سیستمی که اجزایش روی ماشین‌های جدا اجرا می‌شوند و فقط از راه شبکه به هم می‌رسند. مثال بد: نوشتن کد فراخوانی دور با همان فرض‌های فراخوانی محلی. مکانیزم: تفاوت بنیادی — در فراخوانی محلی فقط دو نتیجه هست، موفق یا خطا؛ در فراخوانی دور سه تاست، و نتیجهٔ سوم «نمی‌دانم» است. جدول: هشت فرض غلط رایج دربارهٔ شبکه.
دیاگرام: **جدول سه‌حالته** — موفق، شکست، نامعلوم — با «چه کاری می‌شود کرد» زیر هرکدام.
مثال Go: فراخوانی که با مهلت تمام می‌شود بی‌آنکه بدانی سمت دیگر انجام شد یا نه.

**`timeout`** — تایم‌اوت / Timeout · tags: `failure` · related: `distributed-system`، `synchronous-communication`
بدنه: سقفی که برای انتظار می‌گذاری، چون بدون آن انتظار بی‌نهایت است. مثال بد: کلاینت HTTP پیش‌فرض بدون مهلت، که یک سرویس کند را به قفل‌شدن کل سیستم تبدیل می‌کند. مکانیزم: مهلت باید در هر لایه کمتر از لایهٔ بالایی باشد وگرنه بی‌معناست؛ بودجهٔ مهلت. دام: مهلت طولانی که فقط شکست را دیرتر می‌کند.
دیاگرام: سه لایهٔ تودرتو با بودجهٔ مهلت کاهنده.
مثال Go: `context.WithTimeout` و انتقالش به فراخوانی بعدی.

**`retry`** — تلاش دوباره / Retry · tags: `failure` · related: `timeout`، `distributed-system`
بدنه: تکرار درخواستی که شکست خورده، به امید اینکه بار دوم بگیرد. مثال بد: تلاش دوبارهٔ فوری و بی‌حد، که سرویس کند را می‌کشد. مکانیزم: تلاش دوباره فقط وقتی معنی دارد که خطا موقت باشد و عملیات تکرارپذیر — دو شرطی که مدخل‌های بعدی می‌سازند. دام: تلاش دوباره روی عملیاتی که پول جابه‌جا می‌کند.
دیاگرام: **خط زمانی** سه تلاش پشت‌سرهم و اثرش روی بار سرویس.
مثال Go: حلقهٔ تلاش با شمارش محدود.

**`transient-failure`** — خطای موقت / Transient Failure · tags: `failure` · related: `retry`، `distributed-system`
بدنه: خطایی که با گذر زمان خودبه‌خود برطرف می‌شود، در برابر خطای دائمی که هرچقدر هم تکرار کنی همان جواب را می‌دهد. مثال بد: تلاش دوبارهٔ ۴۰۰ Bad Request. مکانیزم: تشخیص از روی نوع خطا نه از روی حدس؛ جدول خطاهای رایج و دسته‌شان. **خطای دائمی اینجا توضیح داده می‌شود و مدخل جدا ندارد.**
دیاگرام: **جدول** خطا، دسته، و «تلاش دوباره کن یا نه».
مثال Go: تفکیک خطا با `errors.Is` پیش از تصمیم به تکرار.

**`exponential-backoff`** — عقب‌نشینی نمایی / Exponential Backoff · tags: `failure` · related: `retry`، `transient-failure`
بدنه: فاصلهٔ میان تلاش‌ها را نمایی زیاد کن تا سرویسِ در حال بازیابی فرصت نفس بگیرد. مثال بد: صد کلاینت که همه دقیقاً پس از یک ثانیه دوباره می‌زنند و موج هماهنگ می‌سازند. مکانیزم: چرا **جیتر** لازم است — بدون تصادفی‌سازی، عقب‌نشینی فقط موج را جابه‌جا می‌کند نه پخش. جدول: فاصله‌ها در پنج تلاش با و بدون جیتر.
دیاگرام: **خط زمانی** موج هماهنگ در برابر توزیع‌شده.
مثال Go: محاسبهٔ فاصله با جیتر.

**`circuit-breaker`** — کلید قطع‌کن / Circuit Breaker · tags: `failure` `communication` · related: `retry`، `timeout`، `exponential-backoff`، `distributed-system`
بدنه: وقتی سرویسی مدام شکست می‌خورد، به‌جای تلاش دوباره، مدتی اصلاً نزن. مثال بد که مسئله را می‌سازد: مهلت و تلاش دوباره بدون قطع‌کن — سرویس کند می‌شود، همه تکرار می‌کنند، بار چند برابر می‌شود و کاملاً می‌میرد؛ **شکست آبشاری** دقیقاً همین است. مکانیزم: سه حالت بسته، باز، نیمه‌باز و شرط عبور میانشان. دام: قطع‌کن مشترک برای چند مقصد، که خرابی یکی بقیه را هم قطع می‌کند.
دیاگرام: **نمودار حالت** سه‌حالته با شرط هر گذار.
مثال Go: نوع قطع‌کن با سه حالت و شمارندهٔ شکست.

**`backpressure`** — فشار برگشتی / Backpressure · tags: `failure` `async` · related: `queue`، `circuit-breaker`، `asynchronous-communication`
بدنه: وقتی مصرف‌کننده کندتر از تولیدکننده است، سیستم باید بتواند «آهسته‌تر» بگوید. مثال بد: صفی که رشد می‌کند و همه فکر می‌کنند مشکل حل شده — صف فروپاشی را عقب می‌اندازد، حذفش نمی‌کند. مکانیزم: سه پاسخ ممکن — کند کردن تولید، دور ریختن، یا سرریز به جای دیگر — و اینکه هر کدام چه چیزی را قربانی می‌کند. جدول: علامت‌های هشدار (طول صف، سن قدیمی‌ترین پیام، نرخ مصرف).
دیاگرام: لوله با تنگنا، و سه پاسخ ممکن.
مثال Go: کانال بافردار با `select` و شاخهٔ `default`.

**`idempotency`** — ایدمپوتنسی / Idempotency · tags: `failure` `consistency` · related: `retry`، `distributed-system`، `command`، `nonce`
بدنه: عملیاتی که اجرای دوباره‌اش همان نتیجهٔ اجرای اول را می‌دهد. مثال بد: `balance += 100` که دو بار اجرا شود. مکانیزم: چرا در سیستم توزیع‌شده اجباری است — حالت «نمی‌دانم» یعنی فرستنده مجبور است تکرار کند، پس گیرنده باید تحمل تکرار داشته باشد. **مصرف‌کنندهٔ ایدمپوتنت اینجا توضیح داده می‌شود و مدخل جدا ندارد.** پل به کریپتو: مدخل نانس همین نقش را در تراکنش‌های اتریوم بازی می‌کند.
دیاگرام: **خط زمانی** یک درخواست که دو بار می‌رسد، با و بدون ایدمپوتنسی.
مثال Go: درج با کلید یکتا و `ON CONFLICT DO NOTHING`.

**`idempotency-key`** — کلید ایدمپوتنسی / Idempotency Key · tags: `failure` `consistency` · related: `idempotency`، `command`، `distributed-system`
بدنه: شناسه‌ای که فرستنده تولید می‌کند تا گیرنده بتواند تکرار را از درخواست تازه تشخیص دهد. مثال بد: تولید کلید در سمت گیرنده، که هیچ کمکی نمی‌کند. مکانیزم: کلید کجا ساخته شود، چقدر نگه داشته شود، و اینکه پاسخ ذخیره‌شده باید برگردد نه فقط «تکراری بود». جدول: عمر کلید در برابر ریسک.
دیاگرام: جدول رهگیری کلید با سه ردیف در سه لحظه.
مثال Go: هدر `Idempotency-Key` و جدول کلید-پاسخ.

**`at-least-once-delivery`** — تحویل حداقل یک‌بار / At-Least-Once Delivery · دستهٔ `communication` · tags: `communication` `async` `failure` · related: `idempotency`، `message-broker`، `queue`
بدنه: بروکر تضمین می‌کند پیام دست‌کم یک بار می‌رسد — یعنی ممکن است بیشتر برسد. **حداکثر یک‌بار و دقیقاً یک‌بار اینجا توضیح داده می‌شوند و مدخل جدا ندارند.** مثال بد: طراحی مصرف‌کننده با فرض «دقیقاً یک‌بار». مکانیزم: چرا «دقیقاً یک‌بار» در عمل یعنی «حداقل یک‌بار به‌علاوهٔ مصرف‌کنندهٔ ایدمپوتنت» و نه یک تضمین شبکه‌ای. جدول: سه تضمین و چه چیزی را از تو می‌خواهند.
دیاگرام: **جدول سه‌سطری** تضمین‌ها.
مثال Go: مصرف‌کننده‌ای که پیش از پردازش شناسهٔ رویداد را چک می‌کند.

**`dead-letter-queue`** — صف نامه‌های مرده / Dead Letter Queue · دستهٔ `communication` · tags: `communication` `async` `failure` · related: `queue`، `retry`، `at-least-once-delivery`
بدنه: پیامی که بعد از چند تلاش هم پردازش نمی‌شود، به‌جای گیر کردن در صف اصلی، کنار گذاشته می‌شود. مثال بد: پیام سمی که صف را قفل می‌کند و همه‌چیز پشتش می‌ایستد. **پیام سمی اینجا توضیح داده می‌شود و مدخل جدا ندارد.** مکانیزم: صف مرده بدون کسی که نگاهش کند فقط سطل زباله است — پس هشدار روی طولش بخشی از الگوست. جدول: دلایل رایج رسیدن به صف مرده و اینکه هرکدام چه اقدامی می‌خواهد.
دیاگرام: صف اصلی، شمارندهٔ تلاش، و انشعاب به صف مرده.
مثال Go: افزایش شمارنده و انتشار به صف مرده در سقف.

**`ordering`** — ترتیب / Ordering · tags: `failure` `consistency` `async` · related: `asynchronous-communication`، `queue`، `pub-sub`، `distributed-system`، `block`
بدنه: پیام‌ها لزوماً به همان ترتیبی که فرستاده شده‌اند نمی‌رسند. مثال بد: مصرف‌کننده‌ای که فرض می‌کند `OrderPlaced` همیشه پیش از `OrderPaid` می‌رسد. مکانیزم: ترتیب معمولاً فقط داخل یک پارتیشن تضمین می‌شود، و کلید پارتیشن همان چیزی است که تصمیم می‌گیرد چه چیزی نسبت به چه چیزی مرتب بماند. سه راه کنار آمدن: کلید پارتیشن، شمارندهٔ نسخه، یا طراحی جابه‌جایی‌پذیر. پل به کریپتو: مدخل بلاک همین مسئله را با ترتیب سراسری حل می‌کند و بهایش را هم می‌پردازد.
دیاگرام: **خط زمانی** دو رویداد که بی‌ترتیب می‌رسند، و همان با کلید پارتیشن.
مثال Go: انتخاب کلید پارتیشن بر اساس شناسهٔ سفارش.

### پل دوطرفه به کریپتو

در `data/crypto/entries/consensus.json`، **فقط** آرایهٔ `related` این سه مدخل:

| مدخل کریپتو | شناسه‌ای که اضافه می‌شود |
|---|---|
| `nonce` | `idempotency` |
| `block` | `ordering` |
| `fork` | `ordering` |

به بدنه، مثال یا SVG هیچ مدخل کریپتویی دست نزن.

### مرحلهٔ نقشه

```json
{
  "id": "failure",
  "fa": {
    "title": "شکست توزیع‌شده",
    "why": "روی شبکه، «نمی‌دانم» هم یک نتیجه است — و همه‌چیز از همین‌جا می‌آید"
  },
  "en": {
    "title": "Distributed failure",
    "why": "Over a network, \"I don't know\" is a third outcome — and everything follows from it"
  },
  "entries": [
    "distributed-system",
    "timeout",
    "retry",
    "transient-failure",
    "exponential-backoff",
    "circuit-breaker",
    "backpressure",
    "idempotency",
    "idempotency-key",
    "at-least-once-delivery",
    "dead-letter-queue",
    "ordering"
  ]
}
```

- [ ] **Step 1: دستهٔ `distributed` را اضافه کن و `distributed.json` را بساز**
- [ ] **Step 2: دوازده مدخل را بنویس — ده تا در `distributed.json`، دو تا در `communication.json`**
- [ ] **Step 3: `node --test` → باید قرمز شود**
- [ ] **Step 4: مرحلهٔ `failure` را اضافه کن؛ `node --test` → سبز**
- [ ] **Step 5: `related` سه مدخل کریپتو را به‌روز کن؛ `node --test` → همچنان سبز**
- [ ] **Step 6: `node serve.js` → `#/self-test` همه صفر؛ و در موضوع کریپتو، مدخل نانس باید حالا کارت مرتبط به ایدمپوتنسی داشته باشد**
- [ ] **Step 7: کامیت**

```bash
git add data/architecture data/crypto/entries/consensus.json
git commit -m "feat: design for distributed failure

Timeout, retry and backoff without a circuit breaker are how a slow
service becomes a dead one, so the breaker sits with them rather than
in a patterns appendix. Backpressure is here for the same reason: a
queue that keeps growing has postponed the collapse, not prevented it.

The first bridges to the crypto topic — nonce is idempotency, and block
and fork are what a global order costs."
```

---

## Task 13: مرحلهٔ ۱۲ — سازگاری (۱۳ مدخل)

**Files:**
- Modify: `data/architecture/entries/distributed.json` (ده مدخل، جمع ۲۰ — این دسته کامل می‌شود)
- Modify: `data/architecture/entries/communication.json` (سه مدخل، جمع ۱۴)
- Modify: `data/crypto/entries/consensus.json` و `data/crypto/entries/basics.json` (**فقط `related`**)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `distributed-system`، `idempotency`، `ordering`، `event`، `message-broker`، `aggregate`، `microservices`، `command`
- Produces: `consistency`، `strong-consistency`، `eventual-consistency`، `replication`، `partitioning`، `leader-election`، `cap-theorem`، `distributed-transaction`، `two-phase-commit`، `outbox-pattern`، `saga`، `choreography`، `orchestration`

### مدخل‌ها (به همین ترتیب)

**`consistency`** — سازگاری / Consistency · tags: `consistency` · related: `distributed-system`، `ordering`
بدنه: سازگاری یعنی همهٔ خواننده‌ها یک واقعیت را ببینند. مثال بد: کاربری که پس از ثبت سفارش، صفحهٔ سفارش‌هایش را خالی می‌بیند. مکانیزم: سازگاری طیف است نه دو حالت، و انتخاب روی این طیف یک تصمیم *محصولی* است نه فقط فنی. جدول: چه چیزهایی می‌توانند ناسازگار باشند و کاربر متوجه نشود.
دیاگرام: **خط طیف** با چند نقطهٔ نام‌دار.
مثال Go: خواندن بلافاصله پس از نوشتن روی نسخهٔ خوانشی.

**`strong-consistency`** — سازگاری قوی / Strong Consistency · tags: `consistency` · related: `consistency`، `synchronous-communication`
بدنه: هر خواندن آخرین نوشتن را می‌بیند، بدون استثنا. مثال بد: انتظار سازگاری قوی از سیستمی که چند نسخه دارد و بینشان شبکه است. مکانیزم: بهایش هماهنگی است، و هماهنگی یعنی تأخیر و کاهش دسترس‌پذیری. جدول: کجا واقعاً لازم است (موجودی انبار، مانده حساب) و کجا نه.
دیاگرام: **خط زمانی** نوشتن و خواندن با هماهنگی، و بازهٔ انتظار.
مثال Go: تراکنش با قفل.

**`eventual-consistency`** — سازگاری نهایی / Eventual Consistency · tags: `consistency` `async` · related: `strong-consistency`، `consistency`، `asynchronous-communication`، `fork`
بدنه: اگر نوشتن جدیدی نیاید، همهٔ نسخه‌ها بالاخره به هم می‌رسند. مثال بد: نمایش «سفارش ثبت نشد» چون نسخهٔ خوانشی هنوز به‌روز نشده. مکانیزم: «نهایی» چقدر طول می‌کشد و چرا این عدد باید با محصول هماهنگ شود؛ الگوهای پوشاندن پنجرهٔ ناسازگاری در رابط کاربری. پل به کریپتو: مدخل انشعاب دقیقاً همین است — دو نسخه از واقعیت که بعداً یکی می‌شوند.
دیاگرام: **خط زمانی** واگرایی و هم‌گرایی دو نسخه.
مثال Go: نوشتن روی منبع و به‌روزرسانی غیرهمزمان نسخهٔ خوانشی.

**`replication`** — تکثیر / Replication · tags: `consistency` `scaling` · related: `eventual-consistency`، `strong-consistency`، `distributed-system`، `node`
بدنه: نگه‌داشتن چند نسخه از یک داده روی چند ماشین. مثال بد: افزودن نسخهٔ خوانشی بدون فکر به تأخیر تکثیر، که خواندن‌بعد‌از‌نوشتن را می‌شکند. مکانیزم: تکثیر همزمان در برابر غیرهمزمان و اینکه هرکدام چه چیزی را تضمین می‌کند. جدول: تک‌رهبر، چندرهبر، بی‌رهبر. پل به کریپتو: مدخل گره نسخهٔ افراطی تکثیر است — هزاران نسخهٔ کامل.
دیاگرام: **جدول سه‌مدلی** با ستون «تعارض کجا حل می‌شود».
مثال Go: مسیریابی خواندن به نسخه و نوشتن به منبع.

**`partitioning`** — پارتیشن‌بندی / Partitioning · tags: `scaling` `consistency` · related: `replication`، `ordering`، `queue`
بدنه: شکستن داده به تکه‌هایی که هر کدام روی ماشین جداست. **شاردینگ اینجا توضیح داده می‌شود و مدخل جدا ندارد.** مثال بد: کلید پارتیشنی که ترافیک را نامتوازن می‌کند و یک پارتیشن داغ می‌سازد. مکانیزم: کلید پارتیشن هم‌زمان تصمیم می‌گیرد چه چیزی مرتب می‌ماند و چه چیزی با هم خوانده می‌شود — همان چیزی که مدخل ترتیب گفت. جدول: انتخاب کلید و پیامدهایش.
دیاگرام: توزیع کلید روی چهار پارتیشن، متوازن و نامتوازن.
مثال Go: انتخاب پارتیشن با هش کلید.

**`leader-election`** — انتخاب رهبر / Leader Election · tags: `consistency` `failure` · related: `replication`، `distributed-system`، `bft`، `consensus`
بدنه: وقتی چند نسخه هست، یکی باید تصمیم‌گیرنده باشد — و وقتی می‌میرد، بقیه باید بدون هماهنگ‌کنندهٔ بیرونی جانشین انتخاب کنند. **Raft اینجا توضیح داده می‌شود و مدخل جدا ندارد.** مثال بد: دو گره که هر دو خود را رهبر می‌دانند — مغز دوپاره. مکانیزم: اکثریت و اینکه چرا عدد فرد مهم است. پل به کریپتو: مدخل اجماع و مدخل تحمل خطای بیزانسی همین مسئله را حل می‌کنند، با این تفاوت که آنجا فرض می‌شود گره‌ها ممکن است دروغ بگویند، نه فقط بمیرند — و همین تفاوت است که هزینه را بالا می‌برد.
دیاگرام: **نمودار حالت** پیرو، نامزد، رهبر، با شرط گذار.
مثال Go: اجارهٔ رهبری با مهلت و تمدید.

**`cap-theorem`** — قضیهٔ CAP / CAP Theorem · tags: `consistency` `decision` · related: `strong-consistency`، `eventual-consistency`، `replication`، `partitioning`
بدنه: وقتی شبکه بین بخش‌ها قطع می‌شود، باید بین سازگاری و دسترس‌پذیری یکی را انتخاب کنی. مثال بد و شایع: خواندن CAP به‌عنوان «دو تا از سه تا را انتخاب کن» — پارتیشن انتخابی نیست، اتفاق است. مکانیزم: قضیه فقط دربارهٔ *لحظهٔ قطعی* حرف می‌زند، نه دربارهٔ حالت عادی، و همین رایج‌ترین سوءبرداشت است. جدول: سیستم‌های واقعی و اینکه هنگام قطعی چه می‌کنند.
دیاگرام: **درخت تصمیم** — قطعی رخ داد، دو شاخه، پیامد هر شاخه.
مثال Go: رفتار سرویس هنگام از دست رفتن اکثریت.

**`distributed-transaction`** — تراکنش توزیع‌شده / Distributed Transaction · tags: `consistency` `failure` · related: `cap-theorem`، `distributed-system`، `microservices`، `aggregate`
بدنه: کاری که باید روی چند سرویس یا چند پایگاه داده یا همه انجام شود یا هیچ. مثال بد: نوشتن در دو پایگاه داده پشت‌سرهم و امید به اینکه دومی شکست نخورد. مکانیزم: چرا `ACID` از مرز فرایند رد نمی‌شود. جدول: چه چیزی در یک تراکنش رایگان است و بیرونش چقدر می‌ارزد.
دیاگرام: یک کار روی سه سرویس با نقطهٔ شکست وسط.
مثال Go: دو نوشتن پیاپی و پنجرهٔ ناسازگاری بینشان.

**`two-phase-commit`** — تعهد دوفازی / Two-Phase Commit · tags: `consistency` `failure` `antipattern` · related: `distributed-transaction`، `cap-theorem`، `leader-election`
بدنه: پروتکل کلاسیک تراکنش توزیع‌شده: اول همه رأی می‌دهند، بعد هماهنگ‌کننده تعهد یا لغو را اعلام می‌کند. مثال بد: استفاده از آن میان سرویس‌هایی که مالک تیم‌های مختلف‌اند. مکانیزم: مسئلهٔ اصلی — اگر هماهنگ‌کننده بین دو فاز بمیرد، شرکت‌کننده‌ها قفل می‌مانند و کسی نمی‌داند تکلیف چیست؛ **این همان چیزی است که ساگا جایگزینش شده.** جدول: کجا هنوز درست است (تک پایگاه داده، تراکنش XA) و کجا نه.
دیاگرام: **خط زمانی** دو فاز با مرگ هماهنگ‌کننده در وسط.
مثال Go: طرح پیام‌های `prepare` و `commit`.

**`outbox-pattern`** — الگوی صندوق خروجی / Outbox Pattern · دستهٔ `communication` · tags: `communication` `consistency` `async` · related: `distributed-transaction`، `event`، `message-broker`، `at-least-once-delivery`
بدنه: مسئله‌ای که حل می‌کند: می‌خواهی هم در پایگاه داده بنویسی و هم رویداد منتشر کنی، ولی این دو یک تراکنش نیستند — اگر نوشتن بگیرد و انتشار نه، رویداد برای همیشه گم می‌شود. راه‌حل: رویداد را در **همان تراکنش** داخل جدول صندوق خروجی بنویس، و فرایند جدایی آن را به بروکر می‌برد. مکانیزم: چرا این تحویل حداقل یک‌بار می‌دهد و در نتیجه مصرف‌کنندهٔ ایدمپوتنت اجباری است.
دیاگرام: تراکنش که دو نوشتن را در بر می‌گیرد، و انتشارکنندهٔ جدا بیرونش.
مثال Go: `INSERT` سفارش و رویداد در یک تراکنش، به‌علاوهٔ حلقهٔ انتشار.

**`saga`** — الگوی ساگا / Saga Pattern · tags: `consistency` `failure` · related: `distributed-transaction`، `two-phase-commit`، `outbox-pattern`، `command`، `event`
بدنه: به‌جای یک تراکنش بزرگ، دنباله‌ای از تراکنش‌های محلی که هرکدام در صورت شکست، **جبران** می‌شوند. **تراکنش جبرانی اینجا توضیح داده می‌شود و مدخل جدا ندارد.** مثال بد: فرض اینکه جبران یعنی برگرداندن به حالت قبل — پس‌دادن پول همان لغو پرداخت نیست، و ردش در سیستم می‌ماند. مکانیزم: هر گام باید ایدمپوتنت باشد و هر جبران هم. جدول: گام‌های یک ساگای سفارش با جبران هرکدام.
دیاگرام: **خط زمانی** چهار گام با شکست در گام سوم و جبران معکوس.
مثال Go: تعریف گام و جبرانش به‌عنوان جفت.

**`choreography`** — کرئوگرافی / Choreography · دستهٔ `communication` · tags: `communication` `async` · related: `saga`، `event`، `pub-sub`، `coupling`
بدنه: هر سرویس به رویداد دیگری گوش می‌دهد و خودش تصمیم می‌گیرد؛ هیچ هماهنگ‌کنندهٔ مرکزی نیست. مثال بد: جریان هفت‌مرحله‌ای که هیچ‌جا کامل نوشته نشده و فقط از روی لاگ‌ها کشف می‌شود. مکانیزم: جفت‌شدگی کمترین حالت است و بهایش این است که جریان کسب‌وکار در هیچ فایلی پیدا نیست. جدول: علامت‌هایی که می‌گویند دیگر باید به ارکستراسیون رفت.
دیاگرام: پنج سرویس با فلش‌های رویداد و هیچ مرکزی.
مثال Go: مصرف‌کننده‌ای که رویداد می‌گیرد و رویداد بعدی را منتشر می‌کند.

**`orchestration`** — ارکستراسیون / Orchestration · دستهٔ `communication` · tags: `communication` `async` · related: `choreography`، `saga`، `command`، `coupling`
بدنه: یک هماهنگ‌کنندهٔ صریح که گام‌ها را به ترتیب صدا می‌زند و می‌داند جریان کامل چیست. مثال بد: هماهنگ‌کننده‌ای که کم‌کم منطق دامنهٔ همهٔ سرویس‌ها را می‌بلعد. مکانیزم: جریان دیدنی و قابل دیباگ می‌شود و بهایش یک نقطهٔ جفت‌شدگی مرکزی است. جدول: کرئوگرافی در برابر ارکستراسیون روی دیدپذیری، جفت‌شدگی، تعداد گام، و سختی تغییر.
دیاگرام: **جدول مقایسه** دو‌ستونی.
مثال Go: هماهنگ‌کنندهٔ ساگا با گام‌های صریح.

### پل دوطرفه به کریپتو

| فایل | مدخل کریپتو | شناسه‌ای که به `related` اضافه می‌شود |
|---|---|---|
| `consensus.json` | `fork` | `eventual-consistency` |
| `consensus.json` | `node` | `replication` |
| `consensus.json` | `bft` | `leader-election` |
| `consensus.json` | `validator` | `leader-election` |
| `consensus.json` | `consensus` | `eventual-consistency`، `leader-election` |
| `basics.json` | `blockchain` | `replication` |

### مرحلهٔ نقشه

```json
{
  "id": "consistency",
  "fa": {
    "title": "سازگاری",
    "why": "وقتی داده در چند جاست، «درست» یعنی چه — و تراکنش تا کجا می‌رسد"
  },
  "en": {
    "title": "Consistency",
    "why": "When data lives in several places, what \"correct\" means — and how far a transaction reaches"
  },
  "entries": [
    "consistency",
    "strong-consistency",
    "eventual-consistency",
    "replication",
    "partitioning",
    "leader-election",
    "cap-theorem",
    "distributed-transaction",
    "two-phase-commit",
    "outbox-pattern",
    "saga",
    "choreography",
    "orchestration"
  ]
}
```

- [ ] **Step 1: سیزده مدخل را بنویس — ده در `distributed.json`، سه در `communication.json`**
- [ ] **Step 2: `node --test` → باید قرمز شود**
- [ ] **Step 3: مرحلهٔ `consistency` را اضافه کن؛ `node --test` → سبز**
- [ ] **Step 4: `related` شش مدخل کریپتو را به‌روز کن؛ `node --test` → همچنان سبز**
- [ ] **Step 5: `node serve.js` → `#/self-test` همه صفر. فاز ۴ اینجا تمام است: ۹۰ مدخل، دوازده مرحله، دستهٔ `distributed` کامل.**
- [ ] **Step 6: کامیت**

```bash
git add data/architecture data/crypto/entries
git commit -m "feat: reach for consistency across services

The spectrum from strong to eventual, what replication and
partitioning cost, and why CAP only speaks about the moment of a
partition. Two-phase commit is included as the thing saga replaced —
the lesson file recommends saga without naming what it is instead of.

Leader election is the bridge to the crypto topic: consensus and BFT
solve this problem where nodes may lie rather than merely die."
```

---

## Task 14: مرحلهٔ ۱۳ — رویدادمحور (۸ مدخل)

**Files:**
- Modify: `data/architecture/entries/communication.json` (شش مدخل، جمع ۲۰ — این دسته کامل می‌شود)
- Modify: `data/architecture/entries/styles.json` (`cqrs`، `event-sourcing` — جمع ۱۷)
- Modify: `data/crypto/entries/basics.json` و `data/crypto/entries/consensus.json` (**فقط `related`**)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `event`، `domain-event`، `pub-sub`، `message-broker`، `at-least-once-delivery`، `idempotency`، `ordering`، `eventual-consistency`، `dead-letter-queue`، `coupling`
- Produces: `event-driven-architecture`، `producer-consumer`، `event-contract`، `event-envelope`، `schema-versioning`، `event-chaining`، `cqrs`، `event-sourcing`

### مدخل‌ها (به همین ترتیب)

**`event-driven-architecture`** — معماری رویدادمحور / Event-Driven Architecture · tags: `communication` `style` `async` · related: `event`، `pub-sub`، `coupling`، `asynchronous-communication`، `eventual-consistency`
بدنه: سبکی که در آن اجزا با اعلام آنچه افتاده به هم می‌رسند، نه با صدا زدن هم. مثال بد و مفصل: سرویس سفارش که مستقیم به موجودی و پرداخت و اعلان زنگ می‌زند، و با هر قابلیت تازه دوباره عوض می‌شود. مکانیزم: همان جریان در مدل رویدادمحور و اینکه چه چیزی واقعاً جدا شد. **هشدار مرکزی این مرحله:** رویدادمحوری جفت‌شدگی را حذف نمی‌کند، جابه‌جایش می‌کند — از کد به قرارداد. دام‌ها: رویداد برای همه‌چیز، رویداد مبهم، و ناپدید شدن جریان کسب‌وکار.
دیاگرام: جریان مستقیم در برابر جریان رویدادمحور، با شمار جاهایی که برای قابلیت تازه باید عوض شوند.
مثال Go: انتشار `OrderPlaced` به‌جای سه فراخوانی.

**`producer-consumer`** — تولیدکننده و مصرف‌کننده / Producer and Consumer · tags: `communication` `async` · related: `event-driven-architecture`، `queue`، `pub-sub`، `backpressure`
بدنه: دو نقش هر سیستم رویدادمحور، با مسئولیت‌های نامتقارن. مثال بد: تولیدکننده‌ای که فرض می‌کند مصرف‌کننده بلافاصله و یک‌بار پردازش می‌کند. مکانیزم: تولیدکننده مسئول *معنا* و پایداری قرارداد است؛ مصرف‌کننده مسئول تحمل تکرار، بی‌ترتیبی و تأخیر. جدول: مسئولیت هر طرف، و چیزهایی که هیچ‌کدام نباید فرض کنند.
دیاگرام: **جدول دو‌ستونی** مسئولیت‌ها.
مثال Go: تولیدکننده و مصرف‌کنندهٔ حداقلی با نقش‌های صریح.

**`event-contract`** — قرارداد رویداد / Event Contract · tags: `communication` `async` · related: `event`، `producer-consumer`، `interface`، `domain-event`
بدنه: شکل و معنای رویداد، قراردادی عمومی است — از لحظه‌ای که منتشر شد، دیگر مال تو نیست. مثال بد: تغییر نام یک فیلد که سه مصرف‌کننده را بی‌صدا می‌شکند. مکانیزم: قرارداد فقط اسکیما نیست؛ معنا هم بخشی از آن است، و تغییر بی‌صدای معنا خطرناک‌تر از تغییر ساختار است. جدول: تغییر سازگار در برابر ناسازگار، با نمونه.
دیاگرام: **جدول تغییرها** با ستون «چه کسی می‌شکند».
مثال Go: struct رویداد با تگ‌های صریح.

**`event-envelope`** — پاکت رویداد / Event Envelope · tags: `communication` `async` · related: `event-contract`، `idempotency`، `ordering`، `at-least-once-delivery`
بدنه: فراداده‌ای که دور بار اصلی می‌پیچد — شناسهٔ رویداد، نوع، نسخه، زمان، شناسهٔ ردیابی. مثال بد: رویدادی که فقط بار اصلی است و هیچ راهی برای تشخیص تکرار یا ردیابی ندارد. مکانیزم: چرا `event_id` مهم‌ترین فیلد است — بدون آن مصرف‌کنندهٔ ایدمپوتنت اصلاً ساختنی نیست، و تحویل حداقل یک‌بار یعنی تکرار حتمی است. جدول: هر فیلد پاکت و مسئله‌ای که حل می‌کند.
دیاگرام: **جدول فیلدها** به‌علاوهٔ یک نمونهٔ JSON.
مثال Go: struct `Envelope[T]` و نمونهٔ JSON.

**`schema-versioning`** — نسخه‌بندی اسکیما / Schema Versioning · tags: `communication` `async` · related: `event-contract`، `event-envelope`، `producer-consumer`
بدنه: قرارداد عوض می‌شود؛ سؤال این است که چطور بدون شکستن مصرف‌کننده‌ها. **مخزن اسکیما اینجا توضیح داده می‌شود و مدخل جدا ندارد.** مثال بد: انتشار نسخهٔ تازه با فرض اینکه همه هم‌زمان به‌روز می‌شوند. مکانیزم: سازگاری رو به عقب و رو به جلو، و اینکه در دورهٔ گذار هر دو نسخه باید هم‌زمان زنده باشند. جدول: نوع تغییر و راهبرد امنش.
دیاگرام: **خط زمانی** گذار دو‌نسخه‌ای با بازهٔ هم‌پوشانی.
مثال Go: نگاشت نسخهٔ ۱ به نسخهٔ ۲ در مصرف‌کننده.

**`event-chaining`** — زنجیرهٔ رویداد / Event Chaining · tags: `communication` `async` `antipattern` · related: `event-driven-architecture`، `choreography`، `ordering`، `event-contract`
بدنه: رویدادی که رویداد بعدی را می‌سازد و آن هم بعدی را. مثال بد: زنجیرهٔ شش‌حلقه‌ای که هیچ‌کس نمی‌داند کجا تمام می‌شود و یک تغییر کوچک در حلقهٔ دوم، حلقهٔ ششم را می‌شکند. مکانیزم: زنجیره در ذاتش بد نیست؛ زنجیرهٔ *نامرئی* بد است. سه علامت اینکه زنجیره از دست رفته: طول ناشناخته، حلقه، و نبود جای واحدی که جریان را بگوید. راه‌حل: ارکستراسیون یا دست‌کم ثبت جریان.
دیاگرام: زنجیرهٔ شش‌حلقه‌ای با یک حلقهٔ بازگشتی پنهان.
مثال Go: مصرف‌کننده‌ای که با `correlation_id` زنجیره را ردیابی‌پذیر می‌کند.

**`cqrs`** — CQRS · دستهٔ `styles` · tags: `style` `consistency` `structure` · related: `event-driven-architecture`، `eventual-consistency`، `use-case`، `command`، `aggregate`
بدنه: جدا کردن مسیر نوشتن از مسیر خواندن، تا هرکدام مدل خودش را داشته باشد. **مدل خوانشی و نمای مادی‌شده اینجا توضیح داده می‌شوند و مدخل جدا ندارند.** مثال بد: اعمال CQRS روی یک CRUD ساده، که فقط دو برابر کد می‌سازد. مکانیزم: کِی می‌ارزد — وقتی الگوی خواندن و نوشتن واقعاً متفاوت‌اند. رفع ابهام مهم: CQRS رویدادمحوری لازم ندارد و منبع رویداد هم نیست؛ این سه مرتب با هم اشتباه گرفته می‌شوند.
دیاگرام: دو مسیر جدا از یک ورودی، با نقطهٔ همگام‌سازی و تأخیرش.
مثال Go: `PlaceOrder` روی مدل نوشتن و `OrderSummary` روی مدل خواندن.

**`event-sourcing`** — منبع رویداد / Event Sourcing · دستهٔ `styles` · tags: `style` `consistency` `structure` · related: `cqrs`، `event`، `event-contract`، `aggregate`، `blockchain`
بدنه: به‌جای ذخیرهٔ حالت فعلی، دنبالهٔ رویدادهایی که به آن رسیده‌اند را ذخیره کن؛ حالت با بازپخش ساخته می‌شود. مثال بد: به‌کارگیری‌اش برای دامنه‌ای که هیچ‌کس تاریخچه‌اش را نمی‌خواهد. مکانیزم: چه چیزی به دست می‌آید (تاریخچهٔ کامل، حسابرسی، بازسازی نماهای تازه) و چه چیزی گران می‌شود (تغییر اسکیمای رویداد، عکس فوری، حذف داده و حق فراموشی). پل به کریپتو: مدخل بلاکچین یک دفتر فقط‌افزودنی است — همان ایده با تضمین‌های بسیار قوی‌تر و بهای بسیار بالاتر.
دیاگرام: **خط زمانی** رویدادها با حالت بازساخته در سه نقطه.
مثال Go: `Apply(event)` و بازپخش برای ساخت حالت.

### پل دوطرفه به کریپتو

| فایل | مدخل کریپتو | شناسه‌ای که به `related` اضافه می‌شود |
|---|---|---|
| `basics.json` | `blockchain` | `event-sourcing` |
| `consensus.json` | `state` | `event-sourcing` |

### مرحلهٔ نقشه

```json
{
  "id": "events",
  "fa": {
    "title": "رویدادمحور",
    "why": "وقتی رویداد ستون فقرات معماری می‌شود، قرارداد جای کد را می‌گیرد"
  },
  "en": {
    "title": "Event-driven",
    "why": "Once events carry the architecture, the contract takes over from the code"
  },
  "entries": [
    "event-driven-architecture",
    "producer-consumer",
    "event-contract",
    "event-envelope",
    "schema-versioning",
    "event-chaining",
    "cqrs",
    "event-sourcing"
  ]
}
```

- [ ] **Step 1: هشت مدخل را بنویس — شش در `communication.json`، دو در `styles.json`**
- [ ] **Step 2: `node --test` → باید قرمز شود**
- [ ] **Step 3: مرحلهٔ `events` را اضافه کن؛ `node --test` → سبز**
- [ ] **Step 4: `related` دو مدخل کریپتو را به‌روز کن؛ `node --test` → همچنان سبز**
- [ ] **Step 5: `node serve.js` → `#/self-test` همه صفر. دستهٔ `communication` کامل شد.**
- [ ] **Step 6: کامیت**

```bash
git add data/architecture data/crypto/entries
git commit -m "feat: build the event-driven layer

Contract, envelope and versioning get their own entries because they
are where an event-driven system actually breaks: publishing does not
remove coupling, it moves it from code to contract, and event_id is
what makes an idempotent consumer possible at all.

CQRS says plainly that it needs neither event-driven architecture nor
event sourcing, since the three are routinely confused."
```

---

## Task 15: مرحلهٔ ۱۴ — سبک‌های دیگر (۹ مدخل)

**Files:**
- Modify: `data/architecture/entries/styles.json` (نه مدخل، جمع ۲۶ — این دسته کامل می‌شود)
- Modify: `data/crypto/entries/consensus.json` (**فقط `related`**)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `layered-architecture`، `use-case`، `clean-architecture`، `microservices`، `api-gateway`، `component`، `asynchronous-communication`، `domain`، `bounded-context`، `event-driven-architecture`
- Produces: `vertical-slice-architecture`، `screaming-architecture`، `pipes-and-filters`، `soa`، `serverless`، `actor-model`، `peer-to-peer`، `data-mesh`، `service-mesh`

### مدخل‌ها (به همین ترتیب)

**`vertical-slice-architecture`** — معماری برش عمودی / Vertical Slice Architecture · tags: `style` `structure` · related: `layered-architecture`، `use-case`، `cohesion`، `layer`
بدنه: به‌جای تقسیم افقی به لایه، تقسیم عمودی به قابلیت — هر برش شامل همهٔ لایه‌های خودش. مثال بد: افزودن یک قابلیت که در معماری لایه‌ای چهار پوشهٔ دور از هم را لمس می‌کند. مکانیزم: انسجام بر اساس تغییر، دقیقاً همان معیاری که مدخل انسجام گفت. جدول: لایه‌ای در برابر برش عمودی روی «برای یک قابلیت چند جا را باز می‌کنی». دام: تکرار کد میان برش‌ها که به گلولهٔ گِل برمی‌گردد.
دیاگرام: شبکهٔ لایه × قابلیت با یک ستون و یک سطر پررنگ.
مثال Go: `features/placeorder/` با همه‌چیزِ خودش.

**`screaming-architecture`** — معماری فریادزن / Screaming Architecture · tags: `style` `structure` · related: `vertical-slice-architecture`، `ubiquitous-language`، `domain`
بدنه: ساختار پوشه باید بگوید برنامه دربارهٔ چیست، نه اینکه با چه چارچوبی نوشته شده. مثال بد: ریشهٔ پروژه‌ای با `controllers/`، `models/`، `services/` که به‌جای دامنه، چارچوب را فریاد می‌زند. مکانیزم: تست ذهنی — کسی که پوشه‌ها را می‌بیند، می‌تواند حدس بزند این نرم‌افزار چه کاری می‌کند؟ جدول: دو ساختار کنار هم با همان کد.
دیاگرام: **دو درخت پوشه** کنار هم.
مثال Go: ریشهٔ دامنه‌محور.

**`pipes-and-filters`** — لوله‌ها و فیلترها / Pipes and Filters · tags: `style` `structure` · related: `component`، `asynchronous-communication`، `separation-of-concerns`
بدنه: پردازش به‌صورت زنجیره‌ای از مراحل مستقل که خروجی هرکدام ورودی بعدی است. مثال بد: مرحله‌ای که به حالت مرحلهٔ قبلی دست می‌زند. مکانیزم: هر فیلتر باید بی‌حالت و جایگزین‌پذیر باشد؛ همین است که موازی‌سازی را ممکن می‌کند. جدول: کجا خوب می‌نشیند (پردازش داده، ETL، میان‌افزار) و کجا نه.
دیاگرام: زنجیرهٔ چهار فیلتر با شکل داده روی هر لوله.
مثال Go: زنجیرهٔ میان‌افزار `http.Handler`.

**`soa`** — معماری سرویس‌گرا / Service-Oriented Architecture · tags: `style` `structure` · related: `microservices`، `component`، `boundary`
بدنه: نسل پیش از میکروسرویس: سرویس‌های بزرگ‌تر با گذرگاه سازمانی وسط. مثال بد: تصور اینکه میکروسرویس چیز کاملاً تازه‌ای است. مکانیزم: تفاوت واقعی — اندازهٔ سرویس، مالکیت داده، و اینکه هوشمندی در گذرگاه است یا در سرویس. جدول: SOA در برابر میکروسرویس روی چهار محور.
دیاگرام: **جدول مقایسه** به‌علاوهٔ نمودار گذرگاه.
مثال Go: طرح قرارداد سرویس درشت‌دانه.

**`serverless`** — سرورلس / Serverless · tags: `style` `scaling` · related: `event-driven-architecture`، `microservices`، `component`
بدنه: کد به‌صورت تابع مستقر می‌شود و زیرساخت مقیاس و چرخهٔ عمرش را می‌گرداند. مثال بد: تابعی که به حالت درون‌حافظه‌ای بین فراخوانی‌ها تکیه دارد. مکانیزم: چرا بی‌حالتی اینجا اختیاری نیست، و شروع سرد چه چیزی را در طراحی عوض می‌کند. جدول: کجا می‌ارزد (بار ناپیوسته، کار رویدادمحور) و کجا گران می‌شود.
دیاگرام: **خط زمانی** بار ناپیوسته و نمونه‌هایی که می‌آیند و می‌روند.
مثال Go: تابع بی‌حالت با همهٔ وابستگی‌ها از بیرون.

**`actor-model`** — مدل بازیگر / Actor Model · tags: `style` `async` `structure` · related: `asynchronous-communication`، `queue`، `component`
بدنه: هر بازیگر حالت خصوصی خودش را دارد و فقط با پیام حرف می‌زند؛ هیچ حافظهٔ مشترکی نیست. مثال بد: بازیگری که حالتش را از بیرون قابل خواندن کرده. مکانیزم: چرا این همزمانی را ساده می‌کند — قفل حذف می‌شود چون اشتراکی نیست — و در Go چطور با گوروتین و کانال بازتولید می‌شود. جدول: بازیگر در برابر حافظهٔ مشترک با قفل.
دیاگرام: سه بازیگر با صندوق پیام مستقل.
مثال Go: گوروتین با کانال ورودی به‌عنوان بازیگر.

**`peer-to-peer`** — همتا به همتا / Peer-to-Peer · tags: `style` `structure` · related: `distributed-system`، `replication`، `leader-election`، `node`، `bitcoin`
بدنه: همهٔ گره‌ها نقش یکسان دارند؛ نه سروری هست نه مرکزی. مثال بد: نامیدن معماری‌ای که یک گره هماهنگ‌کنندهٔ ثابت دارد «همتا به همتا». مکانیزم: کشف همتا، تکثیر، و اینکه نبود مرکز چه چیزی را سخت می‌کند — به‌ویژه اینکه بدون مرکز، توافق بر یک نسخه از واقعیت گران می‌شود. پل به کریپتو: مدخل گره و مدخل بیت‌کوین کامل‌ترین نمونهٔ اجرایی این سبک‌اند.
دیاگرام: شبکهٔ همتا در برابر ستارهٔ کارخواه-کارساز.
مثال Go: طرح فهرست همتا و انتشار همه‌پخشی.

**`data-mesh`** — دیتا مش / Data Mesh · tags: `style` `domain` `structure` · related: `bounded-context`، `domain`، `microservices`، `conways-law`
بدنه: داده به‌جای انبار مرکزی، به‌صورت محصول در اختیار هر دامنه است و همان تیم مالکش می‌ماند. مثال بد: انبار داده‌ای که یک تیم مرکزی برای همهٔ دامنه‌ها نگه می‌دارد و همیشه عقب است. مکانیزم: چهار اصل و اینکه هر کدام کاربرد قانون کانوی روی داده است. جدول: انبار مرکزی در برابر مش روی مالکیت، کیفیت، و سرعت تغییر.
دیاگرام: **جدول مقایسه** به‌علاوهٔ نمودار مالکیت.
مثال Go: قرارداد صریح خروجی داده در مرز دامنه.

**`service-mesh`** — سرویس مش / Service Mesh · tags: `style` `communication` `failure` · related: `microservices`، `api-gateway`، `circuit-breaker`
بدنه: لایه‌ای زیرساختی که ارتباط سرویس‌به‌سرویس را از خود سرویس بیرون می‌کشد. **الگوی سایدکار اینجا توضیح داده می‌شود و مدخل جدا ندارد.** مثال بد: پیاده‌سازی جداگانهٔ مهلت، تلاش دوباره و قطع‌کن در هر سرویس و هر زبان. مکانیزم: چه چیزهایی درست است که به مش برود و چه چیزهایی نه — قاعده: هرچه دربارهٔ *انتقال* است می‌رود، هرچه دربارهٔ *معنا* است نمی‌رود. دام: پنهان شدن رفتار در جایی که تیم سرویس نمی‌بیندش.
دیاگرام: **جدول** — کدام مسئولیت در سرویس، کدام در سایدکار.
مثال Go: سرویسی که مهلت را از context می‌گیرد و خودش نگه نمی‌دارد.

**نکتهٔ مهم این تسک — دو ارجاع رو به جلو:** دو مدخل این مرحله طبیعتاً به مدخل‌هایی از مرحلهٔ ۱۵ اشاره می‌کنند که هنوز نوشته نشده‌اند. `related` به شناسهٔ ناموجود خطای اعتبارسنجی می‌سازد و `#/self-test` را قرمز می‌کند، پس:

| مدخل | شناسه‌ای که **الان نباید** در `related` باشد | کِی اضافه می‌شود |
|---|---|---|
| `service-mesh` | `observability` | تسک ۱۶، قدم ۴ |
| `serverless` | `stateless` | تسک ۱۶، قدم ۴ |

در متن این دو مدخل هم عبارت «مدخل رصدپذیری» و «مدخل بی‌حالت» را ننویس — گارد ترتیب این عبارت‌ها را پیش‌نیاز می‌شمارد و چون آن مدخل‌ها بعدتر می‌آیند، `node --test` قرمز می‌ماند. مفهوم را بدون ارجاع صریح توضیح بده.

### پل دوطرفه به کریپتو

| فایل | مدخل کریپتو | شناسه‌ای که به `related` اضافه می‌شود |
|---|---|---|
| `consensus.json` | `node` | `peer-to-peer` |
| `consensus.json` | `bitcoin` | `peer-to-peer` |

### مرحلهٔ نقشه

```json
{
  "id": "other-styles",
  "fa": {
    "title": "سبک‌های دیگر",
    "why": "بقیهٔ نقشه: سبک‌هایی که هرکدام یک مسئلهٔ خاص را هدف گرفته‌اند"
  },
  "en": {
    "title": "The other styles",
    "why": "The rest of the map: styles each aimed at one particular problem"
  },
  "entries": [
    "vertical-slice-architecture",
    "screaming-architecture",
    "pipes-and-filters",
    "soa",
    "serverless",
    "actor-model",
    "peer-to-peer",
    "data-mesh",
    "service-mesh"
  ]
}
```

- [ ] **Step 1: نه مدخل را به `styles.json` اضافه کن (جمع ۲۶)**
- [ ] **Step 2: `node --test` → باید قرمز شود**
- [ ] **Step 3: مرحلهٔ `other-styles` را اضافه کن؛ `node --test` → سبز**
- [ ] **Step 4: `related` دو مدخل کریپتو را به‌روز کن؛ `node --test` → همچنان سبز**
- [ ] **Step 5: `node serve.js` → `#/self-test` همه صفر. فاز ۵ اینجا تمام است: ۱۰۷ مدخل، چهارده مرحله، دستهٔ `styles` کامل.**
- [ ] **Step 6: کامیت**

```bash
git add data/architecture data/crypto/entries
git commit -m "feat: fill in the rest of the style map

Vertical slice, screaming, pipes and filters, SOA, serverless, actor
model, peer-to-peer, data mesh and service mesh. Each entry says what
single problem the style was aimed at, so the map reads as a set of
answers rather than a list of names.

Peer-to-peer bridges back to the crypto topic, where node and bitcoin
are the style's most complete running example."
```

---

## Task 16: مرحلهٔ ۱۵ — تصمیم و کیفیت (۱۳ مدخل)

آخرین تسک. موضوع اینجا کامل می‌شود: ۱۲۰ مدخل، ۷ دسته، ۱۵ مرحله.

**Files:**
- Modify: `data/architecture/entries/decisions.json` (سیزده مدخل، جمع ۱۴ — این دسته کامل می‌شود)
- Modify: `data/architecture/entries/styles.json` (افزودن `observability` به `related` مدخل `service-mesh`)
- Modify: `data/crypto/entries/consensus.json` (**فقط `related`**)
- Modify: `data/architecture/roadmap.json`

**Interfaces:**
- Consumes: `trade-off` و بقیهٔ مدخل‌های همین مرحله، به‌علاوهٔ `microservices`، `modular-monolith`، `serverless`، `cache`، `circuit-breaker`، `conways-law`، `technical-debt`
- Produces: هر سیزده شناسه — هیچ تسک بعدی‌ای نیست.

### مدخل‌ها (به همین ترتیب)

**`non-functional-requirements`** — نیازمندی‌های غیرکارکردی / Non-Functional Requirements · tags: `decision` · related: `software-architecture`، `microservices`
بدنه: نیازمندی کارکردی می‌گوید سیستم چه کاری می‌کند؛ غیرکارکردی می‌گوید چقدر خوب. **نیازمندی کارکردی اینجا توضیح داده می‌شود و مدخل جدا ندارد.** مثال بد: «سیستم باید سریع باشد» به‌عنوان نیازمندی. مکانیزم: نیازمندی غیرکارکردی بدون عدد و بدون شرط، آرزوست؛ و همین‌هاست که معماری را تعیین می‌کند، نه فهرست قابلیت‌ها. جدول: نیازمندی مبهم و همان با عدد.
دیاگرام: **جدول** نیازمندی، عدد، و «کدام تصمیم معماری را عوض می‌کند».
مثال Go: بیان بودجهٔ تأخیر به‌عنوان مهلت در کد.

**`availability`** — دسترس‌پذیری / Availability · tags: `decision` `failure` · related: `non-functional-requirements`، `circuit-breaker`، `distributed-system`
بدنه: کسری از زمان که سیستم واقعاً کار می‌کند. **تأخیر و توان عملیاتی و SLA و SLO اینجا توضیح داده می‌شوند و مدخل جدا ندارند.** مثال بد: وعدهٔ ۹۹٫۹۹٪ روی سیستمی که وابستگی‌هایش ۹۹٪ هستند. مکانیزم: دسترس‌پذیری زنجیرهٔ همزمان ضرب می‌شود، پس هر وابستگی تازه سقف را پایین می‌آورد — همان استدلالی که مدخل ارتباط همزمان شروعش کرد. جدول: نه‌ها و دقیقهٔ خرابی سالانه.
دیاگرام: **جدول نه‌ها** به‌علاوهٔ ضرب زنجیره‌ای.
مثال Go: محاسبهٔ بودجهٔ خطا.

**`trade-off`** — بده‌بستان / Trade-off · tags: `decision` · related: `non-functional-requirements`، `availability`، `software-architecture`
بدنه: هر تصمیم معماری چیزی می‌دهد و چیزی می‌گیرد؛ تصمیمی که فقط مزیت دارد یعنی هنوز هزینه‌اش را پیدا نکرده‌ای. مثال بد: انتخاب میکروسرویس با فهرستی که فقط مزیت‌ها را دارد. مکانیزم: روش نوشتن بده‌بستان — گزینه‌ها، معیارها، و اینکه کدام معیار در این بافت می‌برد. جدول: نمونهٔ واقعی یک بده‌بستان کامل.
دیاگرام: **جدول تصمیم** با گزینه در سطر و معیار در ستون.
مثال Go: دو طرح با هزینه‌های متفاوت.

**`vertical-scaling`** — مقیاس‌پذیری عمودی / Vertical Scaling · tags: `scaling` `decision` · related: `trade-off`، `bottleneck`، `scalability`
بدنه: ماشین بزرگ‌تر بگیر. مثال بد: نادیده گرفتنش چون «مدرن نیست» — تا مدت‌ها ارزان‌ترین و ساده‌ترین راه است. مکانیزم: سقف سخت‌افزاری و اینکه هزینه به‌صورت غیرخطی بالا می‌رود. جدول: کِی عمودی جواب می‌دهد.
دیاگرام: منحنی هزینه بر حسب ظرفیت با نقطهٔ زانو.
مثال Go: —(بدون کد؛ مثال این مدخل جدول ظرفیت و هزینه است)

**`horizontal-scaling`** — مقیاس‌پذیری افقی / Horizontal Scaling · tags: `scaling` `decision` · related: `vertical-scaling`، `stateless`، `partitioning`، `replication`، `scalability`
بدنه: ماشین بیشتر بگیر. مثال بد: افزودن نمونهٔ دوم به سرویسی که حالت درون‌حافظه‌ای دارد. مکانیزم: مقیاس افقی بی‌حالتی را *لازم* دارد، و همین است که مدخل بعدی را ضروری می‌کند. جدول: عمودی در برابر افقی روی سقف، هزینه، و پیچیدگی. پل به کریپتو: مدخل مقیاس‌پذیری همین مسئله را در بلاکچین نشان می‌دهد، جایی که افزودن گره ظرفیت را زیاد نمی‌کند.
دیاگرام: **جدول مقایسه** دو‌ستونی.
مثال Go: سرویس بی‌حالت پشت متعادل‌کنندهٔ بار.

**`stateless`** — بی‌حالت / Stateless · tags: `scaling` `structure` · related: `horizontal-scaling`، `serverless`، `cache`
بدنه: سرویس بی‌حالت چیزی بین درخواست‌ها نگه نمی‌دارد. مثال بد: نشست کاربر در حافظهٔ فرایند، که با نمونهٔ دوم به‌هم می‌ریزد. مکانیزم: حالت حذف نمی‌شود، جابه‌جا می‌شود — به پایگاه داده، کش، یا خود درخواست؛ و انتخاب اینکه کجا برود یک تصمیم معماری است. جدول: انواع حالت و جای درستشان.
دیاگرام: **جدول** حالت، محل نگهداری، و پیامد.
مثال Go: نشست از روی توکن به‌جای حافظه.

**`bottleneck`** — گلوگاه / Bottleneck · tags: `scaling` `decision` · related: `horizontal-scaling`، `backpressure`، `partitioning`
بدنه: کندترین جزء، سقف کل سیستم را تعیین می‌کند. مثال بد: بهینه‌سازی بخشی که گلوگاه نیست و صفر بهبود گرفتن. مکانیزم: گلوگاه جابه‌جا می‌شود — با رفعش، گلوگاه بعدی ظاهر می‌شود، پس اندازه‌گیری پیش از بهینه‌سازی اجباری است. جدول: گلوگاه‌های رایج و علامتشان.
دیاگرام: لوله با یک تنگنا، و همان بعد از رفع با تنگنای تازه.
مثال Go: اندازه‌گیری با ابزار profiling پیش از تغییر.

**`cache`** — کش / Cache · tags: `scaling` `consistency` · related: `bottleneck`، `eventual-consistency`، `stateless`
بدنه: نگه‌داشتن نتیجه‌ای که گران به‌دست آمده، برای دفعهٔ بعد. مثال بد: کش بدون سیاست ابطال، که داده‌ای را برای همیشه کهنه نگه می‌دارد. مکانیزم: کش همیشه ناسازگاری وارد می‌کند؛ سؤال درست این نیست که «کش کنم؟» بلکه «چقدر کهنگی قابل تحمل است؟». جدول: راهبردهای ابطال و بهای هرکدام. دام: کشی که خودش گلوگاه یا نقطهٔ شکست می‌شود.
دیاگرام: **جدول راهبردها** با ستون «کهنگی ممکن».
مثال Go: کش با TTL و پیشگیری از هجوم.

**`observability`** — رصدپذیری / Observability · tags: `decision` `failure` · related: `distributed-system`، `service-mesh`، `event-chaining`، `bottleneck`
بدنه: توانایی فهمیدن اینکه داخل سیستم چه می‌گذرد، فقط از روی چیزهایی که بیرون می‌دهد. **لاگ، متریک و ترِیس اینجا توضیح داده می‌شوند و مدخل جدا ندارند.** مثال بد: سیستم رویدادمحوری که هیچ شناسهٔ همبستگی ندارد و ردیابی یک سفارش در آن ناممکن است. مکانیزم: هر سه سیگنال چه سؤال متفاوتی جواب می‌دهند. جدول: سؤال، سیگنال درست، و هزینهٔ نگهداری.
دیاگرام: **جدول سه‌سطری** سیگنال‌ها به‌علاوهٔ یک تریس نمونه در چهار سرویس.
مثال Go: انتشار `trace_id` در context و در پاکت رویداد.

**`technical-debt`** — بدهی فنی / Technical Debt · tags: `decision` `antipattern` · related: `trade-off`، `big-ball-of-mud`، `complexity`
بدنه: استعارهٔ کانینگهام: انتخاب راه سریع‌تر امروز، به قیمت بهرهٔ فردا. مثال بد: نامیدن هر کد بدی «بدهی فنی» — بدهی *انتخاب آگاهانه* است؛ کد بد بدون تصمیم فقط کد بد است. مکانیزم: بهره چطور پرداخت می‌شود (هر تغییر کندتر) و چرا بدهی نانوشته بدترین نوع است. جدول: بدهی عمدی و غیرعمدی، محتاطانه و بی‌احتیاط.
دیاگرام: **ماتریس دو‌در‌دو** بدهی.
مثال Go: کامنتی که بدهی و شرط بازپرداختش را ثبت می‌کند.

**`evolutionary-architecture`** — معماری تکاملی / Evolutionary Architecture · tags: `decision` `structure` · related: `technical-debt`، `trade-off`، `modular-monolith`، `strangler-fig`
بدنه: معماری‌ای که برای تغییرِ هدایت‌شده طراحی شده، نه برای درست بودن از روز اول. **تابع تناسب معماری اینجا توضیح داده می‌شود و مدخل جدا ندارد.** مثال بد: طراحی کامل پیش از نوشتن اولین خط، برای دامنه‌ای که هنوز فهمیده نشده. مکانیزم: تابع تناسب یعنی خاصیت معماری را به آزمون خودکار تبدیل کنی — دقیقاً همان کاری که گارد ترتیب همین سایت می‌کند. جدول: خاصیت‌های قابل آزمون و راه آزمونشان.
دیاگرام: **جدول** خاصیت، آزمون، و «کِی قرمز می‌شود».
مثال Go: آزمونی که import ممنوع میان لایه‌ها را رد می‌کند.

**`c4-model`** — مدل C4 / C4 Model · tags: `decision` `structure` · related: `evolutionary-architecture`، `component`، `boundary`
بدنه: چهار سطح دیاگرام — بافت، ظرف، کامپوننت، کد — که هرکدام برای مخاطب متفاوتی است. مثال بد: یک دیاگرام واحد که همه‌چیز را نشان می‌دهد و در نتیجه هیچ‌کس نمی‌خواندش. مکانیزم: هر سطح یک سؤال دارد و باید تنها آن را جواب دهد. جدول: سطح، مخاطب، سؤال.
دیاگرام: **جدول چهار‌سطحی** به‌علاوهٔ نمونهٔ کوچک سطح دو.
مثال Go: — (بدون کد؛ مثال این مدخل نمونهٔ دیاگرام سطح ظرف است)

**`adr`** — سند تصمیم معماری / Architecture Decision Record · tags: `decision` · related: `trade-off`، `evolutionary-architecture`، `c4-model`، `conways-law`
بدنه: سند کوتاهی که یک تصمیم، بافتش، گزینه‌های ردشده و پیامدهایش را ثبت می‌کند. مثال بد: تصمیمی که فقط در سر یک نفر است و شش ماه بعد کسی نمی‌داند چرا. مکانیزم: قالب حداقلی — بافت، تصمیم، وضعیت، پیامد — و اینکه ADR باطل‌شده حذف نمی‌شود بلکه با ADR تازه *جایگزین* می‌شود، چون تاریخچهٔ تصمیم خودش اطلاعات است. جدول: چه چیزی ADR می‌خواهد و چه چیزی نه.
دیاگرام: **قالب یک ADR واقعی** برای همین تصمیم: چرا این سایت بدون چارچوب نوشته شده.
مثال Go: — (بدون کد؛ مثال این مدخل یک ADR کامل به‌صورت متن است)

### پل دوطرفه به کریپتو

| فایل | مدخل کریپتو | شناسه‌هایی که به `related` اضافه می‌شوند |
|---|---|---|
| `consensus.json` | `scalability` | `horizontal-scaling`، `vertical-scaling` |

### مرحلهٔ نقشه

```json
{
  "id": "deciding",
  "fa": {
    "title": "تصمیم و کیفیت",
    "why": "معماری یعنی انتخاب — و انتخاب یعنی نوشتن آنچه از دست می‌دهی"
  },
  "en": {
    "title": "Deciding, and quality",
    "why": "Architecture is choosing — and choosing means writing down what you give up"
  },
  "entries": [
    "non-functional-requirements",
    "availability",
    "trade-off",
    "vertical-scaling",
    "horizontal-scaling",
    "stateless",
    "bottleneck",
    "cache",
    "observability",
    "technical-debt",
    "evolutionary-architecture",
    "c4-model",
    "adr"
  ]
}
```

- [ ] **Step 1: سیزده مدخل را به `decisions.json` اضافه کن (جمع ۱۴)**
- [ ] **Step 2: `node --test` → باید قرمز شود**
- [ ] **Step 3: مرحلهٔ `deciding` را اضافه کن؛ `node --test` → سبز**
- [ ] **Step 4: ارجاع‌های رو به جلوی تسک ۱۵ را ببند و پل کریپتو را بزن**

در `data/architecture/entries/styles.json`:

| مدخل | به `related` اضافه شود |
|---|---|
| `service-mesh` | `observability` |
| `serverless` | `stateless` |

و `related` مدخل `scalability` کریپتو را طبق جدول بالا به‌روز کن. سپس `node --test` → همچنان سبز.
- [ ] **Step 5: بررسی نهایی**

```bash
node --test
node serve.js
```

- `#/self-test` → همه صفر.
- `#/roadmap/architecture` → ۱۵ مرحله، جمع **۱۲۰** قدم.
- شمار مدخل‌های موضوع معماری در فهرست: ۱۲۰. شمار کل سایت: ۱۶۷.
- `git diff --stat` روی کل شاخه → هیچ چیزی زیر `assets/` نیست؛ تنها فایل غیرداده‌ای که در کل این نقشه عوض شده `test/roadmap-order.test.mjs` است.

- [ ] **Step 6: کامیت**

```bash
git add data/architecture data/crypto/entries
git commit -m "feat: complete the software architecture topic

The last stage is the one the whole path was for: requirements with
numbers in them, availability that multiplies down a synchronous
chain, the scaling pair, and the records that keep a decision
explicable six months later.

The ADR entry documents this repository's own no-framework decision as
its worked example, and the evolutionary-architecture entry points at
the roadmap-order guard as a fitness function that actually runs.

120 entries, 7 categories, 15 stages."
```
