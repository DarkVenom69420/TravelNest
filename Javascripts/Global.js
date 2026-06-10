//Shared Icon Map
const TravelNestIcons = {
  visited: "../Svgs/Visited.svg",
  planned: "../Svgs/Planned.svg",
  edit: "../Svgs/Edit.svg",
  delete: "../Svgs/Delete.svg"
};

//Returns an <img> tag for a named icon.
//The aria-hidden="true" hides it from screen readers.
function travelNestIcon(name, extraClass = "") {
  return `<img class="btn-icon${extraClass ? ` ${extraClass}` : ""}" src="${TravelNestIcons[name]}" alt="" width="14" height="14" aria-hidden="true" />`;
}

//Reusable functions to save and load JSON data
const TravelNestUtils = {
  saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  loadJSON(key, fallback = []) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
};

//Theme Toggle Label
function updateThemeToggleLabel() {
  const label = document.querySelector(".theme-toggle__label");
  if (label) label.textContent = document.body.classList.contains("darkmode") ? "Dark" : "Light";
}

//Shared Header & Footer Renderer
function renderSharedHeaderFooter() {
  const page = document.body.dataset.page || "";
  const links = [
    ["home", "Home.html", "Home"],
    ["explorer", "Explorer.html", "Destination Explorer"],
    ["budget", "Budget Planner.html", "Trip Budget"],
    ["random", "Random Trip.html", "Random Trip"],
    ["mood", "Travel Mood.html", "Travel Mood"],
    ["feedback", "Feedback.html", "Feedback & Support"]
  ];

  //Build <li> elements for the header nav
  const navItems = links.map(([id, href, label]) =>
    `<li><a class="${page === id ? "active" : ""}" href="${href}">${label}</a></li>`
  ).join("");

  //Build <a> elements for the footer nav
  const footerItems = links.map(([id, href, label]) =>
    `<a class="${page === id ? "active" : ""}" href="${href}">${label}</a>`
  ).join("");

  document.getElementById("site-header").innerHTML = `
    <header class="site-header glass-effect">
      <div class="nav-wrap">
        <a href="Home.html" class="brand"><img src="../Svgs/Favicon.svg" alt="" />TravelNest<span class="brand__dot">.</span></a>
        <div class="nav-actions">
          <button type="button" id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
            <span class="theme-toggle__icon" aria-hidden="true"></span>
            <span class="theme-toggle__label">Light</span>
          </button>
          <button type="button" id="hamburger" class="hamburger" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
        <ul id="nav-links" class="nav-links">${navItems}</ul>
      </div>
    </header>
  `;

  document.getElementById("site-footer").innerHTML = `
    <footer class="site-footer">
      <div class="footer-wrap">
        <form id="newsletter-form">
          <label for="newsletter-email">Newsletter subscription</label>
          <div class="newsletter-row">
            <input id="newsletter-email" type="text" placeholder="you@example.com" />
            <button class="btn" type="submit">Subscribe</button>
          </div>
          <small id="newsletter-status" aria-live="polite"></small>
        </form>
        <nav class="footer-nav">${footerItems}</nav>
      </div>
    </footer>
  `;
}

//Shared Interaction Handlers
function initSharedInteractions() {
  //Hamburger menu toggle
  const burger = document.getElementById("hamburger");
  const nav = document.getElementById("nav-links");
  burger?.addEventListener("click", () => {
    nav.classList.toggle("open");
    burger.classList.toggle("open");
    burger.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
  });

  //Theme toggle
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    document.body.classList.toggle("darkmode");
    localStorage.setItem("TravelNest_Theme", document.body.classList.contains("darkmode") ? "dark" : "light");
    updateThemeToggleLabel();
  });

  //Newsletter form submission
  const form = document.getElementById("newsletter-form");
  const status = document.getElementById("newsletter-status");
  const emailInput = document.getElementById("newsletter-email");

  //Resetting errors
  emailInput?.addEventListener("input", () => emailInput.setCustomValidity(""));

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();

    //Email validation
    if (!email.endsWith("@gmail.com")) {
      emailInput.setCustomValidity("Please provide a valid Gmail address.");
      emailInput.reportValidity();
      return;
    }

    //Save the email and show a confirmation message
    localStorage.setItem("TravelNest_Newsletter_Email", email);
    status.textContent = "Subscribed successfully. Saved in localStorage.";
    form.reset();
  });
}

//Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("TravelNest_Theme") === "dark") document.body.classList.add("darkmode");

  renderSharedHeaderFooter();
  updateThemeToggleLabel();
  initSharedInteractions();
  //Register the service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("../PWA/Service Worker.js").catch(() => { });
  }
});