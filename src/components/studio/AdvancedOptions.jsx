import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import {
  Field,
  Segmented,
  Toggle,
  TextInput,
} from "@/components/ui/FormControls";
import { MODEL_STYLES } from "@/lib/constants";
import { useT } from "@/hooks/useI18n";

const STYLE_LABELS = {
  default: "form.styleDefault",
  chibi: "form.styleChibi",
  human: "form.styleHuman",
};

/**
 * Collapsible advanced generation settings shared by the image & text forms.
 * `show` toggles which controls appear for the given pipeline stage.
 *
 * Low-level mesh controls (polygon count, topology, remesh) are intentionally
 * hidden: models keep Meshy's original high-detail mesh for the best quality.
 */
export default function AdvancedOptions({ value, onChange, show = {}, imageMode = false }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const set = (patch) => onChange({ ...value, ...patch });

  const fields = {
    style: true,
    aiModel: true,
    poseMode: true,
    texture: true,
    pbr: true,
    texturePrompt: true,
    ...show,
  };

  const styleOptions = MODEL_STYLES.map((s) => ({
    value: s.value,
    label: t(STYLE_LABELS[s.value] || "form.styleDefault"),
  }));
  const aiModels = [
    { value: "latest", label: t("form.modelLatest") },
    { value: "meshy-6", label: "Meshy 6" },
    { value: "meshy-5", label: "Meshy 5" },
  ];
  const poseModes = [
    { value: "", label: t("form.poseNone") },
    { value: "a-pose", label: t("form.poseA") },
    { value: "t-pose", label: t("form.poseT") },
  ];

  return (
    <div className="rounded-2xl border border-app-line/10 bg-app-line/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium text-app-text">
          <SlidersHorizontal className="h-4 w-4 text-brand-violet" />
          {t("form.advanced")}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="h-4 w-4 text-app-muted" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-5 px-5 pb-6 pt-1">
              {fields.aiModel && (
                <Field label={t("form.aiModel")}>
                  <Segmented
                    name="aiModel"
                    options={aiModels}
                    value={value.aiModel}
                    onChange={(v) => set({ aiModel: v })}
                  />
                </Field>
              )}

              {fields.poseMode && (
                <Field label={t("form.pose")} hint={t("form.poseHint")}>
                  <Segmented
                    name="poseMode"
                    options={poseModes}
                    value={value.poseMode}
                    onChange={(v) => set({ poseMode: v })}
                  />
                </Field>
              )}

              {(fields.texture || fields.pbr) && (
                <div className="space-y-2.5">
                  {fields.texture && (
                    <Toggle
                      label={t("form.texture")}
                      description={t("form.textureDesc")}
                      checked={value.shouldTexture}
                      onChange={(v) => set({ shouldTexture: v })}
                    />
                  )}
                  {fields.pbr && (
                    <Toggle
                      label={t("form.pbr")}
                      description={t("form.pbrDesc")}
                      checked={value.enablePbr}
                      onChange={(v) => set({ enablePbr: v })}
                    />
                  )}
                  {imageMode && (
                    <Toggle
                      label={t("form.hdTexture")}
                      description={t("form.hdTextureDesc")}
                      checked={value.hdTexture}
                      onChange={(v) => set({ hdTexture: v })}
                    />
                  )}
                </div>
              )}

              {fields.texturePrompt && (
                <Field label={t("form.texturePrompt")} hint={t("form.optional")}>
                  <TextInput
                    placeholder={t("form.texturePromptPlaceholder")}
                    value={value.texturePrompt}
                    maxLength={600}
                    onChange={(e) => set({ texturePrompt: e.target.value })}
                  />
                </Field>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
