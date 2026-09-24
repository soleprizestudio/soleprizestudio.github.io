import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Last-modified dates for the sitemap, keyed by the URL path they belong to.
 *
 * Without <lastmod> a sitemap only ever tells a crawler which URLs exist, so
 * editing a page that is already listed produces no signal at all and the
 * stale copy can sit in the index for weeks. Google only trusts the field
 * while it stays accurate, so every date here comes from real evidence -
 * frontmatter for content, the file's last commit for everything else - and
 * anything we can't date is simply left out rather than stamped with today.
 */

let shallow = false;

const isoDay = (value: string | Date): string | undefined => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
};

/**
 * A shallow checkout holds one commit, so `git log -1 -- <path>` answers with
 * that commit for every file and every page looks like it changed today. CI
 * clones with full history for this reason; if that ever regresses we drop
 * commit dates entirely rather than publish a sitemap full of false ones.
 */
function isShallowClone(rootDir: string): boolean {
  try {
    return (
      execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() === 'true'
    );
  } catch {
    return false;
  }
}

/** Last commit that touched a file, or undefined outside a usable checkout. */
function lastCommitDate(rootDir: string, relPath: string): string | undefined {
  if (shallow) return undefined;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', relPath], {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out ? isoDay(out) : undefined;
  } catch {
    // Shallow clone, no git, or a file that has never been committed.
    return undefined;
  }
}

const frontmatterOf = (file: string): string =>
  fs.readFileSync(file, 'utf-8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
const field = (fm: string, name: string) =>
  fm
    .match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1]
    ?.trim()
    .replace(/^['"]|['"]$/g, '');

/**
 * Builds the path -> YYYY-MM-DD map the sitemap integration serialises.
 * Paths are stored without a trailing slash; the caller normalises before
 * looking one up, so the map works whichever form the URL takes.
 */
export function buildLastmodIndex(rootDir: string): Record<string, string> {
  const index: Record<string, string> = {};
  shallow = isShallowClone(rootDir);
  if (shallow) {
    console.warn('[lastmod] shallow git clone - dating pages from frontmatter only, commit dates skipped');
  }

  const collections: Array<{ dir: string; urlFor: (key: string) => string[] }> = [
    { dir: 'src/data/posts', urlFor: (key) => [`/posts/${key}`] },
    { dir: 'src/data/games', urlFor: (key) => [`/games/${key}`, `/en/games/${key}`] },
    { dir: 'src/data/apps', urlFor: (key) => [`/apps/${key}`, `/en/apps/${key}`] },
  ];

  for (const { dir, urlFor } of collections) {
    const abs = path.join(rootDir, dir);
    if (!fs.existsSync(abs)) continue;

    for (const file of fs.readdirSync(abs)) {
      if (!/\.mdx?$/.test(file)) continue;
      const rel = path.join(dir, file);
      const fm = frontmatterOf(path.join(abs, file));
      if (/^draft:\s*true/m.test(fm)) continue;

      // updateDate beats publishDate; a commit date is the fallback for
      // entries that carry no dates at all (apps and games don't).
      const declared = field(fm, 'updateDate') || field(fm, 'publishDate');
      const date = (declared && isoDay(declared)) || lastCommitDate(rootDir, rel);
      if (!date) continue;

      const key = field(fm, 'translationKey') || file.replace(/\.mdx?$/, '');
      for (const url of urlFor(key)) {
        // Translation pairs share a key, so keep whichever side changed last.
        if (!index[url] || index[url] < date) index[url] = date;
      }
    }
  }

  // Standalone routes and markdown pages, dated by their own source file.
  const routes: Array<[string, string]> = [
    ['/', 'src/pages/index.astro'],
    ['/en', 'src/pages/en/index.astro'],
    ['/about', 'src/components/pages/AboutPage.astro'],
    ['/en/about', 'src/components/pages/AboutPage.astro'],
    ['/contact', 'src/components/pages/ContactPage.astro'],
    ['/en/contact', 'src/components/pages/ContactPage.astro'],
    ['/games', 'src/components/pages/GamesIndexPage.astro'],
    ['/en/games', 'src/components/pages/GamesIndexPage.astro'],
    ['/apps', 'src/components/pages/AppsIndexPage.astro'],
    ['/en/apps', 'src/components/pages/AppsIndexPage.astro'],
    ['/terms', 'src/pages/terms.md'],
    ['/privacy', 'src/pages/privacy.md'],
    ['/en/terms', 'src/pages/en/terms.md'],
    ['/en/privacy', 'src/pages/en/privacy.md'],
    ['/apps/lotto-1pan/privacy', 'src/pages/apps/lotto-1pan/privacy.md'],
  ];

  for (const [url, rel] of routes) {
    if (!fs.existsSync(path.join(rootDir, rel))) continue;
    const date = lastCommitDate(rootDir, rel);
    if (date) index[url] = date;
  }

  // The playable builds CI copies into public/, dated by their own deploy commit.
  const publicDir = path.join(rootDir, 'public');
  if (fs.existsSync(publicDir)) {
    for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (!fs.existsSync(path.join(rootDir, 'public', entry.name, 'index.html'))) continue;
      // Date the whole directory: a deploy often ships new assets without
      // touching index.html, and the app has still changed.
      const date = lastCommitDate(rootDir, path.join('public', entry.name));
      if (date) index[`/${entry.name}`] = date;
    }
  }

  return index;
}

/** Trailing slash and origin stripped, so a lookup matches however the URL was written. */
export function lastmodFor(index: Record<string, string>, url: string): string | undefined {
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    pathname = url;
  }
  return index[pathname.replace(/\/$/, '') || '/'];
}
