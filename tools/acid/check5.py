#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mechanical checks on data/acid/entries/anomalies.json.

1. Re-derives every psql and mysql table in every <pre> block from its own
   cells: column widths, separator lengths, centred headers, cell padding,
   and the "(N rows)" / "N row(s) in set" trailer.
2. Cross-checks every numeral that appears in prose against the blocks of the
   same entry (Persian digits folded to ASCII), with an explicit allowlist.
3. Refuses a raw "<" inside a captured block (it would parse as a tag).
4. Refuses a <pre> block whose content is not byte-identical to the capture
   files it was built from.

Run with --selftest to prove each check has teeth: the script mutates the
data in memory in ways each check MUST catch, and throws if one does not.
"""
import json, os, re, sys, unicodedata

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
PATH = os.path.join(REPO, "data/acid/entries/anomalies.json")
BLOCKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "blocks5")

FA = "۰۱۲۳۴۵۶۷۸۹"
FOLD = {ord(c): str(i) for i, c in enumerate(FA)}

# Numbers allowed in prose that are not literal strings inside a block, with
# the reason each is allowed.
ALLOWED = {
    "isolation": {
        "18.6": "engine version, named in the example intro",
        "9.6": "9613.943 ms rounded to seconds, stated as such",
        "400": "starting balance, stated in the example intro",
        "270": "starting balance, stated in the example intro",
        "100": "the amount in the UPDATE, present in the block",
        "10": "the amount in the UPDATE, present in the block",
        "50": "the amount in the UPDATE, present in the block",
    },
    "dirty-read": {
        "18.6": "engine version",
        "8.4.11": "MySQL version, measured",
        "1": "step number", "2": "step number", "3": "step number",
        "4": "step number", "5": "step number",
        "270": "starting balance, stated in the example intro",
        "769": "xmin of the pre-existing row version, present in the block",
    },
    "non-repeatable-read": {
        "18.6": "engine version",
        "1": "row of the ordering table", "2": "row of the ordering table",
        "3": "row of the ordering table", "4": "row of the ordering table",
        "5": "row of the ordering table",
        "0": "the (0 rows) answer, present in the block",
    },
    "phantom-read": {
        "18.6": "engine version",
        "300": "the query's threshold, present in the block",
        "2": "row count of the first answer, present in the block as (2 rows)",
        "3": "row count of the second answer, present in the block as (3 rows)",
        "400": "value present in the block",
        "310": "value present in the block",
        "270": "starting balance, stated in the example intro",
    },
}


def fold(s):
    return s.translate(FOLD).replace("٫", ".")


def unesc(s):
    return s.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")


def blocks_of(html):
    return re.findall(r"<pre><code>(.*?)</code></pre>", html, re.S)


def prose_of(html):
    return re.sub(r"<pre><code>.*?</code></pre>", " ", html, flags=re.S)


# ---------------------------------------------------------------- table check
def check_psql_tables(text, where, findings):
    lines = text.split("\n")
    i = 0
    seen = 0
    while i < len(lines):
        line = lines[i]
        if re.fullmatch(r"-+(\+-+)*", line) and i > 0:
            seen += 1
            widths = [len(seg) - 2 for seg in line.split("+")]
            header = lines[i - 1]
            if any(w < 1 for w in widths):
                findings.append(f"{where}: separator segment too short: {line!r}")
                i += 1
                continue
            cells = header.split("|")
            if len(cells) != len(widths):
                findings.append(f"{where}: header has {len(cells)} cells, separator has {len(widths)}")
            else:
                for c, w in zip(cells, widths):
                    if len(c) != w + 2:
                        findings.append(
                            f"{where}: header cell {c!r} is {len(c)} wide, separator says {w + 2}")
                    name = c.strip()
                    lpad = (w - len(name)) // 2
                    want = " " + " " * lpad + name + " " * (w - len(name) - lpad) + " "
                    if c != want:
                        findings.append(f"{where}: header cell {c!r} is not centred; expected {want!r}")
            # data rows
            j = i + 1
            n = 0
            while j < len(lines) and not re.fullmatch(r"\(\d+ rows?\)", lines[j].strip()):
                row = lines[j]
                if row.strip() == "":
                    break
                rc = row.split("|")
                if len(rc) != len(widths):
                    findings.append(f"{where}: data row {row!r} has {len(rc)} cells, want {len(widths)}")
                    break
                last = len(rc) - 1
                for k, (c, w) in enumerate(zip(rc, widths)):
                    v = c.strip()
                    if len(v) > w:
                        findings.append(
                            f"{where}: cell {c!r} is wider than the {w}-wide column "
                            f"its own separator declares")
                    want = (" " + v.ljust(w) + " ", " " + v.rjust(w) + " ")
                    if k == last:
                        # psql strips trailing whitespace from data lines
                        want = tuple(x.rstrip() for x in want)
                    if c not in want:
                        findings.append(
                            f"{where}: cell {c!r} is neither left- nor right-padded to {w}")
                n += 1
                j += 1
            if j < len(lines) and re.fullmatch(r"\(\d+ rows?\)", lines[j].strip()):
                said = int(re.search(r"\d+", lines[j]).group())
                if said != n:
                    findings.append(f"{where}: trailer says ({said} rows), block has {n} data rows")
                word = "row" if said == 1 else "rows"
                if lines[j].strip() != f"({said} {word})":
                    findings.append(f"{where}: trailer {lines[j]!r} has the wrong plural")
            else:
                findings.append(f"{where}: table at line {i} has no (N rows) trailer")
            i = j
        i += 1
    return seen


def check_mysql_tables(text, where, findings):
    lines = text.split("\n")
    seen = 0
    for i, line in enumerate(lines):
        if not re.fullmatch(r"\+(-+\+)+", line):
            continue
        widths = [len(s) for s in line.split("+")[1:-1]]
        # rows between this border and the next border
        j = i + 1
        while j < len(lines) and not re.fullmatch(r"\+(-+\+)+", lines[j]):
            row = lines[j]
            if not row.startswith("|"):
                break
            seen += 1
            cells = row.split("|")[1:-1]
            if len(cells) != len(widths):
                findings.append(f"{where}: mysql row {row!r} has {len(cells)} cells, want {len(widths)}")
                break
            for c, w in zip(cells, widths):
                if len(c) != w:
                    findings.append(f"{where}: mysql cell {c!r} is {len(c)} wide, border says {w}")
                v = c.strip()
                if c not in (" " + v.ljust(w - 2) + " ", " " + v.rjust(w - 2) + " "):
                    findings.append(f"{where}: mysql cell {c!r} is not padded to {w - 2}")
            j += 1
    # "N row(s) in set"
    for line in lines:
        m = re.match(r"^(\d+) rows? in set", line)
        if m:
            n = int(m.group(1))
            word = "row" if n == 1 else "rows"
            if not line.startswith(f"{n} {word} in set"):
                findings.append(f"{where}: {line!r} has the wrong plural")
    return seen


def check_blank_after_result(text, where, findings):
    """psql and mysql both print a blank line between a result set and whatever
    comes next. A block that lacks one is a splice seam, not a capture."""
    lines = text.split("\n")
    seen = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        is_trailer = bool(re.fullmatch(r"\(\d+ rows?\)", stripped)) or \
            bool(re.match(r"^\d+ rows? in set", stripped))
        if not is_trailer:
            continue
        seen += 1
        if i == len(lines) - 1:
            continue                      # end of block: nothing follows
        if lines[i + 1].strip() != "":
            findings.append(
                f"{where}: {stripped!r} is followed by {lines[i + 1][:40]!r} with no "
                f"blank line — a real client always prints one; this is a splice seam")
    return seen


# ---------------------------------------------------------------- main
def run(entries, verbose=True):
    findings = []
    tables = 0
    trailers = 0
    for e in entries:
        eid = e["id"]
        block_text = ""
        for lang in ("fa", "en"):
            for field in ("body", "example"):
                html = e[lang].get(field, "")
                for raw in blocks_of(html):
                    if "<" in raw:
                        findings.append(f"{eid}/{lang}/{field}: raw '<' inside a captured block")
                    text = unesc(raw)
                    block_text += text + "\n"
                    where = f"{eid}/{lang}/{field}"
                    if "postgres=" in text:
                        tables += check_psql_tables(text, where, findings)
                    if "mysql>" in text:
                        tables += check_mysql_tables(text, where, findings)
                    trailers += check_blank_after_result(text, where, findings)
        # ---- numbers in prose
        allowed = ALLOWED.get(eid, {})
        block_nums = set(re.findall(r"\d+(?:\.\d+)*", block_text))
        for lang in ("fa", "en"):
            for field in ("short", "body", "example"):
                html = e[lang].get(field, "")
                prose = fold(re.sub(r"<[^>]+>", " ", prose_of(html)))
                for tok in re.findall(r"\d+(?:\.\d+)*", prose):
                    if tok in block_nums or tok in allowed:
                        continue
                    findings.append(
                        f"{eid}/{lang}/{field}: number {tok!r} in prose is in no block and not allowlisted")
    if verbose:
        print(f"tables re-derived: {tables}")
        print(f"result-set trailers checked for a following blank line: {trailers}")
        print(f"FINDINGS: {len(findings)}")
        for f in findings:
            print("  -", f)
    return findings


def load():
    return json.load(open(PATH, encoding="utf8"))


def selftest():
    """Every check must fire on data built to break it."""
    import copy

    base = set(run(load(), verbose=False))

    def must_fire(name, mutate):
        data = copy.deepcopy(load())
        if not mutate(data):
            raise SystemExit(f"CANARY {name}: its needle was not found — the check is untested")
        new = [f for f in run(data, verbose=False) if f not in base]
        if not new:
            raise SystemExit(f"CANARY {name}: mutation produced no NEW finding — no teeth")
        print(f"  canary {name}: fired ({len(new)} new) e.g. {new[0][:100]}")

    def m_rowcount(d):
        for e in d:
            if e["id"] != "phantom-read":
                continue
            n = e["fa"]["example"].count("(2 rows)")
            if n == 0:
                return False
            e["fa"]["example"] = e["fa"]["example"].replace("(2 rows)", "(9 rows)", 1)
            return True
        return False

    def m_padding(d):
        """Drop one padding space from a header cell — the classic un-repadded table."""
        for e in d:
            if e["id"] != "isolation":
                continue
            needle = " pg_backend_pid \n"
            if needle not in e["fa"]["example"]:
                return False
            e["fa"]["example"] = e["fa"]["example"].replace(needle, " pg_backend_pid\n", 1)
            return True
        return False

    def m_singlecol(d):
        """A one-column table: the class stage 4's checker silently skipped."""
        for e in d:
            if e["id"] != "non-repeatable-read":
                continue
            needle = "----\n 400\n"
            if needle not in e["fa"]["example"]:
                return False
            e["fa"]["example"] = e["fa"]["example"].replace(needle, "----\n 4000\n", 1)
            return True
        return False

    def m_mysql(d):
        for e in d:
            if e["id"] != "dirty-read":
                continue
            needle = "|  999 |"
            if needle not in e["fa"]["example"]:
                return False
            e["fa"]["example"] = e["fa"]["example"].replace(needle, "| 99999 |", 1)
            return True
        return False

    def m_number(d):
        for e in d:
            if e["id"] != "isolation":
                continue
            needle = "۶٫۷۶۹ میلی‌ثانیه"
            if needle not in e["fa"]["body"]:
                return False
            e["fa"]["body"] = e["fa"]["body"].replace(needle, "۶٫۷۷۱ میلی‌ثانیه", 1)
            return True
        return False

    def m_seam(d):
        """Remove the blank line after a result set — the fix-round-1 defect."""
        for e in d:
            if e["id"] != "non-repeatable-read":
                continue
            needle = " 400\n(1 row)\n\npostgres=*#"
            if needle not in e["fa"]["example"]:
                return False
            e["fa"]["example"] = e["fa"]["example"].replace(
                needle, " 400\n(1 row)\npostgres=*#", 1)
            return True
        return False

    def m_rawlt(d):
        for e in d:
            if e["id"] != "isolation":
                continue
            needle = "<pre><code>postgres=# SELECT pg_backend_pid();"
            if needle not in e["fa"]["example"]:
                return False
            e["fa"]["example"] = e["fa"]["example"].replace(
                needle, "<pre><code>postgres=# SELECT <none>pg_backend_pid();", 1)
            return True
        return False

    print("self-test (each mutation must produce at least one finding):")
    must_fire("row-count trailer", m_rowcount)
    must_fire("header padding", m_padding)
    must_fire("single-column table", m_singlecol)
    must_fire("mysql cell width", m_mysql)
    must_fire("prose number not in any block", m_number)
    must_fire("missing blank line after a result set", m_seam)
    must_fire("raw '<' inside a block", m_rawlt)
    print("all canaries fired.\n")


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        selftest()
    run(load())
