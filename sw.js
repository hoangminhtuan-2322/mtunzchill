/* mtunzchill offline cache — never intercept or cache personal account endpoints. */
const CACHE='mtunzchill-v7-music-studio-20261121';
const RESOURCES=[
 './index.html','./manifest.webmanifest','./assets/styles.css','./assets/upgrade.css',
 './assets/auth.css','./assets/home-premium.css','./assets/music-studio.css','./assets/favicon.svg',
 './assets/icon-192.png','./assets/icon-512.png','./assets/scene-forest.svg',
 './assets/world-forest.webp','./assets/art-stars.webp','./assets/scene-cafe.svg',
 './assets/art-sand.webp','./assets/art-fish.webp','./assets/world-cafe.webp',
 './assets/art-breathe.webp','./assets/hero-world.webp','./assets/art-match.webp',
 './assets/world-rain.webp','./assets/world-beach.webp','./assets/art-pop.webp',
 './assets/room-rain.webp','./assets/scene-beach.svg',
 './src/app.js','./src/home.js','./src/music-hub.js','./src/auth.js','./src/games.js','./src/audio.js',
 './src/data.js','./src/wellbeing.js'
];
self.addEventListener('install',event=>event.waitUntil(
 caches.open(CACHE).then(cache=>cache.addAll(RESOURCES)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(key=>key.startsWith('mtunzchill-')&&key!==CACHE).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 // Account data and server APIs must never enter Cache Storage, even in an offline fallback.
 if(url.pathname.startsWith('/api/')||url.pathname==='/healthz'||req.headers.has('Authorization'))return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{
   try{const response=await fetch(req);if(response.ok&&response.type==='basic'){
     const cache=await caches.open(CACHE);cache.put('./index.html',response.clone()).catch(()=>{});
   }return response}catch{return(await caches.match('./index.html'))||Response.error()}
  })());return;
 }
 if(!/\.(?:css|js|svg|webp|png|webmanifest)$/.test(url.pathname))return;
 event.respondWith((async()=>{
  const cached=await caches.match(req);if(cached)return cached;
  try{const response=await fetch(req);if(response.ok&&response.type==='basic'){
   const cache=await caches.open(CACHE);cache.put(req,response.clone()).catch(()=>{});
  }return response}catch{return Response.error()}
 })());
});
