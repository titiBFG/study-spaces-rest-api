/* ==========================================================================
   Study Spaces REST API — Reveal.js 6.0.2 Vanilla Deck Controller
   Zero external frameworks, zero CDN. Drives:
   - Reveal.js 1600x900 native navigation, hash routing, reduced motion
   - Global chrome: breadcrumb, slide counter, chapter progress bars, Index, FS
   - All interactive widgets across the 22 slides in clean Vanilla JS
   ========================================================================== */

(function () {
  "use strict";

  const CHAPTERS = {
    intro:        { id: "intro",        n: "00", title: "Intro & Propuesta",     color: "#9592f5", deep: "#4f46e5" },
    mvp:          { id: "mvp",          n: "01", title: "Requerimientos MVP",    color: "#ff8904", deep: "#ea580c" },
    architecture: { id: "architecture", n: "02", title: "Arquitectura & Stack",  color: "#7c3aed", deep: "#6d28d9" },
    domain:       { id: "domain",       n: "03", title: "Dominio & POO",         color: "#e12afb", deep: "#c026d3" },
    patterns:     { id: "patterns",     n: "04", title: "Patrones de Diseño",    color: "#2dd4bf", deep: "#0d9488" },
    api:          { id: "api",          n: "05", title: "Seguridad & API REST",  color: "#74d4ff", deep: "#0284c7" },
    quality:      { id: "quality",      n: "06", title: "Testing, CI/CD & Cloud",color: "#facc15", deep: "#ca8a04" },
    takeaways:    { id: "takeaways",    n: "07", title: "Demo, Roadmap & Cierre",color: "#fb7185", deep: "#e11d48" }
  };

  const PALETTE = ["#ff8904", "#e12afb", "#7c3aed", "#74d4ff", "#2dd4bf", "#facc15"];

  const ICONS = {
    book: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>`,
    coffee: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>`,
    monitor: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`,
    lamp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12v6"/><path d="M4.077 10.615A1 1 0 0 0 5 12h14a1 1 0 0 0 .923-1.385l-3.077-7.384A2 2 0 0 0 15 2H9a2 2 0 0 0-1.846 1.23Z"/><path d="M8 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z"/></svg>`,
    cpu: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>`,
    globe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
    shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
    layout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>`,
    search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>`,
    star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    heart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>`,
    heartFill: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>`,
    flag: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
    zap: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.914 4a1.5 1.5 0 0 0-2.474-1.561l-9 9A1.5 1.5 0 0 0 5.5 14h4.002a.5.5 0 0 1 .471.666L8.086 20a1.5 1.5 0 0 0 2.475 1.56l9-9A1.5 1.5 0 0 0 18.5 10h-3.997a.5.5 0 0 1-.472-.667z"/></svg>`,
    db: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>`,
    lock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    git: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>`,
    arrowUpRight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`
  };

  const SPACES = [
    { id: "biblio-unsam", name: "Biblioteca Central UNSAM", city: "San Martín", noise: "Bajo", wifi: true, outlets: true, rating: 4.9, reviews: 42, tint: "#9592f5", icon: "book" },
    { id: "cafe-campus", name: "Café del Campus", city: "San Martín", noise: "Medio", wifi: true, outlets: true, rating: 4.6, reviews: 28, tint: "#fdba74", icon: "coffee" },
    { id: "cowork-miguelete", name: "Cowork Miguelete Hub", city: "San Martín", noise: "Bajo", wifi: true, outlets: true, rating: 4.8, reviews: 35, tint: "#5eead4", icon: "monitor" },
    { id: "lectura-tornavias", name: "Sala Lectura Tornavías", city: "San Martín", noise: "Bajo", wifi: true, outlets: false, rating: 4.7, reviews: 19, tint: "#c4b5fd", icon: "lamp" },
    { id: "bistro-estacion", name: "Bistró La Estación", city: "San Martín", noise: "Alto", wifi: true, outlets: true, rating: 4.1, reviews: 15, tint: "#f9a8d4", icon: "coffee" },
    { id: "aula-it", name: "Laboratorio & Aula IT", city: "Campus Miguelete", noise: "Bajo", wifi: true, outlets: true, rating: 4.9, reviews: 51, tint: "#7dd3fc", icon: "cpu" },
    { id: "terraza-verde", name: "Terraza Verde UNSAM", city: "Campus Miguelete", noise: "Medio", wifi: true, outlets: false, rating: 4.4, reviews: 12, tint: "#86efac", icon: "globe" },
    { id: "estudio-belgrano", name: "Café Estudio Belgrano", city: "San Martín Centro", noise: "Medio", wifi: true, outlets: true, rating: 4.5, reviews: 23, tint: "#fde68a", icon: "coffee" },
    { id: "mediateca", name: "Mediateca Digital", city: "San Martín", noise: "Bajo", wifi: true, outlets: true, rating: 4.8, reviews: 31, tint: "#fca5a5", icon: "monitor" }
  ];

  const normalizeText = (value) =>
    String(value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ==================== REUSABLE SIMULATOR WIDGET (Slides 03 & 06) ==================== */
  function mountSpacesSimulator(host, options = {}) {
    if (!host) return null;
    const state = {
      query: "",
      noise: "Todos",
      wifiOnly: false,
      outletsOnly: false,
      status: options.initialStatus || "default",
      favs: new Set(["biblio-unsam", "cowork-miguelete"])
    };

    host.innerHTML = `
      <div class="sim-shell">
        <div class="sim-topbar">
          <span class="sim-brand">📖 StudySpaces<span style="color:#7c3aed;">.</span></span>
          <nav class="sim-nav" aria-label="Secciones simuladas">
            <span style="font-weight:600;color:var(--color-ink);">Espacios</span>
            <span>Favoritos</span>
            <span>Mis Listas</span>
            <span>Mis Reseñas</span>
          </nav>
          <span class="sim-fav-pill">
            <span style="color:#e11d48;display:inline-flex;">${ICONS.heartFill}</span>
            <span data-sim-fav-count>2 favs</span>
          </span>
        </div>
        <div class="sim-main">
          <aside class="sim-sidebar">
            <p class="sim-sidebar-title">Nivel de ruido</p>
            ${["Todos", "Bajo", "Medio", "Alto"].map((lvl) => `
              <button type="button" class="sim-filter-btn" data-sim-noise="${lvl}" aria-pressed="${lvl === "Todos"}">
                ${lvl === "Todos" ? "Todos los niveles" : "Ruido " + lvl}
              </button>
            `).join("")}
            <p class="sim-sidebar-title" style="margin-top:8px;">Comodidades</p>
            <button type="button" class="sim-filter-btn is-accent" data-sim-wifi aria-pressed="false">📶 Con WiFi</button>
            <button type="button" class="sim-filter-btn is-accent" data-sim-outlets aria-pressed="false">🔌 Con enchufes</button>
          </aside>
          <div class="sim-content">
            <div class="sim-search-wrap">
              ${ICONS.search}
              <input type="text" class="sim-search" data-sim-query placeholder="GET /spaces/?name=… (ej. UNSAM, café, cowork)" aria-label="Buscar espacios">
            </div>
            <div class="sim-meta">
              <span data-sim-count>9 espacios aprobados (is_approved=True)</span>
              <span class="mono" style="font-size:11px;">study-spaces-rest-api.onrender.com</span>
            </div>
            <div class="sim-grid" data-sim-grid></div>
          </div>
        </div>
      </div>
    `;

    const gridEl = host.querySelector("[data-sim-grid]");
    const countEl = host.querySelector("[data-sim-count]");
    const favCountEl = host.querySelector("[data-sim-fav-count]");
    const queryInput = host.querySelector("[data-sim-query]");
    const wifiBtn = host.querySelector("[data-sim-wifi]");
    const outletsBtn = host.querySelector("[data-sim-outlets]");
    const noiseBtns = Array.from(host.querySelectorAll("[data-sim-noise]"));

    function render() {
      favCountEl.textContent = `${state.favs.size} favs`;
      queryInput.disabled = state.status === "loading";

      const q = normalizeText(state.query.trim());
      const filtered = SPACES.filter((item) =>
        (state.noise === "Todos" || item.noise === state.noise) &&
        (!state.wifiOnly || item.wifi) &&
        (!state.outletsOnly || item.outlets) &&
        (!q || normalizeText(item.name).includes(q) || normalizeText(item.city).includes(q) || normalizeText(item.noise).includes(q))
      );

      const effectiveStatus = state.status === "default" && filtered.length === 0 ? "empty" : state.status;

      if (effectiveStatus === "loading") {
        countEl.innerHTML = `<span class="skel" style="display:inline-block;width:120px;height:12px;"></span>`;
        gridEl.innerHTML = Array.from({ length: 6 }, () => `
          <div class="space-card">
            <div class="skel" style="aspect-ratio:4/2.8;border-radius:10px;"></div>
            <div class="skel" style="height:12px;width:72%;margin-top:10px;"></div>
            <div class="skel" style="height:10px;width:40%;margin-top:6px;"></div>
          </div>
        `).join("");
        return;
      }

      if (effectiveStatus === "error") {
        countEl.textContent = "—";
        gridEl.innerHTML = `
          <div class="sim-empty-box">
            <div style="max-width:280px;">
              <p style="font-size:15.5px;font-weight:600;color:#e11d48;">No se pudo conectar con FastAPI</p>
              <p style="margin-top:6px !important;font-size:12.5px;color:rgba(11,11,18,0.55);">Verificá que el backend esté activo en /health.</p>
              <button type="button" class="btn btn-ghost" data-sim-reset style="margin-top:12px;height:34px;font-size:12px;">Reintentar GET /spaces/</button>
            </div>
          </div>
        `;
        return;
      }

      if (effectiveStatus === "empty") {
        countEl.textContent = "0 espacios encontrados";
        gridEl.innerHTML = `
          <div class="sim-empty-box">
            <div style="max-width:280px;">
              <p style="font-size:15.5px;font-weight:600;color:#6d28d9;">Sin espacios para esos filtros</p>
              <p style="margin-top:6px !important;font-size:12.5px;color:rgba(11,11,18,0.55);">Probá limpiar la búsqueda o cambiar el nivel de ruido.</p>
              <button type="button" class="btn btn-ghost" data-sim-reset style="margin-top:12px;height:34px;font-size:12px;">Limpiar filtros</button>
            </div>
          </div>
        `;
        return;
      }

      countEl.textContent = `${filtered.length} espacios aprobados (is_approved=True)`;
      gridEl.innerHTML = filtered.map((item) => {
        const isFav = state.favs.has(item.id);
        return `
          <article class="space-card">
            <div class="space-thumb" style="--tint:${item.tint};">
              <span style="color:rgba(11,11,18,0.7);">${ICONS[item.icon] || ICONS.book}</span>
              <span class="space-noise-badge">Ruido ${item.noise}</span>
              <div class="space-tags">
                ${item.wifi ? `<span class="space-tag">📶 WiFi</span>` : ""}
                ${item.outlets ? `<span class="space-tag">🔌 220V</span>` : ""}
              </div>
            </div>
            <div class="space-footer">
              <div style="min-width:0;">
                <p class="space-name">${escapeHtml(item.name)}</p>
                <p class="space-city">📍 ${escapeHtml(item.city)} (${item.reviews} reseñas)</p>
              </div>
              <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <span style="font-size:12px;font-weight:600;color:#ca8a04;">★ ${item.rating.toFixed(1)}</span>
                <button type="button" class="space-fav-btn ${isFav ? "is-fav" : ""}" data-sim-fav="${item.id}" aria-label="Alternar favorito">
                  ${isFav ? ICONS.heartFill : ICONS.heart}
                </button>
              </div>
            </div>
          </article>
        `;
      }).join("");
    }

    queryInput.addEventListener("input", (e) => {
      state.query = e.target.value;
      render();
    });

    noiseBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.noise = btn.dataset.simNoise;
        noiseBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        render();
      });
    });

    wifiBtn.addEventListener("click", () => {
      state.wifiOnly = !state.wifiOnly;
      wifiBtn.setAttribute("aria-pressed", String(state.wifiOnly));
      render();
    });

    outletsBtn.addEventListener("click", () => {
      state.outletsOnly = !state.outletsOnly;
      outletsBtn.setAttribute("aria-pressed", String(state.outletsOnly));
      render();
    });

    gridEl.addEventListener("click", (e) => {
      const favBtn = e.target.closest("[data-sim-fav]");
      if (favBtn) {
        const id = favBtn.dataset.simFav;
        if (state.favs.has(id)) state.favs.delete(id);
        else state.favs.add(id);
        render();
        return;
      }
      if (e.target.closest("[data-sim-reset]")) {
        state.query = "";
        state.noise = "Todos";
        state.wifiOnly = false;
        state.outletsOnly = false;
        state.status = "default";
        queryInput.value = "";
        wifiBtn.setAttribute("aria-pressed", "false");
        outletsBtn.setAttribute("aria-pressed", "false");
        noiseBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.simNoise === "Todos")));
        render();
      }
    });

    render();
    return {
      setStatus(nextStatus) {
        state.status = nextStatus;
        render();
      }
    };
  }

  /* ==================== SLIDE WIDGET INITIALIZERS ==================== */
  function initAgendaFan(goToChapter) {
    const host = document.getElementById("agenda-fan");
    if (!host) return;
    const items = [
      { id: "mvp", title: "MVP RQ1–RQ6", text: "Problema, 3 roles y los 6 requerimientos." },
      { id: "architecture", title: "Arquitectura", text: "Stack, 4 capas y ciclo de una request." },
      { id: "domain", title: "Dominio & POO", text: "Single-Table Inheritance y polimorfismo." },
      { id: "patterns", title: "Patrones", text: "Repository, Template Method, Observer y Factory." },
      { id: "api", title: "JWT & API REST", text: "Seguridad Bcrypt/JWT y los 7 routers." },
      { id: "quality", title: "QA & Cloud", text: "163 tests Pytest, Docker, CI/CD y Render." },
      { id: "takeaways", title: "Demo & Cierre", text: "Demo Live en iframe, conclusiones y cierre." }
    ];
    const center = (items.length - 1) / 2;
    host.innerHTML = items.map((item, idx) => {
      const ch = CHAPTERS[item.id];
      const dist = Math.abs(idx - center);
      const isCenter = dist < 1;
      const delay = isCenter ? `${250 + (idx > center ? 100 : 0)}ms` : `${750 + (dist - 1) * 110}ms`;
      const padStyle = idx < center ? "padding-right:38px;" : idx > center + 0.5 ? "padding-left:38px;" : "";
      return `
        <li class="fan-card" data-role="${isCenter ? "rise" : "spread"}" style="--turn:${(idx - center) * 7.6}deg;--z:${Math.round(10 - dist)};--delay:${delay};">
          <button type="button" class="card fan-face" data-jump-chapter="${item.id}" style="${padStyle}">
            <span class="wash" style="--c:${ch.color};--wash-h:58%"></span>
            <span class="num-badge">${ch.n}</span>
            <span style="margin-top:12px;display:block;font-size:21px;line-height:1.08;font-weight:600;letter-spacing:-0.03em;">
              ${item.title}<span style="margin-left:0.15em;color:${ch.deep};">.</span>
            </span>
            <span style="margin-top:8px;display:block;font-size:13.5px;line-height:1.45;color:rgba(11,11,18,0.62);">${item.text}</span>
          </button>
        </li>
      `;
    }).join("");

    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-jump-chapter]");
      if (btn) goToChapter(btn.dataset.jumpChapter);
    });
  }

  function initRolesWidget() {
    const roles = {
      student: {
        title: "StudentUser",
        badge: "Rol Estudiante",
        color: "#7c3aed",
        actions: [
          "Buscar y filtrar espacios aprobados (WiFi, enchufes, ruido)",
          "Publicar reseñas (1–5 ★ + hasta 5 fotos) y votar utilidad",
          "Crear listas personalizadas (/lists) y guardar favoritos (/favorites)",
          "Emitir reportes polimórficos ante contenido inapropiado"
        ]
      },
      business: {
        title: "BusinessUser",
        badge: "Rol Negocio",
        color: "#ea580c",
        actions: [
          "Registrar cuenta comercial (/users/register/business)",
          "Dar de alta y editar sus propios espacios de estudio (/spaces)",
          "Consultar estado de aprobación en /spaces/mine",
          "Publicar novedades y anuncios con fotos en sus espacios (/posts)"
        ]
      },
      admin: {
        title: "AdminUser",
        badge: "Rol Administrador",
        color: "#0d9488",
        actions: [
          "Inicialización automática en arranque (crear_admin.py --auto)",
          "Revisar espacios pendientes (/spaces/pending) y aprobarlos",
          "Listar y filtrar reportes por tipo y estado (/reports)",
          "Ejecutar resolve() (oculta reseña/post o bloquea usuario) o dismiss()"
        ]
      }
    };

    const widget = document.getElementById("roles-widget");
    if (!widget) return;
    const tabs = Array.from(widget.querySelectorAll("[data-role-tab]"));
    const wash = document.getElementById("roles-wash");
    const title = document.getElementById("roles-title");
    const badge = document.getElementById("roles-badge");
    const list = document.getElementById("roles-list");

    function renderRole(key) {
      const curr = roles[key];
      wash.style.setProperty("--c", curr.color);
      title.textContent = curr.title;
      badge.textContent = curr.badge;
      badge.style.color = curr.color;
      list.innerHTML = curr.actions.map((act) => `
        <li style="display:flex;align-items:flex-start;gap:12px;border-radius:12px;background:rgba(255,255,255,0.88);padding:11px 16px;font-size:14.5px;font-weight:500;color:rgba(11,11,18,0.82);">
          <span style="color:${curr.color};font-weight:700;">✓</span>
          <span>${act}</span>
        </li>
      `).join("");
      tabs.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.roleTab === key)));
    }

    tabs.forEach((btn) => btn.addEventListener("click", () => renderRole(btn.dataset.roleTab)));
    renderRole("student");
  }

  function initMvpGrid() {
    const host = document.getElementById("mvp-req-grid");
    if (!host) return;
    const reqs = [
      { code: "RQ1", title: "Usuarios, Roles y JWT", icon: "shield", lines: ["Registro diferenciado Estudiante / Negocio y hashing con Bcrypt.", "Tokens Bearer JWT (HS256) y RBAC polimórfico por subclase."], endpoint: "POST /users/login · GET /users/me" },
      { code: "RQ2", title: "Gestión de Espacios", icon: "layout", lines: ["Alta y edición de espacios por dueños de negocios.", "Flujo de moderación: quedan pendientes hasta aprobación admin."], endpoint: "POST /spaces/ · PATCH /spaces/{id}/approve" },
      { code: "RQ3", title: "Búsqueda y Filtros", icon: "search", lines: ["Filtrado dinámico combinable por nombre, WiFi, enchufes y ruido.", "Solo expone al público espacios con is_approved = True."], endpoint: "GET /spaces/?has_wifi=true&noise_level=low" },
      { code: "RQ4", title: "Reseñas, Fotos y Votos", icon: "star", lines: ["Calificación 1 a 5, comentario y hasta 5 imágenes por reseña.", "Cálculo dinámico de average_rating y votos de utilidad."], endpoint: "POST /reviews/space/{id} · PUT /reviews/{id}/vote" },
      { code: "RQ5", title: "Listas y Favoritos", icon: "heart", lines: ["Herencia StudySpacesList / FavoritesList en una misma tabla.", "Múltiples listas temáticas + acceso directo a favoritos."], endpoint: "GET/POST /lists · GET/POST/DELETE /favorites" },
      { code: "RQ6+", title: "Moderación & Posts", icon: "flag", lines: ["Reportes polimórficos (Review, Post, Space, User) con Template Method.", "Módulo extra /posts para novedades de negocios en sus espacios."], endpoint: "POST /reports/* · PUT /reports/{id}/resolve" }
    ];
    host.innerHTML = reqs.map((r, idx) => {
      const c = PALETTE[idx];
      const icColor = c === "#facc15" ? "#ca8a04" : c;
      return `
        <div class="card lift flex-col rv" style="--i:${idx + 2};padding:24px;">
          <span class="wash" style="--c:${c};--wash-h:52%"></span>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;">
            <div>
              <span class="num-badge">${r.code}</span>
              <h3 style="margin-top:6px !important;font-size:22px;font-weight:600;letter-spacing:-0.03em;">
                ${r.title}<span style="margin-left:0.15em;color:${icColor};">.</span>
              </h3>
            </div>
            <span class="icon-box" style="--ic:${icColor};">${ICONS[r.icon]}</span>
          </div>
          <ul style="margin-top:12px;display:flex;flex-direction:column;gap:6px;font-size:14px;line-height:1.45;color:rgba(11,11,18,0.66);">
            ${r.lines.map((l) => `<li>${l}</li>`).join("")}
          </ul>
          <div class="mt-auto" style="padding-top:12px;">
            <span class="mono" style="display:inline-block;border-radius:8px;border:1px solid #fff;background:rgba(255,255,255,0.88);padding:4px 10px;font-size:11px;color:rgba(11,11,18,0.78);">${r.endpoint}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  function initMvpStates(statesSim) {
    const host = document.getElementById("mvp-state-buttons");
    const caption = document.getElementById("mvp-state-caption");
    if (!host || !statesSim) return;
    const states = [
      { id: "default", title: "Aprobados", text: "GET /spaces/ devuelve espacios con is_approved=True.", color: "#2dd4bf" },
      { id: "loading", title: "Cargando", text: "Cliente web esperando respuesta JSON de FastAPI.", color: "#74d4ff" },
      { id: "empty", title: "Sin coincidencias", text: "Filtro válido sin espacios que cumplan la condición.", color: "#9592f5" },
      { id: "error", title: "Error de Red", text: "Fallback controlado cuando la API no está disponible.", color: "#fb7185" }
    ];

    let active = "default";
    function renderBtns() {
      host.innerHTML = states.map((s) => {
        const isActive = s.id === active;
        return `
          <button type="button" class="card card-sm" data-ui-state="${s.id}" aria-pressed="${isActive}"
            style="display:flex;align-items:center;gap:14px;padding:15px 16px;text-align:left;transition:transform 380ms var(--ease-out-expo),border-color 300ms;${isActive ? "transform:translateX(8px);border-color:rgba(11,11,18,0.22);" : "box-shadow:none;"}">
            <span class="wash" style="--c:${s.color};--wash-h:${isActive ? "100%" : "0%"}"></span>
            <span class="mono" style="font-size:11px;color:rgba(11,11,18,0.45);">UI=</span>
            <span style="width:118px;font-size:15.5px;font-weight:600;letter-spacing:-0.02em;">${s.title}</span>
            <span style="flex:1;font-size:13px;line-height:1.35;color:rgba(11,11,18,0.58);">${s.text}</span>
          </button>
        `;
      }).join("");
      const curr = states.find((s) => s.id === active);
      if (caption && curr) caption.textContent = `frontend/index.html · Estado = ${curr.title}`;
    }

    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-ui-state]");
      if (!btn) return;
      active = btn.dataset.uiState;
      statesSim.setStatus(active);
      renderBtns();
    });
    renderBtns();
  }

  function initArchLayers() {
    const isoHost = document.getElementById("arch-iso-host");
    if (!isoHost) return;
    const layers = [
      { name: "1. Routers (Controladores)", color: "#ff8904", lines: ["Definen los endpoints HTTP en app/routers/.", "Validan entrada/salida con schemas Pydantic v2.", "Inyectan sesión DB y dependencias de rol (require_student, require_business, require_admin)."], example: ["users.py", "study_spaces.py", "reviews.py", "study_spaces_lists.py", "posts.py", "reports.py"] },
      { name: "2. Services (Lógica de Negocio)", color: "#e12afb", lines: ["Concentran las reglas de negocio en app/services/.", "Verifican propiedad de recursos, unicidad y reglas cruzadas.", "Orquestan llamadas a repositorios y métodos del modelo."], example: ["auth_service.py", "user_service.py", "study_space_service.py", "review_service.py", "report_service.py"] },
      { name: "3. Repositories (Acceso a Datos)", color: "#7c3aed", lines: ["Encapsulan consultas SQLAlchemy 2.0 en app/repositories/.", "Desacoplan la lógica de negocio del motor de persistencia.", "Facilitan el testing unitario y de integración."], example: ["user_repository.py", "study_space_repository.py", "review_repository.py", "post_repository.py", "report_repository.py"] },
      { name: "4. Models & Database (ORM)", color: "#2dd4bf", lines: ["Entidades de dominio con herencia polimórfica en app/models/.", "6 migraciones versionadas con Alembic.", "Soporte transparente PostgreSQL (Render) y SQLite (dev/tests)."], example: ["User", "StudySpace", "Review", "ReviewVote", "StudySpacesList", "Post", "Report"] }
    ];

    let active = 0;
    const wash = document.getElementById("arch-layer-wash");
    const num = document.getElementById("arch-layer-num");
    const title = document.getElementById("arch-layer-title");
    const linesEl = document.getElementById("arch-layer-lines");
    const modsEl = document.getElementById("arch-layer-modules");

    function render() {
      isoHost.innerHTML = layers.map((l, idx) => {
        const isActive = idx === active;
        const bg = isActive
          ? `linear-gradient(135deg, color-mix(in srgb, ${l.color} 30%, white), ${l.color})`
          : `linear-gradient(135deg, #ffffff 30%, color-mix(in srgb, ${l.color} 22%, white))`;
        const shadow = isActive
          ? `0 40px 60px -20px color-mix(in srgb, ${l.color} 60%, transparent)`
          : `0 20px 40px -24px rgba(11,11,18,0.28)`;
        return `
          <button type="button" class="iso-plate" data-layer-idx="${idx}" aria-pressed="${isActive}" aria-label="${l.name}"
            style="top:${idx * 95 + 32}px;z-index:${20 - idx};--lift:${isActive ? "48px" : "0px"};border-color:${isActive ? "#fff" : `color-mix(in srgb, ${l.color} 30%, white)`};background:${bg};box-shadow:${shadow};"></button>
          <button type="button" class="iso-label-btn" data-layer-idx="${idx}" aria-pressed="${isActive}" style="top:${idx * 95 + 172}px;">
            <span class="mono" style="font-size:11px;color:rgba(11,11,18,0.45);">CAPA 0${idx + 1}</span>
            <span style="font-size:18px;font-weight:600;letter-spacing:-0.02em;">${l.name.split(" (")[0]}</span>
            <span style="width:52px;height:1px;background:rgba(11,11,18,0.2);"></span>
          </button>
        `;
      }).join("");

      const curr = layers[active];
      wash.style.setProperty("--c", curr.color);
      num.textContent = `CAPA 0${active + 1}`;
      title.innerHTML = `${curr.name}<span style="color:${curr.color};">.</span>`;
      linesEl.innerHTML = curr.lines.map((ln) => `<li>✓ ${ln}</li>`).join("");
      modsEl.innerHTML = curr.example.map((ex) => `
        <span class="mono" style="border-radius:999px;background:rgba(255,255,255,0.88);padding:6px 14px;font-size:12.5px;">${ex}</span>
      `).join("");
    }

    isoHost.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-layer-idx]");
      if (!btn) return;
      active = Number(btn.dataset.layerIdx);
      render();
    });
    isoHost.addEventListener("mouseover", (e) => {
      const btn = e.target.closest("[data-layer-idx]");
      if (!btn) return;
      const idx = Number(btn.dataset.layerIdx);
      if (idx !== active) {
        active = idx;
        render();
      }
    });
    render();
  }

  function initStackGrid() {
    const host = document.getElementById("arch-stack-grid");
    if (!host) return;
    const stack = [
      { title: "FastAPI + Python 3.12+", tag: "Backend HTTP & OpenAPI", color: "#ff8904", icon: "zap", lines: ["API RESTful modular con tipado estricto y Swagger automático en /docs.", "CORS configurado y endpoint /health de monitoreo."] },
      { title: "Pydantic v2", tag: "Schemas & Settings", color: "#e12afb", icon: "shield", lines: ["Validación declarativa de payloads (ReviewCreate, StudySpaceCreate, etc.).", "Configuración centralizada con pydantic-settings (.env)."] },
      { title: "SQLAlchemy 2.0 + Alembic", tag: "ORM Polimórfico & Migraciones", color: "#7c3aed", icon: "db", lines: ["Mapeo declarativo Mapped[] con Single-Table Inheritance.", "6 migraciones Alembic compatibles con PostgreSQL y SQLite."] },
      { title: "PyJWT + Bcrypt + Pytest", tag: "Seguridad & 163 Tests", color: "#2dd4bf", icon: "lock", lines: ["Tokens Bearer JWT firmados (HS256, 8h) y hashes Bcrypt.", "163 tests automatizados con TestClient y SQLite aislado."] }
    ];
    host.innerHTML = stack.map((item, idx) => `
      <div class="card lift flex-col rv" style="--i:${idx + 2};padding:28px;">
        <span class="wash" style="--c:${item.color};--wash-h:55%"></span>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span class="num-badge">0${idx + 1}</span>
          <span class="icon-box" style="--ic:${item.color};">${ICONS[item.icon]}</span>
        </div>
        <p class="mono" style="margin-top:16px !important;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:rgba(11,11,18,0.48);">${item.tag}</p>
        <h3 style="margin-top:6px !important;font-size:25px;line-height:1.1;font-weight:600;letter-spacing:-0.035em;">
          ${item.title}<span style="color:${item.color};">.</span>
        </h3>
        <ul style="margin-top:16px;display:flex;flex-direction:column;gap:8px;font-size:14.5px;line-height:1.5;color:rgba(11,11,18,0.66);">
          ${item.lines.map((l) => `<li>${l}</li>`).join("")}
        </ul>
      </div>
    `).join("");
  }

  function initRequestLifecycle() {
    const stepsRow = document.getElementById("req-steps-row");
    if (!stepsRow) return;
    const colors = ["#ff8904", "#e12afb", "#7c3aed", "#38bdf8", "#2dd4bf"];
    const steps = [
      { name: "1. HTTP Request", text: "El cliente envía POST /reviews/space/1 con Bearer token y JSON.", detail: 'Payload: {"rating": 5, "comment": "Excelente WiFi y silencio", "images": []}' },
      { name: "2. Auth & Pydantic", text: "require_student valida el JWT y verifica isinstance(user, StudentUser).", detail: "Pydantic valida rating (1..5), longitud de comentario y máximo 5 imágenes." },
      { name: "3. Service Layer", text: "review_service verifica que el espacio exista y no haya reseña previa.", detail: "Regla de negocio: un estudiante puede publicar una única reseña por espacio." },
      { name: "4. Repository & ORM", text: "review_repository persiste la entidad Review en SQLAlchemy y hace commit.", detail: "INSERT INTO reviews (space_id, author_id, rating, comment, is_visible) ..." },
      { name: "5. Response 201", text: "StudySpace recalcula dinámicamente average_rating y devuelve ReviewResponse.", detail: "HTTP 201 Created · average_rating actualizado automáticamente en el espacio." }
    ];

    let step = 0;
    const prevBtn = document.getElementById("req-prev-btn");
    const nextBtn = document.getElementById("req-next-btn");
    const wash = document.getElementById("req-detail-wash");
    const kicker = document.getElementById("req-detail-kicker");
    const textEl = document.getElementById("req-detail-text");
    const codeEl = document.getElementById("req-detail-code");

    function render() {
      stepsRow.innerHTML = steps.map((s, idx) => {
        const active = idx === step;
        const done = idx < step;
        const c = colors[idx];
        return `
          <button type="button" class="card card-sm" data-req-step="${idx}"
            style="height:184px;padding:20px;text-align:left;display:flex;flex-direction:column;transition:transform 400ms var(--ease-out-expo),border-color 300ms;${active ? `transform:translateY(-8px);border-color:${c};` : ""}">
            <span class="wash" style="--c:${c};--wash-h:${active ? "100%" : done ? "35%" : "0%"}"></span>
            <span class="num-badge">0${idx + 1}</span>
            <p style="margin-top:12px !important;font-size:19px;font-weight:600;letter-spacing:-0.03em;">${s.name}</p>
            <p style="margin-top:6px !important;font-size:12.5px;line-height:1.45;color:rgba(11,11,18,0.66);">${s.text}</p>
          </button>
        `;
      }).join("");

      const curr = steps[step];
      wash.style.setProperty("--c", colors[step]);
      kicker.textContent = `Paso activo 0${step + 1} · ${curr.name}`;
      textEl.textContent = curr.text;
      codeEl.textContent = curr.detail;
      prevBtn.disabled = step === 0;
    }

    stepsRow.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-req-step]");
      if (!btn) return;
      step = Number(btn.dataset.reqStep);
      render();
    });
    prevBtn.addEventListener("click", () => { step = Math.max(0, step - 1); render(); });
    nextBtn.addEventListener("click", () => { step = (step + 1) % steps.length; render(); });
    render();
  }

  function initDomainInheritance() {
    const tabs = Array.from(document.querySelectorAll("[data-hier-tab]"));
    if (!tabs.length) return;
    const data = {
      user: {
        base: "User (tabla: users)",
        disc: 'polymorphic_on: "role" (UserRole)',
        color: "#e12afb",
        desc: "Al consultar session.get(User, user_id), SQLAlchemy devuelve automáticamente una instancia de StudentUser, BusinessUser o AdminUser.",
        subs: [
          { name: "StudentUser", id: "UserRole.STUDENT", rel: "reviews, lists, votes", behavior: "Publica reseñas, vota utilidad, crea listas y favoritos." },
          { name: "BusinessUser", id: "UserRole.BUSINESS", rel: "owned_spaces, posts", behavior: "Crea y edita sus espacios de estudio y publica novedades (/posts)." },
          { name: "AdminUser", id: "UserRole.ADMIN", rel: "managed_reports", behavior: "Aprueba espacios pendientes y resuelve o descarta reportes." }
        ]
      },
      report: {
        base: "Report (tabla: reports)",
        disc: 'polymorphic_on: "type" (ReportType)',
        color: "#ff8904",
        desc: "Una única tabla con UniqueConstraints por (reporter_id, target_id). Cada subclase redefine _apply_resolution() para actuar sobre su objetivo.",
        subs: [
          { name: "ReviewReport", id: "ReportType.REVIEW", rel: "review (Review)", behavior: "_apply_resolution() → self.review.hide() (oculta la reseña)." },
          { name: "PostReport", id: "ReportType.POST", rel: "post (Post)", behavior: "_apply_resolution() → self.post.hide() (oculta la publicación)." },
          { name: "StudySpaceReport", id: "ReportType.STUDY_SPACE", rel: "space (StudySpace)", behavior: "Reporte de datos falsos; el administrador audita o edita el espacio." },
          { name: "UserReport", id: "ReportType.USER", rel: "reported_user (User)", behavior: "_apply_resolution() → self.reported_user.is_active = False." }
        ]
      },
      list: {
        base: "StudySpacesList (study_spaces_lists)",
        disc: 'polymorphic_on: "list_type"',
        color: "#7c3aed",
        desc: "Permite que las listas personalizadas del estudiante y su lista única de favoritos compartan estructura y tabla de ítems (ListItem).",
        subs: [
          { name: "StudySpacesList", id: '"custom"', rel: "items (list[ListItem])", behavior: "Listas temáticas creadas, renombradas o eliminadas en /lists." },
          { name: "FavoritesList", id: '"favorites"', rel: "items (list[ListItem])", behavior: "Lista especial autogestionada por estudiante con acceso directo en /favorites." }
        ]
      }
    };

    const wash = document.getElementById("hier-base-wash");
    const baseName = document.getElementById("hier-base-name");
    const baseDisc = document.getElementById("hier-base-disc");
    const baseDesc = document.getElementById("hier-base-desc");
    const subsGrid = document.getElementById("hier-subs-grid");

    function render(key) {
      const curr = data[key];
      wash.style.setProperty("--c", curr.color);
      baseName.textContent = curr.base;
      baseDisc.textContent = curr.disc;
      baseDesc.textContent = curr.desc;
      subsGrid.style.gridTemplateColumns = `repeat(${curr.subs.length > 3 ? 2 : curr.subs.length}, minmax(0, 1fr))`;
      subsGrid.innerHTML = curr.subs.map((s, idx) => `
        <div class="card flex-col" style="justify-content:space-between;padding:24px;">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span class="num-badge">0${idx + 1}</span>
              <span class="mono" style="border-radius:999px;background:rgba(11,11,18,0.05);padding:3px 10px;font-size:11px;color:rgba(11,11,18,0.72);">${s.id}</span>
            </div>
            <h4 class="mono" style="margin-top:12px !important;font-size:21px;font-weight:600;letter-spacing:-0.03em;">${s.name}</h4>
            <p style="margin-top:10px !important;font-size:14.5px;line-height:1.5;color:rgba(11,11,18,0.66);">${s.behavior}</p>
          </div>
          <div class="mono" style="margin-top:16px;border-top:1px solid rgba(11,11,18,0.08);padding-top:12px;font-size:11.5px;color:rgba(11,11,18,0.56);">
            Relaciones: <strong style="color:rgba(11,11,18,0.85);">${s.rel}</strong>
          </div>
        </div>
      `).join("");
      tabs.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.hierTab === key)));
    }

    tabs.forEach((b) => b.addEventListener("click", () => render(b.dataset.hierTab)));
    render("user");
  }

  function initRatingCalc() {
    const listEl = document.getElementById("rating-reviews-list");
    const avgEl = document.getElementById("rating-avg-val");
    const countEl = document.getElementById("rating-count-val");
    const addBtn = document.getElementById("rating-add-btn");
    if (!listEl) return;

    const reviews = [
      { id: 1, author: "Julieta", rating: 5, comment: "WiFi rapidísimo y enchufes en todas las mesas.", visible: true },
      { id: 2, author: "Aldana", rating: 4, comment: "Muy buen ambiente para preparar parciales.", visible: true },
      { id: 3, author: "SpamBot", rating: 1, comment: "Spam reportado por la comunidad.", visible: true }
    ];

    function render() {
      const vis = reviews.filter((r) => r.visible);
      const avg = vis.length === 0 ? "0.00" : (vis.reduce((a, b) => a + b.rating, 0) / vis.length).toFixed(2);
      avgEl.textContent = avg;
      countEl.textContent = `reviews_count = ${vis.length} visibles (de ${reviews.length} totales)`;
      addBtn.disabled = reviews.length >= 5;

      listEl.innerHTML = reviews.map((r) => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;border-radius:16px;padding:16px;border:1px ${r.visible ? "solid rgba(11,11,18,0.08)" : "dashed rgba(251,113,133,0.65)"};background:${r.visible ? "#fff" : "rgba(255,241,242,0.75)"};opacity:${r.visible ? 1 : 0.72};">
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-weight:600;font-size:15px;">${escapeHtml(r.author)}</span>
              <span class="mono" style="border-radius:999px;background:#fefce8;padding:2px 10px;font-size:12px;font-weight:600;color:#ca8a04;">${r.rating} ★</span>
              ${!r.visible ? `<span class="mono" style="border-radius:999px;background:rgba(251,113,133,0.2);padding:2px 10px;font-size:11px;font-weight:600;color:#e11d48;">is_visible = False (Oculta)</span>` : ""}
            </div>
            <p style="margin-top:4px !important;font-size:13.5px;color:rgba(11,11,18,0.65);">${escapeHtml(r.comment)}</p>
          </div>
          <button type="button" class="btn ${r.visible ? "btn-ghost" : ""}" data-toggle-rev="${r.id}" style="height:36px;font-size:12.5px;flex-shrink:0;">
            ${r.visible ? "Ocultar (resolve report)" : "Restaurar"}
          </button>
        </div>
      `).join("");
    }

    listEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-toggle-rev]");
      if (!btn) return;
      const id = Number(btn.dataset.toggleRev);
      const item = reviews.find((r) => r.id === id);
      if (item) {
        item.visible = !item.visible;
        render();
      }
    });

    addBtn.addEventListener("click", () => {
      if (reviews.length >= 5) return;
      const names = ["Valentina", "Santino"];
      reviews.push({
        id: Date.now(),
        author: names[reviews.length - 3] || "Estudiante",
        rating: 5,
        comment: "Excelente iluminación y silencio para estudiar.",
        visible: true
      });
      render();
    });

    render();
  }

  function initTemplateMethod() {
    const tabs = Array.from(document.querySelectorAll("[data-rep-type]"));
    if (!tabs.length) return;
    const effects = {
      ReviewReport: { target: "Review #14", effect: "self.review.hide() → review.is_visible = False", file: "app/models/report.py:141" },
      PostReport: { target: "Post #8", effect: "self.post.hide() → post.is_active = False", file: "app/models/report.py:157" },
      UserReport: { target: "User #23", effect: "self.reported_user.is_active = False (bloquea login/token)", file: "app/models/report.py:189" },
      StudySpaceReport: { target: "StudySpace #3", effect: "Hook base vacío: el admin corrige datos editando el espacio", file: "app/models/report.py:162" }
    };

    let repType = "ReviewReport";
    let status = "pending";

    const fileBadge = document.getElementById("tpl-file-badge");
    const wash = document.getElementById("tpl-sim-wash");
    const kicker = document.getElementById("tpl-sim-kicker");
    const statusBadge = document.getElementById("tpl-sim-status");
    const targetEl = document.getElementById("tpl-sim-target");
    const step1 = document.getElementById("tpl-sim-step1");
    const step2 = document.getElementById("tpl-sim-step2");
    const resolveBtn = document.getElementById("tpl-resolve-btn");
    const dismissBtn = document.getElementById("tpl-dismiss-btn");
    const resetBtn = document.getElementById("tpl-reset-btn");

    function render() {
      const curr = effects[repType];
      fileBadge.textContent = curr.file;
      kicker.textContent = `Simulador interactivo · ${repType}`;
      statusBadge.textContent = `status: ${status}`;
      targetEl.textContent = `Objetivo: ${curr.target}`;
      wash.style.setProperty("--c", status === "resolved" ? "#2dd4bf" : status === "dismissed" ? "#9592f5" : "#ff8904");
      step1.textContent = status === "resolved" ? curr.effect : status === "dismissed" ? "(Omitido en dismiss)" : "Pendiente de ejecución";
      step2.textContent = status === "pending" ? "resolved_at = None" : `status = ${status.toUpperCase()} · resolved_at = datetime.now(UTC)`;
      resolveBtn.disabled = status !== "pending";
      dismissBtn.disabled = status !== "pending";
      resetBtn.hidden = status === "pending";
      tabs.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.repType === repType)));
    }

    tabs.forEach((b) => b.addEventListener("click", () => { repType = b.dataset.repType; status = "pending"; render(); }));
    resolveBtn.addEventListener("click", () => { status = "resolved"; render(); });
    dismissBtn.addEventListener("click", () => { status = "dismissed"; render(); });
    resetBtn.addEventListener("click", () => { status = "pending"; render(); });
    render();
  }

  function initPatternsOverview() {
    const host = document.getElementById("patterns-cards-grid");
    const flipAllBtn = document.getElementById("patterns-flip-all");
    if (!host) return;
    const cards = [
      { title: "Repository Pattern", badge: "Implementado en app/repositories/", color: "#2dd4bf", front: "Encapsula todas las consultas SQLAlchemy (User, StudySpace, Review, StudySpacesList, Post, Report).", back: "Beneficio: los servicios no escriben queries SQL directas y pueden testearse o evolucionar sin acoplarse al motor de base de datos." },
      { title: "Service Layer", badge: "Implementado en app/services/", color: "#7c3aed", front: "Separa las reglas de negocio y permisos de la capa HTTP (FastAPI routers).", back: 'Beneficio: validaciones como "un estudiante no puede votar su propia reseña" o "máximo 5 fotos" viven en un único lugar reutilizable.' },
      { title: "Observer Pattern", badge: "Modelado en UML + Hook en Report", color: "#ff8904", front: "Suscripción de StudentUser a novedades de StudySpace y cambios de estado en Report (_notify_observers).", back: "Extensión Post-MVP: desacopla la entidad que emite el evento (StudySpace / Report) de los múltiples destinatarios que reciben la alerta." },
      { title: "Factory Method", badge: "Modelado en UML (NotificationService)", color: "#e12afb", front: "Subclases ModerationNotificationService y PromotionNotificationService deciden qué canal instanciar.", back: "Extensión Post-MVP: instancia EmailNotification o InAppNotification dinámicamente según las preferencias (NotificationPreference) del usuario." }
    ];
    const flipped = [false, false, false, false];

    function render() {
      const allFlipped = flipped.every(Boolean);
      flipAllBtn.textContent = allFlipped ? "Ver resumen" : "Dar vuelta todas";
      host.innerHTML = cards.map((c, idx) => `
        <button type="button" class="card lift flex-col" data-flip-idx="${idx}" aria-pressed="${flipped[idx]}" style="justify-content:space-between;padding:28px;text-align:left;">
          <span class="wash" style="--c:${flipped[idx] ? "#0d9488" : c.color};--wash-h:48%"></span>
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
            <span class="num-badge">PATRÓN 0${idx + 1}</span>
            <span class="mono" style="border-radius:999px;background:rgba(255,255,255,0.9);padding:4px 12px;font-size:11.5px;font-weight:500;">${c.badge}</span>
          </div>
          <div>
            <h3 style="font-size:30px;font-weight:600;letter-spacing:-0.035em;">${c.title}<span style="color:${c.color};">.</span></h3>
            <p style="margin-top:12px !important;font-size:16.5px;line-height:1.5;color:rgba(11,11,18,0.76);">${flipped[idx] ? c.back : c.front}</p>
          </div>
          <span style="font-size:12.5px;font-weight:500;color:rgba(11,11,18,0.55);">↻ ${flipped[idx] ? "Volver a definición" : "Ver impacto y diseño"}</span>
        </button>
      `).join("");
    }

    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-flip-idx]");
      if (!btn) return;
      const idx = Number(btn.dataset.flipIdx);
      flipped[idx] = !flipped[idx];
      render();
    });
    flipAllBtn.addEventListener("click", () => {
      const target = !flipped.every(Boolean);
      for (let i = 0; i < flipped.length; i += 1) flipped[i] = target;
      render();
    });
    render();
  }

  function initRoutersExplorer() {
    const menu = document.getElementById("routers-menu");
    const tagEl = document.getElementById("router-active-tag");
    const titleEl = document.getElementById("router-active-title");
    const listEl = document.getElementById("router-endpoints-list");
    if (!menu) return;

    const routers = [
      { prefix: "/users", tag: "users", color: "#ff8904", endpoints: [
        ["POST", "/users/register/student", "201 · Registro de estudiante (StudentUser)"],
        ["POST", "/users/register/business", "201 · Registro de cuenta comercial (BusinessUser)"],
        ["POST", "/users/login", "200 · Login con email/password → Bearer JWT"],
        ["GET", "/users/me", "200 · Perfil del usuario autenticado"]
      ]},
      { prefix: "/spaces", tag: "spaces", color: "#7c3aed", endpoints: [
        ["GET", "/spaces/", "200 · Búsqueda y filtros (name, has_wifi, has_outlets, noise_level)"],
        ["POST", "/spaces/", "201 · Alta de espacio por negocio (is_approved=False)"],
        ["GET", "/spaces/mine", "200 · Espacios propios del negocio autenticado"],
        ["GET", "/spaces/pending", "200 · Espacios pendientes de aprobación (Solo Admin)"],
        ["PATCH", "/spaces/{id}/approve", "200 · Aprueba un espacio pendiente (Solo Admin)"]
      ]},
      { prefix: "/reviews", tag: "reviews", color: "#e12afb", endpoints: [
        ["GET", "/reviews/space/{id}", "200 · Reseñas visibles de un espacio (público)"],
        ["POST", "/reviews/space/{id}", "201 · Publica reseña 1–5 ★ + hasta 5 fotos (Estudiante)"],
        ["PUT", "/reviews/{id}", "200 · Edita reseña propia"],
        ["PUT", "/reviews/{id}/vote", "200 · Vota reseña ajena como útil / no útil"]
      ]},
      { prefix: "/lists & /favorites", tag: "lists", color: "#2dd4bf", endpoints: [
        ["GET/POST", "/lists", "200/201 · Lista o crea listas personalizadas del estudiante"],
        ["POST/DEL", "/lists/{id}/spaces", "201/204 · Agrega o quita un espacio de una lista"],
        ["GET/POST", "/favorites", "200/201 · Consulta o agrega espacio a FavoritesList"],
        ["DELETE", "/favorites/{space_id}", "204 · Quita un espacio de favoritos"]
      ]},
      { prefix: "/posts", tag: "posts", color: "#facc15", endpoints: [
        ["GET", "/posts/space/{id}", "200 · Publicaciones activas de un espacio (público)"],
        ["GET", "/posts/mine", "200 · Publicaciones del negocio autenticado"],
        ["POST", "/posts/space/{id}", "201 · Crea novedad/promoción en espacio propio (Negocio)"],
        ["PUT/DEL", "/posts/{id}", "200/204 · Edita o elimina publicación propia"]
      ]},
      { prefix: "/reports & /health", tag: "reports", color: "#fb7185", endpoints: [
        ["POST", "/reports/{reviews|posts|spaces|users}/{id}", "201 · Emite reporte polimórfico"],
        ["GET", "/reports", "200 · Lista reportes filtrando por status y type (Admin)"],
        ["PUT", "/reports/{id}/resolve", "200 · Resuelve reporte aplicando medida polimórfica (Admin)"],
        ["PUT", "/reports/{id}/dismiss", "200 · Descarta reporte sin sanción (Admin)"],
        ["GET", "/health", '200 · Healthcheck {"status": "ok"}']
      ]}
    ];

    let active = 0;
    function methodColor(m) {
      if (m.includes("GET")) return "#0284c7";
      if (m.includes("POST")) return "#0d9488";
      if (m.includes("DEL")) return "#e11d48";
      return "#7c3aed";
    }

    function render() {
      menu.innerHTML = routers.map((r, idx) => {
        const isActive = idx === active;
        return `
          <button type="button" class="card card-sm" data-router-idx="${idx}" aria-current="${isActive ? "step" : "false"}"
            style="display:flex;align-items:center;gap:12px;padding:13px 16px;text-align:left;transition:transform 350ms var(--ease-out-expo);${isActive ? "transform:translateX(8px);" : "border-color:transparent;box-shadow:none;"}">
            <span class="wash" style="--c:${r.color};--wash-h:${isActive ? "100%" : "0%"}"></span>
            <span style="width:8px;height:8px;border-radius:999px;background:${r.color};"></span>
            <span class="mono" style="font-size:15px;font-weight:500;">${r.prefix}</span>
          </button>
        `;
      }).join("");

      const curr = routers[active];
      tagEl.textContent = `Router tag: ${curr.tag}`;
      titleEl.innerHTML = `${curr.prefix}<span class="dot" style="--c:${curr.color}"></span>`;
      listEl.innerHTML = curr.endpoints.map(([method, path, desc]) => `
        <div style="display:flex;align-items:center;gap:16px;border-radius:16px;border:1px solid rgba(11,11,18,0.08);background:#fff;padding:16px 20px;">
          <span class="mono" style="width:88px;flex-shrink:0;border-radius:8px;padding:4px 0;text-align:center;font-size:12px;font-weight:600;color:#fff;background:${methodColor(method)};">${method}</span>
          <span class="mono" style="font-size:14.5px;font-weight:600;">${path}</span>
          <span style="margin-left:auto;font-size:14px;color:rgba(11,11,18,0.65);">${desc}</span>
        </div>
      `).join("");
    }

    menu.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-router-idx]");
      if (!btn) return;
      active = Number(btn.dataset.routerIdx);
      render();
    });
    render();
  }

  function initQaSlides() {
    const barsHost = document.getElementById("qa-bars-list");
    if (barsHost) {
      const suites = [
        { file: "tests/test_reports.py", count: 35, color: "#ff8904", desc: "Reportes polimórficos (reseñas, posts, espacios, usuarios), unicidad, resolve y dismiss." },
        { file: "tests/test_models.py", count: 32, color: "#e12afb", desc: "Clases abstractas User y Report, Single-Table Inheritance, cascade delete y métodos." },
        { file: "tests/test_reviews.py", count: 31, color: "#7c3aed", desc: "CRUD de reseñas, límite de 5 imágenes, cálculo de promedio y votos de utilidad." },
        { file: "tests/test_lists.py", count: 26, color: "#2dd4bf", desc: "Listas personalizadas, FavoritesList, duplicados y permisos por propietario." },
        { file: "tests/test_posts.py", count: 23, color: "#74d4ff", desc: "CRUD de publicaciones de negocios, visibilidad y validación de propietario." },
        { file: "tests/test_auth.py + spaces + health", count: 16, color: "#facc15", desc: "Registro estudiante/negocio, login JWT, filtros de espacios, aprobación admin y /health." }
      ];
      barsHost.innerHTML = suites.map((s, idx) => `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:13.5px;">
            <span class="mono" style="font-weight:600;">${s.file}</span>
            <span class="mono" style="font-size:12px;color:rgba(11,11,18,0.62);">${s.count} tests</span>
          </div>
          <div style="margin-top:5px;height:12px;border-radius:999px;background:rgba(11,11,18,0.06);overflow:hidden;">
            <span class="grow-bar" style="width:${(s.count / 35) * 100}%;background:${s.color};--delay:${220 + idx * 100}ms;"></span>
          </div>
          <p style="margin-top:4px !important;font-size:12px;color:rgba(11,11,18,0.56);">${s.desc}</p>
        </div>
      `).join("");
    }

    const deployHost = document.getElementById("qa-deploy-grid");
    if (deployHost) {
      const items = [
        { title: "GitHub Actions CI", sub: ".github/workflows/tests.yml", color: "#ff8904", icon: "git", lines: ["Se ejecuta automáticamente en cada push y Pull Request.", "Instala dependencias y corre pytest + verificación ortográfica (typos)."] },
        { title: "Docker Auto-Inicializable", sub: "Dockerfile & docker-compose.yml", color: "#74d4ff", icon: "cpu", lines: ["Imagen Python 3.12-slim que ejecuta alembic upgrade head al iniciar.", "Corre crear_admin.py --auto y levanta Uvicorn en el puerto 8000."] },
        { title: "PostgreSQL & SQLite", sub: "app/database/session.py", color: "#7c3aed", icon: "db", lines: ["Normaliza automáticamente postgres:// a postgresql+psycopg://.", "Permite desarrollar con SQLite local y desplegar en PostgreSQL sin cambiar código."] },
        { title: "Deploy en Render + Web", sub: "study-spaces-rest-api.onrender.com", color: "#2dd4bf", icon: "globe", lines: ["API productiva conectada a PostgreSQL gestionado en la nube.", "Integrada con las 8 pantallas del cliente web en frontend/."] }
      ];
      deployHost.innerHTML = items.map((item, idx) => {
        const icColor = item.color === "#74d4ff" ? "#0284c7" : item.color;
        return `
          <div class="card lift flex-col rv" style="--i:${idx + 2};padding:28px;">
            <span class="wash" style="--c:${item.color};--wash-h:52%"></span>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span class="num-badge">0${idx + 1}</span>
              <span class="icon-box" style="--ic:${icColor};">${ICONS[item.icon]}</span>
            </div>
            <p class="mono" style="margin-top:16px !important;font-size:11px;color:rgba(11,11,18,0.48);">${item.sub}</p>
            <h3 style="margin-top:6px !important;font-size:24px;line-height:1.1;font-weight:600;letter-spacing:-0.035em;">
              ${item.title}<span style="color:${item.color};">.</span>
            </h3>
            <ul style="margin-top:16px;display:flex;flex-direction:column;gap:8px;font-size:14.5px;line-height:1.5;color:rgba(11,11,18,0.66);">
              ${item.lines.map((l) => `<li>${l}</li>`).join("")}
            </ul>
          </div>
        `;
      }).join("");
    }
  }

  function initTakeawaysAndClosing() {
    const fanHost = document.getElementById("takeaways-fan");
    if (fanHost) {
      const items = [
        { title: "Arquitectura en Capas", text: "Separación estricta Router → Service → Repository → Model que desacopla las reglas de negocio de FastAPI y SQLAlchemy.", color: "#ff8904", deep: "#ea580c" },
        { title: "POO y Polimorfismo Real", text: "Single-Table Inheritance en User, Report y StudySpacesList + Template Method en Report.resolve() y Report.dismiss().", color: "#e12afb", deep: "#c026d3" },
        { title: "Calidad y Automatización", text: "163 tests automatizados en Pytest, 6 migraciones Alembic, pipeline CI en GitHub Actions y contenedor Docker.", color: "#7c3aed", deep: "#6d28d9" },
        { title: "Evolución Post-MVP", text: "Excepciones de dominio (Fase 8), notificaciones con Observer + Factory Method, OwnershipRequest y campañas con MercadoPago.", color: "#2dd4bf", deep: "#0d9488" }
      ];
      const center = (items.length - 1) / 2;
      fanHost.innerHTML = items.map((t, idx) => {
        const dist = Math.abs(idx - center);
        const isCenter = dist < 1;
        const pad = idx < center ? "padding-right:38px;" : idx > center + 0.5 ? "padding-left:38px;" : "";
        return `
          <li class="fan-card" data-role="${isCenter ? "rise" : "spread"}" style="--turn:${(idx - center) * 10.5}deg;--z:${Math.round(10 - dist)};--delay:${isCenter ? `${400 + (idx > center ? 140 : 0)}ms` : "1050ms"};">
            <div class="card fan-face" style="${pad}">
              <span class="wash" style="--c:${t.color};--wash-h:60%"></span>
              <span class="num-badge">0${idx + 1}</span>
              <h3 style="margin-top:12px !important;font-size:25px;line-height:1.08;font-weight:600;letter-spacing:-0.035em;">
                ${t.title}<span style="margin-left:0.15em;color:${t.deep};">.</span>
              </h3>
              <p style="margin-top:12px !important;font-size:14.5px;line-height:1.5;color:rgba(11,11,18,0.66);">${t.text}</p>
            </div>
          </li>
        `;
      }).join("");
    }

    const linksHost = document.getElementById("closing-links-list");
    if (linksHost) {
      const links = [
        { title: "Swagger UI en Producción (Render)", url: "https://study-spaces-rest-api.onrender.com/docs", sub: "study-spaces-rest-api.onrender.com/docs" },
        { title: "Healthcheck Endpoint", url: "https://study-spaces-rest-api.onrender.com/health", sub: "study-spaces-rest-api.onrender.com/health" },
        { title: "Frontend Web Local (Demo Live)", url: "/frontend/index.html", sub: "http://127.0.0.1:8080/frontend/index.html" },
        { title: "Paso 1 · Flujo Estudiante", url: null, sub: "Filtrar espacios → ver detalle.html → publicar reseña 5 ★ → guardar en favoritos" },
        { title: "Paso 2 · Flujo Negocio & Admin", url: null, sub: "Alta espacio (is_approved=False) → aprobar en admin.html → resolver reporte en /docs" },
        { title: "Repositorio GitHub · Study Spaces REST API", url: "https://github.com/titiBFG/study-spaces-rest-api", sub: "github.com/titiBFG/study-spaces-rest-api" }
      ];
      linksHost.innerHTML = links.map((l, idx) => {
        const tag = l.url ? "a" : "div";
        const attrs = l.url ? `href="${l.url}" target="_blank" rel="noreferrer"` : "";
        return `
          <${tag} ${attrs} class="rv" style="--i:${idx + 2};display:flex;align-items:center;gap:16px;border-radius:16px;border:1px solid rgba(11,11,18,0.08);background:#fff;padding:14px 20px;transition:transform 250ms,box-shadow 250ms;">
            <span class="mono" style="font-size:11px;color:rgba(11,11,18,0.42);">0${idx + 1}</span>
            <span style="flex:1;min-width:0;">
              <span style="display:block;font-size:16px;font-weight:600;letter-spacing:-0.02em;">${l.title}</span>
              <span class="mono" style="display:block;font-size:12px;color:rgba(11,11,18,0.5);">${l.sub}</span>
            </span>
            ${l.url ? `<span style="color:rgba(11,11,18,0.42);">${ICONS.arrowUpRight}</span>` : ""}
          </${tag}>
        `;
      }).join("");
    }
  }

  /* ==================== REVEAL.JS BOOTSTRAP & GLOBAL CHROME ==================== */
  document.addEventListener("DOMContentLoaded", () => {
    const slides = Array.from(document.querySelectorAll(".reveal .slides > section"));
    const indexModal = document.getElementById("index-modal");
    const indexGrid = document.getElementById("index-grid");
    const chapterBarsEl = document.getElementById("chrome-chapter-bars");
    const counterEl = document.getElementById("chrome-counter");
    const sepEl = document.getElementById("chrome-sep");
    const chapterPill = document.getElementById("chrome-chapter");
    const chapterDot = document.getElementById("chrome-chapter-dot");
    const chapterLabel = document.getElementById("chrome-chapter-label");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const btnIndex = document.getElementById("btn-index");
    const btnCloseIndex = document.getElementById("btn-close-index");
    const btnFullscreen = document.getElementById("btn-fullscreen");
    const iconFsMax = document.getElementById("icon-fs-max");
    const iconFsMin = document.getElementById("icon-fs-min");
    const statusRegion = document.getElementById("a11y-status");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Group slides by chapter in deck order
    const groups = [];
    slides.forEach((sec, idx) => {
      const chId = sec.dataset.chapter || "intro";
      const last = groups[groups.length - 1];
      if (last && last.chapter === chId) {
        last.count += 1;
      } else {
        groups.push({ chapter: chId, start: idx, count: 1 });
      }
    });

    // Build footer chapter progress bars
    chapterBarsEl.innerHTML = groups.map((g) => {
      const ch = CHAPTERS[g.chapter];
      return `
        <button type="button" class="chapter-bar-btn" data-bar-start="${g.start}" style="flex-grow:${g.count};"
          title="${ch.n} ${ch.title}" aria-label="Ir a ${ch.title}">
          <span class="chapter-bar-track">
            <span class="chapter-bar-fill" data-bar-fill="${g.chapter}"></span>
          </span>
        </button>
      `;
    }).join("");

    let demoLive = null;

    function isIndexOpen() {
      return !indexModal.hidden;
    }

    function openIndex() {
      renderIndexModal();
      indexModal.hidden = false;
      document.body.classList.add("index-open");
      btnCloseIndex.focus();
    }

    function closeIndex() {
      indexModal.hidden = true;
      document.body.classList.remove("index-open");
      btnIndex.focus();
    }

    function renderIndexModal() {
      const currentIdx = Reveal.getIndices().h || 0;
      indexGrid.innerHTML = groups.map((g) => {
        const ch = CHAPTERS[g.chapter];
        const isCurrentGroup = currentIdx >= g.start && currentIdx < g.start + g.count;
        const pills = slides.slice(g.start, g.start + g.count).map((s, offset) => {
          const slideIdx = g.start + offset;
          const title = s.dataset.title || `Slide ${slideIdx + 1}`;
          return `
            <button type="button" class="overview-pill ${slideIdx === currentIdx ? "is-current" : ""}" data-go-slide="${slideIdx}">
              ${escapeHtml(title)}
            </button>
          `;
        }).join("");
        return `
          <div class="card card-sm lift overview-card" data-active="${isCurrentGroup}">
            <span class="wash" style="--c:${ch.color};--wash-h:55%"></span>
            <button type="button" data-go-slide="${g.start}" style="text-align:left;">
              <span class="num-badge">${ch.n}</span>
              <p class="overview-card-title">${ch.title}<span style="color:${ch.deep};">.</span></p>
            </button>
            <div class="overview-pills">${pills}</div>
          </div>
        `;
      }).join("");
    }

    function syncChrome() {
      const idx = Reveal.getIndices().h || 0;
      const slide = slides[idx];
      const ch = CHAPTERS[(slide && slide.dataset.chapter) || "intro"];

      counterEl.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      const showChapter = ch.id !== "intro";
      sepEl.hidden = !showChapter;
      chapterPill.hidden = !showChapter;
      if (showChapter) {
        chapterDot.style.background = ch.color;
        chapterLabel.textContent = `${ch.n} ${ch.title}`;
      }

      groups.forEach((g) => {
        const fill = chapterBarsEl.querySelector(`[data-bar-fill="${g.chapter}"]`);
        if (!fill) return;
        const groupCh = CHAPTERS[g.chapter];
        const done = idx >= g.start + g.count;
        const active = idx >= g.start && !done;
        const pct = done ? 100 : active ? ((idx - g.start + 1) / g.count) * 100 : 0;
        fill.style.width = `${pct}%`;
        fill.style.background = done ? "rgba(11,11,18,0.55)" : groupCh.color;
      });

      btnPrev.disabled = Reveal.isFirstSlide() && !Reveal.availableFragments().prev;
      btnNext.disabled = Reveal.isLastSlide() && !Reveal.availableFragments().next;

      if (demoLive) demoLive.syncFromReveal();
    }

    function toggleFullscreen() {
      const promise = document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen?.();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          if (statusRegion) statusRegion.textContent = "El navegador no permitió activar la pantalla completa.";
        });
      }
    }

    function syncFullscreenIcon() {
      const isFs = Boolean(document.fullscreenElement);
      iconFsMax.hidden = isFs;
      iconFsMin.hidden = !isFs;
    }

    // Initialize Reveal.js 6.0.2 (1600x900 native scaling)
    Reveal.initialize({
      width: 1600,
      height: 900,
      margin: 0,
      minScale: 0.2,
      maxScale: 2.0,
      center: false,
      hash: true,
      respondToHashChanges: true,
      controls: false,
      progress: false,
      overview: false,
      help: false,
      transition: reducedMotion.matches ? "none" : "fade",
      transitionSpeed: "fast",
      keyboardCondition: (event) => {
        if (isIndexOpen()) return false;
        if (demoLive && demoLive.isExploringActive()) return false;
        const target = event && event.target;
        if (target instanceof HTMLElement) {
          const tag = target.tagName;
          if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
            return false;
          }
        }
        return true;
      }
    }).then(() => {
      demoLive = new window.StudySpacesDemoLive(Reveal);

      // Initialize all interactive slide widgets
      initAgendaFan((chId) => {
        const targetIdx = slides.findIndex((s) => s.dataset.chapter === chId);
        if (targetIdx >= 0) Reveal.slide(targetIdx);
      });
      mountSpacesSimulator(document.getElementById("sim-intro-host"));
      const statesSim = mountSpacesSimulator(document.getElementById("sim-states-host"));
      initMvpStates(statesSim);
      initRolesWidget();
      initMvpGrid();
      initArchLayers();
      initStackGrid();
      initRequestLifecycle();
      initDomainInheritance();
      initRatingCalc();
      initTemplateMethod();
      initPatternsOverview();
      initRoutersExplorer();
      initQaSlides();
      initTakeawaysAndClosing();

      syncChrome();
    });

    Reveal.on("slidechanged", syncChrome);
    Reveal.on("fragmentshown", syncChrome);
    Reveal.on("fragmenthidden", syncChrome);

    // Chrome controls
    btnPrev.addEventListener("click", () => Reveal.prev());
    btnNext.addEventListener("click", () => Reveal.next());
    btnIndex.addEventListener("click", () => (isIndexOpen() ? closeIndex() : openIndex()));
    btnCloseIndex.addEventListener("click", closeIndex);
    btnFullscreen.addEventListener("click", toggleFullscreen);

    chapterBarsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-bar-start]");
      if (btn) Reveal.slide(Number(btn.dataset.barStart));
    });

    indexGrid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-go-slide]");
      if (!btn) return;
      closeIndex();
      Reveal.slide(Number(btn.dataset.goSlide));
    });

    // Global shortcuts (Index O/I, Fullscreen F, Esc)
    window.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      const inInput =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (e.key === "Escape") {
        if (isIndexOpen()) {
          e.preventDefault();
          closeIndex();
        } else if (inInput) {
          target.blur();
        }
        return;
      }

      if (inInput) return;
      if (demoLive && demoLive.isExploringActive()) return;

      if (e.key === "o" || e.key === "O" || e.key === "i" || e.key === "I") {
        e.preventDefault();
        if (isIndexOpen()) closeIndex();
        else openIndex();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    });

    document.addEventListener("fullscreenchange", syncFullscreenIcon);
    reducedMotion.addEventListener("change", () => {
      Reveal.configure({ transition: reducedMotion.matches ? "none" : "fade" });
    });
  });
})();
