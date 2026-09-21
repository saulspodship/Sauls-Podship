/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { router } from './src/routes';
import { LanguageProvider } from './src/i18n/LanguageProvider';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
      <Analytics />
    </LanguageProvider>
  );
};

export default App;
