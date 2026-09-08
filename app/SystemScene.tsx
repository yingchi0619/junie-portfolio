'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Edges,
  Environment,
  Html,
  Lightformer,
  Line,
  RoundedBox,
} from '@react-three/drei';
import { useMemo, useRef, type RefObject } from 'react';
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
const labels = ['Build', 'Analyze', 'Operate'];
const layouts = [
  [
    [-2.3, 0.85, 0],
    [1.9, 1.25, -0.5],
    [1.85, -1.2, 0.8],
  ],
  [
    [-1.9, -0.8, -0.5],
    [0, 2, 0],
    [2, -0.65, 0.8],
  ],
  [
    [-2.05, 1.1, 0.3],
    [2.1, 0.9, -0.4],
    [0, -1.85, 1],
  ],
];
function System({ mode, onMode, reduced, compact, gesture }: SceneProps) {
  const whole = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Group | null)[]>([]);
  const packets = useRef<(THREE.Mesh | null)[]>([]);
  const paths = useMemo(
    () =>
      layouts[mode].map(
        (p) =>
          new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(p[0] * 0.4, p[1] * 1.2, 1.4),
            new THREE.Vector3(...p),
          ),
      ),
    [mode],
  );
  useFrame(({ clock }, dt) => {
    if (reduced) return;
    const d = Math.min(dt, 0.05);
    const g = gesture.current;
    if (whole.current) {
      whole.current.rotation.x = THREE.MathUtils.damp(
        whole.current.rotation.x,
        g.y + g.hoverY,
        5,
        d,
      );
      whole.current.rotation.y = THREE.MathUtils.damp(
        whole.current.rotation.y,
        g.x + g.hoverX,
        5,
        d,
      );
    }
    if (core.current) {
      core.current.rotation.y = clock.elapsedTime * 0.13;
      core.current.position.y = Math.sin(clock.elapsedTime * 0.65) * 0.06;
    }
    if (orbit.current)
      orbit.current.rotation.z = THREE.MathUtils.damp(
        orbit.current.rotation.z,
        mode * 0.65,
        3,
        d,
      );
    nodeRefs.current.forEach((node, i) => {
      if (node)
        node.position.lerp(
          new THREE.Vector3(...layouts[mode][i]),
          1 - Math.exp(-5 * d),
        );
    });
    packets.current.forEach((packet, i) => {
      if (packet)
        packet.position.copy(
          paths[i % 3].getPoint(
            (clock.elapsedTime * 0.16 + Math.floor(i / 3) * 0.35) % 1,
          ),
        );
    });
  });
  return (
    <group ref={whole} rotation={[-0.08, 0, -0.1]}>
      <group ref={core}>
        <RoundedBox
          args={[1.45, 1.45, 1.45]}
          radius={0.16}
          smoothness={3}
          rotation={[0.4, 0.55, 0.25]}
        >
          <meshPhysicalMaterial
            color="#b9d8e7"
            metalness={0.25}
            roughness={0.12}
            transparent
            opacity={0.52}
            transmission={compact ? 0 : 0.45}
            thickness={0.8}
            clearcoat={1}
          />
          <Edges color="#c3e8ff" threshold={25} />
        </RoundedBox>
        <mesh rotation={[0.4, 0.55, 0.25]}>
          <octahedronGeometry args={[0.66, 0]} />
          <meshStandardMaterial
            color="#b8e5ff"
            metalness={0.8}
            roughness={0.19}
          />
        </mesh>
      </group>
      <group ref={orbit} rotation={[0.35, 0.4, reduced ? mode * 0.65 : 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[i * 0.85, 0.4 + i * 0.4, i * 0.7]}>
            <torusGeometry
              args={[
                1.25 + i * 0.18,
                i === 0 ? 0.025 : 0.012,
                8,
                compact ? 64 : 100,
              ]}
            />
            <meshStandardMaterial
              color={i === 0 ? '#b1dfff' : '#687e8b'}
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>
        ))}
      </group>
      {paths.map((curve, i) => (
        <Line
          key={`${mode}-${i}`}
          points={curve.getPoints(40)}
          color={mode === i ? '#bee7ff' : '#435966'}
          transparent
          opacity={0.65}
          lineWidth={mode === i ? 1.3 : 0.7}
        />
      ))}
      {Array.from({ length: compact ? 3 : 6 }, (_, i) => (
        <mesh
          key={i}
          ref={(r) => {
            packets.current[i] = r;
          }}
          position={paths[i % 3].getPoint(0.5)}
        >
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#dcf3ff" />
        </mesh>
      ))}
      {labels.map((label, i) => (
        <group
          key={label}
          ref={(r) => {
            nodeRefs.current[i] = r;
          }}
          position={
            reduced
              ? (layouts[mode][i] as [number, number, number])
              : (layouts[0][i] as [number, number, number])
          }
        >
          <mesh>
            <sphereGeometry args={[mode === i ? 0.115 : 0.075, 16, 16]} />
            <meshStandardMaterial
              color="#c9eaff"
              emissive="#80b9df"
              emissiveIntensity={mode === i ? 0.8 : 0.15}
              metalness={0.5}
              roughness={0.2}
            />
          </mesh>
          <Html center position={[0, -0.34, 0]} zIndexRange={[8, 1]}>
            <button
              className={`scene-node ${mode === i ? 'selected' : ''}`}
              onClick={() => onMode(i)}
              aria-pressed={mode === i}
              aria-label={`${label} node`}
            >
              <span>0{i + 1}</span>
              {label}
            </button>
          </Html>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.45, 0]}>
        <ringGeometry args={[2.3, 2.31, 80]} />
        <meshBasicMaterial
          color="#30434e"
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
export default function SystemScene(props: SceneProps) {
  return (
    <Canvas
      aria-label="Interactive 3D system core"
      dpr={props.compact ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 7.7], fov: 43 }}
      frameloop={!props.visible ? 'never' : props.reduced ? 'demand' : 'always'}
      gl={{
        alpha: true,
        antialias: !props.compact,
        powerPreference: 'low-power',
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', props.onFailure, {
          once: true,
        });
      }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={3} color="#d4edff" />
      <pointLight position={[-4, 0, 2]} intensity={16} color="#8ab9df" />
      <Environment resolution={64} frames={1}>
        <Lightformer position={[0, 4, 2]} scale={[6, 2, 1]} intensity={3} />
        <Lightformer
          position={[-4, 0, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3, 5, 1]}
          intensity={2}
        />
        <Lightformer position={[4, -2, 1]} scale={[2, 4, 1]} intensity={2} />
      </Environment>
      <System {...props} />
    </Canvas>
  );
}
