/* ======================================================================
 * CTA SeFakta — kind `cta` (kode kanonis, template disetujui 2026-10-20)
 *
 * Kutipan VERBATIM dari:
 *   motion-graphic-ijen/remotion/src/storyboard/registry.tsx
 *   baris 3272-3752 (CtaIcon + CtaComp), terdaftar sebagai `cta: CtaComp`
 *   (baris 5179 registry yang sama).
 *
 * BUKAN file mandiri: komponen ini memakai scope template — React,
 * remotion (interpolate, spring, Easing, Img, staticFile), tipe `Ctx`,
 * konstanta `W`, `H`, `clamp`, dan `FONT` dari ../components/ui.
 * `badgeSrc` default: brand/sefakta-avatar.png.
 *
 * Varian: pill (default, "Ikuti · Fakta baru tiap hari" + lonceng) atau
 * question ("Pilih Besok", kartu pertanyaan + chips). Lihat komentar
 * param di dalam CtaComp untuk opsi lengkap (footNote, questionStyle,
 * veilTone, entrance, lockupGlow, lockupFont/contentFont, centerBlock).
 * ====================================================================== */

/* CTA — approved SeFakta closing stack (template approved 2026-10-20) */
/* Free-standing official Badge 60 logo lockup ABOVE a single CTA      */
/* pill (default) or a compact question card + choice chips (rotation).*/
/* Internal choreography is fixed by the approved template and driven  */
/* by params.enterAt (scene-relative seconds when the payoff ends):    */
/* logo fades in (t=0) -> pill pops in with a spring (t=0.5) -> one    */
/* pulse ring from the avatar chip (t~0.95) -> icon wiggle (t~1.05) -> */
/* gentle float until the frozen loop frame. The planner must fade the */
/* scene caption out at the same moment (caption handoff rule).        */
/* Sizes follow the approved anatomy, scaled from 1080-wide spec x2/3. */
/* ------------------------------------------------------------------ */

