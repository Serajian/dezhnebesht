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

Every one of them takes `--selftest`, and `--selftest` is the point. Each
canary **throws when its needle is absent** rather than falling through to a
pass, so a clean `FINDINGS: 0` means the checks ran, not that the matcher
quietly matched nothing. Run the selftest before you believe a clean result.

| script | what it checks | teeth |
|---|---|---|
| `check5.py` | psql/MySQL table geometry re-derived from each block's own cells; a raw `<` inside a captured block; every numeral in prose cross-checked against that entry's own blocks, with an allowlist that names the source of each exception | imported by `check11.py` for `blocks_of`, `unesc`, `prose_of` and the `ALLOWED` table; runs standalone against `anomalies.json` |
| `check11.py` | block fidelity against `blocks11/`, fa and en using the same blocks in the same order, HTML in `title`/`short`, bare Latin in Persian prose, block-count claims, and a **positional** table asserting what each block actually contains | 6 canaries fire, 1 stays silent |
| `converge11.py` | anti-convergence: every standalone bold subhead and every sentence of the new entries against the whole corpus, exactly and by token overlap, plus new-vs-new pairings | 7 canaries, including a negative one |
| `runsweep11.py` | the **old-vs-new** direction `converge11.py` cannot see: ungated longest-shared-run over all corpus sentences, plus a four-token subhead-opening check, with attribution tested against *the entry the run actually collides with* | 3 canaries reproduce the three real findings at 13, 10 and 4 tokens |

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

`blocks5/` and `blocks11/` are the captures the fidelity checks compare
against. They are the evidence, not scratch: delete them and `check11.py`
reports every block as unknown.
