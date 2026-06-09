"use client";

import { type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type SwitchState = "unchecked" | "checked";

type SwitchSize = "sm" | "default" | "lg";

export interface SwitchProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: SwitchState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `state` — feed it an interpolated `SwitchStyle` from `useSwitchTransition`.
   */
  style?: SwitchStyle;
  /** Optional text label rendered next to the track. */
  label?: string;
  size?: SwitchSize;
  theme?: Partial<RemocnTheme>;
  /** Convenience override for the `primary` theme token — merged into `theme`. */
  primary?: string;
  mode?: "light" | "dark";
  className?: string;
}

const SIZE_STYLES: Record<
  SwitchSize,
  { trackW: number; trackH: number; thumb: number; pad: number; fontSize: number; gap: number }
> = {
  sm:      { trackW: 36, trackH: 20, thumb: 16, pad: 2, fontSize: 13, gap: 8 },
  default: { trackW: 44, trackH: 24, thumb: 20, pad: 2, fontSize: 15, gap: 10 },
  lg:      { trackW: 52, trackH: 28, thumb: 24, pad: 2, fontSize: 17, gap: 12 },
};

// ===========================================================================
// Switch visual — the COMPLETE animated look for a moment in time. A `state`
// is a named preset of this visual (`switchStyle`); the smooth path feeds an
// interpolated `SwitchStyle` straight through. The component is a pure
// renderer of whichever `SwitchStyle` it receives.
// ===========================================================================

export interface SwitchStyle {
  /** Animated track fill color (a concrete color, never "transparent"). */
  trackBackground: string;
  /**
   * Thumb position fraction 0→1: fraction of `travel` the thumb has slid.
   * 0 = unchecked (left), 1 = checked (right).
   */
  thumbOffset: number;
}

/** Concrete colors for the active theme, resolved once per render. */
export interface SwitchStyleContext {
  uncheckedTrack: string;
  checkedTrack: string;
  /** Static thumb fill color (never animated). */
  thumbColor: string;
}

/**
 * Derive the concrete colors for a theme. Pure — call it once and reuse the
 * result for every `switchStyle(state, ctx)` preset.
 */
export function switchStyleContext(theme: RemocnTheme): SwitchStyleContext {
  return {
    uncheckedTrack: theme.input,
    checkedTrack: theme.primary,
    thumbColor: theme.background,
  };
}

/**
 * The COMPLETE resting visual for a state — a pure `(state, ctx) => SwitchStyle`
 * map. To change how a state looks, edit one entry.
 */
export function switchStyle(
  state: SwitchState,
  ctx: SwitchStyleContext,
): SwitchStyle {
  switch (state) {
    case "checked":
      return {
        trackBackground: ctx.checkedTrack,
        thumbOffset: 1,
      };
    default:
      return {
        trackBackground: ctx.uncheckedTrack,
        thumbOffset: 0,
      };
  }
}

export function Switch({
  state = "unchecked",
  style,
  label,
  size = "default",
  theme: themeOverride,
  primary,
  mode,
  className,
}: SwitchProps) {
  const theme = useRemocnTheme(
    { ...themeOverride, ...(primary ? { primary } : {}) },
    mode,
  );

  const sizeStyle = SIZE_STYLES[size];
  const ctx = switchStyleContext(theme);
  const v = style ?? switchStyle(state, ctx);

  const travel = sizeStyle.trackW - sizeStyle.thumb - sizeStyle.pad * 2;

  return (
    <div
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
      <span
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: sizeStyle.gap,
        }}
      >
        {/* The track — animated fill; the thumb slides inside it. */}
        <span
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: sizeStyle.trackW,
            height: sizeStyle.trackH,
            borderRadius: sizeStyle.trackH / 2,
            background: v.trackBackground,
          }}
        >
          {/* The thumb — translates horizontally by thumbOffset * travel. */}
          <span
            style={{
              position: "absolute",
              left: sizeStyle.pad,
              width: sizeStyle.thumb,
              height: sizeStyle.thumb,
              borderRadius: "50%",
              background: ctx.thumbColor,
              boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
              transform: `translateX(${v.thumbOffset * travel}px)`,
            }}
          />
        </span>
        {label !== undefined && (
          <span
            style={{
              fontSize: sizeStyle.fontSize,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: theme.foreground,
            }}
          >
            {label}
          </span>
        )}
      </span>
    </div>
  );
}
