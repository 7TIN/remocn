import { FOOTER_NAV } from "@/config/landing";
import { PageShell } from "./components/page-shell";
import { BentoRegistry } from "./components/sections/bento-registry";
import { FinalCTA } from "./components/sections/final-cta";
import { GetStarted } from "./components/sections/get-started";
import { Hero } from "./components/sections/hero";
import { InteractiveCode } from "./components/sections/interactive-code";
import { LandingPartners } from "./components/sections/landing-partners";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

export default async function Page() {
  return (
    <PageShell>
      <SiteHeader />
      <main className="relative flex-1">
        <Hero />
        <InteractiveCode />
        <BentoRegistry />
        <GetStarted />
        <LandingPartners />
        <FinalCTA />
        <SiteFooter navLinks={FOOTER_NAV} className="mt-12" />
      </main>
    </PageShell>
  );
}
