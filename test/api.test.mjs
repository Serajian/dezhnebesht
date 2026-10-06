import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createApi } from '../server/api.js';

const ROOT = resolve(import.meta.dirname, '..');

/** API را روی پورت تصادفی بالا می‌آورد؛ برمی‌گرداند پایه‌ی URL و تابع بستن. */
async function startApi(options) {
  const api = createApi(options);
  const server = createServer(api.handle);
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const base = `http://127.0.0.1:${server.address().port}`;
  const stop = async () => {
    await new Promise((done) => server.close(done));
    api.close();
  };
  return { base, stop };
}

let dir;
let dbPath;
let main;

before(async () => {
  dir = await mkdtemp(join(tmpdir(), 'dezh-'));
  dbPath = join(dir, 'p.db');
  main = await startApi({ dbPath });
});

after(async () => {
  await main.stop();
  await rm(dir, { recursive: true, force: true });
});

function put(base, body) {
  return fetch(`${base}/api/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function get(base, email) {
  const query = email === undefined ? '' : `?email=${email}`;
  return fetch(`${base}/api/progress${query}`);
}

test('api: health', async () => {
  const res = await fetch(`${main.base}/api/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

test('api: رفت‌وبرگشت', async () => {
  const res = await put(main.base, { email: 'a@b.co', topicId: 'acid', readIds: ['x', 'y'] });
  assert.equal(res.status, 204);
  const back = await get(main.base, 'a@b.co');
  assert.equal(back.status, 200);
  assert.deepEqual(await back.json(), { acid: ['x', 'y'] });
});

test('api: PUT دوم جایگزین کامل است', async () => {
  await put(main.base, { email: 'r@b.co', topicId: 'acid', readIds: ['x', 'y'] });
  assert.equal((await put(main.base, { email: 'r@b.co', topicId: 'acid', readIds: [] })).status, 204);
  assert.deepEqual(await (await get(main.base, 'r@b.co')).json(), { acid: [] });
});

test('api: ایمیل با حروف بزرگ همان ردیف را می‌خواند', async () => {
  await put(main.base, { email: 'c@b.co', topicId: 'swarm', readIds: ['n'] });
  const res = await get(main.base, encodeURIComponent(' C@B.CO'));
  assert.deepEqual(await res.json(), { swarm: ['n'] });
});

test('api: ایمیل ناشناخته {}', async () => {
  const res = await get(main.base, 'nobody@b.co');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {});
});

test('api: ورودی بد 400', async () => {
  assert.equal((await get(main.base)).status, 400);
  assert.equal((await get(main.base, 'nope')).status, 400);
  assert.equal((await put(main.base, '{')).status, 400);
  assert.equal((await put(main.base, '[]')).status, 400);
  assert.equal((await put(main.base, { email: 'a@b.co', topicId: '', readIds: [] })).status, 400);
  assert.equal((await fetch(`${main.base}/api/health`)).status, 200);
});

test('api: بدنه‌ی بزرگ 413', async () => {
  const res = await put(main.base, 'x'.repeat(70_000));
  assert.equal(res.status, 413);
});

test('api: متد غلط 405', async () => {
  assert.equal((await fetch(`${main.base}/api/progress`, { method: 'DELETE' })).status, 405);
  assert.equal((await fetch(`${main.base}/api/nope`)).status, 404);
});

test('api: بیش از سقف نرخ 429', async () => {
  let clock = 1_000_000;
  const limited = await startApi({ dbPath: join(dir, 'rate.db'), limit: 3, now: () => clock });
  try {
    for (let i = 0; i < 3; i++) {
      assert.equal((await fetch(`${limited.base}/api/health`)).status, 200);
    }
    assert.equal((await fetch(`${limited.base}/api/health`)).status, 429);
    clock += 60_000;
    assert.equal((await fetch(`${limited.base}/api/health`)).status, 200);
  } finally {
    await limited.stop();
  }
});

test('api: داده بعد از بستن و باز کردن دوباره می‌ماند', async () => {
  const path = join(dir, 'persist.db');
  const first = await startApi({ dbPath: path });
  await put(first.base, { email: 'p@b.co', topicId: 'acid', readIds: ['k'] });
  await first.stop();
  const second = await startApi({ dbPath: path });
  try {
    assert.deepEqual(await (await get(second.base, 'p@b.co')).json(), { acid: ['k'] });
  } finally {
    await second.stop();
  }
});

test('serve: بدون DB_PATH، /api/health 404 است', async () => {
  const child = spawn(process.execPath, ['serve.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: '0', DB_PATH: '' },
  });
  try {
    const port = await new Promise((done, fail) => {
      let out = '';
      child.stdout.on('data', (chunk) => {
        out += chunk;
        const match = out.match(/:(\d+)/);
        if (match) done(Number(match[1]));
      });
      child.on('exit', (code) => fail(new Error(`serve.js exited ${code}`)));
    });
    assert.notEqual(port, 0);
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(res.status, 404);
  } finally {
    child.kill();
  }
});
