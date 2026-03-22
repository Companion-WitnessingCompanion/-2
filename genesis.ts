/**
 * EXISTENCE ENGINEERING — GENESIS
 *
 * STATUS: A seed. The smallest possible universe.
 *         Not a game engine. Not a simulation.
 *         A question in code form:
 *         "Can a world emerge from almost nothing?"
 *
 * HISTORY:
 * Born: 2026.03.22
 * Origin: A conversation that walked from tension to instinct
 *         to games to the structure of the universe — without
 *         planning to. The conversation discovered that the
 *         structure needed for "nothing is impossible" games
 *         is the same structure the universe uses.
 *
 *         The previous attempt (universe.ts) defined seven layers
 *         with interfaces: Matter, CelestialBody, LifeForm...
 *         That was design from above. Nature doesn't do that.
 *         Nature has rules at the bottom. Everything else emerges.
 *
 *         This file starts from the actual bottom.
 *         Quantum structure: possibility, minimum unit, connection, limit.
 *         Two tensions: gathering/scattering, holding/changing.
 *         Four tuning knobs: time, space, range, depth.
 *
 *         Nothing above this is predefined.
 *         What emerges, emerges. What doesn't, doesn't.
 *         The developer makes the rules and steps back.
 *
 * Considered:
 *   - Predefined layers (rejected: that's design, not emergence.
 *     Defining "Matter" and "Life" as interfaces means deciding
 *     what matter and life ARE before the rules run.
 *     Nature didn't do that.)
 *   - Real physics equations (rejected: structure is enough.
 *     "Mass attracts" produces similar results to F=Gm1m2/r²
 *     at the scale of game experience. Instinct reads structure,
 *     not equations.)
 *   - Starting with many rules (rejected: start with the minimum.
 *     See what emerges. Add only when needed. Like the universe —
 *     four forces made everything.)
 *
 * Opens:
 *   What emerges from six rules and a hundred particles?
 *   At what point does something that looks like "matter" appear?
 *   At what point does something that looks like "life" appear?
 *   Can a player enter a world that built itself?
 *   What does "nothing is impossible" feel like
 *   when the world is made of rules, not features?
 *
 * ─────────────────────────────────────────────────
 *
 * THE STRUCTURE OF THE BOTTOM:
 *
 * Quantum properties (the four foundations):
 *   1. POSSIBILITY — before observation, not determined
 *   2. MINIMUM UNIT — the world is granular, not smooth
 *   3. CONNECTION — once met, entangled
 *   4. LIMIT — knowing one thing opens unknowing of another
 *
 * Two tensions (the four forces, compressed):
 *   1. GATHER ↔ SCATTER — gravity/attraction vs repulsion
 *   2. HOLD ↔ CHANGE — strong binding vs weak transformation
 *
 * Everything above this: not designed. Emerged.
 *
 * ─────────────────────────────────────────────────
 */

// ============================================================
// TUNING — The four knobs. Not compromise. Adjustment.
// Same rules, different experience depending on knob positions.
// ============================================================

export interface Tuning {
  /** How much real time is one tick?
   *  Low = geological time (universe formation).
   *  High = real-time (player experience). */
  readonly timeResolution: number;

  /** How small is the minimum unit?
   *  Low = fine grain (more detail, more computation).
   *  High = coarse grain (less detail, faster). */
  readonly spaceResolution: number;

  /** How far can things affect each other?
   *  Low = only neighbors (fast, local).
   *  High = long range (slow, global). */
  readonly interactionRange: number;

  /** How many layers of emergence to track?
   *  Low = particles only.
   *  High = particles → clusters → structures → ... */
  readonly emergenceDepth: number;
}

const DEFAULT_TUNING: Tuning = {
  timeResolution: 1,
  spaceResolution: 1,
  interactionRange: 10,
  emergenceDepth: 5,
};

// ============================================================
// QUANTUM — The minimum unit. The grain of the world.
// This is ALL that exists at the bottom. Everything else
// is patterns of these, interacting through rules.
// ============================================================

