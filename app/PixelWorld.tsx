'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- This focusable village is a keyboard-controlled application with parallel native destination buttons. */
import Image from 'next/image';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Mail,
  MapPin,
  Package,
  Sprout,
  X,
} from 'lucide-react';
import { useSafeReducedMotion } from './use-safe-reduced-motion';

type Point = { x: number; y: number };
const nodes: Point[] = [
  { x: 50, y: 54 },
  { x: 29, y: 54 },
  { x: 29, y: 44 },
  { x: 70, y: 54 },
  { x: 70, y: 39 },
  { x: 50, y: 72 },
  { x: 50, y: 86 },
  { x: 27, y: 86 },
  { x: 27, y: 80 },
  { x: 70, y: 86 },
  { x: 70, y: 78 },
  { x: 9, y: 54 },
  { x: 92, y: 54 },
  { x: 50, y: 18 },
];
const edges = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [6, 9],
  [9, 10],
  [1, 11],
  [3, 12],
  [0, 13],
];
const places = [
  {
    id: 'workshop',
    name: 'The Workshop',
    sub: 'SOFTWARE & SYSTEMS',
    node: 2,
    icon: Code2,
    title: 'Small ideas. Working software.',
    text: 'React, TypeScript, Node.js and the curiosity to connect the pieces. Step inside my software and data projects.',
    cta: 'Open project journal',
    target: 'work',
    project: 2,
  },
  {
    id: 'greenhouse',
    name: 'The Greenhouse',
    sub: 'WEATHER & AI',
    node: 4,
    icon: Sprout,
    title: 'A forecast for your everyday.',
    text: 'MiniWeather connects live weather with AI-generated outfit recommendations and images. A little intersection of data and daily life.',
    cta: 'Explore MiniWeather',
    target: 'work',
    project: 1,
  },
  {
    id: 'depot',
    name: 'The Delivery Depot',
    sub: 'REAL-WORLD OPERATIONS',
    node: 10,
    icon: Package,
    title: 'Good systems reach the doorstep.',
    text: 'At GOFO, I work with last-mile capacity, DSP onboarding, cross-station coordination and operational exceptions. GROUND brings partner recruitment online.',
    cta: 'Explore GROUND DSP',
    target: 'work',
    project: 3,
  },
  {
    id: 'library',
    name: 'The Library',
    sub: 'LEARNING & EXPERIENCE',
    node: 8,
    icon: BookOpen,
    title: 'Always room for another chapter.',
    text: 'M.S. in Computer Engineering at NYU Tandon. B.S. in Information Science and Technology at the University of Arizona. Explore the foundation behind my work.',
    cta: 'Read my story',
    target: 'experience',
  },
  {
    id: 'mailbox',
    name: 'The Mailbox',
    sub: 'THE NEXT CONNECTION',
    node: 5,
    icon: Mail,
    title: 'Let’s build something thoughtful.',
    text: 'I’m Yingchi Zhu — call me Junie. Based in New Jersey / NYC, connecting software, data and real-world operations.',
    cta: 'Find me here',
    target: 'contact',
  },
];
const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, ((a.y - b.y) * 2) / 3);
function snap(p: Point) {
  let best = { point: nodes[0], edge: edges[0], distance: Infinity };
  for (const edge of edges) {
    const a = nodes[edge[0]],
      b = nodes[edge[1]],
      dx = b.x - a.x,
      dy = ((b.y - a.y) * 2) / 3;
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p.x - a.x) * dx + (((p.y - a.y) * 2) / 3) * dy) / (dx * dx + dy * dy),
      ),
    );
    const point = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    if (distance(p, point) < best.distance)
      best = { point, edge, distance: distance(p, point) };
  }
  return best;
}
/** Route on the village road graph; never walk through roofs or the pond. */
function route(from: Point, to: Point): Point[] {
  const a = snap(from),
    b = snap(to);
  const all = [...nodes, a.point, b.point],
    start = nodes.length,
    end = start + 1;
  const links = [
    ...edges,
    ...a.edge.map((n) => [start, n]),
    ...b.edge.map((n) => [end, n]),
  ];
  if (a.edge === b.edge) links.push([start, end]);
  const dist = all.map(() => Infinity),
    prev = all.map(() => -1),
    visited = new Set<number>();
  dist[start] = 0;
  while (visited.size < all.length) {
    let u = -1;
    for (let i = 0; i < all.length; i++)
      if (!visited.has(i) && (u < 0 || dist[i] < dist[u])) u = i;
    if (u === end || !Number.isFinite(dist[u])) break;
    visited.add(u);
    for (const [x, y] of links) {
      const v = x === u ? y : y === u ? x : -1;
      if (v < 0) continue;
      const d = dist[u] + distance(all[u], all[v]);
      if (d < dist[v]) {
        dist[v] = d;
        prev[v] = u;
      }
    }
  }
  const result: Point[] = [];
  for (let n = end; n !== start && n >= 0; n = prev[n]) result.unshift(all[n]);
  return result;
}

