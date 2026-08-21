import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// رِیل زیر ۱۰۲۴px پنهان است، و مدتی تنها جایی بود که نام موضوع را نشان
// می‌داد — چون renderTopical عمداً سرتیتر موضوع نمی‌ساخت و آن مسئولیت را
// به رِیل سپرده بود. نتیجه این شد که روی موبایل هیچ‌جا معلوم نبود کدام
// دسته به کدام موضوع تعلق دارد: نُه دسته پشت‌سرهم، بدون هیچ نشانی.
//
// این آزمون همان واگذاری را قفل می‌کند: هر عرضی که رِیل در آن نیست باید
// حاملِ دیگری برای هویت موضوع داشته باشد. اگر کسی روزی سرتیتر درون‌فهرست
// را بردارد یا نقطه‌ی شکست را جابه‌جا کند، اینجا قرمز می‌شود.

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

const css = read('assets/css/style.css');
const render = read('assets/js/render.js');

/** نقطه‌ی شکستی که رِیل در آن ظاهر می‌شود، از خودِ CSS خوانده می‌شود. */
function railBreakpoint() {
  const blocks = [...css.matchAll(/@media \(min-width: (\d+)px\)\s*\{([\s\S]*?)\n\}/g)];
  const showsRail = blocks.find(([, , body]) => /\.rail\s*\{[^}]*display:\s*block/.test(body));
  assert.ok(showsRail, 'هیچ media query ای رِیل را نشان نمی‌دهد — این آزمون کهنه شده');
  return Number(showsRail[1]);
}

test('رِیل فقط از یک نقطه‌ی شکست به بالا وجود دارد', () => {
  assert.match(css, /\.rail \{ display: none; \}/, 'رِیل باید در پایه پنهان باشد');
  assert.ok(railBreakpoint() > 0);
});

// هویت یک چیز است و ناوبری چیز دیگری. سرتیتر می‌گوید «اینجا کجاست»؛
// این آزمون می‌گوید باید راهی هم برای «جای دیگر رفتن» باشد. مسیر
// #/topic/<id> از breadcrumb هر مدخل قابل رسیدن است، پس خواننده‌ی موبایل
// می‌تواند در حالت فیلترشده بیفتد — و تنها لینک‌های موضوع داخل رِیل بودند،
// که آنجا وجود ندارد. یعنی بن‌بست: یک موضوع را می‌بینی و راه برگشت نداری.
test('کنترل ناوبری موضوع بیرون از رِیل هم وجود دارد', () => {
  assert.match(
    render,
    /class: 'topic-bar'/,
    'ناوبری موضوع نباید فقط داخل رِیل باشد؛ زیر نقطه‌ی شکست رِیل وجود ندارد',
  );
  const bar = render.match(/function topicBar\([\s\S]*?\n\}/);
  assert.ok(bar, 'topicBar پیدا نشد');
  // خودِ ثابت را می‌سنجیم، نه شکل نوشتنش: یک مقصد برای «همه» و یک مقصد
  // به‌ازای هر موضوع. اینکه مسیر به‌صورت پارامتر برود یا مستقیم در
  // attribute نوشته شود، به این ادعا ربطی ندارد.
  assert.match(bar[0], /'#\/'/, 'باید راهی برای برداشتن فیلتر موضوع باشد');
  assert.match(bar[0], /#\/topic\/\$\{/, 'باید به هر موضوع لینک بدهد');
});

test('کنترل موضوع دقیقاً جایی دیده می‌شود که رِیل نیست', () => {
  const bp = railBreakpoint();
  assert.doesNotMatch(
    css,
    /^\.topic-bar \{[^}]*display:\s*none/m,
    'کنترل موضوع نباید در پایه پنهان باشد',
  );
  const blocks = [
    ...css.matchAll(new RegExp(`@media \\(min-width: ${bp}px\\)\\s*\\{([\\s\\S]*?)\\n\\}`, 'g')),
  ];
  const hider = blocks.find(([, body]) => /\.topic-bar \{[^}]*display:\s*none/.test(body));
  assert.ok(hider, `از ${bp}px به بالا رِیل کار ناوبری را می‌کند، پس نوار باید کنار برود`);
  const base = css.search(/^\.topic-bar \{/m);
  assert.ok(css.indexOf(hider[0]) > base, 'قاعده‌ی پنهان‌سازی باید بعد از قاعده‌ی پایه بیاید');
});

test('فهرست خودش سرتیتر موضوع می‌سازد، نه فقط رِیل', () => {
  assert.match(
    render,
    /class: 'topic-head'/,
    'renderTopical باید سرتیتر موضوع بسازد؛ وگرنه زیر نقطه‌ی شکست هیچ‌چیز نام موضوع را نشان نمی‌دهد',
  );
});

test('سرتیتر موضوع دقیقاً جایی دیده می‌شود که رِیل نیست', () => {
  const bp = railBreakpoint();

  // در پایه دیده می‌شود
  assert.doesNotMatch(
    css,
    /^\.topic-head \{[^}]*display:\s*none/m,
    'سرتیتر موضوع نباید در پایه پنهان باشد — همان‌جاست که رِیل وجود ندارد',
  );

  // و از همان نقطه‌ی شکست به بالا کنار می‌رود، چون رِیل کارش را می‌کند.
  // هر بلوکی با آن نقطه‌ی شکست را می‌گردیم، نه فقط اولی — قاعده‌ی پنهان‌سازی
  // باید بعد از قاعده‌ی پایه بیاید و ممکن است در بلوک دیگری باشد.
  const blocks = [
    ...css.matchAll(new RegExp(`@media \\(min-width: ${bp}px\\)\\s*\\{([\\s\\S]*?)\\n\\}`, 'g')),
  ];
  const hider = blocks.find(([, body]) => /\.topic-head \{[^}]*display:\s*none/.test(body));
  assert.ok(
    hider,
    `از ${bp}px به بالا رِیل هویت موضوع را نشان می‌دهد، پس سرتیتر درون‌فهرست باید کنار برود`,
  );

  // و مهم‌تر از وجودش: ترتیب. هر دو قاعده هم‌ویژگی‌اند، پس آن که دیرتر
  // می‌آید می‌برد. اگر پنهان‌سازی بالاتر از قاعده‌ی پایه بنشیند، بی‌اثر
  // است و سرتیتر روی دسکتاپ هم دیده می‌شود — دقیقاً همان اشتباهی که
  // بار اول رخ داد و فقط در مرورگر دیده شد، نه در این فایل.
  const base = css.search(/^\.topic-head \{/m);
  assert.ok(base >= 0, 'قاعده‌ی پایه‌ی .topic-head پیدا نشد');
  assert.ok(
    css.indexOf(hider[0]) > base,
    'قاعده‌ی پنهان‌سازی باید بعد از قاعده‌ی پایه بیاید، وگرنه ترتیب منبع خنثایش می‌کند',
  );
});
