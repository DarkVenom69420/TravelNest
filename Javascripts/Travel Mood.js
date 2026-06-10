document.addEventListener("DOMContentLoaded", () => {

  //DOM References
  const trackList = document.getElementById("track-list");
  const statusText = document.getElementById("sound-status");
  const customForm = document.getElementById("custom-destination-form");
  const editModal = document.getElementById("edit-custom-modal");
  const editForm = document.getElementById("edit-custom-form");
  const editId = document.getElementById("edit-custom-id");
  const editName = document.getElementById("edit-custom-name");
  const editImage = document.getElementById("edit-custom-image");
  const customNameInput = document.getElementById("custom-name");
  const customImageInput = document.getElementById("custom-image");

  //State & Constants
  const statusKey = "TravelNest_Travel_Status";
  const customKey = "TravelNest_Custom_Travel_Cards";
  const state = TravelNestUtils.loadJSON(statusKey, {});
  const customCards = TravelNestUtils.loadJSON(customKey, []);

  //Ambient Sounds
  const ambientFiles = {
    beach: "../Ambient Sounds/Beach.mp3",
    forest: "../Ambient Sounds/Forest.mp3",
    city: "../Ambient Sounds/City.mp3",
    rain: "../Ambient Sounds/Rain.mp3"
  };

  const noImage = "../Svgs/No Image.svg"; //fallback for broken or missing images
  let audioPlayer = null;                 //reference to the currently playing sound

  //Builds a plain object for a custom card
  const buildCustomCard = (input, id = null) => ({
    id: id || `custom-${Date.now()}`,
    name: input.name.trim(),
    image: input.image.trim(),
    isCustom: true
  });

  //Merges the destinationData with custom cards
  const getAllCards = () => [
    ...destinationData.map(({ id, name, image }) => ({ id, name, image, isCustom: false })),
    ...customCards.map(({ id, name, image }) => ({ id, name, image, isCustom: true }))
  ];

  //Status Label Builder
  const statusLabel = (status) => {
    if (status === "visited") return '<span class="status-line status-line--visited">Visited</span>';
    if (status === "planned") return '<span class="status-line status-line--planned">Planned</span>';
    return '<span class="status-line status-line--none">Not marked</span>';
  };

  //Card HTML Builder
  const cardMarkup = (card, index = 0, animate = true) => {
    const customButtons = card.isCustom
      ? `
          <button type="button" class="btn btn-small" data-edit-id="${card.id}">
            ${travelNestIcon("edit")} Edit
          </button>
          <button type="button" class="btn btn-small btn--danger" data-delete-id="${card.id}">
            ${travelNestIcon("delete")} Delete
          </button>
        `
      : "";

    return `
      <article
        class="track-card${animate ? " card-animate" : ""}"
        data-card-id="${card.id}"
        ${animate ? `style="animation-delay:${index * 0.03}s"` : ""}>

        <div class="track-card__image-wrap">
          <img
            class="track-card__img"
            src="${card.image}"
            alt="${card.name}"
            loading="lazy"
            onerror="this.onerror=null;this.src='${noImage}'">
        </div>

        <div class="track-card__content">
          <h3>${card.name}</h3>
          <p class="track-status">Status: ${statusLabel(state[card.id] || "none")}</p>
          <div class="track-actions">
            <button type="button" class="btn btn-small" data-id="${card.id}" data-status="visited">
              ${travelNestIcon("visited")} Visited
            </button>
            <button type="button" class="btn btn-small" data-id="${card.id}" data-status="planned">
              ${travelNestIcon("planned")} Planned
            </button>
            ${customButtons}
          </div>
        </div>
      </article>
    `;
  };

  //Renders all cards
  const renderTrackCards = () => {
    trackList.innerHTML = getAllCards().map((card, i) => cardMarkup(card, i)).join("");
  };

  //Updates only relevant cards
  const updateSingleCard = (id) => {
    const card = getAllCards().find((c) => c.id === id);
    const node = trackList.querySelector(`[data-card-id="${id}"]`);
    if (card && node) node.outerHTML = cardMarkup(card, 0, false).trim();
  };

  //Edit Modal Helpers
  const openEditModal = (id) => {
    const card = customCards.find((c) => c.id === id);
    if (!card) return;
    editId.value = card.id;
    editName.value = card.name;
    editImage.value = card.image;
    editModal.classList.add("open");
    editModal.setAttribute("aria-hidden", "false");
  };

  const closeEditModal = () => {
    editModal.classList.remove("open");
    editModal.setAttribute("aria-hidden", "true");
    editForm.reset();
  };

  //Ambient Sound Controls
  const setActiveAmbientButton = (soundName) => {
    document.querySelectorAll(".sound-btn").forEach((btn) => {
      btn.classList.toggle("sound-btn--active", btn.dataset.sound === soundName);
    });
  };

  const clearAmbientSound = (updateStatus = true) => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer = null;
    }
    setActiveAmbientButton(null);
    if (updateStatus) statusText.textContent = "No ambient sound selected.";
  };

  const playAmbient = (soundName) => {
    clearAmbientSound(false);
    const src = ambientFiles[soundName];
    if (!src) return;

    audioPlayer = new Audio(src);
    audioPlayer.loop = true;

    audioPlayer.play()
      .then(() => {
        statusText.textContent = `Now playing ${soundName}.`;
        setActiveAmbientButton(soundName);
      })
      .catch(() => {
        statusText.textContent = `Couldn't play ${soundName}. Check the file at: ${src}`;
        setActiveAmbientButton(null);
      });
  };

  //Event Listeners for sound buttons
  document.querySelectorAll(".sound-btn").forEach((btn) => {
    btn.addEventListener("click", () => playAmbient(btn.dataset.sound));
  });
  document.getElementById("ambient-none-btn").addEventListener("click", () => clearAmbientSound());

  //Track List planned or visited
  trackList.addEventListener("click", (event) => {
    //Delete custom card
    const deleteBtn = event.target.closest("[data-delete-id]");
    if (deleteBtn) {
      const id = deleteBtn.dataset.deleteId;
      const index = customCards.findIndex((c) => c.id === id);
      if (index !== -1) customCards.splice(index, 1);
      delete state[id];
      TravelNestUtils.saveJSON(customKey, customCards);
      TravelNestUtils.saveJSON(statusKey, state);
      trackList.querySelector(`[data-card-id="${id}"]`)?.remove();
      return;
    }

    //Open edit modal for a custom card
    const editBtn = event.target.closest("[data-edit-id]");
    if (editBtn) {
      openEditModal(editBtn.dataset.editId);
      return;
    }

    //Toggle Visited / Planned status
    const btn = event.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (state[id] === btn.dataset.status) {
      delete state[id];
    } else {
      state[id] = btn.dataset.status;
    }
    TravelNestUtils.saveJSON(statusKey, state);
    updateSingleCard(id);
  });

  //Add Custom Card Form
  customForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const card = buildCustomCard({ name: customNameInput.value, image: customImageInput.value });
    customCards.push(card);
    TravelNestUtils.saveJSON(customKey, customCards);
    customForm.reset();
    trackList.insertAdjacentHTML("beforeend", cardMarkup(card, 0, true));
  });

  //Edit Custom Card Form
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = editId.value;
    const index = customCards.findIndex((c) => c.id === id);
    if (index === -1) return;
    const card = buildCustomCard({ name: editName.value, image: editImage.value }, id);
    customCards[index] = card;
    TravelNestUtils.saveJSON(customKey, customCards);
    closeEditModal();
    updateSingleCard(id);
  });

  //Edit Modal Close
  document.getElementById("cancel-edit-custom").addEventListener("click", closeEditModal);
  document.getElementById("close-edit-modal").addEventListener("click", closeEditModal);
  editModal.addEventListener("click", (event) => {
    if (event.target === editModal) closeEditModal();
  });

  //Render all cards on page load
  renderTrackCards();
});