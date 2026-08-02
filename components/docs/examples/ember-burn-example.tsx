"use client";

import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import { emberBurn } from "@/registry/remocn/ember-burn";

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

interface EmberBurnExampleProps {
  patches?: number;
  edgeSoftness?: number;
  contentBias?: number;
  heat?: number;
  glowColor?: string;
  emberAmount?: number;
}

export function EmberBurnExampleScene({
  patches,
  edgeSoftness,
  contentBias,
  heat,
  glowColor,
  emberAmount,
}: EmberBurnExampleProps) {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}>
        <Scene label="Scene A" background="#0a0a0a" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        timing={linearTiming({ durationInFrames: 40 })}
        presentation={emberBurn({
          patches,
          edgeSoftness,
          contentBias,
          heat,
          glowColor,
          emberAmount,
        })}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Scene label="Scene B" background="#161014" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
}

export const emberBurnExampleCode = (
  values: Record<string, unknown>,
): string => {
  const patches = (values.patches as number) ?? 5;
  const edgeSoftness = (values.edgeSoftness as number) ?? 0.07;
  const contentBias = (values.contentBias as number) ?? 0.6;
  const heat = (values.heat as number) ?? 0.5;
  const glowColor = (values.glowColor as string) ?? "#ff7a2f";
  const emberAmount = (values.emberAmount as number) ?? 0.5;
  return `import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { emberBurn } from "@/components/remocn/ember-burn";

export const MyVideo = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={60}>
      <SceneA />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      timing={linearTiming({ durationInFrames: 40 })}
      presentation={emberBurn({ patches: ${patches}, edgeSoftness: ${edgeSoftness}, contentBias: ${contentBias}, heat: ${heat}, glowColor: "${glowColor}", emberAmount: ${emberAmount} })}
    />
    <TransitionSeries.Sequence durationInFrames={60}>
      <SceneB />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);`;
};
