"use client";

import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import { glitchCut } from "@/registry/remocn/glitch-cut";

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

interface GlitchCutExampleProps {
  intensity?: number;
  slices?: number;
  rgbSplit?: number;
  blockNoise?: number;
}

export function GlitchCutExampleScene({
  intensity,
  slices,
  rgbSplit,
  blockNoise,
}: GlitchCutExampleProps) {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={45}>
        <Scene label="Scene A" background="#0a0a0a" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        timing={linearTiming({ durationInFrames: 12 })}
        presentation={glitchCut({ intensity, slices, rgbSplit, blockNoise })}
      />
      <TransitionSeries.Sequence durationInFrames={45}>
        <Scene label="Scene B" background="#141318" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
}

export const glitchCutExampleCode = (
  values: Record<string, unknown>,
): string => {
  const intensity = (values.intensity as number) ?? 1;
  const slices = (values.slices as number) ?? 24;
  const rgbSplit = (values.rgbSplit as number) ?? 1;
  const blockNoise = (values.blockNoise as number) ?? 0.6;
  return `import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { glitchCut } from "@/components/remocn/glitch-cut";

export const MyVideo = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={45}>
      <SceneA />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      timing={linearTiming({ durationInFrames: 12 })}
      presentation={glitchCut({ intensity: ${intensity}, slices: ${slices}, rgbSplit: ${rgbSplit}, blockNoise: ${blockNoise} })}
    />
    <TransitionSeries.Sequence durationInFrames={45}>
      <SceneB />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);`;
};
