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
So render one diagram per page and shoot it. The technique, not a command —
the Swarm topic's `svgsheet.py` lived in a session scratchpad and no longer
exists, which is the reason this paragraph now describes the tool instead of
invoking it. **Write yours under `tools/` and commit it**, next to
`tools/acid/`; a proofing script kept in a scratchpad is a script the next
topic will re-derive.

Twenty lines do it: read an entries JSON, take one entry's `svg` string by
index, and emit a standalone HTML page holding that one SVG, with
`assets/css/style.css` linked and the entry's own `dir` on the wrapper.
Linking the real stylesheet is not decoration — see the font-stack rule below;
a proofing page on a fallback face invents findings and erases real ones. Give
the script an index-less mode that just lists every diagram in the file with
its index, so shooting the fifth one does not mean counting braces.

Serve the directory holding the html on a spare port (`python3 -m http.server
8030`), navigate the browser pane to it, and screenshot. One diagram fills the
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

---

# آنچه موضوع «اسید» افزود — what the ACID topic added

The rules above came out of 78 Swarm entries. What follows came out of 36 ACID
entries over eleven stages, and it is here for the same reason: the execution
ledger those stages were tracked in lives in a git-ignored directory and is
deleted when the session ends. Everything worth keeping had to move into a
tracked file, and this is the tracked file.

## «پایداری» is Durability — and ماندگاری was already on the site

The ACID topic titled its D entry **«پایداری»** and its plan justified that as
"first fixed by this topic". It was justified by grepping the *word*, which
found only «پایداری قرارداد» and looked clear. But the **concept** was already
rendered **«ماندگاری»** elsewhere:

- `architecture/distributed-transaction` — twice as the guarantee noun, one of
  those inside an enumeration of exactly the ACID guarantees
  («ماندگاری: وقتی گفت انجام شد، انجام شده …»), plus once in its second SVG
  («ماندگاری پس از تعهد»).
- `crypto/scalability` — «در دسترس بودن با ماندگاری یکی نیست», in the body and
  again in its third SVG.
- `swarm/raft` — «ماندگاریِ یک نوشتن به دیسکِ رهبر گره نخورده».
- `architecture/orchestration` — «ماندگاری و تلاش دوباره را برایت می‌نویسد».

This is exactly the failure the *grep the CONCEPT* rule above names, and the
same shape as ژتون/توکن, توزیع‌کنندهٔ بار/متعادل‌کنندهٔ بار and
مغز شکافته/مغز دوپاره. It was caught only in the final whole-branch review.

**Ruling, on the «ایمیج»/«تصویر» precedent: «پایداری» is Durability, the ACID
letter D.** Reversing it now is expensive and would not be an improvement —
the `durability` entry's *title* is what `test/roadmap-order.test.mjs` keys
citations on, and this branch correctly forbade editing another topic's body
text. So the four surviving ماندگاری uses go on a **sweep list**, to be settled
the next time one of those topics is opened, not by a drive-by edit now.

Two things this ruling does **not** touch:

- **ماندگار as an ordinary adjective is fine and stays.** «حافظهٔ ماندگار»
  (durable storage) appears throughout the ACID topic itself and is not the
  letter D; so is «تصمیم زودهنگام و ماندگار». The ruling is about the *noun
  naming the guarantee* and its adjective in an ACID enumeration.
- The plan's vocabulary table still records the wrong justification. Plans are
  historical documents; the correction lives here, not in a retro-edit.

Fixed inside the ACID topic itself, since it is this branch's own text: two
instances — `acid-outside-the-database`'s «دو ماندگاری» → «دو پایداری», and
`isolation`'s «چقدر ماندگار؟» → «چقدر پایدار؟» (parallel with `acid` and
`acid-consistency`, which already say «اتمی … جدا … پایدار»).

## The canary rule, generalised — ten checker blind spots in eleven stages

