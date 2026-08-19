import { loadAll, localized } from './data.js';
import * as i18n from './i18n.js';
import { filterEntries } from './search.js';
import * as router from './router.js';
import * as view from './render.js';
import { resolveActiveTopicId, parseGroupState } from './groups.js';
import { progressKey, parseProgress, serializeProgress } from './roadmap.js';

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
  roadmaps: new Map(),
  errors: [],
  route: { view: 'index', topic: '', tag: '' },
  query: '',
  indexView: readIndexView(),
  // موضوعِ نقشه‌ی راهی که آخرین render() واقعاً بارگذاری کرد — نه لزوماً
  // state.route.topic، چون موضوعِ نامعتبر رد می‌شود (پایین‌تر توضیح
  // داده شده). شنونده‌های تیک/ریست همین را می‌خوانند تا با نقشه‌ی
  // نمایش‌داده‌شده هم‌جهت بمانند و از هم جدا نیفتند.
  roadmapTopicId: '',
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

/**
 * پیشرفت به‌ازای هر موضوع، در try/catch چون حالت خصوصی می‌تواند
 * localStorage را ممنوع کند و نقشه باید بدون حافظه هم دیده شود.
 */
function readProgress(topicId) {
  try {
    return parseProgress(localStorage.getItem(progressKey(topicId)));
  } catch {
    return new Set();
  }
}

function saveProgress(topicId, readSet) {
  try {
    localStorage.setItem(progressKey(topicId), serializeProgress(readSet));
  } catch {
    // نوشتن ممکن نشد؛ تیک‌ها در همین نشست کار می‌کنند و بس.
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
 * ریل (resolveActiveTopicId) و نقشه‌ی راه دو سؤال متفاوتند: ریل می‌پرسد
 * «کدام موضوع پررنگ شود» — برای مسیر بی‌موضوع یا نامعتبر، افتادن روی
 * موضوع اول یک تصمیم ناوبری بی‌ضرر است. اینجا اما می‌پرسیم «کدام محتوا
 * بارگذاری شود» و آن باید صادق بماند: مسیر بی‌موضوع (#/roadmap) باز هم
 * به موضوع اول می‌افتد، ولی موضوعِ نامعتبرِ صریح (#/roadmap/ناشناخته)
 * دست‌نخورده می‌ماند تا state.roadmaps.get آن را پیدا نکند و شاخه‌ی
 * renderNotFound — که با بازنویسیِ resolveActiveTopicId هرگز اجرا
 * نمی‌شد — واقعاً اجرا شود.
 */
function resolveRoadmapTopicId(topics, routeTopicId) {
  return routeTopicId ? routeTopicId : resolveActiveTopicId(topics, routeTopicId);
}

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
  if (state.route.view === 'roadmap') {
    // همان موضوعی که render() برای همین ضربه بارگذاری کرد، نه یک
    // resolveActiveTopicId جداگانه — وگرنه موضوعِ نامعتبر در breadcrumb
    // یک موضوعِ واقعی نشان می‌داد در حالی که محتوا «یافت نشد» است.
    const topic = state.topics.find((item) => item.id === state.roadmapTopicId) ?? null;
    return view.renderBreadcrumb({ lang, topic, category: null, current: i18n.t('roadmap.title') });
  }
  return null;
}

function render() {
  const lang = i18n.current();
  dom.main.replaceChildren();

  const isIndex = state.route.view === 'index';
  const isRoadmap = state.route.view === 'roadmap';
  // در state ذخیره می‌شود (نه فقط متغیر محلی) تا buildBreadcrumb پایین‌تر
  // و شنونده‌های تیک/ریست خارج از render() همان موضوعی را ببینند که
  // همین render واقعاً بارگذاری کرد — سه‌بار جدا صدا زدنِ تابع resolve
  // می‌توانست از هم جدا بیفتد.
  state.roadmapTopicId = isRoadmap ? resolveRoadmapTopicId(state.topics, state.route.topic) : '';
  const roadmapTopicId = state.roadmapTopicId;
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
      roadmaps: state.roadmaps,
    }));

    markProgrammaticGroups();
  } else if (state.route.view === 'entry') {
    const entry = state.entriesById.get(state.route.id);
    dom.main.append(
      entry
        ? view.renderEntry(entry, { lang, categories: state.categories, entriesById: state.entriesById, topics: state.topics })
        : view.renderNotFound(state.route.id),
    );
  } else if (isRoadmap) {
    const roadmap = state.roadmaps.get(roadmapTopicId);
    if (roadmap) {
      dom.main.append(view.renderRoadmap(roadmap, {
        lang,
        entriesById: state.entriesById,
        readSet: readProgress(roadmapTopicId),
      }));
    } else {
      // موضوعی بدون نقشه: به فهرست برگرد، نه صفحه‌ی خالی.
      dom.main.append(view.renderNotFound(state.route.topic || 'roadmap'));
    }
  } else if (state.route.view === 'self-test') {
    dom.main.append(view.renderSelfTest(state.entries, state.categories, state.errors, state.entriesById, state.topics, state.roadmaps));
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

// انیمیشن ورود فقط موقع لود اول و تغییر مسیر — نه با هر کلید جستجو،
// که فهرست را زیر دست کاربر می‌لرزاند. حذف و خواندن دوباره‌ی offsetWidth
// لازم است تا مرورگر انیمیشن را از نو شروع کند؛ بدون آن، افزودن دوبارهٔ
// همان کلاس هیچ اثری ندارد.
function playEnter() {
  dom.main.classList.remove('is-entering');
  void dom.main.offsetWidth;
  dom.main.classList.add('is-entering');
  // کلاس باید بعد از پایان برداشته شود. اگر بماند، هر فرزندی که جستجو
  // بعداً می‌سازد هم انیمیشن را می‌گیرد و فهرست با هر کلید می‌لرزد.
  dom.main.addEventListener(
    'animationend',
    () => dom.main.classList.remove('is-entering'),
    { once: true },
  );
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
    return;
  }

  // ریل «در این صفحه» به لنگرِ داخل صفحه اشاره می‌کند (#entry-example)، و
  // مسیریابی این سایت هم روی hash است. اگر جلوی رفتار پیش‌فرض گرفته نشود،
  // location.hash عوض می‌شود، روتر آن را مسیری ناشناخته می‌بیند و طبق
  // قاعده‌ی «هر مسیر ناشناخته به فهرست» کل مدخل را با فهرست جایگزین
  // می‌کند — یعنی کلیک روی «مثال» خواننده را از صفحه بیرون می‌انداخت.
  // خودمان اسکرول می‌کنیم تا هش دست‌نخورده بماند و آدرسِ صفحه همان
  // #/t/<id> باقی بماند؛ همان کاری که بالا برای ریل فهرست می‌شود.
  const railLink = event.target.closest('.rail-list a');
  if (railLink) {
    event.preventDefault();
    document.getElementById(railLink.getAttribute('href').slice(1))?.scrollIntoView();
  }
});

