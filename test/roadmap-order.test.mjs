import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { roadmapEntryIds } from '../assets/js/roadmap.js';

function readJson(path) {
  return JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
}

// جفت‌هایی که به هم ارجاع می‌دهند. هیچ ترتیب خطی‌ای راضی‌شان نمی‌کند، پس
// صریحاً استثنا می‌شوند — با دلیل، نه فقط با شناسه. به‌ازای موضوع، چون
// استثنای یک موضوع نباید گارد موضوع دیگر را سوراخ کند.
const MUTUAL = {
  crypto: [
    // تراکنش و بلاک هرکدام به دیگری ارجاع می‌دهند. پرینستون (فصل ۳) و
    // استنفورد (جلسه‌ی ۲) هر دو تراکنش را اول می‌آورند؛ ما هم.
    ['transaction', 'block'],
  ],
};

// ارجاع‌هایی که تزئینی‌اند، نه پیش‌نیاز. هرکدام با دلیلش.
const DECORATIVE = {
  crypto: [
    // «بایت» فقط یک هشِ ۳۲ بایتی را به عنوان نمونه‌ی بایت نشان می‌دهد.
    ['byte', 'hash'],
    // «درخت مرکل» در حاشیه‌ی آخرش به extraNonce اشاره می‌کند؛ خود درخت
    // هیچ چیزی از نانس لازم ندارد.
    ['merkle-tree', 'nonce'],
  ],
};

function exemptionsOf(topicId) {
  return { mutual: MUTUAL[topicId] ?? [], decorative: DECORATIVE[topicId] ?? [] };
}

/**
 * پیش‌نیازها را از خودِ متن بیرون می‌کشد: هر «مدخل ‹عنوان›» یعنی این
 * مدخل به آن یکی تکیه کرده. عنوان‌های بلندتر اول بررسی می‌شوند تا
 * «مدل حساب» بر «حساب» بچربد. بعد از «مدخل» تا پنج واژه‌ی جداشده با
 * فاصله برداشته می‌شود، نه دو تا: بلندترین عنوانِ برنامه‌ریزی‌شده چهار
 * واژه‌ای است و یک واژه حاشیه‌ی امن عمداً نگه داشته شده — پنجره‌ای
 * تنگ‌تر عنوان‌های بلندتر را کلاً نامرئی می‌کرد، و بدتر، وقتی عنوانی
 * کوتاه‌تر پیشوندِ عنوانی بلندتر بود ارجاع را بی‌صدا به مدخل غلط می‌چسباند.
 * خودِ واژه‌ی «مدخل» از میان آن پنج واژه ممنوع است: بدون این استثنا،
 * وقتی یک جمله دو ارجاع پشت‌سرهم می‌آورد («... مدخل الف و مدخل ب ...»)
 * تسخیرِ حریصانه‌ی پنجره‌ی اول، نشانه‌ی «مدخل» دومی را می‌بلعد و آن
 * ارجاع اصلاً دیده نمی‌شود. با این ممنوعیت، گرفتن واژه‌ها درست جلوی
 * نشانه‌ی بعدی متوقف می‌شود، `lastIndex` روی همان نشانه می‌ایستد، و
 * دور بعدی matchAll آن را عادی پیدا می‌کند.
 * پیش از اسکن، تگ‌های HTML با یک فاصله جایگزین می‌شوند (نه با رشته‌ی
 * خالی): سبک نگارشیِ خودِ پروژه واژه‌ی لاتین را داخل
 * <span dir="ltr"> می‌گذارد، و شش تا از عنوان‌های موضوع تازه — REST،
 * gRPC، CQRS، «مدل C4»، «دروازهٔ API»، «قضیهٔ CAP» — بخش لاتین دارند.
 * بدون این جایگزینی هر ارجاع به این شش، چون به‌جای حرف با «<» شروع
 * می‌شود، اصلاً دیده نمی‌شد؛ و جایگزینی با فاصله لازم است چون
 * خالی‌گذاشتن می‌توانست دو واژه‌ی دوطرفِ یک تگ (مثل «الف<br>مدخل ب»)
 * را در هم بچسباند و یک نشانه‌ی قلابی بسازد. نکتهٔ غیربدیهی این است که
 * قرارداد پروژه («مدخل ‹عنوان›»، اما تگ فقط دور بخش لاتین، نه دور کل
 * عنوان — نمونه‌اش «مدخل مدل <span dir="ltr">C4</span>») تگ را وسط
 * عنوانِ ترکیبی می‌گذارد، نه دورش. یعنی جایگزینیِ صرف یک فاصلهٔ اضافه
 * کنار فاصلهٔ خودِ عنوان می‌گذارد و دو فاصله می‌سازد؛ عنوانِ ذخیره‌شده
 * فقط یک فاصله دارد، پس startsWith شکست می‌خورد. به همین دلیل فاصله‌ها
 * بعد از حذف تگ جمع می‌شوند — این جمع‌کردن است که عنوان‌های ترکیبیِ
 * لاتین‌دار را کار می‌اندازد، نه فقط زیبایی؛ حذفش به‌عنوان «تمیزکاریِ
 * زائد» همان باگ را برمی‌گرداند.
 */
