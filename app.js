import { ANIMATION, TIMER, LAYOUT, COPY } from "./animation-config.js";

/** @typedef {"off" | "allow" | "active"} Phase */

const DURATION_MS = TIMER.durationSec * 1000;

function applyCssVars() {
  const root = document.documentElement;
  root.style.setProperty("--menu-ms", `${ANIMATION.menuMs}ms`);
  root.style.setProperty("--content-ms", `${ANIMATION.contentMs}ms`);
  root.style.setProperty("--content-slide", `${ANIMATION.contentSlidePx}px`);
  root.style.setProperty("--bg-ms", `${ANIMATION.backgroundMs}ms`);
  root.style.setProperty("--ease", ANIMATION.easing);
  root.style.setProperty("--stripe-ms", `${ANIMATION.stripeScrollMs}ms`);
}

function formatTreatmentA(remainingMs) {
  const sec = Math.max(0, Math.ceil(remainingMs / 1000));
  if (sec >= 60) {
    const mins = Math.ceil(sec / 60);
    return `${mins} minute${mins === 1 ? "" : "s"} left`;
  }
  return `${sec} second${sec === 1 ? "" : "s"} left`;
}

function formatTreatmentB(remainingMs) {
  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const clock = `${mins}:${String(secs).padStart(2, "0")}`;
  return {
    prefix: "Your PC will be visible to any device for another ",
    emph: `${clock} minutes`,
  };
}

