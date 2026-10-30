// Livro Pecuário Weber — guarda o app no celular para abrir sem internet.
const VERSAO = 'livro-weber-v3';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSAO; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;     // conversa com o Google: sempre pela rede
  // tenta a rede (pega versão nova quando tem sinal); sem sinal, usa o que está guardado
  e.respondWith(
    fetch(e.request).then(function (r) {
      const copia = r.clone();
      caches.open(VERSAO).then(function (c) { c.put(e.request.url.split('?')[0], copia); });
      return r;
    }).catch(function () {
      return caches.match(e.request.url.split('?')[0]).then(function (r) { return r || caches.match('./index.html'); });
    })
  );
});
