// Panggung 3D di atas latar 2D: kamera perspektif + pencahayaan yang konsisten dengan kit 2D
// (satu cahaya utama dari `lightAngle`, cahaya isi lemah, rim light, ambient) dan lantai transparan yang hanya
// menampilkan bayangan, supaya objek 3D "menapak" di atas ilustrasi/latar kode.
//
//   <Stage3D lightAngle={135} camera={{ position: [0, 1.4, 6], target: [0, 0.5, 0] }}>
//     <Model id="food_apple_01" size={1.2} rotation={[0, f * 0.03, 0]} />
//   </Stage3D>
//
// WebGL di Chrome headless: di macOS (diuji) default berjalan; bila still hitam/kosong di mesin lain (Linux/CI),
// tambahkan `--gl=angle` (atau `--gl=swangle` tanpa GPU) ke remotion still/render.
import React, { useLayoutEffect } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useVideoConfig } from 'remotion';

type Vec3 = [number, number, number];
export type Stage3DCamera = { position?: Vec3; target?: Vec3; fov?: number };

/** Arah kamera dikendalikan prop (boleh dianimasikan dari useCurrentFrame()). */
const CameraAim: React.FC<Required<Stage3DCamera>> = ({ position, target, fov }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...position);
    if ('fov' in camera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(...target);
  }, [camera, position, target, fov]);
  return null;
};

export type Stage3DProps = {
  /** arah datang cahaya utama dalam derajat sudut layar: 0 = dari kanan, 90 = dari atas, 135 = kiri atas (default) */
  lightAngle?: number;
  /** kekuatan cahaya utama */
  intensity?: number;
  /** warna cahaya utama/isi; ikuti palet episode (hangat/dingin) */
  keyColor?: string;
  fillColor?: string;
  camera?: Stage3DCamera;
  /** kegelapan bayangan di lantai 0..1 (0 = tanpa lantai) */
  shadowOpacity?: number;
  /** warna latar; kosong = transparan (latar 2D terlihat) */
  background?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export const Stage3D: React.FC<Stage3DProps> = ({
  lightAngle = 135,
  intensity = 3,
  keyColor = '#fff4e6',
  fillColor = '#dfe8ff',
  camera = {},
  shadowOpacity = 0.32,
  background,
  width,
  height,
  style,
  children,
}) => {
  const cfg = useVideoConfig();
  const a = (lightAngle * Math.PI) / 180;
  const key: Vec3 = [Math.cos(a) * 4, Math.max(1.5, Math.sin(a) * 4 + 2), 3]; // dari depan-atas sesuai sudut layar
  const rim: Vec3 = [-Math.cos(a) * 3, 2.5, -3]; // dari belakang, berlawanan dengan cahaya utama
  const fill: Vec3 = [-Math.cos(a) * 4, 1, 2];
  const cam = { position: camera.position ?? ([0, 1.4, 6] as Vec3), target: camera.target ?? ([0, 0.5, 0] as Vec3), fov: camera.fov ?? 30 };
  return (
    <ThreeCanvas
      width={width ?? cfg.width}
      height={height ?? cfg.height}
      shadows="soft"
      gl={{ alpha: !background, antialias: true, preserveDrawingBuffer: true }}
      style={{ position: 'absolute', inset: 0, background, ...style }}
    >
      <CameraAim {...cam} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#ffffff', '#444a55', 0.45]} />
      <directionalLight
        position={key}
        intensity={intensity}
        color={keyColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
      />
      <directionalLight position={fill} intensity={intensity * 0.25} color={fillColor} />
      <directionalLight position={rim} intensity={intensity * 0.6} color="#ffffff" />
      {shadowOpacity > 0 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial transparent opacity={shadowOpacity} />
        </mesh>
      ) : null}
      {children}
    </ThreeCanvas>
  );
};
