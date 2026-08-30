# ACID Topic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add دژنبشت's fourth topic — ACID — as 36 entries in 7 categories on an 11-stage learning path, without touching a line of JavaScript.

**Architecture:** Content-only change. Every file created is JSON under `data/acid/`, plus one line in `data/topics.json` and `related`-only edits to five existing entries. The index, search, hashtags, category pages and related-links are all derived from the data at load time, so no code changes are needed or permitted. `test/roadmap-order.test.mjs` is the driver of the red-green cycle: it parses «مدخل ‹عنوان›» out of each Persian body as a prerequisite declaration and fails both on an entry missing from the roadmap and on one placed before something it leans on.

**Tech Stack:** Plain JSON data files. Node's built-in test runner (`node --test`, no path argument). PostgreSQL 18.6 in Docker for measuring engine behaviour; Go 1.x with `go test` for engine-independent examples, matching the 204 existing examples in the architecture topic.

**Spec:** `docs/superpowers/specs/2026-08-28-acid-topic-design.md`

## Global Constraints

- **Never edit a file under `assets/` or `test/`.** Acceptance criterion 2 is that `git diff c782477..HEAD -- assets test` is empty. If a test fails, the data is wrong, not the test.
- **Run `node --test` with no path argument.** `node --test test/` fails on Node 22 with `MODULE_NOT_FOUND`. Run it from the repository root: `node --test`.
- **Read `docs/entry-conventions.md` before writing any entry.** All 32 rules still hold. Each cost a review round.
- **Every entry needs `fa.title`, `fa.short`, `fa.body` and a complete `en` block** (`title`, `short`, `body`). `assets/js/data.js` requires the three `fa` fields; `#/self-test` reports any entry missing an English translation. `example` and `svg` are optional.
- **An entry with no `fa.title` is dropped from the index entirely** while keeping its error. Never ship one.
- **`related` may only name ids that exist.** A dangling `related` is the most common breakage on this site and `validate` reports it in a banner.
- **Persian is the primary language.** English terms inside Persian text need `dir="ltr"`. Never set `letter-spacing` on Persian and never set Persian in a monospace face.
- **Gloss rule:** `<span dir="ltr">(Term)</span>` on first use in each entry, once per entry, for coined Persian renderings only. A term that owns its own entry is cited as «مدخل ‹عنوان›» with no parenthetical.
- **Inline SVG containing Latin or hex needs `direction="ltr"` on the root**, and Persian `<text>` inside it needs `direction="rtl"` with `text-anchor="middle"`.
- **Formulas and short code go in plain `<code>` with normal spaces.** `render.js` converts the spaces of any inline `<code>` up to 32 characters into non-breaking ones.
- **Do not coin a Persian word before grepping the concept across `data/`.** See the fixed-vocabulary table below.

### Fixed vocabulary — use these exact words

| Persian | English | already fixed by |
|---|---|---|
| جداسازی | Isolation | `distributed-transaction`, `two-phase-commit`, `saga` — seven uses, this exact meaning |
| اتمی بودن | Atomicity | `saga` |
| تعهد | Commit (a transaction) | `two-phase-commit` |
| کامیت | Commit (in Git) | `ci-cd-pipeline`, `image-tag` — **never use this for a transaction** |
| قفل | Lock | 92 uses |
| لاگ | Log | 131 uses — never «گزارش» |
| پایگاه داده | Database | 273 uses — never «دیتابیس» |
| هم‌روندی | Concurrency | `solid` |
| توکن | Token | 49 uses — never «ژتون» |

First fixed by this topic: **بن‌بست** (Deadlock), **پایداری** (Durability), **کژتابی نوشتن** (Write Skew), **خواندن شبح** (Phantom Read), **لاگ پیش‌نوشت** (Write-Ahead Log), **قید یکپارچگی** (Integrity Constraint).

### Hashtag vocabulary

Reuse these existing tags: `consistency`, `failure`, `integrity`, `storage`, `boundary`, `decision`, `operations`, `antipattern`, `structure`.

This topic introduces exactly six new ones — do not invent a seventh: `transaction`, `isolation`, `anomaly`, `locking`, `recovery`, `durability`.

### Measuring engine behaviour

Any entry that claims what an engine does must have run it. Start the probe once per task that needs it:

```bash
docker rm -f acidprobe 2>/dev/null
docker run -d --name acidprobe -e POSTGRES_PASSWORD=x postgres:18-alpine
until docker exec acidprobe pg_isready -q; do sleep 1; done
docker exec -i acidprobe psql -U postgres -X -c "select version()"
```

Rules, learned from the Swarm topic where nine of fourteen stages had a
confident claim overturned by measurement:

- **The engine version goes in any entry that claims engine behaviour.** `REPEATABLE READ` means materially different things in PostgreSQL and InnoDB. An example that does not say which engine ran it is wrong even when its output is right.
- **Two concurrent sessions must look like two sessions.** Interleave them with an explicit ordering; never stack two SQL blocks and call it concurrency.
- **`psql` output is copied from a real run.** Column widths, row counts, and the exact error text, including the two spaces after `ERROR:`.
- **If you could not measure a claim, remove the claim.** Do not soften it.

### Facts already measured — do not re-derive, but do re-run to capture output

Measured on **PostgreSQL 18.6** (`postgres:18-alpine`, aarch64) while writing this plan:

1. `BEGIN ISOLATION LEVEL READ UNCOMMITTED` is **accepted**, and `SHOW transaction_isolation` reports back `read uncommitted` — not `read committed`. Widespread lore says PostgreSQL reports it as `read committed`; on 18.6 it does not.
2. Nevertheless **no dirty read occurs**: with session A holding an uncommitted `UPDATE t SET n=999`, session B at READ UNCOMMITTED reads `100`, the committed value. The level is accepted and reported, and behaves as READ COMMITTED.
3. **REPEATABLE READ prevents phantoms.** A snapshot that counted 2 rows still counts 2 after another session commits an `INSERT`. The SQL standard permits phantoms at this level; PostgreSQL does not produce them.
4. **REPEATABLE READ permits write skew.** Two sessions each read `count(*) from duty where on_call` = 2, each set a different person off-call, both commit, and the final count is **0** — the invariant "at least one person on call" is violated with no error.
5. **SERIALIZABLE catches that same write skew** by aborting the second transaction:
   ```
   ERROR:  could not serialize access due to read/write dependencies among transactions
   DETAIL:  Reason code: Canceled on identification as a pivot, during write.
   HINT:  The transaction might succeed if retried.
   ```
   Final count is 1. The invariant holds because a transaction died, not because it waited.
6. **Lost update, READ COMMITTED:** both sessions read 100, one writes 90, the other writes 80, both commit, final balance is **80**. The 90 is gone with no error.
7. **Lost update, REPEATABLE READ:** the second session gets `ERROR:  could not serialize access due to concurrent update` and rolls back; final balance is **90**. The anomaly is prevented by abort, not by ordering — which is why the application must retry.

Facts 4–7 are the spine of stages 6, 7 and 8. Facts 1 and 2 are the spine of `read-uncommitted`.

---
### One more measured fact — the engine contrast that stage 8 is built on

Same experiment as fact 7, run against **MySQL InnoDB 8.4.11** (`mysql:8.4`):
two sessions at `REPEATABLE READ` both read `bal = 100`, one writes 90, the
other writes 80, **both commit with no error, and the final balance is 80**.

So the identical isolation level name produces opposite outcomes:

| engine | `REPEATABLE READ`, two sessions racing on one row | outcome |
|---|---|---|
| PostgreSQL 18.6 | second transaction aborts | balance 90, `could not serialize access due to concurrent update` |
| MySQL InnoDB 8.4.11 | both commit silently | balance 80, the 90 is lost |

This single pair is the strongest evidence in the topic that the SQL
standard's tidy ladder is not a description of any real engine. Stage 8 is
built on it.

