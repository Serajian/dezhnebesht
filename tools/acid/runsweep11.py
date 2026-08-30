#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""The gap review round 1 found: an UNGATED old-vs-new shared-run sweep.

converge11 compares a new sentence against the 41k-sentence corpus only when
that sentence sits in the band around a <pre>, and compares whole sentences by
token-overlap RATIO. Both together made two real collisions unreachable:

  * a 13-token run lifted from `two-phase-commit`'s BODY into this stage's
    body — no <pre> anywhere near either side, so the corpus direction never
    looked at it;
  * an 8-token run against `distributed-transaction` inside a much longer
    sentence, whose overall ratio stayed far under the twin threshold.

converge10 had already learned this lesson in the new-vs-new direction (the
ninth checker blind spot: every earlier canary planted its needle inside the
<pre> band). The same widening was never applied to old-vs-new. This file is
that half.

Two passes, both n-gram indexed so the whole corpus is walked once:

  A. every sentence of the new entries against every sentence in data/,
     flagging the longest shared CONTIGUOUS token run of RUN_MIN or more,
     anywhere in either sentence, with no band gate and no ratio.
  B. every standalone bold subhead of the new entries against every bold run
     in data/, flagging a shared OPENING run of HEAD_MIN or more — the
     four-token bar converge11 applies new-vs-new and never applied
     old-vs-new.

