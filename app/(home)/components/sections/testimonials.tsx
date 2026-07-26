import { COMPONENT_COUNT } from "@/config/site";
import { type Testimonial, testimonials } from "@/config/testimonials";
import { FadeUp } from "../fade-up";
import { SectionHeading } from "../section-heading";

const FACTS = [
  { value: String(COMPONENT_COUNT), label: "components" },
  { value: "MIT", label: "licensed" },
  { value: "Any", label: "coding agent" },
];

function TestimonialCard({
  authorAvatar,
  authorName,
  url,
  quote,
}: Testimonial) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="surface-card flex w-80 shrink-0 flex-col gap-4 rounded-2xl p-5 transition-colors hover:border-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <div className="flex items-center gap-3">
        {/** biome-ignore lint/performance/noImgElement: remote unavatar.io avatars of arbitrary origin */}
        <img
          src={authorAvatar}
          alt={authorName}
          loading="lazy"
          className="size-10 rounded-full border border-border object-cover"
        />
        <span className="text-sm font-medium text-foreground">
          {authorName}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
        {quote}
      </p>
    </a>
  );
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: Testimonial[];
  reverse?: boolean;
}) {
  return (
    <div className="group flex overflow-hidden">
      <div
        className="flex shrink-0 gap-4 pr-4 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:[animation:none]"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {items.map((t, i) => (
          <TestimonialCard key={`${t.authorName}-${i}`} {...t} />
        ))}
        {items.map((t, i) => (
          <TestimonialCard key={`${t.authorName}-${i}-dup`} {...t} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  const topRow = testimonials;
  const bottomRow = [...testimonials].reverse();

  return (
    <section id="testimonials" className="relative py-14 sm:py-20">
      <div className="section">
        <SectionHeading
          align="center"
          eyebrow="Wall of love"
          title="Builders are shipping with remocn"
          lead="Builders who needed a demo video for their product and shipped one the same day."
        />

        <FadeUp delay={0.06}>
          <dl className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm sm:gap-x-12 sm:text-base">
            {FACTS.map((fact) => (
              <div key={fact.label} className="flex items-baseline gap-2">
                <dt className="font-semibold text-foreground">{fact.value}</dt>
                <dd className="text-muted-foreground">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </FadeUp>
      </div>

      <FadeUp delay={0.1}>
        <div className="marquee-edge-fade mt-12 flex flex-col gap-4">
          <MarqueeRow items={topRow} />
          <MarqueeRow items={bottomRow} reverse />
        </div>
      </FadeUp>
    </section>
  );
}
