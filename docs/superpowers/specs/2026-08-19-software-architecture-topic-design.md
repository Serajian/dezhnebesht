# طراحی: موضوع «معماری نرم‌افزار»

تاریخ: ۲۰۲۶-۰۸-۱۹

## هدف

افزودن دومین موضوع سایت: **معماری نرم‌افزار**، شامل ۱۲۰ مدخل در ۷ دسته و یک مسیر یادگیری ۱۵ مرحله‌ای.

منبع ساختار و ترتیب، یک درس‌نامهٔ فارسی ۱۷ فصلی است که کاربر تهیه کرده (`software-architecture-darsname.md`). آن فایل **اسکلت** است نه محتوا: ترتیب فصل‌ها، تقسیم‌بندی مفاهیم و لحن آموزشی از آن گرفته می‌شود، اما بدنهٔ هر مدخل با همان عمقی نوشته می‌شود که مدخل‌های پختهٔ موضوع کریپتو دارند — که از ظرفیت آن فایل بیشتر است.

موضوع کریپتو تا امروز ۴۷ مدخل دارد. این موضوع بیش از دو برابر آن است، پس در ۶ فاز ساخته می‌شود که بعد از هر کدام سایت سالم و آزمون‌ها سبز باشند.

## آنچه دست نمی‌خورد

طبق قاعدهٔ خود پروژه، افزودن مدخل نباید به کد کار داشته باشد. این طراحی بررسی شد و آن قاعده اینجا برقرار است:

- `data.js:217` روی `topics.map` می‌چرخد و همهٔ موضوع‌ها را موازی لود می‌کند.
- `roadmap.js:17` تابع `validateRoadmap(roadmap, entries, topicId)` را per-topic صدا می‌زند و `progressKey(topicId)` پیشرفت هر موضوع را جدا نگه می‌دارد.
- `render.js:255` دکمهٔ نقشهٔ راه را با `#/roadmap/<topicId>` می‌سازد.

**هیچ فایلی زیر `assets/js/` تغییر نمی‌کند.** اگر در حین اجرا معلوم شد که تغییری لازم است، آن یک مسئلهٔ جداست و باید جدا مطرح شود.

**اما یک فایل آزمون باید تغییر کند.** `test/roadmap-order.test.mjs:10` با `const TOPIC = 'crypto'` به یک موضوع قفل است. یعنی گاردی که CLAUDE.md وعده می‌دهد — «مدخل تازه تا وقتی روی مسیر ننشیند `node --test` را قرمز نگه می‌دارد» — برای این موضوع اصلاً کار نمی‌کند. پیش از نوشتن اولین مدخل، این آزمون باید روی همهٔ موضوع‌های `topics.json` بچرخد، با فهرست استثنای جدا برای هر موضوع. این تغییر آزمون است نه کد سایت، و با معیار پذیرش ۳ تعارضی ندارد.

## ساختار فایل‌ها

```
data/
  topics.json                      ← یک سطر اضافه می‌شود
  architecture/                    ← پوشهٔ جدید
    categories.json                ← فاز‌به‌فاز رشد می‌کند
    roadmap.json                   ← فاز‌به‌فاز رشد می‌کند
    entries/
      foundations.json    ۱۸ مدخل
      principles.json      ۸ مدخل
      styles.json         ۲۶ مدخل
      domain.json         ۱۴ مدخل
      communication.json  ۲۰ مدخل
      distributed.json    ۲۰ مدخل
      decisions.json      ۱۴ مدخل
```

### `data/topics.json`

```json
{ "id": "architecture", "fa": "معماری نرم‌افزار", "en": "Software Architecture" }
```

### `data/architecture/categories.json`

| id | فایل | فارسی | English |
|---|---|---|---|
| `foundations` | foundations.json | مبانی | Fundamentals |
| `principles` | principles.json | اصول و تزریق | Principles & Injection |
| `styles` | styles.json | سبک‌های معماری | Architectural Styles |
| `domain` | domain.json | دامنه و DDD | Domain & DDD |
| `communication` | communication.json | ارتباط و رویداد | Communication & Events |
| `distributed` | distributed.json | سیستم توزیع‌شده | Distributed Systems |
| `decisions` | decisions.json | تصمیم و کیفیت | Decisions & Quality |

## مسیر یادگیری

