/**
 * Android Quick Share storytelling screens (Figma screenshot states).
 *
 * Visibility mapping from PC NearSense phase:
 * - off    → Self empty, Everyone else empty
 * - allow  → Self shows PC, Everyone else empty
 * - active → Self shows PC, Everyone else shows PC
 */

/** @typedef {"off" | "allow" | "active"} Phase */
/** @typedef {"self" | "other"} AndroidRole */

const ASSETS = {
  self: {
    empty: "./assets/android/self-empty.png",
    pc: "./assets/android/self-pc.png",
  },
  other: {
    empty: "./assets/android/other-empty.png",
    pc: "./assets/android/other-pc.png",
  },
};

const LABELS = {
  self: "Self",
  other: "Everyone else",
};

/**
 * @param {Phase} phase
 * @param {AndroidRole} role
 */
export function seesPc(phase, role) {
  if (role === "self") return phase === "allow" || phase === "active";
  return phase === "active";
}

/**
 * @param {AndroidRole} role
 * @param {string} [id]
 */
export function createAndroidMarkup(role, id = `android-${role}`) {
  const label = LABELS[role];
  const emptySrc = ASSETS[role].empty;
  const pcSrc = ASSETS[role].pc;
  return `
<figure class="android-device" id="${id}" data-role="${role}" data-sees-pc="false">
  <figcaption class="android-label">${label}</figcaption>
  <div class="android-frame" aria-label="${label} Android phone">
    <img class="android-screen android-screen-empty" src="${emptySrc}" width="412" height="919" alt="" draggable="false" />
    <img class="android-screen android-screen-pc" src="${pcSrc}" width="412" height="919" alt="" draggable="false" />
  </div>
</figure>`;
}

/**
 * @param {HTMLElement} root
 * @param {AndroidRole} role
 */
export function createAndroidPhone(root, role) {
  function setSeesPc(visible) {
    root.dataset.seesPc = String(visible);
  }

  /** @param {Phase} phase */
  function syncFromPhase(phase) {
    setSeesPc(seesPc(phase, role));
  }

  setSeesPc(false);

  return {
    syncFromPhase,
    setSeesPc,
    destroy() {},
  };
}

/**
 * Pair of Android phones driven by a shared PC phase.
 * @param {HTMLElement} selfRoot
 * @param {HTMLElement} otherRoot
 */
export function createAndroidPair(selfRoot, otherRoot) {
  const selfPhone = createAndroidPhone(selfRoot, "self");
  const otherPhone = createAndroidPhone(otherRoot, "other");

  /** @param {Phase} phase */
  function syncFromPhase(phase) {
    selfPhone.syncFromPhase(phase);
    otherPhone.syncFromPhase(phase);
  }

  return {
    syncFromPhase,
    reset() {
      syncFromPhase("off");
    },
    destroy() {
      selfPhone.destroy();
      otherPhone.destroy();
    },
  };
}
