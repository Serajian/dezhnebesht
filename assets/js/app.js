import { loadAll } from './data.js';
import * as i18n from './i18n.js';
import { filterEntries } from './search.js';
import * as router from './router.js';
import * as view from './render.js';

const VIEW_KEY = 'glossary:index-view';

const dom = {
  main: document.getElementById('main'),
  errors: document.getElementById('errors'),
  brand: document.getElementById('brand'),
  searchbar: document.getElementById('searchbar'),
  search: document.getElementById('search'),
  langToggle: document.getElementById('lang-toggle'),
  viewToggle: document.getElementById('view-toggle'),
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
};

function readIndexView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'alphabetical' ? 'alphabetical' : 'topical';
  } catch {
    return 'topical';
  }
}

function render() {
  const lang = i18n.current();
  dom.main.replaceChildren();

  const isIndex = state.route.view === 'index';
  dom.searchbar.hidden = !isIndex;
  dom.viewToggle.hidden = !isIndex;

  if (isIndex) {
    const matched = filterEntries(state.entries, { query: state.query, tag: state.route.tag });
    // فیلتر موضوع فقط برای مرور است؛ به محض اینکه چیزی تایپ شود
    // جستجو از آن عبور می‌کند و همه‌ی موضوع‌ها را می‌گردد.
    const searching = state.query.trim() !== '';
    const activeTopic = searching ? '' : state.route.topic;
    const visible = activeTopic
      ? matched.filter((entry) => entry.topic === activeTopic)
      : matched;

    const topicCounts = new Map();
    for (const entry of matched) {
      topicCounts.set(entry.topic, (topicCounts.get(entry.topic) ?? 0) + 1);
    }

    dom.main.append(view.renderIndex(visible, state.categories, {
      lang,
      view: state.indexView,
      tag: state.route.tag,
      topics: state.topics,
      topic: activeTopic,
      topicCounts,
    }));
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
  dom.langToggle.textContent = i18n.t('lang.switch');
  dom.search.placeholder = i18n.t('search.placeholder');
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

dom.search.addEventListener('input', () => {
  state.query = dom.search.value;
  render();
});

dom.main.addEventListener('click', (event) => {
  if (event.target.closest('.clear')) clearSearch();
});

function clearSearch() {
  state.query = '';
  dom.search.value = '';
  render();
  dom.search.focus();
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
