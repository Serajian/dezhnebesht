// منطق محضِ ریل و گروه‌های تاشوی نمای فهرست — بدون DOM، بدون
// localStorage، پس در Node هم import می‌شود و با تست پوشش داده می‌شود.
// render.js/app.js با DOM کار می‌کنند و در Node قابل اجرا نیستند؛ دقیقاً
// همان دلیلی که این تصمیم‌ها را از آن‌ها جدا نگه می‌دارد.

/**
 * شناسه‌ی پایدار هر گروهِ تاشوشدنی، هم برای attribute id روی <details>
 * و هم برای کلید ذخیره‌سازی ترجیح خواننده. از موضوع+دسته ساخته می‌شود،
 * نه فقط دسته: طبق CLAUDE.md دو موضوع می‌توانند هر دو دسته‌ای هم‌نام
 * (مثلاً «مفاهیم پایه») داشته باشند و شناسه‌ی تک‌فیلدی آن‌ها را قاطی می‌کرد.
 */
export function groupId(topicId, categoryId) {
  return `idx-cat-${topicId}-${categoryId}`;
}

/**
 * ترجیح باز/بستهٔ ذخیره‌شده را از رشته‌ی JSON می‌خواند. ورودی خالی یا
 * نامعتبر یعنی «هیچ ترجیحی ذخیره نشده» — شیء خالی برمی‌گرداند، نه پرتاب
 * استثنا؛ طبق روحیهٔ تاب‌آوری CLAUDE.md (داده‌ی خراب نباید صفحه را بشکند).
 */
export function parseGroupState(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** پیش‌فرض یک گروه که هنوز ترجیحی برایش ذخیره نشده: باز. */
export function isGroupOpen(storedState, id) {
  return Object.prototype.hasOwnProperty.call(storedState, id) ? Boolean(storedState[id]) : true;
}

/**
 * تصمیم نهایی برای یک گروه: وقتی فیلتری (جستجو یا هشتگ) فعال است، هر
 * گروهی که اصلاً رندر می‌شود — یعنی حداقل یک ردیفِ تطبیق‌یافته دارد،
 * وگرنه از ابتدا رندر نمی‌شود — باید باز باشد، صرف‌نظر از ترجیح
 * ذخیره‌شده. این دقیقاً همان قاعده‌ای است که جلوی بلعیده‌شدنِ یک نتیجه‌ی
 * جستجو توسط یک گروهِ بسته را می‌گیرد. با پاک‌شدن فیلتر، دقیقاً همان
 * ترجیحِ قبلی خواننده برمی‌گردد — نه «همه باز»، همان چیزی که بود.
 */
export function resolveGroupOpen(id, { filtered, storedState }) {
  return filtered ? true : isGroupOpen(storedState, id);
}

/**
 * موضوع فعالِ ریل: همان موضوعِ مسیر، اگر معتبر باشد؛ وگرنه اولین موضوع
 * — نه یک ریلِ خالی. مسیر خالی (صفحه‌ی اصلی) یا شناسه‌ی ناشناخته (مسیر
 * کهنه/داده‌ی خراب) هر دو باید به یک موضوعِ واقعی برسند، چون ریل همیشه
 * دقیقاً یک موضوع را «فعال» نشان می‌دهد؛ نبودِ رِیل یا موضوعِ فعال یعنی
 * ناوبری اصلی سایت از کار افتاده.
 */
export function resolveActiveTopicId(topics, routeTopicId) {
  if (routeTopicId && topics.some((topic) => topic.id === routeTopicId)) return routeTopicId;
  return topics[0]?.id ?? '';
}
