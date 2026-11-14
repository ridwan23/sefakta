import React from 'react';
import { Composition, Folder } from 'remotion';
import brief from '../../../briefs/pasta-gigi-jus-jeruk.json';
import { Episode } from '../../shared/episode/Episode';
import { calculateEpisodeMetadata, FPS, WIDTH, HEIGHT } from '../../shared/episode/metadata';
import type { EpisodeBrief, EpisodeProps } from '../../shared/episode/types';
import { VISUALS } from './scenes';

const PastaGigiJusJeruk: React.FC<EpisodeProps> = (props) => <Episode {...props} visuals={VISUALS} />;

/** Episode "Kenapa Jus Jeruk Terasa Pahit Habis Sikat Gigi?". Durasi dihitung dari audio VO (public/pasta-gigi-jus-jeruk/manifest.json). */
export const PastaGigiJusJerukCompositions: React.FC = () => (
  <Folder name="pasta-gigi-jus-jeruk">
    <Composition
      id="EpPastaGigiJusJeruk"
      component={PastaGigiJusJeruk}
      calculateMetadata={calculateEpisodeMetadata}
      defaultProps={{ brief: brief as EpisodeBrief }}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </Folder>
);
