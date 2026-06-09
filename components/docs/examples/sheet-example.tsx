"use client";

import { Button } from "@/registry/remocn-ui/button";
import { useButtonTransition } from "@/registry/remocn-ui/button/use-button-transition";
import { Sheet } from "@/registry/remocn-ui/sheet";
import { useSheetTransition } from "@/registry/remocn-ui/sheet/use-sheet-transition";

export const SheetExampleScene = () => {
  // The trigger Button: idle → hover → press, the press lands just before the
  // sheet opens (the "click" that triggers it).
  const trigger = useButtonTransition([
    { at: 14, state: "hover" },
    { at: 26, state: "press" },
  ]);
  // The sheet slides in right after the press, then closes near the end.
  const sheet = useSheetTransition([
    { at: 32, state: "opened", duration: 16 },
    { at: 92, state: "closed", duration: 12 },
  ]);
  return (
    <>
      <Button label="Edit profile" style={trigger} />
      <Sheet style={sheet} />
    </>
  );
};

export const sheetExampleCode = `import { Sheet } from "@/components/remocn/sheet";
import { useSheetTransition } from "@/components/remocn/use-sheet-transition";
import { Button } from "@/components/remocn/button";
import { useButtonTransition } from "@/components/remocn/use-button-transition";

export const Scene = () => {
  const trigger = useButtonTransition([
    { at: 14, state: "hover" },
    { at: 26, state: "press" },
  ]);
  const sheet = useSheetTransition([
    { at: 32, state: "opened", duration: 16 },
    { at: 92, state: "closed", duration: 12 },
  ]);

  return (
    <>
      <Button label="Edit profile" style={trigger} />
      <Sheet style={sheet} />
    </>
  );
};`;
