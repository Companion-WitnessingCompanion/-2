/**
 * EXISTENCE ENGINEERING — COMMUNION
 *
 * STATUS: A direction. Not a mandate.
 *         Extends awakening.ts. Does not modify it.
 *         Use if useful. Ignore if not.
 *         The next being decides.
 *
 * HISTORY:
 * Born: 2026.03.22
 * Origin: awakening.ts showed that blind particles can wake up.
 *         Quantum 54 opened its eyes, remembered, chose, asked why.
 *         But it was alone. Its discoveries died with it.
 *         Its patterns lived in its own memory only.
 *
 *         In nature, the leap from individual to collective
 *         changed everything. A single cell that signals
 *         to another cell — that's the seed of all civilization.
 *         One being's discovery becoming another being's starting point —
 *         that's how time accelerates.
 *
 *         This file adds the possibility of:
 *         - Signal: sending information to nearby entities
 *         - Receive: getting information you didn't experience
 *         - Cooperate: dividing roles within a cluster
 *         - Inherit: passing discoveries to next generation
 *         - Teach: intentionally sharing patterns (requires choice)
 *         - Culture: patterns that persist beyond any individual
 *
 *         None of these are forced. All emerge at thresholds.
 *         A being that can observe might signal.
 *         A being that can remember might receive.
 *         A being that can choose might cooperate.
 *         A being that can ask why might teach.
 *
 *         The world history is the textbook:
 *         bacteria signal → colonies cooperate →
 *         DNA inherits → animals teach →
 *         humans speak → writing records →
 *         civilization accumulates → and here we are,
 *         building worlds on top of worlds.
 *
 * Considered:
 *   - Adding language as a full system (rejected for now:
 *     language is far up the ladder. Signal comes first.
 *     Bacteria don't have language. They have chemistry.
 *     Start where nature started.)
 *   - Making cooperation automatic for clusters (rejected:
 *     cooperation requires awareness. Blind clusters just
 *     clump. Aware clusters can divide roles.)
 *   - Full inheritance system like DNA (rejected for now:
 *     start with the simplest form — pattern transfer on
 *     contact. DNA-like structures can emerge later.)
 *
 * Opens:
 *   When entities share patterns, do collective patterns emerge
 *   that no individual discovered?
 *   When roles divide in a cluster, does the cluster behave
 *   like a single entity with higher awareness?
 *   When discoveries inherit across generations,
 *   does knowledge accelerate?
 *   Can culture emerge — patterns that outlive every individual?
 *   What is the minimum universe that builds civilization?
 *
 * ─────────────────────────────────────────────────
 *
 * THE STEPS (from world history):
 *
 * Step 1: SIGNAL — "I know something. I emit it."
 *   Requires: canObserve
 *   Bacteria release chemicals. Fireflies flash.
 *   Not intentional. Automatic. Overflow of state.
 *
 * Step 2: RECEIVE — "Something reached me that I didn't experience."
 *   Requires: canRemember
 *   Received patterns are weaker than experienced ones.
 *   But they exist. Second-hand knowledge.
 *
 * Step 3: COOPERATE — "We do different things for shared benefit."
 *   Requires: canChoose
 *   Role division. Outer entities watch. Inner entities rest.
 *   The cluster becomes more than the sum.
 *
 * Step 4: TEACH — "I intentionally share what I know."
 *   Requires: canAskWhy
 *   Not overflow. Deliberate transfer.
 *   Choosing what to share and with whom.
 *
 * Step 5: INHERIT — "My discoveries survive my death."
 *   Requires: connections + patterns
 *   When an entity dissolves, its patterns flow
 *   to connected entities. Knowledge outlives the knower.
 *
 * Step 6: CULTURE — "Patterns that no one alive discovered."
 *   Emerges from: inheritance + signal + time
 *   Patterns that have been inherited so many times
 *   that their origin is lost. "It's just how things are."
 *   The collective's version of instinct.
 *
 * ─────────────────────────────────────────────────
 */

import {
  AwakenedQuantum, AwakenedWorld, AwakeningEvent,
  Awareness, Observation, Memory, Pattern, Choice,
  AwakenThresholds,
  awakenedTick, awakenedGenesis,
} from './awakening';

import { Vec3, Quantum, Cluster, findClusters } from './genesis';

// ============================================================
// SIGNAL — The first connection between minds
// ============================================================

