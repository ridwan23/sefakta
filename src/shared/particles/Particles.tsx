// Gaya medan partikel: ribuan titik bercahaya di latar gelap yang mengalir mengikuti medan noise (dengan ekor), lalu
// berkumpul membentuk sebuah bentuk/angka/kata dan pecah lagi. Digambar di <canvas> (cepat untuk ribuan titik) dan
// deterministik: posisi tiap titik adalah fungsi frame, bukan simulasi bertahap, jadi frame mana pun bisa dirender sendiri.
//
//   <FieldSurface />
//   <ParticleField count={1800} palette={FIELD.biru} />                                  // aliran bebas
//   const pts = useTextPoints('78%', { x: 540, y: 900, size: 380, n: 1800 });
//   <ParticleField count={1800} gather={{ at: q.angka, to: pts, release: q.pecah }} />   // berkumpul jadi teks
//   <ParticleField gather={{ at: 30, to: ringPoints(540, 900, 300, 1800) }} />
import React, { useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, noise1 } from '../anim/core';
import { font } from '../brand/fonts';
import { clamp01, hash } from '../motion';

export type Pt = [number, number];

export const FIELD = {
  latar: '#05070D',
  biru: ['#6CC4FF', '#A8E1FF', '#FFFFFF'],
  api: ['#FF8A3D', '#FFC857', '#FFF1C9'],
  hijau: ['#59F0B5', '#B6FFE0', '#FFFFFF'],
  ungu: ['#B28DFF', '#FF7AD9', '#FFFFFF'],
} as const;

