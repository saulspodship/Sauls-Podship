import { useEffect } from 'react';

export interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  keywords: string[];
  image: string;
}

/** Update hash-route metadata and restore it when leaving the page. */
export function usePageMetadata(meta: PageMetadata) {
  useEffect(() => {
    const previousTitle = document.title;
    const previousCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
    // A prerendered file or a previous SEO-enabled route may already have a
    // non-home head. Never restore that unrelated route's metadata on exit.
    const homeUrl = 'https://www.saulspodship.com/';
    const restoreHome = previousCanonical !== homeUrl;
    const homeTitle = "Saul's Podship | Interactive Theological Encyclopedia";
    const homeDescription = "Saul's Podship is an interactive theological encyclopedia and digital ministry. Explore 51 volumes of visual Bible study, Christian history, gospel music archives, and deep biblical narratives to worship in Spirit and Truth.";
    const homeSocialDescription = 'Explore 51 volumes of visual Bible study, Christian history, gospel music archives, and deep biblical narratives to worship in Spirit and Truth.';
    const homeImage = `${homeUrl}icons/brand-logo.png`;

    const changes: { element: Element; attribute: string; previous: string | null; value: string; created: boolean; fallback?: string }[] = [];
    const set = (selector: string, tag: 'meta' | 'link', identity: Record<string, string>, attribute: string, value: string, fallback?: string) => {
      let element = document.head.querySelector(selector);
      const created = !element;
      if (!element) {
        element = document.createElement(tag);
        Object.entries(identity).forEach(([key, val]) => element!.setAttribute(key, val));
        document.head.appendChild(element);
      }
      const previous = element.getAttribute(attribute);
      element.setAttribute(attribute, value);
      changes.push({ element, attribute, previous, value, created, fallback });
    };
    const setMeta = (kind: 'name' | 'property', key: string, value: string, fallback?: string) =>
      set(`meta[${kind}="${key}"]`, 'meta', { [kind]: key }, 'content', value, fallback);

    document.title = meta.title;
    setMeta('name', 'title', meta.title, "Saul's Podship | Interactive Theological Encyclopedia & Digital Ministry");
    setMeta('name', 'description', meta.description, homeDescription);
    setMeta('name', 'keywords', meta.keywords.join(', '), "Christian encyclopedia, Bible study, Christian ministry, Saul's Podship");
    setMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large');
    setMeta('property', 'og:type', 'website', 'website');
    setMeta('property', 'og:url', meta.canonical, homeUrl);
    setMeta('property', 'og:title', meta.title, homeTitle);
    setMeta('property', 'og:description', meta.description, homeSocialDescription);
    setMeta('property', 'og:image', meta.image, homeImage);
    setMeta('property', 'twitter:url', meta.canonical, homeUrl);
    setMeta('property', 'twitter:title', meta.title, homeTitle);
    setMeta('property', 'twitter:description', meta.description, homeSocialDescription);
    setMeta('property', 'twitter:image', meta.image, homeImage);
    set('link[rel="canonical"]', 'link', { rel: 'canonical' }, 'href', meta.canonical, homeUrl);

    return () => {
      if (document.title === meta.title) document.title = restoreHome ? homeTitle : previousTitle;
      changes.reverse().forEach(({ element, attribute, previous, value, created, fallback }) => {
        // Don't overwrite a later route's metadata if another component owns it.
        if (!element.isConnected || element.getAttribute(attribute) !== value) return;
        if (restoreHome && fallback !== undefined) element.setAttribute(attribute, fallback);
        else if (created) element.remove();
        else if (previous === null) element.removeAttribute(attribute);
        else element.setAttribute(attribute, previous);
      });
    };
  }, [meta]);
}
