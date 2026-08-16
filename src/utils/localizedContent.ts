import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from '~/i18n';

type LocalizedCollection = 'games' | 'apps';

/** The slug a page is published under - shared across a translation pair. */
export const entryKey = (entry: CollectionEntry<LocalizedCollection>): string => entry.data.translationKey || entry.id;

/**
 * Where an entry actually lives, based on the language it is written in.
 *
 * An untranslated entry keeps its Korean URL even when it is listed on an
 * English page, so the same text never gets published at two addresses.
 */
export const entryPath = (collection: LocalizedCollection, entry: CollectionEntry<LocalizedCollection>): string =>
  localePath(`/${collection}/${entryKey(entry)}`, entry.data.lang);

/**
 * Entries to show for one locale, preferring a translation and otherwise
 * falling back to the Korean original, so nothing silently disappears from
 * the nav or the listing just because it hasn't been translated yet.
 *
 * Pair this with `entryPath` for links - a fallback entry links to its
 * Korean page rather than an /en/ URL serving Korean content.
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

/**
 * getStaticPaths rows for one locale.
 *
 * Only entries genuinely written in that locale get a page. Without a
 * translation there is no /en/ URL at all, so Google never sees the same
 * Korean text under two addresses.
 */
export async function getLocalizedStaticPaths<C extends LocalizedCollection>(
  collection: C,
  locale: Locale
): Promise<{ params: { slug: string }; props: { entry: CollectionEntry<C>; locale: Locale } }[]> {
  const published = await getCollection(collection, ({ data }) => !data.draft);

  return published
    .filter((entry) => entry.data.lang === locale)
    .map((entry) => ({
      params: { slug: entryKey(entry) },
      props: { entry: entry as CollectionEntry<C>, locale },
    }));
}

/** Locales that have a real translation for this key - used to emit hreflang. */
export async function getAvailableLocales(collection: LocalizedCollection, key: string): Promise<Locale[]> {
  const published = await getCollection(collection, ({ data }) => !data.draft);
  const langs = published.filter((entry) => entryKey(entry) === key).map((entry) => entry.data.lang);
  return LOCALES.filter((locale) => langs.includes(locale));
}
