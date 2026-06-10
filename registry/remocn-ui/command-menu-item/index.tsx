"use client";

import { mixOklch, type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";

export type CommandMenuItemState = "idle" | "hover" | "press" | "selected";

export interface CommandMenuItemProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: CommandMenuItemState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `state` — feed it an interpolated `CommandMenuItemStyle` from
   * `useCommandMenuItemTransition`.
   */
  style?: CommandMenuItemStyle;
  /** Row label. */
  label?: string;
  /** Optional leading icon name from the built-in set (search/settings/user/file). */
  icon?: CommandMenuIcon;
  /** Optional trailing keyboard shortcut, e.g. "⌘K" or "⌘ S". */
  shortcut?: string;
  /** Row width (px). Matches the panel content width when composed in CommandMenu. */
  width?: number;
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  className?: string;
}

/** The built-in leading icons. Hand-drawn so nothing is imported from a kit. */
export type CommandMenuIcon = "search" | "settings" | "user" | "file";

/** Standalone row width (px) when the atom is mounted on its own. */
const ROW_WIDTH = 360;

// ===========================================================================
// Command-menu-item visual — the COMPLETE animated look for a moment in time. A
// `state` is a named preset of this visual (`commandMenuItemStyle`); the smooth
// path feeds an interpolated `CommandMenuItemStyle` straight through. The
// component is a pure renderer of whichever style it receives. This atom is NOT
// a copy of select-item: its row is icon + label + trailing shortcut kbd, not
// label + check icon.
// ===========================================================================

export interface CommandMenuItemStyle {
  /** Animated row background (a concrete color, never "transparent"). */
  background: string;
  /** Animated label color. */
  labelColor: string;
  /** Animated icon color. */
  iconColor: string;
  /** Row zoom: 1 default, 0.98 on press. */
  scale: number;
}

/** Concrete colors for the active theme, resolved once per render. */
export interface CommandMenuItemStyleContext {
  idleBg: string;
  hoverBg: string;
  pressBg: string;
  selectedBg: string;
  idleFg: string;
  selectedFg: string;
  idleIcon: string;
  selectedIcon: string;
  /** Static shortcut-kbd colors (never animated). */
  kbdBg: string;
  kbdFg: string;
  kbdBorder: string;
}

/**
 * Derive the concrete colors for a theme. Pure — call it once and reuse the
 * result for every `commandMenuItemStyle(state, ctx)` preset.
 */
export function commandMenuItemStyleContext(
  theme: RemocnTheme,
): CommandMenuItemStyleContext {
  return {
    idleBg: theme.popover,
    hoverBg: theme.accent,
    pressBg: mixOklch(theme.accent, theme.foreground, 0.08),
    selectedBg: theme.accent,
    idleFg: theme.popoverForeground,
    selectedFg: theme.accentForeground,
    idleIcon: theme.mutedForeground,
    selectedIcon: theme.foreground,
    kbdBg: theme.muted,
    kbdFg: theme.mutedForeground,
    kbdBorder: theme.border,
  };
}

/**
 * The COMPLETE resting visual for a state — a pure `(state, ctx) =>
 * CommandMenuItemStyle` map. To change how a state looks, edit one entry.
 */
export function commandMenuItemStyle(
  state: CommandMenuItemState,
  ctx: CommandMenuItemStyleContext,
): CommandMenuItemStyle {
  switch (state) {
    case "hover":
      return {
        background: ctx.hoverBg,
        labelColor: ctx.idleFg,
        iconColor: ctx.selectedIcon,
        scale: 1,
      };
    case "press":
      return {
        background: ctx.pressBg,
        labelColor: ctx.idleFg,
        iconColor: ctx.selectedIcon,
        scale: 0.98,
      };
    case "selected":
      return {
        background: ctx.selectedBg,
        labelColor: ctx.selectedFg,
        iconColor: ctx.selectedIcon,
        scale: 1,
      };
    default:
      return {
        background: ctx.idleBg,
        labelColor: ctx.idleFg,
        iconColor: ctx.idleIcon,
        scale: 1,
      };
  }
}

/** Hand-drawn leading icon paths on a 24×24 grid (stroke-driven). */
const ICON_PATHS: Record<CommandMenuIcon, string> = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5",
  settings:
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM12 2v3 M12 19v3 M4.2 4.2l2.1 2.1 M17.7 17.7l2.1 2.1 M2 12h3 M19 12h3 M4.2 19.8l2.1-2.1 M17.7 6.3l2.1-2.1",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0",
  file: "M7 3h7l4 4v14H7ZM14 3v4h4",
};

function CommandMenuItemIcon({
  icon,
  color,
}: {
  icon: CommandMenuIcon;
  color: string;
}) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <path
        d={ICON_PATHS[icon]}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Props for the inline row — the shared visual that `CommandMenu` reuses. */
export interface CommandMenuItemRowProps {
  /** Resolved animated visual (smooth path); wins over `state` when present. */
  style?: CommandMenuItemStyle;
  /** Current visual state (snap path) when no `style` is supplied. */
  state?: CommandMenuItemState;
  /** Pre-derived ctx (the container passes its shared one to avoid re-resolving). */
  ctx: CommandMenuItemStyleContext;
  label: string;
  icon?: CommandMenuIcon;
  shortcut?: string;
  width: number;
  /** Row corner radius (px). */
  radius: number;
}

/**
 * INLINE command row — no full-frame wrapper. One row of a command palette:
 * leading icon (optional) + label on the left, trailing shortcut kbd on the
 * right. The `CommandMenu` container renders a column of these; the standalone
 * `CommandMenuItem` wraps one in a centering frame.
 */
export function CommandMenuItemRow({
  style,
  state = "idle",
  ctx,
  label,
  icon,
  shortcut,
  width,
  radius,
}: CommandMenuItemRowProps) {
  const v = style ?? commandMenuItemStyle(state, ctx);
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 12px",
        borderRadius: radius,
        transform: `scale(${v.scale})`,
        background: v.background,
        color: v.labelColor,
        fontSize: 14,
        letterSpacing: "-0.01em",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
        }}
      >
        {icon !== undefined && (
          <span style={{ display: "flex", flexShrink: 0 }}>
            <CommandMenuItemIcon icon={icon} color={v.iconColor} />
          </span>
        )}
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </span>
      {shortcut !== undefined && (
        <kbd
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            height: 20,
            padding: "0 6px",
            fontSize: 12,
            fontFamily: "inherit",
            letterSpacing: "0.05em",
            color: ctx.kbdFg,
            background: ctx.kbdBg,
            border: `1px solid ${ctx.kbdBorder}`,
            borderRadius: Math.max(4, radius - 4),
          }}
        >
          {shortcut}
        </kbd>
      )}
    </div>
  );
}

/**
 * Standalone command-row atom — resolves theme/ctx/style then wraps a single
 * `<CommandMenuItemRow>` in the standard full-frame centering wrapper. THIS is
 * what the registry registers and the customizer mounts. The `CommandMenu`
 * container does NOT use this — it reuses `CommandMenuItemRow` directly.
 */
export function CommandMenuItem({
  state = "idle",
  style,
  label = "Settings",
  icon = "settings",
  shortcut,
  width = ROW_WIDTH,
  theme: themeOverride,
  mode,
  className,
}: CommandMenuItemProps) {
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = commandMenuItemStyleContext(theme);

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
      <CommandMenuItemRow
        style={style}
        state={state}
        ctx={ctx}
        label={label}
        icon={icon}
        shortcut={shortcut}
        width={width}
        radius={theme.radius}
      />
    </div>
  );
}
