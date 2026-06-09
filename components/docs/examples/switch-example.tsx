"use client";

import { Switch } from "@/registry/remocn-ui/switch";
import { useSwitchTransition } from "@/registry/remocn-ui/switch/use-switch-transition";

export const SwitchExampleScene = () => {
  const style = useSwitchTransition([
    { at: 18, state: "checked", duration: 14 },
    { at: 78, state: "unchecked", duration: 12 },
  ]);
  return <Switch label="Enable notifications" style={style} />;
};

export const switchExampleCode = `import { Switch } from "@/components/remocn/switch";
import { useSwitchTransition } from "@/components/remocn/use-switch-transition";

export const Scene = () => {
  const style = useSwitchTransition([
    { at: 18, state: "checked", duration: 14 },
    { at: 78, state: "unchecked", duration: 12 },
  ]);

  return <Switch label="Enable notifications" style={style} />;
};`;
