import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  groupId,
  parseGroupState,
  isGroupOpen,
  resolveGroupOpen,
  resolveActiveTopicId,
} from '../assets/js/groups.js';

test('groupId از موضوع و دسته با هم ساخته می‌شود، نه فقط دسته', () => {
  assert.equal(groupId('crypto', 'basics'), 'idx-cat-crypto-basics');
  assert.notEqual(groupId('crypto', 'basics'), groupId('network-security', 'basics'));
});

test('parseGroupState ورودی خالی یا نامعتبر را به شیء خالی تبدیل می‌کند', () => {
  assert.deepEqual(parseGroupState(null), {});
  assert.deepEqual(parseGroupState(undefined), {});
  assert.deepEqual(parseGroupState(''), {});
  assert.deepEqual(parseGroupState('not json'), {});
  assert.deepEqual(parseGroupState('42'), {});
  assert.deepEqual(parseGroupState('"a string"'), {});
  assert.deepEqual(parseGroupState('null'), {});
  assert.deepEqual(parseGroupState('[1,2,3]'), {});
});

test('parseGroupState یک شیء معتبر را عیناً برمی‌گرداند', () => {
  assert.deepEqual(parseGroupState('{"idx-cat-crypto-consensus":false}'), {
    'idx-cat-crypto-consensus': false,
  });
});

test('isGroupOpen بدون ترجیح ذخیره‌شده پیش‌فرضش باز است', () => {
  assert.equal(isGroupOpen({}, 'idx-cat-crypto-basics'), true);
});

test('isGroupOpen ترجیح ذخیره‌شده را برمی‌گرداند، چه باز چه بسته', () => {
  const stored = { 'idx-cat-crypto-consensus': false, 'idx-cat-crypto-basics': true };
  assert.equal(isGroupOpen(stored, 'idx-cat-crypto-consensus'), false);
  assert.equal(isGroupOpen(stored, 'idx-cat-crypto-basics'), true);
});

test('resolveGroupOpen: بدون فیلتر فعال، دقیقاً ترجیح ذخیره‌شده برمی‌گردد', () => {
  const stored = { 'idx-cat-crypto-consensus': false };
  assert.equal(resolveGroupOpen('idx-cat-crypto-consensus', { filtered: false, storedState: stored }), false);
  assert.equal(resolveGroupOpen('idx-cat-crypto-basics', { filtered: false, storedState: stored }), true);
});

test('resolveGroupOpen: همین باگی که یک‌بار رخ داد — گروهِ بسته نباید نتیجه‌ی جستجو را ببلعد', () => {
  // خواننده «اجماع» را بسته (ذخیره‌شده: false)، بعد دنبال «نانس» می‌گردد؛
  // این گروه چون دارد رندر می‌شود (یعنی نانس داخلش تطبیق داده) باید باز شود.
  const stored = { 'idx-cat-crypto-consensus': false };
  assert.equal(resolveGroupOpen('idx-cat-crypto-consensus', { filtered: true, storedState: stored }), true);
});

test('resolveGroupOpen: فیلتر فعال حتی گروهی را که خواننده اصلاً دست نزده هم باز می‌کند', () => {
  assert.equal(resolveGroupOpen('idx-cat-crypto-basics', { filtered: true, storedState: {} }), true);
});

test('resolveGroupOpen: با پاک‌شدن فیلتر، دقیقاً همان ترجیحی که بود برمی‌گردد نه «همه باز»', () => {
  const stored = { 'idx-cat-crypto-consensus': false };
  // در حالت فیلترشده باز است...
  assert.equal(resolveGroupOpen('idx-cat-crypto-consensus', { filtered: true, storedState: stored }), true);
  // ...اما همین که فیلتر پاک شود، به «بسته» که خواننده انتخاب کرده بود برمی‌گردد.
  assert.equal(resolveGroupOpen('idx-cat-crypto-consensus', { filtered: false, storedState: stored }), false);
});

test('resolveActiveTopicId بدون موضوع در مسیر، اولین موضوع را برمی‌گرداند', () => {
  const topics = [{ id: 'crypto' }, { id: 'network-security' }];
  assert.equal(resolveActiveTopicId(topics, ''), 'crypto');
});

test('resolveActiveTopicId موضوعِ معتبرِ مسیر را برمی‌گرداند', () => {
  const topics = [{ id: 'crypto' }, { id: 'network-security' }];
  assert.equal(resolveActiveTopicId(topics, 'network-security'), 'network-security');
});

test('resolveActiveTopicId شناسه‌ی ناشناخته (مسیر کهنه) را نادیده می‌گیرد و به اولین موضوع برمی‌گردد', () => {
  const topics = [{ id: 'crypto' }, { id: 'network-security' }];
  assert.equal(resolveActiveTopicId(topics, 'no-such-topic'), 'crypto');
});

test('resolveActiveTopicId با یک موضوع، همان یکی را برمی‌گرداند', () => {
  assert.equal(resolveActiveTopicId([{ id: 'crypto' }], ''), 'crypto');
});

test('resolveActiveTopicId بدون هیچ موضوعی رشته‌ی خالی برمی‌گرداند', () => {
  assert.equal(resolveActiveTopicId([], ''), '');
  assert.equal(resolveActiveTopicId([], 'crypto'), '');
});
