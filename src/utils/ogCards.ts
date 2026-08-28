import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Matches --aw-color-accent (light theme) so shared cards look like the site.
const BG = { r: 31, g: 46, b: 70 };
const CARD_W = 1200;
const CARD_H = 630;
const ICON_SIZE = 360;
const ICON_RADIUS = 80;

const IMAGE_FIELD: Record<string, string> = { apps: 'iconImage', games: 'thumbnail' };

/**
 * Composes a 1200x630 Open Graph card (brand background + centered rounded
 * icon) for every app/game that has an icon, into public/og/<type>-<slug>.jpg.
 *
 * Runs at config-load time like linkEmbeds' icon generation, because a plain
 * script outside Astro's component tree can't use astro:assets. Detail pages
 * reference the output by the same <type>-<slug> convention.
 */
export async function generateOgCards(rootDir: string): Promise<void> {
  const outDir = path.join(rootDir, 'public', 'og');
  fs.mkdirSync(outDir, { recursive: true });

  const mask = Buffer.from(
    `<svg width="${ICON_SIZE}" height="${ICON_SIZE}"><rect width="${ICON_SIZE}" height="${ICON_SIZE}" rx="${ICON_RADIUS}" fill="#fff"/></svg>`
  );

  for (const type of ['apps', 'games']) {
    const dir = path.join(rootDir, 'src/data', type);
    if (!fs.existsSync(dir)) continue;

    const done = new Set<string>();
    for (const file of fs.readdirSync(dir)) {
      if (!/\.mdx?$/.test(file)) continue;
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const fm = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      if (/^draft:\s*true/m.test(fm)) continue;

      // Translation pairs share one card, keyed like their URL slug.
      const key = fm.match(/^translationKey:\s*(.+)$/m)?.[1]?.trim() || file.replace(/\.mdx?$/, '');
      if (done.has(key)) continue;

      const ref = fm.match(new RegExp(`^${IMAGE_FIELD[type]}:\\s*(.+)$`, 'm'))?.[1]?.trim();
      if (!ref?.startsWith('~/')) continue;
      const srcPath = path.join(rootDir, 'src', ref.slice(2));
      if (!fs.existsSync(srcPath)) continue;

      const icon = await sharp(srcPath)
        .resize(ICON_SIZE, ICON_SIZE, { fit: 'cover' })
        .composite([{ input: mask, blend: 'dest-in' }])
        .png()
        .toBuffer();

      await sharp({ create: { width: CARD_W, height: CARD_H, channels: 3, background: BG } })
        .composite([
          { input: icon, left: Math.round((CARD_W - ICON_SIZE) / 2), top: Math.round((CARD_H - ICON_SIZE) / 2) },
        ])
        .jpeg({ quality: 90 })
        .toFile(path.join(outDir, `${type}-${key}.jpg`));

      done.add(key);
    }
  }
}
