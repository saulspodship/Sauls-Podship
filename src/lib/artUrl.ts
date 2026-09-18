/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cache-busting helper for commissioned volume artwork.
 *
 * vercel.json serves /images/** with a 30-day Cache-Control header, so
 * overwriting hero-1920.jpg / hero-1920.webp / hero-1280.webp in place would
 * leave stale artwork in returning visitors' CDN and browser caches. Every
 * rendered volume-art URL goes through artUrl(), which appends ?v=ART_VERSION.
 *
 * scripts/volume-hero-batch.mjs auto-increments ART_VERSION whenever new
 * hero masters are converted — do not edit it by hand unless you need to
 * force a cache bust.
 */
export const ART_VERSION = 4;

/**
 * Append the ?v=ART_VERSION cache-buster to local site paths (/images/…).
 * External URLs (e.g. legacy unsplash links) are returned unchanged.
 */
export function artUrl(src?: string | null): string {
  if (!src) return '';
  if (!src.startsWith('/')) return src;
  return `${src}${src.includes('?') ? '&' : '?'}v=${ART_VERSION}`;
}
