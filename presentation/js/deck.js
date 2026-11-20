/* ==========================================================================
   Study Spaces REST API — Reveal.js 6.0.2 Vanilla Deck Controller
   Zero external frameworks, zero CDN. Drives:
   - Reveal.js 1600x900 native navigation, hash routing, reduced motion
   - Full-viewport backdrop transitions (brand, mvp, domain, demo, clean)
   - Global chrome: breadcrumb, slide counter, chapter bars, Index modal, FS
   - Pure-informational cards and architectural layer switcher across 22 slides
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
    cpu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>`,
    globe: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
    shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
    layout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>`,
    search: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>`,
    star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    heart: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>`,
    flag: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
    zap: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.914 4a1.5 1.5 0 0 0-2.474-1.561l-9 9A1.5 1.5 0 0 0 5.5 14h4.002a.5.5 0 0 1 .471.666L8.086 20a1.5 1.5 0 0 0 2.475 1.56l9-9A1.5 1.5 0 0 0 18.5 10h-3.997a.5.5 0 0 1-.472-.667z"/></svg>`,
    db: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>`,
    lock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    git: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>`,
    arrowUpRight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ==================== SLIDE 02: AGENDA FAN ==================== */
  function initAgendaFan(goToChapter) {
    const host = document.getElementById("agenda-fan");
    if (!host) return;
    const items = [
      { id: "mvp", title: "MVP RQ1–RQ6", text: "Problema, 3 roles, estados y cliente web." },
      { id: "architecture", title: "Arquitectura", text: "Stack (Neon, FastAPI), 4 capas y request." },
      { id: "domain", title: "Dominio & POO", text: "4 jerarquías STI y polimorfismo real." },
      { id: "patterns", title: "Patrones", text: "Repository, Service, Template Method y Observer." },
      { id: "api", title: "JWT & API REST", text: "Seguridad Bcrypt/JWT y los 8 routers." },
      { id: "quality", title: "QA & Cloud", text: "201 tests Pytest, 8 migraciones y Render." },
      { id: "takeaways", title: "Demo & Cierre", text: "Guion de demo aparte, conclusiones y cierre." }
    ];
    const center = (items.length - 1) / 2;
    host.innerHTML = items.map((item, idx) => {
      const ch = CHAPTERS[item.id];
      const dist = Math.abs(idx - center);
      const isCenter = dist < 1;
      const delay = isCenter ? `${250 + (idx > center ? 100 : 0)}ms` : `${750 + (dist - 1) * 110}ms`;
      const padStyle = idx < center ? "padding-right:48px;" : idx > center ? "padding-left:48px;" : "";
      return `
        <li class="fan-card" data-role="${isCenter ? "rise" : "spread"}" style="--turn:${(idx - center) * 8.8}deg;--z:${Math.round(10 - dist)};--delay:${delay};">
          <button type="button" class="card fan-face" data-jump-chapter="${item.id}" style="${padStyle}">
            <span class="wash" style="--c:${ch.color};--wash-h:58%"></span>
            <span class="num-badge">${ch.n}</span>
            <span style="margin-top:12px;display:block;font-size:21px;line-height:1.08;font-weight:600;letter-spacing:-0.03em;">
              ${escapeHtml(item.title)}<span style="margin-left:0.15em;color:${ch.deep};">.</span>
            </span>
            <span style="margin-top:8px;display:block;font-size:13.5px;line-height:1.45;color:rgba(11,11,18,0.62);">${escapeHtml(item.text)}</span>
          </button>
        </li>
      `;
    }).join("");

    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-jump-chapter]");
      if (btn) goToChapter(btn.dataset.jumpChapter);
    });
  }

  /* ==================== SLIDE 03: PRODUCT OVERVIEW ==================== */
  function initProductOverviewGrid() {
    const host = document.getElementById("product-overview-grid");
    if (!host) return;
    const pillars = [
      {
        num: "01 · DESCUBRIMIENTO",
        title: "Búsqueda y Filtros",
        icon: "search",
        color: "#7c3aed",
        icColor: "#7c3aed",
        endpoint: "GET /spaces/",
        text: "Filtra espacios aprobados (is_approved=True) por nombre parcial, WiFi, enchufes disponibles y nivel de ruido (low, medium, high)."
      },
      {
        num: "02 · COMUNIDAD",
        title: "Reseñas y Promedio ★",
        icon: "star",
        color: "#ff8904",
        icColor: "#ea580c",
        endpoint: "POST /reviews/space/{id}",
        text: "Calificaciones 1 a 5 ★ con hasta 5 fotos, cálculo dinámico del promedio excluyendo reseñas ocultas y votos de utilidad entre pares."
      },
      {
        num: "03 · CURACIÓN",
        title: "Listas y Favoritos",
        icon: "heart",
        color: "#e12afb",
        icColor: "#c026d3",
        endpoint: "POST /favorites · POST /lists",
        text: "Permite guardar espacios favoritos (FavoritesList) y organizar múltiples colecciones temáticas (StudySpacesList) en una sola tabla STI."
      },
      {
        num: "04 · GOBERNANZA Y ALERTAS",
        title: "Moderación y Notificaciones",
        icon: "shield",
        color: "#2dd4bf",
        icColor: "#0d9488",
        endpoint: "PUT /reports/{id}/resolve · /notifications",
        text: "Admins aprueban o rechazan espacios y resuelven reportes; Observer y NotificationService avisan en tiempo real en /notifications."
      }
    ];

    host.innerHTML = pillars.map((p, idx) => `
      <article class="card lift flex-col rv" style="--i:${idx + 2};padding:26px;justify-content:space-between;">
        <span class="wash" style="--c:${p.color};--wash-h:52%"></span>
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <span class="num-badge">${escapeHtml(p.num)}</span>
            <span class="icon-box" style="--ic:${p.icColor};">${ICONS[p.icon]}</span>
          </div>
          <h3 style="margin-top:14px !important;font-size:25px;font-weight:600;letter-spacing:-0.035em;line-height:1.12;">
            ${escapeHtml(p.title)}<span style="margin-left:0.12em;color:${p.icColor};">.</span>
          </h3>
          <p style="margin-top:10px !important;font-size:15px;line-height:1.5;color:rgba(11,11,18,0.72);">${escapeHtml(p.text)}</p>
        </div>
        <div>
          <span class="mono" style="display:inline-block;border-radius:8px;border:1px solid #fff;background:rgba(255,255,255,0.88);padding:5px 11px;font-size:11.5px;color:rgba(11,11,18,0.8);">${escapeHtml(p.endpoint)}</span>
        </div>
      </article>
    `).join("");
  }

  /* ==================== SLIDE 04: 3 POLYMORPHIC ROLES ==================== */
  function initRolesCardsList() {
    const host = document.getElementById("roles-cards-list");
    if (!host) return;
    const roles = [
      {
        num: "01 · SUBCLASE ESTUDIANTE",
        title: "StudentUser",
        roleValue: 'role = "student"',
        color: "#7c3aed",
        deep: "#6d28d9",
        points: [
          "Busca espacios aprobados, publica reseñas (1–5 ★ + fotos), vota utilidad y arma /lists y /favorites.",
          "Recibe notificaciones in-app por novedades de favoritos (Observer), votos y reportes."
        ]
      },
      {
        num: "02 · SUBCLASE NEGOCIO",
        title: "BusinessUser",
        roleValue: 'role = "business"',
        color: "#ff8904",
        deep: "#ea580c",
        points: [
          "Ve en /spaces/mine si cada local está Aprobado, Pendiente o Rechazado; si edita uno rechazado, vuelve a Pendiente.",
          "Publica novedades en /posts/space/{id} y recibe notificaciones de aprobación, rechazo y reseñas."
        ]
      },
      {
        num: "03 · SUBCLASE ADMINISTRADOR",
        title: "AdminUser",
        roleValue: 'role = "admin"',
        color: "#2dd4bf",
        deep: "#0d9488",
        points: [
          "Recibe alertas de nuevos locales o espacios re-enviados a revisión en /spaces/pending.",
          "Aprueba (/approve) o rechaza (/reject) espacios y resuelve o descarta reportes (/reports/{id}/resolve)."
        ]
      }
    ];

    host.innerHTML = roles.map((r, idx) => `
      <article class="card card-sm lift rv" style="--i:${idx + 2};padding:20px 24px;">
        <span class="wash" style="--c:${r.color};--wash-h:48%"></span>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <span class="num-badge">${escapeHtml(r.num)}</span>
          <span class="mono" style="border-radius:999px;background:rgba(255,255,255,0.9);padding:3px 11px;font-size:11px;font-weight:600;color:${r.deep};">${escapeHtml(r.roleValue)}</span>
        </div>
        <h3 style="margin-top:6px !important;font-size:24px;font-weight:600;letter-spacing:-0.03em;">
          ${escapeHtml(r.title)}<span style="margin-left:0.12em;color:${r.deep};">.</span>
        </h3>
        <ul style="margin-top:8px;display:flex;flex-direction:column;gap:5px;font-size:14px;line-height:1.45;color:rgba(11,11,18,0.72);">
          ${r.points.map((pt) => `<li><span style="color:${r.deep};font-weight:700;">✓</span> ${escapeHtml(pt)}</li>`).join("")}
        </ul>
      </article>
    `).join("");
  }

  /* ==================== SLIDE 05: MVP REQUIREMENTS GRID ==================== */
  function initMvpGrid() {
    const host = document.getElementById("mvp-req-grid");
    if (!host) return;
    const reqs = [
      { code: "RQ1", title: "Usuarios, Roles y JWT", icon: "shield", lines: ["Registro diferenciado Estudiante / Negocio y hashing con Bcrypt.", "Tokens Bearer JWT (HS256) y RBAC polimórfico por subclase."], endpoint: "POST /users/login · GET /users/me" },
      { code: "RQ2", title: "Gestión y Estados", icon: "layout", lines: ["Negocios ven Aprobado, Pendiente o Rechazado en /spaces/mine.", "Si editan un espacio rechazado, vuelve a Pendiente automáticamente."], endpoint: "PATCH /spaces/{id}/approve · /reject" },
      { code: "RQ3", title: "Búsqueda y Filtros", icon: "search", lines: ["Filtrado dinámico combinable por nombre, WiFi, enchufes y ruido.", "Solo expone al público espacios con is_approved = True."], endpoint: "GET /spaces/?has_wifi=true&noise_level=low" },
      { code: "RQ4", title: "Reseñas, Fotos y Votos", icon: "star", lines: ["Calificación 1 a 5, comentario y hasta 5 imágenes por reseña.", "Cálculo dinámico de average_rating y votos de utilidad."], endpoint: "POST /reviews/space/{id} · PUT /reviews/{id}/vote" },
      { code: "RQ5", title: "Listas y Favoritos", icon: "heart", lines: ["Herencia StudySpacesList / FavoritesList en una misma tabla.", "Favoritos suscribe al estudiante como Observer de novedades."], endpoint: "GET/POST /lists · GET/POST/DELETE /favorites" },
      { code: "RQ6+", title: "Moderación, Posts & Alertas", icon: "flag", lines: ["Reportes polimórficos, módulo /posts y bandeja /notifications.", "Notificaciones in-app con preferencias configurables por evento."], endpoint: "PUT /reports/{id}/resolve · GET /notifications" }
    ];
    host.innerHTML = reqs.map((r, idx) => {
      const c = PALETTE[idx];
      const icColor = c === "#facc15" ? "#ca8a04" : c;
      return `
        <article class="card lift flex-col rv" style="--i:${idx + 2};padding:24px;">
          <span class="wash" style="--c:${c};--wash-h:52%"></span>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;">
            <div>
              <span class="num-badge">${escapeHtml(r.code)}</span>
              <h3 style="margin-top:6px !important;font-size:22px;font-weight:600;letter-spacing:-0.03em;">
                ${escapeHtml(r.title)}<span style="margin-left:0.15em;color:${icColor};">.</span>
              </h3>
            </div>
            <span class="icon-box" style="--ic:${icColor};">${ICONS[r.icon]}</span>
          </div>
          <ul style="margin-top:12px;display:flex;flex-direction:column;gap:6px;font-size:14px;line-height:1.45;color:rgba(11,11,18,0.68);">
            ${r.lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}
          </ul>
          <div class="mt-auto" style="padding-top:12px;">
            <span class="mono" style="display:inline-block;border-radius:8px;border:1px solid #fff;background:rgba(255,255,255,0.88);padding:4px 10px;font-size:11px;color:rgba(11,11,18,0.78);">${escapeHtml(r.endpoint)}</span>
          </div>
        </article>
      `;
    }).join("");
  }

  /* ==================== SLIDE 06: REAL WEB CLIENT (frontend/) ==================== */
  function initMvpFrontendGrid() {
    const host = document.getElementById("mvp-frontend-grid");
    if (!host) return;
    const screens = [
      {
        num: "01 · CATÁLOGO Y DETALLE PÚBLICO",
        title: "Explorar Espacios y Reseñas",
        files: "index.html · detalle.html · js/app.js · js/detalle.js",
        color: "#ff8904",
        deep: "#ea580c",
        icon: "search",
        bullets: [
          "Filtros combinados sobre GET /spaces/ (WiFi, enchufes, ruido, texto) con estados explícitos de carga, vacío y error.",
          "Ficha técnica en detalle.html con rating promedio, reseñas visibles, votos y novedades (/posts/space/{id})."
        ]
      },
      {
        num: "02 · AUTENTICACIÓN JWT POR ROL",
        title: "Ingreso, Registro y Cuenta",
        files: "login.html · registro.html · mi-cuenta.html · js/menu.js",
        color: "#74d4ff",
        deep: "#0284c7",
        icon: "lock",
        bullets: [
          "Registro diferenciado StudentUser / BusinessUser y almacenamiento local del Bearer JWT emitido en POST /users/login.",
          "Navegación adaptativa en menu.js según rol autenticado y vista de perfil conectado a GET /users/me."
        ]
      },
      {
        num: "03 · ACCIONES Y NOTIFICACIONES",
        title: "Favoritos, Listas y Alertas",
        files: "favoritos.html · mis-listas.html · mis-resenas.html · js/notificaciones.js",
        color: "#e12afb",
        deep: "#c026d3",
        icon: "heart",
        bullets: [
          "Guardado en FavoritesList (/favorites), listas temáticas (/lists) y bandeja in-app conectada a /notifications.",
          "Gestión de reseñas propias e ingreso de reportes contra reseñas, posts, espacios o usuarios."
        ]
      },
      {
        num: "04 · GESTIÓN NEGOCIO & ADMIN",
        title: "Estados, Rechazo y Moderación",
        files: "mis-espacios.html · admin.html · js/mis-espacios.js · js/admin.js",
        color: "#2dd4bf",
        deep: "#0d9488",
        icon: "shield",
        bullets: [
          "Los negocios ven Aprobado, Pendiente o ✕ Rechazado en /spaces/mine; al editar uno rechazado, vuelve a Pendiente.",
          "admin.html aprueba (/approve) o rechaza (/reject) espacios pendientes y resuelve reportes en /reports."
        ]
      }
    ];

    host.innerHTML = screens.map((s, idx) => `
      <article class="card lift flex-col rv" style="--i:${idx + 2};padding:26px;justify-content:space-between;">
        <span class="wash" style="--c:${s.color};--wash-h:50%"></span>
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <span class="num-badge">${escapeHtml(s.num)}</span>
            <span class="icon-box" style="--ic:${s.deep};">${ICONS[s.icon]}</span>
          </div>
          <h3 style="margin-top:10px !important;font-size:25px;font-weight:600;letter-spacing:-0.035em;">
            ${escapeHtml(s.title)}<span style="margin-left:0.12em;color:${s.deep};">.</span>
          </h3>
          <ul style="margin-top:12px;display:flex;flex-direction:column;gap:8px;font-size:14.5px;line-height:1.48;color:rgba(11,11,18,0.7);">
            ${s.bullets.map((b) => `<li>✓ ${escapeHtml(b)}</li>`).join("")}
          </ul>
        </div>
        <div style="padding-top:10px;">
          <span class="mono" style="display:inline-block;border-radius:8px;border:1px solid #fff;background:rgba(255,255,255,0.88);padding:5px 11px;font-size:11.5px;color:rgba(11,11,18,0.78);">${escapeHtml(s.files)}</span>
        </div>
      </article>
    `).join("");
  }

  /* ==================== SLIDE 07: 4-LAYER ISOMETRIC ARCHITECTURE ==================== */
  function initArchLayers() {
    const isoHost = document.getElementById("arch-iso-host");
    if (!isoHost) return;
    const layers = [
      { name: "1. Routers (Controladores)", color: "#ff8904", lines: ["Definen los endpoints HTTP en app/routers/.", "Validan entrada/salida con schemas Pydantic v2.", "Inyectan sesión DB y dependencias de rol (Student, Business, Admin)."], example: ["users.py", "study_spaces.py", "reviews.py", "study_spaces_lists.py", "posts.py", "reports.py", "notifications.py"] },
      { name: "2. Services (Lógica de Negocio)", color: "#e12afb", lines: ["Concentran las reglas de negocio en app/services/.", "Verifican propiedad, unicidad, ciclo de rechazo/pendiente y notificaciones.", "Orquestan repositorios, Observer y NotificationService."], example: ["auth_service.py", "study_space_service.py", "review_service.py", "report_service.py", "notification_service.py"] },
      { name: "3. Repositories (Acceso a Datos)", color: "#7c3aed", lines: ["Encapsulan consultas SQLAlchemy 2.0 en app/repositories/.", "Desacoplan la lógica de negocio del motor de persistencia.", "Facilitan el testing unitario y de integración."], example: ["user_repository.py", "study_space_repository.py", "review_repository.py", "report_repository.py", "notification_repository.py"] },
      { name: "4. Models & Database (ORM)", color: "#2dd4bf", lines: ["Entidades de dominio con 4 jerarquías STI en app/models/.", "8 migraciones versionadas con Alembic.", "Soporte transparente PostgreSQL / Neon (prod) y SQLite (tests)."], example: ["User", "StudySpace", "Review", "StudySpacesList", "Post", "Report", "Notification"] }
    ];

    let active = 0;
    const wash = document.getElementById("arch-layer-wash");
    const num = document.getElementById("arch-layer-num");
    const title = document.getElementById("arch-layer-title");
    const linesEl = document.getElementById("arch-layer-lines");
    const modsEl = document.getElementById("arch-layer-modules");

    isoHost.innerHTML = layers.map((l, idx) => `
      <button type="button" class="iso-plate" data-layer-idx="${idx}" aria-pressed="false" aria-label="${escapeHtml(l.name)}"
        style="top:${idx * 95 + 32}px;z-index:${20 - idx};"></button>
      <button type="button" class="iso-label-btn" data-layer-idx="${idx}" aria-pressed="false" style="top:${idx * 95 + 172}px;">
        <span class="mono" style="font-size:11px;color:rgba(11,11,18,0.45);">CAPA 0${idx + 1}</span>
        <span style="font-size:18px;font-weight:600;letter-spacing:-0.02em;">${escapeHtml(l.name.split(" (")[0])}</span>
        <span style="width:52px;height:1px;background:rgba(11,11,18,0.2);"></span>
      </button>
    `).join("");

    const plateBtns = Array.from(isoHost.querySelectorAll(".iso-plate"));
    const labelBtns = Array.from(isoHost.querySelectorAll(".iso-label-btn"));

    function render() {
      layers.forEach((l, idx) => {
        const isActive = idx === active;
        const plate = plateBtns[idx];
        const label = labelBtns[idx];
        if (plate) {
          plate.setAttribute("aria-pressed", String(isActive));
          plate.style.setProperty("--lift", isActive ? "48px" : "0px");
          plate.style.borderColor = isActive ? "#fff" : `color-mix(in srgb, ${l.color} 30%, white)`;
          plate.style.background = isActive
            ? `linear-gradient(135deg, color-mix(in srgb, ${l.color} 30%, white), ${l.color})`
            : `linear-gradient(135deg, #ffffff 30%, color-mix(in srgb, ${l.color} 22%, white))`;
          plate.style.boxShadow = isActive
            ? `0 40px 60px -20px color-mix(in srgb, ${l.color} 60%, transparent)`
            : "0 20px 40px -24px rgba(11,11,18,0.28)";
        }
        if (label) {
          label.setAttribute("aria-pressed", String(isActive));
        }
      });

      const curr = layers[active];
      wash.style.setProperty("--c", curr.color);
      num.textContent = `CAPA 0${active + 1}`;
      title.innerHTML = `${escapeHtml(curr.name)}<span style="color:${curr.color};">.</span>`;
      linesEl.innerHTML = curr.lines.map((ln) => `<li>✓ ${escapeHtml(ln)}</li>`).join("");
      modsEl.innerHTML = curr.example.map((ex) => `
        <span class="mono" style="border-radius:999px;background:rgba(255,255,255,0.88);padding:6px 14px;font-size:12.5px;">${escapeHtml(ex)}</span>
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

  /* ==================== SLIDE 08: TECH STACK ==================== */
  function initStackGrid() {
    const host = document.getElementById("arch-stack-grid");
    if (!host) return;
    const stack = [
      { title: "Python · FastAPI · Pydantic", tag: "Backend y API", color: "#ff8904", deep: "#ea580c", icon: "zap", lines: ["Python 3.12+ y FastAPI modular con tipado estricto y Swagger en /docs.", "Pydantic v2 para validación de payloads y configuración (.env)."] },
      { title: "PostgreSQL · Neon · SQLAlchemy · Alembic", tag: "Base de datos", color: "#7c3aed", deep: "#6d28d9", icon: "db", lines: ["PostgreSQL serverless en Neon gestionado en producción + SQLite en tests.", "SQLAlchemy 2.0 (4 jerarquías STI) y 8 migraciones versionadas con Alembic."] },
      { title: "JWT · Bcrypt · Pytest", tag: "Seguridad y pruebas", color: "#2dd4bf", deep: "#0d9488", icon: "lock", lines: ["Tokens Bearer JWT (HS256, 8h), hashing Bcrypt y RBAC polimórfico.", "201 tests automatizados en Pytest con TestClient y SQLite aislado."] },
      { title: "Docker · Render · GitHub Actions", tag: "Despliegue y CI/CD", color: "#e12afb", deep: "#c026d3", icon: "globe", lines: ["Contenedor Docker auto-inicializable (alembic upgrade head + admin).", "Deploy continuo en Render con pipeline CI en GitHub Actions."] }
    ];
    host.innerHTML = stack.map((item, idx) => `
      <article class="card lift flex-col rv" style="--i:${idx + 2};padding:28px;">
        <span class="wash" style="--c:${item.color};--wash-h:55%"></span>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span class="num-badge">0${idx + 1}</span>
          <span class="icon-box" style="--ic:${item.deep};">${ICONS[item.icon]}</span>
        </div>
        <p class="mono" style="margin-top:16px !important;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:rgba(11,11,18,0.48);">${escapeHtml(item.tag)}</p>
        <h3 style="margin-top:6px !important;font-size:25px;line-height:1.1;font-weight:600;letter-spacing:-0.035em;">
          ${escapeHtml(item.title)}<span style="color:${item.deep};">.</span>
        </h3>
        <ul style="margin-top:16px;display:flex;flex-direction:column;gap:8px;font-size:14.5px;line-height:1.5;color:rgba(11,11,18,0.68);">
          ${item.lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}
        </ul>
      </article>
    `).join("");
  }

  /* ==================== SLIDE 09: REQUEST LIFECYCLE ==================== */
  function initRequestLifecycleCards() {
    const host = document.getElementById("req-steps-row");
    if (!host) return;
    const steps = [
      {
        num: "01",
        name: "HTTP Router",
        color: "#ff8904",
        deep: "#ea580c",
        text: "Recibe POST /reviews/space/1 con token Bearer y valida JSON con ReviewCreate.",
        file: "routers/reviews.py"
      },
      {
        num: "02",
        name: "Auth & RBAC",
        color: "#e12afb",
        deep: "#c026d3",
        text: "require_student decodifica el JWT y valida isinstance(user, StudentUser).",
        file: "services/auth_service.py"
      },
      {
        num: "03",
        name: "Service Layer",
        color: "#7c3aed",
        deep: "#6d28d9",
        text: "Verifica existencia y aprobación del espacio y que no exista reseña previa del estudiante.",
        file: "services/review_service.py"
      },
      {
        num: "04",
        name: "Repository & ORM",
        color: "#74d4ff",
        deep: "#0284c7",
        text: "Persiste la entidad Review y hasta 5 imágenes en SQLAlchemy dentro de la sesión DB.",
        file: "repositories/review_repository.py"
      },
      {
        num: "05",
        name: "Model & 201 JSON",
        color: "#2dd4bf",
        deep: "#0d9488",
        text: "StudySpace.calculate_average_rating() deriva el nuevo promedio y responde HTTP 201.",
        file: "models/study_space.py"
      }
    ];

    host.innerHTML = steps.map((s, idx) => `
      <article class="card card-sm lift flex-col rv" style="--i:${idx + 2};padding:20px;justify-content:space-between;min-height:220px;">
        <span class="wash" style="--c:${s.color};--wash-h:48%"></span>
        <div>
          <span class="num-badge">${escapeHtml(s.num)}</span>
          <h3 style="margin-top:8px !important;font-size:20px;font-weight:600;letter-spacing:-0.03em;line-height:1.15;">
            ${escapeHtml(s.name)}<span style="color:${s.deep};">.</span>
          </h3>
          <p style="margin-top:8px !important;font-size:13.5px;line-height:1.48;color:rgba(11,11,18,0.72);">${escapeHtml(s.text)}</p>
        </div>
        <div style="padding-top:12px;">
          <span class="mono" style="display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-radius:8px;border:1px solid #fff;background:rgba(255,255,255,0.88);padding:4px 8px;font-size:10px;color:rgba(11,11,18,0.78);">${escapeHtml(s.file)}</span>
        </div>
      </article>
    `).join("");
  }

  /* ==================== SLIDE 11: 4 STI HIERARCHIES ==================== */
  function initDomainStiGrid() {
    const host = document.getElementById("domain-sti-grid");
    if (!host) return;
    const hierarchies = [
      {
        num: "JERARQUÍA 01",
        base: "User",
        table: "users",
        discriminator: "role",
        file: "app/models/user.py",
        color: "#e12afb",
        deep: "#c026d3",
        note: "Clase base abstracta: User() directo lanza TypeError en __init__.",
        subclasses: [
          ['role = "student"', "StudentUser — Reseñas, listas, votos y reportes."],
          ['role = "business"', "BusinessUser — Alta de espacios propios y /posts."],
          ['role = "admin"', "AdminUser — Aprobación/rechazo y moderación."]
        ]
      },
      {
        num: "JERARQUÍA 02",
        base: "StudySpacesList",
        table: "study_spaces_lists",
        discriminator: "list_type",
        file: "app/models/study_spaces_list.py",
        color: "#7c3aed",
        deep: "#6d28d9",
        note: "Tabla única relacionada con StudySpace vía list_items.",
        subclasses: [
          ['list_type = "custom"', "StudySpacesList — Múltiples colecciones temáticas del estudiante."],
          ['list_type = "favorites"', "FavoritesList — Lista única que además suscribe al Observer."]
        ]
      },
      {
        num: "JERARQUÍA 03",
        base: "Report",
        table: "reports",
        discriminator: "type",
        file: "app/models/report.py",
        color: "#ff8904",
        deep: "#ea580c",
        note: "Clase base abstracta (TypeError) + Template Method resolve() y dismiss().",
        subclasses: [
          ['type = "review" / "post"', "ReviewReport / PostReport — Oculta reseña o novedad."],
          ['type = "study_space" / "user"', "StudySpaceReport / UserReport — Seguimiento o bloqueo."]
        ]
      },
      {
        num: "JERARQUÍA 04",
        base: "Notification",
        table: "notifications",
        discriminator: "channel",
        file: "app/models/notification.py",
        color: "#2dd4bf",
        deep: "#0d9488",
        note: "Clase base abstracta (TypeError): cada canal define su método send().",
        subclasses: [
          ['channel = "in_app"', "InAppNotification — Entrega a bandeja /notifications con read_at e is_read."],
          ["Extensible por canal", "NOTIFICATION_CLASSES permite sumar email/push sin cambiar servicios."]
        ]
      }
    ];

    host.innerHTML = hierarchies.map((h, idx) => `
      <article class="card lift flex-col rv" style="--i:${idx + 2};padding:18px 22px;justify-content:space-between;">
        <span class="wash" style="--c:${h.color};--wash-h:44%"></span>
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span class="num-badge">${escapeHtml(h.num)}</span>
            <span class="mono" style="border-radius:999px;background:rgba(255,255,255,0.9);padding:2px 10px;font-size:10.5px;font-weight:600;color:${h.deep};">${escapeHtml(h.table)} (${escapeHtml(h.discriminator)})</span>
          </div>
          <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:6px;">
            <h3 style="font-size:24px;font-weight:600;letter-spacing:-0.035em;">
              ${escapeHtml(h.base)}<span style="color:${h.deep};">.</span>
            </h3>
            <span class="mono" style="font-size:10.5px;color:rgba(11,11,18,0.58);">${escapeHtml(h.file)}</span>
          </div>
          <p style="margin-top:4px !important;font-size:12.5px;line-height:1.4;color:rgba(11,11,18,0.68);">${escapeHtml(h.note)}</p>
          <ul style="margin-top:10px;display:flex;flex-direction:column;gap:6px;">
            ${h.subclasses.map(([disc, desc]) => `
              <li style="border-radius:10px;border:1px solid rgba(11,11,18,0.06);background:rgba(255,255,255,0.88);padding:7px 10px;">
                <span class="mono" style="display:block;font-size:10.5px;font-weight:600;color:${h.deep};">${escapeHtml(disc)}</span>
                <span style="display:block;margin-top:1px;font-size:12px;line-height:1.35;color:rgba(11,11,18,0.8);">${escapeHtml(desc)}</span>
              </li>
            `).join("")}
          </ul>
        </div>
      </article>
    `).join("");
  }

  /* ==================== SLIDE 12: ENCAPSULATION & DYNAMIC RATING ==================== */
  function initDomainRatingCards() {
    const host = document.getElementById("domain-rating-cards");
    if (!host) return;
    const cards = [
      {
        num: "01 · CÁLCULO EN TIEMPO REAL",
        title: "Sin Columnas Cacheadas",
        color: "#e12afb",
        deep: "#c026d3",
        text: "StudySpace.calculate_average_rating() y count_reviews() filtran en memoria únicamente reseñas con is_visible=True. Evita desincronizaciones al editar, eliminar o moderar opiniones."
      },
      {
        num: "02 · TRANSICIONES ENCAPSULADAS",
        title: "Métodos hide() y restore()",
        color: "#2dd4bf",
        deep: "#0d9488",
        text: "Review encapsula los cambios de visibilidad mediante métodos de dominio explícitos, invocados por ReviewReport._apply_resolution() al aprobar un reporte sin eliminar historial."
      },
      {
        num: "03 · INVARIANTES SQL + PYDANTIC",
        title: "Propiedades e Integridad Referencial",
        color: "#7c3aed",
        deep: "#6d28d9",
        text: "PostgreSQL y SQLite garantizan rangos válidos (rating BETWEEN 1 AND 5) y unicidad por autor/espacio, mientras @property average_rating serializa directo hacia StudySpaceResponse."
      }
    ];

    host.innerHTML = cards.map((c, idx) => `
      <article class="card card-sm lift rv" style="--i:${idx + 3};padding:20px 24px;flex:1;display:flex;flex-direction:column;justify-content:center;">
        <span class="wash" style="--c:${c.color};--wash-h:48%"></span>
        <span class="num-badge">${escapeHtml(c.num)}</span>
        <h3 style="margin-top:6px !important;font-size:23px;font-weight:600;letter-spacing:-0.03em;">
          ${escapeHtml(c.title)}<span style="margin-left:0.12em;color:${c.deep};">.</span>
        </h3>
        <p style="margin-top:8px !important;font-size:14.5px;line-height:1.5;color:rgba(11,11,18,0.72);">${escapeHtml(c.text)}</p>
      </article>
    `).join("");
  }

  /* ==================== SLIDE 13: TEMPLATE METHOD SUBCLASSES ==================== */
  function initTemplateSubclassesGrid() {
    const host = document.getElementById("tpl-subclasses-grid");
    if (!host) return;
    const subclasses = [
      {
        name: "ReviewReport",
        typeVal: 'type = "review"',
        loc: "app/models/report.py:141",
        color: "#ff8904",
        deep: "#ea580c",
        action: "_apply_resolution() invoca self.review.hide() → review.is_visible = False. La reseña deja de listarse y se excluye del promedio del espacio."
      },
      {
        name: "PostReport",
        typeVal: 'type = "post"',
        loc: "app/models/report.py:157",
        color: "#e12afb",
        deep: "#c026d3",
        action: "_apply_resolution() invoca self.post.hide() → post.is_active = False. La novedad comercial se retira de los listados públicos."
      },
      {
        name: "StudySpaceReport",
        typeVal: 'type = "study_space"',
        loc: "app/models/report.py:162",
        color: "#7c3aed",
        deep: "#6d28d9",
        action: "Hereda el cierre completo resolve() / dismiss() con hook base no destructivo para que administración revise y corrija datos del espacio."
      },
      {
        name: "UserReport",
        typeVal: 'type = "user"',
        loc: "app/models/report.py:189",
        color: "#2dd4bf",
        deep: "#0d9488",
        action: "_apply_resolution() marca self.reported_user.is_active = False. El guard de get_current_user rechaza futuros logins y tokens JWT."
      }
    ];

    host.innerHTML = subclasses.map((s, idx) => `
      <article class="card card-sm lift flex-col rv" style="--i:${idx + 3};padding:22px;justify-content:space-between;">
        <span class="wash" style="--c:${s.color};--wash-h:52%"></span>
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <span class="mono" style="font-size:10.5px;font-weight:600;white-space:nowrap;color:${s.deep};">${escapeHtml(s.typeVal)}</span>
            <span class="mono" style="border-radius:999px;background:rgba(255,255,255,0.9);padding:2px 9px;font-size:10px;white-space:nowrap;color:rgba(11,11,18,0.65);">${escapeHtml(s.loc)}</span>
          </div>
          <h3 style="margin-top:8px !important;font-size:23px;font-weight:600;letter-spacing:-0.03em;">
            ${escapeHtml(s.name)}<span style="color:${s.deep};">.</span>
          </h3>
          <p style="margin-top:8px !important;font-size:13.5px;line-height:1.48;color:rgba(11,11,18,0.74);">${escapeHtml(s.action)}</p>
        </div>
      </article>
    `).join("");
  }

  /* ==================== SLIDE 14: PATTERNS OVERVIEW (NO FLIPS) ==================== */
  function initPatternsCardsGrid() {
    const host = document.getElementById("patterns-cards-grid");
    if (!host) return;
    const patterns = [
      {
        num: "PATRÓN 01",
        status: "IMPLEMENTADO · app/repositories/",
        title: "Repository Pattern",
        color: "#2dd4bf",
        deep: "#0d9488",
        definition: "Encapsula las consultas SQLAlchemy (User, StudySpace, Review, StudySpacesList, Post, Report) detrás de métodos de dominio.",
        benefit: "Impacto: la lógica de negocio nunca escribe SQL acoplado al motor y soporta PostgreSQL en Render o SQLite aislado en tests."
      },
      {
        num: "PATRÓN 02",
        status: "IMPLEMENTADO · app/services/",
        title: "Service Layer",
        color: "#7c3aed",
        deep: "#6d28d9",
        definition: "Separa validaciones de dominio y propiedad de recursos de la capa HTTP declarada en los routers FastAPI.",
        benefit: 'Impacto: invariantes como "un estudiante no puede votar su propia reseña" o "máximo 5 fotos" residen en un solo punto reutilizable.'
      },
      {
        num: "PATRÓN 03",
        status: "IMPLEMENTADO · StudySpace.observers",
        title: "Observer Pattern",
        color: "#ff8904",
        deep: "#ea580c",
        definition: "Guardar un espacio en FavoritesList suscribe al estudiante; StudySpace.notify_observers() dispara PromotionNotificationService ante novedades o cambios aprobados.",
        benefit: "Impacto: funciona en producción con bandeja /notifications, preferencias por evento (NotificationPreference) y 33 tests dedicados."
      },
      {
        num: "PATRÓN 04",
        status: "IMPLEMENTADO (InApp) · NotificationService",
        title: "Template + Canal Polimórfico",
        color: "#e12afb",
        deep: "#c026d3",
        definition: "NotificationService.send_notifications() define el flujo fijo (preferencias → crear → send() → guardar) con 4 servicios concretos por dominio.",
        benefit: "Extensibilidad: NOTIFICATION_CLASSES[channel] instancia InAppNotification hoy y permite sumar EmailNotification sin tocar el negocio."
      }
    ];

    host.innerHTML = patterns.map((p, idx) => `
      <article class="card lift flex-col rv" style="--i:${idx + 2};padding:26px;justify-content:space-between;">
        <span class="wash" style="--c:${p.color};--wash-h:48%"></span>
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <span class="num-badge">${escapeHtml(p.num)}</span>
            <span class="mono" style="border-radius:999px;background:rgba(255,255,255,0.92);padding:4px 12px;font-size:11px;font-weight:600;color:${p.deep};">${escapeHtml(p.status)}</span>
          </div>
          <h3 style="margin-top:10px !important;font-size:28px;font-weight:600;letter-spacing:-0.035em;">
            ${escapeHtml(p.title)}<span style="color:${p.deep};">.</span>
          </h3>
          <p style="margin-top:10px !important;font-size:15px;line-height:1.5;color:rgba(11,11,18,0.78);">${escapeHtml(p.definition)}</p>
        </div>
        <div style="margin-top:12px;border-radius:12px;background:rgba(255,255,255,0.86);border:1px solid rgba(11,11,18,0.06);padding:11px 14px;font-size:13.5px;line-height:1.45;color:rgba(11,11,18,0.74);">
          ${escapeHtml(p.benefit)}
        </div>
      </article>
    `).join("");
  }

  /* ==================== SLIDE 16: REST ROUTERS GRID (NO TABS) ==================== */
  function initRoutersCardsGrid() {
    const host = document.getElementById("routers-cards-grid");
    if (!host) return;
    const routers = [
      {
        prefix: "/users",
        tag: "auth & perfiles",
        color: "#ff8904",
        deep: "#ea580c",
        endpoints: [
          ["POST", "/users/register/student", "Alta Student (201)"],
          ["POST", "/users/register/business", "Alta Business (201)"],
          ["POST", "/users/login", "Emite JWT (200)"],
          ["GET", "/users/me", "Perfil actual (200)"]
        ]
      },
      {
        prefix: "/spaces",
        tag: "espacios & estados",
        color: "#7c3aed",
        deep: "#6d28d9",
        endpoints: [
          ["GET", "/spaces/", "Filtros públicos"],
          ["POST/PUT", "/spaces/ · /{id}", "Alta / re-revisión"],
          ["GET", "/spaces/mine", "Estado del negocio"],
          ["GET", "/spaces/pending", "Pendientes (Admin)"],
          ["PATCH", "/spaces/{id}/approve|reject", "Aprobar o rechazar"]
        ]
      },
      {
        prefix: "/reviews",
        tag: "reseñas & votos",
        color: "#e12afb",
        deep: "#c026d3",
        endpoints: [
          ["GET", "/reviews/space/{id}", "Reseñas visibles"],
          ["POST", "/reviews/space/{id}", "Reseña + 5 fotos"],
          ["PUT", "/reviews/{id}", "Editar propia"],
          ["PUT", "/reviews/{id}/vote", "Voto de utilidad"]
        ]
      },
      {
        prefix: "/lists & /favorites",
        tag: "colecciones STI",
        color: "#2dd4bf",
        deep: "#0d9488",
        endpoints: [
          ["GET/POST", "/lists", "Listas custom"],
          ["POST/DEL", "/lists/{id}/spaces", "Agregar / quitar"],
          ["GET/POST", "/favorites", "Favoritos (Observer)"],
          ["DELETE", "/favorites/{space_id}", "Desuscribir"]
        ]
      },
      {
        prefix: "/posts",
        tag: "novedades negocio",
        color: "#facc15",
        deep: "#ca8a04",
        endpoints: [
          ["GET", "/posts/space/{id}", "Activos del espacio"],
          ["GET", "/posts/mine", "Propios del negocio"],
          ["POST", "/posts/space/{id}", "Crear (notifica favs)"],
          ["PUT/DEL", "/posts/{id}", "Editar o eliminar"]
        ]
      },
      {
        prefix: "/reports",
        tag: "moderación",
        color: "#fb7185",
        deep: "#e11d48",
        endpoints: [
          ["POST", "/reports/{type}/{id}", "Reportar entidad"],
          ["GET", "/reports", "Filtrar (Admin)"],
          ["PUT", "/reports/{id}/resolve", "Template Method"],
          ["PUT", "/reports/{id}/dismiss", "Descartar reporte"]
        ]
      },
      {
        prefix: "/notifications",
        tag: "bandeja in-app",
        color: "#74d4ff",
        deep: "#0284c7",
        endpoints: [
          ["GET", "/notifications", "Bandeja / unread"],
          ["GET", "/notifications/unread-count", "Contador campana"],
          ["GET/PUT", "/notifications/preferences", "Configurar eventos"],
          ["PUT", "/notifications/read-all · /{id}/read", "Marcar leídas"]
        ]
      },
      {
        prefix: "/health & /docs",
        tag: "monitoreo & openapi",
        color: "#9592f5",
        deep: "#4f46e5",
        endpoints: [
          ["GET", "/health", '{"status": "ok"}'],
          ["GET", "/docs", "Swagger UI vivo"],
          ["GET", "/redoc", "ReDoc API spec"]
        ]
      }
    ];

    function methodColor(m) {
      if (m.includes("GET")) return "#0284c7";
      if (m.includes("POST")) return "#0d9488";
      if (m.includes("DEL")) return "#e11d48";
      return "#7c3aed";
    }

    host.innerHTML = routers.map((r, idx) => `
      <article class="card card-sm lift flex-col rv" style="--i:${idx + 2};padding:15px 16px;">
        <span class="wash" style="--c:${r.color};--wash-h:42%"></span>
        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:6px;">
          <h3 class="mono" style="font-size:17px;font-weight:600;letter-spacing:-0.03em;white-space:nowrap;">
            ${escapeHtml(r.prefix)}<span class="dot" style="--c:${r.deep}"></span>
          </h3>
          <span class="mono" style="font-size:9.5px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(11,11,18,0.48);white-space:nowrap;">${escapeHtml(r.tag)}</span>
        </div>
        <ul style="margin-top:10px;display:flex;flex-direction:column;gap:5px;">
          ${r.endpoints.map(([method, path, desc]) => `
            <li style="display:flex;align-items:center;gap:6px;border-radius:9px;border:1px solid rgba(11,11,18,0.06);background:rgba(255,255,255,0.9);padding:5px 8px;">
              <span class="mono" style="width:58px;flex-shrink:0;border-radius:5px;padding:2px 0;text-align:center;font-size:9.5px;font-weight:600;color:#fff;background:${methodColor(method)};">${escapeHtml(method)}</span>
              <span class="mono" style="font-size:10.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(path)}">${escapeHtml(path)}</span>
              <span style="margin-left:auto;font-size:10px;color:rgba(11,11,18,0.62);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(desc)}">${escapeHtml(desc)}</span>
            </li>
          `).join("")}
        </ul>
      </article>
    `).join("");
  }

  /* ==================== SLIDES 17 & 18: QA PYTEST + DEPLOY ==================== */
  function initQaSlides() {
    const barsHost = document.getElementById("qa-bars-list");
    if (barsHost) {
      const suites = [
        { file: "tests/test_reports.py", count: 39, color: "#ff8904", desc: "Reportes polimórficos (reseñas, posts, espacios, usuarios), resolve, dismiss y alertas." },
        { file: "tests/test_lists.py", count: 35, color: "#2dd4bf", desc: "Listas personalizadas, FavoritesList, duplicados y permisos por propietario." },
        { file: "tests/test_notifications.py", count: 33, color: "#e12afb", desc: "Observer en StudySpace, bandeja /notifications, preferencias y Template Method." },
        { file: "tests/test_reviews.py", count: 27, color: "#7c3aed", desc: "CRUD de reseñas, límite de 5 imágenes, promedio dinámico y votos de utilidad." },
        { file: "tests/test_posts.py", count: 26, color: "#74d4ff", desc: "CRUD de publicaciones de negocios, visibilidad y notificación a favoritos." },
        { file: "tests/test_auth.py", count: 26, color: "#fb7185", desc: "Registro estudiante/negocio, login JWT, guards de rol y desactivación." },
        { file: "tests/test_study_spaces.py + models + health", count: 15, color: "#facc15", desc: "Filtros, aprobar/rechazar y re-pendiente al editar (7), STI/TypeError (6), /health (2)." }
      ];

      barsHost.innerHTML = suites.map((s, idx) => `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:12.5px;">
            <span class="mono" style="font-weight:600;">${escapeHtml(s.file)}</span>
            <span class="mono" style="font-size:11.5px;color:rgba(11,11,18,0.62);">${s.count} tests</span>
          </div>
          <div style="margin-top:4px;height:10px;border-radius:999px;background:rgba(11,11,18,0.06);overflow:hidden;">
            <span class="grow-bar" style="width:${(s.count / 39) * 100}%;background:${s.color};--delay:${220 + idx * 90}ms;"></span>
          </div>
          <p style="margin-top:3px !important;font-size:11.5px;color:rgba(11,11,18,0.56);">${escapeHtml(s.desc)}</p>
        </div>
      `).join("");
    }

    const deployHost = document.getElementById("qa-deploy-grid");
    if (deployHost) {
      const items = [
        { title: "GitHub Actions CI", sub: ".github/workflows/tests.yml", color: "#ff8904", deep: "#ea580c", icon: "git", lines: ["Se ejecuta automáticamente en cada push y Pull Request.", "Instala dependencias y corre pytest -v sobre los 201 tests."] },
        { title: "Docker Auto-Inicializable", sub: "Dockerfile & docker-compose.yml", color: "#74d4ff", deep: "#0284c7", icon: "cpu", lines: ["Imagen Python 3.12-slim que ejecuta alembic upgrade head al iniciar.", "Corre crear_admin.py --auto y levanta Uvicorn en el puerto 8000."] },
        { title: "PostgreSQL · Neon & SQLite", sub: "app/database/session.py", color: "#7c3aed", deep: "#6d28d9", icon: "db", lines: ["Normaliza automáticamente postgres:// a postgresql+psycopg://.", "Base productiva en Neon (PostgreSQL) y SQLite aislado en desarrollo/tests."] },
        { title: "Deploy en Render + Web", sub: "study-spaces-rest-api.onrender.com", color: "#2dd4bf", deep: "#0d9488", icon: "globe", lines: ["API productiva conectada a PostgreSQL en Neon con 8 routers.", "Integrada con las 10 pantallas del cliente web en frontend/."] }
      ];
      deployHost.innerHTML = items.map((item, idx) => `
        <article class="card lift flex-col rv" style="--i:${idx + 2};padding:28px;">
          <span class="wash" style="--c:${item.color};--wash-h:52%"></span>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span class="num-badge">0${idx + 1}</span>
            <span class="icon-box" style="--ic:${item.deep};">${ICONS[item.icon]}</span>
          </div>
          <p class="mono" style="margin-top:16px !important;font-size:11px;color:rgba(11,11,18,0.48);">${escapeHtml(item.sub)}</p>
          <h3 style="margin-top:6px !important;font-size:24px;line-height:1.1;font-weight:600;letter-spacing:-0.035em;">
            ${escapeHtml(item.title)}<span style="color:${item.deep};">.</span>
          </h3>
          <ul style="margin-top:16px;display:flex;flex-direction:column;gap:8px;font-size:14.5px;line-height:1.5;color:rgba(11,11,18,0.68);">
            ${item.lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}
          </ul>
        </article>
      `).join("");
    }
  }

  /* ==================== SLIDE 19: DEMO GUIDE (APP APARTE) ==================== */
  function initDemoGuideCards() {
    const host = document.getElementById("demo-guide-cards");
    if (!host) return;
    const guides = [
      {
        num: "01 · FLUJO ESTUDIANTE & OBSERVER",
        title: "Descubrir, Reseñar y Alertas",
        icon: "search",
        color: "#7c3aed",
        deep: "#6d28d9",
        pill: "StudentUser · index.html → detalle.html",
        steps: [
          "Explorar frontend/index.html filtrando por WiFi, enchufes y ruido, y publicar una reseña en detalle.html.",
          "Guardar el espacio en favoritos (se suscribe como Observer) y recibir notificaciones cuando el negocio publica un post.",
          "Abrir la bandeja in-app (/notifications) para leer alertas, ver unread-count y ajustar preferencias."
        ]
      },
      {
        num: "02 · FLUJO NEGOCIO & ESTADOS",
        title: "Alta, Rechazo y Re-envío",
        icon: "layout",
        color: "#ff8904",
        deep: "#ea580c",
        pill: "BusinessUser · mis-espacios.html",
        steps: [
          "Crear un espacio en mis-espacios.html (POST /spaces/): figura como Pendiente y notifica a los admins.",
          "Tras un rechazo del admin, verificar el badge ✕ Rechazado y la notificación in-app recibida.",
          "Editar el espacio rechazado (PUT /spaces/{id}): vuelve automáticamente a Pendiente para nueva revisión."
        ]
      },
      {
        num: "03 · FLUJO ADMIN & SWAGGER",
        title: "Rechazar, Aprobar y Moderar",
        icon: "shield",
        color: "#2dd4bf",
        deep: "#0d9488",
        pill: "AdminUser · admin.html → Swagger /docs",
        steps: [
          "En admin.html, probar primero PATCH /spaces/{id}/reject y luego aprobar el espacio re-enviado (/approve).",
          "Verificar en /docs que el local aparece en GET /spaces/ y dispara alertas de aprobación y Observer.",
          "Resolver un reporte (PUT /reports/{id}/resolve) disparando Template Method y ModerationNotificationService."
        ]
      }
    ];

    host.innerHTML = guides.map((g, idx) => `
      <article class="card lift flex-col rv" style="--i:${idx + 2};padding:26px;justify-content:space-between;">
        <span class="wash" style="--c:${g.color};--wash-h:50%"></span>
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <span class="num-badge">${escapeHtml(g.num)}</span>
            <span class="icon-box" style="--ic:${g.deep};">${ICONS[g.icon]}</span>
          </div>
          <h3 style="margin-top:10px !important;font-size:25px;font-weight:600;letter-spacing:-0.035em;">
            ${escapeHtml(g.title)}<span style="color:${g.deep};">.</span>
          </h3>
          <ol style="margin-top:14px;display:flex;flex-direction:column;gap:10px;font-size:14.2px;line-height:1.48;color:rgba(11,11,18,0.74);">
            ${g.steps.map((st, sIdx) => `<li><span class="mono" style="color:${g.deep};font-weight:700;">${sIdx + 1}.</span> ${escapeHtml(st)}</li>`).join("")}
          </ol>
        </div>
        <div style="padding-top:12px;">
          <span class="mono" style="display:inline-block;border-radius:8px;border:1px solid #fff;background:rgba(255,255,255,0.88);padding:5px 11px;font-size:11.5px;color:rgba(11,11,18,0.8);">${escapeHtml(g.pill)}</span>
        </div>
      </article>
    `).join("");
  }

  /* ==================== SLIDES 20 & 22: TAKEAWAYS & CLOSING ==================== */
  function initTakeawaysAndClosing() {
    const fanHost = document.getElementById("takeaways-fan");
    if (fanHost) {
      const items = [
        { title: "Arquitectura en Capas", text: "Separación estricta Router → Service → Repository → Model que desacopla las reglas de negocio de FastAPI y SQLAlchemy.", color: "#ff8904", deep: "#ea580c" },
        { title: "POO y Polimorfismo Real", text: "4 jerarquías Single-Table Inheritance (User, StudySpacesList, Report, Notification) + Template Method en Report y NotificationService.", color: "#e12afb", deep: "#c026d3" },
        { title: "Calidad y Automatización", text: "201 tests automatizados en Pytest, 8 migraciones Alembic sobre PostgreSQL/Neon, CI en GitHub Actions y Docker.", color: "#7c3aed", deep: "#6d28d9" },
        { title: "Notificaciones y Estados", text: "Observer y bandeja /notifications en producción, más ciclo completo Pendiente / Aprobado / Rechazado con re-envío.", color: "#2dd4bf", deep: "#0d9488" }
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
                ${escapeHtml(t.title)}<span style="margin-left:0.15em;color:${t.deep};">.</span>
              </h3>
              <p style="margin-top:12px !important;font-size:14.5px;line-height:1.5;color:rgba(11,11,18,0.66);">${escapeHtml(t.text)}</p>
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
        { title: "Cliente Web Real en Local (CORS :5500)", url: "/frontend/index.html", sub: "http://127.0.0.1:5500/frontend/index.html" },
        { title: "Paso 1 · Flujo Estudiante & Alertas (en app aparte)", url: null, sub: "Filtrar espacios → detalle.html → reseña ★ → favoritos (Observer) → bandeja /notifications" },
        { title: "Paso 2 · Flujo Negocio & Admin (en app aparte)", url: null, sub: "Alta espacio → rechazar en admin.html → editar (vuelve a Pendiente) → aprobar → reporte" },
        { title: "Repositorio GitHub · Study Spaces REST API", url: "https://github.com/titiBFG/study-spaces-rest-api", sub: "github.com/titiBFG/study-spaces-rest-api" }
      ];
      linksHost.innerHTML = links.map((l, idx) => {
        const tag = l.url ? "a" : "div";
        const attrs = l.url ? `href="${l.url}" target="_blank" rel="noreferrer"` : "";
        return `
          <${tag} ${attrs} class="card card-sm rv" style="--i:${idx + 2};display:flex;align-items:center;gap:16px;border-radius:16px;padding:14px 20px;">
            <span class="mono" style="font-size:11px;color:rgba(11,11,18,0.42);">0${idx + 1}</span>
            <span style="flex:1;min-width:0;">
              <span style="display:block;font-size:16px;font-weight:600;letter-spacing:-0.02em;">${escapeHtml(l.title)}</span>
              <span class="mono" style="display:block;font-size:12px;color:rgba(11,11,18,0.5);">${escapeHtml(l.sub)}</span>
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
    const backdropEl = document.getElementById("deck-backdrop");
    const indexModal = document.getElementById("index-modal");
    const indexGrid = document.getElementById("index-grid");
    const chapterBarsEl = document.getElementById("chrome-chapter-bars");
    const sepEl = document.getElementById("chrome-sep");
    const chapterPill = document.getElementById("chrome-chapter");
    const chapterDot = document.getElementById("chrome-chapter-dot");
    const chapterLabel = document.getElementById("chrome-chapter-label");
    const counterEl = document.getElementById("chrome-counter");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const btnIndex = document.getElementById("btn-index");
    const btnCloseIndex = document.getElementById("btn-close-index");
    const btnFullscreen = document.getElementById("btn-fullscreen");
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
          title="${escapeHtml(ch.n)} ${escapeHtml(ch.title)}" aria-label="Ir a ${escapeHtml(ch.title)}">
          <span class="chapter-bar-track">
            <span class="chapter-bar-fill" data-bar-fill="${g.chapter}"></span>
          </span>
        </button>
      `;
    }).join("");

    groups.forEach((g) => {
      g.fillEl = chapterBarsEl.querySelector(`[data-bar-fill="${g.chapter}"]`);
    });

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
              <span class="num-badge">${escapeHtml(ch.n)}</span>
              <p class="overview-card-title">${escapeHtml(ch.title)}<span style="color:${ch.deep};">.</span></p>
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

      if (backdropEl) {
        backdropEl.dataset.bg = (slide && slide.dataset.bg) || "clean";
      }

      counterEl.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      const showChapter = ch.id !== "intro";
      sepEl.hidden = !showChapter;
      chapterPill.hidden = !showChapter;
      if (showChapter) {
        chapterDot.style.background = ch.color;
        chapterLabel.textContent = `${ch.n} ${ch.title}`;
      }

      groups.forEach((g) => {
        const fill = g.fillEl;
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
      btnFullscreen.classList.toggle("is-fullscreen", isFs);
      btnFullscreen.setAttribute("aria-pressed", String(isFs));
      const label = isFs ? "Salir de pantalla completa (F)" : "Pantalla completa (F)";
      btnFullscreen.setAttribute("aria-label", label);
      btnFullscreen.title = label;
    }

    syncFullscreenIcon();

    initAgendaFan((chId) => {
      const targetIdx = slides.findIndex((s) => s.dataset.chapter === chId);
      if (targetIdx >= 0) Reveal.slide(targetIdx);
    });
    initProductOverviewGrid();
    initRolesCardsList();
    initMvpGrid();
    initMvpFrontendGrid();
    initArchLayers();
    initStackGrid();
    initRequestLifecycleCards();
    initDomainStiGrid();
    initDomainRatingCards();
    initTemplateSubclassesGrid();
    initPatternsCardsGrid();
    initRoutersCardsGrid();
    initQaSlides();
    initDemoGuideCards();
    initTakeawaysAndClosing();

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
      transitionSpeed: "default",
      keyboardCondition: (event) => {
        if (isIndexOpen()) return false;
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
    document.addEventListener("visibilitychange", () => {
      document.body.classList.toggle("is-hidden", document.hidden);
    });
    reducedMotion.addEventListener("change", () => {
      Reveal.configure({ transition: reducedMotion.matches ? "none" : "fade" });
    });
  });
})();
