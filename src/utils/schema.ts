import { SITE } from 'astrowind:config';

import logoImage from '~/assets/favicons/apple-touch-icon.png';
import { getCanonical } from '~/utils/permalinks';

type Node = Record<string, unknown>;

const abs = (path: string) => String(getCanonical(path));

// getCanonical normalises away a trailing slash to match the site's canonical
// style. The standalone app builds live at a real directory URL, so those keep
// the slash and skip the 301 GitHub Pages would otherwise issue.
const absExact = (path: string) => new URL(path, SITE.site).href;

/** Stable @id values so the nodes on different pages refer to one entity. */
const STUDIO_ID = `${abs('/')}#studio`;
const WEBSITE_ID = `${abs('/')}#website`;

const studio = (): Node => ({
  '@type': 'Organization',
  '@id': STUDIO_ID,
  name: SITE.name,
  url: abs('/'),
  logo: abs(logoImage.src),
  sameAs: ['https://github.com/soleprizestudio'],
});

/**
 * Identifies the site and its publisher. Only the home page carries these -
 * repeating them on every page adds bytes without adding meaning, since the
 * per-page nodes point back by @id.
 */
export function siteNodes(description: string): Node[] {
  return [
    { '@context': 'https://schema.org', ...studio() },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE.name,
      url: abs('/'),
      description,
      publisher: { '@id': STUDIO_ID },
    },
  ];
}

export interface SoftwareNodeInput {
  name: string;
  description: string;
  /** Path of the detail page describing it. */
  pagePath: string;
  /** Absolute URL of the social card, when the entry has one. */
  image?: string;
  /** Where the thing actually runs, for anything playable in a browser. */
  liveUrl?: string;
  /** App Store listing, for anything published to a store. */
  storeUrl?: string;
  locale: string;
  /** Games get VideoGame; everything else an application type. */
  isGame?: boolean;
  /** schema.org applicationCategory, for apps that aren't tools. */
  appCategory?: string;
}

/**
 * Describes one app or game. `WebApplication` when it runs in the browser,
 * plain `SoftwareApplication` when it only exists as a store download - the
 * distinction is what lets a search engine offer the right action.
 */
export function softwareNode({
  name,
  description,
  pagePath,
  image,
  liveUrl,
  storeUrl,
  locale,
  isGame = false,
  appCategory,
}: SoftwareNodeInput): Node {
  const runsInBrowser = Boolean(liveUrl);

  return {
    '@context': 'https://schema.org',
    '@type': isGame ? 'VideoGame' : runsInBrowser ? 'WebApplication' : 'SoftwareApplication',
    name,
    description,
    url: abs(pagePath),
    inLanguage: locale,
    ...(image ? { image } : {}),
    applicationCategory: isGame ? 'GameApplication' : (appCategory ?? 'UtilitiesApplication'),
    operatingSystem: runsInBrowser ? 'Any (web browser)' : 'iOS',
    ...(runsInBrowser ? { browserRequirements: 'Requires JavaScript' } : {}),
    // Both the playable build and the store listing are free, and an explicit
    // zero-price Offer is what makes that eligible for a rich result.
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    ...(liveUrl ? { installUrl: absExact(liveUrl) } : {}),
    ...(storeUrl ? { sameAs: [storeUrl], downloadUrl: storeUrl } : {}),
    author: studio(),
    publisher: { '@id': STUDIO_ID },
  };
}
