/* 火柴人格斗 — Service Worker：离线缓存应用壳，安装到主屏幕后全屏独立运行
   v2：network-first——在线时始终取最新文件，离线回退到缓存；升级时清理旧缓存 */
var CACHE = 'stickfight-v2';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-1024.png',
  './peerjs.min.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return Promise.all(ASSETS.map(function(a){
        return c.add(a).catch(function(){ /* peerjs.min.js 可能缺失，CDN 兜底，忽略 */ });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;   /* 信令等跨域请求不缓存，走网络 */
  e.respondWith(
    fetch(e.request).then(function(res){
      /* 在线：返回网络结果并顺手更新缓存 */
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      }
      return res;
    }).catch(function(){
      /* 离线：回退到缓存，再回退到应用壳 */
      return caches.match(e.request).then(function(hit){
        return hit || caches.match('./index.html');
      });
    })
  );
});
