import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname);
// PORT=0 یعنی پورت تصادفی (تست‌ها از آن استفاده می‌کنند)، پس || جایز نیست.
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

// API پیشرفت فقط با DB_PATH ناخالی روشن می‌شود؛ بدون آن node:sqlite هرگز
// import نمی‌شود و /api/health مثل هر مسیر ناموجود 404 است — همان چیزی که
// مرورگر از آن می‌فهمد دکمه‌ی ورود را نشان ندهد.
// اگر دیتابیس باز نشود (مثلاً volume ِ /data با مالک root)، فقط ورود خاموش
// می‌شود؛ سایت ایستا نباید به خاطر آن بالا نیاید.
let api = null;
if (process.env.DB_PATH) {
  try {
    api = (await import('./server/api.js')).createApi({ dbPath: process.env.DB_PATH });
  } catch (error) {
    console.error(`API پیشرفت خاموش است — ${error.message}`);
  }
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  // میزبان ثابت، نه req.headers.host: هدر Host نامعتبر new URL را می‌ترکاند
  // و چون این callback async است، کل فرایند می‌مُرد.
  const url = new URL(req.url, 'http://localhost');

  if (api && url.pathname.startsWith('/api/')) {
    await api.handle(req, res);
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = join(ROOT, normalize(pathname));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`سرو می‌شود روی http://localhost:${server.address().port}`);
});