دسته و مرحله دو چیز جدا هستند — دقیقاً مثل موضوع کریپتو. **دسته** یعنی مدخل در کدام فایل زندگی می‌کند؛ **مرحله** یعنی خواننده کِی به آن می‌رسد. چند مدخل عمداً در مرحله‌ای خارج از دستهٔ خودشان قرار گرفته‌اند و دلیلش زیر جدول آمده.

ترتیب مرحله‌ها باید **وابستگی‌درست** باشد، چون `test/roadmap-order.test.mjs` ارجاع‌های «مدخل ‹عنوان›» را از بدنه و مثال فارسی می‌خواند و هر مدخلی که پیش از پیش‌نیازش بیاید آزمون را قرمز می‌کند.

### مرحلهٔ ۱ — مسئله چیست (۶)

| شناسه | فارسی | دسته |
|---|---|---|
| `software-architecture` | معماری نرم‌افزار | foundations |
| `complexity` | پیچیدگی | foundations |
| `accidental-complexity` | پیچیدگی عارضی و ذاتی | foundations |
| `coupling` | جفت‌شدگی | foundations |
| `cohesion` | انسجام | foundations |
| `separation-of-concerns` | تفکیک دغدغه‌ها | foundations |

### مرحلهٔ ۲ — واحدهای ساختار (۶)

| شناسه | فارسی | دسته |
|---|---|---|
| `module` | ماژول | foundations |
| `information-hiding` | پنهان‌سازی اطلاعات | foundations |
| `package` | پکیج | foundations |
| `component` | کامپوننت | foundations |
| `layer` | لایه | foundations |
| `boundary` | مرز | foundations |

### مرحلهٔ ۳ — وابستگی و جهتش (۶)

| شناسه | فارسی | دسته |
|---|---|---|
| `dependency` | وابستگی | foundations |
| `interface` | اینترفیس | foundations |
| `circular-dependency` | وابستگی حلقوی | foundations |
| `dependency-direction` | جهت وابستگی | foundations |
| `dependency-inversion` | وارونگی وابستگی | foundations |
| `leaky-abstraction` | انتزاع نشت‌کننده | foundations |

### مرحلهٔ ۴ — اصول SOLID (۵)

| شناسه | فارسی | دسته |
|---|---|---|
| `solid` | اصول SOLID | principles |
| `single-responsibility` | اصل مسئولیت واحد | principles |
| `open-closed` | اصل باز/بسته | principles |
| `liskov-substitution` | اصل جایگزینی لیسکوف | principles |
| `interface-segregation` | اصل جداسازی اینترفیس | principles |

### مرحلهٔ ۵ — سیم‌کشی (۳)

| شناسه | فارسی | دسته |
|---|---|---|
| `dependency-injection` | تزریق وابستگی | principles |
| `composition-root` | ریشهٔ ترکیب | principles |
| `testability` | آزمون‌پذیری | principles |

### مرحلهٔ ۶ — اولین سبک (۳)

| شناسه | فارسی | دسته |
|---|---|---|
| `layered-architecture` | معماری لایه‌ای | styles |
| `use-case` | مورد کاربرد | styles |
| `business-rule` | قاعدهٔ کسب‌وکار | domain |

### مرحلهٔ ۷ — سبک‌های مرزمحور (۶)

| شناسه | فارسی | دسته |
|---|---|---|
| `port` | پورت | styles |
| `adapter` | آداپتور | styles |
| `hexagonal-architecture` | معماری شش‌ضلعی | styles |
| `dependency-rule` | قانون وابستگی | styles |
| `clean-architecture` | معماری تمیز | styles |
| `onion-architecture` | معماری پیازی | styles |

### مرحلهٔ ۸ — دامنه (۱۲)

| شناسه | فارسی | دسته |
|---|---|---|
| `domain` | دامنه | domain |
| `domain-model` | مدل دامنه | domain |
| `entity` | موجودیت | domain |
| `value-object` | شیء مقداری | domain |
| `invariant` | نامتغیر | domain |
| `aggregate` | اگریگیت | domain |
| `repository` | مخزن | domain |
| `anemic-domain-model` | مدل دامنهٔ کم‌خون | domain |
| `bounded-context` | بافت محدود | domain |
| `anti-corruption-layer` | لایهٔ ضدفساد | domain |
| `ubiquitous-language` | زبان مشترک | domain |
| `domain-driven-design` | طراحی دامنه‌محور | domain |

### مرحلهٔ ۹ — اندازهٔ سیستم (۸)

