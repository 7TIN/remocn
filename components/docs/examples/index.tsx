import type { ComponentType } from "react";
import { FPS, H, W } from "@/lib/customizer-config";
import {
  AccordionExampleScene,
  accordionExampleCode,
} from "./accordion-example";
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
  "accordion-example": {
    Component: AccordionExampleScene,
    code: accordionExampleCode,
    // Last transition (close) completes at frame 90; a short settle then loop.
    durationInFrames: 100,
    fps: FPS,
    width: W,
    height: H,
  },
};
