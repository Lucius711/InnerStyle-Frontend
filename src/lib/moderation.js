// Client-side content moderation.
//
//  - Text: a bilingual (VI + EN) blocklist. The same policy is also enforced server-side.
//  - Image: best-effort NSFW detection via nsfwjs, loaded from a CDN on first use so it
//    never bloats the main bundle. Image checks FAIL OPEN — if the model can't load or
//    errors, uploads are allowed through (the feature degrades, it never breaks the app).

export const MODERATION_TEXT_CODE = "moderation.textBlocked";
export const MODERATION_IMAGE_CODE = "moderation.imageBlocked";

// Probability thresholds per nsfwjs class above which an image is rejected.
// Only the strong signals (explicit nudity / sexual content) count. The "Sexy" class is
// intentionally excluded — it fires on ordinary photos of clothed people (false positives).
const NSFW_THRESHOLDS = { Porn: 0.7, Hentai: 0.8 };

// Lowercased substrings that block a prompt. Keep broad but conservative.
const BLOCKED_TERMS = [
  // English — sexual / nudity
  "nude", "naked", "nsfw", "porn", "pornographic", "sexual", "explicit nudity",
  "xxx", "hentai", "nipple", "genital", "penis", "vagina", "blowjob", "masturbat",
  "cum ", "topless", "bottomless", "erotic", "fetish",
  // English — exploitation / extreme
  "rape", "incest", "bestiality", "lolicon", "shotacon", "child porn", "underage",
  "cp porn", "pedophil", "gore", "beheading", "decapitat",
  // Vietnamese
  "khiêu dâm", "khoả thân", "khỏa thân", "lõa thể", "loã thể", "ảnh sex", "phim sex",
  "cởi truồng", "trần truồng", "ấu dâm", "loạn luân", "hiếp dâm", "cưỡng hiếp",
  "bộ phận sinh dục", "đồi trụy", "dâm ô", "khiêu gợi tình dục",
];

function normalize(s) {
  return (s || "").toString().toLowerCase();
}

/** Returns { blocked, term } for the combined text of all arguments. */
export function checkText(...texts) {
  const hay = normalize(texts.filter(Boolean).join("  \n  "));
  if (!hay.trim()) return { blocked: false };
  for (const term of BLOCKED_TERMS) {
    if (hay.includes(term)) return { blocked: true, term };
  }
  return { blocked: false };
}

let _modelPromise = null;
async function getModel() {
  if (!_modelPromise) {
    _modelPromise = (async () => {
      const tf = await import(/* @vite-ignore */ "https://esm.sh/@tensorflow/tfjs@4.22.0");
      if (typeof tf.ready === "function") await tf.ready();
      const mod = await import(/* @vite-ignore */ "https://esm.sh/nsfwjs@4.2.1");
      const nsfw = mod.default || mod;
      return nsfw.load();
    })();
  }
  return _modelPromise;
}

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Best-effort NSFW check on an uploaded image File. Returns { blocked, label, score }.
 * Fails OPEN (returns { blocked: false }) on any internal error.
 */
export async function checkImageFile(file) {
  if (!file) return { blocked: false };
  try {
    const model = await getModel();
    const img = await fileToImage(file);
    const preds = await model.classify(img);
    // eslint-disable-next-line no-console
    console.debug("[moderation] nsfw scores:", preds);
    for (const p of preds) {
      const th = NSFW_THRESHOLDS[p.className];
      if (th && p.probability >= th) {
        return { blocked: true, label: p.className, score: p.probability };
      }
    }
    return { blocked: false };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[moderation] image check skipped:", e);
    return { blocked: false };
  }
}
