"use client";

import { useCurrentFrame } from "remotion";

export interface SpinnerProps {
  /** Rendered size in px (width === height). */
  size?: number;
  /** Stroke color. Defaults to `currentColor` so it inherits text color. */
  color?: string;
  /** Scales the playhead: rotation = frame * speed * 6 (deg). */
  speed?: number;
  /** Arc stroke width in viewBox units. */
  strokeWidth?: number;
  className?: string;
}

/**
 * A deterministic spinning arc. Pure function of `useCurrentFrame()` — no
 * Date, Math.random, or RAF — so it renders identically every render and
 * frame-perfectly on the Remotion timeline. The single time source is the
 * frame; there are no states.
 */
export function Spinner({
  size = 20,
  color = "currentColor",
  speed = 1,
  strokeWidth = 2.5,
  className,
}: SpinnerProps) {
  const rotation = useCurrentFrame() * speed * 6;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="44"
        strokeDashoffset="33"
      />
    </svg>
  );
}
