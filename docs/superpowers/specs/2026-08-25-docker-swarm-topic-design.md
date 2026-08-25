# طراحی: موضوع «داکر سوارم»

تاریخ: ۲۰۲۶-۰۸-۲۵

## هدف

افزودن سومین موضوع سایت: **داکر سوارم**، شامل ۷۸ مدخل در ۸ دسته و یک مسیر یادگیری ۱۴ مرحله‌ای.

منبع ساختار، جزوه‌ای فارسی در ۴۴ بخش است که کاربر تهیه کرده (`docker-swarm-course.md`). آن فایل **اسکلت** است نه محتوا: ترتیب مفاهیم، تقسیم‌بندی و مدل ذهنی پایانی از آن گرفته می‌شود، اما بدنهٔ هر مدخل با همان عمقی نوشته می‌شود که مدخل‌های موضوع‌های کریپتو و معماری دارند — که از ظرفیت آن جزوه به‌مراتب بیشتر است.

دامنه عمداً **فقط Swarm** است. خواننده فرض می‌شود داکر را بلد است: Container، Image، Volume و Port مدخل مستقل نمی‌گیرند. آنچه به موضوع اضافه شده، جاهای خالیِ خودِ Swarm است، نه مبانی داکر.

## آنچه دست نمی‌خورد

طبق قاعدهٔ خود پروژه، افزودن مدخل نباید به کد کار داشته باشد. این طراحی بررسی شد و آن قاعده اینجا برقرار است:

- `data.js` روی `topics.map` می‌چرخد و همهٔ موضوع‌ها را موازی لود می‌کند.
- `roadmap.js` تابع `validateRoadmap(roadmap, entries, topicId)` را per-topic صدا می‌زند و پیشرفت هر موضوع را جدا نگه می‌دارد.
- `render.js` دکمهٔ نقشهٔ راه را با `#/roadmap/<topicId>` می‌سازد.

**هیچ فایلی زیر `assets/js/` تغییر نمی‌کند.**

برخلاف موضوع معماری، این بار **هیچ فایل آزمونی هم تغییر نمی‌کند**: `test/roadmap-order.test.mjs` از زمان آن موضوع روی همهٔ موضوع‌های `topics.json` می‌چرخد و فهرست استثنای per-topic دارد. اگر مدخلی از این موضوع پیش از پیش‌نیازش بنشیند، همان آزمون قرمز می‌شود — که هدف است.

اگر در حین اجرا معلوم شد تغییری در `assets/` لازم است، آن یک مسئلهٔ جداست و باید جدا مطرح شود.

## ساختار فایل‌ها

```
data/
  topics.json                      ← یک سطر اضافه می‌شود
  swarm/                           ← پوشهٔ جدید
    categories.json                ← فاز‌به‌فاز رشد می‌کند
    roadmap.json                   ← فاز‌به‌فاز رشد می‌کند
    entries/
      cluster.json       ۱۳ مدخل
      workload.json      ۱۴ مدخل
      network.json       ۱۰ مدخل
      state.json          ۶ مدخل
      lifecycle.json      ۸ مدخل
      operations.json     ۷ مدخل
      delivery.json      ۱۴ مدخل
      boundaries.json     ۶ مدخل
```

### `data/topics.json`

```json
{ "id": "swarm", "fa": "داکر سوارم", "en": "Docker Swarm" }
```

### `data/swarm/categories.json`

| id | فایل | فارسی | English | تعداد |
|---|---|---|---|---|
| `cluster` | cluster.json | کلاستر و گره | Cluster & Nodes | ۱۳ |
| `workload` | workload.json | سرویس و تسک | Services & Tasks | ۱۴ |
| `network` | network.json | شبکه | Networking | ۱۰ |
| `state` | state.json | داده و راز | Data & Secrets | ۶ |
| `lifecycle` | lifecycle.json | تغییر و سلامت | Change & Health | ۸ |
| `operations` | operations.json | عملیات | Operations | ۷ |
| `delivery` | delivery.json | تحویل | Delivery & CI/CD | ۱۴ |
| `boundaries` | boundaries.json | مرزهای سوارم | What Swarm Is Not | ۶ |

