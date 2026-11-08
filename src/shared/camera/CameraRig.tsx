// Camera rig 2.5D untuk satu "dunia" kontinu: kamera virtual (x, y, zoom, roll) bergerak antar-keyframe,
// lapisan dengan kedalaman berbeda bergerak dengan parallax, plus guncangan tangan, kick saat beat, motion blur
// searah gerak, dan depth-of-field per lapisan. Semua deterministik (diturunkan dari frame).
//
//   const keys: CamKey[] = [{ frame: 0, pose: A }, { frame: q.kata, pose: B, ease: Easing.inOut(Easing.cubic) }];
//   const cam = useCamera(keys, { shake: 3 });
//   <CameraRig cam={cam}>
//     <CamLayer depth={0.3}>…latar jauh…</CamLayer>
//     <CamLayer>…dunia utama (koordinat dunia)…</CamLayer>
//     <CamLayer depth={1.5} blur={6}>…partikel depan…</CamLayer>
//   </CameraRig>
//
// Kontinuitas antarscene: pose keyframe terakhir scene N = pose keyframe pertama scene N+1.
import React, { createContext, useContext, useId } from 'react';
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from 'remotion';
import { hash } from '../motion';

export type CamPose = { x: number; y: number; zoom: number; rot?: number };
/** Keyframe: kamera tiba di `pose` pada `frame` (relatif awal scene). `ease` mengatur perjalanan DARI keyframe
 *  sebelumnya ke keyframe ini (default inOut cubic). */
export type CamKey = { frame: number; pose: CamPose; ease?: (t: number) => number };
export type Camera = { pose: Required<CamPose>; velocity: { x: number; y: number }; anchor: [number, number] };

const DEFAULT_EASE = Easing.inOut(Easing.cubic);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/** Pose kamera pada `frame` (boleh pecahan). Zoom diinterpolasi secara logaritmik supaya laju zoom terasa rata. */
export const camAt = (keys: CamKey[], frame: number): Required<CamPose> => {
  const full = (p: CamPose): Required<CamPose> => ({ rot: 0, ...p });
  if (!keys.length) return { x: 0, y: 0, zoom: 1, rot: 0 };
  if (frame <= keys[0].frame) return full(keys[0].pose);
  for (let i = 1; i < keys.length; i++) {
    const b = keys[i];
    if (frame <= b.frame) {
      const a = keys[i - 1];
      const t = (b.ease ?? DEFAULT_EASE)(clamp01((frame - a.frame) / Math.max(1e-6, b.frame - a.frame)));
      const pa = full(a.pose), pb = full(b.pose);
      return {
        x: pa.x + (pb.x - pa.x) * t,
        y: pa.y + (pb.y - pa.y) * t,
        zoom: Math.exp(Math.log(pa.zoom) + (Math.log(pb.zoom) - Math.log(pa.zoom)) * t),
        rot: pa.rot + (pb.rot - pa.rot) * t,
      };
    }
  }
  return full(keys[keys.length - 1].pose);
};

/** Guncangan kamera genggam: jumlah beberapa sinus berfase acak-deterministik (px layar dan derajat). */
export const handheld = (frame: number, amp = 3, seed = 0) => {
  const w = (k: number, sp: number) => Math.sin(frame * sp + hash(seed * 13.1 + k) * 6.283);
  return {
    dx: amp * (0.6 * w(1, 0.071) + 0.4 * w(2, 0.163)),
    dy: amp * (0.6 * w(3, 0.057) + 0.4 * w(4, 0.149)),
    drot: amp * 0.05 * (0.7 * w(5, 0.043) + 0.3 * w(6, 0.121)),
  };
};

/** Kick saat beat (mis. kata penting): dorongan zoom kecil yang meluruh. Kembalikan faktor pengali zoom. */
export const beatKick = (frame: number, at: number, amount = 0.04, len = 12) => {
  const d = frame - at;
  if (d < 0 || d > len) return 1;
  return 1 + amount * Math.exp(-d / (len / 4)) * Math.cos(d * 0.5);
};

export type CameraOptions = {
  /** amplitudo guncangan genggam dalam px layar (0 = tripod) */
  shake?: number;
  seed?: number;
  /** titik layar tempat pusat kamera mendarat; default sedikit di atas tengah agar zona caption bawah kosong */
  anchor?: [number, number];
  /** pengali zoom tambahan per frame (mis. dari beatKick) */
  zoomMul?: (frame: number) => number;
};

/** Campur dua pose (zoom logaritmik). Untuk tracking: campur pose keyframe dengan pose yang mengikuti objek. */
export const mixPose = (a: CamPose, b: CamPose, t: number): Required<CamPose> => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * t),
  rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * t,
});

