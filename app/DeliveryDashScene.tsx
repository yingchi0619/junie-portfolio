'use client';
/* oxlint-disable react/react-compiler -- Three.js objects intentionally mutate within the renderer frame loop. */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  DashGame,
  START,
  ROADS,
  point,
  layout,
  routeSamples,
  type Point,
} from './delivery-dash-logic';

export const anchor = (node: number): Point => {
  const p = point(node);
  return {
    x: p.x + 0.98,
    z: p.z - 0.98,
  };
};
type Props = {
  game: DashGame;
  active: boolean;
  reduced: boolean;
  compact: boolean;
  onReady: () => void;
  onFail: () => void;
};
const ICE = '#b5eaff',
  GOLD = '#ffd382';
function Box({
  at,
  size,
  color,
  emission = 0,
}: {
  at: [number, number, number];
  size: [number, number, number];
  color: string;
  emission?: number;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.57}
        metalness={0.15}
        emissive={color}
        emissiveIntensity={emission}
      />
    </mesh>
  );
}
function Building({
  node,
  game,
  kind = 'target',
}: {
  node: number;
  game: DashGame;
  kind?: 'target' | 'warehouse' | 'cafe' | 'express' | 'ambient';
}) {
  const p = anchor(node),
    body = useRef<THREE.Group>(null),
    windows = useRef<THREE.Group>(null),
    beacon = useRef<THREE.Mesh>(null),
    ring = useRef<THREE.Mesh>(null),
    height =
      kind === 'warehouse'
        ? 0.9
        : kind === 'cafe'
          ? 0.7
          : 1.05 + (node % 4) * 0.39;
  useFrame(() => {
    const delivered =
        game.phase === 'level' ||
        game.delivered.has(node) ||
        (kind === 'express' && game.expressCollected),
      e = game.events.find((v) => v.node === node),
      age = e ? game.clock - e.time : 100;
    if (windows.current)
      windows.current.children.forEach((m, i) => {
        const mat = (m as THREE.Mesh).material as THREE.MeshStandardMaterial;
        const lit = delivered && age > Math.floor(i / 3) * 0.12;
        const targetGlow =
          kind === 'target' &&
          (!game.tutorial ||
            game.phase === 'preview' ||
            node === game.config.targets[0]);
        mat.color.set(lit ? '#ffd382' : targetGlow ? '#a3e2f7' : '#294451');
        mat.emissive.set(lit ? GOLD : '#497282');
        mat.emissiveIntensity = lit ? 2.3 : targetGlow ? 0.8 : 0.12;
      });
    const planned = game.route.includes(node),
      gold = kind === 'express',
      active =
        (kind === 'target' &&
          (!game.tutorial ||
            game.phase === 'preview' ||
            node === game.config.targets[0])) ||
        kind === 'warehouse' ||
        (gold && game.expressActive);
    if (beacon.current) {
      beacon.current.visible = active && !delivered;
      beacon.current.position.y = height + 0.3;
      const mat = beacon.current.material as THREE.MeshBasicMaterial;
      mat.color.set(gold ? GOLD : planned ? '#ffffff' : ICE);
    }
    if (ring.current) {
      ring.current.visible = active || delivered;
      const mat = ring.current.material as THREE.MeshBasicMaterial;
      mat.color.set(gold || delivered ? GOLD : ICE);
      mat.opacity = planned ? 1 : delivered ? 0.7 : 0.55;
      ring.current.scale.setScalar(planned ? 1.2 : 1);
    }
    if (body.current)
      body.current.position.y =
        age < 0.5 ? Math.sin((age / 0.5) * Math.PI) * 0.12 : 0;
  });
  const n = point(node),
    rows = kind === 'warehouse' ? 1 : Math.max(2, Math.floor(height / 0.4));
  return (
    <group>
      <mesh
        ref={ring}
        position={[n.x, 0.045, n.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.41, 0.49, 32]} />
        <meshBasicMaterial
          color={ICE}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
      <group ref={body} position={[0, 0, 0]}>
        <Box at={[p.x, 0.07, p.z]} size={[1.56, 0.15, 1.56]} color="#314755" />
        <Box
          at={[p.x, height / 2 + 0.15, p.z]}
          size={[
            kind === 'warehouse' ? 1.42 : 1.16,
            height,
            kind === 'warehouse' ? 1.35 : 1.16,
          ]}
          color={
            kind === 'warehouse'
              ? '#76939f'
              : kind === 'cafe'
                ? '#927760'
                : kind === 'ambient'
                  ? '#213541'
                  : node % 2
                    ? '#5a737e'
                    : '#425e6b'
          }
        />
        <Box
          at={[p.x, height + 0.2, p.z]}
          size={[1.27, 0.12, 1.27]}
          color="#a0bbc3"
        />
        {node % 3 === 0 && kind !== 'warehouse' && (
          <Box
            at={[p.x - 0.25, height + 0.36, p.z + 0.17]}
            size={[0.48, 0.22, 0.45]}
            color="#516d7a"
          />
        )}
        <group ref={windows}>
          {Array.from({ length: rows * 3 }, (_, i) => (
            <mesh
              key={i}
              position={[
                p.x - 0.37 + (i % 3) * 0.37,
                0.44 + Math.floor(i / 3) * 0.34,
                p.z + 0.587,
              ]}
            >
              <planeGeometry args={[0.2, 0.18]} />
              <meshStandardMaterial
                color="#9baeb1"
                emissive="#497282"
                emissiveIntensity={0.15}
              />
            </mesh>
          ))}
          {Array.from({ length: rows * 2 }, (_, i) => (
            <mesh
              key={`side${i}`}
              position={[
                p.x + 0.587,
                0.44 + Math.floor(i / 2) * 0.34,
                p.z - 0.27 + (i % 2) * 0.5,
              ]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <planeGeometry args={[0.22, 0.18]} />
              <meshStandardMaterial
                color="#9baeb1"
                emissive="#497282"
                emissiveIntensity={0.15}
              />
            </mesh>
          ))}
        </group>
        {kind === 'warehouse' && (
          <>
            <Box
              at={[p.x, 0.45, p.z + 0.68]}
              size={[0.8, 0.58, 0.025]}
              color="#142c3a"
            />
            <Box
              at={[p.x, 0.98, p.z + 0.69]}
              size={[0.72, 0.13, 0.04]}
              color={ICE}
              emission={1.5}
            />
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                at={[p.x - 0.55 + i * 0.33, 0.28, p.z + 0.92]}
                size={[0.23, 0.24, 0.23]}
                color="#d9b183"
              />
            ))}
          </>
        )}
        {kind === 'cafe' && (
          <>
            <Box
              at={[p.x, 0.88, p.z + 0.7]}
              size={[1.2, 0.13, 0.4]}
              color="#d8a476"
            />
            <mesh position={[p.x, height + 0.46, p.z]}>
              <cylinderGeometry args={[0.17, 0.13, 0.28, 10]} />
              <meshStandardMaterial color="#f2debc" />
            </mesh>
          </>
        )}
        <mesh
          ref={beacon}
          position={[p.x, height + 0.36, p.z]}
          rotation={[0, 0, Math.PI / 4]}
        >
          <octahedronGeometry args={[0.16, 0]} />
          <meshBasicMaterial color={kind === 'express' ? GOLD : ICE} />
        </mesh>
      </group>
    </group>
  );
}
function Road({
  a,
  b,
  keyId,
  game,
}: {
  a: number;
  b: number;
  keyId: string;
  game: DashGame;
}) {
  const x = point(a),
    z = point(b),
    closed = game.config.closed.includes(keyId),
    stripe = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (stripe.current) {
      const mat = stripe.current.material as THREE.MeshBasicMaterial;
      mat.color.set(game.trafficRed(keyId) ? '#d5736c' : '#70c5d6');
      mat.opacity = 0.65;
    }
  });
  return (
    <group>
      <mesh
        position={[(x.x + z.x) / 2, 0.013, (x.z + z.z) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry
          args={[x.x === z.x ? 0.9 : 3.02, x.x === z.x ? 3.02 : 0.9]}
        />
        <meshStandardMaterial color="#0d202c" roughness={0.95} />
      </mesh>
      {[0.2, 0.5, 0.8].map((t, i) => (
        <mesh
          key={i}
          position={[x.x + (z.x - x.x) * t, 0.025, x.z + (z.z - x.z) * t]}
          rotation={[-Math.PI / 2, 0, x.x === z.x ? 0 : Math.PI / 2]}
        >
          <planeGeometry args={[0.025, 0.18]} />
          <meshBasicMaterial color="#789da9" transparent opacity={0.7} />
        </mesh>
      ))}
      {game.config.traffic.includes(keyId) && (
        <mesh
          ref={stripe}
          position={[(x.x + z.x) / 2, 0.027, (x.z + z.z) / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry
            args={[x.x === z.x ? 0.75 : 2.8, x.x === z.x ? 2.8 : 0.75]}
          />
          <meshBasicMaterial color="#d5736c" transparent opacity={0.6} />
        </mesh>
      )}
      {closed && (
        <group
          position={[(x.x + z.x) / 2, 0, (x.z + z.z) / 2]}
          rotation={[0, x.x === z.x ? 0 : Math.PI / 2, 0]}
        >
          <Box at={[0, 0.27, 0]} size={[1, 0.15, 0.16]} color="#ffb07d" />
          {[-0.38, 0.38].map((n) => (
            <group key={n}>
              <Box
                at={[n, 0.14, 0]}
                size={[0.08, 0.28, 0.08]}
                color="#cc8761"
              />
              <mesh position={[n, 0.1, 0.28]}>
                <coneGeometry args={[0.12, 0.27, 8]} />
                <meshStandardMaterial color="#df9167" />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}
function Route({ game, reduced }: { game: DashGame; reduced: boolean }) {
  const geometry = useMemo(() => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6000 * 3), 3).setUsage(THREE.DynamicDrawUsage));
      g.setDrawRange(0, 0);
      return g;
    }, []),
    pipe = useRef<THREE.Mesh>(null),
    sampleCount = useRef(0),
    line = useMemo(
      () =>
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: ICE,
            transparent: true,
            opacity: 0.8,
          }),
        ),
      [geometry],
    ),
    flow = useRef<THREE.Group>(null),
    last = useRef('');
  useEffect(
    () => () => {
      geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [geometry, line],
  );
  useFrame(() => {
    const key = game.route.join('/');
    if (key !== last.current) {
      last.current = key;
      const samples = game.route.length > 1 ? routeSamples(game.route) : [];
      const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
      samples.forEach((p, i) => attr.setXYZ(i, p.x, 0.085, p.z));
      attr.needsUpdate = true;
      sampleCount.current = samples.length;
      geometry.setDrawRange(0, samples.length);
      if (pipe.current) {
        pipe.current.geometry.dispose();
        pipe.current.geometry = samples.length > 1
          ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(samples.map(p => new THREE.Vector3(p.x, .08, p.z))), Math.min(260, samples.length), .033, 5, false)
          : new THREE.BufferGeometry();
      }
      geometry.computeBoundingSphere();
    }
    line.visible = game.route.length > 1;
    if (pipe.current) pipe.current.visible = line.visible;
    if (flow.current) {
      const attr = geometry.getAttribute('position');
      flow.current.visible = line.visible;
      if (sampleCount.current)
        flow.current.children.forEach((dot, i) => {
          const n = Math.floor(
            ((i / 18 + (reduced ? 0 : game.clock * 0.13)) % 1) *
              (sampleCount.current - 1),
          );
          dot.position.set(attr.getX(n), 0.085, attr.getZ(n));
        });
    }
  });
  return (
    <>
      <primitive object={line} />
      <mesh ref={pipe}><bufferGeometry /><meshBasicMaterial color={ICE} /></mesh>
      <group ref={flow}>
        {Array.from({ length: 18 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshBasicMaterial color={ICE} />
          </mesh>
        ))}
      </group>
    </>
  );
}
function Truck({ game, reduced }: { game: DashGame; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null),
    trails = useRef<THREE.Group>(null),
    history = useRef<Point[]>([]);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.set(game.van.x, 0.12, game.van.z);
    ref.current.rotation.y = game.heading;
    history.current.unshift({ ...game.van });
    history.current.length = Math.min(24, history.current.length);
    if (trails.current) {
      trails.current.visible = game.boostUntil > game.clock && !reduced;
      trails.current.children.forEach((m, i) => {
        const p = history.current[Math.min(i * 2, history.current.length - 1)];
        if (p) m.position.set(p.x, 0.09, p.z);
        m.scale.setScalar(1 - i / 14);
      });
    }
  });
  return (
    <>
      <group ref={ref}>
        <Box at={[0, 0.22, 0]} size={[0.48, 0.3, 0.9]} color="#a6d9ef" />
        <Box at={[0, 0.44, -0.18]} size={[0.46, 0.3, 0.5]} color="#d6edf6" />
        <Box at={[0, 0.36, 0.3]} size={[0.44, 0.23, 0.28]} color="#74b1ca" />
        <Box at={[0, 0.42, 0.451]} size={[0.34, 0.16, 0.018]} color="#112d3f" />
        <Box
          at={[0, 0.19, 0.47]}
          size={[0.42, 0.06, 0.04]}
          color="#ebc889"
          emission={0.7}
        />
        {[-0.26, 0.26].flatMap((x) =>
          [-0.29, 0.29].map((z) => (
            <mesh
              key={`${x}${z}`}
              position={[x, 0.12, z]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
              <meshStandardMaterial color="#101b23" />
            </mesh>
          )),
        )}
        <Box
          at={[0.242, 0.39, -0.15]}
          size={[0.012, 0.12, 0.21]}
          color="#609ab4"
        />
      </group>
      <group ref={trails}>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.14, 10]} />
            <meshBasicMaterial
              color={ICE}
              transparent
              opacity={0.3 * (1 - i / 12)}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
function Parcels({ game, reduced }: { game: DashGame; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    group.current?.children.forEach((m, i) => {
      const e = game.events[i],
        age = e ? game.clock - e.time : 99;
      m.visible = !!e && age < 0.7;
      if (e && age < 0.7) {
        const t = age / 0.7,
          a = anchor(e.node);
        m.position.set(
          e.from.x + (a.x - e.from.x) * t,
          0.45 + (reduced ? 0 : Math.sin(t * Math.PI) * 1.2),
          e.from.z + (a.z - e.from.z) * t,
        );
        m.rotation.set(t * 4, t * 3, 0);
        const mat = (m as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.color.set(e.gold ? GOLD : ['#ffd28a', '#9ce5ed', '#e7b4a0'][i % 3]);
        m.scale.setScalar(1 - t * 0.6);
      }
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} visible={false}>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshStandardMaterial
            color={GOLD}
            emissive={GOLD}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
function Rain({ game, reduced }: { game: DashGame; reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null),
    dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.visible = game.level === 2 && !reduced;
    if (!ref.current.visible) return;
    for (let i = 0; i < 50; i++) {
      dummy.position.set(
        ((i * 37) % 140) / 10 - 7,
        3 - ((game.clock * 3 + i * 0.37) % 3.2),
        ((i * 53) % 140) / 10 - 7,
      );
      dummy.rotation.z = -0.12;
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 50]}>
      <cylinderGeometry args={[0.006, 0.006, 0.2, 3]} />
      <meshBasicMaterial color="#a5cddd" transparent opacity={0.23} />
    </instancedMesh>
  );
}
function World({
  game,
  reduced,
  compact,
  onReady,
}: Omit<Props, 'onFail' | 'active'>) {
  const { camera, size, gl } = useThree(),
    key = game.level;
  useLayoutEffect(() => {
    const cam = camera as THREE.OrthographicCamera,
      l = layout(size.width, size.height);
    cam.left = -size.width / (2 * l.scale);
    cam.right = -cam.left;
    cam.top = l.cy / l.scale;
    cam.bottom = -(size.height - l.cy) / l.scale;
    cam.position.set(12, 22.627417, 12);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    onReady();
  }, [camera, size, onReady]);
  useEffect(() => {
    gl.setClearColor('#091620');
  }, [gl]);
  useFrame((_, dt) => {
    const desired =
      game.phase === 'driving' && !reduced
        ? { x: game.van.x * 0.045, z: game.van.z * 0.045 }
        : { x: 0, z: 0 };
    const k = Math.min(1, dt * 4);
    game.camera.x += (desired.x - game.camera.x) * k;
    game.camera.z += (desired.z - game.camera.z) * k;
    camera.position.set(12 + game.camera.x, 22.627417, 12 + game.camera.z);
    camera.lookAt(game.camera.x, 0, game.camera.z);
    const cam = camera as THREE.OrthographicCamera;
    const zoom =
      !reduced && game.level === 2 ? (game.phase === 'level' ? 1.065 : game.finalApproach && game.phase === 'driving' ? 1.04 : 1) : 1;
    cam.zoom += (zoom - cam.zoom) * k;
    cam.updateProjectionMatrix();
  });
  const extras = (() =>
    [0, 1, 3, 6, 8, 11, 12, 16, 17, 18, 22, 24]
      .filter(
        (n) =>
          !game.config.targets.includes(n) &&
          n !== game.config.coffee &&
          n !== game.expressNode &&
          n !== START,
      )
      .slice(0, compact ? 5 : 9))();
  return (
    <>
      <ambientLight intensity={1.15} color="#bfd4e3" />
      <hemisphereLight args={['#c5ddeb', '#1d3b34', 1.1]} />
      <directionalLight
        position={[-5, 13, 7]}
        color="#ffe4bc"
        intensity={3.1}
        castShadow={!compact}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-normalBias={0.04}
      />
      <directionalLight position={[8, 4, -9]} color="#8bccf0" intensity={2} />
      <fog attach="fog" args={['#091620', 31, 52]} />
      <Box at={[0, -0.25, 0]} size={[16, 0.48, 16]} color="#1d3540" />
      <Box at={[0, -0.53, 0]} size={[16.15, 0.08, 16.15]} color="#294859" />
      <group key={key}>
        {ROADS.map((r) => (
          <Road key={r.key} a={r.a} b={r.b} keyId={r.key} game={game} />
        ))}
        <Building node={START} game={game} kind="warehouse" />
        {game.config.targets.map((n) => (
          <Building key={n} node={n} game={game} />
        ))}
        {extras.map((n) => (
          <Building key={`a${n}`} node={n} game={game} kind="ambient" />
        ))}
        {game.config.coffee >= 0 && (
          <Building node={game.config.coffee} game={game} kind="cafe" />
        )}
        {key === 2 && (
          <Building node={game.expressNode} game={game} kind="express" />
        )}
        {Array.from({ length: compact ? 8 : 16 }, (_, i) => {
          const x = (i % 4) * 3 - 4.1,
            z = Math.floor(i / 4) * 3 - 4.5;
          return (
            <group key={`tree${i}`} position={[x, 0, z]}>
              <mesh position={[0, 0.26, 0]}>
                <cylinderGeometry args={[0.035, 0.045, 0.5, 5]} />
                <meshStandardMaterial color="#8b8470" />
              </mesh>
              <mesh position={[0, 0.62, 0]} castShadow>
                <icosahedronGeometry args={[0.27, 0]} />
                <meshStandardMaterial color={i % 2 ? '#4c7970' : '#668575'} />
              </mesh>
            </group>
          );
        })}
      </group>
      <Route game={game} reduced={reduced} />
      <Truck game={game} reduced={reduced} />
      <Parcels game={game} reduced={reduced} />
      <Rain game={game} reduced={reduced} />
    </>
  );
}
export default function DeliveryDashScene(props: Props) {
  const { active, compact, onFail } = props;
  return (
    <Canvas
      orthographic
      dpr={compact ? 1 : [1, 1.5]}
      shadows={!compact}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [12, 22.627417, 12], near: 0.1, far: 100 }}
      gl={{ antialias: !compact, alpha: false, powerPreference: 'low-power' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', onFail, {
          once: true,
        });
      }}
    >
      <World {...props} />
    </Canvas>
  );
}
