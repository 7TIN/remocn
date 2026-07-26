"use client";

import { QUICKSTART_PROMPT } from "@/config/site";
import { CopyablePanel } from "./copyable-block";

export function PromptQuickstart({
  caption,
  className,
}: {
  caption?: string;
  className?: string;
}) {
  return (
    <CopyablePanel
      value={QUICKSTART_PROMPT}
      caption={caption}
      event={{
        component: "quickstart_prompt",
        packageManager: "prompt",
        surface: "landing",
      }}
      className={className}
    />
  );
}
