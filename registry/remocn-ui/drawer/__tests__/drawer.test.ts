/**
 * Verification tests for the PURE / DETERMINISTIC parts of `drawer`.
 *
 * Scope:
 *   - registry/remocn-ui/drawer/index.tsx  — DrawerState union membership,
 *     drawerStyle presets, drawerStyleContext
 *   - registry/remocn-ui/drawer/config.ts  — drawerConfig.controls wiring
 *     + drawerConfig.snippet output (the state → JSX codegen)
 *   - registry/remocn-ui/drawer/use-drawer-transition.ts
 *     — tweenDrawerStyle interpolation, DEFAULT_DURATION
 *
 * The render path (index.tsx) is a PURE-STATE model: `(state) => visual`.
 * `<Drawer>` reads `useRemocnTheme()` internally — that hook is pure at
 * call-time in test context, but the JSX render tree is not exercised here.
 * The pure-testable surface is: the style presets + tween + customizer wiring
 * + snippet codegen.
 *
 * Runner: Bun's built-in test runner (TypeScript-native, no framework dep).
 *   bun test registry/remocn-ui/drawer/__tests__
 *
 * --------------------------------------------------------------------------
 * IMPORT STRATEGY
 * --------------------------------------------------------------------------
 * `config.ts` imports `DrawerState` from `@/registry/remocn-ui/drawer`
 * and the pieces under test never CALL a Remotion runtime API at import time —
 * `drawerConfig` is a plain object; `.snippet` is a pure string builder;
 * `drawerStyle` and `tweenDrawerStyle` are pure value functions.
 * We import via RELATIVE paths (matching the existing test suite pattern),
 * annotating each import with the source it corresponds to.
 * --------------------------------------------------------------------------
 */

import { describe, expect, it } from "bun:test";
import {
  type DrawerState,
  drawerStyle,
  drawerStyleContext,
} from "../index";
import { tweenDrawerStyle, DEFAULT_DURATION } from "../use-drawer-transition";
import { drawerConfig } from "../config";
import { defaultLightTheme } from "@/lib/remocn-ui";

// ===========================================================================
// Shared fixtures
// ===========================================================================

/**
 * The DrawerState union, enumerated as a runtime list for membership checks.
 * Must stay in sync with `export type DrawerState` in index.tsx.
 */
const VALID_STATES: readonly DrawerState[] = ["opened", "closed"];

/** Minimal shape mirroring the customizer's value bag passed to snippet(). */
type SnippetValues = {
  state?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  cancelLabel?: string;
  mode?: string;
};

const snippet = (values: SnippetValues): string =>
  drawerConfig.snippet(values as Record<string, unknown>);

/**
 * A shared DrawerStyleContext built from the default light theme.
 * `drawerStyleContext` takes only `(theme)` — no variant arg, unlike accordion.
 */
const ctx = drawerStyleContext(defaultLightTheme);

// ===========================================================================
// 1. DrawerState union membership
// ===========================================================================

describe("DrawerState union", () => {
  it("contains exactly the two documented states", () => {
    // We can't enumerate a TS type at runtime, but we can assert the REAL
    // controls.state options match and that all known states are members.
    const control = drawerConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(control.options).toEqual(["opened", "closed"]);
  });

  it("every VALID_STATES entry is assignable (no typos in the fixture)", () => {
    // Belt-and-suspenders: the fixture array must have exactly 2 entries and
    // match the options list from the real config.
    const control = drawerConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(VALID_STATES).toHaveLength(2);
    for (const s of VALID_STATES) {
      expect(control.options).toContain(s);
    }
  });
});

// ===========================================================================
// 2. drawerConfig.controls.state — customizer control wiring
// ===========================================================================

describe("drawerConfig.controls.state", () => {
  it("is a select control", () => {
    expect(drawerConfig.controls.state.type).toBe("select");
  });

  it("has exactly the two DrawerState options in order", () => {
    const control = drawerConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(control.options).toEqual(["opened", "closed"]);
  });

  it("defaults to 'opened' so the preview showcases the panel", () => {
    const control = drawerConfig.controls.state;
    expect(control.default).toBe("opened");
  });

  it("every option is a member of the DrawerState union", () => {
    const control = drawerConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    for (const option of control.options) {
      expect(VALID_STATES).toContain(option as DrawerState);
    }
  });
});

