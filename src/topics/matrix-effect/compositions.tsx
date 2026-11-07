import React from 'react';
import { Composition, Folder } from 'remotion';
import { MatrixEffect2D } from './2d/MatrixEffect2D';
import * as T2D from './2d/timeline';

/** Topic "matrix-effect": kenapa waktu terasa melambat saat panik (video lama, diarsipkan apa adanya). */
export const MatrixEffectCompositions: React.FC = () => (
  <Folder name="matrix-effect">
    <Composition id="MatrixEffect2D" component={MatrixEffect2D} durationInFrames={T2D.DURATION} fps={T2D.FPS} width={T2D.WIDTH} height={T2D.HEIGHT} />
  </Folder>
);
