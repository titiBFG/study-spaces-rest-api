/* ==========================================================================
   Demo Live Controller (#demo-live)
   Controls real frontend/index.html inside a same-origin iframe via native
   Reveal.js slide/fragment events.
   - Text first -> Fragment 1 enters iframe into usable slide area (no native FS)
   - Fragment 2 applies real filter controls (WiFi + Ruido Bajo) with focus ring
   - Fragment 3 clears filters via real #limpiarFiltros control
   - Discreet "Explorar app / Volver a presentación" & recoverable "Reintentar"
   - Pauses background .mesh animations while app covers the slide
   - Safe same-origin key forwarding only in presentation mode & outside inputs
   ========================================================================== */

(function () {
  "use strict";

  const APP_URL = "/frontend/index.html";
  const LOAD_TIMEOUT_MS = 9000;

  class DemoLiveController {
    constructor(revealApi) {
      this.reveal = revealApi;
      this.section = document.getElementById("demo-live");
      this.root = document.getElementById("demo-live-root");
      this.intro = document.getElementById("demo-intro");
      this.stage = document.getElementById("demo-stage");
      this.frameWrap = document.getElementById("demo-frame-wrap");
      this.iframe = document.getElementById("demo-iframe");
      this.stepPill = document.getElementById("demo-step-pill");
      this.stepDesc = document.getElementById("demo-step-desc");
      this.exploreBtn = document.getElementById("demo-explore-btn");
      this.retryBtn = document.getElementById("demo-retry-btn");
      this.overlay = document.getElementById("demo-overlay");
      this.overlayLabel = document.getElementById("demo-overlay-label");
      this.overlayTitle = document.getElementById("demo-overlay-title");
      this.overlayDesc = document.getElementById("demo-overlay-desc");
      this.overlayRetryBtn = document.getElementById("demo-overlay-retry");
      this.guideRing = document.getElementById("demo-guide-ring");
      this.guideTag = document.getElementById("demo-guide-tag");
      this.statusRegion = document.getElementById("a11y-status");

      this.isExploring = false;
      this.hasLoaded = false;
      this.isLoading = false;
      this.requestId = 0;
      this.loadTimer = null;
      this.readyObserver = null;
      this.iframeKeyHandler = null;
      this.currentStep = 0; // 0 = intro, 1 = enter, 2 = filter-quiet, 3 = reset-filters

      if (!this.section || !this.root) return;
      this.bindControls();
    }

    bindControls() {
      this.exploreBtn.addEventListener("click", () => {
        if (this.isExploring) {
          this.exitExploreMode();
        } else {
          this.enterExploreMode();
        }
      });

      const handleRetry = () => this.reloadIframe(true);
      this.retryBtn.addEventListener("click", handleRetry);
      this.overlayRetryBtn.addEventListener("click", handleRetry);

      window.addEventListener("resize", () => {
        if (this.isOnDemoSlide() && this.currentStep >= 1 && !this.isExploring) {
          this.repositionGuideForStep(this.currentStep);
        }
      });
    }

    isOnDemoSlide() {
      return this.reveal.getCurrentSlide() === this.section;
    }

    isExploringActive() {
      return this.isOnDemoSlide() && this.isExploring;
    }

    getFragmentStep() {
      if (!this.isOnDemoSlide()) return 0;
      const fragments = Array.from(this.section.querySelectorAll(".demo-fragment-track .fragment"));
      let visibleCount = 0;
      fragments.forEach((frag) => {
        if (frag.classList.contains("visible")) visibleCount += 1;
      });
      return visibleCount;
    }

    syncFromReveal() {
      if (!this.section) return;
      const onSlide = this.isOnDemoSlide();
      const step = onSlide ? this.getFragmentStep() : 0;
      this.currentStep = step;

      if (!onSlide) {
        this.clearPendingWork();
        this.hideGuideRing();
        this.isExploring = false;
        this.updateExploreButton();
        document.body.classList.remove("demo-active");
        this.setStageMode("intro");
        return;
      }

      if (step === 0) {
        this.clearPendingWork();
        this.hideGuideRing();
        this.isExploring = false;
        this.updateExploreButton();
        document.body.classList.remove("demo-active");
        this.setStageMode("intro");
        return;
      }

      // Fragment >= 1: slide app into usable area and pause background mesh animations
      document.body.classList.add("demo-active");
      this.setStageMode("app");

      if (!this.hasLoaded && !this.isLoading) {
        this.reloadIframe(false);
      } else if (this.hasLoaded && !this.isExploring) {
        this.applyGuidedStep(step);
      } else {
        this.updateToolbarCopy(step);
      }
    }

    setStageMode(mode) {
      const isApp = mode === "app";
      this.root.setAttribute("data-stage", isApp ? "app" : "intro");

      this.intro.setAttribute("aria-hidden", isApp ? "true" : "false");
      this.stage.setAttribute("aria-hidden", isApp ? "false" : "true");

      if (isApp) {
        this.intro.setAttribute("inert", "");
        this.stage.removeAttribute("inert");
      } else {
        this.stage.setAttribute("inert", "");
        this.intro.removeAttribute("inert");
      }
    }

    clearPendingWork() {
      this.requestId += 1;
      if (this.loadTimer) {
        clearTimeout(this.loadTimer);
        this.loadTimer = null;
      }
      if (this.readyObserver) {
        this.readyObserver.disconnect();
        this.readyObserver = null;
      }
    }

    reloadIframe(forceCacheBust) {
      this.clearPendingWork();
      const token = this.requestId;
      this.isLoading = true;
      this.hasLoaded = false;
      this.hideGuideRing();

      this.showOverlay(
        "Cargando aplicación real",
        "Conectando con frontend/index.html…",
        "La app consulta la API REST en producción. Si demora, podés usar Reintentar."
      );
      this.updateToolbarCopy(this.currentStep);

      const onLoad = () => {
        if (token !== this.requestId) return;
        this.iframe.removeEventListener("load", onLoad);
        this.iframe.removeEventListener("error", onError);
        if (this.loadTimer) {
          clearTimeout(this.loadTimer);
          this.loadTimer = null;
        }
        this.isLoading = false;

        // Validate same-origin access cleanly
        let doc = null;
        try {
          if (this.iframe.contentWindow && this.iframe.contentWindow.location.origin === window.location.origin) {
            doc = this.iframe.contentDocument;
          }
        } catch {
          doc = null;
        }

        if (!doc || !doc.body || !doc.getElementById("listaEspacios")) {
          this.showOverlay(
            "No se pudo verificar la app",
            "No se cargó /frontend/index.html correctamente",
            "Asegurate de abrir la presentación mediante python presentation/servidor.py y probá Reintentar.",
            true
          );
          return;
        }

        this.hasLoaded = true;
        this.hideOverlay();
        this.attachSafeIframeKeyForwarding(doc);
        if (this.isOnDemoSlide() && this.currentStep >= 1 && !this.isExploring) {
          this.applyGuidedStep(this.currentStep);
        }
      };

      const onError = () => {
        if (token !== this.requestId) return;
        this.iframe.removeEventListener("load", onLoad);
        this.iframe.removeEventListener("error", onError);
        this.isLoading = false;
        this.showOverlay(
          "Error de carga",
          "No se pudo abrir /frontend/index.html",
          "Verificá que el servidor local siga activo y presioná Reintentar.",
          true
        );
      };

      this.iframe.addEventListener("load", onLoad);
      this.iframe.addEventListener("error", onError);

      this.loadTimer = setTimeout(() => {
        if (token !== this.requestId) return;
        this.isLoading = false;
        this.showOverlay(
          "Tiempo de espera superado",
          "La vista embebida tardó demasiado en responder",
          "Podés reintentar la carga o abrir la aplicación en una pestaña separada.",
          true
        );
      }, LOAD_TIMEOUT_MS);

      const targetSrc = forceCacheBust ? `${APP_URL}?reload=${Date.now()}` : APP_URL;
      this.iframe.src = targetSrc;
    }

    attachSafeIframeKeyForwarding(doc) {
      if (this.iframeKeyHandler) {
        try {
          doc.removeEventListener("keydown", this.iframeKeyHandler);
        } catch {
          // ignore stale document
        }
      }

      this.iframeKeyHandler = (event) => {
        if (this.isExploring) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;

        const target = event.target;
        const tag = target && target.tagName ? target.tagName.toUpperCase() : "";
        const isEditable =
          (target && target.isContentEditable) ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(tag);
        if (isEditable) return;

        if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
          event.preventDefault();
          this.reveal.next();
        } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
          event.preventDefault();
          this.reveal.prev();
        }
      };

      doc.addEventListener("keydown", this.iframeKeyHandler);
    }

    getAppDocument() {
      try {
        if (
          this.iframe.contentWindow &&
          this.iframe.contentWindow.location.origin === window.location.origin &&
          this.iframe.contentDocument
        ) {
          return this.iframe.contentDocument;
        }
      } catch {
        return null;
      }
      return null;
    }

    waitForSpacesReady(doc, token, callback) {
      const listEl = doc.getElementById("listaEspacios");
      if (!listEl) return;

      const isReady = () =>
        listEl.children.length > 0 || (listEl.textContent || "").trim().length > 0;

      if (isReady()) {
        callback();
        return;
      }

      if (this.readyObserver) {
        this.readyObserver.disconnect();
      }
      this.readyObserver = new MutationObserver(() => {
        if (token !== this.requestId) {
          this.readyObserver.disconnect();
          return;
        }
        if (isReady()) {
          this.readyObserver.disconnect();
          this.readyObserver = null;
          callback();
        }
      });
      this.readyObserver.observe(listEl, { childList: true, characterData: true, subtree: true });
    }

    applyGuidedStep(step) {
      this.updateToolbarCopy(step);
      const doc = this.getAppDocument();
      const win = this.iframe.contentWindow;
      if (!doc || !win) return;

      // Ensure we are back on index.html if previously navigated away during exploration
      if (!win.location.pathname.endsWith("/frontend/index.html") && !win.location.pathname.endsWith("/frontend/")) {
        this.reloadIframe(false);
        return;
      }

      const token = this.requestId;

      if (step === 1) {
        this.hideGuideRing();
        this.resetFiltersInApp(doc, win);
        try {
          win.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
          win.scrollTo(0, 0);
        }
        return;
      }

      if (step === 2) {
        this.waitForSpacesReady(doc, token, () => {
          if (token !== this.requestId || this.isExploring || this.currentStep !== 2) return;
          const wifi = doc.getElementById("wifi");
          const enchufes = doc.getElementById("enchufes");
          const ruido = doc.getElementById("ruido");
          const buscar = doc.getElementById("buscar");
          if (buscar) buscar.value = "";
          if (wifi) wifi.checked = true;
          if (enchufes) enchufes.checked = false;
          if (ruido) ruido.value = "low";

          // Invoke the real app filter function directly (deterministic API, no synthetic coordinate clicks)
          if (typeof win.filtrarEspacios === "function") {
            win.filtrarEspacios();
          }

          const aside = doc.querySelector("aside.filtros");
          if (aside) {
            aside.scrollIntoView({ block: "center", behavior: "smooth" });
            requestAnimationFrame(() => this.positionGuideRing(aside, "Filtros activos: WiFi + Ruido Bajo"));
          }
        });
        return;
      }

      if (step >= 3) {
        this.waitForSpacesReady(doc, token, () => {
          if (token !== this.requestId || this.isExploring || this.currentStep < 3) return;
          this.resetFiltersInApp(doc, win);
          const results = doc.querySelector("section.resultados");
          if (results) {
            results.scrollIntoView({ block: "start", behavior: "smooth" });
            requestAnimationFrame(() => this.positionGuideRing(results, "Catálogo restaurado · listo para explorar"));
          }
        });
      }
    }

    resetFiltersInApp(doc, win) {
      const buscar = doc.getElementById("buscar");
      const wifi = doc.getElementById("wifi");
      const enchufes = doc.getElementById("enchufes");
      const ruido = doc.getElementById("ruido");
      if (buscar) buscar.value = "";
      if (wifi) wifi.checked = false;
      if (enchufes) enchufes.checked = false;
      if (ruido) ruido.value = "";
      if (typeof win.filtrarEspacios === "function") {
        win.filtrarEspacios();
      }
    }

    repositionGuideForStep(step) {
      const doc = this.getAppDocument();
      if (!doc) return;
      if (step === 2) {
        const aside = doc.querySelector("aside.filtros");
        if (aside) this.positionGuideRing(aside, "Filtros activos: WiFi + Ruido Bajo");
      } else if (step >= 3) {
        const results = doc.querySelector("section.resultados");
        if (results) this.positionGuideRing(results, "Catálogo restaurado · listo para explorar");
      }
    }

    positionGuideRing(targetEl, labelText) {
      if (!targetEl || this.isExploring) {
        this.hideGuideRing();
        return;
      }
      const rect = targetEl.getBoundingClientRect();
      const wrapRect = this.frameWrap.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        this.hideGuideRing();
        return;
      }

      // Clamp to frame viewport bounds so ring stays inside container
      const top = Math.max(8, Math.min(rect.top, wrapRect.height - 48));
      const left = Math.max(8, Math.min(rect.left, wrapRect.width - 48));
      const width = Math.min(rect.width, wrapRect.width - left - 8);
      const height = Math.min(rect.height, wrapRect.height - top - 8);

      this.guideRing.style.top = `${top}px`;
      this.guideRing.style.left = `${left}px`;
      this.guideRing.style.width = `${Math.max(40, width)}px`;
      this.guideRing.style.height = `${Math.max(40, height)}px`;
      this.guideTag.textContent = labelText;
      this.guideRing.classList.add("is-visible");
    }

    hideGuideRing() {
      if (this.guideRing) {
        this.guideRing.classList.remove("is-visible");
      }
    }

    enterExploreMode() {
      this.isExploring = true;
      this.hideGuideRing();
      this.updateExploreButton();
      this.updateToolbarCopy(this.currentStep);
      this.announce("Modo exploración libre activado en la aplicación.");
      try {
        this.iframe.focus();
      } catch {
        // ignore focus error
      }
    }

    exitExploreMode() {
      this.isExploring = false;
      this.updateExploreButton();
      this.announce("Volviendo al modo presentación.");
      const doc = this.getAppDocument();
      const win = this.iframe.contentWindow;
      if (!doc || !win || (!win.location.pathname.endsWith("/frontend/index.html") && !win.location.pathname.endsWith("/frontend/"))) {
        this.reloadIframe(false);
      } else {
        this.applyGuidedStep(this.currentStep);
      }
      this.exploreBtn.focus();
    }

    updateExploreButton() {
      if (!this.exploreBtn) return;
      this.exploreBtn.textContent = this.isExploring ? "Volver a presentación" : "Explorar app";
      this.exploreBtn.setAttribute("aria-pressed", this.isExploring ? "true" : "false");
      this.exploreBtn.className = this.isExploring ? "btn" : "btn btn-ghost";
    }

    updateToolbarCopy(step) {
      if (!this.stepPill || !this.stepDesc) return;
      this.stepPill.classList.remove("is-explore", "is-error");

      if (this.isExploring) {
        this.stepPill.classList.add("is-explore");
        this.stepPill.textContent = "EXPLORACIÓN LIBRE";
        this.stepDesc.textContent = "Navegá libremente en frontend/. Pulsá «Volver a presentación» para retomar el deck.";
        return;
      }

      if (step === 1) {
        this.stepPill.textContent = "PASO 1 / 3 · APP EN VIVO";
        this.stepDesc.textContent = "Cliente real /frontend/index.html conectado a la API de Study Spaces.";
      } else if (step === 2) {
        this.stepPill.textContent = "PASO 2 / 3 · FILTRO GUIADO";
        this.stepDesc.textContent = "Aplicado WiFi + Nivel de ruido Bajo usando los controles reales de app.js.";
      } else {
        this.stepPill.textContent = "PASO 3 / 3 · CATÁLOGO COMPLETO";
        this.stepDesc.textContent = "Filtros limpiados. Avanzá (→) para continuar o tocá «Explorar app».";
      }
    }

    showOverlay(label, title, desc, isError = false) {
      if (!this.overlay) return;
      this.overlayLabel.textContent = label;
      this.overlayTitle.textContent = title;
      this.overlayDesc.textContent = desc;
      this.overlay.hidden = false;
      if (isError && this.stepPill) {
        this.stepPill.classList.add("is-error");
        this.stepPill.textContent = "ERROR DE CARGA";
      }
    }

    hideOverlay() {
      if (this.overlay) {
        this.overlay.hidden = true;
      }
    }

    announce(msg) {
      if (this.statusRegion) this.statusRegion.textContent = msg;
    }
  }

  window.StudySpacesDemoLive = DemoLiveController;
})();