// ===========================================================================
// 3. drawerConfig.snippet — pure string builder
//    State model: snippet ALWAYS emits `state="<state>"` as a bare JSX prop.
//    It NEVER emits `steps`.
//    Note on `action`: the snippet emits `actionLabel=` (a legitimate prop) but
//    must never emit a bare `action=` attribute. We assert `steps` is absent and
//    add a targeted check that `action=` only ever appears as `actionLabel=`.
// ===========================================================================

describe("drawerConfig.snippet: state prop emission", () => {
  it("emits state=\"opened\" for the opened option", () => {
    expect(snippet({ state: "opened" })).toContain('state="opened"');
  });

  it("emits state=\"closed\" for the closed option", () => {
    expect(snippet({ state: "closed" })).toContain('state="closed"');
  });

  it("emits the correct state for every control option", () => {
    const control = drawerConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    for (const state of control.options) {
      const out = snippet({ state });
      expect(out).toContain(`state="${state}"`);
    }
  });
});

describe("drawerConfig.snippet: NEVER emits steps", () => {
  // `action=` is intentionally NOT checked here because `actionLabel=` is a
  // legitimate emitted prop and would cause a false positive on a naive
  // `.toContain("action")` check. Assert `steps` absence only.
  it("never emits `steps` in any state", () => {
    for (const state of VALID_STATES) {
      expect(snippet({ state })).not.toContain("steps");
    }
  });
});

describe("drawerConfig.snippet: import line", () => {
  it("includes `import { Drawer }` from the correct path", () => {
    const out = snippet({ state: "opened" });
    expect(out).toContain('import { Drawer }');
    expect(out).toContain('from "@/components/remocn/drawer"');
  });
});

describe("drawerConfig.snippet: default props are omitted", () => {
  // Defaults: title="Edit profile",
  //           description="Make changes to your profile here. Click save when you're done.",
  //           actionLabel="Save changes", cancelLabel="Cancel", mode="light"
  const allDefaults = snippet({
    state: "opened",
    title: "Edit profile",
    description: "Make changes to your profile here. Click save when you're done.",
    actionLabel: "Save changes",
    cancelLabel: "Cancel",
    mode: "light",
  });

  it("omits title when it equals the default 'Edit profile'", () => {
    expect(allDefaults).not.toContain("title=");
  });

  it("omits description when it equals the default text", () => {
    expect(allDefaults).not.toContain("description=");
  });

  it("omits actionLabel when it equals the default 'Save changes'", () => {
    expect(allDefaults).not.toContain("actionLabel=");
  });

  it("omits cancelLabel when it equals the default 'Cancel'", () => {
    expect(allDefaults).not.toContain("cancelLabel=");
  });

  it("omits mode when it equals the default 'light'", () => {
    expect(allDefaults).not.toContain("mode=");
  });
});

describe("drawerConfig.snippet: non-default props are emitted", () => {
  it("emits a non-default title", () => {
    expect(snippet({ state: "opened", title: "Edit workspace settings" }))
      .toContain('title="Edit workspace settings"');
  });

  it("emits a non-default description", () => {
    expect(snippet({ state: "opened", description: "Update your workspace name and settings." }))
      .toContain('description="Update your workspace name and settings."');
  });

  it("emits a non-default actionLabel", () => {
    expect(snippet({ state: "opened", actionLabel: "Confirm" }))
      .toContain('actionLabel="Confirm"');
  });

  it("emits a non-default cancelLabel", () => {
    expect(snippet({ state: "opened", cancelLabel: "Go back" }))
      .toContain('cancelLabel="Go back"');
  });

  it("emits a non-default mode", () => {
    expect(snippet({ state: "opened", mode: "dark" }))
      .toContain('mode="dark"');
  });
});

