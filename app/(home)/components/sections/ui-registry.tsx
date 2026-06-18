"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { type ComponentType, useRef, useState } from "react";
import { SpotlightSurface } from "@/components/spotlight-surface";
import { Button } from "@/components/ui/button";
import { blockExamples } from "@/components/docs/examples/blocks";
import { examples } from "@/components/docs/examples";
import { SPRING_SOFT } from "@/config/site";
import { cn } from "@/lib/utils";
import { FadeUp } from "../fade-up";
import { useAutoplay } from "../use-autoplay";

interface SceneEntry {
  Component: ComponentType;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

const atomEntry = (name: string): SceneEntry | undefined =>
  examples[`${name}-example`] as SceneEntry | undefined;
const flowEntry = (name: string): SceneEntry | undefined =>
  blockExamples[name] as SceneEntry | undefined;

function ScenePlayer({ entry }: { entry: SceneEntry | undefined }) {
  const ref = useRef<PlayerRef>(null);
  useAutoplay(ref, Boolean(entry));

  if (!entry) return null;

  return (
    <Player
      ref={ref}
      component={entry.Component}
      inputProps={{}}
      durationInFrames={entry.durationInFrames}
      fps={entry.fps}
      compositionWidth={entry.width}
      compositionHeight={entry.height}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      clickToPlay={false}
      loop
      initiallyMuted
      acknowledgeRemotionLicense
    />
  );
}

function InstallPill({ name }: { name: string }) {
  const command = `npx shadcn@latest add @remocn/${name}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      variant="outline"
      type="button"
      onClick={copy}
      aria-label={`Copy install command for ${name}`}
      className="flex w-full items-center gap-2.5 rounded-xl border-border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:ring-ring/40"
    >
      <span aria-hidden className="select-none text-muted-foreground/50">
        $
      </span>
      <span className="min-w-0 flex-1 truncate text-left text-foreground/90">
        npx shadcn add <span className="text-foreground">@remocn/{name}</span>
      </span>
      <span aria-hidden className="shrink-0 text-muted-foreground/70">
        {copied ? (
          <Check className="size-3.5 text-foreground" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </span>
    </Button>
  );
}

const EYEBROW = "remocn-ui";
const TITLE = "shadcn, on the timeline";
const LEAD =
  "The shadcn primitives you already know — Button, Input, Select, Dialog — but their states are scripted on the Remotion frame. No useState, no event handlers: every pixel is a pure function of the timeline.";

const ATOMS = [
  { name: "select", title: "Select", description: "Panel reveals, then an item check lands" },
  { name: "input", title: "Input", description: "Focus ring and a typed value reveal" },
  { name: "switch", title: "Switch", description: "Track fill with a sliding thumb" },
  {
    name: "command-menu",
    title: "Command Menu",
    description: "⌘K palette opens, then filters",
  },
] as const;

const PRIMITIVE_CHIPS = [
  "button",
  "input",
  "checkbox",
  "switch",
  "select",
  "dialog",
  "toast",
  "command-menu",
  "tabs",
  "slider",
  "tooltip",
  "stepper",
];

function PreviewSurface({
  entry,
  className,
}: {
  entry: SceneEntry | undefined;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={SPRING_SOFT}
      className={cn(
        "surface-card relative aspect-video overflow-hidden rounded-2xl shadow-xl shadow-black/5 sm:rounded-3xl dark:shadow-black/30",
        className,
      )}
    >
      <ScenePlayer entry={entry} />
    </motion.div>
  );
}

export function UiRegistry() {
  return (
    <section id="ui-registry" className="relative py-20 sm:py-20">
      <div className="section">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <FadeUp>
            <p className="mb-3 text-base font-medium text-muted-foreground">
              {EYEBROW}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
              {TITLE}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              {LEAD}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {PRIMITIVE_CHIPS.map((name) => (
                <Link
                  key={name}
                  href={`/docs/ui/components/${name}`}
                  className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                >
                  {name}
                </Link>
              ))}
              <Link
                href="/docs/ui"
                className="rounded-lg px-2.5 py-1 text-xs text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                + more
              </Link>
            </div>

            <div className="mt-7 max-w-sm">
              <InstallPill name="signup-flow" />
            </div>
          </FadeUp>

          <FadeUp delay={0.12}>
            <Link
              href="/docs/ui/blocks/signup-flow"
              aria-label="Open the Signup Flow documentation"
              className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:rounded-3xl"
            >
              <PreviewSurface entry={flowEntry("signup-flow")} />
            </Link>
          </FadeUp>
        </div>

        <FadeUp delay={0.18}>
          <SpotlightSurface className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {ATOMS.map((atom) => (
              <Link
                key={atom.name}
                href={`/docs/ui/components/${atom.name}`}
                className="group flex flex-col rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <PreviewSurface entry={atomEntry(atom.name)} className="sm:rounded-2xl" />
                <div className="flex items-start justify-between gap-2 px-1 pt-3">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                      {atom.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {atom.description}
                    </p>
                  </div>
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground"
                  />
                </div>
              </Link>
            ))}
          </SpotlightSurface>
        </FadeUp>
      </div>
    </section>
  );
}
