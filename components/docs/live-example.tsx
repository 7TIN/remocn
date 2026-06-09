"use client";

import { Player } from "@remotion/player";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { examples } from "./examples";

export function LiveExample({ name }: { name: string }) {
  const entry = examples[name];

  if (!entry) {
    return (
      <div className="not-prose mb-6 rounded-lg border border-fd-border p-4 text-sm text-fd-muted-foreground">
        Unknown component: <code>{name}</code>
      </div>
    );
  }

  return (
    <div className="not-prose mb-6 flex w-full flex-col gap-4">
      <Tabs defaultValue="preview" className="gap-3">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-0">
          <LivePreviewStage entry={entry} name={name} />
        </TabsContent>

        <TabsContent value="code" className="mt-0">
          <div className="surface-card overflow-hidden rounded-2xl [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!bg-transparent">
            <DynamicCodeBlock lang="tsx" code={entry.code} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LivePreviewStage({
  entry,
  name,
}: {
  entry: (typeof examples)[string];
  name: string;
}) {
  const [mounted, setMounted] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (mounted) return;
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted]);

  return (
    <div
      ref={frameRef}
      className="surface-card aspect-video w-full overflow-hidden rounded-2xl"
    >
      {mounted ? (
        <div
          className={cn(
            "size-full",
            !reducedMotion && "animate-in fade-in duration-300 ease-out",
          )}
        >
          <Player
            component={entry.Component}
            inputProps={{}}
            durationInFrames={entry.durationInFrames}
            fps={entry.fps}
            compositionWidth={entry.width}
            compositionHeight={entry.height}
            style={{ width: "100%", height: "100%" }}
            controls
            loop
            autoPlay
            acknowledgeRemotionLicense
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setMounted(true)}
          aria-label={`Play preview of ${name}`}
          className={cn(
            "group flex size-full items-center justify-center bg-muted/40 transition-colors",
            "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-background/80 text-foreground transition-colors group-hover:bg-background">
            <PlayIcon className="size-5 translate-x-px fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
