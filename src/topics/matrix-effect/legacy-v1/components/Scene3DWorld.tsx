import React, { useRef } from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

// ---------------- 3D DIORAMA WORLD (THREE.JS) ----------------

// Ground & Sidewalk with tactile 3D tiles
const DioramaGround: React.FC = () => {
  return (
    <group position={[0, -2, 0]}>
      {/* Main Street Base */}
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[18, 1, 18]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      {/* Wet Ice Patch (Cyan Specular Reflection) */}
      <mesh receiveShadow position={[0, 0.02, 1]}>
        <boxGeometry args={[7, 0.05, 5]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Sidewalk curb with ink style */}
      <mesh position={[0, 0.15, -3]}>
        <boxGeometry args={[16, 0.3, 1.5]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* Background Stylized 3D Mini Buildings */}
      <mesh position={[-5, 3, -6]}>
        <boxGeometry args={[3.5, 7, 3]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4, -7]}>
        <boxGeometry args={[4, 9, 3]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.8} />
      </mesh>
      <mesh position={[5, 2.5, -6]}>
        <boxGeometry args={[3, 6, 3]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
    </group>
  );
};

// 3D Physical Fact Object: Oversized "3s" block that slams down
const PhysicalNumber3S: React.FC<{ frame: number }> = ({ frame }) => {
  const dropY = interpolate(frame, [15, 30], [8, -0.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rotation = interpolate(frame, [15, 30], [-0.5, 0.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < 15) return null;

  return (
    <group position={[2.2, dropY, 1.5]} rotation={[0, -0.3, rotation]}>
      {/* 3D Gold / Amber Metric Block */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 2.2, 0.8]} />
        <meshStandardMaterial
          color="#fbbf24"
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      {/* Text Plate Accent */}
      <mesh position={[0, 0, 0.45]}>
        <boxGeometry args={[1.4, 0.5, 0.05]} />
        <meshStandardMaterial color="#d97706" />
      </mesh>
    </group>
  );
};

// 3D Coffee Cup suspended mid-air in slow motion
const FloatingCoffeeCup: React.FC<{ frame: number }> = ({ frame }) => {
  const rotY = frame * 0.02;
  const posY = 0.5 + Math.sin(frame * 0.05) * 0.1;

  return (
    <group position={[-1.6, posY, 1.8]} rotation={[0.3, rotY, 0.4]}>
      {/* Cup Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.25, 0.7, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>
      {/* Coffee liquid surface */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 16]} />
        <meshStandardMaterial color="#78350f" roughness={0.2} />
      </mesh>
      {/* Suspended 3D Coffee drops */}
      <mesh position={[0.2, 0.6, 0.1]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[-0.1, 0.8, -0.1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </group>
  );
};

// 2D Cartoon Character Billboard in 3D Space (Canvas Drawn Sprite)
const CartoonBillboardCharacter: React.FC<{ frame: number }> = ({ frame }) => {
  // Blink swap state
  const isBlink = frame > 42 && frame < 45;
  const isBugEyed = frame >= 45;

  return (
    <group position={[-0.2, -0.6, 0.8]} rotation={[-0.2, 0.15, 0.1]}>
      {/* Shadow contact blob */}
      <mesh position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {/* 3D Round Bean-Head */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#fde047" roughness={0.5} />
      </mesh>

      {/* Eyes on Head */}
      {!isBugEyed ? (
        <group position={[0, 0.7, 0.65]}>
          {/* Calm eyes */}
          <mesh position={[-0.22, 0.05, 0]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.22, 0.05, 0]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>
      ) : (
        <group position={[0, 0.7, 0.68]}>
          {/* Bug-eyed panic state */}
          <mesh position={[-0.25, 0.08, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.25, 0.08, 0.16]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#000000" />
          </mesh>

          <mesh position={[0.25, 0.08, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.25, 0.08, 0.16]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#000000" />
          </mesh>

          {/* Open O-Mouth */}
          <mesh position={[0, -0.22, 0.08]}>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
            <meshBasicMaterial color="#881337" />
          </mesh>
        </group>
      )}

      {/* Bean Body (Blue Hoodie) */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.45, 0.55, 1.1, 24]} />
        <meshStandardMaterial color="#2563eb" roughness={0.6} />
      </mesh>

      {/* Thin stick arms */}
      <mesh position={[-0.65, 0.05, 0]} rotation={[0, 0, 0.8]}>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 12]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      <mesh position={[0.65, 0.15, 0]} rotation={[0, 0, -1.1]}>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 12]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
    </group>
  );
};

// Main 3D Three.js Scene Component
export const Scene3DWorld: React.FC = () => {
  const frame = useCurrentFrame();

  // Dynamic Camera Gliding (Slow Dutch Tilt Push-in)
  const camZ = interpolate(frame, [0, 150], [7.5, 5.8], {
    extrapolateRight: 'clamp',
  });
  const camY = interpolate(frame, [0, 150], [1.2, 0.7]);
  const camRoll = interpolate(frame, [0, 150], [-0.08, 0.04]);

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <ThreeCanvas
        width={1080}
        height={1920}
        camera={{
          fov: 38,
          position: [0, camY, camZ],
        }}
      >
        {/* Warm Tungsten Key Light + Cold Cyan Rim Light */}
        <ambientLight intensity={0.6} color="#e0f2fe" />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.8}
          color="#ffedd5"
          castShadow
        />
        <directionalLight
          position={[-6, 2, -2]}
          intensity={1.2}
          color="#38bdf8"
        />
        <pointLight position={[0, 2, 2]} intensity={0.8} color="#fbbf24" />

        {/* 3D Diorama Elements */}
        <DioramaGround />
        <FloatingCoffeeCup frame={frame} />
        <PhysicalNumber3S frame={frame} />
        <CartoonBillboardCharacter frame={frame} />
      </ThreeCanvas>
    </div>
  );
};
