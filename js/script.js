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

  setSelectedCity(localStorage.getItem('fixNationSelectedCity') || citySelects[0]?.value || 'Indore');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearchQuery = searchInput.value.trim().toLowerCase();
      applyServiceVisibility();
    });
  }

  const marketplace = document.querySelector('.marketplace');
  const cartPanel = document.querySelector('.cart-panel');
  const closeCart = document.querySelector('.cart-close');
  const selectedServiceName = document.querySelector('#selected-service-name');
  const selectedServiceNote = document.querySelector('#selected-service-note');
  const addButtons = Array.from(document.querySelectorAll('.add'));
  const bookingPayInline = document.querySelector('.booking-pay-inline');
  const bookingLocationForm = document.querySelector('[data-booking-location-form]');
  const bookingCityInput = document.querySelector('[data-booking-city]');
  const bookingAddressInput = document.querySelector('[data-booking-address]');
  const bookingLocationStatus = document.querySelector('[data-booking-location-status]');
  const cartAddressNote = document.querySelector('[data-cart-address-note]');
  const cartPaymentStatus = document.querySelector('[data-cart-payment-status]');
  const loginModal = document.querySelector('[data-login-modal]');
  const loginForm = document.querySelector('[data-login-form]');
  const loginOpenButtons = Array.from(document.querySelectorAll('[data-login-open]'));
  const loginClose = document.querySelector('[data-login-close]');
  const otpRow = document.querySelector('[data-otp-row]');
  const demoOtpLabel = document.querySelector('[data-demo-otp]');
  const loginSubmit = document.querySelector('[data-login-submit]');
  const loginStatus = document.querySelector('[data-login-status]');
  const loginChip = document.querySelector('.login-chip');
  let selectedBookingService = '';
  let selectedBookingNote = '';
  let bookingLocation = JSON.parse(localStorage.getItem('fixNationBookingLocation') || 'null') || { city: '', address: '' };
  let customerSession = JSON.parse(localStorage.getItem('fixNationCustomerSession') || 'null') || null;
  let loginOtp = '';
  let pendingPaymentAfterLogin = false;

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
      selectedBookingService = card?.dataset.bookingService || title;
      selectedBookingNote = note;

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
      updateCartState();

      if (window.innerWidth < 1100) {
        cartPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const applySelectedBookingToForm = () => {
    if (!selectedBookingService) return;
    const customerForm = document.querySelector('.quote-form[data-lead-form="customer"]');
    if (!customerForm) return;
    const serviceSelect = customerForm.querySelector('select[name="service"]');
    const messageInput = customerForm.querySelector('input[name="message"], textarea[name="message"]');
    if (serviceSelect) {
      const matchedOption = Array.from(serviceSelect.options).find((option) => option.textContent.trim() === selectedBookingService);
      if (matchedOption) {
        serviceSelect.value = matchedOption.value || matchedOption.textContent;
      }
    }
    if (messageInput && !messageInput.value) {
      messageInput.value = `${selectedBookingService}: ${selectedBookingNote}`;
    }
  };

  const setLoginUi = () => {
    if (!loginChip) return;
    if (customerSession?.phone) {
      loginChip.textContent = `Hi, ${customerSession.phone.slice(-4)}`;
      loginChip.classList.add('is-logged-in');
    } else {
      loginChip.textContent = 'Login';
      loginChip.classList.remove('is-logged-in');
    }
  };

  const openLogin = () => {
    if (!loginModal) return;
    loginModal.hidden = false;
    loginForm?.querySelector('input[name="loginPhone"]')?.focus();
  };

  const closeLoginModal = () => {
    if (loginModal) loginModal.hidden = true;
  };

  loginOpenButtons.forEach((button) => button.addEventListener('click', openLogin));
  loginClose?.addEventListener('click', closeLoginModal);
  loginModal?.addEventListener('click', (event) => {
    if (event.target === loginModal) closeLoginModal();
  });

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const phoneInput = loginForm.querySelector('input[name="loginPhone"]');
    const otpInput = loginForm.querySelector('input[name="loginOtp"]');
    const phone = (phoneInput?.value || '').replace(/\D/g, '').slice(-10);
    if (phone.length !== 10) {
      if (loginStatus) {
        loginStatus.className = 'login-status is-error';
        loginStatus.textContent = 'Enter a valid 10 digit mobile number.';
      }
      return;
    }
    if (!loginOtp) {
      loginOtp = String(Math.floor(1000 + Math.random() * 9000));
      if (otpRow) otpRow.hidden = false;
      if (demoOtpLabel) demoOtpLabel.textContent = `Preview OTP: ${loginOtp}`;
      if (loginSubmit) loginSubmit.textContent = 'Verify OTP';
      if (loginStatus) {
        loginStatus.className = 'login-status';
        loginStatus.textContent = 'OTP sent. For preview, use the OTP shown above. Live SMS can be connected later.';
      }
      otpInput?.focus();
      return;
    }
    if ((otpInput?.value || '').trim() !== loginOtp) {
      if (loginStatus) {
        loginStatus.className = 'login-status is-error';
        loginStatus.textContent = 'Incorrect OTP. Check the preview OTP and try again.';
      }
      return;
    }
    customerSession = { phone, loggedInAt: new Date().toISOString() };
    localStorage.setItem('fixNationCustomerSession', JSON.stringify(customerSession));
    loginOtp = '';
    if (otpRow) otpRow.hidden = true;
    if (demoOtpLabel) demoOtpLabel.textContent = '';
    if (loginSubmit) loginSubmit.textContent = 'Send OTP';
    if (loginStatus) {
      loginStatus.className = 'login-status is-success';
      loginStatus.textContent = 'Login successful.';
    }
    setLoginUi();
    closeLoginModal();
    updateCartState();
    if (pendingPaymentAfterLogin) {
      pendingPaymentAfterLogin = false;
      handleInlinePayment();
    }
  });

  const isLocationReady = () => Boolean(bookingLocation.city && bookingLocation.address && bookingLocation.address.trim().length >= 8);

  const markLocationError = (message) => {
    if (bookingLocationStatus) {
      bookingLocationStatus.className = 'booking-location-status is-error';
      bookingLocationStatus.textContent = message;
    }
  };

  const syncBookingLocationToFields = () => {
    if (bookingCityInput && bookingLocation.city) bookingCityInput.value = bookingLocation.city;
    if (bookingAddressInput && bookingLocation.address) bookingAddressInput.value = bookingLocation.address;
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
        : 'City and address must be added before payment.';
    }
    if (bookingPayInline) {
      bookingPayInline.disabled = !(locationReady && selectedBookingService);
      if (!selectedBookingService) {
        bookingPayInline.textContent = 'Select a service';
      } else if (!customerSession?.phone) {
        bookingPayInline.textContent = 'Login and pay Rs 49';
      } else {
        bookingPayInline.textContent = 'Pay Rs 49 via UPI';
      }
    }
    if (bookingLocationStatus && locationReady) {
      bookingLocationStatus.className = 'booking-location-status is-ready';
      bookingLocationStatus.textContent = `${bookingLocation.city} address added. Now choose a service below.`;
    }
  };

  bookingLocationForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const city = bookingCityInput?.value || '';
    const address = (bookingAddressInput?.value || '').trim();
    if (!cityServices[city]) {
      markLocationError('Select a confirmed service city.');
      return;
    }
    if (address.length < 8) {
      markLocationError('Enter a complete house / area / landmark address.');
      return;
    }
    bookingLocation = { city, address };
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

  const handleInlinePayment = async () => {
    if (!selectedBookingService) {
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
    if (!customerSession?.phone) {
      pendingPaymentAfterLogin = true;
      openLogin();
      return;
    }

    const endpoint = leadEndpoints.customer || leadEndpoints.all || leadEndpoints.googleSheetUrl;
    const bookingId = createBookingId();
    const payload = {
      formType: 'customer',
      source: 'The Fix Nation website inline booking',
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString(),
      bookingId,
      bookingFee,
      paymentStatus: upiId ? 'Pending verification' : 'UPI ID pending',
      paymentNote: `${bookingId} booking confirmation`,
      name: '',
      phone: customerSession.phone,
      city: bookingLocation.city,
      address: bookingLocation.address,
      service: selectedBookingService,
      message: selectedBookingNote,
      callbackTime: 'Any time today'
    };

    applySelectedBookingToForm();
    if (cartPaymentStatus) {
      cartPaymentStatus.className = 'cart-payment-status';
      cartPaymentStatus.textContent = 'Saving booking details and generating payment note...';
    }
    if (bookingPayInline) bookingPayInline.disabled = true;

    try {
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      }
      localStorage.setItem('fixNationLastBooking', JSON.stringify(payload));
      if (cartPaymentStatus) {
        cartPaymentStatus.className = 'cart-payment-status is-success';
        cartPaymentStatus.textContent = `Booking ID ${bookingId} saved. UPI note: ${bookingId}`;
      }
      if (bookingPayInline) {
        bookingPayInline.disabled = false;
        bookingPayInline.textContent = 'Pay Rs 49 via UPI';
      }
      window.location.href = createUpiLink(bookingId);
      window.setTimeout(() => {
        if (cartPaymentStatus) {
          cartPaymentStatus.className = 'cart-payment-status';
          cartPaymentStatus.textContent = `If UPI app does not open, pay Rs ${bookingFee} to ${upiId} and use note: ${bookingId}`;
        }
      }, 700);
    } catch (error) {
      if (cartPaymentStatus) {
        cartPaymentStatus.className = 'cart-payment-status is-error';
        cartPaymentStatus.textContent = 'Could not save booking. Please try again or WhatsApp us.';
      }
      if (bookingPayInline) bookingPayInline.disabled = false;
    }
  };

  syncBookingLocationToFields();
  setLoginUi();
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
