/**
 * NearSense motion prototype — tweak timing here.
 * All durations are milliseconds unless noted.
 */
export const ANIMATION = {
  /** Menu open / close / content swap */
  menuMs: 280,
  /** Background off ↔ on crossfade */
  backgroundMs: 320,
  /** Easing for UI transitions */
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  /** Barber-pole stripe scroll (Treatment A) */
  stripeScrollMs: 1200,
};

export const TIMER = {
  /** Full visibility window in real seconds (matches "10 minutes") */
  durationSec: 10 * 60,
  /** Demo speed multiplier — 10 = 10 real minutes play in 60s */
  demoSpeed: 10,
  /** UI update interval (ms) */
  tickMs: 100,
};

export const LAYOUT = {
  /** Native Figma panel size */
  panelWidth: 666,
  panelHeight: 501,
  /** Dropdown menu position within panel */
  menu: { left: 334, top: 52, width: 253 },
  /** Status "On/Off ▾" hit area */
  statusHit: { left: 335, top: 18, width: 64, height: 32 },
};
