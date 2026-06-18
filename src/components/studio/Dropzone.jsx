import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useI18n";

const MAX_MB = 20; // backend multipart max-file-size

/** Image dropzone with preview. Calls onFile(File | null). */
export default function Dropzone({ file, onFile, error }) {
  const t = useT();
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(null);
  const inputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  const validate = (f) => {
    if (!f) return;
    if (!/image\/(png|jpe?g|webp)/.test(f.type)) {
      setLocalError(t("form.dropTypeError"));
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setLocalError(t("form.dropSizeError", { mb: MAX_MB }));
      return;
    }
    setLocalError(null);
    onFile(f);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          validate(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "focus-ring relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300",
          dragging
            ? "border-brand-violet bg-brand-violet/10"
            : "border-app-line/15 bg-app-line/[0.03] hover:border-app-line/30 hover:bg-app-line/[0.05]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => validate(e.target.files?.[0])}
        />

        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <img
                src={previewUrl}
                alt="Upload preview"
                className="max-h-44 rounded-xl object-contain shadow-card"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFile(null);
                }}
                className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white shadow hover:bg-rose-600"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.span
                animate={dragging ? { y: -4 } : { y: 0 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-line/[0.05] text-brand-violet"
              >
                <UploadCloud className="h-7 w-7" />
              </motion.span>
              <div>
                <p className="text-sm font-medium text-app-text">
                  {t("form.dropTitle")}
                  <span className="text-brand-violet">{t("form.browse")}</span>
                </p>
                <p className="mt-1 text-xs text-app-faint">
                  {t("form.dropHint", { mb: MAX_MB })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {file && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-app-muted">
          <ImageIcon className="h-3.5 w-3.5" /> {file.name}
        </p>
      )}
      {(localError || error) && (
        <p className="mt-2 text-xs text-rose-400">{localError || error}</p>
      )}
    </div>
  );
}
