"use client";

import { Button } from "@/registry/remocn-ui/button";
import { useButtonTransition } from "@/registry/remocn-ui/button/use-button-transition";
import { Drawer } from "@/registry/remocn-ui/drawer";
import { useDrawerTransition } from "@/registry/remocn-ui/drawer/use-drawer-transition";

export const DrawerExampleScene = () => {
  // The trigger Button: idle → hover → press, the press lands just before the
  // drawer opens (the "click" that triggers it).
  const trigger = useButtonTransition([
    { at: 14, state: "hover" },
    { at: 26, state: "press" },
  ]);
  // The drawer slides up right after the press, then closes near the end.
  const drawer = useDrawerTransition([
    { at: 32, state: "opened", duration: 16 },
    { at: 92, state: "closed", duration: 12 },
  ]);
  return (
    <>
      <Button label="Edit profile" style={trigger} />
      <Drawer style={drawer} />
    </>
  );
};

export const drawerExampleCode = `import { Drawer } from "@/components/remocn/drawer";
import { useDrawerTransition } from "@/components/remocn/use-drawer-transition";
import { Button } from "@/components/remocn/button";
import { useButtonTransition } from "@/components/remocn/use-button-transition";

export const Scene = () => {
  const trigger = useButtonTransition([
    { at: 14, state: "hover" },
    { at: 26, state: "press" },
  ]);
  const drawer = useDrawerTransition([
    { at: 32, state: "opened", duration: 16 },
    { at: 92, state: "closed", duration: 12 },
  ]);

  return (
    <>
      <Button label="Edit profile" style={trigger} />
      <Drawer style={drawer} />
    </>
  );
};`;
