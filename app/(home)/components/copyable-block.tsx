"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type CopyEvent = {
  component: string;
  packageManager: "pnpm" | "npm" | "yarn" | "bun" | "prompt";
  surface: "docs" | "landing" | "bento";
};

function useCopy(value: string, event: CopyEvent) {
  const [copied, setCopied] = useState(false);
  const trackEvent = useTrackEvent();

  return {
    copied,
    copy: () => {
      navigator.clipboard.writeText(value);
      setCopied(true);
      trackEvent("install_command_copied", {
        component: event.component,
        package_manager: event.packageManager,
        surface: event.surface,
      });
      setTimeout(() => setCopied(false), 1500);
    },
  };
}

export function CopyableButton({
  value,
  label,
  event,
  className,
}: {
  value: string;
  label: string;
  event: CopyEvent;
  className?: string;
}) {
  const { copied, copy } = useCopy(value, event);

  return (
    <Button
      variant="secondary"
      onClick={copy}
      aria-label={`Copy ${label.toLowerCase()}`}
      size="lg"
      className={cn("rounded-full font-medium", className)}
    >
      <span className="text-foreground">{label}</span>
      <span aria-hidden className="text-muted-foreground/70">
        {copied ? (
          <Check className="size-4 text-foreground" />
        ) : (
          <Copy className="size-4" />
        )}
      </span>
    </Button>
  );
}

export function CopyablePanel({
  value,
  caption,
  event,
  className,
}: {
  value: string;
  caption?: string;
  event: CopyEvent;
  className?: string;
}) {
  const { copied, copy } = useCopy(value, event);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {caption && (
        <p className="text-sm text-muted-foreground">{caption}</p>
      )}
      <div className="surface-card relative flex items-start gap-3 rounded-2xl p-4 text-left sm:p-5">
        <p className="min-w-0 flex-1 text-pretty text-sm leading-relaxed text-foreground sm:text-base">
          {value}
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={copy}
          aria-label="Copy prompt"
          className="shrink-0 rounded-full"
        >
          {copied ? (
            <Check className="size-4 text-foreground" />
          ) : (
            <Copy className="size-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}
