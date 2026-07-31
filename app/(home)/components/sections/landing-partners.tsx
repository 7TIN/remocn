import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getLandingSponsors, type Sponsor } from "@/config/sponsors";
import { cn } from "@/lib/utils";
import { SectionHeading } from "../section-heading";

function SponsorLogoCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noreferrer"
      className="group surface-card surface-card-interactive flex items-center justify-center gap-3 rounded-2xl px-8 py-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {/** biome-ignore lint/performance/noImgElement: sponsor logos are SVGs of arbitrary sizes */}
      <img
        src={sponsor.logoUrl}
        alt={sponsor.name}
        loading="lazy"
        className={cn(
          "max-h-10 w-auto object-contain opacity-70 grayscale transition-opacity duration-300 group-hover:opacity-100 dark:[filter:grayscale(1)_brightness(0)_invert(1)]",
          sponsor.customStyles,
        )}
        style={{ transform: `scale(${sponsor.logoScale ?? 1})` }}
      />
      {sponsor.displayName && (
        <span className="text-base font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
          {sponsor.displayName}
        </span>
      )}
    </a>
  );
}

export function LandingPartners() {
  const promoted = getLandingSponsors();
  const ordered = [
    ...promoted.filter((s) => s.tier !== "featured"),
    ...promoted.filter((s) => s.tier === "featured"),
  ];

  return (
    <section id="partners" className="relative py-14 sm:py-20">
      <div className="section">
        <SectionHeading
          align="center"
          eyebrow="Sponsors"
          title="Backed by the community"
          lead="remocn is free and MIT-licensed. Sponsors keep the registry growing and the renders fast."
          animated={false}
        />

        {ordered.length > 0 && (
          <div
            className={cn(
              "mx-auto mt-12 grid max-w-3xl gap-4 sm:gap-6",
              ordered.length === 1
                ? "max-w-sm grid-cols-1"
                : "grid-cols-2 lg:grid-cols-3",
            )}
          >
            {ordered.map((s) => (
              <SponsorLogoCard key={s.id} sponsor={s} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/sponsors"
            className="group relative inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
          >
            Become a sponsor
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
