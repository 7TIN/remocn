/**
 * A single scripted state on the Remotion timeline.
 *
 * Every remocn UI state atom consumes the same `steps: Step[]` envelope. The
 * current state is the latest step whose `at` is <= the current frame.
 */
export interface Step<S extends string = string> {
  /** LOCAL (Sequence-relative) authored frame at which the component enters this state. */
  at: number;
  /** Per-component state union (e.g. "idle" | "hover" | "loading"). */
  state: S;
  /** Frames to animate the transition INTO this state. Omitted → caller's default. */
  duration?: number;
}
