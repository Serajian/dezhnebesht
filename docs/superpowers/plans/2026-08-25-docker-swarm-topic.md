# Docker Swarm Topic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** افزودن سومین موضوع سایت — «داکر سوارم» — با ۷۸ مدخل در ۸ دسته، روی یک مسیر یادگیری ۱۴ مرحله‌ای.

**Architecture:** کار کاملاً داده است. هر مرحلهٔ مسیر یادگیری یک تسک است: مدخل‌های آن مرحله در فایل دستهٔ خودشان نوشته می‌شوند، بعد مرحله به `roadmap.json` اضافه می‌شود. ترتیب تسک‌ها ترتیب مرحله‌هاست نه ترتیب دسته‌ها، تا هیچ مدخلی به شناسه‌ای که هنوز وجود ندارد `related` نشود.

**Tech Stack:** HTML/CSS/JS خام با ES module، بدون build، بدون npm. آزمون با `node --test` (runner داخلی Node). داده JSON خام زیر `data/`.

**Spec:** `docs/superpowers/specs/2026-08-25-docker-swarm-topic-design.md`

## Global Constraints

این‌ها روی **هر** تسک اعمال می‌شوند و در تک‌تک تسک‌ها تکرار نمی‌شوند.

- **هیچ فایلی زیر `assets/` یا `test/` تغییر نمی‌کند.** برخلاف نقشهٔ موضوع معماری، اینجا حتی یک استثنا هم نیست: `test/roadmap-order.test.mjs` از قبل روی همهٔ موضوع‌های `topics.json` می‌چرخد.
- **آزمون را با `node --test` بدون آرگومان مسیر اجرا کن.** `node --test test/` روی Node 22 با `MODULE_NOT_FOUND` می‌شکند.
- **سایت را با `node serve.js` بالا بیاور.** `fetch()` روی `file://` کار نمی‌کند و `index.html` مستقیم باز شود صفحهٔ خالی می‌دهد.
- **فارسی هرگز داخل `<pre>` یا `<code>` نیست.** `test/data-files.test.mjs` این را چک می‌کند و قرمز می‌شود. یعنی **کامنت‌های داخل YAML و خروجی دستورها باید انگلیسی باشند.**
- **مدخل فیلد `category` یا `topic` ندارد.** هر دو از مسیر فایل می‌آیند و آزمون وجودشان را رد می‌کند.
- **`tags` اسلاگ انگلیسی lowercase بدون `#`.** مجموعهٔ مجاز این موضوع: `cluster` `node` `service` `scheduling` `network` `storage` `security` `change` `failure` `operations` `delivery` `boundary` `antipattern`. هر مدخل دو تا چهار برچسب. برچسب بیرون این فهرست اضافه نمی‌شود.
- **`related` فقط به شناسه‌ای که همان لحظه وجود دارد.** یعنی مدخل‌های مرحله‌های قبل، مدخل‌های همین مرحله، و ۱۶۷ شناسهٔ دو موضوع دیگر. شناسهٔ ناموجود خطای اعتبارسنجی می‌سازد و بنر سایت را روشن می‌کند.
- **شناسه در کل سایت یکتاست.** تنها تداخل این موضوع `leader-election` است که موضوع معماری دارد؛ دوباره نوشته نمی‌شود و `raft` فقط به آن لینک می‌دهد.
- **فیلدهای زبان‌خنثی بیرون از `fa`/`en` می‌نشینند:** `id`، `tags`، `related`، `svg`.
- **جزوه مرجع نیست، اسکلت است.** هرجا `docker-swarm-course.md` ساده‌سازی کرده — مثل «Routing Mesh می‌تواند مسیریابی کند» — مدخل رفتار واقعی Swarm را می‌نویسد نه حرف جزوه را.

### دستور ساخت هر مدخل

هر مدخل این شکل را دارد و هر شش قسمت اجباری است:

```json
{
  "id": "...",
  "tags": ["...", "..."],
  "related": ["...", "..."],
  "svg": [{ "svg": "<svg ...>...</svg>", "fa": "...", "en": "..." }],
  "fa": { "title": "...", "short": "...", "body": "...", "example": "..." },
  "en": { "title": "...", "short": "...", "body": "...", "example": "..." }
}
```

- **`short`** یک جمله: تعریف به‌علاوهٔ اینکه چرا مهم است.
- **`body`** این قوس را دارد: تعریف سادهٔ یک‌جمله‌ای ← مسئله‌ای که حل می‌کند با یک مثال بدِ مشخص ← مکانیزم ← جدول یا مقایسه ← دام رایج ← یک ابهام رایج که صریح رفع شود. هدف ۵ تا ۷ هزار کاراکتر فارسی، همان عمق مدخل‌های موضوع معماری.
- **`example`** یکی از این سه شکل، داخل `<pre><code>` با کامنت انگلیسی: قطعهٔ `stack.yml`، خروجی واقعی یک دستور (`docker service ps` با ستون `CURRENT STATE`)، یا مقایسهٔ قبل/بعدِ یک قطعه YAML.
- **`svg`** دو تا سه دیاگرام inline. ریشه `direction="ltr"` می‌گیرد چون برچسب لاتین دارد، و هر `<text>` فارسی داخلش `direction="rtl"`.
- **`en`** ترجمهٔ کامل است نه خلاصه. `#/self-test` مدخل بدون ترجمه را گزارش می‌کند.
- هر اصطلاح انگلیسی جاافتاده، **اولین بار** در متن فارسی: `<span dir="ltr">(Routing Mesh)</span>`. یک بار در هر مدخل.
- **ارجاع به مدخل دیگر را با عبارت «مدخل ‹عنوان فارسی›» بنویس.** `test/roadmap-order.test.mjs` دقیقاً همین الگو را از متن بیرون می‌کشد و پیش‌نیاز می‌شمارد. ارجاع به مدخلی که در مرحلهٔ بعدتر است، آزمون را قرمز می‌کند.
- **در هر مرحله دست‌کم یک دیاگرام نباید جعبه‌و‌فلش باشد.** خطر این موضوع بیشتر از دو موضوع قبل است، چون هر دیاگرام وسوسه می‌کند سه جعبه به اسم Germany و Italy و France باشد. جایگزین‌ها: خط زمانی، نمودار حالت، ماتریس، جدول تصمیم.

### چرخهٔ تأیید هر تسک

هر چهارده تسک دقیقاً همین شش قدم را دارند، با ورودی متفاوت:

1. مدخل‌های مرحله را در فایل دسته بنویس (و اگر دستهٔ تازه‌ای است، `categories.json` و فایل خالی‌اش را بساز).
2. `node --test` → **باید قرمز شود** با «این مدخل‌ها در هیچ مرحله‌ای نیستند».
3. مرحله را به `data/swarm/roadmap.json` اضافه کن، و پل‌های دوطرفهٔ همان تسک را ببند.
4. `node --test` → **باید سبز شود**.
5. `node serve.js` و `#/self-test` → صفر خطای اعتبارسنجی، صفر شکست رندر، صفر مدخل بدون ترجمه، صفر مدخل خارج از نقشه. و `git diff --stat` هیچ چیزی زیر `assets/` یا `test/` نشان ندهد.
6. کامیت.

قدم ۲ همان گاردی است که CLAUDE.md وعده می‌دهد. اگر قرمز نشد یعنی چیزی سر جایش نیست — نرو جلو.

---

## File Structure

| فایل | مسئولیت | تسک |
|---|---|---|
| `data/topics.json` | یک سطر `swarm` | ۱ |
| `data/swarm/categories.json` | ۸ دسته، فاز‌به‌فاز | ۱، ۳، ۶، ۷، ۹، ۱۰ |
| `data/swarm/roadmap.json` | ۱۴ مرحله، یکی در هر تسک | ۱–۱۴ |
| `data/swarm/entries/cluster.json` | ۱۳ مدخل | ۱، ۲، ۵ |
| `data/swarm/entries/workload.json` | ۱۴ مدخل | ۳، ۴، ۵ |
| `data/swarm/entries/network.json` | ۱۰ مدخل | ۶ |
| `data/swarm/entries/state.json` | ۶ مدخل | ۷، ۸ |
| `data/swarm/entries/lifecycle.json` | ۸ مدخل | ۹، ۱۰ |
| `data/swarm/entries/operations.json` | ۷ مدخل | ۱۰ |
| `data/swarm/entries/delivery.json` | ۱۴ مدخل | ۳، ۱۱، ۱۲، ۱۳ |
| `data/swarm/entries/boundaries.json` | ۶ مدخل | ۷، ۱۴ |
| `data/architecture/entries/*.json` | فقط فیلد `related`، برای پل دوطرفه | ۲، ۶، ۷، ۹، ۱۴ |
| `data/crypto/entries/*.json` | فقط فیلد `related`، برای پل دوطرفه | ۲ |

---

## Task 1: اسکلت موضوع + مرحلهٔ ۱ — کلاستر چیست (۶ مدخل)

این تسک تنها تسکی است که فایل می‌سازد. بقیه فقط به فایل موجود اضافه می‌کنند.

**Files:**
- Modify: `data/topics.json` (یک سطر)
- Create: `data/swarm/categories.json`
- Create: `data/swarm/roadmap.json`
- Create: `data/swarm/entries/cluster.json`

**Interfaces:**
- Consumes: هیچ. اولین تسک است.
- Produces: `swarm`، `swarm-node`، `manager-node`، `worker-node`، `control-plane`، `data-plane`

### `data/topics.json`

سطر سوم اضافه می‌شود، بعد از `architecture`:

```json
{ "id": "swarm", "fa": "داکر سوارم", "en": "Docker Swarm" }
```

### `data/swarm/categories.json`

فقط دستهٔ اول. بقیه در تسک‌های بعد اضافه می‌شوند:

```json
[
  { "id": "cluster", "file": "cluster.json", "fa": "کلاستر و گره", "en": "Cluster & Nodes" }
]
```

### مدخل‌ها

**`swarm`** — سوارم / Swarm · tags: `cluster` `node` · related: `swarm-node`، `manager-node`، `control-plane`، `data-plane`
بدنه: سوارم حالتی از خودِ موتور داکر است که چند ماشین را به یک کلاستر منطقی تبدیل می‌کند و وضعیت مطلوب را روی آن نگه می‌دارد. مثال بد: سه VPS در سه کشور که روی هرکدام جدا `docker compose up` زده شده — هیچ‌کس نمی‌داند چه چیزی کجا اجرا می‌شود، افتادن یکی یعنی افتادن آن بخش سرویس، و بالا آوردن دوباره‌اش کار دستی است. مکانیزم: سوارم سرور جدا یا باینری جدا نیست؛ همان `dockerd` است با یک حالت اضافه، و کلاستر از خود گره‌ها ساخته می‌شود. جدول: قبل و بعد از سوارم برای پنج کار روزمره (بالا آوردن، شمردن نمونه‌ها، جایگزینی گرهٔ افتاده، انتشار پورت، به‌روزرسانی نسخه). ابهامی که صریح رفع می‌شود: «Docker Swarm» امروز یعنی swarm mode داخل موتور داکر، نه آن پروژهٔ جدای پیش از نسخهٔ ۱.۱۲ که اسم مشابهی داشت.
دیاگرام: سه ماشین مستقل در برابر همان سه ماشین به‌عنوان یک کلاستر · **جدول تصمیم**: چه چیزی را سوارم می‌داند و چه چیزی را نمی‌داند.
مثال: `docker swarm init` و بعد خروجی `docker node ls` با سه سطر.

**`swarm-node`** — گره / Node · tags: `node` `cluster` · related: `swarm`، `manager-node`، `worker-node`، `data-plane`
بدنه: هر ماشینی که موتور داکرش عضو سوارم شده یک گره است — یک ماشین، یک گره، هرچند کانتینر که رویش باشد. مکانیزم: گره هم‌زمان واحد **عضویت** است و واحد **شکست**؛ همین دوگانگی است که بعداً تفاوت نمونه و گره را مهم می‌کند. جدول: ماشین، گره، کانتینر — کدام واحد چیست. دام رایج: «سه نمونه دارم پس تحمل خرابی دارم»، در حالی که هر سه ممکن است روی یک گره باشند. ابهام: عضویت گره ربطی به قدرت سخت‌افزارش ندارد؛ یک VPS کوچک و یک سرور بزرگ هر دو دقیقاً یک گره‌اند.
دیاگرام: سه ماشین که هرکدام یک موتور داکر دارند و یک عضویت مشترک · نمودار «یک گره افتاد» با شمارش آنچه با آن می‌رود.
مثال: خروجی `docker node ls` با ستون‌های `HOSTNAME`، `STATUS`، `AVAILABILITY`، `MANAGER STATUS`.

**`manager-node`** — گره مدیر / Manager Node · tags: `node` `cluster` · related: `swarm-node`، `worker-node`، `control-plane`، `data-plane`
بدنه: مدیر گره‌ای است که علاوه بر اجرای کار، صفحهٔ کنترل را هم نگه می‌دارد: وضعیت کلاستر را می‌داند، تصمیم می‌گیرد، و API مدیریتی را جواب می‌دهد. مثال بد: کلاستری که تنها مدیرش همان گرهی است که سنگین‌ترین سرویس رویش اجرا می‌شود — وقتی آن سرویس حافظه را می‌بلعد، کلاستر هم بی‌مغز می‌شود. مکانیزم: مدیر بودن یک **نقش** است نه یک نوع ماشین؛ `docker node promote` و `demote` همان لحظه نقش را عوض می‌کنند. جدول: چه کاری فقط از مدیر برمی‌آید. دام: همهٔ گره‌ها را مدیر کردن به این تصور که «هرچه بیشتر بهتر».
دیاگرام: مدیر و دو کارگر، با پیکان دستورهای مدیریتی که فقط به مدیر می‌رسند · **جدول نقش‌ها**.
مثال: `docker node promote italy` و پیام خطای اجرای `docker service ls` روی یک کارگر.

**`worker-node`** — گره کارگر / Worker Node · tags: `node` `cluster` · related: `manager-node`، `swarm-node`، `data-plane`
بدنه: کارگر فقط تسک اجرا می‌کند و هیچ تصمیمی نمی‌گیرد. مکانیزم: روی کارگر یک agent می‌نشیند که از مدیر تسک می‌گیرد و وضعیتش را گزارش می‌دهد؛ همین و بس. مثال بد: SSH زدن به کارگر برای دیدن وضعیت سرویس و گرفتن `This node is not a swarm manager`. جدول: کدام دستور روی کارگر کار می‌کند و کدام نه. ابهام: کارگر «کم‌اهمیت‌تر» نیست — همهٔ ترافیک واقعی آنجاست؛ فقط تصمیم نمی‌گیرد.
دیاگرام: **جدول دستورها** با دو ستون مدیر/کارگر · یک گره کارگر با agent و کانتینرها.
مثال: خروجی `docker node ls` روی کارگر (خطا) در برابر همان روی مدیر.

**`control-plane`** — صفحهٔ کنترل / Control Plane · tags: `cluster` `service` · related: `data-plane`، `manager-node`، `swarm`
بدنه: صفحهٔ کنترل مجموعهٔ اجزایی است که **تصمیم می‌گیرند** چه چیزی باید کجا اجرا شود. مکانیزم: زنجیره‌ای است از API که درخواست را می‌گیرد، انبارهٔ وضعیت که آن را ثبت می‌کند، زمان‌بند که جا انتخاب می‌کند، و توزیع‌کننده که به گره می‌رساند. جدول: هر جزء چه ورودی می‌گیرد و چه خروجی می‌دهد. دام: «صفحهٔ کنترل مغز سیستم است» گفتن و همان‌جا رها کردن — بدون شکافتن این زنجیره، هیچ‌کدام از رفتارهای بعدی سوارم قابل پیش‌بینی نیست. ابهام: صفحهٔ کنترل یک فرایند جدا نیست، بخشی از همان `dockerd` روی گره‌های مدیر است.
دیاگرام: زنجیرهٔ API → انبار → زمان‌بند → توزیع‌کننده · **خط زمانی** یک درخواست از لحظهٔ `docker service create` تا اجرای کانتینر.
مثال: `docker service create` و بعد خروجی `docker service ps` که همان تصمیم را نشان می‌دهد.

**`data-plane`** — صفحهٔ داده / Data Plane · tags: `cluster` `network` · related: `control-plane`، `worker-node`، `swarm-node`
بدنه: صفحهٔ داده جایی است که کانتینر واقعی اجرا می‌شود و ترافیک واقعی رد می‌شود. مکانیزم و مهم‌ترین نکتهٔ عملی موضوع: **افتادن صفحهٔ کنترل، صفحهٔ داده را نمی‌خواباند.** اگر همهٔ مدیرها بمیرند، کانتینرهای در حال اجرا سر جایشان می‌مانند و به درخواست‌ها جواب می‌دهند؛ چیزی که از دست می‌رود توانِ **تغییر** است، نه توانِ **سرویس دادن**. جدول: هر خرابی کدام صفحه را می‌زند و کاربر نهایی چه می‌بیند. دام: هول کردن سر از دست رفتن حد نصاب، در حالی که سایت هنوز بالاست.
دیاگرام: **جدول خرابی** — سطر خرابی، ستون «کاربر چه می‌بیند» و «اپراتور چه می‌بیند» · دو لایهٔ روی هم با ترافیک کاربر که فقط از لایهٔ پایین رد می‌شود.
مثال: خروجی `curl` موفق در کنار خطای `docker service ls` — هم‌زمان، روی یک کلاستر.

### مرحلهٔ نقشه

```json
{
  "id": "cluster-basics",
  "fa": {
    "title": "کلاستر چیست",
    "why": "پیش از هر Service و Task: سوارم اصلاً چه چیزی را از چند ماشین می‌سازد"
  },
  "en": {
    "title": "What a cluster is",
    "why": "Before any service or task: what Swarm actually makes out of several machines"
  },
  "entries": ["swarm", "swarm-node", "manager-node", "worker-node", "control-plane", "data-plane"]
}
```