describe("drawerConfig.snippet: structural round-trip", () => {
  const out = snippet({ state: "opened" });

  it("starts with the import line", () => {
    expect(out.startsWith('import { Drawer }')).toBe(true);
  });

  it("contains a <Drawer JSX opening", () => {
    expect(out).toContain("<Drawer");
  });

  it("ends with a self-closing />", () => {
    expect(out.trimEnd().endsWith("/>")).toBe(true);
  });
});

// ===========================================================================
// 4. drawerStyleContext — derives concrete colors from the theme.
//    Signature is `(theme)` — NO variant argument (unlike accordion).
//    Build ctx from the default light theme and assert each field is populated.
//    `radius` is a number (px); all other fields are non-empty strings.
// ===========================================================================

describe("drawerStyleContext: field types from defaultLightTheme", () => {
  it("popoverBg is a non-empty string", () => {
    expect(typeof ctx.popoverBg).toBe("string");
    expect(ctx.popoverBg.length).toBeGreaterThan(0);
  });

  it("popoverFg is a non-empty string", () => {
    expect(typeof ctx.popoverFg).toBe("string");
    expect(ctx.popoverFg.length).toBeGreaterThan(0);
  });

  it("mutedFg is a non-empty string", () => {
    expect(typeof ctx.mutedFg).toBe("string");
    expect(ctx.mutedFg.length).toBeGreaterThan(0);
  });

  it("border is a non-empty string", () => {
    expect(typeof ctx.border).toBe("string");
    expect(ctx.border.length).toBeGreaterThan(0);
  });

  it("radius is a number", () => {
    expect(typeof ctx.radius).toBe("number");
  });

  it("actionBg is a non-empty string", () => {
    expect(typeof ctx.actionBg).toBe("string");
    expect(ctx.actionBg.length).toBeGreaterThan(0);
  });

  it("actionFg is a non-empty string", () => {
    expect(typeof ctx.actionFg).toBe("string");
    expect(ctx.actionFg.length).toBeGreaterThan(0);
  });

  it("cancelFg is a non-empty string", () => {
    expect(typeof ctx.cancelFg).toBe("string");
    expect(ctx.cancelFg.length).toBeGreaterThan(0);
  });
});

// ===========================================================================
// 5. drawerStyle presets — pure (state, ctx) => DrawerStyle
//    drawerStyleContext and drawerStyle are exported and frame-free.
//    Build one ctx from the default light theme, then assert the numeric
//    invariants for every state.
// ===========================================================================

describe("drawerStyle: closed state", () => {
  const s = drawerStyle("closed", ctx);

  it("overlayOpacity is 0 (overlay fully hidden)", () => {
    expect(s.overlayOpacity).toBe(0);
  });

  it("panelOpacity is 0 (panel fully hidden)", () => {
    expect(s.panelOpacity).toBe(0);
  });

  it("panelTranslateY is 320 (panel off-screen below the bottom edge)", () => {
    expect(s.panelTranslateY).toBe(320);
  });
});

describe("drawerStyle: opened state", () => {
  const s = drawerStyle("opened", ctx);

  it("overlayOpacity is 1 (overlay fully revealed)", () => {
    expect(s.overlayOpacity).toBe(1);
  });

  it("panelOpacity is 1 (panel fully visible)", () => {
    expect(s.panelOpacity).toBe(1);
  });

  it("panelTranslateY is 0 (panel at its resting position)", () => {
    expect(s.panelTranslateY).toBe(0);
  });
});

describe("drawerStyle: closed/opened invariant", () => {
  it("closed: overlayOpacity 0, panelOpacity 0, panelTranslateY 320", () => {
    const s = drawerStyle("closed", ctx);
    expect(s.overlayOpacity).toBe(0);
    expect(s.panelOpacity).toBe(0);
    expect(s.panelTranslateY).toBe(320);
  });

  it("opened: overlayOpacity 1, panelOpacity 1, panelTranslateY 0", () => {
    const s = drawerStyle("opened", ctx);
    expect(s.overlayOpacity).toBe(1);
    expect(s.panelOpacity).toBe(1);
    expect(s.panelTranslateY).toBe(0);
  });
});

