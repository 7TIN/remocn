"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type CSSProperties, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SPRING_SOFT } from "@/config/site";
import { type BillingMode, type Tier, tiers } from "@/config/sponsors";
import { cn } from "@/lib/utils";

function BillingToggle({
  value,
  onChange,
}: {
  value: BillingMode;
  onChange: (v: BillingMode) => void;
}) {
  const reduced = useReducedMotion();
  const options: { id: BillingMode; label: string }[] = [
    { id: "monthly", label: "Monthly" },
    { id: "one-time", label: "One-time" },
  ];

  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <Button
            key={opt.id}
            variant="ghost"
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "relative rounded-full px-5 text-sm font-medium transition-colors duration-200 before:absolute before:inset-x-0 before:-inset-y-2 before:content-['']",
              active
                ? "text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.div
                layoutId="billing-thumb"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={reduced ? { duration: 0 } : SPRING_SOFT}
              />
            )}
            <span className="relative">{opt.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

function TierCard({
  tier,
  billingMode,
}: {
  tier: Tier;
  billingMode: BillingMode;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const checkoutUrl =
    billingMode === "monthly" ? tier.monthlyUrl : tier.oneTimeUrl;
  const priceSuffix = billingMode === "monthly" ? "/mo" : "one-time";

  return (
    <motion.div whileHover="hover" className="h-full">
      <motion.article
        ref={ref}
        onMouseMove={handleMove}
        variants={reduced ? undefined : { hover: { y: -4 } }}
        transition={SPRING_SOFT}
        style={
          {
            "--mx": "50%",
            "--my": "50%",
            ...(tier.highlighted && {
              backgroundColor: `color-mix(in oklab, var(--color-card) 94%, ${tier.glow})`,
            }),
          } as CSSProperties
        }
        className={cn(
          "surface-card group relative flex h-full flex-col overflow-hidden rounded-3xl p-8",
          tier.highlighted && "surface-card-highlighted",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(500px circle at var(--mx) var(--my), ${tier.glow}1A, transparent 40%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-8 top-0 h-0.5"
          style={{
            background: `linear-gradient(to right, transparent, ${tier.glow}, transparent)`,
          }}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <span className="font-mono text-xs text-muted-foreground">
              {tier.tagline}
            </span>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {tier.name}
            </h3>
          </div>
          {tier.badge && <Badge variant="secondary">{tier.badge}</Badge>}
        </div>

        <div className="relative mt-6 flex items-baseline gap-2 overflow-hidden">
          <motion.div
            key={billingMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : SPRING_SOFT}
            className="flex items-baseline gap-2"
          >
            <span className="text-5xl font-semibold tracking-tight text-foreground">
              ${tier.price}
            </span>
            <span className="text-sm text-muted-foreground">{priceSuffix}</span>
          </motion.div>
        </div>

        <Separator className="relative my-6 bg-border" />

        <ul className="relative flex flex-col gap-3">
          {tier.perks.map((perk) => (
            <li
              key={perk}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <Check
                className="mt-[3px] size-3.5 shrink-0"
                style={{ color: tier.glow }}
                aria-hidden="true"
              />
              <span>{perk}</span>
            </li>
          ))}
        </ul>

        <div className="relative mt-auto pt-10">
          <Button
            variant={tier.highlighted ? "default" : "outline"}
            size="lg"
            className="h-11 w-full gap-2 rounded-full"
            render={
              // biome-ignore lint/a11y/useAnchorContent: Base UI render prop merges the button children into this anchor
              <a href={checkoutUrl} target="_blank" rel="noreferrer" />
            }
          >
            Become a {tier.name}
            <ArrowRight
              data-icon="inline-end"
              className="size-4"
              aria-hidden="true"
            />
          </Button>
        </div>
      </motion.article>
    </motion.div>
  );
}

export function Tiers() {
  const [billingMode, setBillingMode] = useState<BillingMode>("monthly");

  return (
    <section id="tiers" className="relative py-20 sm:py-24">
      <div className="section">
        <div className="mb-10 flex justify-center">
          <BillingToggle value={billingMode} onChange={setBillingMode} />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} billingMode={billingMode} />
          ))}
        </div>
      </div>
    </section>
  );
}
