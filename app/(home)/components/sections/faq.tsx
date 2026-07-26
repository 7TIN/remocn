import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/config/landing";
import { cn } from "@/lib/utils";
import { FadeUp } from "../fade-up";
import { SectionHeading } from "../section-heading";

const EYEBROW = "Questions";
const TITLE = "Before you ask";

export function Faq({ className }: { className?: string }) {
  return (
    <section id="faq" className={cn("relative py-14 sm:py-20", className)}>
      <div className="section">
        <SectionHeading eyebrow={EYEBROW} title={TITLE} />

        <FadeUp className="mt-10 sm:mt-12">
          <Accordion className="max-w-3xl">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className="text-base sm:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeUp>
      </div>
    </section>
  );
}
