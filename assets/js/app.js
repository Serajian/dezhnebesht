import { loadAll, localized } from './data.js';
import * as i18n from './i18n.js';
import { filterEntries } from './search.js';
import * as router from './router.js';
import * as view from './render.js';
import { resolveActiveTopicId, parseGroupState } from './groups.js';

const VIEW_KEY = 'glossary:index-view';
const THEME_KEY = 'glossary:theme';
const GROUPS_KEY = 'glossary:groups';

const dom = {
  main: document.getElementById('main'),
  errors: document.getElementById('errors'),
  brand: document.getElementById('brand'),
  searchbar: document.getElementById('searchbar'),
  search: document.getElementById('search'),
  langToggle: document.getElementById('lang-toggle'),
  viewToggle: document.getElementById('view-toggle'),
  themeToggle: document.getElementById('theme-toggle'),
  // بدون id در index.html (فقط کلاس) — چروم پوسته‌ی دائمی صفحه است و
  // بین نمای فهرست/مدخل عوض نمی‌شود، فقط محتوایش؛ به همین دلیل با
  // querySelector گرفته می‌شود، نه با یک id تازه که به index.html نیاز
  // داشت (خارج از محدوده‌ی این تسک).
  chrome: document.querySelector('.chrome'),
  chromeStart: document.querySelector('.chrome-start'),
  chromeEnd: document.querySelector('.chrome-end'),
};

const state = {
  topics: [],
  categories: [],
  entries: [],
  entriesById: new Map(),
  errors: [],
  route: { view: 'index', topic: '', tag: '' },
  query: '',
  indexView: readIndexView(),
  // شمار کل مدخل‌ها به تفکیک موضوع/دسته — یک‌بار در init() از روی کل
  // داده محاسبه می‌شود، نه از روی نتیجه‌ی فیلترشده؛ رِیل ناوبری پایدار
  // است و نباید با هر ضربه‌کلید جستجو کوچک/بزرگ شود.
  topicTotals: new Map(),
  categoryTotals: new Map(),
};

function readIndexView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'alphabetical' ? 'alphabetical' : 'topical';
  } catch {
    return 'topical';
  }
}

/* ---------- ترجیح باز/بسته‌ی گروه‌های تاشوی فهرست ----------
 * تصمیم نهایی (باز باشد یا نه) منطق محضی است که در groups.js زندگی
 * می‌کند و با تست پوشش داده شده؛ این‌جا فقط همان ترجیح را از
 * localStorage می‌خوانیم/می‌نویسیم، در try/catch چون حالت خصوصی
 * مرورگر گاهی رویش خطا می‌دهد. */
function readGroupState() {
  try {
    return parseGroupState(localStorage.getItem(GROUPS_KEY));
  } catch {
    return {};
  }
}

const groupState = readGroupState();

function saveGroupState() {
  try {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groupState));
  } catch {
    // حالت خصوصی؛ ترجیح فقط در همین نشست می‌ماند
  }
}

/*
 * رویداد toggle خودِ <details> غیرهمزمان است — تأییدشده با آزمایش
 * مستقیم در مرورگر، نه فقط حدس: حتی ساختنِ یک <details> با open از
 * همان لحظه‌ی ایجاد (نه با mutation بعدی) هم، به‌محض اتصال به سند، یک
 * toggle غیرهمزمان صف می‌کند. چون render() این‌جا هر بار عنصرهای
 * <details> را از نو می‌سازد (نه استفاده‌ی دوباره از قبلی‌ها، برخلاف
 * ماکت)، شمارنده‌ی سراسری ماکت (programmaticToggles) این‌جا جواب
 * نمی‌دهد: اگر یک رندر تازه، قبل از رسیدن toggleِ رندر قبلی، عنصر را
 * از سند حذف کند، آن رویداد هرگز به شنونده‌ی delegated نمی‌رسد (چون
 * عنصر وقتی رویداد واقعاً fire می‌شود دیگر اجداد ندارد) و شمارنده برای
 * همیشه نامتوازن می‌ماند. راه‌حلِ این‌جا یک نشانه‌ی به‌ازای-هر-عنصر است:
 * درست بعد از append، هر <details> تازه‌ی باز به suppressNextToggle
 * اضافه می‌شود؛ شنونده فقط اولین toggleِ همان عنصر مشخص را نادیده
 * می‌گیرد — مستقل از هر عنصر دیگر، پس هرگز از هم‌گام خارج نمی‌شود.
 */
const suppressNextToggle = new WeakSet();

function markProgrammaticGroups() {
  for (const details of dom.main.querySelectorAll('details.group[open]')) {
    suppressNextToggle.add(details);
  }
}

