registerServiceWorker = () => {
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.register('/sw.js').then(function (reg) {
    console.log('Registration Worked!', reg);
    if (!navigator.serviceWorker.controller) {
      return;
    }
  //  var form = document.getElementById('formular')
  /*
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        var message = {
          phoneNumber: phoneNumberField.value,
          body: bodyField.value
        };
        alert("eeee")
        // do more stuff here
  });*/

  }).catch(function () {
    console.log('Registration failed!')
  });
}

openDatabase = () => {
  return idb.open('restaurants', 1, upgradeDB => {
    switch (upgradeDB.oldVersion) {
      case 0:
        const store = upgradeDB.createObjectStore('restaurants', {keyPath: 'id'})
        upgradeDB.createObjectStore('reviews', {keyPath: 'id'})
        upgradeDB.createObjectStore('outboxreviews', {autoIncrement : true, keyPath: 'id'})
    }
  })
}


registerServiceWorker();
const dbPromise = openDatabase()
console.log('dbPromise', dbPromise)

fetch('http://localhost:1337/reviews')
  .then(function(response) {
    return response.json();
  })
  .then(function(reviews) {
    dbPromise.then(function(db) {
      if(!db) return;
      var tx = db.transaction('reviews', 'readwrite');
      console.log('tx', tx)
      var store = tx.objectStore('reviews');
      reviews.map((review)=>{
        store.put(review)
      })
    })
  })
  .catch((err) => {
    console.log("Error fetching data.")
  });

fetch('http://localhost:1337/restaurants')
.then(function(response) {
  return response.json();
})
.then(function(restaurants) {
  dbPromise.then(function(db) {
    if(!db) return;
    var tx = db.transaction('restaurants', 'readwrite');
    var store = tx.objectStore('restaurants');
    restaurants.map((restaurant)=>{
      store.put(restaurant)
    })
  })
})
.catch((err) => {
  console.log("Error fetching data.")
});