- [ ] **Step 1: پوشهٔ موضوع را بساز و سطر `swarm` را به `data/topics.json` اضافه کن**
- [ ] **Step 2: `categories.json` را با دستهٔ `cluster` بساز، و شش مدخل را در `entries/cluster.json` بنویس**
- [ ] **Step 3: `node --test` → باید قرمز شود** با «این مدخل‌ها در هیچ مرحله‌ای نیستند: swarm, swarm-node, manager-node, worker-node, control-plane, data-plane»
- [ ] **Step 4: مرحلهٔ `cluster-basics` را به `roadmap.json` اضافه کن**
- [ ] **Step 5: `node --test` → باید سبز شود**
- [ ] **Step 6: `node serve.js` و `#/self-test` → همه صفر؛ سوییچ موضوع بین هر سه موضوع در هر دو زبان کار کند؛ `git diff --stat` چیزی زیر `assets/` یا `test/` ندارد**
- [ ] **Step 7: کامیت**

```bash
git add data/topics.json data/swarm
git commit -m "feat: open the Docker Swarm topic with the cluster itself

Six entries for what a swarm is made of. The one that matters most is
the data plane: losing every manager costs you the ability to change
the cluster, not the ability to serve traffic, and knowing that is the
difference between a calm incident and a panicked one."
```

---

## Task 2: مرحلهٔ ۲ — کلاستری که سرِ پا می‌ماند (۵ مدخل)

**Files:**
- Modify: `data/swarm/entries/cluster.json` (پنج مدخل اضافه، جمع ۱۱)
- Modify: `data/swarm/roadmap.json`
- Modify: `data/architecture/entries/distributed.json` (فقط `related` مدخل `leader-election`)
- Modify: `data/crypto/entries/consensus.json` (فقط `related` مدخل `consensus`)

**Interfaces:**
- Consumes: `swarm`، `swarm-node`، `manager-node`، `worker-node`، `control-plane`، `data-plane`
- Produces: `join-token`، `swarm-tls`، `raft`، `quorum`، `control-plane-ha`

### مدخل‌ها

**`join-token`** — توکن پیوستن / Join Token · tags: `cluster` `security` · related: `swarm`، `manager-node`، `worker-node`، `swarm-tls`
بدنه: توکن پیوستن رشته‌ای است که یک ماشین با آن ثابت می‌کند حق دارد عضو این کلاستر شود، و هم‌زمان تعیین می‌کند با چه نقشی عضو شود. مکانیزم: دو توکن جدا وجود دارد — یکی برای کارگر و یکی برای مدیر — و همین است که «چطور ماشین دوم مدیر شود» را جواب می‌دهد. مثال بد: توکن مدیر که در یک README تیمی چسبانده شده؛ هرکس آن را داشته باشد می‌تواند مدیر شود، یعنی می‌تواند هر چیزی را روی کلاستر اجرا کند. جدول: دو توکن، دو نقش، دو سطح خطر. دام: تصور اینکه توکن یک‌بارمصرف است. ابهام: توکن قابل چرخاندن است و چرخاندنش عضوهای فعلی را بیرون نمی‌اندازد.
دیاگرام: **جدول دو توکن** با ستون «اگر لو برود چه می‌شود» · یک ماشین که با توکن به کلاستر می‌پیوندد.
مثال: خروجی `docker swarm join-token worker` و دستور `join` که می‌دهد، بعد `docker swarm join-token --rotate worker`.

**`swarm-tls`** — گواهی و اعتماد در سوارم / Swarm mTLS · tags: `security` `cluster` · related: `join-token`، `control-plane`، `manager-node`
بدنه: وقتی گره‌ای می‌پیوندد، سوارم برایش گواهی صادر می‌کند و از آن به بعد همهٔ ترافیک صفحهٔ کنترل با TLS دوطرفه رمز و احراز می‌شود — بدون اینکه کسی چیزی پیکربندی کرده باشد. مکانیزم: مدیرِ رهبر نقش CA را دارد، هر گره گواهی با نقشش می‌گیرد، و گواهی‌ها به‌صورت خودکار می‌چرخند. مثال بد: فرض اینکه چون همه‌چیز داخل یک VPC است رمزنگاری لازم نیست — در حالی که گره‌های این موضوع اصولاً در سه کشورند و از اینترنت عمومی رد می‌شوند. جدول: چه ترافیکی رمز است و چه ترافیکی نه (نکتهٔ مهم: ترافیک بین کانتینرها روی شبکهٔ روپوش به‌طور پیش‌فرض رمز **نیست**). دام: یکی گرفتن «امن بودن صفحهٔ کنترل» با «امن بودن ترافیک برنامه».
دیاگرام: **جدول رمزنگاری** با سه سطر ترافیک و ستون «پیش‌فرض» · چرخهٔ صدور و چرخش گواهی.
مثال: `docker swarm ca --rotate` و بخش گواهی از خروجی `docker info`.

**`raft`** — رفت / Raft · tags: `cluster` `failure` · related: `quorum`، `control-plane`، `control-plane-ha`، `leader-election`، `consensus`، `strong-consistency`
بدنه: رفت الگوریتمی است که چند مدیر با آن روی یک نسخهٔ واحد از وضعیت کلاستر توافق می‌کنند. مکانیزم: یک رهبر انتخاب می‌شود، هر تغییر اول به لاگ او می‌رود، بعد به اکثریت تکثیر می‌شود، و تنها آن‌وقت اعمال‌شده حساب می‌شود. مثال بد: کلاستری با دو مدیر که هر دو خودشان را رهبر بدانند و دو تصمیم متفاوت ثبت کنند — دقیقاً همان چیزی که رفت با شرط اکثریت جلویش را می‌گیرد. جدول: نقش‌های رفت (رهبر، پیرو، نامزد) و کاری که هرکدام می‌کند. اینجا صریح به مدخل انتخاب رهبر و مدخل اجماع لینک داده می‌شود؛ آن دو مفهوم عمومی‌اند و رفت پیاده‌سازی مشخصی است که سوارم به کار می‌برد. ابهام: رفت وضعیت **کلاستر** را تکثیر می‌کند، نه دادهٔ برنامه را.
دیاگرام: **خط زمانی** یک نوشتن از رهبر تا تأیید اکثریت · سه مدیر با لاگ‌های هم‌تراز.
مثال: خروجی `docker node ls` با ستون `MANAGER STATUS` که `Leader` و `Reachable` نشان می‌دهد.

**`quorum`** — حد نصاب / Quorum · tags: `cluster` `failure` · related: `raft`، `control-plane-ha`، `manager-node`، `bft`، `availability`
بدنه: حد نصاب کمترین تعداد مدیری است که باید در دسترس باشند تا کلاستر بتواند تصمیم تازه ثبت کند: `(N / 2) + 1`. مکانیزم: چرا اکثریت — چون دو گروهِ اقلیت هم‌زمان نمی‌توانند هر دو اکثریت داشته باشند، و همین جلوی دو-رهبری را می‌گیرد. جدول (ستون آخرش مهم‌ترین است): تعداد مدیر، حد نصاب، چند تا می‌توانند بیفتند — ۱→۱→۰، ۲→۲→۰، ۳→۲→۱، ۴→۳→۱، ۵→۳→۲. دام: چهار مدیر گذاشتن به تصور اینکه از سه تا بهتر است، در حالی که تحملش دقیقاً همان یکی است و فقط هزینهٔ هماهنگی بالا رفته. ابهام: از دست رفتن حد نصاب یعنی کلاستر «فقط-خواندنی» می‌شود، نه اینکه سرویس‌ها بخوابند.
دیاگرام: **جدول حد نصاب** با پنج سطر بالا · دو نیمهٔ جداشدهٔ کلاستر که فقط یکی‌شان اکثریت دارد.
مثال: خروجی `docker service ls` که با `context deadline exceeded` می‌ایستد در کنار `curl` موفق به همان سرویس.

**`control-plane-ha`** — دسترس‌پذیری صفحهٔ کنترل / Control-Plane HA · tags: `cluster` `failure` · related: `quorum`، `raft`، `manager-node`، `availability`
بدنه: تصمیم عملی‌ای که از رفت و حد نصاب بیرون می‌آید: چند مدیر بگذاریم و کجا. مکانیزم: تعداد فرد، پخش‌شده روی حوزه‌های خرابی مستقل؛ و سقفی که کمتر گفته می‌شود — هرچه مدیر بیشتر، هر نوشتن باید به تأیید افراد بیشتری برسد، پس صفحهٔ کنترل کندتر می‌شود. جدول: یک، سه، پنج و هفت مدیر با ستون‌های تحمل خرابی، هزینهٔ هماهنگی، و «برای چه اندازه کلاستری». مثال بد: پنج مدیر روی پنج ماشین در یک دیتاسنتر، که در برابر قطعی برق آن دیتاسنتر صفر تحمل دارد. دام: مدیرها را سنگین بار کردن؛ توصیهٔ عملی این است که مدیرِ کلاستر جدی، سرویس سنگین اجرا نکند.
دیاگرام: **ماتریس** تعداد مدیر × تحمل خرابی × هزینه · سه مدیر پخش‌شده در سه حوزهٔ خرابی.
مثال: `docker node update --availability drain germany` روی یک مدیر، با توضیح انگلیسی اینکه چرا.

### مرحلهٔ نقشه

```json
{
  "id": "staying-up",
  "fa": {
    "title": "کلاستری که سرِ پا می‌ماند",
    "why": "صفحهٔ کنترل بدون Raft فقط یک اسم است؛ اینجا معلوم می‌شود چطور تصمیم می‌گیرد و کِی نمی‌تواند"
  },
  "en": {
    "title": "A cluster that stays up",
    "why": "The control plane is just a name until you see how it decides — and when it cannot"
  },
  "entries": ["join-token", "swarm-tls", "raft", "quorum", "control-plane-ha"]
}
```

### پل دوطرفه

- `data/architecture/entries/distributed.json` → مدخل `leader-election`: `raft` به `related` اضافه شود.
- `data/crypto/entries/consensus.json` → مدخل `consensus`: `raft` به `related` اضافه شود.
- `data/crypto/entries/consensus.json` → مدخل `bft`: `quorum` به `related` اضافه شود.

به بدنه، مثال یا SVG هیچ مدخل موجودی دست زده نمی‌شود.

- [ ] **Step 1: پنج مدخل را به `cluster.json` اضافه کن**
- [ ] **Step 2: `node --test` → باید قرمز شود** با «این مدخل‌ها در هیچ مرحله‌ای نیستند: join-token, swarm-tls, raft, quorum, control-plane-ha»
- [ ] **Step 3: مرحلهٔ `staying-up` را به `roadmap.json` اضافه کن و سه پل بالا را ببند**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر؛ `git diff --stat` چیزی زیر `assets/` یا `test/` ندارد**
- [ ] **Step 6: کامیت**

```bash
git add data/swarm data/architecture data/crypto
git commit -m "feat: explain what keeps a swarm's control plane alive

Raft, quorum and the manager-count table. Four managers tolerate
exactly as many failures as three and pay more for it, which is the
kind of thing you want to know before you build the cluster rather
than during the incident."
```

---

## Task 3: مرحلهٔ ۳ — واحد کار (۸ مدخل)

دستهٔ `workload` و دستهٔ `delivery` هر دو اینجا باز می‌شوند. `delivery` عمداً فقط با دو مدخل شروع می‌شود و در تسک‌های ۱۱ تا ۱۳ پر می‌شود؛ دستهٔ نیمه‌پر یک فایل معتبر است.

**Files:**
- Modify: `data/swarm/categories.json` (دو دستهٔ `workload` و `delivery`)
- Create: `data/swarm/entries/workload.json` (شش مدخل)
- Create: `data/swarm/entries/delivery.json` (دو مدخل)
- Modify: `data/swarm/roadmap.json`

**Interfaces:**
- Consumes: `swarm`، `swarm-node`، `manager-node`، `control-plane`، `data-plane`
- Produces: `service`، `task`، `replica`، `service-spec`، `stack`، `stack-file`، `replicated-service`، `global-service`

### دستهٔ تازه

```json
{ "id": "workload", "file": "workload.json", "fa": "سرویس و تسک", "en": "Services & Tasks" },
{ "id": "delivery", "file": "delivery.json", "fa": "تحویل", "en": "Delivery & CI/CD" }
```

### مدخل‌ها

**`service`** — سرویس / Service · tags: `service` `delivery` · related: `task`، `replica`، `service-spec`، `stack`، `microservices`
بدنه: سرویس تعریف منطقی یک برنامه روی کلاستر است — چه ایمیجی، با چه تنظیماتی، و چند نمونه — نه خودِ کانتینر. مثال بد: `docker run` روی یک گره و بعد تعجب از اینکه چرا وقتی آن گره افتاد چیزی جایش نیامد؛ کانتینر تنها هیچ‌کس را ندارد که برایش تصمیم بگیرد. مکانیزم: سرویس یک آرزوست، تسک تحقق آن. جدول: `docker run` در برابر `docker service create` در پنج ستون رفتاری. ابهام: سرویس اینجا با «سرویس» در میکروسرویس یکی نیست؛ آنجا مرز طراحی است و اینجا شیء اجرایی سوارم.
دیاگرام: سرویس با سه تسک زیرش · **جدول مقایسه** run در برابر service create.
مثال: `docker service create --name api --replicas 3 registry.example.com/notification-api:v1.4.2`.

**`task`** — تسک / Task · tags: `service` · related: `service`، `replica`، `swarm-node`
بدنه: تسک یک نمونهٔ مشخص از اجرای سرویس است و **واحد زمان‌بندی** سوارم؛ زنجیره‌اش این است: سرویس ← تسک ← کانتینر. مکانیزم: تسک یک‌بارمصرف است — اگر کانتینرش بمیرد، همان تسک دوباره اجرا نمی‌شود، تسک تازه‌ای با شناسهٔ تازه ساخته می‌شود. همین است که چرا `docker service ps` سطرهای `Shutdown` قدیمی را نگه می‌دارد و آن سطرها آشغال نیستند، تاریخچه‌اند. مثال بد: خواندن شمار سطرهای `docker service ps` به‌عنوان تعداد نمونه‌های در حال اجرا. جدول: تسک در برابر کانتینر در برابر نمونه.
دیاگرام: زنجیرهٔ سرویس ← تسک ← کانتینر · **خط زمانی** یک تسک که می‌میرد و تسک تازه‌ای جایش می‌آید، با شناسه‌های متفاوت.
مثال: خروجی `docker service ps api` با دو سطر `Shutdown` و سه سطر `Running`.

**`replica`** — نمونه / Replica · tags: `service` `cluster` · related: `task`، `service`، `swarm-node`، `replicated-service`
بدنه: نمونه یعنی تعداد تسک‌هایی که سوارم باید از یک سرویس زنده نگه دارد. مکانیزم و مهم‌ترین جملهٔ این مدخل: **نمونه با گره یکی نیست.** سه نمونه ممکن است هر سه روی یک گره باشند؛ آن‌وقت در برابر مرگ فرایند تحمل داری و در برابر مرگ ماشین هیچ. جدول: سه سناریوی توزیع سه نمونه روی سه گره، دو گره، و یک گره، با ستون «با افتادن یک ماشین چه می‌ماند». دام: عدد نمونه را بالا بردن به‌عنوان پاسخ به هر مسئلهٔ دسترس‌پذیری.
دیاگرام: **ماتریس توزیع** سه نمونه × سه چیدمان × نتیجهٔ خرابی · سه نمونهٔ روی یک گره با یک ضربدر روی کل گره.
مثال: قطعهٔ `deploy: replicas: 3` در کنار خروجی `docker service ps` که نشان می‌دهد هر سه روی `germany` نشسته‌اند.

**`service-spec`** — مشخصات سرویس / Service Spec · tags: `service` `delivery` · related: `service`، `stack-file`، `task`
بدنه: مشخصات سرویس آن سند کاملی است که سوارم برای هر سرویس نگه می‌دارد: ایمیج، تعداد نمونه، شبکه، متغیر محیطی، رازها، قیدها، و سیاست به‌روزرسانی. مکانیزم — و این قلب رفتار CI/CD در این موضوع است: سوارم برای تصمیم به‌روزرسانی، **مشخصات جدید را با مشخصات فعلی مقایسه می‌کند**؛ اگر یک بایت فرق داشته باشد به‌روزرسانی راه می‌افتد و اگر عین هم باشند هیچ اتفاقی نمی‌افتد، هرچند بار که `deploy` بزنی. مثال بد: تگ ثابت `latest` که مشخصات را عوض نمی‌کند، پس ایمیج تازه در رجیستری هست و کلاستر دست نمی‌خورد. جدول: کدام تغییر مشخصات باعث ساخت تسک تازه می‌شود و کدام نه.
دیاگرام: دو مشخصات کنار هم با فیلد متفاوتِ برجسته · **جدول تغییرها** با ستون «تسک تازه می‌سازد؟».
مثال: `docker service inspect --pretty api` و بعد همان با تگ عوض‌شده.

**`stack`** — استک / Stack · tags: `delivery` `service` · related: `stack-file`، `service`، `service-spec`
بدنه: استک مجموعه‌ای از سرویس‌ها، شبکه‌ها، رازها و پیکربندی‌هاست که با یک نام مدیریت می‌شوند. مکانیزم: نام استک به همه‌چیزش پیشوند می‌دهد (`notification_api`)، و همین پیشوند است که بعداً `docker service ls` را قابل خواندن می‌کند و اجازه می‌دهد کل مجموعه با یک دستور برداشته شود. مثال بد: ده سرویس ساخته‌شده با `docker service create` که هیچ چیزی به هم وصلشان نمی‌کند و پاک کردنشان یعنی ده دستور و یادآوری ده اسم. جدول: چه چیزهایی داخل یک استک می‌آیند.
دیاگرام: یک استک با سه سرویس و یک شبکه در یک قاب · **جدول نام‌گذاری** پیشوندها.
مثال: `docker stack ls` و `docker stack services notification`.

**`stack-file`** — فایل استک / Stack File · tags: `delivery` `service` · related: `stack`، `service-spec`، `service`
بدنه: فایل استک همان `stack.yml` است: بیان **اعلانی** آنچه باید روی کلاستر باشد. این مدخل عمداً زود می‌آید، چون از این‌جا به بعد تقریباً هر مثالِ این موضوع یک قطعه از همین فایل است. مکانیزم: فایل، مشخصات سرویس را می‌سازد؛ بخش `deploy:` تنها بخشی است که فقط در سوارم معنی دارد و `docker compose` آن را نادیده می‌گیرد. جدول: کلیدهای اصلی فایل و اینکه هرکدام کدام قسمت مشخصات را پر می‌کنند. دام: تصور اینکه فایل حتماً باید در ریپوی جدا باشد — سه جای معتبر دارد: کنار کد، ریپوی جدا، یا روی خود سرور.
دیاگرام: فایل → مشخصات → سرویس → تسک · **جدول کلیدها**.
مثال: یک `stack.yml` کامل و کوتاه با `services`، `image`، `deploy.replicas`.

