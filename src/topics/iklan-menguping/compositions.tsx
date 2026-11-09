import React from 'react';
import { Composition, Folder } from 'remotion';
import brief from '../../../briefs/iklan-menguping.json';
import { Episode } from '../../shared/episode/Episode';
import { calculateEpisodeMetadata, FPS, WIDTH, HEIGHT } from '../../shared/episode/metadata';
import type { EpisodeBrief, EpisodeProps } from '../../shared/episode/types';
import { VISUALS } from './scenes';

const IklanMenguping: React.FC<EpisodeProps> = (props) => <Episode {...props} visuals={VISUALS} />;

/** Episode "Ponselmu Menguping Obrolanmu?". Durasi dihitung dari audio VO (public/iklan-menguping/manifest.json). */
export const IklanMengupingCompositions: React.FC = () => (
  <Folder name="iklan-menguping">
    <Composition
      id="EpIklanMenguping"
      component={IklanMenguping}
      calculateMetadata={calculateEpisodeMetadata}
      defaultProps={{ brief: brief as EpisodeBrief }}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </Folder>
);
