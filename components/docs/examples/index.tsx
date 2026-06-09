import type { ComponentType } from "react";
import { FPS, H, W } from "@/lib/customizer-config";
import { ButtonExampleScene, buttonExampleCode } from "./button-example";

export interface ExampleEntry {
  Component: ComponentType;
  code: string;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

export const examples: Record<string, ExampleEntry> = {
  "button-example": {
    Component: ButtonExampleScene,
    code: buttonExampleCode,
    durationInFrames: 132,
    fps: FPS,
    width: W,
    height: H,
  },
};
