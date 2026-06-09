/**
 * Verification tests for the PURE / DETERMINISTIC parts of `radio`.
 *
 * Scope:
 *   - registry/remocn-ui/radio/index.tsx  — RadioState union membership,
 *     radioStyleContext, radioStyle presets
 *   - registry/remocn-ui/radio/use-radio-transition.ts — tweenRadioStyle
 *   - registry/remocn-ui/radio/config.ts  — radioConfig.controls.state
 *     wiring + radioConfig.snippet output (the state → JSX codegen)
 *
 * The render path (index.tsx) is a PURE-STATE model: `(state) => visual`.
 * State changes snap (no tweening inside the component). The smooth-path hook
 * `useRadioTransition` reads `useCurrentFrame()` via `useStateTransition`
 * internally; it cannot run outside a Remotion render tree. So Radio render
 * is NOT exercised here. The pure-testable surface is the customizer wiring,
 * snippet codegen, style presets, and tween interpolation (below).
 *
 * Runner: Bun's built-in test runner (TypeScript-native, no framework dep).
 *   bun test registry/remocn-ui/radio/__tests__
 *
 * --------------------------------------------------------------------------
 * IMPORT STRATEGY
 * --------------------------------------------------------------------------
 * `config.ts` imports `RadioState` from `@/registry/remocn-ui/radio`
 * and the pieces under test never CALL a Remotion runtime API at import time —
 * `radioConfig` is a plain object; `.snippet` is a pure string builder;
 * `radioStyle` and `tweenRadioStyle` are pure value functions.
 * We import via RELATIVE paths (matching the existing test suite pattern),
 * annotating each import with the source it corresponds to.
 * --------------------------------------------------------------------------
 */

import { describe, expect, it } from "bun:test";
import {
  type RadioState,
  radioStyle,
  radioStyleContext,
} from "../index";
import { tweenRadioStyle } from "../use-radio-transition";
import { radioConfig } from "../config";
import { defaultLightTheme } from "@/lib/remocn-ui";

// ===========================================================================
// Shared fixtures
// ===========================================================================

/**
 * The RadioState union, enumerated as a runtime list for membership checks.
 * Must stay in sync with `export type RadioState` in index.tsx.
 */
const VALID_STATES: readonly RadioState[] = ["unchecked", "checked"];

/** Minimal shape mirroring the customizer's value bag passed to snippet(). */
type SnippetValues = {
  state?: string;
  label?: string;
  size?: string;
  mode?: string;
  primary?: string;
};

const snippet = (values: SnippetValues): string =>
  radioConfig.snippet(values as Record<string, unknown>);

// ===========================================================================
// 1. RadioState union membership
// ===========================================================================

describe("RadioState union", () => {
  it("contains exactly the two documented states", () => {
    // We can't enumerate a TS type at runtime, but we can assert the REAL
    // controls.state options match and that all known states are members.
    const control = radioConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(control.options).toEqual(["unchecked", "checked"]);
  });

  it("every VALID_STATES entry is assignable (no typos in the fixture)", () => {
    // Belt-and-suspenders: the fixture array must have exactly 2 entries and
    // match the options list from the real config.
    const control = radioConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(VALID_STATES).toHaveLength(2);
    for (const s of VALID_STATES) {
      expect(control.options).toContain(s);
    }
  });
});

// ===========================================================================
// 2. radioConfig.controls.state — customizer control wiring
// ===========================================================================

describe("radioConfig.controls.state", () => {
  it("is a select control", () => {
    expect(radioConfig.controls.state.type).toBe("select");
  });

  it("has exactly the two RadioState options in order", () => {
    const control = radioConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    expect(control.options).toEqual(["unchecked", "checked"]);
  });

  it("defaults to 'checked' so the preview shows the filled dot", () => {
    const control = radioConfig.controls.state;
    expect(control.default).toBe("checked");
  });

  it("every option is a member of the RadioState union", () => {
    const control = radioConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    for (const option of control.options) {
      expect(VALID_STATES).toContain(option as RadioState);
    }
  });
});

