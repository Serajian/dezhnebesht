import { localized } from './data.js';
import { t, dirFor, current, LANGS } from './i18n.js';
import { groupId, resolveGroupOpen } from './groups.js';

/**
 * سازنده‌ی کوتاه المان. attrs کلید ویژه‌ی `html` دارد که innerHTML
 * را ست می‌کند — فقط برای محتوای مدخل‌ها که در خود ریپو نوشته شده.
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else node.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child);
  }
  return node;
}

/**
 * اگر محتوای نمایش‌داده‌شده فارسی است ولی رابط انگلیسی، جهت را
 * روی همان بلاک برمی‌گردانیم تا متن فارسی وارونه دیده نشود.
 */
function contentDirAttrs(content) {
  if (!content.untranslated) return {};
  return { dir: dirFor('fa'), lang: 'fa' };
}

function sortByTitle(entries, lang) {
  return [...entries].sort((a, b) =>
    localized(a, lang).title.localeCompare(localized(b, lang).title, lang),
  );
}

/* ---------- نمای فهرست: ریل موضوع‌ها، گروه‌های تاشو، ردیف‌ها ---------- */

// شورونِ دست‌ساز به‌جای مثلث پیش‌فرض <summary>؛ چون همیشه یکی است و از
// کدِ خودِ render.js می‌آید (نه از داده)، با innerHTML درج می‌شود — دقیقاً
// همان الگویی که دیاگرام/svg مدخل‌ها (content.svg) از آن استفاده می‌کنند؛
// document.createElement('svg') فضای‌نام درست نمی‌سازد، پس از طریق el()
// قابل ساخت نیست.
const GROUP_DISCLOSURE_SVG =
  '<svg class="group-disclosure" viewBox="0 0 14 14" aria-hidden="true">' +
  '<path d="M9 3.2 4.4 7l4.6 3.8" fill="none" stroke="currentColor" stroke-width="1.6" ' +
  'stroke-linecap="round" stroke-linejoin="round"/></svg>';

function entryRow(entry, lang, badge) {
  const content = localized(entry, lang);
  return el(
    'li',
    {},
    el(
      'a',
      { class: 'row', href: `#/t/${encodeURIComponent(entry.id)}`, ...contentDirAttrs(content) },
      el(
        'span',
        { class: 'row-main' },
        el('span', { class: 'row-title' }, content.title),
        el('span', { class: 'row-desc' }, content.short),
      ),
      badge
        ? el('span', { class: 'row-badge' }, badge)
        : el('span', { class: 'row-chevron', 'aria-hidden': 'true' }, '‹'),
    ),
  );
}

/**
 * یک دسته‌ی تاشوشدنی. شناسه از موضوع+دسته ساخته می‌شود (groupId)، نه
 * فقط دسته، چون دو موضوع می‌توانند دسته‌ای هم‌نام داشته باشند. باز یا
 * بسته‌بودنش با resolveGroupOpen تعیین می‌شود — منطق محض، بدون DOM،
 * تست‌شده در test/groups.test.mjs؛ اینجا فقط نتیجه‌اش را به attribute
 * open تبدیل می‌کنیم.
 */
function categoryGroup(topicId, category, inCategory, lang, { filtered, storedGroupState }) {
  const id = groupId(topicId, category.id);
  const open = resolveGroupOpen(id, { filtered, storedState: storedGroupState });
  const summary = el(
    'summary',
    { class: 'group-head' },
    el('h2', {}, category[lang] ?? category.fa),
    el('span', { class: 'count' }, String(inCategory.length)),
  );
  summary.insertAdjacentHTML('beforeend', GROUP_DISCLOSURE_SVG);
  return el(
    'details',
    { class: 'group', id, open },
    summary,
    el('ul', { class: 'rows' }, sortByTitle(inCategory, lang).map((entry) => entryRow(entry, lang))),
  );
}

/**
 * موضوع ← دسته ← مدخل، بدون سرتیتر موضوع: آن مسئولیت حالا رِیل است
 * (railTopics پایین‌تر). تطبیق دسته روی «موضوع و شناسه» با هم انجام
 * می‌شود، نه فقط شناسه — دو موضوع می‌توانند هر دو دسته‌ای به نام basics
 * داشته باشند. entries از قبل فیلترشده (جستجو/هشتگ/موضوع) به اینجا
 * می‌رسد، پس یک دسته‌ی خالی از این فهرست اصلاً رندر نمی‌شود — نه
 * «مخفی»، از ابتدا وجود ندارد.
 */
