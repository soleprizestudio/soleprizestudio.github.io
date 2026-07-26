import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { RehypePlugin } from '@astrojs/markdown-remark';
import type { Element, ElementContent, Root } from 'hast';

type InternalLinkType = 'apps' | 'games' | 'posts';

interface InternalLinkEntry {
  type: InternalLinkType;
  title: string;
  description: string;
}

const TYPE_LABELS: Record<InternalLinkType, string> = {
  apps: '앱',
  games: '게임',
  posts: '블로그',
};

const SITE_ORIGIN = 'https://soleprizestudio.github.io';

function parseFrontmatter(raw: string): Record<string, unknown> | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  try {
    return (yaml.load(match[1]) as Record<string, unknown>) ?? null;
  } catch {
    return null;
  }
}

function loadEntries(dir: string, type: InternalLinkType): Record<string, InternalLinkEntry> {
  const entries: Record<string, InternalLinkEntry> = {};
  if (!fs.existsSync(dir)) return entries;

  for (const file of fs.readdirSync(dir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const data = parseFrontmatter(raw);
    if (!data || data.draft) continue;

    const slug = file.replace(/\.mdx?$/, '');
    const title = typeof data.title === 'string' ? data.title : slug;
    const description =
      (typeof data.description === 'string' && data.description) ||
      (typeof data.teaser === 'string' && data.teaser) ||
      (typeof data.excerpt === 'string' && data.excerpt) ||
      '';

    entries[`/${type}/${slug}`] = { type, title, description };
  }

  return entries;
}

/** Reads frontmatter directly off disk (not via astro:content) so it can run from astro.config.ts. */
export function buildInternalLinkIndex(rootDir: string): Record<string, InternalLinkEntry> {
  return {
    ...loadEntries(path.join(rootDir, 'src/data/apps'), 'apps'),
    ...loadEntries(path.join(rootDir, 'src/data/games'), 'games'),
    ...loadEntries(path.join(rootDir, 'src/data/posts'), 'posts'),
  };
}

function extractInternalPath(href: string): string | null {
  if (href.startsWith('/')) return href.replace(/\/$/, '') || '/';
  if (href.startsWith(SITE_ORIGIN)) return href.slice(SITE_ORIGIN.length).replace(/\/$/, '') || '/';
  return null;
}

function isWhitespaceText(node: ElementContent): boolean {
  return node.type === 'text' && !node.value.trim();
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

    const card: Element = {
      type: 'element',
      tagName: 'a',
      properties: {
        href,
        className: [
          'not-prose',
          'flex',
          'flex-col',
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
        ],
      },
      children: textNodes,
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
