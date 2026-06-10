const CACHE_NAME = "travelnest";
const ASSETS_TO_CACHE = [
  "../Pages/Home.html",
  "../Pages/Explorer.html",
  "../Pages/Budget Planner.html",
  "../Pages/Random Trip.html",
  "../Pages/Travel Mood.html",
  "../Pages/Feedback.html",

  "../Stylesheets/Global.css",
  "../Stylesheets/Home.css",
  "../Stylesheets/Explorer.css",
  "../Stylesheets/Budget Planner.css",
  "../Stylesheets/Random Trip.css",
  "../Stylesheets/Travel Mood.css",
  "../Stylesheets/Feedback.css",

  "../Javascripts/Global.js",
  "../Javascripts/Home.js",
  "../Javascripts/Explorer.js",
  "../Javascripts/Budget Planner.js",
  "../Javascripts/Random Trip.js",
  "../Javascripts/Travel Mood.js",
  "../Javascripts/Feedback.js",
  "../Javascripts/Destination Data.js",

  "../Svgs/Favicon.svg",
  "../Svgs/Dark Mode Icon.svg",
  "../Svgs/Light Mode Icon.svg",
  "../Svgs/Dropdown.svg",
  "../Svgs/Delete.svg",
  "../Svgs/Edit.svg",
  "../Svgs/Planned.svg",
  "../Svgs/Visited.svg",
  "../Svgs/No Image.svg",
];

//Install and cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

//Remove old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) =>
          name !== CACHE_NAME ? caches.delete(name) : null
        )
      )
    )
  );
});

//Serve cached files first, otherwise use the network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(
      (response) => response || fetch(event.request)
    )
  );
});