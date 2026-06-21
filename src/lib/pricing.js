import { useEffect, useState } from "react";
import { request } from "@/lib/http";

/** Money formatter (plan price, print fee). */
export const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

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
