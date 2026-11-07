import React from 'react';
import { MatrixEffectCompositions } from './topics/matrix-effect/compositions';
import { FileDeletedCompositions } from './topics/file-deleted/compositions';
import { Tambora1816Compositions } from './topics/tambora-1816/compositions';

// One line per topic. Topic code lives in src/topics/<topic>/ and registers its own compositions.
export const RemotionRoot: React.FC = () => (
  <>
    <MatrixEffectCompositions />
    <FileDeletedCompositions />
    <Tambora1816Compositions />
  </>
);
