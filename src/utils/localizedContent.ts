import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '~/i18n';

type LocalizedCollection = 'games' | 'apps';

/** The slug a page is published under - shared across a translation pair. */
export const entryKey = (entry: CollectionEntry<LocalizedCollection>): string => entry.data.translationKey || entry.id;

/**
 * Published entries for one locale.
 *
 * Falls back to the default-locale entry when a translation doesn't exist yet,
 * so adding English is incremental: an untranslated game still gets an /en/
 * page (in Korean) rather than a 404, and the nav never links into a hole.
 */
export async function getLocalizedEntries<C extends LocalizedCollection>(
  collection: C,
  locale: Locale
): Promise<CollectionEntry<C>[]> {
  const published = await getCollection(collection, ({ data }) => !data.draft);

  const byKey = new Map<string, CollectionEntry<C>>();

  for (const entry of published) {
    const key = entryKey(entry);
    const existing = byKey.get(key);

    // Prefer an exact locale match; otherwise keep the default-locale fallback.
    if (entry.data.lang === locale) {
      byKey.set(key, entry as CollectionEntry<C>);
    } else if (!existing && entry.data.lang === DEFAULT_LOCALE) {
      byKey.set(key, entry as CollectionEntry<C>);
    }
  }

  return [...byKey.values()];
}

/** getStaticPaths rows for every locale of a collection, keyed by shared slug. */
export async function getLocalizedStaticPaths<C extends LocalizedCollection>(
  collection: C,
  locale: Locale
): Promise<{ params: { slug: string }; props: { entry: CollectionEntry<C>; locale: Locale } }[]> {
  const entries = await getLocalizedEntries(collection, locale);
  return entries.map((entry) => ({
    params: { slug: entryKey(entry) },
    props: { entry, locale },
  }));
}

/** Locales that have a real (non-fallback) page for this key - used to emit hreflang. */
export async function getAvailableLocales(collection: LocalizedCollection, key: string): Promise<Locale[]> {
  const published = await getCollection(collection, ({ data }) => !data.draft);
  const langs = published.filter((entry) => entryKey(entry) === key).map((entry) => entry.data.lang);
  return LOCALES.filter((locale) => langs.includes(locale));
}
