#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Stage 11 checks on the two entries appended to data/acid/entries/limits.json.

Everything check5 runs (raw '<' inside a block, prose numbers cross-checked
against the same entry's blocks, psql/mysql table re-derivation — inert here,
this stage's blocks are Go), everything check9/check10 added (byte-identity
against blocks11/, fa and en using the same blocks in the same order,
HTML-in-title/short, bare Latin in fa prose, block-count claims), and the
POSITIONAL table RE-POINTED at stage 11's own two blocks.

One change forced by this stage's data: `base` has NO blocks at all, so every
number in its prose has to be allowlisted with the source that settled it.
That is the point rather than an annoyance — the allowlist below is the
provenance table for the one set of claims in this topic most likely to have
moved, and each row names where it was checked.

--selftest mutates the data in ways each check MUST catch and throws when a
needle is absent, so a canary that quietly stops firing is itself a failure.
"""
import copy, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check5
from check5 import blocks_of, unesc, prose_of

HERE = os.path.dirname(os.path.abspath(__file__))
BLOCKS11 = os.path.join(HERE, "blocks11")
PATH = os.path.join(check5.REPO, "data/acid/entries/limits.json")
NEW = ["acid-outside-the-database", "base"]

check5.ALLOWED.update({
    "acid-outside-the-database": {
        "1.26.6": "the Go toolchain the capture was taken with; `go version` reports "
                  "go1.26.6 darwin/arm64",
    },
    "base": {
        # BASE's provenance
        "1997": "Fox, Gribble, Chawathe, Brewer, Gauthier, 'Cluster-Based Scalable Network "
                "Services', SOSP, October 1997 — the BASE definition read off page 3 of the "
                "paper itself",
        "2008": "Dan Pritchett, 'BASE: An Acid Alternative', ACM Queue 6(3), 2008 — venue, "
                "volume and year as listed in dblp",
        # MongoDB
        "4.0": "MongoDB 4.0 (2018), multi-document ACID transactions; the current manual "
               "states minimum featureCompatibilityVersion 4.0 for a replica set",
        "2018": "MongoDB 4.0's year, per mongodb.com's own version history; also DynamoDB's "
                "transaction announcement year",
        "4.2": "MongoDB 4.2 (2019), transactions across a sharded cluster; the current "
               "manual states minimum featureCompatibilityVersion 4.2 for a sharded cluster",
        "2019": "MongoDB 4.2's year, per mongodb.com's own version history",
        # DynamoDB
        "27": "the day of the DynamoDB transactions announcement — 27 November 2018, per the "
              "AWS What's New page",
        "100": "TransactWriteItems groups up to 100 write actions on up to 100 distinct "
               "items, per the DynamoDB developer guide's transaction-apis page",
        "4": "the 4 MB aggregate size ceiling on a transaction, same page",
    },
})


def load_captures():
    out = {}
    for fn in sorted(os.listdir(BLOCKS11)):
        if fn.endswith(".txt"):
            with open(os.path.join(BLOCKS11, fn), encoding="utf8") as fh:
                out[fn[:-4]] = fh.read().replace("\r", "").rstrip("\n")
    return out


CAPTURES = load_captures()


# ------------------------------------------------------- A/B: block fidelity
def block_order(entry, lang="fa"):
    names = []
    for field in ("body", "example"):
        for raw in blocks_of(entry[lang].get(field, "")):
            text = unesc(raw)
            hit = [n for n, c in CAPTURES.items() if c == text]
            names.append(hit[0] if hit else None)
    return names


def check_fidelity(entries, findings):
    checked = 0
    for e in entries:
        per_lang = {}
        for lang in ("fa", "en"):
            names = []
            for field in ("body", "example"):
                for raw in blocks_of(e[lang].get(field, "")):
                    text = unesc(raw)
                    hit = [n for n, c in CAPTURES.items() if c == text]
                    if not hit:
                        findings.append(
                            f"{e['id']}/{lang}/{field}: block is in no blocks11/ capture: "
                            f"{text.splitlines()[0][:70]!r}")
                    else:
                        names.append(hit[0])
                        checked += 1
            per_lang[lang] = names
        if per_lang["fa"] != per_lang["en"]:
            findings.append(
                f"{e['id']}: fa uses blocks {per_lang['fa']} but en uses {per_lang['en']}")
    return checked


# --------------------------------------------------------------- C: shape
def check_shape(entries, findings):
    for e in entries:
        for lang in ("fa", "en"):
            blk = e[lang]
            for field in ("title", "short"):
                if re.search(r"<[a-zA-Z/]", blk[field]):
                    findings.append(f"{e['id']}/{lang}/{field}: HTML in a field that takes none")
            for field in ("body", "example"):
                html = blk.get(field, "")
                prose = prose_of(html)
                if lang == "fa":
                    naked = re.sub(r"<code>.*?</code>", " ", prose, flags=re.S)
                    naked = re.sub(r'<span dir="ltr">.*?</span>', " ", naked, flags=re.S)
                    naked = re.sub(r"<[^>]+>", " ", naked)
                    for m in re.finditer(r"[A-Za-z][A-Za-z.]+", naked):
                        findings.append(
                            f"{e['id']}/fa/{field}: bare Latin {m.group(0)!r} outside code/ltr span")
                if "<p><strong>" in html and "</strong></p>" not in html:
                    findings.append(f"{e['id']}/{lang}/{field}: unbalanced subhead markup")
        if not e["fa"]["title"] or not e["fa"]["short"] or not e["fa"]["body"]:
            findings.append(f"{e['id']}: missing a required fa field")
        if not e["en"].get("title") or not e["en"].get("body"):
            findings.append(f"{e['id']}: missing an English translation")


# ---- Go-specific: the two things a Go block can be wrong about at the byte level
def check_go_blocks(findings):
    """gofmt indents with TABS and `go test -v` indents its log lines with four
    SPACES. A block re-typed by hand rather than captured gets this backwards,
    and nothing else in the pipeline would notice."""
    for line in CAPTURES["ob_code"].split("\n"):
        if line.startswith(" "):
            findings.append(f"blocks11/ob_code: gofmt never indents with a space: {line!r}")
    for line in CAPTURES["ob_run"].split("\n"):
        if line.startswith("\t") and not line.startswith("ok\t"):
            findings.append(f"blocks11/ob_run: unexpected tab-indented line: {line!r}")
    if not re.search(r"^ok {2}\tshop\.example/acid/outside\t\d+\.\d+s$",
                     CAPTURES["ob_run"], re.M):
        findings.append("blocks11/ob_run: no `ok <pkg> <elapsed>` trailer — "
                        "this is not what `go test` prints")


# ------------------------------------------------------- D: positional claims
PW = "؀-ۿ‌"
ORD = re.compile(
    "(?<![" + PW + "])(?:اول|دوم|سوم|چهارم|پنجم|ششم|بالایی|پایینی|آخرین|آخر|بعدی)[" + PW + "]{0,3}"
    r"|\b(?:first|second|third|fourth|fifth|sixth|upper|lower|last|next)\b")
NEAR = re.compile("بلوک|خط(?![اآ])|سطر|ستون|دستور|رونوشت|پرسش|نسخهٔ|⟪"
                  r"|\b(?:block|line|row|column|statement|query|transcript|version)")
WINDOW = 18


def norm(html):
    t = prose_of(html)
    t = re.sub(r"<code>(.*?)</code>", lambda m: "⟪" + re.sub(r"<[^>]+>", "", m.group(1)) + "⟫",
               t, flags=re.S)
    return re.sub(r"<[^>]+>", " ", t)


def sent_of(text, idx):
    return text[max(0, idx - 90):idx + 90]


def logs(t):
    return [l.strip() for l in t.split("\n") if l.strip().startswith("outside_test.go:")]


def triples(t):
    """(label, before, during, after) for every measurement line of the run"""
    out = []
    for l in logs(t):
        m = re.search(r": (.+?): before (\[\d \d\])\s+during (\[\d \d\])\s+after (\[\d \d\])", l)
        if m:
            out.append((m.group(1).strip(), m.group(2), m.group(3), m.group(4)))
    return out


POSITIONAL_BENIGN = [
    ("acid-outside-the-database",
     r"و اولی: |The first one: ",
     "the first of the four LETTERS the body walks, not a position in a block"),
    ("acid-outside-the-database",
     r"اولین پاسخش این است که مرز را جابه‌جا|its first answer is to move the boundary",
     "the first answer of another entry's argument, not a line of a block"),
    ("acid-outside-the-database",
     r"این یکی از اول هم چیزی جز|this one never held anything but",
     "«از اول» is temporal — from the beginning — not positional"),
    ("acid-outside-the-database",
     r"از همان اول نیست|it was never there",
     "temporal again: isolation was never there, not a claim about a line"),
    ("base", r"از روز اول یک مشخصات فنی نبود|from the first day this acronym was not",
     "temporal: the day the acronym was coined"),
    ("base", r"اولین بار در مقاله‌ای|It first appeared in a paper",
     "temporal: the first publication of the acronym, not a block position"),
    ("base", r"این موضوع از اولش می‌پرسید|this topic was asking from the start",
     "temporal"),
]


# (entry id, regex over the prose, block name, predicate(block_text, block_order))
POSITIONAL = [
    # ------------------------------------------- the code block, ob_code
    ("acid-outside-the-database",
     r"در نسخهٔ اول هر دو عدد پشت یک قفل‌اند|"
     r"In the first version both numbers sit behind one lock", "ob_code",
     lambda t, o: o[0] == "ob_code"
     and re.search(r"func \(j \*Joint\) Write\(.*\) \{\n\tj\.mu\.Lock\(\)", t)
     and "j.orders++" in t and "j.payments++" in t),
    ("acid-outside-the-database",
     r"در نسخهٔ دوم\s*هرکدام قفل خودش را دارد و هیچ قفلی روی جفتشان نیست|"
     r"in the second each has its own lock and\s*there is no lock over the pair", "ob_code",
     lambda t, o: "func (s *Split) Write" in t
     and "mu.Lock()" not in t.split("func (s *Split) Write")[1]
     and t.split("func (s *Split) Write")[1].count(".inc()") == 2),
    # ------------------------------------------- the run block, ob_run
    ("acid-outside-the-database",
     r"همان سه ستون در دو سطرِ اندازه‌گیری|"
     r"Now the same three columns on the two measurement lines",
     "ob_run",
     lambda t, o: o[1] == "ob_run" and len(triples(t)) == 2),
    ("acid-outside-the-database",
     r"ستون «پیش» و ستون «پس» در هر دو یکی‌اند و فقط\s*ستون وسط فرق می‌کند|"
     r"column are the same in both, and only the middle column differs", "ob_run",
     lambda t, o: [x[1] for x in triples(t)] == [triples(t)[0][1]] * 2
     and [x[3] for x in triples(t)] == [triples(t)[0][3]] * 2
     and triples(t)[0][2] != triples(t)[1][2]),
    ("acid-outside-the-database",
     r"در نسخهٔ اول خواندنِ وسط منتظر ماند|In the first version\s*the middle read waited",
     "ob_run",
     lambda t, o: triples(t)[0][0].startswith("one boundary") and triples(t)[0][2] == "[1 1]"),
    ("acid-outside-the-database",
     r"در نسخهٔ دوم منتظر نماند و\s*⟪\[1 0\]⟫ گرفت|"
     r"In the second it did not wait and got\s*⟪\[1 0\]⟫",
     "ob_run",
     lambda t, o: triples(t)[1][0].startswith("two stores") and triples(t)[1][2] == "[1 0]"),
    ("acid-outside-the-database",
     r"و سطر سومِ لاگ چیزی را می‌گوید|And the third log line says the thing", "ob_run",
     lambda t, o: len(logs(t)) == 3 and "nothing failed in either" in logs(t)[2]),
    ("acid-outside-the-database",
     r"خروجی روی <span|The output was taken on Go", "ob_run",
     lambda t, o: o[-1] == "ob_run" and t.splitlines()[0].startswith("$ go test ./outside/")),
]


def check_positional(entries, findings):
    declared = 0
    for e in entries:
        rows = [r for r in POSITIONAL if r[0] == e["id"]]
        order = block_order(e)
        prose = ""
        for lang in ("fa", "en"):
            for field in ("short", "body", "example"):
                prose += norm(e[lang].get(field, "")) + "\n" + "~" * 40 + "\n"
        prose = re.sub(r"[ \t]+", " ", prose)
        covered = []
        for eid, pat, blockname, pred in rows:
            spans = [(m.start(), m.end()) for m in re.finditer(pat, prose)]
            if not spans:
                findings.append(
                    f"{eid}: POSITIONAL declaration {pat[:44]!r} matches nothing in the prose — "
                    f"the claim was edited away and its declaration was not")
                continue
            declared += 1
            covered += spans
            try:
                ok = pred(CAPTURES[blockname], order)
            except Exception as exc:
                ok = False
                findings.append(f"{eid}: POSITIONAL predicate for {pat[:40]!r} raised {exc!r}")
            if not ok:
                findings.append(
                    f"{eid}: POSITIONAL claim {pat[:44]!r} is FALSE of block {blockname}")
        for m in ORD.finditer(prose):
            lo, hi = max(0, m.start() - WINDOW), m.end() + WINDOW
            if not NEAR.search(prose[lo:hi]):
                continue
            if any(a <= m.start() and m.end() <= b for a, b in covered):
                continue
            if any(bid == e["id"] and re.search(bpat, sent_of(prose, m.start()))
                   for bid, bpat, _why in POSITIONAL_BENIGN):
                continue
            findings.append(
                f"{e['id']}: undeclared positional claim {m.group(0)[:40]!r} in "
                f"...{sent_of(prose, m.start())[:150]!r}...")
    return declared


# --------------------------------------------------------- E: count claims
NUMWORD = {"یک": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6,
           "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6}
COUNT = re.compile(
    r"(یک|دو|سه|چهار|پنج|شش)\s+بلوک|(one|two|three|four|five|six)\s+blocks?")
COUNT_EXEMPT = {}


def check_counts(entries, findings):
    seen = 0
    for e in entries:
        npre = sum(len(blocks_of(e["fa"].get(f, ""))) for f in ("body", "example"))
        for lang in ("fa", "en"):
            for field in ("short", "body", "example"):
                html = e[lang].get(field, "")
                prose = re.sub(r"<[^>]+>", " ", prose_of(html))
                for m in COUNT.finditer(prose):
                    seen += 1
                    n = NUMWORD[m.group(1) or m.group(2)]
                    if n == npre:
                        continue
                    if n in COUNT_EXEMPT.get(e["id"], {}):
                        continue
                    findings.append(
                        f"{e['id']}/{lang}/{field}: claims {n} blocks but the entry has {npre}")
    return seen


# ------------------------------------------------------------------- main
def run(entries, verbose=True):
    findings = list(check5.run(entries, verbose=verbose))
    extra = []
    n = check_fidelity(entries, extra)
    check_shape(entries, extra)
    check_go_blocks(extra)
    d = check_positional(entries, extra)
    c = check_counts(entries, extra)
    if verbose:
        print(f"blocks matched byte-for-byte against blocks11/: {n}")
        print(f"positional claims declared and evaluated against their own block: {d}")
        print(f"block-count claims checked against the entry's own <pre> count: {c}")
        print(f"EXTRA FINDINGS: {len(extra)}")
        for f in extra:
            print("  -", f)
    return findings + extra


def load():
    return [e for e in json.load(open(PATH, encoding="utf8")) if e["id"] in NEW]


def get(d, eid):
    return next(e for e in d if e["id"] == eid)


def selftest():
    base = set(run(load(), verbose=False))
    saved = dict(CAPTURES)

    failures = []

    def fail(msg):
        """Record a broken canary instead of aborting on it.

        Aborting on the first failure hides every canary after it — including
        the negative one, whose whole job is to prove the matcher does not flag
        everything. That is how the ACID topic's final wave shipped a self-test
        that exited 1 with two of four canaries never run.
        """
        failures.append(msg)
        print(f"  CANARY FAILURE: {msg}")

    def must_fire(name, mutate, kind):
        globals()["CAPTURES"] = dict(saved)
        d = copy.deepcopy(load())
        if not mutate(d):
            return fail(f"{name}: needle absent — the check is untested")
        new = [f for f in run(d, verbose=False) if f not in base]
        hit = [f for f in new if kind in f]
        globals()["CAPTURES"] = dict(saved)
        if not hit:
            return fail(f"{name}: no NEW {kind!r} finding — no teeth. got {new}")
        print(f"  canary {name}: fired -> {hit[0][:130]}")

    def must_not_fire(name, mutate):
        globals()["CAPTURES"] = dict(saved)
        d = copy.deepcopy(load())
        if not mutate(d):
            return fail(f"{name}: needle absent — the check is untested")
        new = [f for f in run(d, verbose=False) if f not in base]
        globals()["CAPTURES"] = dict(saved)
        if new:
            return fail(f"{name}: flagged a benign edit: {new[0][:170]}")
        print(f"  canary {name}: correctly silent")

    # D1: an undeclared fa ordinal, the shape stage 9 shipped eleven of
    def m_ordinal_fa(d):
        e = get(d, "acid-outside-the-database")
        old = "و سطر سومِ لاگ"
        if old not in e["fa"]["example"]:
            return False
        e["fa"]["example"] = e["fa"]["example"].replace(old, "و سطر آخرِ بلوک", 1)
        return True

    # D2: the same in English
    def m_ordinal_en(d):
        e = get(d, "acid-outside-the-database")
        old = "And the third log line says"
        if old not in e["en"]["example"]:
            return False
        e["en"]["example"] = e["en"]["example"].replace(
            old, "And the last line of the block says", 1)
        return True

    # D3: a declared positional claim made FALSE at the block — the middle
    #     column is the whole argument, so move it and the claim must die
    def m_positional_false(d):
        if "during [1 0]" not in CAPTURES["ob_run"]:
            return False
        globals()["CAPTURES"] = dict(CAPTURES)
        CAPTURES["ob_run"] = CAPTURES["ob_run"].replace("during [1 0]", "during [1 1]", 1)
        return True

    # D4: the SIDE the lock is on — the one thing the code block must not get
    #     backwards, and no reader of the prose alone would catch it
    def m_lock_side(d):
        needle = "func (s *Split) Write(mid chan<- struct{}, seen <-chan struct{}) {\n"
        if needle not in CAPTURES["ob_run"] + CAPTURES["ob_code"]:
            return False
        globals()["CAPTURES"] = dict(CAPTURES)
        CAPTURES["ob_code"] = CAPTURES["ob_code"].replace(
            needle, needle + "\ts.mu.Lock()\n", 1)
        return True

    # E: stage 8's false subhead, in this stage's shape
    def m_blockcount(d):
        e = get(d, "acid-outside-the-database")
        e["fa"]["body"] += "<p><strong>همان چهار بلوک، یک بار دیگر.</strong></p>"
        e["en"]["body"] += "<p><strong>The same four blocks, once more.</strong></p>"
        return True

    # A: a block edited away from its capture
    def m_fidelity(d):
        e = get(d, "acid-outside-the-database")
        if "during [1 0]" not in e["fa"]["example"]:
            return False
        e["fa"]["example"] = e["fa"]["example"].replace("during [1 0]", "during [0 1]", 1)
        return True

    # the Go-block byte shapes: gofmt tabs, and the `ok <pkg> <elapsed>` trailer
    def m_gofmt_spaces(d):
        globals()["CAPTURES"] = dict(CAPTURES)
        CAPTURES["ob_code"] = CAPTURES["ob_code"].replace("\tj.mu.Lock()", "    j.mu.Lock()", 1)
        return "    j.mu.Lock()" in CAPTURES["ob_code"]

    def m_no_trailer(d):
        globals()["CAPTURES"] = dict(CAPTURES)
        CAPTURES["ob_run"] = re.sub(r"\nok  \t.*$", "", CAPTURES["ob_run"])
        return "\nok  \t" not in CAPTURES["ob_run"]

    # a number in `base` whose provenance is not written down
    def m_unsourced_number(d):
        e = get(d, "base")
        e["fa"]["body"] += "<p>و در ۲۰۲۳ این وضع دوباره عوض شد.</p>"
        e["en"]["body"] += "<p>And in 2023 this changed again.</p>"
        return True

    # benign: rewording that touches no position, no count and no number
    def m_benign(d):
        e = get(d, "base")
        old = "و تقریباً همیشه بد نقل می‌شود"
        if old not in e["fa"]["body"]:
            return False
        e["fa"]["body"] = e["fa"]["body"].replace(old, "و تقریباً همیشه غلط نقل می‌شود", 1)
        return True

    print("self-test:")
    must_fire("«سطر آخرِ بلوک» — an undeclared fa ordinal", m_ordinal_fa, "undeclared positional")
    must_fire("\"the last line of the block\" — an undeclared en ordinal", m_ordinal_en,
              "undeclared positional")
    must_fire("the middle column moved under a declared claim", m_positional_false,
              "is FALSE of block")
    must_fire("a lock put on the side of the pair that must not have one", m_lock_side,
              "is FALSE of block")
    must_fire("stage 8's «همان N بلوک» false subhead", m_blockcount, "claims 4 blocks")
    must_fire("a block edited away from its capture", m_fidelity, "is in no blocks11/ capture")
    must_fire("gofmt output re-indented with spaces", m_gofmt_spaces, "never indents with a space")
    must_fire("the `ok <pkg> <elapsed>` trailer removed", m_no_trailer, "not what `go test` prints")
    must_fire("a year in `base` with no provenance row", m_unsourced_number, "not allowlisted")
    must_not_fire("a rewording that touches no position, count or number", m_benign)
    if failures:
        raise SystemExit(
            f"{len(failures)} of 10 canaries failed — every check they cover is "
            f"untested, so a clean FINDINGS count means nothing until they are fixed.")
    print("canaries behaved (10 of 10).\n")


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        selftest()
        CAPTURES = load_captures()
    run(load())
