import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  Boxes,
  UploadCloud,
  Wand2,
  View,
  Download,
  RefreshCw,
  ArrowLeft,
  Loader2,
  Cuboid,
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import { Segmented, Field } from "@/components/ui/FormControls";
import ModelViewer from "@/components/three/ModelViewer";
import ModelEditor from "@/components/three/ModelEditor";
import ArPreview from "@/components/three/ArPreview";
import ModelDropzone from "@/components/studio/ModelDropzone";
import DownloadSettings from "@/components/studio/DownloadSettings";
import { api } from "@/lib/api";
import { convertToGlb, needsGlbConversion } from "@/lib/convertModel";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { TERMINAL_STATUSES } from "@/lib/constants";

const PAGE_SIZE = 12;

/** True when a task has any downloadable mesh at all. */
function isViewable(task) {
  if (!task) return false;
  return (
    (task.modelUrls && Object.keys(task.modelUrls).length > 0) ||
    (task.animationUrls && Object.keys(task.animationUrls).length > 0)
  );
}

/**
 * The 3D editor and AR use GLTFLoader/GLTFExporter + <model-viewer>, which only handle glb/gltf.
 * Generated Meshy models always ship a glb; imported OBJ/FBX/STL don't, so editing/AR stay gated
 * to glb/gltf even though the viewer itself can preview all of these formats.
 */
function webModelFormat(task) {
  const urls = task?.modelUrls || {};
  if (urls.glb) return "glb";
  if (urls.gltf) return "gltf";
  return null;
}

/** Best format the in-browser viewer can render (it picks a three.js loader per format). */
function previewModelFormat(task) {
  const urls = task?.modelUrls || {};
  return ["glb", "gltf", "fbx", "obj", "stl"].find((f) => urls[f]) || null;
}

/**
 * Creative Lab ("Phòng thí nghiệm sáng tạo") — the single home for working on a finished
 * 3D model: pick one you've already generated (or upload a 3D file), then edit it in 3D or
 * preview it in AR. The heavy editor / AR views are the existing modals, reused here.
 */
