import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validate } from '../assets/js/data.js';

function readJson(path) {
  return JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
}

const topics = readJson('data/topics.json');

// همان مسیری که loadAll طی می‌کند: موضوع ← دسته ← مدخل.
const categories = topics.flatMap((topic) =>
  readJson(`data/${topic.id}/categories.json`).map((category) => ({ ...category, topic: topic.id })),
);

const entries = categories.flatMap((category) =>
  readJson(`data/${category.topic}/entries/${category.file}`).map((entry) => ({
    ...entry,
    category: category.id,
    topic: category.topic,
  })),
);

test('topics.json آرایه است و هر موضوع فیلدهای لازم را دارد', () => {
  assert.ok(Array.isArray(topics));
  assert.ok(topics.length > 0);
  for (const topic of topics) {
    for (const field of ['id', 'fa', 'en']) {
      assert.ok(topic[field], `موضوع ${topic.id ?? '?'} فیلد ${field} ندارد`);
    }
    assert.match(topic.id, /^[a-z0-9-]+$/, `شناسه‌ی موضوع «${topic.id}» باید نام پوشه‌ی معتبر باشد`);
  }
});

test('categories.json هر موضوع آرایه است و هر دسته فیلدهای لازم را دارد', () => {
  for (const topic of topics) {
    const list = readJson(`data/${topic.id}/categories.json`);
    assert.ok(Array.isArray(list), `${topic.id}/categories.json`);
    assert.ok(list.length > 0, `${topic.id} هیچ دسته‌ای ندارد`);
    for (const category of list) {
      for (const field of ['id', 'file', 'fa', 'en']) {
        assert.ok(category[field], `دسته‌ی ${category.id ?? '?'} در ${topic.id} فیلد ${field} ندارد`);
      }
    }
  }
});

test('هر فایل مدخل یک آرایه‌ی معتبر است', () => {
  for (const category of categories) {
    assert.ok(
      Array.isArray(readJson(`data/${category.topic}/entries/${category.file}`)),
      `${category.topic}/${category.file}`,
    );
  }
});

test('هیچ مدخلی فیلد category یا topic ندارد — هر دو از مسیر فایل می‌آیند', () => {
  for (const category of categories) {
    for (const entry of readJson(`data/${category.topic}/entries/${category.file}`)) {
      assert.equal(entry.category, undefined, `${entry.id} نباید فیلد category داشته باشد`);
      assert.equal(entry.topic, undefined, `${entry.id} نباید فیلد topic داشته باشد`);
    }
  }
});

test('هشتگ‌ها انگلیسی، حروف کوچک و بدون # هستند', () => {
  for (const entry of entries) {
    for (const tag of entry.tags ?? []) {
      assert.match(tag, /^[a-z0-9-]+$/, `هشتگ نامعتبر «${tag}» در ${entry.id}`);
    }
  }
});

test('شناسه‌ی مدخل‌ها در کل سایت یکتاست، نه فقط داخل یک موضوع', () => {
  const seen = new Map();
  for (const entry of entries) {
    assert.ok(
      !seen.has(entry.id),
      `شناسه‌ی «${entry.id}» هم در ${seen.get(entry.id)} و هم در ${entry.topic} آمده`,
    );
    seen.set(entry.id, entry.topic);
  }
});

test('داده‌ی واقعی روی دیسک هیچ خطای اعتبارسنجی ندارد', () => {
  const errors = validate(categories, entries, topics);
  assert.deepEqual(errors, [], errors.map((e) => `${e.file} › ${e.id} — ${e.message}`).join('\n'));
});
