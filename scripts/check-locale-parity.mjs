// Locale parity guard (finding m3). Fails (exit 1) if en.js and vi.js key sets diverge, so a
// missing translation is caught in CI instead of silently falling back at runtime.
// Run: node scripts/check-locale-parity.mjs   (wired as `npm run check:locales`)
import { en } from "../src/locales/en.js";
import { vi } from "../src/locales/vi.js";

const flatKeys = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? flatKeys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );

const enKeys = new Set(flatKeys(en));
const viKeys = new Set(flatKeys(vi));
const missingInVi = [...enKeys].filter((k) => !viKeys.has(k));
const missingInEn = [...viKeys].filter((k) => !enKeys.has(k));

if (missingInVi.length || missingInEn.length) {
  console.error("Locale parity check FAILED.");
  if (missingInVi.length) console.error("  Missing in vi.js:", missingInVi.join(", "));
  if (missingInEn.length) console.error("  Missing in en.js:", missingInEn.join(", "));
  process.exit(1);
}

console.log(`Locale parity OK — ${enKeys.size} keys in both en and vi.`);
