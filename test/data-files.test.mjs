import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validate } from '../assets/js/data.js';

function readJson(path) {
  return JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
}

const categories = readJson('data/categories.json');

const entries = categories.flatMap((category) =>
  readJson(`data/entries/${category.file}`).map((entry) => ({ ...entry, category: category.id })),
);

test('categories.json آرایه است و هر دسته فیلدهای لازم را دارد', () => {
  assert.ok(Array.isArray(categories));
  assert.ok(categories.length > 0);
  for (const category of categories) {
    for (const field of ['id', 'file', 'fa', 'en']) {
      assert.ok(category[field], `دسته‌ی ${category.id ?? '?'} فیلد ${field} ندارد`);
    }
  }
});

test('هر فایل مدخل یک آرایه‌ی معتبر است', () => {
  for (const category of categories) {
    assert.ok(Array.isArray(readJson(`data/entries/${category.file}`)), category.file);
  }
});

test('هیچ مدخلی فیلد category ندارد — دسته از نام فایل می‌آید', () => {
  for (const category of categories) {
    for (const entry of readJson(`data/entries/${category.file}`)) {
      assert.equal(entry.category, undefined, `${entry.id} نباید فیلد category داشته باشد`);
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

test('داده‌ی واقعی روی دیسک هیچ خطای اعتبارسنجی ندارد', () => {
  const errors = validate(categories, entries);
  assert.deepEqual(errors, [], errors.map((e) => `${e.file} › ${e.id} — ${e.message}`).join('\n'));
});
