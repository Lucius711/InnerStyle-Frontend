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
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [converting, setConverting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error(t("toast.noModelTitle"), t("toast.noModelBody"));
      return;
    }
    try {
      setSubmitting(true);
      // Convert OBJ/FBX/STL to GLB in the browser so the model is previewable + editable.
      let upload = file;
      if (needsGlbConversion(file)) {
        setConverting(true);
        try {
          upload = await convertToGlb(file);
        } catch {
          upload = file;
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

  return (
    <form onSubmit={submit} className="space-y-5" data-tour="input">
      <div className="rounded-2xl border border-brand-cyan/20 bg-brand-cyan/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-app-text">
          <Upload className="h-4 w-4 text-brand-cyan" /> {t("form.importTitle")}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-app-muted">{t("form.importDesc")}</p>
      </div>

      <Field label={t("form.importLabel")}>
        <ModelDropzone file={file} onFile={setFile} />
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
      {file && needsGlbConversion(file) && (
        <p className="text-center text-[11px] text-app-faint">{t("lab.convertHint")}</p>
      )}
    </form>
  );
}
