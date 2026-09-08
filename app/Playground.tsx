'use client';
import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { RotateCcw, ArrowUpRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
export function calculateCapacity(
  volume: number,
  drivers: number,
  perDriver: number,
) {
  const capacity = drivers * perDriver;
  return {
    capacity,
    load: Math.round((volume / capacity) * 100),
    gap: Math.max(0, volume - capacity),
    spare: Math.max(0, capacity - volume),
  };
}
function NumberValue({
  value,
  suffix = '',
}: {
  value: number;
  suffix?: string;
}) {
  const el = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  const reduced = useReducedMotion();
  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (reduced) {
      if (el.current) el.current.textContent = value.toLocaleString();
      return;
    }
    const controls = animate(from, value, {
      duration: 0.5,
      onUpdate: (v) => {
        if (el.current) el.current.textContent = Math.round(v).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [value, reduced]);
  return (
    <>
      <span ref={el}>{value.toLocaleString()}</span>
      {suffix}
    </>
  );
}
const presets = {
  Normal: [1200, 10, 150],
  'Peak Day': [2400, 10, 150],
  'Driver Shortage': [1200, 5, 150],
} as const;
export default function Playground() {
  const [values, setValues] = useState<number[]>([...presets.Normal]);
  const [preset, setPreset] = useState('Normal');
  const [volume, drivers, perDriver] = values;
  const { capacity, load, gap, spare } = calculateCapacity(
    volume,
    drivers,
    perDriver,
  );
  const congested = load > 100;
  const apply = (name: keyof typeof presets) => {
    setValues([...presets[name]]);
    setPreset(name);
  };
  return (
    <section id="playground" className="playground section">
      <div className="section-top">
        <span className="eyebrow">02 / OPERATIONS PLAYGROUND</span>
        <span className="synthetic">
          <i /> Synthetic demo data
        </span>
      </div>
      <div className="play-heading">
        <h2>
          Change the inputs.
          <br />
          <span>See the system respond.</span>
        </h2>
        <p>
          The question behind capacity operations:
          <br />
          can the available drivers handle the volume?
          <br />
          Explore the trade-off yourself.
        </p>
      </div>
      <div className="play-surface">
        <div className="play-controls">
          <div className="presets" aria-label="Capacity presets">
            {Object.keys(presets).map((name) => (
              <button
                key={name}
                aria-pressed={preset === name}
                onClick={() => apply(name as keyof typeof presets)}
              >
                {name}
              </button>
            ))}
          </div>
          {[
            {
              label: 'Daily parcels',
              min: 300,
              max: 3600,
              step: 100,
              unit: 'parcels',
            },
            {
              label: 'Available drivers',
              min: 1,
              max: 30,
              step: 1,
              unit: 'drivers',
            },
            {
              label: 'Capacity per driver',
              min: 50,
              max: 250,
              step: 10,
              unit: 'parcels / day',
            },
          ].map((s, i) => (
            <div className="play-slider" key={s.label}>
              <div>
                <span id={`input-${i}`}>{s.label}</span>
                <strong>
                  {values[i].toLocaleString()} <small>{s.unit}</small>
                </strong>
              </div>
              <Slider
                aria-labelledby={`input-${i}`}
                min={s.min}
                max={s.max}
                step={s.step}
                value={[values[i]]}
                onValueChange={(v) => {
                  setValues((old) =>
                    old.map((n, j) =>
                      j === i ? (Array.isArray(v) ? v[0] : v) : n,
                    ),
                  );
                  setPreset('Custom');
                }}
              />
              <div className="range-labels">
                <span>{s.min}</span>
                <span>{s.max.toLocaleString()}</span>
              </div>
            </div>
          ))}
          <button
            className="text-button reset-button"
            onClick={() => apply('Normal')}
          >
            <RotateCcw size={15} /> Reset to Normal
          </button>
        </div>
        <div className={`network-result ${congested ? 'congested' : ''}`}>
          <div className="result-top">
            <span>LIVE CAPACITY MODEL</span>
            <span className="status-dot">
              {congested
                ? 'Over capacity'
                : load === 100
                  ? 'At capacity'
                  : 'Flowing'}
            </span>
          </div>
          <svg
            viewBox="0 0 540 225"
            className="operations-network"
            aria-label={
              congested
                ? 'Network congested: demand exceeds capacity'
                : 'Network flowing within available capacity'
            }
          >
            <defs>
              <linearGradient id="route-shade">
                <stop stopColor="#47677c" />
                <stop offset="1" stopColor="#b6dfff" />
              </linearGradient>
            </defs>
            {[60, 112, 165].map((y, i) => (
              <g key={y}>
                <path
                  className="ops-route"
                  d={`M85 112 C180 112 180 ${y} 275 ${y} S380 112 455 112`}
                  fill="none"
                  stroke="url(#route-shade)"
                />
                <path
                  className="ops-packet"
                  style={{
                    animationDuration: `${congested ? 6 : 2.6}s`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                  d={`M85 112 C180 112 180 ${y} 275 ${y} S380 112 455 112`}
                  fill="none"
                  stroke="#d4efff"
                  strokeWidth={congested ? 4 : 3}
                  strokeDasharray={congested ? '2 8 2 8 2 180' : '5 200'}
                />
                <circle
                  cx="275"
                  cy={y}
                  r={congested ? 15 : 9}
                  className="ops-hub"
                />
                <circle cx="275" cy={y} r="3" fill="#d7efff" />
              </g>
            ))}
            <circle cx="85" cy="112" r="30" fill="#19262e" stroke="#577587" />
            <circle cx="455" cy="112" r="30" fill="#19262e" stroke="#9bbcd0" />
            <text x="85" y="117" textAnchor="middle">
              IN
            </text>
            <text x="455" y="117" textAnchor="middle">
              OUT
            </text>
            <text className="svg-label" x="85" y="174" textAnchor="middle">
              {volume.toLocaleString()} PARCELS
            </text>
            <text className="svg-label" x="455" y="174" textAnchor="middle">
              {capacity.toLocaleString()} CAPACITY
            </text>
            <text className="svg-label" x="275" y="211" textAnchor="middle">
              AGGREGATE FLOW / ILLUSTRATIVE NETWORK
            </text>
          </svg>
          <div className="result-metrics" aria-live="polite" aria-atomic="true">
            <div>
              <span>Capacity load</span>
              <strong>
                <NumberValue value={load} />
                <small>%</small>
              </strong>
            </div>
            <div>
              <span>Capacity gap</span>
              <strong>
                <NumberValue value={gap} />
              </strong>
              <small>parcels / day</small>
            </div>
            <div>
              <span>Spare capacity</span>
              <strong>
                <NumberValue value={spare} />
              </strong>
              <small>parcels / day</small>
            </div>
          </div>
          <div className="load-meter">
            <div style={{ width: `${Math.min(load / 2, 100)}%` }} />
            <i />
          </div>
          <div className="load-meter-label">
            <span>0%</span>
            <span>100% capacity</span>
            <span>200%+</span>
          </div>
          <p className="scenario-verdict">
            {congested
              ? `${gap.toLocaleString()} parcels exceed daily capacity. Try adding drivers or increasing per-driver capacity.`
              : `${spare.toLocaleString()} parcels of daily capacity remain. Try Peak Day to stress the same system.`}
          </p>
        </div>
      </div>
      <details className="calculation" open>
        <summary>
          How this model works <ArrowUpRight size={16} />
        </summary>
        <div>
          <p>
            <b>Capacity</b> = drivers × parcels per driver
            <br />
            <b>Load</b> = daily parcels ÷ capacity × 100
            <br />
            <b>Gap</b> = max(0, daily parcels − capacity)
          </p>
          <p>
            A deterministic illustration, not a forecast. Assumes equal parcel
            effort and a fixed daily window. Excludes geography, service times,
            costs and delivery performance. The network visualizes aggregate
            load, not actual station routing. No GOFO data is used.
          </p>
        </div>
      </details>
    </section>
  );
}
