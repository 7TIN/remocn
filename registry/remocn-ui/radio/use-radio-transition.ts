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
  radioStyle,
  radioStyleContext,
  type RadioState,
  type RadioStyle,
} from "@/components/remocn/radio";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 10;

/** Blend two radio visuals: numbers lerp, colors via oklch mix. */
export function tweenRadioStyle(
  a: RadioStyle,
  b: RadioStyle,
  t: number,
): RadioStyle {
  return {
    ringBorderColor: mixOklch(a.ringBorderColor, b.ringBorderColor, t),
    dotOpacity: a.dotOpacity + (b.dotOpacity - a.dotOpacity) * t,
    dotScale: a.dotScale + (b.dotScale - a.dotScale) * t,
  };
}

export interface RadioTransitionOptions {
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  primary?: string;
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) RadioStyle. The CALLER invokes this;
 * it reads the frame, the `<Radio>` component does not. Feed the result to
 * `<Radio style={...} />` for smooth check/uncheck transitions.
 */
export function useRadioTransition(
  steps: Step<RadioState>[],
  opts: RadioTransitionOptions = {},
): RadioStyle {
  const {
    theme: themeOverride,
    mode,
    primary,
    speed = 1,
    defaultDuration = DEFAULT_DURATION,
  } = opts;
  const theme = useRemocnTheme(
    { ...themeOverride, ...(primary ? { primary } : {}) },
    mode,
  );
  const ctx = radioStyleContext(theme);
  const { from, to, progress } = useStateTransition(
    steps,
    "unchecked",
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenRadioStyle(radioStyle(from, ctx), radioStyle(to, ctx), t);
}
