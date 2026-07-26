"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { INSTALL_ALL_NAMES } from "@/config/site";
import { useTrackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { FadeUp } from "../fade-up";
import { InstallAll } from "../install-all";

export function DeveloperEntry({ className }: { className?: string }) {
  const trackEvent = useTrackEvent();

  return (
    <section
      id="for-developers"
      className={cn("relative py-14 sm:py-20", className)}
    >
      <div className="section">
        <FadeUp>
          <div className="surface-card flex flex-col gap-6 rounded-3xl p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
                Already write React?
              </h2>
              <p className="mt-3 text-base leading-relaxed text-pretty text-muted-foreground">
                Skip all of the above. It's a shadcn registry —{" "}
                {INSTALL_ALL_NAMES.length} components, MIT, built on Remotion.
                Install what you need and own the code.
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
              <InstallAll />
              <Link
                href="/docs/getting-started/introduction"
                onClick={() =>
                  trackEvent("cta_clicked", {
                    cta: "developer_docs",
                    destination: "/docs/getting-started/introduction",
                  })
                }
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Component docs
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
