'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRef, type RefObject } from 'react';
import * as THREE from 'three';
export type SceneProps = {
  mode: number;
  onMode: (n: number) => void;
  visible: boolean;
  reduced: boolean;
  compact: boolean;
  gesture: RefObject<{
    x: number;
    y: number;
    hoverX: number;
    hoverY: number;
    dragging: boolean;
  }>;
  onFailure: () => void;
};
type Vec = [number, number, number];
function Block({
  at,
  size,
  color,
  rotation = [0, 0, 0],
}: {
  at: Vec;
  size: Vec;
  color: string;
  rotation?: Vec;
}) {
  return (
    <mesh position={at} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}
function Desk({ mode, onMode, reduced, gesture }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!group.current || reduced) return;
    const g = gesture.current;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      THREE.MathUtils.clamp(g.x + g.hoverX, -0.35, 0.35),
      5,
      Math.min(dt, 0.05),
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      THREE.MathUtils.clamp(g.y + g.hoverY, -0.12, 0.12),
      5,
      Math.min(dt, 0.05),
    );
  });
  const label = (i: number, at: Vec) => (
    <Html center position={at} zIndexRange={[8, 1]}>
      <button
        className={`scene-node ${mode === i ? 'selected' : ''}`}
        onClick={() => onMode(i)}
        aria-pressed={mode === i}
        aria-label={`${['Build', 'Analyze', 'Operate'][i]} node`}
      >
        <span>0{i + 1}</span>
        {['Build', 'Analyze', 'Operate'][i]}
      </button>
    </Html>
  );
  return (
    <group ref={group} position={[0, -0.55, 0]}>
      {/* Original procedural workspace; no external models or game assets. */}
      <Block at={[0, -0.83, 0]} size={[6.8, 0.22, 4.4]} color="#d6c9ac" />
      <Block at={[0, 1.18, -2.08]} size={[6.8, 3.85, 0.16]} color="#e7ddc6" />
      <Block
        at={[-3.32, 0.86, -0.05]}
        size={[0.16, 3.2, 4.1]}
        color="#ddd2ba"
      />
      <Block
        at={[-1.65, 1.8, -1.95]}
        size={[2.15, 2.05, 0.1]}
        color="#9caa8b"
      />
      <Block
        at={[-1.65, 2.25, -1.88]}
        size={[1.95, 0.88, 0.05]}
        color="#e9e6cb"
      />
      {[
        [-2.35, 0.7],
        [-1.75, 0.95],
        [-1.13, 0.52],
      ].map(([x, h], i) => (
        <Block
          key={i}
          at={[x, 1.25 + h / 2, -1.81]}
          size={[0.7, h, 0.04]}
          color={i % 2 ? '#aab596' : '#8c9c7c'}
        />
      ))}
      <mesh position={[-1.13, 2.42, -1.77]}>
        <circleGeometry args={[0.19, 16]} />
        <meshBasicMaterial color="#d5bd7f" />
      </mesh>
      {[-2.77, -0.53, -1.65].map((x) => (
        <Block
          key={x}
          at={[x, 1.8, -1.69]}
          size={[0.1, 2.2, 0.14]}
          color="#b5a17b"
        />
      ))}
      {[0.73, 1.8, 2.87].map((y) => (
        <Block
          key={y}
          at={[-1.65, y, -1.69]}
          size={[2.34, 0.1, 0.14]}
          color="#b5a17b"
        />
      ))}
      <Block
        at={[-1.65, 0.69, -1.55]}
        size={[2.55, 0.13, 0.52]}
        color="#c2ad87"
      />
      <Block at={[0.2, 0.05, 0.3]} size={[5.2, 0.22, 2.75]} color="#b49a75" />
      <Block at={[0.2, 0.19, 0.3]} size={[5.28, 0.08, 2.82]} color="#cdb68e" />
      {[-2, 2.4].flatMap((x) =>
        [-0.7, 1.3].map((z) => (
          <Block
            key={`${x}${z}`}
            at={[x, -0.4, z]}
            size={[0.18, 0.85, 0.18]}
            color="#967b59"
          />
        )),
      )}
      <group position={[-0.75, mode === 0 ? 0.09 : 0, 0]}>
        <Block at={[0, 0.29, 0.12]} size={[1.8, 0.1, 1.15]} color="#727961" />
        <Block at={[0, 0.9, -0.39]} size={[1.8, 1.2, 0.12]} color="#666951" />
        <Block at={[0, 0.93, -0.31]} size={[1.6, 0.98, 0.02]} color="#eee8d7" />
        {[0.9, 0.6, 1.05, 0.72, 0.45].map((w, i) => (
          <Block
            key={i}
            at={[-0.6 + w / 2, 1.25 - i * 0.15, -0.29]}
            size={[w, 0.035, 0.015]}
            color={i % 2 ? '#a77758' : '#7f906b'}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <Block
            key={i}
            at={[0, 0.35, -0.13 + i * 0.16]}
            size={[1.45, 0.015, 0.09]}
            color="#a6ad93"
          />
        ))}
        <Block at={[0, 0.35, 0.53]} size={[0.5, 0.02, 0.2]} color="#c2c8ae" />
        {label(0, [0, 1.88, -0.25])}
      </group>
      <group
        position={[1.02, mode === 1 ? 0.09 : 0, 0.82]}
        rotation={[0, -0.13, 0]}
      >
        <Block at={[0, 0.29, 0]} size={[1.37, 0.075, 0.96]} color="#a37858" />
        <Block at={[0, 0.34, 0]} size={[1.29, 0.035, 0.9]} color="#fff5dc" />
        <Block at={[0, 0.365, 0]} size={[0.025, 0.015, 0.87]} color="#c8b99e" />
        {[0.12, 0.28, 0.43].map((h, i) => (
          <Block
            key={i}
            at={[0.16 + i * 0.14, 0.368, 0.15 - h / 2]}
            size={[0.075, 0.015, h]}
            color="#879570"
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <Block
            key={i}
            at={[-0.32, 0.368, -0.26 + i * 0.14]}
            size={[0.4, 0.015, 0.022]}
            color="#b5a992"
          />
        ))}
        <Block
          at={[0.81, 0.32, 0.1]}
          size={[0.04, 0.04, 0.78]}
          rotation={[0, -0.25, 0]}
          color="#b38e49"
        />
        {label(1, [0.08, 0.5, 1.05])}
      </group>
      <group position={[1.62, mode === 2 ? 0.09 : 0, -0.52]}>
        <Block at={[0, 0.56, 0]} size={[0.95, 0.63, 0.85]} color="#bc976e" />
        <Block at={[0, 0.885, 0]} size={[0.16, 0.025, 0.87]} color="#e7d4ac" />
        <Block
          at={[0, 0.6, 0.435]}
          size={[0.44, 0.23, 0.015]}
          color="#f6e9cc"
        />
        {label(2, [0.1, 1.4, -0.15])}
      </group>
      <mesh position={[-2, 0.46, -0.57]} castShadow>
        <cylinderGeometry args={[0.25, 0.19, 0.46, 8]} />
        <meshStandardMaterial color="#ab785b" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            -2 + Math.cos(i * 2.4) * 0.2,
            0.92 + (i % 2) * 0.13,
            -0.57 + Math.sin(i * 2.4) * 0.2,
          ]}
          rotation={[0.3 * i, 0, i * 0.6]}
          castShadow
        >
          <boxGeometry args={[0.2, 0.5, 0.08]} />
          <meshStandardMaterial color={i % 2 ? '#8f9b72' : '#6d805c'} />
        </mesh>
      ))}
      <mesh position={[-1.92, 0.45, 0.88]} castShadow>
        <cylinderGeometry args={[0.2, 0.17, 0.39, 12]} />
        <meshStandardMaterial color="#f1e6ce" />
      </mesh>
      <mesh position={[-1.92, 0.65, 0.88]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.165, 16]} />
        <meshStandardMaterial color="#73543b" />
      </mesh>
      <mesh position={[-1.68, 0.46, 0.88]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.12, 0.04, 6, 12]} />
        <meshStandardMaterial color="#f1e6ce" />
      </mesh>
      <Block at={[1.62, 2, -1.94]} size={[1.9, 1.28, 0.15]} color="#b59970" />
      <Block
        at={[1.2, 2.08, -1.83]}
        size={[0.53, 0.67, 0.025]}
        color="#ede1c5"
        rotation={[0, 0, 0.07]}
      />
      <Block
        at={[1.92, 1.95, -1.83]}
        size={[0.55, 0.56, 0.025]}
        color="#c2c9aa"
        rotation={[0, 0, -0.08]}
      />
      {[1.2, 1.92].map((x) => (
        <Block
          key={x}
          at={[x, 2.28, -1.79]}
          size={[0.07, 0.07, 0.025]}
          color="#976b49"
        />
      ))}
    </group>
  );
}
export default function SystemScene(props: SceneProps) {
  return (
    <Canvas
      aria-label="Interactive 3D workspace: laptop, notebook and delivery parcel"
      shadows={!props.compact}
      dpr={[1, 1.5]}
      camera={{ position: [7, 6.3, 9], fov: 36 }}
      frameloop={!props.visible ? 'never' : props.reduced ? 'demand' : 'always'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      onCreated={({ gl, camera }) => {
        camera.lookAt(0, 0.45, 0);
        gl.domElement.addEventListener('webglcontextlost', props.onFailure, {
          once: true,
        });
      }}
    >
      <ambientLight intensity={1.65} color="#fff1d4" />
      <directionalLight
        position={[-3, 7, 5]}
        intensity={2.5}
        color="#fff0cc"
        castShadow={!props.compact}
        shadow-mapSize={[1024, 1024]}
        shadow-normalBias={0.04}
      />
      <directionalLight position={[5, 3, -1]} intensity={0.7} color="#e7ead8" />
      <Desk {...props} />
    </Canvas>
  );
}
