import { localized } from './data.js';
import { t, dirFor, current, LANGS } from './i18n.js';

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

function categoryGroup(category, inCategory, lang) {
  return el(
    'section',
    { class: 'group' },
    el(
      'h2',
      { class: 'group-title' },
      el('span', {}, category[lang] ?? category.fa),
      el('span', { class: 'count' }, String(inCategory.length)),
    ),
    el('div', { class: 'cards' }, sortByTitle(inCategory, lang).map((e) => entryCard(e, lang))),
  );
}

/**
 * موضوع ← دسته ← مدخل. تطبیق دسته روی «موضوع و شناسه» با هم انجام
 * می‌شود، نه فقط شناسه: دو موضوع می‌توانند هر دو دسته‌ای به نام
 * basics داشته باشند و مقایسه‌ی تک‌فیلدی مدخل‌هایشان را قاطی می‌کند.
 */
function renderTopical(entries, categories, topics, lang, { showTopics }) {
  const wrap = el('div', { class: 'groups' });

  for (const topic of topics) {
    const inTopic = entries.filter((entry) => entry.topic === topic.id);
    if (inTopic.length === 0) continue;

    const topicCategories = categories.filter((category) => category.topic === topic.id);
    const groups = [];
    for (const category of topicCategories) {
      const inCategory = inTopic.filter((entry) => entry.category === category.id);
      if (inCategory.length > 0) groups.push(categoryGroup(category, inCategory, lang));
    }
    if (groups.length === 0) continue;

    if (showTopics) {
      wrap.append(
        el(
          'section',
          { class: 'topic' },
          el(
            'h2',
            { class: 'topic-title' },
            el('span', {}, topic[lang] ?? topic.fa),
            el('span', { class: 'count' }, String(inTopic.length)),
          ),
          el('div', { class: 'topic-groups' }, groups),
        ),
      );
    } else {
      wrap.append(...groups);
    }
  }
  return wrap;
}

function renderTopicFilter(topics, current, counts, lang) {
  // لینک‌اند نه دکمه — مسیریابی hash خودش کار را می‌کند و
  // این‌طور render.js هیچ رویدادی نمی‌بندد.
  return el(
    'nav',
    { class: 'topicbar' },
    el('a', { class: current ? 'chip' : 'chip active', href: '#/' }, t('topic.all')),
    topics.map((topic) =>
      el(
        'a',
        { class: current === topic.id ? 'chip active' : 'chip', href: `#/topic/${encodeURIComponent(topic.id)}` },
        el('span', {}, topic[lang] ?? topic.fa),
        el('span', { class: 'count' }, String(counts.get(topic.id) ?? 0)),
      ),
    ),
  );
}

function renderAlphabetical(entries, lang) {
  return el(
    'div',
    { class: 'cards' },
    sortByTitle(entries, lang).map((entry) => entryCard(entry, lang)),
  );
}

export function renderIndex(entries, categories, { lang, view, tag, topics = [], topic = '', topicCounts = new Map() }) {
  const wrap = el('div', { class: 'index' });

  // ردیف موضوع فقط وقتی معنی دارد که بیش از یک موضوع وجود داشته باشد.
  if (topics.length > 1) wrap.append(renderTopicFilter(topics, topic, topicCounts, lang));

  if (tag) {
    wrap.append(
      el(
        'p',
        { class: 'tagbanner' },
        `${t('tag.filtered')} `,
        el('span', { class: 'tag mono', dir: 'ltr' }, `#${tag}`),
        ' ',
        el('a', { href: '#/' }, t('tag.clear')),
      ),
    );
  }

  if (entries.length === 0) {
    const empty = el(
      'div',
      { class: 'empty' },
      el('p', {}, t('search.empty')),
      el('button', { type: 'button', class: 'clear' }, t('search.clear')),
    );
    wrap.append(empty);
    return wrap;
  }

  wrap.append(
    view === 'alphabetical'
      ? renderAlphabetical(entries, lang)
      // وقتی یک موضوع انتخاب شده، سرتیتر موضوع تکراری است.
      // با یک موضوع، سرتیتر موضوع سلسله‌مراتب بی‌فایده اضافه می‌کند.
      // ساختار وقتی ظاهر می‌شود که واقعاً لازم شود.
      : renderTopical(entries, categories, topics, lang, {
          showTopics: !topic && topics.length > 1,
        }),
  );
  return wrap;
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