`boundaries` دستهٔ عمدی است. جزوه چهار بار — پراکنده در فصل‌های ۱۲، ۱۶، ۱۷ و ۳۲ — درست می‌گوید سوارم کاری را انجام نمی‌دهد. اینجا آن چهار «نه» یک‌جا می‌نشینند و همان‌جا به مدخل‌های موضوع معماری وصل می‌شوند. برای خواننده‌ای که دارد تصمیم می‌گیرد، این دسته پرکاربردترین بخش موضوع است.

## مسیر یادگیری

دسته و مرحله دو چیز جدا هستند. **دسته** یعنی مدخل در کدام فایل زندگی می‌کند؛ **مرحله** یعنی خواننده کِی به آن می‌رسد. چند مدخل عمداً در مرحله‌ای خارج از دستهٔ خودشان قرار گرفته‌اند و دلیلش زیر جدول‌ها آمده.

ترتیب مرحله‌ها باید **وابستگی‌درست** باشد، چون `test/roadmap-order.test.mjs` ارجاع‌های «مدخل ‹عنوان›» را از بدنه و مثال فارسی می‌خواند و هر مدخلی که پیش از پیش‌نیازش بیاید آزمون را قرمز می‌کند.

### مرحلهٔ ۱ — کلاستر چیست (۶)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `swarm` | سوارم | Swarm | cluster |
| `swarm-node` | گره | Node | cluster |
| `manager-node` | گره مدیر | Manager Node | cluster |
| `worker-node` | گره کارگر | Worker Node | cluster |
| `control-plane` | صفحهٔ کنترل | Control Plane | cluster |
| `data-plane` | صفحهٔ داده | Data Plane | cluster |

### مرحلهٔ ۲ — کلاستری که سرِ پا می‌ماند (۵)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `join-token` | توکن پیوستن | Join Token | cluster |
| `swarm-tls` | گواهی و اعتماد در سوارم | Swarm mTLS | cluster |
| `raft` | رفت | Raft | cluster |
| `quorum` | حد نصاب | Quorum | cluster |
| `control-plane-ha` | دسترس‌پذیری صفحهٔ کنترل | Control-Plane HA | cluster |

### مرحلهٔ ۳ — واحد کار (۸)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `service` | سرویس | Service | workload |
| `task` | تسک | Task | workload |
| `replica` | نمونه | Replica | workload |
| `service-spec` | مشخصات سرویس | Service Spec | workload |
| `stack` | استک | Stack | delivery |
| `stack-file` | فایل استک | Stack File | delivery |
| `replicated-service` | سرویس تکثیرشده | Replicated Service | workload |
| `global-service` | سرویس سراسری | Global Service | workload |

### مرحلهٔ ۴ — قرارداد سوارم (۳)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `desired-state` | وضعیت مطلوب | Desired State | workload |
| `reconciliation` | همگرایی | Reconciliation | workload |
| `self-healing` | خودترمیمی | Self-Healing | workload |

### مرحلهٔ ۵ — کجا اجرا شود (۷)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `scheduler` | زمان‌بند | Scheduler | workload |
| `node-label` | برچسب گره | Node Label | cluster |
| `placement-constraint` | قید جای‌گذاری | Placement Constraint | workload |
| `placement-preference` | ترجیح جای‌گذاری | Placement Preference | workload |
| `resource-reservation` | رزرو منابع | Resource Reservation | workload |
| `resource-limit` | سقف منابع | Resource Limit | workload |
| `node-availability` | دسترس‌پذیری گره | Node Availability | cluster |

