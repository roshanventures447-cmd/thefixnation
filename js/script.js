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
  const categoryButtons = Array.from(document.querySelectorAll('[data-category-filter]'));
  const serviceOpeners = Array.from(document.querySelectorAll('[data-open-category]'));
  let currentSearchQuery = '';
  let activeCategory = categoryButtons.find((button) => button.classList.contains('active'))?.dataset.categoryFilter || 'beds';

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

  const applyServiceVisibility = () => {
    serviceCards.forEach((card) => {
      const serviceKey = card.dataset.service;
      const isAvailable = !serviceKey || !card.classList.contains('is-unavailable');
      const isCategoryMatch = !card.classList.contains('service-card') || card.dataset.category === activeCategory;
      const isSearchMatch = !currentSearchQuery || card.textContent.toLowerCase().includes(currentSearchQuery);
      const isVisible = isAvailable && isCategoryMatch && isSearchMatch;
      card.style.display = isVisible ? '' : 'none';
      card.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
    });
  };

  const setActiveCategory = (category, scrollToServices = true) => {
    activeCategory = category || 'beds';
    categoryButtons.forEach((item) => {
      item.classList.toggle('active', item.dataset.categoryFilter === activeCategory);
    });
    applyServiceVisibility();
    if (scrollToServices) {
      document.querySelector('.service-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
      cityServiceNote.textContent = 'Confirmed furniture assembly and repair support is available in this city.';
    }
    cityServiceCards.forEach((card) => {
      const isAvailable = availableServices.includes(card.dataset.service);
      card.classList.toggle('is-unavailable', !isAvailable);
    });
    localStorage.setItem('fixNationSelectedCity', activeCity);
    applyServiceVisibility();
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
      const href = link.getAttribute('href') || '#';
      if (href && href !== '#') return;
      event.preventDefault();
      setSelectedCity(link.textContent.trim());
      document.querySelector('.city-service-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  categoryButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      setActiveCategory(button.dataset.categoryFilter || 'beds');
    });
  });

  serviceOpeners.forEach((opener) => {
    opener.addEventListener('click', (event) => {
      event.preventDefault();
      setActiveCategory(opener.dataset.openCategory || 'beds');
      document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  setSelectedCity(localStorage.getItem('fixNationSelectedCity') || citySelects[0]?.value || 'Amritsar');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearchQuery = searchInput.value.trim().toLowerCase();
      applyServiceVisibility();
    });
  }

  const marketplace = document.querySelector('.marketplace');
  const cartPanel = document.querySelector('.cart-panel');
  const closeCart = document.querySelector('.cart-close');
  const cartItems = document.querySelector('[data-cart-items]');
  const cartEmpty = document.querySelector('[data-cart-empty]');
  const cartCounts = Array.from(document.querySelectorAll('[data-cart-count]'));
  const cartTrigger = document.querySelector('[data-cart-trigger]');
  const addButtons = Array.from(document.querySelectorAll('.add'));
  const bookingPayInline = document.querySelector('.booking-pay-inline');
  const bookingLocationForm = document.querySelector('[data-booking-location-form]');
  const bookingCityInput = document.querySelector('[data-booking-city]');
  const bookingAddressInput = document.querySelector('[data-booking-address]');
  const bookingPhoneInput = document.querySelector('[data-booking-phone]');
  const bookingLocationStatus = document.querySelector('[data-booking-location-status]');
  const cartAddressNote = document.querySelector('[data-cart-address-note]');
  const cartPaymentStatus = document.querySelector('[data-cart-payment-status]');
  const paymentModal = document.querySelector('[data-payment-modal]');
  const paymentLink = document.querySelector('[data-payment-link]');
  const paymentBookingId = document.querySelector('[data-payment-booking-id]');
  const paymentUpi = document.querySelector('[data-payment-upi]');
  const paymentDialogStatus = document.querySelector('[data-payment-dialog-status]');
  let selectedServices = [];
  try {
    const savedServices = JSON.parse(localStorage.getItem('fixNationSelectedServices') || '[]');
    selectedServices = Array.isArray(savedServices) ? savedServices : [];
  } catch (error) {
    selectedServices = [];
  }
  let bookingLocation = { city: '', address: '', phone: '' };
  try {
    bookingLocation = JSON.parse(localStorage.getItem('fixNationBookingLocation') || 'null') || bookingLocation;
  } catch (error) {
    localStorage.removeItem('fixNationBookingLocation');
  }

  const persistSelectedServices = () => localStorage.setItem('fixNationSelectedServices', JSON.stringify(selectedServices));

  const renderCart = () => {
    const count = selectedServices.length;
    cartCounts.forEach((item) => { item.textContent = String(count); });
    if (cartTrigger) cartTrigger.classList.toggle('has-items', count > 0);
    if (cartEmpty) cartEmpty.hidden = count > 0;
    if (cartItems) {
      cartItems.innerHTML = selectedServices.map((service) => `
        <div class="cart-service-item">
          <div><strong>${service.name}</strong><small>${service.note}</small></div>
          <button type="button" data-remove-service="${service.id}" aria-label="Remove ${service.name}">Remove</button>
        </div>`).join('');
    }
    addButtons.forEach((button) => {
      const card = button.closest('.service-card');
      const id = card?.dataset.category || card?.dataset.bookingService || '';
      const selected = selectedServices.some((service) => service.id === id);
      button.textContent = selected ? 'Added' : 'Add';
      button.classList.toggle('is-added', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    persistSelectedServices();
  };

  cartItems?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-service]');
    if (!removeButton) return;
    selectedServices = selectedServices.filter((service) => service.id !== removeButton.dataset.removeService);
    if (!selectedServices.length) {
      cartPanel?.classList.add('is-hidden');
      marketplace?.classList.remove('has-cart');
    }
    renderCart();
    updateCartState();
  });

  addButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!isLocationReady()) {
        markLocationError('Add city and address first, then select service.');
        document.querySelector('.booking-start-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const card = button.closest('.service-card');
      const title = card?.querySelector('h3')?.textContent?.trim() || 'Selected service';
      const note = card?.querySelector('p')?.textContent?.trim() || 'Share city, product photo and customer slot.';
      const id = card?.dataset.category || card?.dataset.bookingService || title;
      const existing = selectedServices.some((service) => service.id === id);
      selectedServices = existing
        ? selectedServices.filter((service) => service.id !== id)
        : [...selectedServices, { id, name: card?.dataset.bookingService || title, note: note.length > 88 ? `${note.slice(0, 85)}...` : note }];
      marketplace?.classList.add('has-cart');
      if (selectedServices.length) cartPanel?.classList.remove('is-hidden');
      else cartPanel?.classList.add('is-hidden');
      renderCart();
      updateCartState();

      if (window.innerWidth < 1100) {
        cartPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const applySelectedBookingToForm = () => {
    if (!selectedServices.length) return;
    const customerForm = document.querySelector('.quote-form[data-lead-form="customer"]');
    if (!customerForm) return;
    const serviceSelect = customerForm.querySelector('select[name="service"]');
    const messageInput = customerForm.querySelector('input[name="message"], textarea[name="message"]');
    if (serviceSelect) {
      const matchedOption = Array.from(serviceSelect.options).find((option) => option.textContent.trim() === selectedServices[0].name);
      if (matchedOption) {
        serviceSelect.value = matchedOption.value || matchedOption.textContent;
      }
    }
    if (messageInput && !messageInput.value) {
      messageInput.value = selectedServices.map((service) => service.name).join(', ');
    }
  };

  const isLocationReady = () => Boolean(
    bookingLocation.city &&
    bookingLocation.address &&
    bookingLocation.address.trim().length >= 8 &&
    /^\d{10}$/.test(bookingLocation.phone || '')
  );

  const markLocationError = (message) => {
    if (bookingLocationStatus) {
      bookingLocationStatus.className = 'booking-location-status is-error';
      bookingLocationStatus.textContent = message;
    }
  };

  const syncBookingLocationToFields = () => {
    if (bookingCityInput && bookingLocation.city) bookingCityInput.value = bookingLocation.city;
    if (bookingAddressInput && bookingLocation.address) bookingAddressInput.value = bookingLocation.address;
    if (bookingPhoneInput && bookingLocation.phone) bookingPhoneInput.value = bookingLocation.phone;
    if (bookingLocation.city) setSelectedCity(bookingLocation.city);
    const customerForm = document.querySelector('.quote-form[data-lead-form="customer"]');
    if (customerForm) {
      const cityInput = customerForm.querySelector('input[name="city"]');
      if (cityInput && bookingLocation.city) {
        cityInput.value = bookingLocation.city;
        cityInput.dataset.citySynced = 'false';
      }
    }
  };

  const updateCartState = () => {
    const locationReady = isLocationReady();
    marketplace?.classList.toggle('is-locked', !locationReady);
    if (cartAddressNote) {
      cartAddressNote.textContent = locationReady
        ? `${bookingLocation.city}: ${bookingLocation.address}`
        : 'City, address and mobile number must be added before payment.';
    }
    if (bookingPayInline) {
      bookingPayInline.disabled = !(locationReady && selectedServices.length);
      if (!selectedServices.length) bookingPayInline.textContent = 'Select at least one service';
      else bookingPayInline.textContent = `Confirm ${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} and pay Rs 49`;
    }
    if (bookingLocationStatus && locationReady) {
      bookingLocationStatus.className = 'booking-location-status is-ready';
      bookingLocationStatus.textContent = `${bookingLocation.city} details saved. Now choose a service below.`;
    }
  };

  bookingLocationForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const city = bookingCityInput?.value || '';
    const address = (bookingAddressInput?.value || '').trim();
    const phone = (bookingPhoneInput?.value || '').replace(/\D/g, '').slice(-10);
    if (!cityServices[city]) {
      markLocationError('Select a confirmed service city.');
      return;
    }
    if (address.length < 8) {
      markLocationError('Enter a complete house / area / landmark address.');
      return;
    }
    if (phone.length !== 10) {
      markLocationError('Enter a valid 10 digit mobile number.');
      return;
    }
    bookingLocation = { city, address, phone };
    localStorage.setItem('fixNationBookingLocation', JSON.stringify(bookingLocation));
    syncBookingLocationToFields();
    updateCartState();
    document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  bookingCityInput?.addEventListener('change', () => {
    setSelectedCity(bookingCityInput.value);
  });

  bookingPayInline?.addEventListener('click', () => {
    handleInlinePayment();
  });

  closeCart?.addEventListener('click', () => {
    cartPanel?.classList.add('is-hidden');
    marketplace?.classList.remove('has-cart');
  });

  cartTrigger?.addEventListener('click', (event) => {
    if (!selectedServices.length) return;
    event.preventDefault();
    cartPanel?.classList.remove('is-hidden');
    marketplace?.classList.add('has-cart');
    document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const createSubmissionId = () => `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  const getPendingLeads = () => {
    try {
      const pending = JSON.parse(localStorage.getItem('fixNationPendingLeads') || '[]');
      return Array.isArray(pending) ? pending : [];
    } catch (error) {
      localStorage.removeItem('fixNationPendingLeads');
      return [];
    }
  };

  const savePendingLeads = (leads) => localStorage.setItem('fixNationPendingLeads', JSON.stringify(leads.slice(-25)));

  const queueLead = (endpoint, payload) => {
    const pending = getPendingLeads().filter((item) => item.payload?.submissionId !== payload.submissionId);
    pending.push({ endpoint, payload, queuedAt: new Date().toISOString() });
    savePendingLeads(pending);
  };

  const submitLead = async (endpoint, payload) => {
    if (!endpoint) throw new Error('Lead endpoint is not configured.');
    queueLead(endpoint, payload);
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-store',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    savePendingLeads(getPendingLeads().filter((item) => item.payload?.submissionId !== payload.submissionId));
  };

  const retryPendingLeads = async () => {
    if (!navigator.onLine) return;
    const pending = getPendingLeads();
    for (const item of pending.slice(0, 5)) {
      try {
        await submitLead(item.endpoint, item.payload);
      } catch (error) {
        break;
      }
    }
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

  const showPaymentModal = (bookingId) => {
    if (!paymentModal) return;
    if (paymentBookingId) paymentBookingId.textContent = bookingId;
    if (paymentUpi) paymentUpi.textContent = upiId;
    if (paymentLink) paymentLink.href = createUpiLink(bookingId);
    paymentModal.hidden = false;
    document.body.classList.add('payment-modal-open');
  };

  document.querySelectorAll('[data-payment-close]').forEach((button) => {
    button.addEventListener('click', () => {
      if (paymentModal) paymentModal.hidden = true;
      document.body.classList.remove('payment-modal-open');
    });
  });

  document.querySelectorAll('[data-copy-payment]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copyPayment === 'upi' ? paymentUpi?.textContent : paymentBookingId?.textContent;
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value.trim());
        button.textContent = 'Copied';
        if (paymentDialogStatus) paymentDialogStatus.textContent = `${button.dataset.copyPayment === 'upi' ? 'UPI ID' : 'Booking ID'} copied.`;
      } catch (error) {
        if (paymentDialogStatus) paymentDialogStatus.textContent = `Copy this value: ${value.trim()}`;
      }
    });
  });

  const handleInlinePayment = async () => {
    if (!selectedServices.length) {
      if (cartPaymentStatus) {
        cartPaymentStatus.className = 'cart-payment-status is-error';
        cartPaymentStatus.textContent = 'Select a service first.';
      }
      return;
    }
    if (!isLocationReady()) {
      markLocationError('Add city and complete service address before payment.');
      document.querySelector('.booking-start-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const endpoint = leadEndpoints.customer || leadEndpoints.all || leadEndpoints.googleSheetUrl;
    const bookingId = createBookingId();
    const payload = {
      submissionId: createSubmissionId(),
      formType: 'customer',
      source: 'The Fix Nation website inline booking',
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString(),
      bookingId,
      bookingFee,
      paymentStatus: upiId ? 'Pending verification' : 'UPI ID pending',
      paymentNote: `${bookingId} booking confirmation`,
      name: '',
      email: '',
      phone: bookingLocation.phone,
      city: bookingLocation.city,
      address: bookingLocation.address,
      service: selectedServices.map((service) => service.name).join(' + '),
      serviceCount: selectedServices.length,
      message: selectedServices.map((service) => `${service.name}: ${service.note}`).join(' | '),
      callbackTime: 'Any time today'
    };

    applySelectedBookingToForm();
    if (cartPaymentStatus) {
      cartPaymentStatus.className = 'cart-payment-status';
      cartPaymentStatus.textContent = 'Saving booking details and generating payment note...';
    }
    if (bookingPayInline) bookingPayInline.disabled = true;

    try {
      await submitLead(endpoint, payload);
      localStorage.setItem('fixNationLastBooking', JSON.stringify(payload));
      if (cartPaymentStatus) {
        cartPaymentStatus.className = 'cart-payment-status is-success';
        cartPaymentStatus.textContent = `Booking ID ${bookingId} saved. UPI note: ${bookingId}`;
      }
      if (bookingPayInline) {
        bookingPayInline.disabled = false;
        bookingPayInline.textContent = 'Open UPI payment';
      }
      showPaymentModal(bookingId);
    } catch (error) {
      if (cartPaymentStatus) {
        cartPaymentStatus.className = 'cart-payment-status is-error';
        cartPaymentStatus.textContent = 'Could not save booking. Please try again or WhatsApp us.';
      }
      if (bookingPayInline) bookingPayInline.disabled = false;
    }
  };

  syncBookingLocationToFields();
  renderCart();
  updateCartState();

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
      if (payload.website) return;
      payload.submissionId = createSubmissionId();
      payload.formType = formType;
      payload.source = 'The Fix Nation website';
      payload.pageUrl = window.location.href;
      payload.submittedAt = new Date().toISOString();
      if (formType === 'customer') {
        payload.bookingId = bookingId;
        payload.bookingFee = bookingFee;
        payload.paymentStatus = upiId ? 'Pending verification' : 'UPI ID pending';
        payload.paymentNote = bookingId ? `${bookingId} booking confirmation` : '';
      } else {
        if (!payload.consent) payload.consent = 'Yes - submitted worker application';
        payload.applicationId = `PRO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        payload.leadStatus = 'Application received';
      }

      if (status) {
        status.classList.remove('is-error');
        status.textContent = formType === 'customer' ? 'Saving details and generating booking ID...' : 'Saving your details...';
      }
      if (submitButton) submitButton.disabled = true;

      try {
        if (endpoint) {
          await submitLead(endpoint, payload);
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
            status.textContent = `Application submitted. Reference: ${payload.applicationId}. Our onboarding team will review it.`;
          }
          form.reset();
          setSelectedCity(localStorage.getItem('fixNationSelectedCity') || citySelects[0]?.value || 'Amritsar');
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

  window.addEventListener('online', retryPendingLeads);
  retryPendingLeads();

  const bookingStatusForm = document.querySelector('[data-booking-status-form]');
  bookingStatusForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const bookingId = String(new FormData(bookingStatusForm).get('bookingId') || '').trim().toUpperCase();
    const result = document.querySelector('[data-booking-status-result]');
    const endpoint = leadEndpoints.customer || leadEndpoints.all || leadEndpoints.googleSheetUrl;
    if (!result || !/^TFN-\d{8}-[A-Z0-9]{4}$/.test(bookingId)) {
      if (result) result.innerHTML = '<strong>Check the Booking ID</strong><span>Use the ID in format TFN-YYYYMMDD-XXXX.</span>';
      return;
    }

    result.className = 'booking-status-result is-loading';
    result.innerHTML = '<strong>Checking booking...</strong><span>Please wait a moment.</span>';
    try {
      const response = await fetch(`${endpoint}?action=status&bookingId=${encodeURIComponent(bookingId)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'Booking not found');
      result.className = 'booking-status-result is-found';
      result.innerHTML = `<strong>${data.leadStatus || 'Booking received'}</strong><span>${data.service || 'Service request'} in ${data.city || 'your city'} · Payment: ${data.paymentStatus || 'Pending verification'}</span>`;
    } catch (error) {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem('fixNationLastBooking') || 'null'); } catch (storageError) {}
      if (saved?.bookingId === bookingId) {
        result.className = 'booking-status-result is-found';
        result.innerHTML = `<strong>Booking received</strong><span>${saved.service} in ${saved.city} · Payment: ${saved.paymentStatus}</span>`;
      } else {
        result.className = 'booking-status-result is-error';
        result.innerHTML = '<strong>Status not available yet</strong><span>Confirm the ID or contact support on WhatsApp.</span>';
      }
    }
  });
});
