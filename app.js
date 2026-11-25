import { ANIMATION } from "./animation-config.js";
import { createTreatment, createTreatmentMarkup } from "./treatment.js";
import { createAndroidMarkup, createAndroidPair } from "./android.js";

function applyCssVars() {
  const root = document.documentElement;
  root.style.setProperty("--menu-ms", `${ANIMATION.menuMs}ms`);
  root.style.setProperty("--content-ms", `${ANIMATION.contentMs}ms`);
  root.style.setProperty("--menu-close-ms", `${ANIMATION.menuCloseMs}ms`);
  root.style.setProperty("--content-close-ms", `${ANIMATION.contentCloseMs}ms`);
  root.style.setProperty("--content-slide", `${ANIMATION.contentSlidePx}px`);
  root.style.setProperty("--bg-ms", `${ANIMATION.backgroundMs}ms`);
  root.style.setProperty("--ease", ANIMATION.easing);
  root.style.setProperty("--stripe-ms", `${ANIMATION.stripeScrollMs}ms`);
}

/** @type {Map<string, { reset: () => void, destroy?: () => void, onActivate?: () => void }[]>} */
const tabControllers = new Map();

function mountSideBySide(panel) {
  panel.innerHTML = `
    <div class="prototype">
      <div class="labels" aria-hidden="true">
        <span>Treatment A — Barber Pole</span>
        <span>Treatment B — Inline Countdown</span>
      </div>
      <main class="stage stage-compare">
        ${createTreatmentMarkup("treatment-a", "Treatment A — Barber Pole")}
        ${createTreatmentMarkup("treatment-b", "Treatment B — Inline Countdown")}
      </main>
    </div>
  `;

  const controllers = [
    createTreatment(panel.querySelector("#treatment-a"), "A"),
    createTreatment(panel.querySelector("#treatment-b"), "B"),
  ];
  tabControllers.set("compare", controllers);
}

/**
 * @param {HTMLElement} panel
 * @param {"A" | "B"} treatment
 * @param {string} tabId
 * @param {string} title
 */
function mountMultiDevice(panel, treatment, tabId, title) {
  const pcId = `md-${treatment.toLowerCase()}-pc`;
  const selfId = `md-${treatment.toLowerCase()}-self`;
  const otherId = `md-${treatment.toLowerCase()}-other`;

  panel.innerHTML = `
    <div class="prototype">
      <main class="stage stage-multi">
        <div class="multi-pc">
          ${createTreatmentMarkup(pcId, title)}
        </div>
        <div class="multi-phones">
          ${createAndroidMarkup("self", selfId)}
          ${createAndroidMarkup("other", otherId)}
        </div>
      </main>
    </div>
  `;

  const phones = createAndroidPair(
    panel.querySelector(`#${selfId}`),
    panel.querySelector(`#${otherId}`),
  );

  const pcRoot = panel.querySelector(`#${pcId}`);
  const pc = createTreatment(pcRoot, treatment, {
    onPhaseChange(phase) {
      phones.syncFromPhase(phase);
    },
  });

  // Android frames ~20% taller than the PC panel
  const ANDROID_SCALE = 1.2;
  const frames = panel.querySelectorAll(".android-frame");
  const syncPhoneHeight = () => {
    const h = pcRoot.getBoundingClientRect().height * ANDROID_SCALE;
    if (h <= 0) return;
    frames.forEach((frame) => {
      frame.style.height = `${h}px`;
      frame.style.width = `${(h * 412) / 919}px`;
    });
  };
  const heightRo = new ResizeObserver(syncPhoneHeight);
  heightRo.observe(pcRoot);
  syncPhoneHeight();

  tabControllers.set(tabId, [
    {
      reset() {
        pc.reset();
        phones.reset();
      },
      onActivate() {
        requestAnimationFrame(syncPhoneHeight);
      },
      destroy() {
        heightRo.disconnect();
        pc.destroy();
        phones.destroy();
      },
    },
  ]);
}

function resetActiveTab() {
  const active = document.querySelector(".tab-panel.is-active");
  const tabId = active?.dataset.tab;
  if (!tabId) return;
  tabControllers.get(tabId)?.forEach((c) => c.reset());
}

function setActiveTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const on = btn.dataset.tab === tabId;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-selected", String(on));
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    const on = panel.dataset.tab === tabId;
    panel.classList.toggle("is-active", on);
    panel.hidden = !on;
  });

  tabControllers.get(tabId)?.forEach((c) => c.onActivate?.());
}

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveTab(btn.dataset.tab);
    });
  });
}

applyCssVars();

mountSideBySide(document.getElementById("panel-compare"));
mountMultiDevice(
  document.getElementById("panel-multi-a"),
  "A",
  "multi-a",
  "Treatment A — Barber Pole",
);
mountMultiDevice(
  document.getElementById("panel-multi-b"),
  "B",
  "multi-b",
  "Treatment B — Inline Countdown",
);

initTabs();
setActiveTab("compare");

document.getElementById("reset-btn")?.addEventListener("click", () => {
  resetActiveTab();
});
