import {
  Bot,
  Clapperboard,
  FileCode2,
  MonitorPlay,
  Wallet,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import { REASONS } from "@/config/landing";
import { cn } from "@/lib/utils";
import { SectionHeading } from "../section-heading";

const EYEBROW = "Why remocn";
const TITLE = "Every other way costs you something.";
const LEAD =
  "A designer’s invoice, a weekend in After Effects, or a screen recording you’re not proud of. remocn hands the animation to your agent already built.";

const ICONS: ComponentType<{ className?: string }>[] = [
  Wallet,
  Clapperboard,
  Bot,
  MonitorPlay,
  FileCode2,
  Zap,
];

export function WhyRemocn({ className }: { className?: string }) {
  return (
    <section
      id="why-remocn"
      className={cn("relative py-14 sm:py-20", className)}
    >
      <div className="section">
        <SectionHeading
          eyebrow={EYEBROW}
          title={TITLE}
          lead={LEAD}
          animated={false}
        />

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
          {REASONS.map((reason, i) => {
            const Icon = ICONS[i];
            return (
              <div key={reason.title} className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon
                      aria-hidden
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <h3 className="text-base font-medium text-foreground">
                      {reason.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
                    {reason.detail}
                  </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
