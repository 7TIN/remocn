"use client";

import {
  easings,
  type RemocnTheme,
  type Step,
  useRemocnTheme,
  useStateTransition,
} from "@/lib/remocn-ui";
import {
  commandMenuStyle,
  commandMenuStyleContext,
  type CommandMenuState,
  type CommandMenuStyle,
} from "@/components/remocn/command-menu";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 12;

/** Blend two command-menu visuals: all fields are numbers, so a straight lerp. */
export function tweenCommandMenuStyle(
  a: CommandMenuStyle,
  b: CommandMenuStyle,
  t: number,
): CommandMenuStyle {
  return {
    backdropOpacity:
      a.backdropOpacity + (b.backdropOpacity - a.backdropOpacity) * t,
    panelOpacity: a.panelOpacity + (b.panelOpacity - a.panelOpacity) * t,
    panelScale: a.panelScale + (b.panelScale - a.panelScale) * t,
    panelTranslateY:
      a.panelTranslateY + (b.panelTranslateY - a.panelTranslateY) * t,
  };
}

export interface CommandMenuTransitionOptions {
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) CommandMenuStyle. The CALLER invokes
 * this; it reads the frame, the `<CommandMenu>` component does not. Feed the
 * result to `<CommandMenu style={...} />` for a smooth open/close.
 */
export function useCommandMenuTransition(
  steps: Step<CommandMenuState>[],
  opts: CommandMenuTransitionOptions = {},
): CommandMenuStyle {
  const {
    theme: themeOverride,
    mode,
    speed = 1,
    defaultDuration = DEFAULT_DURATION,
  } = opts;
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = commandMenuStyleContext(theme);
  const { from, to, progress } = useStateTransition(
    steps,
    "closed",
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenCommandMenuStyle(
    commandMenuStyle(from, ctx),
    commandMenuStyle(to, ctx),
    t,
  );
}
