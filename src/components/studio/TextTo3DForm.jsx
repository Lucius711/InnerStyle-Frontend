import { useState } from "react";
import { Wand2 } from "lucide-react";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/motion/MagneticButton";
import { Field, TextArea } from "@/components/ui/FormControls";
import AdvancedOptions from "./AdvancedOptions";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useI18n } from "@/hooks/useI18n";
import { POLYCOUNT, MODEL_STYLES } from "@/lib/constants";

const defaultOptions = () => ({
  style: "default",
  aiModel: "latest",
  topology: "triangle",
  poseMode: "",
  targetPolycount: POLYCOUNT.default,
  shouldRemesh: true,
  targetFormats: ["glb"],
});

const styleFragment = (style) =>
  MODEL_STYLES.find((s) => s.value === style)?.fragment || "";

export default function TextTo3DForm({ onCreated, disabled }) {
  const { t, tServer } = useI18n();
  const toast = useToast();
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(defaultOptions);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const presets = [
    t("form.presets.p1"),
    t("form.presets.p2"),
    t("form.presets.p3"),
    t("form.presets.p4"),
  ];

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!prompt.trim()) {
      setError(t("form.describeError"));
      return;
    }
    try {
      setSubmitting(true);
      const { style, ...rest } = options;
      const fragment = styleFragment(style);
      const finalPrompt = fragment ? `${prompt.trim()}, ${fragment}` : prompt.trim();
      const task = await api.textTo3d({ prompt: finalPrompt, ...rest });
      toast.success(t("toast.startedTitle"), t("toast.startedPreview"));
      onCreated(task);
    } catch (err) {
      toast.error(t("toast.startFailTitle"), tServer(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field
        label={t("form.describeLabel")}
        hint={`${prompt.length}/600`}
        error={error}
      >
        <TextArea
          placeholder={t("form.describePlaceholder")}
          value={prompt}
          maxLength={600}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPrompt(p)}
            className="focus-ring rounded-full border border-app-line/10 bg-app-line/[0.03] px-3 py-1.5 text-xs text-app-muted transition-colors hover:border-brand-violet/50 hover:text-app-text"
          >
            {p}
          </button>
        ))}
      </div>

      <AdvancedOptions
        value={options}
        onChange={setOptions}
        show={{ texture: false, pbr: false, texturePrompt: false }}
      />

      <p className="rounded-xl border border-app-line/10 bg-app-line/[0.02] px-4 py-3 text-xs leading-relaxed text-app-faint">
        {t("form.textNote", { action: t("studio.addColor") })}
      </p>

      <MagneticButton as="div" className="w-full" strength={0.2}>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          icon={Wand2}
          loading={submitting}
          disabled={disabled}
        >
          {t("form.generatePreview")}
        </Button>
      </MagneticButton>
    </form>
  );
}
