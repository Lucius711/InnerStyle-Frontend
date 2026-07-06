import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, X, Cuboid, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useI18n";
import { splitModelFiles } from "@/lib/convertModel";

const MAX_MB = 50;

/**
 * Recursively collect every File inside a DataTransfer folder tree.
 * Returns a flat array of File objects (names preserved, paths available via webkitRelativePath).
 */
async function collectFolderFiles(items) {
  const files = [];

  const readEntry = (entry) =>
    new Promise((resolve) => {
      if (entry.isFile) {
        entry.file(
          (f) => { files.push(f); resolve(); },
          () => resolve()          // skip unreadable files
        );
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        // createReader only returns up to 100 entries per call — loop until done.
        const readAll = (cb) => {
          reader.readEntries((entries) => {
            if (entries.length === 0) { cb(); return; }
            Promise.all(entries.map(readEntry)).then(() => readAll(cb));
          }, () => cb());
        };
        readAll(resolve);
      } else {
        resolve();
      }
    });

  await Promise.all(
    Array.from(items)
      .map((item) => item.webkitGetAsEntry?.())
      .filter(Boolean)
      .map(readEntry)
  );
  return files;
}

/**
 * 3D model dropzone — folder-first.
 * User drops or picks a folder containing a model file + optional textures subfolder.
 * Calls onFile({ modelFile: File, companions: File[] }) or onFile(null).
 */
export default function ModelDropzone({ file, companions = [], onFile, error }) {
  const t = useT();
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(null);
  const folderRef = useRef(null);

  const process = (allFiles) => {
    const { modelFile, companions: comp } = splitModelFiles(allFiles);
    if (!modelFile) {
      setLocalError(t("form.modelDropTypeError"));
      return;
    }
    if (modelFile.size > MAX_MB * 1024 * 1024) {
      setLocalError(t("form.modelDropSizeError", { mb: MAX_MB }));
      return;
    }
    setLocalError(null);
    onFile({ modelFile, companions: comp });
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const items = e.dataTransfer?.items;
    if (items?.length > 0) {
      const collected = await collectFolderFiles(items);
      if (collected.length > 0) { process(collected); return; }
    }
    // Fallback: plain files (no folder API)
    const dropped = Array.from(e.dataTransfer?.files || []);
    if (dropped.length > 0) process(dropped);
  };

  const hasCompanions = companions.length > 0;

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
        onDrop={onDrop}
        onClick={() => !file && folderRef.current?.click()}
        className={cn(
          "focus-ring relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300",
          dragging
            ? "border-brand-violet bg-brand-violet/10 scale-[1.01]"
            : "border-app-line/15 bg-app-line/[0.03] hover:border-app-line/30 hover:bg-app-line/[0.05]"
        )}
      >
        {/* Folder input — webkitdirectory picks entire folder recursively */}
        <input
          ref={folderRef}
          type="file"
          webkitdirectory=""
          mozdirectory=""
          multiple
          className="hidden"
          onChange={(e) => process(Array.from(e.target.files || []))}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center gap-3"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-violet/30 bg-brand-violet/10 text-brand-violet">
                <Cuboid className="h-8 w-8" />
              </span>
              <p className="max-w-[240px] truncate text-sm font-medium text-app-text">{file.name}</p>
              <p className="text-xs text-app-faint">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
                {hasCompanions && (
                  <span className="ml-2 text-brand-violet">
                    + {companions.length} {t("form.companionFiles")}
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onFile(null); }}
                className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white shadow hover:bg-rose-600"
                aria-label="Remove"
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
              className="flex flex-col items-center gap-4"
            >
              <motion.span
                animate={dragging ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-line/[0.05] text-brand-violet"
              >
                <FolderOpen className="h-7 w-7" />
              </motion.span>

              <div className="space-y-1">
                <p className="text-sm font-medium text-app-text">
                  {t("form.folderDropTitle")}
                </p>
                <p className="text-xs text-app-faint">{t("form.folderDropHint")}</p>
              </div>

              {/* Folder picker button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); folderRef.current?.click(); }}
                className="flex items-center gap-1.5 rounded-xl border border-brand-violet/30 bg-brand-violet/10 px-4 py-2 text-sm font-medium text-brand-violet transition-colors hover:bg-brand-violet/20"
              >
                <FolderOpen className="h-4 w-4" />
                {t("form.browseFolder")}
              </button>

              {/* Structure hint */}
              <div className="rounded-xl border border-app-line/10 bg-app-line/[0.02] px-4 py-2.5 text-left text-[11px] text-app-faint">
                <p className="mb-1 font-medium text-app-muted">{t("form.folderStructure")}</p>
                <pre className="leading-relaxed opacity-80">{`📁 my_model/
  📄 model.obj  ← GLB/OBJ/FBX/STL
  📁 textures/
    🖼 diffuse.png
    🖼 normal.png`}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(localError || error) && (
        <p className="mt-2 text-xs text-rose-400">{localError || error}</p>
      )}
    </div>
  );
}