function renderTopical(entries, categories, topics, lang, groupOptions) {
  const wrap = el('div', { class: 'index-list' });
  for (const topic of topics) {
    const inTopic = entries.filter((entry) => entry.topic === topic.id);
    if (inTopic.length === 0) continue;
    const topicCategories = categories.filter((category) => category.topic === topic.id);
    for (const category of topicCategories) {
      const inCategory = inTopic.filter((entry) => entry.category === category.id);
      if (inCategory.length === 0) continue;
      wrap.append(categoryGroup(topic.id, category, inCategory, lang, groupOptions));
    }
  }
  return wrap;
}

/**
 * نمای الفبایی: فهرست تخت، بدون گروه — پس هیچ‌چیز تاشدنی نیست و هیچ
 * دکمه‌ی تاشوی بی‌عملی هم نمایش داده نمی‌شود. چون سرتیترِ گروه‌بندی‌کننده
 * در کار نیست، هر ردیف برچسبِ دسته‌ی خودش را نشان می‌دهد.
 */
function renderAlphabetical(entries, categories, lang) {
  const rows = sortByTitle(entries, lang).map((entry) => {
    const category = categories.find(
      (item) => item.id === entry.category && item.topic === entry.topic,
    );
    const badge = category ? (category[lang] ?? category.fa) : '';
    return entryRow(entry, lang, badge);
  });
  return el('div', { class: 'index-list' }, el('ul', { class: 'rows rows--flat' }, rows));
}

/**
 * رِیل: ناوبری موضوع‌ها، نه دسته‌ها — سلسله‌مراتب واقعی موضوع←دسته←مدخل
 * است و ناوبری اصلی نباید یک لایه را رد کند. فقط موضوعِ فعال دسته‌هایش
 * را تودرتو زیر خودش نشان می‌دهد؛ بقیه فقط لینک+شمارنده‌ی کل‌اند، تا
 * وقتی موضوع‌ها به ده‌ها برسند رِیل قابل‌اسکن بماند. شمارنده‌ها همیشه از
 * کلِ داده می‌آیند، نه از نتیجه‌ی جستجوی جاری — رِیل ناوبری پایدار است،
 * نه بازتاب لحظه‌ای جستجو (و اگر با جستجو کوچک می‌شد، لینک زیردسته‌ای که
 * موقتاً صفر نتیجه دارد باید ناپدید می‌شد و همین باعث بن‌بست کلیک می‌شد).
 */
function railTopics(topics, categories, activeTopicId, topicTotals, categoryTotals, lang) {
  const items = topics.map((topic) => {
    const isActive = topic.id === activeTopicId;
    const linkChildren = [
      el('span', { class: 'rail-topic-dot', 'aria-hidden': 'true' }),
      el('span', {}, topic[lang] ?? topic.fa),
    ];
    if (!isActive) {
      linkChildren.push(
        el('span', { class: 'rail-item-count' }, String(topicTotals.get(topic.id) ?? 0)),
      );
    }
    const link = el(
      'a',
      {
        class: 'rail-topic-link',
        href: `#/topic/${encodeURIComponent(topic.id)}`,
        ...(isActive ? { 'aria-current': 'page' } : {}),
      },
      linkChildren,
    );

    const li = el('li', { class: isActive ? 'rail-topic is-active' : 'rail-topic' }, link);

    if (isActive) {
      const subnavItems = categories
        .filter((category) => category.topic === topic.id)
        .map((category) => {
          const count = categoryTotals.get(`${topic.id}/${category.id}`) ?? 0;
          if (count === 0) return null;
          return el(
            'li',
            {},
            el(
              'a',
              { href: `#${groupId(topic.id, category.id)}` },
              el('span', {}, category[lang] ?? category.fa),
              el('span', { class: 'rail-item-count' }, String(count)),
            ),
          );
        })
        .filter(Boolean);
      if (subnavItems.length > 0) {
        li.append(el('ul', { class: 'rail-subnav' }, subnavItems));
      }
    }

    return li;
  });

  return el(
    'aside',
    { class: 'rail', 'aria-label': t('rail.label') },
    el('p', { class: 'rail-label' }, t('rail.heading')),
    el('ul', { class: 'rail-topics' }, items),
  );
}

function tagBanner(tag) {
  return el(
    'p',
    { class: 'tag-banner' },
    `${t('tag.filtered')} `,
    el('span', { class: 'tag', dir: 'ltr' }, `#${tag}`),
    ' ',
    el('a', { href: '#/' }, t('tag.clear')),
  );
}

export function renderIndex(entries, categories, {
  lang,
  view,
  tag,
  topics = [],
  activeTopicId = '',
  filtered = false,
  topicTotals = new Map(),
  categoryTotals = new Map(),
  storedGroupState = {},
}) {
  const column = el('div', { class: 'column' });

  if (tag) column.append(tagBanner(tag));

  if (entries.length === 0) {
    column.append(el('p', { class: 'empty-state' }, t('search.empty')));
  } else if (view === 'alphabetical') {
    column.append(renderAlphabetical(entries, categories, lang));
  } else {
    column.append(renderTopical(entries, categories, topics, lang, { filtered, storedGroupState }));
  }

  const layout = el('div', { class: 'layout' });
  if (topics.length > 0) {
    layout.append(railTopics(topics, categories, activeTopicId, topicTotals, categoryTotals, lang));
  }
  layout.append(column);
  return layout;
}

