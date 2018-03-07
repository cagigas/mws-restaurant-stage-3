let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

favoriteRestaurant = (fav) => {
  fetch(`http://localhost:1337/restaurants/${self.restaurant.id}/?is_favorite=${fav}`, {method: 'PUT'})
    .then(function(response) {
      return response.json();
    })
    .then(function(restaurant) {
      console.log(restaurant)
      const dbPromise = idb.open('restaurants', 1)
      dbPromise.then(function(db) {
        if(!db) return;
        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('reviews');
        store.put(restaurant)
      })
    })
    .catch((err) => {
      console.log("Fav rest err: ", err)
    });

}
/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  console.log(restaurant)
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name


  if(restaurant.is_favorite){
    name.innerHTML = `${restaurant.name}
    <svg class='heart' onClick="favoriteRestaurant(false)" viewBox="0 0 32 29.6">
      <path fill="red" d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
        c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
    </svg>`
  }else{
    name.innerHTML = `${restaurant.name}
    <svg class='heart' onClick="favoriteRestaurant(true)" viewBox="0 0 32 29.6">
      <path fill="red" stroke="red" fill-opacity="0" d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
        c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
    </svg>`
  }


  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = restaurant.name + " restaurant's"
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchReviewsByRestaurantId(restaurant.id, (error, reviews) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      fillReviewsHTML(reviews);
    }
  })

}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  console.log("Reviews: ", reviews)
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  ul.appendChild(newReviewHTML());

  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
 newReviewHTML = () => {

   let p, input
   const li = document.createElement('li');
   li.tabIndex = '0';

   const form = document.createElement('form');
   form.method = 'POST'
   form.action = 'http://localhost:1337/reviews/'

   const ul = document.createElement('ul');
   ul.id = 'restaurant-basic-nav';

   p = document.createElement('p');
   input = document.createElement('input');
   input.type = "name"
   input.placeholder = "Name"
   input.name = "name"
   p.appendChild(input);
   ul.appendChild(p);
   form.appendChild(ul);

   p = document.createElement('p');
   p.id = 'restaurant-rating';
   input = document.createElement('input');
   input.type = "number"
   input.placeholder = "Rating"
   input.name = "rating"
   input.min = "0"
   input.max = "5"
   input.step = "1"
   input.pattern = "\d+"
   p.appendChild(input);
   form.appendChild(p);

   input = document.createElement('input');
   input.type = "hidden"
   input.value = self.restaurant.id
   input.name = "restaurant_id"
   form.appendChild(input);

   p = document.createElement('p');
   p.id = 'restaurant-comment';
   const textarea = document.createElement('textarea');
   textarea.placeholder = "Comments"
   textarea.name = "comments"
   textarea.maxlength = "140"
   textarea.rows = "5"
   p.appendChild(textarea);
   form.appendChild(p);

   p = document.createElement('p');
   const button = document.createElement('button');
   button.innerHTML = "Submit"
   p.appendChild(button);
   form.appendChild(p);

   li.appendChild(form);

   return li;
 }

 createReviewHTML = (review) => {
   const li = document.createElement('li');

   const name = document.createElement('p');
   name.innerHTML = review.name;


   const date = document.createElement('p');
   date.innerHTML = new Date(review.createdAt).toLocaleString();
   date.id = 'restaurant-date';

   const ul = document.createElement('ul');
   ul.id = 'restaurant-basic-nav';

   ul.appendChild(name);
   ul.appendChild(date);
   li.appendChild(ul);


   const rating = document.createElement('p');
   rating.innerHTML = `Rating: ${review.rating}`;
   rating.id = 'restaurant-rating';
   li.appendChild(rating);

   const comments = document.createElement('p');
   comments.innerHTML = review.comments;
   comments.id = 'restaurant-comment';
   li.appendChild(comments);
   li.tabIndex = '0';

   return li;
 }

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