// ===========================================================================
// 6. tweenDrawerStyle — pure linear interpolation between two DrawerStyles.
//    All three fields are pure numeric lerps (no color fields, unlike accordion).
//    Concrete expectations: closed → opened for midpoint math.
// ===========================================================================

describe("tweenDrawerStyle: t=0 returns values equal to `a`", () => {
  const a = drawerStyle("closed", ctx);
  const b = drawerStyle("opened", ctx);
  const r = tweenDrawerStyle(a, b, 0);

  it("overlayOpacity equals a.overlayOpacity at t=0", () => {
    expect(r.overlayOpacity).toBeCloseTo(a.overlayOpacity, 10);
  });

  it("panelOpacity equals a.panelOpacity at t=0", () => {
    expect(r.panelOpacity).toBeCloseTo(a.panelOpacity, 10);
  });

  it("panelTranslateY equals a.panelTranslateY at t=0", () => {
    expect(r.panelTranslateY).toBeCloseTo(a.panelTranslateY, 10);
  });
});

describe("tweenDrawerStyle: t=1 returns values equal to `b`", () => {
  const a = drawerStyle("closed", ctx);
  const b = drawerStyle("opened", ctx);
  const r = tweenDrawerStyle(a, b, 1);

  it("overlayOpacity equals b.overlayOpacity at t=1", () => {
    expect(r.overlayOpacity).toBeCloseTo(b.overlayOpacity, 10);
  });

  it("panelOpacity equals b.panelOpacity at t=1", () => {
    expect(r.panelOpacity).toBeCloseTo(b.panelOpacity, 10);
  });

  it("panelTranslateY equals b.panelTranslateY at t=1", () => {
    expect(r.panelTranslateY).toBeCloseTo(b.panelTranslateY, 10);
  });
});

describe("tweenDrawerStyle: t=0.5 midpoint numeric lerp (closed → opened)", () => {
  // closed:  overlayOpacity=0, panelOpacity=0, panelTranslateY=320
  // opened:  overlayOpacity=1, panelOpacity=1, panelTranslateY=0
  const a = drawerStyle("closed", ctx);
  const b = drawerStyle("opened", ctx);
  const r = tweenDrawerStyle(a, b, 0.5);

  it("overlayOpacity midpoint: 0 → 1 gives 0.5", () => {
    expect(r.overlayOpacity).toBeCloseTo(0.5, 10);
  });

  it("panelOpacity midpoint: 0 → 1 gives 0.5", () => {
    expect(r.panelOpacity).toBeCloseTo(0.5, 10);
  });

  it("panelTranslateY midpoint: 320 → 0 gives 160", () => {
    expect(r.panelTranslateY).toBeCloseTo(160, 10);
  });
});

describe("tweenDrawerStyle: t=0.5 midpoint numeric lerp (opened → closed)", () => {
  // opened:  overlayOpacity=1, panelOpacity=1, panelTranslateY=0
  // closed:  overlayOpacity=0, panelOpacity=0, panelTranslateY=320
  const a = drawerStyle("opened", ctx);
  const b = drawerStyle("closed", ctx);
  const r = tweenDrawerStyle(a, b, 0.5);

  it("overlayOpacity midpoint: 1 → 0 gives 0.5", () => {
    expect(r.overlayOpacity).toBeCloseTo(0.5, 10);
  });

  it("panelOpacity midpoint: 1 → 0 gives 0.5", () => {
    expect(r.panelOpacity).toBeCloseTo(0.5, 10);
  });

  it("panelTranslateY midpoint: 0 → 320 gives 160", () => {
    expect(r.panelTranslateY).toBeCloseTo(160, 10);
  });
});

// ===========================================================================
// 7. DEFAULT_DURATION — sanity check the exported constant
// ===========================================================================

describe("DEFAULT_DURATION", () => {
  it("is a positive number", () => {
    expect(typeof DEFAULT_DURATION).toBe("number");
    expect(DEFAULT_DURATION).toBeGreaterThan(0);
  });

  it("equals 12 (the authored value)", () => {
    expect(DEFAULT_DURATION).toBe(12);
  });
});
