"use client";

import { mixOklch, type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

/** Active tab — one of the `items` VALUES (the label string). */
export type TabsState = string;

type TabsVariant = "pill" | "underline";

export interface TabsProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: TabsState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `state` — feed it an interpolated `TabsStyle` from `useTabsTransition`.
   */
  style?: TabsStyle;
  /** Tab labels (and values). The active `state` is one of these. */
  items?: string[];
  /** Panel body text per tab — parallel to `items`. */
  contents?: string[];
  /**
   * Natural height (px) of the panel body box. The panels stack in a fixed
   * `contentHeight` box — Remotion's headless render can't measure auto height,
   * so the resting height is authored, not measured.
   */
  contentHeight?: number;
  variant?: TabsVariant;
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  className?: string;
}

/** Widget width (px) of the rendered tabs. */
const WIDTH = 440;

/** Default tab labels. */
const DEFAULT_ITEMS = ["Account", "Password", "Settings"];

/** Default panel body text, parallel to `DEFAULT_ITEMS`. */
const DEFAULT_CONTENTS = [
  "Make changes to your account here.",
  "Change your password here.",
  "Manage your notification settings.",
];

// ===========================================================================
// Tabs visual — the COMPLETE animated look for a moment in time. A `state` is a
// named preset of this visual (`tabsStyle`); the smooth path feeds an
// interpolated `TabsStyle` straight through. The component is a pure renderer of
// whichever `TabsStyle` it receives. Everything else (indicator x/width,
// per-label color, panel crossfade) DERIVES from `indicatorOffset` in render.
// ===========================================================================

export interface TabsStyle {
  /**
   * Float index (0,1,2…) of where the active indicator sits. The only animated
   * field — the indicator position, label colors, and panel opacities all
   * derive from it inside the pure render.
   */
  indicatorOffset: number;
}

/** Concrete colors for the active variant/theme, resolved once per render. */
export interface TabsStyleContext {
  /** Tab labels/values — the indicator and panels are indexed against this. */
  items: string[];
  variant: TabsVariant;
  /** Track background behind the pill indicator (underline: unused). */
  trackBg: string;
  /** Active label color. */
  activeFg: string;
  /** Inactive label color. */
  inactiveFg: string;
  /** Indicator fill (pill: card bg; underline: the bar color). */
  indicatorBg: string;
  border: string;
  radius: number;
  /** Panel body text color. */
  panelFg: string;
}

/**
 * Derive the concrete colors for a variant/theme. Pure — call it once and reuse
 * the result for every `tabsStyle(state, ctx)` preset.
 */
export function tabsStyleContext(
  items: string[],
  variant: TabsVariant,
  theme: RemocnTheme,
): TabsStyleContext {
  return {
    items,
    variant,
    trackBg: theme.muted,
    activeFg: theme.foreground,
    // Pill: muted-foreground for the resting labels. Underline: same.
    inactiveFg: theme.mutedForeground,
    // Pill: a concrete card bg lifts the active tab off the muted track.
    // Underline: the primary bar along the bottom edge.
    indicatorBg: variant === "underline" ? theme.primary : theme.background,
    border: theme.border,
    radius: theme.radius,
    panelFg: theme.mutedForeground,
  };
}

/**
 * The COMPLETE resting visual for a state — a pure `(state, ctx) => TabsStyle`
 * map. `indicatorOffset` is the index of `state` in `ctx.items` (safe lookup:
 * unknown state → 0).
 */
export function tabsStyle(state: TabsState, ctx: TabsStyleContext): TabsStyle {
  const i = ctx.items.indexOf(state);
  return { indicatorOffset: i < 0 ? 0 : i };
}

export function Tabs({
  state = DEFAULT_ITEMS[0],
  style,
  items = DEFAULT_ITEMS,
  contents = DEFAULT_CONTENTS,
  contentHeight = 72,
  variant = "pill",
  theme: themeOverride,
  mode,
  className,
}: TabsProps) {
  const theme = useRemocnTheme(themeOverride, mode);

  const ctx = tabsStyleContext(items, variant, theme);
  const v = style ?? tabsStyle(state, ctx);

  const isPill = ctx.variant === "pill";
  // Pill rests on a padded muted track; underline runs flush to the edges.
  const trackPad = isPill ? 4 : 0;
  const innerWidth = WIDTH - trackPad * 2;
  const segmentWidth = innerWidth / items.length;
  const rowHeight = 40;
  const indicatorX = trackPad + v.indicatorOffset * segmentWidth;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // OPAQUE wrapper — tabs is a self-contained widget, not a modal layer.
        background: theme.background,
        fontFamily:
          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ width: WIDTH }}>
        {/* Tab row — equal-width segments with the sliding indicator behind. */}
        <div
          style={{
            position: "relative",
            height: rowHeight,
            padding: trackPad,
            boxSizing: "border-box",
            display: "flex",
            background: isPill ? ctx.trackBg : "transparent",
            borderRadius: isPill ? ctx.radius : 0,
            borderBottom: isPill ? undefined : `1px solid ${ctx.border}`,
          }}
        >
          {/* Sliding indicator — pill: a rounded card; underline: a 2px bar. */}
          <div
            style={
              isPill
                ? {
                    position: "absolute",
                    top: trackPad,
                    left: indicatorX,
                    width: segmentWidth,
                    height: rowHeight - trackPad * 2,
                    background: ctx.indicatorBg,
                    borderRadius: ctx.radius - 3,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }
                : {
                    position: "absolute",
                    bottom: 0,
                    left: indicatorX,
                    width: segmentWidth,
                    height: 2,
                    background: ctx.indicatorBg,
                  }
            }
          />
          {/* Labels stay in normal flow defining the segment widths. */}
          {items.map((item, i) => {
            const proximity = Math.max(0, 1 - Math.abs(i - v.indicatorOffset));
            return (
              <span
                key={item}
                style={{
                  position: "relative",
                  width: segmentWidth,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  color: mixOklch(ctx.inactiveFg, ctx.activeFg, proximity),
                }}
              >
                {item}
              </span>
            );
          })}
        </div>
        {/* Panel — all panels stacked in a fixed box; opacity crossfades them. */}
        <div
          style={{
            position: "relative",
            height: contentHeight,
            marginTop: 16,
          }}
        >
          {items.map((item, i) => {
            const proximity = Math.max(0, 1 - Math.abs(i - v.indicatorOffset));
            return (
              <div
                key={item}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: proximity,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: ctx.panelFg,
                }}
              >
                {contents[i]}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
