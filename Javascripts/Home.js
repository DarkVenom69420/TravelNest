document.addEventListener("DOMContentLoaded", () => {

  //DOM References
  const total = destinationData.length;
  const quoteEl = document.getElementById("rotating-quote");
  const heroImage = document.getElementById("hero-image");
  const heroImageLink = document.getElementById("hero-image-link");
  const heroImageLabel = document.getElementById("hero-image-label");
  let imageIndex = 0;

  //Hero Quote & Image Cycling
  function renderHero(index) {
    const d = destinationData[index];
    heroImage.src = d.image;
    heroImage.alt = d.name;
    heroImageLink.href = `Explorer.html?focus=${d.id}`;
    heroImageLabel.textContent = d.name;
    quoteEl.textContent = `${d.name}: ${d.description}`;
  }

  renderHero(0);
  setInterval(() => {
    imageIndex = (imageIndex + 1) % total;
    renderHero(imageIndex);
  }, 3300);

  //Destination of the Day
  const dailyIndex = Math.floor(Date.now() / 86400000) % total;
  const daily = destinationData[dailyIndex];

  document.getElementById("destination-of-day").innerHTML = `
    <a class="hero-image-link" href="Explorer.html?focus=${daily.id}"><img src="${daily.image}" alt="${daily.name}" /></a>
    <div>
      <h3>${daily.name}</h3>
      <p>${daily.description}</p>
      <p><strong>Suggested style:</strong> ${daily.type}</p>
      <a class="btn" href="Explorer.html?focus=${daily.id}">View in Explorer</a>
    </div>
  `;
});