function createTreatment(root, treatment) {
  const statusHit = root.querySelector(".status-hit");
  const menu = root.querySelector(".menu");
  const toggleBtn = root.querySelector(".toggle");
  const toggleImg = root.querySelector(".toggle img");
  const body = root.querySelector(".menu-body");
  const titleEl = root.querySelector(".menu-title");
  const actionEl = root.querySelector(".menu-action");

  /** @type {{ phase: Phase, menuOpen: boolean, remainingMs: number, raf: number | null, lastTs: number | null }} */
  const state = {
    phase: "off",
    menuOpen: true,
    remainingMs: DURATION_MS,
    raf: null,
    lastTs: null,
  };

  function setOnBackground(on) {
    root.classList.toggle("is-on", on);
  }

  function setToggleVisual(on) {
    toggleImg.src = on ? "./assets/toggle-on.svg" : "./assets/toggle-off.svg";
    toggleImg.alt = on ? "NearSense on" : "NearSense off";
    toggleBtn.setAttribute("aria-pressed", String(on));
  }

  function setMenuOpen(open) {
    state.menuOpen = open;
    menu.dataset.open = String(open);
  }

  function stopTimer() {
    if (state.raf != null) {
      cancelAnimationFrame(state.raf);
      state.raf = null;
    }
    state.lastTs = null;
  }

  function updateActiveContent() {
    const progress = Math.max(0, Math.min(1, state.remainingMs / DURATION_MS));

    if (treatment === "A") {
      const fill = actionEl.querySelector(".progress-fill");
      const label = actionEl.querySelector(".progress-label");
      const wrap = actionEl.querySelector(".progress-wrap");
      if (fill) fill.style.width = `${progress * 100}%`;
      if (label) label.textContent = formatTreatmentA(state.remainingMs);
      if (wrap) wrap.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
      return;
    }

    const emph = titleEl.querySelector(".time-emph");
    if (emph) emph.textContent = formatTreatmentB(state.remainingMs).emph;
  }

  function renderActiveContent() {
    const progress = Math.max(0, Math.min(1, state.remainingMs / DURATION_MS));

    if (treatment === "A") {
      titleEl.innerHTML = `
        <h2>Visible to everyone</h2>
        <p>Make your PC visible to any nearby device</p>
      `;
      actionEl.innerHTML = `
        <div class="progress-wrap" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress * 100)}">
          <div class="progress-fill" style="width:${progress * 100}%">
            <div class="progress-stripes" aria-hidden="true"></div>
          </div>
          <span class="progress-label">${formatTreatmentA(state.remainingMs)}</span>
          <button type="button" class="progress-stop" aria-label="Stop NearSense">
            <img src="./assets/stop.svg" alt="" />
          </button>
        </div>
      `;
      actionEl.querySelector(".progress-stop")?.addEventListener("click", (e) => {
        e.stopPropagation();
        goAllow();
      });
    } else {
      const b = formatTreatmentB(state.remainingMs);
      titleEl.innerHTML = `
        <h2>Visible to everyone</h2>
        <p>${b.prefix}<span class="time-emph">${b.emph}</span></p>
      `;
      actionEl.replaceChildren();
      const stopBtn = document.createElement("button");
      stopBtn.type = "button";
      stopBtn.className = "btn btn-dark stop-btn";
      stopBtn.textContent = COPY.treatmentBStopLabel;
      stopBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goAllow();
      });
      actionEl.appendChild(stopBtn);
    }
  }

  function renderAllowContent() {
    titleEl.innerHTML = `
      <h2>Visible to everyone</h2>
      <p>Make your PC visible to any nearby device for 10 minutes</p>
    `;
    actionEl.innerHTML = `
      <button type="button" class="btn btn-primary allow-btn">Allow for 10 minutes</button>
    `;
    actionEl.querySelector(".allow-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      goActive();
    });
  }

  function playContentReveal() {
    const expand = body.classList.contains("is-collapsed");
    body.classList.add("is-revealing");
    if (expand) body.classList.remove("is-collapsed");
    // Double rAF so the browser paints the hidden state before transitioning in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.classList.remove("is-revealing");
      });
    });
  }

  function renderPhase() {
    if (state.phase === "off") {
      setOnBackground(false);
      setToggleVisual(false);
      // Fade/slide content out, then collapse height
      body.classList.add("is-revealing");
      window.setTimeout(() => {
        if (state.phase !== "off") return;
        body.classList.add("is-collapsed");
        titleEl.innerHTML = "";
        actionEl.innerHTML = "";
      }, ANIMATION.contentMs);
      return;
    }

    setOnBackground(true);
    setToggleVisual(true);

    if (state.phase === "allow") {
      renderAllowContent();
    } else {
      renderActiveContent();
    }

    playContentReveal();
  }

  function tick(ts) {
    if (state.lastTs == null) state.lastTs = ts;
    const speed = treatment === "A" ? TIMER.demoSpeedA : TIMER.demoSpeedB;
    const dt = (ts - state.lastTs) * speed;
    state.lastTs = ts;
    state.remainingMs = Math.max(0, state.remainingMs - dt);

    if (state.phase === "active") {
      updateActiveContent();
    }

    if (state.remainingMs <= 0) {
      stopTimer();
      // Timer expired → return to allow prompt (matches frame 6)
      state.phase = "allow";
      state.remainingMs = DURATION_MS;
      renderPhase();
      return;
    }

    state.raf = requestAnimationFrame(tick);
  }

  function goOff() {
    stopTimer();
    state.phase = "off";
    state.remainingMs = DURATION_MS;
    setMenuOpen(true);
    renderPhase();
  }

  function goAllow() {
    stopTimer();
    state.phase = "allow";
    state.remainingMs = DURATION_MS;
    setMenuOpen(true);
    renderPhase();
  }

  function goActive() {
    state.phase = "active";
    state.remainingMs = DURATION_MS;
    setMenuOpen(true);
    renderPhase();
    stopTimer();
    state.raf = requestAnimationFrame(tick);
  }

  function onToggle() {
    if (state.phase === "off") {
      goAllow();
    } else {
      goOff();
    }
  }

  function onStatus() {
    setMenuOpen(!state.menuOpen);
  }

  statusHit.addEventListener("click", (e) => {
    e.stopPropagation();
    onStatus();
  });

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    onToggle();
  });

  function scalePanel() {
    const scaleEl = root.querySelector(".panel-scale");
    const w = root.clientWidth;
    const s = w / LAYOUT.panelWidth;
    scaleEl.style.transform = `scale(${s})`;
  }

  const ro = new ResizeObserver(scalePanel);
  ro.observe(root);
  scalePanel();

  // Initial: Off + menu open (Figma frame 1)
  setMenuOpen(true);
  renderPhase();

  return {
    reset: goOff,
    destroy() {
      stopTimer();
      ro.disconnect();
    },
  };
}

applyCssVars();

const treatments = [
  createTreatment(document.getElementById("treatment-a"), "A"),
  createTreatment(document.getElementById("treatment-b"), "B"),
];

document.getElementById("reset-btn")?.addEventListener("click", () => {
  treatments.forEach((t) => t.reset());
});