### مرحلهٔ ۶ — ترافیک چطور می‌رسد (۱۰)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `overlay-network` | شبکهٔ روپوش | Overlay Network | network |
| `gossip` | شایعه‌پراکنی | Gossip | network |
| `service-discovery` | کشف سرویس | Service Discovery | network |
| `virtual-ip` | آی‌پی مجازی | Virtual IP | network |
| `dns-round-robin` | گردش DNS | DNS Round Robin | network |
| `ingress-network` | شبکهٔ ورودی | Ingress Network | network |
| `published-port` | پورت منتشرشده | Published Port | network |
| `routing-mesh` | مش مسیریابی | Routing Mesh | network |
| `host-mode-publish` | انتشار روی خود گره | Host-Mode Publishing | network |
| `reverse-proxy` | پراکسی معکوس | Reverse Proxy | network |

### مرحلهٔ ۷ — داده کجا می‌ماند (۵)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `local-volume` | والیوم محلی | Local Volume | state |
| `volume-driver` | درایور والیوم | Volume Driver | state |
| `stateful-service` | سرویس حالت‌دار | Stateful Service | state |
| `distributed-storage` | ذخیره‌سازی توزیع‌شده | Distributed Storage | boundaries |
| `database-ha` | دسترس‌پذیری بالای پایگاه داده | Database HA | boundaries |

### مرحلهٔ ۸ — چیزهایی که نباید در گیت باشند (۳)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `secret` | راز | Secret | state |
| `config-object` | شیء پیکربندی | Config | state |
| `secret-rotation` | چرخاندن راز | Secret Rotation | state |

### مرحلهٔ ۹ — عوض کردن بدون قطعی (۷)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `scaling` | مقیاس‌دهی | Scaling | lifecycle |
| `healthcheck` | بررسی سلامت | Healthcheck | lifecycle |
| `restart-policy` | سیاست ری‌استارت | Restart Policy | lifecycle |
| `rolling-update` | به‌روزرسانی چرخشی | Rolling Update | lifecycle |
| `update-config` | پیکربندی به‌روزرسانی | Update Configuration | lifecycle |
| `rollback` | بازگشت | Rollback | lifecycle |
| `zero-downtime-deploy` | استقرار بی‌قطعی | Zero-Downtime Deployment | lifecycle |

### مرحلهٔ ۱۰ — وقتی چیزی می‌شکند (۸)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `node-failure` | از کار افتادن گره | Node Failure | lifecycle |
| `task-state` | حالت‌های تسک | Task States | operations |
| `pending-task` | تسک معلق | Pending Task | operations |
| `swarm-cli` | خط فرمان و API | CLI and API | operations |
| `service-logs` | لاگ سرویس | Service Logs | operations |
| `swarm-monitoring` | پایش سوارم | Monitoring a Swarm | operations |
| `swarm-backup` | پشتیبان‌گیری از سوارم | Backing Up a Swarm | operations |
| `quorum-loss-recovery` | بازیابی پس از افتادن حد نصاب | Recovering from Quorum Loss | operations |

### مرحلهٔ ۱۱ — از کد تا ایمیج (۴)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `dockerfile` | داکرفایل | Dockerfile | delivery |
| `registry` | رجیستری | Registry | delivery |
| `image-tag` | تگ ایمیج | Image Tag | delivery |
| `image-pull` | کشیدن ایمیج | Image Pull | delivery |

### مرحلهٔ ۱۲ — از ایمیج تا کلاستر (۴)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `stack-deploy` | استقرار استک | docker stack deploy | delivery |
| `compose-vs-stack` | کامپوز در برابر استک | Compose vs Stack | delivery |
| `multi-stack` | چند استک | Multiple Stacks | delivery |
| `deploy-configuration` | پیکربندی استقرار | Deployment Configuration | delivery |

### مرحلهٔ ۱۳ — خودکار کردنش (۴)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `ci-cd-pipeline` | خط لولهٔ تحویل | CI/CD Pipeline | delivery |
| `ssh-deploy` | استقرار با SSH | Deploying over SSH | delivery |
| `gitops` | گیت‌آپس | GitOps | delivery |
| `delivery-chain` | زنجیرهٔ تحویل | The Delivery Chain | delivery |

