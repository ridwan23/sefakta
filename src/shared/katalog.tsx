// Registrasi katalog acuan untuk agent (Studio → folder "katalog"). Bukan episode.
//   KatalogGerak : kit gerak src/shared/anim
//   KatalogPola  : pola scene src/shared/patterns
//   KatalogObjek : material/cahaya/fisika/latar/ikon/3D (src/shared/render, physics, look, three)
//   KatalogObjekIlustrasi : objek ilustrasi siap pakai (src/shared/objects)
//   KatalogCollage : kolase, coretan spidol, label penunjuk (src/shared/collage, labels)
//   KatalogGaya    : papan tulis (sketch), lipat/pita kertas (collage/fold), isometrik (iso), siluet (silhouette),
//                    rumus (math), material clay (render/MaterialStyle), komik (comic), risograf (riso),
//                    grid Swiss (swiss), stickman (stickman)
import React from 'react';
import { Composition, Folder } from 'remotion';
import { KatalogGerak, KATALOG_GERAK_FRAMES } from './anim/Catalog';
import { KatalogPola, KATALOG_POLA_FRAMES } from './patterns/Catalog';
import { KatalogObjek, KATALOG_OBJEK_FRAMES } from './render/Catalog';
import { KatalogObjekIlustrasi, KATALOG_OBJEK_ILUSTRASI_FRAMES } from './objects/Catalog';
import { KatalogCollage, KATALOG_COLLAGE_FRAMES } from './collage/Catalog';
import { KatalogGaya, KATALOG_GAYA_FRAMES } from './KatalogGaya';

export const KatalogCompositions: React.FC = () => (
  <Folder name="katalog">
    <Composition id="KatalogGerak" component={KatalogGerak} durationInFrames={KATALOG_GERAK_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="KatalogPola" component={KatalogPola} durationInFrames={KATALOG_POLA_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="KatalogObjek" component={KatalogObjek} durationInFrames={KATALOG_OBJEK_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="KatalogObjekIlustrasi" component={KatalogObjekIlustrasi} durationInFrames={KATALOG_OBJEK_ILUSTRASI_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="KatalogCollage" component={KatalogCollage} durationInFrames={KATALOG_COLLAGE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="KatalogGaya" component={KatalogGaya} durationInFrames={KATALOG_GAYA_FRAMES} fps={30} width={1080} height={1920} />
  </Folder>
);
