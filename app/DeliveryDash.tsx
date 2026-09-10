'use client';
/* oxlint-disable react/react-compiler -- The timed game loop intentionally coordinates related state from effects. */

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, RoundedBox } from '@react-three/drei';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import './delivery-dash.css';
import { deliveryDashTitle } from './delivery-dash-logic';

type Point = { x: number; y: number };
type Stop = Point & { id: number; express?: boolean };
type Phase =
  | 'preview'
  | 'tutorial'
  | 'playing'
  | 'driving'
  | 'paused'
  | 'level'
  | 'result';
type Lang = 'en' | 'zh';
const LEVELS = [
  {
    stops: [
      { x: 30, y: 28 },
      { x: 72, y: 35 },
      { x: 67, y: 72 },
    ],
    blocks: [] as Point[],
  },
  {
    stops: [
      { x: 24, y: 25 },
      { x: 50, y: 22 },
      { x: 76, y: 30 },
      { x: 28, y: 70 },
      { x: 72, y: 70 },
    ],
    blocks: [{ x: 51, y: 48 }],
    coffee: { x: 37, y: 50 },
  },
  {
    stops: [
      { x: 22, y: 24 },
      { x: 48, y: 22 },
      { x: 77, y: 28 },
      { x: 24, y: 69 },
      { x: 52, y: 74 },
      { x: 78, y: 66 },
    ],
    blocks: [{ x: 62, y: 47 }],
    coffee: { x: 36, y: 58 },
    rain: true,
  },
];
const C = {
  en: {
    k: '01 / INTERACTIVE EXPERIENCE',
    syn: 'SYNTHETIC · NO COMPANY DATA',
    tag: 'Draw. Drive. Deliver.',
    intro: 'Trace one smart route through a living miniature city.',
    start: 'Start Game',
    tutorial: 'Draw a route to the glowing building.',
    nice: 'Nice. Now connect them all.',
    score: 'Score',
    time: 'Time',
    fuel: 'Fuel',
    deliveries: 'Deliveries',
    drive: 'Drive Route',
    clear: 'Clear',
    level: 'LEVEL',
    complete: 'CITY COMPLETE',
    perfect: 'Perfect Route ×3',
    again: 'Play Again',
    hard: 'Hard Mode',
    built: 'See How I Built It',
    helper:
      'Start at the warehouse, draw through the glowing buildings, then release.',
    explain:
      'You just solved a simplified last-mile routing problem: connecting multiple destinations while balancing distance, time and changing road conditions.',
    scenic: 'You delivered everything. The scenic route was… ambitious.',
  },
  zh: {
    k: '01 / 互动体验',
    syn: '合成体验 · 不含公司数据',
    tag: '画路线。开车。送达。',
    intro: '在一座会呼吸的微缩城市里，画出一条聪明路线。',
    start: '开始游戏',
    tutorial: '从仓库画到发光建筑。',
    nice: '很好。现在把它们全部连起来。',
    score: '得分',
    time: '时间',
    fuel: '燃油',
    deliveries: '送达',
    drive: '出发',
    clear: '清除',
    level: '关卡',
    complete: '城市配送完成',
    perfect: '完美路线 ×3',
    again: '再玩一次',
    hard: '困难模式',
    built: '查看实现方式',
    helper: '从仓库出发，画线经过发光建筑，松手后车辆立即行驶。',
    explain:
      '你刚刚解决了一个简化的末端配送路线问题：在距离、时间和变化的道路状况之间连接多个目的地。',
    scenic: '全部送达。只是这条观光路线……很有雄心。',
  },
};
const d = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const pathLength = (p: Point[]) =>
  p.slice(1).reduce((n, v, i) => n + d(p[i], v), 0);
