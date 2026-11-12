// Model glTF dari public/models/<id>/ (diunduh dengan `npm run model:add -- <id>`, CC0 Poly Haven).
// Dimuat lewat useLoader (Suspense); <ThreeCanvas> dari @remotion/three menahan render (delayRender) sampai model siap.
// Ukuran dinormalisasi: sisi terpanjang = `size` unit dunia dan alas model duduk di lantai (y = 0), jadi model apa pun
// langsung pas di Stage3D tanpa menebak skala aslinya. Animasi dari pemanggil (useCurrentFrame), bukan useFrame.
import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { staticFile } from 'remotion';
import { Box3, Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import registry from '../../../public/models/models.json';

type Vec3 = [number, number, number];
type ModelEntry = { name: string; entry: string };
const REG = registry as Record<string, ModelEntry>;

export type ModelProps = {
  /** id Poly Haven yang sudah ada di public/models/models.json */
  id: string;
  /** panjang sisi terpanjang dalam unit dunia (default 1) */
  size?: number;
  /** posisi alas model (y = 0 = di lantai) */
  position?: Vec3;
  /** rotasi radian [x, y, z] */
  rotation?: Vec3;
  /** pengali skala tambahan, mis. untuk squash/stretch: [1.1, 0.9, 1.1] */
  scale?: number | Vec3;
  castShadow?: boolean;
};

export const modelUrl = (id: string) => {
  const e = REG[id];
  if (!e) throw new Error(`Model "${id}" belum diunduh. Jalankan: npm run model:add -- ${id}`);
  return staticFile(`models/${id}/${e.entry}`);
};

export const Model: React.FC<ModelProps> = ({ id, size = 1, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, castShadow = true }) => {
  const gltf = useLoader(GLTFLoader, modelUrl(id));
  const { object, fit, offset } = useMemo(() => {
    const obj = gltf.scene.clone(true);
    obj.traverse((o) => {
      if ((o as Mesh).isMesh) {
        o.castShadow = castShadow;
        o.receiveShadow = true;
      }
    });
    const box = new Box3().setFromObject(obj);
    const dim = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const k = size / Math.max(dim.x, dim.y, dim.z, 1e-6);
    return { object: obj, fit: k, offset: [-center.x * k, -box.min.y * k, -center.z * k] as Vec3 };
  }, [gltf, size, castShadow]);
  const s: Vec3 = typeof scale === 'number' ? [scale, scale, scale] : scale;
  return (
    // grup luar: posisi/rotasi/skala dari pemanggil, berporos di alas tengah model; grup dalam: normalisasi ukuran
    <group position={position} rotation={rotation} scale={s}>
      <group position={offset} scale={fit}>
        <primitive object={object} />
      </group>
    </group>
  );
};
