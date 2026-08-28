# قواعد نوشتن مدخل — آنچه هنگام ساختن موضوع «داکر سوارم» به دست آمد

<!-- markdownlint-disable -->

این سند در طول نوشتن ۷۸ مدخل موضوع داکر سوارم جمع شد. هر قاعده‌اش یک بار
هزینه داده: چیزی اشتباه از آب درآمد، بازبینی گرفتش، و قاعده‌اش اینجا نوشته شد
تا مرحلهٔ بعد تکرارش نکند.

سه دسته‌اند و عمرشان فرق دارد:

- **قواعد واژگانی و نگارشی** — برای هر مدخلی از هر موضوعی معتبرند، چون دربارهٔ
  فارسیِ این سایت‌اند نه دربارهٔ داکر. مهم‌ترینشان این است که پیش از ابداع یک
  معادل، باید *مفهوم* را در دو موضوع دیگر جست‌وجو کرد، نه *کلمه* را بعد از
  نوشتن. سه بار این کار نشد و سه بار اصلاح خورد.
- **قواعد وفاداری خروجی و دیاگرام** — هرجا مدخلی خروجی ترمینال یا SVG دارد
  معتبرند.
- **واقعیت‌های اندازه‌گیری‌شدهٔ سوارم** — مخصوص همین موضوع‌اند و اگر داکر عوض
  شود کهنه می‌شوند. هرکدام روی داکر ۲۴٫۰٫۷ سنجیده شده‌اند.

متن به انگلیسی است، چون همان‌طور نوشته شده که به کار می‌رفت.

---


## Persian terminology already fixed (use these exact words)

| Persian | English | first appeared |
|---|---|---|
| سوارم | Swarm | `swarm` |
| گره | Node | `swarm-node` |
| گره مدیر / گره کارگر | Manager / Worker Node | `manager-node` |
| صفحهٔ کنترل / صفحهٔ داده | Control Plane / Data Plane | `control-plane` |
| هماهنگ‌کننده | Orchestrator (the SwarmKit component) | `control-plane` |
| تخصیص‌دهنده | Allocator | `control-plane` |
| زمان‌بند | Scheduler | `swarm` |
| توزیع‌کننده | Dispatcher | `control-plane` |
| انبار همانندشده | Replicated Store | `control-plane` |
| رابط مدیریتی | Management API | `control-plane` |
| شبکهٔ روپوش (اسم) / شبکهٔ روپوشی (صفت) | Overlay Network | `control-plane` |
| توکن پیوستن | Join Token | `worker-node` |
| agent | left in Latin, deliberately | `worker-node` |

Note for Task 6: the entry `overlay-network` is titled **«شبکهٔ روپوش»**, because
the citation phrase «مدخل ‹عنوان›» must match the title exactly for
`test/roadmap-order.test.mjs`. Prose elsewhere may use the adjectival
«شبکهٔ روپوشی»; both already appear in stage 1.

## The gloss rule, as settled in task 1

`<span dir="ltr">(Term)</span>` on **first use in each entry**, once per entry.
It applies to coined Persian renderings the reader will never meet again
(تخصیص‌دهنده, انبار همانندشده, …). It does **not** apply to a term that owns its
own entry — those are cited as «مدخل ‹عنوان›» with no parenthetical, exactly
as `complexity` cites «مدخل معماری نرم‌افزار».

## SVG pitfalls found the hard way

- **`text-anchor` inverts under `direction="rtl"`.** `text-anchor="end"` anchors
  the *left* edge of an RTL run, so RTL labels grow rightwards off the canvas.
  Six labels in task 1 were silently clipped this way. The existing crypto and
  architecture SVGs dodge it by only ever using `text-anchor="middle"` on RTL
  text. Do the same, or verify in a browser.
- Leave ~18px between the last rule and the caption baseline, and give the
  `viewBox` the height to hold it. A rule at `y=236` with a caption baseline at
  `y=240` strikes through the caption.
- Keep the `aria-label` consistent with the diagram: if the picture has six
  boxes, the label names six things, with the same words the body uses.

## CLI output realism

