// منطق محضِ همگام‌سازی پیشرفت — بدون DOM و بدون شبکه، تا هم مرورگر
// (account.js) و هم سرور (server/api.js) همین یک تعریف از «ایمیل معتبر» و
// «بدنه‌ی معتبر» را import کنند و دو طرف از هم جدا نیفتند.

export const MAX_EMAIL = 254;
export const MAX_TOPIC_ID = 64;
export const MAX_ENTRY_ID = 128;
export const MAX_IDS = 5000;
export const MAX_BODY_BYTES = 65536;

/** ایمیل فقط شناسه است؛ همین normalize است که دو دستگاه را به یک ردیف می‌رساند. */
export function normalizeEmail(raw) {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : '';
}

/**
 * شکلِ معقول، نه دقت RFC: ایمیل تأیید نمی‌شود، پس این چک فقط جلوی
 * غلط تایپی آشکار را می‌گیرد.
 */
export function isValidEmail(email) {
  if (typeof email !== 'string' || email.length === 0 || email.length > MAX_EMAIL) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return local.length > 0 && domain.length > 0 && domain.includes('.');
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** آرایه‌ی شناسه‌ی معتبر، dedupe‌شده؛ هر چیز دیگر null. */
function validIds(value) {
  if (!Array.isArray(value) || value.length > MAX_IDS) return null;
  for (const id of value) {
    if (typeof id !== 'string' || id.length > MAX_ENTRY_ID) return null;
  }
  return [...new Set(value)];
}

/**
 * بدنه‌ی PUT در دو شکل: { readIds } جایگزین کامل است (ادغام هنگام ورود و
 * «از نو»)؛ { add, remove } فقط تغییر است (تیک زدن)، تا تبی که ادغامش کهنه
 * است تیک‌های دستگاه دیگر را از روی سرور پاک نکند. ایمیل را خودش normalize
 * و شناسه‌ها را dedupe می‌کند.
 */
export function validateProgressBody(body) {
  if (!isPlainObject(body)) return { ok: false };
  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) return { ok: false };
  const { topicId } = body;
  if (typeof topicId !== 'string' || topicId.length === 0 || topicId.length > MAX_TOPIC_ID) {
    return { ok: false };
  }
  if (body.readIds !== undefined) {
    const readIds = validIds(body.readIds);
    return readIds ? { ok: true, value: { email, topicId, readIds } } : { ok: false };
  }
  if (body.add === undefined && body.remove === undefined) return { ok: false };
  const add = validIds(body.add ?? []);
  const remove = validIds(body.remove ?? []);
  if (!add || !remove || add.length + remove.length > MAX_IDS) return { ok: false };
  return { ok: true, value: { email, topicId, add, remove } };
}

/** فقط رشته‌ها از یک مقدارِ احتمالاً بی‌شکل؛ هر چیز دیگر یعنی «هیچ». */
function stringsOf(value) {
  return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
}

/**
 * اجتماع به‌ازای هر موضوع، تا هیچ تیکی از هیچ طرف گم نشود. پاسخ سرور
 * ممکن است هر چیزی باشد (مثلاً HTML یک proxy)؛ آن را نادیده می‌گیریم،
 * نه استثنا.
 */
export function mergeProgress(local, remote) {
  const merged = {};
  for (const [topic, ids] of Object.entries(local)) {
    merged[topic] = new Set(stringsOf(ids));
  }
  if (isPlainObject(remote)) {
    for (const [topic, ids] of Object.entries(remote)) {
      if (!Array.isArray(ids)) continue;
      merged[topic] ??= new Set();
      for (const id of stringsOf(ids)) merged[topic].add(id);
    }
  }
  return Object.fromEntries(Object.entries(merged).map(([topic, set]) => [topic, [...set]]));
}

/** موضوع‌هایی که نتیجه‌ی ادغامشان با سرور فرق دارد و باید PUT شوند. */
export function topicsToPush(merged, remote) {
  const server = isPlainObject(remote) ? remote : {};
  return Object.keys(merged).filter((topic) => {
    const mine = new Set(merged[topic]);
    const theirs = new Set(stringsOf(server[topic]));
    if (mine.size !== theirs.size) return true;
    for (const id of mine) if (!theirs.has(id)) return true;
    return false;
  });
}
