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

export function entryCard(entry, lang) {
  const content = localized(entry, lang);
  return el(
    'a',
    { class: 'card', href: `#/t/${encodeURIComponent(entry.id)}`, ...contentDirAttrs(content) },
    el('span', { class: 'card-title' }, content.title),
    el('span', { class: 'card-short' }, content.short),
  );
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

function renderTags(tags) {
  return el(
    'div',
    { class: 'tags' },
    tags.map((tag) =>
      el(
        'a',
        { class: 'tag mono', dir: 'ltr', href: `#/tag/${encodeURIComponent(tag)}` },
        `#${tag}`,
      ),
    ),
  );
}

export function renderEntry(entry, { lang, categories, entriesById, topics = [] }) {
  const content = localized(entry, lang);
  const category = categories.find(
    (item) => item.id === entry.category && item.topic === entry.topic,
  );
  const topic = topics.length > 1 ? topics.find((item) => item.id === entry.topic) : null;

  const article = el('article', { class: 'entry' });

  article.append(
    el(
      'nav',
      { class: 'crumbs' },
      el('a', { href: '#/' }, t('nav.index')),
      el('span', { class: 'sep' }, '›'),
      topic ? el('a', { href: `#/topic/${encodeURIComponent(topic.id)}` }, topic[lang] ?? topic.fa) : null,
      topic ? el('span', { class: 'sep' }, '›') : null,
      category ? el('span', {}, category[lang] ?? category.fa) : null,
      category ? el('span', { class: 'sep' }, '›') : null,
      el('span', { class: 'here' }, content.title),
    ),
  );

  if (content.untranslated) {
    article.append(el('p', { class: 'notice' }, t('entry.untranslated')));
  }

  const body = el('div', { class: 'entry-body', ...contentDirAttrs(content) });
  body.append(el('h1', {}, content.title));
  body.append(el('p', { class: 'lead' }, content.short));

  if (entry.tags?.length) body.append(renderTags(entry.tags));

  body.append(el('div', { class: 'prose', html: content.body }));

  if (content.example) {
    body.append(
      el(
        'section',
        { class: 'example' },
        el('h2', {}, t('entry.example')),
        el('div', { class: 'prose', html: content.example }),
      ),
    );
  }

  if (content.svg) {
    body.append(el('figure', { class: 'diagram', html: content.svg }));
  }

  const related = (entry.related ?? [])
    .map((id) => entriesById.get(id))
    .filter(Boolean);

  if (related.length > 0) {
    body.append(
      el(
        'section',
        { class: 'related' },
        el('h2', {}, t('entry.related')),
        el('div', { class: 'cards' }, related.map((item) => entryCard(item, lang))),
      ),
    );
  }

  article.append(body);
  return article;
}

export function renderNotFound(id) {
  return el(
    'div',
    { class: 'notfound' },
    el('h1', {}, t('entry.notFound')),
    el('p', { class: 'mono', dir: 'ltr' }, id),
    el('p', {}, t('entry.notFoundHint')),
    el('p', {}, el('a', { href: '#/' }, t('entry.back'))),
  );
}

function reportSection(title, items) {
  return el(
    'section',
    { class: 'report' },
    el('h2', {}, title),
    items.length === 0
      ? el('p', { class: 'ok' }, `✓ ${t('selftest.pass')}`)
      : el('ul', { class: 'bad' }, items.map((item) => el('li', {}, item))),
  );
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

  return el(
    'div',
    { class: 'selftest' },
    el('h1', {}, t('selftest.title')),
    reportSection(t('selftest.renderErrors'), renderFailures),
    reportSection(t('selftest.validation'), errors.map((e) => `${e.file} › ${e.id} — ${e.message}`)),
    reportSection(t('selftest.untranslated'), untranslated),
    el('section', { class: 'report' }, el('h2', {}, t('selftest.counts')), el('ul', {}, counts.map((line) => el('li', {}, line)))),
  );
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
