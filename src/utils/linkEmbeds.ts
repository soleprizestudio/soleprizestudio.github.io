import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import sharp from 'sharp';
import type { RehypePlugin } from '@astrojs/markdown-remark';
import type { Element, ElementContent, Root } from 'hast';

type InternalLinkType = 'apps' | 'games' | 'posts';

interface InternalLinkEntry {
  type: InternalLinkType;
  title: string;
  description: string;
  iconPath?: string;
}

const TYPE_LABELS: Record<InternalLinkType, string> = {
  apps: '앱',
  games: '게임',
  posts: '블로그',
};

const IMAGE_FIELD_BY_TYPE: Record<InternalLinkType, string> = {
  apps: 'iconImage',
  games: 'thumbnail',
  posts: 'image',
};

const SITE_ORIGIN = 'https://soleprizestudio.github.io';
const ICON_OUTPUT_DIR = 'embed-icons';
const ICON_SIZE = 56;

function parseFrontmatter(raw: string): Record<string, unknown> | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  try {
    return (yaml.load(match[1]) as Record<string, unknown>) ?? null;
  } catch {
    return null;
  }
}

/** Resizes a `~/assets/...` source image into public/embed-icons so it can be served with no Astro image pipeline. */
async function generateIcon(rootDir: string, sourceRef: string, outName: string): Promise<string | undefined> {
  if (!sourceRef.startsWith('~/')) return undefined;

  const sourcePath = path.join(rootDir, 'src', sourceRef.slice(2));
  if (!fs.existsSync(sourcePath)) return undefined;

  const outDir = path.join(rootDir, 'public', ICON_OUTPUT_DIR);
  const outFile = path.join(outDir, `${outName}.webp`);

  try {
    fs.mkdirSync(outDir, { recursive: true });
    await sharp(sourcePath).resize(ICON_SIZE, ICON_SIZE, { fit: 'cover' }).webp({ quality: 80 }).toFile(outFile);
    return `/${ICON_OUTPUT_DIR}/${outName}.webp`;
  } catch {
    return undefined;
  }
}

async function loadEntries(
  rootDir: string,
  dir: string,
  type: InternalLinkType
): Promise<Record<string, InternalLinkEntry>> {
  const entries: Record<string, InternalLinkEntry> = {};
  if (!fs.existsSync(dir)) return entries;

  const files = fs.readdirSync(dir).filter((file) => /\.mdx?$/.test(file));

  await Promise.all(
    files.map(async (file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const data = parseFrontmatter(raw);
      if (!data || data.draft) return;

      const slug = file.replace(/\.mdx?$/, '');
      const title = typeof data.title === 'string' ? data.title : slug;
      const description =
        (typeof data.description === 'string' && data.description) ||
        (typeof data.teaser === 'string' && data.teaser) ||
        (typeof data.excerpt === 'string' && data.excerpt) ||
        '';

      const imageField = data[IMAGE_FIELD_BY_TYPE[type]];
      const iconPath =
        typeof imageField === 'string' && imageField
          ? await generateIcon(rootDir, imageField, `${type}-${slug}`)
          : undefined;

      entries[`/${type}/${slug}`] = { type, title, description, iconPath };
    })
  );

  return entries;
}

/** Reads frontmatter directly off disk (not via astro:content) so it can run from astro.config.ts. */
export async function buildInternalLinkIndex(rootDir: string): Promise<Record<string, InternalLinkEntry>> {
  const [apps, games, posts] = await Promise.all([
    loadEntries(rootDir, path.join(rootDir, 'src/data/apps'), 'apps'),
    loadEntries(rootDir, path.join(rootDir, 'src/data/games'), 'games'),
    loadEntries(rootDir, path.join(rootDir, 'src/data/posts'), 'posts'),
  ]);

  return { ...apps, ...games, ...posts };
}

function extractInternalPath(href: string): string | null {
  // Only used to look up card data - the real href (with any #anchor) is kept as-is on the link.
  const withoutHash = href.split('#')[0];
  if (withoutHash.startsWith('/')) return withoutHash.replace(/\/$/, '') || '/';
  if (withoutHash.startsWith(SITE_ORIGIN)) return withoutHash.slice(SITE_ORIGIN.length).replace(/\/$/, '') || '/';
  return null;
}

// Sitepins' rich-text editor tends to leave stray zero-width spaces around links.
function isWhitespaceText(node: ElementContent): boolean {
  return node.type === 'text' && !node.value.replace(/\u200B/g, '').trim();
}

function internalLinkEmbedTransform(tree: Root, index: Record<string, InternalLinkEntry>) {
  if (!tree.children) return;

  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (!node || node.type !== 'element' || node.tagName !== 'p' || !node.children) continue;

    const meaningfulChildren = node.children.filter((child: ElementContent) => !isWhitespaceText(child));
    if (meaningfulChildren.length !== 1) continue;

    const link = meaningfulChildren[0];
    if (link.type !== 'element' || link.tagName !== 'a') continue;

    const href = link.properties?.href;
    if (typeof href !== 'string') continue;

    const internalPath = extractInternalPath(href);
    if (!internalPath) continue;

    const entry = index[internalPath];
    if (!entry) continue;

    const textNodes: Element['children'] = [
      {
        type: 'element',
        tagName: 'p',
        properties: { className: ['text-xs', 'uppercase', 'tracking-wide', 'font-semibold', 'text-primary', 'mb-1'] },
        children: [{ type: 'text', value: TYPE_LABELS[entry.type] }],
      },
      {
        type: 'element',
        tagName: 'p',
        properties: { className: ['font-bold', 'text-default'] },
        children: [{ type: 'text', value: entry.title }],
      },
    ];

    if (entry.description) {
      textNodes.push({
        type: 'element',
        tagName: 'p',
        properties: { className: ['text-sm', 'text-muted', 'mt-1', 'line-clamp-2'] },
        children: [{ type: 'text', value: entry.description }],
      });
    }

    const cardChildren: Element['children'] = entry.iconPath
      ? [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src: entry.iconPath,
              alt: '',
              width: ICON_SIZE,
              height: ICON_SIZE,
              loading: 'lazy',
              className: ['w-14', 'h-14', 'shrink-0', 'rounded-xl', 'object-cover'],
            },
            children: [],
          },
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['min-w-0'] },
            children: textNodes,
          },
        ]
      : textNodes;

    const card: Element = {
      type: 'element',
      tagName: 'a',
      properties: {
        href,
        className: [
          'not-prose',
          'flex',
          entry.iconPath ? 'flex-row' : 'flex-col',
          entry.iconPath ? 'items-center' : '',
          entry.iconPath ? 'gap-3' : '',
          'rounded-lg',
          'border',
          'border-gray-200',
          'dark:border-slate-700',
          'bg-white',
          'dark:bg-slate-800',
          'p-4',
          'my-6',
          'no-underline',
          'hover:shadow-md',
          'transition',
        ].filter(Boolean),
      },
      children: cardChildren,
    };

    tree.children[i] = card;
  }
}

/** Turns a link that sits alone on its own line into a rich card, when it points at one of our own pages. */
export const internalLinkEmbedRehypePlugin = (index: Record<string, InternalLinkEntry>): RehypePlugin => {
  return function () {
    return function (tree) {
      internalLinkEmbedTransform(tree, index);
    };
  };
};
