"use client";

import { mixOklch, type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type AccordionState = "opened" | "closed";

type AccordionVariant = "default" | "ghost";

export interface AccordionProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: AccordionState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `state` — feed it an interpolated `AccordionStyle` from `useAccordionTransition`.
   */
  style?: AccordionStyle;
  /** Trigger label (the always-visible header row). */
  title?: string;
  /** Panel body text revealed when opened. */
  content?: string;
  /**
   * Natural height (px) of the panel body at full reveal. The panel animates
   * `panelHeight * contentHeight` — Remotion's headless render can't measure
   * auto height, so the resting height is authored, not measured.
   */
  contentHeight?: number;
  variant?: AccordionVariant;
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  className?: string;
}

/** Card width (px) of the rendered disclosure. */
const CARD_WIDTH = 440;

interface VariantTokens {
  /** Whether the card draws a 1px border. */
  bordered: boolean;
  /** Resting (closed) item background. */
  closedBg: string;
  /** Open item background. */
  openBg: string;
}

function variantTokens(
  variant: AccordionVariant,
  theme: RemocnTheme,
): VariantTokens {
  const variants = {
    ghost: {
      bordered: false,
      closedBg: theme.background,
      // Subtle wash so the open state still reads without a border.
      openBg: mixOklch(theme.background, theme.muted, 0.25),
    },
    default: {
      bordered: true,
      closedBg: theme.background,
      // shadcn `data-open:bg-muted/50` — muted at half strength over the page.
      openBg: mixOklch(theme.background, theme.muted, 0.5),
    },
  };

  return variants[variant] ?? variants.default;
}

// ===========================================================================
// Accordion visual — the COMPLETE animated look for a moment in time. A `state`
// is a named preset of this visual (`accordionStyle`); the smooth path feeds an
// interpolated `AccordionStyle` straight through. The component is a pure
// renderer of whichever `AccordionStyle` it receives.
// ===========================================================================

export interface AccordionStyle {
  /** Panel reveal fraction 0→1; multiplies `contentHeight` for the box height. */
  panelHeight: number;
  /** Panel body opacity 0→1. */
  panelOpacity: number;
  /** Chevron rotation in degrees: 0 (closed, points down) → 180 (opened, up). */
  chevronRotation: number;
  /** Animated item background (a concrete color, never "transparent"). */
  background: string;
}

/** Concrete colors for the active variant/theme, resolved once per render. */
export interface AccordionStyleContext {
  bordered: boolean;
  closedBg: string;
  openBg: string;
  border: string;
  foreground: string;
  mutedForeground: string;
}

/**
 * Derive the concrete colors for a variant/theme. Pure — call it once and reuse
 * the result for every `accordionStyle(state, ctx)` preset.
 */
export function accordionStyleContext(
  variant: AccordionVariant,
  theme: RemocnTheme,
): AccordionStyleContext {
  const tokens = variantTokens(variant, theme);
  return {
    bordered: tokens.bordered,
    closedBg: tokens.closedBg,
    openBg: tokens.openBg,
    border: theme.border,
    foreground: theme.foreground,
    mutedForeground: theme.mutedForeground,
  };
}

/**
 * The COMPLETE resting visual for a state — a pure `(state, ctx) => AccordionStyle`
 * map. To change how a state looks, edit one entry.
 */
export function accordionStyle(
  state: AccordionState,
  ctx: AccordionStyleContext,
): AccordionStyle {
  switch (state) {
    case "opened":
      return {
        panelHeight: 1,
        panelOpacity: 1,
        chevronRotation: 180,
        background: ctx.openBg,
      };
    default:
      return {
        panelHeight: 0,
        panelOpacity: 0,
        chevronRotation: 0,
        background: ctx.closedBg,
      };
  }
}

export function Accordion({
  state = "closed",
  style,
  title = "Is it accessible?",
  content = "Yes. It adheres to the WAI-ARIA design pattern.",
  contentHeight = 64,
  variant = "default",
  theme: themeOverride,
  mode,
  className,
}: AccordionProps) {
  const theme = useRemocnTheme(themeOverride, mode);

  const ctx = accordionStyleContext(variant, theme);
  const v = style ?? accordionStyle(state, ctx);

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
      <div
        className={className}
        style={{
          width: CARD_WIDTH,
          background: v.background,
          border: ctx.bordered
            ? `1px solid ${ctx.border}`
            : "1px solid transparent",
          borderRadius: theme.radius,
          overflow: "hidden",
        }}
      >
        {/* Trigger row — always visible; sets the card width. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            padding: 16,
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: ctx.foreground,
          }}
        >
          <span>{title}</span>
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            style={{
              flexShrink: 0,
              transform: `rotate(${v.chevronRotation}deg)`,
            }}
          >
            <path
              d="M6 9l6 6 6-6"
              stroke={ctx.mutedForeground}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* Panel — height + opacity animate the reveal; content stays mounted. */}
        <div
          style={{
            height: contentHeight * v.panelHeight,
            opacity: v.panelOpacity,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0 16px 16px",
              fontSize: 14,
              lineHeight: 1.5,
              color: ctx.mutedForeground,
            }}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
