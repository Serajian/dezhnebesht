function decodePart(part) {
  try {
    return decodeURIComponent(part);
  } catch {
    return part; // درصدکد خراب؛ خام برگردان تا صفحه از کار نیفتد
  }
}

/**
 * تجزیه‌ی خالص هش. هر مسیر ناشناخته به فهرست برمی‌گردد،
 * چون صفحه‌ی سفید بدترین حالت ممکن است.
 */
export function parseHash(hash) {
  const raw = String(hash ?? '').replace(/^#/, '');
  const parts = raw.split('/').filter(Boolean).map(decodePart);

  if (parts[0] === 'self-test') return { view: 'self-test' };
  if (parts[0] === 't' && parts[1]) return { view: 'entry', id: parts[1] };
  if (parts[0] === 'tag' && parts[1]) return { view: 'index', topic: '', tag: parts[1] };
  if (parts[0] === 'topic' && parts[1]) return { view: 'index', topic: parts[1], tag: '' };
  return { view: 'index', topic: '', tag: '' };
}

export function start(onChange) {
  const fire = () => onChange(parseHash(window.location.hash));
  window.addEventListener('hashchange', fire);
  fire();
}

export function go(path) {
  window.location.hash = path;
}