### مرحلهٔ ۱۴ — مرزها (۴)

| شناسه | فارسی | English | دسته |
|---|---|---|---|
| `geo-routing` | مسیریابی جغرافیایی | Geo Routing | boundaries |
| `autoscaling` | مقیاس‌دهی خودکار | Autoscaling | boundaries |
| `what-swarm-does-not-do` | کاری که سوارم نمی‌کند | What Swarm Does Not Do | boundaries |
| `swarm-vs-kubernetes` | سوارم در برابر کوبرنتیز | Swarm vs Kubernetes | boundaries |

## سه جای که از ترتیب جزوه فاصله گرفتیم

هر سه‌تا به یک دلیل‌اند: پیش‌نیاز.

**۱. Raft از فصل ۱۴ به مرحلهٔ ۲ آمد.** جزوه Control Plane را در فصل ۴ توضیح می‌دهد و Raft را ده فصل بعد. ولی Control Plane بدون Raft فقط یک اسم است — «مغز سیستم» چیزی را توضیح نمی‌دهد. اینجا بلافاصله بعد از Manager و Worker می‌آید، و `quorum` و `control-plane-ha` هم همان‌جا، چون هر سه یک مطلب‌اند.

**۲. `stack` و `stack-file` از انتهای جزوه به مرحلهٔ ۳ آمدند.** تقریباً هر مثالی در مرحله‌های ۵ تا ۹ یک قطعه YAML است: `deploy:`، `placement:`، `update_config:`، `resources:`. اگر فایل استک تا مرحلهٔ ۱۲ معرفی نشود، آن مثال‌ها حق ندارند به آن ارجاع بدهند و `roadmap-order` قرمز می‌شود. خودِ `stack-deploy` سر جای اصلی‌اش در زنجیرهٔ تحویل می‌ماند: **فایل** زود معرفی می‌شود چون ابزار توضیح است، **فرستادنش** دیر چون آخر زنجیره است.

**۳. Storage از فصل ۱۵ به بعدِ شبکه رفت.** «والیوم محلی به گره چسبیده است» فقط وقتی معنی دارد که خواننده Placement را از مرحلهٔ ۵ بلد باشد؛ وگرنه نتیجه‌گیری «پس PostgreSQL را جای دیگر نمی‌شود بالا آورد» شبیه یک محدودیت دلبخواه به نظر می‌رسد نه یک نتیجه.

## جاهای خالی جزوه که پر می‌شوند

۲۵ مدخل از ۷۸ تا در جزوه اصلاً نیستند. مهم‌ترین‌هایشان و دلیلشان:

| مدخل | چرا بدون آن جزوه ناقص است |
|---|---|
| `overlay-network`، `ingress-network` | جزوه Routing Mesh را توضیح می‌دهد ولی زیرش خالی است، پس Routing Mesh جادو می‌ماند |
| `virtual-ip`، `dns-round-robin` | «Traffic به Task می‌رسد» بدون اینکه معلوم شود کدام Task و چطور |
| `service-discovery` | جزوه اصلاً نمی‌گوید یک سرویس چطور سرویس دیگر را پیدا می‌کند — که پرتکرارترین کار روزمره است |
| `gossip` | چیزی باید وضعیت را بین گره‌ها پخش کند؛ جزوه فقط Raft را نام می‌برد که کار دیگری می‌کند |
| `host-mode-publish` | تنها راه فرار از Routing Mesh، و جزوه وجودش را نمی‌گوید |
| `swarm-tls` | جزوه Join Token را می‌گوید ولی نمی‌گوید بعدش چه اتفاقی می‌افتد و چرا کلاستر امن است |
| `task-state`، `pending-task` | پرتکرارترین سؤال عملی («چرا Task بالا نمی‌آید») در جزوه جواب ندارد |
| `quorum-loss-recovery` | جزوه می‌گوید Majority را از دست می‌دهی و همان‌جا رها می‌کند |
| `swarm-backup` | وضعیت Raft تنها چیز غیرقابل‌بازسازی کلاستر است |
| `zero-downtime-deploy` | جزوه Rolling Update را دارد ولی `order: start-first` و رابطهٔ Healthcheck با Update را ندارد |
| `image-pull` | جزوه می‌گوید Node ایمیج را Pull می‌کند، ولی نه با چه اعتباری و نه چرا تگ متغیر خطرناک است |
| `swarm-monitoring`، `service-logs` | جزوه فقط می‌گوید Dashboard رسمی ندارد و جای خالی را پر نمی‌کند |

