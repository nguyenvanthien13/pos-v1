import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const dist = path.resolve('dist');
if (!fs.existsSync(path.join(dist,'index.html'))) throw new Error('Build Vite trước khi tạo service worker.');
const base = '/pos/';
const assets = [];
function walk(dir) { for(const e of fs.readdirSync(dir,{withFileTypes:true})) { const f=path.join(dir,e.name); if(e.isDirectory()) walk(f); else if(!e.name.endsWith('.map') && e.name!=='sw.js') assets.push(base + path.relative(dist,f).replaceAll(path.sep,'/')); }}
walk(dist);
const hash=crypto.createHash('sha256').update(assets.sort().join('|')).digest('hex').slice(0,12);
const sw=`const CACHE='nanghoa-pos-${hash}';
const BASE='${base}';
const PRECACHE=${JSON.stringify(assets)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('nanghoa-pos-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})());});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin||!url.pathname.startsWith(BASE)||url.pathname.includes('/api/'))return;if(req.mode==='navigate'){e.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(BASE,copy));}return response;}).catch(async()=>await caches.match(BASE)||await caches.match(BASE+'index.html')||Response.error()));return;}e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return response;})));});`;
fs.writeFileSync(path.join(dist,'sw.js'),sw);
console.log('Generated service worker with',assets.length,'assets; cache',hash);