Start MySQL like this — it takes about a minute to initialise, and the
first `mysqladmin ping` succeeds against a temporary server that then
restarts, so poll on a real query instead:

```bash
docker run -d --name myprobe -e MYSQL_ROOT_PASSWORD=x -e MYSQL_DATABASE=d mysql:8.4
for i in $(seq 1 45); do docker exec myprobe mysql -uroot -px -N -e "select version();" 2>/dev/null && break; sleep 2; done
```

---

## Task 1: Stage 1 — تراکنش چیست

Creates the topic. This is the only task that touches `data/topics.json`,
and the only one where a mistake makes the whole site render an empty
index — `data.js` will not load a topic that is not listed there.

**Files:**
- Modify: `data/topics.json` — add one object
- Create: `data/acid/categories.json` — with `basics` only
- Create: `data/acid/entries/basics.json` — 4 of its eventual 5 entries
- Create: `data/acid/roadmap.json` — with stage 1 only

**Interfaces:**
- Consumes: nothing.
- Produces: the titles «تراکنش پایگاه داده», «مرز تراکنش», «تعهد خودکار» and «ACID». Every later task cites at least one of these as «مدخل ‹عنوان›». The category file `basics.json` is reopened once, by Task 2, to add `savepoint`.

**Entries:**

| id | fa.title | en.title | angle | example | tags |
|---|---|---|---|---|---|
| `db-transaction` | تراکنش پایگاه داده | Database Transaction | a unit of work whose halves are never visible separately | psql | `transaction`, `structure` |
| `transaction-boundary` | مرز تراکنش | Transaction Boundary | `BEGIN`/`COMMIT`/`ROLLBACK`, and who decides where the boundary goes | psql | `transaction`, `structure` |
| `autocommit` | تعهد خودکار | Autocommit | the statement you did not wrap is already a transaction | psql | `transaction`, `decision` |
| `acid` | ACID | ACID | the four letters, and the four things they do not promise | none | `transaction`, `decision` |

**Content requirements:**

- `db-transaction` opens on the money-transfer shape but must not stop there: the point is that the *outside* never sees one half. Cite nothing (it is the first entry). Must state that the id `transaction` on this site belongs to the Bitcoin entry, and link to it via `related`.
- `transaction-boundary` must show that `ROLLBACK` is a normal outcome, not an error path, and that the boundary is drawn by the application, not the database. Cite «مدخل تراکنش پایگاه داده».
- `autocommit` is the entry that fixes the most common misunderstanding: a bare `UPDATE` is already atomic and already durable. Show `SHOW autocommit` / the `psql` default and a bare `UPDATE` that survives a disconnect. Cite «مدخل مرز تراکنش».
- `acid` is a map entry. It names the four letters, says which later entry owns each, and — taking the input lesson's best point — states plainly what ACID does *not* say: nothing about permissions, nothing about application bugs, nothing about whether the system scales. Cite «مدخل تراکنش پایگاه داده». No `psql` example; this entry earns its keep in prose.

**`data/topics.json` addition** (append to the array, after `swarm`):

```json
{ "id": "acid", "fa": "ACID", "en": "ACID" }
```

**`data/acid/categories.json`** (this task creates it with one row; later tasks append):

```json
[
  { "id": "basics", "file": "basics.json", "fa": "مبانی تراکنش", "en": "Transaction Basics" }
]
```

**`data/acid/roadmap.json`** (created with stage 1 only):

```json
{
  "stages": [
    {
      "id": "what-a-transaction-is",
      "fa": {
        "title": "تراکنش چیست",
        "why": "پیش از چهار حرف: آن واحد کاری که قرار است این چهار ضمانت دربارهٔ آن حرف بزنند"
      },
      "en": {
        "title": "What a transaction is",
        "why": "Before the four letters: the unit of work they are guarantees about"
      },
      "entries": ["db-transaction", "transaction-boundary", "autocommit", "acid"]
    }
  ]
}
```

- [ ] **Step 1: Read the conventions and the spec**

Read `docs/entry-conventions.md` in full and the «مدخل‌ها» and «واژگان» sections of `docs/superpowers/specs/2026-08-28-acid-topic-design.md`.

- [ ] **Step 2: Start PostgreSQL and capture the output the three examples need**

```bash
docker rm -f acidprobe 2>/dev/null
docker run -d --name acidprobe -e POSTGRES_PASSWORD=x postgres:18-alpine
until docker exec acidprobe pg_isready -q; do sleep 1; done
docker exec -i acidprobe psql -U postgres -X -c "select version()"
```

Run each example you intend to print, and paste the real output. Record the server version string; `db-transaction` and `autocommit` both claim engine behaviour and must name it.

- [ ] **Step 3: Create the four entries**

Create `data/acid/entries/basics.json` as a JSON array of 4 objects, each shaped:

```json
{
  "id": "db-transaction",
  "tags": ["transaction", "structure"],
  "related": ["transaction-boundary", "autocommit", "transaction"],
  "fa": { "title": "…", "short": "…", "body": "…", "example": "…" },
  "en": { "title": "…", "short": "…", "body": "…", "example": "…" }
}
```

**`related` may only name ids that already exist or are created in this same task.** An id from a later task does not exist yet and `validate` will report it as dangling. `related` is also **one-directional** — `render.js` reads only `entry.related`, so a link from A to B does not put A on B's page. Later entries therefore link back to earlier ones, and the few forward links that genuinely matter are added in one pass in Task 11, Step 7.

- [ ] **Step 4: Add the topic and the category**

Add the `acid` object to `data/topics.json` and create `data/acid/categories.json` with the single `basics` row exactly as given above.

- [ ] **Step 5: Run the suite and watch it fail for the right reason**

Run: `node --test`
Expected: FAIL in `[acid] نقشه هر مدخل موضوع را دقیقاً یک بار دارد` with
`این مدخل‌ها در هیچ مرحله‌ای نیستند: db-transaction, transaction-boundary, autocommit, acid`

If it fails with anything else — a dangling `related`, a missing `fa.body` — fix that first. The failure above is the one this step is looking for.

- [ ] **Step 6: Create the roadmap with stage 1**

Create `data/acid/roadmap.json` exactly as given above.

- [ ] **Step 7: Run the suite and confirm it passes**

Run: `node --test`
Expected: PASS, all tests.

- [ ] **Step 8: Look at it in a browser**

```bash
node serve.js
```

Open `#/self-test` and confirm four entries render in both languages with no validation errors and no missing-English report. Then open the index and confirm the ACID topic chip appears and filters to four entries.

- [ ] **Step 9: Commit**

```bash
git add data/topics.json data/acid
git commit -m "feat(acid): stage 1 — what a transaction is"
```

---

## Task 2: Stage 2 — همه یا هیچ

**Files:**
- Modify: `data/acid/entries/basics.json` — append `savepoint`
- Create: `data/acid/entries/atomic.json` — `atomicity`, `transaction-rollback` (2 of its eventual 4)
- Modify: `data/acid/categories.json` — append `atomic`
- Modify: `data/acid/roadmap.json` — append stage 2

**Interfaces:**
- Consumes: «مدخل تراکنش پایگاه داده», «مدخل مرز تراکنش» from Task 1.
- Produces: «اتمی بودن», «بازگردانی تراکنش», «نقطهٔ ذخیره». Task 3 cites «مدخل اتمی بودن» and «مدخل بازگردانی تراکنش»; Task 10 cites «مدخل اتمی بودن».

**Entries:**

| id | fa.title | en.title | angle | example | tags |
|---|---|---|---|---|---|
| `atomicity` | اتمی بودن | Atomicity | all or nothing, as seen from outside | psql | `transaction`, `structure` |
| `transaction-rollback` | بازگردانی تراکنش | Transaction Rollback | not undoing the work — returning to before it | psql | `transaction`, `failure` |
| `savepoint` | نقطهٔ ذخیره | Savepoint | a partial return, and why this is not a nested transaction | psql | `transaction`, `structure` |

