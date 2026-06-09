"use client";

import { Checkbox } from "@/registry/remocn-ui/checkbox";
import { useCheckboxTransition } from "@/registry/remocn-ui/checkbox/use-checkbox-transition";

export const CheckboxExampleScene = () => {
  const style = useCheckboxTransition([
    { at: 18, state: "checked", duration: 14 },
    { at: 78, state: "unchecked", duration: 12 },
  ]);
  return <Checkbox label="Accept terms and conditions" style={style} />;
};

export const checkboxExampleCode = `import { Checkbox } from "@/components/remocn/checkbox";
import { useCheckboxTransition } from "@/components/remocn/use-checkbox-transition";

export const Scene = () => {
  const style = useCheckboxTransition([
    { at: 18, state: "checked", duration: 14 },
    { at: 78, state: "unchecked", duration: 12 },
  ]);

  return <Checkbox label="Accept terms and conditions" style={style} />;
};`;
