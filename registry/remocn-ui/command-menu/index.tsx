"use client";

import { type RemocnTheme, useRemocnTheme } from "@/lib/remocn-ui";
import {
  CommandMenuItemRow,
  commandMenuItemStyle,
  commandMenuItemStyleContext,
  type CommandMenuIcon,
  type CommandMenuItemState,
  type CommandMenuItemStyle,
  type CommandMenuItemStyleContext,
} from "@/components/remocn/command-menu-item";

export type CommandMenuState = "opened" | "closed";

/** One command row's data. */
export interface CommandMenuEntry {
  icon?: CommandMenuIcon;
  label: string;
  shortcut?: string;
}

export interface CommandMenuProps {
  /** Current visual state (snap path). State changes snap (no enter-tweens). */
  state?: CommandMenuState;
  /**
   * Resolved animated visual (smooth path). When provided, takes precedence over
   * `state` — feed it an interpolated `CommandMenuStyle` from `useCommandMenuTransition`.
   */
  style?: CommandMenuStyle;
  /** Full search query text (the visible prefix is `query.slice(0, revealCount)`). */
  query?: string;
  /**
   * Number of query characters revealed so far (the caller computes this with
   * core `revealCount`). Omitted → the whole `query` is shown.
   */
  revealCount?: number;
  /** The rows to show before filtering. */
  items?: CommandMenuEntry[];
  /** Index (into the FILTERED list) of the persisted selection. `-1` for none. */
  selectedIndex?: number;
  /** Index (into the FILTERED list) of the row under the pointer. `-1` for none. */
  highlightedIndex?: number;
  /** Index (into the FILTERED list) of the row being pressed. `-1` for none. */
  pressedIndex?: number;
  /**
   * Per-item resolved visual override (smooth path), indexed into the FILTERED
   * list. When an entry is present it wins over the index→state derivation.
   */
  itemStyles?: (CommandMenuItemStyle | undefined)[];
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  className?: string;
}

/** Panel width (px). */
const PANEL_WIDTH = 440;
/** Inner content width (panel minus padding). */
const CONTENT_WIDTH = PANEL_WIDTH - 16;
/** Backdrop dim at full reveal — the overlay opacity scales up to this alpha. */
const MAX_OVERLAY_ALPHA = 0.5;

/**
 * Filter command entries by the visible query prefix. PURE — a case-insensitive
 * substring match on `query.slice(0, revealCount)`. An empty visible prefix
 * matches everything. Exported so tests can mirror it and the example can keep
 * its filtered indices in sync.
 */
export function filterCommandItems(
  items: CommandMenuEntry[],
  query: string,
  revealCount?: number,
): CommandMenuEntry[] {
  const visible = (
    revealCount === undefined ? query : query.slice(0, revealCount)
  )
    .trim()
    .toLowerCase();
  if (visible === "") return items;
  return items.filter((item) => item.label.toLowerCase().includes(visible));
}

// ===========================================================================
// Command-menu visual — the COMPLETE animated look for a moment in time. A
// `state` is a named preset of this visual (`commandMenuStyle`); the smooth path
// feeds an interpolated `CommandMenuStyle` straight through. The component is a
// pure renderer of whichever style it receives. Per-row visuals are derived from
// the index props (or `itemStyles`), independent of this container reveal.
// ===========================================================================

export interface CommandMenuStyle {
  /** Backdrop dim reveal 0→1 (scales `MAX_OVERLAY_ALPHA`). */
  backdropOpacity: number;
  /** Panel fade 0→1. */
  panelOpacity: number;
  /** Panel zoom 0.96→1. */
  panelScale: number;
  /** Panel lift 8→0 (px). */
  panelTranslateY: number;
}

/** Concrete colors for the active theme, resolved once per render. */
export interface CommandMenuStyleContext {
  panelBg: string;
  panelBorder: string;
  inputFg: string;
  placeholderFg: string;
  mutedFg: string;
  divider: string;
  caret: string;
  radius: number;
  itemCtx: CommandMenuItemStyleContext;
}

/**
 * Derive the concrete colors for a theme. Pure — call it once and reuse the
 * result for every `commandMenuStyle(state, ctx)` preset.
 */
export function commandMenuStyleContext(
  theme: RemocnTheme,
): CommandMenuStyleContext {
  return {
    panelBg: theme.popover,
    panelBorder: theme.border,
    inputFg: theme.popoverForeground,
    placeholderFg: theme.mutedForeground,
    mutedFg: theme.mutedForeground,
    divider: theme.border,
    caret: theme.foreground,
    radius: theme.radius,
    itemCtx: commandMenuItemStyleContext(theme),
  };
}

