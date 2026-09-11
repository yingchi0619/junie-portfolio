/** One road graph drives simulation, 3D rendering, canvas fallback and input. */
export type Point = { x: number; z: number };
export type Phase =
  | 'preview'
  | 'ready'
  | 'drawing'
  | 'driving'
  | 'level'
  | 'result';
export type Notice =
  | 'start'
  | 'nice'
  | 'blocked'
  | 'road'
  | 'fuel'
  | 'coffee'
  | 'express'
  | 'perfect'
  | 'complete'
  | 'traffic'
  | 'timeout';
export type DeliveryEvent = {
  node: number;
  from: Point;
  time: number;
  gold: boolean;
  combo: number;
};
export const SQ = Math.SQRT1_2;
export const START = 20;
export const TOTAL = 14;
export const point = (id: number): Point => ({
  x: ((id % 5) - 2) * 3,
  z: (Math.floor(id / 5) - 2) * 3,
});
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.z - b.z);
export const edgeKey = (a: number, b: number) =>
  `${Math.min(a, b)}:${Math.max(a, b)}`;
export const neighbors = (id: number) =>
  [
    id % 5 > 0 ? id - 1 : -1,
    id % 5 < 4 ? id + 1 : -1,
    id >= 5 ? id - 5 : -1,
    id < 20 ? id + 5 : -1,
  ].filter((i) => i >= 0);
