import { FAQ_ITEMS } from "@/config/landing";
import { SUPPORT_EMAIL } from "@/config/site";
import { cn } from "@/lib/utils";
import { FadeUp } from "../fade-up";
import { SectionHeading } from "../section-heading";

const EYEBROW = "Questions";
const TITLE = "Before you ask";
const LEAD =
  "The things people want to know before they open a terminal for the first time.";

export function Faq({ className }: { className?: string }) {
  return (
    <section id="faq" className={cn("relative py-14 sm:py-20", className)}>
      <div className="section">
        <SectionHeading eyebrow={EYEBROW} title={TITLE} lead={LEAD} />

        <FadeUp className="mt-10 sm:mt-14">
          <dl className="max-w-3xl">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={item.question}
                className={cn(
                  "py-6 sm:py-7",
                  i > 0 && "border-t border-border/60",
                )}
              >
                <dt className="text-base font-medium text-balance text-foreground sm:text-lg">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </FadeUp>

        <FadeUp delay={0.1}>
          <p className="mt-8 max-w-3xl border-t border-border/60 pt-8 text-sm text-muted-foreground sm:text-base">
            Still stuck?{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
            >
              Email us
            </a>{" "}
            and we'll walk you through it.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
