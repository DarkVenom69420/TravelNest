document.addEventListener("DOMContentLoaded", () => {

  //DOM References & Constants
  const form = document.getElementById("feedback-form");
  const key = "TravelNest_Feedback";
  const messageEl = document.getElementById("feedback-message");
  const faq = document.getElementById("faq");

  //FAQ Accordion
  faq.innerHTML = [
    { q: "How do I save a budget plan?", a: "Visit Trip Budget page, calculate, and it is stored in localStorage." },
    { q: "Where can I find saved wishlist items?", a: "Open Random Trip Generator to view your saved wishlist." },
    { q: "Does TravelNest work on mobile?", a: "Yes, the site is built mobile-first and responsive." }
  ].map((item) => `
    <article class="accordion-item">
      <button type="button" class="accordion-header">
        <span>${item.q}</span>
        <img class="accordion-icon" src="../Svgs/Dropdown.svg" alt="" />
      </button>
      <div class="accordion-body">
        <div class="accordion-content"><p>${item.a}</p></div>
      </div>
    </article>
  `).join("");

  //Toggle the clicked accordion item
  faq.addEventListener("click", (event) => {
    const btn = event.target.closest(".accordion-header");
    if (btn) btn.parentElement.classList.toggle("open");
  });

  //Resetting errors
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const message = document.getElementById("message");
  [name, email, message].forEach((el) => el.addEventListener("input", () => el.setCustomValidity("")));

  //Handles form submission
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameValue = name.value.trim();
    const emailValue = email.value.trim();
    const messageValue = message.value.trim();

    if (nameValue.length < 2) {
      name.setCustomValidity("Name must be at least 2 characters.");
      name.reportValidity();
      return;
    }

    if (!emailValue.endsWith("@gmail.com")) {
      email.setCustomValidity("Please provide a valid Gmail address.");
      email.reportValidity();
      return;
    }

    if (messageValue.length < 10) {
      message.setCustomValidity("Message must be at least 10 characters.");
      message.reportValidity();
      return;
    }

    //Store the feedback to localStorage
    const records = TravelNestUtils.loadJSON(key, []);
    records.push({ name: nameValue, email: emailValue, message: messageValue, time: new Date().toISOString() });
    TravelNestUtils.saveJSON(key, records);

    //Show confirmation and reset the form
    messageEl.textContent = "Thanks! Your feedback was saved successfully.";
    form.reset();
  });
});