export default function PixelWorld({
  onProject,
}: {
  onProject: (n: number) => void;
}) {
  const reduced = useSafeReducedMotion();
  const world = useRef<HTMLDivElement>(null),
    sprite = useRef<HTMLDivElement>(null);
  const position = useRef<Point>({ x: 50, y: 60 }),
    path = useRef<Point[]>([]),
    arrival = useRef<number | null>(null);
  const pointer = useRef(false),
    active = useRef(true);
  const [walking, setWalking] = useState(false),
    [selected, setSelected] = useState<number | null>(null),
    [visited, setVisited] = useState<string[]>([]);
  const [destination, setDestination] = useState<Point | null>(null),
    [hint, setHint] = useState('Click a path. Follow your curiosity.');
  const paint = () => {
    if (sprite.current) {
      sprite.current.style.left = `${position.current.x}%`;
      sprite.current.style.top = `${position.current.y}%`;
      sprite.current.dataset.x = position.current.x.toFixed(1);
      sprite.current.dataset.y = position.current.y.toFixed(1);
    }
  };
  const arrive = () => {
    setWalking(false);
    setDestination(null);
    const index = arrival.current;
    arrival.current = null;
    if (index !== null) {
      setSelected(index);
      setVisited((v) =>
        v.includes(places[index].id) ? v : [...v, places[index].id],
      );
      setHint(`You found ${places[index].name}.`);
    }
  };
  const move = (point: Point, place: number | null = null) => {
    arrival.current = place;
    setSelected(null);
    const next = snap(point).point;
    setDestination(next);
    if (reduced) {
      position.current = next;
      paint();
      path.current = [];
      arrive();
      return;
    }
    path.current = route(position.current, next);
    setWalking(true);
    setHint(
      place === null
        ? 'Little paths, new possibilities.'
        : `On the way to ${places[place].name}…`,
    );
  };
  useEffect(() => {
    let frame = 0,
      last = 0,
      inView = true;
    const update = () => {
      active.current = inView && !document.hidden;
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    if (world.current) observer.observe(world.current);
    document.addEventListener('visibilitychange', update);
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      if (active.current && path.current.length) {
        const target = path.current[0],
          p = position.current,
          d = distance(p, target),
          step = dt * 23;
        if (d <= step) {
          position.current = target;
          path.current.shift();
          if (!path.current.length) arrive();
        } else {
          position.current = {
            x: p.x + ((target.x - p.x) * step) / d,
            y: p.y + ((target.y - p.y) * step) / d,
          };
          if (sprite.current)
            sprite.current.dataset.facing = target.x < p.x ? 'left' : 'right';
        }
        paint();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  useEffect(() => {
    if (reduced && path.current.length) {
      position.current = path.current[path.current.length - 1];
      path.current = [];
      paint();
      arrive();
    }
  }, [reduced]);
  const point = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
  };
  const visit = (i: number) => move(nodes[places[i].node], i);
  const open = (i: number) => {
    const place = places[i];
    if (place.project !== undefined) onProject(place.project);
    document
      .getElementById(place.target)
      ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
    history.replaceState(null, '', `#${place.target}`);
  };
  const place = selected === null ? null : places[selected];
  return (
    <section id="home" className="pixel-home">
      <div className="pixel-intro">
        <div>
          <span className="pixel-kicker">
            <span className="tiny-square" /> YINGCHI ZHU’S LITTLE WORLD
          </span>
          <h1>
            Hi, I’m <span>Junie.</span>
            <span className="pixel-period">*</span>
          </h1>
        </div>
        <div className="pixel-intro-copy">
          <p className="pixel-profession">
            Software engineer. Systems thinker.
          </p>
          <p>
            I connect software, data and the everyday complexity of last-mile
            logistics. Come take a look around.
          </p>
          <span>
            <MapPin size={14} /> NEW JERSEY / NYC
          </span>
        </div>
      </div>
      <div className="world-frame">
        <div className="world-topbar">
          <span>
            <span className="tiny-square" /> JUNIE’S VALLEY
          </span>
          <span>A PORTFOLIO TO WANDER THROUGH</span>
          <span>{visited.length} / 5 PLACES FOUND</span>
        </div>
        <div className="world-layout">
          <div
            className="village"
            ref={world}
            role="application"
            aria-label="Explore Junie's village. Click or drag on a path to walk. Arrow keys or W A S D to walk; Enter to visit a nearby place; Escape to stop. Destinations are also available as buttons."
            tabIndex={0}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest('button') || e.button !== 0)
                return;
              pointer.current = true;
              e.currentTarget.focus({ preventScroll: true });
              e.currentTarget.setPointerCapture(e.pointerId);
              move(point(e));
            }}
            onPointerMove={(e) => {
              if (pointer.current) move(point(e));
            }}
            onPointerUp={() => {
              pointer.current = false;
            }}
            onPointerCancel={() => {
              pointer.current = false;
            }}
            onLostPointerCapture={() => {
              pointer.current = false;
            }}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === 'Escape') {
                path.current = [];
                arrival.current = null;
                setSelected(null);
                setDestination(null);
                setWalking(false);
                return;
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                let i = 0;
                places.forEach((p, n) => {
                  if (
                    distance(position.current, nodes[p.node]) <
                    distance(position.current, nodes[places[i].node])
                  )
                    i = n;
                });
                visit(i);
                return;
              }
              const vector: Record<string, Point> = {
                ArrowLeft: { x: -8, y: 0 },
                a: { x: -8, y: 0 },
                ArrowRight: { x: 8, y: 0 },
                d: { x: 8, y: 0 },
                ArrowUp: { x: 0, y: -12 },
                w: { x: 0, y: -12 },
                ArrowDown: { x: 0, y: 12 },
                s: { x: 0, y: 12 },
              };
              const v = vector[e.key];
              if (v) {
                e.preventDefault();
                const base = path.current.at(-1) ?? position.current;
                move({ x: base.x + v.x, y: base.y + v.y });
              }
            }}
          >
            <Image
              unoptimized
              className="village-map"
              src="/pixel-world/village.png"
              width={1536}
              height={1024}
              alt="An original pixel village with a workshop, greenhouse, delivery depot, library and mailbox connected by garden paths."
              fetchPriority="high"
              draggable={false}
            />
            {places.map((p, i) => (
              <button
                key={p.id}
                className={`world-sign sign-${p.id} ${visited.includes(p.id) ? 'visited' : ''}`}
                style={{
                  left: `${p.id === 'mailbox' ? 44 : nodes[p.node].x}%`,
                  top: `${p.id === 'mailbox' ? 76 : nodes[p.node].y - 9}%`,
                }}
                onClick={() => visit(i)}
                aria-label={`Visit ${p.name}`}
              >
                <p.icon size={13} />
                <span>{p.name.replace('The ', '')}</span>
                {visited.includes(p.id) && <b>✓</b>}
              </button>
            ))}
            {destination && (
              <span
                className="walk-target"
                style={{ left: `${destination.x}%`, top: `${destination.y}%` }}
                aria-hidden="true"
              />
            )}
            <div
              className={`village-player ${walking ? 'walking' : ''}`}
              ref={sprite}
              data-testid="village-player"
              style={{ left: '50%', top: '60%' }}
            >
              <span className="player-label">JUNIE</span>
              <Image
                unoptimized
                src="/pixel-world/junie.png"
                width={1024}
                height={1536}
                alt="Original pixel character Junie, wearing olive overalls and a messenger bag"
                draggable={false}
              />
            </div>
            <div className="village-caption" aria-hidden="true">
              CLICK TO WALK · DRAG TO GUIDE
            </div>
          </div>
          <aside className="village-journal" aria-label="Village field notes">
            <div className="journal-title">
              <BookOpen size={18} />
              <span>Field notes</span>
              <span className="journal-number">01</span>
            </div>
            <div className="journal-content" aria-live="polite">
              {place ? (
                <>
                  <div className="journal-place">
                    <place.icon size={24} />
                    <span>{place.sub}</span>
                    <button
                      onClick={() => setSelected(null)}
                      aria-label="Close field note"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <h2>{place.title}</h2>
                  <p>{place.text}</p>
                  <button
                    className="pixel-button journal-cta"
                    onClick={() => open(selected!)}
                  >
                    {place.cta}
                    <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="journal-portrait">
                    <Image
                      unoptimized
                      src="/pixel-world/junie.png"
                      width={1024}
                      height={1536}
                      alt=""
                    />
                    <span>
                      YOUR GUIDE
                      <br />
                      <strong>Junie Zhu</strong>
                    </span>
                  </div>
                  <h2>
                    Every place
                    <br />
                    has a story.
                  </h2>
                  <p>
                    Move my little character through the village. Visit a
                    building to discover what I build, what I study, and what
                    keeps me curious.
                  </p>
                  <p className="journal-tip">
                    Click or drag to walk.
                    <br />
                    Keyboard: arrows / WASD.
                    <br />
                    Press Enter to visit.
                  </p>
                </>
              )}
            </div>
            <div
              className="journal-destinations"
              aria-label="Village destinations"
            >
              {places.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => visit(i)}
                  aria-pressed={selected === i}
                >
                  <p.icon size={15} />
                  <span>{p.name.replace('The ', '')}</span>
                  <span>{visited.includes(p.id) ? '✓' : '↗'}</span>
                </button>
              ))}
            </div>
          </aside>
        </div>
        <div className="world-footer">
          <output>{hint}</output>
          <span>NO QUESTS REQUIRED. JUST CURIOSITY.</span>
        </div>
      </div>
      <div className="pixel-quick-links">
        <span>Prefer the scenic shortcut?</span>
        <a className="pixel-button" href="#work">
          Browse my work <ArrowRight size={17} />
        </a>
        <a className="pixel-button secondary" href="#play">
          Play Delivery Dash <ArrowRight size={17} />
        </a>
        <span className="pixel-facts">NYU TANDON · GOFO OPERATIONS</span>
      </div>
    </section>
  );
}
