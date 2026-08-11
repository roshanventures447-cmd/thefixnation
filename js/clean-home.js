document.addEventListener('DOMContentLoaded', () => {
  const serviceData = [
    ['beds', 'Bed assembly', 'Single, double, hydraulic and storage bed setup after delivery.', 'img/service-bed-assembly.png', 'Most booked'],
    ['sofa-installation', 'Sofa installation', 'Sofa leg fitting, sectional alignment and hardware tightening.', 'img/slider-sofa-installation.jpg', 'Setup'],
    ['sofa-repair', 'Sofa repair', 'Loose frame, support issue, fitting tightening and repair scope check.', 'img/slider-sofa-repair.jpg', 'Repair'],
    ['bed-repair', 'Bed repair', 'Loose bed frame, broken support, hydraulic fitting and joint tightening.', 'img/slider-bed-repair.jpg', 'Carpenter'],
    ['wardrobe', 'Wardrobe assembly', 'Sliding wardrobe, modular wardrobe, cabinet panels, doors and shelf fitting.', 'img/service-wardrobe-assembly.png', 'Large furniture'],
    ['repair', 'Furniture repair', 'Hinges, drawers, handles, shelves and minor carpenter repair.', 'img/service-furniture-repair.png', 'Repair visit'],
    ['ac-service', 'AC service', 'Split and window AC cleaning, filter wash and performance check.', 'img/service-ac-cleaning.jpg', 'Cooling care'],
    ['ac-repair', 'AC repair', 'Cooling issue, leakage, gas check, noise diagnosis and repair estimate.', 'img/service-ac-repair.jpg', 'Diagnosis'],
    ['electrician', 'Electrician visit', 'Switches, sockets, fans, lights and minor electrical support.', 'img/service-electrician.jpg', 'Handyman'],
    ['plumber', 'Plumber visit', 'Taps, sinks, drains, leakage and minor bathroom plumbing support.', 'img/service-plumber.jpg', 'Handyman']
  ];

  const cities = window.FIX_NATION_CITIES || ['Chennai', 'Bangalore', 'Indore', 'Jaipur', 'Delhi NCR', 'Noida', 'Gurugram', 'Kolkata', 'Bhubaneswar', 'Hyderabad', 'Mumbai', 'Pune'];
  const paymentConfig = window.FIX_NATION_PAYMENT || {};
  const leadConfig = window.FIX_NATION_LEADS || {};
  const upiId = paymentConfig.upiId || '9165867685-5@ybl';
  const bookingFee = Number(paymentConfig.bookingFee || 49);
  const payeeName = paymentConfig.payeeName || 'The Fix Nation';

  const citySelects = document.querySelectorAll('[data-city-select]');
  citySelects.forEach((select) => {
    select.innerHTML = cities.map((city) => `<option>${escapeHtml(city)}</option>`).join('');
  });

  const selected = [];
  const address = { city: citySelects[0]?.value || cities[0], detail: '', phone: '', map: '' };
  const serviceList = document.querySelector('[data-service-list]');
  const cartCount = document.querySelectorAll('[data-cart-count]');
  const cartList = document.querySelector('[data-cart-list]');
  const cartEmpty = document.querySelector('[data-cart-empty]');
  const cartNote = document.querySelector('[data-cart-note]');
  const payButton = document.querySelector('[data-pay-booking]');
  const bookingStatus = document.querySelector('[data-booking-status]');
  const paymentModal = document.querySelector('[data-payment-modal]');
  const paymentBookingId = document.querySelector('[data-payment-booking-id]');
  const paymentUpi = document.querySelector('[data-payment-upi]');
  const paymentStatus = document.querySelector('[data-payment-status]');
  const paymentMessage = document.querySelector('[data-payment-message]');
  const paymentIntent = document.querySelector('[data-payment-intent]');
  const paymentWhatsApp = document.querySelector('[data-payment-whatsapp]');
  const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeBookingId = '';
  let activeSlide = 0;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }

  function createBookingId() {
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    return `TFN-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  function normalizePhone(value) {
    return String(value || '').replace(/\D/g, '').slice(-10);
  }

  function isAddressReady() {
    return address.city && address.detail.trim().length >= 8 && /^\d{10}$/.test(address.phone);
  }

  function renderServices(filter = '') {
    if (!serviceList) return;
    serviceList.innerHTML = serviceData
      .filter(([key, name, copy]) => !filter || `${key} ${name} ${copy}`.toLowerCase().includes(filter.toLowerCase()))
      .map(([key, name, copy, image, label]) => `
        <article class="service-item" data-service-key="${key}">
          <img src="${image}" alt="${escapeHtml(name)}">
          <div>
            <small>${escapeHtml(label)}</small>
            <h3>${escapeHtml(name)}</h3>
            <p>${escapeHtml(copy)}</p>
            <div class="meta"><span>Home visit</span><span>Callback first</span><span>Quote on visit</span></div>
            <strong class="service-price">Rs ${bookingFee} booking, final quote on visit</strong>
          </div>
          <button class="add-btn ${selected.some((item) => item.key === key) ? 'added' : ''}" type="button" data-add-service="${key}">${selected.some((item) => item.key === key) ? 'Added' : 'Add'}</button>
        </article>`).join('');
  }

  function renderCart() {
    cartCount.forEach((item) => { item.textContent = String(selected.length); });
    if (cartEmpty) cartEmpty.hidden = selected.length > 0;
    if (cartList) {
      cartList.innerHTML = selected.map((item) => `
        <div class="cart-row">
          <div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.copy)}</span></div>
          <button type="button" data-remove-service="${item.key}">Remove</button>
        </div>`).join('');
    }
    if (cartNote) {
      cartNote.textContent = isAddressReady()
        ? `${address.city}: ${address.detail}`
        : 'Add city, complete address and mobile number before payment.';
    }
    if (payButton) {
      payButton.disabled = !(selected.length && isAddressReady());
      payButton.textContent = selected.length ? `Confirm ${selected.length} service${selected.length > 1 ? 's' : ''} and pay Rs ${bookingFee}` : 'Select at least one service';
    }
  }

  function showSlide(index) {
    if (!heroSlides.length) return;
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });
    heroDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  function saveAddressFromForm(form) {
    address.city = form.querySelector('[name="city"]')?.value || address.city;
    address.detail = form.querySelector('[name="address"]')?.value.trim() || '';
    address.phone = normalizePhone(form.querySelector('[name="phone"]')?.value);
    address.map = form.querySelector('[name="map"]')?.value.trim() || '';
    citySelects.forEach((select) => { select.value = address.city; });
    renderCart();
  }

  async function submitPayload(payload) {
    const endpoint = leadConfig.customer || leadConfig.all || leadConfig.googleSheetUrl;
    if (!endpoint) return;
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-store',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
  }

  function getUpiUrl(bookingId) {
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: String(bookingFee),
      cu: 'INR',
      tn: `The Fix Nation ${bookingId}`
    });
    return `upi://pay?${params.toString()}`;
  }

  function openPayment(bookingId) {
    activeBookingId = bookingId;
    if (paymentBookingId) paymentBookingId.textContent = bookingId;
    if (paymentUpi) paymentUpi.textContent = upiId;
    if (paymentStatus) paymentStatus.textContent = 'Pending verification';
    if (paymentWhatsApp) {
      paymentWhatsApp.href = `https://wa.me/919407840541?text=${encodeURIComponent(`The Fix Nation booking payment\nBooking ID: ${bookingId}\nUPI ID: ${upiId}\nAmount: Rs ${bookingFee}`)}`;
    }
    if (paymentMessage) paymentMessage.textContent = 'UPI app open karein. Payment ke baad reference WhatsApp ya form me share kar sakte hain.';
    if (paymentModal) paymentModal.hidden = false;
  }

  renderServices();
  renderCart();
  if (heroSlides.length) {
    showSlide(0);
    window.setInterval(() => showSlide(activeSlide + 1), 2000);
  }

  document.querySelectorAll('[data-search-service]').forEach((input) => {
    input.addEventListener('input', () => renderServices(input.value.trim()));
  });

  document.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('active', item === button));
      renderServices(button.dataset.category || '');
      document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-open-category]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      renderServices(link.dataset.openCategory || '');
      document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  serviceList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-service]');
    if (!button) return;
    const item = serviceData.find(([key]) => key === button.dataset.addService);
    if (!item) return;
    const exists = selected.some((service) => service.key === item[0]);
    if (exists) {
      const index = selected.findIndex((service) => service.key === item[0]);
      selected.splice(index, 1);
    } else {
      selected.push({ key: item[0], name: item[1], copy: item[2] });
    }
    renderServices(document.querySelector('[data-search-service]')?.value.trim() || '');
    renderCart();
  });

  cartList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-service]');
    if (!button) return;
    const index = selected.findIndex((service) => service.key === button.dataset.removeService);
    if (index >= 0) selected.splice(index, 1);
    renderServices(document.querySelector('[data-search-service]')?.value.trim() || '');
    renderCart();
  });

  document.querySelector('[data-booking-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    saveAddressFromForm(event.currentTarget);
    if (bookingStatus) {
      bookingStatus.textContent = isAddressReady() ? 'Address saved. Ab service add karo.' : 'Complete address and valid 10 digit mobile number add karo.';
      bookingStatus.className = `status ${isAddressReady() ? 'good' : 'bad'}`;
    }
    if (isAddressReady()) document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.querySelector('[data-use-location]')?.addEventListener('click', () => {
    const status = document.querySelector('[data-location-status]');
    if (!navigator.geolocation) {
      if (status) status.textContent = 'Location is not supported on this device.';
      return;
    }
    if (status) status.textContent = 'Finding your location...';
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lon = position.coords.longitude.toFixed(6);
      const input = document.querySelector('[name="map"]');
      if (input) input.value = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      if (status) status.textContent = 'Location link added. Please add house number and landmark.';
    }, () => {
      if (status) status.textContent = 'Location permission nahi mili. Address manually add karo.';
    }, { enableHighAccuracy: true, timeout: 12000 });
  });

  payButton?.addEventListener('click', async () => {
    if (!selected.length || !isAddressReady()) {
      renderCart();
      return;
    }
    const bookingId = createBookingId();
    const payload = {
      submissionId: `SUB-${Date.now()}`,
      formType: 'customer',
      source: 'The Fix Nation clean homepage',
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString(),
      bookingId,
      bookingFee,
      paymentStatus: 'Pending verification',
      paymentProvider: 'UPI direct',
      paymentMethod: 'UPI manual confirmation',
      phone: address.phone,
      city: address.city,
      address: address.detail,
      googleMapsUrl: address.map,
      service: selected.map((item) => item.name).join(' + '),
      serviceCount: selected.length,
      message: selected.map((item) => `${item.name}: ${item.copy}`).join(' | ')
    };
    try {
      await submitPayload(payload);
      localStorage.setItem('fixNationLastBooking', JSON.stringify(payload));
    } catch (error) {
      localStorage.setItem('fixNationLastBooking', JSON.stringify(Object.assign(payload, { syncStatus: 'Retry pending' })));
    }
    openPayment(bookingId);
  });

  paymentIntent?.addEventListener('click', () => {
    if (!activeBookingId) return;
    window.location.href = getUpiUrl(activeBookingId);
  });

  document.querySelectorAll('[data-payment-close]').forEach((button) => {
    button.addEventListener('click', () => {
      if (paymentModal) paymentModal.hidden = true;
    });
  });

  document.querySelector('[data-payment-report-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const reference = event.currentTarget.querySelector('[name="transactionReference"]')?.value.trim() || '';
    const payload = {
      submissionId: `SUB-${Date.now()}`,
      action: 'report_payment',
      formType: 'customer',
      bookingId: activeBookingId,
      phone: address.phone,
      transactionReference: reference
    };
    try { await submitPayload(payload); } catch (error) {}
    if (paymentStatus) paymentStatus.textContent = 'Customer reported paid';
    if (paymentMessage) paymentMessage.textContent = 'Payment report saved. Team verification ke baad callback/update milega.';
  });

  document.querySelectorAll('[data-lead-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      data.submissionId = `SUB-${Date.now()}`;
      data.submittedAt = new Date().toISOString();
      data.pageUrl = window.location.href;
      data.source = 'The Fix Nation clean homepage form';
      data.formType = form.dataset.leadForm;
      data.phone = normalizePhone(data.phone);
      const status = form.querySelector('.form-status');
      try {
        await submitPayload(data);
        if (status) {
          status.textContent = data.formType === 'worker' ? 'Worker profile submitted. Team verification ke baad call karegi.' : 'Callback request submitted. Team jaldi call karegi.';
          status.className = 'form-status status good';
        }
        form.reset();
      } catch (error) {
        if (status) {
          status.textContent = 'Details saved on this device. Agar callback na aaye to WhatsApp support par bhej do.';
          status.className = 'form-status status bad';
        }
      }
    });
  });
});
