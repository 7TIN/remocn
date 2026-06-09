"use client";

import { Accordion } from "@/registry/remocn-ui/accordion";
import { useAccordionTransition } from "@/registry/remocn-ui/accordion/use-accordion-transition";

export const AccordionExampleScene = () => {
  const style = useAccordionTransition([
    { at: 18, state: "opened", duration: 16 },
    { at: 78, state: "closed", duration: 12 },
  ]);
  return (
    <Accordion
      title="Is it accessible?"
      content="Yes. It adheres to the WAI-ARIA design pattern."
      style={style}
    />
  );
};

export const accordionExampleCode = `import { Accordion } from "@/components/remocn/accordion";
import { useAccordionTransition } from "@/components/remocn/use-accordion-transition";

export const Scene = () => {
  const style = useAccordionTransition([
    { at: 18, state: "opened", duration: 16 },
    { at: 78, state: "closed", duration: 12 },
  ]);

  return (
    <Accordion
      title="Is it accessible?"
      content="Yes. It adheres to the WAI-ARIA design pattern."
      style={style}
    />
  );
};`;
