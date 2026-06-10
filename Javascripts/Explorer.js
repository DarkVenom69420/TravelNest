document.addEventListener("DOMContentLoaded", () => {

  //DOM References
  const grid = document.getElementById("destination-grid");
  const search = document.getElementById("search-input");
  const continent = document.getElementById("continent-filter");
  const modal = document.getElementById("destination-modal");
  const modalBody = document.getElementById("modal-body");

  //Continent Filter Dropdown
  [...new Set(destinationData.map((item) => item.continent))].forEach((value) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    continent.appendChild(opt);
  });

  //Card Rendering
  function renderCards(data) {
    if (!data.length) {
      grid.innerHTML = "<p>No destinations found for this filter.</p>";
      return;
    }
    grid.innerHTML = data.map((d, i) => `
      <article class="destination-card card-animate" data-id="${d.id}" tabindex="0" role="button" style="animation-delay:${i * 0.03}s">
        <div class="destination-card__image-wrap">
          <img src="${d.image}" alt="${d.name}" loading="lazy" />
        </div>
        <div class="destination-card__content">
          <h3>${d.name}</h3>
          <p>${d.continent}</p>
        </div>
      </article>
    `).join("");
  }

  //Filter Logic
  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    const selected = continent.value;
    renderCards(destinationData.filter((d) =>
      d.name.toLowerCase().includes(query) && (selected === "all" || d.continent === selected)
    ));
  }

  //Modal — Open & Close
  function openModalById(id) {
    const d = destinationData.find((item) => item.id === id);
    if (!d) return;

    modalBody.innerHTML = `
      <h2>${d.name}</h2>
      <p>${d.description}</p>
      <h3>Popular attractions</h3>
      <ul>${d.attractions.map((a) => `<li>${a}</li>`).join("")}</ul>
      <h3>Travel cost comparison (per day)</h3>
      <table>
        <thead>
          <tr><th>Budget level</th><th>Estimated cost (USD)</th></tr>
        </thead>
        <tbody>
          <tr><td>Low</td><td>$${d.costs.low}</td></tr>
          <tr><td>Moderate</td><td>$${d.costs.medium}</td></tr>
          <tr><td>Luxury</td><td>$${d.costs.high}</td></tr>
        </tbody>
      </table>
    `;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  //Deep Link Focus
  function focusCardById(id) {
    const card = grid.querySelector(`.destination-card[data-id="${id}"]`);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    openModalById(id);
  }

  //Search and filter controls
  search.addEventListener("input", applyFilters);
  continent.addEventListener("change", applyFilters);

  //Card click event listener
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".destination-card");
    if (card) openModalById(card.dataset.id);
  });

  //Keyboard accessibility 
  grid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".destination-card");
    if (!card) return;
    e.preventDefault();
    openModalById(card.dataset.id);
  });

  //Modal close handlers
  document.getElementById("close-modal").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  applyFilters(); //render all cards on first load

  //Check for ?focus= URL parameter
  const focusId = new URLSearchParams(window.location.search).get("focus");
  if (focusId) {
    setTimeout(() => focusCardById(focusId), 120);
  }
});
