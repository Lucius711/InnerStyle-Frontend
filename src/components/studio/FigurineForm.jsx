import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/motion/MagneticButton";
import { Field, TextInput, Segmented } from "@/components/ui/FormControls";
import Dropzone from "./Dropzone";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useI18n } from "@/hooks/useI18n";
import { useCostConfirm } from "@/hooks/useCostConfirm";

export default function FigurineForm({ onCreated, disabled }) {
  const { t, tServer } = useI18n();
  const toast = useToast();
  const confirmCost = useCostConfirm();
  const [source, setSource] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [urlError, setUrlError] = useState(null);

  const sourceTabs = [
    { value: "upload", label: t("form.sourceUpload") },
    { value: "url", label: t("form.sourceUrl") },
  ];

  const submit = async (e) => {
    e.preventDefault();
    setUrlError(null);
    const hasInput = (source === "url" && imageUrl.trim()) || (source === "upload" && file);
    if (!hasInput) {
      if (source === "upload") toast.error(t("toast.noImageTitle"), t("toast.noImageBody"));
      else setUrlError(t("form.imageUrlError"));
      return;
    }
    if (!(await confirmCost("FIGURE_PROTOTYPE"))) return;
    try {
      setSubmitting(true);
      let task;
      if (source === "url") {
        if (!imageUrl.trim()) {
          setUrlError(t("form.imageUrlError"));
          setSubmitting(false);
          return;
        }
        task = await api.figurinePrototype({ imageUrl: imageUrl.trim() });
      } else {
        if (!file) {
          toast.error(t("toast.noImageTitle"), t("toast.noImageBody"));
          setSubmitting(false);
          return;
        }
        task = await api.figurinePrototypeUpload(file);
      }
      toast.success(t("toast.figurineStartTitle"), t("toast.figurineStartBody"));
      onCreated(task);
    } catch (err) {
      toast.error(t("toast.startFailTitle"), tServer(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-2xl border border-brand-violet/20 bg-brand-violet/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-app-text">
          <Sparkles className="h-4 w-4 text-brand-violet" /> {t("form.figurineTitle")}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-app-muted">{t("form.figurineDesc")}</p>
      </div>

      <Segmented name="figSource" options={sourceTabs} value={source} onChange={setSource} />

      <motion.div key={source} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {source === "url" ? (
          <Field label={t("form.imageUrlLabel")} hint={t("form.imageUrlHint")} error={urlError}>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-app-faint" />
              <TextInput className="pl-10" placeholder={t("form.imageUrlPlaceholder")} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
          </Field>
        ) : (
          <Field label={t("form.uploadLabel")}>
            <Dropzone file={file} onFile={setFile} />
          </Field>
        )}
      </motion.div>

      <p className="rounded-xl border border-app-line/10 bg-app-line/[0.02] px-4 py-3 text-xs leading-relaxed text-app-faint">
        {t("form.figurineNote")}
      </p>

      <MagneticButton as="div" className="w-full" strength={0.2}>
        <Button type="submit" size="lg" className="w-full" icon={Sparkles} loading={submitting} disabled={disabled}>
          {t("form.figurineGenerate")}
        </Button>
      </MagneticButton>
    </form>
  );
}
