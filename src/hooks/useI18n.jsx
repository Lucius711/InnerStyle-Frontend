import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { en } from "@/locales/en";
import { vi } from "@/locales/vi";

const DICTS = { en, vi };
export const LANGUAGES = [
  { code: "en", label: "English", short: "EN", flag: "🇬🇧" },
  { code: "vi", label: "Tiếng Việt", short: "VI", flag: "🇻🇳" },
];

const I18nContext = createContext(null);
const STORAGE_KEY = "innerstyle-lang";

function getInitialLang() {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && DICTS[stored]) return stored;
  const nav = (window.navigator.language || "en").toLowerCase();
  return nav.startsWith("vi") ? "vi" : "en";
}

/** Resolve a dot-path (supports numeric indices) against an object. */
function resolve(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
}

/** Replace {name} placeholders. */
function interpolate(str, vars) {
  if (!vars || typeof str !== "string") return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!DICTS[next]) return;
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key, vars) => {
      const dict = DICTS[lang] || en;
      let val = resolve(dict, key);
      if (val === undefined) val = resolve(en, key); // fallback to English
      if (val === undefined) return key; // last resort: show the key
      return interpolate(val, vars);
    },
    [lang]
  );

  // Translate a backend message CODE (e.g. "meshy.task.notFound") under the `server.*`
  // namespace. If the value isn't a known code (e.g. a raw network error), return it as-is.
  const tServer = useCallback(
    (codeOrMessage, vars) => {
      if (!codeOrMessage) return codeOrMessage;
      const dict = DICTS[lang] || en;
      let val = resolve(dict, `server.${codeOrMessage}`);
      if (val === undefined) val = resolve(en, `server.${codeOrMessage}`);
      if (val === undefined) return codeOrMessage; // not a known code — show original
      return interpolate(val, vars);
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, tServer }),
    [lang, setLang, t, tServer]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

/** Convenience: just the translate function. */
export function useT() {
  return useI18n().t;
}
