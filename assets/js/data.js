import { validateRoadmap } from './roadmap.js';

const REQUIRED_FIELDS = ['title', 'short', 'body'];

/**
 * اعتبارسنجی خالص. هیچ fetch و هیچ DOM.
 * @returns آرایه‌ی خطاها؛ خالی یعنی سالم.
 */
export function validate(categories, entries, topics = []) {
  const errors = [];
  const seenIds = new Map();

  // شناسه‌ی موضوع نام پوشه است، پس تکراری بودنش یعنی یکی از دو موضوع
  // بی‌صدا دیده نمی‌شود.
  const seenTopics = new Set();
  for (const topic of topics) {
    if (!topic?.id) {
      errors.push({ file: 'topics.json', id: '(بدون شناسه)', message: 'موضوع فیلد id ندارد' });
      continue;
    }
    if (seenTopics.has(topic.id)) {
      errors.push({ file: 'topics.json', id: topic.id, message: 'شناسه‌ی موضوع تکراری است' });
    }
    seenTopics.add(topic.id);
    if (!topic.fa) {
      errors.push({ file: 'topics.json', id: topic.id, message: 'موضوع نام فارسی (fa) ندارد' });
    }
  }

  // شناسه‌ی دسته فقط داخل موضوع خودش باید یکتا باشد — دو موضوع
  // می‌توانند هر دو دسته‌ای به نام «مفاهیم پایه» داشته باشند.
  const seenCategories = new Set();
  for (const category of categories) {
    if (!category?.id) continue;
    const key = `${category.topic}/${category.id}`;
    if (seenCategories.has(key)) {
      errors.push({
        file: `${category.topic}/categories.json`,
        id: category.id,
        message: 'شناسه‌ی دسته در این موضوع تکراری است',
      });
    }
    seenCategories.add(key);
  }

  for (const entry of entries) {
    if (entry === null || typeof entry !== 'object') {
      errors.push({ file: '?.json', id: '(نامعتبر)', message: 'مدخل یک شیء معتبر نیست' });
      continue;
    }

    const file = `${entry.category ?? '?'}.json`;

    if (!entry.id) {
      errors.push({ file, id: '(بدون شناسه)', message: 'مدخل فیلد id ندارد' });
      continue;
    }

    if (seenIds.has(entry.id)) {
      errors.push({
        file,
        id: entry.id,
        message: `id تکراری است؛ قبلاً در ${seenIds.get(entry.id)} آمده`,
      });
    } else {
      seenIds.set(entry.id, file);
    }

    if (!entry.fa) {
      errors.push({ file, id: entry.id, message: 'بلاک fa وجود ندارد' });
    } else {
      for (const field of REQUIRED_FIELDS) {
        if (!entry.fa[field]) {
          errors.push({ file, id: entry.id, message: `fa.${field} خالی یا جاافتاده است` });
        }
      }
    }

    if (entry.en) {
      for (const field of REQUIRED_FIELDS) {
        if (!entry.en[field]) {
          errors.push({ file, id: entry.id, message: `en.${field} خالی یا جاافتاده است` });
        }
      }
    }
  }

  const knownIds = new Set(
    entries
      .filter((entry) => entry !== null && typeof entry === 'object')
      .map((entry) => entry.id)
      .filter(Boolean),
  );
  for (const entry of entries) {
    if (entry === null || typeof entry !== 'object' || !entry.id) continue;
    for (const ref of entry.related ?? []) {
      if (!knownIds.has(ref)) {
        errors.push({
          file: `${entry.category ?? '?'}.json`,
          id: entry.id,
          message: `related به «${ref}» اشاره می‌کند که هیچ مدخلی با آن id وجود ندارد`,
        });
      }
    }
  }

  return errors;
}

/**
 * محتوای یک مدخل در زبان خواسته‌شده، با برگشت به فارسی اگر آن زبان نباشد.
 */
/**
 * `svg` سه شکل را می‌پذیرد و همه به یک آرایه‌ی یکدست تبدیل می‌شوند، تا
 * render فقط یک حالت را بشناسد:
 *   "…"                              یک دیاگرام بدون عنوان
 *   ["…", "…"]                       چند دیاگرام
 *   [{ svg: "…", fa: "…", en: "…" }] چند دیاگرام با عنوان دوزبانه
 * با بیش از یک دیاگرام، عنوان لازم می‌شود وگرنه خواننده نمی‌داند کدام
 * کدام است — ولی اجباری نیست، چون مدخل‌های تک‌دیاگرامی نباید مجبور شوند.
 */
export function figures(entry, lang) {
  const raw = entry[lang]?.svg ?? entry.svg ?? '';
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((item) => (typeof item === 'string' ? { svg: item, caption: '' } : {
      svg: item?.svg ?? '',
      caption: item?.[lang] ?? item?.fa ?? '',
    }))
    .filter((item) => item.svg);
}

export function localized(entry, lang) {
  const block = entry[lang] ?? entry.fa;
  return {
    title: block.title,
    short: block.short,
    body: block.body,
    example: block.example ?? '',
    figures: figures(entry, lang),
    untranslated: !entry[lang],
  };
}

/**
 * مدخلی که بلاک fa اصلاً ندارد، یا fa دارد ولی title ندارد، در هیچ
 * زبانی قابل رندر نیست — localized() چنین مدخلی را با throw جواب
 * می‌دهد چون block خودش undefined است. طبق قانون تاب‌آوری طرح
 * («سایت با وجود خطا بالا می‌آید و مدخل‌های سالم کار می‌کنند —
 * خطا نباید کل صفحه را از کار بیندازد») این مدخل باید پیش از
 * رسیدن به هر view از entries کنار گذاشته شود؛ وگرنه throw آن کل
 * renderIndex/renderSelfTest را با خودش پایین می‌کشد. مشکلات
 * ملایم‌تر — related شکسته یا نبود en — رندر را نمی‌شکنند، پس
 * عمداً باعث حذف نمی‌شوند.
 */
