// Server-only module: reads `process.env.GITHUB_TOKEN` and is imported only by
// the `/api/stargazers` route handler. Never import this from a client component.
import { formatStars } from "@/lib/github";

// Re-export so the /stars consumer can format counts without a second import.
export { formatStars };

/** A single stargazer keyframe — mirrors the registry `github-stars` component. */
export type Stargazer = {
  login: string;
  avatarUrl: string;
  /** ISO timestamp, e.g. "2021-03-04T11:22:33Z". */
  starredAt: string;
};

export type StargazersResult = {
  stargazers: Stargazer[];
  totalStars: number;
  /** True when the repo has more pages than `MAX_PAGES` allows us to fetch. */
  truncated: boolean;
};

export type StargazersErrorCode =
  | "invalid_repo"
  | "not_found"
  | "rate_limited"
  | "fetch_failed";

/** Typed error so the route handler can map cleanly to a status + JSON code. */
export class StargazersError extends Error {
  readonly code: StargazersErrorCode;
  readonly status: number;
  constructor(code: StargazersErrorCode, message: string, status: number) {
    super(message);
    this.name = "StargazersError";
    this.code = code;
    this.status = status;
  }
}

/**
 * GitHub caps the REST stargazers endpoint at ~400 pages; we cap far lower so a
 * runaway repo can't exhaust the serverless function budget. 50 × 100 = 5000
 * stargazers fetched, then `truncated: true`. The animation downsamples anyway.
 */
const MAX_PAGES = 50;
const PER_PAGE = 100;
const CONCURRENCY = 6;
/** Keyframe cap kept in lockstep with the component's `downsampleStargazers`. */
const KEYFRAME_CAP = 60;
const API_BASE = "https://api.github.com";

// `parseRepoInput` lives in a client-safe module so the `/stars` client tool can
// validate input without importing this server-only file. Re-exported here so
// the route handler + tests keep their existing `@/lib/github-stargazers` import.
export { parseRepoInput } from "@/lib/parse-repo";

