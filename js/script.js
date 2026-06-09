document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search input');
  const serviceCards = Array.from(document.querySelectorAll('.home-service-card, .service-card, .info-card'));
  const citySelects = Array.from(document.querySelectorAll('.city-select, .city-service-select'));
  const selectedCityLabels = Array.from(document.querySelectorAll('[data-selected-city]'));
  const cityInputs = Array.from(document.querySelectorAll('input[name="city"]'));
  const footerCityLinks = Array.from(document.querySelectorAll('.footer-cities a'));
  const cityServiceList = document.querySelector('.city-service-list');
  const cityServiceCount = document.querySelector('[data-city-service-count]');
  const cityServiceNote = document.querySelector('[data-city-service-note]');
  const cityServiceCards = Array.from(document.querySelectorAll('[data-service]'));

  const serviceLabels = {
    furniture: 'Furniture assembly',
    ac: 'AC installation',
    repair: 'Furniture repair',
    tv: 'TV mounting',
    electrician: 'Electrician visit'
  };

  const cityServices = {
    "Amritsar": ['furniture', 'repair'],
    "Balotra": ['furniture', 'repair'],
    "Bangalore": ['furniture', 'repair'],
    "Berhampur": ['furniture', 'repair'],
    "Bhagalpur": ['furniture', 'repair'],
    "Bhopal": ['furniture', 'repair'],
    "Bhubaneswar": ['furniture', 'repair'],
    "Chennai": ['furniture', 'repair'],
    "Chhindwara": ['furniture', 'repair'],
    "Coimbatore": ['furniture', 'repair'],
    "Dehradun": ['furniture', 'repair'],
    "Dhanbad": ['furniture', 'repair'],
    "Ernakulam": ['furniture', 'repair'],
    "Gorakhpur": ['furniture', 'repair'],
    "Gurugram": ['furniture', 'repair'],
    "Guwahati": ['furniture', 'repair'],
    "Gwalior": ['furniture', 'repair'],
    "Hyderabad": ['furniture', 'repair'],
    "Jaipur": ['furniture', 'repair'],
    "Jamshedpur": ['furniture', 'repair'],
    "Kadapa": ['furniture', 'repair'],
    "Kalyan": ['furniture', 'repair'],
    "Kanpur": ['furniture', 'repair'],
    "Kolkata": ['furniture', 'repair'],
    "Lucknow": ['furniture', 'repair'],
    "Mangaluru": ['furniture', 'repair'],
    "Morena": ['furniture', 'repair'],
    "Mumbai": ['furniture', 'repair'],
    "Nagpur": ['furniture', 'repair'],
    "Nellore": ['furniture', 'repair'],
    "Pathankot": ['furniture', 'repair'],
    "Patna": ['furniture', 'repair'],
    "Pudupattinam": ['furniture', 'repair'],
    "Pune": ['furniture', 'repair'],
    "Raigarh": ['furniture', 'repair'],
    "Rangareddy": ['furniture', 'repair'],
    "Rishikesh": ['furniture', 'repair'],
    "Thane": ['furniture', 'repair'],
    "Udaipur": ['furniture', 'repair'],
    "Vadodara": ['furniture', 'repair'],
    "Varanasi": ['furniture', 'repair'],
    "Visakhapatnam": ['furniture', 'repair']
  };

  const setSelectedCity = (city) => {
    if (!city) return;
    const fallbackCity = citySelects[0]?.value || Object.keys(cityServices)[0];
    const activeCity = cityServices[city] ? city : fallbackCity;
    const availableServices = cityServices[activeCity] || ['furniture', 'repair'];
    citySelects.forEach((select) => {
      const hasOption = Array.from(select.options).some((option) => option.value === activeCity || option.textContent === activeCity);
      if (hasOption) select.value = activeCity;
    });
    selectedCityLabels.forEach((label) => {
      label.textContent = activeCity;
    });
    cityInputs.forEach((input) => {
      if (!input.value || input.dataset.citySynced === 'true') {
        input.value = activeCity;
        input.dataset.citySynced = 'true';
      }
    });
    footerCityLinks.forEach((link) => {
      link.classList.toggle('is-active', link.textContent.trim() === activeCity);
    });
    if (cityServiceList) {
      cityServiceList.innerHTML = availableServices
        .map((service) => `<span>${serviceLabels[service]}</span>`)
        .join('');
    }
    if (cityServiceCount) {
      cityServiceCount.textContent = `${availableServices.length} service ${availableServices.length === 1 ? 'category' : 'categories'} active`;
    }
    if (cityServiceNote) {
      cityServiceNote.textContent = availableServices.length >= 5
        ? 'Full installation support is active in this city.'
        : 'Limited rollout city: available services are shown below.';
    }
    cityServiceCards.forEach((card) => {
      const isAvailable = availableServices.includes(card.dataset.service);
      card.classList.toggle('is-unavailable', !isAvailable);
      card.setAttribute('aria-hidden', isAvailable ? 'false' : 'true');
      card.style.display = isAvailable ? '' : 'none';
    });
    localStorage.setItem('fixNationSelectedCity', activeCity);
  };

  citySelects.forEach((select) => {
    select.addEventListener('change', () => setSelectedCity(select.value));
  });

  cityInputs.forEach((input) => {
    input.addEventListener('input', () => {
      input.dataset.citySynced = input.value ? 'false' : 'true';
    });
  });

  footerCityLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setSelectedCity(link.textContent.trim());
      document.querySelector('.city-service-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  setSelectedCity(localStorage.getItem('fixNationSelectedCity') || citySelects[0]?.value || 'Indore');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      serviceCards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const unavailable = card.classList.contains('is-unavailable');
        card.style.display = !unavailable && (!query || text.includes(query)) ? '' : 'none';
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
  const paymentConfig = window.FIX_NATION_PAYMENT || {};
  const bookingFee = Number(paymentConfig.bookingFee || 49);
  const upiId = paymentConfig.upiId || '9165867685-5@ybl';
  const payeeName = paymentConfig.payeeName || 'The Fix Nation';

  const createBookingId = () => {
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `TFN-${stamp}-${random}`;
  };

  const createUpiLink = (bookingId) => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: String(bookingFee),
      cu: 'INR',
      tn: `${bookingId} booking confirmation`
    });
    return `upi://pay?${params.toString()}`;
  };

  const ensurePaymentBox = (form) => {
    if (form.dataset.leadForm !== 'customer' || form.querySelector('.booking-payment-box')) return;
    const button = form.querySelector('button[type="submit"], .submit-btn');
    const box = document.createElement('div');
    box.className = 'booking-payment-box';
    box.innerHTML = `
      <div>
        <strong>Confirm booking with Rs ${bookingFee}</strong>
        <small>First submit your details. After Booking ID is generated, pay Rs ${bookingFee} to confirm the visit. Carpenter will share final work charge after checking the furniture.</small>
      </div>
      <button class="booking-pay-btn" type="button" disabled>Pay Rs ${bookingFee} via UPI</button>
      <div class="booking-upi-details" hidden>
        <div><span>UPI ID</span><strong data-upi-id>${upiId}</strong></div>
        <div><span>Amount</span><strong>Rs ${bookingFee}</strong></div>
        <div><span>Booking ID</span><strong data-booking-id>Generated after submit</strong></div>
      </div>
      <p class="booking-payment-note">Payment button activates after callback form submit.</p>
    `;
    if (button) {
      button.insertAdjacentElement('afterend', box);
    } else {
      form.appendChild(box);
    }
  };

  document.querySelectorAll('.lead-form').forEach((form) => {
    ensurePaymentBox(form);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('.form-status');
      const formType = form.dataset.leadForm || 'customer';
      const endpoint = leadEndpoints[formType] || leadEndpoints.all || leadEndpoints.googleSheetUrl;
      const submitButton = form.querySelector('button[type="submit"]');
      const paymentBox = form.querySelector('.booking-payment-box');
      const payButton = form.querySelector('.booking-pay-btn');
      const paymentNote = form.querySelector('.booking-payment-note');
      const upiDetails = form.querySelector('.booking-upi-details');
      const bookingIdLabel = form.querySelector('[data-booking-id]');
      const payload = Object.fromEntries(new FormData(form).entries());
      const bookingId = formType === 'customer' ? createBookingId() : '';
      payload.formType = formType;
      payload.source = 'The Fix Nation website';
      payload.pageUrl = window.location.href;
      payload.submittedAt = new Date().toISOString();
      if (formType === 'customer') {
        payload.bookingId = bookingId;
        payload.bookingFee = bookingFee;
        payload.paymentStatus = upiId ? 'Pending verification' : 'UPI ID pending';
        payload.paymentNote = bookingId ? `${bookingId} booking confirmation` : '';
      }

      if (status) {
        status.classList.remove('is-error');
        status.textContent = formType === 'customer' ? 'Saving details and generating booking ID...' : 'Saving your details...';
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
          if (formType === 'customer') {
            if (status) status.textContent = `Details saved. Booking ID: ${bookingId}`;
            if (paymentBox) paymentBox.classList.add('is-ready');
            if (bookingIdLabel) bookingIdLabel.textContent = bookingId;
            if (upiDetails) upiDetails.hidden = false;
            if (payButton) {
              payButton.disabled = !upiId;
              payButton.textContent = upiId ? `Pay Rs ${bookingFee} via UPI` : 'UPI ID pending';
              payButton.onclick = () => {
                const upiLink = createUpiLink(bookingId);
                window.location.href = upiLink;
                window.setTimeout(() => {
                  if (paymentNote) {
                    paymentNote.textContent = `If UPI app does not open, pay Rs ${bookingFee} to ${upiId} and use note: ${bookingId}`;
                  }
                }, 700);
              };
            }
            if (paymentNote) {
              paymentNote.textContent = upiId
                ? `Use Booking ID ${bookingId} in UPI note. Sheet status: Pending verification.`
                : `Booking ID ${bookingId} generated. Add UPI ID in lead-config.js to activate payment button.`;
            }
          } else if (status) {
            status.textContent = 'Details submitted. Our team will connect shortly.';
          }
          form.reset();
          setSelectedCity(localStorage.getItem('fixNationSelectedCity') || citySelects[0]?.value || 'Indore');
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