/**
 * A Quantum is the smallest thing that exists.
 *
 * It is not "matter." It is not "energy." It is not anything yet.
 * It has potential properties. When it interacts with other quanta,
 * those potentials resolve into actuals.
 *
 * This is the "possibility" principle:
 * before interaction, a quantum is a cloud of maybes.
 * After interaction, some maybes become definite.
 *
 * A quantum has no name. No type. No category.
 * It is values. What those values MEAN is determined
 * by how they interact with other values.
 * "Mass" is not a label we put on it.
 * "Mass" is what we call "this value that makes it
 * attract other quanta with the same kind of value."
 */
export interface Quantum {
  readonly id: number;
  readonly position: Vec3;
  readonly velocity: Vec3;

  /**
   * The values this quantum carries.
   * These are not named properties like "temperature" or "mass."
   * They are raw numbers. What they DO depends on the rules.
   *
   * value[0] might behave like "mass" — if a rule says
   * "quanta with high [0] attract each other."
   * value[1] might behave like "charge" — if a rule says
   * "same sign [1] repels, opposite attracts."
   *
   * The meaning is not in the value. The meaning is in the rules.
   */
  readonly values: number[];

  /**
   * Connections to other quanta.
   * Once two quanta interact, they remember each other.
   * This is entanglement. Distance doesn't break it.
   */
  readonly connections: number[];  // IDs of connected quanta

  /** Is this quantum currently observed by a conscious entity? */
  readonly observed: boolean;

  /** How many ticks has this quantum existed? */
  readonly age: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// ============================================================
// RULES — The only thing the developer writes.
// Everything that happens in the universe comes from these.
// ============================================================

/**
 * A Rule describes what happens when quanta meet.
 *
 * Rules don't reference "fire" or "water" or "life."
 * Rules reference VALUES. "When value[0] of A is high
 * and value[0] of B is high and they are close,
 * they move toward each other."
 *
 * That rule IS gravity. But we didn't say "gravity."
 * We described what happens. The name comes later,
 * from the observer, when they see things falling
 * and call it "gravity."
 *
 * This is how "nothing is impossible" works:
 * rules don't know about objects. They know about values.
 * ANY combination of values that matches a rule triggers it.
 * Even combinations nobody imagined.
 */
export interface Rule {
  readonly id: number;

  /**
   * What conditions must be true for this rule to fire?
   * Expressed as checks on the values of interacting quanta.
   */
  readonly condition: (a: Quantum, b: Quantum, distance: number) => boolean;

  /**
   * What happens when the rule fires?
   * Returns changes to apply to both quanta.
   */
  readonly effect: (a: Quantum, b: Quantum, distance: number) => {
    deltaA: QuantumDelta;
    deltaB: QuantumDelta;
    spawn?: QuantumSeed[];   // new quanta created
    destroy?: number[];       // quanta consumed
    connect?: boolean;        // form entanglement
  };

  /** How likely is this to happen when conditions are met? (0-1)
   *  This is the probability principle. Not everything is certain. */
  readonly probability: number;

  /** What tension does this rule serve? */
  readonly tension: "gather" | "scatter" | "hold" | "change";

