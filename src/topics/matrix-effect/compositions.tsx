import React from 'react';
import { Composition, Folder } from 'remotion';
import { MatrixEffect2D } from './2d/MatrixEffect2D';
import * as T2D from './2d/timeline';
import { MatrixEffect } from './3d/MatrixEffect';
import * as T3D from './3d/constants';
import { MainVideo } from './legacy-v1/MainVideo';
import * as V1 from './legacy-v1/constants';

/** Topic "matrix-effect": why time feels slow when you panic. 2D = final (VO v3), 3D = older timing, legacy-v1 = first attempt. */
export const MatrixEffectCompositions: React.FC = () => (
  <Folder name="matrix-effect">
    <Composition id="MatrixEffect2D" component={MatrixEffect2D} durationInFrames={T2D.DURATION} fps={T2D.FPS} width={T2D.WIDTH} height={T2D.HEIGHT} />
    <Composition id="MatrixEffect" component={MatrixEffect} durationInFrames={T3D.DURATION} fps={T3D.FPS} width={T3D.WIDTH} height={T3D.HEIGHT} />
    <Composition id="TimeSlowShort" component={MainVideo} durationInFrames={V1.DURATION_IN_FRAMES} fps={V1.FPS} width={V1.WIDTH} height={V1.HEIGHT} />
  </Folder>
);