| شناسه | فارسی | دسته |
|---|---|---|
| `monolith` | مونولیت | styles |
| `big-ball-of-mud` | گلولهٔ گِل بزرگ | styles |
| `modular-monolith` | مونولیت ماژولار | styles |
| `microservices` | میکروسرویس | styles |
| `conways-law` | قانون کانوی | decisions |
| `api-gateway` | دروازهٔ API | styles |
| `backend-for-frontend` | بک‌اند برای فرانت‌اند | styles |
| `strangler-fig` | الگوی انجیر خفه‌کن | styles |

### مرحلهٔ ۱۰ — حرف زدن سرویس‌ها (۱۰)

| شناسه | فارسی | دسته |
|---|---|---|
| `synchronous-communication` | ارتباط همزمان | communication |
| `asynchronous-communication` | ارتباط غیرهمزمان | communication |
| `rest` | REST | communication |
| `grpc` | gRPC | communication |
| `command` | فرمان | communication |
| `event` | رویداد | communication |
| `domain-event` | رویداد دامنه | domain |
| `message-broker` | بروکر پیام | communication |
| `queue` | صف | communication |
| `pub-sub` | انتشار و اشتراک | communication |

### مرحلهٔ ۱۱ — شکست توزیع‌شده (۱۲)

| شناسه | فارسی | دسته |
|---|---|---|
| `distributed-system` | سیستم توزیع‌شده | distributed |
| `timeout` | تایم‌اوت | distributed |
| `retry` | تلاش دوباره | distributed |
| `transient-failure` | خطای موقت | distributed |
| `exponential-backoff` | عقب‌نشینی نمایی | distributed |
| `circuit-breaker` | کلید قطع‌کن | distributed |
| `backpressure` | فشار برگشتی | distributed |
| `idempotency` | ایدمپوتنسی | distributed |
| `idempotency-key` | کلید ایدمپوتنسی | distributed |
| `at-least-once-delivery` | تحویل حداقل یک‌بار | communication |
| `dead-letter-queue` | صف نامه‌های مرده | communication |
| `ordering` | ترتیب | distributed |

### مرحلهٔ ۱۲ — سازگاری (۱۳)

| شناسه | فارسی | دسته |
|---|---|---|
| `consistency` | سازگاری | distributed |
| `strong-consistency` | سازگاری قوی | distributed |
| `eventual-consistency` | سازگاری نهایی | distributed |
| `replication` | تکثیر | distributed |
| `partitioning` | پارتیشن‌بندی | distributed |
| `leader-election` | انتخاب رهبر | distributed |
| `cap-theorem` | قضیهٔ CAP | distributed |
| `distributed-transaction` | تراکنش توزیع‌شده | distributed |
| `two-phase-commit` | تعهد دوفازی | distributed |
| `outbox-pattern` | الگوی صندوق خروجی | communication |
| `saga` | الگوی ساگا | distributed |
| `choreography` | کرئوگرافی | communication |
| `orchestration` | ارکستراسیون | communication |

### مرحلهٔ ۱۳ — رویدادمحور (۸)

| شناسه | فارسی | دسته |
|---|---|---|
| `event-driven-architecture` | معماری رویدادمحور | communication |
| `producer-consumer` | تولیدکننده و مصرف‌کننده | communication |
| `event-contract` | قرارداد رویداد | communication |
| `event-envelope` | پاکت رویداد | communication |
| `schema-versioning` | نسخه‌بندی اسکیما | communication |
| `event-chaining` | زنجیرهٔ رویداد | communication |
| `cqrs` | CQRS | styles |
| `event-sourcing` | منبع رویداد | styles |

### مرحلهٔ ۱۴ — سبک‌های دیگر (۹)

| شناسه | فارسی | دسته |
|---|---|---|
| `vertical-slice-architecture` | معماری برش عمودی | styles |
| `screaming-architecture` | معماری فریادزن | styles |
| `pipes-and-filters` | لوله‌ها و فیلترها | styles |
| `soa` | معماری سرویس‌گرا | styles |
| `serverless` | سرورلس | styles |
| `actor-model` | مدل بازیگر | styles |
| `peer-to-peer` | همتا به همتا | styles |
| `data-mesh` | دیتا مش | styles |
| `service-mesh` | سرویس مش | styles |

### مرحلهٔ ۱۵ — تصمیم و کیفیت (۱۳)

