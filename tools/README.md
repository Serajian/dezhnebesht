# tools/

Content-proofing scripts. They are **not** part of the site and nothing under
`assets/` or `index.html` loads them; `node --test` does not run them either.
They exist because every one of them encodes a defect class that a review round
paid for, and because the previous topic's proofing tool was written in a
session scratchpad and lost when the scratchpad was deleted.

Nothing here is installed. Python 3 only, standard library only.

## `tools/acid/` — the ACID topic's checkers

Run from anywhere; each script derives the repo root from its own location, so
these are all equivalent:

```
python3 tools/acid/check11.py
python3 tools/acid/converge11.py
python3 tools/acid/runsweep11.py
```

Every one of them takes `--selftest`, and `--selftest` is the point. A canary
that cannot be applied is a **failure**, not a pass, so a clean `FINDINGS: 0`
means the checks ran rather than that the matcher quietly matched nothing. Run
the selftest before you believe a clean result — and read its exit code, not
just its output.

Two design rules, both bought by a defect in this repository:

- **A canary must not be keyed to a quotation of shipped prose.** `runsweep11`'s
  canaries used to inject their defect by `.replace()`-ing a long quotation of
  the live entry text. The ACID topic's own final fix wave then reworded one of
  those quotations, the needle went absent, and the self-test started failing in
  the same commit that documented the rule against exactly this. They now inject
  by **appending** a paragraph, which cannot silently match nothing.
- **A failing canary is recorded, not raised.** `check5`, `check11` and
  `runsweep11` run every canary and report all failures before exiting non-zero.
  Aborting on the first one hid the two canaries after it — including the
  negative canary, the one that proves the matcher does not flag everything.
  `converge11` still aborts on its first failure: its ~22 canary sites are
  nested inside loops and context managers, and converting them was judged a
  worse risk than documenting the gap. Fix it the next time that file is opened.

| script | what it checks | teeth |
|---|---|---|
| `check5.py` | psql/MySQL table geometry re-derived from each block's own cells; a raw `<` inside a captured block; every numeral in prose cross-checked against that entry's own blocks, with an allowlist that names the source of each exception | 7 canaries. Imported by `check11.py` for `blocks_of`, `unesc`, `prose_of` and the `ALLOWED` table. Standalone against `anomalies.json` it reports **16 findings and still exits 0** — all of them `lost-update` and `write-skew`, the stage-6 entries appended to that file after this script was written, whose allowlist rows were never brought over. A known unowned gap, not a clean run. |
| `check11.py` | block fidelity against `blocks11/`, fa and en using the same blocks in the same order, HTML in `title`/`short`, bare Latin in Persian prose, block-count claims, and a **positional** table asserting what each block actually contains | 9 canaries fire, 1 stays silent |
| `converge11.py` | anti-convergence: every standalone bold subhead and every sentence of the new entries against the whole corpus, exactly and by token overlap, plus new-vs-new pairings | 24 canaries: 21 fire, 3 negative. The only one of the four that still aborts on its first failure. |
| `runsweep11.py` | the **old-vs-new** direction `converge11.py` cannot see: ungated longest-shared-run over all corpus sentences, plus a four-token subhead-opening check, with attribution tested against *the entry the run actually collides with* | 4 canaries: 3 reproduce the real findings at 13, 10 and 4 tokens, 1 negative |

### Retargeting them for the next topic

Three things are stage-specific and have to be re-pointed rather than copied
forward:

- `NEW` in `converge11.py` and `runsweep11.py` — the set of entry ids being
  written. The other `NEW8`/`NEW9`/`NEW10` sets stay: every regression canary
  runs inside a context that puts its own stage back into `NEW`, so the
  canaries keep testing the world they were calibrated in.
- `PATH` and `BLOCKS11` in `check11.py`, and its POSITIONAL table. The
  positional rows assert things about *specific blocks*; copying them forward
  unchanged makes them true of nothing.
- `check5.ALLOWED` — the numbers a new entry's prose may carry that appear in
  no block. Each row states where the number was checked, which is why the
  allowlist doubles as the provenance table for `base`, the one entry in the
  ACID topic with no blocks at all. See `docs/acid-base-sources.md`.

`blocks11/` is the capture set `check11.py` compares against, block by block:
delete it and every block is reported as unknown.

**`blocks5/` is retained evidence and an input to nothing.** `check5.py`
assigns a `BLOCKS` path to it and never reads it, and `check11.py` uses only
`blocks11/`. It is stage 5's capture set, and it is mixed: 24 of its 30 files
are still verbatim `<pre>` blocks in `anomalies.json`, 5 (`nrr_*`) are the
pre-re-capture fragments that stage 5's fix round absorbed into one continuous
session, and `iso_b2` was superseded outright. It is kept because it is the only
surviving provenance for those transcripts, and it is deliberately **not** wired
up: a set with six superseded files can only be made to pass by tuning the check
to it, which is how a checker stops meaning anything.
