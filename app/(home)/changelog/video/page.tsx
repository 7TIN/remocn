import type { Metadata } from "next";
import { changelog } from "@/.source/server";
import { ChangelogHero } from "@/components/changelog/changelog-hero";
import { ChangelogVideoFeed } from "@/components/changelog/changelog-video-feed";
import {
  changelogDateFormatter,
  changelogSlug,
  sortByDateDesc,
} from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog in video",
  description:
    "Every remocn release as a short video — new components, transitions, shaders, and icons, newest first.",
  openGraph: {
    title: "Changelog in video · remocn",
    description:
      "Every remocn release as a short video — new components, transitions, shaders, and icons, newest first.",
  },
};

export default function ChangelogVideoPage() {
  const entries = sortByDateDesc(changelog).flatMap((entry) =>
    entry.video
      ? [
          {
            slug: changelogSlug(entry),
            title: entry.title,
            iso: entry.date.toISOString().slice(0, 10),
            formattedDate: changelogDateFormatter.format(entry.date),
            video: entry.video,
            videoPoster: entry.videoPoster,
          },
        ]
      : [],
  );

  return (
    <>
      <ChangelogHero active="video" />
      <section className="pb-24">
        <ChangelogVideoFeed entries={entries} />
      </section>
    </>
  );
}
