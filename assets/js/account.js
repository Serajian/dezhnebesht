// پنل «ذخیره‌ی پیشرفت با ایمیل» و همگام‌سازی تیک‌ها با سرور.
// localStorage منبع اصلی می‌ماند: این ماژول فقط یک نسخه‌ی آن را روی سرور
// نگه می‌دارد. هر خطای شبکه بی‌صدا رد می‌شود — تیک محلی ذخیره شده است و
// سایت نباید به خاطر سرور از کار بیفتد. روی GitHub Pages /api/health
// ۴۰۴ می‌دهد و دکمه هرگز ظاهر نمی‌شود.
import * as i18n from './i18n.js';
import { normalizeEmail, isValidEmail, mergeProgress, topicsToPush } from './sync.js';

const ACCOUNT_KEY = 'dezhnebesht:account';
const DEBOUNCE_MS = 800;

let deps = null;
let ui = null;
let available = false;
let errorShown = false;
/**
 * topicId → { timer, add, remove }: تغییرهای جمع‌شده در پنجره‌ی debounce.
 * تیک به‌صورت تغییر فرستاده می‌شود، نه کل مجموعه، تا تبی که ادغامش کهنه است
 * تیک‌های دستگاه دیگر را از روی سرور پاک نکند.
 */
const pending = new Map();

function currentEmail() {
  try {
    return localStorage.getItem(ACCOUNT_KEY) || '';
  } catch {
    return '';
  }
}

function storeEmail(email) {
  try {
    if (email) localStorage.setItem(ACCOUNT_KEY, email);
    else localStorage.removeItem(ACCOUNT_KEY);
  } catch {
    // حالت خصوصی؛ ورود فقط در همین نشست معنا ندارد ولی چیزی هم نمی‌شکند
  }
}

function send(body, keepalive = false) {
  return fetch('/api/progress', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive,
  }).catch(() => {});
}

/** پیشرفت سرور را با محلی اجتماع می‌کند و نتیجه را به هر دو طرف می‌نویسد. */
async function syncNow(email) {
  try {
    const res = await fetch(`/api/progress?email=${encodeURIComponent(email)}`);
    if (!res.ok) return;
    const remote = await res.json();
    // اگر در این فاصله خارج شد یا ایمیل دیگری زد، این پاسخ دیگر مال او نیست.
    if (currentEmail() !== email) return;
    const merged = mergeProgress(deps.getLocal(), remote);
    for (const [topicId, ids] of Object.entries(merged)) deps.setLocal(topicId, ids);
    for (const topicId of topicsToPush(merged, remote)) {
      send({ email, topicId, readIds: merged[topicId] });
    }
    deps.onMerged();
  } catch {
    // سرور در دسترس نیست یا پاسخ JSON نبود؛ بارگذاری بعدی دوباره امتحان می‌کند
  }
}

function sendNow(topicId, keepalive) {
  const change = pending.get(topicId);
  if (!change) return;
  clearTimeout(change.timer);
  pending.delete(topicId);
  const email = currentEmail();
  if (!email || (change.add.size === 0 && change.remove.size === 0)) return;
  send({ email, topicId, add: [...change.add], remove: [...change.remove] }, keepalive);
}

function flushPending(keepalive) {
  for (const topicId of [...pending.keys()]) sendNow(topicId, keepalive);
}

/** بعد از هر تیک (read: true) یا برداشتن تیک (read: false)؛ با debounce. */
export function pushTick(topicId, entryId, read) {
  if (!available || !deps || !currentEmail()) return;
  const change = pending.get(topicId) ?? { timer: 0, add: new Set(), remove: new Set() };
  clearTimeout(change.timer);
  // تیک و برداشتنِ پشت سر هم یکدیگر را خنثی می‌کنند، پس هر شناسه فقط در یکی است.
  (read ? change.remove : change.add).delete(entryId);
  (read ? change.add : change.remove).add(entryId);
  change.timer = setTimeout(() => sendNow(topicId, false), DEBOUNCE_MS);
  pending.set(topicId, change);
}

