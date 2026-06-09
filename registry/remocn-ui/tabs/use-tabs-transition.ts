"use client";

import {
  easings,
  type RemocnTheme,
  type Step,
  useRemocnTheme,
  useStateTransition,
} from "@/lib/remocn-ui";
import {
  tabsStyle,
  tabsStyleContext,
  type TabsState,
  type TabsStyle,
} from "@/components/remocn/tabs";
// ^ install path; resolves in-repo via the @/components/remocn/* tsconfig alias.

/** Default tab labels — mirrors the component's default `items`. */
const DEFAULT_ITEMS = ["Account", "Password", "Settings"];

/** Default transition length (frames) when a step omits `duration`. Tune to taste. */
export const DEFAULT_DURATION = 14;

/** Blend two tabs visuals: `indicatorOffset` lerps (it's the only field). */
export function tweenTabsStyle(
  a: TabsStyle,
  b: TabsStyle,
  t: number,
): TabsStyle {
  return {
    indicatorOffset:
      a.indicatorOffset + (b.indicatorOffset - a.indicatorOffset) * t,
  };
}

export interface TabsTransitionOptions {
  items?: string[];
  variant?: "pill" | "underline";
  theme?: Partial<RemocnTheme>;
  mode?: "light" | "dark";
  speed?: number;
  defaultDuration?: number;
}

/**
 * Timeline → resolved (eased, tweened) TabsStyle. The CALLER invokes this; it
 * reads the frame, the `<Tabs>` component does not. Feed the result to
 * `<Tabs style={...} />` for a smooth sliding indicator.
 */
export function useTabsTransition(
  steps: Step<TabsState>[],
  opts: TabsTransitionOptions = {},
): TabsStyle {
  const {
    items = DEFAULT_ITEMS,
    variant = "pill",
    theme: themeOverride,
    mode,
    speed = 1,
    defaultDuration = DEFAULT_DURATION,
  } = opts;
  const theme = useRemocnTheme(themeOverride, mode);
  const ctx = tabsStyleContext(items, variant, theme);
  const { from, to, progress } = useStateTransition(
    steps,
    items[0],
    speed,
    defaultDuration,
  );
  const t = easings.out(progress);
  return tweenTabsStyle(tabsStyle(from, ctx), tabsStyle(to, ctx), t);
}