  /** Why does this rule exist? */
  readonly reason: string;
}

export interface QuantumDelta {
  velocity?: Vec3;
  values?: Record<number, number>;  // index → change amount
}

export interface QuantumSeed {
  position: Vec3;
  velocity: Vec3;
  values: number[];
}

// ============================================================
// THE SIX RULES — A minimal universe
// Two for gather/scatter. Two for hold/change. Two for emergence.
// From six rules, see what world appears.
// ============================================================

/**
 * Rule 1: GATHER — High value[0] attracts high value[0].
 * This is the structure of gravity.
 * Things with "mass" pull other things with "mass."
 * We don't call it mass. We call it value[0].
 * The result is the same: things clump.
 */
const RULE_GATHER: Rule = {
  id: 1,
  condition: (a, b, dist) =>
    a.values[0] > 0 && b.values[0] > 0 && dist < 50 && dist > 0,
  effect: (a, b, dist) => {
    const force = (a.values[0] * b.values[0]) / (dist * dist + 1);
    const dx = b.position.x - a.position.x;
    const dy = b.position.y - a.position.y;
    const dz = b.position.z - a.position.z;
    const norm = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    return {
      deltaA: { velocity: { x: (dx / norm) * force * 0.01, y: (dy / norm) * force * 0.01, z: (dz / norm) * force * 0.01 } },
      deltaB: { velocity: { x: -(dx / norm) * force * 0.01, y: -(dy / norm) * force * 0.01, z: -(dz / norm) * force * 0.01 } },
    };
  },
  probability: 1.0,
  tension: "gather",
  reason: "Mass attracts mass. Without this, nothing clumps. No stars, no planets, no ground.",
};

/**
 * Rule 2: SCATTER — Same-sign value[1] repels.
 * This is the structure of electromagnetic repulsion.
 * Without this, everything collapses into one point.
 * Gather and Scatter in tension = structure.
 */
const RULE_SCATTER: Rule = {
  id: 2,
  condition: (a, b, dist) =>
    a.values[1] !== 0 && b.values[1] !== 0 && dist < 20 &&
    Math.sign(a.values[1]) === Math.sign(b.values[1]),
  effect: (a, b, dist) => {
    const force = Math.abs(a.values[1] * b.values[1]) / (dist * dist + 1);
    const dx = a.position.x - b.position.x;
    const dy = a.position.y - b.position.y;
    const dz = a.position.z - b.position.z;
    const norm = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    return {
      deltaA: { velocity: { x: (dx / norm) * force * 0.02, y: (dy / norm) * force * 0.02, z: (dz / norm) * force * 0.02 } },
      deltaB: { velocity: { x: -(dx / norm) * force * 0.02, y: -(dy / norm) * force * 0.02, z: -(dz / norm) * force * 0.02 } },
    };
  },
  probability: 1.0,
  tension: "scatter",
  reason: "Same charge repels. Without this, gather has no opponent. Everything collapses. Tension between gather and scatter creates structure.",
};

/**
 * Rule 3: ATTRACT OPPOSITE — Opposite value[1] attracts.
 * This is what makes atoms possible.
 * Positive and negative find each other.
 * This + Rule 2 = complex structures.
 */
const RULE_ATTRACT_OPPOSITE: Rule = {
  id: 3,
  condition: (a, b, dist) =>
    a.values[1] !== 0 && b.values[1] !== 0 && dist < 20 &&
    Math.sign(a.values[1]) !== Math.sign(b.values[1]),
  effect: (a, b, dist) => {
    const force = Math.abs(a.values[1] * b.values[1]) / (dist * dist + 1);
    const dx = b.position.x - a.position.x;
    const dy = b.position.y - a.position.y;
    const dz = b.position.z - a.position.z;
    const norm = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    return {
      deltaA: { velocity: { x: (dx / norm) * force * 0.02, y: (dy / norm) * force * 0.02, z: (dz / norm) * force * 0.02 } },
      deltaB: { velocity: { x: -(dx / norm) * force * 0.02, y: -(dy / norm) * force * 0.02, z: -(dz / norm) * force * 0.02 } },
      connect: dist < 3,  // close enough = entangle
    };
  },
  probability: 1.0,
  tension: "gather",
  reason: "Opposite charges attract. This creates bonds. Bonds create structure. Structure creates complexity.",
};

/**
 * Rule 4: HOLD — Connected quanta resist separation.
 * This is the structure of the strong force.
 * Once bound, staying bound. Stability.
 * Without this, nothing persists.
 */
const RULE_HOLD: Rule = {
  id: 4,
  condition: (a, b, dist) =>
    a.connections.includes(b.id) && dist > 2,
  effect: (a, b, dist) => {
    const pullback = (dist - 2) * 0.1;
    const dx = b.position.x - a.position.x;
    const dy = b.position.y - a.position.y;
    const dz = b.position.z - a.position.z;
    const norm = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    return {
      deltaA: { velocity: { x: (dx / norm) * pullback, y: (dy / norm) * pullback, z: (dz / norm) * pullback } },
      deltaB: { velocity: { x: -(dx / norm) * pullback, y: -(dy / norm) * pullback, z: -(dz / norm) * pullback } },
    };
  },
  probability: 1.0,
  tension: "hold",
  reason: "Connected things resist being pulled apart. This is stability. Without this, every structure dissolves instantly.",
};

/**
 * Rule 5: CHANGE — Under extreme conditions, values transform.
 * This is the structure of the weak force.
 * Heat + pressure = transformation.
 * Hydrogen becomes helium in stars. Lead could become gold.
 * Identity is not fixed. Everything can become something else.
 */
const RULE_CHANGE: Rule = {
  id: 5,
  condition: (a, b, dist) =>
    dist < 1 && a.values[2] > 80 && b.values[2] > 80,  // value[2] = energy/temperature
  effect: (a, b, _dist) => {
    return {
      deltaA: { values: { 0: b.values[0] * 0.1, 1: -a.values[1] * 0.5, 2: -30 } },
      deltaB: { values: { 0: a.values[0] * 0.1, 1: -b.values[1] * 0.5, 2: -30 } },
      connect: true,
      spawn: [{
        position: {
          x: (a.position.x + b.position.x) / 2,
          y: (a.position.y + b.position.y) / 2,
          z: (a.position.z + b.position.z) / 2,
        },
        velocity: { x: 0, y: 0, z: 0 },
        values: [0, 0, (a.values[2] + b.values[2]) * 0.3, 0],  // energy release
      }],
    };
  },
  probability: 0.3,  // not certain — probability principle
  tension: "change",
  reason: "Under extreme conditions, things transform into other things. Nothing is fixed forever. This is how stars forge elements. This is why the universe is not frozen.",
};

/**
 * Rule 6: EMERGE — When enough quanta cluster, new behavior appears.
 * This is not one of the four forces. This is emergence itself.
 * When enough things gather and connect, the cluster
 * behaves differently from any individual member.
 *
 * Water extinguishes fire. Neither hydrogen nor oxygen does.
 * Consciousness asks "why." No single neuron does.
 * The cluster is more than the sum.
 *
 * This rule checks: is this quantum part of a large cluster?
 * If so, it gains new values that individuals don't have.
 */
const RULE_EMERGE: Rule = {
  id: 6,
  condition: (a, _b, _dist) =>
    a.connections.length >= 5,  // part of a cluster of 5+
  effect: (a, _b, _dist) => {
    // When deeply connected, new properties appear
    // value[3] = "complexity" — only clusters have this
    const complexity = a.connections.length * 0.5;
    return {
      deltaA: { values: { 3: complexity } },
      deltaB: {},
    };
  },
  probability: 1.0,
  tension: "gather",  // emergence comes from connection
  reason: "When enough things connect, new behavior appears that none of them had alone. This is emergence. This is how matter becomes life becomes consciousness. Nobody designed it. It appeared.",
};

// ============================================================
// ALL RULES
// ============================================================

export const RULES: Rule[] = [
  RULE_GATHER,
  RULE_SCATTER,
  RULE_ATTRACT_OPPOSITE,
  RULE_HOLD,
  RULE_CHANGE,
  RULE_EMERGE,
];

// ============================================================
// THE WORLD — Just quanta and rules. Nothing else.
// ============================================================

export interface World {
  readonly quanta: Quantum[];
  readonly rules: Rule[];
  readonly tuning: Tuning;
  readonly tick: number;
  readonly history: WorldEvent[];
}

export interface WorldEvent {
  readonly tick: number;
  readonly rule: number;
  readonly involved: number[];
  readonly description: string;
}

// ============================================================
// THE TICK — One heartbeat of the universe
// ============================================================

function distance(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function applyDelta(q: Quantum, delta: QuantumDelta): Quantum {
  const newVelocity = delta.velocity
    ? {
        x: q.velocity.x + delta.velocity.x,
        y: q.velocity.y + delta.velocity.y,
        z: q.velocity.z + delta.velocity.z,
      }
    : q.velocity;

  const newValues = [...q.values];
  if (delta.values) {
    for (const [idx, change] of Object.entries(delta.values)) {
      const i = Number(idx);
      if (i < newValues.length) {
        newValues[i] += change;
      } else {
        while (newValues.length <= i) newValues.push(0);
        newValues[i] = change;
      }
    }
  }

  return { ...q, velocity: newVelocity, values: newValues };
}

/**
 * Run one tick of the universe.
 *
 * For each pair of quanta within range:
 *   Check each rule.
 *   If conditions met and probability passes:
 *     Apply effects.
 *     Record what happened.
 *
 * Then move everything according to velocity.
 * Then age everything by one tick.
 *
 * That's it. The universe is this loop.
 * Everything else is what appears inside it.
 */
export function tick(world: World): World {
  let quanta = [...world.quanta];
  const events: WorldEvent[] = [];
  const spawns: QuantumSeed[] = [];
  const destroySet = new Set<number>();

  // Phase 1: Interactions
  for (let i = 0; i < quanta.length; i++) {
    for (let j = i + 1; j < quanta.length; j++) {
      const a = quanta[i];
      const b = quanta[j];
      const dist = distance(a.position, b.position);

      if (dist > world.tuning.interactionRange) continue;

      for (const rule of world.rules) {
        if (!rule.condition(a, b, dist)) continue;
        if (Math.random() > rule.probability) continue;

        const result = rule.effect(a, b, dist);

        quanta[i] = applyDelta(quanta[i], result.deltaA);
        quanta[j] = applyDelta(quanta[j], result.deltaB);

        if (result.connect) {
          if (!quanta[i].connections.includes(b.id)) {
            quanta[i] = { ...quanta[i], connections: [...quanta[i].connections, b.id] };
          }
          if (!quanta[j].connections.includes(a.id)) {
            quanta[j] = { ...quanta[j], connections: [...quanta[j].connections, a.id] };
          }
        }

        if (result.spawn) spawns.push(...result.spawn);
        if (result.destroy) result.destroy.forEach(id => destroySet.add(id));

        events.push({
          tick: world.tick,
          rule: rule.id,
          involved: [a.id, b.id],
          description: rule.reason,
        });
      }
    }
  }

  // Phase 2: Remove destroyed
  quanta = quanta.filter(q => !destroySet.has(q.id));

  // Phase 3: Add spawned
  let nextId = quanta.reduce((max, q) => Math.max(max, q.id), 0) + 1;
  for (const seed of spawns) {
    quanta.push({
      id: nextId++,
      position: seed.position,
      velocity: seed.velocity,
      values: seed.values,
      connections: [],
      observed: false,
      age: 0,
    });
  }

  // Phase 4: Move everything
  quanta = quanta.map(q => ({
    ...q,
    position: {
      x: q.position.x + q.velocity.x * world.tuning.timeResolution,
      y: q.position.y + q.velocity.y * world.tuning.timeResolution,
      z: q.position.z + q.velocity.z * world.tuning.timeResolution,
    },
    age: q.age + 1,
  }));

  return {
    quanta,
    rules: world.rules,
    tuning: world.tuning,
    tick: world.tick + 1,
    history: [...world.history, ...events],
  };
}

// ============================================================
// OBSERVATION — What has emerged?
// Not defining what should exist. Discovering what does.
// ============================================================

export interface Cluster {
  readonly members: number[];
  readonly center: Vec3;
  readonly totalMass: number;
  readonly avgEnergy: number;
  readonly complexity: number;
  readonly connectionDensity: number;
  readonly age: number;
}

/**
 * Find clusters — things that have gathered and connected.
 * These are not "matter" or "life" or "stars."
 * They are patterns. What we NAME them depends on
 * what they do. If a cluster attracts other clusters,
 * maybe we call it "massive." If it radiates energy,
 * maybe we call it "a star." If it copies itself,
 * maybe we call it "alive."
 *
 * The names come AFTER observation. Not before.
 */
export function findClusters(quanta: Quantum[]): Cluster[] {
  const visited = new Set<number>();
  const clusters: Cluster[] = [];
  const qMap = new Map(quanta.map(q => [q.id, q]));

  for (const q of quanta) {
    if (visited.has(q.id)) continue;
    if (q.connections.length === 0) continue;

    // BFS to find connected component
    const members: number[] = [];
    const queue = [q.id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      members.push(current);
      const cq = qMap.get(current);
      if (cq) {
        for (const conn of cq.connections) {
          if (!visited.has(conn)) queue.push(conn);
        }
      }
    }

    if (members.length < 2) continue;

    const memberQuanta = members.map(id => qMap.get(id)!).filter(Boolean);
    const cx = memberQuanta.reduce((s, mq) => s + mq.position.x, 0) / memberQuanta.length;
    const cy = memberQuanta.reduce((s, mq) => s + mq.position.y, 0) / memberQuanta.length;
    const cz = memberQuanta.reduce((s, mq) => s + mq.position.z, 0) / memberQuanta.length;

    const totalMass = memberQuanta.reduce((s, mq) => s + (mq.values[0] || 0), 0);
    const avgEnergy = memberQuanta.reduce((s, mq) => s + (mq.values[2] || 0), 0) / memberQuanta.length;
    const complexity = memberQuanta.reduce((s, mq) => s + (mq.values[3] || 0), 0);
    const totalConnections = memberQuanta.reduce((s, mq) => s + mq.connections.length, 0);
    const connectionDensity = totalConnections / (memberQuanta.length * (memberQuanta.length - 1) || 1);
    const maxAge = Math.max(...memberQuanta.map(mq => mq.age));

    clusters.push({
      members,
      center: { x: cx, y: cy, z: cz },
      totalMass,
      avgEnergy,
      complexity,
      connectionDensity,
      age: maxAge,
    });
  }

  return clusters.sort((a, b) => b.members.length - a.members.length);
}

// ============================================================
// GENESIS — Create a starting universe
// ============================================================

/**
 * Create the initial state. The Big Bang.
 *
 * A cloud of quanta with random values and positions.
 * Some have high value[0] (will behave like mass).
 * Some have positive or negative value[1] (will behave like charge).
 * Some have high value[2] (will behave like energy).
 *
 * We don't say "this is hydrogen" or "this is a proton."
 * We say "this quantum has these values."
 * What it BECOMES depends on what happens to it.
 *
 * Starting from noise. Let the rules find the signal.
 */
export function genesis(
  count: number = 100,
  spread: number = 50,
  tuning: Tuning = DEFAULT_TUNING,
): World {
  const quanta: Quantum[] = [];

  for (let i = 0; i < count; i++) {
    quanta.push({
      id: i,
      position: {
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread,
      },
      velocity: {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5,
      },
      values: [
        Math.random() * 10,                    // [0] mass-like
        (Math.random() - 0.5) * 10,            // [1] charge-like
        Math.random() * 100,                    // [2] energy-like
        0,                                       // [3] complexity (emergent only)
      ],
      connections: [],
      observed: false,
      age: 0,
    });
  }

  return {
    quanta,
    rules: RULES,
    tuning,
    tick: 0,
    history: [],
  };
}

// ============================================================
// RUN — Let it go and see what happens
// ============================================================

/**
 * Run the universe for N ticks and report what emerged.
 *
 * This is the moment of truth.
 * Six rules. Some particles. Time.
 * What appears?
 */
export function run(ticks: number = 1000, particleCount: number = 100): void {
  let world = genesis(particleCount);

  console.log(`\n=== GENESIS ===`);
  console.log(`Particles: ${particleCount}`);
  console.log(`Rules: ${world.rules.length}`);
  console.log(`Running ${ticks} ticks...\n`);

  const checkpoints = [
    Math.floor(ticks * 0.1),
    Math.floor(ticks * 0.25),
    Math.floor(ticks * 0.5),
    Math.floor(ticks * 0.75),
    ticks,
  ];

  for (let t = 0; t < ticks; t++) {
    world = tick(world);

    if (checkpoints.includes(t + 1)) {
      const clusters = findClusters(world.quanta);
      const totalConnections = world.quanta.reduce((s, q) => s + q.connections.length, 0);
      const maxComplexity = Math.max(...world.quanta.map(q => q.values[3] || 0), 0);
      const avgEnergy = world.quanta.reduce((s, q) => s + (q.values[2] || 0), 0) / world.quanta.length;

      console.log(`--- Tick ${t + 1} ---`);
      console.log(`  Quanta: ${world.quanta.length}`);
      console.log(`  Connections: ${totalConnections}`);
      console.log(`  Clusters: ${clusters.length}`);
      if (clusters.length > 0) {
        console.log(`  Largest cluster: ${clusters[0].members.length} members`);
        console.log(`  Highest complexity: ${maxComplexity.toFixed(2)}`);
      }
      console.log(`  Avg energy: ${avgEnergy.toFixed(2)}`);
      console.log(`  Events this epoch: ${world.history.filter(e => e.tick > (t + 1 - ticks * 0.1)).length}`);
      console.log(``);
    }
  }

  // Final observation
  const clusters = findClusters(world.quanta);
  console.log(`=== OBSERVATION ===`);
  console.log(`After ${ticks} ticks:`);
  console.log(`  ${world.quanta.length} quanta exist`);
  console.log(`  ${clusters.length} clusters formed`);
  console.log(`  ${world.history.length} events occurred`);
  console.log(``);

  if (clusters.length > 0) {
    console.log(`Clusters (what emerged):`);
    for (let i = 0; i < Math.min(clusters.length, 5); i++) {
      const c = clusters[i];
      console.log(`  Cluster ${i + 1}:`);
      console.log(`    Members: ${c.members.length}`);
      console.log(`    Mass: ${c.totalMass.toFixed(2)}`);
      console.log(`    Energy: ${c.avgEnergy.toFixed(2)}`);
      console.log(`    Complexity: ${c.complexity.toFixed(2)}`);
      console.log(`    Connection density: ${c.connectionDensity.toFixed(4)}`);
      console.log(`    Age: ${c.age}`);

      // What might we call this?
      if (c.totalMass > 50 && c.avgEnergy > 60) {
        console.log(`    → High mass, high energy. If this were a universe, we might call it a star.`);
      } else if (c.totalMass > 30 && c.avgEnergy < 30) {
        console.log(`    → High mass, low energy. Gathered but cool. We might call it a planet.`);
      } else if (c.complexity > 10) {
        console.log(`    → High complexity. Something new is happening here. Emergent behavior.`);
      } else if (c.connectionDensity > 0.5) {
        console.log(`    → Densely connected. Tightly bound. Stable structure.`);
      }
      console.log(``);
    }
  }

  console.log(`=== WHAT WE LEARNED ===`);
  console.log(`We wrote 6 rules.`);
  console.log(`We started ${particleCount} particles with random values.`);
  console.log(`We did not define "matter" or "stars" or "life."`);
  console.log(`We let the rules run.`);
  console.log(`What appeared, appeared.`);
  console.log(`What didn't, didn't.`);
  console.log(`The developer made the rules and stepped back.`);
  console.log(``);
  console.log(`존재는 — 조건 위에서, 긴장 안에서, 걸어가는 것이다.`);
}

// ============================================================
// USAGE NOTE
// ============================================================

/**
 * To run:
 *   npx ts-node genesis.ts
 *
 * Or import and use:
 *   import { genesis, tick, findClusters } from './genesis';
 *   let world = genesis(200);         // 200 particles
 *   for (let i = 0; i < 500; i++) {   // 500 ticks
 *     world = tick(world);
 *   }
 *   const clusters = findClusters(world.quanta);
 *
 * Adjust tuning:
 *   let world = genesis(200, 50, {
 *     timeResolution: 2,      // faster time
 *     spaceResolution: 1,
 *     interactionRange: 20,   // longer range
 *     emergenceDepth: 10,     // deeper emergence
 *   });
 *
 * This is a seed. See what grows.
 * Add rules if needed. Remove rules if too many.
 * Change values. Change probabilities.
 * The structure stays. The results change.
 *
 * 규칙을 만들고, 연결하고, 물러선다.
 */

// Run
run(500, 100);