## تداخل شناسه و پل به دو موضوع دیگر

شناسهٔ مدخل در **کل سایت** یکتاست. با ۱۶۷ مدخل موجود، تنها تداخل `leader-election` است که موضوع معماری دارد.

**تصمیم:** مدخل `leader-election` دوباره نوشته نمی‌شود. `raft` در `related` خود به آن اشاره می‌کند. مدخل معماری مفهوم عمومی را می‌گوید و `raft` نمونهٔ مشخصی است که Swarm به کار می‌برد — دقیقاً همان رابطه‌ای که `scalability` کریپتو با `horizontal-scaling` معماری دارد.

`related` **دوطرفه** بسته می‌شود:

| مدخل سوارم | مدخل‌های موضوع دیگر |
|---|---|
| `swarm` | `orchestration`، `microservices` |
| `raft` | `leader-election`، `consensus` (کریپتو)، `strong-consistency` |
| `quorum` | `bft` (کریپتو)، `availability` |
| `distributed-storage` | `replication`، `partitioning` |
| `database-ha` | `availability`، `strong-consistency`، `replication` |
| `reverse-proxy` | `api-gateway`، `service-mesh` |
| `healthcheck` | `circuit-breaker`، `timeout`، `transient-failure` |
| `service-discovery` | `service-mesh`، `api-gateway` |
| `scaling` | `horizontal-scaling`، `stateless` |
| `stateful-service` | `stateless` |
| `rolling-update` | `availability` |
| `swarm-vs-kubernetes` | `orchestration`، `microservices` |

سمت موضوع‌های دیگر **فقط فیلد `related` ویرایش می‌شود**؛ به بدنه، مثال یا SVG هیچ مدخل موجودی دست زده نمی‌شود. هر پل در همان فازی بسته می‌شود که مدخل سوارمِ آن ساخته می‌شود، تا `related` هیچ‌وقت به شناسهٔ ناموجود اشاره نکند.

## آنچه بیرون می‌ماند

- **مبانی داکر.** Container، Image، Layer، Volume، Port، Build — هیچ‌کدام مدخل مستقل نمی‌گیرند. خواننده فرض می‌شود آن‌ها را بلد است.
- **آموزش نوشتن Dockerfile.** `dockerfile` فقط در حد نقشش در زنجیرهٔ تحویل نوشته می‌شود: چیزی که تعیین می‌کند ایمیج چطور ساخته شود. multi-stage، کش لایه‌ها و بهینه‌سازی اندازه بیرون‌اند.
- **خود کوبرنتیز.** `swarm-vs-kubernetes` تفاوت مدل‌ها را می‌گوید، نه اینکه کوبرنتیز چطور کار می‌کند.
- **پیکربندی ابزارهای بیرونی.** Traefik، Prometheus، Portainer، GlusterFS و Patroni نام برده می‌شوند و مدخل نمی‌گیرند.
- **Swarm کلاسیک** (پیش از Docker 1.12، آن باینری جدا). هرجا «سوارم» می‌آید یعنی swarm mode داخل خود موتور داکر.

## قواعد نگارش مدخل

### ساختار