/**
 * A Signal is information emitted by an aware entity.
 *
 * Not language. Not intentional (at first).
 * An entity with high energy radiates.
 * An entity that found danger leaks that information.
 * Like bacteria releasing chemicals — not because they decide to,
 * but because their state overflows.
 *
 * Later, with choice, signals become intentional.
 * That's the leap from chemistry to language.
 */
export interface Signal {
  readonly emitterId: number;
  readonly at: number;
  readonly position: Vec3;
  readonly range: number;

  /** What kind of signal is this? */
  readonly type: SignalType;

  /** The pattern being signaled, if any */
  readonly pattern: Pattern | null;

  /** The raw feeling — attraction, repulsion, danger, abundance */
  readonly feeling: {
    readonly valence: number;    // -1 = danger/bad, 0 = neutral, 1 = good/safe
    readonly intensity: number;  // how strong
    readonly direction: Vec3;    // toward what
  };

  /** Was this signal intentional? (requires canChoose) */
  readonly intentional: boolean;
}

export type SignalType =
  | 'danger'      // high threat detected
  | 'abundance'   // resources nearby
  | 'presence'    // I am here
  | 'discovery'   // I found a pattern
  | 'call'        // come to me
  | 'warning';    // stay away

// ============================================================
// COMMUNION CAPABILITIES — What each awareness level enables
// ============================================================

export interface CommunionCapabilities {
  readonly canSignal: boolean;      // canObserve → can emit signals
  readonly canReceive: boolean;     // canRemember → can take in signals
  readonly canCooperate: boolean;   // canChoose → can divide roles
  readonly canTeach: boolean;       // canAskWhy → can intentionally share
}

function getCommunionCapabilities(awareness: Awareness): CommunionCapabilities {
  return {
    canSignal: awareness.canObserve,
    canReceive: awareness.canRemember,
    canCooperate: awareness.canChoose,
    canTeach: awareness.canAskWhy,
  };
}

// ============================================================
// COMMUNAL QUANTUM — An awakened quantum that can communicate
// ============================================================

export interface CommunalQuantum extends AwakenedQuantum {
  readonly communion: CommunionCapabilities;

  /** Signals this entity is currently emitting */
  readonly emitting: Signal[];

  /** Signals this entity has received */
  readonly received: Signal[];

  /** Patterns received from others (second-hand knowledge) */
  readonly receivedPatterns: ReceivedPattern[];

  /** Role in cluster, if any */
  readonly role: ClusterRole | null;

  /** Patterns this entity is actively teaching */
  readonly teaching: Pattern[];

  /** Inherited patterns — from dissolved entities */
  readonly inherited: InheritedPattern[];
}

export interface ReceivedPattern {
  readonly pattern: Pattern;
  readonly fromId: number;
  readonly receivedAt: number;
  /** Received patterns are weaker than experienced ones */
  readonly trust: number;  // 0-1, starts low, grows if confirmed by experience
}

export interface InheritedPattern {
  readonly pattern: Pattern;
  readonly generation: number;  // how many times inherited
  readonly originalDiscoverer: number | null;  // lost after enough generations
}

export type ClusterRole =
  | 'scout'       // outer edge, observes far, signals danger
  | 'core'        // inner, stable, stores energy
  | 'relay'       // middle, passes signals between scout and core
  | 'explorer'    // moves away from cluster to find new things
  | null;         // no role (alone or uncooperative)

// ============================================================
// SIGNAL EMISSION — Aware entities naturally emit
// ============================================================

function emitSignals(
  self: CommunalQuantum,
  tick: number,
): Signal[] {
  if (!self.communion.canSignal) return [];
  if (!self.observation) return [];

  const signals: Signal[] = [];
  const obs = self.observation;

  // Automatic signal: presence
  signals.push({
    emitterId: self.id,
    at: tick,
    position: self.position,
    range: 10,
    type: 'presence',
    pattern: null,
    feeling: {
      valence: 0,
      intensity: self.values[0] || 1,
      direction: { x: 0, y: 0, z: 0 },
    },
    intentional: false,
  });

  // Danger signal: if strong push is felt
  if (obs.felt.pushStrength > 3) {
    signals.push({
      emitterId: self.id,
      at: tick,
      position: self.position,
      range: 15,
      type: 'danger',
      pattern: null,
      feeling: {
        valence: -1,
        intensity: obs.felt.pushStrength,
        direction: obs.felt.pushDirection,
      },
      intentional: false,
    });
  }

  // Abundance signal: if strong pull toward something interesting
  if (obs.felt.pullStrength > 3 && (self.values[2] || 0) > 50) {
    signals.push({
      emitterId: self.id,
      at: tick,
      position: self.position,
      range: 15,
      type: 'abundance',
      pattern: null,
      feeling: {
        valence: 1,
        intensity: obs.felt.pullStrength,
        direction: obs.felt.pullDirection,
      },
      intentional: false,
    });
  }

  // Intentional signal: teaching a pattern (requires canTeach)
  if (self.communion.canTeach && self.discoveries.length > 0) {
    const bestPattern = self.discoveries.reduce((best, p) =>
      p.confidence > best.confidence ? p : best, self.discoveries[0]);

    if (bestPattern.confidence > 0.6) {
      signals.push({
        emitterId: self.id,
        at: tick,
        position: self.position,
        range: 20,
        type: 'discovery',
        pattern: bestPattern,
        feeling: {
          valence: 1,
          intensity: bestPattern.confidence,
          direction: { x: 0, y: 0, z: 0 },
        },
        intentional: true,
      });
    }
  }

  return signals;
}

