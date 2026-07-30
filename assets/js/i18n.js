const STORAGE_KEY = 'glossary:lang';
const DEFAULT_LANG = 'fa';

export const LANGS = ['fa', 'en'];

/** export شده فقط برای اینکه تست بتواند همسانی کلیدهای دو زبان را بررسی کند. */
export const STRINGS = {
  fa: {
    'app.title': 'دژنبشت',
    'theme.toggleLabel': 'تغییر پوستهٔ روشن یا تاریک',
    'theme.toggleTitle': 'پوستهٔ روشن/تاریک',
    'lang.switch': 'English',
    'lang.switchLabel': 'نمایش این صفحه به انگلیسی',
    'search.placeholder': 'جستجو در همهٔ موضوع‌ها…',
    'search.ariaLabel': 'جستجو در مدخل‌ها',
    'search.empty': 'مدخلی یافت نشد',
    'view.topical': 'موضوعی',
    'view.alphabetical': 'الفبایی',
    'rail.label': 'ناوبری موضوع‌ها',
    'rail.heading': 'موضوع‌ها',
    'rail.onThisPage': 'در این صفحه',
    'rail.definition': 'تعریف',
    'nav.index': 'فهرست',
    'nav.breadcrumb': 'مسیر ناوبری',
    'entry.example': 'مثال',
    'entry.diagram': 'دیاگرام',
    'entry.related': 'مدخل‌های مرتبط',
    'entry.hashtagsLabel': 'هشتگ‌های مدخل',
    'entry.untranslated': 'این مدخل هنوز ترجمه‌ی انگلیسی ندارد؛ متن فارسی نمایش داده می‌شود.',
    'entry.notFound': 'مدخل یافت نشد',
    'entry.notFoundHint': 'مدخلی با این شناسه وجود ندارد. شاید هنوز نوشته نشده باشد.',
    'entry.back': 'بازگشت به فهرست',
    'tag.filtered': 'فیلترشده با هشتگ',
    'tag.clear': 'برداشتن فیلتر',
    'errors.heading': 'خطای اعتبارسنجی داده',
    'selftest.title': 'خودآزمایی',
    'selftest.counts': 'شمار مدخل‌ها به تفکیک دسته',
    'selftest.renderErrors': 'خطاهای رندر',
    'selftest.validation': 'خطاهای اعتبارسنجی',
    'selftest.untranslated': 'مدخل‌های بدون ترجمه‌ی انگلیسی',
    'selftest.pass': 'هیچ موردی نیست',
    'selftest.total': 'مجموع',
  },
  en: {
    'app.title': 'Dezhnebesht',
    'theme.toggleLabel': 'Switch between light and dark theme',
    'theme.toggleTitle': 'Light/dark theme',
    'lang.switch': 'فارسی',
    'lang.switchLabel': 'Show this page in Persian',
    'search.placeholder': 'Search across all topics…',
    'search.ariaLabel': 'Search entries',
    'search.empty': 'No entries found',
    'view.topical': 'By topic',
    'view.alphabetical': 'A–Z',
    'rail.label': 'Topic navigation',
    'rail.heading': 'Topics',
    'rail.onThisPage': 'On this page',
    'rail.definition': 'Definition',
    'nav.index': 'Index',
    'nav.breadcrumb': 'Breadcrumb',
    'entry.example': 'Example',
    'entry.diagram': 'Diagram',
    'entry.related': 'Related entries',
    'entry.hashtagsLabel': 'Entry hashtags',
    'entry.untranslated': 'This entry has no English translation yet; the Persian text is shown.',
    'entry.notFound': 'Entry not found',
    'entry.notFoundHint': 'No entry has this id. It may not be written yet.',
    'entry.back': 'Back to index',
    'tag.filtered': 'Filtered by tag',
    'tag.clear': 'Clear filter',
    'errors.heading': 'Data validation errors',
    'selftest.title': 'Self-test',
    'selftest.counts': 'Entry count per category',
    'selftest.renderErrors': 'Render errors',
    'selftest.validation': 'Validation errors',
    'selftest.untranslated': 'Entries without an English translation',
    'selftest.pass': 'Nothing to report',
    'selftest.total': 'Total',
  },
};

function readStored() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(stored) ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

let lang = readStored();

export function current() {
  return lang;
}

export function dirFor(which) {
  return which === 'fa' ? 'rtl' : 'ltr';
}

export function t(key) {
  return STRINGS[lang][key] ?? STRINGS[DEFAULT_LANG][key] ?? key;
}

export function applyToDocument() {
  document.documentElement.lang = lang;
  document.documentElement.dir = dirFor(lang);
}

export function set(next) {
  if (!LANGS.includes(next)) return;
  lang = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // حالت خصوصی مرورگر؛ زبان فقط در همین نشست می‌ماند
  }
  applyToDocument();
}

export function toggle() {
  set(lang === 'fa' ? 'en' : 'fa');
}
