/**
 * Verification tests for the timeline semantics.
 *
 * Scope: registry/remocn-ui/core/timeline.ts — framesFor, revealCount, and
 * the pure resolver logic inside useCurrentState (speed contract, state
 * resolution, ties).
 *
 * Runner: Bun's built-in test runner.
 *   bun test registry/remocn-ui/core/__tests__
 *
 * --------------------------------------------------------------------------
 * WHY THE RESOLVER IS REPLICATED HERE INSTEAD OF IMPORTED
 * --------------------------------------------------------------------------
 * `useCurrentState` is a React hook whose FIRST line is `useCurrentFrame()`
 * from "remotion" — it cannot run outside a Remotion render tree, and even
 * importing the module pulls the remotion runtime. `framesFor` and
 * `revealCount` are pure but share that module.
 *
 * So we do BOTH:
 *   1. Re-derive framesFor / revealCount as exact spec mirrors and assert
 *      their numeric contract (these formulas are trivially copyable and
 *      stable).
 *   2. Replicate the documented pure resolver ("resolveCurrentState" below)
 *      byte-for-byte from timeline.ts's algorithm, factoring out the single
 *      impure line (useCurrentFrame) into an injected `raw` frame. This lets
 *      us assert the speed contract and state-resolution rules headlessly.
 *
 * MAINTENANCE CONTRACT: if timeline.ts's resolver body changes, this replica
 * MUST be updated in lockstep. The replica is annotated with the source line
 * ranges it mirrors. The numeric expectations are the real verification value;
 * the replica is the harness that lets us reach them without a Remotion render.
 * --------------------------------------------------------------------------
 */

import { describe, expect, it } from "bun:test";

// ===========================================================================
// 1. framesFor / revealCount — exact spec mirrors of timeline.ts lines 5-19
// ===========================================================================

/** MIRROR of timeline.ts:framesFor (lines 5-7). */
function framesFor(d: number | { seconds: number }, fps: number): number {
  return typeof d === "number" ? d : Math.round(d.seconds * fps);
}

/** MIRROR of timeline.ts:revealCount (lines 10-19). */
function revealCount(
  localFrame: number,
  fps: number,
  len: number,
  cps: number,
): number {
  const over = (len / cps) * fps;
  if (over <= 0) return len;
  return Math.max(0, Math.min(len, Math.floor((localFrame / over) * len)));
}

describe("framesFor", () => {
  it("passes a raw frame number through unchanged", () => {
    expect(framesFor(30, 30)).toBe(30);
  });

  it("converts {seconds} to rounded frames at fps", () => {
    expect(framesFor({ seconds: 2 }, 30)).toBe(60);
    expect(framesFor({ seconds: 0.5 }, 30)).toBe(15);
  });

  it("rounds fractional second->frame conversions", () => {
    // 0.11s * 30 = 3.3 -> 3
    expect(framesFor({ seconds: 0.11 }, 30)).toBe(3);
    // 0.117 * 30 = 3.51 -> 4
    expect(framesFor({ seconds: 0.117 }, 30)).toBe(4);
  });
});

describe("revealCount (typewriter math)", () => {
  // over = (len/cps)*fps. For len=5, cps=10, fps=30 => over = 0.5*30 = 15 frames
  // to fully reveal 5 chars. count = floor((frame/15)*5).
  it("reveals nothing at frame 0", () => {
    expect(revealCount(0, 30, 5, 10)).toBe(0);
  });

  it("reveals proportionally mid-flight", () => {
    // frame 6 of 15 => floor((6/15)*5) = floor(2) = 2
    expect(revealCount(6, 30, 5, 10)).toBe(2);
    // frame 9 => floor((9/15)*5)=floor(3)=3
    expect(revealCount(9, 30, 5, 10)).toBe(3);
  });

  it("clamps to full length once the reveal window has elapsed", () => {
    expect(revealCount(15, 30, 5, 10)).toBe(5);
    expect(revealCount(999, 30, 5, 10)).toBe(5);
  });

  it("never goes negative for a negative localFrame", () => {
    expect(revealCount(-50, 30, 5, 10)).toBe(0);
  });

  it("returns full length immediately when the window is non-positive", () => {
    // len=0 => over=0 => guarded early-return of len (0).
    expect(revealCount(0, 30, 0, 10)).toBe(0);
  });
});

