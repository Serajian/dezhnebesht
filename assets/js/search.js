// این‌ها عمداً با کد نوشته شده‌اند، نه با خود کاراکتر: یای عربی و یای
// فارسی روی صفحه دقیقاً یک‌شکل‌اند و نیم‌فاصله اصلاً دیده نمی‌شود.
const ARABIC_YEH  = /\u064A/g;   // ی عربی
const PERSIAN_YEH = '\u06CC';    // ی فارسی
const ARABIC_KAF  = /\u0643/g;   // ک عربی
const PERSIAN_KAF = '\u06A9';    // ک فارسی
const DIACRITICS  = /[\u064B-\u0652]/g; // اعراب
const ZWNJ        = /\u200C/g;   // نیم‌فاصله

/**
 * یکسان‌سازی متن برای مقایسه. فارسی روی صفحه‌کلیدهای مختلف با
 * کدهای متفاوتی تایپ می‌شود؛ بدون این تابع «کیف» تایپ‌شده با
 * صفحه‌کلید عربی هرگز «کیف» فارسی را پیدا نمی‌کند.
 */
export function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(ARABIC_YEH, PERSIAN_YEH)
    .replace(ARABIC_KAF, PERSIAN_KAF)
    .replace(DIACRITICS, '')
    .replace(ZWNJ, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function haystack(entry) {
  const parts = [entry.id, ...(entry.tags ?? [])];
  for (const lang of ['fa', 'en']) {
    const block = entry[lang];
    if (block) parts.push(block.title, block.short);
  }
  return normalize(parts.filter(Boolean).join(' '));
}

/**
 * فیلتر مدخل‌ها بر اساس عبارت جستجو و هشتگ. هر دو زبان هم‌زمان
 * جستجو می‌شوند تا زبان جاری روی نتیجه اثر نگذارد.
 */
export function filterEntries(entries, { query = '', tag = '' } = {}) {
  const needle = normalize(query);
  const wantedTag = normalize(tag);

  return entries.filter((entry) => {
    if (wantedTag) {
      const tags = (entry.tags ?? []).map(normalize);
      if (!tags.includes(wantedTag)) return false;
    }
    if (!needle) return true;
    return haystack(entry).includes(needle);
  });
}