/**
 * render() کل dom.main را با replaceChildren از نو می‌سازد، پس دکمه‌ای
 * که همین الان فعال شد دیگر در سند نیست و فوکوس روی <body> می‌افتد —
 * یعنی کاربر کیبورد برای هر کدام از ۴۶ قدم باید از سر صفحه Tab بزند و
 * آن <button> با aria-pressed که spec خواسته بی‌فایده می‌شود.
 *
 * به‌جای به‌روزرسانیِ دستیِ همان چند نقطه (کلاس گره، aria-pressed، دو
 * شمارنده، --p، نشان «اینجایی»)، که منطق رندر را دوباره‌نویسی می‌کرد و
 * روزی از خودِ نما جا می‌ماند، همان دکمه بعد از رندر دوباره پیدا و
 * فوکوس می‌شود. preventScroll چون صفحه سر جای خودش است و نباید بپرد.
 */
function refocus(selector) {
  dom.main.querySelector(selector)?.focus({ preventScroll: true });
}

/**
 * هم‌رسانی یک مدخل. سه مسیر، به ترتیبِ چیزی که مرورگر واقعاً دارد:
 * برگه‌ی سیستم (موبایل)، کلیپ‌بورد، و در آخر ترفند قدیمیِ textarea.
 * آن آخری لازم است چون navigator.clipboard فقط در بستر امن کار می‌کند —
 * روی https و localhost هست، ولی اگر سایت را با آی‌پی محلی و http روی
 * گوشی باز کنی نیست، و بدون این مسیر دکمه بی‌صدا هیچ‌کاری نمی‌کرد.
 */
function legacyCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  // خارج از دید ولی داخل صفحه: display:none انتخاب‌شدنی نیست.
  area.style.cssText = 'position:fixed;top:-9999px;opacity:0';
  document.body.append(area);
  area.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    area.remove();
  }
}

function flashShare(button, key) {
  const label = button.querySelector('.share-label');
  if (!label) return;
  // اگر دوبار پشت سر هم بزنی، متن اصلی نباید گم شود.
  const original = button.dataset.shareLabel ?? label.textContent;
  button.dataset.shareLabel = original;
  clearTimeout(Number(button.dataset.shareTimer));
  label.textContent = i18n.t(key);
  button.classList.add('is-flashing');
  button.dataset.shareTimer = String(setTimeout(() => {
    label.textContent = button.dataset.shareLabel ?? original;
    button.classList.remove('is-flashing');
  }, 2000));
}

