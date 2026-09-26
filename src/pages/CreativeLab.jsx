import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wand2,
  View,
  Download,
  ArrowLeft,
  Loader2,
  Cuboid,
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import Button from "@/components/ui/Button";
import { Segmented, TextArea } from "@/components/ui/FormControls";
import ModelViewer from "@/components/three/ModelViewer";
import ModelEditor from "@/components/three/ModelEditor";
import ArPreview from "@/components/three/ArPreview";
import DownloadSettings from "@/components/studio/DownloadSettings";
import PipelinePanel from "@/components/studio/PipelinePanel";
import { api } from "@/lib/api";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { usePipelineActions } from "@/hooks/usePipelineActions";
import { useTaskPolling } from "@/hooks/useTaskPolling";
import { TERMINAL_STATUSES } from "@/lib/constants";

function isViewable(task) {
  if (!task) return false;
  return (
    (task.modelUrls && Object.keys(task.modelUrls).length > 0) ||
    (task.animationUrls && Object.keys(task.animationUrls).length > 0)
  );
}

function webModelFormat(task) {
  const urls = task?.modelUrls || {};
  if (urls.glb) return "glb";
  if (urls.gltf) return "gltf";
  return null;
}

function previewModelFormat(task) {
  const urls = task?.modelUrls || {};
  return ["glb", "gltf", "fbx", "obj", "stl"].find((f) => urls[f]) || null;
}

/**
 * Creative Lab — editor-only view, opened via /lab/:taskId.
 * Access it from My Models (the "Edit 3D" button on each task card).
 * /lab without a taskId redirects to /my-3d-printing.
 */