function citationsOf(entry, titleToId) {
  const titles = [...titleToId.keys()].sort((a, b) => b.length - a.length);
  const text = ((entry.fa?.body ?? '') + (entry.fa?.example ?? ''))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  const found = new Set();
  for (const match of text.matchAll(/مدخل\s+((?!مدخل)[^\s،.<]+(?:\s+(?!مدخل)[^\s،.<]+){0,4})/g)) {
    const hit = titles.find((title) => match[1].startsWith(title));
    const id = hit ? titleToId.get(hit) : null;
    if (id && id !== entry.id) found.add(id);
  }
  return found;
}

for (const topic of readJson('data/topics.json')) {
  const TOPIC = topic.id;
  const roadmap = readJson(`data/${TOPIC}/roadmap.json`);
  const categories = readJson(`data/${TOPIC}/categories.json`);
  const entries = categories.flatMap((category) => readJson(`data/${TOPIC}/entries/${category.file}`));

  const { mutual, decorative } = exemptionsOf(TOPIC);
  const isExempt = (from, to) =>
    decorative.some(([a, b]) => a === from && b === to) ||
    mutual.some(([a, b]) => (a === from && b === to) || (b === from && a === to));

  const titleToId = new Map(entries.map((entry) => [entry.fa.title, entry.id]));
  const order = roadmapEntryIds(roadmap);
  const position = new Map(order.map((id, index) => [id, index]));

  test(`[${TOPIC}] نقشه هر مدخل موضوع را دقیقاً یک بار دارد`, () => {
    assert.equal(order.length, new Set(order).size, 'شناسه‌ی تکراری در نقشه');
    const missing = entries.map((entry) => entry.id).filter((id) => !position.has(id));
    assert.deepEqual(missing, [], `این مدخل‌ها در هیچ مرحله‌ای نیستند: ${missing.join(', ')}`);
  });

  test(`[${TOPIC}] هیچ مدخلی پیش از چیزی که به آن تکیه دارد نمی‌آید`, () => {
    const violations = [];
    for (const entry of entries) {
      for (const needed of citationsOf(entry, titleToId)) {
        if (isExempt(entry.id, needed)) continue;
        if (position.get(needed) > position.get(entry.id)) {
          violations.push(
            `${entry.id} (قدم ${position.get(entry.id) + 1}) به ${needed} (قدم ${position.get(needed) + 1}) تکیه دارد`,
          );
        }
      }
    }
    assert.deepEqual(violations, [], `\n  ${violations.join('\n  ')}\n`);
  });

  test(`[${TOPIC}] فهرست استثناها کهنه نشده`, () => {
    // اگر ارجاعی حذف شد، استثنایش هم باید برود؛ وگرنه استثناها بی‌صدا
    // انباشته می‌شوند و گارد را سوراخ می‌کنند.
    const byId = new Map(entries.map((entry) => [entry.id, entry]));
    for (const [from, to] of [...decorative, ...mutual]) {
      const entry = byId.get(from);
      assert.ok(entry, `استثنا برای مدخل ناموجود ${from}`);
      assert.ok(
        citationsOf(entry, titleToId).has(to),
        `${from} دیگر به ${to} ارجاع نمی‌دهد — این استثنا را بردار`,
      );
    }
  });
}
