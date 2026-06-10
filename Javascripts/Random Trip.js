document.addEventListener("DOMContentLoaded", () => {

  //DOM References & Constants
  const form = document.getElementById("random-form");
  const result = document.getElementById("random-result");
  const list = document.getElementById("wishlist");
  const key = "TravelNest_Wishlist";
  const surpriseBtn = document.getElementById("surprise-btn");

  //Wishlist Renderer
  const renderWishlist = () => {
    const items = TravelNestUtils.loadJSON(key, []);
    list.innerHTML = items.length
      ? items.map((name, index) => `
          <li>
            <span>${name}</span>
            <button type="button" class="btn btn-small btn--danger" data-delete-index="${index}">${travelNestIcon("delete")} Delete</button>
          </li>
        `).join("")
      : "<li>No wishlist items yet.</li>";
  };

  //Delete Wishlist Entry
  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-delete-index]");
    if (!btn) return;
    const items = TravelNestUtils.loadJSON(key, []);
    items.splice(Number(btn.dataset.deleteIndex), 1);
    TravelNestUtils.saveJSON(key, items);
    renderWishlist();
  });

  //Result Display
  function showResult(pick) {
    result.innerHTML = `
      <h2>${pick.name}</h2>
      <p>${pick.description}</p>
      <a class="btn" href="Explorer.html?focus=${pick.id}">Open in Explorer</a>
      <button type="button" id="save-wishlist" class="btn">Save to Wishlist</button>
    `;
    document.getElementById("save-wishlist").onclick = () => {
      const existing = TravelNestUtils.loadJSON(key, []);
      if (!existing.includes(pick.name)) {
        existing.push(pick.name);
        TravelNestUtils.saveJSON(key, existing);
        renderWishlist();
      }
    };
  }

  //Picks a random item from an array
  const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

  //Filter Based Suggestion
  function suggestFromFilters() {
    const type = document.getElementById("travel-type").value;
    const budget = document.getElementById("budget-range").value;

    const scored = destinationData
      .map((d) => ({ destination: d, score: (d.type === type ? 2 : 0) + (d.budget === budget ? 2 : 0) }))
      .sort((a, b) => b.score - a.score);

    //All destinations with the top score go for the random pick
    const pool = scored.filter((item) => item.score === scored[0].score).map((item) => item.destination);
    showResult(pickRandom(pool));
  }

  //Filter form submission
  form.addEventListener("submit", (e) => { e.preventDefault(); suggestFromFilters(); });

  //Surprise Me Button
  surpriseBtn.addEventListener("click", () => {
    surpriseBtn.classList.remove("surprise-bounce");
    void surpriseBtn.offsetWidth;
    surpriseBtn.classList.add("surprise-bounce");
    showResult(pickRandom(destinationData));
  });

  //Load wishlist on page load
  renderWishlist();
});