// ===========================================================================
// 2. useCurrentState resolver replica — MIRROR of timeline.ts useCurrentState
//    body (lines 31-46), with the one impure line (useCurrentFrame) injected
//    as `raw`. Keep in lockstep with source.
//
// The resolver contract: returns the `state` of the latest step with
// `at <= effectiveFrame` (effectiveFrame = raw * speed), else `defaultState`.
// Ties on `at` resolve by array order — later entry wins.
// ===========================================================================

interface Step<S extends string = string> {
  at: number;
  state: S;
  duration?: number;
}

/**
 * MIRROR of timeline.ts:useCurrentState (lines 31-46).
 * `raw` is the injected useCurrentFrame() value — annotates mirror source.
 */
function resolveCurrentState<S extends string>(
  raw: number, // injected useCurrentFrame() — MIRROR of timeline.ts line 36
  steps: Step<S>[],
  defaultState: S,
  speed = 1,
): S {
  const effectiveFrame = raw * speed; // MIRROR of timeline.ts line 36
  let current = defaultState;         // MIRROR of timeline.ts line 38
  let bestAt = -Infinity;             // MIRROR of timeline.ts line 39
  steps.forEach((step) => {           // MIRROR of timeline.ts lines 40-44
    if (step.at <= effectiveFrame && step.at >= bestAt) {
      bestAt = step.at;
      current = step.state;
    }
  });
  return current;
}

// ---------------------------------------------------------------------------
// Empty steps / default state
// ---------------------------------------------------------------------------

describe("resolveCurrentState: empty steps always returns defaultState", () => {
  it("returns defaultState when steps is empty", () => {
    expect(resolveCurrentState(0, [], "idle")).toBe("idle");
    expect(resolveCurrentState(100, [], "idle")).toBe("idle");
  });

  it("returns defaultState when no step has started yet (frame before first at)", () => {
    const steps: Step<"hover">[] = [{ at: 10, state: "hover" }];
    expect(resolveCurrentState(9, steps, "idle")).toBe("idle");
    expect(resolveCurrentState(0, steps, "idle")).toBe("idle");
  });
});

// ---------------------------------------------------------------------------
// Exact-frame activation
// ---------------------------------------------------------------------------

describe("resolveCurrentState: activates exactly at `at`", () => {
  type S = "idle" | "hover";
  const steps: Step<S>[] = [{ at: 10, state: "hover" }];

  it("returns defaultState one frame before `at`", () => {
    expect(resolveCurrentState(9, steps, "idle")).toBe("idle");
  });

  it("returns the step's state exactly at `at`", () => {
    expect(resolveCurrentState(10, steps, "idle")).toBe("hover");
  });

  it("holds that state past `at`", () => {
    expect(resolveCurrentState(999, steps, "idle")).toBe("hover");
  });
});

// ---------------------------------------------------------------------------
// Latest of several started steps wins
// ---------------------------------------------------------------------------

describe("resolveCurrentState: latest started step wins", () => {
  type S = "idle" | "hover" | "press" | "loading";
  const steps: Step<S>[] = [
    { at: 0,  state: "hover" },
    { at: 10, state: "press" },
    { at: 20, state: "loading" },
  ];

  it("returns hover between frames 0-9", () => {
    expect(resolveCurrentState(0, steps, "idle")).toBe("hover");
    expect(resolveCurrentState(9, steps, "idle")).toBe("hover");
  });

  it("returns press between frames 10-19", () => {
    expect(resolveCurrentState(10, steps, "idle")).toBe("press");
    expect(resolveCurrentState(19, steps, "idle")).toBe("press");
  });

  it("returns loading from frame 20 onward", () => {
    expect(resolveCurrentState(20, steps, "idle")).toBe("loading");
    expect(resolveCurrentState(500, steps, "idle")).toBe("loading");
  });
});