/* ---------- نمای مدخل ---------- */

function entryHashtags(tags) {
  return el(
    'div',
    { class: 'hashtags', role: 'list', 'aria-label': t('entry.hashtagsLabel') },
    tags.map((tag) =>
      el(
        'a',
        { class: 'tag', role: 'listitem', href: `#/tag/${encodeURIComponent(tag)}` },
        el('span', { dir: 'ltr' }, `#${tag}`),
      ),
    ),
  );
}

function relatedCard(entry, lang) {
  const content = localized(entry, lang);
  return el(
    'a',
    { class: 'related-card', href: `#/t/${encodeURIComponent(entry.id)}`, ...contentDirAttrs(content) },
    el('span', { class: 'related-title' }, content.title),
    el('span', { class: 'related-desc' }, content.short),
  );
}

/**
 * فهرست «در این صفحه»ی رِیل از روی چه‌چیزی واقعاً در مدخل هست ساخته
 * می‌شود، نه ثابت — مدخلی بدون مثال یا دیاگرام نباید لینک مرده بگیرد.
 * منطق محض (بدون DOM) و export شده تا در تست بدون نیاز به document
 * قابل آزمایش باشد.
 */
export function onThisPageSections({ hasExample, hasDiagram, hasRelated }) {
  const sections = [{ id: 'entry-title', key: 'rail.definition' }];
  if (hasExample) sections.push({ id: 'entry-example', key: 'entry.example' });
  if (hasDiagram) sections.push({ id: 'entry-diagram', key: 'entry.diagram' });
  if (hasRelated) sections.push({ id: 'entry-related', key: 'entry.related' });
  return sections;
}

function entryRail(sections) {
  return el(
    'aside',
    { class: 'rail', 'aria-label': t('rail.onThisPage') },
    el('p', { class: 'rail-label' }, t('rail.onThisPage')),
    el(
      'ul',
      { class: 'rail-list' },
      sections.map((section) =>
        el('li', {}, el('a', { href: `#${section.id}` }, el('span', {}, t(section.key)))),
      ),
    ),
  );
}

/**
 * پیش‌تر داخل نمای مدخل بود؛ حالا فقط چروم (.chrome--entry) آن را نشان
 * می‌دهد — app.js آن را داخل .chrome درج می‌کند چون .chrome بخشی از
 * پوسته‌ی دائمی صفحه است، نه چیزی که این تابع بسازد و جایگزین کند.
 * دسته برخلاف موضوع همیشه متن ساده می‌ماند، نه لینک — مسیری مثل
 * «#/c/basics» در router.js تعریف نشده و لینک‌مرده می‌شد.
 */
export function renderBreadcrumb({ lang, topic, category, current }) {
  const children = [el('a', { href: '#/' }, t('nav.index'))];
  if (topic) {
    children.push(el('span', { class: 'crumb-sep', 'aria-hidden': 'true' }, '‹'));
    children.push(el('a', { href: `#/topic/${encodeURIComponent(topic.id)}` }, topic[lang] ?? topic.fa));
  }
  if (category) {
    children.push(el('span', { class: 'crumb-sep', 'aria-hidden': 'true' }, '‹'));
    children.push(el('span', {}, category[lang] ?? category.fa));
  }
  children.push(el('span', { class: 'crumb-sep', 'aria-hidden': 'true' }, '‹'));
  children.push(el('span', { class: 'crumb-current', 'aria-current': 'page' }, current));
  return el('nav', { class: 'chrome-breadcrumb', 'aria-label': t('nav.breadcrumb') }, children);
}