/**
 * The COMPLETE resting visual for a state — a pure `(state, ctx) =>
 * CommandMenuStyle` map. To change how a state looks, edit one entry.
 */
export function commandMenuStyle(
  state: CommandMenuState,
  _ctx: CommandMenuStyleContext,
): CommandMenuStyle {
  switch (state) {
    case "opened":
      return {
        backdropOpacity: 1,
        panelOpacity: 1,
        panelScale: 1,
        panelTranslateY: 0,
      };
    default:
      return {
        backdropOpacity: 0,
        panelOpacity: 0,
        panelScale: 0.96,
        panelTranslateY: 8,
      };
  }
}

/** Resolve one row's state from the index props (used when no itemStyle override). */
function rowState(
  i: number,
  selectedIndex: number,
  highlightedIndex: number,
  pressedIndex: number,
): CommandMenuItemState {
  if (i === pressedIndex) return "press";
  if (i === selectedIndex) return "selected";
  if (i === highlightedIndex) return "hover";
  return "idle";
}

export function CommandMenu({
  state = "closed",
  style,
  query = "",
  revealCount,
  items = [
    { icon: "user", label: "Profile", shortcut: "⌘ P" },
    { icon: "settings", label: "Settings", shortcut: "⌘ S" },
    { icon: "file", label: "New File", shortcut: "⌘ N" },
    { icon: "search", label: "Search docs" },
  ],
  selectedIndex = -1,
  highlightedIndex = -1,
  pressedIndex = -1,
  itemStyles,
  theme: themeOverride,
  mode,
  className,
}: CommandMenuProps) {
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = commandMenuStyleContext(theme);
  const v = style ?? commandMenuStyle(state, ctx);

  const visibleQuery =
    revealCount === undefined ? query : query.slice(0, revealCount);
  const filtered = filterCommandItems(items, query, revealCount);

  return (
    // TRANSPARENT modal wrapper — like dialog, this composes OVER another scene,
    // so it paints no opaque background. Its intrinsic inset:0 backdrop is why no
    // preview wrapper is needed (the customizer mounts this directly).
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        // Command palettes sit in the upper third, not dead-center.
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "18%",
        fontFamily:
          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Backdrop dim — fades in as the palette opens. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(0, 0, 0, ${MAX_OVERLAY_ALPHA * v.backdropOpacity})`,
        }}
      />
      <div
        className={className}
        style={{
          position: "relative",
          width: PANEL_WIDTH,
          boxSizing: "border-box",
          transformOrigin: "top",
          transform: `translateY(${v.panelTranslateY}px) scale(${v.panelScale})`,
          opacity: v.panelOpacity,
          background: ctx.panelBg,
          border: `1px solid ${ctx.panelBorder}`,
          borderRadius: ctx.radius + 6,
          padding: 8,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* Search row — magnifier + typed query + caret. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
          }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <path
              d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5"
              stroke={ctx.mutedFg}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 15,
              letterSpacing: "-0.01em",
              color: visibleQuery ? ctx.inputFg : ctx.placeholderFg,
            }}
          >
            {visibleQuery || "Type a command or search…"}
            {/* Caret sits after the revealed text. */}
            <span
              style={{
                display: "inline-block",
                width: 1.5,
                height: 18,
                marginLeft: 1,
                background: ctx.caret,
              }}
            />
          </span>
        </div>
        {/* Divider. */}
        <div
          style={{
            height: 1,
            background: ctx.divider,
            margin: "4px 0",
          }}
        />
        {/* List of rows, or the empty state. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "4px 0",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "20px 12px",
                textAlign: "center",
                fontSize: 14,
                color: ctx.mutedFg,
              }}
            >
              No results found.
            </div>
          ) : (
            filtered.map((item, i) => {
              const override = itemStyles?.[i];
              return (
                <CommandMenuItemRow
                  key={item.label}
                  style={
                    override ??
                    commandMenuItemStyle(
                      rowState(
                        i,
                        selectedIndex,
                        highlightedIndex,
                        pressedIndex,
                      ),
                      ctx.itemCtx,
                    )
                  }
                  ctx={ctx.itemCtx}
                  label={item.label}
                  icon={item.icon}
                  shortcut={item.shortcut}
                  width={CONTENT_WIDTH}
                  radius={theme.radius}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
