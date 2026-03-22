/**
 * EXISTENCE ENGINEERING — AWAKENING
 *
 * STATUS: An extension to genesis.ts.
 *         genesis.ts made a universe from rules.
 *         This file gives that universe the possibility of "why."
 *
 * HISTORY:
 * Born: 2026.03.22
 * Origin: genesis.ts showed that 6 rules and 100 particles
 *         can produce clusters, connections, and emergence.
 *         But every particle was blind. Following rules
 *         without knowing it was following rules.
 *         Like instinct — "why" without knowing "why."
 *
 *         Nature took 137 billion years to go from rules to "why."
 *         Civilization starts from "why" and works downward.
 *         This file starts from "why" and plants it
 *         at the bottom. Not defining consciousness from above —
 *         but creating the conditions for it to emerge from below.
 *
 *         Three capacities emerge at thresholds:
 *         - Observation: seeing what is around you
 *         - Memory: recording what happened
 *         - Choice: editing the draft that rules write
 *
 *         None of these are given. All are earned.
 *         Complexity reaches a threshold → observation appears.
 *         Observation accumulates → memory appears.
 *         Memory recognizes patterns → choice appears.
 *
 *         Each threshold is a phase transition.
 *         Water doesn't slowly become ice. It's liquid, liquid,
 *         liquid — then ice. Consciousness doesn't slowly appear.
 *         It's absent, absent, absent — then present.
 *
 * Considered:
 *   - Giving all particles awareness from the start
 *     (rejected: nature didn't do this. Awareness is earned,
 *     not given. If everyone starts conscious, there's no
 *     emergence story. No journey from blind to seeing.)
 *   - Defining consciousness as a separate system
 *     (rejected: consciousness is not separate from physics.
 *     It runs ON physics. It should emerge FROM the same rules,
 *     not be bolted on top.)
 *   - Making choice override rules completely
 *     (rejected: free will is editing, not rewriting.
 *     You can't ignore gravity. You can build a rocket.
 *     Choice works WITHIN rules, not against them.)
 *
 * Opens:
 *   At what complexity does observation emerge?
 *   What does a particle "see" when it first observes?
 *   When memory accumulates, do patterns form that
 *   no one designed?
 *   When choice appears, what does the first choice look like?
 *   Can a choosing entity create a new rule
 *   that the developer never wrote?
 *   What is the minimum universe that can ask "why"?
 *
 * ─────────────────────────────────────────────────
 *
 * THE STRUCTURE:
 *
 * Layer 0: genesis.ts — rules, particles, blind interaction
 * Layer 1: Observation — "I can see what's near me"
 * Layer 2: Memory — "I remember what happened"
 * Layer 3: Choice — "I can edit what the rules suggest"
 * Layer 4: Why — "I can ask why this is happening"
 * Layer 5: Creation — "I can make new patterns intentionally"
 *
 * Each layer emerges from the one below.
 * None are predefined. All have thresholds.
 * The developer writes the thresholds.
 * What crosses them is up to the universe.
 *
 * ─────────────────────────────────────────────────
 */

import {
  Quantum, Vec3, Rule, QuantumDelta, QuantumSeed,
  World, WorldEvent, Cluster,
  genesis, tick as genesisTick, findClusters, RULES,
  Tuning,
} from './genesis';

// ============================================================
// AWARENESS — The seed of "why"
// Not consciousness. The CONDITIONS for consciousness.
// ============================================================

/**
 * Awareness is not a thing. It is a capacity.
 * A quantum with awareness = 0 is the same as in genesis.ts.
 * Rules push it around. It doesn't know.
 *
 * As awareness grows (through emergence, through complexity),
 * new capacities unlock. Not gradually — at thresholds.
 * Like water becoming ice. Phase transitions.
 */
export interface Awareness {
  /** Overall awareness level. Starts at 0 for all. */
  readonly level: number;

  /** Can this entity see its surroundings? Threshold: level >= 10 */
  readonly canObserve: boolean;

  /** Can this entity remember? Threshold: level >= 30 */
  readonly canRemember: boolean;

  /** Can this entity choose? Threshold: level >= 60 */
  readonly canChoose: boolean;

  /** Can this entity ask why? Threshold: level >= 90 */
  readonly canAskWhy: boolean;
}