The file already carries two instances ("a canary that stops firing is worse
than no canary"; "check per glyph, not per text run"). The ACID topic found
**ten** more, so the general form is worth stating: **a checker that silently
skips a class of input reports success on work it never examined.** Every one
of the ten reported a clean run over something it was not looking at.

The four that recurred, by shape:

- **A gate that excludes most of the corpus.** Stage 4's padding checker keyed
  on `'+' in line` and skipped every single-column table. Stage 7's convergence
  checker inspected only bold subheads and first-paragraph openings. Stage 10's
  lead-in check was gated to the band around a `<pre>`, so two body-to-body
  pairs were invisible — and the six planted canaries could not have caught it,
  because every one of them plants its needle inside the band.
- **The direction you are not thinking about.** New-vs-corpus, new-vs-new and
  old-vs-new are **three different sweeps**. Stage 9 shipped three verbatim
  lead-ins shared between its own two new entries because it only ever compared
  against the corpus. Stage 10 closed new-vs-new; nobody applied the same fix
  old-vs-new, and stage 11 then lifted a 13-token run out of `two-phase-commit`.
- **A regex that runs past its own boundary.** `<p><strong>(.*?)</strong></p>`
  with `re.S` matches across paragraphs, so the checker reported clean while
  examining almost nothing. Anchor the matcher, and check the anchor.
- **An exemption that hides the worst finding.** Stage 11's attribution check
  had to test the run against **the entry the run actually collides with**: the
  paragraph that lifted from `two-phase-commit` attributed it to `saga`, so a
  blanket "it's attributed, skip it" exemption would have hidden it.

So, three requirements on any checker written for a later topic:

1. **Every canary throws when its needle is absent.** A canary that becomes a
   no-op because the fix changed the string it patched turns `FINDINGS: 0` into
   a lie. This has happened twice.
2. **Every checker gets a NEGATIVE canary.** A matcher that returns everything
   passes every positive test. Plant a case that must stay silent.
3. **Validate against a case it should FAIL, before you trust a clean run** —
   and recalibrate *before* fixing, not after. Stage 8 recalibrated its
   threshold first and found twenty repeats where the review had named four.

`tools/acid/` holds the three checkers this topic ended with, with their
canaries, and `tools/README.md` says what has to be re-pointed to reuse them.
They are in the repository and not in a scratchpad **because the Swarm topic's
`svgsheet.py` was written in a scratchpad and is gone.**

## The single highest-yield check in this project: prose against its own blocks

Seven consecutive stages shipped a defect where the prose points back at the
entry's **own** example and describes it wrongly — a count of blocks that is
off by one, "the first block prints three settings" when that `<pre>` holds two
result sets, "every count carries a pid" when the last does not, "the order of
the statements is the same word for word" when this stage added statements, a
sentence that reverses `psql`'s printed order. Stage 7's self-audit found
eleven, stage 8's found ten by reading alone with every automated layer silent.

The transcripts get byte-verified; the sentences *about* them do not. So before
reporting done, walk every positional and count claim in both languages against
the block it describes. It is the cheapest check in the project and the one
that keeps paying.

Related and unsolved: **subheads are checked for repetition but never for
truth.** Stage 8 shipped «همان پنج بلوک» as a false subhead past both the
manual pass and every checker; stage 9 added a canary for that exact shape.

## Fix rounds introduce claims too

Four stages running, the *fix*, not the draft, was the risk:

- stage 8's rewrite said a process "has been sitting idle since 00:51:47.551" —
  `pg_stat_activity` reports state at query time, not continuously;
- stage 9's replacement said "the three blocks overlap in time" — two of them
  do not;
- stage 10's said "this experiment had touched neither before these blocks" —
  false for InnoDB, whose dial an earlier capture run had already set;
- stage 11's earlier fix moved a citation mid-sentence to break an opening
  echo, which stripped the attribution and left four bare verbatim lifts;
- and the final review found the stage-11 fix round had traded one
  self-contradiction about 2PC and the letter A for another.

**Re-audit every sentence a fix round writes against the thing it describes,
exactly as if it were new prose.** It is new prose.

## Removing a citation silently removes a prerequisite

`test/roadmap-order.test.mjs` only fails on a citation pointing **forward**. If
you delete a «مدخل ‹عنوان›» while rewording, you may have deleted a real
prerequisite edge and **nothing will tell you** — the suite stays green.

So when a citation has to be reworded, prefer a form that **keeps** it. The
ACID topic's own breach of the "«مدخل X» names a document" rule was fixed this
way in six places, using a meta-noun that makes the entry the document again:

- «ناهنجاریِ مدخل به‌روزرسانی گم‌شده هیچ‌کدام یکی از آن سه نیست»
- «آنچه مدخل به‌روزرسانی گم‌شده اندازه گرفت روی همین سطح بود»
- «هر سه مدخل خودشان را دارند: مدخل خواندن کثیف، …»

If you must drop one, diff the extracted citation sets before and after — the
extraction is twenty lines and is in the test.

## Capture harness rules, each of which cost a re-capture

- **`psql` needs a pty.** `docker exec -i` hands it a pipe and no prompts print
  at all, so a house-style transcript is impossible. Drive it through a pty.
- **A splice is visible and a recorder that `rstrip`s hides it.** Stage 5 built
  a block labelled «از اول تا آخر» from three captures spliced together; the
  recorder's `rstrip` ate the blank lines `psql` prints between result sets, and
  the review found the seam. The fix is structural, not cosmetic: **one session
  is one continuous capture**, so a seam cannot exist in a block that claims to
  be continuous.
- **A transcript claiming two sessions needs in-band proof of two sessions.**
  Stage 5's MySQL block was byte-identical to a single-session replay, which
  means it proved nothing. `pg_backend_pid()`, `CONNECTION_ID()`,
  `pg_blocking_pids()` naming the other process, unbroken prompt stars, or a
  wait whose duration only overlap explains. The strongest on the site is the
  deadlock `DETAIL`, because the *server* names both processes in a line no
  single session could fabricate.
- **Inherit no container.** The probe container is left with dirty state;
  recreate it. And a stray background capture script writing to the same
  database corrupts a run silently — the scratchpad-is-shared hazard covers
  ports above, but it covers processes too.

## Data-file mechanics that are not obvious

- **`short` and `title` take NO HTML.** `render.js` passes them to `el()` as
  text children, so a `<span dir="ltr">` prints as literal markup on the index
  card. Bare Latin is correct there; the `dir="ltr"` rule applies to `body` and
  `example` only. Thirteen of the site's shorts carry bare Latin and none
  carries a tag.
- **Category `en` names keep a literal `&`** («Levels & Concurrency»), same
  reason: `&amp;` would render as five characters.
- **Append to `data/<topic>/roadmap.json` textually.** Round-tripping it
  through `json.dump(indent=2)` reflows every stage's one-line `entries` array
  and turns a 12-line append into a 48-line diff.
- **Insert a new category at its spec position, do not append** — the Swarm
  rule above, restated because the ACID plan told two separate stages to append
  and both would have put a later category ahead of an earlier one.
- **Cross-topic citations are legal and carry no topic prefix.** Ids are unique
  site-wide, so «مدخل تکثیر» from an ACID entry resolves to the architecture
  entry and the roadmap guard accepts it.

## Two measured facts from PostgreSQL 18.6 worth not re-deriving

- `pg_constraint` lists a `NOT NULL` as a real row (`contype='n'`), so a table
  with a primary key and one `NOT NULL` has **two** constraint rows, not one.
  Writing "one constraint, the primary key" is a false claim about your own
  block.
- There is no `autocommit` server parameter — `SHOW autocommit` errors with
  `unrecognized configuration parameter`. Autocommit is a *client* concept;
  in `psql` it is `\echo :AUTOCOMMIT`.