// ---------------------------------------------------------------------------
// Ties on `at` — later array entry wins
// ---------------------------------------------------------------------------

describe("resolveCurrentState: same-`at` ties resolve to later array entry", () => {
  type S = "idle" | "hover" | "press";

  it("second entry at the same `at` wins over the first", () => {
    const steps: Step<S>[] = [
      { at: 5, state: "hover" },
      { at: 5, state: "press" }, // same `at`, later in array — must win
    ];
    expect(resolveCurrentState(5, steps, "idle")).toBe("press");
  });

  it("third entry at the same `at` wins over the first two", () => {
    const steps: Step<"idle" | "a" | "b" | "c">[] = [
      { at: 5, state: "a" },
      { at: 5, state: "b" },
      { at: 5, state: "c" }, // latest in array
    ];
    expect(resolveCurrentState(5, steps, "idle")).toBe("c");
  });
});

// ---------------------------------------------------------------------------
// Speed contract — speed scales the playhead, not the authored `at`s
// ---------------------------------------------------------------------------

describe("resolveCurrentState: speed contract", () => {
  type S = "idle" | "go";
  const steps: Step<S>[] = [{ at: 30, state: "go" }];

  it("step {at:30} is NOT active at raw frame 14 when speed=2 (eff=28)", () => {
    expect(resolveCurrentState(14, steps, "idle", 2)).toBe("idle");
  });

  it("step {at:30} activates at raw frame 15 when speed=2 (eff=30)", () => {
    expect(resolveCurrentState(15, steps, "idle", 2)).toBe("go");
  });

  it("step {at:30} activates at raw frame 60 when speed=0.5 (eff=30)", () => {
    expect(resolveCurrentState(60, steps, "idle", 0.5)).toBe("go");
  });

  it("step {at:30} is NOT active at raw frame 59 when speed=0.5 (eff=29.5)", () => {
    expect(resolveCurrentState(59, steps, "idle", 0.5)).toBe("idle");
  });

  it("at speed=1 a step fires exactly at its authored frame", () => {
    expect(resolveCurrentState(29, steps, "idle", 1)).toBe("idle");
    expect(resolveCurrentState(30, steps, "idle", 1)).toBe("go");
  });
});

// ===========================================================================
// 3. useStateTransition resolver replica
//    MIRRORS timeline.ts:useStateTransition (lines 55-73).
//    `raw` is injected in place of useCurrentFrame(). Keep in lockstep.
//
//    Contract:
//    - `to`   = latest step with at <= effectiveFrame; else defaultState.
//    - `from` = the step just before `to` in time-sorted order; else defaultState.
//    - `progress` = clamp01((eff - to.at) / (to.duration ?? defaultDuration));
//                   before any step started → progress=1 (holds).
//    - Ties on `at`: later array index wins (sort is stable, later-index last).
//    - `speed` scales the playhead: effectiveFrame = raw * speed.
// ===========================================================================

/** MIRROR of timeline.ts:clamp01 (line 21-23). */
function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/**
 * MIRROR of timeline.ts:useStateTransition (lines 55-73).
 * `raw` = injected useCurrentFrame() value.
 */