// toggle حباب نمی‌کند (تأییدشده با آزمایش)، پس فقط با شنونده‌ی فاز
// capture روی dom.main — که هرگز جایگزین نمی‌شود، فقط فرزندانش عوض
// می‌شوند — قابل تفویض است.
dom.main.addEventListener(
  'toggle',
  (event) => {
    const details = event.target;
    if (!(details instanceof HTMLDetailsElement) || !details.classList.contains('group')) return;
    if (suppressNextToggle.has(details)) {
      suppressNextToggle.delete(details);
      return; // ساختِ برنامه‌ای بود (رندر تازه یا فیلتر)، نه کلیک خواننده
    }
    groupState[details.id] = details.open;
    saveGroupState();
  },
  true,
);

/**
 * breadcrumb داخل چروم فقط برای نمای مدخل/خودآزمایی لازم است. render.js
 * فقط DOM محضِ آن را می‌سازد (renderBreadcrumb)؛ اینکه کدام مسیر به
 * کدام breadcrumb می‌رسد منطق مسیریابی است، پس اینجا زندگی می‌کند.
 * مدخل ناشناخته (renderNotFound) هم از همین مسیر رد می‌شود، صرفاً بدون
 * موضوع/دسته.
 */
function buildBreadcrumb(lang) {
  if (state.route.view === 'entry') {
    const entry = state.entriesById.get(state.route.id);
    if (!entry) {
      return view.renderBreadcrumb({ lang, topic: null, category: null, current: i18n.t('entry.notFound') });
    }
    const content = localized(entry, lang);
    const category = state.categories.find(
      (item) => item.id === entry.category && item.topic === entry.topic,
    );
    const topic = state.topics.length > 1 ? state.topics.find((item) => item.id === entry.topic) : null;
    return view.renderBreadcrumb({ lang, topic, category, current: content.title });
  }
  if (state.route.view === 'self-test') {
    return view.renderBreadcrumb({ lang, topic: null, category: null, current: i18n.t('selftest.title') });
  }
  return null;
}

function render() {
  const lang = i18n.current();
  dom.main.replaceChildren();

  const isIndex = state.route.view === 'index';
  dom.searchbar.hidden = !isIndex;
  dom.viewToggle.hidden = !isIndex;
  dom.chromeStart.hidden = !isIndex;
  dom.chrome.classList.toggle('chrome--index', isIndex);
  dom.chrome.classList.toggle('chrome--entry', !isIndex);
  dom.main.classList.toggle('content--index', isIndex);

  // breadcrumb قبلی (اگر بود) همیشه اول برداشته می‌شود — چروم بین دو
  // رندر پشت‌سرهم دوباره ساخته نمی‌شود (برخلاف dom.main)، پس اگر این‌جا
  // پاک نشود، برگشتن به فهرست یک breadcrumb یتیم را پشت سر می‌گذارد.
  dom.chrome.querySelector('.chrome-breadcrumb')?.remove();
  if (!isIndex) {
    const crumb = buildBreadcrumb(lang);
    if (crumb) dom.chrome.insertBefore(crumb, dom.chromeEnd);
  }

  if (isIndex) {
    const matched = filterEntries(state.entries, { query: state.query, tag: state.route.tag });
    // فیلتر موضوع فقط برای مرور است؛ به محض اینکه چیزی تایپ شود
    // جستجو از آن عبور می‌کند و همه‌ی موضوع‌ها را می‌گردد.
    const searching = state.query.trim() !== '';
    const activeTopic = searching ? '' : state.route.topic;
    const visible = activeTopic
      ? matched.filter((entry) => entry.topic === activeTopic)
      : matched;

    // جستجو یا فیلتر هشتگ — هر دو باید هر گروهی را که نتیجه دارد
    // مجبور به باز-بودن کنند؛ یک گروه بسته هرگز نباید نتیجه را ببلعد.
    // فیلترِ موضوع به‌تنهایی (صرفِ مرور) این قانون را فعال نمی‌کند.
    const filtered = searching || Boolean(state.route.tag);

    dom.main.append(view.renderIndex(visible, state.categories, {
      lang,
      view: state.indexView,
      tag: state.route.tag,
      topics: state.topics,
      activeTopicId: resolveActiveTopicId(state.topics, state.route.topic),
      filtered,
      topicTotals: state.topicTotals,
      categoryTotals: state.categoryTotals,
      storedGroupState: groupState,
    }));

    markProgrammaticGroups();
  } else if (state.route.view === 'entry') {
    const entry = state.entriesById.get(state.route.id);
    dom.main.append(
      entry
        ? view.renderEntry(entry, { lang, categories: state.categories, entriesById: state.entriesById, topics: state.topics })
        : view.renderNotFound(state.route.id),
    );
  } else if (state.route.view === 'self-test') {
    dom.main.append(view.renderSelfTest(state.entries, state.categories, state.errors, state.entriesById, state.topics));
  }
}

