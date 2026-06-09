"use client";

import { Tabs } from "@/registry/remocn-ui/tabs";
import { useTabsTransition } from "@/registry/remocn-ui/tabs/use-tabs-transition";

export const TabsExampleScene = () => {
  const style = useTabsTransition([
    { at: 18, state: "Account", duration: 16 },
    { at: 58, state: "Password", duration: 18 },
    { at: 94, state: "Settings", duration: 12 },
  ]);
  return <Tabs style={style} />;
};

export const tabsExampleCode = `import { Tabs } from "@/components/remocn/tabs";
import { useTabsTransition } from "@/components/remocn/use-tabs-transition";

export const Scene = () => {
  const style = useTabsTransition([
    { at: 18, state: "Account", duration: 16 },
    { at: 58, state: "Password", duration: 18 },
    { at: 94, state: "Settings", duration: 12 },
  ]);

  return <Tabs style={style} />;
};`;
