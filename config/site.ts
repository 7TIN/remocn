import remocnRegistry from "@/registry/remocn/registry.json";
import remocnIconsRegistry from "@/registry/remocn-icons/registry.json";
import remocnUiRegistry from "@/registry/remocn-ui/registry.json";

// Pastel accent palette — peach / lavender / mint.
// Used sparingly as low-opacity decorative glows; the base system is neutral.
export const PEACH = "#FFB38E";
export const LAVENDER = "#D4B3FF";
export const MINT = "#A1EEBD";

export const GITHUB_URL = "https://github.com/Remocn/remocn";

export const X_URL = "https://x.com/_remocn";

export const THREADS_URL = "https://www.threads.com/@_remocn";

export const SUPPORT_EMAIL = "kapish@remocn.dev";

export const INSTALL_ALL_NAMES: string[] = [
  ...remocnRegistry.items,
  ...remocnUiRegistry.items,
].map((item) => item.name);

export const INSTALL_ALL_COMMAND = `npx shadcn@latest add ${INSTALL_ALL_NAMES.map(
  (name) => `@remocn/${name}`,
).join(" ")}`;

export const COMPONENT_COUNT =
  remocnRegistry.items.length +
  remocnUiRegistry.items.length +
  remocnIconsRegistry.items.length;

export const SPRING_BOUNCE = {
  type: "spring" as const,
  stiffness: 120,
  damping: 14,
};
export const SPRING_SOFT = {
  type: "spring" as const,
  stiffness: 180,
  damping: 22,
};

export type NavLink = {
  href: string;
  label: string;
  /** Hidden on mobile (matches the existing `hidden sm:inline` pattern). */
  smOnly?: boolean;
};

// Единый источник топ-навигации для landing / sponsors / docs.
export const NAV_LINKS: NavLink[] = [
  { href: "/docs/typography", label: "Components" },
  { href: "/docs/shaders/getting-started/introduction", label: "Shaders" },
  { href: "/docs/icons/gallery", label: "Icons" },
  { href: "/showcases", label: "Showcases" },
  { href: "/blog", label: "Blog" },
  { href: "/sponsors", label: "Sponsors" },
];

/**
 * Docs whose sidebar menu item should carry the animated "NEW" badge. Keyed by
 * the page's docs URL (the Fumadocs page-tree `item.url`). Add a path here to
 * tag another menu item — no component changes needed. See `withNewBadges`.
 */
export const NEW_BADGE_PATHS = new Set<string>([
  "/docs/typography/handwrite",
  "/docs/typography/ink-underline",
  "/docs/effects/paper-wobble",
  "/docs/effects/ink-arrow",
  "/docs/ui-blocks/paper-sticker",
  "/docs/ui-blocks/polaroid",
  "/docs/transitions/page-turn",
  "/docs/ui-blocks/check-list",
  "/docs/effects/scribble-circle",
  "/docs/typography/hand-count",
  "/docs/effects/crumple-toss",
  "/docs/transitions/ascii-dissolve",
  "/docs/transitions/caret-wipe",
  "/docs/transitions/icon-scatter",
  "/docs/shaders/components/shader-caustics",
  "/docs/shaders/components/shader-gem-smoke",
  "/docs/shaders/components/shader-strata",
  "/docs/shaders/components/shader-weave",
  "/docs/ui-blocks/reel",
  "/docs/transitions/glitch-cut",
  "/docs/transitions/ember-burn",
  "/docs/transitions/particle-dissolve",
  "/docs/transitions/grid-wave",
  "/docs/transitions/displacement",
]);

export type FooterGroup = {
  label: string;
  links: NavLink[];
};

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    label: "Registry",
    links: [
      { href: "/docs/typography", label: "Components" },
      { href: "/docs/shaders/getting-started/introduction", label: "Shaders" },
      { href: "/docs/icons/gallery", label: "Icons" },
    ],
  },
  {
    label: "Learn",
    links: [
      { href: "/docs/getting-started/introduction", label: "Docs" },
      { href: "/blog", label: "Blog" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    label: "Project",
    links: [
      { href: "/showcases", label: "Showcases" },
      { href: "/sponsors", label: "Sponsors" },
      { href: "/legal", label: "Privacy & Terms" },
    ],
  },
];
