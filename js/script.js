document.addEventListener('DOMContentLoaded', () => {
  const searchInputs = Array.from(document.querySelectorAll('.search input, [data-service-search]'));
  const serviceCards = Array.from(document.querySelectorAll('.home-service-card, .service-card, .info-card'));
  const citySelects = Array.from(document.querySelectorAll('.city-select, .city-service-select, [data-booking-city]'));
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

  const installCallConversionBar = () => {
    if (document.querySelector('.call-conversion-bar')) return;
    const bar = document.createElement('div');
    bar.className = 'call-conversion-bar';
    bar.innerHTML = `
      <a href="index.html#book" data-conversion-action="home">Home</a>
      <a href="index.html#services" data-conversion-action="categories">Categories</a>
      <a href="bookings.html" data-conversion-action="bookings">My Bookings</a>
      <a href="index.html#become-partner" data-conversion-action="account">Account</a>
    `;
    document.body.appendChild(bar);
  };

  installCallConversionBar();

  const renderBrandPartners = () => {
    const brandGrid = document.querySelector('[data-brand-grid]');
    const brandCount = document.querySelector('[data-brand-count]');
    if (!brandGrid) return;
    const configuredBrands = Array.isArray(window.FIX_NATION_BRANDS)
      ? window.FIX_NATION_BRANDS.map((brand) => String(brand || '').trim()).filter(Boolean)
      : [];
    if (brandCount) brandCount.textContent = configuredBrands.length ? `${configuredBrands.length}+` : 'B2B';
    if (!configuredBrands.length) {
      brandGrid.innerHTML = `
        <span>Furniture brands</span>
        <span>Ecommerce sellers</span>
        <span>Local dealers</span>
        <span>Office furniture teams</span>
      `;
      return;
    }
    brandGrid.innerHTML = configuredBrands.map((brand) => `<span>${brand.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]))}</span>`).join('');
  };

  renderBrandPartners();

  document.addEventListener('click', (event) => {
    const target = event.target.closest('a[href^="tel:"], a[href*="wa.me"], [data-conversion-action]');
    if (!target || typeof window.gtag !== 'function') return;
    window.gtag('event', 'lead_action', {
      action_type: target.dataset.conversionAction || (target.href.includes('wa.me') ? 'whatsapp' : 'phone'),
      link_url: target.href || '',
      page_path: window.location.pathname
    });
  });

  const serviceLabels = {
    furniture: 'Furniture assembly',
    ac: 'AC service and repair',
    repair: 'Furniture repair',
    electrician: 'Electrician visit',
    plumber: 'Plumber visit'
  };

  const cityServices = {
    "Amritsar": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Balotra": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Bangalore": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Berhampur": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Bhagalpur": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Bhopal": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Bhubaneswar": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Chennai": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Chhindwara": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Coimbatore": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Dehradun": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Dhanbad": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Ernakulam": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Gorakhpur": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Gurugram": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Guwahati": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Gwalior": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Hyderabad": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Jaipur": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Jamshedpur": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Kadapa": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Kalyan": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Kanpur": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Kolkata": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Lucknow": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Mangaluru": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Morena": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Mumbai": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Nagpur": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Nellore": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Pathankot": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Patna": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Pudupattinam": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Pune": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Raigarh": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Rangareddy": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Rishikesh": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Thane": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Udaipur": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Vadodara": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Varanasi": ['furniture', 'repair', 'electrician', 'plumber', 'ac'],
    "Visakhapatnam": ['furniture', 'repair', 'electrician', 'plumber', 'ac']
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
      input.value = activeCity;
      input.dataset.citySynced = 'true';
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
    window.dispatchEvent(new CustomEvent('fixnation:citychange', { detail: { city: activeCity } }));
    applyServiceVisibility();
  };

  citySelects.forEach((select) => {
    select.addEventListener('change', () => setSelectedCity(select.value));
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

  if (searchInputs.length) {
    searchInputs.forEach((input) => input.addEventListener('input', () => {
      currentSearchQuery = input.value.trim().toLowerCase();
      searchInputs.forEach((otherInput) => {
        if (otherInput !== input) otherInput.value = input.value;
      });
      applyServiceVisibility();
    }));
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
  const bookingLatitudeInput = document.querySelector('[data-booking-latitude]');
  const bookingLongitudeInput = document.querySelector('[data-booking-longitude]');
  const useLocationButton = document.querySelector('[data-use-location]');
  const mapPreview = document.querySelector('[data-map-preview]');
  const mapFrame = document.querySelector('[data-map-frame]');
  const mapOpenLink = document.querySelector('[data-map-open]');
  const mapCoordinates = document.querySelector('[data-map-coordinates]');
  const mapLocationStatus = document.querySelector('[data-map-location-status]');
  const mapShareUrlInput = document.querySelector('[data-map-share-url]');
  const bookingLocationStatus = document.querySelector('[data-booking-location-status]');
  const cartAddressNote = document.querySelector('[data-cart-address-note]');
  const cartPaymentStatus = document.querySelector('[data-cart-payment-status]');
  const paymentModal = document.querySelector('[data-payment-modal]');
  const paymentLink = document.querySelector('[data-payment-link]');
  const paymentBookingId = document.querySelector('[data-payment-booking-id]');
  const paymentUpi = document.querySelector('[data-payment-upi]');
  const paymentStatusLabel = document.querySelector('[data-payment-status]');
  const paymentDialogStatus = document.querySelector('[data-payment-dialog-status]');
  const paymentReportForm = document.querySelector('[data-payment-report-form]');
  const paymentWhatsApp = document.querySelector('[data-payment-whatsapp]');
  const paymentIntentButton = document.querySelector('[data-payment-intent]');
  let activePaymentBookingId = '';
  let selectedServices = [];
  try {
    const savedServices = JSON.parse(localStorage.getItem('fixNationSelectedServices') || '[]');
    selectedServices = Array.isArray(savedServices) ? savedServices : [];
  } catch (error) {
    selectedServices = [];
  }
  let bookingLocation = { city: '', address: '', phone: '', latitude: '', longitude: '', googleMapsUrl: '' };
  try {
    bookingLocation = Object.assign(bookingLocation, JSON.parse(localStorage.getItem('fixNationBookingLocation') || 'null') || {});
  } catch (error) {
    localStorage.removeItem('fixNationBookingLocation');
  }

  const persistSelectedServices = () => localStorage.setItem('fixNationSelectedServices', JSON.stringify(selectedServices));

  const renderMapLocation = () => {
    const latitude = Number(bookingLocation.latitude);
    const longitude = Number(bookingLocation.longitude);
    const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude !== 0 && longitude !== 0;
    if (bookingLatitudeInput) bookingLatitudeInput.value = hasCoordinates ? String(latitude) : '';
    if (bookingLongitudeInput) bookingLongitudeInput.value = hasCoordinates ? String(longitude) : '';
    if (!hasCoordinates) {
      if (mapPreview) mapPreview.hidden = true;
      if (mapOpenLink) mapOpenLink.hidden = true;
      return;
    }
    const coordinateText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    if (mapFrame) mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}&z=17&output=embed`;
    if (mapOpenLink) {
      mapOpenLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
      mapOpenLink.hidden = false;
    }
    if (mapCoordinates) mapCoordinates.textContent = `Pinned at ${coordinateText}`;
    if (mapPreview) mapPreview.hidden = false;
  };

  useLocationButton?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if (mapLocationStatus) mapLocationStatus.textContent = 'Location access is not supported on this device.';
      return;
    }
    useLocationButton.disabled = true;
    useLocationButton.classList.add('is-loading');
    if (mapLocationStatus) mapLocationStatus.textContent = 'Finding your current location...';
    navigator.geolocation.getCurrentPosition((position) => {
      const latitude = Number(position.coords.latitude.toFixed(6));
      const longitude = Number(position.coords.longitude.toFixed(6));
      bookingLocation.latitude = latitude;
      bookingLocation.longitude = longitude;
      if (bookingAddressInput && !bookingAddressInput.value.trim()) {
        bookingAddressInput.value = `GPS pin: ${latitude}, ${longitude}`;
      }
      renderMapLocation();
      localStorage.setItem('fixNationBookingLocation', JSON.stringify(bookingLocation));
      if (mapLocationStatus) mapLocationStatus.textContent = 'Accurate map location added. Please confirm house number and landmark.';
      useLocationButton.disabled = false;
      useLocationButton.classList.remove('is-loading');
    }, (error) => {
      const denied = error.code === 1;
      if (mapLocationStatus) mapLocationStatus.textContent = denied
        ? 'Location permission was not allowed. Enter the complete address manually.'
        : 'Current location could not be detected. Try again or enter the address manually.';
      useLocationButton.disabled = false;
      useLocationButton.classList.remove('is-loading');
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  });

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
      button.textContent = selected ? 'Added to cart' : 'Add service';
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
    if (mapShareUrlInput && bookingLocation.googleMapsUrl) mapShareUrlInput.value = bookingLocation.googleMapsUrl;
    renderMapLocation();
    if (bookingLocation.city) setSelectedCity(bookingLocation.city);
    const customerForm = document.querySelector('.quote-form[data-lead-form="customer"]');
    if (customerForm) {
      const cityInput = customerForm.querySelector('input[name="city"]');
      if (cityInput && bookingLocation.city) {
        cityInput.value = bookingLocation.city;
        cityInput.dataset.citySynced = 'true';
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
      else bookingPayInline.textContent = `Confirm ${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} and pay Rs ${bookingFee}`;
    }
    if (bookingLocationStatus && locationReady) {
      bookingLocationStatus.className = 'booking-location-status is-ready';
      bookingLocationStatus.textContent = `${bookingLocation.city} details saved. Now choose a service below.`;
    }
  };

  window.addEventListener('fixnation:citychange', (event) => {
    const nextCity = event.detail?.city;
    if (!nextCity || bookingLocation.city === nextCity) return;
    const hadDifferentCity = Boolean(bookingLocation.city);
    bookingLocation.city = nextCity;
    if (hadDifferentCity) {
      bookingLocation.address = '';
      bookingLocation.latitude = '';
      bookingLocation.longitude = '';
      bookingLocation.googleMapsUrl = '';
      if (bookingAddressInput) bookingAddressInput.value = '';
      if (mapShareUrlInput) mapShareUrlInput.value = '';
      if (mapLocationStatus) mapLocationStatus.textContent = 'City changed. Add the new address or use current location again.';
      renderMapLocation();
      markLocationError(`${nextCity} selected. Confirm the new service address.`);
    }
    if (bookingCityInput) bookingCityInput.value = nextCity;
    localStorage.setItem('fixNationBookingLocation', JSON.stringify(bookingLocation));
    updateCartState();
  });

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
    bookingLocation = {
      city,
      address,
      phone,
      latitude: bookingLatitudeInput?.value || bookingLocation.latitude || '',
      longitude: bookingLongitudeInput?.value || bookingLocation.longitude || '',
      googleMapsUrl: mapShareUrlInput?.value.trim() || bookingLocation.googleMapsUrl || ''
    };
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
  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));

  const createBookingId = () => {
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `TFN-${stamp}-${random}`;
  };

  const createSubmissionId = () => `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  const rememberBooking = (payload) => {
    const savedPayload = Object.assign({ savedAt: new Date().toISOString() }, payload);
    localStorage.setItem('fixNationLastBooking', JSON.stringify(savedPayload));
    let bookings = [];
    try { bookings = JSON.parse(localStorage.getItem('fixNationBookings') || '[]'); } catch (error) {}
    bookings = Array.isArray(bookings) ? bookings.filter((item) => item.bookingId !== payload.bookingId) : [];
    bookings.unshift(savedPayload);
    localStorage.setItem('fixNationBookings', JSON.stringify(bookings.slice(0, 10)));
  };

  const rememberWorkerApplication = (payload) => {
    const savedPayload = Object.assign({ savedAt: new Date().toISOString() }, payload);
    localStorage.setItem('fixNationLastWorkerApplication', JSON.stringify(savedPayload));
    let applications = [];
    try { applications = JSON.parse(localStorage.getItem('fixNationWorkerApplications') || '[]'); } catch (error) {}
    applications = Array.isArray(applications) ? applications.filter((item) => item.applicationId !== payload.applicationId) : [];
    applications.unshift(savedPayload);
    localStorage.setItem('fixNationWorkerApplications', JSON.stringify(applications.slice(0, 10)));
  };

  const updateStoredBooking = (bookingId, changes) => {
    if (!bookingId) return null;
    let updated = null;
    let bookings = [];
    try { bookings = JSON.parse(localStorage.getItem('fixNationBookings') || '[]'); } catch (error) {}
    bookings = Array.isArray(bookings) ? bookings.map((item) => {
      if (item.bookingId !== bookingId) return item;
      updated = Object.assign({}, item, changes, { updatedAt: new Date().toISOString() });
      return updated;
    }) : [];
    if (updated) {
      localStorage.setItem('fixNationBookings', JSON.stringify(bookings.slice(0, 10)));
      localStorage.setItem('fixNationLastBooking', JSON.stringify(updated));
    }
    return updated;
  };

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
    if (!endpoint) return;
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
        if (!item.endpoint) continue;
        await submitLead(item.endpoint, item.payload);
      } catch (error) {
        break;
      }
    }
  };

  const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(-10);

  if (bookingPhoneInput) {
    bookingPhoneInput.addEventListener('input', () => {
      bookingPhoneInput.value = normalizePhone(bookingPhoneInput.value);
    });
  }

  document.querySelectorAll('.lead-form input[name="phone"]').forEach((input) => {
    input.addEventListener('input', () => {
      input.value = normalizePhone(input.value);
    });
  });

  const validateLeadPayload = (payload, formType) => {
    payload.phone = normalizePhone(payload.phone);
    payload.city = String(payload.city || '').trim();
    payload.name = String(payload.name || '').trim();
    payload.service = String(payload.service || '').trim();
    payload.skill = String(payload.skill || '').trim();
    if (!/^\d{10}$/.test(payload.phone)) return 'Enter a valid 10 digit mobile number.';
    if (!payload.city) return 'Enter service city.';
    if (formType === 'customer') {
      if (!payload.name) return 'Enter customer name.';
      if (!payload.service) return 'Select a service.';
    }
    if (formType === 'worker') {
      if (!payload.name) return 'Enter worker name.';
      if (!payload.skill) return 'Select primary skill.';
    }
    return '';
  };

  const getPaymentDetailsText = (bookingId) => [
    'The Fix Nation booking confirmation',
    `Booking charge: Rs ${bookingFee}`,
    `UPI ID: ${upiId}`,
    `Auto reference: ${bookingId}`,
    `Payee: ${payeeName}`
  ].join('\n');

  const getUpiIntentUrl = (bookingId) => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: String(bookingFee),
      cu: 'INR',
      tn: `The Fix Nation ${bookingId}`
    });
    return `upi://pay?${params.toString()}`;
  };

  const copyPaymentDetails = async (bookingId) => {
    const text = getPaymentDetailsText(bookingId);
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return false;
    }
  };

  const copyPaymentOrShowManual = async (bookingId, noteElement) => {
    if (!bookingId || !upiId) return;
    const copied = await copyPaymentDetails(bookingId);
    if (noteElement) {
      noteElement.textContent = copied
        ? `UPI details copied. If direct payment does not open, paste these details in your UPI app or WhatsApp support.`
        : `Auto reference ${bookingId}. Rs ${bookingFee} confirmation ke liye support se WhatsApp par confirm karo.`;
    }
  };

  const showPaymentModal = (bookingId) => {
    if (!paymentModal) return;
    activePaymentBookingId = bookingId;
    if (paymentBookingId) paymentBookingId.textContent = bookingId;
    if (paymentUpi) paymentUpi.textContent = upiId;
    if (paymentStatusLabel) paymentStatusLabel.textContent = 'Pending verification';
    if (paymentLink) paymentLink.textContent = 'Copy UPI details instead';
    if (paymentIntentButton) {
      paymentIntentButton.disabled = !upiId;
      paymentIntentButton.textContent = upiId ? `Pay Rs ${bookingFee} with UPI app` : 'UPI payment unavailable';
    }
    if (paymentWhatsApp) {
      paymentWhatsApp.href = `https://wa.me/919407840541?text=${encodeURIComponent(getPaymentDetailsText(bookingId))}`;
    }
    if (paymentDialogStatus) {
      paymentDialogStatus.textContent = 'UPI app open hoga. Payment complete hone ke baad “I have paid Rs 49” press karein.';
    }
    paymentModal.hidden = false;
    document.body.classList.add('payment-modal-open');
  };

  paymentLink?.addEventListener('click', (event) => {
    event.preventDefault();
    copyPaymentOrShowManual(activePaymentBookingId, paymentDialogStatus);
  });

  paymentIntentButton?.addEventListener('click', () => {
    if (!activePaymentBookingId || !upiId) return;
    updateStoredBooking(activePaymentBookingId, { paymentStatus: 'UPI app opened' });
    if (paymentDialogStatus) {
      paymentDialogStatus.textContent = 'Opening UPI app. Payment complete hone ke baad wapas aakar “I have paid Rs 49” press karein.';
    }
    window.location.href = getUpiIntentUrl(activePaymentBookingId);
  });

  document.querySelectorAll('[data-payment-close]').forEach((button) => {
    button.addEventListener('click', () => {
      if (paymentModal) paymentModal.hidden = true;
      document.body.classList.remove('payment-modal-open');
    });
  });

  document.querySelectorAll('[data-copy-payment]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copyPayment === 'all'
        ? getPaymentDetailsText(activePaymentBookingId || paymentBookingId?.textContent || '')
        : button.dataset.copyPayment === 'upi' ? paymentUpi?.textContent : paymentBookingId?.textContent;
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value.trim());
        button.textContent = 'Copied';
        if (paymentDialogStatus) paymentDialogStatus.textContent = `${button.dataset.copyPayment === 'all' ? 'Confirmation details' : button.dataset.copyPayment === 'upi' ? 'UPI ID' : 'Auto reference'} copied.`;
      } catch (error) {
        if (paymentDialogStatus) paymentDialogStatus.textContent = `Copy this value: ${value.trim()}`;
      }
    });
  });

  paymentReportForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const endpoint = leadEndpoints.customer || leadEndpoints.all || leadEndpoints.googleSheetUrl;
    const transactionReference = String(new FormData(paymentReportForm).get('transactionReference') || '').trim();
    if (!activePaymentBookingId || !bookingLocation.phone) {
      if (paymentDialogStatus) paymentDialogStatus.textContent = 'Booking phone or auto reference is missing.';
      return;
    }
    const button = paymentReportForm.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    if (paymentDialogStatus) paymentDialogStatus.textContent = 'Sending payment report for team verification...';
    const reportPayload = {
      submissionId: createSubmissionId(),
      action: 'report_payment',
      formType: 'customer',
      bookingId: activePaymentBookingId,
      phone: bookingLocation.phone,
      transactionReference
    };
    try {
      if (endpoint) {
        await submitLead(endpoint, reportPayload);
      } else {
        localStorage.setItem('fixNationLastPaymentReport', JSON.stringify(reportPayload));
      }
      updateStoredBooking(activePaymentBookingId, {
        paymentStatus: 'Customer reported paid',
        transactionReference,
        paymentReportedAt: new Date().toISOString()
      });
      if (paymentStatusLabel) paymentStatusLabel.textContent = 'Customer reported paid';
      if (paymentDialogStatus) paymentDialogStatus.textContent = 'Payment report sent. Team verification will update your booking status.';
      paymentReportForm.reset();
    } catch (error) {
      queueLead(endpoint, reportPayload);
      localStorage.setItem('fixNationLastPaymentReport', JSON.stringify(reportPayload));
      updateStoredBooking(activePaymentBookingId, {
        paymentStatus: 'Customer reported paid',
        transactionReference,
        paymentReportedAt: new Date().toISOString(),
        syncStatus: 'Payment report retry pending'
      });
      if (paymentStatusLabel) paymentStatusLabel.textContent = 'Customer reported paid';
      if (paymentDialogStatus) paymentDialogStatus.textContent = 'Payment report saved on this device. Keep the UPI reference and send details on WhatsApp if team has not called.';
    } finally {
      if (button) button.disabled = false;
    }
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
      paymentProvider: 'UPI direct',
      paymentGatewayOrderId: bookingId,
      paymentGatewayStatus: 'Created',
      paymentMethod: 'UPI manual confirmation',
      paymentNote: `${bookingId} booking confirmation`,
      name: '',
      email: '',
      phone: bookingLocation.phone,
      city: bookingLocation.city,
      address: bookingLocation.address,
      latitude: bookingLocation.latitude || '',
      longitude: bookingLocation.longitude || '',
      googleMapsUrl: bookingLocation.googleMapsUrl || (bookingLocation.latitude && bookingLocation.longitude
        ? `https://www.google.com/maps/search/?api=1&query=${bookingLocation.latitude},${bookingLocation.longitude}`
        : ''),
      service: selectedServices.map((service) => service.name).join(' + '),
      serviceCount: selectedServices.length,
      message: selectedServices.map((service) => `${service.name}: ${service.note}`).join(' | '),
      callbackTime: 'Any time today'
    };

    applySelectedBookingToForm();
    if (cartPaymentStatus) {
        cartPaymentStatus.className = 'cart-payment-status';
      cartPaymentStatus.textContent = 'Saving booking details and preparing payment...';
    }
    if (bookingPayInline) bookingPayInline.disabled = true;

    try {
      await submitLead(endpoint, payload);
      rememberBooking(payload);
      if (cartPaymentStatus) {
        cartPaymentStatus.className = 'cart-payment-status is-success';
        cartPaymentStatus.textContent = `Booking saved. Payment is ready.`;
      }
      if (bookingPayInline) {
        bookingPayInline.disabled = false;
        bookingPayInline.textContent = 'Booking saved';
      }
      showPaymentModal(bookingId);
    } catch (error) {
      rememberBooking(Object.assign({}, payload, { syncStatus: 'Retry pending' }));
      if (cartPaymentStatus) {
        cartPaymentStatus.className = 'cart-payment-status is-error';
        cartPaymentStatus.textContent = `Booking reference saved on this device. Internet/Sheet sync issue hai; details WhatsApp par bhej do.`;
      }
      if (bookingPayInline) bookingPayInline.disabled = false;
      showPaymentModal(bookingId);
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
        <strong>Booking confirmation: Rs ${bookingFee}</strong>
        <small>First submit your details. The site will create an auto reference for payment/support. If any payment app shows a risk warning, do not pay and contact WhatsApp support.</small>
      </div>
      <button class="booking-pay-btn" type="button" disabled>Copy confirmation details</button>
      <div class="booking-upi-details" hidden>
        <div><span>UPI ID</span><strong data-upi-id>${upiId}</strong></div>
        <div><span>Amount</span><strong>Rs ${bookingFee}</strong></div>
        <div><span>Auto reference</span><strong data-booking-id>Generated after submit</strong></div>
      </div>
      <p class="booking-payment-note">Confirmation details activate after callback form submit.</p>
    `;
    if (button) {
      button.insertAdjacentElement('afterend', box);
    } else {
      form.appendChild(box);
    }
  };

  const renderWorkerApplicationReceipt = (payload) => {
    const receipt = document.querySelector('[data-worker-application-receipt]');
    if (!receipt || !payload?.applicationId) return;
    receipt.hidden = false;
    receipt.innerHTML = `
      <strong>Application received</strong>
      <span>Reference: ${escapeHtml(payload.applicationId)}</span>
      <small>${escapeHtml(payload.skill || 'Worker profile')} · ${escapeHtml(payload.city || 'Service city')} · Status: ${escapeHtml(payload.leadStatus || 'Application received')}</small>
      <a href="https://wa.me/919407840541?text=${encodeURIComponent(`The Fix Nation worker application ${payload.applicationId}`)}" target="_blank" rel="noopener">Send reference on WhatsApp</a>
    `;
  };

  try {
    renderWorkerApplicationReceipt(JSON.parse(localStorage.getItem('fixNationLastWorkerApplication') || 'null'));
  } catch (error) {}

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
      const validationError = validateLeadPayload(payload, formType);
      if (validationError) {
        if (status) {
          status.classList.add('is-error');
          status.textContent = validationError;
        }
        return;
      }
      payload.submissionId = createSubmissionId();
      payload.formType = formType;
      payload.source = 'The Fix Nation website';
      payload.pageUrl = window.location.href;
      payload.submittedAt = new Date().toISOString();
      if (formType === 'customer') {
        payload.bookingId = bookingId;
        payload.bookingFee = bookingFee;
        payload.paymentStatus = upiId ? 'Pending verification' : 'UPI ID pending';
        payload.paymentProvider = 'UPI direct';
        payload.paymentGatewayOrderId = bookingId;
        payload.paymentGatewayStatus = 'Created';
        payload.paymentMethod = 'UPI manual confirmation';
        payload.paymentNote = bookingId ? `${bookingId} booking confirmation` : '';
        payload.address = payload.address || bookingLocation.address || '';
        payload.latitude = payload.latitude || bookingLocation.latitude || '';
        payload.longitude = payload.longitude || bookingLocation.longitude || '';
        payload.googleMapsUrl = payload.googleMapsUrl || bookingLocation.googleMapsUrl || '';
      } else {
        if (!payload.consent) payload.consent = 'Yes - submitted worker application';
        payload.applicationId = `PRO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        payload.leadStatus = 'Application received';
      }

      if (status) {
        status.classList.remove('is-error');
        status.textContent = formType === 'customer' ? 'Saving details and preparing confirmation...' : 'Saving your details...';
      }
      if (submitButton) submitButton.disabled = true;

      try {
        if (endpoint) {
          await submitLead(endpoint, payload);
          if (formType === 'customer') {
            rememberBooking(payload);
            if (status) status.textContent = `Details saved. Reference: ${bookingId}`;
            if (paymentBox) paymentBox.classList.add('is-ready');
            if (bookingIdLabel) bookingIdLabel.textContent = bookingId;
            if (upiDetails) upiDetails.hidden = false;
            if (payButton) {
              payButton.disabled = !upiId;
              payButton.textContent = upiId ? `Copy confirmation details` : 'UPI ID pending';
              payButton.onclick = () => {
                copyPaymentOrShowManual(bookingId, paymentNote);
              };
            }
            if (paymentNote) {
              paymentNote.textContent = upiId
                ? `Reference ${bookingId} generated. Payment status: Pending verification.`
                : `Reference ${bookingId} generated. Add UPI ID in lead-config.js to activate payment button.`;
            }
          } else {
            rememberWorkerApplication(payload);
            if (status) status.textContent = `Application submitted. Reference: ${payload.applicationId}. Our onboarding team will review it.`;
            renderWorkerApplicationReceipt(payload);
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
        if (formType === 'worker') {
          rememberWorkerApplication(Object.assign({}, payload, { syncStatus: 'Retry pending' }));
          renderWorkerApplicationReceipt(payload);
        }
        if (status) {
          status.classList.add('is-error');
          status.textContent = formType === 'worker'
            ? `Application saved on this device. Reference: ${payload.applicationId}. If team does not call, WhatsApp this reference.`
            : 'Submission failed. Please try again or contact us on WhatsApp.';
        }
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  });

  window.addEventListener('online', retryPendingLeads);
  retryPendingLeads();

  const bookingStatusForm = document.querySelector('[data-booking-status-form]');
  const recentBookingHelper = document.querySelector('[data-recent-booking]');
  if (bookingStatusForm && recentBookingHelper) {
    try {
      const lastBooking = JSON.parse(localStorage.getItem('fixNationLastBooking') || 'null');
      if (lastBooking?.bookingId && lastBooking?.phone) {
        const last4 = String(lastBooking.phone || '').replace(/\D/g, '').slice(-4);
        recentBookingHelper.hidden = false;
        recentBookingHelper.innerHTML = `<strong>Recent booking: ${escapeHtml(lastBooking.bookingId)}</strong><span>${escapeHtml(lastBooking.service || 'Service request')} · ${escapeHtml(lastBooking.city || '')}</span><button type="button" data-fill-recent-booking>Use this booking</button>`;
        recentBookingHelper.querySelector('[data-fill-recent-booking]')?.addEventListener('click', () => {
          const bookingInput = bookingStatusForm.querySelector('input[name="bookingId"]');
          const phoneInput = bookingStatusForm.querySelector('input[name="phoneLast4"]');
          if (bookingInput) bookingInput.value = lastBooking.bookingId;
          if (phoneInput) phoneInput.value = last4;
          bookingStatusForm.requestSubmit();
        });
      }
    } catch (error) {}
  }
  const renderBookingTimeline = (timeline, scheduledAt) => {
    const container = document.querySelector('[data-booking-timeline]');
    if (!container || !timeline?.items?.length) return;
    container.hidden = false;
    container.innerHTML = timeline.items.map((item) => `<div class="booking-timeline-item is-${escapeHtml(item.state)}"><span></span><div><strong>${escapeHtml(item.label)}</strong><small>${item.state === 'current' ? 'Current status' : item.state === 'complete' ? 'Completed' : 'Pending'}</small></div></div>`).join('') + (scheduledAt ? `<p><strong>Scheduled:</strong> ${escapeHtml(scheduledAt)}</p>` : '');
  };
  bookingStatusForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(bookingStatusForm);
    const bookingId = String(formData.get('bookingId') || '').trim().toUpperCase();
    const phoneLast4 = String(formData.get('phoneLast4') || '').replace(/\D/g, '').slice(-4);
    const result = document.querySelector('[data-booking-status-result]');
    const timeline = document.querySelector('[data-booking-timeline]');
    const endpoint = leadEndpoints.customer || leadEndpoints.all || leadEndpoints.googleSheetUrl;
    if (timeline) timeline.hidden = true;
    if (!result || !/^TFN-\d{8}-[A-Z0-9]{4}$/.test(bookingId) || !/^\d{4}$/.test(phoneLast4)) {
      if (result) result.innerHTML = '<strong>Check booking details</strong><span>Use the auto reference and the phone number\'s last 4 digits.</span>';
      return;
    }

    result.className = 'booking-status-result is-loading';
    result.innerHTML = '<strong>Checking booking...</strong><span>Please wait a moment.</span>';
    try {
      const response = await fetch(`${endpoint}?action=status&bookingId=${encodeURIComponent(bookingId)}&phone=${encodeURIComponent(phoneLast4)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'Booking not found');
      result.className = 'booking-status-result is-found';
      result.innerHTML = `<strong>${escapeHtml(data.leadStatus || 'Booking received')}</strong><span>${escapeHtml(data.service || 'Service request')} in ${escapeHtml(data.city || 'your city')} · Payment: ${escapeHtml(data.paymentStatus || 'Pending verification')}</span>${data.technicianAssigned ? `<small>Professional: ${escapeHtml(data.technicianName)} · ${escapeHtml(data.technicianPhoneMasked)}</small>` : '<small>Professional details appear after assignment.</small>'}`;
      renderBookingTimeline(data.timeline, data.scheduledAt);
    } catch (error) {
      let saved = null;
      try {
        const storedBookings = JSON.parse(localStorage.getItem('fixNationBookings') || '[]');
        saved = Array.isArray(storedBookings)
          ? storedBookings.find((item) => item.bookingId === bookingId)
          : JSON.parse(localStorage.getItem('fixNationLastBooking') || 'null');
      } catch (storageError) {
        try { saved = JSON.parse(localStorage.getItem('fixNationLastBooking') || 'null'); } catch (lastError) {}
      }
      if (saved?.bookingId === bookingId && String(saved.phone || '').replace(/\D/g, '').slice(-4) === phoneLast4) {
        result.className = 'booking-status-result is-found';
        result.innerHTML = `<strong>Booking received</strong><span>${escapeHtml(saved.service)} in ${escapeHtml(saved.city)} · Payment: ${escapeHtml(saved.paymentStatus)}</span><small>Live status is temporarily unavailable; this is the saved device record.</small>`;
      } else {
        result.className = 'booking-status-result is-error';
        result.innerHTML = '<strong>Booking could not be verified</strong><span>Confirm the reference and phone digits, or contact support on WhatsApp.</span>';
      }
    }
  });

  const workerStatusForm = document.querySelector('[data-worker-status-form]');
  workerStatusForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(workerStatusForm);
    const applicationId = String(formData.get('applicationId') || '').trim().toUpperCase();
    const phoneLast4 = String(formData.get('phoneLast4') || '').replace(/\D/g, '').slice(-4);
    const result = document.querySelector('[data-worker-status-result]');
    const endpoint = leadEndpoints.worker || leadEndpoints.all || leadEndpoints.googleSheetUrl;
    if (!result || !/^PRO-\d{13}-[A-Z0-9]{4}$/.test(applicationId) || !/^\d{4}$/.test(phoneLast4)) {
      if (result) result.innerHTML = '<strong>Check application details</strong><span>Use your PRO reference and phone last 4 digits.</span>';
      return;
    }
    result.className = 'booking-status-result is-loading';
    result.innerHTML = '<strong>Checking application...</strong><span>Please wait a moment.</span>';
    try {
      const response = await fetch(`${endpoint}?action=worker_status&applicationId=${encodeURIComponent(applicationId)}&phone=${encodeURIComponent(phoneLast4)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'Application not found');
      result.className = 'booking-status-result is-found';
      result.innerHTML = `<strong>${escapeHtml(data.leadStatus || 'Application received')}</strong><span>${escapeHtml(data.skill || 'Worker profile')} in ${escapeHtml(data.city || 'your city')}</span><small>Updated: ${escapeHtml(data.updatedAt || 'Pending update')}</small>`;
    } catch (error) {
      let saved = null;
      try {
        const applications = JSON.parse(localStorage.getItem('fixNationWorkerApplications') || '[]');
        saved = Array.isArray(applications) ? applications.find((item) => item.applicationId === applicationId) : null;
      } catch (storageError) {}
      if (saved?.applicationId === applicationId && String(saved.phone || '').replace(/\D/g, '').slice(-4) === phoneLast4) {
        result.className = 'booking-status-result is-found';
        result.innerHTML = `<strong>${escapeHtml(saved.leadStatus || 'Application received')}</strong><span>${escapeHtml(saved.skill || 'Worker profile')} in ${escapeHtml(saved.city || 'your city')}</span><small>Live status temporarily unavailable; this is the saved device record.</small>`;
      } else {
        result.className = 'booking-status-result is-error';
        result.innerHTML = '<strong>Application could not be verified</strong><span>Confirm the reference and phone digits, or contact support on WhatsApp.</span>';
      }
    }
  });
});
