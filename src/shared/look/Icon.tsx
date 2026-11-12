// Ikon SVG dari registri public/icons/icons.json (diunduh dengan `npm run icon:add -- <set>:<nama>`).
// Warna mengikuti `color` (currentColor). Ikon garis (lucide) bisa dianimasikan tergambar dengan `draw`.
//
//   <Icon name="lucide:flask-conical" size={140} color={palet.ink} draw={{ at: q.lab }} />
//   <Icon name="phosphor:leaf-fill" size={120} color={palet.accent} />
import React, { useId } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import registry from '../../../public/icons/icons.json';
import { DUR, EASE, prog, sec } from '../anim/core';

type IconEntry = { set: string; name: string; license: string; source: string; viewBox: string; kind: 'stroke' | 'fill'; body: string };
const REG = registry as Record<string, IconEntry>;

export type IconProps = {
  /** kunci registri, mis. "lucide:flask-conical" atau "phosphor:leaf-fill" */
  name: string;
  /** sisi px (default 96; ≥ 80 agar terbaca di ponsel) */
  size?: number;
  color?: string;
  /** tebal garis ikon stroke dalam satuan viewBox (lucide default 2) */
  strokeWidth?: number;
  /** animasi tergambar (hanya ikon stroke): mulai `at`, durasi `dur` frame (default DUR.slow) */
  draw?: { at: number; dur?: number };
  style?: React.CSSProperties;
};

export const Icon: React.FC<IconProps> = ({ name, size = 96, color = 'currentColor', strokeWidth = 2, draw, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cls = `ic${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const icon = REG[name];
  if (!icon) throw new Error(`Ikon "${name}" belum diunduh. Jalankan: npm run icon:add -- ${name}`);
  const stroke = icon.kind === 'stroke';
  const p = draw && stroke ? prog(f, draw.at, draw.dur ?? sec(DUR.slow, fps), EASE.inOut) : 1;
  const css = draw && stroke ? `.${cls} *{stroke-dasharray:1 1;stroke-dashoffset:${(1 - p).toFixed(4)}}` : '';
  return (
    <svg
      className={cls}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      style={{ color, display: 'block', overflow: 'visible', ...style }}
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : undefined}
      strokeWidth={stroke ? strokeWidth : undefined}
      strokeLinecap={stroke ? 'round' : undefined}
      strokeLinejoin={stroke ? 'round' : undefined}
      opacity={draw && stroke && f < draw.at ? 0 : undefined}
      dangerouslySetInnerHTML={{ __html: (css ? `<style>${css}</style>` : '') + icon.body }}
    />
  );
};
