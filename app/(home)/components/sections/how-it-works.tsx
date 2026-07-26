"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { type HowItWorksStep, HOW_IT_WORKS_STEPS } from "@/config/landing";
import { useTrackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { FadeUp } from "../fade-up";
import { PromptQuickstart } from "../prompt-quickstart";
import { SectionHeading } from "../section-heading";

const EYEBROW = "How it works";
const TITLE = "Two things: an agent and an empty folder.";
const LEAD =
  "No editor to learn, no timeline to scrub. You describe, it builds, you watch it happen.";

function StepRow({
  step,
  index,
  children,
}: {
  step: HowItWorksStep;
  index: number;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-6 sm:flex-row sm:gap-6",
        index > 0 && "border-t border-border/60",
      )}
    >
      <span className="shrink-0 font-mono text-sm text-muted-foreground/70 sm:pt-1">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium text-foreground sm:text-lg">
          {step.title}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
          {step.detail}
        </p>
        {children}
      </div>
    </div>
  );
}

export function HowItWorks({ className }: { className?: string }) {
  const trackEvent = useTrackEvent();

  return (
    <section
      id="how-it-works"
      className={cn("relative py-14 sm:py-20", className)}
    >
      <div className="section">
        <SectionHeading eyebrow={EYEBROW} title={TITLE} lead={LEAD} />

        <FadeUp className="mt-10 sm:mt-14">
          <div className="surface-card rounded-3xl px-5 py-1 sm:px-8">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <StepRow key={step.title} step={step} index={i}>
                {i === 1 && <PromptQuickstart className="mt-4" />}
              </StepRow>
            ))}
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <Link
            href="/docs/guides/setup"
            onClick={() =>
              trackEvent("cta_clicked", {
                cta: "how_it_works_setup",
                destination: "/docs/guides/setup",
              })
            }
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:text-base"
          >
            First time? The setup guide takes ten minutes
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