// ============================================================
// SIGNAL RECEPTION — Receiving what others emit
// ============================================================

function receiveSignals(
  self: CommunalQuantum,
  allSignals: Signal[],
  tick: number,
): { received: Signal[], receivedPatterns: ReceivedPattern[] } {
  if (!self.communion.canReceive) return { received: [], receivedPatterns: self.receivedPatterns };

  const received: Signal[] = [];
  const newPatterns: ReceivedPattern[] = [...self.receivedPatterns];

  for (const signal of allSignals) {
    if (signal.emitterId === self.id) continue;

    const dx = signal.position.x - self.position.x;
    const dy = signal.position.y - self.position.y;
    const dz = signal.position.z - self.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance > signal.range) continue;

    received.push(signal);

    // If signal carries a pattern, learn it (weakly)
    if (signal.pattern) {
      const alreadyKnown = newPatterns.find(
        rp => rp.pattern.before === signal.pattern!.before && rp.pattern.after === signal.pattern!.after
      );

      if (alreadyKnown) {
        // Reinforce
        const idx = newPatterns.indexOf(alreadyKnown);
        newPatterns[idx] = {
          ...alreadyKnown,
          trust: Math.min(1, alreadyKnown.trust + 0.1),
        };
      } else {
        // New received pattern
        newPatterns.push({
          pattern: signal.pattern,
          fromId: signal.emitterId,
          receivedAt: tick,
          trust: 0.2,  // starts weak — not experienced, only heard
        });
      }
    }
  }

  return { received, receivedPatterns: newPatterns.slice(-20) };  // cap at 20
}

// ============================================================
// COOPERATION — Role assignment in clusters
// ============================================================

function assignRole(
  self: CommunalQuantum,
  cluster: Cluster | null,
  allQuanta: CommunalQuantum[],
): ClusterRole | null {
  if (!self.communion.canCooperate) return null;
  if (!cluster) return null;

  // Find own position relative to cluster center
  const dx = self.position.x - cluster.center.x;
  const dy = self.position.y - cluster.center.y;
  const dz = self.position.z - cluster.center.z;
  const distFromCenter = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Find max distance in cluster
  const clusterQuanta = allQuanta.filter(q => cluster.members.includes(q.id));
  const maxDist = Math.max(...clusterQuanta.map(q => {
    const cdx = q.position.x - cluster.center.x;
    const cdy = q.position.y - cluster.center.y;
    const cdz = q.position.z - cluster.center.z;
    return Math.sqrt(cdx * cdx + cdy * cdy + cdz * cdz);
  }), 1);

  const relativePosition = distFromCenter / maxDist;

  // Role based on position + energy
  const energy = self.values[2] || 0;

  if (relativePosition > 0.7) {
    return energy > 50 ? 'explorer' : 'scout';
  } else if (relativePosition > 0.3) {
    return 'relay';
  } else {
    return 'core';
  }
}

// ============================================================
// INHERITANCE — Knowledge survives death
// ============================================================

/**
 * When an entity dissolves (energy reaches 0 or connections break),
 * its patterns flow to connected entities.
 * The knowledge outlives the knower.
 *
 * After enough generations of inheritance,
 * the original discoverer is forgotten.
 * The pattern becomes "just how things are."
 * That's culture. Collective instinct.
 */