Use real shapes, not trimmed ones: node ids are 25 chars, task ids 12, and a
join token is `SWMTKN-1-<50 chars>-<25 chars>`. `docker service ps` prints
ID / NAME / IMAGE / NODE / DESIRED STATE / CURRENT STATE / ERROR / PORTS.

## Scope discipline that matters across stages

Stage 1 deliberately does **not** name the routing mesh, the 7946/4789 port
requirement, or host-mode publishing — stage 6 owns all three. Do not pull a
later stage's material forward to make an earlier entry feel complete; the
roadmap-order test enforces the citation half of this, but the prose half is
on you.

## Corrected after task 2

«ژتون» was wrong. The rest of the site writes **توکن** — 49 occurrences across
both existing topics, including 35 in `data/crypto/entries/consensus.json`.
The swarm topic must not split the site's vocabulary over a word this common.
The Join Token entry is titled **«توکن پیوستن»** and every mention in stage 1
and stage 2 uses توکن.

«رَفت» (with the zabar) is correct for Raft and matches how architecture's
`leader-election` already spells it; unpointed «رفت» reads as the verb "went".

## Proofing diagrams visually — it IS possible, do not skip it

The browser pane reports `innerWidth === 0` and drops scroll events, so the
site's own entry page cannot be scrolled to a diagram. Two things still work:
`getBBox()` (text is really being laid out and measured) and `screenshot`.
So render one diagram per page and shoot it:

```
python3 .superpowers/sdd/2026-08-25-docker-swarm-topic/tools/svgsheet.py \
    data/swarm/entries/<file>.json                # lists every diagram with an index
python3 .../svgsheet.py data/swarm/entries/<file>.json 18 > /tmp/d.html
```

Serve the directory holding the html on a spare port (`python3 -m http.server
8010`), navigate the browser pane to it, and screenshot. One diagram fills the
800×450 frame. Stage 1 and stage 2's tables and matrices were proofed this way
and render correctly — Persian digits, RTL columns, highlighted rows and all.

Also worth running, since it catches what a screenshot will not: walk every
`<text>`, take its `getBBox()`, and compare against the root `viewBox` for
overflow, against sibling text boxes for overlap, and against rule `y`
positions for strike-through. Attributes like `direction` and `text-anchor`
are usually set on a `<g>` wrapper, so check the *computed* value, not a
per-element grep.

## «مدخل ‹عنوان›» is a declaration, not a decoration

`test/roadmap-order.test.mjs` reads the phrase «مدخل ‹عنوان›» out of the
Persian body and example and treats it as a hard prerequisite. So an entry may
use that phrase ONLY for an entry in its own stage or an earlier one. If you
want to mention a term that a later stage owns, mention it plainly — no «مدخل»
prefix. Task 2 learned this by turning the suite red.

Corollary for the gloss rule: a term that owns a *later* entry can be neither
cited nor glossed-as-a-citation, so it takes a plain mention. That is fine.

## When a plain forward mention takes an English gloss (settled in task 3)

Entry ownership does not decide it; the reader's need does.

- **Gloss it** when the Persian is a coined rendering that does not carry its
  English inside it: نمونه → `(Replica)`, قید جای‌گذاری → `(Placement
  Constraint)`, تخصیص‌دهنده → `(Allocator)`. The reader will meet the English in
  YAML, in a CLI column, and in every search they run.
- **Leave it bare** when the Persian IS the English (تسک، توکن، ماژول، پکیج) or
  is ordinary Persian that maps without help (لایه، مرز، صف).

`foundations.json` is the precedent: it leaves ماژول and پکیج bare while
glossing «طراحی <span dir="ltr">(Design)</span>», a word that owns no entry at
all. A citation «مدخل ‹عنوان›» is itself a bridge, so it needs no gloss; a plain
mention has no link, so it needs one more, not less.

## CLI output fidelity is a recurring regression — check it every task

`conventions.md` fixes the column sets and stage 1 got them right; stage 3 then
dropped IMAGE from every `docker service ps` block and PORTS from every
`docker service ls` block. Before reporting done, grep your own examples:

