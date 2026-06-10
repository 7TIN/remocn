"use client";

import {
  easings,
  mixOklch,
  type RemocnTheme,
  type Step,
  useRemocnTheme,
  useStateTransition,
} from "@/lib/remocn-ui";
import {
  commandMenuItemStyle,
  commandMenuItemStyleContext,
  type CommandMenuItemState,
  type CommandMenuItemStyle,
} from "@/components/remocn/command-menu-item";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 8;

/** Blend two command-menu-item visuals: numbers lerp, colors via oklch mix. */
export function tweenCommandMenuItemStyle(
  a: CommandMenuItemStyle,
  b: CommandMenuItemStyle,
  t: number,
): CommandMenuItemStyle {
  return {
    background: mixOklch(a.background, b.background, t),
    labelColor: mixOklch(a.labelColor, b.labelColor, t),
    iconColor: mixOklch(a.iconColor, b.iconColor, t),
    scale: a.scale + (b.scale - a.scale) * t,
  };
}

export interface CommandMenuItemTransitionOptions {
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) CommandMenuItemStyle. The CALLER invokes
 * this; it reads the frame, the `<CommandMenuItem>` component does not. Feed the
 * result to `<CommandMenuItem style={...} />` (or a `CommandMenuItemRow`).
 */
export function useCommandMenuItemTransition(
  steps: Step<CommandMenuItemState>[],
  opts: CommandMenuItemTransitionOptions = {},
): CommandMenuItemStyle {
  const {
    theme: themeOverride,
    mode,
    speed = 1,
    defaultDuration = DEFAULT_DURATION,
  } = opts;
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = commandMenuItemStyleContext(theme);
  const { from, to, progress } = useStateTransition(
    steps,
    "idle",
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenCommandMenuItemStyle(
    commandMenuItemStyle(from, ctx),
    commandMenuItemStyle(to, ctx),
    t,
  );
}
