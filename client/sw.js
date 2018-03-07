'use strict';

var CACHE_NAME = 'restaurant-cache-76';

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
          'js/main.js',
          'js/idb.js',
          'js/IndexController.js',
          'js/restaurant_info.js',
          'data/restaurants.json',
          'img/1.jpg',
          'img/2.jpg',
          'img/3.jpg',
          'img/4.jpg',
          'img/5.jpg',
          'img/6.jpg',
          'img/7.jpg',
          'img/8.jpg',
          'img/9.jpg',
          'img/10.jpg'
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

    //const dbPromise = idb.open('restaurants', 1)
    console.log("2222", idb)
    /*dbPromise.then(function(db) {

      if(!db) return;
      var tx = db.transaction('outboxreviews');
      var store = tx.objectStore('outboxreviews');
      console.log(store, store.getAll())
      return store.getAll();
    }).then(function(reviews) {
      console.log("Reviews: ", reviews)

    }).catch(function(err) {
        // something went wrong with the database or the sync registration, log and submit the form
        console.error(err);
        //form.submit();
});*/


  );
});