function canRender(entry) {
  return Boolean(entry && entry.fa && entry.fa.title);
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`خوانده نشد (HTTP ${response.status})`);
  try {
    return await response.json();
  } catch {
    throw new Error('JSON نامعتبر است');
  }
}

/**
 * نقشه اختیاری است: نبودنش یعنی آن موضوع مسیر مطالعه ندارد، نه اینکه
 * چیزی خراب است. پس ۴۰۴ به «غایب» ترجمه می‌شود و بقیه‌ی شکست‌ها به خطا.
 */
async function fetchRoadmap(path) {
  let response;
  try {
    response = await fetch(path, { cache: 'no-store' });
  } catch (error) {
    return { error: error.message };
  }
  if (response.status === 404) return { absent: true };
  if (!response.ok) return { error: `خوانده نشد (HTTP ${response.status})` };
  try {
    return { roadmap: await response.json() };
  } catch {
    return { error: 'JSON نامعتبر است' };
  }
}

/**
 * همه‌ی دسته‌ها و مدخل‌ها را لود می‌کند. هرگز throw نمی‌کند —
 * هر شکستی به صورت یک خطا در آرایه‌ی errors برمی‌گردد تا سایت بالا بیاید.
 */
export async function loadAll(basePath = 'data') {
  let topics;
  try {
    topics = await fetchJson(`${basePath}/topics.json`);
    if (!Array.isArray(topics)) throw new Error('محتوای فایل باید یک آرایه باشد');
  } catch (error) {
    return {
      topics: [],
      categories: [],
      entries: [],
      errors: [{ file: 'topics.json', id: '', message: error.message }],
      roadmaps: new Map(),
    };
  }

  const errors = [];
  const categories = [];
  const entries = [];

  // درخواست‌ها موازی‌اند، نه پشت سر هم. با await داخل حلقه هر فایل منتظر
  // قبلی می‌ماند: با N موضوع و M دسته یعنی ۱+N+M رفت‌وبرگشتِ زنجیره‌ای، که
  // با رشد محتوا صفحه را ثانیه‌ها خالی نگه می‌دارد. حالا دو موج است:
  // همهٔ categories.json با هم، بعد همهٔ فایل‌های مدخل با هم.
  const perTopic = await Promise.all(topics.map(async (topic) => {
    try {
      const list = await fetchJson(`${basePath}/${topic.id}/categories.json`);
      if (!Array.isArray(list)) throw new Error('محتوای فایل باید یک آرایه باشد');
      return { topic, list };
    } catch (error) {
      return { topic, error };
    }
  }));

  // درخواست‌ها همین‌جا شروع می‌شوند تا با هم در راه باشند؛ نتیجه‌شان پایین
  // به ترتیب خوانده می‌شود تا ترتیب مدخل‌ها قطعی بماند. rejection همان‌جا
  // به مقدار تبدیل می‌شود تا هیچ promise بی‌صاحبی نماند.
  const pending = [];
  for (const { topic, list, error } of perTopic) {
    if (error) {
      errors.push({ file: `${topic.id}/categories.json`, id: '', message: error.message });
      continue;
    }
    for (const category of list) {
      // موضوع از نام پوشه می‌آید، دقیقاً همان‌طور که دسته از نام فایل.
      const withTopic = { ...category, topic: topic.id };
      categories.push(withTopic);
      pending.push({
        category: withTopic,
        request: fetchJson(`${basePath}/${topic.id}/entries/${category.file}`).then(
          (raw) => ({ raw }),
          (error) => ({ error }),
        ),
      });
    }
  }

  for (const { category, request } of pending) {
    const { raw, error } = await request;
    const file = `${category.topic}/${category.file}`;
    if (error) {
      errors.push({ file, id: '', message: error.message });
      continue;
    }
    if (!Array.isArray(raw)) {
      errors.push({ file, id: '', message: 'محتوای فایل باید یک آرایه باشد' });
      continue;
    }
    for (const entry of raw) {
      entries.push({ ...entry, category: category.id, topic: category.topic });
    }
  }

  // نقشه‌ها بعد از مدخل‌ها لود می‌شوند چون اعتبارسنجی‌شان به فهرست
  // مدخل‌های همان موضوع نیاز دارد.
  const roadmaps = new Map();
  const roadmapResults = await Promise.all(
    topics.map(async (topic) => ({ topic, result: await fetchRoadmap(`${basePath}/${topic.id}/roadmap.json`) })),
  );
  for (const { topic, result } of roadmapResults) {
    if (result.absent) continue;
    if (result.error) {
      errors.push({ file: `${topic.id}/roadmap.json`, id: '', message: result.error });
      continue;
    }
    const roadmapErrors = validateRoadmap(result.roadmap, entries, topic.id);
    errors.push(...roadmapErrors);
    // نقشه‌ی خراب اصلاً وارد نمی‌شود؛ نیمه‌کاره رندر کردنش بدتر از
    // نداشتنش است و خطایش همین حالا در بنر آمد.
    if (roadmapErrors.length === 0) roadmaps.set(topic.id, result.roadmap);
  }

  errors.push(...validate(categories, entries, topics));
  return { topics, categories, entries: entries.filter(canRender), errors, roadmaps };
}
