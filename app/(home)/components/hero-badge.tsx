"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useTrackEvent } from "@/lib/analytics";

const HERO_BADGE_HREF =
  "https://remocn.dev/changelog#2026-07-21-stop-motion-wave-2";

export function HeroBadge() {
  const trackEvent = useTrackEvent();

  return (
    <Badge
      variant="outline"
      className="mb-5 h-7 gap-1.5 rounded-full px-3 text-xs"
      render={
        <Link
          href={HERO_BADGE_HREF}
          onClick={() =>
            trackEvent("cta_clicked", {
              cta: "hero_ui_badge",
              destination: HERO_BADGE_HREF,
            })
          }
        />
      }
    >
      <span className="font-semibold text-foreground">New</span>
      <span aria-hidden className="text-muted-foreground/60">
        ·
      </span>
      <span className="text-muted-foreground">
        <span className="text-foreground">Stop Motion Animations</span>
      </span>
      <ArrowRight className="size-3" aria-hidden="true" />
    </Badge>
  );
}
