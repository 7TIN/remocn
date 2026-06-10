"use client";

import { useCurrentFrame } from "remotion";
import { clamp01, type EasingName, easings } from "@/lib/remocn-ui";
import {
  resizableHandleStyle,
  type ResizableHandleState,
  type ResizableStyle,
} from "@/components/remocn/resizable";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/**
 * One scripted resizable keyframe. A step may move the `ratio` channel, the
 * `handleState` channel, or both. The ratio eases from the previous ratio-bearing
 * step to this one; the handle visual tweens from the previous handle-bearing
 * step's preset to this one.
 */
export interface ResizableStep {
  /** LOCAL (Sequence-relative) authored frame this keyframe is reached. */
  at: number;
  /** Target first-panel fraction 0–1 (this step moves the ratio channel). */
  ratio?: number;
  /** Target handle state (this step moves the handle channel). */
  handleState?: ResizableHandleState;
  /** Frames the move INTO this step takes. Omitted → DEFAULT_DURATION. */
  duration?: number;
  /** Override the easing for the move into this step. Default `out`. */
  easing?: EasingName;
}

/** Default frames for a move into a step when it omits `duration`. */
export const DEFAULT_DURATION = 18;

export interface ResizableTransitionOptions {
  /** Playhead scale (effectiveFrame = useCurrentFrame() * speed). */
  speed?: number;
  /** Move duration (frames) when a step omits `duration`. */
  defaultDuration?: number;
}

/** Blend two resizable visuals: all three fields lerp (ratio + handle channels). */
export function tweenResizableStyle(
  a: ResizableStyle,
  b: ResizableStyle,
  t: number,
): ResizableStyle {
  return {
    ratio: a.ratio + (b.ratio - a.ratio) * t,
    handleScale: a.handleScale + (b.handleScale - a.handleScale) * t,
    handleRingOpacity:
      a.handleRingOpacity + (b.handleRingOpacity - a.handleRingOpacity) * t,
  };
}

/**
 * Resolve the resizable's `ResizableStyle` for a dual-channel timeline. THIS is
 * the only frame-reading file — `<Resizable>` itself stays pure. The fold is a
 * pure function of `raw = useCurrentFrame() * speed`; tests replicate
 * `resizableStyleAt(steps, raw, opts)` with the frame injected.
 */
export function useResizableTransition(
  steps: ResizableStep[],
  opts: ResizableTransitionOptions = {},
): ResizableStyle {
  const { speed = 1 } = opts;
  const raw = useCurrentFrame() * speed;
  return resizableStyleAt(steps, raw, opts);
}

/** Eased ratio at `raw` over the ratio-bearing steps (numeric channel). */
function ratioAt(
  steps: ResizableStep[],
  raw: number,
  defaultDuration: number,
): number {
  const ratioSteps = steps.filter(
    (s): s is ResizableStep & { ratio: number } => s.ratio !== undefined,
  );
  if (ratioSteps.length === 0) return 0.5;
  const first = ratioSteps[0];
  if (raw <= first.at) return first.ratio;

  let toIndex = ratioSteps.length - 1;
  for (let i = 1; i < ratioSteps.length; i++) {
    if (ratioSteps[i].at > raw) {
      toIndex = i;
      break;
    }
  }
  const pastLast = raw >= ratioSteps[ratioSteps.length - 1].at;
  const to = pastLast ? ratioSteps[ratioSteps.length - 1] : ratioSteps[toIndex];
  const from = pastLast
    ? ratioSteps[ratioSteps.length - 1]
    : ratioSteps[toIndex - 1];

  const dur = to.duration ?? defaultDuration;
  const ease = easings[to.easing ?? "out"];
  const start = to.at - dur;
  const t = pastLast || dur <= 0 ? 1 : ease(clamp01((raw - start) / dur));
  return from.ratio + (to.ratio - from.ratio) * t;
}

/** Eased handle visual at `raw` over the handle-bearing steps (state channel). */
function handleAt(
  steps: ResizableStep[],
  raw: number,
  defaultDuration: number,
): { handleScale: number; handleRingOpacity: number } {
  const handleSteps = steps.filter(
    (s): s is ResizableStep & { handleState: ResizableHandleState } =>
      s.handleState !== undefined,
  );
  if (handleSteps.length === 0) return resizableHandleStyle("idle");
  const first = handleSteps[0];
  if (raw <= first.at) return resizableHandleStyle(first.handleState);

  let toIndex = handleSteps.length - 1;
  for (let i = 1; i < handleSteps.length; i++) {
    if (handleSteps[i].at > raw) {
      toIndex = i;
      break;
    }
  }
  const pastLast = raw >= handleSteps[handleSteps.length - 1].at;
  const to = pastLast
    ? handleSteps[handleSteps.length - 1]
    : handleSteps[toIndex];
  const from = pastLast
    ? handleSteps[handleSteps.length - 1]
    : handleSteps[toIndex - 1];

  const dur = to.duration ?? defaultDuration;
  const ease = easings[to.easing ?? "out"];
  const start = to.at - dur;
  const t = pastLast || dur <= 0 ? 1 : ease(clamp01((raw - start) / dur));

  const a = resizableHandleStyle(from.handleState);
  const b = resizableHandleStyle(to.handleState);
  return {
    handleScale: a.handleScale + (b.handleScale - a.handleScale) * t,
    handleRingOpacity:
      a.handleRingOpacity + (b.handleRingOpacity - a.handleRingOpacity) * t,
  };
}

/**
 * Pure core of `useResizableTransition` with the effective frame injected as
 * `raw`. The two channels are folded independently and merged: `ratio` eases over
 * the ratio-bearing steps, the handle visual tweens over the handle-bearing
 * steps. Kept separate so it can be unit-tested without a Remotion render.
 */
export function resizableStyleAt(
  steps: ResizableStep[],
  raw: number,
  opts: ResizableTransitionOptions = {},
): ResizableStyle {
  const { defaultDuration = DEFAULT_DURATION } = opts;
  const ratio = ratioAt(steps, raw, defaultDuration);
  const handle = handleAt(steps, raw, defaultDuration);
  return {
    ratio,
    handleScale: handle.handleScale,
    handleRingOpacity: handle.handleRingOpacity,
  };
}