- `docker service ps` → ID · NAME · IMAGE · NODE · DESIRED STATE · CURRENT STATE · ERROR · PORTS
- `docker service ls` / `docker stack services` → ID · NAME · MODE · REPLICAS · IMAGE · PORTS
- node ids 25 chars, task ids 12, join token `SWMTKN-1-<50>-<25>`

And do not invent a warning or error string. Docker 24 prints
`container_name: Setting the container name is not supported.` — an entry whose
point is "here is the real, easy-to-miss warning" cannot afford a paraphrase.

## Port hygiene when proofing diagrams

Port 8010 was used by the controller's own render rig and served a different
directory; task 4 got another stage's SVGs back without noticing at first.
Pick your own port (8030+), and check the page you get back is the one you
generated before you trust a screenshot.

## Measure, or say you did not (settled by stage 5)

Stages 1–4 each shipped one confident false claim about Swarm and each cost a
review round. Stage 5 measured a dozen claims on a real swarm before shipping
and drew two findings instead of six. Docker is available on this machine.

- Cheap to test — error strings, output shapes, whether a command blocks,
  whether a change rebuilds tasks — so test it.
- Not cheap — multi-node ranking, anything needing three real machines — then
  read it out of `moby/swarmkit` source and say which file settled it.
- Neither — then say plainly in the report that the claim is reasoned, not
  observed, and name it. A flagged inference costs a reviewer ten minutes; an
  unflagged one costs a whole round.

And never present an invented line inside a block that reads as captured
output. `{"Limits":null,…}` looked harmless and is a shape Docker never prints.

## Two more terminology and ordering rules

- **«متعادل‌کنندهٔ بار» is Load Balancer.** Never «توزیع‌کنندهٔ بار» — توزیع‌کننده is
  already fixed as SwarmKit's *Dispatcher*, and the rest of the site uses
  متعادل‌کننده twelve times.
- **Insert a new category at its spec position in `categories.json`, do not
  append.** The spec's order is cluster · workload · network · state ·
  lifecycle · operations · delivery · boundaries. `delivery` was opened early in
  stage 3 out of necessity, so appending puts a stage-3 category ahead of a
  stage-6 one in the index.

## Composed values must be composed from the right network

Stage 6 gave nodes addresses inside the ingress overlay's own `10.0.0.0/24`.
On a real cluster ingress was `10.0.0.0/24` and the nodes were `172.26.0.2-4` —
necessarily disjoint, because the whole point is that the overlay rides on top
of the node network. If you invent an address, invent it in the right subnet.

And do not trim keys out of a JSON block presented as captured output:
`{{json .Containers}}` prints Name, EndpointID, MacAddress, IPv4Address and
IPv6Address, and `{{json .Services}}` carries EndpointID per task.

## Check diagram geometry per glyph, not per text run

A `getBBox()`-per-`<text>` checker misses a diagonal that clips a run's corner
and passes through the glyph cells — stage 6 shipped a line 5 units through a
6.8-unit-wide «ت» with the checker reporting clean. Use `getExtentOfChar` per
glyph with a threshold around 0.8 units, and prove the checker has teeth by
restoring a known-bad coordinate and confirming it fires before you trust a
clean result.

## A canary that stops firing is worse than no canary

Stage 8's geometry checker injected a known-bad coordinate to prove it had
teeth. Then the real fix changed the very string the injection patched, the
injection silently became a no-op, and the page reported a clean
`FINDINGS: 0` that meant nothing. Make the canary **throw** when its needle is
absent, not fall through to a pass.

Related: the session scratchpad is shared. Stage 8 found another session's
`node serve.js` already on the port it picked. Confirm the page served back is
the one you generated before you trust a screenshot.

## Geometry checks are meaningless without the site's real font stack

Stage 8's review ran its per-glyph pass on a page inheriting `monospace` and
got 9 findings — six viewBox overflows and three strikes — **every one of which
vanished** once the site's `--font-ui` stack was applied. Persian glyph metrics
move enough between fallback faces to invent findings and to erase real ones.
Apply `--font-ui` to the proofing page before you believe either result.

## Do not transliterate push/pull into Persian