export default function CreativeLab() {
  const { t, tServer } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const { taskId } = useParams();

  // No taskId → send back to the model library
  if (!taskId) return <Navigate to="/my-3d-printing" replace />;

  const [task, setTask] = useState(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [modelVersion, setModelVersion] = useState(0);
  const [arOpen, setArOpen] = useState(false);

  const editPoll = useTaskPolling();
  const { actions, busyAction } = usePipelineActions((next) => editPoll.start(next));
  const editing = busyAction != null || editPoll.isPolling;

  useEffect(() => {
    const edited = editPoll.task;
    if (!edited || !TERMINAL_STATUSES.includes(edited.status)) return;
    if (edited.status === "SUCCEEDED" && isViewable(edited)) {
      setTask(edited);
      setModelVersion(Date.now());
    } else {
      toast.error(t("lab.loadFailTitle"), edited.error || "");
    }
    editPoll.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editPoll.task]);

  const applyPromptEdit = useCallback(
    (mode, prompt) => {
      const text = (prompt || "").trim();
      if (!text || !task || editing) return;
      if (mode === "refine") actions.onRefine(task, { texturePrompt: text });
      else actions.onRetexture(task, { textStylePrompt: text, enablePbr: true });
    },
    [task, editing, actions]
  );

  useEffect(() => {
    let alive = true;
    setLoadingTask(true);
    api
      .getTask(taskId)
      .then((fetched) => { if (alive) setTask(fetched); })
      .catch((err) => {
        if (alive) toast.error(t("lab.loadFailTitle"), tServer(err.message));
      })
      .finally(() => { if (alive) setLoadingTask(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const goBack = () => navigate("/my-3d-printing");

  const webFormat = webModelFormat(task);
  const previewFormat = previewModelFormat(task);
  const modelVer = modelVersion || (task?.updatedAt ? Date.parse(task.updatedAt) || "" : "");
  const suffix = modelVer ? `&v=${modelVer}` : "";
  const previewUrl = task && previewFormat ? api.modelUrl(task.id, previewFormat) + suffix : null;
  const editUrl = task && webFormat ? api.modelUrl(task.id, webFormat) + suffix : null;
  const textures = (task?.textureUrls || []).filter(Boolean);
  const baseColorUrl = textures[0]?.base_color ? api.textureUrl(task.id, "base_color") : null;

  if (loadingTask) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-brand-violet" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-app-muted">{t("lab.loadFailTitle")}</p>
        <Button variant="secondary" icon={ArrowLeft} onClick={goBack}>
          {t("lab.changeModel")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Seo title="Creative Lab" noindex />

      {editUrl ? (
        <ModelEditor
          open
          url={editUrl}
          baseColorUrl={baseColorUrl}
          task={task}
          onModelUpdated={() => setModelVersion(Date.now())}
          onClose={goBack}
          leftPanel={
            <LabSidePanel
              task={task}
              onBack={goBack}
              onAr={() => setArOpen(true)}
              onEdit={applyPromptEdit}
              editing={editing}
              actions={actions}
              busyAction={busyAction}
              t={t}
            />
          }
        />
      ) : (
        <Workbench task={task} previewUrl={previewUrl} onBack={goBack} t={t} />
      )}

      <ArPreview
        open={arOpen}
        onClose={() => setArOpen(false)}
        glbUrl={editUrl}
        taskId={task?.id}
        posterUrl={api.mediaUrl(task?.thumbnailUrl)}
      />
    </>
  );
}

/* ------------------------------------------------- editor left panel */

function LabSidePanel({ task, onBack, onAr, onEdit, editing, actions, busyAction, t }) {
  const [imgError, setImgError] = useState(false);
  const [editMode, setEditMode] = useState("retexture");
  const [prompt, setPrompt] = useState("");
  const img = task.thumbnailUrl && !imgError ? api.mediaUrl(task.thumbnailUrl) : "/model-placeholder.svg";
  const isUploaded = task.taskType === "UPLOADED";

  const modeTabs = [
    { value: "retexture", label: t("lab.editRetexture") },
    { value: "refine", label: t("lab.editRefine") },
  ];

  const submit = () => {
    if (!prompt.trim() || editing) return;
    onEdit?.(editMode, prompt);
    setPrompt("");
  };

  return (
    <div className="flex h-full max-lg:h-auto flex-col gap-4 overflow-y-auto p-4">
      <button
        type="button"
        onClick={onBack}
        className="focus-ring flex w-fit shrink-0 items-center gap-2 rounded-full border border-app-line/10 bg-app-line/[0.04] px-3 py-1.5 text-xs font-medium text-app-text transition hover:bg-app-line/10"
      >
        <ArrowLeft className="h-4 w-4" /> {t("lab.changeModel")}
      </button>

      <div className="shrink-0 overflow-hidden rounded-2xl border border-app-line/10 bg-app-elevated">
        <div className="aspect-square w-full overflow-hidden bg-[radial-gradient(ellipse_at_center,#1b2030,#070810)]">
          <img src={img} alt="" onError={() => setImgError(true)} className="h-full w-full object-cover" />
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold text-app-text">{t("lab.workbenchTitle")}</p>
          <p className="mt-0.5 truncate text-xs text-app-muted">
            {(task.taskType || "MODEL").replace(/_/g, " ").toLowerCase()}
          </p>
        </div>
      </div>

      <Button variant="primary" icon={View} className="w-full shrink-0" onClick={onAr}>
        {t("studio.ar.cta")}
      </Button>

      {isUploaded ? (
        <div className="shrink-0 rounded-2xl border border-dashed border-app-line/10 px-4 py-5 text-center text-xs text-app-faint">
          <Wand2 className="mx-auto mb-2 h-4 w-4 opacity-40" />
          {t("lab.editUploadedNote")}
        </div>
      ) : (
        <div className="shrink-0 rounded-2xl border border-app-line/10 bg-app-line/[0.04] p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-app-text">
            <Wand2 className="h-3.5 w-3.5 text-brand-violet" /> {t("lab.editTitle")}
          </p>
          <Segmented name="labEditMode" options={modeTabs} value={editMode} onChange={setEditMode} />
          <TextArea
            className="mt-2 min-h-[72px]"
            placeholder={t("lab.editPromptPh")}
            value={prompt}
            maxLength={600}
            disabled={editing}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            variant="primary"
            icon={editing ? undefined : Wand2}
            className="mt-2 w-full"
            loading={editing}
            disabled={editing || !prompt.trim()}
            onClick={submit}
          >
            {editing ? t("lab.editGenerating") : t("lab.editApply")}
          </Button>
          <p className="mt-2 text-[11px] leading-relaxed text-app-faint">{t("lab.editHint")}</p>
        </div>
      )}

      {/* Continue the pipeline — moved here from the Studio result panel. */}
      <PipelinePanel task={task} actions={actions} busyAction={busyAction} />

      <p className="mt-auto shrink-0 pt-2 text-[11px] leading-relaxed text-app-faint">{t("lab.workbenchHint")}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ workbench (preview-only for non-GLB) */

function Workbench({ task, previewUrl, onBack, t }) {
  const [showDownloads, setShowDownloads] = useState(false);
  const hasFiles = task.modelUrls && Object.keys(task.modelUrls).length > 0;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 bg-app-bg"
    >
      {previewUrl ? (
        <ModelViewer url={previewUrl} thumbnailUrl={api.mediaUrl(task.thumbnailUrl)} className="h-full w-full" bare />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,#2a3145,#0d1019)] p-6 text-center">
          {task.thumbnailUrl ? (
            <img
              src={api.mediaUrl(task.thumbnailUrl)}
              alt=""
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/model-placeholder.svg"; }}
              className="max-h-72 w-auto rounded-2xl border border-app-line/10 object-contain shadow-card"
            />
          ) : (
            <Cuboid className="h-16 w-16 text-app-faint" />
          )}
          <p className="max-w-xs text-sm text-app-muted">{t("lab.noWebPreview")}</p>
        </div>
      )}

      <div className="absolute left-4 top-24 flex max-w-[260px] flex-col gap-3 sm:left-6">
        <button
          type="button"
          onClick={onBack}
          className="glass focus-ring flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-line/10"
        >
          <ArrowLeft className="h-4 w-4" /> {t("lab.changeModel")}
        </button>
      </div>

      <div className="absolute right-4 top-24 flex w-56 flex-col gap-2 sm:right-6">
        {hasFiles && (
          <Button variant="outline" icon={Download} className="w-full" onClick={() => setShowDownloads((v) => !v)}>
            {t("studio.downloadSettings")}
          </Button>
        )}
        <p className="glass rounded-xl px-3 py-2 text-[11px] leading-relaxed text-app-muted">
          {t("lab.editGlbOnly")}
        </p>
      </div>

      {hasFiles && showDownloads && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass absolute bottom-4 right-4 w-72 rounded-2xl p-4 sm:right-6"
        >
          <h4 className="mb-2.5 flex items-center gap-2 text-sm font-medium text-app-text">
            <Download className="h-4 w-4 text-brand-violet" /> {t("studio.downloadSettings")}
          </h4>
          <DownloadSettings task={task} />
        </motion.div>
      )}
    </motion.div>,
    document.body
  );
}