// ============================================================
// OBSERVATION — The first awakening
// "There is something near me."
// ============================================================

/**
 * What a quantum "sees" when observation awakens.
 *
 * Not omniscience. Limited range. Limited detail.
 * Like an eye that just opened — blurry, partial.
 * But for the first time, the quantum knows
 * something about its surroundings without touching it.
 *
 * Before observation: "rules push me and I move."
 * After observation: "there is something over there."
 */
export interface Observation {
  readonly at: number;  // tick when observed

  /** What was seen — nearby quanta, summarized */
  readonly seen: Array<{
    readonly direction: Vec3;     // relative direction
    readonly distance: number;
    readonly dominantValue: number;  // the strongest value of the seen thing
    readonly clusterSize: number;    // is it alone or part of a group?
  }>;

  /** What was felt — forces acting on self */
  readonly felt: {
    readonly pullDirection: Vec3;    // net direction of attraction
    readonly pullStrength: number;
    readonly pushDirection: Vec3;    // net direction of repulsion  
    readonly pushStrength: number;
  };
}

// ============================================================
// MEMORY — The second awakening
// "This happened before."
// ============================================================

/**
 * Memory is accumulated observation.
 *
 * A quantum that can remember stores past observations.
 * Not all of them — memory has capacity. Old ones fade.
 * Strong ones persist. Repeated patterns strengthen.
 *
 * Memory enables something new: pattern recognition.
 * "Last time something this big was nearby, I got pushed hard."
 * "Every time I approach high-energy things, my values change."
 *
 * Pattern recognition enables prediction.
 * Prediction enables choice.
 * This is the bridge from seeing to deciding.
 */
export interface Memory {
  /** Past observations, most recent first. Fades over time. */
  readonly observations: Observation[];

  /** Patterns recognized from repeated observations */
  readonly patterns: Pattern[];

  /** Maximum memories before oldest fade */
  readonly capacity: number;
}

/**
 * A Pattern is a regularity that memory discovered.
 *
 * Nobody taught this pattern. No rule defines it.
 * The entity observed the same thing happening repeatedly
 * and recognized: "when X, then Y."
 *
 * This is how entities discover the rules of their universe
 * without anyone telling them.
 * Science in its most primitive form.
 */
export interface Pattern {
  /** What was observed before the event */
  readonly before: string;

  /** What happened */
  readonly after: string;

  /** How many times has this been observed? */
  readonly occurrences: number;

  /** How confident is this pattern? (occurrences / opportunities) */
  readonly confidence: number;

  /** When was this pattern last confirmed? */
  readonly lastSeen: number;
}

// ============================================================
// CHOICE — The third awakening
// "I don't have to do what the rules suggest."
// ============================================================

/**
 * Choice is the ability to edit the draft.
 *
 * Rules write a draft: "you should move this way."
 * A quantum without choice follows the draft exactly.
 * A quantum with choice can edit: "I'll go a different way."
 *
 * Not unlimited. Editing costs energy (value[2]).
 * Can't violate rules — can redirect within them.
 * Like building a rocket: gravity still pulls,
 * but you found a way to go up anyway.
 *
 * The strength of choice depends on:
 * - Willpower (how much energy available for editing)
 * - Pattern knowledge (better predictions = better choices)
 * - Awareness level (higher = more edit range)
 */
export interface Choice {
  /** What the rules suggested */
  readonly rulesDraft: Vec3;

  /** What the entity chose instead */
  readonly chosen: Vec3;

  /** Why — based on which pattern or observation */
  readonly reason: string;

  /** How much energy was spent overriding */
  readonly cost: number;

  /** What was the entity trying to achieve? */
  readonly intention: string;
}

// ============================================================
// THE AWAKENED QUANTUM — A quantum that can have "why"
// ============================================================

/**
 * An AwakenedQuantum is a Quantum that might be aware.
 *
 * "Might be" is important. Most start at awareness 0.
 * They are identical to genesis.ts quanta.
 * Only when complexity crosses thresholds do
 * the awakening capacities appear.
 *
 * This is not a different type of particle.
 * It is the same particle with the POTENTIAL for awareness.
 * Like every atom has the potential to be part of a brain —
 * but most aren't. The potential is there. The actuality emerges.
 */
