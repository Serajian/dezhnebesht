// مسیرهای /api/ — فقط وقتی serve.js با DB_PATH اجرا شود بار می‌شود.
// ایمیل عمداً تأیید نمی‌شود (سند طراحی ۲۰۲۶-۱۰-۰۶)؛ محدودیت نرخ فقط جلوی
// امتحان انبوه ایمیل‌ها را می‌گیرد، نه حمله‌ی جدی را.
import { openStore } from './progress-store.js';
import {
  normalizeEmail,
  isValidEmail,
  validateProgressBody,
  MAX_BODY_BYTES,
} from '../assets/js/sync.js';

// بعد از این مقدار دیگر حتی برای دور ریختن هم نمی‌خوانیم و اتصال را می‌بُریم.
const DRAIN_LIMIT = MAX_BODY_BYTES * 16;

function send(res, status, body) {
  const headers = { 'Cache-Control': 'no-store' };
  if (body === undefined) {
    res.writeHead(status, headers);
    res.end();
    return;
  }
  headers['Content-Type'] = 'application/json; charset=utf-8';
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

/** پشت Traefik ِ Dokploy، IP واقعی اولین مقدار X-Forwarded-For است. */
function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress ?? '';
}

/**
 * بدنه را تا سقف می‌خواند. بیش از سقف را تا انتها دور می‌ریزد و null
 * می‌دهد، تا پاسخ 413 پیش از تمام شدن ارسال کلاینت نرسد و اتصال reset نشود.
 */
function readBody(req) {
  return new Promise((done, fail) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > DRAIN_LIMIT) {
        req.destroy();
        return;
      }
      if (size <= MAX_BODY_BYTES) chunks.push(chunk);
    });
    req.on('end', () => done(size > MAX_BODY_BYTES ? null : Buffer.concat(chunks).toString('utf8')));
    req.on('error', fail);
  });
}

export function createApi({ dbPath, limit = 60, windowMs = 60_000, now = Date.now }) {
  const store = openStore(dbPath);
  let windowStart = now();
  let counts = new Map();

  /** پنجره‌ی ثابت؛ با پنجره‌ی تازه کل شمارنده‌ها دور ریخته می‌شود تا حافظه رشد نکند. */
  function overLimit(ip) {
    const t = now();
    if (t - windowStart >= windowMs) {
      windowStart = t;
      counts = new Map();
    }
    const count = (counts.get(ip) ?? 0) + 1;
    counts.set(ip, count);
    return count > limit;
  }

  async function handleProgressPut(req, res) {
    const declared = Number(req.headers['content-length']);
    const raw = await readBody(req);
    if (raw === null || declared > MAX_BODY_BYTES) return send(res, 413, { error: 'too large' });
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return send(res, 400, { error: 'invalid json' });
    }
    const checked = validateProgressBody(body);
    if (!checked.ok) return send(res, 400, { error: 'invalid body' });
    const { email, topicId, readIds, add, remove } = checked.value;
    if (readIds) store.put(email, topicId, readIds, now());
    else store.applyDelta(email, topicId, add, remove, now());
    return send(res, 204);
  }

  async function handle(req, res) {
    try {
      if (overLimit(clientIp(req))) {
        req.resume();
        return send(res, 429, { error: 'too many requests' });
      }
      const url = new URL(req.url, 'http://localhost');

      if (url.pathname === '/api/health') {
        if (req.method !== 'GET') return send(res, 405, { error: 'method not allowed' });
        return send(res, 200, { ok: true });
      }

      if (url.pathname === '/api/progress') {
        if (req.method === 'GET') {
          const email = normalizeEmail(url.searchParams.get('email'));
          if (!isValidEmail(email)) return send(res, 400, { error: 'invalid email' });
          return send(res, 200, store.getAll(email));
        }
        if (req.method === 'PUT') return await handleProgressPut(req, res);
        req.resume();
        return send(res, 405, { error: 'method not allowed' });
      }

      req.resume();
      return send(res, 404, { error: 'not found' });
    } catch (error) {
      console.error(error);
      if (!res.headersSent) send(res, 500, { error: 'internal error' });
      else res.end();
    }
  }

  return {
    handle,
    close() {
      store.close();
    },
  };
}