**Content requirements:**

- `atomicity` must be careful about what "all or nothing" means: it is a statement about what an *observer* can see, not about how the engine gets there. The mechanism is deferred to «مدخل لاگ لغو» in Task 3 — do not explain undo here, and do not cite it, because Task 3 comes later and the citation guard would fail.
- `transaction-rollback` carries the comparison with the Swarm entry of the same English name. The Swarm `rollback` moves a service back one step and that step is itself reversible; a transaction rollback returns to a state that leaves no trace it was ever departed from. Put `rollback` in `related` and make the contrast explicit in one sentence — it is the kind of thing this site exists to say. Cite «مدخل اتمی بودن».
- `savepoint` must kill the "nested transaction" misreading: a savepoint does not create an inner transaction that can commit on its own. `ROLLBACK TO SAVEPOINT` returns to a point inside one transaction, which still commits or rolls back as a whole. Cite «مدخل بازگردانی تراکنش». Show a real `psql` session where a statement error inside a transaction poisons it (`current transaction is aborted, commands ignored until end of transaction block`) and a savepoint is what lets the transaction continue — capture that error text exactly.

**`data/acid/categories.json`** — append:

```json
{ "id": "atomic", "file": "atomic.json", "fa": "اتمی بودن", "en": "Atomicity" }
```

**`data/acid/roadmap.json`** — append to `stages`:

```json
{
  "id": "all-or-nothing",
  "fa": {
    "title": "همه یا هیچ",
    "why": "اولین حرف، و تنها حرفی که بیشتر مردم فکر می‌کنند تمام ماجراست"
  },
  "en": {
    "title": "All or nothing",
    "why": "The first letter, and the only one most people think is the whole story"
  },
  "entries": ["atomicity", "transaction-rollback", "savepoint"]
}
```

- [ ] **Step 1: Re-read the conventions rules on citation**

«مدخل ‹عنوان›» is a declaration of a prerequisite, not decoration. Only cite entries that already exist in an earlier stage. `docs/entry-conventions.md` has this under «‹مدخل X› is a declaration, not a decoration».

- [ ] **Step 2: Capture the real `psql` output for all three examples**

Start the probe as in Task 1, Step 2. The `savepoint` example needs the exact aborted-transaction error; do not paraphrase it.

- [ ] **Step 3: Write the entries**

Append `savepoint` to `data/acid/entries/basics.json`; create `data/acid/entries/atomic.json` with `atomicity` and `transaction-rollback`.

- [ ] **Step 4: Add the category**

Append the `atomic` row to `data/acid/categories.json`.

- [ ] **Step 5: Run the suite and watch it fail for the right reason**

Run: `node --test`
Expected: FAIL with `این مدخل‌ها در هیچ مرحله‌ای نیستند: atomicity, transaction-rollback, savepoint`

- [ ] **Step 6: Append stage 2 to the roadmap**

