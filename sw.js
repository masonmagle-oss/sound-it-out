// Offline support. precache.json lists every app file with a hash; each visit downloads only files whose hash changed.
// The new copy replaces the old one only when complete, so a failed download keeps the old copy working.
const META = 'wp-meta';
const scope = self.registration.scope;
const abs = p => new URL(p, scope).href;
const say = async m => { for (const c of await self.clients.matchAll()) c.postMessage(m); };
const readMeta = async () => { const r = await (await caches.open(META)).match(abs('__meta')); return r ? r.json() : null; };

let running = null;
const update = () => running || (running = doUpdate().finally(() => { running = null; }));

async function doUpdate() {
  const old = await readMeta();
  let manifest;
  try {
    const r = await fetch(abs('precache.json'), { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    manifest = await r.json();
  } catch (e) { return say({ type: 'state', state: old ? 'ready' : 'none' }); }    // offline, or not published yet
  if (old && old.version === manifest.version) return say({ type: 'state', state: 'ready' });
  const name = 'wp-' + manifest.version;
  const cache = await caches.open(name), oldCache = old ? await caches.open(old.name) : null;
  const paths = Object.keys(manifest.files), total = paths.length;
  let done = 0, i = 0;
  const step = async () => {
    while (i < total) {
      const p = paths[i++], url = abs(p);
      if (!(await cache.match(url))) {                                     // already saved by an interrupted earlier try
        const same = old && old.files[p] === manifest.files[p] && oldCache && await oldCache.match(url);
        if (same) await cache.put(url, same);
        else {
          const r = await fetch(url, { cache: 'reload' });
          if (!r.ok) throw new Error(p + ' ' + r.status);
          await cache.put(url, r);
        }
      }
      if (++done % 25 === 0) say({ type: 'state', state: 'saving', done, total });
    }
  };
  try { await Promise.all([step(), step(), step(), step()]); }
  catch (e) { return say({ type: 'state', state: old ? 'ready' : 'failed' }); }   // the old copy (if any) stays in use
  await (await caches.open(META)).put(abs('__meta'), new Response(JSON.stringify({ name, version: manifest.version, files: manifest.files })));
  for (const k of await caches.keys()) if (k !== META && k !== name) await caches.delete(k);
  say({ type: 'state', state: 'ready', updated: true });
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim().then(update)));
self.addEventListener('message', e => { if (e.data && e.data.type === 'check') e.waitUntil(update()); });

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if ((req.method !== 'GET' && req.method !== 'HEAD') || !req.url.startsWith(scope)) return;
  e.respondWith(serve(req, url));
});

async function serve(req, url) {
  const meta = await readMeta();
  const hit = meta && await (await caches.open(meta.name)).match(url.pathname.endsWith('/') ? abs('index.html') : url.origin + url.pathname);
  if (!hit) return fetch(req).catch(() => new Response('', { status: 404 }));       // 404 (not a network error) so audio.js sees "no such clip"
  if (req.method === 'HEAD') return new Response(null, { status: 200, headers: hit.headers });
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') || '');
  if (!range) return hit;
  const blob = await hit.blob();                                                      // Safari plays audio only if byte ranges are answered
  const start = range[1] ? +range[1] : Math.max(0, blob.size - +range[2]);
  const end = range[1] && range[2] ? Math.min(+range[2], blob.size - 1) : blob.size - 1;
  return new Response(blob.slice(start, end + 1), { status: 206, headers: {
    'Content-Type': hit.headers.get('Content-Type') || 'audio/mpeg',
    'Content-Range': `bytes ${start}-${end}/${blob.size}`, 'Content-Length': String(end - start + 1) } });
}