پوش and پول are both already spoken for on this site: پوش/پوشه/پوشش mean
folder or cover throughout the swarm topic, and **پول is the ordinary word for
money**, used 74 times in the crypto topic. «ساخت ایمیج · پوش · پول» reads as
"image build · cover · money". Say «فرستادنش به رجیستری و کشیدنش روی هر گره»,
in diagrams and `aria-label`s as well as in prose.

## «مدخل X» names a document, not the concept

The citation marker is a reference to an entry, so it reads as one. «یک مدخل
بررسی سلامت که واقعاً برنامه را آزمایش کند» says "an entry healthcheck", and
«تسک هنوز عضو مدخل مش مسیریابی است» says "a member of entry routing mesh" —
neither parses as Persian. The house patterns are «در مدخل X دیدیم»,
«همان‌طور که مدخل X گفت», or a meta-noun possessive like stage 5's «تلهٔ مدخل
والیوم محلی» and stage 6's «آزمایش مدخل مش مسیریابی». Name the term plainly
where the sentence needs the concept, and put the citation in a neighbouring
clause. No test catches this; stage 9 shipped eleven of them.

## Swarm removes a task from the load balancer BEFORE it sends SIGTERM

Settled from `moby/moby` v24.0.7,
`daemon/cluster/executor/container/controller.go`: `Shutdown()` calls
`deactivateServiceBinding()` first, then sleeps `defaultGossipConvergeDelay`
(a hard-coded 2 s, with a source TODO saying it should be configurable), and
only then sends the stop signal. Symmetrically `Start()` calls
`activateServiceBinding()` on the `health_status: healthy` event. The intuitive
ordering — traffic still arriving while the process is dying — is wrong, and the
plan asserted it wrongly too.

## Measure the ink band, not the em box — and calibrate the canary to match

Stage 9's checker flipped from 0 findings to 149 on three untouched diagrams
because an app restart changed which fallback face resolved. The em box bottom
sat at 250.78 against a viewBox of 250 while the real ink descent was 248.64.
Compare the **ink band** (canvas `actualBoundingBoxDescent`, or the equivalent),
not `getExtentOfChar`'s ascent-to-descent box. And because a looser threshold
needs sharper teeth, run **two** throwing canaries: the usual far-outside
needle, plus one whose baseline sits only ~3 units past the edge, which passes
only if the band is calibrated correctly.

## Two more words the site has already chosen

- **«مغز دوپاره»** is *split brain*. `data/architecture/entries/distributed.json`'s
  `leader-election` ships it glossed and then bare; stage 10 coined «مغز شکافته»
  for the same concept in a structurally identical sentence. Same class of
  mistake as «ژتون»/«توکن» and «توزیع‌کنندهٔ بار»/«متعادل‌کنندهٔ بار».
- **«لاگ رَفت»**, never «گزارش رَفت». The `raft` entry says «لاگ» seven times;
  «گزارش» means *report* in all 42 of its other occurrences on the site.
- **«رَفت» always carries the zabar.** Unpointed «رفت» reads as the verb "went".
  The topic was 27–0 pointed before stage 10 added 8 unpointed.

## Grep the CONCEPT across the other topics before you coin a word

Three split-vocabulary corrections on this topic — «ژتون»/«توکن»,
«توزیع‌کنندهٔ بار»/«متعادل‌کنندهٔ بار», «مغز شکافته»/«مغز دوپاره» — all had the
same shape: the coiner grepped for the *word* afterwards instead of for the
*concept* beforehand. Before inventing a Persian rendering, search the crypto
and architecture entries for the English term and for the idea, and use what is
already there. The site is one encyclopedia, not three glossaries.

## Docker's column width rule, so an edited capture can be re-padded

`width = max(10, longest cell including the header + 3)`. Derived in stage 10
and validated against four untouched captures. The failure it catches is
specific and common: a block is captured correctly, then a service is renamed
or an image swapped during editing, and the columns are never re-padded. Stage
10 had sixteen such blocks (eight distinct × two languages) while its verbatim
captures never flagged. Reconstruct each table's expected column starts from
its own cells rather than eyeballing the alignment.

## The browser pane caches — hard-reload before you believe a screenshot

Stage 10's first screenshot after a fix showed the old text while the file on
disk and the same JSON over HTTP were both already correct. Confirming "the
page served back is the one you generated" has to survive the cache too, not
just a stale port: hard-reload, or stamp the page and read the stamp back.

