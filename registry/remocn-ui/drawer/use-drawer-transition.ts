"use client";

import {
  easings,
  type RemocnTheme,
  type Step,
  useRemocnTheme,
  useStateTransition,
} from "@/lib/remocn-ui";
import {
  drawerStyle,
  drawerStyleContext,
  type DrawerState,
  type DrawerStyle,
} from "@/components/remocn/drawer";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 12;

/** Blend two drawer visuals: all three fields are pure numeric lerps. */
export function tweenDrawerStyle(
  a: DrawerStyle,
  b: DrawerStyle,
  t: number,
): DrawerStyle {
  return {
    overlayOpacity: a.overlayOpacity + (b.overlayOpacity - a.overlayOpacity) * t,
    panelOpacity: a.panelOpacity + (b.panelOpacity - a.panelOpacity) * t,
    panelTranslateY:
      a.panelTranslateY + (b.panelTranslateY - a.panelTranslateY) * t,
  };
}

export interface DrawerTransitionOptions {
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) DrawerStyle. The CALLER invokes this;
 * it reads the frame, the `<Drawer>` component does not. Feed the result to
 * `<Drawer style={...} />` for smooth open/close transitions.
 */
export function useDrawerTransition(
  steps: Step<DrawerState>[],
  opts: DrawerTransitionOptions = {},
): DrawerStyle {
  const {
    theme: themeOverride,
    mode,
    speed = 1,
    defaultDuration = DEFAULT_DURATION,
  } = opts;
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = drawerStyleContext(theme);
  const { from, to, progress } = useStateTransition(
    steps,
    "closed",
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenDrawerStyle(drawerStyle(from, ctx), drawerStyle(to, ctx), t);
}
