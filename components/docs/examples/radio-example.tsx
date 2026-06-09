"use client";

import { Radio } from "@/registry/remocn-ui/radio";
import { useRadioTransition } from "@/registry/remocn-ui/radio/use-radio-transition";

export const RadioExampleScene = () => {
  const style = useRadioTransition([
    { at: 18, state: "checked", duration: 14 },
    { at: 78, state: "unchecked", duration: 12 },
  ]);
  return <Radio label="Subscribe to updates" style={style} />;
};

export const radioExampleCode = `import { Radio } from "@/components/remocn/radio";
import { useRadioTransition } from "@/components/remocn/use-radio-transition";

export const Scene = () => {
  const style = useRadioTransition([
    { at: 18, state: "checked", duration: 14 },
    { at: 78, state: "unchecked", duration: 12 },
  ]);

  return <Radio label="Subscribe to updates" style={style} />;
};`;
