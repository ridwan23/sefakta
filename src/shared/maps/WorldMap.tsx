import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { geoGraticule10, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import type { Topology } from 'topojson-specification';
import world50 from 'world-atlas/countries-50m.json';
import { makeProjection, projector, type MapView, type Projector } from './geo';

export * from './geo';

/** Peta dunia reusable (Natural Earth 1:50m via world-atlas, domain publik). Data negara memakai kode ISO 3166 numerik
 *  sebagai `id` (mis. Indonesia "360", Amerika Serikat "840", Swiss "756"). */
const topo = world50 as unknown as Topology;
export const COUNTRIES = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
const GRATICULE = geoGraticule10();

export type WorldMapProps = {
  view: MapView;
  kind?: 'mercator' | 'orthographic';
  width?: number;
  height?: number;
  land: string;
  border: string;
  borderWidth?: number;
  /** Warna laut/bola (orthographic) — kosongkan untuk transparan. */
  ocean?: string;
  graticule?: string;
  /** id negara → warna isi. */
  highlight?: Record<string, string>;
  /** Lapisan tambahan di atas peta, dengan proyektor kamera saat ini. */
  children?: (project: Projector) => React.ReactNode;
  style?: React.CSSProperties;
};

/** Peta vektor deterministik: semua posisi dihitung dari `view`, jadi animasikan kamera lewat props (mixView). */
export const WorldMap: React.FC<WorldMapProps> = ({ view, kind = 'mercator', width = 1080, height = 1920, land, border, borderWidth = 1.2, ocean, graticule, highlight = {}, children, style }) => {
  const projection = makeProjection(kind, view, width, height);
  const path = geoPath(projection);
  const project = projector(kind, view, width, height);
  const countries = useMemo(() => COUNTRIES.features, []);
  return (
    <AbsoluteFill style={style}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {ocean ? (kind === 'orthographic' ? <path d={path({ type: 'Sphere' } as GeoPermissibleObjects) ?? ''} fill={ocean} /> : <rect width={width} height={height} fill={ocean} />) : null}
        {graticule ? <path d={path(GRATICULE) ?? ''} fill="none" stroke={graticule} strokeWidth={1} /> : null}
        {countries.map((f, i) => {
          const d = path(f);
          if (!d) return null;
          const id = String(f.id ?? i);
          return <path key={id + i} d={d} fill={highlight[id] ?? land} stroke={border} strokeWidth={borderWidth} strokeLinejoin="round" />;
        })}
        {kind === 'orthographic' ? <path d={path({ type: 'Sphere' } as GeoPermissibleObjects) ?? ''} fill="none" stroke={border} strokeWidth={borderWidth * 2} /> : null}
      </svg>
      {children ? <AbsoluteFill>{children(project)}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};