// ===========================================================================
// 3. radioConfig.snippet — pure string builder
//    State model: snippet emits `state="<state>"` as a bare JSX prop.
//    It NEVER emits `steps` or `action`.
// ===========================================================================

describe("radioConfig.snippet: state prop emission", () => {
  it("emits state=\"unchecked\" for the unchecked option", () => {
    expect(snippet({ state: "unchecked" })).toContain('state="unchecked"');
  });

  it("emits state=\"checked\" for the checked option", () => {
    expect(snippet({ state: "checked" })).toContain('state="checked"');
  });

  it("emits the correct state for every control option", () => {
    const control = radioConfig.controls.state;
    if (control.type !== "select") throw new Error("state control must be a select");
    for (const state of control.options) {
      const out = snippet({ state });
      expect(out).toContain(`state="${state}"`);
    }
  });
});

describe("radioConfig.snippet: NEVER emits steps or action", () => {
  it("never emits `steps` in any state", () => {
    for (const state of VALID_STATES) {
      expect(snippet({ state })).not.toContain("steps");
    }
  });

  it("never emits `action` in any state", () => {
    for (const state of VALID_STATES) {
      expect(snippet({ state })).not.toContain("action");
    }
  });
});

describe("radioConfig.snippet: import line", () => {
  it("includes `import { Radio }` from the correct path", () => {
    const out = snippet({ state: "checked" });
    expect(out).toContain('import { Radio }');
    expect(out).toContain('from "@/components/remocn/radio"');
  });
});

describe("radioConfig.snippet: default props are omitted", () => {
  // Defaults: label="", size=default, mode=light, primary=#171717
  const allDefaults = snippet({
    state: "checked",
    label: "",
    size: "default",
    mode: "light",
    primary: "#171717",
  });

  it("omits label when it equals the default (empty string)", () => {
    expect(allDefaults).not.toContain("label=");
  });

  it("omits size when it equals the default 'default'", () => {
    expect(allDefaults).not.toContain("size=");
  });

  it("omits mode when it equals the default 'light'", () => {
    expect(allDefaults).not.toContain("mode=");
  });

  it("omits primary when it equals the default '#171717'", () => {
    expect(allDefaults).not.toContain("primary=");
  });
});

describe("radioConfig.snippet: non-default props are emitted", () => {
  it("emits a non-default label", () => {
    expect(snippet({ state: "checked", label: "Option A" })).toContain('label="Option A"');
  });

  it("emits a non-default size", () => {
    expect(snippet({ state: "checked", size: "lg" })).toContain('size="lg"');
  });

  it("emits a non-default mode", () => {
    expect(snippet({ state: "checked", mode: "dark" })).toContain('mode="dark"');
  });

  it("emits a non-default primary color", () => {
    expect(snippet({ state: "checked", primary: "#6366f1" })).toContain('primary="#6366f1"');
  });
});

describe("radioConfig.snippet: structural round-trip", () => {
  const out = snippet({ state: "checked" });

  it("starts with the import line", () => {
    expect(out.startsWith('import { Radio }')).toBe(true);
  });

  it("contains a <Radio JSX opening", () => {
    expect(out).toContain("<Radio");
  });

  it("ends with a self-closing />", () => {
    expect(out.trimEnd().endsWith("/>")).toBe(true);
  });
});

// ===========================================================================
// 4. radioStyle presets — pure (state, ctx) => RadioStyle
//    radioStyleContext and radioStyle are now exported and frame-free.
//    Build one ctx from the default light theme, then assert the
//    numeric/opacity invariants for both states.
//    ringBorderColor is derived from the theme — asserted non-empty only
//    (exact value is an implementation detail of the theme).
// ===========================================================================

const ctx = radioStyleContext(defaultLightTheme);

describe("radioStyle: unchecked state", () => {
  const s = radioStyle("unchecked", ctx);

  it("dotOpacity is 0 (dot hidden)", () => {
    expect(s.dotOpacity).toBe(0);
  });

  it("dotScale is 0.4 (pre-pop position, slight shrink)", () => {
    expect(s.dotScale).toBeCloseTo(0.4, 10);
  });

  it("ringBorderColor is a non-empty string", () => {
    expect(typeof s.ringBorderColor).toBe("string");
    expect(s.ringBorderColor.length).toBeGreaterThan(0);
  });
});

