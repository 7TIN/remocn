import { loadFont } from "@remotion/google-fonts/Geist";
import type { ComponentType } from "react";
import {
  AbsoluteFill,
  Composition,
  isHtmlInCanvasSupported,
  registerRoot,
} from "remotion";
import { EmberBurnExampleScene } from "@/components/docs/examples/ember-burn-example";
import { GlitchCutExampleScene } from "@/components/docs/examples/glitch-cut-example";
import type { ComponentConfig } from "@/lib/customizer-config";
import { emberBurnConfig } from "@/registry/remocn/ember-burn/config";
import { glitchCutConfig } from "@/registry/remocn/glitch-cut/config";

const { fontFamily: GEIST } = loadFont();

if (typeof document !== "undefined") {
  console.log(
    `[canvas-spike] htmlInCanvasSupported=${isHtmlInCanvasSupported()}`,
  );
  console.log(`[canvas-spike] userAgent=${navigator.userAgent}`);
}

const SCENES: Record<
  string,
  { Scene: ComponentType; config: ComponentConfig }
> = {
  "glitch-cut": { Scene: GlitchCutExampleScene, config: glitchCutConfig },
  "ember-burn": { Scene: EmberBurnExampleScene, config: emberBurnConfig },
};

function makeStage(Scene: ComponentType) {
  return function CanvasSpikeStage() {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#0a0a0a",
          ["--font-geist-sans" as string]: GEIST,
          fontFamily: GEIST,
        }}
      >
        <Scene />
      </AbsoluteFill>
    );
  };
}

const STAGES: Record<string, ReturnType<typeof makeStage>> = Object.fromEntries(
  Object.entries(SCENES).map(([id, entry]) => [id, makeStage(entry.Scene)]),
);

export function CanvasSpikeRoot() {
  return (
    <>
      {Object.entries(SCENES).map(([id, entry]) => (
        <Composition
          key={id}
          id={id}
          component={STAGES[id]}
          durationInFrames={entry.config.durationInFrames}
          fps={entry.config.fps}
          width={entry.config.compositionWidth}
          height={entry.config.compositionHeight}
        />
      ))}
    </>
  );
}

registerRoot(CanvasSpikeRoot);
