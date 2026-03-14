/* ============================================
   Cookies Banner — GDPR/LOPD Consent
   ============================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'cookie_consent';

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      // silently fail
    }
  }

  function buildBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookies-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Consentimiento de cookies');
    banner.id = 'cookies-banner';

    const inner = document.createElement('div');
    inner.className = 'cookies-inner';

    const text = document.createElement('p');
    text.className = 'cookies-text';
    text.textContent = 'Usamos cookies para mejorar tu experiencia. Puedes aceptar todas o solo las esenciales. ';
    const link = document.createElement('a');
    link.href = 'cookies.html';
    link.textContent = 'Ver política de cookies';
    text.appendChild(link);

    const actions = document.createElement('div');
    actions.className = 'cookies-actions';

    const btnAll = document.createElement('button');
    btnAll.className = 'btn btn-primary';
    btnAll.textContent = 'Aceptar todo';
    btnAll.type = 'button';
    btnAll.addEventListener('click', function () {
      setConsent('all');
      hideBanner(banner);
      loadMonetization();
    });

    const btnEssential = document.createElement('button');
    btnEssential.className = 'btn btn-secondary';
    btnEssential.textContent = 'Solo esenciales';
    btnEssential.type = 'button';
    btnEssential.addEventListener('click', function () {
      setConsent('essential');
      hideBanner(banner);
    });

    actions.appendChild(btnAll);
    actions.appendChild(btnEssential);
    inner.appendChild(text);
    inner.appendChild(actions);
    banner.appendChild(inner);

    return banner;
  }

  function showBanner(banner) {
    requestAnimationFrame(function () {
      banner.classList.add('visible');
      banner.querySelector('.btn-primary').focus();
    });
  }

  function hideBanner(banner) {
    banner.classList.remove('visible');
    banner.addEventListener('transitionend', function () {
      banner.remove();
    }, { once: true });
  }

  function loadMonetization() {
    // Placeholder for ad network script.
    // Replace the src and data-site-id with your ad provider values.
    // const script = document.createElement('script');
    // script.src = 'https://tu-red-publicitaria.com/script.js';
    // script.setAttribute('data-site-id', 'TU_SITE_ID');
    // script.async = true;
    // document.head.appendChild(script);
  }

  function init() {
    var consent = getConsent();
    if (consent === 'all') {
      loadMonetization();
      return;
    }
    if (consent === 'essential') {
      return;
    }
    var banner = buildBanner();
    document.body.appendChild(banner);
    // Small delay so CSS transition works
    setTimeout(function () { showBanner(banner); }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