function renderChrome() {
  dom.brand.textContent = i18n.t('app.title');
  // دکمه‌های تم/زبان حالا فقط آیکون‌اند؛ ست‌کردن textContent رویشان
  // SVG داخلشان را پاک می‌کرد، پس این‌جا فقط title/aria-label به‌روز می‌شود.
  dom.themeToggle.title = i18n.t('theme.toggleTitle');
  dom.themeToggle.setAttribute('aria-label', i18n.t('theme.toggleLabel'));
  dom.langToggle.title = i18n.t('lang.switch');
  dom.langToggle.setAttribute('aria-label', i18n.t('lang.switchLabel'));
  dom.search.placeholder = i18n.t('search.placeholder');
  dom.search.setAttribute('aria-label', i18n.t('search.ariaLabel'));
  for (const button of dom.viewToggle.querySelectorAll('button')) {
    button.textContent = i18n.t(`view.${button.dataset.view}`);
    button.classList.toggle('active', button.dataset.view === state.indexView);
  }
}

function refresh() {
  renderChrome();
  render();
}

dom.langToggle.addEventListener('click', () => {
  i18n.toggle();
  refresh();
});

dom.viewToggle.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-view]');
  if (!button) return;
  state.indexView = button.dataset.view;
  try {
    localStorage.setItem(VIEW_KEY, state.indexView);
  } catch {
    // حالت خصوصی؛ انتخاب فقط در همین نشست می‌ماند
  }
  refresh();
});

// از سیستم شروع می‌کند: تا خواننده چیزی انتخاب نکرده هیچ data-theme
// روی <html> نیست (به‌جز اسکریپت پیش‌رنگ در index.html که فقط انتخاب
// قبلاً ذخیره‌شده را همان اول برمی‌گرداند تا چشمک نزند) و
// prefers-color-scheme به‌تنهایی حاکم است — همان الگویی که i18n.js
// برای زبان دارد.
function effectiveTheme() {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'light' || explicit === 'dark') return explicit;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // حالت خصوصی؛ انتخاب فقط در همین نشست می‌ماند
  }
}

dom.themeToggle.addEventListener('click', () => {
  setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');
});

dom.search.addEventListener('input', () => {
  state.query = dom.search.value;
  render();
});

dom.main.addEventListener('click', (event) => {
  const subnavLink = event.target.closest('.rail-subnav a');
  if (subnavLink) {
    event.preventDefault();
    openGroupFromRail(subnavLink.getAttribute('href').slice(1));
  }
});

function clearSearch() {
  state.query = '';
  dom.search.value = '';
  render();
  dom.search.focus();
}

/**
 * لینک زیردسته‌ی ریل هرگز نباید به یک گروه بسته یا فیلترشده ختم شود —
 * یعنی خواننده کلیک می‌کند و چیز تازه‌ای نمی‌بیند. پس قبل از اسکرول:
 * اگر نمای الفبایی فعال است (که اصلاً <details> ندارد) به نمای موضوعی
 * برمی‌گردیم، جستجوی فعال (اگر بود) پاک می‌شود، و ترجیح این گروه صریحاً
 * باز ثبت می‌شود. فیلتر هشتگ عمداً دست‌نخورده می‌ماند: پاک‌کردنش یعنی
 * تغییر مسیر (location.hash)، که با scrollTo(0,0) روتر رقابت می‌کند و
 * اسکرولِ همین تابع را باطل می‌کرد.
 */
function openGroupFromRail(id) {
  if (state.indexView !== 'topical') {
    state.indexView = 'topical';
    try {
      localStorage.setItem(VIEW_KEY, state.indexView);
    } catch {
      // حالت خصوصی؛ انتخاب فقط در همین نشست می‌ماند
    }
  }
  if (state.query.trim() !== '') {
    state.query = '';
    dom.search.value = '';
  }
  groupState[id] = true;
  saveGroupState();
  refresh();
  document.getElementById(id)?.scrollIntoView();
}

function isTypingTarget(target) {
  return target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
}

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !isTypingTarget(event.target) && !dom.searchbar.hidden) {
    event.preventDefault();
    dom.search.focus();
    dom.search.select();
    return;
  }
  if (event.key === 'Escape' && document.activeElement === dom.search) {
    clearSearch();
  }
});

async function init() {
  i18n.applyToDocument();

  const { topics, categories, entries, errors } = await loadAll();
  state.topics = topics;
  state.categories = categories;
  state.entries = entries;
  state.entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  state.errors = errors;

  // شمار کل هر موضوع/دسته، مستقل از جستجو — رِیل ناوبری پایدار است،
  // نه بازتاب لحظه‌ای فیلتر جاری؛ برخلاف داده‌ی خودِ entries، این‌ها
  // در طول نشست عوض نمی‌شوند، پس یک‌بار همین‌جا کافی است.
  for (const entry of entries) {
    state.topicTotals.set(entry.topic, (state.topicTotals.get(entry.topic) ?? 0) + 1);
    const key = `${entry.topic}/${entry.category}`;
    state.categoryTotals.set(key, (state.categoryTotals.get(key) ?? 0) + 1);
  }

  if (errors.length > 0) {
    dom.errors.replaceChildren(view.renderErrorBanner(errors));
    dom.errors.hidden = false;
  }

  router.start((route) => {
    state.route = route;
    refresh();
    window.scrollTo(0, 0); // فقط موقع تغییر مسیر، نه با هر کلید جستجو
  });
}

init();