**`replicated-service`** — سرویس تکثیرشده / Replicated Service · tags: `service` `scheduling` · related: `global-service`، `replica`، `service`
بدنه: حالت پیش‌فرض: تو عدد می‌دهی و سوارم همان‌قدر تسک نگه می‌دارد، هرجا که جا باشد. مکانیزم: عدد ثابت است و جای اجرا متغیر — که دقیقاً برعکس حالت سراسری است. جدول: کِی این حالت درست است. دام: استفاده از این حالت برای کارگزارهایی که باید روی هر ماشین یکی باشند (مثل جمع‌کنندهٔ لاگ)، که با اضافه شدن گرهٔ تازه پوشش نمی‌دهد.
دیاگرام: سه تسک روی دو گره از سه گره · **جدول انتخاب حالت**.
مثال: `mode: replicated` و `replicas: 3` در `stack.yml`.

**`global-service`** — سرویس سراسری / Global Service · tags: `service` `scheduling` · related: `replicated-service`، `swarm-node`، `service`
بدنه: در حالت سراسری عدد نمی‌دهی؛ سوارم روی **هر** گرهِ واجد شرایط دقیقاً یک تسک می‌گذارد، و گرهی که فردا اضافه شود خودبه‌خود یکی می‌گیرد. مکانیزم: تعداد تسک تابع تعداد گره است نه یک عدد ثابت. مثال بد: `replicas: 3` برای عامل پایش روی کلاستر سه‌گره‌ای، که با اضافه شدن گرهٔ چهارم یک ماشین بی‌پایش می‌ماند و هیچ خطایی هم نمی‌دهد. جدول: تکثیرشده در برابر سراسری در چهار ستون. ابهام: قیدهای جای‌گذاری روی سرویس سراسری هم کار می‌کنند و «هر گره» یعنی هر گرهِ واجد شرایط.
دیاگرام: چهار گره که هرکدام یک تسک دارند و گرهٔ پنجم که تازه آمده و بلافاصله یکی می‌گیرد · **جدول مقایسهٔ دو حالت**.
مثال: `mode: global` برای یک عامل پایش در `stack.yml`.

### مرحلهٔ نقشه

```json
{
  "id": "unit-of-work",
  "fa": {
    "title": "واحد کار",
    "why": "سرویس یک آرزوست و تسک تحقق آن؛ تا این دو از هم جدا نشوند هیچ رفتاری قابل پیش‌بینی نیست"
  },
  "en": {
    "title": "The unit of work",
    "why": "A service is a wish and a task is its fulfilment; nothing else is predictable until those two come apart"
  },
  "entries": ["service", "task", "replica", "service-spec", "stack", "stack-file", "replicated-service", "global-service"]
}
```

- [ ] **Step 1: دو دستهٔ `workload` و `delivery` را به `categories.json` اضافه کن و دو فایل مدخل را بساز**
- [ ] **Step 2: شش مدخل `workload` و دو مدخل `delivery` را بنویس**
- [ ] **Step 3: `node --test` → باید قرمز شود** با «این مدخل‌ها در هیچ مرحله‌ای نیستند: service, task, replica, service-spec, stack, stack-file, replicated-service, global-service»
- [ ] **Step 4: مرحلهٔ `unit-of-work` را به `roadmap.json` اضافه کن**
- [ ] **Step 5: `node --test` → باید سبز شود**
- [ ] **Step 6: `node serve.js` و `#/self-test` → همه صفر؛ `git diff --stat` چیزی زیر `assets/` یا `test/` ندارد**
- [ ] **Step 7: کامیت**

```bash
git add data/swarm
git commit -m "feat: separate the service from the task that fulfils it

Also brings the stack file forward from the end of the course notes,
because every example from here on is a fragment of one and entries
may not cite something the reader has not reached yet."
```

---

## Task 4: مرحلهٔ ۴ — قرارداد سوارم (۳ مدخل)

**Files:**
- Modify: `data/swarm/entries/workload.json` (سه مدخل اضافه، جمع ۹)
- Modify: `data/swarm/roadmap.json`

**Interfaces:**
- Consumes: `service`، `task`، `replica`، `service-spec`، `stack-file`، `control-plane`
- Produces: `desired-state`، `reconciliation`، `self-healing`

### مدخل‌ها

**`desired-state`** — وضعیت مطلوب / Desired State · tags: `service` `change` · related: `reconciliation`، `self-healing`، `service-spec`، `stack-file`
بدنه: وضعیت مطلوب یعنی تو **چه چیزی** می‌خواهی، نه **چطور** به آن برسی؛ و همین یک جمله تفاوت سوارم را با اسکریپت استقرار می‌سازد. مکانیزم: تو مطلوب را اعلام می‌کنی، سوارم واقعی را با آن مقایسه می‌کند و فاصله را پر می‌کند؛ دستور تو یک بار اجرا نمی‌شود، یک قرارداد دائمی می‌شود. مثال بد: اسکریپت `deploy.sh` که کانتینر را بالا می‌آورد و تمام — ساعت سه بامداد که کانتینر می‌میرد، اسکریپت خواب است. جدول: دستوری در برابر اعلانی برای پنج اتفاق (مرگ کانتینر، مرگ گره، تغییر نسخه، تغییر تعداد، ری‌استارت سرور). ابهام: مطلوب فقط دربارهٔ تعداد نیست؛ ایمیج، شبکه و راز هم بخشی از آن‌اند.
دیاگرام: **حلقه** مطلوب ← مقایسه ← اقدام ← واقعی، که به مقایسه برمی‌گردد · جدول دستوری/اعلانی.
مثال: `replicas: 3` در `stack.yml` در کنار یک `deploy.sh` هم‌کار، برای مقایسه.

**`reconciliation`** — همگرایی / Reconciliation · tags: `service` `change` · related: `desired-state`، `self-healing`، `control-plane`، `task`
بدنه: همگرایی همان حلقه‌ای است که وضعیت مطلوب را به وضعیت واقعی تبدیل می‌کند: مشاهده، مقایسه، اقدام، تکرار. مکانیزم: حلقه **رویدادمحور** است نه زمان‌بندی‌شده؛ هر تغییر در وضعیت گره یا تسک آن را بیدار می‌کند. نکتهٔ مهم: همگرایی تضمین **تلاش** است نه تضمین **موفقیت** — اگر جایی برای تسک تازه نباشد، سوارم بی‌وقفه تلاش می‌کند و کلاستر در وضعیت ناهمگرا می‌ماند بدون اینکه چیزی فریاد بزند. جدول: سه حالت — همگرا، در حال همگرایی، گیرکرده — و اینکه هرکدام در `docker service ls` چه شکلی‌اند.
دیاگرام: **نمودار حالت** با سه حالت بالا و شرط گذار · حلقهٔ مشاهده-مقایسه-اقدام.
مثال: خروجی `docker service ls` با ستون `REPLICAS` که `2/3` نشان می‌دهد.

**`self-healing`** — خودترمیمی / Self-Healing · tags: `failure` `service` · related: `desired-state`، `reconciliation`، `task`، `replica`
بدنه: خودترمیمی نتیجهٔ دیدنیِ همگرایی است: چیزی می‌میرد و بی‌دخالت کسی جایش پر می‌شود. مکانیزم: سوارم کانتینر مرده را **زنده نمی‌کند**؛ تسک تازه‌ای می‌سازد که ممکن است روی گرهٔ دیگری بنشیند، با شناسهٔ تازه و بدون هیچ‌چیز از حالتِ قبلی. مثال بد: سرویسی که فایل موقتش را روی دیسک محلی می‌گذارد و بعد از خودترمیمی روی گرهٔ دیگر بیدار می‌شود و فایلش نیست. جدول: چه چیزی خودترمیم می‌شود و چه چیزی نه — فرایند مرده آری، دادهٔ از دست رفته نه، برنامه‌ای که Running است ولی جواب نمی‌دهد هم نه (که مقدمهٔ بررسی سلامت است). دام: خودترمیمی را با دسترس‌پذیری بالا یکی گرفتن.
دیاگرام: **خط زمانی** مرگ تا جایگزینی، با ستون شناسهٔ تسک که عوض می‌شود · جدول «چه چیزی ترمیم می‌شود».
مثال: `docker service ps api` قبل و بعد از `docker kill` روی یکی از کانتینرها.

### مرحلهٔ نقشه

```json
{
  "id": "the-contract",
  "fa": {
    "title": "قرارداد سوارم",
    "why": "تنها ایده‌ای که اگر بگیری بقیهٔ رفتار سوارم قابل حدس می‌شود"
  },
  "en": {
    "title": "Swarm's contract",
    "why": "The one idea that, once you have it, makes the rest of Swarm's behaviour guessable"
  },
  "entries": ["desired-state", "reconciliation", "self-healing"]
}
```

- [ ] **Step 1: سه مدخل را به `workload.json` اضافه کن**
- [ ] **Step 2: `node --test` → باید قرمز شود** با «این مدخل‌ها در هیچ مرحله‌ای نیستند: desired-state, reconciliation, self-healing»
- [ ] **Step 3: مرحلهٔ `the-contract` را به `roadmap.json` اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 6: کامیت**

```bash
git add data/swarm
git commit -m "feat: state the contract Swarm actually offers

Desired state, the loop that pursues it, and the healing you see as a
result. The loop guarantees effort, not success — a service stuck at
2/3 is converging forever and nothing shouts about it."
```

---

## Task 5: مرحلهٔ ۵ — کجا اجرا شود (۷ مدخل)

**Files:**
- Modify: `data/swarm/entries/workload.json` (پنج مدخل اضافه، جمع ۱۴ — کامل)
- Modify: `data/swarm/entries/cluster.json` (دو مدخل اضافه، جمع ۱۳ — کامل)
- Modify: `data/swarm/roadmap.json`

**Interfaces:**
- Consumes: `task`، `replica`، `swarm-node`، `manager-node`، `desired-state`، `reconciliation`، `stack-file`
- Produces: `scheduler`، `node-label`، `placement-constraint`، `placement-preference`، `resource-reservation`، `resource-limit`، `node-availability`

### مدخل‌ها

**`scheduler`** — زمان‌بند / Scheduler · tags: `scheduling` `cluster` · related: `task`، `placement-constraint`، `resource-reservation`، `swarm-node`
بدنه: زمان‌بند تصمیم می‌گیرد هر تسک روی کدام گره بنشیند. مکانیزم سه‌مرحله‌ای: اول **فیلتر** (گره‌هایی که قید را برآورده نمی‌کنند یا منابع رزروشده را ندارند حذف می‌شوند)، بعد **رتبه‌بندی** میان بازمانده‌ها، بعد جای‌گذاری. مثال بد: انتظار توزیع مساوی از زمان‌بندی که رتبه‌بندی‌اش بر پایهٔ تعداد تسکِ همان سرویس است، نه بار واقعی CPU. جدول: زمان‌بند به چه چیزهایی نگاه می‌کند و به چه چیزهایی نگاه نمی‌کند — ستون دوم مهم‌تر است و شامل بار واقعی CPU، حافظهٔ آزاد لحظه‌ای، و سرعت شبکه است. ابهام: زمان‌بند تسک‌های در حال اجرا را جابه‌جا **نمی‌کند**؛ تصمیمش فقط لحظهٔ ساخت تسک است.
دیاگرام: قیف فیلتر ← رتبه‌بندی ← جای‌گذاری · **جدول «می‌بیند / نمی‌بیند»**.
مثال: خروجی `docker service ps` که نشان می‌دهد سه تسک روی دو گره نشسته‌اند، با توضیح انگلیسی چرایی.

**`node-label`** — برچسب گره / Node Label · tags: `cluster` `scheduling` · related: `placement-constraint`، `swarm-node`، `scheduler`
بدنه: برچسب یک جفت کلید-مقدار است که تو روی گره می‌گذاری تا بعداً بتوانی دربارهٔ آن گره حرف بزنی بدون اینکه اسمش را در فایل استک بنویسی. مکانیزم: برچسب در انبار وضعیت کلاستر می‌نشیند، پس عوض کردنش نیازی به دست زدن به آن ماشین ندارد. مثال بد: `constraints: [node.hostname == germany]` که استک را به یک ماشین مشخص می‌دوزد؛ روزی که germany عوض شود باید فایل استک را عوض کنی. جدول: برچسب گره در برابر برچسب موتور در برابر خصیصه‌های داخلی مثل `node.role` و `node.id`. دام: برچسب را به‌عنوان مستندسازی گذاشتن و بعد فراموش کردن که تصمیم زمان‌بندی به آن وابسته است.
دیاگرام: **جدول خصیصه‌ها** با ستون «چه کسی تعیینش می‌کند» · سه گره با برچسب‌های متفاوت.
مثال: `docker node update --label-add storage=true germany` و `docker node inspect`.

**`placement-constraint`** — قید جای‌گذاری / Placement Constraint · tags: `scheduling` `cluster` · related: `node-label`، `scheduler`، `placement-preference`، `swarm-node`
بدنه: قید یک شرط **سخت** است: گرهی که آن را برآورده نکند اصلاً کاندید نمی‌شود. مکانیزم: قید در مرحلهٔ فیلترِ زمان‌بند اعمال می‌شود، و اگر هیچ گرهی از فیلتر رد نشود تسک ساخته می‌شود ولی هرگز جای‌گذاری نمی‌شود — یعنی به‌جای خطا، سکوت. مثال بد: قید روی برچسبی که غلط تایپ شده؛ استک با موفقیت `deploy` می‌شود و سرویس تا ابد صفر نمونه دارد. جدول: عملگرها (`==`, `!=`) و خصیصه‌های پرکاربرد (`node.role`, `node.labels.*`, `node.hostname`). دام: قید گذاشتن جایی که ترجیح کافی بود، که تحمل خرابی را نابود می‌کند.
دیاگرام: فیلتر شدن سه گره به یکی · **جدول عملگرها**.
مثال: `placement: constraints: [node.labels.storage == true]` در `stack.yml`.

**`placement-preference`** — ترجیح جای‌گذاری / Placement Preference · tags: `scheduling` `failure` · related: `placement-constraint`، `scheduler`، `replica`
بدنه: ترجیح یک شرط **نرم** است: سوارم تلاش می‌کند تسک‌ها را بر اساس آن پخش کند، ولی اگر نشد باز هم اجرا می‌کند. مکانیزم: `spread` روی یک خصیصه (مثلاً برچسب `zone`) تسک‌ها را میان مقادیر آن خصیصه متعادل می‌کند — و این تنها ابزار خودِ سوارم برای اینکه سه نمونه هر سه در یک حوزهٔ خرابی نیفتند. جدول: قید در برابر ترجیح — چه وقت کدام، با ستون «اگر برآورده نشود چه می‌شود». مثال بد: تکیه بر «زمان‌بند خودش پخش می‌کند» بدون هیچ ترجیحی، و کشف چیدمان واقعی در شب حادثه.
دیاگرام: سه نمونه پخش‌شده روی سه حوزه در برابر هر سه در یکی · **جدول سخت/نرم**.
مثال: `preferences: [{ spread: node.labels.zone }]` در `stack.yml`.

**`resource-reservation`** — رزرو منابع / Resource Reservation · tags: `scheduling` `operations` · related: `resource-limit`، `scheduler`، `placement-constraint`
بدنه: رزرو اعلامِ نیاز است، برای زمان‌بندی: «این تسک بدون این مقدار CPU و حافظه جا نمی‌شود». مکانیزم: زمان‌بند رزروها را جمع می‌زند و گرهی را کاندید می‌کند که ظرفیت رزرونشدهٔ کافی داشته باشد — این حسابداری روی **اعداد اعلام‌شده** است، نه مصرف واقعی. مثال بد: رزرو ۴ گیگابایت برای سرویسی که ۲۰۰ مگابایت می‌خورد، که نیمی از کلاستر را روی کاغذ پر می‌کند در حالی که ماشین‌ها بیکارند. جدول: رزرو در برابر سقف در سه ستون (کِی اعمال می‌شود، چه چیزی را محدود می‌کند، اگر اشتباه باشد چه می‌شود). دام: رزرو بدون سقف، یا سقف بدون رزرو.
دیاگرام: **ماتریس** رزرو × سقف با چهار خانه و نتیجهٔ هرکدام · ظرفیت گره با بخش رزروشده.
مثال: `resources: reservations: { cpus: "0.5", memory: 256M }`.

**`resource-limit`** — سقف منابع / Resource Limit · tags: `operations` `scheduling` · related: `resource-reservation`، `task`، `swarm-node`
بدنه: سقف حدِ مصرف در زمان اجراست و کاری به زمان‌بندی ندارد. مکانیزم: سقف حافظه سخت است — عبور از آن یعنی کشته شدن فرایند توسط کرنل — و سقف CPU نرم است و فقط throttle می‌کند. مثال بد: یک سرویس بی‌سقف که حافظهٔ گره را می‌بلعد و باعث می‌شود کرنل سرویس‌های **دیگرِ** همان گره را بکشد؛ خرابی جایی ظاهر می‌شود که مقصر نیست. جدول: بدون سقف، سقف CPU، سقف حافظه — علامت هرکدام هنگام تخطی چیست. ابهام: سقف حافظه و رزرو حافظه دو عدد مستقل‌اند و برابر گذاشتنشان یک تصمیم است نه یک قاعده.
دیاگرام: **خط زمانی** مصرف حافظه تا برخورد به سقف و کشته شدن · نمودار throttle شدن CPU.
مثال: `resources: limits: { cpus: "1.0", memory: 512M }` و سطر `Shutdown  Failed  "task: non-zero exit (137)"` در خروجی `docker service ps`.

