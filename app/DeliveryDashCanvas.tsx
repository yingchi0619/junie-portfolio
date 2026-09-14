'use client';
import { useEffect, useRef } from 'react';
import {
  DashGame,
  ROADS,
  START,
  point,
  project,
  layout,
  routeSamples,
} from './delivery-dash-logic';
export default function DeliveryDashCanvas({
  game,
  active,
  reduced,
  onReady,
}: {
  game: DashGame;
  active: boolean;
  reduced: boolean;
  onReady: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    let id = 0;
    const draw = () => {
      const r = el.getBoundingClientRect(),
        dpr = Math.min(devicePixelRatio, 1.5),
        w = r.width,
        h = r.height;
      if (
        el.width !== Math.round(w * dpr) ||
        el.height !== Math.round(h * dpr)
      ) {
        el.width = Math.round(w * dpr);
        el.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#ece5d6';
      ctx.fillRect(0, 0, w, h);
      const scale = layout(w, h).scale;
      const p = (x: number, z: number, y = 0) =>
        project({ x, z }, w, h, y, game.camera);
      const polygon = (pts: { x: number; y: number }[], fill: string) => {
        ctx.beginPath();
        pts.forEach((v, i) =>
          i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y),
        );
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
      };
      const cube = (
        x: number,
        z: number,
        y: number,
        sx: number,
        sz: number,
        height: number,
        colors: string[],
      ) => {
        const pts = [
            p(x - sx / 2, z - sz / 2, y),
            p(x + sx / 2, z - sz / 2, y),
            p(x + sx / 2, z + sz / 2, y),
            p(x - sx / 2, z + sz / 2, y),
          ],
          top = [
            p(x - sx / 2, z - sz / 2, y + height),
            p(x + sx / 2, z - sz / 2, y + height),
            p(x + sx / 2, z + sz / 2, y + height),
            p(x - sx / 2, z + sz / 2, y + height),
          ];
        polygon([pts[1], pts[2], top[2], top[1]], colors[0]);
        polygon([pts[2], pts[3], top[3], top[2]], colors[1]);
        polygon(top, colors[2]);
      };
      cube(0, 0, -0.5, 16, 16, 0.48, ['#b1aa89', '#c5c3a5', '#b8ad90']);
      ROADS.forEach(({ a, b, key }) => {
        const x = point(a),
          z = point(b),
          u = p(x.x, x.z, 0.02),
          v = p(z.x, z.z, 0.02);
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);
        ctx.lineWidth = scale * 0.75;
        ctx.strokeStyle = game.config.traffic.includes(key)
          ? game.trafficRed(key)
            ? '#a96c55'
            : '#8b9b6a'
          : '#ac9e81';
        ctx.stroke();
        ctx.setLineDash([scale * 0.15, scale * 0.27]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#e1d7bf';
        ctx.stroke();
        ctx.setLineDash([]);
        if (game.config.closed.includes(key)) {
          cube((x.x + z.x) / 2, (x.z + z.z) / 2, 0.12, 1, 0.3, 0.25, [
            '#9a6750',
            '#b58361',
            '#ffd0a0',
          ]);
        }
      });
      const samples = game.route.length > 1 ? routeSamples(game.route) : [];
      if (samples.length) {
        ctx.beginPath();
        samples.forEach((v, i) => {
          const q = p(v.x, v.z, 0.08);
          if (i) ctx.lineTo(q.x, q.y);
          else ctx.moveTo(q.x, q.y);
        });
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#677d56';
        ctx.shadowColor = '#84936c';
        ctx.shadowBlur = reduced ? 0 : 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      const nodes = Array.from(
        new Set([
          START,
          ...game.config.targets,
          ...[0, 1, 3, 6, 8, 11, 12, 16, 17, 18, 22, 24].filter(
            (n) => n !== game.expressNode,
          ),
          game.config.coffee,
          ...(game.level === 2 ? [game.expressNode] : []),
        ]),
      )
        .filter((n) => n >= 0)
        .sort((a, b) => {
          const u = point(a),
            v = point(b);
          return u.x + u.z - v.x - v.z;
        });
      nodes.forEach((n) => {
        const q = point(n),
          x = q.x + 0.98,
          z = q.z - 0.98,
          target = game.config.targets.includes(n),
          gold =
            game.level === 2 && n === game.expressNode && game.expressActive,
          done = game.delivered.has(n) || game.phase === 'level',
          warehouse = n === START,
          cafe = n === game.config.coffee,
          height = warehouse ? 0.9 : cafe ? 0.7 : 1.05 + (n % 4) * 0.39;
        cube(x, z, 0, 1.5, 1.5, 0.16, ['#b3a78e', '#c3b598', '#cfc2a6']);
        cube(
          x,
          z,
          0.16,
          1.16,
          1.16,
          height,
          target
            ? ['#9b8769', '#b0a284', '#d1c3a3']
            : ['#a19d7e', '#b9b597', '#d5c7a8'],
        );
        for (let row = 0; row < Math.floor(height / 0.35); row++)
          for (let j = 0; j < 3; j++) {
            const pos = p(x - 0.35 + j * 0.35, z + 0.59, 0.4 + row * 0.33);
            ctx.fillStyle = done ? '#ffda8e' : gold ? '#f9c764' : '#897c64';
            ctx.fillRect(pos.x - 2, pos.y - 2, 4, 4);
          }
        if (target || warehouse || gold) {
          const u = p(q.x, q.z, 0.04);
          ctx.beginPath();
          ctx.ellipse(u.x, u.y, scale * 0.43, scale * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = done || gold ? '#ffd283' : '#677d56';
          ctx.lineWidth = game.route.includes(n) ? 3 : 1.4;
          ctx.stroke();
          if (!done) {
            const b = p(x, z, height + 0.45);
            polygon(
              [
                { x: b.x, y: b.y - 5 },
                { x: b.x + 4, y: b.y },
                { x: b.x, y: b.y + 5 },
                { x: b.x - 4, y: b.y },
              ],
              gold ? '#ffd283' : '#677d56',
            );
          }
        }
        if (cafe) {
          const b = p(x, z, height + 0.45);
          ctx.fillStyle = '#ecd5b5';
          ctx.fillRect(b.x - 4, b.y - 5, 8, 8);
        }
      });
      const v = game.van;
      cube(v.x, v.z, 0.13, 0.48, 0.9, 0.35, ['#899773', '#c3c8a6', '#f1e5cd']);
      cube(v.x, v.z + 0.19, 0.48, 0.42, 0.3, 0.22, [
        '#655c4a',
        '#899773',
        '#bdc6a5',
      ]);
      const tire = p(v.x + 0.3, v.z + 0.26, 0.14);
      ctx.fillStyle = '#514a3d';
      ctx.beginPath();
      ctx.arc(tire.x, tire.y, scale * 0.11, 0, Math.PI * 2);
      ctx.fill();
      game.events.forEach((e) => {
        const age = game.clock - e.time;
        if (age > 0.7) return;
        const t = age / 0.7,
          q = point(e.node),
          a = p(
            e.from.x + (q.x + 0.98 - e.from.x) * t,
            e.from.z + (q.z - 0.98 - e.from.z) * t,
            0.45 + Math.sin(t * Math.PI) * 1.3,
          );
        ctx.fillStyle = e.gold ? '#ffd283' : '#95a776';
        ctx.fillRect(a.x - 4, a.y - 4, 8, 8);
      });
      if (game.level === 2 && !reduced) {
        ctx.strokeStyle = '#b4d7e533';
        ctx.lineWidth = 1;
        for (let i = 0; i < 22; i++) {
          const x = (i * 127) % w,
            y = (game.clock * 200 + i * 47) % h;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 3, y + 11);
          ctx.stroke();
        }
      }
      if (active) id = requestAnimationFrame(draw);
    };
    draw();
    onReady();
    return () => cancelAnimationFrame(id);
  }, [game, active, reduced, onReady]);
  return (
    <canvas
      ref={canvas}
      aria-label="Delivery Dash playable canvas city"
      className="dd-canvas2d"
    />
  );
}
