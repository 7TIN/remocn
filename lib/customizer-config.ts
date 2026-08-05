import type { BackdropFill } from "@/registry/remocn/backdrop";

export type ControlType =
  | { type: "text"; default: string; label: string }
  | {
      type: "number";
      default: number;
      min: number;
      max: number;
      step: number;
      label: string;
    }
  | {
      type: "number-input";
      default: number;
      min: number;
      max: number;
      step: number;
      label: string;
    }
  | { type: "color"; default: string; label: string }
  | { type: "select"; default: string; options: string[]; label: string }
  | { type: "boolean"; default: boolean; label: string };

export type ControlConfig = Record<string, ControlType>;

export interface ComponentConfig {
  controls: ControlConfig;
  durationInFrames: number;
  fps: number;
  compositionWidth: number;
  compositionHeight: number;
  /**
   * Import statement shown in the generated code snippet.
   * Example: `import { SoftBlurIn } from "@/components/remocn/soft-blur-in";`
   */
  importPath: string;
  /**
   * Pascal-case component name used in the generated JSX snippet.
   */
  componentName: string;
  /**
   * Optional custom code-snippet generator. When present, the preview's
   * `generateCode` delegates to it instead of the default prop serializer
   * (used by the ui-tier primitives to emit a `steps={[…]}` literal and omit
   * preview-only props). Components without it keep the default path.
   */
  snippet?: (values: Record<string, unknown>) => string;
  previewBackdrop?: BackdropFill;
}

export const FPS = 30;
export const W = 1280;
export const H = 720;
export const FONT_WEIGHT_OPTIONS = ["400", "500", "600", "700"];

/**
 * Controls present on every animation. Merged into each component's controls
 * by `resolveControls` so every animation in the customizer exposes the same
 * baseline knobs.
 */
export const SHARED_CONTROLS: ControlConfig = {
  speed: {
    type: "number",
    default: 1,
    min: 0.25,
    max: 4,
    step: 0.25,
    label: "Speed",
  },
};

/** Components that opt out of the shared `speed` control entirely. */
const NO_SHARED_SPEED = new Set(["backdrop"]);

/**
 * Components whose animation rides a shared progress driver that must reach its
 * final frame — a count-up landing on the last frame, a lockup revealed at a
 * fixed point. A speed < 1 stalls the driver before the payoff, so these cap
 * `speed` at a minimum of 1 instead of the shared 0.25.
 */
const SPEED_MIN_ONE = new Set([
  "chat-gpt",
  "claude-chat",
  "claude-code",
  "github-sponsors",
  "github-stars",
  "number-wheel",
  "opencode",
  "rolling-number",
  "v0",
  "x-follow-card",
  "x-followers-overview",
]);

const SPEED_MIN_ONE_CONTROL: ControlType = {
  type: "number",
  default: 1,
  min: 1,
  max: 4,
  step: 0.25,
  label: "Speed",
};

export function resolveControls(
  slug: string,
  controls: ControlConfig,
): ControlConfig {
  const out: ControlConfig = { ...controls, ...SHARED_CONTROLS };
  if (NO_SHARED_SPEED.has(slug)) {
    delete out.speed;
    return out;
  }
  // Reassigning the existing key keeps `speed` in its merged position.
  if (SPEED_MIN_ONE.has(slug)) out.speed = SPEED_MIN_ONE_CONTROL;
  return out;
}

export function resolveConfig(
  slug: string,
  config: ComponentConfig,
): ComponentConfig {
  return { ...config, controls: resolveControls(slug, config.controls) };
}

export function getDefaults(controls: ControlConfig): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, ctrl] of Object.entries(controls)) {
    out[key] = ctrl.default;
  }
  return out;
}