/** «از نو» عمداً همه را پاک می‌کند، پس جایگزین کامل است و تغییرهای معلق دور ریخته می‌شوند. */
export function pushReset(topicId) {
  if (!available || !deps || !currentEmail()) return;
  clearTimeout(pending.get(topicId)?.timer);
  pending.delete(topicId);
  send({ email: currentEmail(), topicId, readIds: [] });
}

function showState() {
  const email = currentEmail();
  ui.form.hidden = Boolean(email);
  ui.signed.hidden = !email;
  ui.signedEmail.textContent = email;
}

function setError(on) {
  errorShown = on;
  ui.error.textContent = on ? i18n.t('account.invalid') : '';
}

export function refreshLabels() {
  if (!ui) return;
  ui.button.title = i18n.t('account.buttonLabel');
  ui.button.setAttribute('aria-label', i18n.t('account.buttonLabel'));
  ui.label.textContent = i18n.t('account.emailLabel');
  ui.hint.textContent = i18n.t('account.hint');
  ui.submit.textContent = i18n.t('account.submit');
  ui.signedLabel.textContent = i18n.t('account.signedInAs');
  ui.signOut.textContent = i18n.t('account.signOut');
  setError(errorShown);
}

function isOpen() {
  return !ui.panel.hidden;
}

function open() {
  showState();
  ui.panel.hidden = false;
  ui.button.setAttribute('aria-expanded', 'true');
  (currentEmail() ? ui.signOut : ui.input).focus();
}

function close({ refocus = true } = {}) {
  if (!isOpen()) return;
  ui.panel.hidden = true;
  ui.button.setAttribute('aria-expanded', 'false');
  setError(false);
  if (refocus) ui.button.focus();
}

function wire() {
  ui.button.addEventListener('click', () => (isOpen() ? close() : open()));

  ui.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = normalizeEmail(ui.input.value);
    if (!isValidEmail(email)) {
      setError(true);
      ui.input.focus();
      return;
    }
    setError(false);
    storeEmail(email);
    ui.input.value = '';
    showState();
    ui.signOut.focus();
    // رابط منتظر سرور نمی‌ماند؛ اگر الان در دسترس نیست، بارگذاری بعدی ادغام می‌کند.
    syncNow(email);
  });

  ui.input.addEventListener('input', () => {
    if (errorShown) setError(false);
  });

  ui.signOut.addEventListener('click', () => {
    // تیک‌هایی که پیش از خروج زده شده‌اند هنوز مال همین ایمیل‌اند.
    flushPending(false);
    storeEmail('');
    showState();
    ui.input.focus();
  });

  ui.root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      event.stopPropagation();
      close();
    }
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && !ui.root.contains(event.target)) close({ refocus: false });
  });

  window.addEventListener('pagehide', () => flushPending(true));
}

/**
 * getLocal: پیشرفت محلی همه‌ی موضوع‌ها؛ setLocal: نوشتن یک موضوع در
 * localStorage؛ onMerged: بعد از ادغام، تا نقشه تیک‌های تازه را نشان دهد.
 */
export async function initAccount({ root, getLocal, setLocal, onMerged }) {
  deps = { getLocal, setLocal, onMerged };
  ui = {
    root,
    button: root.querySelector('.chrome-account'),
    panel: root.querySelector('.account-panel'),
    form: root.querySelector('.account-form'),
    label: root.querySelector('.account-label'),
    input: root.querySelector('.account-input'),
    hint: root.querySelector('.account-hint'),
    error: root.querySelector('.account-error'),
    submit: root.querySelector('.account-submit'),
    signed: root.querySelector('.account-signed'),
    signedLabel: root.querySelector('.account-signed-label'),
    signedEmail: root.querySelector('.account-signed-email'),
    signOut: root.querySelector('.account-signout'),
  };
  refreshLabels();
  wire();

  try {
    const res = await fetch('/api/health');
    if (!res.ok) return;
    const body = await res.json();
    if (body?.ok !== true) return;
  } catch {
    return;
  }

  available = true;
  ui.button.hidden = false;
  const email = currentEmail();
  if (email) syncNow(email);
}