/** Jalur kamera: daftar keyframe, atau fungsi frame → pose (mis. keyframe + tracking objek bergerak). */
export type CamPath = CamKey[] | ((frame: number) => CamPose);

/** Hitung kamera untuk frame saat ini (dipakai bersama <CameraRig>). */
export const useCamera = (path: CamPath, opts: CameraOptions = {}): Camera => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const anchor = opts.anchor ?? [width / 2, height * 0.43];
  const at = (f: number) => {
    const p = { rot: 0, ...(typeof path === 'function' ? path(f) : camAt(path, f)) };
    const h = handheld(f, opts.shake ?? 0, opts.seed ?? 0);
    const z = p.zoom * (opts.zoomMul?.(f) ?? 1);
    return { x: p.x - h.dx / z, y: p.y - h.dy / z, zoom: z, rot: p.rot + h.drot };
  };
  const now = at(frame);
  const prev = at(frame - 1);
  // kecepatan dalam px layar per frame (untuk motion blur searah gerak)
  return { pose: now, velocity: { x: (now.x - prev.x) * now.zoom, y: (now.y - prev.y) * now.zoom }, anchor };
};

/** Titik dunia → titik layar untuk lapisan berkedalaman `depth` (abaikan roll kecil). Berguna untuk
 *  menaruh elemen layar (label, pointer) tepat di atas objek dunia. */
export const worldToScreen = (cam: Camera, [x, y]: [number, number], depth = 1): [number, number] => {
  const { pose, anchor } = cam;
  const z = Math.pow(pose.zoom, depth);
  const r = (pose.rot * Math.PI) / 180;
  const dx = (x - pose.x * depth) * z, dy = (y - pose.y * depth) * z;
  return [anchor[0] + dx * Math.cos(r) - dy * Math.sin(r), anchor[1] + dx * Math.sin(r) + dy * Math.cos(r)];
};

const CamContext = createContext<Camera | null>(null);
export const useCam = () => {
  const c = useContext(CamContext);
  if (!c) throw new Error('useCam() harus dipakai di dalam <CameraRig>');
  return c;
};

/** Wadah kamera. `motionBlur` = kekuatan blur searah gerak (0 = mati); `maxBlur` = batas px. */
export const CameraRig: React.FC<{ cam: Camera; motionBlur?: number; maxBlur?: number; background?: string; children: React.ReactNode }> = ({
  cam, motionBlur = 0.35, maxBlur = 14, background, children,
}) => {
  const id = useId().replace(/:/g, '');
  const sx = Math.min(maxBlur, Math.abs(cam.velocity.x) * motionBlur);
  const sy = Math.min(maxBlur, Math.abs(cam.velocity.y) * motionBlur);
  const blurOn = sx > 0.6 || sy > 0.6;
  return (
    <CamContext.Provider value={cam}>
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {blurOn ? (
          <svg width={0} height={0} style={{ position: 'absolute' }}>
            <filter id={`mb${id}`} x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
            </filter>
          </svg>
        ) : null}
        {/* latar ikut di dalam grup ini supaya lapisan ber-`blend` (mis. screen) mencampur dengan latar */}
        <AbsoluteFill style={{ filter: blurOn ? `url(#mb${id})` : undefined }}>
          {background ? <AbsoluteFill style={{ background }} /> : null}
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    </CamContext.Provider>
  );
};

/** Satu lapisan dunia. `depth` 1 = bidang subjek; < 1 = jauh (bergerak & membesar lebih lambat); > 1 = dekat.
 *  Anak-anaknya diposisikan dalam koordinat lapisan (untuk depth 1 = koordinat dunia). `blur` = depth-of-field.
 *  `blend` (mis. 'screen') mencampur lapisan dengan lapisan di bawahnya: gambar berlatar gelap jadi tanpa kotak. */
export const CamLayer: React.FC<{ depth?: number; blur?: number; opacity?: number; blend?: React.CSSProperties['mixBlendMode']; children: React.ReactNode }> = ({ depth = 1, blur = 0, opacity = 1, blend, children }) => {
  const { pose, anchor } = useCam();
  const z = Math.pow(pose.zoom, depth);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transformOrigin: '0 0',
        transform: `translate(${anchor[0]}px, ${anchor[1]}px) rotate(${pose.rot}deg) scale(${z}) translate(${-pose.x * depth}px, ${-pose.y * depth}px)`,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        opacity,
        mixBlendMode: blend,
      }}
    >
      {children}
    </div>
  );
};