**`node-availability`** — دسترس‌پذیری گره / Node Availability · tags: `cluster` `operations` · related: `swarm-node`، `scheduler`، `manager-node`، `placement-constraint`
بدنه: هر گره یکی از سه حالت `active`، `pause` یا `drain` را دارد و این حالت به زمان‌بند می‌گوید با آن گره چه کند. مکانیزم: `pause` یعنی تسک تازه نگیر ولی تسک‌های فعلی بمانند؛ `drain` یعنی تسک تازه نگیر **و** تسک‌های فعلی را ببر جای دیگر. همین `drain` است که نگهداری بدون قطعی را ممکن می‌کند. مثال بد: ری‌بوت کردن گره بدون drain، که تسک‌ها را با قطعی می‌کشد به‌جای اینکه مرتب جابه‌جایشان کند. جدول: سه حالت × سه سؤال. دام: drain کردن گرهی که والیوم محلیِ یک سرویس حالت‌دار روی آن است.
دیاگرام: **نمودار حالت** سه‌حالته با دستور هر گذار · گرهی که تسک‌هایش در حال خروج‌اند.
مثال: `docker node update --availability drain italy` و خروجی `docker node ls` بعدش.

### مرحلهٔ نقشه

```json
{
  "id": "where-it-runs",
  "fa": {
    "title": "کجا اجرا شود",
    "why": "تصمیم جای‌گذاری، همان تصمیمی است که تحمل خرابی واقعی را می‌سازد یا از بین می‌برد"
  },
  "en": {
    "title": "Where it runs",
    "why": "Placement is the decision that either builds real fault tolerance or quietly destroys it"
  },
  "entries": ["scheduler", "node-label", "placement-constraint", "placement-preference", "resource-reservation", "resource-limit", "node-availability"]
}
```

- [ ] **Step 1: پنج مدخل را به `workload.json` و دو مدخل را به `cluster.json` اضافه کن**
- [ ] **Step 2: `node --test` → باید قرمز شود** با «این مدخل‌ها در هیچ مرحله‌ای نیستند: scheduler, node-label, placement-constraint, placement-preference, resource-reservation, resource-limit, node-availability»
- [ ] **Step 3: مرحلهٔ `where-it-runs` را به `roadmap.json` اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 6: کامیت**

```bash
git add data/swarm
git commit -m "feat: explain how Swarm picks a node

Filter, rank, place — and the column that matters is what the
scheduler does not look at. A constraint nobody can satisfy produces
silence, not an error: the service deploys fine and stays at zero."
```

---

## Task 6: مرحلهٔ ۶ — ترافیک چطور می‌رسد (۱۰ مدخل)

بزرگ‌ترین تسک این نقشه، و جایی که بیشترین جای خالی جزوه پر می‌شود: جزوه فقط Routing Mesh را دارد و هر چیزی که زیرش است — شبکهٔ روپوش، شبکهٔ ورودی، آی‌پی مجازی، DNS داخلی — ندارد، که Routing Mesh را به جادو تبدیل می‌کند.

**Files:**
- Modify: `data/swarm/categories.json` (دستهٔ `network`)
- Create: `data/swarm/entries/network.json` (ده مدخل — دسته یک‌جا کامل می‌شود)
- Modify: `data/swarm/roadmap.json`
- Modify: `data/architecture/entries/styles.json` (فقط `related` مدخل‌های `api-gateway` و `service-mesh`)

**Interfaces:**
- Consumes: `swarm`، `service`، `task`، `replica`، `global-service`، `swarm-node`، `control-plane`، `raft`
- Produces: `overlay-network`، `gossip`، `service-discovery`، `virtual-ip`، `dns-round-robin`، `ingress-network`، `published-port`، `routing-mesh`، `host-mode-publish`، `reverse-proxy`

### دستهٔ تازه

```json
{ "id": "network", "file": "network.json", "fa": "شبکه", "en": "Networking" }
```

### مدخل‌ها

**`overlay-network`** — شبکهٔ روپوش / Overlay Network · tags: `network` · related: `swarm`، `service-discovery`، `ingress-network`، `gossip`
بدنه: شبکهٔ روپوش یک شبکهٔ مجازی است که روی شبکهٔ واقعی بین گره‌ها کشیده می‌شود، طوری که کانتینرهای گره‌های مختلف همدیگر را انگار در یک LAN می‌بینند. مکانیزم: بسته‌ها در VXLAN کپسوله می‌شوند و از میان شبکهٔ واقعی رد می‌شوند؛ کانتینر چیزی از این کپسوله شدن نمی‌داند. مثال بد: تلاش برای وصل کردن دو سرویس با IP گره و پورت منتشرشده، وقتی هر دو در یک کلاسترند — که هم شکننده است هم بی‌دلیل از بیرون رد می‌شود. جدول: انواع شبکه در داکر (`bridge`, `host`, `overlay`, `ingress`) و اینکه هرکدام تا کجا می‌رسند. ابهام: ترافیک روپوش به‌طور پیش‌فرض **رمز نیست**؛ رمزنگاری یک گزینهٔ صریح است و هزینهٔ کارایی دارد.
دیاگرام: دو کانتینر روی دو کشور با یک شبکهٔ منطقی مشترک، و بستهٔ کپسوله‌شده زیرش · **جدول انواع شبکه**.
مثال: `docker network create -d overlay backend` و بخش `networks:` در `stack.yml`.

**`gossip`** — شایعه‌پراکنی / Gossip · tags: `network` `cluster` · related: `overlay-network`، `raft`، `control-plane`
بدنه: شایعه‌پراکنی روشی است که گره‌ها با آن اطلاعات شبکه — اینکه کدام کانتینر کجاست و چه IP ای دارد — را بین خودشان پخش می‌کنند، بدون اینکه از مدیر بپرسند. مکانیزم: هر گره هرچند وقت با چند همسایهٔ تصادفی حرف می‌زند؛ اطلاعات نمایی پخش می‌شود و سیستم به سازگاری نهایی می‌رسد. **تفاوت کلیدی با رفت**، که کل این مدخل برای همین وجود دارد: رفت وضعیت مدیریتی را با اکثریت و سازگاری قوی نگه می‌دارد؛ شایعه‌پراکنی وضعیت شبکه را در صفحهٔ داده با سازگاری نهایی پخش می‌کند. جدول: رفت در برابر شایعه — چه چیزی، بین چه کسانی، با چه تضمینی. دام: انتظار اینکه ثبت DNS یک تسک تازه در همان میلی‌ثانیه همه‌جا دیده شود.
دیاگرام: **جدول رفت/شایعه** · پخش نمایی در سه دور.
مثال: خروجی `docker network inspect` روی یک شبکهٔ روپوش که کانتینرهای گره‌های دیگر را نشان می‌دهد.

**`service-discovery`** — کشف سرویس / Service Discovery · tags: `network` `service` · related: `overlay-network`، `virtual-ip`، `dns-round-robin`، `service-mesh`، `api-gateway`
بدنه: کشف سرویس یعنی یک سرویس چطور سرویس دیگر را پیدا می‌کند بدون اینکه IP اش را بداند — و جزوه اصلاً این را نمی‌گوید، در حالی که پرتکرارترین کار روزمره است. مکانیزم: سوارم یک DNS داخلی دارد؛ **نام سرویس** یک نام قابل حل است داخل هر شبکهٔ روپوشی که سرویس به آن وصل است. مثال بد: گذاشتن IP کانتینر در متغیر محیطی هنگام استقرار، که با اولین جایگزینی تسک بی‌اعتبار می‌شود. جدول: چه نام‌هایی قابل حل‌اند (`api`، `notification_api`، `tasks.api`) و هرکدام چه برمی‌گردانند. دام: فرض اینکه سرویس‌های دو استک متفاوت خودبه‌خود همدیگر را می‌بینند — بدون شبکهٔ روپوش مشترک نمی‌بینند.
دیاگرام: **جدول نام‌ها** با ستون «چه چیزی برمی‌گرداند» · یک سرویس که با نام، سرویس دیگر را صدا می‌زند.
مثال: `postgresql://db:5432/app` به‌عنوان رشتهٔ اتصال، در کنار `getent hosts api` از داخل کانتینر.

**`virtual-ip`** — آی‌پی مجازی / Virtual IP · tags: `network` · related: `service-discovery`، `dns-round-robin`، `routing-mesh`، `task`
بدنه: به‌طور پیش‌فرض نام سرویس به یک IP **مجازی** ثابت حل می‌شود، نه به IP تسک‌ها؛ آن IP جلوی یک توزیع‌کنندهٔ بار داخلی نشسته است. مکانیزم: IPVS در کرنل هر اتصال را به یکی از تسک‌های سالم می‌فرستد؛ کلاینت همیشه یک آدرس می‌بیند حتی وقتی تسک‌ها عوض می‌شوند. مزیت اصلی: کلاینت‌هایی که DNS را کش می‌کنند (که تقریباً همهٔ کتابخانه‌های HTTP هستند) با تسک مرده گیر نمی‌کنند. جدول: حالت `vip` در برابر `dnsrr` در چهار ستون. ابهام: توزیع در سطح **اتصال** است نه درخواست، پس یک اتصال پایدار HTTP/2 روی یک تسک می‌ماند.
دیاگرام: نام → IP مجازی → سه تسک · **جدول مقایسهٔ دو حالت**.
مثال: خروجی `docker service inspect` که `VirtualIPs` را نشان می‌دهد.

**`dns-round-robin`** — گردش DNS / DNS Round Robin · tags: `network` · related: `virtual-ip`، `service-discovery`، `task`
بدنه: حالت دوم انتشار داخلی: نام سرویس مستقیم به IP همهٔ تسک‌ها حل می‌شود و انتخاب با کلاینت است. مکانیزم: DNS همهٔ رکوردها را برمی‌گرداند و ترتیبشان می‌چرخد. مثال بد: انتخاب این حالت برای یک API معمولی که کلاینتش DNS را برای پنج دقیقه کش می‌کند — نتیجه، ترافیکی که به تسکِ مرده می‌رود و خطایی که ربطی به سرویس ندارد. جدول: کِی این حالت درست است (کلاینت‌های آگاه از توزیع بار، یا کلاسترهای پایگاه داده‌ای که خودشان اعضا را می‌خواهند). دام: انتخابش فقط به این دلیل که «واقعی‌تر» به نظر می‌رسد.
دیاگرام: نام → سه IP مستقیم · **جدول تصمیم** میان دو حالت با ستون «کلاینت چه رفتاری دارد».
مثال: `endpoint_mode: dnsrr` در `stack.yml` و خروجی `dig api` با سه رکورد.

**`ingress-network`** — شبکهٔ ورودی / Ingress Network · tags: `network` · related: `overlay-network`، `routing-mesh`، `published-port`
بدنه: شبکهٔ ورودی یک شبکهٔ روپوشِ ویژه است که سوارم خودش می‌سازد و کارش فقط رساندن ترافیکِ بیرون به تسک‌هاست. مکانیزم: وقتی پورتی منتشر می‌شود، همهٔ گره‌ها روی آن پورت گوش می‌دهند و بسته را داخل شبکهٔ ورودی به تسک مقصد می‌رسانند — حتی گره‌ای که هیچ تسکی از آن سرویس ندارد. مثال بد: تنظیم فایروال طوری که پورت ۷۹۴۶ و ۴۷۸۹ بین گره‌ها بسته باشد؛ سرویس بالا می‌آید و ترافیک بین‌گره‌ای بی‌صدا نمی‌رسد. جدول: پورت‌هایی که خود سوارم لازم دارد (۲۳۷۷ مدیریت، ۷۹۴۶ کشف، ۴۷۸۹ داده) و اینکه هرکدام نبود چه علامتی می‌دهد.
دیاگرام: **جدول پورت‌های زیرساخت** با ستون «اگر بسته باشد چه می‌بینی» · بستهٔ ورودی از گرهٔ بی‌تسک تا تسک.
مثال: `docker network ls` که `ingress` را نشان می‌دهد.

**`published-port`** — پورت منتشرشده / Published Port · tags: `network` `delivery` · related: `ingress-network`، `routing-mesh`، `host-mode-publish`، `service`
بدنه: انتشار پورت یعنی صریحاً گفتن «این سرویس از بیرون کلاستر روی این پورت در دسترس باشد». مکانیزم: پورت منتشرشده یک خصیصهٔ **سرویس** است نه گره؛ به همین دلیل با جابه‌جا شدن تسک‌ها چیزی عوض نمی‌شود. مثال بد: منتشر کردن پورت پایگاه داده برای اینکه سرویس دیگری بتواند به آن وصل شود، در حالی که همان کار از داخل با نام سرویس و بدون هیچ افشایی ممکن بود. جدول: دسترسی از داخل در برابر دسترسی از بیرون، و اینکه هرکدام چه چیزی لازم دارد. دام: تصور اینکه پورت منتشرنشده یعنی غیرقابل دسترس از داخل کلاستر — کاملاً برعکس.
دیاگرام: مرز کلاستر با یک پورت باز و بقیهٔ ارتباط‌ها در داخل · **جدول داخل/بیرون**.
مثال: `ports: ["8080:8080"]` و شکل بلندش با `target` و `published`.

**`routing-mesh`** — مش مسیریابی / Routing Mesh · tags: `network` · related: `ingress-network`، `published-port`، `virtual-ip`، `host-mode-publish`
بدنه: مش مسیریابی یعنی هر گرهِ کلاستر روی پورت منتشرشده جواب می‌دهد، چه تسکی از آن سرویس داشته باشد چه نداشته باشد. مکانیزم دقیق — و اینجا جایی است که مدخل از جزوه فاصله می‌گیرد: بسته به شبکهٔ ورودی می‌رود و **همیشه از توزیع‌کنندهٔ بار مقصد رد می‌شود**، پس حتی وقتی گرهِ گیرنده خودش تسک دارد، لزوماً همان تسک محلی انتخاب نمی‌شود. جدول: چه چیزی مش مسیریابی هست و چه چیزی نیست (توزیع بار جغرافیایی نیست، چسبندگی نشست ندارد، آگاه از سلامت برنامه نیست). دام: تکیه بر آن به‌عنوان توزیع‌کنندهٔ بارِ عمومی. ابهام: IP کلاینت به‌طور پیش‌فرض حفظ نمی‌شود، که برای لاگ و محدودسازی نرخ مهم است.
دیاگرام: سه گره که همه روی یک پورت جواب می‌دهند · **جدول «هست / نیست»**.
مثال: `curl italy:8080` که به تسکی روی `france` می‌رسد، با خروجی که نام میزبان تسک را چاپ می‌کند.

**`host-mode-publish`** — انتشار روی خود گره / Host-Mode Publishing · tags: `network` `operations` · related: `routing-mesh`، `published-port`، `global-service`
بدنه: تنها راه فرار از مش مسیریابی: پورت را در حالت `host` منتشر کن تا ترافیکِ رسیده به هر گره فقط به تسک همان گره برود. مکانیزم: با این حالت شبکهٔ ورودی از مسیر خارج می‌شود؛ در عوض روی هر گره فقط یک تسک می‌تواند آن پورت را بگیرد، پس معمولاً با سرویس سراسری جفت می‌شود. مثال بد: انتخاب حالت `host` روی سرویس تکثیرشده با سه نمونه در کلاستر دو گره‌ای — تسک سوم برای همیشه معلق می‌ماند. جدول: `ingress` در برابر `host` در پنج ستون، از جمله «IP کلاینت حفظ می‌شود؟» و «چند تسک روی یک گره؟». کاربرد اصلی: پراکسی لبه.
دیاگرام: **جدول مقایسهٔ دو حالت** · ترافیک که به تسک محلی می‌ماند.
مثال: `ports: [{ target: 80, published: 80, mode: host }]` همراه `mode: global`.

**`reverse-proxy`** — پراکسی معکوس / Reverse Proxy · tags: `network` `boundary` · related: `routing-mesh`، `api-gateway`، `service-mesh`، `published-port`، `host-mode-publish`
بدنه: پراکسی معکوس سرویسی است که در لبهٔ کلاستر می‌نشیند و کارهایی را می‌کند که مش مسیریابی نمی‌کند: TLS، مسیریابی بر اساس نام دامنه و مسیر، محدودسازی نرخ، و حفظ IP کلاینت. مکانیزم: معمولاً سرویس سراسری با انتشار حالت `host` روی ۸۰ و ۴۴۳، که از داخل با نام سرویس به بقیه می‌رسد. مثال بد: منتشر کردن پورت هر سرویس روی یک عدد جدا (۸۰۸۱، ۸۰۸۲، ۸۰۸۳) و مدیریت دستی‌شان. جدول: چه کاری از مش مسیریابی برمی‌آید، چه کاری از پراکسی، و چه کاری از دروازهٔ API. دام: پراکسی تک‌نمونه‌ای روی یک گره، که نقطهٔ شکست واحد می‌شود.
دیاگرام: لبه با پراکسی و سه سرویس پشتش · **جدول مسئولیت‌ها** در سه ستون.
مثال: قطعهٔ `stack.yml` یک پراکسی سراسری با دو پورت host و شبکهٔ روپوش مشترک.

### مرحلهٔ نقشه

```json
{
  "id": "how-traffic-arrives",
  "fa": {
    "title": "ترافیک چطور می‌رسد",
    "why": "بدون شبکهٔ روپوش و آی‌پی مجازی، Routing Mesh جادو می‌ماند و اولین مسئلهٔ شبکه غیرقابل عیب‌یابی است"
  },
  "en": {
    "title": "How traffic arrives",
    "why": "Without the overlay and the virtual IP underneath it, the routing mesh is magic and the first network problem is undebuggable"
  },
  "entries": ["overlay-network", "gossip", "service-discovery", "virtual-ip", "dns-round-robin", "ingress-network", "published-port", "routing-mesh", "host-mode-publish", "reverse-proxy"]
}
```

### پل دوطرفه

- `data/architecture/entries/styles.json` → مدخل `api-gateway`: `reverse-proxy` به `related` اضافه شود.
- `data/architecture/entries/styles.json` → مدخل `service-mesh`: `service-discovery` به `related` اضافه شود.

- [ ] **Step 1: دستهٔ `network` را به `categories.json` اضافه کن و `network.json` را با ده مدخل بساز**
- [ ] **Step 2: `node --test` → باید قرمز شود** با فهرست همان ده شناسه
- [ ] **Step 3: مرحلهٔ `how-traffic-arrives` را به `roadmap.json` اضافه کن و دو پل بالا را ببند**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 6: کامیت**

```bash
git add data/swarm data/architecture
git commit -m "feat: put the network underneath the routing mesh

The course notes describe the mesh and nothing below it. Ten entries
for the overlay, gossip, the internal DNS and the virtual IP — plus
the escape hatch, host-mode publishing, which the notes never mention
and which is the only way to keep a client's real IP."
```

---

## Task 7: مرحلهٔ ۷ — داده کجا می‌ماند (۵ مدخل)

