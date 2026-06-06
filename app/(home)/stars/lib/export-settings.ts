import type { RegistryEntry } from "@/registry/__index__";
import { dims } from "./dims";
import type { Orientation } from "./types";

// Render the export cheaper than the 30fps preview: lower resolution + fps.
// The composition's motion is purely frame/durationInFrames ratios (no
// spring, never reads fps), so a 24fps/240-frame render is real-time
// identical to 30fps/300 — only the encode + per-frame cost drops (≈2-3×
// faster). Raise EXPORT_SCALE/EXPORT_FPS to trade speed for fidelity.
export const EXPORT_SCALE = 0.7;
export const EXPORT_FPS = 24;

const even = (n: number) => Math.max(2, Math.round((n * EXPORT_SCALE) / 2) * 2);

/** Pure composition descriptor for the web-renderer MP4 export. */
export function buildExportComposition(
  entry: RegistryEntry,
  orientation: Orientation,
) {
  const base = dims(orientation);
  const durationInFrames = Math.max(
    1,
    Math.round(
      (entry.config.durationInFrames / entry.config.fps) * EXPORT_FPS,
    ),
  );
  return {
    id: "github-stars",
    component: entry.Component,
    durationInFrames,
    fps: EXPORT_FPS,
    width: even(base.width),
    height: even(base.height),
  };
}