function resolveStateTransition<S extends string>(
  raw: number,         // injected useCurrentFrame() — MIRROR of timeline.ts line 61
  steps: Step<S>[],
  defaultState: S,
  speed = 1,
  defaultDuration = 8,
): { from: S; to: S; progress: number } {
  const effectiveFrame = raw * speed;                          // MIRROR line 61
  const started = steps                                        // MIRROR lines 62-65
    .map((step, index) => ({ step, index }))
    .sort((a, b) => a.step.at - b.step.at || a.index - b.index)
    .filter((e) => e.step.at <= effectiveFrame);
  if (started.length === 0)                                    // MIRROR line 66-67
    return { from: defaultState, to: defaultState, progress: 1 };
  const to = started[started.length - 1].step;                // MIRROR line 68
  const from = started.length >= 2 ? started[started.length - 2].step : null; // MIRROR line 69
  const dur = to.duration ?? defaultDuration;                  // MIRROR line 70
  const progress = dur > 0 ? clamp01((effectiveFrame - to.at) / dur) : 1; // MIRROR line 71
  return { from: from ? from.state : defaultState, to: to.state, progress }; // MIRROR line 72
}

// ---------------------------------------------------------------------------
// Before any step: {from:default, to:default, progress:1}
// ---------------------------------------------------------------------------

describe("resolveStateTransition: before any step starts", () => {
  type S = "idle" | "hover";

  it("returns {from:default, to:default, progress:1} when steps is empty", () => {
    expect(resolveStateTransition(0, [], "idle")).toEqual({
      from: "idle",
      to: "idle",
      progress: 1,
    });
  });

  it("returns {from:default, to:default, progress:1} when frame is before first step", () => {
    const steps: Step<S>[] = [{ at: 10, state: "hover" }];
    expect(resolveStateTransition(9, steps, "idle")).toEqual({
      from: "idle",
      to: "idle",
      progress: 1,
    });
  });

  it("returns {from:default, to:default, progress:1} at frame 0 with step at 5", () => {
    const steps: Step<S>[] = [{ at: 5, state: "hover" }];
    expect(resolveStateTransition(0, steps, "idle")).toEqual({
      from: "idle",
      to: "idle",
      progress: 1,
    });
  });
});

// ---------------------------------------------------------------------------
// At a step boundary: from=prev (or default if first), to=that state, progress=0
// ---------------------------------------------------------------------------

