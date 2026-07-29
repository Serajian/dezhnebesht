import { localized } from './data.js';
import { t, dirFor } from './i18n.js';

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

function renderTopical(entries, categories, lang) {
  const wrap = el('div', { class: 'groups' });
  for (const category of categories) {
    const inCategory = entries.filter((entry) => entry.category === category.id);
    if (inCategory.length === 0) continue;
    wrap.append(
      el(
        'section',
        { class: 'group' },
        el(
          'h2',
          { class: 'group-title' },
          el('span', {}, category[lang] ?? category.fa),
          el('span', { class: 'count' }, String(inCategory.length)),
        ),
        el('div', { class: 'cards' }, sortByTitle(inCategory, lang).map((e) => entryCard(e, lang))),
      ),
    );
  }
  return wrap;
}

function renderAlphabetical(entries, lang) {
  return el(
    'div',
    { class: 'cards' },
    sortByTitle(entries, lang).map((entry) => entryCard(entry, lang)),
  );
}

export function renderIndex(entries, categories, { lang, view, tag }) {
  const wrap = el('div', { class: 'index' });

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
    wrap.append(el('p', { class: 'empty' }, t('search.empty')));
    return wrap;
  }

  wrap.append(
    view === 'alphabetical'
      ? renderAlphabetical(entries, lang)
      : renderTopical(entries, categories, lang),
  );
  return wrap;
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
