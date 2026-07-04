import { useEffect, useRef, useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { useT } from "@/hooks/useI18n";

// Map display: Goong Maptiles (goong-js) when VITE_GOONG_MAPTILES_KEY is set — full Vietnamese
// labels, Google-like. Falls back to free OpenStreetMap raster tiles when no key is configured
// or the Goong style fails to load (bad key / quota).
// Address search: Goong AutoComplete (VITE_GOONG_API_KEY) with an OSM Nominatim fallback.
const DEFAULT_CENTER = { lat: 16.047079, lng: 108.20623 }; // Da Nang (≈ centre of Vietnam)
const GOONG_JS_VER = "1.0.9";
const GOONG_JS = `https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@${GOONG_JS_VER}/dist`;
const GOONG_STYLE = "https://tiles.goong.io/assets/goong_map_web.json";
const NOMINATIM = "https://nominatim.openstreetmap.org";
const GOONG = "https://rsapi.goong.io";
const GOONG_KEY = import.meta.env.VITE_GOONG_API_KEY; // REST key (search/geocode)
const MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY; // Maptiles key (map display)

// Self-contained MapLibre/Mapbox-style spec that draws free OSM raster tiles (no token needed).
const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

let goongPromise = null;

/** Inject goong-js CSS + JS once (from CDN) and resolve with the global goongjs. */
function loadGoongJs() {
  if (window.goongjs) return Promise.resolve(window.goongjs);
  if (goongPromise) return goongPromise;
  goongPromise = new Promise((resolve, reject) => {
    if (!document.getElementById("goong-js-css")) {
      const link = document.createElement("link");
      link.id = "goong-js-css";
      link.rel = "stylesheet";
      link.href = `${GOONG_JS}/goong-js.css`;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = `${GOONG_JS}/goong-js.js`;
    script.async = true;
    script.onload = () => resolve(window.goongjs);
    script.onerror = () => {
      goongPromise = null;
      reject(new Error("Failed to load goong-js"));
    };
    document.head.appendChild(script);
  });
  return goongPromise;
}

/** Goong autocomplete — rich Vietnamese suggestions. Coords are fetched later via Place Detail. */
async function searchGoong(q, bias) {
  const loc = bias ? `&location=${bias.lat},${bias.lng}` : "";
  const url =
    `${GOONG}/Place/AutoComplete?api_key=${GOONG_KEY}&more_compound=true${loc}&input=` +
    encodeURIComponent(q);
  const res = await fetch(url);
  if (!res.ok) throw new Error("goong");
  const data = await res.json();
  return (data.predictions || []).map((p) => ({
    id: p.place_id,
    label: p.description,
    provider: "goong",
  }));
}

/** OSM Nominatim fallback — results already carry coordinates. */
async function searchNominatim(q) {
  const url =
    `${NOMINATIM}/search?format=json&addressdetails=0&limit=5&countrycodes=vn&q=` +
    encodeURIComponent(q);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await res.json();
  return (data || []).map((r) => ({
    id: String(r.place_id),
    label: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    provider: "osm",
  }));
}

/**
 * Free address-picker map. Calls `onPick({ lat, lng, address })` when the user searches an
 * address, drags the marker, or clicks the map. Map tiles use Goong (key) or OSM (fallback);
 * search uses Goong (key) or Nominatim (fallback).
 */
export default function MapPicker({ value, onPick }) {
  const t = useT();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapObjRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  // Set right before we programmatically change `query` (after picking a result), so the
  // type-ahead effect doesn't immediately re-open the dropdown.
  const suppressRef = useRef(false);

  // Init the map once goong-js is ready. Note: goong-js (Mapbox GL) uses [lng, lat] order.
  useEffect(() => {
    let cancelled = false;
    loadGoongJs()
      .then((goongjs) => {
        if (cancelled || !mapRef.current || mapObjRef.current) return;
        // A token is required by the GL engine; the OSM raster style never uses it.
        goongjs.accessToken = MAPTILES_KEY || "osm-fallback";
        const center =
          value?.lat && value?.lng
            ? [value.lng, value.lat]
            : [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat];
        const usingGoong = !!MAPTILES_KEY;

        const map = new goongjs.Map({
          container: mapRef.current,
          style: usingGoong ? GOONG_STYLE : OSM_STYLE,
          center,
          zoom: value?.lat ? 16 : 5,
          attributionControl: true,
        });
        mapObjRef.current = map;

        // If the Goong style can't authenticate (bad key / quota), fall back to OSM once.
        let fellBack = false;
        map.on("error", (ev) => {
          const status = ev?.error?.status;
          if (usingGoong && !fellBack && (status === 401 || status === 403 || status === 429)) {
            fellBack = true;
            try {
              map.setStyle(OSM_STYLE);
            } catch {
              /* ignore */
            }
          }
        });

        try {
          map.addControl(new goongjs.NavigationControl({ showCompass: false }), "top-left");
        } catch {
          /* control is optional */
        }

        const marker = new goongjs.Marker({ draggable: true, color: "#5b6cff" })
          .setLngLat(center)
          .addTo(map);
        markerRef.current = marker;

        marker.on("dragend", () => {
          const { lat, lng } = marker.getLngLat();
          onPick({ lat, lng });
        });
        map.on("click", (e) => {
          const { lat, lng } = e.lngLat;
          marker.setLngLat([lng, lat]);
          onPick({ lat, lng });
        });

        // The map is created inside a modal, so make sure it sizes to its container.
        map.on("load", () => map.resize());
        setTimeout(() => map.resize(), 150);
      })
      .catch(() => !cancelled && setError(t("shipping.mapError")));

    return () => {
      cancelled = true;
      if (mapObjRef.current) {
        mapObjRef.current.remove();
        mapObjRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveTo = (lat, lng, address) => {
    const map = mapObjRef.current;
    const marker = markerRef.current;
    if (map && marker) {
      map.flyTo({ center: [lng, lat], zoom: 16 });
      marker.setLngLat([lng, lat]);
    }
    onPick({ lat, lng, address });
  };

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setError("");
    try {
      const bias = markerRef.current ? markerRef.current.getLngLat() : null;
      const items = GOONG_KEY ? await searchGoong(q, bias) : await searchNominatim(q);
      setResults(items);
      if (items.length === 0) setError(t("shipping.mapNoResults"));
    } catch {
      // Goong failed (key/quota/network) — fall back to Nominatim before giving up.
      try {
        const items = await searchNominatim(query.trim());
        setResults(items);
        if (items.length === 0) setError(t("shipping.mapNoResults"));
      } catch {
        setError(t("shipping.mapError"));
      }
    } finally {
      setSearching(false);
    }
  };

  // Debounced type-ahead: suggest as the user types (≥ 3 chars).
  useEffect(() => {
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      return;
    }
    const id = setTimeout(runSearch, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const pickResult = async (r) => {
    suppressRef.current = true;
    setResults([]);
    setQuery(r.label);
    setError("");
    if (r.provider === "goong") {
      setSearching(true);
      try {
        const res = await fetch(
          `${GOONG}/Place/Detail?place_id=${encodeURIComponent(r.id)}&api_key=${GOONG_KEY}`
        );
        const data = await res.json();
        const loc = data?.result?.geometry?.location;
        if (loc) moveTo(loc.lat, loc.lng, data.result.formatted_address || r.label);
        else setError(t("shipping.mapNoResults"));
      } catch {
        setError(t("shipping.mapError"));
      } finally {
        setSearching(false);
      }
    } else {
      moveTo(r.lat, r.lng, r.label);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-app-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runSearch();
              }
            }}
            placeholder={t("shipping.mapSearchPlaceholder")}
            className="w-full rounded-xl border border-app-line/10 bg-app-line/[0.04] px-4 py-3 pl-10 text-sm text-app-text placeholder:text-app-faint focus-ring focus:border-brand-violet/60"
          />
          {results.length > 0 && (
            <ul className="absolute z-[1000] mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-app-line/15 bg-app-bg shadow-card">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => pickResult(r)}
                    className="block w-full px-3 py-2 text-left text-xs text-app-muted hover:bg-app-line/5 hover:text-app-text"
                  >
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={runSearch}
          className="focus-ring flex items-center gap-1.5 rounded-xl border border-app-line/10 bg-app-line/[0.04] px-3 text-sm text-app-muted hover:text-app-text"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </button>
      </div>

      <div ref={mapRef} className="h-56 w-full overflow-hidden rounded-xl border border-app-line/10" />

      {value?.lat && (
        <p className="text-[11px] text-app-faint">
          {t("shipping.coords")}: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      )}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
