import React from 'react';
import { Composition, Folder } from 'remotion';
import brief from '../../../briefs/bersin-matahari.json';
import { Episode } from '../../shared/episode/Episode';
import { calculateEpisodeMetadata, FPS, WIDTH, HEIGHT } from '../../shared/episode/metadata';
import type { EpisodeBrief, EpisodeProps } from '../../shared/episode/types';
import { VISUALS } from './scenes';

const BersinMatahari: React.FC<EpisodeProps> = (props) => <Episode {...props} visuals={VISUALS} />;

/** Episode "Kenapa Matahari Bikin Sebagian Orang Bersin?". Durasi dihitung dari audio VO (public/bersin-matahari/manifest.json). */
export const BersinMatahariCompositions: React.FC = () => (
  <Folder name="bersin-matahari">
    <Composition
      id="EpBersinMatahari"
      component={BersinMatahari}
      calculateMetadata={calculateEpisodeMetadata}
      defaultProps={{ brief: brief as EpisodeBrief }}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </Folder>
);