- **`short`** — یک جمله: تعریف به‌علاوهٔ اینکه چرا مهم است.
- **`body`** — همان قوس مدخل‌های پختهٔ دو موضوع دیگر: تعریف سادهٔ یک‌جمله‌ای ← مسئله‌ای که حل می‌کند با یک مثال بدِ مشخص ← مکانیزم ← جدول یا مقایسه ← دام رایج ← و یک ابهام رایج که صریح رفع شود.
- **`example`** — اینجا برخلاف دو موضوع دیگر، Go نیست. سه شکل غالب: قطعهٔ `stack.yml`، خروجی واقعی یک دستور (`docker service ps` با ستون `CURRENT STATE`)، و مقایسهٔ قبل/بعدِ یک قطعه YAML. کد داخل `<pre><code>` می‌رود.
- **`svg`** — دو تا سه دیاگرام inline.
- **`en`** — ترجمهٔ کامل، نه خلاصه.

عمق هدف، همان عمق مدخل‌های موضوع معماری است: بدنهٔ حدود ۵ تا ۷ هزار کاراکتر فارسی.

### قواعد فنی که از CLAUDE.md می‌آیند

- هر اصطلاح انگلیسی جاافتاده در **اولین** کاربردش در متن فارسی، با نام انگلیسی در پرانتز: `<span dir="ltr">(Routing Mesh)</span>`. یک بار در هر مدخل، نه هر بار.
- روی فارسی هیچ‌وقت `letter-spacing` و هیچ‌وقت فونت monospace.
- ریشهٔ هر SVG که رشتهٔ لاتین دارد `direction="ltr"` می‌گیرد و متن‌های فارسی داخلش `direction="rtl"`. در این موضوع تقریباً همهٔ دیاگرام‌ها اسم گره و سرویس دارند، پس این قاعده اینجا همیشگی است.
- `render.js` بلوک‌های `<pre>` را دست نمی‌زند، پس YAML و خروجی دستورها دست‌نخورده می‌مانند. فقط `<code>` درون‌خطی زیر ۳۲ کاراکتر فاصله‌هایش nbsp می‌شود — که برای `node.labels.storage == true` دقیقاً همان چیزی است که می‌خواهیم.
- جدول فقط برای محتوای واقعاً جدولی. در این موضوع بیشترین کاربردش مقایسهٔ گزینه‌های یک فیلد YAML است.

### هشتگ‌ها

اسلاگ انگلیسی lowercase بدون `#`، مشترک بین دو زبان. مجموعهٔ این موضوع:

`cluster` · `node` · `service` · `scheduling` · `network` · `storage` · `security` · `change` · `failure` · `operations` · `delivery` · `boundary` · `antipattern`

هر مدخل دو تا چهار برچسب می‌گیرد. برچسب جدید بدون دلیل اضافه نمی‌شود.

## فازبندی

بعد از هر فاز باید `node --test` سبز باشد، `#/self-test` تمیز، و سایت با هر سه موضوع بالا بیاید. ترتیب فازها ترتیب مرحله‌هاست تا هیچ مدخلی به مدخل نانوشته `related` نشود.

| فاز | مرحله‌ها | مدخل | بعدش سایت چه دارد |
|---|---|---|---|
| ۱ | ۱–۲ | ۱۱ | موضوع زنده: کلاستر، نقش‌ها، Raft و حد نصاب |
| ۲ | ۳–۵ | ۱۸ | سرویس و تسک، وضعیت مطلوب، و جای‌گذاری |
| ۳ | ۶–۸ | ۱۸ | شبکه به‌طور کامل، داده، و رازها |
| ۴ | ۹–۱۰ | ۱۵ | به‌روزرسانی، سلامت، شکست و عیب‌یابی |
| ۵ | ۱۱–۱۴ | ۱۶ | زنجیرهٔ تحویل و مرزهای سوارم |

فاز ۱ علاوه بر ۱۱ مدخل، سطر `swarm` را به `data/topics.json` اضافه می‌کند و پوشهٔ موضوع را می‌سازد.

### چرا `roadmap.json` و `categories.json` فاز‌به‌فاز رشد می‌کنند

