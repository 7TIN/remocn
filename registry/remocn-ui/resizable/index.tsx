"use client";

import type { ReactNode } from "react";
import { clamp01, mixOklch, type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type ResizableHandleState = "idle" | "hover" | "press";

export type ResizableDirection = "horizontal" | "vertical";

// ===========================================================================
// Resizable visual — the COMPLETE animated look for a moment in time. This is a
// DUAL-channel atom (value-channel deviation §0, like slider): the numeric
// `ratio` animates as a lerp while the handle visuals (`handleScale`,
// `handleRingOpacity`) come from a `handleState` preset. Both live in one
// `ResizableStyle`; `useResizableTransition` feeds an interpolated one through
// the `style` prop. The component never reads the frame.
// ===========================================================================

export interface ResizableStyle {
  /** Fraction of the FIRST panel, 0–1 (clamped to [minRatio, maxRatio]). */
  ratio: number;
  /** Handle grip zoom: 1 idle, grows on hover/press. */
  handleScale: number;
  /** Handle grab-ring opacity 0 (idle) → 1 (hover/press). */
  handleRingOpacity: number;
}

export interface ResizableProps {
  /** First panel content. Defaults to a muted placeholder card. */
  first?: ReactNode;
  /** Second panel content. Defaults to a muted placeholder card. */
  second?: ReactNode;
  /** Split direction — both implemented (horizontal splits width, vertical height). */
  direction?: ResizableDirection;
  /** Fraction of the first panel, 0–1 (snap path). Ignored when `style` is set. */
  ratio?: number;
  /** Handle visual state (snap path). Ignored when `style` is set. */
  handleState?: ResizableHandleState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `ratio`/`handleState` — feed it an interpolated `ResizableStyle` from
   * `useResizableTransition`.
   */
  style?: ResizableStyle;
  /** Minimum first-panel fraction. Default 0.15. */
  minRatio?: number;
  /** Maximum first-panel fraction. Default 0.85. */
  maxRatio?: number;
  /** Container size in px (width for horizontal, height for vertical primary axis). */
  width?: number;
  height?: number;
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  className?: string;
}

/** Divider thickness (px). */
const DIVIDER = 1;
/** Grip pill dimensions (px) — shadcn `h-6 w-1`. */
const GRIP_LONG = 24;
const GRIP_SHORT = 4;
/** Grab-ring spread (px) at full opacity. */
const RING_WIDTH = 4;

/** Clamp a ratio into [minRatio, maxRatio]. */
function clampRatio(ratio: number, minRatio: number, maxRatio: number): number {
  return Math.min(maxRatio, Math.max(minRatio, ratio));
}

/**
 * The handle-channel preset for a state — pure `(handleState) => {handleScale,
 * handleRingOpacity}`. Hover and press both grow the grip and show the ring;
 * press grows it a touch more. The `ratio` channel is independent of this.
 */
export function resizableHandleStyle(handleState: ResizableHandleState): {
  handleScale: number;
  handleRingOpacity: number;
} {
  switch (handleState) {
    case "hover":
      return { handleScale: 1.15, handleRingOpacity: 1 };
    case "press":
      return { handleScale: 1.25, handleRingOpacity: 1 };
    default:
      return { handleScale: 1, handleRingOpacity: 0 };
  }
}

/** Concrete colors for the active theme, resolved once per render. */
export interface ResizableStyleContext {
  containerBg: string;
  border: string;
  panelBg: string;
  grip: string;
  /** Grab ring — a visible halo derived from the ring token (US-006 contrast). */
  ring: string;
  placeholderFg: string;
  radius: number;
}

/**
 * Derive the concrete colors for a theme. Pure. The grab ring is a real mix of
 * the ring token toward the background (not a duplicate token), so it reads as a
 * distinct halo in both light and dark.
 */
export function resizableStyleContext(theme: RemocnTheme): ResizableStyleContext {
  return {
    containerBg: theme.background,
    border: theme.border,
    panelBg: theme.muted,
    grip: theme.border,
    ring: mixOklch(theme.ring, theme.background, 0.6),
    placeholderFg: theme.mutedForeground,
    radius: theme.radius,
  };
}

/**
 * The COMPLETE resting visual for the snap path — a pure `(ratio, handleState)
 * => ResizableStyle` map. The ratio is NOT clamped here (the renderer clamps
 * with the active min/max); the handle visuals come from the preset.
 */
export function resizableStyle(
  ratio: number,
  handleState: ResizableHandleState,
): ResizableStyle {
  const handle = resizableHandleStyle(handleState);
  return {
    ratio,
    handleScale: handle.handleScale,
    handleRingOpacity: handle.handleRingOpacity,
  };
}

/** Default placeholder card for a panel slot. */
function Placeholder({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        color,
      }}
    >
      {label}
    </div>
  );
}

export function Resizable({
  first,
  second,
  direction = "horizontal",
  ratio = 0.5,
  handleState = "idle",
  style,
  minRatio = 0.15,
  maxRatio = 0.85,
  width = 440,
  height = 240,
  theme: themeOverride,
  mode,
  className,
}: ResizableProps) {
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = resizableStyleContext(theme);

  const v = style ?? resizableStyle(ratio, handleState);
  const pct = clampRatio(v.ratio, minRatio, maxRatio) * 100;
  const isHorizontal = direction === "horizontal";

  // The grip is a long pill along the divider; long axis is perpendicular to the
  // split direction (vertical pill for a horizontal split, and vice versa).
  const gripW = isHorizontal ? GRIP_SHORT : GRIP_LONG;
  const gripH = isHorizontal ? GRIP_LONG : GRIP_SHORT;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.background,
        fontFamily:
          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          width,
          height,
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          background: ctx.containerBg,
          border: `1px solid ${ctx.border}`,
          borderRadius: ctx.radius,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* First panel — sized by ratio along the split axis. */}
        <div
          style={{
            flex: "none",
            [isHorizontal ? "width" : "height"]: `${pct}%`,
            background: ctx.panelBg,
            overflow: "hidden",
          }}
        >
          {first ?? <Placeholder label="Panel one" color={ctx.placeholderFg} />}
        </div>
        {/* Divider — a 1px border-color line; grip pill centered on it. */}
        <div
          style={{
            position: "relative",
            flex: "none",
            [isHorizontal ? "width" : "height"]: DIVIDER,
            background: ctx.border,
          }}
        >
          {/* Grab ring behind the grip, fading in on hover/press. */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: gripW + RING_WIDTH * 2,
              height: gripH + RING_WIDTH * 2,
              transform: `translate(-50%, -50%) scale(${v.handleScale})`,
              borderRadius: 999,
              background: ctx.ring,
              opacity: v.handleRingOpacity,
            }}
          />
          {/* Grip pill — scales on grab. */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: gripW,
              height: gripH,
              transform: `translate(-50%, -50%) scale(${v.handleScale})`,
              borderRadius: 999,
              background: ctx.grip,
            }}
          />
        </div>
        {/* Second panel — fills the remainder. */}
        <div
          style={{
            flex: "1 1 0",
            background: ctx.panelBg,
            overflow: "hidden",
          }}
        >
          {second ?? <Placeholder label="Panel two" color={ctx.placeholderFg} />}
        </div>
      </div>
    </div>
  );
}