- [ ] **Step 7: Run the suite and confirm it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add data/acid
git commit -m "feat(acid): stage 2 — all or nothing"
```

---

## Task 3: Stage 3 — لاگ: چگونه

The mechanism stage. `wal` is written here but filed under the `durable`
category, because a reader browsing the category list looks for WAL under
Durability while a reader following the path needs it as soon as
atomicity needs a mechanism. This is deliberate and is explained in the
spec under «سه جا که ترتیب عمدی است».

**Files:**
- Modify: `data/acid/entries/atomic.json` — append `undo-log`, `non-transactional-effect`
- Create: `data/acid/entries/durable.json` — `wal` only (4 more arrive in Task 10)
- Modify: `data/acid/categories.json` — append `durable`
- Modify: `data/acid/roadmap.json` — append stage 3

**Interfaces:**
- Consumes: «مدخل اتمی بودن», «مدخل بازگردانی تراکنش» from Task 2.
- Produces: «لاگ پیش‌نوشت», «لاگ لغو», «اثر غیرتراکنشی». Task 10 cites «مدخل لاگ پیش‌نوشت» heavily; Task 11 cites «مدخل اثر غیرتراکنشی».

**Entries:**

| id | fa.title | en.title | angle | example | tags |
|---|---|---|---|---|---|
| `wal` | لاگ پیش‌نوشت | Write-Ahead Log | write the intention before the data; one structure, two guarantees | psql | `transaction`, `recovery`, `storage` |
| `undo-log` | لاگ لغو | Undo Log | how "or nothing" is actually delivered | psql | `transaction`, `recovery` |
| `non-transactional-effect` | اثر غیرتراکنشی | Non-Transactional Effect | sequence gaps, DDL, and the email that already left | Go | `transaction`, `boundary`, `failure` |

**Content requirements:**

- `wal` states the rule in one line — the log record reaches durable storage before the data page does — and then draws the consequence that makes the whole topic cohere: **the same log serves atomicity and durability.** Do not explain `fsync`, checkpoints, or recovery here; those are Task 10 and citing them would fail the guard. Cite «مدخل اتمی بودن». A diagram is worth it here: log record, data page, and the ordering arrow between them. Root needs `direction="ltr"` because it carries LSN-ish Latin strings; Persian labels need `direction="rtl"` and `text-anchor="middle"`.
- `undo-log` explains rollback's mechanism and closes the loop opened in Task 2. It must be honest that PostgreSQL does not have a separate undo log the way InnoDB does — PostgreSQL keeps old row versions in the table itself, which is why its rollback is cheap and its `VACUUM` is not. **Measure this before asserting it.** If you cannot demonstrate it from `psql`, say what you did demonstrate and cut the rest. Cite «مدخل بازگردانی تراکنش» and «مدخل لاگ پیش‌نوشت».
- `non-transactional-effect` is the entry that keeps the topic honest about its own boundary. Three things do not come back on rollback: a consumed sequence value (`nextval` is deliberately non-transactional, so ids have gaps — demonstrate this in `psql`), DDL in engines that do not make it transactional, and any effect outside the database at all. The last one is the bridge: `related` must include `outbox-pattern` and `idempotency`. The Go example shows the shape — a handler that writes a row and then publishes, with the window between them. Cite «مدخل اتمی بودن».

**`data/acid/categories.json`** — append:

```json
{ "id": "durable", "file": "durable.json", "fa": "پایداری", "en": "Durability" }
```

**`data/acid/roadmap.json`** — append:

```json
{
  "id": "the-log",
  "fa": {
    "title": "لاگ: چگونه",
    "why": "«همه یا هیچ» تا وقتی مکانیزمش را نبینی یک شعار است — و همان مکانیزم بعداً پایداری را هم می‌دهد"
  },
  "en": {
    "title": "The log: how",
    "why": "\"All or nothing\" is a slogan until you see the mechanism — and the same mechanism delivers durability later"
  },
  "entries": ["wal", "undo-log", "non-transactional-effect"]
}
```

- [ ] **Step 1: Measure before writing**

Two claims in this task need evidence: that a rolled-back `INSERT` still consumes its sequence value, and whatever you end up saying about where PostgreSQL keeps old row versions. Run both. Capture output.

```bash
docker exec -i acidprobe psql -U postgres -X <<'SQL'
create table s(id serial primary key, v text);
begin; insert into s(v) values ('a'); rollback;
insert into s(v) values ('b');
select * from s;
SQL
```

- [ ] **Step 2: Write the three entries**

- [ ] **Step 3: Add the `durable` category**

- [ ] **Step 4: Run the suite and watch it fail for the right reason**

Run: `node --test`
Expected: FAIL with `این مدخل‌ها در هیچ مرحله‌ای نیستند: wal, undo-log, non-transactional-effect`

- [ ] **Step 5: Append stage 3 to the roadmap**

- [ ] **Step 6: Run the suite and confirm it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 7: Proof the WAL diagram**

Serve the site, open the `wal` entry, and check the diagram at the real page width in both languages. `docs/entry-conventions.md` has the diagram-proofing procedure under «Proofing diagrams visually» — do not skip it, and hard-reload, because the browser pane caches.

- [ ] **Step 8: Commit**

```bash
git add data/acid
git commit -m "feat(acid): stage 3 — one log, two guarantees"
```

---

## Task 4: Stage 4 — حرفی که جنس دیگری دارد

**Files:**
- Create: `data/acid/entries/consistent.json` — all 4
- Modify: `data/acid/categories.json` — append `consistent`
- Modify: `data/acid/roadmap.json` — append stage 4
- Modify: `data/architecture/entries/distributed.json` — `related` of `consistency` only

**Interfaces:**
- Consumes: «مدخل تراکنش پایگاه داده», «مدخل ACID», «مدخل اتمی بودن».
- Produces: «قید یکپارچگی», «سازگاری در ACID», «قید معوق», «دو معنای سازگاری». Nothing later in this plan depends on them, which is why this stage can sit here without constraining stages 5–11.

**Entries:**

| id | fa.title | en.title | angle | example | tags |
|---|---|---|---|---|---|
| `integrity-constraint` | قید یکپارچگی | Integrity Constraint | the database's actual share of C | psql | `integrity`, `consistency` |
| `acid-consistency` | سازگاری در ACID | Consistency in ACID | why C is a different kind of thing from A, I and D | psql | `consistency`, `decision` |
| `deferred-constraint` | قید معوق | Deferred Constraint | when the check runs, and why that is a design choice | psql | `integrity`, `consistency` |
| `acid-c-vs-cap-c` | دو معنای سازگاری | Two Meanings of Consistency | one letter, two unrelated ideas | none | `consistency`, `boundary`, `decision` |

**Content requirements:**

- `integrity-constraint` covers `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL`, `CHECK` — with real violation output for at least two of them, copied exactly. Cite «مدخل تراکنش پایگاه داده».
- `acid-consistency` is one of the three entries carrying this topic. The sharp claim: A, I and D are guarantees the database makes; C is a property the *application* maintains, and the database supplies tools for it. A transaction that moves £100 from an account that does not have it, with no `CHECK` in place, violates nothing the database promised. Say this plainly and then say what the database does contribute — the constraints of the previous entry, and the fact that A and I are what make the application's own invariant-preserving code trustworthy. Cite «مدخل قید یکپارچگی» and «مدخل ACID».
- `deferred-constraint` shows `DEFERRABLE INITIALLY DEFERRED` and the circular-foreign-key case that cannot be satisfied any other way. Measure it. Cite «مدخل قید یکپارچگی».
- `acid-c-vs-cap-c` has no example and needs none. ACID's C is "the invariants still hold". CAP's C is "every reader sees the latest write". They share a letter and nothing else. `related` must include `cap-theorem`, `consistency`, `strong-consistency`. Cite «مدخل سازگاری در ACID». **Note for the guard:** these three targets live in the architecture topic, so the citation guard cannot see them; check by hand that the ids are spelled right.

**Reverse bridge (this task, not Task 11):** add `acid-c-vs-cap-c` to the `related` array of the existing `consistency` entry in `data/architecture/entries/distributed.json`. Change nothing else in that file — not one word of the body.

**`data/acid/categories.json`** — append:

```json
{ "id": "consistent", "file": "consistent.json", "fa": "سازگاری", "en": "Consistency" }
```

**`data/acid/roadmap.json`** — append:

```json
{
  "id": "the-odd-letter",
  "fa": {
    "title": "حرفی که جنس دیگری دارد",
    "why": "سه حرف دیگر را پایگاه داده تضمین می‌کند؛ این یکی را برنامه نگه می‌دارد"
  },
  "en": {
    "title": "The odd letter out",
    "why": "The database guarantees the other three; this one the application keeps"
  },
  "entries": ["integrity-constraint", "acid-consistency", "deferred-constraint", "acid-c-vs-cap-c"]
}
```

- [ ] **Step 1: Measure the constraint violations and the deferred case**

- [ ] **Step 2: Write the four entries**

- [ ] **Step 3: Add the `consistent` category**

- [ ] **Step 4: Run the suite and watch it fail for the right reason**

Run: `node --test`
Expected: FAIL listing the four ids as missing from the roadmap.

- [ ] **Step 5: Append stage 4 to the roadmap**

- [ ] **Step 6: Add the reverse bridge on `consistency`**

Append `"acid-c-vs-cap-c"` to that entry's `related` array in `data/architecture/entries/distributed.json`.

- [ ] **Step 7: Run the suite and confirm it passes**

Run: `node --test`
Expected: PASS. Then confirm the architecture topic still has 120 entries and its own roadmap test is green — a `related` edit cannot break it, but confirm rather than assume.

- [ ] **Step 8: Commit**

```bash
git add data/acid data/architecture/entries/distributed.json
git commit -m "feat(acid): stage 4 — the letter the application keeps"
```

---
## Task 5: Stage 5 — وقتی دو نفر همزمان

The first stage where every example needs two concurrent sessions. Read
the two-session rule in Global Constraints before starting.

**Files:**
- Create: `data/acid/entries/anomalies.json` — 4 of its eventual 6
- Modify: `data/acid/categories.json` — append `anomalies`
- Modify: `data/acid/roadmap.json` — append stage 5

**Interfaces:**
- Consumes: «مدخل تراکنش پایگاه داده», «مدخل مرز تراکنش».
- Produces: «جداسازی», «خواندن کثیف», «خواندن غیرتکرارپذیر», «خواندن شبح». Task 7 cites all four; Task 6 cites «مدخل جداسازی».

**Entries:**

| id | fa.title | en.title | angle | example | tags |
|---|---|---|---|---|---|
| `isolation` | جداسازی | Isolation | each transaction should run as if alone — and what "as if" is hiding | psql | `isolation`, `transaction` |
| `dirty-read` | خواندن کثیف | Dirty Read | reading a value that was never committed | psql | `isolation`, `anomaly` |
| `non-repeatable-read` | خواندن غیرتکرارپذیر | Non-Repeatable Read | the same row, read twice, two answers | psql | `isolation`, `anomaly` |
| `phantom-read` | خواندن شبح | Phantom Read | the same condition, read twice, a different set of rows | psql | `isolation`, `anomaly` |

**Content requirements:**

- `isolation` uses «جداسازی», which the site already fixed for exactly this meaning in `distributed-transaction`, `two-phase-commit` and `saga` — do not coin a new word, and put those three in `related`. The entry must say the thing that makes the next twelve entries necessary: full isolation is affordable only if you are willing to pay for it, so real engines sell it in grades. Do not name the grades here; that is Task 7. Cite «مدخل تراکنش پایگاه داده».
- The three anomaly entries each need a **two-session transcript with explicit ordering**. Each must show the anomaly happening, not describe it. For `dirty-read`, the honest result on PostgreSQL is that you **cannot** produce one — see measured fact 2 — so this entry demonstrates the attempt and its failure, and states that the anomaly is real in engines that permit it while PostgreSQL never does. That is a stronger entry than a fabricated transcript. Do not fake it.
- `non-repeatable-read` and `phantom-read` are both reproducible at `READ COMMITTED`. Show them there. Do not mention isolation levels beyond naming the level the session ran at — the levels are Task 7 and citing them would fail the guard.
- The difference between the last two is the whole point and is easy to blur: non-repeatable read is about a row that changed; phantom read is about the *set* of rows a condition matches. Make one sentence carry that distinction.

**`data/acid/categories.json`** — append:

```json
{ "id": "anomalies", "file": "anomalies.json", "fa": "ناهنجاری‌ها", "en": "Anomalies" }
```

**`data/acid/roadmap.json`** — append:

```json
{
  "id": "two-at-once",
  "fa": {
    "title": "وقتی دو نفر همزمان",
    "why": "تا وقتی یک تراکنش در سیستم بود، جداسازی مجانی بود و اسمی لازم نداشت"
  },
  "en": {
    "title": "When two run at once",
    "why": "With one transaction in the system, isolation was free and needed no name"
  },
  "entries": ["isolation", "dirty-read", "non-repeatable-read", "phantom-read"]
}
```

- [ ] **Step 1: Build a two-session harness you can reuse for stages 5–9**

You will run interleaved sessions in five separate tasks. Write one small
script now, under the scratchpad directory, that takes two SQL scripts and
an offset and runs them against `acidprobe` with a known ordering. Keep it
out of the repository — it is a measuring instrument, not a deliverable.

- [ ] **Step 2: Reproduce all three anomalies (and fail to reproduce the first)**

Capture, for each: the level each session ran at, the ordering, and both
sessions' real output. Confirm for yourself that `dirty-read` cannot be
produced on PostgreSQL 18.6 rather than taking measured fact 2 on trust.

- [ ] **Step 3: Write the four entries**

- [ ] **Step 4: Add the `anomalies` category**

- [ ] **Step 5: Run the suite and watch it fail for the right reason**

Run: `node --test`
Expected: FAIL listing the four ids as missing from the roadmap.

- [ ] **Step 6: Append stage 5 to the roadmap**

- [ ] **Step 7: Run the suite and confirm it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add data/acid
git commit -m "feat(acid): stage 5 — the three anomalies the standard names"
```

