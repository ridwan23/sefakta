// Objek manusia: Person (kepala-bahu, pose netral/bersin) dan HeadProfile (siluet samping, otak tembus pandang).
//
//   <Person x={540} y={900} size={420} pose="sneeze" poseAt={q.hatchi} ground={1130} />
//   <HeadProfile x={540} y={820} size={460} brain signal={{ at: q.saraf }} />
import React, { useId } from 'react';
import { EASE, impact, noise1, prog, springAt } from '../anim/core';
import { alpha, darken, lighten } from '../look/color';
import { Shaded } from '../render/Shaded';
import { ObjFrame, type ObjProps } from './ObjFrame';

const SKIN = '#E8B48E';
const HAIR = '#3A2E44';
const INK = '#3B2A22';

export type PersonProps = ObjProps & {
  pose?: 'neutral' | 'sneeze';
  /** frame mulai berganti ke `pose` (pegas). Kosong = langsung. */
  poseAt?: number;
  skin?: string;
  hair?: string;
};

/** Kepala-bahu bersendi. Idle: napas (bahu), kedip, kepala bergoyang. Bersin: kepala menyentak, mata terpejam, tangan ke hidung. */
export const Person: React.FC<PersonProps> = (p) => {
  const shirt = p.color ?? '#F2B33D';
  const skin = p.skin ?? SKIN;
  const hair = p.hair ?? HAIR;
  return (
    <ObjFrame
      {...p}
      w={200}
      h={220}
      bob={1}
      sway={0.6}
      shadowWidth={0.75}
      footInset={6}
      draw={({ f, t, k, fps }) => {
        const sneezeOn = p.pose === 'sneeze';
        const sp = !sneezeOn ? 0 : p.poseAt === undefined ? 1 : springAt(f + (p.at ?? 0), p.poseAt, fps, { damping: 9, stiffness: 220 });
        const jolt = p.poseAt !== undefined && sneezeOn ? impact(f + (p.at ?? 0), p.poseAt + 4, 10, 18, 3) : { x: 0, y: 0, r: 0 };
        const breathe = k ? Math.sin(t * 2.2) * 1.6 * k : 0;
        const headTilt = sp * 16 + jolt.x * 0.8 + (k ? noise1(t * 0.5, 2) * 2.5 * k : 0);
        const blinkPhase = (t * 0.31 + 0.2) % 1;
        const blink = sneezeOn && sp > 0.5 ? 1 : k && blinkPhase < 0.04 ? 1 : 0;
        const hairLag = -jolt.x * 1.4;
        return (
          <g transform={`translate(${jolt.x * 0.5} ${jolt.y * 0.3})`}>
            {/* bahu + kemeja (napas = bahu naik turun) */}
            <g transform={`translate(0 ${-breathe}) `}>
              <Shaded d="M28 214 C28 168 50 148 100 146 C150 148 172 168 172 214 Z" color={shirt} material="fabric" depth={14} />
              <path d="M82 148 L100 172 L118 148 Z" fill={darken(shirt, 0.3)} opacity={0.5} />
              <Shaded d="M87 116 L113 116 L114 148 C107 158 93 158 86 148 Z" color={darken(skin, 0.08)} material="matte" depth={6} />
            </g>
            {/* kepala berputar di leher */}
            <g transform={`rotate(${headTilt} 100 140) translate(0 ${-breathe * 0.6})`}>
              <Shaded d="M58 84 C56 44 82 28 104 30 C132 32 148 54 142 92 C138 122 118 138 100 138 C78 138 60 118 58 84 Z" color={skin} material="matte" depth={12} />
              {/* telinga */}
              <path d="M57 88 C48 84 46 100 56 106" fill={darken(skin, 0.06)} />
              <g transform={`rotate(${hairLag} 100 40)`}>
                <Shaded d="M54 86 C44 46 78 16 112 26 C146 34 154 66 142 88 C138 66 124 54 100 54 C78 54 64 66 54 86 Z" color={hair} material="matte" depth={8} />
              </g>
              {/* mata: terbuka (lengkung) atau terpejam */}
              {blink ? (
                <path d="M80 90 q8 5 16 0 M108 90 q8 5 16 0" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
              ) : (
                <path d="M82 86 q7 -6 14 0 M110 86 q7 -6 14 0" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
              )}
              <ellipse cx={72} cy={104} rx={8} ry={5} fill="#FF8A7A" opacity={0.35} />
              {sp < 0.5 ? (
                <path d="M88 112 q14 10 28 0" stroke="#8A4A38" strokeWidth={3.5} fill="none" strokeLinecap="round" />
              ) : (
                <ellipse cx={102} cy={116} rx={7} ry={5 + jolt.y * 0.2} fill="#6B2E26" />
              )}
              {/* tangan menutup hidung saat bersin */}
              {sp > 0.05 ? (
                <g opacity={Math.min(1, sp * 1.5)} transform={`translate(0 ${(1 - Math.min(1, sp)) * 40})`}>
                  <Shaded d="M86 122 C84 110 92 104 104 104 C116 104 122 112 120 124 C118 134 108 138 100 138 C92 138 87 132 86 122 Z" color={skin} material="matte" depth={6} />
                  <path d="M90 124 h26 M92 116 h22" stroke={darken(skin, 0.3)} strokeWidth={2} opacity={0.55} />
                </g>
              ) : null}
            </g>
            {/* garis hentakan */}
            {sneezeOn && sp > 0.3 ? (
              <g stroke="#FFD34D" strokeWidth={5} strokeLinecap="round">
                {[[40, 90, -16, -8], [36, 112, -18, 2], [46, 70, -10, -14]].map(([x0, y0, dx, dy], i) => {
                  const u = prog(f + (p.at ?? 0), (p.poseAt ?? 0) + 3 + i * 2, 8, EASE.snap);
                  return <path key={i} d={`M${x0} ${y0} l${dx * u} ${dy * u}`} opacity={u} />;
                })}
              </g>
            ) : null}
          </g>
        );
      }}
    />
  );
};