**Files:**
- Modify: `data/swarm/categories.json` (دو دستهٔ `state` و `boundaries`)
- Create: `data/swarm/entries/state.json` (سه مدخل)
- Create: `data/swarm/entries/boundaries.json` (دو مدخل)
- Modify: `data/swarm/roadmap.json`
- Modify: `data/architecture/entries/distributed.json` و `data/architecture/entries/decisions.json` (فقط `related`)

**Interfaces:**
- Consumes: `swarm-node`، `placement-constraint`، `node-availability`، `service`، `task`، `self-healing`
- Produces: `local-volume`، `volume-driver`، `stateful-service`، `distributed-storage`، `database-ha`

### دسته‌های تازه

```json
{ "id": "state", "file": "state.json", "fa": "داده و راز", "en": "Data & Secrets" },
{ "id": "boundaries", "file": "boundaries.json", "fa": "مرزهای سوارم", "en": "What Swarm Is Not" }
```

### مدخل‌ها

**`local-volume`** — والیوم محلی / Local Volume · tags: `storage` `node` · related: `swarm-node`، `placement-constraint`، `stateful-service`، `volume-driver`
بدنه: والیوم محلی روی دیسک یک گرهِ مشخص زندگی می‌کند و از آن ماشین تکان نمی‌خورد. مکانیزم و نتیجهٔ مستقیمش: اگر تسک روی گرهٔ دیگری بازسازی شود، والیوم **با آن نمی‌آید**؛ سوارم روی گرهٔ تازه یک والیوم خالی با همان نام می‌سازد و کانتینر بالا می‌آید — بدون خطا، بدون داده. مثال بد: PostgreSQL بدون قید جای‌گذاری که بعد از یک خودترمیمی روی گرهٔ دیگر با پایگاه دادهٔ خالی بیدار می‌شود و برنامه فکر می‌کند نصب تازه است. جدول: سه سناریو (ری‌استارت روی همان گره، جابه‌جایی به گرهٔ دیگر، افتادن گره) با ستون «داده چه می‌شود». دام: خالی بودن بی‌صدا؛ هیچ هشداری وجود ندارد.
دیاگرام: **خط زمانی** جابه‌جایی تسک و والیومی که جا می‌ماند · دو گره با دو والیومِ هم‌نام و محتوای متفاوت.
مثال: `volumes: [pgdata:/var/lib/postgresql/data]` به‌علاوهٔ قید `node.labels.storage == true`.

**`volume-driver`** — درایور والیوم / Volume Driver · tags: `storage` · related: `local-volume`، `distributed-storage`، `stateful-service`
بدنه: درایور والیوم افزونه‌ای است که تعیین می‌کند والیوم واقعاً کجا ساخته شود — دیسک محلی، NFS، یا یک سیستم ذخیره‌سازی شبکه‌ای. مکانیزم: درایور نقطهٔ اتصالی است که سوارم از آن‌جا مسئولیت داده را به یک سیستم بیرونی واگذار می‌کند؛ خودِ سوارم هیچ‌وقت داده را تکثیر نمی‌کند. جدول: درایور `local` در برابر درایورهای شبکه‌ای، با ستون‌های «همراه تسک جابه‌جا می‌شود؟» و «چه چیزی را باید جدا نگه داری؟». دام: نصب درایور روی بعضی گره‌ها و نه همه، که تسک را روی گره‌های بی‌درایور معلق می‌گذارد.
دیاگرام: **جدول درایورها** · سه گره که همه به یک سیستم ذخیره‌سازی بیرونی وصل‌اند.
مثال: `volumes: { pgdata: { driver: some-network-driver, driver_opts: {...} } }`.

**`stateful-service`** — سرویس حالت‌دار / Stateful Service · tags: `storage` `service` · related: `local-volume`، `volume-driver`، `stateless`، `placement-constraint`، `database-ha`
بدنه: سرویس حالت‌دار سرویسی است که اگر تسکش را جای دیگری بازسازی کنی همان سرویس نیست، چون چیزی از خودش روی دیسک دارد. مکانیزم: همهٔ مکانیزم‌های راحت سوارم — خودترمیمی، به‌روزرسانی چرخشی، جای‌گذاری آزاد — روی این فرض ساخته شده‌اند که تسک‌ها قابل تعویض‌اند؛ حالت این فرض را می‌شکند. جدول: چه چیزی سرویس را حالت‌دار می‌کند (والیوم، نشست در حافظه، فایل موقت، شناسهٔ ثابت) و برای هرکدام راه بیرون بردن حالت چیست. دام: «بی‌حالت است» گفتن دربارهٔ سرویسی که نشست کاربر را در حافظه نگه می‌دارد. ابهام: حالت‌دار بودن بد نیست؛ **حالت‌دار بودنِ ندانسته** بد است.
دیاگرام: **جدول منابع حالت** با ستون راه‌حل · یک سرویس با حالت داخل در برابر همان با حالت بیرون.
مثال: قطعهٔ قبل/بعد که نشست را از حافظه به یک سرویس بیرونی می‌برد.

**`distributed-storage`** — ذخیره‌سازی توزیع‌شده / Distributed Storage · tags: `storage` `boundary` · related: `local-volume`، `volume-driver`، `replication`، `partitioning`، `stateful-service`
بدنه: ذخیره‌سازی توزیع‌شده سیستمی **جدا** است که داده را بین چند ماشین نگه می‌دارد و دسترسی مشترک می‌دهد. مکانیزم و جمله‌ای که کل این مدخل برای آن هست: **سوارم ذخیره‌سازی توزیع‌شده نیست و نمی‌شود.** اگر PostgreSQL روی germany باشد، سوارم دادهٔ آن را به italy و france تکثیر نمی‌کند و هرگز قصد چنین کاری را نداشته. مثال بد: انتظار اینکه `replicas: 3` روی پایگاه داده سه نسخهٔ هماهنگ بسازد؛ آنچه می‌سازد سه فرایند مستقل با سه دیسک بی‌خبر از هم است. جدول: چه چیزی مسئول چیست — سوارم، درایور والیوم، سیستم ذخیره‌سازی، خود پایگاه داده. دام: یکی گرفتن این مدخل با مدخل دسترس‌پذیری بالای پایگاه داده.
دیاگرام: سه گره که همه به یک لایهٔ ذخیره‌سازی وصل‌اند · **جدول مسئولیت‌ها** با چهار سطر.
مثال: خروجی `docker service ps postgres` با سه تسک روی سه گره، و توضیح انگلیسی اینکه هر کدام دیسک خودش را دارد.

**`database-ha`** — دسترس‌پذیری بالای پایگاه داده / Database HA · tags: `storage` `boundary` `failure` · related: `distributed-storage`، `replication`، `availability`، `strong-consistency`، `leader-election`
بدنه: دسترس‌پذیری بالای پایگاه داده یعنی خودِ پایگاه داده تکثیر، تشخیص خرابی و انتخاب نمونهٔ اصلی تازه را مدیریت کند. مکانیزم: این کار **بیرون** از سوارم انجام می‌شود؛ اگر نمونهٔ اصلی بمیرد، سوارم نمی‌گوید «آن یکی را اصلی کن» — چنین مفهومی در آن وجود ندارد و تنها کاری که می‌کند بالا آوردن دوبارهٔ کانتینر است. مثال بد: سه تسک پستگرس با یک والیوم مشترک، که به‌جای دسترس‌پذیری، خرابی داده می‌دهد. جدول: تفاوت این مدخل با ذخیره‌سازی توزیع‌شده — یکی می‌گوید داده کجا نگهداری شود، دیگری می‌گوید کدام نمونه حق نوشتن دارد. ابهام: این دو می‌توانند کنار هم باشند و هیچ‌کدام جای دیگری را نمی‌گیرد.
دیاگرام: **جدول سه‌ستونه** — چه کسی این کار را می‌کند: سوارم، ذخیره‌سازی، پایگاه داده · نمونهٔ اصلی با دو تکرارشونده و ارتقای یکی پس از خرابی.
مثال: خروجی `docker service ps` بعد از مرگ گرهٔ اصلی، با توضیح انگلیسی اینکه کانتینر برگشت ولی نقش برنگشت.

### مرحلهٔ نقشه

```json
{
  "id": "where-data-lives",
  "fa": {
    "title": "داده کجا می‌ماند",
    "why": "همهٔ راحتی‌های سوارم روی فرضِ قابل‌تعویض بودن تسک ساخته شده‌اند؛ داده همان چیزی است که این فرض را می‌شکند"
  },
  "en": {
    "title": "Where the data lives",
    "why": "Every convenience in Swarm assumes tasks are interchangeable; data is what breaks that assumption"
  },
  "entries": ["local-volume", "volume-driver", "stateful-service", "distributed-storage", "database-ha"]
}
```

### پل دوطرفه

- `data/architecture/entries/distributed.json` → مدخل `replication`: `distributed-storage` به `related` اضافه شود.
- `data/architecture/entries/decisions.json` → مدخل `availability`: `database-ha` به `related` اضافه شود.

- [ ] **Step 1: دو دستهٔ `state` و `boundaries` را اضافه کن و دو فایل مدخل را بساز**
- [ ] **Step 2: سه مدخل `state` و دو مدخل `boundaries` را بنویس**
- [ ] **Step 3: `node --test` → باید قرمز شود** با فهرست همان پنج شناسه
- [ ] **Step 4: مرحلهٔ `where-data-lives` را به `roadmap.json` اضافه کن و دو پل بالا را ببند**
- [ ] **Step 5: `node --test` → باید سبز شود**
- [ ] **Step 6: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 7: کامیت**

```bash
git add data/swarm data/architecture
git commit -m "feat: say plainly what Swarm does not do with your data

A local volume does not follow its task. When the task is rebuilt
elsewhere Swarm creates an empty volume of the same name and the
container starts fine — no error, no data. That silence is the whole
reason this stage exists."
```

---

## Task 8: مرحلهٔ ۸ — چیزهایی که نباید در گیت باشند (۳ مدخل)

**Files:**
- Modify: `data/swarm/entries/state.json` (سه مدخل اضافه، جمع ۶ — کامل)
- Modify: `data/swarm/roadmap.json`

**Interfaces:**
- Consumes: `service`، `service-spec`، `stack-file`، `task`، `swarm-tls`
- Produces: `secret`، `config-object`، `secret-rotation`

### مدخل‌ها

**`secret`** — راز / Secret · tags: `security` `delivery` · related: `config-object`، `secret-rotation`، `service`، `stack-file`
بدنه: راز شیئی است که سوارم رمزشده در انبار وضعیت نگه می‌دارد و فقط به گره‌هایی می‌رساند که تسکِ نیازمندش را اجرا می‌کنند. مکانیزم: راز داخل کانتینر به‌صورت فایل ظاهر می‌شود، در یک سیستم‌فایل موقت در حافظه؛ روی دیسک گره نمی‌نشیند و با رفتن تسک می‌رود. مثال بد: رمز پایگاه داده در `environment:` فایل استک، که در گیت می‌ماند، در `docker service inspect` دیده می‌شود و در لاگ خطاها چاپ می‌شود. جدول: متغیر محیطی در برابر راز در چهار ستون (کجا ذخیره می‌شود، چه کسی می‌بیند، در گیت می‌ماند؟، در inspect پیداست؟). دام: `cat` کردن راز در نقطهٔ ورود و ریختنش در متغیر محیطی، که همهٔ فایده را از بین می‌برد.
دیاگرام: **جدول مقایسه** · مسیر راز از انبار تا فایل داخل کانتینر.
مثال: `docker secret create db_password ./db_password.txt` و بخش `secrets:` در `stack.yml` و مسیر `/run/secrets/db_password`.

**`config-object`** — شیء پیکربندی / Config · tags: `security` `delivery` · related: `secret`، `stack-file`، `service`
بدنه: شیء پیکربندی همان مکانیزم راز است برای محتوایی که حساس نیست: `nginx.conf`، `app.yaml`، یک قالب. مکانیزم: مثل راز به‌صورت فایل تحویل می‌شود، ولی رمزنشده ذخیره می‌شود و مسیر تحویلش دلخواه است. مزیت اصلی نسبت به ساختن ایمیج تازه برای هر تغییر پیکربندی: تغییر پیکربندی دیگر نیازی به build و push ندارد. جدول: راز در برابر پیکربندی در برابر متغیر محیطی. ابهام مهم: هر دو **تغییرناپذیرند** — نمی‌شود محتوای یک راز یا پیکربندی موجود را عوض کرد، باید شیء تازه ساخت، که دقیقاً مقدمهٔ مدخل بعدی است.
دیاگرام: **جدول سه‌ستونه** · یک فایل پیکربندی که بدون ساخت ایمیج به سه تسک می‌رسد.
مثال: `docker config create nginx_conf ./nginx.conf` و بخش `configs:` با `target`.

**`secret-rotation`** — چرخاندن راز / Secret Rotation · tags: `security` `change` · related: `secret`، `config-object`، `service-spec`
بدنه: چون رازها تغییرناپذیرند، عوض کردن یک رمز یعنی ساختن راز تازه و به‌روزرسانی سرویس تا به آن سوییچ کند. مکانیزم: راز تازه با نام تازه (`db_password_v2`) ساخته می‌شود، مشخصات سرویس عوض می‌شود، تسک‌ها با راز تازه بازسازی می‌شوند، بعد راز قدیمی حذف می‌شود — به این ترتیب و نه ترتیبی دیگر. مثال بد: حذف راز قدیمی پیش از به‌روزرسانی سرویس، که سوارم اجازه‌اش را نمی‌دهد چون هنوز در استفاده است، یا بدتر: عوض کردن رمز در پایگاه داده بدون هماهنگی با استقرار، که سرویس را وسط راه می‌شکند. جدول: **ترتیب پنج قدم** با ستون «اگر این قدم را جا بیندازی چه می‌شود». دام: نام‌گذاری بدون نسخه، که بار دوم بن‌بست می‌سازد.
دیاگرام: **خط زمانی چرخش** با پنج قدم و پنجرهٔ‌ای که هر دو راز معتبرند · مقایسهٔ نام‌گذاری نسخه‌دار و بدون نسخه.
مثال: پنج دستور به ترتیب، از `docker secret create db_password_v2` تا `docker secret rm db_password_v1`.

### مرحلهٔ نقشه

```json
{
  "id": "not-in-git",
  "fa": {
    "title": "چیزهایی که نباید در گیت باشند",
    "why": "راز و پیکربندی تنها جاهایی‌اند که سوارم برای فایل‌ها مکانیزم اختصاصی دارد، و هر دو تغییرناپذیرند"
  },
  "en": {
    "title": "The things that must not be in Git",
    "why": "Secrets and configs are the only files Swarm has a dedicated mechanism for, and both are immutable"
  },
  "entries": ["secret", "config-object", "secret-rotation"]
}
```

- [ ] **Step 1: سه مدخل را به `state.json` اضافه کن**
- [ ] **Step 2: `node --test` → باید قرمز شود** با «secret, config-object, secret-rotation»
- [ ] **Step 3: مرحلهٔ `not-in-git` را به `roadmap.json` اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 6: کامیت**

```bash
git add data/swarm
git commit -m "feat: hand secrets to a service without putting them in Git

Secrets and configs are immutable, so rotating one is a five-step
dance with a specific order. Get the order wrong and you either
cannot delete the old one or you break the service mid-flight."
```

---

## Task 9: مرحلهٔ ۹ — عوض کردن بدون قطعی (۷ مدخل)

**Files:**
- Modify: `data/swarm/categories.json` (دستهٔ `lifecycle`)
- Create: `data/swarm/entries/lifecycle.json` (هفت مدخل)
- Modify: `data/swarm/roadmap.json`
- Modify: `data/architecture/entries/distributed.json` (فقط `related` مدخل `circuit-breaker`)

**Interfaces:**
- Consumes: `service`، `task`، `replica`، `desired-state`، `service-spec`، `self-healing`، `routing-mesh`، `virtual-ip`
- Produces: `scaling`، `healthcheck`، `restart-policy`، `rolling-update`، `update-config`، `rollback`، `zero-downtime-deploy`

### دستهٔ تازه

```json
{ "id": "lifecycle", "file": "lifecycle.json", "fa": "تغییر و سلامت", "en": "Change & Health" }
```

### مدخل‌ها

**`scaling`** — مقیاس‌دهی / Scaling · tags: `change` `service` · related: `replica`، `desired-state`، `horizontal-scaling`، `stateless`
بدنه: مقیاس‌دهی یعنی عوض کردن عدد نمونه‌ها — یک تغییر در وضعیت مطلوب، نه یک عملیات جدا. مکانیزم: بالا بردن عدد یعنی تسک‌های تازه که زمان‌بندی می‌شوند؛ پایین آوردنش یعنی سوارم تسک‌ها را متوقف می‌کند، و **کدام تسک‌ها را انتخاب می‌کند تضمین‌شده نیست**. مثال بد: کم کردن نمونه‌های سرویسی که اتصال‌های بلندمدت دارد، بدون خاموشی مرتب — کاربران وسط کار قطع می‌شوند. جدول: چه چیزی با عدد نمونه بهتر می‌شود و چه چیزی نمی‌شود (توان عملیاتی آری، تأخیر یک درخواست نه، خرابی گره فقط اگر توزیع درست باشد). دام: مقیاس دادن سرویسی که به یک والیوم محلی چسبیده. ابهام: مقیاس‌دهی افقی روی سرویسی که بی‌حالت نیست فقط مسئله را جابه‌جا می‌کند.
دیاگرام: **جدول «چه چیزی حل می‌شود»** · دو نمونه که پنج تا می‌شوند و توزیعشان روی گره‌ها.
مثال: `docker service scale notification_api=5` و همان تغییر در `stack.yml`.