---

## Task 6: Stage 6 — دوتایی که استاندارد نامشان را نبرد

Two entries, and they are the reason the input lesson needed correcting:
its own worked example — two concurrent withdrawals from one account — is
a lost update, which is not among the three anomalies it listed.

**Files:**
- Modify: `data/acid/entries/anomalies.json` — append `lost-update`, `write-skew`
- Modify: `data/acid/roadmap.json` — append stage 6

**Interfaces:**
- Consumes: «مدخل جداسازی», «مدخل خواندن غیرتکرارپذیر».
- Produces: «به‌روزرسانی گم‌شده», «کژتابی نوشتن». Task 7 cites both; Task 8 is built on `write-skew`.

**Entries:**

| id | fa.title | en.title | angle | example | tags |
|---|---|---|---|---|---|
| `lost-update` | به‌روزرسانی گم‌شده | Lost Update | read, compute, write — and one of the two writes vanishes | psql | `isolation`, `anomaly`, `failure` |
| `write-skew` | کژتابی نوشتن | Write Skew | both transactions are individually correct and the result is wrong | psql | `isolation`, `anomaly`, `failure` |

**Content requirements:**

- `lost-update` reproduces measured fact 6: at `READ COMMITTED`, both sessions read 100, one writes 90, the other 80, both commit, final balance 80. **The 90 is gone and nothing reported it.** Say plainly that this is the shape of nearly every real concurrency bug: not corruption, just a write that quietly did not happen. Do not present the fix here — `select-for-update` is Task 8 — but do say the fix has its own entry coming, without using the «مدخل ‹عنوان›» form, which would declare a prerequisite that does not exist yet. Cite «مدخل جداسازی».
- `write-skew` reproduces measured fact 4: two sessions each check "at least one person is on call", each take a different person off call, both commit, and nobody is on call. Neither transaction did anything wrong on its own; the invariant spans rows that neither of them wrote. This is the anomaly the SQL standard does not name and the one most likely to be in production right now. Cite «مدخل به‌روزرسانی گم‌شده».
- Both entries state the engine and version. Both use the two-session format.
- A diagram earns its place in `write-skew`: two transactions, the rows each read, the rows each wrote, and the invariant drawn across the pair. `direction="ltr"` on the root if it carries any Latin.

**`data/acid/roadmap.json`** — append:

```json
{
  "id": "unnamed-anomalies",
  "fa": {
    "title": "دوتایی که استاندارد نامشان را نبرد",
    "why": "و همین دوتا هستند که در عمل می‌زنند"
  },
  "en": {
    "title": "The two the standard never named",
    "why": "And these are the two that actually bite"
  },
  "entries": ["lost-update", "write-skew"]
}
```

- [ ] **Step 1: Reproduce both anomalies yourself**

Do not copy the transcripts out of this plan. Re-run them, on your own
probe, and paste what you got. The numbers should match measured facts 4
and 6; if they do not, that is a finding and it goes in the entry.

- [ ] **Step 2: Write the two entries**

- [ ] **Step 3: Run the suite and watch it fail for the right reason**

Run: `node --test`
Expected: FAIL with `این مدخل‌ها در هیچ مرحله‌ای نیستند: lost-update, write-skew`

- [ ] **Step 4: Append stage 6 to the roadmap**

- [ ] **Step 5: Run the suite and confirm it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 6: Proof the write-skew diagram in both languages**

- [ ] **Step 7: Commit**

```bash
git add data/acid
git commit -m "feat(acid): stage 6 — lost update and write skew"
```

---

## Task 7: Stage 7 — چهار سطح، همان‌طور که نوشته‌اند

**This stage deliberately teaches the standard's version, which the next
stage then breaks.** That is not a trick played on the reader; it is the
only order in which the correction is memorable. Do not hedge here and do
not forward-reference stage 8's findings. Teach the ladder as written,
accurately, and let Task 8 do its job.

The one thing this stage must not do is claim the ladder describes any
particular engine. Attribute it: this is what the SQL standard says.

**Files:**
- Create: `data/acid/entries/levels.json` — 5 of its eventual 8
- Modify: `data/acid/categories.json` — append `levels`
- Modify: `data/acid/roadmap.json` — append stage 7

**Interfaces:**
- Consumes: «مدخل جداسازی» and all five anomaly titles from Tasks 5–6.
- Produces: «سطح جداسازی», «خواندن متعهدنشده», «خواندن متعهدشده», «خواندن تکرارپذیر», «ترتیب‌پذیر». Task 8 cites all five.

**Entries:**

| id | fa.title | en.title | angle | example | tags |
|---|---|---|---|---|---|
| `isolation-level` | سطح جداسازی | Isolation Level | the standard defines the levels by which anomalies they forbid, not by mechanism | none | `isolation`, `decision` |
| `read-uncommitted` | خواندن متعهدنشده | Read Uncommitted | the level PostgreSQL accepts, reports, and does not implement | psql | `isolation` |
| `read-committed` | خواندن متعهدشده | Read Committed | the default nearly everyone is on | psql | `isolation` |
| `repeatable-read` | خواندن تکرارپذیر | Repeatable Read | a stable snapshot for the whole transaction | psql | `isolation` |
| `serializable` | ترتیب‌پذیر | Serializable | the only level defined by an outcome rather than by a list of forbidden anomalies | psql | `isolation`, `failure` |

**Content requirements:**

- `isolation-level` carries the structural insight: the standard's four levels are defined **negatively**, by which of three anomalies each forbids. That is why the ladder looks tidy and why it does not survive contact with an engine — a definition by forbidden-anomaly-list says nothing about anomalies the list omits, which is exactly where `lost-update` and `write-skew` live. Cite «مدخل جداسازی», «مدخل به‌روزرسانی گم‌شده», «مدخل کژتابی نوشتن». A table is appropriate here: four levels × three standard anomalies. Entry prose may use `<table>`; only horizontal rules are drawn and it scrolls inside itself.
- `read-uncommitted` is where measured facts 1 and 2 land, and it is a small gem: PostgreSQL accepts the level, `SHOW transaction_isolation` reports back `read uncommitted`, and no dirty read ever occurs. Show all three. Note explicitly that the common claim "PostgreSQL reports it as read committed" is not what 18.6 does — and give the version, because this is exactly the kind of statement that rots. Cite «مدخل سطح جداسازی» and «مدخل خواندن کثیف».
- `read-committed` must state that it is PostgreSQL's default and that each *statement* gets a fresh snapshot, which is why `non-repeatable-read` is reproducible here. Cite «مدخل سطح جداسازی» and «مدخل خواندن غیرتکرارپذیر».
- `repeatable-read` gets one snapshot for the whole transaction. Reproduce measured fact 3 — the phantom that the standard permits at this level and PostgreSQL does not produce — and be careful to present it as an observation about this engine, not as a correction of the standard yet. Cite «مدخل سطح جداسازی» and «مدخل خواندن شبح».
- `serializable` is defined differently from the other three: the result must equal *some* serial order. Then the fact the input lesson missed entirely — it does not make transactions wait, it makes them **die**. Reproduce measured fact 5 with the exact three-line error. Cite «مدخل سطح جداسازی».

