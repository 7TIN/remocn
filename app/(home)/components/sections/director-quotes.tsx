"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { DIRECTOR_QUOTES } from "@/config/landing";
import { useTrackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { FadeUp } from "../fade-up";
import { SectionHeading } from "../section-heading";

const EYEBROW = "Direction";
const TITLE = "Talk to it like a director.";
const LEAD =
  "You don't set easing curves or keyframes. You say what feels wrong, and it fixes it.";

function Quote({ text, index }: { text: string; index: number }) {
  return (
    <FadeUp delay={index * 0.06}>
      <p
        className={cn(
          "surface-card rounded-2xl px-5 py-4 text-base leading-relaxed text-pretty text-foreground sm:text-lg",
        )}
      >
        &ldquo;{text}&rdquo;
      </p>
    </FadeUp>
  );
}

export function DirectorQuotes({ className }: { className?: string }) {
  const trackEvent = useTrackEvent();

  return (
    <section id="direction" className={cn("relative py-14 sm:py-20", className)}>
      <div className="section">
        <SectionHeading eyebrow={EYEBROW} title={TITLE} lead={LEAD} />

        <div className="mt-10 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4">
          {DIRECTOR_QUOTES.map((quote, i) => (
            <Quote key={quote} text={quote} index={i} />
          ))}
        </div>

        <FadeUp delay={0.1}>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground">
            Every piece in remocn is documented for agents as much as for people
            — what it does, how long it runs, when to reach for it. Your agent
            picks, you react.
          </p>
          <Link
            href="/docs/guides/directing-your-agent"
            onClick={() =>
              trackEvent("cta_clicked", {
                cta: "director_guide",
                destination: "/docs/guides/directing-your-agent",
              })
            }
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:text-base"
          >
            How to direct your agent
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