function buildHeaders(accept: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Map a non-OK GitHub response to a typed error (rate limit vs. not found). */
function errorForResponse(res: Response, context: string): StargazersError {
  if (res.status === 404) {
    return new StargazersError("not_found", "Repository not found.", 404);
  }
  const remaining = res.headers.get("x-ratelimit-remaining");
  if (res.status === 429 || (res.status === 403 && remaining === "0")) {
    return new StargazersError(
      "rate_limited",
      "GitHub API rate limit exceeded. Add a GITHUB_TOKEN to raise the limit.",
      429,
    );
  }
  return new StargazersError(
    "fetch_failed",
    `GitHub request failed (${context}): ${res.status} ${res.statusText}`,
    502,
  );
}

/** Pull the `rel="last"` page number out of a GitHub Link header, if any. */
function parseLastPage(link: string | null): number | null {
  if (!link) return null;
  for (const part of link.split(",")) {
    const match = part.match(/[?&]page=(\d+)[^>]*>\s*;\s*rel="last"/);
    if (match) return Number(match[1]);
  }
  return null;
}

type RawStargazer = {
  starred_at?: string;
  user?: { login?: string; avatar_url?: string } | null;
};

function mapEntry(raw: RawStargazer): Stargazer | null {
  const user = raw?.user;
  if (!user?.login || !user.avatar_url || !raw.starred_at) return null;
  return {
    login: user.login,
    avatarUrl: user.avatar_url,
    starredAt: raw.starred_at,
  };
}

/**
 * Evenly sample down to `max` keyframes, always keeping the first and last
 * entry. Replicated from the component's `downsampleStargazers` so the data
 * layer stays free of the `"use client"` registry module.
 */
function downsample(stargazers: Stargazer[], max = KEYFRAME_CAP): Stargazer[] {
  const len = stargazers.length;
  if (len <= max) return stargazers;
  if (max <= 1) return len ? [stargazers[0]] : [];
  const out: Stargazer[] = [];
  for (let i = 0; i < max; i++) {
    out.push(stargazers[Math.round((i * (len - 1)) / (max - 1))]);
  }
  return out;
}

/** Run `fn` over `items` with a bounded number of in-flight requests. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await fn(items[index]);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

async function fetchStargazerPage(
  owner: string,
  repo: string,
  page: number,
  signal?: AbortSignal,
): Promise<{ entries: RawStargazer[]; link: string | null }> {
  const url = `${API_BASE}/repos/${owner}/${repo}/stargazers?per_page=${PER_PAGE}&page=${page}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: buildHeaders("application/vnd.github.star+json"),
      signal,
      next: { revalidate: 3600 },
    });
  } catch (err) {
    if (err instanceof StargazersError) throw err;
    throw new StargazersError(
      "fetch_failed",
      `Network error fetching stargazers page ${page}.`,
      502,
    );
  }
  if (!res.ok) throw errorForResponse(res, `stargazers page ${page}`);
  const entries = (await res.json()) as RawStargazer[];
  return { entries, link: res.headers.get("link") };
}

/**
 * Fetch a repository's stargazers with `starred_at` timestamps, sorted oldest
 * → newest and downsampled to a small keyframe set for the animation.
 *
 * - Uses `Accept: application/vnd.github.star+json` (required for `starred_at`).
 * - Sends `Authorization: Bearer ${GITHUB_TOKEN}` only when the env var is set;
 *   works unauthenticated (60/hr) too.
 * - Reads the total page count from the first response's Link header and fetches
 *   the rest in parallel (bounded), capped at `MAX_PAGES` → `truncated: true`.
 * - Throws {@link StargazersError} for not-found / rate-limited / fetch failures.
 */
export async function fetchStargazers({
  owner,
  repo,
  signal,
}: {
  owner: string;
  repo: string;
  signal?: AbortSignal;
}): Promise<StargazersResult> {
  // 1. Repo endpoint → existence check (404) + authoritative star total.
  let repoRes: Response;
  try {
    repoRes = await fetch(`${API_BASE}/repos/${owner}/${repo}`, {
      headers: buildHeaders("application/vnd.github+json"),
      signal,
      next: { revalidate: 3600 },
    });
  } catch (err) {
    if (err instanceof StargazersError) throw err;
    throw new StargazersError(
      "fetch_failed",
      "Network error fetching repository.",
      502,
    );
  }
  if (!repoRes.ok) throw errorForResponse(repoRes, "repo");
  const repoData = (await repoRes.json()) as { stargazers_count?: number };
  const totalStars =
    typeof repoData.stargazers_count === "number"
      ? repoData.stargazers_count
      : 0;

  // 2. Zero-star repo: nothing to paginate, render gracefully.
  if (totalStars === 0) {
    return { stargazers: [], totalStars: 0, truncated: false };
  }

  // 3. First page drives the page count via its Link header.
  const first = await fetchStargazerPage(owner, repo, 1, signal);
  const lastPage = parseLastPage(first.link) ?? 1;
  const cappedLastPage = Math.min(lastPage, MAX_PAGES);
  const truncated = lastPage > MAX_PAGES;

  const rawEntries: RawStargazer[] = [...first.entries];

  // 4. Remaining pages in parallel (bounded concurrency).
  if (cappedLastPage > 1) {
    const pages: number[] = [];
    for (let p = 2; p <= cappedLastPage; p++) pages.push(p);
    const pageResults = await mapWithConcurrency(pages, CONCURRENCY, (page) =>
      fetchStargazerPage(owner, repo, page, signal),
    );
    for (const result of pageResults) rawEntries.push(...result.entries);
  }

  // 5. Map → filter → sort ascending by starredAt → downsample.
  const mapped = rawEntries
    .map(mapEntry)
    .filter((s): s is Stargazer => s !== null)
    .sort((a, b) => a.starredAt.localeCompare(b.starredAt));

  const stargazers = downsample(mapped);

  return { stargazers, totalStars, truncated };
}