const CtaIcon: React.FC<{name: string; size: number; rotate: number}> = ({
  name,
  size,
  rotate,
}) => {
  const paths: Record<string, React.ReactNode> = {
    bell: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    bookmark: (
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFB000"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{transform: `rotate(${rotate}deg)`, flexShrink: 0}}
    >
      {paths[name] ?? paths.bell}
    </svg>
  );
};

const CtaComp: React.FC<Ctx> = ({def, v, relSec, fps}) => {
  const p = def.params as {
    variant?: 'pill' | 'question';
    text?: string;
    icon?: 'bell' | 'send' | 'bookmark';
    question?: string;
    sub?: string;
    chips?: string[];
    badgeSrc?: string;
    enterAt?: number;
    /* Perbaikan kind 2026-10-28 (uji coba aturan JSON-default): semua
     * opsional, default = perilaku lama persis. footNote = catatan kaki
     * di bawah blok (mis. "Follow pindah ke komentar tersemat" pada
     * varian question); questionStyle 'card' (default, kartu navy +
     * chips putih) / 'plain' (teks navy langsung + chips navy, seperti
     * lockup Antikythera v2); veilTone 'paper' (default, gradasi kertas
     * template) / 'cream' (gradasi krem Antikythera v2); entrance
     * 'spring' (default, pop spring + float) / 'fade' (fade opacity saja,
     * tanpa pop scale, tanpa float, easing linear — seperti v2);
     * lockupGlow (default true = glow radial + textShadow template;
     * false = tanpa glow); lockupFont / contentFont (default FONT:
     * lockup + footNote memakai lockupFont, pertanyaan/sub/chips
     * memakai contentFont; pill tetap FONT template). centerBlock
     * (perbaikan posisi 2026-10-28, uji coba posisi tengah CTA):
     * bila true, seluruh blok konten (lockup + kartu pertanyaan +
     * chips + footNote) diposisikan vertikal di tengah frame
     * (top = 0.5 * H), mengabaikan placement y dari storyboard;
     * default false = perilaku lama persis (pusat blok = placement).
     * Validasi param di types.ts + gen-storyboard-html.mjs. */
    footNote?: string;
    questionStyle?: 'card' | 'plain';
    veilTone?: 'paper' | 'cream';
    entrance?: 'spring' | 'fade';
    lockupGlow?: boolean;
    lockupFont?: string;
    contentFont?: string;
    centerBlock?: boolean;
  };
  const enterAt = p.enterAt ?? 0;
  const t = relSec - enterAt;
  if (t < -0.65) {
    return null;
  }
  const badgeSrc = p.badgeSrc ?? 'brand/sefakta-avatar.png';
  const NAVY = '#0D2250';
  const YELLOW = '#FFB000';
  const SOFT_SHADOW = '0 12px 32px rgba(8,23,54,0.38)';
  const entranceFade = (p.entrance ?? 'spring') === 'fade';
  const lockupFont = p.lockupFont ?? FONT;
  const contentFont = p.contentFont ?? FONT;
  const lockupGlow = p.lockupGlow ?? true;
  const plainQuestion = (p.questionStyle ?? 'card') === 'plain';

  const logoOp = entranceFade
    ? interpolate(t, [0, 0.45], [0, 1], clamp)
    : interpolate(t, [0, 0.45], [0, 1], {
        ...clamp,
        easing: Easing.out(Easing.cubic),
      });
  const logoY = entranceFade ? 0 : (1 - logoOp) * 10;
  const popSpring =
    t < 0.5
      ? 0
      : spring({
          frame: (t - 0.5) * fps,
          fps,
          config: {damping: 11, stiffness: 150, mass: 0.9},
        });
  const popScale = entranceFade
    ? 1
    : interpolate(popSpring, [0, 1], [0.55, 1]);
  const popOp = interpolate(t, [0.5, 0.62], [0, 1], clamp);
  const pulseP = interpolate(t, [0.95, 1.75], [0, 1], clamp);
  const pulseOn = t > 0.95 && t < 1.75;
  const wiggle =
    t > 1.05 && t < 1.55
      ? Math.sin((t - 1.05) * Math.PI * 4.4) * 16 * (1 - (t - 1.05) / 0.5)
      : 0;
  const floatY =
    entranceFade || t <= 1.3 ? 0 : Math.sin((t - 1.3) * 1.6) * 2.7;
  // Full-frame paper veil (Ridwan 2026-10-20): fades in slowly ahead of the
  // logo so the navy lockup + pill stay readable on any final-scene plate.
  const veilP = entranceFade
    ? interpolate(t, [-0.6, 1.25], [0, 1], clamp)
    : interpolate(t, [-0.6, 1.25], [0, 1], {
        ...clamp,
        easing: Easing.inOut(Easing.cubic),
      });
  const veil = (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: W,
        height: H,
        background:
          (p.veilTone ?? 'paper') === 'cream'
            ? 'linear-gradient(180deg, rgba(242,234,216,0.92) 0%, rgba(234,223,194,0.96) 100%)'
            : 'linear-gradient(180deg, rgba(253,247,231,0.84) 0%, rgba(250,242,224,0.88) 100%)',
        opacity: veilP * v.opacity,
      }}
    />
  );

  const badgeImg = (d: number) => (
    <div
      style={{
        width: d,
        height: d,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 6px 18px rgba(8,23,54,0.35)',
      }}
    >
      <Img
        src={staticFile(badgeSrc)}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </div>
  );

  const dotText = (text: string, size: number, weight: number) => (
    <span
      style={{
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        color: '#fff',
        whiteSpace: 'nowrap',
      }}
    >
      {text.split('·').map((seg, i, arr) => (
        <React.Fragment key={i}>
          {seg.trim()}
          {i < arr.length - 1 ? (
            <span style={{color: YELLOW}}> &#183; </span>
          ) : null}
        </React.Fragment>
      ))}
    </span>
  );

  const lockup = (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        opacity: logoOp * v.opacity,
        transform: `translateY(${logoY}px)`,
      }}
    >
      {lockupGlow ? (
        <div
          style={{
            position: 'absolute',
            left: -34,
            right: -34,
            top: -18,
            bottom: -18,
            background:
              'radial-gradient(ellipse at center, rgba(255,251,238,0.55) 0%, rgba(255,251,238,0) 70%)',
            filter: 'blur(4px)',
          }}
        />
      ) : null}
      {badgeImg(76)}
      <div style={{position: 'relative'}}>
        <div
          style={{
            fontFamily: lockupFont,
            fontWeight: 800,
            fontSize: 37,
            lineHeight: 1.05,
            textShadow: lockupGlow
              ? '0 2px 10px rgba(255,251,238,0.65)'
              : undefined,
          }}
        >
          <span style={{color: YELLOW}}>Se</span>
          <span style={{color: NAVY}}>Fakta</span>
        </div>
        <div
          style={{
            fontFamily: lockupFont,
            fontWeight: 600,
            fontSize: 12.5,
            letterSpacing: 3.7,
            color: 'rgba(13,34,80,0.82)',
            marginTop: 5,
            textShadow: lockupGlow
              ? '0 1px 8px rgba(255,251,238,0.7)'
              : undefined,
            whiteSpace: 'nowrap',
          }}
        >
          SATU FAKTA &#8226; SATU MENIT
        </div>
      </div>
    </div>
  );

  const pill = (
    <div
      style={{
        position: 'relative',
        marginTop: 34,
        opacity: popOp * v.opacity,
        transform: `scale(${popScale})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          height: 74,
          borderRadius: 999,
          background: NAVY,
          boxShadow: SOFT_SHADOW,
          paddingLeft: 116,
          paddingRight: 30,
        }}
      >
        {dotText(p.text ?? 'Ikuti · Fakta baru tiap hari', 32, 700)}
        <CtaIcon name={p.icon ?? 'bell'} size={30} rotate={wiggle} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: -18,
          top: '50%',
          width: 98,
          height: 98,
          marginTop: -49,
          borderRadius: '50%',
          border: '3px solid rgba(255,176,0,0.85)',
          transform: `scale(${1 + pulseP * 1.05})`,
          opacity: pulseOn ? (1 - pulseP) * 0.55 : 0,
        }}
      />
      <div style={{position: 'absolute', left: -18, top: '50%', marginTop: -49}}>
        {badgeImg(98)}
      </div>
    </div>
  );

  const chipScale = (i: number) => {
    if (entranceFade) return 1;
    const start = 0.62 + i * 0.12;
    if (t < start) return 0;
    const s = spring({
      frame: (t - start) * fps,
      fps,
      config: {damping: 12, stiffness: 160, mass: 0.9},
    });
    return interpolate(s, [0, 1], [0.5, 1]);
  };

  const questionBlock = plainQuestion ? (
    <div
      style={{
        marginTop: 60,
        /* Lebar penuh kanvas: tanpa ini, stack kind yang shrink-wrap ke
         * lockup (tersempit) akan memaksa pertanyaan membungkus 2 baris,
         * padahal kolom v2 selebar frame sehingga pertanyaan 1 baris.
         * Lockup + footnote tetap terpusat via alignItems center. */
        width: W,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: popOp * v.opacity,
        transform: `scale(${popScale})`,
      }}
    >
      <div
        style={{
          fontFamily: contentFont,
          fontWeight: 800,
          fontSize: 46,
          color: NAVY,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {p.question ?? 'Besok pilih yang mana?'}
      </div>
      <div
        style={{
          fontFamily: contentFont,
          fontSize: 26,
          color: '#5A5A64',
          marginTop: 14,
        }}
      >
        {p.sub ?? 'Tulis di komentar'}
      </div>
      <div style={{display: 'flex', gap: 20, marginTop: 30}}>
        {(p.chips ?? []).map((c, i) => (
          <div
            key={c}
            style={{
              background: NAVY,
              borderRadius: 999,
              boxShadow: '0 8px 24px rgba(8,23,54,0.30)',
              padding: '14px 40px',
              fontFamily: contentFont,
              fontWeight: 800,
              fontSize: 30,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
              opacity: popOp * v.opacity,
              transform: `scale(${chipScale(i)})`,
            }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div
      style={{
        marginTop: 34,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: popOp * v.opacity,
        transform: `scale(${popScale})`,
      }}
    >
      <div
        style={{
          background: NAVY,
          borderRadius: 30,
          boxShadow: SOFT_SHADOW,
          padding: '24px 42px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: contentFont,
            fontWeight: 800,
            fontSize: 35,
            color: '#fff',
            whiteSpace: 'nowrap',
          }}
        >
          {p.question ?? 'Besok pilih yang mana?'}
        </div>
        <div
          style={{
            fontFamily: contentFont,
            fontWeight: 500,
            fontSize: 23,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 5,
          }}
        >
          {p.sub ?? 'Tulis di komentar'}
        </div>
      </div>
      <div style={{display: 'flex', gap: 14, marginTop: 14}}>
        {(p.chips ?? []).map((c, i) => (
          <div
            key={c}
            style={{
              background: '#fff',
              borderRadius: 999,
              boxShadow: '0 8px 22px rgba(8,23,54,0.30)',
              padding: '13px 28px',
              fontFamily: contentFont,
              fontWeight: 700,
              fontSize: 26,
              color: NAVY,
              whiteSpace: 'nowrap',
              opacity: popOp * v.opacity,
              transform: `scale(${chipScale(i)})`,
            }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  );

  const footNote =
    typeof p.footNote === 'string' && p.footNote.trim() !== '' ? (
      <div
        style={{
          marginTop: 26,
          fontFamily: lockupFont,
          fontSize: 18,
          color: 'rgba(13,34,80,0.70)',
          textAlign: 'center',
          opacity: popOp * v.opacity,
        }}
      >
        {p.footNote}
      </div>
    ) : null;

  return (
    <>
      {veil}
      <div
        style={{
          position: 'absolute',
          left: v.x * W,
          /* centerBlock: pusat blok = tengah frame, apa pun placement y.
           * Default false: pusat blok = placement (perilaku lama). */
          top: (p.centerBlock ? 0.5 : v.y) * H,
          transform: `translate(-50%, -50%) translateY(${floatY}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {lockup}
        {p.variant === 'question' ? questionBlock : pill}
        {footNote}
      </div>
    </>
  );
};