/** Latar gelap dengan cahaya samar di tengah. */
export const FieldSurface: React.FC<{ color?: string; glow?: string }> = ({ color = FIELD.latar, glow = 'rgba(80,120,200,0.18)' }) => (
  <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 50% 45%, ${glow}, transparent 70%), ${color}` }} />
);

// ——— bentuk sasaran ———

export const ringPoints = (cx: number, cy: number, r: number, n: number, thick = 18): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r + (hash(i * 3.1) - 0.5) * thick;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });

export const discPoints = (cx: number, cy: number, r: number, n: number): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    // spiral sunflower: rata tanpa gumpalan
    const rr = r * Math.sqrt((i + 0.5) / n);
    const a = i * 2.39996323;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });

export const gridPoints = (x: number, y: number, w: number, h: number, n: number): Pt[] => {
  const cols = Math.max(1, Math.round(Math.sqrt((n * w) / h)));
  const rows = Math.ceil(n / cols);
  return Array.from({ length: n }, (_, i) => [x + ((i % cols) + 0.5) * (w / cols), y + (Math.floor(i / cols) + 0.5) * (h / rows)]);
};

/** Titik sasaran dari teks (dirasterisasi di canvas, menunggu font siap). Titik dibagi rata ke piksel tinta. */
export const useTextPoints = (
  text: string,
  o: { x: number; y: number; size: number; n: number; font?: string; weight?: number },
): Pt[] => {
  const fam = o.font ?? font('inter');
  const weight = o.weight ?? 900;
  const key = `${text}|${o.x}|${o.y}|${o.size}|${o.n}|${fam}|${weight}`;
  const [state, set] = useState<{ key: string; pts: Pt[] } | null>(null);
  const [handle] = useState(() => delayRender(`useTextPoints ${text}`));
  useLayoutEffect(() => {
    let live = true;
    const spec = `${weight} ${o.size}px ${fam}`;
    document.fonts
      .load(spec, text)
      .catch(() => undefined)
      .then(() => {
        if (!live) return;
        const c = document.createElement('canvas');
        c.width = 1080;
        c.height = 1920;
        const g = c.getContext('2d', { willReadFrequently: true });
        if (!g) return;
        g.font = spec;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(text, o.x, o.y);
        const data = g.getImageData(0, 0, 1080, 1920).data;
        const ink: Pt[] = [];
        const step = 3;
        for (let y = 0; y < 1920; y += step) for (let x = 0; x < 1080; x += step) if (data[(y * 1080 + x) * 4 + 3] > 128) ink.push([x, y]);
        const pts: Pt[] = ink.length
          ? Array.from({ length: o.n }, (_, i) => {
              const p = ink[Math.floor(hash(i * 7.77 + 1) * ink.length)];
              return [p[0] + (hash(i * 1.3) - 0.5) * step, p[1] + (hash(i * 2.9) - 0.5) * step];
            })
          : Array.from({ length: o.n }, () => [o.x, o.y]);
        set({ key, pts });
        continueRender(handle);
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state?.key === key ? state.pts : [];
};

// ——— medan ———

export type Gather = {
  at: number;
  to: Pt[];
  /** lama berkumpul (frame); titik datang bertahap */
  dur?: number;
  /** frame mulai pecah kembali ke aliran */
  release?: number;
  releaseDur?: number;
};

export type ParticleFieldProps = {
  count?: number;
  seed?: number;
  palette?: readonly string[];
  /** radius px [min, max]; titik dekat (z besar) lebih besar & cepat */
  size?: [number, number];
  /** kecepatan aliran px/dtk */
  speed?: number;
  /** arah aliran rata-rata (derajat; 0 = kanan, -90 = naik) */
  angle?: number;
  /** besar kelokan medan noise (px) */
  curl?: number;
  /** panjang ekor (detik); 0 = titik saja */
  trail?: number;
  /** panjang ekor maksimum (px) untuk titik terdekat */
  maxTrail?: number;
  /** tambah cahaya (blend 'lighter') */
  glow?: boolean;
  area?: [number, number, number, number];
  gather?: Gather;
  /** muncul bertahap mulai frame ini */
  at?: number;
  opacity?: number;
};

/** Ribuan partikel di canvas: mengalir bebas, atau berkumpul ke `gather.to` lalu pecah lagi. */
export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 1500,
  seed = 1,
  palette = FIELD.biru,
  size = [1.2, 3.6],
  speed = 60,
  angle = -70,
  curl = 120,
  trail = 0.25,
  maxTrail = 36,
  glow = true,
  area = [0, 0, 1080, 1920],
  gather,
  at,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const [ax, ay, aw, ah] = area;

  useLayoutEffect(() => {
    const c = ref.current;
    const g = c?.getContext('2d');
    if (!c || !g) return;
    g.clearRect(0, 0, aw, ah);
    g.globalCompositeOperation = glow ? 'lighter' : 'source-over';
    g.lineCap = 'round';
    const rad = (angle * Math.PI) / 180;
    const vx = Math.cos(rad);
    const vy = Math.sin(rad);
    const tNow = frame / fps;
    const appear = (i: number) => (at === undefined ? 1 : clamp01((frame - at - hash(i * 5.3 + seed) * 20) / 12));

    // posisi bebas pada waktu t (wrap di dalam area)
    const free = (i: number, z: number, t: number): Pt => {
      const x0 = hash(i * 1.71 + seed) * aw;
      const y0 = hash(i * 2.93 + seed * 7) * ah;
      const sp = speed * (0.4 + z);
      const k = 0.18 + hash(i * 4.1) * 0.25;
      const nx = noise1(t * k + i * 0.13, seed + 1) * curl;
      const ny = noise1(t * k + i * 0.17, seed + 2) * curl;
      const x = (((x0 + vx * sp * t + nx) % aw) + aw) % aw;
      const y = (((y0 + vy * sp * t + ny) % ah) + ah) % ah;
      return [x, y];
    };
    const to = gather?.to;
    const gp = (i: number, f: number) => {
      if (!gather || !to?.length) return 0;
      const d = gather.dur ?? 40;
      const lag = hash(i * 9.1 + seed) * d * 0.6;
      let p = EASE.inOut(clamp01((f - gather.at - lag) / (d * 0.55)));
      if (gather.release !== undefined) {
        const rd = gather.releaseDur ?? 30;
        p *= 1 - EASE.inOut(clamp01((f - gather.release - lag * 0.5) / (rd * 0.6)));
      }
      return p;
    };
    const pos = (i: number, z: number, f: number): Pt => {
      const a = free(i, z, f / fps);
      const p = gp(i, f);
      if (p <= 0 || !to) return a;
      const tg = to[i % to.length];
      // berkumpul dengan sedikit getar hidup
      const jx = noise1(f / fps + i, seed + 5) * 2.5;
      const jy = noise1(f / fps + i, seed + 6) * 2.5;
      return [a[0] + (tg[0] - ax + jx - a[0]) * p, a[1] + (tg[1] - ay + jy - a[1]) * p];
    };

    const steps = trail > 0 ? 4 : 0;
    for (let i = 0; i < count; i++) {
      const ap = appear(i);
      if (ap <= 0) continue;
      const z = hash(i * 6.37 + seed * 3);
      const r = size[0] + (size[1] - size[0]) * z * z;
      const col = palette[Math.floor(hash(i * 8.11) * palette.length)];
      const tw = 0.55 + 0.45 * Math.sin(tNow * (2 + z * 3) + i);
      const alpha = opacity * ap * (0.35 + 0.65 * z) * tw;
      const p0 = pos(i, z, frame);
      g.globalAlpha = alpha;
      g.fillStyle = col;
      g.strokeStyle = col;
      if (steps) {
        const dtF = (trail * fps) / steps;
        g.lineWidth = r * 1.4;
        g.beginPath();
        g.moveTo(p0[0], p0[1]);
        let prev = p0;
        // panjang ekor dibatasi: saat titik melesat (berkumpul/pecah) ekor jadi goresan pendek, bukan garis melintang
        let budget = maxTrail * (0.5 + z);
        for (let s = 1; s <= steps && budget > 0; s++) {
          const q = pos(i, z, frame - s * dtF);
          const dx = q[0] - prev[0];
          const dy = q[1] - prev[1];
          const d = Math.hypot(dx, dy);
          if (Math.abs(dx) > aw / 2 || Math.abs(dy) > ah / 2) break;
          const k = d > budget ? budget / d : 1;
          g.lineTo(prev[0] + dx * k, prev[1] + dy * k);
          budget -= d;
          prev = q;
        }
        g.globalAlpha = alpha * 0.45;
        g.stroke();
        g.globalAlpha = alpha;
      }
      g.beginPath();
      g.arc(p0[0], p0[1], r, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  });

  return <canvas ref={ref} width={aw} height={ah} style={{ position: 'absolute', left: ax, top: ay, width: aw, height: ah, pointerEvents: 'none' }} />;
};
