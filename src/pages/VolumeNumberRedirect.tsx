/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { VOLUME_INDEX } from '../data/volumes/index-lite';

interface VolumeNumberRedirectProps {
  num?: number;
}

export const VolumeNumberRedirect: React.FC<VolumeNumberRedirectProps> = ({ num: propNum }) => {
  const { num: paramNum } = useParams<{ num: string }>();
  
  const targetNum = propNum !== undefined 
    ? propNum 
    : (paramNum ? parseInt(paramNum, 10) : undefined);

  if (targetNum && !isNaN(targetNum)) {
    // The 82 kB catalogue index is enough to resolve a number → slug, so this
    // redirect no longer pulls the (previously) 628 kB of volume bodies.
    const volume = VOLUME_INDEX.find(v => v.number === targetNum || v.id === String(targetNum));
    if (volume && volume.slug) {
      return <Navigate replace to={`/encyclopedia/${volume.slug}`} />;
    }
  }

  return <Navigate replace to="/encyclopedia" />;
};

export default VolumeNumberRedirect;
