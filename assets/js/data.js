const REQUIRED_FIELDS = ['title', 'short', 'body'];

/**
 * اعتبارسنجی خالص. هیچ fetch و هیچ DOM.
 * @returns آرایه‌ی خطاها؛ خالی یعنی سالم.
 */
export function validate(categories, entries) {
  const errors = [];
  const seenIds = new Map();

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
export function localized(entry, lang) {
  const block = entry[lang] ?? entry.fa;
  return {
    title: block.title,
    short: block.short,
    body: block.body,
    example: block.example ?? '',
    svg: block.svg ?? entry.svg ?? '',
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
 * همه‌ی دسته‌ها و مدخل‌ها را لود می‌کند. هرگز throw نمی‌کند —
 * هر شکستی به صورت یک خطا در آرایه‌ی errors برمی‌گردد تا سایت بالا بیاید.
 */
export async function loadAll(basePath = 'data') {
  let categories;
  try {
    categories = await fetchJson(`${basePath}/categories.json`);
    if (!Array.isArray(categories)) throw new Error('محتوای فایل باید یک آرایه باشد');
  } catch (error) {
    return {
      categories: [],
      entries: [],
      errors: [{ file: 'categories.json', id: '', message: error.message }],
    };
  }

  const errors = [];
  const entries = [];

  for (const category of categories) {
    try {
      const raw = await fetchJson(`${basePath}/entries/${category.file}`);
      if (!Array.isArray(raw)) throw new Error('محتوای فایل باید یک آرایه باشد');
      for (const entry of raw) {
        entries.push({ ...entry, category: category.id });
      }
    } catch (error) {
      errors.push({ file: category.file, id: '', message: error.message });
    }
  }

  errors.push(...validate(categories, entries));
  return { categories, entries: entries.filter(canRender), errors };
}