function City({
  level,
  stops,
  van,
  lit,
  trafficOpen,
  visible,
  reduced,
}: {
  level: number;
  stops: Stop[];
  van: Point;
  lit: number[];
  trafficOpen: boolean;
  visible: boolean;
  reduced: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (visible && ref.current && !reduced)
      ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 4) * 0.025;
  });
  const w = (p?: Point): [number, number, number] => [
    ((p?.x ?? 50) - 50) / 5,
    0.2,
    ((p?.y ?? 50) - 50) / 5,
  ];
  const blocks = useMemo(
    () =>
      Array.from({ length: reduced ? 20 : 40 }, (_, i) => ({
        x: ((i * 37) % 92) + 4,
        y: ((i * 53) % 88) + 6,
        h: 0.5 + ((i * 17) % 9) / 8,
      })).filter(
        (b) => d(b, { x: 50, y: 50 }) > 13 && stops.every((s) => d(b, s) > 10),
      ),
    [stops, reduced],
  );
  return (
    <>
      <color attach="background" args={['#07131a']} />
      <fog attach="fog" args={['#07131a', 10, 22]} />
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[4, 10, 5]}
        intensity={2.2}
        color="#d8efff"
        castShadow={!reduced}
      />
      <pointLight
        position={[0, 3, 0]}
        intensity={25}
        color="#9ddcff"
        distance={10}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#0b1d25" roughness={0.92} />
      </mesh>
      {[-6, -3, 0, 3, 6].map((n) => (
        <group key={n}>
          <mesh position={[n, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.72, 20]} />
            <meshStandardMaterial color="#18313b" />
          </mesh>
          <mesh position={[0, 0.014, n]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[20, 0.72]} />
            <meshStandardMaterial color="#18313b" />
          </mesh>
        </group>
      ))}
      {blocks.map((b, i) => (
        <group key={i} position={w(b)}>
          <RoundedBox
            args={[0.72, b.h, 0.72]}
            radius={0.05}
            position={[0, b.h / 2, 0]}
            castShadow
          >
            <meshStandardMaterial color="#17313b" metalness={0.15} />
          </RoundedBox>
        </group>
      ))}
      <group position={w({ x: 50, y: 50 })}>
        <RoundedBox
          args={[1.7, 0.65, 1.5]}
          radius={0.08}
          position={[0, 0.32, 0]}
        >
          <meshStandardMaterial color="#325464" metalness={0.35} />
        </RoundedBox>
        <pointLight
          position={[0, 1.1, 0]}
          intensity={12}
          color="#aee5ff"
          distance={4}
        />
      </group>
      {stops.map((s) => (
        <group key={s.id} position={w(s)}>
          <RoundedBox
            args={[1.05, 1.5 + (s.id % 3) * 0.25, 1.05]}
            radius={0.06}
            position={[0, 0.75, 0]}
            castShadow
          >
            <meshStandardMaterial
              color={
                s.express
                  ? '#a47a2d'
                  : lit.includes(s.id)
                    ? '#587066'
                    : '#1d3b46'
              }
              emissive={
                s.express
                  ? '#ffc85a'
                  : lit.includes(s.id)
                    ? '#ffd27a'
                    : '#163744'
              }
              emissiveIntensity={s.express || lit.includes(s.id) ? 1.8 : 0.25}
            />
          </RoundedBox>
          <pointLight
            position={[0, 1.4, 0]}
            intensity={s.express ? 14 : lit.includes(s.id) ? 10 : 4}
            color={s.express ? '#ffd36c' : '#c0ebff'}
            distance={3}
          />
        </group>
      ))}
      {LEVELS[level].blocks.map((b, i) => (
        <group key={`b${i}`} position={w(b)}>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[2.2, 0.4, 0.7]} />
            <meshStandardMaterial color="#8b4938" />
          </mesh>
        </group>
      ))}
      {level === 2 && (
        <mesh position={[0, 0.04, 3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 0.75]} />
          <meshBasicMaterial
            color={trafficOpen ? '#2a6672' : '#7f3435'}
            transparent
            opacity={0.72}
          />
        </mesh>
      )}
      <group ref={ref} position={w(van)}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[0.72, 0.48, 1.05]} />
          <meshStandardMaterial color="#c9edff" metalness={0.45} />
        </mesh>
        <mesh position={[0, 0.58, -0.08]}>
          <boxGeometry args={[0.65, 0.34, 0.55]} />
          <meshStandardMaterial color="#5e94a8" />
        </mesh>
      </group>
      {LEVELS[level].coffee && (
        <Float speed={1.2} floatIntensity={0.15}>
          <group position={w(LEVELS[level].coffee!)}>
            <mesh>
              <cylinderGeometry args={[0.25, 0.2, 0.45, 16]} />
              <meshStandardMaterial color="#d89d69" />
            </mesh>
            <pointLight
              position={[0, 0.7, 0]}
              intensity={5}
              color="#ffb86b"
              distance={2}
            />
          </group>
        </Float>
      )}
      <Environment preset="city" />
    </>
  );
}

