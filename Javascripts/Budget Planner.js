document.addEventListener("DOMContentLoaded", () => {

  //DOM References & Constants
  const form = document.getElementById("budget-form");
  const output = document.getElementById("budget-output");
  const list = document.getElementById("saved-budgets");
  const key = "TravelNest_Budgets";

  //Returns low, moderate, luxury based on the daily spend
  const getBudgetLevel = (daily) => (daily < 70 ? "low" : daily < 180 ? "moderate" : "luxury");

  //Reads the saved budget list from localStorage
  const getSavedBudgets = () => TravelNestUtils.loadJSON(key, []);

  //Saved budgets list rendering
  const render = () => {
    list.innerHTML = getSavedBudgets().map((item, index) => `
      <li>
        <span>${item.destination}: ${item.days} day(s), $${item.dailyBudget}/day, total $${item.total} (${item.status})</span>
        <button type="button" class="btn btn-small btn--danger" data-delete-index="${index}">${travelNestIcon("delete")} Delete</button>
      </li>
    `).join("");
  };

  //Deleting saved budget
  list.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-delete-index]");
    if (!btn) return;
    const items = getSavedBudgets();
    items.splice(Number(btn.dataset.deleteIndex), 1);
    TravelNestUtils.saveJSON(key, items);
    render();
  });

  //Resetting errors
  const destination = document.getElementById("destination");
  const days = document.getElementById("days");
  const dailyBudget = document.getElementById("daily-budget");
  [destination, days, dailyBudget].forEach((el) => el.addEventListener("input", () => el.setCustomValidity("")));

  //Handles form submission
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = destination.value.trim();
    const tripDays = Number(days.value);
    const dayBudget = Number(dailyBudget.value);

    //Inputs are validated manually with setCustomValidity
    if (!name) {
      destination.setCustomValidity("Destination is required.");
      destination.reportValidity();
      return;
    }
    if (!Number.isInteger(tripDays) || tripDays < 1) {
      days.setCustomValidity("Please enter a number that is at least 1.");
      days.reportValidity();
      return;
    }
    if (!Number.isInteger(dayBudget) || dayBudget < 1) {
      dailyBudget.setCustomValidity("Please enter a number that is at least 1.");
      dailyBudget.reportValidity();
      return;
    }

    const total = tripDays * dayBudget;
    const level = getBudgetLevel(dayBudget);

    //Budget progress bar
    const width = Math.min(100, Math.round((dayBudget / 250) * 100));

    output.classList.add("show");
    output.innerHTML = `
      <h2>Budget Result</h2>
      <p>Estimated total cost: <strong>$${total}</strong></p>
      <p>Budget status: <strong>${level}</strong></p>
      <div class="meter meter--${level}"><span style="width:${width}%"></span></div>
    `;

    //Save to localStorage and refresh the saved budgets list
    const items = getSavedBudgets();
    items.push({ destination: name, days: tripDays, dailyBudget: dayBudget, total, status: level });
    TravelNestUtils.saveJSON(key, items);
    render();
    form.reset();
  });

  //Load budgets from localStorage on refresh
  render();
});