describe("radioStyle: checked state", () => {
  const s = radioStyle("checked", ctx);

  it("dotOpacity is 1 (dot fully visible)", () => {
    expect(s.dotOpacity).toBe(1);
  });

  it("dotScale is 1 (full size, post-pop)", () => {
    expect(s.dotScale).toBe(1);
  });

  it("ringBorderColor is a non-empty string", () => {
    expect(typeof s.ringBorderColor).toBe("string");
    expect(s.ringBorderColor.length).toBeGreaterThan(0);
  });
});

describe("radioStyle: invariants — unchecked hides dot, checked shows dot", () => {
  it("unchecked has dotOpacity 0 (dot invisible)", () => {
    const s = radioStyle("unchecked", ctx);
    expect(s.dotOpacity).toBe(0);
  });

  it("checked has dotOpacity 1 (dot fully visible)", () => {
    const s = radioStyle("checked", ctx);
    expect(s.dotOpacity).toBe(1);
  });
});

// ===========================================================================
// 5. tweenRadioStyle — pure linear interpolation between two RadioStyles.
//    Numbers lerp linearly; colors via oklch mix → non-empty string at all t.
//    Concrete expectations: unchecked→checked for midpoint math.
//      unchecked: dotOpacity=0, dotScale=0.4
//      checked:   dotOpacity=1, dotScale=1
// ===========================================================================

describe("tweenRadioStyle: t=0 returns values equal to `a`", () => {
  const a = radioStyle("unchecked", ctx);
  const b = radioStyle("checked", ctx);
  const r = tweenRadioStyle(a, b, 0);

  it("dotOpacity equals a.dotOpacity at t=0", () => {
    expect(r.dotOpacity).toBeCloseTo(a.dotOpacity, 10);
  });

  it("dotScale equals a.dotScale at t=0", () => {
    expect(r.dotScale).toBeCloseTo(a.dotScale, 10);
  });

  it("ringBorderColor is a non-empty string at t=0", () => {
    expect(typeof r.ringBorderColor).toBe("string");
    expect(r.ringBorderColor.length).toBeGreaterThan(0);
  });
});

describe("tweenRadioStyle: t=1 returns values equal to `b`", () => {
  const a = radioStyle("unchecked", ctx);
  const b = radioStyle("checked", ctx);
  const r = tweenRadioStyle(a, b, 1);

  it("dotOpacity equals b.dotOpacity at t=1", () => {
    expect(r.dotOpacity).toBeCloseTo(b.dotOpacity, 10);
  });

  it("dotScale equals b.dotScale at t=1", () => {
    expect(r.dotScale).toBeCloseTo(b.dotScale, 10);
  });

  it("ringBorderColor is a non-empty string at t=1", () => {
    expect(typeof r.ringBorderColor).toBe("string");
    expect(r.ringBorderColor.length).toBeGreaterThan(0);
  });
});

describe("tweenRadioStyle: t=0.5 midpoint numeric lerp (unchecked → checked)", () => {
  // unchecked: dotOpacity=0, dotScale=0.4
  // checked:   dotOpacity=1, dotScale=1
  const a = radioStyle("unchecked", ctx);
  const b = radioStyle("checked", ctx);
  const r = tweenRadioStyle(a, b, 0.5);

  it("dotOpacity midpoint: 0 → 1 gives 0.5", () => {
    expect(r.dotOpacity).toBeCloseTo(0.5, 10);
  });

  it("dotScale midpoint: 0.4 → 1 gives 0.7", () => {
    expect(r.dotScale).toBeCloseTo(0.7, 10);
  });

  it("ringBorderColor is a non-empty string at t=0.5", () => {
    expect(typeof r.ringBorderColor).toBe("string");
    expect(r.ringBorderColor.length).toBeGreaterThan(0);
  });
});
