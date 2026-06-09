"use client";

import { Button } from "@/registry/remocn-ui/button";
import { useButtonTransition } from "@/registry/remocn-ui/button/use-button-transition";

export const ButtonExampleScene = () => {
  const style = useButtonTransition([
    { at: 12, state: "hover" },
    { at: 30, state: "press" },
    { at: 48, state: "loading", duration: 6 },
    { at: 96, state: "success", duration: 16 },
  ]);
  return <Button label="Continue" style={style} />;
};

export const buttonExampleCode = `import { Button } from "@/components/remocn/button";
import { useButtonTransition } from "@/components/remocn/use-button-transition";

export const Scene = () => {
  const style = useButtonTransition([
    { at: 12, state: "hover" },
    { at: 30, state: "press" },
    { at: 48, state: "loading", duration: 6 },
    { at: 96, state: "success", duration: 16 },
  ]);

  return <Button label="Continue" style={style} />;
};`;