**`healthcheck`** — بررسی سلامت / Healthcheck · tags: `failure` `operations` · related: `restart-policy`، `rolling-update`، `self-healing`، `circuit-breaker`، `timeout`
بدنه: در حال اجرا بودن کانتینر یعنی فرایندش نمرده؛ یعنی **نه** اینکه برنامه جواب می‌دهد. بررسی سلامت این فاصله را پر می‌کند. مکانیزم: داکر دستور بررسی را داخل کانتینر اجرا می‌کند؛ بعد از `retries` شکست متوالی کانتینر ناسالم اعلام می‌شود و سوارم آن تسک را می‌کشد و تسک تازه‌ای می‌سازد. جدول: چهار پارامتر (`test`، `interval`، `timeout`، `retries`) با ستون «اگر بد تنظیم شود چه می‌شود»، به‌علاوهٔ `start_period` که جزوه ندارد و برای برنامه‌های کندبالا حیاتی است. مثال بد: بررسی سلامتی که به پایگاه داده وصل می‌شود؛ با یک کندی موقت پایگاه داده، همهٔ نمونه‌های برنامه ناسالم و بازسازی می‌شوند و قطعی کوچک به قطعی کامل تبدیل می‌شود. دام: نبود `start_period`، که برنامه را در حلقهٔ بازسازی می‌اندازد.
دیاگرام: **نمودار حالت** starting → healthy → unhealthy با شرط‌های گذار · خط زمانی بررسی‌ها با شکست‌های متوالی.
مثال: بلوک `healthcheck:` کامل با `start_period: 30s`.

**`restart-policy`** — سیاست ری‌استارت / Restart Policy · tags: `failure` `change` · related: `healthcheck`، `self-healing`، `task`، `retry`
بدنه: سیاست ری‌استارت می‌گوید وقتی تسکی تمام می‌شود، سوارم باید جایگزینش کند یا نه، و چند بار. مکانیزم — و ابهامی که باید صریح رفع شود: در سوارم «ری‌استارت» یعنی **ساختن تسک تازه**، نه بالا آوردن دوبارهٔ همان کانتینر. جدول: `condition` با سه مقدار (`any`, `on-failure`, `none`) به‌علاوهٔ `delay`، `max_attempts` و `window`، هرکدام با «برای چه نوع سرویسی». مثال بد: `max_attempts` بدون `window`، که پنجرهٔ شمارش را نامحدود می‌کند. دام: یکی گرفتن این با `restart:` در Compose که در سوارم نادیده گرفته می‌شود — یکی از پرتکرارترین اشتباه‌های مهاجرت از Compose به Swarm.
دیاگرام: **جدول سیاست‌ها** · خط زمانی سه تلاش با تأخیر و پنجره.
مثال: بلوک `restart_policy:` کامل، در کنار `restart: always` که در سوارم بی‌اثر است.

**`rolling-update`** — به‌روزرسانی چرخشی / Rolling Update · tags: `change` `delivery` · related: `update-config`، `rollback`، `desired-state`، `healthcheck`، `availability`
بدنه: به‌روزرسانی چرخشی یعنی نمونه‌ها گروه‌گروه به نسخهٔ تازه می‌روند، نه همه با هم. مکانیزم: سوارم مشخصات تازه را می‌گیرد، تسک‌ها را به تعداد `parallelism` می‌کشد و بازمی‌سازد، بین گروه‌ها `delay` صبر می‌کند، و اگر بررسی سلامت تعریف شده باشد پیش از رفتن به گروه بعد منتظر سالم شدن می‌ماند — **بدون بررسی سلامت، «سالم» یعنی فقط «فرایند بالا آمد»**، که به‌روزرسانی چرخشی را به قطعی تدریجی تبدیل می‌کند. جدول: سه سناریو (با بررسی سلامت، بدون آن، با `parallelism` برابر تعداد نمونه‌ها). مثال بد: `parallelism: 3` روی سه نمونه، که دقیقاً همان استقرار یک‌جاست با اسمی دیگر.
دیاگرام: **خط زمانی** سه گروه با وضعیت نسخه‌ها در هر لحظه · نمودار ظرفیت در دسترس هنگام به‌روزرسانی.
مثال: خروجی `docker service ps` وسط به‌روزرسانی با نسخه‌های مخلوط.

**`update-config`** — پیکربندی به‌روزرسانی / Update Configuration · tags: `change` `delivery` · related: `rolling-update`، `rollback`، `zero-downtime-deploy`، `healthcheck`
بدنه: بلوک `update_config` تعیین می‌کند به‌روزرسانی با چه سرعتی، چه ترتیبی، و با چه واکنشی به شکست انجام شود. مکانیزم: `parallelism` و `delay` سرعت را می‌سازند؛ `order` تعیین می‌کند تسک تازه پیش از کشتن قدیمی بالا بیاید یا بعد؛ `failure_action` می‌گوید اگر تسک تازه سالم نشد چه کند — `pause` (پیش‌فرض)، `continue`، یا `rollback`. جدول: هر پارامتر با مقدار پیش‌فرض و مقدار پیشنهادی برای یک سرویس وب معمولی. مثال بد: `failure_action` پیش‌فرض روی خط لولهٔ خودکار: استقرار خراب وسط راه متوقف می‌ماند، نیمی از نمونه‌ها نسخهٔ خراب دارند، و CI سبز گزارش می‌دهد چون دستور برگشته. دام: `monitor` خیلی کوتاه، که خرابی‌های دیرظاهر را نمی‌بیند.
دیاگرام: **جدول پارامترها** با ستون پیش‌فرض و پیشنهاد · دو خط زمانی برای `stop-first` و `start-first`.
مثال: بلوک `update_config:` کامل با هر شش کلید.

**`rollback`** — بازگشت / Rollback · tags: `change` `failure` · related: `rolling-update`، `update-config`، `service-spec`، `desired-state`
بدنه: بازگشت یعنی برگرداندن سرویس به مشخصات قبلی‌اش. مکانیزم: سوارم برای هر سرویس **دقیقاً یک** مشخصات قبلی نگه می‌دارد؛ یعنی بازگشت یک قدم به عقب است نه یک تاریخچه، و دو بار پشت‌هم `rollback` زدن تو را به همان‌جایی برمی‌گرداند که بودی. جدول: بازگشت دستی در برابر `failure_action: rollback` خودکار. مثال بد: تکیه بر بازگشت برای مهاجرت پایگاه داده‌ای که برگشت‌ناپذیر است — کد برمی‌گردد، شِما نه. دام: `rollback_config` جداگانه‌ای که تنظیم نشده و بازگشت را با پیش‌فرض‌های کندتر از استقرار انجام می‌دهد.
دیاگرام: **خط زمانی** استقرار خراب و بازگشت، با نشان دادن اینکه فقط یک نسخه در حافظه است · جدول دستی/خودکار.
مثال: `docker service rollback notification_api` و بلوک `rollback_config:`.

**`zero-downtime-deploy`** — استقرار بی‌قطعی / Zero-Downtime Deployment · tags: `change` `delivery` · related: `rolling-update`، `update-config`، `healthcheck`، `routing-mesh`
بدنه: جمع‌بندی عملی این مرحله: به‌روزرسانی بدون قطعی نتیجهٔ یک کلید نیست، نتیجهٔ پنج چیز است که همه باید هم‌زمان درست باشند. مکانیزم: بررسی سلامت واقعی، `order: start-first`، `parallelism` کمتر از تعداد نمونه، خاموشی مرتب در خود برنامه (واکنش به `SIGTERM` و تمام کردن درخواست‌های در جریان)، و `stop_grace_period` بلندتر از طولانی‌ترین درخواست. مثال بد: کلاستری که همهٔ این‌ها را دارد جز خاموشی مرتب؛ هر استقرار چند درخواست را قطع می‌کند و در نمودارها به‌شکل خطاهای پراکنده و بی‌دلیل ظاهر می‌شود. جدول: **چک‌لیست پنج‌سطری** با ستون «اگر این یکی نباشد کاربر چه می‌بیند». ابهام: ترتیب برعکسِ چیزی است که به نظر می‌رسد — سوارم **اول** تسک را از توزیع بار بیرون می‌برد، دو ثانیه صبر می‌کند (`defaultGossipConvergeDelay` در `daemon/cluster/executor/container/controller.go`)، و **بعد** سیگنال توقف را می‌فرستد. آن دو ثانیه یک حدسِ هاردکد شده است — کامنت خودِ سورس می‌گوید باید قابل تنظیم باشد — پس روی کلاستر بزرگ‌تر جدول IPVS دوردست هنوز ممکن است تسک را نگه داشته باشد، و توزیع در سطح اتصال یعنی کلاینت keep-alive به هر حال روی اتصال موجودش می‌آید.
دیاگرام: **چک‌لیست پنج‌سطری به‌شکل جدول** · خط زمانی یک درخواست در لحظهٔ تعویض تسک.
مثال: بلوک کامل `deploy:` که هر پنج مورد را دارد، به‌علاوهٔ `stop_grace_period`.

### مرحلهٔ نقشه

```json
{
  "id": "changing-safely",
  "fa": {
    "title": "عوض کردن بدون قطعی",
    "why": "به‌روزرسانی چرخشی بدون بررسی سلامت، فقط قطعیِ تدریجی است"
  },
  "en": {
    "title": "Changing it without an outage",
    "why": "A rolling update without a health check is just a gradual outage"
  },
  "entries": ["scaling", "healthcheck", "restart-policy", "rolling-update", "update-config", "rollback", "zero-downtime-deploy"]
}
```

### پل دوطرفه

- `data/architecture/entries/distributed.json` → مدخل `circuit-breaker`: `healthcheck` به `related` اضافه شود.

- [ ] **Step 1: دستهٔ `lifecycle` را اضافه کن و `lifecycle.json` را با هفت مدخل بساز**
- [ ] **Step 2: `node --test` → باید قرمز شود** با فهرست همان هفت شناسه
- [ ] **Step 3: مرحلهٔ `changing-safely` را به `roadmap.json` اضافه کن و پل بالا را ببند**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 6: کامیت**

```bash
git add data/swarm data/architecture
git commit -m "feat: change a running service without dropping requests

Zero downtime is five things at once, not one flag. The one people
miss is graceful shutdown in the app itself: everything else can be
right and every deploy still clips a handful of requests."
```

---

## Task 10: مرحلهٔ ۱۰ — وقتی چیزی می‌شکند (۸ مدخل)

**Files:**
- Modify: `data/swarm/categories.json` (دستهٔ `operations`)
- Modify: `data/swarm/entries/lifecycle.json` (یک مدخل اضافه، جمع ۸ — کامل)
- Create: `data/swarm/entries/operations.json` (هفت مدخل — دسته یک‌جا کامل می‌شود)
- Modify: `data/swarm/roadmap.json`

**Interfaces:**
- Consumes: `self-healing`، `placement-preference`، `node-availability`، `quorum`، `raft`، `task`، `scheduler`، `placement-constraint`، `resource-reservation`، `secret`، `healthcheck`، `global-service`
- Produces: `node-failure`، `task-state`، `pending-task`، `swarm-cli`، `service-logs`، `swarm-monitoring`، `swarm-backup`، `quorum-loss-recovery`

### دستهٔ تازه

```json
{ "id": "operations", "file": "operations.json", "fa": "عملیات", "en": "Operations" }
```

### مدخل‌ها

**`node-failure`** — از کار افتادن گره / Node Failure · tags: `failure` `node` · related: `self-healing`، `placement-preference`، `node-availability`، `quorum`، `replica`
بدنه (دستهٔ `lifecycle`): وقتی یک گره کامل از دسترس خارج می‌شود چه اتفاقی می‌افتد و چه چیزی **نمی‌افتد**. مکانیزم: مدیر پس از نرسیدن ضربان، گره را `Down` علامت می‌زند و تسک‌هایش را جای دیگری بازسازی می‌کند — اگر گرهٔ واجد شرایطی مانده باشد. جملهٔ محوری: **افزونگی نمونه، افزونگی گره نیست**؛ سه نمونه روی یک گره با افتادن آن گره هر سه می‌روند. جدول: چهار سناریو — گرهٔ کارگر با نمونه‌های پخش‌شده، گرهٔ کارگر با همهٔ نمونه‌ها، گرهٔ مدیرِ غیررهبر، گرهٔ رهبر — با ستون «کاربر چه می‌بیند» و «اپراتور چه باید بکند». دام: تأخیر تشخیص؛ فاصلهٔ میان مرگ گره و بازسازی تسک صفر نیست.
دیاگرام: **جدول چهار سناریو** · خط زمانی از قطع ضربان تا اجرای تسک روی گرهٔ تازه.
مثال: خروجی `docker node ls` با یک گرهٔ `Down` و `docker service ps` که بازسازی را نشان می‌دهد.

**`task-state`** — حالت‌های تسک / Task States · tags: `operations` `service` · related: `task`، `pending-task`، `self-healing`، `swarm-cli`
بدنه: هر تسک یک ماشین حالت را طی می‌کند و ستون‌های `CURRENT STATE` و `DESIRED STATE` در `docker service ps` دقیقاً همین‌اند — و خواندنشان اولین مهارت عیب‌یابی در سوارم است. مکانیزم: `new` → `pending` → `assigned` → `preparing` → `starting` → `running`، و شاخه‌های پایانی `complete`، `failed`، `shutdown`، `rejected`، `orphaned`. جدول: هر حالت با «یعنی چه» و «اگر اینجا گیر کرد کجا را نگاه کن» — `preparing` طولانی یعنی کشیدن ایمیج، `rejected` یعنی گره نتوانست اجرا کند، `orphaned` یعنی گره از دسترس خارج است. دام: خواندن `DESIRED STATE: Shutdown` به‌عنوان خطا، در حالی که فقط تاریخچه است.
دیاگرام: **نمودار حالت کامل** با گذارها · جدول حالت‌ها با ستون «کجا را نگاه کن».
مثال: خروجی `docker service ps --no-trunc api` با سه حالت متفاوت و ستون `ERROR`.

**`pending-task`** — تسک معلق / Pending Task · tags: `operations` `scheduling` `antipattern` · related: `task-state`، `scheduler`، `placement-constraint`، `resource-reservation`، `swarm-node`
بدنه: پرتکرارترین سؤال عملی سوارم: «سرویس را ساختم، خطایی نگرفتم، و هیچ‌وقت بالا نیامد.» مکانیزم: تسک معلق یعنی زمان‌بند هیچ گرهٔ واجد شرایطی پیدا نکرده و **این خطا نیست، انتظار است** — پس تا ابد ادامه می‌دهد. جدول **تشخیص افتراقی**، ستون فقرات این مدخل: پنج علت (قید برآوردنشدنی، رزرو بزرگ‌تر از هر گره، همهٔ گره‌ها drain، تعارض پورت در حالت host، درایور والیوم ناموجود) با علامت هرکدام در `docker service ps --no-trunc`. دام: بالا بردن تعداد نمونه به امید اینکه یکی‌شان بگیرد.
دیاگرام: **جدول تشخیص افتراقی** با ستون «چه می‌بینی / چه چیزی را چک کن» · قیف زمان‌بند که همهٔ گره‌ها را فیلتر می‌کند و خالی می‌ماند.
مثال: `docker service ps --no-trunc` با پیام `no suitable node (scheduling constraints not satisfied on 3 nodes)`.

**`swarm-cli`** — خط فرمان و API / CLI and API · tags: `operations` `security` · related: `service`، `swarm`، `task-state`، `stack`
بدنه: سوارم داشبورد رسمی هم‌سطح کوبرنتیز ندارد و مدل مدیریتش خط فرمان و API است — این کمبود نیست، انتخاب است، و پیامدهایش را باید دانست. مکانیزم: هر کاری که CLI می‌کند از همان API موتور داکر روی سوکت مدیر می‌گذرد؛ یعنی هر ابزار ثالثی هم دقیقاً همان دسترسی را می‌خواهد. جدول: **ده دستور روزمره** با «چه سؤالی را جواب می‌دهد» — از `docker node ls` تا `docker service ps --no-trunc` و `docker stack services`. مثال بد: باز کردن سوکت داکر مدیر روی TCP بدون TLS برای اینکه یک داشبورد ثالث وصل شود؛ آن سوکت معادل دسترسی ریشه به کل کلاستر است. دام: نصب ابزارهای مشاهده روی همان گرهٔ مدیر و سنگین کردنش.
دیاگرام: **جدول ده دستور** · مسیر یک دستور از CLI تا API مدیر.
مثال: پنج دستور با خروجی کوتاهشان، پشت سر هم.

**`service-logs`** — لاگ سرویس / Service Logs · tags: `operations` `failure` · related: `swarm-cli`، `task-state`، `observability`
بدنه: `docker service logs` لاگ همهٔ تسک‌های یک سرویس را از همهٔ گره‌ها یک‌جا نشان می‌دهد. مکانیزم: مدیر لاگ‌ها را از گره‌ها جمع می‌کند و با پیشوند نام تسک درهم می‌آمیزد؛ همین جمع‌کردن است که آن را برای عیب‌یابی سریع مفید و برای نگهداری بلندمدت نامناسب می‌کند. مثال بد: تکیه بر این دستور به‌عنوان تنها راه دیدن لاگ؛ تسکی که حذف شود لاگش هم می‌رود، و همان تسکی است که می‌خواستی ببینی چرا مرد. جدول: پرچم‌های مفید (`--follow`، `--since`، `--tail`، `--no-trunc`، `--raw`) با کاربرد هرکدام. دام: ترتیب زمانی؛ خطوط از گره‌های مختلف لزوماً کاملاً مرتب نیستند.
دیاگرام: **جدول پرچم‌ها** · لاگ سه تسک از سه گره که در یک جریان درهم می‌آید.
مثال: `docker service logs --tail 50 --follow notification_api` با چند خط خروجی نمونه.

**`swarm-monitoring`** — پایش سوارم / Monitoring a Swarm · tags: `operations` `failure` · related: `observability`، `service-logs`، `healthcheck`، `global-service`
بدنه: چون داشبوردی در کار نیست، پایش را باید خودت سوار کنی — و سؤال اول این است که **چه چیزی** را پایش کنی. مکانیزم: دو لایهٔ مستقل که با هم اشتباه گرفته می‌شوند — سلامت کلاستر (گره‌های Down، حد نصاب، تسک‌های معلق، تسک‌های در حال بازسازی) و سلامت برنامه (نرخ خطا، تأخیر، اشباع). جدول: **ده سیگنال** با ستون «کدام لایه» و «آستانهٔ هشدار». مکانیزم عملی: عامل جمع‌آوری به‌شکل سرویس سراسری اجرا می‌شود تا گرهٔ تازه خودبه‌خود پوشش بگیرد. مثال بد: هشدار روی «کانتینر ری‌استارت شد» بدون توجه به وضعیت مطلوب — سوارم عمداً تسک‌ها را بازمی‌سازد و این هشدار همیشه روشن است. دام: پایش را روی همان کلاستری گذاشتن که پایش می‌شود.
دیاگرام: **جدول ده سیگنال** با دو لایه · عامل سراسری روی هر گره.
مثال: قطعهٔ `stack.yml` یک عامل پایش با `mode: global` و والیوم سوکت داکر فقط-خواندنی.

