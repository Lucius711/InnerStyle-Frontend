// Option lists mirrored from the InnerStyle backend DTOs / enums.
// Source of truth: com.innerstyle.meshy.* (see InnerStyle-Backend).

export const AI_MODELS = [
  { value: "latest", label: "Latest" },
  { value: "meshy-6", label: "Meshy 6" },
  { value: "meshy-5", label: "Meshy 5" },
];

export const TOPOLOGIES = [
  { value: "triangle", label: "Triangle", hint: "Best for games & realtime" },
  { value: "quad", label: "Quad", hint: "Best for sculpting & re-topo" },
];

export const POSE_MODES = [
  { value: "", label: "None" },
  { value: "a-pose", label: "A-pose" },
  { value: "t-pose", label: "T-pose" },
];

export const TARGET_FORMATS = ["glb", "fbx", "obj", "stl", "usdz", "3mf"];

// Model style presets. `fragment` is appended to the prompt / texture prompt sent to Meshy
// to steer the look. (Strongest effect on Text->3D; on Image->3D it guides texture/color.)
export const MODEL_STYLES = [
  { value: "default", fragment: "" },
  {
    value: "chibi",
    fragment:
      "chibi style, cute stylized character, large head, small short body, smooth rounded cartoon shapes",
  },
  {
    value: "human",
    fragment:
      "realistic human, lifelike anatomical proportions, detailed, natural look",
  },
];

// Polycount slider bounds (backend: @Min 100 / @Max 300000)
export const POLYCOUNT = { min: 1000, max: 300000, step: 1000, default: 30000 };

// Remesh dialog presets (mirrors Meshy's "Target polygon count" chips).
export const REMESH_POLY_PRESETS = [
  { value: 3000, label: "3K" },
  { value: 10000, label: "10K" },
  { value: 30000, label: "30K" },
];

// Meshy can only UV-unwrap triangle meshes of 40K faces or fewer. Toggling UV unwrap
// therefore forces triangle topology and caps the target polycount at this bound.
export const UV_UNWRAP_MAX_POLYCOUNT = 40000;

// Task lifecycle
export const TERMINAL_STATUSES = ["SUCCEEDED", "FAILED", "CANCELED"];

export const STATUS_META = {
  PENDING: { label: "Queued", tone: "amber" },
  IN_PROGRESS: { label: "Generating", tone: "violet" },
  SUCCEEDED: { label: "Ready", tone: "emerald" },
  FAILED: { label: "Failed", tone: "rose" },
  CANCELED: { label: "Canceled", tone: "slate" },
};