export type HeadProfileProps = ObjProps & {
  /** tampilkan otak tembus pandang */
  brain?: boolean;
  /** jalur sinyal bergaris dari mata ke belakang (mulai di frame `at`) */
  signal?: { at: number; color?: string } | false;
  skin?: string;
  hair?: string;
};

/** Siluet wajah samping (menghadap kanan): dahi, hidung, bibir, dagu, leher. Otak berdenyut, sinyal mengalir. */
export const HeadProfile: React.FC<HeadProfileProps> = (p) => {
  const id = useId().replace(/:/g, '');
  const skin = p.skin ?? SKIN;
  const hair = p.hair ?? HAIR;
  const brainOn = p.brain ?? true;
  return (
    <ObjFrame
      {...p}
      w={200}
      h={260}
      bob={1.5}
      sway={1}
      shadowWidth={0.5}
      draw={({ f, t, k }) => {
        const pulse = 1 + (k ? Math.sin(t * 3.2) * 0.025 * k : 0);
        const sig = p.signal ? prog(f + (p.at ?? 0), p.signal.at, 30, EASE.out) : 0;
        const sigColor = p.signal ? p.signal.color ?? '#FFD34D' : '#FFD34D';
        const signalD = 'M138 98 C120 92 104 92 88 96';
        const brainD = 'M58 96 C52 72 68 56 88 58 C100 50 118 56 120 72 C130 80 128 100 116 106 C110 120 90 122 80 114 C64 116 54 108 58 96 Z';
        return (
          <>
            <defs>
              <clipPath id={`hc${id}`}>
                <path d="M58 92 C58 52 90 30 124 40 C148 48 158 74 156 96 L156 120 L60 124 Z" />
              </clipPath>
            </defs>
            {/* kepala + leher: dahi → hidung → bibir → dagu → leher, tengkuk melengkung */}
            <Shaded
              d="M70 256 L72 204 C46 186 34 150 40 108 C46 60 84 30 126 38 C152 44 162 70 160 96 C160 104 164 112 170 120 C176 128 182 134 184 140 C186 146 182 150 176 150 L168 151 C170 158 168 164 164 167 C168 172 168 178 162 182 C164 192 158 200 148 202 L134 206 C130 222 130 240 132 256 Z"
              color={skin}
              material="matte"
              depth={14}
            />
            {/* rambut */}
            <Shaded d="M40 108 C42 58 86 26 130 38 C152 44 160 62 160 84 C142 62 108 58 84 70 C66 80 56 96 52 126 C44 122 40 116 40 108 Z" color={hair} material="matte" depth={8} />
            {/* telinga */}
            <path d="M72 128 C62 122 56 140 66 150 C72 154 78 148 76 140" fill={darken(skin, 0.08)} />
            {/* mata */}
            <ellipse cx={142} cy={100} rx={9} ry={6} fill="#fff" />
            <circle cx={145} cy={100} r={4} fill="#2A1A14" />
            <path d="M130 88 q12 -7 24 0" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            {/* bibir */}
            <path d="M166 166 q-6 2 -10 0" stroke="#8A4A38" strokeWidth={2.5} fill="none" strokeLinecap="round" />
            {brainOn ? (
              <g clipPath={`url(#hc${id})`} transform={`translate(88 88) scale(${pulse}) translate(-88 -88)`}>
                <path d={brainD} fill="#FFB3C1" opacity={0.85} />
                <path d={brainD} fill="none" stroke="#C2506E" strokeWidth={2.5} opacity={0.7} />
                <path d="M66 92 q8 -12 16 0 t16 0 t14 -2 M70 106 q8 -8 14 0 t14 0" stroke="#A8405C" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.75} />
              </g>
            ) : null}
            {p.signal ? (
              <g opacity={Math.min(1, sig * 2)}>
                <path d={signalD} stroke={alpha(sigColor, 0.35)} strokeWidth={6} fill="none" strokeLinecap="round" />
                <path d={signalD} stroke={sigColor} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeDasharray="7 7" strokeDashoffset={-t * 30} />
                <circle cx={88} cy={96} r={5 + Math.sin(t * 6) * 1.5} fill={lighten(sigColor, 0.2)} opacity={sig} />
              </g>
            ) : null}
          </>
        );
      }}
    />
  );
};