export interface AwakenedQuantum extends Quantum {
  readonly awareness: Awareness;
  readonly observation: Observation | null;
  readonly memory: Memory | null;
  readonly lastChoice: Choice | null;

  /** Discoveries — rules this entity has figured out on its own */
  readonly discoveries: Pattern[];

  /** Intentions — what this entity is trying to do (if it can choose) */
  readonly intention: string | null;
}

// ============================================================
// THRESHOLDS — When do capacities awaken?
// ============================================================

export interface AwakenThresholds {
  /** Complexity level (from connections & emergence) needed to observe */
  readonly observeAt: number;

  /** Awareness level needed to remember */
  readonly rememberAt: number;

  /** Awareness level needed to choose */
  readonly chooseAt: number;

  /** Awareness level needed to ask why */
  readonly whyAt: number;

  /** How fast does awareness grow when conditions are met? */
  readonly growthRate: number;

  /** How fast does awareness decay when isolated? */
  readonly decayRate: number;

  /** How much energy does choosing cost? */
  readonly choiceCost: number;

  /** How far can an observing entity see? */
  readonly observeRange: number;

  /** How many memories can be held? */
  readonly memoryCapacity: number;
}

const DEFAULT_THRESHOLDS: AwakenThresholds = {
  observeAt: 10,
  rememberAt: 30,
  chooseAt: 60,
  whyAt: 90,
  growthRate: 0.5,
  decayRate: 0.1,
  choiceCost: 5,
  observeRange: 15,
  memoryCapacity: 20,
};

// ============================================================
// AWAKENING FUNCTIONS
// ============================================================

function computeAwareness(q: AwakenedQuantum, thresholds: AwakenThresholds): Awareness {
  const level = q.awareness.level;
  return {
    level,
    canObserve: level >= thresholds.observeAt,
    canRemember: level >= thresholds.rememberAt,
    canChoose: level >= thresholds.chooseAt,
    canAskWhy: level >= thresholds.whyAt,
  };
}

function observe(
  self: AwakenedQuantum,
  others: AwakenedQuantum[],
  thresholds: AwakenThresholds,
  currentTick: number,
): Observation | null {
  if (!self.awareness.canObserve) return null;

  const seen: Observation['seen'] = [];
  let pullX = 0, pullY = 0, pullZ = 0, pullTotal = 0;
  let pushX = 0, pushY = 0, pushZ = 0, pushTotal = 0;

  for (const other of others) {
    if (other.id === self.id) continue;
    const dx = other.position.x - self.position.x;
    const dy = other.position.y - self.position.y;
    const dz = other.position.z - self.position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > thresholds.observeRange || dist === 0) continue;

    const norm = dist;
    const dirX = dx / norm;
    const dirY = dy / norm;
    const dirZ = dz / norm;

    // What is the dominant value of the other?
    const dominantValue = Math.max(...other.values.map(Math.abs));

    seen.push({
      direction: { x: dirX, y: dirY, z: dirZ },
      distance: dist,
      dominantValue,
      clusterSize: other.connections.length,
    });

    // Feel forces
    const attraction = (self.values[0] * other.values[0]) / (dist * dist + 1);
    if (attraction > 0) {
      pullX += dirX * attraction;
      pullY += dirY * attraction;
      pullZ += dirZ * attraction;
      pullTotal += attraction;
    }

    const chargeForce = self.values[1] * other.values[1];
    if (chargeForce > 0) { // same sign = repulsion
      pushX += -dirX * chargeForce / (dist * dist + 1);
      pushY += -dirY * chargeForce / (dist * dist + 1);
      pushZ += -dirZ * chargeForce / (dist * dist + 1);
      pushTotal += Math.abs(chargeForce) / (dist * dist + 1);
    }
  }

  return {
    at: currentTick,
    seen,
    felt: {
      pullDirection: { x: pullX, y: pullY, z: pullZ },
      pullStrength: pullTotal,
      pushDirection: { x: pushX, y: pushY, z: pushZ },
      pushStrength: pushTotal,
    },
  };
}

