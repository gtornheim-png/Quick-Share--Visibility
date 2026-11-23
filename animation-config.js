/**
 * NearSense motion prototype — tweak timing here.
 * All durations are milliseconds unless noted.
 */
export const ANIMATION = {
  /** Menu open / close height */
  menuMs: 280,
  /** Dropdown content fade + slide */
  contentMs: 400,
  /** Content enters from this many px above */
  contentSlidePx: 6,
  /** Background off ↔ on crossfade */
  backgroundMs: 1000,
  /** Easing for UI transitions */
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  /** Barber-pole stripe scroll (Treatment A) */
  stripeScrollMs: 1200,
};

export const TIMER = {
  /** Full visibility window in real seconds (matches "10 minutes") */
  durationSec: 10 * 60,
  /** Treatment A: accelerated demo (10 = 10 real minutes play in 60s) */
  demoSpeedA: 10,
  /** Treatment B: 1 = real-time seconds */
  demoSpeedB: 1,
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
