"use client";

import { type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type RadioState = "unchecked" | "checked";

type RadioSize = "sm" | "default" | "lg";

export interface RadioProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: RadioState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `state` — feed it an interpolated `RadioStyle` from `useRadioTransition`.
   */
  style?: RadioStyle;
  /** Optional text label rendered next to the circle. */
  label?: string;
  size?: RadioSize;
  theme?: Partial<RemocnTheme>;
  /** Convenience override for the `primary` theme token — merged into `theme`. */
  primary?: string;
  mode?: "light" | "dark";
  className?: string;
}

const SIZE_STYLES: Record<
  RadioSize,
  { box: number; fontSize: number; gap: number }
> = {
  sm: { box: 16, fontSize: 13, gap: 8 },
  default: { box: 20, fontSize: 15, gap: 10 },
  lg: { box: 24, fontSize: 17, gap: 12 },
};

// ===========================================================================
// Radio visual — the COMPLETE animated look for a moment in time. A `state`
// is a named preset of this visual (`radioStyle`); the smooth path feeds an
// interpolated `RadioStyle` straight through. The component is a pure
// renderer of whichever `RadioStyle` it receives.
// ===========================================================================

export interface RadioStyle {
  /** Animated outer-ring border color. */
  ringBorderColor: string;
  /** Inner dot opacity 0→1. */
  dotOpacity: number;
  /** Inner dot scale 0.4→1 (a slight pop on check). */
  dotScale: number;
}

/** Concrete colors for the active theme, resolved once per render. */
export interface RadioStyleContext {
  uncheckedBorder: string;
  checkedBorder: string;
  /** Static dot fill color (never animated). */
  dotColor: string;
}

/**
 * Derive the concrete colors for a theme. Pure — call it once and reuse the
 * result for every `radioStyle(state, ctx)` preset.
 */
export function radioStyleContext(theme: RemocnTheme): RadioStyleContext {
  return {
    uncheckedBorder: theme.border,
    checkedBorder: theme.primary,
    dotColor: theme.primary,
  };
}

/**
 * The COMPLETE resting visual for a state — a pure `(state, ctx) => RadioStyle`
 * map. To change how a state looks, edit one entry.
 */
export function radioStyle(
  state: RadioState,
  ctx: RadioStyleContext,
): RadioStyle {
  switch (state) {
    case "checked":
      return {
        ringBorderColor: ctx.checkedBorder,
        dotOpacity: 1,
        dotScale: 1,
      };
    default:
      return {
        ringBorderColor: ctx.uncheckedBorder,
        dotOpacity: 0,
        dotScale: 0.4,
      };
  }
}

export function Radio({
  state = "unchecked",
  style,
  label,
  size = "default",
  theme: themeOverride,
  primary,
  mode,
  className,
}: RadioProps) {
  const theme = useRemocnTheme(
    { ...themeOverride, ...(primary ? { primary } : {}) },
    mode,
  );

  const sizeStyle = SIZE_STYLES[size];
  const ctx = radioStyleContext(theme);
  const v = style ?? radioStyle(state, ctx);
  const boxSize = sizeStyle.box;

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
        {/* The ring — animated border; the inner dot appears inside it. */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: boxSize,
            height: boxSize,
            borderRadius: "50%",
            border: `1px solid ${v.ringBorderColor}`,
            background: theme.background,
          }}
        >
          {/* Inner dot — scales + fades in on check. */}
          <span
            style={{
              width: Math.round(boxSize * 0.45),
              height: Math.round(boxSize * 0.45),
              borderRadius: "50%",
              background: ctx.dotColor,
              opacity: v.dotOpacity,
              transform: `scale(${v.dotScale})`,
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
