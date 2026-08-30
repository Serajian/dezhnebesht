#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Anti-convergence for stage 11. Copied from converge10.py.

NEW is retargeted at the four stage-10 entries; every stage-8 and stage-9
regression canary is kept and now runs inside an explicit context that puts
its own stage back in NEW, so the canaries still test the world they were
calibrated in.

Two additions for stage 10:

  * new-vs-new is SIX pairings here, not one. A stage-10 self-canary plants a
    lead-in shared between two of the four new entries and requires the pass to
    flag it, so "0 findings" over six pairings means something.
  * the enumerated step-header count now also sees the SUBHEAD form of the
    device («خرابی اول:», «Failure one:»), which the stage-9 regex could not.
    Stage 10 uses it in exactly one of its four entries, deliberately, and the
    count is printed rather than tuned away.

1. every standalone bold subhead of the new entries against every
   <strong>/<b> run in data/ (exact, and by token-overlap for near-twins)
2. every opening sentence against the 20 pre-existing acid openings
3. counts the enumerated step-header device across the acid topic

--selftest proves each comparison fires on a planted duplicate.
"""
import json, os, re, sys, glob

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
NEW8 = {"mvcc", "isolation-in-practice", "select-for-update"}
NEW9 = {"deadlock", "long-transaction"}
NEW10 = {"durability", "fsync", "checkpoint", "crash-recovery"}
NEW11 = {"acid-outside-the-database", "base"}
NEW = NEW11
STEP = re.compile(r"(گام\s*[۰-۹0-9]|بخش (اول|دوم|سوم)|اجرای (اول|دوم)|یکم —|دوم —|سوم —)")

# The SUBHEAD form of the same device, which STEP cannot see: a standalone bold
# subhead that numbers itself. Stage 9's strict count of STEP was 5 of 30; this
# adds the shape stage 10 uses in `durability` («خرابی اول:» / «Failure one:»),
# so the count printed below is over both forms.
STEP_SUB = re.compile(
    r"^\s*[^\s:—]{2,14}\s*(اول|دوم|سوم|چهارم|پنجم|ششم|[۰-۹0-9]+)\s*[:—]"
    r"|^\s*(Failure|Step|Part|Stage|Run)\s+(one|two|three|four|five|six|\d+)\s*[:—]")


def all_bold():
    """every bold run in data/, tagged by file+entry, excluding the new entries."""
    out = []
    for path in sorted(glob.glob(os.path.join(REPO, "data/*/entries/*.json"))):
        for e in json.load(open(path, encoding="utf8")):
            for lang in ("fa", "en"):
                blk = e.get(lang) or {}
                for field in ("body", "example"):
                    for m in re.finditer(r"<(strong|b)>(.*?)</\1>", blk.get(field, ""), re.S):
                        out.append((e["id"], lang, strip(m.group(2))))
    return out


def strip(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s)).strip()


def subheads(entry):
    """A <p> that is entirely one <strong> — the standalone subhead device.

    Paragraphs are split FIRST. A lazy <p><strong>(.*?)</strong></p> with re.S
    happily runs past a </p> whenever a paragraph opens with <strong> without
    closing on it (every definition paragraph on this site does), swallowing
    the next real subhead into one giant string that then matches nothing.
    """
    out = []
    for lang in ("fa", "en"):
        for field in ("body", "example"):
            for para in re.findall(r"<p>(.*?)</p>", entry[lang].get(field, ""), re.S):
                m = re.fullmatch(r"\s*<strong>(.*)</strong>\s*", para, re.S)
                if m:
                    out.append((lang, strip(m.group(1))))
    return out


_TOKS = {}


def toklist(s):
    """tokens in order — toks() returns a set, which cannot see a shared run."""
    return re.findall(r"[^\W\d_]+", s, re.UNICODE)



def toks(s):
    """Memoised: the sentence pass compares ~130 band sentences against a
    39k-sentence corpus, so the same corpus strings are tokenised millions of
    times. Without this the self-test does not finish in a usable time."""
    t = _TOKS.get(s)
    if t is None:
        t = _TOKS[s] = set(re.findall(r"[^\s،.:؛«»—\-()]+", s))
    return t


def opening(entry, lang="fa"):
    m = re.search(r"<p>(.*?)</p>", entry[lang]["body"], re.S)
    return strip(m.group(1))


def run(new_entries, verbose=True):
    findings = []
    corpus = [b for b in all_bold() if b[0] not in NEW]
    corpus_norm = {}
    for eid, lang, text in corpus:
        corpus_norm.setdefault(text, []).append(eid)

    mine = []
    for e in new_entries:
        for lang, text in subheads(e):
            mine.append((e["id"], lang, text))

    for eid, lang, text in mine:
        if text in corpus_norm:
            findings.append(f"EXACT REPEAT  {eid}/{lang}: {text!r} already in {corpus_norm[text]}")
        t = toks(text)
        if len(t) < 3:
            continue
        for other, ids in corpus_norm.items():
            o = toks(other)
            if len(o) < 3:
                continue
            j = len(t & o) / len(t | o)
            if j >= 0.6:
                findings.append(
                    f"NEAR TWIN {j:.2f}  {eid}/{lang}: {text!r}\n"
                    f"                    vs {ids[0]}: {other!r}")

    # and the three against each other
    for i in range(len(mine)):
        for j in range(i + 1, len(mine)):
            a, b = mine[i], mine[j]
            if a[1] != b[1]:
                continue
            if a[2] == b[2]:
                findings.append(f"SELF REPEAT   {a[0]} and {b[0]}: {a[2]!r}")
            else:
                ta, tb = toks(a[2]), toks(b[2])
                if len(ta) >= 3 and len(tb) >= 3 and len(ta & tb) / len(ta | tb) >= 0.6:
                    findings.append(
                        f"SELF TWIN     {a[0]}/{a[1]}: {a[2]!r}\n                    vs {b[0]}: {b[2]!r}")

    # openings
    acid = []
    for c in json.load(open(os.path.join(REPO, "data/acid/categories.json"), encoding="utf8")):
        acid += json.load(open(os.path.join(REPO, "data/acid/entries", c["file"]), encoding="utf8"))
    old_open = [(e["id"], opening(e)) for e in acid if e["id"] not in NEW]
    for e in new_entries:
        mo = opening(e)
        for oid, oo in old_open:
            ja = len(toks(mo) & toks(oo)) / len(toks(mo) | toks(oo))
            if ja >= 0.45:
                findings.append(f"OPENING TWIN {ja:.2f} {e['id']}: {mo[:70]!r} vs {oid}: {oo[:70]!r}")

    if verbose:
        print(f"bold runs in the corpus (excluding the new entries): {len(corpus)}")
        print(f"standalone subheads in the new entries: {len(mine)}")
        steps_old = sum(1 for e in acid if e["id"] not in NEW
                        and STEP.search(strip(e["fa"].get("example", "") + e["fa"]["body"])))
        steps_new = sum(1 for e in new_entries
                        if STEP.search(strip(e["fa"].get("example", "") + e["fa"]["body"])))
        print(f"entries using the enumerated step-header device (STEP): {steps_old} of the {len(acid) - len(new_entries)} old, {steps_new} of the {len(new_entries)} new")
        def sub_dev(e):
            return any(STEP_SUB.search(t) for _l, t in subheads(e))
        print(f"entries using the enumerated SUBHEAD form: "
              f"{sum(1 for e in acid if e['id'] not in NEW and sub_dev(e))} of the old, "
              f"{sum(1 for e in new_entries if sub_dev(e))} of the {len(new_entries)} new "
              f"({[e['id'] for e in new_entries if sub_dev(e)]})")
        print(f"FINDINGS: {len(findings)}")
        for f in findings:
            print("  -", f)
    return findings


def load():
    return [e for e in json.load(open(os.path.join(REPO, "data/acid/entries/limits.json"), encoding="utf8"))
            if e["id"] in NEW11]


def load10():
    return [e for e in json.load(open(os.path.join(REPO, "data/acid/entries/durable.json"), encoding="utf8"))
            if e["id"] in NEW10]


def load9():
    return [e for e in json.load(open(os.path.join(REPO, "data/acid/entries/limits.json"), encoding="utf8"))
            if e["id"] in NEW9]


def load8():
    return [e for e in json.load(open(os.path.join(REPO, "data/acid/entries/levels.json"), encoding="utf8"))
            if e["id"] in NEW8]


class _stage:
    """A regression canary plants a needle back into an EARLIER stage's entries,
    so for the length of that check the corpus must exclude that stage -- exactly
    the world the canary was calibrated in."""
    def __init__(self, which):
        self.which = which
    def __enter__(self):
        global NEW
        self.prev = NEW
        NEW = self.which
    def __exit__(self, *a):
        global NEW
        NEW = self.prev


def stage8():
    return _stage(NEW8)


def stage9():
    return _stage(NEW9)


def stage10():
    return _stage(NEW10)


# =====================================================================
# Sentence-level convergence — added in fix round 1.
#
# The subhead check above matches only <p><strong>…</strong></p> and the
# first paragraph of a body. A lead-in sentence sitting mid-example — the
# one immediately after a <pre> — is invisible to it, which is how three
# character-for-character uses of «سه چیز در این بلوک خواندنی است.» stood
# in savepoint, wal and repeatable-read while it reported 0.
#
# The rule the coordinator set: boilerplate that DISCLOSES METHOD stays
# identical on purpose; a sentence that CARRIES CONTENT must not repeat.
# So repeated sentences are flagged, and the three disclosure templates are
# exempted by exact match on their opening.
# =====================================================================

EXEMPT_PREFIXES = [
    # 1. the two-session disclosure
    "و اینکه دو نشست‌اند از خودِ بلوک‌ها خوانده می‌شود",
    "And that they are two sessions is read off the blocks themselves",
    # 2. the explicit-ordering disclosure
    "ترتیب صریح است",
    "The order is explicit",
    # 3. the closing measured/not-claimed ledger
    "آنچه اندازه گرفته شد:",
    "آنچه اینجا گفته نمی‌شود:",
    "Measured:",
    "Not claimed here:",
]

# The setup region of an example — everything before its first <pre> — is the
# methods note: engine, version, starting rows, ordering, and how the reader
# can tell there are two sessions. Templates 1 and 2 live there, and so do the
# engine/version and starting-data lines the plan's Global Constraints REQUIRE
# every such entry to carry. Identical wording there is the ruling's "feature".
# Nothing after a <pre> is exempt by region — that is where finding 1 lived.


def exempt(sent, region=None):
    # A "setup-leadin" — the last paragraph before an example's first <pre> — is
    # NOT exempt. It is the sentence that introduces the block, which is content,
    # not part of the methods note the region exemption was written for. Narrowing
    # it here widens the corpus side by 779 sentences and still reports 0 on stage
    # 9, so the widening is free; the four round-1 canaries all still fire, which
    # is what says stage 8's calibration survived it.
    if region == "setup":
        return True
    return any(sent.startswith(p) for p in EXEMPT_PREFIXES)


def exempt_self(sent, region=None):
    """Exemption for the new-vs-new pass.

    The setup region is exempt because the METHODS NOTE lives there — engine,
    version, starting rows, the ordering disclosure, the two-session proof. The
    last paragraph before the first <pre> is not a methods note, it is the
    sentence that introduces the block, and review round 1 of stage 9 found two
    entries sharing exactly that slot word for word («نشست الف، یکجا …:»). So a
    lead-in is NOT exempt from being compared against the stage's other entries,
    while everything else in the region still is.
    """
    if region == "setup":
        return True
    return any(sent.startswith(p) for p in EXEMPT_PREFIXES)


SENT_SPLIT = re.compile(r"(?<=[.؟!:])\s+")


def prose_paragraphs(entry):
    """(lang, field, paragraph-text, in_block_band, region) for every <p>.

    RECALIBRATED in fix round 1. The old version marked only a paragraph that
    FOLLOWS a <pre>, and then only its first sentence. Review round 1 found four
    near-twins of `serializable` that the old band could not reach:

      - the third sentence of a paragraph after a <pre> (the «!» prompt /
        ROLLBACK sentence, 0.88 en / 0.67 fa)
      - three paragraphs that INTRODUCE a <pre> (0.65-0.76)

    The band is now every paragraph ADJACENT to a <pre> on either side, and
    every sentence in it, not just the first. That is the whole authored frame
    around a transcript, which is where a re-skin of a neighbouring entry shows
    up.
    """
    out = []
    for lang in ("fa", "en"):
        for field in ("body", "example"):
            html = entry[lang].get(field, "")
            first_pre = html.find("<pre>")
            for m in re.finditer(r"<p>(.*?)</p>", html, re.S):
                before = html[:m.start()]
                after = html[m.end():].lstrip()
                band = (before.rstrip().endswith("</code></pre>")
                        or after.startswith("<pre>"))
                region = ("setup" if field == "example" and first_pre != -1
                          and m.start() < first_pre else None)
                if region == "setup" and after.startswith("<pre>"):
                    region = "setup-leadin"   # the sentence that introduces block 1
                out.append((lang, field, strip(m.group(1)), band, region))
    return out


def sentences(entry):
    """(lang, sentence, in_block_band, region) — in_block_band marks EVERY
    sentence of a paragraph touching a <pre> on either side."""
    out = []
    for lang, field, para, band, region in prose_paragraphs(entry):
        parts = [p.strip() for p in SENT_SPLIT.split(para) if p.strip()]
        for sent in parts:
            out.append((lang, sent, band, region))
    return out


def all_entries():
    for path in sorted(glob.glob(os.path.join(REPO, "data/*/entries/*.json"))):
        for e in json.load(open(path, encoding="utf8")):
            yield e


def run_sentences(new_entries, verbose=True):
    findings = []
    advisories = []
    corpus = {}
    for e in all_entries():
        if e["id"] in NEW:
            continue
        for lang, sent, lead, region in sentences(e):
            if region == "setup":
                continue
            corpus.setdefault((lang, sent), []).append(e["id"])

    mine = [(e["id"], lang, sent, lead, region)
            for e in new_entries for lang, sent, lead, region in sentences(e)]

    for eid, lang, sent, lead, region in mine:
        if exempt(sent, region) or len(toks(sent)) < 4:
            continue
        if (lang, sent) in corpus:
            findings.append(
                f"SENTENCE REPEAT  {eid}/{lang}: {sent[:80]!r} already in {corpus[(lang, sent)]}")
        if lead and len(toks(sent)) >= 5:
            # Any sentence in the band around a transcript fails on a near twin.
            # Threshold lowered 0.60 -> 0.52 in fix round 1: the four pairs review
            # found sat at 0.65-0.88, and 0.60 was close enough to that floor to be
            # luck rather than margin.
            for (clang, other), ids in corpus.items():
                if clang != lang or len(toks(other)) < 5:
                    continue
                ts = toks(sent)
                to = toks(other)
                j = len(ts & to) / len(ts | to)
                if j >= 0.52:
                    findings.append(
                        f"BAND TWIN {j:.2f}  {eid}/{lang}: {sent[:72]!r}\n"
                        f"                    vs {ids[0]}: {other[:72]!r}")

    # ------------------------------------------------------------------
    # The new entries against EACH OTHER.
    #
    # Fix round 1 of stage 9. This pass used to test whole-sentence EQUALITY and
    # nothing else, so it reported clean while three lead-ins were shared word
    # for word between the stage's own two entries — «پرسیده از همان سرور در
    # نشستی جدا:», «نشست الف، یکجا …:» and one variant of the ordering
    # disclosure — each sitting in the identical structural slot beside a <pre>.
    # The whole sentences differed by their opening or closing clause, which is
    # precisely what equality cannot see. Every other comparison in this file is
    # new-vs-corpus. Stage 10 writes FOUR entries at once, where new-vs-new is
    # six pairings instead of one.
    #
    #   SELF SENTENCE      whole-sentence equality (as before)
    #   SELF BAND TWIN     Jaccard >= 0.52, the same floor the corpus band uses,
    #                      when either sentence sits beside a <pre>
    #   SELF LEAD-IN RUN   a contiguous token run shared at the START of both
    #                      sentences (>= 3) or at the END of both (>= 4), which
    #                      is the shape a shared lead-in actually has. Anchoring
    #                      is the whole point: an unanchored run of 3 catches
    #                      «تمام آن مدت» and "at the end of" and drowns the real
    #                      findings in function words. Measured — unanchored
    #                      threshold 3 produced 30 findings on this stage, all
    #                      noise; anchored produces the three real ones.
    #
    # Disclosure templates are not silently dropped. Reusing one across the site
    # is deliberate, so a shared template is reported as an ADVISORY with its own
    # count rather than as a finding — a stage writing several entries at once
    # should see which templates it landed on twice and choose, and "0 findings"
    # has to keep meaning what it means.
    # ------------------------------------------------------------------
    # ------------------------------------------------------------------
    # Widening the anchored run beyond the band surfaced one class of shared
    # head that is NOT convergence: a sentence that opens with a CITATION.
    # «مدخل لاگ پیش‌نوشت …» / "The write-ahead log entry …" must be spelled
    # exactly — test/roadmap-order.test.mjs reads the Persian form as a hard
    # prerequisite, and four entries of one stage all leaning on `wal` is the
    # point of the stage, not a defect. So a shared head run that is entirely a
    # citation of a real entry title is reported as an ADVISORY with its own
    # label, never silently dropped.
    titles = set()
    for c in json.load(open(os.path.join(REPO, "data/acid/categories.json"), encoding="utf8")):
        for e in json.load(open(os.path.join(REPO, "data/acid/entries", c["file"]), encoding="utf8")):
            titles.add(tuple(toklist(e["fa"]["title"])))
            titles.add(tuple(toklist(e["en"]["title"])))

    # The PROVENANCE label is method disclosure, not content: "this figure is
    # quoted, not measured by this entry" is the house standard `fsync` set and
    # review told stage 10 to follow it in `checkpoint` too. Following it made
    # the two entries share the label's tail, which the widened pass then flagged
    # -- a fix creating a finding. Ruling, same shape as EXEMPT_PREFIXES: a shared
    # run that IS a provenance label is an advisory with its own count, never a
    # silent drop.
    DISCLOSURE_TAILS = [
        ("و این مدخل نسنجیده اش", "fa provenance label «… و این مدخل نسنجیده‌اش»"),
        ("not measured by this entry", "en provenance label «… not measured by this entry»"),
    ]

    def is_disclosure_tail(run):
        joined = " ".join(run)
        return any(joined.endswith(tail) for tail, _why in DISCLOSURE_TAILS)

    def is_citation_head(run):
        """the whole shared run is «مدخل ‹title›» or "The ‹title› entry"."""
        if not run:
            return False
        low = [w.lower() for w in run]
        if run[0] == "مدخل" and tuple(run[1:]) in titles:
            return True
        if low[0] == "the" and low[-1] == "entry" and tuple(low[1:-1]) in {
                tuple(w.lower() for w in t) for t in titles}:
            return True
        return False

    def run_at(A, B, anchor):
        """length of the token run shared at the start ('head') or end ('tail')."""
        if anchor == "tail":
            A, B = A[::-1], B[::-1]
        k = 0
        while k < len(A) and k < len(B) and A[k] == B[k]:
            k += 1
        return k

    def longest_run(A, B):
        best = []
        for i in range(len(A)):
            for j in range(len(B)):
                k = 0
                while i + k < len(A) and j + k < len(B) and A[i + k] == B[j + k]:
                    k += 1
                if k > len(best):
                    best = A[i:i + k]
        return best

    for i in range(len(mine)):
        for j in range(i + 1, len(mine)):
            a, b = mine[i], mine[j]
            if a[1] != b[1] or a[0] == b[0]:
                continue
            sa, sb = a[2], b[2]
            A, B = toklist(sa), toklist(sb)
            if exempt_self(sa, a[4]) or exempt_self(sb, b[4]):
                if sa == sb and len(A) >= 4:
                    advisories.append(
                        f"TEMPLATE ECHO    {a[0]} and {b[0]}/{a[1]} share a template "
                        f"verbatim: {sa[:76]!r}")
                else:
                    run = longest_run(A, B)
                    if len(run) >= 5:
                        advisories.append(
                            f"TEMPLATE ECHO    {a[0]} and {b[0]}/{a[1]} share a {len(run)}-token "
                            f"run of one template variant: {' '.join(run)[:66]!r}")
                continue
            if sa == sb and len(A) >= 4:
                findings.append(f"SELF SENTENCE    {a[0]} and {b[0]}/{a[1]}: {sa[:80]!r}")
                continue
            # WIDENED in fix round 1 of stage 10. The band gate used to sit here,
            # in front of BOTH the Jaccard twin and the anchored run, so a shared
            # lead-in between two body paragraphs -- neither of them touching a
            # <pre> -- was unreachable by this pass. Review found two such pairs in
            # the English («And the third …», «And this is the …») while the Persian
            # of the same four entries was distinct, and the pass had reported 0.
            # The Jaccard twin KEEPS the band gate (whole-sentence overlap off the
            # band is noisy); the ANCHORED run does not need it, because the anchor
            # is what suppresses function-word noise.
            in_band = a[3] or b[3]
            ta, tb = toks(sa), toks(sb)
            if in_band and len(ta) >= 5 and len(tb) >= 5:
                jac = len(ta & tb) / len(ta | tb)
                if jac >= 0.52:
                    findings.append(
                        f"SELF BAND TWIN {jac:.2f}  {a[0]}/{a[1]}: {sa[:70]!r}\n"
                        f"                    vs {b[0]}: {sb[:70]!r}")
                    continue
            head, tail = run_at(A, B, "head"), run_at(A, B, "tail")
            if head >= 3 or tail >= 4:
                where, n = ("start", head) if head >= 3 else ("end", tail)
                run = A[:head] if where == "start" else A[len(A) - tail:]
                if where == "start" and is_citation_head(run):
                    advisories.append(
                        f"CITATION ECHO    {a[0]} and {b[0]}/{a[1]} open on the same citation: "
                        f"{' '.join(run)[:60]!r}")
                    continue
                if where == "end" and is_disclosure_tail(run):
                    advisories.append(
                        f"DISCLOSURE ECHO  {a[0]} and {b[0]}/{a[1]} close on the same provenance "
                        f"label: {' '.join(run)[:60]!r}")
                    continue
                findings.append(
                    f"SELF LEAD-IN RUN {n} at {where}  {a[0]} and {b[0]}/{a[1]}: "
                    f"{' '.join(run)[:66]!r}\n"
                    f"                    in {sa[:66]!r}\n"
                    f"                    and {sb[:66]!r}")

    if verbose:
        print(f"sentences in the corpus (excluding the new entries): {len(corpus)}")
        print(f"sentences in the new entries: {len(mine)}"
              f" ({sum(1 for m in mine if m[3])} of them in the band around a <pre>,"
              f" {sum(1 for m in mine if m[4] == 'setup')} in an example's setup region)")
        print(f"exempt disclosure templates: {len(EXEMPT_PREFIXES)} prefixes")
        print(f"SENTENCE FINDINGS: {len(findings)}")
        for f in findings:
            print("  -", f)
        print(f"new-vs-new template advisories (not findings): {len(advisories)}")
        for f in advisories:
            print("  ~", f)
    return findings


def sentence_selftest():
    import copy
    with stage10():
        base10 = set(run_sentences(load10(), verbose=False))
    base11 = set(run_sentences(load(), verbose=False))
    with stage9():
        base = set(run_sentences(load9(), verbose=False))

    def must_fire(name, mutate, kind):
      with stage9():
        d = copy.deepcopy(load9())
        if not mutate(d):
            raise SystemExit(f"CANARY {name}: needle absent — the check is untested")
        new = [f for f in run_sentences(d, verbose=False) if f not in base]
        if not any(k in f for f in new for k in [kind]):
            raise SystemExit(f"CANARY {name}: no NEW {kind} finding — no teeth")
        print(f"  canary {name}: fired -> {[f for f in new if kind in f][0][:120]}")

    def must_not_fire(name, mutate):
      with stage9():
        d = copy.deepcopy(load9())
        if not mutate(d):
            raise SystemExit(f"CANARY {name}: needle absent — the check is untested")
        new = [f for f in run_sentences(d, verbose=False) if f not in base]
        if new:
            raise SystemExit(f"CANARY {name}: flagged an exempt template: {new[0][:150]}")
        print(f"  canary {name}: correctly silent")

    def get(d, eid):
        return next(e for e in d if e["id"] == eid)

    ANCHOR = "<p>فرایند ۱۸۶۸، نه ۱۸۶۱."

    def m_exact(d):
        """the very defect this extension was written for."""
        e = get(d, "long-transaction")
        if ANCHOR not in e["fa"]["example"]:
            return False
        e["fa"]["example"] = e["fa"]["example"].replace(
            ANCHOR, "<p>سه چیز در این بلوک خواندنی است. فرایند ۱۸۶۸، نه ۱۸۶۱.", 1)
        return True

    def m_twin(d):
        """a lead-in that is a near twin, not an exact repeat."""
        e = get(d, "long-transaction")
        if ANCHOR not in e["fa"]["example"]:
            return False
        e["fa"]["example"] = e["fa"]["example"].replace(
            ANCHOR, "<p>سه چیز در این بلوک واقعاً خواندنی است. فرایند ۱۸۶۸، نه ۱۸۶۱.", 1)
        return True

    def m_exempt(d):
        """Duplicating a disclosure template must NOT fire — that is the ruling.
        The needle is lifted out of the real data so it cannot drift."""
        src = next(s for l, s, _, _r in sentences(get(d, "deadlock"))
                   if s.startswith("ترتیب صریح است"))
        if len(toks(src)) < 4:
            return False
        e = get(d, "long-transaction")
        e["fa"]["example"] = "<p>" + src + "</p>" + e["fa"]["example"]
        # and the ledger, the other template, into a second entry
        led = next(s for l, s, _, _r in sentences(get(d, "deadlock"))
                   if s.startswith("آنچه اینجا گفته نمی‌شود:"))
        get(d, "long-transaction")["fa"]["body"] += "<p>" + led + "</p>"
        return True

    # ---------------------------------------------------------------
    # Review round 1 named four sentences the OLD band could not reach.
    # Each is planted back verbatim; the recalibrated band must flag every
    # one of them against the entry review named. If any stops firing, the
    # widening has been undone and the canary throws rather than passing.
    # ---------------------------------------------------------------
    ROUND1 = [
        ("en", "isolation-in-practice", "example",
         "<p>Session B issues those same statements, then fetches the server's session list with each session's transaction-start instant:</p>",
         "<p>Session B does the same three things and then asks the server how many transactions are open and since when:</p>",
         "serializable"),
        ("en", "isolation-in-practice", "example",
         "<p>And the second write, with <code>psql</code>'s timer on so its duration lands on the transcript too:</p>",
         "<p>Now session B turns on <code>psql</code>'s timer, writes 80, and then tries to commit:</p>",
         "serializable"),
        ("en", "isolation-in-practice", "example",
         "And two further marks in the same block: the exclamation point in the prompt, and a <code>ROLLBACK</code> coming back where a <code>COMMIT</code> was sent.",
         "After it the prompt carries an exclamation mark and the <code>COMMIT</code> is answered with <code>ROLLBACK</code>.",
         "serializable"),
        ("en", "isolation-in-practice", "example",
         "<p>And the balance, with no transaction open any more — asked from session A:</p>",
         "<p>And the table, asked from session A once both boundaries are closed:</p>",
         "serializable"),
    ]

    def round1_canaries():
      with stage8():
        base8 = set(run_sentences(load8(), verbose=False))
        for lang, eid, field, now, removed, against in ROUND1:
            d = copy.deepcopy(load8())
            e = get(d, eid)
            if now not in e[lang][field]:
                raise SystemExit(
                    f"CANARY round-1 {removed[:40]!r}: anchor absent — the check is untested")
            e[lang][field] = e[lang][field].replace(now, removed, 1)
            new = [f for f in run_sentences(d, verbose=False) if f not in base8]
            hit = [f for f in new if "BAND TWIN" in f and against in f]
            if not hit:
                raise SystemExit(
                    f"CANARY round-1 {removed[:50]!r}: recalibrated band does NOT flag it "
                    f"against {against} — the widening is undone")
            print(f"  canary round-1 vs {against}: fired -> {hit[0].split(chr(10))[0][:100]}")

    # ---------------------------------------------------------------
    # Fix round 1 of stage 9 named three lead-ins shared verbatim between the
    # stage's own two entries. Each is planted back exactly as it shipped, and
    # the new new-vs-new pass must flag every one. If any stops firing, the pass
    # has been narrowed back to equality and the canary throws rather than
    # passing — a canary that quietly stops firing is worse than no canary.
    # ---------------------------------------------------------------
    SELF_ROUND1 = [
        ("fa", "example", "SHOW lead-in",
         "<p>و آن تنظیمی که می‌توانست این را ببندد، بیرون از هر دو نشست بالا:</p>",
         "<p>و آن تنظیمی که می‌توانست این را ببندد، پرسیده از همان سرور در نشستی جدا:</p>"),
        ("en", "example", "SHOW lead-in",
         "<p>And the setting that could have closed this off, from outside both sessions above:</p>",
         "<p>And the setting that could have closed this off, asked of the same server in a separate session:</p>"),
        ("fa", "example", "first-block opener",
         "<p>بلوک اول تمام آن چیزی است که نشست الف فرستاد. دو دستور آخرش",
         "<p>نشست الف، یکجا. دو دستور آخرش"),
        ("en", "example", "first-block opener",
         "<p>The first block is everything session A sent. Its last two statements are",
         "<p>Session A, in one piece. Its last two statements are"),
    ]

    def self_canaries():
      with stage9():
        for lang, field, name, now, shipped in SELF_ROUND1:
            d = copy.deepcopy(load9())
            e = get(d, "long-transaction")
            if now not in e[lang][field]:
                raise SystemExit(
                    f"CANARY self {name}/{lang}: anchor absent — the check is untested")
            e[lang][field] = e[lang][field].replace(now, shipped, 1)
            new = [f for f in run_sentences(d, verbose=False) if f not in base]
            hit = [f for f in new if "SELF LEAD-IN RUN" in f or "SELF BAND TWIN" in f
                   or "SELF SENTENCE" in f]
            if not hit:
                raise SystemExit(
                    f"CANARY self {name}/{lang}: the new-vs-new pass does NOT flag the "
                    f"lead-in this round removed — the blind spot is back")
            print(f"  canary self {name}/{lang}: fired -> {hit[0].split(chr(10))[0][:104]}")

        # NEGATIVE: two lead-ins in the same slot that share no anchored run must
        # stay silent. Without this the pass could be flagging every pair.
        d = copy.deepcopy(load9())
        e = get(d, "long-transaction")
        needle = "<p>و آن تنظیمی که می‌توانست این را ببندد، بیرون از هر دو نشست بالا:</p>"
        if needle not in e["fa"]["example"]:
            raise SystemExit("CANARY self negative: needle absent — the check is untested")
        e["fa"]["example"] = e["fa"]["example"].replace(
            needle, "<p>و سقفی که اگر گذاشته بودند این وضع را می‌بست، جدا از این دو نشست:</p>", 1)
        new = [f for f in run_sentences(d, verbose=False) if f not in base]
        bad = [f for f in new if f.startswith("SELF ")]
        if bad:
            raise SystemExit(f"CANARY self negative: flagged an unrelated lead-in: {bad[0][:150]}")
        print("  canary self negative (distinct lead-in, same slot): correctly silent")

    # -----------------------------------------------------------------
    # Stage 10 writes FOUR entries, so new-vs-new is six pairings. Each canary
    # below plants a lead-in from one new entry into ANOTHER one, in the slot
    # beside a <pre>, and the pass must flag it. Every one of the six pairings
    # is exercised. Without this, "0 findings" over six pairings is untested.
    # -----------------------------------------------------------------
    PAIRS = [("durability", "fsync"), ("durability", "checkpoint"),
             ("durability", "crash-recovery"), ("fsync", "checkpoint"),
             ("fsync", "crash-recovery"), ("checkpoint", "crash-recovery")]

    def stage10_canaries():
      with stage10():
          for src_id, dst_id in PAIRS:
              d = copy.deepcopy(load10())
              src = get(d, src_id)
              # the sentence that introduces the source entry's first <pre>
              lead = None
              for lang, field, para, band, region in prose_paragraphs(src):
                  if lang == "fa" and field == "example" and region == "setup-leadin":
                      lead = para
                      break
              if lead is None or len(toklist(lead)) < 6:
                  raise SystemExit(
                      f"CANARY pair {src_id}->{dst_id}: no first-block lead-in found in {src_id} "
                      f"— the check is untested")
              dst = get(d, dst_id)
              i = dst["fa"]["example"].find("<pre>")
              if i < 0:
                  raise SystemExit(f"CANARY pair {src_id}->{dst_id}: {dst_id} has no <pre>")
              dst["fa"]["example"] = (dst["fa"]["example"][:i] + "<p>" + lead + "</p>"
                                      + dst["fa"]["example"][i:])
              new = [f for f in run_sentences(d, verbose=False) if f not in base10]
              hit = [f for f in new if f.startswith("SELF ")]
              if not hit:
                  raise SystemExit(
                      f"CANARY pair {src_id}->{dst_id}: a lead-in shared between two of this "
                      f"stage's own entries was NOT flagged — the six pairings are unchecked")
              print(f"  canary pair {src_id}->{dst_id}: fired -> "
                    f"{hit[0].split(chr(10))[0][:96]}")

          # ---- fix round 1: the widening must have teeth OFF the band, and the two
          # new exemptions must not have opened a hole.
          #
          # (a) the exact pair review found: two BODY subheads, neither adjacent to
          #     a <pre>, sharing a 3-token head. Under the old band-gated pass this
          #     was unreachable; it must fire now.
          d = copy.deepcopy(load10())
          e = get(d, "durability")
          now = "<p><strong>و سومی را آسان‌تر از آنچه می‌نماید می‌شود سنجید.</strong></p>"
          if now not in e["fa"]["body"]:
              raise SystemExit("CANARY off-band: anchor absent — the check is untested")
          e["fa"]["body"] = e["fa"]["body"].replace(
              now, "<p><strong>و بلوک سوم آسان‌تر از آن است که به نظر می‌رسد.</strong></p>", 1)
          new_f = [f for f in run_sentences(d, verbose=False) if f not in base10]
          if not any("SELF LEAD-IN RUN" in f for f in new_f):
              raise SystemExit(
                  "CANARY off-band: a shared head between two BODY sentences did NOT fire — "
                  "the band gate is back and review's finding is unreachable again")
          print(f"  canary off-band body pair: fired -> {new_f[0].split(chr(10))[0][:100]}")

          # (b) the citation exemption must be narrow: a shared head that merely
          #     STARTS like a citation but is not one must still be a finding.
          d = copy.deepcopy(load10())
          src = get(d, "durability"); dst = get(d, "checkpoint")
          i = dst["fa"]["body"].find("<p>")
          dst["fa"]["body"] = (dst["fa"]["body"][:i]
                               + "<p>مدخل لاگ پیش‌نوشتی که این را گفت جای دیگری هم گفته است.</p>"
                               + dst["fa"]["body"][i:])
          j = src["fa"]["body"].find("<p>")
          src["fa"]["body"] = (src["fa"]["body"][:j]
                               + "<p>مدخل لاگ پیش‌نوشتی که این را گفت همان‌جا ایستاده است.</p>"
                               + src["fa"]["body"][j:])
          new_f = [f for f in run_sentences(d, verbose=False) if f not in base10]
          if not any("SELF LEAD-IN RUN" in f for f in new_f):
              raise SystemExit(
                  "CANARY citation-exemption width: a near-citation head that is NOT a citation "
                  "was swallowed by the exemption")
          print("  canary citation exemption stays narrow: fired")

          # (c) the disclosure-tail exemption must not swallow an ordinary shared tail.
          d = copy.deepcopy(load10())
          a_ = get(d, "durability"); b_ = get(d, "checkpoint")
          a_["fa"]["body"] += "<p>این عدد از جای دیگری نیامده و کسی نسنجیده‌اش.</p>"
          b_["fa"]["body"] += "<p>آن عدد از جای دیگری نیامده و کسی نسنجیده‌اش.</p>"
          new_f = [f for f in run_sentences(d, verbose=False) if f not in base10]
          if not any("SELF LEAD-IN RUN" in f for f in new_f):
              raise SystemExit(
                  "CANARY disclosure-exemption width: an ordinary shared tail was swallowed")
          print("  canary disclosure exemption stays narrow: fired")

          # NEGATIVE: the same insertion with an unrelated sentence must stay silent.
          d = copy.deepcopy(load10())
          dst = get(d, "checkpoint")
          i = dst["fa"]["example"].find("<pre>")
          dst["fa"]["example"] = (dst["fa"]["example"][:i]
                                  + "<p>ابری که تمام بعدازظهر بالای شهر ایستاده بود کنار رفت.</p>"
                                  + dst["fa"]["example"][i:])
          new = [f for f in run_sentences(d, verbose=False) if f not in base10]
          bad = [f for f in new if f.startswith("SELF ")]
          if bad:
              raise SystemExit(f"CANARY pair negative: flagged an unrelated sentence: {bad[0][:150]}")
          print("  canary pair negative (unrelated sentence in the same slot): correctly silent")

    def stage11_canaries():
        """This stage has ONE <pre>-bearing entry and one with no blocks at all,
        so the pairing that matters is body-to-body in both directions. Each
        plants a real sentence of one new entry into the other and requires the
        ungated run to flag it."""
        for src_id, dst_id in [("base", "acid-outside-the-database"),
                               ("acid-outside-the-database", "base")]:
            d = copy.deepcopy(load())
            src, dst = get(d, src_id), get(d, dst_id)
            lead = None
            for lang, field, para, band, region in prose_paragraphs(src):
                if lang == "fa" and field == "body" and len(toklist(para)) >= 8:
                    lead = para
                    break
            if lead is None:
                raise SystemExit(f"CANARY pair {src_id}->{dst_id}: no lead found — untested")
            k = dst["fa"]["body"].find("<p>")
            dst["fa"]["body"] = (dst["fa"]["body"][:k] + "<p>" + lead + "</p>"
                                 + dst["fa"]["body"][k:])
            new = [f for f in run_sentences(d, verbose=False) if f not in base11]
            hit = [f for f in new if f.startswith("SELF ")]
            if not hit:
                raise SystemExit(
                    f"CANARY pair {src_id}->{dst_id}: a sentence shared between this stage's "
                    f"own two entries was NOT flagged")
            print(f"  canary pair {src_id}->{dst_id}: fired -> "
                  f"{hit[0].split(chr(10))[0][:96]}")

    print("sentence self-test:")
    stage11_canaries()
    stage10_canaries()
    self_canaries()
    round1_canaries()
    must_fire("exact repeat of savepoint/wal's lead-in", m_exact, "SENTENCE REPEAT")
    must_fire("near-twin lead-in", m_twin, "BAND TWIN")
    must_not_fire("duplicated disclosure template stays silent", m_exempt)
    print("sentence canaries behaved.\n")


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        import copy
        with stage9():
          base = set(run(load9(), verbose=False))
          d = copy.deepcopy(load9())
          # plant a verbatim repeat of an existing subhead
          needle = "<p><strong>و مرز این مدخل.</strong></p>"
          victim = next(e for e in d if e["id"] == "deadlock")
          assert "<p><strong>و موتور خودش حلقه را می‌بیند.</strong></p>" in victim["fa"]["body"], \
              "CANARY: needle absent — the check is untested"
          victim["fa"]["body"] = victim["fa"]["body"].replace(
              "<p><strong>و موتور خودش حلقه را می‌بیند.</strong></p>", needle, 1)
          new = [f for f in run(d, verbose=False) if f not in base]
          if not any("EXACT REPEAT" in f for f in new):
              raise SystemExit("CANARY: planted exact repeat did not fire")
          print("canary: planted exact repeat fired ->",
                [f for f in run(d, verbose=False) if "EXACT REPEAT" in f][0][:120])
        # a stage-10 subhead planted into another stage-10 entry must fire too
        with stage10():
          d = copy.deepcopy(load10())
          v = next(e for e in d if e["id"] == "checkpoint")
          src = next(e for e in d if e["id"] == "durability")
          sub = subheads(src)[0][1]
          assert "<p><strong>و معامله، در یک سطر.</strong></p>" in v["fa"]["body"], \
              "CANARY: stage-10 subhead needle absent — the check is untested"
          v["fa"]["body"] = v["fa"]["body"].replace(
              "<p><strong>و معامله، در یک سطر.</strong></p>",
              "<p><strong>" + sub + "</strong></p>", 1)
          new = [f for f in run(d, verbose=False) if f not in set(run(load10(), verbose=False))]
          if not any("SELF REPEAT" in f or "SELF TWIN" in f for f in new):
              raise SystemExit("CANARY: a subhead shared between two stage-10 entries did not fire")
          print("canary: stage-10 subhead shared between two new entries fired ->",
                [f for f in new if "SELF " in f][0][:120])
        # and the same for stage 11's own two entries
        d = copy.deepcopy(load())
        v = next(e for e in d if e["id"] == "acid-outside-the-database")
        src = next(e for e in d if e["id"] == "base")
        sub = subheads(src)[0][1]
        needle = "<p><strong>و خروجیِ این موضوع: سه پاسخ که نوشته شده‌اند، جای دیگری از همین سایت.</strong></p>"
        assert needle in v["fa"]["body"], "CANARY: stage-11 subhead needle absent"
        v["fa"]["body"] = v["fa"]["body"].replace(
            needle, "<p><strong>" + sub + "</strong></p>", 1)
        new = [f for f in run(d, verbose=False) if f not in set(run(load(), verbose=False))]
        if not any("SELF REPEAT" in f or "SELF TWIN" in f for f in new):
            raise SystemExit("CANARY: a subhead shared between two stage-11 entries did not fire")
        print("canary: stage-11 subhead shared between two new entries fired ->",
              [f for f in new if "SELF " in f][0][:120])
        print()
    run(load())
    print()
    if "--selftest" in sys.argv:
        sentence_selftest()
    run_sentences(load())
