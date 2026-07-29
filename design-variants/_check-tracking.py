#!/usr/bin/env python3
"""letter-spacing روی خط فارسی اتصال حروف را پاره می‌کند.

دو نکته که نسخه‌های قبلی این بررسی از دستشان دادند:

۱. `letter-spacing` **ارث می‌رسد**. اگر روی یک ظرف بنشیند، همهٔ متن زیردرختش را
   می‌گیرد. پس فقط متن مستقیم را نگاه کردن کافی نیست.
۲. selectorهای صفتی مثل `[dir="ltr"]` — که درست‌ترین راه محدودکردن tracking به
   لاتین است — باید فهمیده شوند، وگرنه بی‌صدا به همه‌چیز تطبیق می‌خورند و
   کد درست را خطا نشان می‌دهند.
"""
import re
import sys
import io
from glob import glob
from html.parser import HTMLParser

PERSIAN = re.compile(r'[؀-ۿ]')
ZERO = re.compile(r'^(0(px|em|rem|%)?|normal|inherit|initial|unset)$', re.I)
VOID = {'br', 'hr', 'img', 'input', 'meta', 'link', 'source',
        'use', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon', 'stop'}
SKIP_TEXT_IN = {'style', 'script', 'title'}


class Tree(HTMLParser):
    """هر گره را با زنجیرهٔ اجدادش نگه می‌دارد: (tag, classes, attrs)."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.texts = []   # (chain, text)

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        d = dict(attrs)
        self.stack.append((tag, d.get('class', '').split(), d))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        text = data.strip()
        if not text or not self.stack:
            return
        if any(t in SKIP_TEXT_IN for t, _, _ in self.stack):
            return
        self.texts.append((list(self.stack), text))


def simple(part):
    """یک بخش ساده را به (tag, classes, attrs) تجزیه کن."""
    attrs = {}
    for a in re.findall(r'\[([^\]]+)\]', part):
        m = re.match(r'\s*([\w-]+)\s*(?:([~^$*|]?=)\s*["\']?([^"\'\]]*)["\']?)?', a)
        if m:
            attrs[m.group(1)] = m.group(3)
    stripped = re.sub(r'\[[^\]]+\]', '', part)
    tag = re.match(r'^([a-z][a-z0-9]*)', stripped, re.I)
    return (tag.group(1).lower() if tag else None,
            re.findall(r'\.([A-Za-z0-9_-]+)', stripped),
            attrs)


def parse_selector(sel):
    sel = re.sub(r'::?[a-z-]+(\([^)]*\))?', '', sel)
    parts = [p for p in re.split(r'[\s>+~]+', sel.strip()) if p]
    if not parts:
        return None
    return simple(parts[-1]), [simple(p) for p in parts[:-1]]


def node_matches(node, target):
    tag, classes, attrs = target
    n_tag, n_classes, n_attrs = node
    if tag and n_tag != tag:
        return False
    if not all(c in n_classes for c in classes):
        return False
    for k, v in attrs.items():
        if k not in n_attrs:
            return False
        if v is not None and v != '' and n_attrs[k] != v:
            return False
    return True


def affected_texts(chain, target, ancestors):
    """letter-spacing ارث می‌رسد: هر گرهی در زنجیره که تطبیق بخورد،
    این متن را تحت تأثیر می‌گذارد."""
    for depth in range(len(chain)):
        if not node_matches(chain[depth], target):
            continue
        above = chain[:depth]
        if all(any(node_matches(n, a) for n in above) for a in ancestors):
            return True
    return False


def check(path):
    src = io.open(path, encoding='utf-8').read()
    body = re.sub(r'<!--[\s\S]*?-->', '', src)
    css = re.sub(r'/\*[\s\S]*?\*/', '',
                 '\n'.join(re.findall(r'<style[\s\S]*?</style>', body)))

    tree = Tree()
    tree.feed(body)

    findings = []
    for m in re.finditer(r'([^{}@]+)\{([^{}]*)\}', css):
        selectors, block = m.group(1).strip(), m.group(2)
        ls = re.search(r'letter-spacing\s*:\s*([^;}!]+)', block)
        if not ls:
            continue
        value = ls.group(1).strip()
        if ZERO.match(value):
            continue
        for sel in selectors.split(','):
            parsed = parse_selector(sel)
            if not parsed:
                continue
            target, ancestors = parsed
            hits = [t for chain, t in tree.texts
                    if affected_texts(chain, target, ancestors)]
            findings.append({
                'selector': sel.strip(),
                'value': value,
                'persian': [t for t in hits if PERSIAN.search(t)][:2],
                'latin': [t for t in hits if not PERSIAN.search(t)][:1],
            })
    return findings


files = sys.argv[1:] or sorted(glob('[1-7]-*.html'))
bad_total = 0
for path in files:
    findings = check(path)
    bad = [f for f in findings if f['persian']]
    bad_total += len(bad)
    print(f"\n{'✗' if bad else '✓'} {path}")
    if not findings:
        print('    هیچ letter-spacing ناصفری نیست')
    for f in findings:
        if f['persian']:
            print(f"    ✗ فارسی!  {f['value']:9} ← {f['selector']}")
            for t in f['persian']:
                print(f'                        «{t[:48]}»')
        else:
            sample = f['latin'][0][:34] if f['latin'] else '(بدون متن)'
            print(f"    ✓ لاتین   {f['value']:9} ← {f['selector']}  [{sample}]")

print(f'\n{len(files)} فایل — {bad_total} مورد letter-spacing روی فارسی')
sys.exit(1 if bad_total else 0)
