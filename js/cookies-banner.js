// cookies-banner.js — MolvicStudios
// RGPD/LOPDGDD compliant — Bilingüe ES/EN
// Sin dependencias externas

(function () {
  'use strict';

  const CONSENT_KEY = 'molvic_cookie_consent';

  if (localStorage.getItem(CONSENT_KEY)) return;

  const lang = navigator.language && navigator.language.startsWith('es') ? 'es' : 'en';

  const i18n = {
    es: {
      message: 'Usamos cookies esenciales para el funcionamiento del sitio. No utilizamos cookies de seguimiento ni publicidad.',
      accept: 'Aceptar',
      reject: 'Rechazar',
      policy: 'Política de privacidad',
      label: 'Consentimiento de cookies'
    },
    en: {
      message: 'We use essential cookies for site functionality. We do not use tracking or advertising cookies.',
      accept: 'Accept',
      reject: 'Decline',
      policy: 'Privacy policy',
      label: 'Cookie consent'
    }
  };

  const t = i18n[lang];

  // Inject styles
  const style = document.createElement('style');
  style.textContent = [
    '#molvic-cookie-banner{position:fixed;bottom:0;left:0;right:0;background:#1a1a1a;color:#e5e5e5;',
    'box-shadow:0 -4px 16px rgba(0,0,0,.4);z-index:9999;padding:16px 20px;opacity:0;',
    'transition:opacity .3s ease;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;',
    'font-size:.875rem;line-height:1.5;}',
    '#molvic-cookie-banner.visible{opacity:1;}',
    '#molvic-cookie-banner-inner{max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:12px;}',
    '#molvic-cookie-banner-msg{color:#e5e5e5;}',
    '#molvic-cookie-banner-msg a{color:#f59e0b;text-decoration:underline;}',
    '#molvic-cookie-banner-actions{display:flex;gap:10px;flex-wrap:wrap;}',
    '#molvic-cookie-banner-accept{padding:8px 20px;border-radius:6px;font-size:.875rem;font-weight:600;',
    'border:none;cursor:pointer;background:#f59e0b;color:#000;transition:background .2s ease;}',
    '#molvic-cookie-banner-accept:hover{background:#d97706;}',
    '#molvic-cookie-banner-accept:focus-visible{outline:2px solid #f59e0b;outline-offset:2px;}',
    '#molvic-cookie-banner-reject{padding:8px 20px;border-radius:6px;font-size:.875rem;font-weight:600;',
    'cursor:pointer;background:transparent;color:#aaa;border:1px solid #555;',
    'transition:border-color .2s ease,color .2s ease;}',
    '#molvic-cookie-banner-reject:hover{border-color:#aaa;color:#e5e5e5;}',
    '#molvic-cookie-banner-reject:focus-visible{outline:2px solid #f59e0b;outline-offset:2px;}',
    '@media(min-width:640px){',
    '#molvic-cookie-banner-inner{flex-direction:row;align-items:center;}',
    '#molvic-cookie-banner-actions{margin-left:auto;flex-shrink:0;}}'
  ].join('');
  document.head.appendChild(style);

  // Build DOM
  const banner = document.createElement('div');
  banner.id = 'molvic-cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', t.label);
  banner.setAttribute('aria-live', 'polite');

  const inner = document.createElement('div');
  inner.id = 'molvic-cookie-banner-inner';

  const msg = document.createElement('p');
  msg.id = 'molvic-cookie-banner-msg';
  msg.textContent = t.message + ' ';

  const link = document.createElement('a');
  link.href = '/privacidad.html';
  link.textContent = t.policy;
  msg.appendChild(link);

  const actions = document.createElement('div');
  actions.id = 'molvic-cookie-banner-actions';

  const btnAccept = document.createElement('button');
  btnAccept.id = 'molvic-cookie-banner-accept';
  btnAccept.type = 'button';
  btnAccept.textContent = t.accept;

  const btnReject = document.createElement('button');
  btnReject.id = 'molvic-cookie-banner-reject';
  btnReject.type = 'button';
  btnReject.textContent = t.reject;

  actions.appendChild(btnAccept);
  actions.appendChild(btnReject);
  inner.appendChild(msg);
  inner.appendChild(actions);
  banner.appendChild(inner);
  document.body.appendChild(banner);

  // Fade in (double rAF ensures paint before transition)
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      banner.classList.add('visible');
      btnAccept.focus();
    });
  });

  function close(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (_) {}
    banner.classList.remove('visible');
    banner.addEventListener('transitionend', function () {
      banner.remove();
      style.remove();
    }, { once: true });
  }

  btnAccept.addEventListener('click', function () { close('accepted'); });
  btnReject.addEventListener('click', function () { close('rejected'); });
})();
