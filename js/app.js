/* ============================================
   Aprende por Rutas — Main Application
   Vanilla ES6+, no innerHTML with JSON data
   ============================================ */
(function () {
  'use strict';

  const DATA_URL = 'aprende.json';
  const NIVELES_ORDEN = ['basico', 'intermedio', 'avanzado'];
  const NIVELES_LABEL = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };

  let rutasData = [];
  let metaData = {};
  let activeSection = null;

  /* --- Helpers --- */

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'className') node.className = attrs[k];
        else if (k === 'textContent') node.textContent = attrs[k];
        else if (k.startsWith('data')) node.setAttribute(k.replace(/([A-Z])/g, '-$1').toLowerCase(), attrs[k]);
        else node.setAttribute(k, attrs[k]);
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function sanitizeId(id) {
    return String(id).replace(/[^a-zA-Z0-9-_]/g, '');
  }

  /* --- Fetch Data --- */

  async function loadData() {
    const resp = await fetch(DATA_URL);
    if (!resp.ok) throw new Error('Error al cargar datos');
    const data = await resp.json();
    metaData = data.meta || {};
    rutasData = data.rutas || [];
    return data;
  }

  /* --- Build Navigation --- */

  function buildNav() {
    const navList = document.getElementById('nav-rutas-list');
    if (!navList) return;
    navList.textContent = '';
    rutasData.forEach(function (ruta) {
      var id = ruta.id ? sanitizeId(ruta.id) : sanitizeId(ruta.nombre);
      var btn = el('button', {
        className: 'nav-ruta-btn',
        type: 'button',
        'aria-label': 'Ir a ' + ruta.nombre
      });
      btn.dataset.target = id;
      btn.textContent = (ruta.emoji || '') + ' ' + ruta.nombre;
      btn.addEventListener('click', function () {
        var target = document.getElementById('ruta-' + id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      navList.appendChild(btn);
    });
  }

  /* --- Build Card --- */

  function buildCard(recurso) {
    var card = el('article', { className: 'recurso-card' + (recurso.destacado ? ' destacado' : '') });

    // Header
    var header = el('div', { className: 'recurso-card-header' });
    var nombreWrap = el('div', { className: 'recurso-nombre' });
    var link = el('a', { href: recurso.url, target: '_blank', rel: 'noopener noreferrer' });
    link.textContent = recurso.nombre;
    // External icon SVG
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'recurso-external-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('aria-hidden', 'true');
    var path1 = document.createElementNS(svgNS, 'path');
    path1.setAttribute('d', 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6');
    var path2 = document.createElementNS(svgNS, 'polyline');
    path2.setAttribute('points', '15 3 21 3 21 9');
    var path3 = document.createElementNS(svgNS, 'line');
    path3.setAttribute('x1', '10'); path3.setAttribute('y1', '14');
    path3.setAttribute('x2', '21'); path3.setAttribute('y2', '3');
    svg.appendChild(path1);
    svg.appendChild(path2);
    svg.appendChild(path3);
    link.appendChild(svg);
    nombreWrap.appendChild(link);
    header.appendChild(nombreWrap);
    if (recurso.destacado) {
      header.appendChild(el('span', { className: 'recurso-star', 'aria-label': 'Destacado', textContent: '⭐' }));
    }
    card.appendChild(header);

    // Description
    card.appendChild(el('p', { className: 'recurso-descripcion', textContent: recurso.descripcion }));

    // Badges
    var badges = el('div', { className: 'recurso-badges' });
    var nivelClass = 'badge badge-nivel-' + (recurso.nivel || 'basico');
    badges.appendChild(el('span', { className: nivelClass, textContent: NIVELES_LABEL[recurso.nivel] || recurso.nivel }));

    var accesoClass = 'badge badge-acceso-' + (recurso.tipo_acceso || 'gratis').replace('-', '-');
    badges.appendChild(el('span', { className: accesoClass, textContent: recurso.tipo_acceso }));

    badges.appendChild(el('span', { className: 'badge badge-idioma', textContent: recurso.idioma }));

    if (recurso.tiempo_estimado) {
      badges.appendChild(el('span', { className: 'badge-tiempo', textContent: recurso.tiempo_estimado }));
    }
    card.appendChild(badges);

    // Notes
    if (recurso.notas) {
      card.appendChild(el('p', { className: 'recurso-notas', textContent: recurso.notas }));
    }

    return card;
  }

  /* --- Build Nivel Section --- */

  function buildNivel(nivel, recursos) {
    var section = el('div', { className: 'nivel-section nivel-' + nivel });
    var header = el('div', { className: 'nivel-header' });
    header.appendChild(el('h3', { className: 'nivel-title', textContent: NIVELES_LABEL[nivel] || nivel }));
    header.appendChild(el('span', { className: 'nivel-count', textContent: recursos.length + ' recurso' + (recursos.length !== 1 ? 's' : '') }));

    // Progress bar
    var bar = el('div', { className: 'nivel-bar' });
    var fill = el('div', { className: 'nivel-bar-fill' });
    fill.style.width = Math.min(100, recursos.length * 10) + '%';
    bar.appendChild(fill);
    header.appendChild(bar);
    section.appendChild(header);

    var grid = el('div', { className: 'recursos-grid' });
    recursos.forEach(function (r) { grid.appendChild(buildCard(r)); });
    section.appendChild(grid);
    return section;
  }

  /* --- Build Ruta Section --- */

  function buildRuta(ruta) {
    var id = ruta.id ? sanitizeId(ruta.id) : sanitizeId(ruta.nombre);
    var section = el('section', { className: 'ruta-section', id: 'ruta-' + id });

    var headerDiv = el('div', { className: 'ruta-header' });
    var h2 = el('h2', { className: 'ruta-title' });
    h2.appendChild(el('span', { className: 'ruta-emoji', 'aria-hidden': 'true', textContent: ruta.emoji || '' }));
    h2.appendChild(document.createTextNode(ruta.nombre));
    headerDiv.appendChild(h2);

    if (ruta.descripcion) {
      headerDiv.appendChild(el('p', { className: 'ruta-descripcion', textContent: ruta.descripcion }));
    }
    if (ruta.objetivo) {
      headerDiv.appendChild(el('p', { className: 'ruta-objetivo', textContent: '🎯 Objetivo: ' + ruta.objetivo }));
    }
    section.appendChild(headerDiv);

    // Suggestion
    var sugerencia = el('p', {
      className: 'ruta-objetivo',
      textContent: '📝 Orden sugerido: Básico → Intermedio → Avanzado'
    });
    sugerencia.style.marginBottom = '18px';
    sugerencia.style.marginTop = '8px';
    section.appendChild(sugerencia);

    // Group by level
    var byNivel = {};
    (ruta.recursos || []).forEach(function (r) {
      var n = r.nivel || 'basico';
      if (!byNivel[n]) byNivel[n] = [];
      byNivel[n].push(r);
    });

    NIVELES_ORDEN.forEach(function (nivel) {
      if (byNivel[nivel] && byNivel[nivel].length > 0) {
        section.appendChild(buildNivel(nivel, byNivel[nivel]));
      }
    });

    return section;
  }

  /* --- Render All --- */

  function renderAll(rutas) {
    var container = document.getElementById('rutas-container');
    if (!container) return;
    container.textContent = '';

    if (rutas.length === 0) {
      var noRes = el('div', { className: 'no-results' });
      noRes.appendChild(el('div', { className: 'no-results-icon', textContent: '🔍' }));
      noRes.appendChild(el('p', { className: 'no-results-text', textContent: 'No se encontraron resultados' }));
      noRes.appendChild(el('p', { className: 'no-results-sub', textContent: 'Intenta con otro término de búsqueda' }));
      container.appendChild(noRes);
      return;
    }

    rutas.forEach(function (ruta, i) {
      container.appendChild(buildRuta(ruta));
      // Ad slot between levels (after first few routes)
      if (i === 2 || i === 8 || i === 14) {
        var adSlot = el('div', {
          className: 'ad-slot',
          id: 'ad-slot--in-content-' + i,
          'aria-hidden': 'true'
        });
        container.appendChild(adSlot);
      }
    });
  }

  /* --- Stats --- */

  function updateStats() {
    var statsEl = document.getElementById('header-stats');
    if (!statsEl) return;
    var totalRecursos = 0;
    rutasData.forEach(function (r) { totalRecursos += (r.recursos || []).length; });
    statsEl.textContent = totalRecursos + ' recursos en ' + rutasData.length + ' rutas';
  }

  /* --- Footer --- */

  function updateFooter() {
    var dateEl = document.getElementById('footer-date');
    if (dateEl && metaData.ultima_actualizacion) {
      dateEl.textContent = metaData.ultima_actualizacion;
    }
  }

  /* --- Search --- */

  function initSearch() {
    var input = document.getElementById('search-input');
    var clearBtn = document.getElementById('search-clear');
    if (!input) return;
    var debounceTimer;

    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var value = input.value;
      if (clearBtn) clearBtn.classList.toggle('visible', value.length > 0);
      debounceTimer = setTimeout(function () { performSearch(value); }, 250);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        clearBtn.classList.remove('visible');
        renderAll(rutasData);
        input.focus();
      });
    }
  }

  function performSearch(query) {
    if (!query || query.trim().length === 0) {
      renderAll(rutasData);
      return;
    }
    var q = query.toLowerCase().trim();
    var filtered = [];

    rutasData.forEach(function (ruta) {
      var rutaMatch = ruta.nombre.toLowerCase().includes(q) ||
        (ruta.descripcion || '').toLowerCase().includes(q);

      var matchedRecursos = (ruta.recursos || []).filter(function (r) {
        return r.nombre.toLowerCase().includes(q) ||
          (r.descripcion || '').toLowerCase().includes(q) ||
          (r.nivel || '').toLowerCase().includes(q) ||
          (r.idioma || '').toLowerCase().includes(q) ||
          (r.tipo_acceso || '').toLowerCase().includes(q);
      });

      if (rutaMatch) {
        filtered.push(ruta);
      } else if (matchedRecursos.length > 0) {
        filtered.push(Object.assign({}, ruta, { recursos: matchedRecursos }));
      }
    });

    renderAll(filtered);
  }

  /* --- Intersection Observer (Active Nav) --- */

  function initObserver() {
    var navButtons = document.querySelectorAll('.nav-ruta-btn');
    if (!navButtons.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id.replace('ruta-', '');
          setActiveNav(id);
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    });

    document.querySelectorAll('.ruta-section').forEach(function (section) {
      observer.observe(section);
    });
  }

  function setActiveNav(id) {
    if (activeSection === id) return;
    activeSection = id;
    document.querySelectorAll('.nav-ruta-btn').forEach(function (btn) {
      var isActive = btn.dataset.target === id;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  /* --- JSON-LD Structured Data --- */

  function injectStructuredData() {
    // WebSite
    var webSite = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: metaData.titulo || 'Aprende por Rutas',
      description: metaData.descripcion || '',
      url: window.location.origin + window.location.pathname,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: window.location.origin + window.location.pathname + '?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    };

    var scriptWS = document.createElement('script');
    scriptWS.type = 'application/ld+json';
    scriptWS.textContent = JSON.stringify(webSite);
    document.head.appendChild(scriptWS);

    // ItemList
    var itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Rutas de Aprendizaje',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: rutasData.length,
      itemListElement: rutasData.map(function (ruta, i) {
        return {
          '@type': 'ListItem',
          position: i + 1,
          name: ruta.nombre,
          description: ruta.descripcion || '',
          url: window.location.origin + window.location.pathname + '#ruta-' + sanitizeId(ruta.id || ruta.nombre)
        };
      })
    };

    var scriptIL = document.createElement('script');
    scriptIL.type = 'application/ld+json';
    scriptIL.textContent = JSON.stringify(itemList);
    document.head.appendChild(scriptIL);
  }

  /* --- Init --- */

  async function init() {
    try {
      await loadData();
      buildNav();
      updateStats();
      renderAll(rutasData);
      updateFooter();
      initSearch();
      initObserver();
      injectStructuredData();
    } catch (err) {
      var container = document.getElementById('rutas-container');
      if (container) {
        container.textContent = '';
        var errDiv = el('div', { className: 'no-results' });
        errDiv.appendChild(el('div', { className: 'no-results-icon', textContent: '⚠️' }));
        errDiv.appendChild(el('p', { className: 'no-results-text', textContent: 'Error al cargar los datos' }));
        errDiv.appendChild(el('p', { className: 'no-results-sub', textContent: 'Revisa la consola para más información' }));
        container.appendChild(errDiv);
      }
      console.error('Aprende por Rutas:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