**`data/acid/categories.json`** — append:

```json
{ "id": "levels", "file": "levels.json", "fa": "سطوح و هم‌روندی", "en": "Levels & Concurrency" }
```

**`data/acid/roadmap.json`** — append:

```json
{
  "id": "levels-as-written",
  "fa": {
    "title": "چهار سطح، همان‌طور که نوشته‌اند",
    "why": "استاندارد یک نردبان تمیز می‌دهد. اول باید همان را دانست"
  },
  "en": {
    "title": "Four levels, as written down",
    "why": "The standard gives a tidy ladder. Learn that first"
  },
  "entries": ["isolation-level", "read-uncommitted", "read-committed", "repeatable-read", "serializable"]
}
```

- [ ] **Step 1: Re-measure facts 1, 2, 3 and 5 on your own probe**

Four entries in this task rest on them. Capture the version string once
and use it in every entry that claims engine behaviour.

- [ ] **Step 2: Write the five entries**

- [ ] **Step 3: Add the `levels` category**

- [ ] **Step 4: Run the suite and watch it fail for the right reason**

Run: `node --test`
Expected: FAIL listing the five ids as missing from the roadmap.

- [ ] **Step 5: Append stage 7 to the roadmap**

- [ ] **Step 6: Run the suite and confirm it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 7: Check the four-by-three table renders**

Serve the site and open `isolation-level` in both languages. The table
must scroll inside itself; the page body must never scroll horizontally.

- [ ] **Step 8: Commit**

```bash
git add data/acid
git commit -m "feat(acid): stage 7 — the four levels as the standard defines them"
```

---

## Task 8: Stage 8 — چهار سطح، همان‌طور که هستند

**The spec names this the highest-risk stage and says that if extra time
goes anywhere, it goes here.** It has to break the ladder the reader just
learned without leaving them with nothing to hold. Budget accordingly.

**Files:**
- Modify: `data/acid/entries/levels.json` — append `mvcc`, `isolation-in-practice`, `select-for-update`
- Modify: `data/acid/roadmap.json` — append stage 8

**Interfaces:**
- Consumes: all five titles from Task 7, plus «مدخل به‌روزرسانی گم‌شده» and «مدخل کژتابی نوشتن».
- Produces: «کنترل هم‌روندی چندنسخه‌ای», «سطوح جداسازی در عمل», «قفل صریح سطر». Task 9 cites «مدخل قفل صریح سطر».

**Entries:**

| id | fa.title | en.title | angle | example | tags |
|---|---|---|---|---|---|
| `mvcc` | کنترل هم‌روندی چندنسخه‌ای | Multi-Version Concurrency Control | why a reader never waits for a writer | psql | `isolation`, `locking`, `structure` |
| `isolation-in-practice` | سطوح جداسازی در عمل | Isolation Levels in Practice | the same level name, two engines, opposite outcomes | psql + mysql | `isolation`, `decision`, `boundary` |
| `select-for-update` | قفل صریح سطر | Explicit Row Lock | asking for the lock the level did not give you | psql | `locking`, `isolation` |

**Content requirements:**

- `mvcc` explains the mechanism behind everything stage 7 observed: the engine keeps several versions of a row, each transaction reads the version its snapshot points at, and so readers do not block writers and writers do not block readers. Demonstrate it — a long-running read that is not blocked by a concurrent write. Then the honest cost, which is the sentence most explanations omit: those old versions have to be cleaned up, and in PostgreSQL that is `VACUUM`. One sentence, not a section; `VACUUM` is not this topic. Cite «مدخل خواندن تکرارپذیر». `<code>` for `VACUUM` and any Latin identifier.
- `isolation-in-practice` is the spine of the topic. The measured contrast is the whole entry: **the same two-session lost-update experiment, at a level both engines call `REPEATABLE READ`, produces a raised error and balance 90 on PostgreSQL 18.6, and two silent commits and balance 80 on MySQL InnoDB 8.4.11.** Run both yourself. Print both transcripts. Then draw the conclusion carefully — the standard defines levels by forbidden anomalies, engines implement whatever their concurrency control makes natural, and the level name is therefore not a portable contract. The reader must leave with a rule they can act on: *ask what your engine does, at your level, for your anomaly* — not with a feeling that nothing can be known. Cite «مدخل سطح جداسازی», «مدخل خواندن تکرارپذیر», «مدخل به‌روزرسانی گم‌شده», «مدخل کژتابی نوشتن».
- `select-for-update` closes the loop opened in Task 6. `SELECT … FOR UPDATE` takes the row lock explicitly, so the second session waits instead of losing its write. Show it fixing the exact experiment from `lost-update`. Then name the price in one sentence — a waiting session is a held lock, and held locks are what Task 9's two entries are about. Cite «مدخل به‌روزرسانی گم‌شده».

**`data/acid/roadmap.json`** — append:

```json
{
  "id": "levels-as-they-are",
  "fa": {
    "title": "چهار سطح، همان‌طور که هستند",
    "why": "همان آزمایش، همان نام سطح، دو موتور — و دو نتیجهٔ متضاد"
  },
  "en": {
    "title": "Four levels, as they actually are",
    "why": "The same experiment, the same level name, two engines — and opposite outcomes"
  },
  "entries": ["mvcc", "isolation-in-practice", "select-for-update"]
}
```

- [ ] **Step 1: Stand up both engines**

```bash
docker run -d --name acidprobe -e POSTGRES_PASSWORD=x postgres:18-alpine
until docker exec acidprobe pg_isready -q; do sleep 1; done

docker run -d --name myprobe -e MYSQL_ROOT_PASSWORD=x -e MYSQL_DATABASE=d mysql:8.4
for i in $(seq 1 45); do docker exec myprobe mysql -uroot -px -N -e "select version();" 2>/dev/null && break; sleep 2; done
```

MySQL needs about a minute and its first `mysqladmin ping` succeeds
against a temporary server that then restarts — poll on a real query.

- [ ] **Step 2: Run the identical lost-update experiment on both engines**

Same table, same values, same interleaving, `REPEATABLE READ` on both.
Capture both transcripts and both final balances. Record both version
strings. If your result differs from the plan's, believe your measurement
and say so in the entry.

- [ ] **Step 3: Demonstrate MVCC not blocking, and `SELECT … FOR UPDATE` blocking**

- [ ] **Step 4: Write the three entries**

- [ ] **Step 5: Run the suite and watch it fail for the right reason**

Run: `node --test`
Expected: FAIL with `این مدخل‌ها در هیچ مرحله‌ای نیستند: mvcc, isolation-in-practice, select-for-update`

- [ ] **Step 6: Append stage 8 to the roadmap**

- [ ] **Step 7: Run the suite and confirm it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 8: Re-read `isolation-in-practice` against the risk the spec names**

The failure mode is an entry that is accurate and leaves the reader with
nothing usable. Check that it ends on the actionable rule, not on the
disillusionment.

- [ ] **Step 9: Commit**

```bash
git add data/acid
git commit -m "feat(acid): stage 8 — the same level name, two engines, opposite outcomes"
```