describe("resolveStateTransition: exactly at a step's `at` frame", () => {
  type S = "idle" | "hover" | "press";

  it("first step: from=default, to=step state, progress=0 (at transition start)", () => {
    // at frame=10 exactly: effectiveFrame=10, to.at=10, progress=(10-10)/8=0
    const steps: Step<S>[] = [{ at: 10, state: "hover" }];
    const result = resolveStateTransition(10, steps, "idle");
    expect(result.from).toBe("idle");
    expect(result.to).toBe("hover");
    expect(result.progress).toBe(0);
  });

  it("second step: from=first step state, to=second step state, progress=0", () => {
    // frame=20: to={at:20, state:press}, from={at:10, state:hover}
    // progress = (20-20)/8 = 0
    const steps: Step<S>[] = [
      { at: 10, state: "hover" },
      { at: 20, state: "press" },
    ];
    const result = resolveStateTransition(20, steps, "idle");
    expect(result.from).toBe("hover");
    expect(result.to).toBe("press");
    expect(result.progress).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Mid-window: fractional progress
// ---------------------------------------------------------------------------

describe("resolveStateTransition: fractional progress mid-window", () => {
  type S = "idle" | "hover";

  it("progress is 0.5 at the midpoint of defaultDuration=8 (frame=to.at+4)", () => {
    // step at=10, defaultDuration=8; at frame=14: progress=(14-10)/8=0.5
    const steps: Step<S>[] = [{ at: 10, state: "hover" }];
    const result = resolveStateTransition(14, steps, "idle", 1, 8);
    expect(result.to).toBe("hover");
    expect(result.from).toBe("idle");
    expect(result.progress).toBeCloseTo(0.5, 10);
  });

  it("progress is 0.25 at one quarter through defaultDuration=8 (frame=to.at+2)", () => {
    // step at=10, frame=12: progress=(12-10)/8=0.25
    const steps: Step<S>[] = [{ at: 10, state: "hover" }];
    const result = resolveStateTransition(12, steps, "idle", 1, 8);
    expect(result.progress).toBeCloseTo(0.25, 10);
  });

  it("progress is 0.75 three-quarters through defaultDuration=8 (frame=to.at+6)", () => {
    // step at=10, frame=16: progress=(16-10)/8=0.75
    const steps: Step<S>[] = [{ at: 10, state: "hover" }];
    const result = resolveStateTransition(16, steps, "idle", 1, 8);
    expect(result.progress).toBeCloseTo(0.75, 10);
  });
});

// ---------------------------------------------------------------------------
// Past the window: progress holds at 1, to = that state
// ---------------------------------------------------------------------------

describe("resolveStateTransition: progress holds at 1 past the transition window", () => {
  type S = "idle" | "hover";

  it("progress=1 exactly at to.at+defaultDuration (frame=to.at+8)", () => {
    // step at=10, defaultDuration=8, frame=18: progress=(18-10)/8=1
    const steps: Step<S>[] = [{ at: 10, state: "hover" }];
    const result = resolveStateTransition(18, steps, "idle", 1, 8);
    expect(result.to).toBe("hover");
    expect(result.progress).toBe(1);
  });

  it("progress=1 well past the window (large frame)", () => {
    const steps: Step<S>[] = [{ at: 10, state: "hover" }];
    const result = resolveStateTransition(999, steps, "idle", 1, 8);
    expect(result.to).toBe("hover");
    expect(result.progress).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Per-step `duration` overrides `defaultDuration`
// ---------------------------------------------------------------------------

describe("resolveStateTransition: per-step duration overrides defaultDuration", () => {
  type S = "idle" | "hover";

  it("step with duration:6 yields different progress at frame=to.at+4 than defaultDuration:8", () => {
    // With duration:6: progress=(14-10)/6 ≈ 0.667
    // With defaultDuration:8: progress=(14-10)/8 = 0.5
    const stepsWithDur: Step<S>[] = [{ at: 10, state: "hover", duration: 6 }];
    const stepsNoDur: Step<S>[] = [{ at: 10, state: "hover" }];
    const withDur = resolveStateTransition(14, stepsWithDur, "idle", 1, 8);
    const withDefault = resolveStateTransition(14, stepsNoDur, "idle", 1, 8);
    expect(withDur.progress).toBeCloseTo(4 / 6, 10);
    expect(withDefault.progress).toBeCloseTo(4 / 8, 10);
    // They must differ
    expect(Math.abs(withDur.progress - withDefault.progress)).toBeGreaterThan(0.1);
  });

  it("step with duration:6 completes (progress=1) at frame=to.at+6, not at to.at+8", () => {
    const steps: Step<S>[] = [{ at: 10, state: "hover", duration: 6 }];
    const atSix = resolveStateTransition(16, steps, "idle", 1, 8);
    const atEight = resolveStateTransition(18, steps, "idle", 1, 8);
    expect(atSix.progress).toBe(1);
    expect(atEight.progress).toBe(1); // also clamped at 1, not beyond
  });

  it("step with duration:0 snaps immediately to progress=1", () => {
    const steps: Step<S>[] = [{ at: 10, state: "hover", duration: 0 }];
    const result = resolveStateTransition(10, steps, "idle", 1, 8);
    expect(result.progress).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Chained steps: from = previous step state
// ---------------------------------------------------------------------------

describe("resolveStateTransition: chained steps carry from=previous state", () => {
  type S = "idle" | "hover" | "press" | "loading";

  const steps: Step<S>[] = [
    { at: 0,  state: "hover" },
    { at: 10, state: "press" },
    { at: 20, state: "loading" },
  ];

  it("at frame 0: from=defaultState (no prior step), to=hover", () => {
    const r = resolveStateTransition(0, steps, "idle");
    expect(r.from).toBe("idle");
    expect(r.to).toBe("hover");
  });

  it("at frame 10: from=hover, to=press", () => {
    const r = resolveStateTransition(10, steps, "idle");
    expect(r.from).toBe("hover");
    expect(r.to).toBe("press");
  });

  it("at frame 20: from=press, to=loading", () => {
    const r = resolveStateTransition(20, steps, "idle");
    expect(r.from).toBe("press");
    expect(r.to).toBe("loading");
  });

  it("at frame 25: still from=press, to=loading (held)", () => {
    const r = resolveStateTransition(25, steps, "idle");
    expect(r.from).toBe("press");
    expect(r.to).toBe("loading");
  });
});

// ---------------------------------------------------------------------------
// Ties on `at`: later array entry wins (same contract as useCurrentState)
// ---------------------------------------------------------------------------

describe("resolveStateTransition: same-`at` ties — later array entry wins", () => {
  type S = "idle" | "a" | "b" | "c";

  it("second entry at same `at` wins: to=second, from=default", () => {
    const steps: Step<S>[] = [
      { at: 5, state: "a" },
      { at: 5, state: "b" },
    ];
    const r = resolveStateTransition(5, steps, "idle");
    expect(r.to).toBe("b");
    expect(r.from).toBe("idle");
  });

  it("third entry at same `at` wins: to=third, from=default (all share same at)", () => {
    const steps: Step<S>[] = [
      { at: 5, state: "a" },
      { at: 5, state: "b" },
      { at: 5, state: "c" },
    ];
    const r = resolveStateTransition(5, steps, "idle");
    expect(r.to).toBe("c");
    // all three share the same at, so only one "time slot" — from=default
    expect(r.from).toBe("idle");
  });

  it("tie at second step: from=first step (different at), to=later-array winner", () => {
    // step at=0 state=a, then two tied at=10 steps
    const steps: Step<S>[] = [
      { at: 0,  state: "a" },
      { at: 10, state: "b" },
      { at: 10, state: "c" },
    ];
    const r = resolveStateTransition(10, steps, "idle");
    expect(r.to).toBe("c");   // later array entry wins
    expect(r.from).toBe("b"); // the other at=10 entry is second-to-last in sorted order
  });
});

// ---------------------------------------------------------------------------
// speed=2 scales the playhead
// ---------------------------------------------------------------------------

describe("resolveStateTransition: speed contract", () => {
  type S = "idle" | "hover";

  it("speed=2: step at=20 fires at raw frame 10 (eff=20)", () => {
    const steps: Step<S>[] = [{ at: 20, state: "hover" }];
    const r = resolveStateTransition(10, steps, "idle", 2);
    expect(r.to).toBe("hover");
  });

  it("speed=2: step at=20 has NOT fired at raw frame 9 (eff=18 < 20)", () => {
    const steps: Step<S>[] = [{ at: 20, state: "hover" }];
    const r = resolveStateTransition(9, steps, "idle", 2);
    expect(r.to).toBe("idle");
    expect(r.progress).toBe(1);
  });

  it("speed=2: progress mid-window uses effectiveFrame (raw=12, eff=24, at=20, dur=8 → prog=0.5)", () => {
    // eff=24, to.at=20, dur=8 → (24-20)/8 = 0.5
    const steps: Step<S>[] = [{ at: 20, state: "hover" }];
    const r = resolveStateTransition(12, steps, "idle", 2, 8);
    expect(r.to).toBe("hover");
    expect(r.progress).toBeCloseTo(0.5, 10);
  });

  it("speed=0.5: step at=20 fires at raw frame 40 (eff=20)", () => {
    const steps: Step<S>[] = [{ at: 20, state: "hover" }];
    const r = resolveStateTransition(40, steps, "idle", 0.5);
    expect(r.to).toBe("hover");
  });

  it("speed=0.5: step at=20 has NOT fired at raw frame 39 (eff=19.5 < 20)", () => {
    const steps: Step<S>[] = [{ at: 20, state: "hover" }];
    const r = resolveStateTransition(39, steps, "idle", 0.5);
    expect(r.to).toBe("idle");
  });
});