**`swarm-backup`** — پشتیبان‌گیری از سوارم / Backing Up a Swarm · tags: `operations` `cluster` · related: `raft`، `quorum-loss-recovery`، `secret`، `control-plane-ha`
بدنه: تنها چیز غیرقابل‌بازسازی یک کلاستر، وضعیت رفت روی گره‌های مدیر است: تعریف سرویس‌ها، شبکه‌ها، رازها، پیکربندی‌ها، برچسب‌ها و گواهی‌ها. مکانیزم: پشتیبان یعنی متوقف کردن داکر روی یک مدیر، کپی کردن پوشهٔ `/var/lib/docker/swarm`، و روشن کردن دوباره — و **توقف داکر روی یک مدیر از سه مدیر، سرویس‌ها را نمی‌خواباند**، که همان چیزی است که این کار را عملی می‌کند. جدول: چه چیزی در پشتیبان هست، چه چیزی نیست (دادهٔ والیوم‌ها نیست، ایمیج‌ها نیستند)، و هرکدام از کجا بازسازی می‌شوند. مثال بد: پشتیبان گرفتن بدون توقف داکر، که ممکن است نسخهٔ ناسازگار بدهد. دام: نگهداری پشتیبان روی خود کلاستر.
دیاگرام: **جدول «در پشتیبان هست / نیست»** با ستون «اگر نباشد از کجا برمی‌گردد» · سه مدیر که یکی‌شان موقتاً خاموش است و کلاستر هنوز حد نصاب دارد.
مثال: سه دستور به ترتیب — `systemctl stop docker`، `tar`، `systemctl start docker` — با کامنت انگلیسی.

**`quorum-loss-recovery`** — بازیابی پس از افتادن حد نصاب / Recovering from Quorum Loss · tags: `failure` `cluster` `operations` · related: `quorum`، `raft`، `swarm-backup`، `control-plane-ha`، `manager-node`
بدنه: جزوه می‌گوید با از دست رفتن اکثریت، کلاستر نمی‌تواند تصمیم تازه ثبت کند، و همان‌جا رها می‌کند. این مدخل ادامه‌اش را می‌گوید. مکانیزم: **اول تصمیم بگیر کدام مسیر** — اگر مدیرهای افتاده برمی‌گردند، هیچ کاری نکن و برگردانشان؛ اگر برنمی‌گردند، روی یک مدیر بازمانده `docker swarm init --force-new-cluster` بزن، که همان وضعیت رفت را با کلاستر تک‌مدیره از نو راه می‌اندازد، و بعد مدیرهای تازه را اضافه کن. جدول: **درخت تصمیم** با سه شاخه و پیامد هرکدام. جملهٔ آرامش‌بخش که باید اول بیاید: سرویس‌های در حال اجرا در تمام این مدت بالا مانده‌اند. دام: `--force-new-cluster` زدن روی چند مدیر هم‌زمان، که دو کلاستر مستقل می‌سازد.
دیاگرام: **درخت تصمیم** با سه شاخه · خط زمانی از افتادن دو مدیر تا کلاستر سالم دوباره.
مثال: `docker swarm init --force-new-cluster` و بعد `docker node rm` برای مدیرهای مرده و `join` تازه.

### مرحلهٔ نقشه

```json
{
  "id": "when-it-breaks",
  "fa": {
    "title": "وقتی چیزی می‌شکند",
    "why": "خواندن CURRENT STATE اولین مهارت عیب‌یابی است؛ «بالا نیامد و خطایی هم نداد» بدون آن جواب ندارد"
  },
  "en": {
    "title": "When something breaks",
    "why": "Reading CURRENT STATE is the first debugging skill; without it, \"it never came up and gave no error\" has no answer"
  },
  "entries": ["node-failure", "task-state", "pending-task", "swarm-cli", "service-logs", "swarm-monitoring", "swarm-backup", "quorum-loss-recovery"]
}
```

- [ ] **Step 1: دستهٔ `operations` را اضافه کن، `node-failure` را به `lifecycle.json` و هفت مدخل را به `operations.json` بنویس**
- [ ] **Step 2: `node --test` → باید قرمز شود** با فهرست همان هشت شناسه
- [ ] **Step 3: مرحلهٔ `when-it-breaks` را به `roadmap.json` اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 6: کامیت**

```bash
git add data/swarm
git commit -m "feat: answer the question the course notes leave open

A pending task is not an error, it is patience — so it never times out
and never shouts. The differential-diagnosis table for why the
scheduler found no node is the most useful thing in this stage."
```

---

## Task 11: مرحلهٔ ۱۱ — از کد تا ایمیج (۴ مدخل)

از اینجا تا تسک ۱۳، زنجیرهٔ تحویل ساخته می‌شود. یادآوری دامنه: `dockerfile` و `registry` فقط در حد **نقششان در این زنجیره** نوشته می‌شوند؛ آموزش نوشتن داکرفایل، multi-stage و کش لایه‌ها بیرون است.

**Files:**
- Modify: `data/swarm/entries/delivery.json` (چهار مدخل اضافه، جمع ۶)
- Modify: `data/swarm/roadmap.json`

**Interfaces:**
- Consumes: `service`، `service-spec`، `swarm-node`، `pending-task`، `task-state`، `rollback`
- Produces: `dockerfile`، `registry`، `image-tag`، `image-pull`

### مدخل‌ها

**`dockerfile`** — داکرفایل / Dockerfile · tags: `delivery` `change` · related: `registry`، `image-tag`، `service`
بدنه: داکرفایل تعیین می‌کند ایمیج **چگونه ساخته شود** — و در این زنجیره فقط همین یک نقش را دارد. مکانیزم: `Dockerfile` → `docker build` → ایمیجِ نام‌گذاری‌شده؛ خروجی این مرحله ورودی مرحلهٔ بعد است و بس. جدول: **چهار جزء و چهار سؤال** — داکرفایل «چگونه ساخته شود»، رجیستری «کجا نگهداری شود»، فایل استک «چه چیزی مطلوب است»، سوارم «آن مطلوب را اجرا و حفظ کن». مثال بد: قاطی کردن این چهار مسئولیت، مثل ساختن ایمیج روی خود گرهٔ مدیر و پرش از رجیستری؛ آن ایمیج فقط روی همان گره وجود دارد و هر تسکی که جای دیگری زمان‌بندی شود شکست می‌خورد. دام: تصور اینکه داکرفایل به سوارم ربطی دارد — سوارم هرگز آن را نمی‌بیند.
دیاگرام: **جدول چهار جزء / چهار سؤال** · زنجیرهٔ Dockerfile ← build ← ایمیج.
مثال: `docker build -t registry.example.com/notification-api:v1.4.2 .` و توضیح انگلیسی هر بخش نام.

**`registry`** — رجیستری / Registry · tags: `delivery` `storage` · related: `dockerfile`، `image-tag`، `image-pull`
بدنه: رجیستری انبار ایمیج‌هاست، و مهم‌ترین چیزی که باید دربارهٔ آن بدانی این است که **رجیستری تصمیم نمی‌گیرد چه نسخه‌ای اجرا شود**. مکانیزم: رجیستری منفعل است؛ فقط ذخیره می‌کند و وقتی گره‌ای بخواهد تحویل می‌دهد. مثال بد: push کردن نسخهٔ تازه و انتظار اینکه کلاستر خودش برود سراغش — هیچ اتفاقی نمی‌افتد، چون هیچ‌چیز در سوارم رجیستری را نگاه نمی‌کند. جدول: چه کسی چه چیزی را می‌داند — رجیستری، سوارم، CI. ابهام: خصوصی بودن رجیستری یعنی گره‌ها هم باید اعتبار داشته باشند، که به مدخل کشیدن ایمیج وصل می‌شود.
دیاگرام: **جدول «چه کسی چه می‌داند»** · رجیستری با سه تگ و سه گره که از آن می‌کشند.
مثال: خروجی `docker push` و فهرست تگ‌های یک مخزن.

**`image-tag`** — تگ ایمیج / Image Tag · tags: `delivery` `change` · related: `registry`، `image-pull`، `service-spec`، `rollback`
بدنه: تگ نامی است که به یک ایمیج می‌چسبد — و در سوارم، تگ همان چیزی است که **تغییر مشخصات سرویس** را می‌سازد و در نتیجه به‌روزرسانی را راه می‌اندازد. مکانیزم: تگ متغیر است و می‌تواند فردا به ایمیج دیگری اشاره کند؛ digest تغییرناپذیر است. مثال بد: `image: my-api:latest`؛ چون رشتهٔ مشخصات عوض نمی‌شود، `docker stack deploy` هیچ کاری نمی‌کند، و اگر تسکی به هر دلیل بازسازی شود ممکن است ایمیج متفاوتی بکشد و کلاستر دو نسخه را هم‌زمان اجرا کند. جدول: تگ ثابت، تگ نسخه‌دار، digest — با ستون‌های «به‌روزرسانی راه می‌افتد؟»، «قابل بازگشت؟»، «تکرارپذیر؟». دام: نسخه‌دهی بر اساس شمارهٔ build که به کامیت وصل نیست.
دیاگرام: **جدول سه‌گانه** · خط زمانی یک تگ ثابت که سه بار به ایمیج‌های متفاوت اشاره می‌کند.
مثال: `image: registry.example.com/notification-api:${IMAGE_TAG}` و متغیرش، در کنار شکل digest.

**`image-pull`** — کشیدن ایمیج / Image Pull · tags: `delivery` `operations` · related: `registry`، `image-tag`، `swarm-node`، `pending-task`، `secret`
بدنه: ایمیج را **گره** می‌کشد نه مدیر، و این تفاوت جایی معلوم می‌شود که چیزی خراب شود. مکانیزم: هنگام `docker stack deploy` روی مدیر، اگر رجیستری خصوصی باشد باید `--with-registry-auth` بدهی تا اعتبار رجیستری همراه تعریف سرویس به گره‌ها برود؛ بدون آن، مدیر خوشحال است و تسک‌ها روی کارگرها با خطای احراز هویت شکست می‌خورند. مثال بد: استقراری که روی گرهٔ مدیر کار می‌کند و روی کارگرها نه، چون ایمیج قبلاً روی مدیر کش شده بود. جدول: **سه حالت خطا** هنگام کشیدن (احراز هویت، ایمیج ناموجود، رجیستری غیرقابل دسترس) با علامتشان در `docker service ps --no-trunc`. دام: کندیِ کشیدن ایمیج بزرگ که با تسک معلق اشتباه گرفته می‌شود — حالت `preparing` طولانی معمولاً یعنی همین.
دیاگرام: **جدول سه خطا** با ستون پیام · مسیر ایمیج از رجیستری به سه گره، نه از مدیر به گره‌ها.
مثال: `docker stack deploy -c stack.yml --with-registry-auth notification` و پیام خطای احراز هویت در `docker service ps`.

### مرحلهٔ نقشه

```json
{
  "id": "code-to-image",
  "fa": {
    "title": "از کد تا ایمیج",
    "why": "رجیستری تصمیم نمی‌گیرد چه نسخه‌ای اجرا شود؛ فهمیدن این، نصفِ فهمیدن CI/CD با سوارم است"
  },
  "en": {
    "title": "From code to image",
    "why": "A registry never decides which version runs, and understanding that is half of understanding CI/CD on Swarm"
  },
  "entries": ["dockerfile", "registry", "image-tag", "image-pull"]
}
```

- [ ] **Step 1: چهار مدخل را به `delivery.json` اضافه کن**
- [ ] **Step 2: `node --test` → باید قرمز شود** با «dockerfile, registry, image-tag, image-pull»
- [ ] **Step 3: مرحلهٔ `code-to-image` را به `roadmap.json` اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 6: کامیت**

```bash
git add data/swarm
git commit -m "feat: build and store the image, and stop there

Four entries on the half of the chain that happens before Swarm sees
anything. The registry is passive: pushing a new image changes
nothing, because nothing in a swarm is watching it."
```

---

## Task 12: مرحلهٔ ۱۲ — از ایمیج تا کلاستر (۴ مدخل)

**Files:**
- Modify: `data/swarm/entries/delivery.json` (چهار مدخل اضافه، جمع ۱۰)
- Modify: `data/swarm/roadmap.json`

**Interfaces:**
- Consumes: `stack`، `stack-file`، `service`، `desired-state`، `service-spec`، `rolling-update`، `image-tag`، `secret`، `overlay-network`
- Produces: `stack-deploy`، `compose-vs-stack`، `multi-stack`، `deploy-configuration`

### مدخل‌ها

**`stack-deploy`** — استقرار استک / docker stack deploy · tags: `delivery` `change` · related: `stack`، `stack-file`، `desired-state`، `rolling-update`، `service-spec`
بدنه: `docker stack deploy` تنها لحظه‌ای است که وضعیت مطلوبِ روی کاغذ به وضعیت مطلوبِ کلاستر تبدیل می‌شود. مکانیزم: دستور فایل را می‌خواند، متغیرها را جایگذاری می‌کند، مشخصات هر سرویس را می‌سازد، و آن را با مشخصات فعلی مقایسه می‌کند — سرویس تازه ساخته می‌شود، سرویس تغییریافته به‌روزرسانی می‌شود، و سرویس بی‌تغییر دست‌نخورده می‌ماند. **همان دستور برای بار اول و بار صدم**، که خاصیت اعلانی بودن است. جدول: چه چیزی هنگام استقرار دوباره حذف می‌شود و چه چیزی نه (سرویسِ حذف‌شده از فایل با `--prune` می‌رود، والیوم‌ها هرگز). مثال بد: انتظار اینکه حذف یک سرویس از فایل خودبه‌خود آن را از کلاستر بردارد. دام: فراموش کردن `--with-registry-auth` روی رجیستری خصوصی.
دیاگرام: **جدول تصمیم** برای سه حالت سرویس (تازه، تغییریافته، بی‌تغییر) · جریان فایل ← مشخصات ← مقایسه ← اقدام.
مثال: `docker stack deploy -c stack.yml --with-registry-auth --prune notification` و خروجی‌اش.

**`compose-vs-stack`** — کامپوز در برابر استک / Compose vs Stack · tags: `delivery` `boundary` · related: `stack-file`، `stack-deploy`، `service`، `restart-policy`
بدنه: یک فایل، دو مصرف‌کننده با قابلیت‌های متفاوت — و منبع پرتکرارترین سردرگمی مهاجرت. مکانیزم: `docker compose` بخش `deploy:` را تا حد زیادی نادیده می‌گیرد، و `docker stack deploy` مجموعه‌ای از کلیدهای Compose را نادیده می‌گیرد: `build`، `depends_on`، `restart`، `container_name`، `links`. **و بی‌صدا نادیده می‌گیرد.** جدول: **کلید به کلید** با سه ستون (Compose، Stack، اگر اشتباه بگیری چه می‌شود) — مهم‌ترین سطرش `build` است، چون یعنی استک نمی‌سازد و فقط ایمیج آماده می‌خواهد، و بعد `depends_on`، چون یعنی ترتیب راه‌اندازی تضمین نمی‌شود و برنامه باید خودش تحمل کند. دام: چند-فایلی `-f` را از Compose به Stack تعمیم دادن.
دیاگرام: **جدول کلیدها** با ستون «بی‌صدا نادیده گرفته می‌شود» · یک فایل با دو مصرف‌کننده.
مثال: فایلی که هر دو `build` و `image` دارد، با توضیح انگلیسی رفتار متفاوت دو دستور.

**`multi-stack`** — چند استک / Multiple Stacks · tags: `delivery` `boundary` · related: `stack`، `stack-deploy`، `overlay-network`، `service-discovery`
بدنه: وقتی فایل استک شلوغ می‌شود، شکستنش به چند استک با چرخهٔ عمر مستقل معمولاً بهتر از بزرگ‌تر کردنش است. مکانیزم: هر استک جدا `deploy` و `rm` می‌شود؛ برای اینکه سرویس‌های دو استک همدیگر را ببینند باید یک شبکهٔ روپوشِ **بیرونی** مشترک داشته باشند (`external: true`) — و این تنها قید واقعی این تقسیم است. جدول: **سه راه** رویارویی با فایل شلوغ (چند استک، تولید فایل از قالب، چند فایل Compose) با مزیت و هزینهٔ هرکدام و اینکه کدام در سوارم واقعاً کار می‌کند. مثال: تقسیم به `notification-app`، `notification-infra`، `notification-monitoring`؛ زیرساخت ماه‌ها دست نمی‌خورد و برنامه روزی چند بار مستقر می‌شود. دام: شکستن روی مرز فنی به‌جای مرز چرخهٔ عمر.
دیاگرام: **جدول سه راه** · سه استک روی یک شبکهٔ مشترک بیرونی.
مثال: `networks: { backend: { external: true } }` در دو فایل استک.

**`deploy-configuration`** — پیکربندی استقرار / Deployment Configuration · tags: `delivery` `change` · related: `stack-file`، `image-tag`، `desired-state`، `secret`، `stack-deploy`
بدنه: پیکربندی استقرار یعنی همهٔ آنچه لازم است تا از یک ایمیج به یک استقرار مشخص برسی: فایل استک، مقدار متغیرها، رازها، و پارامترهای محیط. مکانیزم: این پیکربندی سه جای معتبر دارد — کنار کد، ریپوی جدا، یا روی خود سرور — و هیچ‌کدام اجباری نیست؛ آنچه اهمیت دارد این است که **در همهٔ حالت‌ها CI باید مقدار متغیرها را به محیطی که `deploy` در آن اجرا می‌شود برساند**. مثال بد: تصور اینکه متغیرهای محیطی GitHub Actions خودبه‌خود روی سرور در دسترس‌اند. جدول: سه جای نگهداری با ستون‌های «چه کسی تغییرش می‌دهد»، «تاریخچه دارد؟»، «برای چه تیمی مناسب است». دام: نگه داشتن رمز واقعی در فایل استکِ داخل ریپو.
دیاگرام: **جدول سه‌جا** · فایل استک به‌علاوهٔ متغیرها که با هم یک استقرار مشخص می‌سازند.
مثال: ساختار پوشهٔ `notification-service/deploy/stack.yml` در کنار حالت `/opt/app/stack.yml`.

