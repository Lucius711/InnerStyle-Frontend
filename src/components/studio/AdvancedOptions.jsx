import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import {
  Field,
  Segmented,
  Toggle,
  Slider,
  ChipMultiSelect,
  TextInput,
} from "@/components/ui/FormControls";
import { TARGET_FORMATS, POLYCOUNT, MODEL_STYLES } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { useT } from "@/hooks/useI18n";

const STYLE_LABELS = {
  default: "form.styleDefault",
  chibi: "form.styleChibi",
  human: "form.styleHuman",
};

/**
 * Collapsible advanced generation settings shared by the image & text forms.
 * `show` toggles which controls appear for the given pipeline stage.
 */
export default function AdvancedOptions({ value, onChange, show = {}, imageMode = false }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const set = (patch) => onChange({ ...value, ...patch });

  const fields = {
    style: true,
    aiModel: true,
    topology: true,
    poseMode: true,
    polycount: true,
    texture: true,
    pbr: true,
    remesh: true,
    texturePrompt: true,
    formats: true,
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
  const topologies = [
    { value: "triangle", label: t("form.topoTriangle") },
    { value: "quad", label: t("form.topoQuad") },
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

              {fields.topology && (
                <Field label={t("form.topology")}>
                  <Segmented
                    name="topology"
                    options={topologies}
                    value={value.topology}
                    onChange={(v) => set({ topology: v })}
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

              {fields.polycount && (
                <Field label={t("form.polycount")}>
                  <Slider
                    label={t("form.resolution")}
                    min={POLYCOUNT.min}
                    max={POLYCOUNT.max}
                    step={POLYCOUNT.step}
                    value={value.targetPolycount}
                    onChange={(v) => set({ targetPolycount: v })}
                    format={(n) => t("form.tris", { n: formatNumber(n) })}
                  />
                </Field>
              )}

              {(fields.texture || fields.pbr || fields.remesh) && (
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
                  {fields.remesh && (
                    <Toggle
                      label={t("form.remesh")}
                      description={t("form.remeshDesc")}
                      checked={value.shouldRemesh}
                      onChange={(v) => set({ shouldRemesh: v })}
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

              {fields.formats && (
                <Field label={t("form.formats")}>
                  <ChipMultiSelect
                    options={TARGET_FORMATS}
                    value={value.targetFormats}
                    onChange={(v) => set({ targetFormats: v })}
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
