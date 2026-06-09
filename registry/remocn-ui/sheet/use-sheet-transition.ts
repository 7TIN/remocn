"use client";

import {
  easings,
  type RemocnTheme,
  type Step,
  useRemocnTheme,
  useStateTransition,
} from "@/lib/remocn-ui";
import {
  sheetStyle,
  sheetStyleContext,
  type SheetState,
  type SheetStyle,
} from "@/components/remocn/sheet";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 12;

/** Blend two sheet visuals: all three fields are pure numeric lerps. */
export function tweenSheetStyle(
  a: SheetStyle,
  b: SheetStyle,
  t: number,
): SheetStyle {
  return {
    overlayOpacity: a.overlayOpacity + (b.overlayOpacity - a.overlayOpacity) * t,
    panelOpacity: a.panelOpacity + (b.panelOpacity - a.panelOpacity) * t,
    panelTranslateX:
      a.panelTranslateX + (b.panelTranslateX - a.panelTranslateX) * t,
  };
}

export interface SheetTransitionOptions {
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) SheetStyle. The CALLER invokes this;
 * it reads the frame, the `<Sheet>` component does not. Feed the result to
 * `<Sheet style={...} />` for smooth open/close transitions.
 */
export function useSheetTransition(
  steps: Step<SheetState>[],
  opts: SheetTransitionOptions = {},
): SheetStyle {
  const {
    theme: themeOverride,
    mode,
    speed = 1,
    defaultDuration = DEFAULT_DURATION,
  } = opts;
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = sheetStyleContext(theme);
  const { from, to, progress } = useStateTransition(
    steps,
    "closed",
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenSheetStyle(sheetStyle(from, ctx), sheetStyle(to, ctx), t);
}
