// Vietnam administrative units (province + ward) from the public open-api.
// Docs: https://provinces.open-api.vn — CORS-enabled, no key required.
//
// We only expose two levels (Province/City + Ward/Commune) per the new 2-level model.
// The API may still return the legacy 3-level shape (province -> districts -> wards); in that
// case we flatten every ward across all districts into a single ward list. If a future API
// version returns wards directly under a province, we use them as-is.

const BASE = "https://provinces.open-api.vn/api";

// In-memory caches (cleared on reload).
let provincesCache = null;
const wardsCache = new Map(); // provinceCode -> ward[]

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Location API ${res.status}`);
  return res.json();
}

/** All provinces / centrally-governed cities: [{ code, name }]. */
export async function fetchProvinces() {
  if (provincesCache) return provincesCache;
  const data = await getJson(`${BASE}/p/`);
  provincesCache = (data || [])
    .map((p) => ({ code: String(p.code), name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  return provincesCache;
}

/**
 * Wards/communes for a province: [{ code, name, districtName? }].
 * Handles both the new 2-level shape and the legacy 3-level (flattening districts).
 */
export async function fetchWards(provinceCode) {
  const key = String(provinceCode);
  if (wardsCache.has(key)) return wardsCache.get(key);

  const province = await getJson(`${BASE}/p/${key}?depth=3`);

  let wards = [];
  if (Array.isArray(province?.wards) && province.wards.length) {
    // Future 2-level: wards directly under the province.
    wards = province.wards.map((w) => ({ code: String(w.code), name: w.name }));
  } else if (Array.isArray(province?.districts)) {
    // Legacy 3-level: flatten every ward across all districts.
    wards = province.districts.flatMap((d) =>
      (d.wards || []).map((w) => ({
        code: String(w.code),
        name: w.name,
        districtName: d.name,
      }))
    );
  }

  wards.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  wardsCache.set(key, wards);
  return wards;
}
