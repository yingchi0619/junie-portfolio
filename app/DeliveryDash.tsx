'use client';
/* oxlint-disable react/react-compiler -- DashGame is an external simulation clock, with explicit UI snapshots. */
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- This focusable application surface provides pointer drawing and documented keyboard controls. */
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { motion } from 'motion/react';
import { useSafeReducedMotion as useReducedMotion } from './use-safe-reduced-motion';
import {
  ArrowUpRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Undo2,
  Keyboard,
  Hand,
  ArrowRight,
} from 'lucide-react';
import DeliveryDashCanvas from './DeliveryDashCanvas';
import {
  DashGame,
  START,
  point,
  project,
  unproject,
  distance,
  deliveryDashTitle,
  type Point,
  type Notice,
} from './delivery-dash-logic';
import { COPY, type Lang } from './delivery-dash-copy';
import './delivery-dash.css';

type SceneProps = {
  game: DashGame;
  active: boolean;
  reduced: boolean;
  compact: boolean;
  onReady: () => void;
  onFail: () => void;
};
class SceneBoundary extends Component<
  { onFail: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function DeliveryDash() {
  const [game] = useState(() => new DashGame()),
    [lang, setLang] = useState<Lang>('en'),
    [near, setNear] = useState(false),
    [visible, setVisible] = useState(false),
    [docActive, setDocActive] = useState(true),
    [scene, setScene] = useState<ComponentType<SceneProps> | null>(null),
    [mode, setMode] = useState<'3d' | '2d'>('3d'),
    [ready, setReady] = useState(false),
    [sound, setSound] = useState(false),
    [keys, setKeys] = useState(false),
    [details, setDetails] = useState(false),
    [size, setSize] = useState({ width: 900, height: 580 }),
    [, update] = useState(0);
  const t = COPY[lang],
    reduced = !!useReducedMotion(),
    root = useRef<HTMLElement>(null),
    shell = useRef<HTMLDivElement>(null),
    board = useRef<HTMLDivElement>(null),
    caseStudy = useRef<HTMLElement>(null),
    stroke = useRef<Point | null>(null),
    modeRef = useRef<'3d' | '2d'>('3d'),
    audio = useRef<AudioContext | null>(null),
    lastSound = useRef(-1),
    soundRef = useRef(sound),
    tutorialStored = useRef(false);
  const refresh = () => update((n) => n + 1);
  const onReady = useCallback(() => setReady(true), []),
    onFail = useCallback(() => {
      // R3F releases its old context on unmount; ignore that after an intentional switch.
      if (modeRef.current === '2d') return;
      modeRef.current = '2d';
      setMode('2d');
      setReady(false);
    }, []);
  const active = visible && docActive && !game.paused;
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);
  useEffect(() => {
    try {
      const l = localStorage.getItem('delivery-dash-language');
      if (l === 'zh' || l === 'en') setLang(l);
      tutorialStored.current =
        localStorage.getItem('delivery-dash-learned') === 'yes';
    } catch {}
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: '250px' },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.12 },
    );
    if (shell.current) observer.observe(shell.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!near) return;
    // Renderer initialization can fail before React's scene boundary mounts.
    // Probe first so devices without WebGL can immediately play the Canvas version.
    try {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) { onFail(); return; }
      probe.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { onFail(); return; }
    let alive = true;
    import('./DeliveryDashScene')
      .then((m) => {
        if (alive) setScene(() => m.default);
      })
      .catch(() => {
        if (alive) onFail();
      });
    return () => {
      alive = false;
    };
  }, [near, onFail]);
  useEffect(() => {
    const sync = () => setDocActive(!document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);
  useEffect(() => {
    if (!board.current) return;
    const o = new ResizeObserver(([e]) =>
      setSize({ width: e.contentRect.width, height: e.contentRect.height }),
    );
    o.observe(board.current);
    return () => o.disconnect();
  }, []);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  const ping = (combo: number, gold = false) => {
    if (!soundRef.current || !audio.current) return;
    const c = audio.current,
      g = c.createGain(),
      o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(gold ? 1046 : 440 + combo * 85, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(
      gold ? 1568 : 660 + combo * 85,
      c.currentTime + 0.12,
    );
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.045, c.currentTime + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.22);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.23);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  };
  useEffect(() => {
    if (!active || !ready) return;
    let id = 0,
      last = performance.now(),
      published = last;
    const frame = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      if (game.phase === 'preview') {
        game.clock += dt;
        const route = [20, 21, 22, 17, 12, 11, 10, 15, 20],
          p = (game.clock * 0.65) % (route.length - 1),
          i = Math.floor(p),
          a = point(route[i]),
          b = point(route[i + 1]);
        game.van = {
          x: a.x + (b.x - a.x) * (p - i),
          z: a.z + (b.z - a.z) * (p - i),
        };
        game.heading = Math.atan2(b.x - a.x, b.z - a.z);
      } else {
        // Catch up in bounded steps so slow render frames do not grant extra time or fuel.
        let remaining = dt;
        while (remaining > 0) { const step = Math.min(.05, remaining); game.tick(step); remaining -= step; }
      }
      const event = game.events.at(-1);
      if (event && event.time !== lastSound.current) {
        lastSound.current = event.time;
        ping(event.combo, event.gold);
      }
      if (
        !game.tutorial &&
        !tutorialStored.current &&
        game.phase !== 'preview'
      ) {
        tutorialStored.current = true;
        try {
          localStorage.setItem('delivery-dash-learned', 'yes');
        } catch {}
      }
      if (now - published > 75) {
        update((n) => n + 1);
        published = now;
      }
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [active, ready, game]);
  const switchLang = () => {
    const l = lang === 'en' ? 'zh' : 'en';
    setLang(l);
    try {
      localStorage.setItem('delivery-dash-language', l);
    } catch {}
  };
  const start = (hard = false) => {
    game.reset(hard, !tutorialStored.current);
    stroke.current = null;
    lastSound.current = -1;
    refresh();
    requestAnimationFrame(() => {
      shell.current?.scrollIntoView({
        block: 'nearest',
        behavior: reduced ? 'instant' : 'smooth',
      });
      board.current?.focus({ preventScroll: true });
    });
  };
  const pause = () => {
    if (game.phase === 'preview' || game.phase === 'result') return;
    game.paused = !game.paused;
    stroke.current = null;
    if (game.phase === 'drawing') game.cancel();
    refresh();
  };
  const toggleSound = () => {
    if (!sound) {
      try {
        audio.current ??= new AudioContext();
        void audio.current.resume();
      } catch {}
    }
    setSound(!sound);
  };
  const getPoint = (e: PointerEvent) => {
    const r = board.current!.getBoundingClientRect();
    return unproject(
      e.clientX - r.left,
      e.clientY - r.top,
      r.width,
      r.height,
      game.camera,
    );
  };
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !ready || (e.target as HTMLElement).closest('button'))
      return;
    const p = getPoint(e);
    if (game.begin(p)) {
      e.preventDefault();
      board.current?.focus({ preventScroll: true });
      e.currentTarget.setPointerCapture(e.pointerId);
      stroke.current = p;
    }
    refresh();
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!stroke.current || game.paused) return;
    const p = getPoint(e),
      last = stroke.current,
      steps = Math.min(80, Math.max(1, Math.ceil(distance(last, p) / 0.18)));
    for (let i = 1; i <= steps; i++)
      game.draw({
        x: last.x + ((p.x - last.x) * i) / steps,
        z: last.z + ((p.z - last.z) * i) / steps,
      });
    stroke.current = p;
    refresh();
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    if (!stroke.current) return;
    move(e);
    stroke.current = null;
    game.release();
    refresh();
  };
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const arrows: Record<string, [number, number]> = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    if (arrows[e.key]) {
      e.preventDefault();
      game.keyboard(...arrows[e.key]);
      setKeys(true);
      refresh();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      game.release();
      refresh();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      game.undo();
      refresh();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      game.cancel();
      refresh();
    } else if (e.code === 'Space') {
      e.preventDefault();
      pause();
    }
  };
  const showCase = () => {
    setDetails(true);
    requestAnimationFrame(() => {
      caseStudy.current?.scrollIntoView({
        block: 'start',
        behavior: reduced ? 'instant' : 'smooth',
      });
      caseStudy.current?.focus({ preventScroll: true });
    });
  };
  const routeEnd = game.route.length ? point(game.route.at(-1)!) : game.van,
    tip = project(routeEnd, size.width, size.height, 0, game.camera),
    preview = game.phase === 'preview',
    result = game.phase === 'result',
    playing = !preview && !result;
  const notices: Record<Notice, string> = {
    start: t.startAt,
    nice: t.nice,
    blocked: t.blocked,
    road: t.road,
    fuel: t.outFuel,
    coffee: t.coffee,
    express: t.express,
    perfect: t.perfect,
    complete: t.complete,
    traffic: t.traffic,
    timeout: t.timeout,
  };
  const title = deliveryDashTitle({
    efficiency: game.efficiency,
    bestCombo: game.bestCombo,
    express: game.expressCollected,
    elapsed: game.elapsed,
    won: game.won,
  });
  const Scene = scene;
  return (
    <section
      id="play"
      ref={root}
      className="delivery-dash section"
      lang={lang === 'zh' ? 'zh-CN' : 'en'}
    >
      <div className="dd-section-label">
        <span>01 / {lang === 'en' ? 'PLAY SOMETHING' : '来玩一会儿'}</span>
        <span>
          {lang === 'en' ? 'A SMALL CITY, IN YOUR HANDS' : '一座小城，尽在指尖'}
        </span>
      </div>
      <div
        ref={shell}
        className={`dd-shell ${preview ? 'dd-preview' : ''} ${result ? 'dd-ended' : ''}`}
      >
        <div className="dd-topline">
          <a href="#play" aria-label="Delivery Dash" className="dd-wordmark">
            delivery<span>dash</span>
            <i>↗</i>
          </a>
          <div className="dd-top-actions">
            <button
              onClick={switchLang}
              aria-label={lang === 'en' ? 'Switch to Chinese' : '切换为英文'}
            >
              {lang === 'en' ? 'EN / 中文' : '中文 / EN'}
            </button>
            {Scene && <button
              className="dd-view-switch"
              onClick={() => {
                modeRef.current = modeRef.current === '3d' ? '2d' : '3d';
                setMode(modeRef.current);
                setReady(false);
              }}
            >
              {mode === '3d' ? t.twoD : t.threeD}
            </button>}
            <button
              onClick={toggleSound}
              aria-label={sound ? t.soundOff : t.soundOn}
            >
              {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            {playing && (
              <button
                onClick={() => {
                  game.reset();
                  game.phase = 'preview';
                  refresh();
                }}
                aria-label={t.exit}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        {playing && (
          <div
            className="dd-hud"
            aria-label={lang === 'en' ? 'Game status' : '游戏状态'}
          >
            {[
              [t.score, game.score.toLocaleString()],
              [t.time, `${Math.ceil(game.remaining)}s`],
              [
                t.fuel,
                `${Math.round(game.phase === 'drawing' ? game.previewFuel : game.fuelPercent)}%`,
              ],
              [
                t.deliveries,
                `${game.delivered.size}/${game.config.targets.length}`,
              ],
            ].map(([label, value], i) => (
              <div
                key={label}
                className={i === 2 && game.previewFuel < 12 ? 'dd-warn' : ''}
              >
                <span>{label}</span>
                <strong>{value}</strong>
                {i === 2 && (
                  <i
                    style={{
                      width: `${game.phase === 'drawing' ? game.previewFuel : game.fuelPercent}%`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <div
          ref={board}
          className="dd-board"
          tabIndex={0}
          role="application"
          aria-label={
            lang === 'en'
              ? 'Delivery Dash. Draw from the van along the streets. Arrow keys draw, Enter drives.'
              : '配送冲刺。沿街道画线。方向键画线，回车出发。'
          }
          aria-describedby={keys ? 'dd-key-help' : undefined}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => {
            stroke.current = null;
            game.cancel();
            refresh();
          }}
          onKeyDown={key}
          data-phase={game.phase}
          data-round={game.level + 1}
          data-renderer={mode}
          data-ready={ready}
        >
          {near &&
            (mode === '2d' ? (
              <DeliveryDashCanvas
                game={game}
                active={active}
                reduced={reduced}
                onReady={onReady}
              />
            ) : (
              Scene && (
                <SceneBoundary onFail={onFail}>
                  <Scene
                    game={game}
                    active={active}
                    reduced={reduced}
                    compact={size.width < 600}
                    onReady={onReady}
                    onFail={onFail}
                  />
                </SceneBoundary>
              )
            ))}
          {!ready && (
            <div className="dd-loading">
              <span />
              {t.load}
            </div>
          )}
          {preview && (
            <div className="dd-intro">
              <span className="dd-pretitle">
                {lang === 'en'
                  ? 'THE ONE-MINUTE CITY BREAK'
                  : '一分钟，闯进小城'}
              </span>
              <h2>
                Delivery
                <br />
                <em>Dash.</em>
              </h2>
              <p className="dd-tagline">{t.tag}</p>
              <p>{t.intro}</p>
              <button
                className="dd-primary"
                disabled={!ready}
                onClick={() => start()}
              >
                {t.start}
                <ArrowRight size={20} />
              </button>
              <small>{t.about}</small>
            </div>
          )}
          {playing && (
            <>
              <div className="dd-round">
                {t.level} {game.level + 1}
                {lang === 'zh' ? ' 关' : ''}
                <span>{game.config.names[lang === 'en' ? 0 : 1]}</span>
              </div>
              {game.tutorial &&
                game.phase !== 'driving' &&
                game.phase !== 'level' && (
                  <div className="dd-tutorial" aria-live="polite">
                    <svg viewBox={`0 0 ${size.width} ${size.height}`}>
                      <path
                        d={(() => {
                          const a = project(
                              point(START),
                              size.width,
                              size.height,
                              0,
                              game.camera,
                            ),
                            b = project(
                              point(21),
                              size.width,
                              size.height,
                              0,
                              game.camera,
                            );
                          return `M${a.x} ${a.y} L${b.x} ${b.y}`;
                        })()}
                      />
                    </svg>
                    <p>{t.tutorial}</p>
                    <span
                      className="dd-hand"
                      style={(() => {
                        const a = project(
                            point(START),
                            size.width,
                            size.height,
                            0,
                            game.camera,
                          ),
                          b = project(
                            point(21),
                            size.width,
                            size.height,
                            0,
                            game.camera,
                          );
                        return {
                          left: a.x,
                          top: a.y,
                          '--hand-x': `${b.x - a.x}px`,
                          '--hand-y': `${b.y - a.y}px`,
                        } as React.CSSProperties;
                      })()}
                    >
                      <Hand size={22} />
                    </span>
                  </div>
                )}
              {game.config.targets
                .filter((n) => game.route.includes(n) && !game.delivered.has(n))
                .map((n) => {
                  const p = project(
                    point(n),
                    size.width,
                    size.height,
                    0,
                    game.camera,
                  );
                  return (
                    <span
                      key={n}
                      className="dd-stop-check"
                      style={{ left: p.x, top: p.y }}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  );
                })}
              {game.phase === 'drawing' && (
                <span
                  className="dd-cursor"
                  style={{ left: tip.x, top: tip.y }}
                  aria-hidden="true"
                />
              )}
              {game.invalid &&
                (() => {
                  const p = project(
                    game.invalid,
                    size.width,
                    size.height,
                    0,
                    game.camera,
                  );
                  return (
                    <span
                      className="dd-invalid"
                      style={{ left: p.x, top: p.y }}
                    >
                      ×
                    </span>
                  );
                })()}
              <div
                className="dd-planned"
                aria-label={
                  lang === 'en' ? 'Stops on your route' : '路线中的目的地'
                }
              >
                {game.config.targets.map((n, i) => (
                  <span
                    key={n}
                    className={
                      game.delivered.has(n)
                        ? 'done'
                        : game.route.includes(n)
                          ? 'planned'
                          : ''
                    }
                  >
                    {game.delivered.has(n) ? '✓' : i + 1}
                  </span>
                ))}
              </div>
              {game.clock < game.noticeUntil &&
                !(game.tutorial && game.notice === 'start') && (
                  <motion.output
                    key={game.notice}
                    className={`dd-toast ${game.notice === 'perfect' || game.notice === 'express' ? 'gold' : ''}`}
                    initial={reduced ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {notices[game.notice]}
                  </motion.output>
                )}
              {game.combo > 1 && game.clock - game.lastDelivery < 1.7 && (
                <motion.div
                  key={game.combo}
                  initial={reduced ? false : { scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="dd-combo"
                >
                  {game.combo}
                  <span>× {t.combo}</span>
                </motion.div>
              )}
              {game.expressActive && (
                <div className="dd-express">
                  ✦ {t.expressLive}
                  <span>
                    {Math.ceil((game.hard ? 11 : 15) - game.levelTime)}s
                  </span>
                </div>
              )}
              {game.phase === 'level' && (
                <div className="dd-level-wash" aria-hidden="true" />
              )}
            </>
          )}
          {game.paused && playing && (
            <div className="dd-overlay">
              <Pause size={26} />
              <h3>{t.paused}</h3>
              <p>{t.pausedHint}</p>
              <button className="dd-primary" onClick={pause}>
                {t.resume}
                <Play size={17} />
              </button>
            </div>
          )}
          {result && (
            <section
              className="dd-result dd-overlay"
              aria-label={lang === 'en' ? 'Run results' : '游戏结算'}
            >
              <span className="dd-pretitle">{game.won ? t.won : t.ended}</span>
              <h3>{t.titles[title]}</h3>
              <strong className="dd-final-score">
                {game.finalScore.toLocaleString()}
                <small>{t.score}</small>
              </strong>
              <div className="dd-result-stats">
                <div>
                  <strong>{game.bestCombo}×</strong>
                  <span>{t.best}</span>
                </div>
                <div>
                  <strong>{game.efficiency}%</strong>
                  <span>{t.efficiency}</span>
                </div>
                <div>
                  <strong>{game.count}/14</strong>
                  <span>{t.delivered}</span>
                </div>
              </div>
              <p>
                {game.won
                  ? game.efficiency < 65
                    ? t.scenic
                    : t.explain
                  : t.partial}
              </p>
              <div className="dd-result-actions">
                <button className="dd-primary" onClick={() => start(false)}>
                  {t.again}
                  <RotateCcw size={17} />
                </button>
                <button className="dd-secondary" onClick={() => start(true)}>
                  {t.hard}
                </button>
              </div>
              <button className="dd-built-link" onClick={showCase}>
                {t.built}
                <ArrowUpRight size={17} />
              </button>
            </section>
          )}
        </div>
        {playing && (
          <div className="dd-toolbar">
            <p>
              {game.phase === 'driving'
                ? game.boostUntil > game.clock
                  ? t.coffee
                  : game.notice === 'traffic' && game.clock < game.noticeUntil
                    ? t.traffic
                    : t.tag
                : t.draw}
            </p>
            <div>
              <button
                disabled={game.route.length < 2 || game.phase !== 'drawing'}
                onClick={() => {
                  game.undo();
                  refresh();
                }}
                aria-label={t.undo}
              >
                <Undo2 size={19} />
              </button>
              <button
                onClick={() => setKeys((v) => !v)}
                aria-label={t.keyboard}
                aria-expanded={keys}
              >
                <Keyboard size={19} />
              </button>
              <button
                onClick={pause}
                aria-label={game.paused ? t.resume : t.pause}
              >
                {game.paused ? <Play size={18} /> : <Pause size={18} />}
              </button>
              <button onClick={() => start(game.hard)} aria-label={t.restart}>
                <RotateCcw size={18} />
              </button>
              {keys && (
                <button
                  className="dd-key-drive"
                  disabled={game.route.length < 2}
                  onClick={() => {
                    game.release();
                    refresh();
                  }}
                >
                  {t.drive}
                </button>
              )}
            </div>
          </div>
        )}
        {keys && playing && (
          <p id="dd-key-help" className="dd-key-help">
            {t.keys}
          </p>
        )}
      </div>
      <p className="dd-disclosure">{t.disclosure}</p>
      {result && !details && (
        <div className="dd-afterword">
          <p>{t.explain}</p>
          <div>
            {t.notes.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
      )}
      {details && (
        <article
          className="dd-case"
          id="delivery-dash-case-study"
          ref={caseStudy}
          tabIndex={-1}
        >
          <span className="eyebrow">
            DELIVERY DASH /{' '}
            {lang === 'en' ? 'PERSONAL INTERACTIVE PROJECT' : '个人交互项目'}
          </span>
          <h3>{t.caseTitle}</h3>
          <p>{t.caseIntro}</p>
          <div className="dd-case-grid">
            {[
              [t.problem, t.problemBody],
              [t.contribution, t.contributionBody],
              [t.approach, t.approachBody],
              [t.outcome, t.outcomeBody],
            ].map(([h, b]) => (
              <div key={h}>
                <h4>{h}</h4>
                <p>{b}</p>
              </div>
            ))}
          </div>
          <div className="dd-case-topics">
            {t.notes.map((n, i) => (
              <div key={n}>
                <h4>{n}</h4>
                <p>{t.details[i]}</p>
              </div>
            ))}
          </div>
          <p className="dd-tech">
            React · TypeScript · React Three Fiber · Three.js · Motion · Canvas
            2D
          </p>
          <button
            className="dd-secondary"
            onClick={() => {
              setDetails(false);
              board.current?.focus({ preventScroll: true });
            }}
          >
            {t.closeCase}
            <X size={16} />
          </button>
        </article>
      )}
    </section>
  );
}