### مرحلهٔ نقشه

```json
{
  "id": "image-to-cluster",
  "fa": {
    "title": "از ایمیج تا کلاستر",
    "why": "یک فایل و دو مصرف‌کننده با قابلیت‌های متفاوت؛ آنچه Stack نادیده می‌گیرد بی‌صدا نادیده گرفته می‌شود"
  },
  "en": {
    "title": "From image to cluster",
    "why": "One file, two consumers with different capabilities — and what a stack ignores, it ignores silently"
  },
  "entries": ["stack-deploy", "compose-vs-stack", "multi-stack", "deploy-configuration"]
}
```

- [ ] **Step 1: چهار مدخل را به `delivery.json` اضافه کن**
- [ ] **Step 2: `node --test` → باید قرمز شود** با «stack-deploy, compose-vs-stack, multi-stack, deploy-configuration»
- [ ] **Step 3: مرحلهٔ `image-to-cluster` را به `roadmap.json` اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 6: کامیت**

```bash
git add data/swarm
git commit -m "feat: turn a stack file into cluster state

The same command for the first deploy and the hundredth. The
key-by-key table of what a stack silently ignores — build,
depends_on, restart — is the antidote to the most common failed
migration from Compose."
```

---

## Task 13: مرحلهٔ ۱۳ — خودکار کردنش (۴ مدخل)

**Files:**
- Modify: `data/swarm/entries/delivery.json` (چهار مدخل اضافه، جمع ۱۴ — کامل)
- Modify: `data/swarm/roadmap.json`

**Interfaces:**
- Consumes: `dockerfile`، `registry`، `image-tag`، `image-pull`، `stack-deploy`، `deploy-configuration`، `desired-state`، `service-spec`، `rolling-update`، `manager-node`، `secret`، `task`
- Produces: `ci-cd-pipeline`، `ssh-deploy`، `gitops`، `delivery-chain`

### مدخل‌ها

**`ci-cd-pipeline`** — خط لولهٔ تحویل / CI/CD Pipeline · tags: `delivery` `change` · related: `dockerfile`، `registry`، `stack-deploy`، `image-tag`
بدنه: خط لوله زنجیره‌ای از مراحل خودکار است که از یک کامیت شروع می‌شود و به وضعیت مطلوبِ تازه روی کلاستر می‌رسد. مکانیزم شش‌مرحله‌ای: آزمون ← ساخت ایمیج ← push به رجیستری ← تعیین تگ ← رساندن تگ به محیط استقرار ← `stack deploy`. **قدم چهارم و پنجم همان‌جایی است که بیشتر خط لوله‌ها می‌شکنند**، چون فرض می‌شود متغیرهای CI به‌طور جادویی روی سرور هستند. جدول: هر مرحله با «کجا اجرا می‌شود» و «اگر شکست بخورد چه چیزی نیمه‌کاره می‌ماند». مثال بد: خط لوله‌ای که بعد از `stack deploy` بلافاصله سبز گزارش می‌دهد، در حالی که به‌روزرسانی چرخشی هنوز در جریان است و ممکن است شکست بخورد. دام: نبود مرحلهٔ تأیید بعد از استقرار.
دیاگرام: **جدول مراحل** با ستون «کجا اجرا می‌شود» · زنجیرهٔ شش‌مرحله‌ای از کامیت تا تسک.
مثال: شش مرحلهٔ یک workflow به‌شکل فهرست فرمان، با کامنت انگلیسی.

**`ssh-deploy`** — استقرار با SSH / Deploying over SSH · tags: `delivery` `security` · related: `ci-cd-pipeline`، `stack-deploy`، `manager-node`، `secret`
بدنه: ساده‌ترین و رایج‌ترین راه رساندن دستور استقرار به کلاستر: CI با SSH به یک گرهٔ مدیر وصل می‌شود و `docker stack deploy` را همان‌جا اجرا می‌کند. مکانیزم: متغیرها در همان خط فرمان به محیط اجرای دستور داده می‌شوند، چون محیط CI و محیط سرور دو دنیای جدا هستند. جدول: **سه راه** رساندن دستور — SSH، سوکت داکر روی TLS، و عاملی که روی کلاستر می‌نشیند — با ستون‌های سطح دسترسی و پیچیدگی راه‌اندازی. مثال بد: کلید SSH با دسترسی کامل ریشه روی همهٔ گره‌ها به‌عنوان راز CI؛ لو رفتنش یعنی کل کلاستر. دام: وابسته شدن به یک گرهٔ مدیر مشخص در اسکریپت استقرار، که با تعویض آن ماشین می‌شکند.
دیاگرام: **جدول سه راه** با ستون «چه چیزی را در معرض می‌گذارد» · مسیر متغیر از CI تا محیط اجرای دستور.
مثال: `ssh user@server "IMAGE_TAG=${IMAGE_TAG} docker stack deploy -c /opt/app/stack.yml notification"` با شکافتن هر بخش.

**`gitops`** — گیت‌آپس / GitOps · tags: `delivery` `boundary` · related: `ci-cd-pipeline`، `desired-state`، `stack-file`، `stack-deploy`
بدنه: گیت‌آپس یعنی مخزن گیت تنها منبع حقیقتِ وضعیت مطلوب باشد و چیزی مدام کلاستر را با آن هماهنگ کند. مکانیزم و تفاوت اصلی با خط لولهٔ معمولی: در مدل **push** ای که در سوارم رایج است، CI تغییر را به کلاستر هل می‌دهد؛ در مدل **pull** ای که گیت‌آپس می‌گوید، عاملی داخل کلاستر گیت را می‌خواند و انحراف را برمی‌گرداند. اینجا جای Argo CD است: ابزار GitOps برای کوبرنتیز، که مدل استقرار سوارم را نمی‌شناسد و ابزار اصلی مدیریت سوارم نیست. جدول: push در برابر pull در چهار ستون، با ستون «تغییر دستی روی کلاستر چه می‌شود». دام: گفتن «گیت‌آپس داریم» به یک خط لولهٔ push ای — تفاوت در تشخیص انحراف است، نه در اینکه فایل در گیت باشد.
دیاگرام: **جدول push/pull** · دو جریان، یکی از CI به کلاستر و یکی از کلاستر به گیت.
مثال: مقایسهٔ دو جریان به‌شکل فهرست فرمان، با توضیح انگلیسی اینکه در کدام‌یک تغییر دستی برگردانده می‌شود.

**`delivery-chain`** — زنجیرهٔ تحویل / The Delivery Chain · tags: `delivery` `change` · related: `ci-cd-pipeline`، `registry`، `stack-deploy`، `desired-state`، `task`، `image-tag`
بدنه: مدل ذهنی نهایی موضوع، همان چیزی که جزوه با آن تمام می‌شود: کد ← CI ← ایمیج ← رجیستری ← پیکربندی استقرار ← سوارم ← تسک ← کانتینر. مکانیزم: هر حلقه دقیقاً یک مسئولیت دارد و **هیچ حلقه‌ای از حلقهٔ بعدی خبر ندارد** — رجیستری نمی‌داند چه نسخه‌ای باید اجرا شود، سوارم از رجیستری نمی‌پرسد آخرین نسخه چیست، و CI است که وضعیت مطلوب تازه را می‌دهد. جدول: **هر حلقه با سه ستون** — چه چیزی می‌داند، چه چیزی نمی‌داند، اگر بشکند چه علامتی می‌دهد. مثال بد: هر باوری که یک حلقه را از حلقهٔ دیگر باخبر فرض کند؛ همهٔ سوءتفاهم‌های رایج CI/CD در سوارم از همین یک خطا می‌آیند. این مدخل چیزی نو معرفی نمی‌کند و کارش بستن است.
دیاگرام: **جدول هشت حلقه** با سه ستون · زنجیرهٔ کامل از کد تا کانتینر.
مثال: یک استقرار کامل از `git push` تا `docker service ps` که نسخهٔ تازه را نشان می‌دهد، به‌شکل هشت فرمان پشت سر هم.

### مرحلهٔ نقشه

```json
{
  "id": "automating-it",
  "fa": {
    "title": "خودکار کردنش",
    "why": "هیچ حلقه‌ای از حلقهٔ بعدی خبر ندارد؛ همهٔ سوءتفاهم‌های CI/CD در سوارم از فراموش کردن همین می‌آیند"
  },
  "en": {
    "title": "Automating it",
    "why": "No link in the chain knows about the next one, and every CI/CD misunderstanding on Swarm comes from forgetting that"
  },
  "entries": ["ci-cd-pipeline", "ssh-deploy", "gitops", "delivery-chain"]
}
```

- [ ] **Step 1: چهار مدخل را به `delivery.json` اضافه کن**
- [ ] **Step 2: `node --test` → باید قرمز شود** با «ci-cd-pipeline, ssh-deploy, gitops, delivery-chain»
- [ ] **Step 3: مرحلهٔ `automating-it` را به `roadmap.json` اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر**
- [ ] **Step 6: کامیت**

```bash
git add data/swarm
git commit -m "feat: close the chain from a commit to a container

Code, CI, image, registry, deploy configuration, swarm, tasks,
containers. Each link knows only its own job, and the entry on the
chain exists to make that ignorance explicit rather than surprising."
```

---

## Task 14: مرحلهٔ ۱۴ — مرزها (۴ مدخل)

آخرین تسک. بعد از آن هر هشت دسته کامل‌اند و موضوع تمام است.

**Files:**
- Modify: `data/swarm/entries/boundaries.json` (چهار مدخل اضافه، جمع ۶ — کامل)
- Modify: `data/swarm/roadmap.json`

**Interfaces:**
- Consumes: `routing-mesh`، `reverse-proxy`، `scaling`، `swarm-monitoring`، `distributed-storage`، `database-ha`، `swarm`، `desired-state`، `control-plane`، `microservices`
- Produces: `geo-routing`، `autoscaling`، `what-swarm-does-not-do`، `swarm-vs-kubernetes`

### مدخل‌ها

**`geo-routing`** — مسیریابی جغرافیایی / Geo Routing · tags: `network` `boundary` · related: `routing-mesh`، `reverse-proxy`، `api-gateway`
بدنه: مسیریابی جغرافیایی یعنی هر کاربر به نزدیک‌ترین یا مناسب‌ترین محل جغرافیایی برود — و مش مسیریابی برای این ساخته نشده. مکانیزم: مش مسیریابی هیچ مفهومی از موقعیت ندارد؛ درخواستی که به گرهٔ ایتالیا می‌رسد ممکن است به تسکی در فرانسه برود، حتی اگر تسک محلی وجود داشته باشد. جدول: **سه لایه‌ای که این کار در آن‌ها انجام می‌شود** — DNS جغرافیایی، توزیع‌کنندهٔ بار لبه، و کلاسترهای جدا به‌ازای منطقه — با ستون‌های دقت، هزینه، و پیچیدگی. مثال بد: پخش کردن گره‌های یک کلاستر در سه قاره به امید نزدیکی به کاربر؛ نتیجه هم کاربر دور می‌ماند و هم رفت با تأخیر بین‌قاره‌ای می‌جنگد. دام: تصور اینکه انتشار در حالت host این را حل می‌کند — تسک را محلی می‌کند ولی کاربر را همچنان هرجا که DNS بگوید می‌فرستد.
دیاگرام: **جدول سه لایه** · درخواستی از ایتالیا که به تسکی در فرانسه می‌رسد.
مثال: خروجی `curl` از یک گره که نام میزبان تسکی در کشور دیگر را برمی‌گرداند.

**`autoscaling`** — مقیاس‌دهی خودکار / Autoscaling · tags: `change` `boundary` · related: `scaling`، `horizontal-scaling`، `swarm-monitoring`، `desired-state`
بدنه: سوارم مقیاس‌دهی خودکار **ندارد**. تعداد نمونه‌ها عددی است که تو می‌دهی و تا وقتی خودت عوضش نکنی همان می‌ماند. مکانیزم: چیزی که در کوبرنتیز به‌شکل HPA داخلی است، اینجا باید بیرون ساخته شود — چیزی معیار را بخواند، تصمیم بگیرد، و `docker service scale` بزند. جدول: **چهار جزء** یک مقیاس‌دهندهٔ خودکارِ دست‌ساز (منبع معیار، قاعدهٔ تصمیم، تأخیر خنک‌شدن، سقف و کف) با «اگر این را جا بیندازی چه می‌شود» — و سطر تأخیر خنک‌شدن مهم‌ترین است، چون بدون آن نوسان می‌سازی. مثال بد: مقیاس‌دهندهٔ خودکار روی سرویسی که به یک والیوم محلی چسبیده. ابهام: مقیاس‌دهی خودکارِ **گره** مسئلهٔ جداگانه و سخت‌تری است و اصلاً در قلمرو سوارم نیست.
دیاگرام: **جدول چهار جزء** · حلقهٔ معیار ← تصمیم ← scale، با تأخیر خنک‌شدن.
مثال: اسکریپت کوتاهی که معیار را می‌خواند و `docker service scale` می‌زند، با کامنت انگلیسی دربارهٔ خنک‌شدن.

**`what-swarm-does-not-do`** — کاری که سوارم نمی‌کند / What Swarm Does Not Do · tags: `boundary` `operations` · related: `distributed-storage`، `database-ha`، `geo-routing`، `autoscaling`، `swarm-monitoring`
بدنه: جمع‌بندی همهٔ «نه»های موضوع در یک جا، چون فهرست کارهایی که یک ابزار **نمی‌کند** معمولاً سریع‌تر از فهرست کارهایش تو را به تصمیم درست می‌رساند. مکانیزم: هر «نه» یک مرز مسئولیت است نه یک نقص؛ سوارم عمداً کوچک است. جدول اصلی مدخل، **هشت سطری**: تکثیر داده، دسترس‌پذیری بالای پایگاه داده، مسیریابی جغرافیایی، مقیاس‌دهی خودکار، داشبورد، پایش، مدیریت راز در سطح سازمان، و ترتیب راه‌اندازی سرویس‌ها — هرکدام با ستون‌های «چه کسی این کار را می‌کند» و «اگر فرض کنی سوارم می‌کند چه می‌شود». مثال بد: هر معماری‌ای که یکی از این هشت را نانوشته به سوارم واگذار کرده باشد.
دیاگرام: **جدول هشت‌سطری مسئولیت** · دایرهٔ کوچک سوارم داخل دایرهٔ بزرگ‌ترِ آنچه یک استقرار واقعی لازم دارد.
مثال: فهرست هشت‌تایی به‌شکل کامنت انگلیسی کنار نام ابزار متداول هر ردیف.

**`swarm-vs-kubernetes`** — سوارم در برابر کوبرنتیز / Swarm vs Kubernetes · tags: `boundary` `operations` · related: `what-swarm-does-not-do`، `control-plane`، `swarm`، `microservices`
بدنه: مقایسه‌ای که دربارهٔ **تفاوت مدل‌ها** است نه فهرست قابلیت‌ها — چون فهرست قابلیت‌ها ظرف یک سال کهنه می‌شود و تفاوت مدل نمی‌شود. مکانیزم: سه تفاوت بنیادی — واحد پایه (تسک در برابر پاد)، سطح توسعه‌پذیری (سوارم بسته و ثابت، کوبرنتیز با API قابل گسترش و اپراتورها)، و هزینهٔ ورود (چند دستور در برابر یک صفحهٔ کنترل که خودش نگهداری می‌خواهد). جدول: **پنج معیار تصمیم** با ستون «اگر این برایت صدق می‌کند کدام را انتخاب کن» — تعداد گره، تعداد آدمی که کلاستر را نگه می‌دارد، نیاز به توسعه‌پذیری، بودجهٔ عملیاتی، و بلوغ تیم. مثال بد: انتخاب کوبرنتیز برای سه ماشین و دو نفر، یا انتخاب سوارم وقتی چیزی می‌خواهی که فقط با اپراتور ساخته می‌شود. جملهٔ پایانی موضوع: مرز درست، تعداد چیزهایی است که تیم می‌تواند هم‌زمان بفهمد.
دیاگرام: **جدول پنج معیار تصمیم** · دو مدل کنار هم با واحد پایهٔ متفاوت.
مثال: همان سرویس، یک بار به‌شکل `stack.yml` سوارم و یک بار به‌شکل تعریف کوبرنتیز، برای نشان دادن تفاوت اندازه و مفاهیم.

### مرحلهٔ نقشه

```json
{
  "id": "the-boundaries",
  "fa": {
    "title": "مرزها",
    "why": "فهرست کارهایی که سوارم نمی‌کند، سریع‌تر از فهرست کارهایش تو را به تصمیم درست می‌رساند"
  },
  "en": {
    "title": "The boundaries",
    "why": "The list of what Swarm does not do gets you to the right decision faster than the list of what it does"
  },
  "entries": ["geo-routing", "autoscaling", "what-swarm-does-not-do", "swarm-vs-kubernetes"]
}
```

- [ ] **Step 1: چهار مدخل را به `boundaries.json` اضافه کن**
- [ ] **Step 2: `node --test` → باید قرمز شود** با «geo-routing, autoscaling, what-swarm-does-not-do, swarm-vs-kubernetes»
- [ ] **Step 3: مرحلهٔ `the-boundaries` را به `roadmap.json` اضافه کن**
- [ ] **Step 4: `node --test` → باید سبز شود**
- [ ] **Step 5: `node serve.js` و `#/self-test` → همه صفر؛ نقشهٔ راه هر سه موضوع در هر دو زبان باز شود**
- [ ] **Step 6: کامیت**

```bash
git add data/swarm
git commit -m "feat: draw the edge of what Swarm is for

Eight things it deliberately does not do, and a comparison with
Kubernetes written about the difference in model rather than a
feature list, because feature lists go stale in a year and models
do not."
```

---

## بعد از تسک ۱۴

موضوع کامل است: ۷۸ مدخل، ۸ دسته، ۱۴ مرحله. بررسی پایانی:

- [ ] `node --test` سبز
- [ ] `#/self-test` صفر خطا در هر چهار دسته گزارش
- [ ] `git diff --stat main..` هیچ فایلی زیر `assets/` یا `test/` ندارد
- [ ] هر سه موضوع در هر دو زبان باز می‌شوند و سوییچ موضوع کار می‌کند
- [ ] جست‌وجو از داخل فیلتر موضوع سوارم، مدخلی از کریپتو یا معماری را پیدا می‌کند (رفتار عمدی جست‌وجو)
