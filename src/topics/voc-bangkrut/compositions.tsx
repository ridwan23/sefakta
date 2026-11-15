import React from 'react';
import { Composition, Folder } from 'remotion';
import brief from '../../../briefs/voc-bangkrut.json';
import { Episode } from '../../shared/episode/Episode';
import { calculateEpisodeMetadata, FPS, WIDTH, HEIGHT } from '../../shared/episode/metadata';
import type { EpisodeBrief, EpisodeProps } from '../../shared/episode/types';
import { VISUALS } from './scenes';

const VocBangkrut: React.FC<EpisodeProps> = (props) => <Episode {...props} visuals={VISUALS} />;

/** Episode "Kenapa Perusahaan Terkaya di Dunia Bisa Bangkrut?". Durasi dihitung dari audio VO (public/voc-bangkrut/manifest.json). */
export const VocBangkrutCompositions: React.FC = () => (
  <Folder name="voc-bangkrut">
    <Composition
      id="EpVocBangkrut"
      component={VocBangkrut}
      calculateMetadata={calculateEpisodeMetadata}
      defaultProps={{ brief: brief as EpisodeBrief }}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </Folder>
);