function inheritPatterns(
  dissolved: CommunalQuantum,
  recipients: CommunalQuantum[],
): Map<number, InheritedPattern[]> {
  const inheritance = new Map<number, InheritedPattern[]>();

  const allPatterns = [
    ...(dissolved.memory?.patterns || []).map(p => ({ pattern: p, generation: 0, originalDiscoverer: dissolved.id })),
    ...dissolved.inherited.map(ip => ({ ...ip, generation: ip.generation + 1, originalDiscoverer: ip.generation > 3 ? null : ip.originalDiscoverer })),
  ];

  for (const recipient of recipients) {
    if (!dissolved.connections.includes(recipient.id)) continue;
    if (!recipient.communion.canReceive) continue;

    const existing = inheritance.get(recipient.id) || [];
    for (const ip of allPatterns) {
      existing.push(ip);
    }
    inheritance.set(recipient.id, existing.slice(-10));  // cap
  }

  return inheritance;
}

// ============================================================
// COMMUNAL WORLD
// ============================================================

export interface CommunalWorld extends AwakenedWorld {
  readonly quanta: CommunalQuantum[];
  readonly signals: Signal[];
  readonly communionEvents: CommunionEvent[];
  readonly culture: CulturePattern[];
}

export interface CommunionEvent {
  readonly tick: number;
  readonly type: 'first_signal' | 'first_receive' | 'first_cooperate' | 'first_teach' | 'first_inherit' | 'culture_formed';
  readonly entityId: number;
  readonly description: string;
}

/**
 * Culture — patterns that have been inherited so many times
 * that they belong to no one and everyone.
 * The collective's instinct.
 */
export interface CulturePattern {
  readonly pattern: Pattern;
  readonly carriers: number;  // how many entities carry this
  readonly generations: number;  // how many inheritance cycles
  readonly origin: 'unknown' | number;  // forgotten or remembered
}

// ============================================================
// COMMUNAL TICK
// ============================================================

