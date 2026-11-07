import React from 'react';
import { Composition, Folder } from 'remotion';
import brief from '../../../briefs/tambora-1816.json';
import { Episode } from '../../shared/episode/Episode';
import { calculateEpisodeMetadata, FPS, WIDTH, HEIGHT } from '../../shared/episode/metadata';
import type { EpisodeBrief, EpisodeProps } from '../../shared/episode/types';
import { VISUALS } from './scenes';

const Tambora1816: React.FC<EpisodeProps> = (props) => <Episode {...props} visuals={VISUALS} />;

/** Episode "Gunung di Indonesia yang Bikin Eropa Kehilangan Musim Panas". Durasi dihitung dari audio VO (public/tambora-1816/manifest.json). */
export const Tambora1816Compositions: React.FC = () => (
  <Folder name="tambora-1816">
    <Composition
      id="EpTambora1816"
      component={Tambora1816}
      calculateMetadata={calculateEpisodeMetadata}
      defaultProps={{ brief: brief as EpisodeBrief }}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </Folder>
);