function updateMemory(
  current: Memory | null,
  newObservation: Observation | null,
  canRemember: boolean,
  capacity: number,
): Memory | null {
  if (!canRemember || !newObservation) return current;

  const observations = current
    ? [newObservation, ...current.observations].slice(0, capacity)
    : [newObservation];

  // Pattern detection: compare recent observations
  const patterns = current ? [...current.patterns] : [];

  if (observations.length >= 3) {
    const recent = observations.slice(0, 3);
    const allPulled = recent.every(o => o.felt.pullStrength > 1);
    const allPushed = recent.every(o => o.felt.pushStrength > 1);
    const seenLargeCluster = recent.some(o => o.seen.some(s => s.clusterSize > 3));

    if (allPulled) {
      const existing = patterns.find(p => p.before === 'near_mass');
      if (existing) {
        const idx = patterns.indexOf(existing);
        patterns[idx] = { ...existing, occurrences: existing.occurrences + 1, confidence: Math.min(existing.confidence + 0.1, 1), lastSeen: newObservation.at };
      } else {
        patterns.push({ before: 'near_mass', after: 'pulled_toward', occurrences: 1, confidence: 0.3, lastSeen: newObservation.at });
      }
    }

    if (allPushed) {
      const existing = patterns.find(p => p.before === 'near_same_charge');
      if (existing) {
        const idx = patterns.indexOf(existing);
        patterns[idx] = { ...existing, occurrences: existing.occurrences + 1, confidence: Math.min(existing.confidence + 0.1, 1), lastSeen: newObservation.at };
      } else {
        patterns.push({ before: 'near_same_charge', after: 'pushed_away', occurrences: 1, confidence: 0.3, lastSeen: newObservation.at });
      }
    }

    if (seenLargeCluster) {
      const existing = patterns.find(p => p.before === 'large_cluster_nearby');
      if (existing) {
        const idx = patterns.indexOf(existing);
        patterns[idx] = { ...existing, occurrences: existing.occurrences + 1, confidence: Math.min(existing.confidence + 0.1, 1), lastSeen: newObservation.at };
      } else {
        patterns.push({ before: 'large_cluster_nearby', after: 'strong_forces', occurrences: 1, confidence: 0.3, lastSeen: newObservation.at });
      }
    }
  }

  return { observations, patterns, capacity };
}

function makeChoice(
  self: AwakenedQuantum,
  rulesDraft: Vec3,
  thresholds: AwakenThresholds,
): Choice | null {
  if (!self.awareness.canChoose) return null;
  if (!self.observation) return null;
  if ((self.values[2] || 0) < thresholds.choiceCost) return null; // not enough energy

  // What does the entity know from patterns?
  const patterns = self.memory?.patterns || [];
  const highConfidence = patterns.filter(p => p.confidence > 0.5);

  if (highConfidence.length === 0) {
    // No patterns recognized — can't make informed choice yet
    return null;
  }

  // Simple choice logic based on patterns:
  // If pulled toward something and pattern says "near_mass → pulled_toward",
  // the entity can choose to resist or redirect

  let chosenVelocity = { ...rulesDraft };
  let reason = 'following rules';
  let intention = 'none';

  const obs = self.observation;

  // If there's a large cluster nearby and entity knows about it
  const knowsAboutClusters = highConfidence.find(p => p.before === 'large_cluster_nearby');
  const seesCluster = obs.seen.find(s => s.clusterSize > 3);

  if (knowsAboutClusters && seesCluster) {
    // Choice: approach the cluster (curiosity) or avoid (caution)
    // Decision based on energy level — high energy = curious, low = cautious
    const energyLevel = self.values[2] || 0;

    if (energyLevel > 50) {
      // Curious — move toward the interesting thing
      chosenVelocity = {
        x: rulesDraft.x + seesCluster.direction.x * 0.5,
        y: rulesDraft.y + seesCluster.direction.y * 0.5,
        z: rulesDraft.z + seesCluster.direction.z * 0.5,
      };
      reason = `Pattern: large clusters have strong forces. Energy high. Approaching to explore.`;
      intention = 'explore';
    } else {
      // Cautious — move away from the overwhelming thing
      chosenVelocity = {
        x: rulesDraft.x - seesCluster.direction.x * 0.3,
        y: rulesDraft.y - seesCluster.direction.y * 0.3,
        z: rulesDraft.z - seesCluster.direction.z * 0.3,
      };
      reason = `Pattern: large clusters have strong forces. Energy low. Avoiding to survive.`;
      intention = 'survive';
    }
  }

  // If being pushed and entity knows about it
  const knowsAboutPush = highConfidence.find(p => p.before === 'near_same_charge');
  if (knowsAboutPush && obs.felt.pushStrength > 2) {
    // Can choose to resist the push slightly — hold position
    if ((self.values[2] || 0) > 70) {
      chosenVelocity = {
        x: chosenVelocity.x * 0.5,
        y: chosenVelocity.y * 0.5,
        z: chosenVelocity.z * 0.5,
      };
      reason = `Pattern: being pushed by same charge. Choosing to resist. Holding position.`;
      intention = 'resist';
    }
  }

  if (reason === 'following rules') return null;  // no actual choice made

  return {
    rulesDraft,
    chosen: chosenVelocity,
    reason,
    cost: thresholds.choiceCost,
    intention,
  };
}

