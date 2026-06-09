"use client";

import { type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type SheetState = "opened" | "closed";

export interface SheetProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: SheetState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `state` — feed it an interpolated `SheetStyle` from `useSheetTransition`.
   */
  style?: SheetStyle;
  /** Headline of the sheet. */
  title?: string;
  /** Body copy under the title. */
  description?: string;
  /** Label of the confirming (primary) action. */
  actionLabel?: string;
  /** Label of the dismissing action. */
  cancelLabel?: string;
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  className?: string;
}

/** Side panel width (px). */
const SHEET_WIDTH = 400;
/** Backdrop dim at full reveal — the overlay opacity scales up to this alpha. */
const MAX_OVERLAY_ALPHA = 0.5;

// ===========================================================================
// Sheet visual — the COMPLETE animated look for a moment in time. A `state` is
// a named preset of this visual (`sheetStyle`); the smooth path feeds an
// interpolated `SheetStyle` straight through. The component is a pure renderer
// of whichever `SheetStyle` it receives.
// ===========================================================================

export interface SheetStyle {
  /** Backdrop dim reveal 0→1 (scales `MAX_OVERLAY_ALPHA`). */
  overlayOpacity: number;
  /** Panel fade 0→1. */
  panelOpacity: number;
  /** Panel slide in px: SHEET_WIDTH = off-screen-right → 0 = resting. */
  panelTranslateX: number;
}

/** Concrete colors for the active theme, resolved once per render. */
export interface SheetStyleContext {
  popoverBg: string;
  popoverFg: string;
  mutedFg: string;
  border: string;
  radius: number;
  actionBg: string;
  actionFg: string;
  cancelFg: string;
}

/**
 * Derive the concrete colors for a theme. Pure — call it once and reuse the
 * result for every `sheetStyle(state, ctx)` preset.
 */
export function sheetStyleContext(theme: RemocnTheme): SheetStyleContext {
  return {
    popoverBg: theme.popover,
    popoverFg: theme.popoverForeground,
    mutedFg: theme.mutedForeground,
    border: theme.border,
    radius: theme.radius,
    // The action is the PRIMARY (affirmative) action — not destructive.
    actionBg: theme.primary,
    actionFg: theme.primaryForeground,
    cancelFg: theme.foreground,
  };
}

/**
 * The COMPLETE resting visual for a state — a pure `(state, ctx) => SheetStyle`
 * map. To change how a state looks, edit one entry.
 */
export function sheetStyle(
  state: SheetState,
  _ctx: SheetStyleContext,
): SheetStyle {
  switch (state) {
    case "opened":
      return {
        overlayOpacity: 1,
        panelOpacity: 1,
        panelTranslateX: 0,
      };
    default:
      return {
        overlayOpacity: 0,
        panelOpacity: 0,
        panelTranslateX: SHEET_WIDTH,
      };
  }
}

export function Sheet({
  state = "closed",
  style,
  title = "Edit profile",
  description = "Make changes to your profile here. Click save when you're done.",
  actionLabel = "Save changes",
  cancelLabel = "Cancel",
  theme: themeOverride,
  mode,
  className,
}: SheetProps) {
  const theme = useRemocnTheme(themeOverride, mode);

  const ctx = sheetStyleContext(theme);
  const v = style ?? sheetStyle(state, ctx);

  // Shared base for the two footer buttons. These are plain inline `<button>`s,
  // not the remocn `Button` component — that renders a full-frame scene wrapper
  // (absolute inset) and so can't nest inline here; the sizing mirrors its
  // `default` size.
  const buttonBase: React.CSSProperties = {
    height: 40,
    padding: "0 20px",
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: "-0.01em",
    borderRadius: ctx.radius,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  return (
    // The wrapper is TRANSPARENT — unlike button/accordion (which paint an
    // opaque `theme.background`), this atom is a modal layer meant to compose
    // OVER another scene, so it must not blanket the frame with a background.
    <div
      style={{
        position: "absolute",
        inset: 0,
        fontFamily:
          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Backdrop dim — fades in as the sheet opens. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(0, 0, 0, ${MAX_OVERLAY_ALPHA * v.overlayOpacity})`,
        }}
      />
      <div
        className={className}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: SHEET_WIDTH,
          transform: `translateX(${v.panelTranslateX}px)`,
          opacity: v.panelOpacity,
          background: ctx.popoverBg,
          color: ctx.popoverFg,
          borderLeft: `1px solid ${ctx.border}`,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          boxShadow: "-24px 0 48px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* Close (X) — static chrome in the top-right corner, not animated. */}
        <button
          type="button"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 28,
            height: 28,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            borderRadius: ctx.radius,
            color: ctx.mutedFg,
            cursor: "pointer",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6 6 18 M6 6 18 18"
              stroke={ctx.mutedFg}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            paddingRight: 28,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: ctx.mutedFg }}>
          {description}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: "auto",
          }}
        >
          {/* Cancel — outline variant. */}
          <button
            type="button"
            style={{
              ...buttonBase,
              background: "transparent",
              color: ctx.cancelFg,
              border: `1px solid ${ctx.border}`,
            }}
          >
            {cancelLabel}
          </button>
          {/* Action — primary variant. */}
          <button
            type="button"
            style={{
              ...buttonBase,
              background: ctx.actionBg,
              color: ctx.actionFg,
              border: "1px solid transparent",
            }}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
