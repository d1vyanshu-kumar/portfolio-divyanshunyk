/**
 * WCAG AA Contrast Verification Script
 * Validates that all theme tokens meet WCAG AA requirements:
 * - Normal text >= 4.5:1
 * - Large text & UI components >= 3.0:1
 */

function sRGBtoLin(colorChannel) {
  return colorChannel <= 0.04045
    ? colorChannel / 12.92
    : Math.pow((colorChannel + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16),
  ];
}

function getLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => sRGBtoLin(c / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrast(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const themes = {
  "after-hours (dark)": {
    bg: "#0B0B0D",
    surface: "#141418",
    text: "#EDEDEF",
    muted: "#A1A1AA",
    accent: "#FF5436",
    openToWork: "#3DDC84",
  },
  "daylight (light)": {
    bg: "#F6F6F4",
    surface: "#FFFFFF",
    text: "#121214",
    muted: "#5C5C66",
    accent: "#C92A10",
    openToWork: "#0E7A3B",
  },
  "dawn (warm)": {
    bg: "#F2E8D5",
    surface: "#F8F0E0",
    text: "#2B2118",
    muted: "#6B5B4B",
    accent: "#A93A18",
    openToWork: "#2F6B2F",
  },
};

let failures = 0;
console.log("=== WCAG AA Contrast Verification ===");

for (const [themeName, colors] of Object.entries(themes)) {
  console.log(`\nTheme: ${themeName}`);
  const checks = [
    { label: "Text on Background", fg: colors.text, bg: colors.bg, min: 4.5 },
    { label: "Text on Surface", fg: colors.text, bg: colors.surface, min: 4.5 },
    { label: "Muted on Background", fg: colors.muted, bg: colors.bg, min: 4.5 },
    { label: "Accent on Background (UI/Large)", fg: colors.accent, bg: colors.bg, min: 3.0 },
    { label: "Open-to-work on Background", fg: colors.openToWork, bg: colors.bg, min: 4.5 },
  ];

  for (const check of checks) {
    const ratio = getContrast(check.fg, check.bg);
    const pass = ratio >= check.min;
    const mark = pass ? "PASS" : "FAIL";
    if (!pass) failures++;
    console.log(
      `  [${mark}] ${check.label}: ${ratio.toFixed(2)}:1 (required >= ${check.min}:1)`
    );
  }
}

console.log("\n======================================");
if (failures === 0) {
  console.log("ALL CONTRAST CHECKS PASSED WCAG AA");
  process.exit(0);
} else {
  console.error(`${failures} check(s) FAILED`);
  process.exit(1);
}
