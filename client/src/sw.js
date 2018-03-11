'use strict';
importScripts('/js/idb.js');
importScripts('/js/store.js');

var CACHE_NAME = 'restaurant-cache-15';

self.addEventListener('install', function (event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll([
          '/',
          'index.html',
          'restaurant.html',
          'css/styles.css',
          'css/responsive.css',
          'js/dbhelper.js',
          'js/lazyload.js',
          'js/main.js',
          'js/idb.js',
          'js/IndexController.js',
          'js/restaurant_info.js',
          'js/store.js',
          'img/1.webp',
          'img/2.webp',
          'img/3.webp',
          'img/4.webp',
          'img/5.webp',
          'img/6.webp',
          'img/7.webp',
          'img/8.webp',
          'img/9.webp',
          'img/10.webp'
        ]);
      })
  );
});


self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-') &&
                 cacheName != CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(response => {
      return response || fetch(event.request);
    })
    .catch(err => console.log(err, event.request))
  );
});

//https://www.twilio.com/blog/2017/02/send-messages-when-youre-back-online-with-service-workers-and-background-sync.html
self.addEventListener('sync', function(event) {
  event.waitUntil(
    store.outbox('readonly').then(function(outbox) {
      return outbox.getAll();
    }).then(function(messages) {
      return Promise.all(
        messages.map(function(message) {
          console.log("Fetching :)")
          return fetch('http://localhost:1337/reviews/', {
            method: 'POST',
            body: JSON.stringify(message)
          }).then(function(response) {  
            return response.json();
          }).then(function(data) {
            console.log(data)
            return store.outbox('readwrite').then(function(outbox) {
              return outbox.delete(message.id);
            });
          })
        }))
      })
  );
})