| شناسه | فارسی | دسته |
|---|---|---|
| `non-functional-requirements` | نیازمندی‌های غیرکارکردی | decisions |
| `availability` | دسترس‌پذیری | decisions |
| `trade-off` | بده‌بستان | decisions |
| `vertical-scaling` | مقیاس‌پذیری عمودی | decisions |
| `horizontal-scaling` | مقیاس‌پذیری افقی | decisions |
| `stateless` | بی‌حالت | decisions |
| `bottleneck` | گلوگاه | decisions |
| `cache` | کش | decisions |
| `observability` | رصدپذیری | decisions |
| `technical-debt` | بدهی فنی | decisions |
| `evolutionary-architecture` | معماری تکاملی | decisions |
| `c4-model` | مدل C4 | decisions |
| `adr` | سند تصمیم معماری | decisions |

### جای‌گذاری‌هایی که توضیح می‌خواهند

- **`domain-event` در مرحلهٔ ۱۰ است، نه ۸** — دسته‌اش `domain` می‌ماند، ولی تمام ارزش این مدخل در تقابل با `event` است و آن مدخل مرحلهٔ ۱۰ است. اگر زودتر بیاید، ناچار است چیزی را تعریف کند که هنوز نوشته نشده.
- **`conways-law` در مرحلهٔ ۹ است، نه ۱۵** — دسته‌اش `decisions` است، ولی همان‌جا لازم می‌شود که خواننده دارد بین مونولیت و میکروسرویس تصمیم می‌گیرد.
- **`business-rule` و `use-case` در مرحلهٔ ۶ آمدند** (در درس‌نامه فصل‌های ۶ و ۱۰ بودند) چون `layered-architecture` بدون آن‌ها توضیح‌دادنی نیست.
- **`interface` در مرحلهٔ ۳ آمد** (در درس‌نامه فصل ۴) چون هم SOLID و هم Hexagonal رویش سوارند.
- **`outbox-pattern` از فصل ۱۳ به مرحلهٔ ۱۲ رفت** چون مسئله‌ای که حل می‌کند تراکنش است نه ارتباط.
- **`dependency-inversion` یک مدخل است، نه دو تا.** فصل ۴ درس‌نامه و حرف D سالید یک مفهوم‌اند.

### آنچه عمداً مدخل جدا نشد

داخل مدخل بزرگ‌تر توضیح داده می‌شود، نه به‌عنوان مدخل مستقل:

| مفهوم | داخل کدام مدخل |
|---|---|
| چهار لایهٔ Presentation / Application / Domain / Infrastructure | `layered-architecture` |
| Inbound Port و Outbound Port | `port` |
| Constructor / Setter / Method Injection | `dependency-injection` |
| Aggregate Root | `aggregate` |
| Compensating Transaction | `saga` |
| Idempotent Consumer | `idempotency` |
| Exactly-once و At-most-once | `at-least-once-delivery` |
| Poison Message | `dead-letter-queue` |
| Logs، Metrics، Traces | `observability` |
| Functional Requirements | `non-functional-requirements` |
| Latency و Throughput | `availability` |
| SLA و SLO | `availability` |
| Sharding | `partitioning` |
| Raft | `leader-election` |
| Read Model و Materialized View | `cqrs` |
| Schema Registry | `schema-versioning` |
| `State` (فصل ۱۷ درس‌نامه) | `event` |
| Sidecar | `service-mesh` |
| Fitness Function | `evolutionary-architecture` |
| Microkernel و Plugin Architecture | `component` |

## تداخل شناسه

شناسهٔ مدخل در **کل سایت** یکتاست، نه در هر موضوع. تنها تداخل با موضوع کریپتو `scalability` است.

**تصمیم:** مدخل عمومی `scalability` در این موضوع ساخته نمی‌شود. به‌جایش `vertical-scaling` و `horizontal-scaling` هستند و هر دو در `related` خود به `scalability` کریپتو اشاره می‌کنند. مدخل کریپتو دربارهٔ توان عملیاتی بلاکچین است و همان مدخل، نمونهٔ ملموس همین مفهوم عمومی است.

شناسه‌های `state`، `node`، `transaction`، `consensus`، `fork` و `block` هم در کریپتو گرفته‌اند و در این موضوع استفاده نمی‌شوند — به‌جای `transaction` از `distributed-transaction` استفاده شده.

## پل به موضوع کریپتو

