'use client';
/* oxlint-disable react/react-compiler -- Timed simulation events intentionally advance related state from effects. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  CircleHelp,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import './delivery-rush.css';

type AreaId = 'downtown' | 'suburbs' | 'riverside' | 'uptown';
type Phase = 'preview' | 'tutorial' | 'playing' | 'paused' | 'result';
type EventKind = 'sick' | 'rain' | 'traffic' | 'surge' | 'repair';
type Driver = {
  id: number;
  area: AreaId | null;
  unavailable: number;
  emergency?: boolean;
};
type DragState = { id: number; x: number; y: number } | null;

const AREAS: Array<{
  id: AreaId;
  name: string;
  x: number;
  y: number;
  path: string;
}> = [
  {
    id: 'downtown',
    name: 'Downtown',
    x: 66,
    y: 31,
    path: 'M49 52 C54 42 58 36 66 31',
  },
  {
    id: 'suburbs',
    name: 'Suburbs',
    x: 82,
    y: 70,
    path: 'M49 52 C64 55 73 62 82 70',
  },
  {
    id: 'riverside',
    name: 'Riverside',
    x: 22,
    y: 75,
    path: 'M49 52 C38 57 30 67 22 75',
  },
  {
    id: 'uptown',
    name: 'Uptown',
    x: 25,
    y: 25,
    path: 'M49 52 C40 42 33 32 25 25',
  },
];

const BASE_WAITING: Record<AreaId, number> = {
  downtown: 9,
  suburbs: 7,
  riverside: 4,
  uptown: 8,
};

const EVENTS: Array<{ kind: EventKind; message: string; at: number }> = [
  { kind: 'surge', message: 'A lot more packages just arrived.', at: 43 },
  { kind: 'rain', message: 'Heavy rain is slowing deliveries.', at: 31 },
  { kind: 'traffic', message: 'Downtown traffic is getting worse.', at: 20 },
];

const ALT_EVENTS: Array<{ kind: EventKind; message: string; at: number }> = [
  { kind: 'sick', message: 'A driver called out sick.', at: 39 },
  { kind: 'repair', message: 'A vehicle needs a quick repair.', at: 27 },
  { kind: 'surge', message: 'A lot more packages just arrived.', at: 16 },
];

export function getDeliveryRushTitle(input: {
  rate: number;
  budget: number;
  emergencyUses: number;
  severeTicks: number;
  balance: number;
  finishedEarly: boolean;
}) {
  if (input.finishedEarly && input.rate >= 82) return 'The Speed Runner';
  if (input.emergencyUses > 0 && input.rate >= 72) return 'The Firefighter';
  if (input.rate >= 88 && input.budget >= 650) return 'The Optimizer';
  if (input.balance <= 8 && input.severeTicks <= 8) return 'The Planner';
  return 'The Calm Dispatcher';
}

function seedDrivers(): Driver[] {
  return [
    { id: 1, area: 'downtown', unavailable: 0 },
    { id: 2, area: 'suburbs', unavailable: 0 },
    { id: 3, area: 'uptown', unavailable: 0 },
    { id: 4, area: null, unavailable: 0 },
  ];
}

function congestion(waiting: number, drivers: number, event: EventKind | null) {
  const pressure = waiting / Math.max(1, drivers * 7);
  const penalty = event === 'rain' ? 0.3 : event === 'traffic' ? 0.55 : 0;
  const score = pressure + penalty;
  return score > 1.7 ? 'red' : score > 0.9 ? 'orange' : 'blue';
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

function MiniCity() {
  return (
    <div className="rush-mini-city" aria-hidden="true">
      <div className="rush-mini-grid" />
      {AREAS.map((area, index) => (
        <div
          className={`rush-mini-building mini-building-${index}`}
          key={area.id}
          style={{ left: `${area.x}%`, top: `${area.y}%` }}
        >
          <i />
          <i />
          <i />
        </div>
      ))}
      <div className="rush-mini-warehouse">
        {Array.from({ length: 12 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <div className="rush-mini-vehicle">▰</div>
      <svg viewBox="0 0 100 100">
        {AREAS.map((area) => (
          <path key={area.id} d={area.path} />
        ))}
      </svg>
    </div>
  );
}

export default function DeliveryRush({
  onSeeProject,
}: {
  onSeeProject: () => void;
}) {
  const reduced = !!useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const dragId = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>('preview');
  const [time, setTime] = useState(60);
  const [waiting, setWaiting] = useState<Record<AreaId, number>>(BASE_WAITING);
  const [delivered, setDelivered] = useState(0);
  const [drivers, setDrivers] = useState<Driver[]>(seedDrivers);
  const [budget, setBudget] = useState(900);
  const [emergencyUses, setEmergencyUses] = useState(0);
  const [activeEvent, setActiveEvent] = useState<EventKind | null>(null);
  const [eventMessage, setEventMessage] = useState('');
  const [handledEvents, setHandledEvents] = useState<number[]>([]);
  const [routeChoice, setRouteChoice] = useState<AreaId | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const [tutorialStep, setTutorialStep] = useState<'drag' | 'success'>('drag');
  const [hard, setHard] = useState(false);
  const [round, setRound] = useState(0);
  const [sound, setSound] = useState(false);
  const [visible, setVisible] = useState(true);
  const [severeTicks, setSevereTicks] = useState(0);
  const [finishTime, setFinishTime] = useState(0);
  const [pulseArea, setPulseArea] = useState<AreaId | null>(null);

  const eventSchedule = round % 2 === 0 ? EVENTS : ALT_EVENTS;
  const totalWaiting = Object.values(waiting).reduce(
    (sum, value) => sum + value,
    0,
  );
  const total = delivered + totalWaiting;
  const rate = total ? Math.round((delivered / total) * 100) : 100;

  const areaStats = useMemo(
    () =>
      Object.fromEntries(
        AREAS.map((area) => {
          const assigned = drivers.filter(
            (driver) => driver.area === area.id && driver.unavailable === 0,
          ).length;
          return [
            area.id,
            {
              drivers: assigned,
              congestion: congestion(
                waiting[area.id],
                assigned,
                area.id === 'downtown'
                  ? activeEvent
                  : activeEvent === 'rain'
                    ? 'rain'
                    : null,
              ),
            },
          ];
        }),
      ) as Record<
        AreaId,
        { drivers: number; congestion: 'blue' | 'orange' | 'red' }
      >,
    [drivers, waiting, activeEvent],
  );

  const beep = useCallback(
    (frequency = 560) => {
      if (!sound) return;
      const AudioContextClass = window.AudioContext;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.025, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.12);
    },
    [sound],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      {
        threshold: 0.02,
      },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  const reset = useCallback(
    (difficulty = hard, skipTutorial = true) => {
      setHard(difficulty);
      setTime(difficulty ? 50 : 60);
      setWaiting(
        difficulty
          ? { downtown: 13, suburbs: 10, riverside: 7, uptown: 12 }
          : BASE_WAITING,
      );
      setDelivered(0);
      setDrivers(seedDrivers());
      setBudget(900);
      setEmergencyUses(0);
      setActiveEvent(null);
      setEventMessage('');
      setHandledEvents([]);
      setRouteChoice(null);
      setSelectedDriver(null);
      dragId.current = null;
      setDrag(null);
      setSevereTicks(0);
      setFinishTime(0);
      setTutorialStep('drag');
      setPhase(skipTutorial ? 'playing' : 'tutorial');
    },
    [hard],
  );

  const startGame = () => {
    let learned = false;
    try {
      learned = localStorage.getItem('delivery-rush-tutorial') === 'done';
    } catch {}
    reset(false, learned);
  };

  const assignDriver = useCallback(
    (driverId: number, areaId: AreaId) => {
      setDrivers((current) =>
        current.map((driver) =>
          driver.id === driverId
            ? { ...driver, area: areaId, unavailable: 0 }
            : driver,
        ),
      );
      setSelectedDriver(null);
      setPulseArea(areaId);
      window.setTimeout(() => setPulseArea(null), 650);
      beep(650);
      if (phase === 'tutorial') {
        setTutorialStep('success');
        try {
          localStorage.setItem('delivery-rush-tutorial', 'done');
        } catch {}
        window.setTimeout(() => setPhase('playing'), 1200);
      }
    },
    [phase, beep],
  );

  const finishDrag = (event: React.PointerEvent) => {
    const activeDriver = dragId.current;
    if (activeDriver === null) return;
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-area]');
    if (target?.dataset.area)
      assignDriver(activeDriver, target.dataset.area as AreaId);
    dragId.current = null;
    setDrag(null);
  };

  const triggerEvent = useCallback(
    (kind: EventKind, message: string) => {
      setActiveEvent(kind);
      setEventMessage(message);
      beep(260);
      if (kind === 'surge') {
        setWaiting((current) => ({
          ...current,
          uptown: current.uptown + (hard ? 14 : 10),
        }));
      }
      if (kind === 'sick') {
        setDrivers((current) =>
          current.map((driver, index) =>
            index === 1 ? { ...driver, unavailable: 7 } : driver,
          ),
        );
      }
      if (kind === 'repair') {
        setDrivers((current) =>
          current.map((driver, index) =>
            index === 2 ? { ...driver, unavailable: 6 } : driver,
          ),
        );
      }
      window.setTimeout(() => setEventMessage(''), 2800);
      window.setTimeout(
        () => setActiveEvent(null),
        kind === 'rain' || kind === 'traffic' ? 10_000 : 7000,
      );
    },
    [hard, beep],
  );

  useEffect(() => {
    if (phase !== 'playing' || !visible) return;
    const timer = window.setInterval(() => {
      setTime((currentTime) => {
        return Math.max(0, currentTime - 1);
      });
      setDrivers((current) =>
        current.map((driver) => ({
          ...driver,
          unavailable: Math.max(0, driver.unavailable - 1),
        })),
      );
      setWaiting((current) => {
        const next = { ...current };
        let moved = 0;
        AREAS.forEach((area, index) => {
          const available = drivers.filter(
            (driver) => driver.area === area.id && driver.unavailable === 0,
          ).length;
          const slowdown =
            activeEvent === 'rain'
              ? 1
              : activeEvent === 'traffic' && area.id === 'downtown'
                ? 2
                : 0;
          const throughput = Math.max(0, available * (hard ? 2 : 3) - slowdown);
          const sent = Math.min(next[area.id], throughput);
          next[area.id] -= sent;
          moved += sent;
          const arrivals =
            time > 15 ? (hard ? 3 : 2) + ((time + index) % 4 === 0 ? 2 : 0) : 1;
          next[area.id] += arrivals;
        });
        setDelivered((value) => value + moved);
        return next;
      });
      if (Object.values(areaStats).some((area) => area.congestion === 'red')) {
        setSevereTicks((value) => value + 1);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, visible, drivers, activeEvent, hard, time, areaStats]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (time <= 0) {
      setPhase('result');
      return;
    }
    const event = eventSchedule.find((item) => item.at === time);
    if (event && !handledEvents.includes(event.at)) {
      setHandledEvents((items) => [...items, event.at]);
      triggerEvent(event.kind, event.message);
    }
    if (totalWaiting === 0 && time > 0) {
      setFinishTime(time);
      setPhase('result');
    }
  }, [time, phase, eventSchedule, handledEvents, triggerEvent, totalWaiting]);

  const divert = (from: AreaId) => {
    const receiver = AREAS.map((area) => area.id)
      .filter((id) => id !== from)
      .sort(
        (a, b) =>
          waiting[a] / Math.max(1, areaStats[a].drivers) -
          waiting[b] / Math.max(1, areaStats[b].drivers),
      )[0];
    const amount = Math.min(5, Math.max(2, Math.floor(waiting[from] / 3)));
    setWaiting((current) => ({
      ...current,
      [from]: Math.max(0, current[from] - amount),
      [receiver]: current[receiver] + amount,
    }));
    const helper = drivers.find(
      (driver) => driver.area === receiver && driver.unavailable === 0,
    );
    if (helper)
      setDrivers((current) =>
        current.map((driver) =>
          driver.id === helper.id ? { ...driver, area: from } : driver,
        ),
      );
    setPulseArea(from);
    setRouteChoice(null);
    window.setTimeout(() => setPulseArea(null), 700);
    beep(720);
  };

  const emergency = () => {
    if (emergencyUses > 0 || budget < 250) return;
    const busiest = AREAS.map((area) => area.id).sort(
      (a, b) => waiting[b] - waiting[a],
    )[0];
    setDrivers((current) => [
      ...current,
      { id: 5, area: busiest, unavailable: 0, emergency: true },
    ]);
    setBudget((value) => value - 250);
    setEmergencyUses(1);
    setPulseArea(busiest);
    window.setTimeout(() => setPulseArea(null), 900);
    beep(820);
  };

  const spread =
    Math.max(...Object.values(waiting)) - Math.min(...Object.values(waiting));
  const title = getDeliveryRushTitle({
    rate,
    budget,
    emergencyUses,
    severeTicks,
    balance: spread,
    finishedEarly: finishTime > 10,
  });

  return (
    <section
      id="play"
      ref={root}
      className={`delivery-rush section rush-${phase}`}
    >
      <div className="rush-kicker">
        <span>01 / INTERACTIVE EXPERIENCE</span>
        <span>SYNTHETIC SIMULATION · NO COMPANY DATA</span>
      </div>
      {phase === 'preview' ? (
        <div className="rush-preview">
          <div className="rush-preview-copy">
            <span className="rush-live">
              <i /> PLAYABLE SYSTEM
            </span>
            <h2>
              Delivery
              <br />
              <em>Rush.</em>
            </h2>
            <p>Can you deliver the city before time runs out?</p>
            <button className="rush-primary" onClick={startGame}>
              Start Game <ArrowRight size={18} />
            </button>
            <small>ABOUT 60 SECONDS · NO SIGN-IN</small>
          </div>
          <MiniCity />
        </div>
      ) : (
        <div className="rush-shell" aria-label="Delivery Rush game">
          <div className="rush-gamebar">
            <div>
              <span>DELIVERY</span>
              <strong>RUSH</strong>
            </div>
            <div className="rush-metrics" aria-live="polite">
              <div>
                <span>Delivered</span>
                <strong>
                  <AnimatedNumber value={delivered} />
                </strong>
              </div>
              <div className={totalWaiting > 40 ? 'metric-warn' : ''}>
                <span>Waiting</span>
                <strong>
                  <AnimatedNumber value={totalWaiting} />
                </strong>
              </div>
              <div className={time <= 10 ? 'metric-time' : ''}>
                <span>Time Left</span>
                <strong>
                  <AnimatedNumber value={time} />
                  <small>s</small>
                </strong>
              </div>
              <div>
                <span>Budget</span>
                <strong>
                  $<AnimatedNumber value={budget} />
                </strong>
              </div>
            </div>
            <div className="rush-controls">
              <button
                onClick={() =>
                  setPhase(phase === 'paused' ? 'playing' : 'paused')
                }
                aria-label={phase === 'paused' ? 'Resume' : 'Pause'}
              >
                {phase === 'paused' ? <Play /> : <Pause />}
              </button>
              <button onClick={() => reset(hard, true)} aria-label="Restart">
                <RotateCcw />
              </button>
              <button
                onClick={() => setSound((value) => !value)}
                aria-label={sound ? 'Sound off' : 'Sound on'}
              >
                {sound ? <Volume2 /> : <VolumeX />}
              </button>
              <button
                onClick={() => setPhase('preview')}
                aria-label="Exit Game"
              >
                <X />
              </button>
            </div>
          </div>
          <div
            className={`rush-map ${activeEvent === 'rain' ? 'is-raining' : ''}`}
            ref={map}
          >
            <div className="rush-map-grid" />
            <svg
              className="rush-routes"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {AREAS.map((area) => (
                <path
                  key={area.id}
                  className={`route-${areaStats[area.id].congestion}`}
                  d={area.path}
                />
              ))}
            </svg>
            <div className="rush-warehouse">
              <b>HUB</b>
              <span>Dispatch</span>
              {Array.from(
                { length: Math.min(16, Math.ceil(totalWaiting / 4)) },
                (_, index) => (
                  <i key={index} />
                ),
              )}
            </div>
            {AREAS.map((area, index) => {
              const stats = areaStats[area.id];
              return (
                <button
                  type="button"
                  data-area={area.id}
                  key={area.id}
                  className={`rush-area area-${index} status-${stats.congestion} ${drag ? 'can-drop' : ''} ${pulseArea === area.id ? 'area-pulse' : ''}`}
                  style={{ left: `${area.x}%`, top: `${area.y}%` }}
                  onClick={() =>
                    selectedDriver
                      ? assignDriver(selectedDriver, area.id)
                      : undefined
                  }
                  aria-label={`${area.name}, ${waiting[area.id]} packages waiting, ${stats.drivers} drivers`}
                >
                  <span className="rush-buildings">
                    <i />
                    <i />
                    <i />
                  </span>
                  <strong>{area.name}</strong>
                  <small>{waiting[area.id]} waiting</small>
                  <span className="rush-package-stack" aria-hidden="true">
                    {Array.from(
                      { length: Math.min(9, Math.ceil(waiting[area.id] / 3)) },
                      (_, dot) => (
                        <i key={dot} />
                      ),
                    )}
                  </span>
                </button>
              );
            })}
            {AREAS.map((area) => (
              <button
                key={`route-${area.id}`}
                className={`rush-route-button route-button-${area.id} status-${areaStats[area.id].congestion}`}
                onClick={() => setRouteChoice(area.id)}
                aria-label={`Open ${area.name} route options. ${areaStats[area.id].congestion} traffic.`}
              >
                {areaStats[area.id].congestion === 'blue'
                  ? 'Flowing'
                  : areaStats[area.id].congestion === 'orange'
                    ? 'Slowing'
                    : 'Congested'}
              </button>
            ))}
            <div className="rush-drivers" aria-label="Drivers">
              {drivers.map((driver) => (
                <button
                  key={driver.id}
                  className={`${selectedDriver === driver.id ? 'is-selected' : ''} ${driver.unavailable ? 'is-unavailable' : ''} ${driver.emergency ? 'is-emergency' : ''}`}
                  onClick={() =>
                    !driver.unavailable &&
                    setSelectedDriver(
                      selectedDriver === driver.id ? null : driver.id,
                    )
                  }
                  onPointerDown={(event) => {
                    if (driver.unavailable) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    dragId.current = driver.id;
                    setDrag({
                      id: driver.id,
                      x: event.clientX,
                      y: event.clientY,
                    });
                  }}
                  onPointerMove={(event) =>
                    drag?.id === driver.id &&
                    setDrag({
                      id: driver.id,
                      x: event.clientX,
                      y: event.clientY,
                    })
                  }
                  onPointerUp={finishDrag}
                  onPointerCancel={() => {
                    dragId.current = null;
                    setDrag(null);
                  }}
                  aria-label={`Driver ${driver.id}${driver.unavailable ? ', temporarily unavailable' : driver.area ? `, assigned to ${driver.area}` : ', available. Select then choose an area'}`}
                >
                  <span>▰</span>
                  <small>
                    {driver.unavailable
                      ? 'REPAIR'
                      : driver.area
                        ? areaStats[driver.area].congestion.toUpperCase()
                        : 'READY'}
                  </small>
                </button>
              ))}
            </div>
            {drag && (
              <div
                className="rush-drag-ghost"
                style={{ left: drag.x, top: drag.y }}
              >
                ▰
              </div>
            )}
            <button
              className="rush-emergency"
              disabled={emergencyUses > 0}
              onClick={emergency}
            >
              <Zap size={16} />
              {emergencyUses ? 'Emergency Driver Used' : 'Emergency Driver'}
              <small>{emergencyUses ? 'DISPATCHED' : '− $250'}</small>
            </button>
            <button
              className="rush-help"
              onClick={() => {
                setPhase('tutorial');
                setTutorialStep('drag');
              }}
              aria-label="Show game hint"
            >
              <CircleHelp />
            </button>
            <AnimatePresence>
              {eventMessage && (
                <motion.div
                  className="rush-event"
                  initial={{ y: -14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                >
                  {eventMessage}
                </motion.div>
              )}
            </AnimatePresence>
            {activeEvent === 'rain' && (
              <div className="rush-rain" aria-hidden="true">
                {Array.from({ length: reduced ? 8 : 20 }, (_, index) => (
                  <i key={index} />
                ))}
              </div>
            )}
            {routeChoice && (
              <dialog
                open
                className="rush-route-choice"
                aria-label={`${AREAS.find((area) => area.id === routeChoice)?.name} route options`}
              >
                <strong>
                  {AREAS.find((area) => area.id === routeChoice)?.name} route
                </strong>
                <span>{waiting[routeChoice]} deliveries are waiting.</span>
                <button onClick={() => divert(routeChoice)}>
                  Move some deliveries
                </button>
                <button onClick={() => setRouteChoice(null)}>
                  Keep current plan
                </button>
              </dialog>
            )}
            {phase === 'tutorial' && (
              <div className="rush-tutorial">
                <button
                  className="tutorial-skip"
                  onClick={() => setPhase('playing')}
                >
                  Skip
                </button>
                <div className="tutorial-hand">☝</div>
                <p>
                  {tutorialStep === 'drag'
                    ? 'Drag a driver to the busy area.'
                    : 'Great. Keep the city moving.'}
                </p>
              </div>
            )}
            {phase === 'paused' && (
              <div className="rush-paused">
                <Pause />
                <h3>City paused</h3>
                <button onClick={() => setPhase('playing')}>Resume</button>
              </div>
            )}
            {phase === 'result' && (
              <motion.div
                className="rush-result"
                initial={reduced ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span>SHIFT COMPLETE</span>
                <h3>{title}</h3>
                <p>
                  You delivered {rate}% of today’s packages{' '}
                  {budget >= 650
                    ? 'while staying within budget.'
                    : 'after calling in extra support.'}
                </p>
                <div className="rush-result-grid">
                  <div>
                    <strong>{rate}%</strong>
                    <span>Delivered rate</span>
                  </div>
                  <div>
                    <strong>{delivered}</strong>
                    <span>Packages delivered</span>
                  </div>
                  <div>
                    <strong>{totalWaiting}</strong>
                    <span>Still waiting</span>
                  </div>
                  <div>
                    <strong>${budget}</strong>
                    <span>Budget remaining</span>
                  </div>
                  <div>
                    <strong>{emergencyUses}</strong>
                    <span>Emergency drivers</span>
                  </div>
                </div>
                <p className="rush-real-world">
                  In real-world operations, the decisions you just made are part
                  of capacity planning and dynamic route allocation—balancing
                  demand, available drivers, time, and cost.
                </p>
                <div className="rush-result-actions">
                  <button
                    onClick={() => {
                      setRound((value) => value + 1);
                      reset(false, true);
                    }}
                  >
                    <RefreshCw /> Play Again
                  </button>
                  <button
                    onClick={() => {
                      setRound((value) => value + 1);
                      reset(true, true);
                    }}
                  >
                    <Zap /> Try a Harder Day
                  </button>
                  <button onClick={onSeeProject}>
                    See the Project Behind the Game <ArrowRight />
                  </button>
                </div>
                <small>
                  Synthetic simulation inspired by real operational
                  decision-making.
                </small>
              </motion.div>
            )}
          </div>
          <div className="rush-statusline">
            <span>
              {selectedDriver
                ? `Driver ${selectedDriver} selected — choose an area`
                : 'Drag a driver, or select one and choose an area'}
            </span>
            <span>
              {hard
                ? 'HARDER DAY'
                : time > 45
                  ? 'CALM START'
                  : time > 15
                    ? 'DISRUPTION'
                    : 'RECOVERY'}
            </span>
          </div>
        </div>
      )}
      <div className="rush-notes">
        <div>
          <span>Why I Built It</span>
          <p>
            To make the trade-offs behind a delivery operation understandable
            through action.
          </p>
        </div>
        <div>
          <span>Interaction Design</span>
          <p>
            Three direct choices: assign drivers, divert a busy route, or call
            emergency support.
          </p>
        </div>
        <div>
          <span>Simulation Logic</span>
          <p>
            Demand, available vehicles and disruptions combine into simple,
            explainable congestion rules.
          </p>
        </div>
        <div>
          <span>Tech Stack</span>
          <p>React, TypeScript, Motion and a responsive CSS/SVG city map.</p>
        </div>
        <div>
          <span>What It Demonstrates</span>
          <p>
            State management, animation, data visualization and translating
            operational logic into a product experience.
          </p>
        </div>
      </div>
    </section>
  );
}
