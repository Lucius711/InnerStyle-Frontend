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