---
## Task 9: Stage 9 — آنچه در تولید می‌زند

Two entries the input lesson omitted entirely, and between them they
cover most of what actually pages someone at night.

**Files:**
- Create: `data/acid/entries/limits.json` — 2 of its eventual 4
- Modify: `data/acid/categories.json` — append `limits`
- Modify: `data/acid/roadmap.json` — append stage 9

**Interfaces:**
- Consumes: «مدخل قفل صریح سطر», «مدخل ترتیب‌پذیر», «مدخل مرز تراکنش».
- Produces: «بن‌بست», «تراکنش طولانی». Task 11 cites «مدخل تراکنش طولانی».

**Entries:**

| id | fa.title | en.title | angle | example | tags |
|---|---|---|---|---|---|
| `deadlock` | بن‌بست | Deadlock | the engine kills one of them, and your application must send it again | psql | `locking`, `failure`, `operations` |
| `long-transaction` | تراکنش طولانی | Long Transaction | the most expensive habit in production | psql | `operations`, `failure`, `antipattern` |

**Content requirements:**

- `deadlock` fixes «بن‌بست» as this site's technical term for it; until now the word has appeared six times in the ordinary sense of being stuck, so gloss it `<span dir="ltr">(Deadlock)</span>` on first use. Reproduce a real one: two sessions updating the same two rows in opposite order. PostgreSQL detects it and cancels one — capture the exact `ERROR:  deadlock detected` output including the `DETAIL` line, which names both process ids and both waited-for locks. Then the operational point, which is the reason this entry exists: a deadlock is not a bug to be eliminated, it is an outcome to be retried. Put `retry` in `related`. Cite «مدخل قفل صریح سطر».
- `long-transaction` must be concrete about the mechanism of harm, not just say "keep transactions short". A transaction that stays open holds its snapshot, and while it does, the old row versions its snapshot might need cannot be cleaned up; it also holds every lock it has taken. Demonstrate: open a transaction, leave it idle, and show it in `pg_stat_activity` with `state = 'idle in transaction'`. Name the classic cause — a network call made while a transaction is open, which turns a remote timeout into a database problem. Cite «مدخل مرز تراکنش» and «مدخل کنترل هم‌روندی چندنسخه‌ای».

**`data/acid/categories.json`** — append:

```json
{ "id": "limits", "file": "limits.json", "fa": "مرزها", "en": "Limits" }
```

**`data/acid/roadmap.json`** — append:

```json
{
  "id": "what-bites-in-production",
  "fa": {
    "title": "آنچه در تولید می‌زند",
    "why": "دو چیزی که هیچ جزوه‌ای نمی‌گوید و هر کسی که سیستمی را نگه داشته دیده"
  },
  "en": {
    "title": "What bites in production",
    "why": "Two things no tutorial mentions and everyone who has run a system has seen"
  },
  "entries": ["deadlock", "long-transaction"]
}
```

- [ ] **Step 1: Produce a real deadlock and capture the full error**

Two sessions, two rows, opposite update order. The `DETAIL` line is part
of the output — do not trim it, it is what makes the entry useful to
someone who just found this in their log.

- [ ] **Step 2: Produce an idle-in-transaction session and read `pg_stat_activity`**

```sql
select pid, state, xact_start, query from pg_stat_activity where state like 'idle in transaction%';
```

- [ ] **Step 3: Write the two entries**

- [ ] **Step 4: Add the `limits` category**

- [ ] **Step 5: Run the suite and watch it fail for the right reason**

Run: `node --test`
Expected: FAIL with `این مدخل‌ها در هیچ مرحله‌ای نیستند: deadlock, long-transaction`

- [ ] **Step 6: Append stage 9 to the roadmap**

- [ ] **Step 7: Run the suite and confirm it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add data/acid
git commit -m "feat(acid): stage 9 — deadlock and the long transaction"
```

---

## Task 10: Stage 10 — بعد از برگشتن برق

Durability comes last on purpose. `fsync` is only a name until the reader
has a reason to care what it costs.

**Files:**
- Modify: `data/acid/entries/durable.json` — append `durability`, `fsync`, `checkpoint`, `crash-recovery`
- Modify: `data/acid/roadmap.json` — append stage 10

**Interfaces:**
- Consumes: «مدخل لاگ پیش‌نوشت» (Task 3), «مدخل اتمی بودن», «مدخل تعهد خودکار».
- Produces: «پایداری», «همگام‌سازی با دیسک», «نقطهٔ وارسی», «بازیابی پس از خرابی». Task 11 cites «مدخل پایداری».

**Entries:**

| id | fa.title | en.title | angle | example | tags |
|---|---|---|---|---|---|
| `durability` | پایداری | Durability | committed means it survives — and "survives what?" is the real question | psql | `durability`, `storage` |
| `fsync` | همگام‌سازی با دیسک | Syncing to Disk | durability is a dial, and most systems are not on maximum | psql | `durability`, `storage`, `decision` |
| `checkpoint` | نقطهٔ وارسی | Checkpoint | why the log does not grow forever | psql | `durability`, `recovery` |
| `crash-recovery` | بازیابی پس از خرابی | Crash Recovery | redo and undo, after the power comes back | psql | `recovery`, `failure` |

**Content requirements:**

- `durability` fixes «پایداری» as this site's word for it. Two existing uses on the site are «پایداری قرارداد», a different collocation meaning stability — no conflict, but gloss `<span dir="ltr">(Durability)</span>` on first use. The entry opens on the letter's promise and immediately sharpens it: survives *what*? A process crash, an OS crash, and a disk failure are three different questions with three different answers, and only the first two are what D is about. Durability is not backup and not replication — `related` includes `replication` and `database-ha`. Cite «مدخل لاگ پیش‌نوشت».
- `fsync` is the entry that corrects the input lesson's biggest durability error: it presented durability as a switch. Show `synchronous_commit` and what turning it off buys and costs — measure the throughput difference yourself rather than quoting a number. Name the layers a write passes through and where each can lie about being done. Mention InnoDB's `innodb_flush_log_at_trx_commit` as the same dial under another name. Cite «مدخل پایداری» and «مدخل لاگ پیش‌نوشت».
- `checkpoint` answers the question `wal` leaves open. Show that checkpoints happen — `log_checkpoints` or `pg_stat_checkpointer` — and state the trade-off in one line: frequent checkpoints mean more steady I/O and a shorter recovery; rare ones the reverse. Cite «مدخل لاگ پیش‌نوشت».
- `crash-recovery` is where the topic's structure pays off: recovery replays the log forward for committed transactions it finds not yet in the data files, and rolls back the ones that never committed — **the same log, doing atomicity's job and durability's job in one pass.** If you can demonstrate it (`docker kill` the container mid-write, restart, and read the recovery lines out of the log), do; if you cannot get a clean demonstration, say what you did and cut what you could not show. Cite «مدخل لاگ پیش‌نوشت», «مدخل اتمی بودن», «مدخل نقطهٔ وارسی».

**`data/acid/roadmap.json`** — append:

```json
{
  "id": "after-the-power-returns",
  "fa": {
    "title": "بعد از برگشتن برق",
    "why": "همان لاگ مرحلهٔ سه، این بار برای ضمانت دوم"
  },
  "en": {
    "title": "After the power comes back",
    "why": "The same log from stage three, this time for the second guarantee"
  },
  "entries": ["durability", "fsync", "checkpoint", "crash-recovery"]
}
```

- [ ] **Step 1: Measure the `synchronous_commit` difference**

Do not quote a benchmark you did not run. A simple loop of small
transactions with the setting on and off, timed, is enough — and report
it as what it is: one measurement on one machine, not a benchmark.

- [ ] **Step 2: Try to demonstrate crash recovery**

```bash
docker kill acidprobe && docker start acidprobe
docker logs acidprobe 2>&1 | tail -20
```

Look for the redo lines. If the container restarts too cleanly to show
anything, say so in the entry rather than inventing output.

- [ ] **Step 3: Write the four entries**

- [ ] **Step 4: Run the suite and watch it fail for the right reason**

Run: `node --test`
Expected: FAIL listing the four ids as missing from the roadmap.

- [ ] **Step 5: Append stage 10 to the roadmap**

- [ ] **Step 6: Run the suite and confirm it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add data/acid
git commit -m "feat(acid): stage 10 — the same log, the second guarantee"
```

