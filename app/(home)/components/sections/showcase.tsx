import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getShowcases } from "@/lib/showcases";
import { cn } from "@/lib/utils";
import { ShowcaseGrid } from "../../showcases/components/showcase-grid";
import { SectionHeading } from "../section-heading";

const EYEBROW = "Showcase";
const TITLE = "This is what ships";
const LEAD =
  "Every video here is React code in someone's repo. Open it, read it, change a number.";

const LIMIT = 6;

export async function Showcase({ className }: { className?: string }) {
  const showcases = await getShowcases().catch(() => []);
  if (showcases.length === 0) return null;

  return (
    <section id="showcase" className={cn("relative py-14 sm:py-20", className)}>
      <div className="section">
        <SectionHeading
          eyebrow={EYEBROW}
          title={TITLE}
          lead={LEAD}
          action={
            <Link
              href="/showcases"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:text-base"
            >
              See all
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />

        <div className="mt-10 sm:mt-12">
          <ShowcaseGrid showcases={showcases.slice(0, LIMIT)} />
        </div>
      </div>
    </section>
  );
}
