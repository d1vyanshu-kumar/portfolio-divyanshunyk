/**
 * Design tokens as JS constants for use in React islands.
 * Source of truth is tokens.css. Keep these in sync.
 */

export const themes = {
  "after-hours": {
    bg: "#0B0B0D",
    surface: "#141418",
    text: "#EDEDEF",
    muted: "#A1A1AA",
    accent: "#FF5436",
    openToWork: "#3DDC84",
  },
  daylight: {
    bg: "#F6F6F4",
    surface: "#FFFFFF",
    text: "#121214",
    muted: "#5C5C66",
    accent: "#C92A10",
    openToWork: "#0E7A3B",
  },
  dawn: {
    bg: "#F2E8D5",
    surface: "#F8F0E0",
    text: "#2B2118",
    muted: "#6B5B4B",
    accent: "#A93A18",
    openToWork: "#2F6B2F",
  },
};

export const themeNames = /** @type {const} */ (["after-hours", "daylight", "dawn"]);
