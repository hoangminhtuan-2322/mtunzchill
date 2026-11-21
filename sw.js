const CACHE='mtunzchill-v4-20261121';
const RESOURCES=[
  './index.html',
  './manifest.webmanifest',
  './assets/styles.css',
  './assets/upgrade.css',
  './assets/favicon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/scene-forest.svg',
  './assets/world-forest.webp',
  './assets/art-stars.webp',
  './assets/scene-cafe.svg',
  './assets/art-sand.webp',
  './assets/art-fish.webp',
  './assets/world-cafe.webp',
  './assets/art-breathe.webp',
  './assets/hero-world.webp',
  './assets/art-match.webp',
  './assets/world-rain.webp',
  './assets/world-beach.webp',
  './assets/art-pop.webp',
  './assets/room-rain.webp',
  './assets/scene-beach.svg',
  './src/app.js',
  './src/games.js',
  './src/audio.js',
  './src/data.js',
  './src/wellbeing.js'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(RESOURCES)))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith('mtunzchill-')&&key!==CACHE)await caches.delete(key)}await self.clients.claim()})())});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){event.respondWith((async()=>{try{const res=await fetch(req);if(res.ok){const cache=await caches.open(CACHE);cache.put('./index.html',res.clone()).catch(()=>{})}return res}catch{return(await caches.match('./index.html'))||Response.error()}})());return}
 event.respondWith((async()=>{const cached=await caches.match(req);if(cached)return cached;try{const res=await fetch(req);if(res.ok){const cache=await caches.open(CACHE);cache.put(req,res.clone()).catch(()=>{})}return res}catch{return Response.error()}})());
});
