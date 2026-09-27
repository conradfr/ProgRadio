export type HeadTag =
  | { tag: 'meta'; attrs: { property?: string; name?: string; content: string } }
  | { tag: 'link'; attrs: { rel: string; hreflang?: string; href: string } };

// Key used to find an existing element, server-rendered (Twig) or ours
const selectorFor = (t: HeadTag): string => {
  if (t.tag === 'meta') {
    return t.attrs.property
      ? `meta[property="${t.attrs.property}"]`
      : `meta[name="${t.attrs.name}"]`;
  }

  return `link[rel="${t.attrs.rel}"]${t.attrs.hreflang ? `[hreflang="${t.attrs.hreflang}"]` : ':not([hreflang])'}`;
};

// this is duplicated logic from base.html.twig

const LOCALES = ['fr', 'en', 'es', 'de', 'pt', 'it', 'pl', 'el', 'ar', 'ro', 'hu', 'tr', 'nl'];

// Stream language => canonical locale, first match wins (same order as templates/base.html.twig)
const LANGUAGE_LOCALES: [string[], string][] = [
  [['french', 'francais', 'français'], 'fr'],
  [['spanish', 'español'], 'es'],
  [['portuguese'], 'pt'],
  [['polish'], 'pl'],
  [['greek'], 'el'],
  [['arabic'], 'ar'],
  [['german'], 'de'],
  [['italian'], 'it'],
  [['romanian'], 'ro'],
  [['hungarian'], 'hu'],
  [['turkish'], 'tr'],
  [['dutch'], 'nl'],
];

const canonicalLocale = (language?: string | null): string => {
  if (language) {
    const match = LANGUAGE_LOCALES.find(([needles]) => needles.some(n => language.includes(n)));
    if (match) {
      return match[1];
    }

    // locale code, alone or first of a list ("fr", "fr,en"...)
    const code = language.slice(0, 2);
    if ((language.length === 2 || language[2] === ',') && LOCALES.includes(code)) {
      return code;
    }
  }

  // @ts-expect-error defined on global scope
  // eslint-disable-next-line no-undef
  return isProgRadio === true ? 'fr' : 'en';
};

/** Url without its #anchor (defaults to the current url) */
export const removeUrlAnchor = (url: string = window.location.href): string => url.split('#')[0];

// Current url (with query string) with its first path segment (/fr/, /en/...) replaced
const localizedUrl = (locale: string): string => {
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname.replace(/^\/[^/]+/, `/${locale}`)}${search}`;
};

/** Canonical + hreflang alternate links for the current url, see templates/base.html.twig */
export function canonicalHeadTags(language?: string | null): HeadTag[] {
  const canonical = canonicalLocale(language);
  const href = localizedUrl(canonical);

  return [
    { tag: 'link', attrs: { rel: 'canonical', hreflang: 'x-default', href } },
    { tag: 'link', attrs: { rel: 'canonical', href } },
    ...LOCALES
      .filter(locale => locale !== canonical)
      .map((locale): HeadTag => ({ tag: 'link', attrs: { rel: 'alternate', hreflang: locale, href: localizedUrl(locale) } })),
  ];
}

/**
 * Upserts tags in <head> (no duplicate of server-rendered ones).
 * Returns a cleanup that removes created tags and restores modified ones.
 */
export function setHeadTags(tags: HeadTag[]): () => void {
  const undo: Array<() => void> = [];

  tags.forEach((t) => {
    const attrs = Object.entries(t.attrs).filter(([, v]) => v !== undefined) as [string, string][];
    const existing = document.head.querySelector<HTMLElement>(selectorFor(t));

    if (existing) {
      const prev = attrs.map(([k]) => [k, existing.getAttribute(k)] as const);
      attrs.forEach(([k, v]) => existing.setAttribute(k, v));
      undo.push(() => prev.forEach(([k, v]) => (
        v === null ? existing.removeAttribute(k) : existing.setAttribute(k, v)
      )));
      return;
    }

    const el = document.createElement(t.tag);
    attrs.forEach(([k, v]) => el.setAttribute(k, v));
    el.dataset.spa = '';
    document.head.appendChild(el);
    undo.push(() => el.remove());
  });

  return () => undo.reverse().forEach(fn => fn());
}