export default function DeliveryDash({
  onSeeProject,
}: {
  onSeeProject: () => void;
}) {
  const reduced = !!useReducedMotion(),
    root = useRef<HTMLElement>(null),
    board = useRef<HTMLDivElement>(null);
  const deliveredRef = useRef(new Set<number>());
  const [lang, setLang] = useState<Lang>('en');
  const t = C[lang];
  const [phase, setPhase] = useState<Phase>('preview'),
    [level, setLevel] = useState(0),
    [hard, setHard] = useState(false),
    [time, setTime] = useState(65),
    [fuel, setFuel] = useState(100),
    [score, setScore] = useState(0),
    [path, setPath] = useState<Point[]>([]),
    [van, setVan] = useState<Point>({ x: 50, y: 50 }),
    [delivered, setDelivered] = useState<number[]>([]),
    [combo, setCombo] = useState(0),
    [bestCombo, setBestCombo] = useState(0),
    [expressHit, setExpressHit] = useState(false),
    [expressLive, setExpressLive] = useState(false),
    [coffee, setCoffee] = useState(false),
    [notice, setNotice] = useState(''),
    [drawing, setDrawing] = useState(false),
    [visible, setVisible] = useState(true),
    [sound, setSound] = useState(true),
    [trafficOpen, setTrafficOpen] = useState(false),
    [totalRoute, setTotalRoute] = useState(0),
    [repeats, setRepeats] = useState(0),
    [completedCount, setCompletedCount] = useState(0),
    [invalid, setInvalid] = useState(false),
    [webgl, setWebgl] = useState(true);
  const stops = useMemo<Stop[]>(
    () =>
      LEVELS[level].stops.map((p, id) => ({
        ...p,
        id,
        express: level === 2 && id === 5 && expressLive,
      })),
    [level, expressLive],
  );
  const beep = useCallback(
    (f = 600) => {
      if (!sound) return;
      const a = new AudioContext(),
        o = a.createOscillator(),
        g = a.createGain();
      o.frequency.value = f;
      g.gain.value = 0.025;
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.13);
      o.connect(g).connect(a.destination);
      o.start();
      o.stop(a.currentTime + 0.13);
    },
    [sound],
  );
  const reset = useCallback((hm = false) => {
    setHard(hm);
    setLevel(0);
    setTime(hm ? 55 : 65);
    setFuel(hm ? 84 : 100);
    setScore(0);
    setPath([]);
    setVan({ x: 50, y: 50 });
    setDelivered([]);
    setCombo(0);
    setBestCombo(0);
    setExpressHit(false);
    setExpressLive(false);
    setCoffee(false);
    setTotalRoute(0);
    setRepeats(0);
    setCompletedCount(0);
    setInvalid(false);
    deliveredRef.current.clear();
    setNotice('');
    let learned = false;
    try {
      learned = localStorage.getItem('delivery-dash-tutorial') === 'done';
    } catch {}
    setPhase(learned ? 'playing' : 'tutorial');
  }, []);
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      setWebgl(!!(canvas.getContext('webgl2') || canvas.getContext('webgl')));
    } catch {
      setWebgl(false);
    }
  }, []);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      threshold: 0.05,
    });
    if (root.current) o.observe(root.current);
    return () => o.disconnect();
  }, []);
  useEffect(() => {
    if (phase !== 'playing' || !visible) return;
    const id = setInterval(() => setTime((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [phase, visible]);
  useEffect(() => {
    if (time === 0 && (phase === 'playing' || phase === 'driving'))
      setPhase('result');
  }, [time, phase]);
  useEffect(() => {
    if (level !== 2 || phase === 'result') return;
    const a = setTimeout(() => setExpressLive(true), 2500),
      b = setTimeout(() => setExpressLive(false), 9500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [level, phase]);
  useEffect(() => {
    if (level !== 2) return;
    const id = setInterval(() => setTrafficOpen((v) => !v), 2800);
    return () => clearInterval(id);
  }, [level]);
  const fromEvent = (e: React.PointerEvent) => {
    const r = board.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
    };
  };
  const add = (p: Point) => {
    const target = stops.find((s) => !delivered.includes(s.id) && d(s, p) < 8);
    const blocked =
      LEVELS[level].blocks.some((b) => d(b, p) < 8) ||
      (level === 2 &&
        !trafficOpen &&
        Math.abs(p.y - 69) < 4 &&
        p.x > 34 &&
        p.x < 66);
    if (blocked) {
      setInvalid(true);
      setNotice(
        lang === 'en' ? 'Road blocked — draw around it.' : '道路封闭，请绕行。',
      );
      return;
    }
    setInvalid(false);
    const grid = [20, 35, 50, 65, 80],
      nx = grid.reduce((a, v) =>
        Math.abs(v - p.x) < Math.abs(a - p.x) ? v : a,
      ),
      ny = grid.reduce((a, v) =>
        Math.abs(v - p.y) < Math.abs(a - p.y) ? v : a,
      ),
      road =
        Math.abs(nx - p.x) < Math.abs(ny - p.y)
          ? { x: nx, y: p.y }
          : { x: p.x, y: ny },
      snap = target ? { x: target.x, y: target.y } : road;
    setPath((old) => {
      if (old.length && d(old.at(-1)!, snap) < 1.8) return old;
      const next = [...old, snap];
      setFuel(
        Math.max(
          0,
          (hard ? 84 : 100) - pathLength(next) * 0.58 - totalRoute * 0.12,
        ),
      );
      return next;
    });
  };
  const begin = (e: React.PointerEvent) => {
    if (!['playing', 'tutorial'].includes(phase)) return;
    const p = fromEvent(e);
    if (d(p, van) > 14) {
      setNotice(lang === 'en' ? 'Start at the van.' : '请从货车开始。');
      beep(190);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrawing(true);
    setPath([van]);
    setNotice('');
    setInvalid(false);
  };
  const drive = useCallback(() => {
    if (path.length < 2 || phase === 'driving') return;
    setDrawing(false);
    setPhase('driving');
    const route = path,
      len = pathLength(route);
    setTotalRoute((v) => v + len);
    const seen = new Set<string>();
    let dup = 0;
    route.forEach((p) => {
      const k = `${Math.round(p.x / 7)}-${Math.round(p.y / 7)}`;
      if (seen.has(k)) dup++;
      seen.add(k);
    });
    setRepeats((v) => v + dup);
    const duration = Math.max(1300, len * (coffee ? 12 : hard ? 24 : 19)),
      started = performance.now();
    let last = 0;
    const tick = (now: number) => {
      const q = Math.min(1, (now - started) / duration),
        p = route[
          Math.min(route.length - 1, Math.floor(q * (route.length - 1)))
        ] ??
          route[0] ?? { x: 50, y: 50 };
      setVan(p);
      stops.forEach((s) => {
        if (!deliveredRef.current.has(s.id) && d(p, s) < 7) {
          deliveredRef.current.add(s.id);
          setDelivered((v) => (v.includes(s.id) ? v : [...v, s.id]));
          setCompletedCount((v) => v + 1);
          const quick = now - last < 750;
          last = now;
          setCombo((c) => {
            const n = quick ? c + 1 : 1;
            setBestCombo((b) => Math.max(b, n));
            return n;
          });
          setScore((v) => v + (s.express ? 900 : 220) + combo * 35);
          if (s.express) setExpressHit(true);
          if (phase === 'tutorial') setNotice(t.nice);
          beep(680 + combo * 70);
        }
      });
      const cafe = LEVELS[level].coffee;
      if (cafe && !coffee && d(p, cafe) < 7) {
        setCoffee(true);
        setNotice(lang === 'en' ? 'Coffee Boost!' : '咖啡加速！');
        beep(920);
      }
      if (q < 1) requestAnimationFrame(tick);
      else {
        setPath([]);
        setPhase('playing');
        setCoffee(false);
      }
    };
    requestAnimationFrame(tick);
  }, [path, phase, coffee, hard, stops, combo, beep, level, lang, t.nice]);
  useEffect(() => {
    if (!stops.length || delivered.length < stops.length) return;
    const perfect = repeats === 0 && fuel > 35;
    if (perfect) {
      setScore((v) => v + 750);
      setNotice(t.perfect);
    } else setNotice(t.complete);
    try {
      localStorage.setItem('delivery-dash-tutorial', 'done');
    } catch {}
    const id = setTimeout(() => {
      if (level < 2) {
        setLevel((v) => v + 1);
        setDelivered([]);
        deliveredRef.current.clear();
        setPath([]);
        setVan({ x: 50, y: 50 });
        setFuel((v) => Math.min(hard ? 84 : 100, v + 28));
        setPhase('level');
        setTimeout(() => setPhase('playing'), 900);
      } else setPhase('result');
    }, 1200);
    return () => clearTimeout(id);
  }, [delivered.length, stops.length, level, repeats, fuel, hard, t]);
  const route = path.map((p) => `${p.x},${p.y}`).join(' '),
    efficiency = Math.max(
      28,
      Math.min(
        100,
        Math.round(100 - (totalRoute - 185) * 0.22 - repeats * 0.8),
      ),
    ),
    title = deliveryDashTitle({
      efficiency,
      bestCombo,
      express: expressHit,
      elapsed: (hard ? 55 : 65) - time,
    }),
    totalStops = LEVELS.reduce((n, l) => n + l.stops.length, 0);
  return (
    <section id="play" ref={root} className="delivery-dash section">
      <div className="dash-kicker">
        <span>{t.k}</span>
        <button onClick={() => setLang((v) => (v === 'en' ? 'zh' : 'en'))}>
          {lang === 'en' ? '中文' : 'EN'}
        </button>
        <span>{t.syn}</span>
      </div>
      {phase === 'preview' ? (
        <div className="dash-preview">
          <div className="dash-preview-copy">
            <span>PLAYABLE 3D CITY</span>
            <h2>
              Delivery <em>Dash.</em>
            </h2>
            <h3>{t.tag}</h3>
            <p>{t.intro}</p>
            <button className="dash-primary" onClick={() => reset(false)}>
              {t.start}
              <ArrowRight />
            </button>
            <small>45–75 SEC · MOUSE · TOUCH · KEYBOARD</small>
          </div>
          <div className="dash-preview-stage">
            <Suspense
              fallback={<div className="dash-load">Building the city…</div>}
            >
              {webgl ? (
                <Canvas
                  dpr={[1, 1.5]}
                  shadows={!reduced}
                  camera={{ position: [8, 10, 10], fov: 42 }}
                  frameloop={visible ? 'always' : 'never'}
                >
                  <City
                    level={0}
                    stops={LEVELS[0].stops.map((p, id) => ({ ...p, id }))}
                    van={{ x: 50, y: 50 }}
                    lit={[]}
                    trafficOpen
                    visible={visible}
                    reduced={reduced}
                  />
                </Canvas>
              ) : (
                <div
                  className="dash-2d-fallback"
                  aria-label="Playable 2D city fallback"
                >
                  <i />
                  <i />
                  <i />
                  <i />
                  <b>2D CITY</b>
                </div>
              )}
            </Suspense>
            <div className="dash-preview-route" />
          </div>
        </div>
      ) : (
        <div className="dash-shell">
          <header className="dash-hud">
            <strong>DASH</strong>
            {(
              [
                [t.score, score],
                [t.time, `${time}s`],
                [t.fuel, `${Math.round(fuel)}%`],
                [t.deliveries, `${delivered.length}/${stops.length}`],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
            <div className="dash-controls">
              <button
                onClick={() =>
                  setPhase((v) => (v === 'paused' ? 'playing' : 'paused'))
                }
                aria-label={phase === 'paused' ? 'Resume' : 'Pause'}
              >
                {phase === 'paused' ? <Play /> : <Pause />}
              </button>
              <button onClick={() => reset(hard)} aria-label="Restart">
                <RotateCcw />
              </button>
              <button
                onClick={() => setSound((v) => !v)}
                aria-label={sound ? 'Sound off' : 'Sound on'}
              >
                {sound ? <Volume2 /> : <VolumeX />}
              </button>
              <button onClick={() => setPhase('preview')} aria-label="Exit">
                <X />
              </button>
            </div>
          </header>
          <div
            className={`dash-board ${drawing ? 'is-drawing' : ''} ${fuel < 18 ? 'low-fuel' : ''}`}
            ref={board}
            onPointerDown={begin}
            onPointerMove={(e) => drawing && add(fromEvent(e))}
            onPointerUp={drive}
            onPointerCancel={() => setDrawing(false)}
          >
            {webgl ? (
              <Canvas
                dpr={[1, 1.45]}
                shadows={!reduced}
                camera={{ position: [8, 10, 10], fov: 42 }}
                frameloop={visible ? 'always' : 'never'}
              >
                <Suspense fallback={null}>
                  <City
                    level={level}
                    stops={stops}
                    van={van}
                    lit={delivered}
                    trafficOpen={trafficOpen}
                    visible={visible}
                    reduced={reduced}
                  />
                </Suspense>
              </Canvas>
            ) : (
              <div
                className="dash-2d-fallback"
                aria-label="Playable 2D city fallback"
              >
                <i />
                <i />
                <i />
                <i />
                <b>2D CITY</b>
              </div>
            )}
            <svg
              className="dash-route"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polyline
                points={route}
                className={fuel <= 0 || invalid ? 'invalid' : ''}
              />
              {path.map((p, i) =>
                stops.some((s) => d(s, p) < 1) ? (
                  <circle key={i} cx={p.x} cy={p.y} r="1.2" />
                ) : null,
              )}
            </svg>
            <div className="dash-origin" style={{ left: '50%', top: '50%' }}>
              <i />
              WAREHOUSE
            </div>
            {stops.map((s) => (
              <button
                key={s.id}
                className={`dash-stop ${delivered.includes(s.id) ? 'done' : ''} ${s.express ? 'express' : ''}`}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={() => {
                  if (!drawing) {
                    if (!path.length) setPath([van]);
                    window.setTimeout(() => add(s), 0);
                  }
                }}
                aria-label={`${s.express ? 'Express ' : ''}delivery stop ${s.id + 1}${delivered.includes(s.id) ? ', delivered' : ''}`}
              >
                <i />
                {delivered.includes(s.id) ? '✓' : s.express ? 'EXPRESS' : ''}
              </button>
            ))}
            {LEVELS[level].blocks.map((b, i) => (
              <div
                key={i}
                className="dash-block"
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
              >
                ROAD CLOSED
              </div>
            ))}
            {level === 2 && (
              <div className={`dash-traffic ${trafficOpen ? 'open' : ''}`}>
                {trafficOpen ? 'TRAFFIC CLEAR' : 'TRAFFIC'}
              </div>
            )}
            {LEVELS[level].coffee && (
              <div
                className="dash-coffee"
                style={{
                  left: `${LEVELS[level].coffee!.x}%`,
                  top: `${LEVELS[level].coffee!.y}%`,
                }}
              >
                ☕
              </div>
            )}
            {LEVELS[level].rain && (
              <div className="dash-rain">
                {Array.from({ length: reduced ? 8 : 24 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
            )}
            {phase === 'tutorial' && (
              <div className="dash-tutorial">
                <div className="dash-ghost-line" />
                <span>☝</span>
                <p>{delivered.length ? t.nice : t.tutorial}</p>
              </div>
            )}
            {phase === 'paused' && (
              <div className="dash-pause">
                <Pause />
                <h3>PAUSED</h3>
                <button onClick={() => setPhase('playing')}>
                  {lang === 'en' ? 'Resume' : '继续'}
                </button>
              </div>
            )}
            {phase === 'level' && (
              <div className="dash-level">
                {t.level} {level + 1}
              </div>
            )}
            <AnimatePresence>
              {notice && (
                <motion.div
                  className="dash-notice"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {notice}
                </motion.div>
              )}
            </AnimatePresence>
            {combo > 1 && phase === 'driving' && (
              <motion.div
                className="dash-combo"
                key={combo}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
              >
                COMBO ×{combo}
              </motion.div>
            )}
            {(phase === 'playing' || phase === 'tutorial') && (
              <div className="dash-actions">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={() => setPath([])}
                >
                  {t.clear}
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  disabled={path.length < 2}
                  onClick={drive}
                >
                  {t.drive}
                </button>
              </div>
            )}
            {phase === 'result' && (
              <motion.div
                className="dash-result"
                initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span>RUN COMPLETE</span>
                <h3>{title}</h3>
                <strong>{score.toLocaleString()}</strong>
                <small>{t.score}</small>
                <div>
                  <b>
                    {bestCombo}×<small>BEST COMBO</small>
                  </b>
                  <b>
                    {efficiency}%<small>ROUTE EFFICIENCY</small>
                  </b>
                  <b>
                    {completedCount}/{totalStops}
                    <small>DELIVERIES</small>
                  </b>
                </div>
                {efficiency < 55 && <p>{t.scenic}</p>}
                <p>{t.explain}</p>
                <nav>
                  <button onClick={() => reset(false)}>{t.again}</button>
                  <button onClick={() => reset(true)}>{t.hard}</button>
                  <button onClick={onSeeProject}>{t.built}</button>
                </nav>
              </motion.div>
            )}
          </div>
          <footer>
            <span>{t.helper}</span>
            <b>
              {t.level} {level + 1}/3
            </b>
          </footer>
        </div>
      )}
      <div className="dash-notes">
        <div>
          <span>Interaction Design</span>
          <p>One gesture becomes the entire game loop.</p>
        </div>
        <div>
          <span>Path & Collision Logic</span>
          <p>Sampling, smoothing, snapping and spatial detection.</p>
        </div>
        <div>
          <span>Game State Management</span>
          <p>Three levels, timed events, scoring and restarts.</p>
        </div>
        <div>
          <span>Motion System</span>
          <p>Vehicle travel, route flow, combos and city feedback.</p>
        </div>
        <div>
          <span>Responsive Controls</span>
          <p>Pointer, touch and keyboard route building.</p>
        </div>
      </div>
      <p className="dash-disclosure">
        Synthetic interactive experience inspired by real-world delivery
        systems.
      </p>
    </section>
  );
}