--selftest restores each of the three collisions this round fixed and requires
every one to fire, and throws if a needle is absent.
"""
import json, os, re, sys, glob
from collections import defaultdict

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
NEW = {"acid-outside-the-database", "base"}
RUN_MIN = 7
HEAD_MIN = 4
CONTENT_MIN = 3        # content tokens a run must carry to be more than grammar
STOP_TOP = 150         # the N most frequent corpus tokens count as grammar

# Two rules decide whether a shared run is a lift, and both are precise about
# WHICH entry the run collides with. A blanket "the paragraph cites something"
# exemption would have hidden this round's worst finding: the paragraph that
# lifted 13 tokens from `two-phase-commit` attributed them to `saga`.
#
#  1. ATTRIBUTION. If the paragraph carrying the run names the very entry the
#     run collides with, the restatement is the house citation convention
#     working. A citation is the licence to restate, and a restatement the
#     reader cannot recognise is a worse citation.
#  2. SHARED VOCABULARY. A run already carried by two or more EXISTING entries
#     is the site's own phrasing for that idea, not a lift from any one of
#     them; three entries already restate `eventual-consistency`'s definition
#     word for word. Reported as an advisory, never as a finding.
#
# Everything else is a finding.
ATTRIB = {
    "acid": [r"مدخل <?[^>]*>?ACID", r"\bACID entry\b"],
    "eventual-consistency": [r"مدخل سازگاری نهایی", r"\beventual consistency entry\b"],
    "two-phase-commit": [r"مدخل تعهد دوفازی", r"\btwo-phase commit entry\b"],
    "saga": [r"مدخل الگوی ساگا", r"\bsaga entry\b"],
    "distributed-transaction": [r"مدخل تراکنش توزیع‌شده", r"\bdistributed transaction entry\b"],
    "durability": [r"مدخل پایداری", r"\bdurability entry\b"],
    "long-transaction": [r"مدخل تراکنش طولانی", r"\blong transaction entry\b"],
    "transaction-boundary": [r"مدخل مرز تراکنش", r"\btransaction boundary entry\b"],
    "crash-recovery": [r"مدخل بازیابی پس از خرابی", r"\bcrash recovery entry\b"],
    "non-transactional-effect": [r"مدخل اثر غیرتراکنشی", r"\bnon-transactional effect entry\b"],
    "undo-log": [r"مدخل لاگ لغو", r"\bundo log entry\b"],
    "integrity-constraint": [r"مدخل قید یکپارچگی", r"\bintegrity constraint entry\b"],
    "acid-consistency": [r"مدخل سازگاری در", r"\bconsistency in ACID entry\b"],
    "acid-c-vs-cap-c": [r"مدخل دو معنای سازگاری", r"\btwo meanings of consistency entry\b"],
    "isolation-level": [r"مدخل سطح جداسازی", r"\bisolation level entry\b"],
    "acid-outside-the-database": [r"مدخل بیرون از یک پایگاه داده",
                                  r"\boutside one database entry\b"],
}
NAV = (r"در فهرست مدخل‌های مرتبطِ پایین همین صفحه"
       r"|in the related entries at the foot of\s*this page")


def strip(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s)).strip()


def toklist(s):
    return re.findall(r"[^\W\d_]+", s, re.UNICODE)


SENT_SPLIT = re.compile(r"(?<=[.؟!:])\s+")


def prose_of(html):
    return re.sub(r"<pre><code>.*?</code></pre>", " ", html, flags=re.S)


def sentences_of(entry):
    """(lang, sentence, containing paragraph) — the paragraph is carried along
    because attribution lives at paragraph scope: SENT_SPLIT breaks on ':', and
    the house citation form puts the citation before the colon and the restated
    claim after it."""
    out = []
    for lang in ("fa", "en"):
        for field in ("body", "example"):
            html = prose_of(entry[lang].get(field, ""))
            for m in re.finditer(r"<p>(.*?)</p>", html, re.S):
                para = strip(m.group(1))
                for s in SENT_SPLIT.split(para):
                    s = s.strip()
                    if s:
                        out.append((lang, s, para))
    return out


def subheads_of(entry):
    out = []
    for lang in ("fa", "en"):
        for field in ("body", "example"):
            for para in re.findall(r"<p>(.*?)</p>", entry[lang].get(field, ""), re.S):
                m = re.fullmatch(r"\s*<strong>(.*)</strong>\s*", para, re.S)
                if m:
                    out.append((lang, strip(m.group(1))))
    return out


def bold_runs_of(entry):
    out = []
    for lang in ("fa", "en"):
        for field in ("body", "example"):
            for m in re.finditer(r"<(strong|b)>(.*?)</\1>", entry[lang].get(field, ""), re.S):
                out.append((lang, strip(m.group(2))))
    return out


def load_all():
    out = []
    for path in sorted(glob.glob(os.path.join(REPO, "data/*/entries/*.json"))):
        for e in json.load(open(path, encoding="utf8")):
            out.append(e)
    return out


def attributes(para, oid):
    """does this paragraph name the entry `oid` by its citation form?"""
    return any(re.search(p, para) for p in ATTRIB.get(oid, ()))


def longest_run(a, b):
    """longest contiguous shared token run between two token lists"""
    best, bi = 0, 0
    prev = [0] * (len(b) + 1)
    for i in range(1, len(a) + 1):
        cur = [0] * (len(b) + 1)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1] + 1
                if cur[j] > best:
                    best, bi = cur[j], i
        prev = cur
    return best, a[bi - best:bi]


def run(entries, verbose=True):
    new = [e for e in entries if e["id"] in NEW]
    old = [e for e in entries if e["id"] not in NEW]
    findings = []

    # ---------------------------------------------- A: shared sentence runs
    freq = defaultdict(int)
    for e in entries:
        for _lang, s, _p in sentences_of(e):
            for tok in toklist(s):
                freq[tok] += 1
    grammar = {t for t, _n in sorted(freq.items(), key=lambda kv: -kv[1])[:STOP_TOP]}

    index = defaultdict(set)
    corpus = []
    for e in old:
        for lang, s, _p in sentences_of(e):
            t = toklist(s)
            k = len(corpus)
            corpus.append((e["id"], lang, s, t))
            for i in range(len(t) - RUN_MIN + 1):
                index[tuple(t[i:i + RUN_MIN])].add(k)

    compared = 0
    advisories = []
    for e in new:
        for lang, s, para in sentences_of(e):
            t = toklist(s)
            compared += 1
            hits = set()
            for i in range(len(t) - RUN_MIN + 1):
                hits |= index.get(tuple(t[i:i + RUN_MIN]), set())
            per_run = {}
            for k in hits:
                oid, olang, os_, ot = corpus[k]
                n, tokens = longest_run(t, ot)
                if n < RUN_MIN:
                    continue
                if sum(1 for tk in tokens if tk not in grammar) < CONTENT_MIN:
                    continue          # a run of pure grammar is not a lift
                shared = " ".join(tokens)
                per_run.setdefault(shared, {"n": n, "who": {}})
                per_run[shared]["who"][oid] = (olang, os_)
            for shared, info in per_run.items():
                who = info["who"]
                if re.search(NAV, s):
                    continue          # the site's navigational formula
                if any(attributes(para, oid) for oid in who):
                    continue          # rule 1: attributed to the entry it came from
                line = (f"{e['id']}/{lang} shares a {info['n']}-token run with "
                        f"{', '.join(sorted(who))}\n                    run:  {shared!r}\n"
                        f"                    new:  {s[:110]!r}\n"
                        f"                    old:  {list(who.values())[0][1][:110]!r}")
                if len(who) >= 2:
                    advisories.append("SHARED VOCABULARY  " + line)   # rule 2
                else:
                    findings.append(f"OLD-VS-NEW RUN {info['n']}  " + line)

    # ------------------------------------------- B: shared subhead openings
    heads = defaultdict(set)
    for e in old:
        for lang, b in bold_runs_of(e):
            t = toklist(b)
            if len(t) >= HEAD_MIN:
                heads[tuple(t[:HEAD_MIN])].add((e["id"], lang, b))
    subs = 0
    for e in new:
        for lang, b in subheads_of(e):
            subs += 1
            t = toklist(b)
            if len(t) < HEAD_MIN:
                continue
            for oid, olang, ob in heads.get(tuple(t[:HEAD_MIN]), ()):
                findings.append(
                    f"OLD-VS-NEW SUBHEAD OPENING {HEAD_MIN}  {e['id']}/{lang}: {b[:80]!r}\n"
                    f"                    vs {oid}/{olang}: {ob[:80]!r}")

    if verbose:
        print(f"corpus sentences indexed: {len(corpus)}")
        print(f"new sentences swept ungated against all of them: {compared}")
        print(f"new standalone subheads checked for a shared {HEAD_MIN}-token opening: {subs}")
        print(f"grammar tokens ignored (top {STOP_TOP} of {len(freq)}): "
              f"{len(grammar)}; a run needs {CONTENT_MIN} content tokens")
        print(f"attribution forms declared: {len(ATTRIB)}")
        print(f"RUN FINDINGS: {len(findings)}")
        for f in findings:
            print("  - " + f)
        print(f"shared-vocabulary advisories (two or more existing carriers, "
              f"not findings): {len(advisories)}")
        for a in advisories:
            print("  ~ " + a)
    return findings


def selftest():
    """Prove every check has teeth, WITHOUT quoting a line of shipped prose.

    The first version of this self-test injected each defect by `.replace()`-ing
    a long quotation of the live entry text. That coupling failed exactly the way
    the rule in docs/entry-conventions.md says it fails: the final fix wave
    rewrote «دو ماندگاری» to «دو پایداری» in `acid-outside-the-database`, canary 2's
    needle went absent, and because the harness aborted on the first failure the
    subhead canary and — worse — the NEGATIVE canary never ran at all.

    Two structural fixes, and both are the point rather than tidying:

    1. A canary INJECTS its defect by appending a paragraph. It reads nothing out
       of the entry, so no author can silently turn it into a no-op. What each
       canary asserts is that its own payload came back flagged.
    2. A failing canary is RECORDED, not raised. One broken canary must never be
       able to hide the ones after it — least of all the negative canary, whose
       whole job is to prove the matcher does not flag everything.
    """
    import copy
    entries = load_all()
    base = set(run(entries, verbose=False))
    failures = []

    def fail(msg):
        failures.append(msg)
        print(f"  CANARY FAILURE: {msg}")

    def inject(d, eid, html):
        """Append `html` to an entry's Persian body and confirm it landed.

        Appending cannot silently match nothing, which is the whole reason this
        is an append and not a replace.
        """
        e = next(x for x in d if x["id"] == eid)
        e["fa"]["body"] = e["fa"]["body"] + html
        return html in e["fa"]["body"]

    def must_fire(name, eid, payload, kind):
        d = copy.deepcopy(entries)
        if not inject(d, eid, payload):
            return fail(f"{name}: payload did not land in {eid} — the check is untested")
        new = [f for f in run(d, verbose=False) if f not in base]
        hit = [f for f in new if kind in f]
        if not hit:
            return fail(f"{name}: no NEW {kind!r} finding — no teeth")
        print(f"  canary {name}: fired\n      {hit[0].splitlines()[0]}")

    def must_not_fire(name, eid, payload):
        d = copy.deepcopy(entries)
        if not inject(d, eid, payload):
            return fail(f"{name}: payload did not land in {eid} — the check is untested")
        new = [f for f in run(d, verbose=False) if f not in base]
        if new:
            return fail(f"{name}: flagged a benign paragraph: {new[0][:200]}")
        print(f"  canary {name}: correctly silent")

    # 1: the 13-token run stage 11 lifted out of two-phase-commit while
    #    attributing it to saga — the finding a blanket citation exemption hid.
    P_SAGA = ("<p>مدخل الگوی ساگا معاملهٔ دیگر را شرح می‌دهد: هیچ‌وقت مسدود نمی‌شود و در عوض "
              "جداسازی را رها می‌کند؛ حالت میانی دیدنی می‌ماند و بازگشت با جبران انجام می‌شود، "
              "نه با بازگرداندن.</p>")

    # 2: the run against distributed-transaction's «هر طرف تغییر خودش را ماندگار
    #    می‌کند، بی‌آنکه چیزی دربارهٔ طرف دیگر بداند».
    P_DURABLE = "<p>هر انبار تغییر خودش را ماندگار می‌کند، بی‌آنکه چیزی دربارهٔ دیگری بداند.</p>"

    # 3: a standalone bold subhead whose four-token opening two closed entries
    #    already use.
    P_SUBHEAD = ("<p><strong>و جایی که این سرنام از آن آمده، چیزی می‌گوید که بعداً گم "
                 "شد.</strong></p>")

    # negative: an ordinary new paragraph that shares no long run with anything.
    # A matcher that returned everything would flag this one too.
    P_BENIGN = "<p>این بند فقط برای آزمودنِ همین جاروب افزوده شده و جای دیگری معنایی ندارد.</p>"

    print("run-sweep self-test:")
    must_fire("the 13-token run lifted from two-phase-commit",
              "acid-outside-the-database", P_SAGA, "OLD-VS-NEW RUN")
    must_fire("the run against distributed-transaction",
              "acid-outside-the-database", P_DURABLE, "OLD-VS-NEW RUN")
    must_fire("the four-token subhead opening shared with two closed entries",
              "base", P_SUBHEAD, "SUBHEAD OPENING")
    must_not_fire("an ordinary new paragraph", "base", P_BENIGN)
    if failures:
        raise SystemExit(
            f"{len(failures)} of 4 canaries failed — every check they cover is untested, "
            f"so this script's FINDINGS count means nothing until they are fixed.")
    print("run-sweep canaries behaved (4 of 4).\n")


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        selftest()
    run(load_all())
