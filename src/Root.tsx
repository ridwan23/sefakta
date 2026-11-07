import React from 'react';
import { MatrixEffectCompositions } from './topics/matrix-effect/compositions';
import { FileDeletedCompositions } from './topics/file-deleted/compositions';

// One line per topic. Topic code lives in src/topics/<topic>/ and registers its own compositions.
export const RemotionRoot: React.FC = () => (
  <>
    <MatrixEffectCompositions />
    <FileDeletedCompositions />
  </>
);