export const ROADS = Array.from({ length: 25 }, (_, a) =>
  neighbors(a)
    .filter((b) => b > a)
    .map((b) => ({ a, b, key: edgeKey(a, b) })),
).flat();
export const LEVELS = [
  {
    targets: [21, 23, 13],
    closed: [] as string[],
    coffee: -1,
    traffic: [] as string[],
    tank: 37,
    names: ['First light', '初见街区'],
  },
  {
    targets: [15, 5, 7, 9, 19],
    closed: [edgeKey(7, 8)],
    coffee: 10,
    traffic: [] as string[],
    tank: 61,
    names: ['A little detour', '绕路也精彩'],
  },
  {
    targets: [15, 5, 2, 9, 19, 23],
    closed: [edgeKey(6, 7)],
    coffee: 10,
    traffic: [edgeKey(9, 14), edgeKey(18, 19)],
    tank: 70,
    names: ['After the rain', '雨后冲刺'],
  },
];
export function layout(w: number, h: number) {
  return { scale: Math.min(w / 24.8, h / 22), cx: w / 2, cy: h * 0.57 };
}
export function project(
  p: Point,
  w: number,
  h: number,
  y = 0,
  camera: Point = { x: 0, z: 0 },
) {
  const l = layout(w, h),
    x = p.x - camera.x,
    z = p.z - camera.z;
  return {
    x: l.cx + (x - z) * SQ * l.scale,
    y: l.cy + ((x + z) * SQ * 0.8 - y * 0.6) * l.scale,
  };
}
export function unproject(
  x: number,
  y: number,
  w: number,
  h: number,
  camera: Point = { x: 0, z: 0 },
): Point {
  const l = layout(w, h),
    u = (x - l.cx) / l.scale,
    v = (y - l.cy) / l.scale / 0.8;
  return { x: (u + v) * SQ + camera.x, z: (v - u) * SQ + camera.z };
}
export function shortest(a: number, b: number, level: number) {
  const q = [a],
    costs = new Map([[a, 0]]),
    closed = LEVELS[level].closed;
  for (let i = 0; i < q.length; i++) {
    const n = q[i];
    if (n === b) return costs.get(n)!;
    for (const next of neighbors(n))
      if (!costs.has(next) && !closed.includes(edgeKey(n, next))) {
        costs.set(next, costs.get(n)! + 3);
        q.push(next);
      }
  }
  return Infinity;
}
export function optimal(level: number, targets = LEVELS[level].targets) {
  const t = targets,
    memo = new Map<string, number>();
  const solve = (n: number, mask: number): number => {
    if (mask === (1 << t.length) - 1) return 0;
    const k = `${n}/${mask}`;
    if (memo.has(k)) return memo.get(k)!;
    let v = Infinity;
    for (let i = 0; i < t.length; i++)
      if (!(mask & (1 << i)))
        v = Math.min(
          v,
          shortest(n, t[i], level) + solve(t[i], mask | (1 << i)),
        );
    memo.set(k, v);
    return v;
  };
  return solve(START, 0);
}
export type Sample = Point & { edge: string; turn: boolean; at: number };
/** Round only inside the road corridor; sample by distance, never by pointer event count. */
export function routeSamples(nodes: number[]): Sample[] {
  const raw: Array<Point & { edge: string; turn: boolean }> = [];
  const line = (a: Point, b: Point, edge: string, turn = false) => {
    const steps = Math.max(1, Math.ceil(distance(a, b) / 0.07));
    for (let i = 1; i <= steps; i++)
      raw.push({
        x: a.x + ((b.x - a.x) * i) / steps,
        z: a.z + ((b.z - a.z) * i) / steps,
        edge,
        turn,
      });
  };
  let cursor = point(nodes[0]);
  raw.push({ ...cursor, edge: '', turn: false });
  for (let i = 1; i < nodes.length; i++) {
    const p = point(nodes[i]),
      prev = point(nodes[i - 1]),
      next = i < nodes.length - 1 ? point(nodes[i + 1]) : null,
      key = edgeKey(nodes[i - 1], nodes[i]);
    const corner =
      next &&
      Math.abs(
        (p.x - prev.x) * (next.z - p.z) - (p.z - prev.z) * (next.x - p.x),
      ) > 0.1;
    if (corner && next) {
      const r = 0.32,
        enter = {
          x: p.x + ((prev.x - p.x) / 3) * r,
          z: p.z + ((prev.z - p.z) / 3) * r,
        },
        exit = {
          x: p.x + ((next.x - p.x) / 3) * r,
          z: p.z + ((next.z - p.z) / 3) * r,
        };
      line(cursor, enter, key);
      let last = enter;
      for (let j = 1; j <= 10; j++) {
        const t = j / 10,
          np = {
            x: (1 - t) ** 2 * enter.x + 2 * (1 - t) * t * p.x + t * t * exit.x,
            z: (1 - t) ** 2 * enter.z + 2 * (1 - t) * t * p.z + t * t * exit.z,
          };
        line(last, np, j < 6 ? key : edgeKey(nodes[i], nodes[i + 1]), true);
        last = np;
      }
      cursor = exit;
    } else {
      line(cursor, p, key);
      cursor = p;
    }
  }
  let at = 0;
  return raw.map((p, i) => {
    if (i) at += distance(raw[i - 1], p);
    return { ...p, at };
  });
}
export function deliveryDashTitle(v: {
  efficiency: number;
  bestCombo: number;
  express: boolean;
  elapsed: number;
  won?: boolean;
}) {
  if (v.won === false) return 'Scenic Driver';
  if (v.express) return 'Express Hero';
  if (v.efficiency >= 88) return 'Route Genius';
  if (v.elapsed <= 48) return 'Speed Courier';
  if (v.bestCombo >= 4) return 'Smooth Operator';
  return 'Scenic Driver';
}
export class DashGame {
  phase: Phase = 'preview';
  level = 0;
  hard = false;
  paused = false;
  elapsed = 0;
  levelTime = 0;
  clock = 0;
  timeLimit = 72;
  fuel = 37;
  score = 0;
  delivered = new Set<number>();
  count = 0;
  combo = 0;
  bestCombo = 0;
  lastDelivery = -100;
  route: number[] = [];
  samples: Sample[] = [];
  progress = 0;
  index = 0;
  van = point(START);
  vanNode = START;
  heading = 0;
  totalDistance = 0;
  stageDistance = 0;
  routeCount = 0;
  repeated = 0;
  stageRepeated = 0;
  roadVisits = new Set<string>();
  expressNode = 4;
  expressCollected = false;
  boostUntil = 0;
  coffeeUsed = false;
  events: DeliveryEvent[] = [];
  notice: Notice = 'start';
  noticeUntil = 0;
  invalid: Point | null = null;
  tutorial = true;
  transition = 0;
  won = false;
  perfectCount = 0;
  bonusFuel = 0;
  rainTurns = 0;
  trafficWait = 0;
  boostedDistance = 0;
  camera = { x: 0, z: 0 };
  finalScore = 0;
  private rng = 0;
  private completionAwarded = false;
  constructor() {
    this.reset(false, true, 17);
    this.phase = 'preview';
  }
  reset(
    hard = false,
    tutorial = true,
    seed = Math.floor(Math.random() * 99999),
  ) {
    this.hard = hard;
    this.tutorial = tutorial;
    this.paused = false;
    this.level = 0;
    this.elapsed = 0;
    this.clock = 0;
    this.timeLimit = hard ? 62 : 72;
    this.score = 0;
    this.count = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.lastDelivery = -100;
    this.totalDistance = 0;
    this.repeated = 0;
    this.expressCollected = false;
    this.perfectCount = 0;
    this.bonusFuel = 0;
    this.won = false;
    this.finalScore = 0;
    this.rng = seed;
    this.rainTurns = 0;
    this.trafficWait = 0;
    this.boostedDistance = 0;
    this.camera = { x: 0, z: 0 };
    this.newLevel();
  }
  get config() {
    return LEVELS[this.level];
  }
  get tank() {
    return this.config.tank * (this.hard ? 0.86 : 1);
  }
  get remaining() {
    return Math.max(0, this.timeLimit - this.elapsed);
  }
  get plannedLength() {
    return this.route.length < 2 ? 0 : routeSamples(this.route).at(-1)!.at;
  }
  get fuelPercent() {
    return Math.max(0, (this.fuel / this.tank) * 100);
  }
  get previewFuel() {
    return Math.max(0, ((this.fuel - this.plannedLength) / this.tank) * 100);
  }
  get expressActive() {
    return (
      this.level === 2 &&
      !this.expressCollected &&
      this.levelTime >= 1.2 &&
      this.levelTime < (this.hard ? 11 : 15)
    );
  }
  get finalApproach() {
    const last = this.config.targets.find(n => !this.delivered.has(n));
    return this.level === 2 && this.delivered.size === 5 && last !== undefined && distance(this.van, point(last)) < 1.8;
  }
  get efficiency() {
    const baseline = Array.from({ length: this.level + 1 }, (_, i) =>
      optimal(i, i === this.level && !this.won ? [...this.delivered] : LEVELS[i].targets),
    ).reduce((a, b) => a + b, 0);
    return this.totalDistance > 0
      ? Math.min(100, Math.round((baseline / this.totalDistance) * 100))
      : 0;
  }
  trafficRed(key: string) {
    const i = this.config.traffic.indexOf(key);
    return i >= 0 && (this.levelTime + i * 2.4) % 5.2 < 2.7;
  }
  say(n: Notice, seconds = 2) {
    this.notice = n;
    this.noticeUntil = this.clock + seconds;
  }
  newLevel() {
    this.levelTime = 0;
    this.delivered = new Set();
    this.route = [];
    this.samples = [];
    this.progress = 0;
    this.index = 0;
    this.van = point(START);
    this.vanNode = START;
    this.heading = 0;
    this.fuel = this.tank;
    this.stageDistance = 0;
    this.stageRepeated = 0;
    this.routeCount = 0;
    this.roadVisits = new Set();
    this.events = [];
    this.coffeeUsed = false;
    this.boostUntil = 0;
    this.invalid = null;
    this.completionAwarded = false;
    this.expressNode = this.rng % 2 ? 17 : 12;
    this.phase = 'ready';
    this.say('start', 0);
  }
  begin(p: Point) {
    if (this.paused || !['ready', 'drawing'].includes(this.phase)) return false;
    if (distance(p, this.van) > 1.5) {
      this.say('start');
      return false;
    }
    this.route = [this.vanNode];
    this.phase = 'drawing';
    this.invalid = null;
    return true;
  }
  append(node: number) {
    if (this.phase !== 'drawing' || this.paused) return false;
    const last = this.route.at(-1)!;
    if (last === node) return true;
    if (!neighbors(last).includes(node)) {
      this.invalid = point(node);
      this.say('road', 0.8);
      return false;
    }
    if (this.config.closed.includes(edgeKey(last, node))) {
      this.invalid = point(node);
      this.say('blocked', 1.2);
      return false;
    }
    if (this.route.length > 1 && this.route.at(-2) === node) {
      this.route.pop();
      this.invalid = null;
      return true;
    }
    const next = [...this.route, node];
    if (routeSamples(next).at(-1)!.at > this.fuel + 0.03) {
      this.invalid = point(node);
      this.say('fuel');
      return false;
    }
    this.route = next;
    this.invalid = null;
    return true;
  }
  draw(p: Point) {
    if (this.phase !== 'drawing') return;
    const gx = Math.round((p.x + 6) / 3),
      gz = Math.round((p.z + 6) / 3);
    if (gx < 0 || gx > 4 || gz < 0 || gz > 4) return;
    const node = gz * 5 + gx;
    if (distance(point(node), p) < 1.05) this.append(node);
    else {
      const road = Math.min(
        Math.abs(p.x - (gx * 3 - 6)),
        Math.abs(p.z - (gz * 3 - 6)),
      );
      if (road > 0.8) {
        this.invalid = p;
        this.say('road', 0.7);
      }
    }
  }
  undo() {
    if (this.phase === 'drawing' && this.route.length > 1) this.route.pop();
  }
  cancel() {
    if (this.phase === 'drawing') {
      this.route = [];
      this.phase = 'ready';
      this.invalid = null;
    }
  }
  keyboard(dx: number, dz: number) {
    if (this.phase === 'ready') this.begin(this.van);
    if (this.phase !== 'drawing') return;
    const n = this.route.at(-1)!,
      x = (n % 5) + dx,
      z = Math.floor(n / 5) + dz;
    if (x >= 0 && x < 5 && z >= 0 && z < 5) this.append(z * 5 + x);
  }
  release() {
    if (this.phase !== 'drawing' || this.paused) return false;
    if (this.route.length < 2) {
      this.cancel();
      return false;
    }
    this.samples = routeSamples(this.route);
    this.progress = 0;
    this.index = 0;
    this.routeCount++;
    for (let i = 1; i < this.route.length; i++) {
      const k = edgeKey(this.route[i - 1], this.route[i]);
      if (this.roadVisits.has(k)) {
        this.repeated++;
        this.stageRepeated++;
      }
      this.roadVisits.add(k);
    }
    this.phase = 'driving';
    this.invalid = null;
    return true;
  }
  finish(won: boolean) {
    this.phase = 'result';
    this.won = won;
    this.samples = [];
    this.route = [];
    this.finalScore = Math.max(
      0,
      Math.round(
        this.score +
          (won ? this.remaining * 12 : 0) +
          this.bonusFuel * 3 +
          this.fuelPercent * 2 -
          this.totalDistance * 2 -
          this.repeated * 55,
      ),
    );
  }
  tick(seconds: number) {
    if (this.paused || this.phase === 'result' || this.phase === 'preview')
      return;
    const dt = Math.min(0.05, Math.max(0, seconds));
    this.clock += dt;
    this.events = this.events.filter((e) => this.clock - e.time < 3);
    if (this.phase === 'level') {
      this.transition -= dt;
      if (this.transition <= 0) {
        if (this.level === 2) this.finish(true);
        else {
          this.level++;
          this.newLevel();
        }
      }
      return;
    }
    this.elapsed += dt;
    this.levelTime += dt;
    if (this.remaining <= 0) {
      this.say('timeout');
      this.finish(false);
      return;
    }
    if (this.phase !== 'driving') return;
    const nextSample =
      this.samples[Math.min(this.index + 1, this.samples.length - 1)];
    if (!nextSample) return;
    if (this.trafficRed(nextSample.edge)) {
      this.trafficWait += dt;
      this.say('traffic', 0.25);
      return;
    }
    const rain = this.level === 2 && nextSample.turn,
      boost = this.clock < this.boostUntil;
    const speed =
      (this.hard ? 3.05 : 3.25) * (rain ? 0.64 : 1) * (boost ? 1.7 : 1) * (this.finalApproach ? .62 : 1);
    const step = Math.min(
      dt * speed,
      this.fuel,
      this.samples.at(-1)!.at - this.progress,
    );
    this.progress += step;
    this.totalDistance += step;
    this.stageDistance += step;
    this.fuel = Math.max(0, this.fuel - step);
    if (rain) this.rainTurns += dt;
    if (boost) this.boostedDistance += step;
    while (
      this.index < this.samples.length - 2 &&
      this.samples[this.index + 1].at < this.progress
    )
      this.index++;
    const a = this.samples[this.index],
      b = this.samples[Math.min(this.index + 1, this.samples.length - 1)],
      t = Math.max(
        0,
        Math.min(1, (this.progress - a.at) / Math.max(0.001, b.at - a.at)),
      );
    this.van = { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
    if (distance(a, b) > 0.001) this.heading = Math.atan2(b.x - a.x, b.z - a.z);
    for (const n of this.config.targets)
      if (!this.delivered.has(n) && distance(this.van, point(n)) < 0.58) {
        this.delivered.add(n);
        this.count++;
        this.combo = this.clock - this.lastDelivery < 3.4 ? this.combo + 1 : 1;
        this.lastDelivery = this.clock;
        this.bestCombo = Math.max(this.bestCombo, this.combo);
        this.score += 250 + Math.max(0, this.combo - 1) * 65;
        this.events.push({
          node: n,
          from: { ...this.van },
          time: this.clock,
          gold: false,
          combo: this.combo,
        });
        if (this.tutorial) {
          this.tutorial = false;
          this.say('nice', 2);
        }
      }
    if (
      this.expressActive &&
      distance(this.van, point(this.expressNode)) < 0.6
    ) {
      this.expressCollected = true;
      this.score += 1100;
      this.events.push({
        node: this.expressNode,
        from: { ...this.van },
        time: this.clock,
        gold: true,
        combo: this.combo,
      });
      this.say('express');
    }
    if (
      !this.coffeeUsed &&
      this.config.coffee >= 0 &&
      distance(this.van, point(this.config.coffee)) < 0.65
    ) {
      this.coffeeUsed = true;
      this.boostUntil = this.clock + 2.6;
      this.say('coffee');
    }
    if (
      this.delivered.size === this.config.targets.length &&
      !this.completionAwarded
    ) {
      this.completionAwarded = true;
      const perfect =
        this.stageRepeated === 0 &&
        this.routeCount === 1 &&
        this.fuelPercent >= 18;
      if (perfect) {
        this.score += this.config.targets.length * 250 * 2;
        this.perfectCount++;
      }
      this.bonusFuel += this.fuelPercent;
      this.say(perfect ? 'perfect' : 'complete', 1.7);
      this.phase = 'level';
      this.transition = 1.65;
      return;
    }
    if (this.fuel < 0.001) {
      this.say('fuel');
      this.finish(false);
      return;
    }
    if (this.progress >= this.samples.at(-1)!.at - 0.001) {
      this.vanNode = this.route.at(-1)!;
      this.van = point(this.vanNode);
      this.route = [];
      this.samples = [];
      this.phase = 'ready';
    }
  }
}
