import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

/**
 * The playable web apps that each app repo's CI copies into `public/<name>/`
 * (board-game-dice, physics-lotto...). They ship their own index.html with a
 * title, description and JSON-LD, but Astro never routes them, so
 * @astrojs/sitemap can't see them and they only reach a crawler that follows
 * an in-page link. Listing them as sitemap `customPages` lets them be found
 * and ranked directly, which is the entry point most visitors actually want.
 *
 * Detected rather than hardcoded so the next app that lands in public/ is
 * picked up without anyone remembering to edit this list.
 */
export function findStandaloneApps(rootDir: string): string[] {
  const siteConfig = yaml.load(fs.readFileSync(path.join(rootDir, 'src/config.yaml'), 'utf8')) as {
    site?: { site?: string };
  };
  const siteUrl = siteConfig?.site?.site;
  if (!siteUrl) return [];

  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) return [];

  return fs
    .readdirSync(publicDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(publicDir, entry.name, 'index.html')))
    .map((entry) => new URL(`${entry.name}/`, `${siteUrl.replace(/\/$/, '')}/`).href)
    .sort();
}
