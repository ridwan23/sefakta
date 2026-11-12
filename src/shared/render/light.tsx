// Satu sumber cahaya per episode. Semua objek membaca arah cahaya yang sama, jadi sisi terang, bayangan dalam,
// sorotan, dan bayangan jatuh konsisten di seluruh scene. Itu yang membuat ilustrasi terasa "nyata".
//
//   <LightProvider angle={135}>…scene…</LightProvider>   // 135° = cahaya dari kiri atas (default)
//   const L = useLight();  L.toLight = vektor satuan ke arah lampu (koordinat layar, y ke bawah)
import React, { createContext, useContext } from 'react';

export type Light = {
  /** arah datang cahaya dalam derajat, sudut layar: 0 = dari kanan, 90 = dari atas, 135 = kiri atas, 180 = kiri */
  angle: number;
  /** warna cahaya (hangat sedikit lebih alami) */
  color: string;
  /** kekuatan 0..1: kontras terang-gelap pada shading */
  intensity: number;
  /** vektor satuan ke arah lampu (dx, dy) di koordinat layar */
  toLight: [number, number];
};

export const makeLight = (angle = 135, color = '#FFF4DC', intensity = 0.8): Light => {
  const r = (angle * Math.PI) / 180;
  return { angle, color, intensity, toLight: [Math.cos(r), -Math.sin(r)] };
};

const Ctx = createContext<Light>(makeLight());

export const LightProvider: React.FC<{ angle?: number; color?: string; intensity?: number; children: React.ReactNode }> = ({ angle, color, intensity, children }) => (
  <Ctx.Provider value={makeLight(angle, color, intensity)}>{children}</Ctx.Provider>
);
export const useLight = () => useContext(Ctx);

/** CSS filter bayangan jatuh untuk elemen HTML/gambar yang "melayang" `elevation` px di atas latar. */
export const dropShadow = (light: Light, elevation: number, color = 'rgba(15,18,40,0.28)') => {
  const [lx, ly] = light.toLight;
  const d = elevation * 0.5;
  return `drop-shadow(${(-lx * d).toFixed(1)}px ${(-ly * d + elevation * 0.25).toFixed(1)}px ${(elevation * 0.6 + 2).toFixed(1)}px ${color})`;
};
