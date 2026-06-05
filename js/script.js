document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search input');
  const serviceCards = Array.from(document.querySelectorAll('.home-service-card, .service-card, .info-card'));

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      serviceCards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = !query || text.includes(query) ? '' : 'none';
      });
    });
  }

  document.querySelectorAll('.add').forEach((button) => {
    button.addEventListener('click', () => {
      button.textContent = 'Added';
      button.classList.add('is-added');
      setTimeout(() => {
        button.textContent = 'Add';
        button.classList.remove('is-added');
      }, 1600);
    });
  });
});
