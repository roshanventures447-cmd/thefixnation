(function () {
  const services = [
    { id: 'ac-service', name: 'AC Repair & Service', category: 'AC Service', price: 599, time: '60-90 mins', image: 'img/market-ac-service.png' },
    { id: 'bed-assembly', name: 'Bed Assembly', category: 'Carpentry', price: 49, time: '60-120 mins', image: 'img/service-bed-assembly.png' },
    { id: 'furniture-repair', name: 'Furniture Repair', category: 'Carpentry', price: 49, time: 'Visit based', image: 'img/service-furniture-repair.png' },
    { id: 'plumbing', name: 'Plumbing Repair', category: 'Plumbing', price: 399, time: '45-90 mins', image: 'img/market-plumbing.png' },
    { id: 'electrical', name: 'Electrician', category: 'Electrical', price: 299, time: '45-90 mins', image: 'img/market-electrical.png' },
    { id: 'sofa-repair', name: 'Sofa Repair', category: 'Carpentry', price: 49, time: 'Visit based', image: 'img/slider-sofa-repair.jpg' },
    { id: 'deep-cleaning', name: 'Deep Cleaning', category: 'Cleaning', price: 999, time: '2-3 hrs', image: 'img/market-cleaning.png' },
    { id: 'pest-control', name: 'Pest Control', category: 'Pest Control', price: 699, time: '60 mins', image: 'img/market-pest-control.png' }
  ];

  const cart = [];
  const config = window.FIX_NATION_LEADS || {};
  const payment = window.FIX_NATION_PAYMENT || {};
  const cities = window.FIX_NATION_CITIES || ['Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Noida', 'Gurugram', 'Pune'];
  const bookingFee = Number(payment.bookingFee || 49);
  const upiId = payment.upiId || '9165867685-5@ybl';
  const payeeName = payment.payeeName || 'The Fix Nation';
  let selectedCity = localStorage.getItem('fixNationCity') || 'Bangalore';
  let activeFilter = '';
  let activeBookingId = '';
  const seoServices = [
    { label: 'Bed Assembly', prefix: 'bed-assembly' },
    { label: 'Bed Repair', prefix: 'bed-repair' },
    { label: 'Furniture Assembly', prefix: 'furniture-assembly' },
    { label: 'Furniture Repair', prefix: 'furniture-repair' },
    { label: 'Sofa Assembly', prefix: 'sofa-assembly' },
    { label: 'Sofa Repair', prefix: 'sofa-repair' }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }

  function phone(value) {
    return String(value || '').replace(/\D/g, '').slice(-10);
  }

  function bookingId() {
    const now = new Date();
    const stamp = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('');
    return `TFN-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  function endpointFor(type) {
    return type === 'worker' ? (config.worker || config.all) : (config.customer || config.all || config.googleSheetUrl);
  }

  function citySlug(city) {
    const aliases = {
      Banglore: 'bangalore',
      Bengaluru: 'bangalore',
      Hydrabad: 'hyderabad',
      Gurgoun: 'gurugram',
      Gurgaon: 'gurugram',
      Kolkatta: 'kolkata',
      Varanshi: 'varanasi',
      Banaras: 'varanasi',
      Varodra: 'vadodara',
      Vadodra: 'vadodara',
      NCR: 'delhi-ncr',
      'Delhi NCR': 'delhi-ncr'
    };
    const cleaned = String(city || '').trim();
    return (aliases[cleaned] || cleaned).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function seoHref(prefix, city) {
    return `${prefix}-${citySlug(city)}.html`;
  }

  async function submitLead(payload, type) {
    const endpoint = endpointFor(type);
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

  function initCities() {
    $$('[data-city-select]').forEach((select) => {
      select.innerHTML = cities.map((city) => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`).join('');
      select.value = cities.includes(selectedCity) ? selectedCity : cities[0];
      select.addEventListener('change', () => setCity(select.value));
    });
    setCity(selectedCity);
  }

  function setCity(city) {
    selectedCity = cities.includes(city) ? city : (city || cities[0]);
    localStorage.setItem('fixNationCity', selectedCity);
    localStorage.setItem('fixNationSelectedCity', selectedCity);
    $$('[data-current-city]').forEach((node) => { node.textContent = selectedCity; });
    $$('[data-city-select]').forEach((select) => { if (select.value !== selectedCity) select.value = selectedCity; });
    applyFilter(activeFilter);
    renderSeoLinks();
    window.dispatchEvent(new CustomEvent('fixnation:citychange', { detail: { city: selectedCity } }));
  }

  function renderSeoLinks() {
    const selectedLinks = $('[data-selected-city-links]');
    if (selectedLinks) {
      selectedLinks.innerHTML = seoServices.map((item) => `
        <a href="${seoHref(item.prefix, selectedCity)}">
          <span>${escapeHtml(item.label)}</span>
          <small>${escapeHtml(selectedCity)}</small>
        </a>`).join('');
    }
    const grid = $('[data-seo-city-grid]');
    if (grid) {
      grid.innerHTML = cities.map((city) => `
        <a class="${city === selectedCity ? 'active' : ''}" href="${seoHref('bed-assembly', city)}" data-seo-city="${escapeHtml(city)}">
          ${escapeHtml(city)}
        </a>`).join('') + '<a class="all-pages" href="city-service-pages.html">All city pages</a>';
    }
    renderCityPicker($('[data-city-search]')?.value || '');
  }

  function renderCityPicker(filter = '') {
    const grid = $('[data-city-picker-grid]');
    if (!grid) return;
    const query = String(filter || '').trim().toLowerCase();
    const filtered = cities.filter((city) => !query || city.toLowerCase().includes(query));
    grid.innerHTML = filtered.map((city) => `
      <button class="${city === selectedCity ? 'active' : ''}" type="button" data-pick-city="${escapeHtml(city)}">
        ${escapeHtml(city)}
      </button>`).join('');
  }

  function openCityModal() {
    const modal = $('[data-city-modal]');
    const input = $('[data-city-search]');
    if (input) input.value = '';
    renderCityPicker('');
    if (modal) modal.hidden = false;
    window.setTimeout(() => input?.focus(), 40);
  }

  function closeCityModal() {
    const modal = $('[data-city-modal]');
    if (modal) modal.hidden = true;
  }

  function renderBrandPartners() {
    const grid = $('[data-brand-grid]');
    if (!grid) return;
    const brands = Array.isArray(window.FIX_NATION_BRANDS)
      ? window.FIX_NATION_BRANDS.map((brand) => String(brand || '').trim()).filter(Boolean)
      : [];
    if (!brands.length) return;
    grid.innerHTML = brands.map((brand) => `<span>${escapeHtml(brand)}</span>`).join('');
  }

  function installWhatsappAction() {
    if ($('[data-floating-whatsapp]')) return;
    const message = `Hi The Fix Nation, I need service help from ${document.title} - ${window.location.href}`;
    const button = document.createElement('a');
    button.className = 'floating-whatsapp-action';
    button.href = `https://wa.me/919407840541?text=${encodeURIComponent(message)}`;
    button.target = '_blank';
    button.rel = 'noopener';
    button.setAttribute('aria-label', 'Chat with The Fix Nation on WhatsApp');
    button.setAttribute('data-floating-whatsapp', '');
    button.setAttribute('data-conversion-action', 'whatsapp_float');
    button.innerHTML = `
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <path d="M32 8.5c-12.7 0-23 9.8-23 21.9 0 4.1 1.2 8 3.4 11.3L9 55.5l14.2-3.2c2.8 1.3 5.8 2 8.8 2 12.7 0 23-9.8 23-21.9S44.7 8.5 32 8.5Z"/>
        <path d="M24.1 20.8c-.6-1.2-1.1-1.2-1.7-1.2h-1.4c-.5 0-1.3.2-2 1-.7.8-2.6 2.5-2.6 6 0 3.6 2.7 7 3.1 7.5.4.5 5.2 8.1 12.9 11 6.4 2.5 7.7 2 9.1 1.9 1.4-.1 4.5-1.8 5.1-3.6.6-1.8.6-3.3.4-3.6-.2-.3-.7-.5-1.5-.9l-5.2-2.5c-.8-.4-1.4-.6-2 .3-.6.8-2.3 2.6-2.8 3.1-.5.6-1 .6-1.8.2-.8-.4-3.5-1.2-6.6-3.9-2.4-2.1-4.1-4.7-4.6-5.5-.5-.8-.1-1.3.3-1.7.4-.4.8-1 1.2-1.5.4-.5.5-.8.8-1.4.3-.6.1-1.1-.1-1.5l-2.4-5.7Z"/>
      </svg>
      <span>WhatsApp</span>`;
    document.body.appendChild(button);
  }

  function applyFilter(category) {
    activeFilter = category || '';
    const query = ($('[data-service-search]')?.value || '').trim().toLowerCase();
    let visibleCount = 0;
    $$('[data-service]').forEach((card) => {
      const service = services.find((item) => item.id === card.dataset.service);
      const haystack = `${service.name} ${service.category}`.toLowerCase();
      const visible = (!activeFilter || service.category === activeFilter || service.name.includes(activeFilter)) && (!query || haystack.includes(query));
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    $$('[data-filter], [data-chip]').forEach((button) => button.classList.toggle('active', (button.dataset.filter || button.dataset.chip || '') === activeFilter && !!activeFilter));
    const label = $('[data-result-label]');
    if (label) label.textContent = activeFilter ? `${visibleCount} ${activeFilter} services found in ${selectedCity}` : `Showing ${visibleCount} popular services in ${selectedCity}`;
  }

  function renderCart() {
    $$('[data-cart-count]').forEach((node) => { node.textContent = String(cart.length); });
    const title = $('[data-cart-title]');
    if (title) title.textContent = `${cart.length} service${cart.length === 1 ? '' : 's'}`;
    const list = $('[data-cart-items]');
    const empty = $('[data-cart-empty]');
    if (empty) empty.hidden = cart.length > 0;
    if (!list) return;
    list.innerHTML = cart.map((item) => `
      <div class="cart-row">
        <img src="${item.image}" alt="">
        <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.time)} - Rs ${item.price}${item.price === 49 ? ' booking' : ' onwards'}</small></div>
        <button type="button" data-remove-cart="${item.cartId}">Remove</button>
      </div>`).join('');
  }

  function addService(id) {
    const service = services.find((item) => item.id === id);
    if (!service) return;
    cart.push(Object.assign({}, service, { cartId: `${id}-${Date.now()}-${cart.length}` }));
    renderCart();
    openCart();
  }

  function openCart() {
    const drawer = $('[data-cart-drawer]');
    if (drawer) drawer.hidden = false;
  }

  function closeCart() {
    const drawer = $('[data-cart-drawer]');
    if (drawer) drawer.hidden = true;
  }

  function openPayment(id) {
    activeBookingId = id;
    const modal = $('[data-payment-modal]');
    const bookingNode = $('[data-payment-booking-id]');
    const upiNode = $('[data-upi-id]');
    const upiLink = $('[data-upi-link]');
    const waLink = $('[data-whatsapp-link]');
    if (bookingNode) bookingNode.textContent = id;
    if (upiNode) upiNode.textContent = upiId;
    const upiParams = new URLSearchParams({ pa: upiId, pn: payeeName, am: String(bookingFee), cu: 'INR', tn: `The Fix Nation ${id}` });
    if (upiLink) upiLink.href = `upi://pay?${upiParams.toString()}`;
    if (waLink) waLink.href = `https://wa.me/919407840541?text=${encodeURIComponent(`The Fix Nation booking\nBooking ID: ${id}\nAmount: Rs ${bookingFee}\nUPI: ${upiId}`)}`;
    if (modal) modal.hidden = false;
  }

  async function submitInstantCallback(form) {
    const status = $('[data-instant-callback-status]');
    const data = Object.fromEntries(new FormData(form).entries());
    const cleanPhone = phone(data.phone);
    if (!data.name || cleanPhone.length !== 10 || !data.service) {
      if (status) status.textContent = 'Name, valid 10 digit mobile and service select karo.';
      return;
    }
    const id = bookingId();
    const payload = {
      submissionId: `SUB-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      formType: 'customer',
      source: 'Homepage direct callback form',
      pageUrl: window.location.href,
      bookingId: id,
      name: data.name,
      phone: cleanPhone,
      city: selectedCity,
      address: '',
      callbackTime: 'Call as soon as possible',
      bookingFee,
      paymentStatus: 'Not started',
      service: data.service,
      message: `Direct callback requested for ${data.service} in ${selectedCity}`
    };
    if (status) status.textContent = 'Saving details...';
    try {
      await submitLead(payload, 'customer');
      localStorage.setItem('fixNationLastBooking', JSON.stringify(payload));
      form.reset();
      $$('[data-city-select]').forEach((select) => { if (select.value !== selectedCity) select.value = selectedCity; });
      if (status) status.textContent = `Request saved. Team will call from 9407840541. Ref: ${id}`;
    } catch (error) {
      if (status) status.textContent = 'Agar callback na aaye to WhatsApp ya call button use karo. Details device par saved hain.';
      localStorage.setItem('fixNationPendingCallback', JSON.stringify(payload));
    }
  }

  function initHeroSlider() {
    const slider = $('[data-hero-slider]');
    if (!slider) return;
    const slides = $$('[data-hero-slide]', slider);
    const dots = $$('[data-hero-dot]', slider);
    if (slides.length < 2) return;
    let index = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (index < 0) index = 0;
    let timer;

    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const start = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 2000);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });
    slider.addEventListener('mouseenter', () => window.clearInterval(timer));
    slider.addEventListener('mouseleave', start);
    show(index);
    start();
  }

  function initEvents() {
    $$('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        applyFilter(button.dataset.filter || '');
        $('#services')?.scrollIntoView({ behavior: 'smooth' });
      });
    });
    $$('[data-chip]').forEach((button) => {
      button.addEventListener('click', () => {
        applyFilter(button.dataset.chip || '');
        $('#services')?.scrollIntoView({ behavior: 'smooth' });
      });
    });
    $('[data-reset-filter]')?.addEventListener('click', () => applyFilter(''));
    $('[data-service-search]')?.addEventListener('input', () => applyFilter(activeFilter));
    $('[data-quick-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      setCity(event.currentTarget.city.value);
      applyFilter(activeFilter);
      $('#services')?.scrollIntoView({ behavior: 'smooth' });
    });
    $$('[data-add-service]').forEach((button) => button.addEventListener('click', () => addService(button.dataset.addService)));
    $('[data-open-cart]')?.addEventListener('click', openCart);
    $('[data-close-cart]')?.addEventListener('click', closeCart);
    $('[data-cart-items]')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove-cart]');
      if (!button) return;
      const index = cart.findIndex((item) => item.cartId === button.dataset.removeCart);
      if (index >= 0) cart.splice(index, 1);
      renderCart();
    });
    $('[data-open-login]')?.addEventListener('click', () => { $('[data-login-modal]').hidden = false; });
    $('[data-close-login]')?.addEventListener('click', () => { $('[data-login-modal]').hidden = true; });
    $$('[data-city-open]').forEach((button) => button.addEventListener('click', openCityModal));
    $('[data-close-city]')?.addEventListener('click', closeCityModal);
    $('[data-city-search]')?.addEventListener('input', (event) => renderCityPicker(event.target.value));
    $('[data-city-picker-grid]')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-pick-city]');
      if (!button) return;
      setCity(button.dataset.pickCity);
      closeCityModal();
    });
    $('[data-login-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      localStorage.setItem('fixNationUser', JSON.stringify({ name: data.name || 'Customer', phone: phone(data.phone) }));
      $('[data-login-modal]').hidden = true;
    });
    $('[data-close-payment]')?.addEventListener('click', () => { $('[data-payment-modal]').hidden = true; });
    $('[data-open-custom]')?.addEventListener('click', openCart);
    $('[data-open-callback]')?.addEventListener('click', () => {
      $('#book')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => $('[data-instant-callback-form] input[name="phone"]')?.focus(), 320);
    });
    $('[data-instant-callback-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      submitInstantCallback(event.currentTarget);
    });
    $('[data-checkout-form]')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!cart.length) return;
      const checkoutStatus = $('[data-checkout-status]');
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      const id = bookingId();
      const payload = {
        submissionId: `SUB-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        formType: 'customer',
        source: 'Marketplace static homepage',
        pageUrl: window.location.href,
        bookingId: id,
        name: data.name,
        phone: phone(data.phone),
        city: selectedCity,
        address: data.address,
        callbackTime: data.callbackTime,
        bookingFee,
        paymentStatus: 'Pending verification',
        service: cart.map((item) => item.name).join(' + '),
        message: cart.map((item) => `${item.name} (${item.category})`).join(' | ')
      };
      if (checkoutStatus) checkoutStatus.textContent = 'Saving booking details...';
      try {
        await submitLead(payload, 'customer');
        if (checkoutStatus) checkoutStatus.textContent = `Booking details saved. Ref: ${id}`;
      } catch (error) {
        if (checkoutStatus) checkoutStatus.textContent = 'Network issue. Payment/WhatsApp screen open ho rahi hai; support ko booking reference bhej dena.';
      }
      localStorage.setItem('fixNationLastBooking', JSON.stringify(payload));
      cart.splice(0, cart.length);
      renderCart();
      closeCart();
      openPayment(id);
    });
    $('[data-partner-form]')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      const status = $('[data-partner-status]');
      const payload = {
        submissionId: `SUB-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        formType: 'worker',
        source: 'Marketplace static homepage partner form',
        pageUrl: window.location.href,
        name: data.name,
        phone: phone(data.phone),
        city: data.city,
        skill: data.skill,
        service: data.skill,
        message: 'Worker application from homepage'
      };
      try { await submitLead(payload, 'worker'); } catch (error) {}
      if (status) status.textContent = 'Application submitted. Team verification ke baad call karegi.';
      event.currentTarget.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCities();
    initHeroSlider();
    initEvents();
    renderBrandPartners();
    installWhatsappAction();
    renderCart();
    applyFilter('');
  });
})();
