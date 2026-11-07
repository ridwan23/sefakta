import React from 'react';
import { Composition, Folder } from 'remotion';
import { PictogramVideo } from './PictogramVideo';
import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH } from './constants';

/** Topic "file-deleted": what really happens to a file when you delete it (pictogram motion). */
export const FileDeletedCompositions: React.FC = () => (
  <Folder name="file-deleted">
    <Composition id="FileDeletedPictogram" component={PictogramVideo} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
  </Folder>
);