این تنها موضوع دوم سایت است و نباید جزیره بماند. چند مدخل کریپتو در واقع مفهوم سیستم توزیع‌شده‌اند: `consensus`، `bft`، `node`، `fork`، `state`، `scalability`، `merkle-tree`.

`related` **دوطرفه** بسته می‌شود:

| مدخل معماری | مدخل کریپتو |
|---|---|
| `leader-election` | `bft`، `validator`، `consensus` |
| `eventual-consistency` | `fork`، `consensus` |
| `peer-to-peer` | `node`، `bitcoin` |
| `replication` | `node`، `blockchain` |
| `horizontal-scaling` / `vertical-scaling` | `scalability` |
| `event-sourcing` | `blockchain`، `state` |
| `idempotency` | `nonce` |
| `ordering` | `block`، `fork` |

سمت کریپتو **فقط فیلد `related` ویرایش می‌شود**؛ به بدنه، مثال یا SVG هیچ مدخل کریپتویی دست زده نمی‌شود. هر پل در همان فازی بسته می‌شود که مدخل معماریِ آن ساخته می‌شود، تا `related` هیچ‌وقت به شناسهٔ ناموجود اشاره نکند.

## قواعد نگارش مدخل

### ساختار

- **`short`** — یک جمله: تعریف به‌علاوهٔ اینکه چرا مهم است.
- **`body`** — همان قوسی که مدخل‌های پختهٔ کریپتو دارند: تعریف سادهٔ یک‌جمله‌ای ← مسئله‌ای که حل می‌کند، با یک مثال بدِ مشخص ← مکانیزم ← جدول یا مقایسه ← دام رایج ← و یک ابهام رایج که صریح رفع شود.
- **`example`** — کد Go کوتاه و واقعی، معمولاً یکی از این چهار شکل: قبل و بعد، امضای interface، ساختار پوشه، یا JSON یک رویداد. درس‌نامه هم Go-محور است. کد داخل `<pre><code>` می‌رود.
- **`svg`** — دو تا سه دیاگرام inline.
- **`en`** — ترجمهٔ کامل، نه خلاصه. `#/self-test` مدخل بدون ترجمه را گزارش می‌کند و با ۱۲۰ مدخل نباید آن فهرست پر شود.

عمق هدف، همان عمق مدخل‌های اخیر کریپتو است: بدنهٔ حدود ۵ تا ۷ هزار کاراکتر فارسی.

### قواعد فنی که از CLAUDE.md می‌آیند

- هر اصطلاح انگلیسی جاافتاده در **اولین** کاربردش در متن فارسی، با نام انگلیسی در پرانتز: `<span dir="ltr">(Circuit Breaker)</span>`. یک بار در هر مدخل، نه هر بار.
- روی فارسی هیچ‌وقت `letter-spacing` و هیچ‌وقت فونت monospace.
- ریشهٔ هر SVG که رشتهٔ لاتین دارد `direction="ltr"` می‌گیرد، و متن‌های فارسی داخلش `direction="rtl"`. تقریباً همهٔ دیاگرام‌های این موضوع برچسب لاتین دارند، پس این قاعده اینجا تقریباً همیشگی است.
- فرمول‌های کوتاه در `<code>` درون‌خطی با فاصلهٔ عادی. `render.js:35` بلوک‌های `<pre>` را رد می‌کند، پس کد Go دست‌نخورده می‌ماند و فقط `<code>` درون‌خطی زیر ۳۲ کاراکتر فاصله‌هایش nbsp می‌شود.
- جدول فقط برای محتوای واقعاً جدولی.

### هشتگ‌ها

اسلاگ انگلیسی lowercase بدون `#`، مشترک بین دو زبان. مجموعهٔ این موضوع:

`structure` · `dependency` · `boundary` · `principle` · `style` · `domain` · `communication` · `async` · `failure` · `consistency` · `scaling` · `decision` · `antipattern` · `testing`

هر مدخل دو تا چهار برچسب می‌گیرد. برچسب جدید بدون دلیل اضافه نمی‌شود؛ ارزش هشتگ در این است که چند مدخل را کنار هم بیاورد.

## فازبندی

بعد از هر فاز باید `node --test` سبز باشد، `#/self-test` تمیز، و سایت با هر دو موضوع بالا بیاید. ترتیب فازها ترتیب مرحله‌هاست تا هیچ مدخلی به مدخل نانوشته `related` نشود.

