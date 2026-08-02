"use client";

import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import {
  type ParticleDissolveDirection,
  particleDissolve,
} from "@/registry/remocn/particle-dissolve";

const FONT_FAMILY =
  "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif";

function Scene({ label, background }: { label: string; background: string }) {
  return (
    <AbsoluteFill
      style={{
        background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 96,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: "#f2f2f2",
        }}
      >
        {label}
      </span>
    </AbsoluteFill>
  );
}

interface ParticleDissolveExampleProps {
  particleSize?: number;
  scatter?: number;
  shimmer?: number;
  aberration?: number;
  direction?: string;
  stagger?: number;
}

export function ParticleDissolveExampleScene({
  particleSize,
  scatter,
  shimmer,
  aberration,
  direction,
  stagger,
}: ParticleDissolveExampleProps) {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}>
        <Scene label="Scene A" background="#0a0a0a" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        timing={linearTiming({ durationInFrames: 36 })}
        presentation={particleDissolve({
          particleSize,
          scatter,
          shimmer,
          aberration,
          direction: direction as ParticleDissolveDirection | undefined,
          stagger,
        })}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Scene label="Scene B" background="#12141a" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
}

export const particleDissolveExampleCode = (
  values: Record<string, unknown>,
): string => {
  const particleSize = (values.particleSize as number) ?? 4;
  const scatter = (values.scatter as number) ?? 0.08;
  const shimmer = (values.shimmer as number) ?? 0.6;
  const aberration = (values.aberration as number) ?? 0.5;
  const direction = (values.direction as string) ?? "reveal";
  const stagger = (values.stagger as number) ?? 0.55;
  return `import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { particleDissolve } from "@/components/remocn/particle-dissolve";

export const MyVideo = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={60}>
      <SceneA />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      timing={linearTiming({ durationInFrames: 36 })}
      presentation={particleDissolve({ particleSize: ${particleSize}, scatter: ${scatter}, shimmer: ${shimmer}, aberration: ${aberration}, direction: "${direction}", stagger: ${stagger} })}
    />
    <TransitionSeries.Sequence durationInFrames={60}>
      <SceneB />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);`;
};