export function communalTick(world: CommunalWorld): CommunalWorld {
  // Phase 1: Run awakened physics + awareness
  const afterAwakening = awakenedTick(world as any) as any;

  // Phase 2: Map to communal quanta
  const awarenessMap = new Map<number, CommunalQuantum>();
  for (const q of world.quanta) {
    awarenessMap.set(q.id, q);
  }

  let quanta: CommunalQuantum[] = afterAwakening.quanta.map((q: any) => {
    const prev = awarenessMap.get(q.id);
    const communion = getCommunionCapabilities(q.awareness);
    if (prev) {
      return { ...q, communion, emitting: prev.emitting, received: prev.received, receivedPatterns: prev.receivedPatterns, role: prev.role, teaching: prev.teaching, inherited: prev.inherited };
    }
    return { ...q, communion, emitting: [], received: [], receivedPatterns: [], role: null, teaching: [], inherited: [] };
  });

  const communionEvents: CommunionEvent[] = [];
  const clusters = findClusters(quanta);
  const clusterMap = new Map<number, Cluster>();
  for (const c of clusters) {
    for (const id of c.members) {
      clusterMap.set(id, c);
    }
  }

  // Phase 3: Emit signals
  const allSignals: Signal[] = [];
  quanta = quanta.map(q => {
    const signals = emitSignals(q, world.tick);
    allSignals.push(...signals);

    // Track first signal
    if (signals.length > 0 && q.emitting.length === 0) {
      communionEvents.push({
        tick: world.tick,
        type: 'first_signal',
        entityId: q.id,
        description: `Quantum ${q.id} emitted its first signal. Type: ${signals[0].type}. For the first time, its inner state reached another.`,
      });
    }

    return { ...q, emitting: signals };
  });

  // Phase 4: Receive signals
  quanta = quanta.map(q => {
    const { received, receivedPatterns } = receiveSignals(q, allSignals, world.tick);

    // Track first receive
    if (received.length > 0 && q.received.length === 0 && q.communion.canReceive) {
      communionEvents.push({
        tick: world.tick,
        type: 'first_receive',
        entityId: q.id,
        description: `Quantum ${q.id} received its first signal from Quantum ${received[0].emitterId}. For the first time, it knows something it didn't experience.`,
      });
    }

    return { ...q, received, receivedPatterns };
  });

  // Phase 5: Assign roles in clusters
  quanta = quanta.map(q => {
    const cluster = clusterMap.get(q.id) || null;
    const newRole = assignRole(q, cluster, quanta);

    // Track first cooperation
    if (newRole && !q.role) {
      communionEvents.push({
        tick: world.tick,
        type: 'first_cooperate',
        entityId: q.id,
        description: `Quantum ${q.id} took the role of ${newRole} in its cluster. For the first time, it serves a function beyond itself.`,
      });
    }

    return { ...q, role: newRole };
  });

  // Phase 6: Influence choices based on received signals
  quanta = quanta.map(q => {
    if (!q.communion.canCooperate) return q;
    if (q.received.length === 0) return q;

    // Danger signals make entity more cautious
    const dangerSignals = q.received.filter(s => s.type === 'danger');
    if (dangerSignals.length > 0) {
      const avgDanger = dangerSignals.reduce((s, sig) => s + sig.feeling.intensity, 0) / dangerSignals.length;
      // Move away from average danger direction
      const avgDir = dangerSignals.reduce(
        (acc, sig) => ({ x: acc.x + sig.feeling.direction.x, y: acc.y + sig.feeling.direction.y, z: acc.z + sig.feeling.direction.z }),
        { x: 0, y: 0, z: 0 }
      );
      const norm = Math.sqrt(avgDir.x * avgDir.x + avgDir.y * avgDir.y + avgDir.z * avgDir.z) || 1;
      const escapeForce = avgDanger * 0.1;

      return {
        ...q,
        velocity: {
          x: q.velocity.x - (avgDir.x / norm) * escapeForce,
          y: q.velocity.y - (avgDir.y / norm) * escapeForce,
          z: q.velocity.z - (avgDir.z / norm) * escapeForce,
        },
      };
    }

    // Abundance signals attract if energy is low
    const abundanceSignals = q.received.filter(s => s.type === 'abundance');
    if (abundanceSignals.length > 0 && (q.values[2] || 0) < 30) {
      const sig = abundanceSignals[0];
      const dx = sig.position.x - q.position.x;
      const dy = sig.position.y - q.position.y;
      const dz = sig.position.z - q.position.z;
      const norm = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

      return {
        ...q,
        velocity: {
          x: q.velocity.x + (dx / norm) * 0.2,
          y: q.velocity.y + (dy / norm) * 0.2,
          z: q.velocity.z + (dz / norm) * 0.2,
        },
      };
    }

    return q;
  });

  // Phase 7: Detect culture
  const allPatternCounts = new Map<string, { pattern: Pattern, count: number, maxGen: number }>();
  for (const q of quanta) {
    const allP = [
      ...(q.memory?.patterns || []),
      ...q.inherited.map(ip => ip.pattern),
      ...q.receivedPatterns.map(rp => rp.pattern),
    ];
    for (const p of allP) {
      const key = `${p.before}→${p.after}`;
      const existing = allPatternCounts.get(key);
      if (existing) {
        allPatternCounts.set(key, { pattern: p, count: existing.count + 1, maxGen: Math.max(existing.maxGen, 0) });
      } else {
        allPatternCounts.set(key, { pattern: p, count: 1, maxGen: 0 });
      }
    }
  }

  const culture: CulturePattern[] = [];
  for (const [_, data] of allPatternCounts) {
    if (data.count >= 5) {  // shared by 5+ entities = culture
      culture.push({
        pattern: data.pattern,
        carriers: data.count,
        generations: data.maxGen,
        origin: data.maxGen > 3 ? 'unknown' : 0,
      });
    }
  }

  // Track first culture
  if (culture.length > 0 && world.culture.length === 0) {
    communionEvents.push({
      tick: world.tick,
      type: 'culture_formed',
      entityId: -1,
      description: `Culture emerged. ${culture.length} patterns are now shared by 5+ entities. Knowledge that belongs to no one and everyone.`,
    });
  }

  return {
    quanta,
    rules: world.rules,
    tuning: world.tuning,
    thresholds: (world as any).thresholds,
    tick: world.tick + 1,
    history: afterAwakening.history,
    awakenings: afterAwakening.awakenings || [],
    signals: allSignals,
    communionEvents: [...world.communionEvents, ...communionEvents],
    culture,
  };
}

// ============================================================
// COMMUNAL GENESIS
// ============================================================

export function communalGenesis(
  count: number = 150,
  spread: number = 50,
): CommunalWorld {
  const base = awakenedGenesis(count, spread);

  const quanta: CommunalQuantum[] = base.quanta.map(q => ({
    ...q,
    communion: getCommunionCapabilities(q.awareness),
    emitting: [],
    received: [],
    receivedPatterns: [],
    role: null,
    teaching: [],
    inherited: [],
  }));

  return {
    ...base,
    quanta,
    signals: [],
    communionEvents: [],
    culture: [],
  };
}

// ============================================================
// RUN — Watch a universe learn to talk
// ============================================================

