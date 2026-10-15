import { useEffect, useState } from "react";
import { request } from "@/lib/http";

/** Money formatter (plan price, print fee). */
export const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

/**
 * 3D-print sell prices by figurine height (cm). FALLBACK ONLY (finding n2): the backend
 * (app.print.prices) is the single source of truth, exposed at GET /api/common/print/pricing and
 * re-priced on every order server-side. Prefer loadPrintPricing() below; this constant is only
 * used offline / before the fetch resolves.
 */
export const PRINT_SIZES = [
  { cm: 8, price: 649000 },
  { cm: 12, price: 749000 },
  { cm: 15, price: 849000 },
];

/**
 * Plastic options and their surcharge (VND) on top of the size price. FALLBACK ONLY, same as
 * PRINT_SIZES: the backend (app.print.materials) is the source of truth and re-prices every order.
 */
export const PRINT_MATERIALS = [
  { code: "PLA", name: "PLA", surcharge: 0 },
  { code: "PETG", name: "PETG", surcharge: 50000 },
  { code: "RESIN", name: "Resin", surcharge: 150000 },
];

/** Couple Set discount (%) — FALLBACK ONLY until loadCoupleDiscount() answers; the server re-prices every order. */
export const COUPLE_DISCOUNT_PERCENT = 13;

/** Couple Set price: both figurines minus the discount, rounded to the nearest 1,000 VND (same rule as the server). */
export const couplePrice = (full, percent = COUPLE_DISCOUNT_PERCENT) =>
  Math.round((full * (100 - percent)) / 100 / 1000) * 1000;

let coupleDiscountCache = null;

/** Couple Set discount (%) from GET /api/common/print/pricing (app.print.couple-discount-percent), fetched once. */
export function loadCoupleDiscount() {
  if (!coupleDiscountCache) {
    coupleDiscountCache = request("/api/common/print/pricing")
      .then((data) => (Number.isFinite(data?.coupleDiscountPercent) ? data.coupleDiscountPercent : COUPLE_DISCOUNT_PERCENT))
      .catch(() => COUPLE_DISCOUNT_PERCENT);
  }
  return coupleDiscountCache;
}

/** LED light base add-on (VND) — FALLBACK ONLY until loadLightPrice() answers; the server re-prices every order. */
export const LIGHT_PRICE = 50000;

let lightPriceCache = null;

/** LED light price from GET /api/common/print/pricing (app.print.light-price), fetched once. */
export function loadLightPrice() {
  if (!lightPriceCache) {
    lightPriceCache = request("/api/common/print/pricing")
      .then((data) => (data?.lightPrice != null && Number.isFinite(Number(data.lightPrice)) ? Number(data.lightPrice) : LIGHT_PRICE))
      .catch(() => LIGHT_PRICE);
  }
  return lightPriceCache;
}

let printPricingCache = null;

/**
 * Load the authoritative print sizes/prices from the backend once (source of truth). Falls back to
 * the PRINT_SIZES constant if the request fails, so the UI still renders offline.
 */
export function loadPrintPricing() {
  if (!printPricingCache) {
    printPricingCache = request("/api/common/print/pricing")
      .then((data) =>
        (data?.sizes || []).map((s) => ({ cm: s.heightCm, price: Number(s.price) }))
      )
      .then((sizes) => (sizes.length ? sizes : PRINT_SIZES))
      .catch(() => PRINT_SIZES);
  }
  return printPricingCache;
}

/** Suggested price for a size (cm), or undefined if not a known size (fallback list). */
export function printPriceFor(cm) {
  return PRINT_SIZES.find((s) => s.cm === Number(cm))?.price;
}

let creditCache = null;

/** Load credit cost per 3D operation once (taskType -> credits). Fail-open to empty. */
export function loadCredits() {
  if (!creditCache) {
    creditCache = request("/api/common/membership/operation-credits")
      .then((items) => {
        const map = {};
        (items || []).forEach((i) => {
          map[i.taskType] = Number(i.creditCost);
        });
        return map;
      })
      .catch(() => ({}));
  }
  return creditCache;
}

/** Hook exposing creditFor(taskType) (undefined while loading or for free operations). */
export function useCredits() {
  const [map, setMap] = useState(null);
  useEffect(() => {
    let active = true;
    loadCredits().then((m) => active && setMap(m));
    return () => {
      active = false;
    };
  }, []);
  const creditFor = (taskType) => (map ? map[taskType] : undefined);
  return { creditFor, map, ready: !!map };
}
