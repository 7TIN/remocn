"use client";

import { type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type DrawerState = "opened" | "closed";

export interface DrawerProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: DrawerState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `state` — feed it an interpolated `DrawerStyle` from `useDrawerTransition`.
   */
  style?: DrawerStyle;
  /** Headline of the drawer. */
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

/** Drawer panel height (px) — also the off-screen-bottom translate distance. */
const DRAWER_HEIGHT = 320;
/** Backdrop dim at full reveal — the overlay opacity scales up to this alpha. */
const MAX_OVERLAY_ALPHA = 0.5;

// ===========================================================================
// Drawer visual — the COMPLETE animated look for a moment in time. A `state` is
// a named preset of this visual (`drawerStyle`); the smooth path feeds an
// interpolated `DrawerStyle` straight through. The component is a pure renderer
// of whichever `DrawerStyle` it receives.
// ===========================================================================

export interface DrawerStyle {
  /** Backdrop dim reveal 0→1 (scales `MAX_OVERLAY_ALPHA`). */
  overlayOpacity: number;
  /** Panel fade 0→1. */
  panelOpacity: number;
  /** Panel slide (px): `DRAWER_HEIGHT` = off-screen bottom → 0 = resting. */
  panelTranslateY: number;
}

/** Concrete colors for the active theme, resolved once per render. */
export interface DrawerStyleContext {
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
 * result for every `drawerStyle(state, ctx)` preset.
 */
export function drawerStyleContext(theme: RemocnTheme): DrawerStyleContext {
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
 * The COMPLETE resting visual for a state — a pure `(state, ctx) => DrawerStyle`
 * map. To change how a state looks, edit one entry.
 */
export function drawerStyle(
  state: DrawerState,
  _ctx: DrawerStyleContext,
): DrawerStyle {
  switch (state) {
    case "opened":
      return {
        overlayOpacity: 1,
        panelOpacity: 1,
        panelTranslateY: 0,
      };
    default:
      return {
        overlayOpacity: 0,
        panelOpacity: 0,
        panelTranslateY: DRAWER_HEIGHT,
      };
  }
}

export function Drawer({
  state = "closed",
  style,
  title = "Edit profile",
  description = "Make changes to your profile here. Click save when you're done.",
  actionLabel = "Save changes",
  cancelLabel = "Cancel",
  theme: themeOverride,
  mode,
  className,
}: DrawerProps) {
  const theme = useRemocnTheme(themeOverride, mode);

  const ctx = drawerStyleContext(theme);
  const v = style ?? drawerStyle(state, ctx);

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
      {/* Backdrop dim — fades in as the drawer opens. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(0, 0, 0, ${MAX_OVERLAY_ALPHA * v.overlayOpacity})`,
        }}
      />
      {/* The panel — anchored to the bottom edge, full width, slides up. */}
      <div
        className={className}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: DRAWER_HEIGHT,
          transform: `translateY(${v.panelTranslateY}px)`,
          opacity: v.panelOpacity,
          background: ctx.popoverBg,
          color: ctx.popoverFg,
          borderTop: `1px solid ${ctx.border}`,
          borderTopLeftRadius: ctx.radius + 6,
          borderTopRightRadius: ctx.radius + 6,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 -24px 48px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* Drag-handle pill — static chrome at the top, not animated. */}
        <div
          style={{
            width: 40,
            height: 5,
            borderRadius: 999,
            background: ctx.border,
            marginBottom: 8,
          }}
        />
        {/* Centered content column with a max width. */}
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "-0.01em",
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
              marginTop: 16,
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
    </div>
  );
}