export default function CreativeLab() {
  const { t, tServer } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [source, setSource] = useState("existing"); // 'existing' | 'upload'
  const [task, setTask] = useState(null); // the selected model
  const [loadingTask, setLoadingTask] = useState(false);
  const [modelVersion, setModelVersion] = useState(0);
  const [arOpen, setArOpen] = useState(false);

  const selectTask = useCallback(
    (picked) => {
      setTask(picked);
      if (picked?.id && picked.id !== taskId) {
        navigate(`/lab/${picked.id}`, { replace: false });
      }
    },
    [navigate, taskId]
  );

  // Deep link: /lab/:taskId loads that model directly.
  useEffect(() => {
    if (!taskId || task?.id === taskId) return;
    let alive = true;
    setLoadingTask(true);
    api
      .getTask(taskId)
      .then((fetched) => alive && setTask(fetched))
      .catch((err) => {
        if (alive) toast.error(t("lab.loadFailTitle"), tServer(err.message));
      })
      .finally(() => alive && setLoadingTask(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const clearSelection = () => {
    setTask(null);
    setArOpen(false);
    navigate("/lab", { replace: false });
  };

  const webFormat = webModelFormat(task); // glb | gltf → editable + AR-able
  const previewFormat = previewModelFormat(task); // any renderable format for the viewer
  const modelVer = modelVersion || (task?.updatedAt ? Date.parse(task.updatedAt) || "" : "");
  const suffix = modelVer ? `&v=${modelVer}` : "";
  const previewUrl = previewFormat ? api.modelUrl(task.id, previewFormat) + suffix : null;
  const editUrl = webFormat ? api.modelUrl(task.id, webFormat) + suffix : null;
  const textures = (task?.textureUrls || []).filter(Boolean);
  const baseColorUrl = textures[0]?.baseColor ? api.textureUrl(task.id, "base_color") : null;

  return (
    <>
      <Seo title="Creative Lab" noindex />

      {task && !loadingTask ? (
        editUrl ? (
          // glb/gltf → the full editor, embedded: image left, model centre, controls right.
          <ModelEditor
            open
            url={editUrl}
            baseColorUrl={baseColorUrl}
            task={task}
            onModelUpdated={() => setModelVersion(Date.now())}
            onClose={clearSelection}
            leftPanel={
              <LabSidePanel
                task={task}
                onBack={clearSelection}
                onAr={() => setArOpen(true)}
                t={t}
              />
            }
          />
        ) : (
          // OBJ/FBX/STL → preview only (the editor can't load non-glb meshes).
          <Workbench task={task} previewUrl={previewUrl} onBack={clearSelection} t={t} />
        )
      ) : (
        <div className="relative min-h-screen px-6 pb-24 pt-28">
          <div className="mx-auto max-w-6xl">
            <Reveal direction="up">
              <div className="flex flex-col items-start gap-4">
                <Badge tone="violet" dot>
                  <FlaskConical className="h-3 w-3" /> {t("lab.badge")}
                </Badge>
                <h1 className="font-display text-4xl font-bold tracking-tight text-app-text sm:text-5xl">
                  {t("lab.title")} <span className="text-gradient">{t("lab.titleHi")}</span>
                </h1>
                <p className="max-w-xl text-app-muted">{t("lab.subtitle")}</p>
              </div>
            </Reveal>

            <div className="mt-10">
              {loadingTask ? (
                <div className="glass flex min-h-[420px] items-center justify-center rounded-3xl">
                  <Loader2 className="h-7 w-7 animate-spin text-brand-violet" />
                </div>
              ) : (
                <ModelSource
                  source={source}
                  setSource={setSource}
                  onPick={selectTask}
                  t={t}
                  tServer={tServer}
                  toast={toast}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* AR preview — opened from the Lab side panel. */}
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

/* ------------------------------------------------- editor left panel (source image) */

function LabSidePanel({ task, onBack, onAr, t }) {
  const [imgError, setImgError] = useState(false);
  const img = task.thumbnailUrl && !imgError ? api.mediaUrl(task.thumbnailUrl) : "/model-placeholder.svg";
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <button
        type="button"
        onClick={onBack}
        className="focus-ring flex w-fit items-center gap-2 rounded-full border border-app-line/10 bg-app-line/[0.04] px-3 py-1.5 text-xs font-medium text-app-text transition hover:bg-app-line/10"
      >
        <ArrowLeft className="h-4 w-4" /> {t("lab.changeModel")}
      </button>

      <div className="overflow-hidden rounded-2xl border border-app-line/10 bg-app-elevated">
        <div className="aspect-square w-full overflow-hidden bg-[radial-gradient(ellipse_at_center,#1b2030,#070810)]">
          <img
            src={img}
            alt=""
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold text-app-text">{t("lab.workbenchTitle")}</p>
          <p className="mt-0.5 truncate text-xs text-app-muted">
            {(task.taskType || "MODEL").replace(/_/g, " ").toLowerCase()}
          </p>
        </div>
      </div>

      <Button variant="primary" icon={View} className="w-full" onClick={onAr}>
        {t("studio.ar.cta")}
      </Button>

      <p className="mt-auto text-[11px] leading-relaxed text-app-faint">{t("lab.workbenchHint")}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ workbench */

/**
 * Preview-only stage for non-glb models (OBJ/FBX/STL): the editor can't load those, so we just
 * show the full-screen 360° preview plus back + download. glb/gltf models get the full editor.
 */
function Workbench({ task, previewUrl, onBack, t }) {
  const [showDownloads, setShowDownloads] = useState(false);
  const hasFiles = task.modelUrls && Object.keys(task.modelUrls).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 bg-app-bg"
    >
      {/* Full-bleed 360° stage */}
      {previewUrl ? (
        <ModelViewer
          url={previewUrl}
          thumbnailUrl={api.mediaUrl(task.thumbnailUrl)}
          className="h-full w-full"
          bare
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,#2a3145,#0d1019)] p-6 text-center">
          {task.thumbnailUrl ? (
            <img
              src={api.mediaUrl(task.thumbnailUrl)}
              alt=""
              className="max-h-72 w-auto rounded-2xl border border-app-line/10 object-contain shadow-card"
            />
          ) : (
            <Cuboid className="h-16 w-16 text-app-faint" />
          )}
          <p className="max-w-xs text-sm text-app-muted">{t("lab.noWebPreview")}</p>
        </div>
      )}

      {/* Top-left: back + model card */}
      <div className="absolute left-4 top-24 flex max-w-[260px] flex-col gap-3 sm:left-6">
        <button
          type="button"
          onClick={onBack}
          className="glass focus-ring flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-line/10"
        >
          <ArrowLeft className="h-4 w-4" /> {t("lab.changeModel")}
        </button>
        <div className="glass flex items-center gap-3 rounded-2xl p-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-app-line/10 bg-app-line/[0.04]">
            {task.thumbnailUrl ? (
              <img src={api.mediaUrl(task.thumbnailUrl)} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-app-faint">
                <Cuboid className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-app-text">{t("lab.workbenchTitle")}</p>
            <p className="truncate text-xs text-app-muted">
              {(task.taskType || "MODEL").replace(/_/g, " ").toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Top-right: download + note (editing/AR need glb) */}
      <div className="absolute right-4 top-24 flex w-56 flex-col gap-2 sm:right-6">
        {hasFiles && (
          <Button
            variant="outline"
            icon={Download}
            className="w-full"
            onClick={() => setShowDownloads((v) => !v)}
          >
            {t("studio.downloadSettings")}
          </Button>
        )}
        <p className="glass rounded-xl px-3 py-2 text-[11px] leading-relaxed text-app-muted">
          {t("lab.editGlbOnly")}
        </p>
      </div>

      {/* Downloads (collapsible) — bottom-right */}
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
    </motion.div>
  );
}

/* --------------------------------------------------------------- model source */

function ModelSource({ source, setSource, onPick, t, tServer, toast }) {
  const tabs = [
    { value: "existing", label: t("lab.sourceExisting") },
    { value: "upload", label: t("lab.sourceUpload") },
  ];
  return (
    <Reveal direction="up">
      <div className="glass rounded-3xl p-6">
        <div className="mb-6 max-w-sm">
          <Segmented name="labSource" options={tabs} value={source} onChange={setSource} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={source}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {source === "existing" ? (
              <ExistingModels onPick={onPick} t={t} tServer={tServer} toast={toast} />
            ) : (
              <UploadModel onPick={onPick} t={t} tServer={tServer} toast={toast} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

function ExistingModels({ onPick, t, tServer, toast }) {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (p, append) => {
      try {
        setLoading(true);
        const res = await api.listTasks({ status: "SUCCEEDED", page: p, size: PAGE_SIZE });
        const content = (res.content || []).filter(isViewable);
        setTasks((prev) => (append ? [...prev, ...content] : content));
        setLast(res.last !== false);
        setPage(p);
      } catch (err) {
        toast.error(t("lab.loadFailTitle"), tServer(err.message));
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    load(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && tasks.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-2xl bg-app-line/10" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-app-line/10 bg-app-line/[0.04] text-app-faint">
          <Boxes className="h-8 w-8" />
        </span>
        <p className="text-app-muted">{t("lab.emptyExisting")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onPick(task)}
            className="focus-ring group overflow-hidden rounded-2xl border border-app-line/10 bg-app-elevated text-left transition-colors hover:border-brand-violet/40"
          >
            <div className="aspect-square overflow-hidden bg-app-line/[0.04]">
              {task.thumbnailUrl ? (
                <img
                  src={api.mediaUrl(task.thumbnailUrl)}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-app-faint">
                  <Cuboid className="h-9 w-9" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="truncate text-xs font-medium text-app-muted">
                {(task.taskType || "MODEL").replace(/_/g, " ").toLowerCase()}
              </span>
              <Wand2 className="h-3.5 w-3.5 shrink-0 text-brand-violet opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>

      {!last && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" loading={loading} onClick={() => load(page + 1, true)}>
            {t("gallery.loadMore")}
          </Button>
        </div>
      )}
      <div className="mt-4 flex justify-center">
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => load(0, false)}>
          {t("gallery.refresh")}
        </Button>
      </div>
    </>
  );
}

function UploadModel({ onPick, t, tServer, toast }) {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [converting, setConverting] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  // Imported files may finish server-side a moment later — poll until the mesh is viewable.
  const waitViewable = (created) =>
    new Promise((resolve) => {
      if (isViewable(created) || TERMINAL_STATUSES.includes(created.status)) {
        resolve(created);
        return;
      }
      let tries = 0;
      pollRef.current = setInterval(async () => {
        tries += 1;
        try {
          const fresh = await api.getTask(created.id);
          if (isViewable(fresh) || TERMINAL_STATUSES.includes(fresh.status) || tries > 40) {
            clearInterval(pollRef.current);
            resolve(fresh);
          }
        } catch {
          if (tries > 40) {
            clearInterval(pollRef.current);
            resolve(created);
          }
        }
      }, 3000);
    });

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error(t("toast.noModelTitle"), t("toast.noModelBody"));
      return;
    }
    try {
      setSubmitting(true);
      // OBJ/FBX/STL can't be edited directly — convert to GLB in the browser first so the
      // uploaded model is fully previewable and editable. Fall back to the original on failure.
      let upload = file;
      if (needsGlbConversion(file)) {
        setConverting(true);
        try {
          upload = await convertToGlb(file);
        } catch {
          upload = file; // conversion failed — upload as-is (preview only)
        } finally {
          setConverting(false);
        }
      }
      const created = await api.importModelUpload(upload);
      const ready = await waitViewable(created);
      onPick(ready);
    } catch (err) {
      toast.error(t("toast.importFailTitle"), tServer(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-2xl border border-brand-cyan/20 bg-brand-cyan/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-app-text">
          <UploadCloud className="h-4 w-4 text-brand-cyan" /> {t("form.importTitle")}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-app-muted">{t("form.importDesc")}</p>
      </div>

      <Field label={t("form.importLabel")}>
        <ModelDropzone file={file} onFile={setFile} />
      </Field>

      <p className="rounded-xl border border-app-line/10 bg-app-line/[0.02] px-4 py-3 text-xs leading-relaxed text-app-faint">
        {t("form.importNote")}
      </p>

      <Button type="submit" size="lg" className="w-full" icon={UploadCloud} loading={submitting}>
        {converting ? t("lab.converting") : t("lab.uploadSubmit")}
      </Button>
      {file && needsGlbConversion(file) && (
        <p className="text-center text-[11px] text-app-faint">{t("lab.convertHint")}</p>
      )}
    </form>
  );
}
