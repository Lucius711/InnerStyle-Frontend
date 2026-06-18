import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Upload, Wand2, Plus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/motion/MagneticButton";
import { Field, TextInput, Segmented } from "@/components/ui/FormControls";
import Dropzone from "./Dropzone";
import AdvancedOptions from "./AdvancedOptions";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useI18n } from "@/hooks/useI18n";
import { POLYCOUNT, MODEL_STYLES } from "@/lib/constants";

const MAX_IMAGES = 4;

const defaultOptions = () => ({
  style: "default",
  aiModel: "latest",
  topology: "triangle",
  poseMode: "",
  targetPolycount: POLYCOUNT.default,
  shouldTexture: true,
  enablePbr: true,
  shouldRemesh: true,
  texturePrompt: "",
  targetFormats: ["glb"],
});

const styleFragment = (style) =>
  MODEL_STYLES.find((s) => s.value === style)?.fragment || "";

export default function ImageTo3DForm({ onCreated, disabled }) {
  const { t, tServer } = useI18n();
  const toast = useToast();
  const [source, setSource] = useState("url");
  const [imageUrl, setImageUrl] = useState("");
  const [multiUrls, setMultiUrls] = useState(["", ""]);
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState(defaultOptions);
  const [submitting, setSubmitting] = useState(false);
  const [urlError, setUrlError] = useState(null);

  const sourceTabs = [
    { value: "url", label: t("form.sourceUrl") },
    { value: "upload", label: t("form.sourceUpload") },
    { value: "multi", label: t("form.sourceMulti") },
  ];

  const setMultiAt = (i, v) => setMultiUrls((arr) => arr.map((u, idx) => (idx === i ? v : u)));
  const addMulti = () => setMultiUrls((arr) => (arr.length >= MAX_IMAGES ? arr : [...arr, ""]));
  const removeMulti = (i) => setMultiUrls((arr) => arr.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setUrlError(null);
    const { style, texturePrompt, poseMode, ...rest } = options;
    const fragment = styleFragment(style);
    const tp = [texturePrompt, fragment].filter(Boolean).join(", ");

    try {
      setSubmitting(true);
      let task;
      if (source === "url") {
        if (!imageUrl.trim()) {
          setUrlError(t("form.imageUrlError"));
          setSubmitting(false);
          return;
        }
        task = await api.imageTo3d({
          imageUrl: imageUrl.trim(),
          ...rest,
          poseMode,
          texturePrompt: tp || undefined,
        });
      } else if (source === "multi") {
        const urls = multiUrls.map((u) => u.trim()).filter(Boolean);
        if (urls.length === 0) {
          setUrlError(t("form.imageUrlError"));
          setSubmitting(false);
          return;
        }
        task = await api.multiImageTo3d({
          imageUrls: urls,
          ...rest,
          texturePrompt: tp || undefined,
        });
      } else {
        if (!file) {
          toast.error(t("toast.noImageTitle"), t("toast.noImageBody"));
          setSubmitting(false);
          return;
        }
        task = await api.imageTo3dUpload(file, {
          ...rest,
          poseMode,
          texturePrompt: tp || undefined,
        });
      }
      toast.success(t("toast.startedTitle"), t("toast.startedBody"));
      onCreated(task);
    } catch (err) {
      toast.error(t("toast.startFailTitle"), tServer(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Segmented name="imgSource" options={sourceTabs} value={source} onChange={setSource} />

      <motion.div
        key={source}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {source === "url" && (
          <Field label={t("form.imageUrlLabel")} hint={t("form.imageUrlHint")} error={urlError}>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-app-faint" />
              <TextInput
                className="pl-10"
                placeholder={t("form.imageUrlPlaceholder")}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </Field>
        )}

        {source === "upload" && (
          <Field label={t("form.uploadLabel")}>
            <Dropzone file={file} onFile={setFile} />
          </Field>
        )}

        {source === "multi" && (
          <Field label={t("form.multiLabel")} hint={t("form.multiHint")} error={urlError}>
            <div className="space-y-2">
              {multiUrls.map((u, i) => (
                <div key={i} className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-app-faint" />
                    <TextInput
                      className="pl-10"
                      placeholder={`${t("form.imageUrlPlaceholder")}`}
                      value={u}
                      onChange={(e) => setMultiAt(i, e.target.value)}
                    />
                  </div>
                  {multiUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMulti(i)}
                      className="focus-ring rounded-lg p-2 text-app-faint hover:bg-app-line/10 hover:text-app-text"
                      aria-label="remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {multiUrls.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={addMulti}
                  className="focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-brand-violet hover:text-app-text"
                >
                  <Plus className="h-3.5 w-3.5" /> {t("form.addImage")}
                </button>
              )}
            </div>
          </Field>
        )}
      </motion.div>

      <AdvancedOptions
        value={options}
        onChange={setOptions}
        show={source === "multi" ? { poseMode: false } : {}}
      />

      <MagneticButton as="div" className="w-full" strength={0.2}>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          icon={source === "upload" ? Upload : Wand2}
          loading={submitting}
          disabled={disabled}
        >
          {t("form.generateModel")}
        </Button>
      </MagneticButton>
    </form>
  );
}
