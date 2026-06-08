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

  const marketplace = document.querySelector('.marketplace');
  const cartPanel = document.querySelector('.cart-panel');
  const closeCart = document.querySelector('.cart-close');
  const selectedServiceName = document.querySelector('#selected-service-name');
  const selectedServiceNote = document.querySelector('#selected-service-note');
  const addButtons = Array.from(document.querySelectorAll('.add'));

  addButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.service-card');
      const title = card?.querySelector('h3')?.textContent?.trim() || 'Selected service';
      const note = card?.querySelector('p')?.textContent?.trim() || 'Share city, product photo and customer slot.';

      if (selectedServiceName) selectedServiceName.textContent = title;
      if (selectedServiceNote) {
        selectedServiceNote.textContent = note.length > 88 ? `${note.slice(0, 85)}...` : note;
      }

      addButtons.forEach((item) => {
        item.textContent = 'Add';
        item.classList.remove('is-added');
      });
      button.textContent = 'Selected';
      button.classList.add('is-added');
      marketplace?.classList.add('has-cart');
      cartPanel?.classList.remove('is-hidden');

      if (window.innerWidth < 1100) {
        cartPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  closeCart?.addEventListener('click', () => {
    cartPanel?.classList.add('is-hidden');
    marketplace?.classList.remove('has-cart');
    addButtons.forEach((button) => {
      button.textContent = 'Add';
      button.classList.remove('is-added');
    });
  });

  const leadEndpoints = window.FIX_NATION_LEADS || {};
  document.querySelectorAll('.lead-form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('.form-status');
      const formType = form.dataset.leadForm || 'customer';
      const endpoint = leadEndpoints[formType] || leadEndpoints.all || leadEndpoints.googleSheetUrl;
      const submitButton = form.querySelector('button[type="submit"]');
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.formType = formType;
      payload.source = 'The Fix Nation website';
      payload.pageUrl = window.location.href;
      payload.submittedAt = new Date().toISOString();

      if (status) {
        status.classList.remove('is-error');
        status.textContent = 'Saving your details...';
      }
      if (submitButton) submitButton.disabled = true;

      try {
        if (endpoint) {
          await fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          });
          if (status) status.textContent = 'Details submitted. Our team will connect shortly.';
          form.reset();
        } else {
          const savedLeads = JSON.parse(localStorage.getItem('fixNationDemoLeads') || '[]');
          savedLeads.push(payload);
          localStorage.setItem('fixNationDemoLeads', JSON.stringify(savedLeads));
          if (status) {
            status.classList.add('is-error');
            status.textContent = 'Form ready hai. Google Sheet link add karte hi data live save hoga.';
          }
        }
      } catch (error) {
        if (status) {
          status.classList.add('is-error');
          status.textContent = 'Submission failed. Please try again or contact us on WhatsApp.';
        }
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  });
});