| فاز | مرحله‌ها | مدخل | بعدش سایت چه دارد |
|---|---|---|---|
| ۱ | ۱–۵ | ۲۶ | موضوع زنده: مبانی، وابستگی، SOLID، DI |
| ۲ | ۶–۸ | ۲۱ | لایه‌ای، شش‌ضلعی، تمیز، و DDD کامل |
| ۳ | ۹–۱۰ | ۱۸ | مونولیت تا میکروسرویس، و ارتباط سرویس‌ها |
| ۴ | ۱۱–۱۲ | ۲۵ | شکست توزیع‌شده و سازگاری |
| ۵ | ۱۳–۱۴ | ۱۷ | رویدادمحور و سبک‌های باقی‌مانده |
| ۶ | ۱۵ | ۱۳ | تصمیم‌گیری و کیفیت |

فاز ۱ علاوه بر ۲۶ مدخل، سطر `architecture` را به `data/topics.json` اضافه می‌کند و پوشهٔ موضوع را می‌سازد.

### چرا `roadmap.json` و `categories.json` فاز‌به‌فاز رشد می‌کنند

طرح اولیه این بود که هر ۱۵ مرحله از روز اول در `roadmap.json` بنشیند تا نقشهٔ کلی از ابتدا پیدا باشد. این کار نمی‌کند: `roadmap.js:51` برای هر شناسه‌ای که در نقشه هست ولی مدخلش وجود ندارد یک خطای اعتبارسنجی می‌سازد. نقشهٔ کامل در پایان فاز ۱ یعنی ۹۴ خطا در بنر و در `#/self-test` — که مستقیماً معیار پذیرش ۲ را نقض می‌کند. `pruneRoadmap` این را حل نمی‌کند؛ آن فقط شمارش و رندر را تمیز می‌کند، نه فهرست خطا را.

پس **هر مرحله همان فازی به `roadmap.json` اضافه می‌شود که مدخل‌هایش نوشته می‌شوند.** نقشهٔ کامل ۱۵ مرحله‌ای در همین spec زندگی می‌کند، که جای یک طرح است.

به همان دلیل `categories.json` هم فاز‌به‌فاز رشد می‌کند: هر دسته وقتی اضافه می‌شود که اولین مدخلش نوشته شود، وگرنه یا فایل مدخلِ خالی داریم یا اشاره به فایل ناموجود.

| پایان فاز | دسته‌های موجود |
|---|---|
| ۱ | foundations، principles |
| ۲ | + styles، domain |
| ۳ | + communication، decisions |
| ۴ | + distributed |
| ۵ | — (هر ۷ دسته کامل شد) |
| ۶ | — |

## معیارهای پذیرش

هر فاز وقتی تمام است که همهٔ این‌ها برقرار باشند:

1. `node --test` (بدون آرگومان مسیر) سبز باشد، از جمله `test/roadmap-order.test.mjs`.
2. `#/self-test` صفر خطای اعتبارسنجی، صفر شکست رندر، صفر مدخل بدون ترجمهٔ انگلیسی و صفر مدخل خارج از نقشهٔ راه گزارش کند.
3. `git diff --stat` هیچ فایلی زیر `assets/` نشان ندهد.
4. سایت با `node serve.js` بالا بیاید و سوییچ موضوع بین کریپتو و معماری، در هر دو زبان، کار کند.
5. هر مدخل جدید در هر دو زبان بدنه و مثال داشته باشد و دست‌کم دو دیاگرام.

## ریسک‌ها

- **حجم.** ۱۲۰ مدخل در عمق کامل، بزرگ‌ترین کار تا امروزِ این ریپو است. فازبندی برای همین است: هر فاز به‌تنهایی یک تحویل کامل و قابل انتشار است.
- **ارجاع‌های شکسته.** پرتکرارترین خرابی این پروژه `related` به شناسهٔ ناموجود است. ترتیب فازها بر اساس مرحله (نه بر اساس دسته) دقیقاً برای رفع همین است؛ ترتیب بر اساس دسته این را می‌شکست، چون `styles` به مفاهیم `domain` ارجاع می‌دهد که دیرتر می‌آیند.
- **یکنواختی دیاگرام‌ها.** اکثر دیاگرام‌های این موضوع جعبه‌و‌فلش‌اند و خطر شبیه‌شدن دارند. در هر مرحله دست‌کم یک دیاگرام باید شکل دیگری داشته باشد — خط زمانی، ماتریس، یا نمودار حالت.