---

## Task 11: Stage 11 — مرزها, and the reverse bridges

The last stage, plus the four remaining reverse bridges. Those are held
to the end because they point at ids that do not exist until now.

**Files:**
- Modify: `data/acid/entries/limits.json` — append `acid-outside-the-database`, `base`
- Modify: `data/acid/roadmap.json` — append stage 11
- Modify: `data/architecture/entries/distributed.json` — `related` of `distributed-transaction`, `two-phase-commit`, `idempotency`
- Modify: `data/architecture/entries/communication.json` — `related` of `outbox-pattern` (confirm the file first: `grep -l outbox-pattern data/architecture/entries/*.json`)

**Interfaces:**
- Consumes: «مدخل اثر غیرتراکنشی», «مدخل پایداری», «مدخل تراکنش طولانی», «مدخل ACID».
- Produces: nothing. This is the last task.

**Entries:**

| id | fa.title | en.title | angle | example | tags |
|---|---|---|---|---|---|
| `acid-outside-the-database` | بیرون از یک پایگاه داده | Outside One Database | where every one of the four guarantees stops | Go | `boundary`, `consistency`, `failure` |
| `base` | BASE | BASE | the counterpart, and why "NoSQL means no ACID" is out of date | none | `boundary`, `consistency`, `decision` |

**Content requirements:**

- `acid-outside-the-database` is the topic's exit. It takes the four letters one at a time and says exactly where each stops at the process boundary — and then hands off. **It must not re-explain two-phase commit or sagas.** Those are written, well, in the architecture topic; this entry's job is to make the reader want them and know where they are. `related` includes `distributed-transaction`, `two-phase-commit`, `saga`. Cite «مدخل ACID» and «مدخل اثر غیرتراکنشی». The Go example is the two-writes-two-stores shape with the window between them — but check `distributed-transaction`'s existing example first and deliberately do something different, because shipping a near-copy of an entry we already have would be worse than shipping no example.
- `base` gives the counterpart honestly: Basically Available, Soft state, Eventually consistent — coined as a deliberate chemical pun on ACID, and always more of a stance than a specification. Then the correction the input lesson needed: "NoSQL means no ACID" has been out of date for years. MongoDB has had multi-document transactions since 4.0 and DynamoDB has transactional writes. **Verify the current state of both before writing it** — this is the single claim in the topic most likely to have moved since the assistant's knowledge cutoff, and the entry should give versions, not impressions. `related` includes `eventual-consistency`. Cite «مدخل ACID» and «مدخل پایداری».

**`data/acid/roadmap.json`** — append:

```json
{
  "id": "where-acid-ends",
  "fa": {
    "title": "مرزها",
    "why": "چهار ضمانت هیچ‌کدام از مرز فرایند رد نمی‌شوند — و از آن‌جا موضوع دیگری شروع می‌شود"
  },
  "en": {
    "title": "Where ACID ends",
    "why": "None of the four guarantees crosses the process boundary — and another topic starts there"
  },
  "entries": ["acid-outside-the-database", "base"]
}
```

**Reverse bridges** — append to the `related` array of each, changing nothing else:

| entry | file | add |
|---|---|---|
| `distributed-transaction` | `data/architecture/entries/distributed.json` | `db-transaction`, `acid` |
| `two-phase-commit` | `data/architecture/entries/distributed.json` | `db-transaction` |
| `idempotency` | `data/architecture/entries/distributed.json` | `non-transactional-effect` |
| `outbox-pattern` | (locate with grep) | `non-transactional-effect` |

- [ ] **Step 1: Verify the MongoDB and DynamoDB claims**

Check current documentation rather than relying on recall. Write versions
and dates, or write less.

- [ ] **Step 2: Read `distributed-transaction`'s existing example**

So that `acid-outside-the-database` does not duplicate it.

- [ ] **Step 3: Write the two entries**

- [ ] **Step 4: Run the suite and watch it fail for the right reason**

Run: `node --test`
Expected: FAIL with `این مدخل‌ها در هیچ مرحله‌ای نیستند: acid-outside-the-database, base`

- [ ] **Step 5: Append stage 11 to the roadmap**

- [ ] **Step 6: Add the four reverse bridges**

- [ ] **Step 7: Add the forward links that earlier tasks could not**

`related` is one-directional and these targets did not exist when their
source entries were written. Append to each source's `related`:

| source (task) | add |
|---|---|
| `acid` (Task 1) | `atomicity`, `acid-consistency`, `isolation`, `durability` |
| `db-transaction` (Task 1) | `atomicity`, `isolation` |
| `atomicity` (Task 2) | `undo-log`, `wal` |
| `isolation` (Task 5) | `isolation-level`, `mvcc` |
| `lost-update` (Task 6) | `select-for-update` |

The `acid` row is the important one: it is the topic's map entry, and
without links to the four letters it is a map with no roads.

- [ ] **Step 8: Run the suite and confirm it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 9: Verify the whole topic against the acceptance criteria**

```bash
node --test
git diff c782477..HEAD -- assets test        # must print nothing
node -e 'const fs=require("fs");let n=0;for(const f of fs.readdirSync("data/acid/entries"))n+=JSON.parse(fs.readFileSync("data/acid/entries/"+f)).length;console.log("acid entries:",n)'   # must print 36
```

Then serve the site and open `#/self-test`. It must report zero
validation errors, zero render failures, zero entries missing an English
translation, and zero entries missing from their topic's roadmap.

- [ ] **Step 10: Hand-check the eight cross-topic bridges**

The citation guard builds its title table per topic, so none of these are
covered by any test. For each of the eight `related` pairs in the spec's
bridge table, confirm the target id exists and the link renders in both
directions.

```bash
node -e '
const fs=require("fs");const ids=new Set();
for(const t of fs.readdirSync("data").filter(d=>fs.statSync("data/"+d).isDirectory()))
  for(const f of fs.readdirSync(`data/${t}/entries`))
    for(const e of JSON.parse(fs.readFileSync(`data/${t}/entries/${f}`,"utf8"))) ids.add(e.id);
for(const t of fs.readdirSync("data").filter(d=>fs.statSync("data/"+d).isDirectory()))
  for(const f of fs.readdirSync(`data/${t}/entries`))
    for(const e of JSON.parse(fs.readFileSync(`data/${t}/entries/${f}`,"utf8")))
      for(const r of e.related||[]) if(!ids.has(r)) console.log("DANGLING",e.id,"->",r);
console.log("total ids:",ids.size);'
```

Expected: no `DANGLING` lines, and `total ids: 281`.

- [ ] **Step 11: Commit**

```bash
git add data/acid data/architecture/entries
git commit -m "feat(acid): stage 11 — where ACID ends, and the bridges back"
```

---

## After the last task

Run the `superpowers:finishing-a-development-branch` skill. The base
branch is `main`; this work forked from `1a596b5`.

Before that, two things are worth doing while the context is still warm:

1. **Append to `docs/entry-conventions.md`.** That file exists because the
   Swarm topic's 32 hard-won rules were nearly lost. Anything this topic
   learned that the next one would otherwise re-derive — a Persian
   rendering now fixed, a `psql` formatting trap, a two-session
   measurement technique — belongs there, with the reason it cost
   something.
2. **Check that no claim in the topic went unmeasured.** Grep the finished
   entries for engine claims and confirm each names its version. The
   acceptance criterion is that an unmeasured claim is either measured or
   removed — not softened.
