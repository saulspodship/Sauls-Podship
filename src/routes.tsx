/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { createHashRouter, RouteObject } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Route-level code splitting: the home page ships only what it needs; every
// other page (50 volumes, studio, archives, modules…) downloads on first visit
// to that route and is then cached by the browser / service worker.
const EncyclopediaIndexPage = lazy(() => import('./pages/EncyclopediaIndexPage'));
const VolumePage = lazy(() => import('./pages/VolumePage'));
const VolumeNumberRedirect = lazy(() => import('./pages/VolumeNumberRedirect'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ScholarlyStandardsPage = lazy(() => import('./pages/ScholarlyStandardsPage'));
const PodcastPage = lazy(() => import('./pages/PodcastPage'));
const PodcastEpisodePage = lazy(() => import('./pages/PodcastEpisodePage'));
const MusicPage = lazy(() => import('./pages/MusicPage'));
const PunjabiZaboorPage = lazy(() => import('./pages/PunjabiZaboorPage'));
const SingersArchivePage = lazy(() => import('./pages/SingersArchivePage'));
const StudioPage = lazy(() => import('./pages/StudioPage'));
const TheologicalArchivePage = lazy(() => import('./pages/TheologicalArchivePage'));
const ComparativeApologeticsPage = lazy(() => import('./pages/ComparativeApologeticsPage'));
const ProphecyMapPage = lazy(() => import('./pages/ModulePages').then(m => ({ default: m.ProphecyMapPage })));
const KingsOfTheBiblePage = lazy(() => import('./pages/ModulePages').then(m => ({ default: m.KingsOfTheBiblePage })));
const CrossReferencesPage = lazy(() => import('./pages/ModulePages').then(m => ({ default: m.CrossReferencesPage })));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));

const PageFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite">
    <span className="inline-block h-9 w-9 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
    <span className="sr-only">Loading…</span>
  </div>
);

const L = (el: React.ReactElement) => <Suspense fallback={<PageFallback />}>{el}</Suspense>;

export const routeConfig: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'encyclopedia',
        element: L(<EncyclopediaIndexPage />)
      },
      {
        path: 'encyclopedia/:slug',
        element: L(<VolumePage />)
      },
      {
        path: 'encyclopedia/by-number/:num',
        element: L(<VolumeNumberRedirect />)
      },
      {
        path: 'about',
        element: L(<AboutPage />)
      },
      {
        path: 'scholarly-standards',
        element: L(<ScholarlyStandardsPage />)
      },
      {
        path: 'podcast',
        element: L(<PodcastPage />)
      },
      {
        path: 'podcast/:episode',
        element: L(<PodcastEpisodePage />)
      },
      {
        path: 'music',
        element: L(<MusicPage />)
      },
      {
        path: 'music/punjabi-zaboor',
        element: L(<PunjabiZaboorPage />)
      },
      {
        path: 'music/pakistani-singers-archive',
        element: L(<SingersArchivePage />)
      },
      {
        path: 'studio',
        element: L(<StudioPage />)
      },
      {
        path: 'theological-archive',
        element: L(<TheologicalArchivePage />)
      },
      {
        path: 'comparative-apologetics',
        element: L(<ComparativeApologeticsPage />)
      },
      {
        path: 'prophecy-map',
        element: L(<ProphecyMapPage />)
      },
      {
        path: 'kings-of-the-bible',
        element: L(<KingsOfTheBiblePage />)
      },
      {
        path: 'cross-references',
        element: L(<CrossReferencesPage />)
      },
      {
        path: 'support',
        element: L(<SupportPage />)
      },
      {
        path: 'faq',
        element: L(<FaqPage />)
      },
      {
        path: 'contact',
        element: L(<ContactPage />)
      },
      {
        path: 'privacy',
        element: L(<PrivacyPage />)
      },
      {
        path: 'terms',
        element: L(<TermsPage />)
      },
      {
        path: 'disclaimer',
        element: L(<DisclaimerPage />)
      },
      {
        path: 'sitemap',
        element: L(<SitemapPage />)
      },
      {
        path: '*',
        element: <NotFoundPage status={404} />
      }
    ]
  }
];

export const router = createHashRouter(routeConfig);