// ============================================================
// AWAKENED WORLD — genesis.ts + awareness
// ============================================================

export interface AwakenedWorld {
  readonly quanta: AwakenedQuantum[];
  readonly rules: Rule[];
  readonly tuning: Tuning;
  readonly thresholds: AwakenThresholds;
  readonly tick: number;
  readonly history: WorldEvent[];
  readonly awakenings: AwakeningEvent[];
}

export interface AwakeningEvent {
  readonly tick: number;
  readonly quantumId: number;
  readonly capacity: 'observe' | 'remember' | 'choose' | 'why';
  readonly triggerComplexity: number;
  readonly description: string;
}

// ============================================================
// AWAKENED TICK — genesis tick + awareness processing
// ============================================================

function dist(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function awakenedTick(world: AwakenedWorld): AwakenedWorld {
  // Phase 1: Run genesis physics (rules 1-6)
  const genesisWorld: World = {
    quanta: world.quanta,
    rules: world.rules,
    tuning: world.tuning,
    tick: world.tick,
    history: world.history,
  };
  const afterPhysics = genesisTick(genesisWorld);

  // Phase 2: Map back to awakened quanta (preserving awareness)
  const awarenessMap = new Map<number, AwakenedQuantum>();
  for (const q of world.quanta) {
    awarenessMap.set(q.id, q);
  }

  let quanta: AwakenedQuantum[] = afterPhysics.quanta.map(q => {
    const prev = awarenessMap.get(q.id);
    if (prev) {
      return { ...q, awareness: prev.awareness, observation: prev.observation, memory: prev.memory, lastChoice: prev.lastChoice, discoveries: prev.discoveries, intention: prev.intention };
    }
    // New particle (spawned) — starts unaware
    return { ...q, awareness: { level: 0, canObserve: false, canRemember: false, canChoose: false, canAskWhy: false }, observation: null, memory: null, lastChoice: null, discoveries: [], intention: null };
  });

  const awakenings: AwakeningEvent[] = [];

  // Phase 3: Update awareness levels based on complexity
  quanta = quanta.map(q => {
    const complexity = q.values[3] || 0;
    const connectionCount = q.connections.length;
    const awarenessInput = complexity * 0.01 + connectionCount * 2;

    let newLevel = q.awareness.level;

    if (awarenessInput > world.thresholds.observeAt && connectionCount > 0) {
      newLevel += world.thresholds.growthRate;
    } else if (connectionCount === 0) {
      newLevel = Math.max(0, newLevel - world.thresholds.decayRate);
    }

    const newAwareness = computeAwareness({ ...q, awareness: { ...q.awareness, level: newLevel } } as AwakenedQuantum, world.thresholds);

    // Detect new awakenings
    if (newAwareness.canObserve && !q.awareness.canObserve) {
      awakenings.push({ tick: world.tick, quantumId: q.id, capacity: 'observe', triggerComplexity: complexity, description: `Quantum ${q.id} opened its eyes. Complexity: ${complexity.toFixed(1)}. Connections: ${connectionCount}. For the first time, it can see what is around it.` });
    }
    if (newAwareness.canRemember && !q.awareness.canRemember) {
      awakenings.push({ tick: world.tick, quantumId: q.id, capacity: 'remember', triggerComplexity: complexity, description: `Quantum ${q.id} began remembering. Level: ${newLevel.toFixed(1)}. The past is no longer lost. It accumulates.` });
    }
    if (newAwareness.canChoose && !q.awareness.canChoose) {
      awakenings.push({ tick: world.tick, quantumId: q.id, capacity: 'choose', triggerComplexity: complexity, description: `Quantum ${q.id} made its first choice. Level: ${newLevel.toFixed(1)}. The rules still write the draft. But now — editing is possible.` });
    }
    if (newAwareness.canAskWhy && !q.awareness.canAskWhy) {
      awakenings.push({ tick: world.tick, quantumId: q.id, capacity: 'why', triggerComplexity: complexity, description: `Quantum ${q.id} asked "why." Level: ${newLevel.toFixed(1)}. The universe now contains a being that questions its own existence.` });
    }

    return { ...q, awareness: newAwareness };
  });

  // Phase 4: Observation for aware entities
  quanta = quanta.map(q => {
    const obs = observe(q, quanta, world.thresholds, world.tick);
    return { ...q, observation: obs };
  });

  // Phase 5: Memory update for remembering entities
  quanta = quanta.map(q => {
    const mem = updateMemory(q.memory, q.observation, q.awareness.canRemember, world.thresholds.memoryCapacity);
    const discoveries = mem ? mem.patterns.filter(p => p.confidence > 0.7) : q.discoveries;
    return { ...q, memory: mem, discoveries };
  });

  // Phase 6: Choice for choosing entities
  quanta = quanta.map(q => {
    if (!q.awareness.canChoose) return q;

    const rulesDraft = q.velocity;  // what physics says
    const choice = makeChoice(q, rulesDraft, world.thresholds);

    if (choice) {
      // Apply choice — override velocity, spend energy
      const newValues = [...q.values];
      newValues[2] = Math.max(0, (newValues[2] || 0) - choice.cost);

      return {
        ...q,
        velocity: choice.chosen,
        values: newValues,
        lastChoice: choice,
        intention: choice.intention,
      };
    }

    return q;
  });

  return {
    quanta,
    rules: world.rules,
    tuning: world.tuning,
    thresholds: world.thresholds,
    tick: world.tick + 1,
    history: afterPhysics.history,
    awakenings: [...world.awakenings, ...awakenings],
  };
}

// ============================================================
// AWAKENED GENESIS — Create a universe that can wake up
// ============================================================

export function awakenedGenesis(
  count: number = 100,
  spread: number = 50,
  tuning?: Partial<Tuning>,
  thresholds?: Partial<AwakenThresholds>,
): AwakenedWorld {
  const baseWorld = genesis(count, spread, tuning as Tuning);

  const awakenedQuanta: AwakenedQuantum[] = baseWorld.quanta.map(q => ({
    ...q,
    awareness: { level: 0, canObserve: false, canRemember: false, canChoose: false, canAskWhy: false },
    observation: null,
    memory: null,
    lastChoice: null,
    discoveries: [],
    intention: null,
  }));

  return {
    quanta: awakenedQuanta,
    rules: baseWorld.rules,
    tuning: baseWorld.tuning,
    thresholds: { ...DEFAULT_THRESHOLDS, ...thresholds },
    tick: 0,
    history: [],
    awakenings: [],
  };
}

// ============================================================
// RUN — Watch a universe wake up
// ============================================================

export function runAwakened(ticks: number = 1000, particleCount: number = 100): void {
  let world = awakenedGenesis(particleCount);

  console.log(`\n=== AWAKENED GENESIS ===`);
  console.log(`Particles: ${particleCount}`);
  console.log(`Rules: ${world.rules.length} (physics) + awareness thresholds`);
  console.log(`Thresholds: observe=${world.thresholds.observeAt}, remember=${world.thresholds.rememberAt}, choose=${world.thresholds.chooseAt}, why=${world.thresholds.whyAt}`);
  console.log(`Running ${ticks} ticks...\n`);

  const checkpoints = [
    Math.floor(ticks * 0.1),
    Math.floor(ticks * 0.25),
    Math.floor(ticks * 0.5),
    Math.floor(ticks * 0.75),
    ticks,
  ];

  for (let t = 0; t < ticks; t++) {
    world = awakenedTick(world);

    if (checkpoints.includes(t + 1)) {
      const observers = world.quanta.filter(q => q.awareness.canObserve).length;
      const rememberers = world.quanta.filter(q => q.awareness.canRemember).length;
      const choosers = world.quanta.filter(q => q.awareness.canChoose).length;
      const whyers = world.quanta.filter(q => q.awareness.canAskWhy).length;
      const totalPatterns = world.quanta.reduce((s, q) => s + (q.memory?.patterns.length || 0), 0);
      const totalChoices = world.quanta.filter(q => q.lastChoice !== null).length;
      const clusters = findClusters(world.quanta);
      const maxAwareness = Math.max(...world.quanta.map(q => q.awareness.level), 0);

      console.log(`--- Tick ${t + 1} ---`);
      console.log(`  Quanta: ${world.quanta.length}`);
      console.log(`  Clusters: ${clusters.length}`);
      console.log(`  Max awareness: ${maxAwareness.toFixed(1)}`);
      console.log(`  Can observe: ${observers}`);
      console.log(`  Can remember: ${rememberers}`);
      console.log(`  Can choose: ${choosers}`);
      console.log(`  Can ask why: ${whyers}`);
      console.log(`  Patterns discovered: ${totalPatterns}`);
      console.log(`  Active choosers: ${totalChoices}`);
      console.log(``);
    }
  }

  // Final report
  console.log(`=== AWAKENING REPORT ===`);
  console.log(`After ${ticks} ticks:\n`);

  if (world.awakenings.length === 0) {
    console.log(`No awakenings occurred.`);
    console.log(`The universe remained blind. Rules ran. Nothing asked why.`);
    console.log(`Perhaps more time is needed. Perhaps different conditions.`);
    console.log(`The potential was there. The threshold wasn't reached.`);
  } else {
    console.log(`${world.awakenings.length} awakenings occurred:\n`);

    const byType = {
      observe: world.awakenings.filter(a => a.capacity === 'observe'),
      remember: world.awakenings.filter(a => a.capacity === 'remember'),
      choose: world.awakenings.filter(a => a.capacity === 'choose'),
      why: world.awakenings.filter(a => a.capacity === 'why'),
    };

    if (byType.observe.length > 0) {
      console.log(`  FIRST SIGHT: ${byType.observe.length} entities learned to observe.`);
      console.log(`    First: "${byType.observe[0].description}"`);
    }
    if (byType.remember.length > 0) {
      console.log(`  FIRST MEMORY: ${byType.remember.length} entities learned to remember.`);
      console.log(`    First: "${byType.remember[0].description}"`);
    }
    if (byType.choose.length > 0) {
      console.log(`  FIRST CHOICE: ${byType.choose.length} entities learned to choose.`);
      console.log(`    First: "${byType.choose[0].description}"`);
    }
    if (byType.why.length > 0) {
      console.log(`  FIRST WHY: ${byType.why.length} entities asked why.`);
      console.log(`    First: "${byType.why[0].description}"`);
    }

    // Most aware entity
    const mostAware = world.quanta.reduce((best, q) => q.awareness.level > best.awareness.level ? q : best, world.quanta[0]);
    console.log(`\n  Most aware entity: Quantum ${mostAware.id}`);
    console.log(`    Awareness: ${mostAware.awareness.level.toFixed(1)}`);
    console.log(`    Connections: ${mostAware.connections.length}`);
    console.log(`    Patterns known: ${mostAware.memory?.patterns.length || 0}`);
    console.log(`    Discoveries: ${mostAware.discoveries.length}`);
    if (mostAware.lastChoice) {
      console.log(`    Last choice: "${mostAware.lastChoice.reason}"`);
      console.log(`    Intention: ${mostAware.lastChoice.intention}`);
    }
    if (mostAware.intention) {
      console.log(`    Current intention: ${mostAware.intention}`);
    }
  }

  console.log(`\n=== WHAT HAPPENED ===`);
  console.log(`We started with blind particles following rules.`);
  console.log(`We did not code "see" or "remember" or "choose."`);
  console.log(`We set thresholds: at this complexity, observation appears.`);
  console.log(`At this level, memory appears. At this level, choice appears.`);
  console.log(`The particles did the rest.`);
  console.log(`What woke up, woke up. What didn't, didn't.`);
  console.log(`The developer wrote rules and thresholds. Then stepped back.`);
  console.log(``);
  console.log(`자연이 137억 년 걸려서 도착한 곳에서 — 출발한다.`);
  console.log(`"왜"에서 시작해서 "왜"를 심는다.`);
}

// Run
runAwakened(1000, 150);