export function renderEntry(entry, { lang, categories, entriesById, topics = [] }) {
  const content = localized(entry, lang);
  const related = (entry.related ?? []).map((id) => entriesById.get(id)).filter(Boolean);
  const sections = onThisPageSections({
    hasExample: Boolean(content.example),
    hasDiagram: Boolean(content.svg),
    hasRelated: related.length > 0,
  });

  // فقط محتوای برگرفته از entry (تیتر تا مرتبط) جهت را برمی‌گرداند — نه
  // کل ستون، وگرنه نشان «ترجمه نشده» که خودش متن رابط به زبان جاری است
  // هم وارونه می‌شد.
  const contentWrap = el('div', { ...contentDirAttrs(content) });
  contentWrap.append(el('h1', { class: 'display-title', id: 'entry-title' }, content.title));
  contentWrap.append(el('p', { class: 'lede' }, content.short));

  if (entry.tags?.length) contentWrap.append(entryHashtags(entry.tags));

  contentWrap.append(el('div', { class: 'prose', html: content.body }));

  if (content.example) {
    contentWrap.append(
      el(
        'section',
        { class: 'example', id: 'entry-example' },
        el('h2', { class: 'section-label' }, t('entry.example')),
        el('div', { html: content.example }),
      ),
    );
  }

  if (content.svg) {
    contentWrap.append(
      el(
        'section',
        { class: 'diagram-section', id: 'entry-diagram' },
        el('h2', { class: 'section-label' }, t('entry.diagram')),
        el('figure', { class: 'diagram', html: content.svg }),
      ),
    );
  }

  if (related.length > 0) {
    contentWrap.append(
      el(
        'section',
        { class: 'related', id: 'entry-related' },
        el('h2', { class: 'section-label' }, t('entry.related')),
        el('div', { class: 'related-grid' }, related.map((item) => relatedCard(item, lang))),
      ),
    );
  }

  const column = el('div', { class: 'column' });
  if (content.untranslated) column.append(el('p', { class: 'notice' }, t('entry.untranslated')));
  column.append(contentWrap);

  return el('div', { class: 'layout' }, entryRail(sections), column);
}

export function renderNotFound(id) {
  const column = el(
    'div',
    { class: 'column' },
    el('h1', { class: 'display-title' }, t('entry.notFound')),
    el('p', { class: 'lede' }, `${t('entry.notFoundHint')} `, el('span', { dir: 'ltr' }, id)),
    el('p', {}, el('a', { href: '#/' }, t('entry.back'))),
  );
  return el('div', { class: 'layout' }, column);
}

/* ---------- نمای خودآزمایی ---------- */

function reportSection(title, items) {
  const body = items.length === 0
    ? el('p', { class: 'lede' }, `✓ ${t('selftest.pass')}`)
    : el('ul', { class: 'rows' }, items.map((item) => el('li', { class: 'row' }, el('span', { class: 'row-title' }, item))));
  return el('div', { class: 'group' }, el('h2', { class: 'section-label' }, title), body);
}

/**
 * هر مدخل را در هر دو زبان واقعاً رندر می‌کند تا خطاهای رندری که
 * فقط روی یک زبان یا یک شکل داده رخ می‌دهند بیرون بیفتند.
 */
export function renderSelfTest(entries, categories, errors, entriesById, topics = []) {
  const renderFailures = [];
  const untranslated = [];

  for (const entry of entries) {
    for (const lang of LANGS) {
      try {
        renderEntry(entry, { lang, categories, entriesById, topics });
      } catch (error) {
        renderFailures.push(`${entry.id} [${lang}] — ${error.message}`);
      }
    }
    if (!entry.en) untranslated.push(entry.id);
  }

  const lang = current();
  const counts = [];
  for (const topic of topics) {
    const inTopic = entries.filter((entry) => entry.topic === topic.id);
    if (topics.length > 1) counts.push(`${topic[lang] ?? topic.fa}: ${inTopic.length}`);
    for (const category of categories.filter((item) => item.topic === topic.id)) {
      // تطبیق روی موضوع و دسته با هم — دو موضوع می‌توانند دسته‌ی هم‌نام داشته باشند.
      const total = inTopic.filter((entry) => entry.category === category.id).length;
      const label = category[lang] ?? category.fa;
      counts.push(topics.length > 1 ? `\u00a0\u00a0${label}: ${total}` : `${label}: ${total}`);
    }
  }
  counts.push(`${t('selftest.total')}: ${entries.length}`);

  const column = el(
    'div',
    { class: 'column' },
    el('h1', { class: 'display-title' }, t('selftest.title')),
    reportSection(t('selftest.renderErrors'), renderFailures),
    reportSection(t('selftest.validation'), errors.map((e) => `${e.file} › ${e.id} — ${e.message}`)),
    reportSection(t('selftest.untranslated'), untranslated),
    el(
      'div',
      { class: 'group' },
      el('h2', { class: 'section-label' }, t('selftest.counts')),
      el('ul', { class: 'rows' }, counts.map((line) => el('li', { class: 'row' }, el('span', { class: 'row-title' }, line)))),
    ),
  );
  return el('div', { class: 'layout' }, column);
}

export function renderErrorBanner(errors) {
  return el(
    'div',
    {},
    el('strong', {}, t('errors.heading')),
    el(
      'ul',
      {},
      errors.map((error) =>
        el(
          'li',
          {},
          el('span', { class: 'mono', dir: 'ltr' }, error.id ? `${error.file} › ${error.id}` : error.file),
          ' — ',
          error.message,
        ),
      ),
    ),
  );
}
