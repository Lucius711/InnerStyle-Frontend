import { useState } from "react";
import { Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/motion/MagneticButton";
import { Field } from "@/components/ui/FormControls";
import ModelDropzone from "./ModelDropzone";
import { api } from "@/lib/api";
import { convertToGlb, needsGlbConversion } from "@/lib/convertModel";
import { useToast } from "@/hooks/useToast";
import { useI18n } from "@/hooks/useI18n";

export default function ImportModelForm({ onCreated, disabled }) {
  const { t, tServer } = useI18n();
  const toast = useToast();
  // { modelFile: File, companions: File[] } | null
  const [selection, setSelection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [converting, setConverting] = useState(false);

  const handleFile = (val) => {
    // val is null (clear) or { modelFile, companions }
    setSelection(val);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selection?.modelFile) {
      toast.error(t("toast.noModelTitle"), t("toast.noModelBody"));
      return;
    }
    const { modelFile, companions } = selection;
    try {
      setSubmitting(true);
      let upload = modelFile;
      if (needsGlbConversion(modelFile)) {
        setConverting(true);
        try {
          // Pass companions so OBJ can pick up MTL + textures for color.
          upload = await convertToGlb(modelFile, companions);
        } catch {
          upload = modelFile;
        } finally {
          setConverting(false);
        }
      }
      const task = await api.importModelUpload(upload);
      onCreated(task);
    } catch (err) {
      toast.error(t("toast.importFailTitle"), tServer(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const modelFile = selection?.modelFile ?? null;
  const companions = selection?.companions ?? [];

  return (
    <form onSubmit={submit} className="space-y-5" data-tour="input">
      <div className="rounded-2xl border border-brand-cyan/20 bg-brand-cyan/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-app-text">
          <Upload className="h-4 w-4 text-brand-cyan" /> {t("form.importTitle")}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-app-muted">{t("form.importDesc")}</p>
      </div>

      <Field label={t("form.importLabel")}>
        <ModelDropzone
          file={modelFile}
          companions={companions}
          onFile={handleFile}
        />
      </Field>

      <p className="rounded-xl border border-app-line/10 bg-app-line/[0.02] px-4 py-3 text-xs leading-relaxed text-app-faint">
        {t("form.importNote")}
      </p>

      <MagneticButton as="div" className="w-full" strength={0.2}>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          icon={Upload}
          loading={submitting}
          disabled={disabled}
          data-tour="create"
        >
          {converting ? t("lab.converting") : t("form.importSubmit")}
        </Button>
      </MagneticButton>
      {modelFile && needsGlbConversion(modelFile) && (
        <p className="text-center text-[11px] text-app-faint">{t("lab.convertHint")}</p>
      )}
    </form>
  );
}