async function shareEntry(button) {
  const entry = state.entriesById.get(button.dataset.shareId);
  if (!entry) return;
  const content = localized(entry, i18n.current());
  const url = window.location.href;
  const title = content.title;
  const short = content.short ?? '';

  // برگه‌ی سیستم عنوان و توضیح را جدا می‌گیرد و خودش می‌چیند؛ کلیپ‌بورد
  // یک رشته می‌خواهد، پس همان‌جا سه‌تکه به هم چسبانده می‌شود.
  if (navigator.share) {
    try {
      await navigator.share({ title, text: short, url });
      return;
    } catch (error) {
      // انصراف کاربر خطا نیست و نباید «کپی نشد» نشان بدهد.
      if (error?.name === 'AbortError') return;
      // هر شکست دیگری: بیفت روی کلیپ‌بورد.
    }
  }

  const text = [title, short, url].filter(Boolean).join('\n');
  try {
    await navigator.clipboard.writeText(text);
    flashShare(button, 'entry.shareCopied');
  } catch {
    flashShare(button, legacyCopy(text) ? 'entry.shareCopied' : 'entry.shareFailed');
  }
}

// دکمه‌ی هم‌رسانی فقط در نمای مدخل وجود دارد، ولی شنونده روی dom.main
// است چون فرزندانش با هر رندر جایگزین می‌شوند.
dom.main.addEventListener('click', (event) => {
  const button = event.target.closest('.share-btn');
  if (button) shareEntry(button);
});

// شنونده‌ی جدا برای نمای نقشه‌ی راه — روی dom.main چون فرزندانش با هر
// رندر جایگزین می‌شوند، ولی خودِ dom.main هرگز عوض نمی‌شود.
dom.main.addEventListener('click', (event) => {
  // شنونده روی کل dom.main است ولی فقط در نمای نقشه معنی دارد. بدون این
  // گارد، هر عنصر آینده‌ای با کلاسِ عامِ node/seg در نمای دیگری این کد را
  // بیدار می‌کرد و پیشرفت روی کلیدِ dezhnebesht:roadmap: (با موضوعِ خالی،
  // چون state.roadmapTopicId بیرون از نقشه '' است) نوشته می‌شد.
  if (state.route.view !== 'roadmap') return;

  const node = event.target.closest('.node');
  if (node) {
    // همان موضوعی که render() برای نقشه‌ی الان‌نمایش‌داده‌شده حل کرد —
    // نه یک resolveActiveTopicId جداگانه، وگرنه اگر این‌جا فرمول دیگری
    // بدهد، تیک روی کلید ذخیره‌ی موضوعِ دیگری می‌نشیند.
    const topicId = state.roadmapTopicId;
    const readSet = readProgress(topicId);
    const id = node.dataset.entryId;
    if (readSet.has(id)) readSet.delete(id);
    else readSet.add(id);
    saveProgress(topicId, readSet);
    render();
    refocus(`.node[data-entry-id="${CSS.escape(id)}"]`);
    return;
  }

  const reset = event.target.closest('.roadmap-reset');
  if (reset) {
    // برگشت‌ناپذیر است، پس تأیید می‌گیرد.
    if (!window.confirm(i18n.t('roadmap.resetConfirm'))) return;
    saveProgress(state.roadmapTopicId, new Set());
    render();
    refocus('.roadmap-reset');
    return;
  }

  const seg = event.target.closest('.seg');
  if (seg) {
    document
      .getElementById(`roadmap-stage-${seg.dataset.stageIndex}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const result = await loadAll();
  const { topics, categories, entries, errors } = result;
  state.topics = topics;
  state.categories = categories;
  state.entries = entries;
  state.entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  state.roadmaps = result.roadmaps ?? new Map();
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
    playEnter();
    window.scrollTo(0, 0); // فقط موقع تغییر مسیر، نه با هر کلید جستجو
  });
}

// اسکلت بارگذاری در خودِ HTML است، پس اگر راه‌اندازی بترکد تا ابد
// می‌ماند و کاربر فکر می‌کند صفحه هنوز در حال بارگذاری است. loadAll
// خودش هرگز throw نمی‌کند، ولی این محافظِ آخر است تا خرابیِ ناشناخته
// به‌جای انتظار بی‌پایان، پیام بدهد.
init().catch((error) => {
  dom.main.replaceChildren();
  dom.errors.replaceChildren(
    view.renderErrorBanner([{ file: 'app.js', id: '', message: String(error && error.message || error) }]),
  );
  dom.errors.hidden = false;
});