`roadmap.js` برای هر شناسه‌ای که در نقشه هست ولی مدخلش وجود ندارد یک خطای اعتبارسنجی می‌سازد. نقشهٔ کامل ۱۴ مرحله‌ای در پایان فاز ۱ یعنی ۶۷ خطا در بنر و در `#/self-test` — که مستقیماً معیار پذیرش ۲ را نقض می‌کند.

پس **هر مرحله همان فازی به `roadmap.json` اضافه می‌شود که مدخل‌هایش نوشته می‌شوند.** نقشهٔ کامل در همین spec زندگی می‌کند، که جای یک طرح است.

به همان دلیل `categories.json` هم فاز‌به‌فاز رشد می‌کند: هر دسته وقتی اضافه می‌شود که اولین مدخلش نوشته شود، وگرنه یا فایل مدخلِ خالی داریم یا اشاره به فایل ناموجود.

| پایان فاز | دسته‌های موجود |
|---|---|
| ۱ | cluster |
| ۲ | + workload، delivery |
| ۳ | + network، state، boundaries |
| ۴ | + lifecycle، operations |
| ۵ | — (هر ۸ دسته کامل شد) |

`delivery` در فاز ۲ فقط با `stack` و `stack-file` باز می‌شود و در فاز ۵ پر می‌شود. `boundaries` در فاز ۳ با `distributed-storage` و `database-ha` باز می‌شود و در فاز ۵ کامل می‌شود. هیچ‌کدام مشکلی نمی‌سازد: دستهٔ نیمه‌پر یک فایل مدخلِ معتبر است.

## معیارهای پذیرش

هر فاز وقتی تمام است که همهٔ این‌ها برقرار باشند:

1. `node --test` (بدون آرگومان مسیر) سبز باشد، از جمله `test/roadmap-order.test.mjs`.
2. `#/self-test` صفر خطای اعتبارسنجی، صفر شکست رندر، صفر مدخل بدون ترجمهٔ انگلیسی و صفر مدخل خارج از نقشهٔ راه گزارش کند.
3. `git diff --stat` هیچ فایلی زیر `assets/` یا `test/` نشان ندهد.
4. سایت با `node serve.js` بالا بیاید و سوییچ موضوع بین هر سه موضوع، در هر دو زبان، کار کند.
5. هر مدخل جدید در هر دو زبان بدنه و مثال داشته باشد و دست‌کم دو دیاگرام.

## ریسک‌ها

- **دقت فنی جزوه.** جزوه جاهایی سست است: Routing Mesh را «می‌تواند مسیریابی کند» توصیف می‌کند بدون اینکه بگوید همیشه از VIP رد می‌شود، و رابطهٔ Healthcheck با Rolling Update را اصلاً نمی‌گوید. مدخل‌ها به جزوه وفادار نمی‌مانند، به رفتار واقعی Swarm وفادار می‌مانند؛ هرجا جزوه ساده‌سازی کرده، مدخل تصحیح می‌کند.
- **ارجاع‌های شکسته.** پرتکرارترین خرابی این پروژه `related` به شناسهٔ ناموجود است. ترتیب فازها بر اساس مرحله (نه بر اساس دسته) دقیقاً برای رفع همین است.
- **یکنواختی دیاگرام‌ها.** خطر این موضوع از دو موضوع قبل بیشتر است: تقریباً هر دیاگرام وسوسه می‌کند سه جعبه به اسم Germany و Italy و France باشد. در هر مرحله دست‌کم یک دیاگرام باید شکل دیگری داشته باشد — خط زمانی (Rolling Update)، نمودار حالت (Task States)، ماتریس (Limit در برابر Reservation)، یا جدول تصمیم.
- **کهنه شدن مقایسه با کوبرنتیز.** `swarm-vs-kubernetes` باید دربارهٔ تفاوت مدل‌ها باشد نه دربارهٔ فهرست قابلیت‌ها، وگرنه ظرف یک سال غلط می‌شود.