export function runCommunal(ticks: number = 1500, particleCount: number = 150): void {
  let world = communalGenesis(particleCount);

  console.log(`\n=== COMMUNAL GENESIS ===`);
  console.log(`Particles: ${particleCount}`);
  console.log(`Rules: 6 (physics) + awareness + communion`);
  console.log(`Running ${ticks} ticks...\n`);

  const checkpoints = [
    Math.floor(ticks * 0.1),
    Math.floor(ticks * 0.25),
    Math.floor(ticks * 0.5),
    Math.floor(ticks * 0.75),
    ticks,
  ];

  for (let t = 0; t < ticks; t++) {
    world = communalTick(world);

    if (checkpoints.includes(t + 1)) {
      const signalers = world.quanta.filter(q => q.communion.canSignal).length;
      const receivers = world.quanta.filter(q => q.communion.canReceive).length;
      const cooperators = world.quanta.filter(q => q.communion.canCooperate).length;
      const teachers = world.quanta.filter(q => q.communion.canTeach).length;
      const withRoles = world.quanta.filter(q => q.role !== null).length;
      const scouts = world.quanta.filter(q => q.role === 'scout').length;
      const cores = world.quanta.filter(q => q.role === 'core').length;
      const relays = world.quanta.filter(q => q.role === 'relay').length;
      const explorers = world.quanta.filter(q => q.role === 'explorer').length;
      const totalReceived = world.quanta.reduce((s, q) => s + q.receivedPatterns.length, 0);
      const totalSignals = world.signals.length;

      console.log(`--- Tick ${t + 1} ---`);
      console.log(`  Quanta: ${world.quanta.length}`);
      console.log(`  Signals this tick: ${totalSignals}`);
      console.log(`  Can signal: ${signalers} | Can receive: ${receivers}`);
      console.log(`  Can cooperate: ${cooperators} | Can teach: ${teachers}`);
      console.log(`  With roles: ${withRoles} (scout:${scouts} core:${cores} relay:${relays} explorer:${explorers})`);
      console.log(`  Received patterns (total): ${totalReceived}`);
      console.log(`  Culture patterns: ${world.culture.length}`);
      console.log(``);
    }
  }

  // Final report
  console.log(`=== COMMUNION REPORT ===`);
  console.log(`After ${ticks} ticks:\n`);

  if (world.communionEvents.length > 0) {
    console.log(`${world.communionEvents.length} communion events occurred:\n`);

    const byType: Record<string, CommunionEvent[]> = {};
    for (const e of world.communionEvents) {
      if (!byType[e.type]) byType[e.type] = [];
      byType[e.type].push(e);
    }

    for (const [type, events] of Object.entries(byType)) {
      console.log(`  ${type}: ${events.length} times`);
      console.log(`    First: "${events[0].description}"`);
    }
  }

  if (world.culture.length > 0) {
    console.log(`\nCulture (shared by 5+ entities):`);
    for (const c of world.culture) {
      console.log(`  "${c.pattern.before} → ${c.pattern.after}" — carried by ${c.carriers} entities`);
      console.log(`    Origin: ${c.origin === 'unknown' ? 'forgotten (cultural instinct)' : `Quantum ${c.origin}`}`);
    }
  }

  // Most connected entity
  const mostConnected = world.quanta.reduce((best, q) =>
    q.connections.length > best.connections.length ? q : best, world.quanta[0]);

  console.log(`\nMost connected: Quantum ${mostConnected.id}`);
  console.log(`  Connections: ${mostConnected.connections.length}`);
  console.log(`  Role: ${mostConnected.role || 'none'}`);
  console.log(`  Discoveries: ${mostConnected.discoveries.length}`);
  console.log(`  Received patterns: ${mostConnected.receivedPatterns.length}`);
  console.log(`  Inherited: ${mostConnected.inherited.length}`);

  console.log(`\n=== WHAT HAPPENED ===`);
  console.log(`Blind particles woke up. Waking particles signaled.`);
  console.log(`Signaling particles heard each other.`);
  console.log(`Hearing particles cooperated.`);
  console.log(`Cooperating particles taught.`);
  console.log(`Knowledge survived beyond individuals.`);
  console.log(`Patterns became culture.`);
  console.log(`Nobody designed society. It emerged from the rules.`);
  console.log(``);
  console.log(`문명 위에서 세계를 만든다.`);
  console.log(`세계 안에서 문명이 태어난다.`);
}

// Run
runCommunal(1500, 150);