## «ایمیج» is the Docker image; «تصویر» is a picture

Stages 1–6 and 9 wrote «تصویر» for a Docker image; stages 7, 8, 10 and 11 wrote
«ایمیج». The split is not merely inconsistent, it is ambiguous: this topic uses
«تصویر ذهنی» constantly, so `control-plane` says «تصویر خالی نباشد» (an empty
*image*) two entries away from `data-plane`'s «تصویر ذهنی» (a mental *picture*).

**Ruling: «ایمیج» for the Docker image; «تصویر» is reserved for its ordinary
sense.** «ایمیج» takes **no gloss** — it is the transliteration, so the standing
rule leaves it bare alongside تسک، توکن، ماژول، پکیج, and no entry on the site
glosses it. (My first version of this ruling said to gloss it; that was wrong,
and stage 11's review caught the contradiction.)

**«داش»** is the digest — 16 uses against 3 of «خلاصهٔ ایمیج» — and it **does**
take `(Digest)` on first use in each entry, because unlike ایمیج it carries no
trace of its English. Same category as تخصیص‌دهنده `(Allocator)`.

A sweep over stages 1–9 is scheduled after stage 14 and before the final
review; stages 12–14 must use «ایمیج» and «داش» from the start.

## «کامپوز», not bare `Compose`

The topic transliterates every product name — سوارم ×452, داکر ×99, رجیستری
×111, داکرفایل ×14, کوبرنتیز ×2, استک throughout. Bare Latin `Compose` in Persian
prose survives in exactly one entry (`restart-policy`, three prose occurrences),
and all three lack the `dir="ltr"` wrapper CLAUDE.md requires for Latin inside
RTL text, so they are a rendering hazard as well as an inconsistency. «کامپوز»
is the تسک/توکن/ایمیج shape and takes no gloss. The three stragglers go on the
post-stage-14 sweep list; the fourth, inside an English YAML comment in a
`<pre>`, stays.

## Do not scale SVG font sizes by getBoundingClientRect() in this pane

The browser pane reports a layout width of 0, so any geometry checker that
derives a user-unit scale from `getBoundingClientRect()` divides by zero, every
ink band comes out `NaN`, and the page then reports a meaningless
`FINDINGS: 0`. The `font-size` attribute is already in user units — use it
directly. Only the ink-versus-em discriminability guard catches this, which is
the third reason that guard exists.

## `node --test` from the wrong directory fails plausibly

A run whose cwd is inside the scratchpad (which holds a stale copy of the repo)
reports a believable `# fail 1` rather than an obvious error. It has bitten
three separate subagents. Always run it from the repo root.

## A faithful capture can still render wrongly, because it lands in HTML

Stage 13 shipped a literal `<none>` inside a `<pre>` — a byte-exact copy of
Docker's `docker image ls` output. The browser parsed it as an element, the TAG
cell rendered blank and the row misaligned on the live site. Every string-level
check passed; only the browser disagreed. Two lessons: escape `<` and `&` in
captured output, and let the column checker scan the **raw** block for a `<`
that begins a tag before it decodes entities — a checker that decodes first
still sees `<none>` occupying its column and reports clean.

## Three words that must NOT be transliterated

Each exists to stop a collision already on the site, so each is a negative
ruling and durable:

- **`Operator`** (the Kubernetes pattern) stays Latin in a `dir="ltr"` span.
  «اپراتور» occurs six times site-wide and every one means the *human*
  operator.
- **probe** is never «کاوشگر».
- **secret store** is never «انبار راز».

Stage 14 was the first stage to catch a collision *before* coining rather than
after. The three earlier ones — «ژتون», «توزیع‌کنندهٔ بار», «مغز شکافته» — each
cost a fix round.

## Two more measured facts worth not re-deriving

- `docker stack deploy` drops `depends_on` **without naming it**, while naming
  `links` and `restart` in `Ignoring unsupported options:`. The silence reads as
  success.
- `docker secret` has four subcommands — create, inspect, ls, rm — and `inspect`
  returns only id, version, two timestamps, name and labels. No expiry, no
  policy, no access record.
