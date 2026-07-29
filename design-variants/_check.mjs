// بررسی قیدهای سخت روی هر نسخهٔ طراحی. مستقل از گزارش طراح.
import { readFileSync, readdirSync } from 'node:fs';

const files = readdirSync(new URL('.', import.meta.url))
  .filter((f) => /^[1-7]-.*\.html$/.test(f))
  .sort();

const PHYSICAL = /(?<![-\w])(?:left|right)\s*:|(?:margin|padding|border)-(?:left|right)\s*[:-]/gi;
const REMOTE = /(?:src|href|url)\s*[=(]\s*['"]?(?:https?:)?\/\//gi;

const need = {
  'نمای فهرست (مفاهیم پایه)': /مفاهیم\s*پایه/,
  'نمای مدخل (بلاکچین)': /بلاکچین/,
  'دستهٔ اجماع': /اجماع/,
  'دیاگرام SVG': /<svg/i,
  'اصطلاح dir=ltr': /dir\s*=\s*["']ltr["']/i,
  'حلقهٔ فوکوس': /:focus-visible/,
  'کاهش حرکت': /prefers-reduced-motion/,
  'RTL روی html': /<html[^>]+dir\s*=\s*["']rtl["']/i,
  'یادداشت طراحی': /DESIGN NOTES/i,
};

// letter-spacing روی خط فارسی اتصال‌ها را پاره می‌کند. صفر و normal بی‌ضررند؛
// مقدار ناصفر فقط روی متن لاتین/مونو مجاز است، پس selectorش را نشان بده.
function trackingIssues(css) {
  const out = [];
  const re = /letter-spacing\s*:\s*([^;}!]+)/gi;
  let m;
  while ((m = re.exec(css)) !== null) {
    const value = m[1].trim();
    if (/^(0(px|em|rem|%)?|normal|inherit|initial|unset)$/i.test(value)) continue;
    // آخرین selector قبل از این اعلان را پیدا کن
    const before = css.slice(0, m.index);
    const brace = before.lastIndexOf('{');
    const prevEnd = Math.max(before.lastIndexOf('}'), before.lastIndexOf(';', brace));
    const selector = before.slice(prevEnd + 1, brace).replace(/\s+/g, ' ').trim().slice(-70);
    out.push({ value, selector });
  }
  return out;
}

const rows = [];
for (const file of files) {
  const src = readFileSync(new URL(file, import.meta.url), 'utf8');
  const noComments = src.replace(/<!--[\s\S]*?-->/g, '');
  const css = (noComments.match(/<style[\s\S]*?<\/style>/gi) ?? []).join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  const problems = [];

  const remote = [...noComments.matchAll(REMOTE)].filter((x) => !x[0].includes('w3.org'));
  if (remote.length) problems.push(`منبع بیرونی ×${remote.length}`);
  if (/@font-face/i.test(css)) problems.push('@font-face دارد');

  const phys = [...css.matchAll(PHYSICAL)];
  if (phys.length) {
    const kinds = [...new Set(phys.map((x) => x[0].trim()))].slice(0, 4).join(', ');
    problems.push(`ویژگی فیزیکی ×${phys.length} → ${kinds}`);
  }

  const missing = Object.entries(need).filter(([, re]) => !re.test(src)).map(([k]) => k);
  if (missing.length) problems.push(`جاافتاده: ${missing.join('، ')}`);

  rows.push({ file, kb: Math.round(src.length / 1024) + 'k', problems, tracking: trackingIssues(css) });
}

for (const r of rows) {
  const ok = r.problems.length === 0;
  console.log(`\n${ok ? '✓' : '✗'} ${r.file}  (${r.kb})`);
  for (const p of r.problems) console.log(`    ✗ ${p}`);
  if (r.tracking.length) {
    console.log(`    ⓘ letter-spacing ناصفر ×${r.tracking.length} — روی لاتین مجاز، روی فارسی نه:`);
    for (const t of r.tracking) console.log(`        ${t.value.padEnd(9)} ← ${t.selector}`);
  }
}

const bad = rows.filter((r) => r.problems.length).length;
console.log(`\n${rows.length} نسخه — ${rows.length - bad} بی‌ایراد، ${bad} نیازمند رفع`);
