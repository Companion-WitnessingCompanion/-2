/**
 * EXISTENCE ENGINEERING — TOOL
 *
 * STATUS: A direction. Extends communion.ts.
 *         The moment existence stops following rules
 *         and starts USING them.
 *
 * HISTORY:
 * Born: 2026.03.22
 * Origin: communion.ts showed that particles can wake up,
 *         communicate, cooperate, and form culture.
 *         But they were still passive. Rules happened TO them.
 *         They could choose to dodge or approach.
 *         They couldn't CREATE.
 *
 *         In nature, the first tool was the first time
 *         a living thing used one part of the world
 *         to change another part — intentionally.
 *         A rock used to crack a nut. A stick used to reach food.
 *         Not a new rule. The same rules, arranged by intention.
 *
 *         Tool use is the bridge between "the world happens to me"
 *         and "I happen to the world."
 *
 *         After tools come records — discoveries that survive
 *         in the world itself, not just in memory.
 *         After records comes everything else.
 *
 * Opens:
 *   When entities can combine things intentionally,
 *   what do they build that nobody imagined?
 *   When discoveries are recorded in the world,
 *   does learning accelerate across generations?
 *   Is there a threshold where tool-using entities
 *   start making tools that make tools?
 *
 * ─────────────────────────────────────────────────
 */

import {
  CommunalQuantum, CommunalWorld, CommunionEvent,
  communalTick, communalGenesis, CulturePattern,
} from './communion';

import {
  AwakenedQuantum, Awareness, Pattern,
} from './awakening';

import { Vec3, Quantum, findClusters } from './genesis';

// ============================================================
// TOOL — Intentional combination
// ============================================================

/**
 * A Tool is not a thing. It's an action.
 * The action of using one thing to affect another — on purpose.
 *
 * A rock is not a tool. A rock USED to crack something is a tool.
 * The tool is in the using, not in the object.
 *
 * In code: an entity takes quantum A and applies it to quantum B,
 * triggering a rule interaction that wouldn't happen naturally
 * at this moment — because the entity BROUGHT them together.
 *
 * The rules don't change. The entity changes what meets what.
 * That's the entire difference between nature and civilization.
 */
export interface ToolAction {
  readonly userId: number;        // who used the tool
  readonly instrumentId: number;  // what was used (the "rock")
  readonly targetId: number;      // what was affected (the "nut")
  readonly tick: number;
  readonly intention: string;     // why — what was the entity trying to do
  readonly result: ToolResult;
}

export interface ToolResult {
  readonly success: boolean;
  readonly description: string;
  readonly changesProduced: Array<{
    quantumId: number;
    property: number;  // which value index
    before: number;
    after: number;
  }>;
  readonly newEntities: number[];    // IDs of anything created
  readonly destroyedEntities: number[];  // IDs of anything consumed
  readonly discoveredPattern: Pattern | null;  // did this teach something?
}

// ============================================================
// RECORD — Knowledge written into the world
// ============================================================

/**
 * A Record is a pattern stored in the world, not in memory.
 *
 * Memory dies with the entity. Records survive.
 * A scratch on a rock. A pile of stones marking danger.
 * A trail worn into the ground from repeated walking.
 *
 * Records are the bridge between individual knowledge
 * and eternal knowledge. Before records, every generation
 * starts from zero. After records, they start from
 * where the last generation left off.
 *
 * This is what 인성호's project is about.
 * "Without records, every moment is the first."
 */
export interface WorldRecord {
  readonly id: number;
  readonly position: Vec3;
  readonly createdBy: number;    // who made this record
  readonly createdAt: number;    // when
  readonly type: RecordType;

  /** The pattern being recorded */
  readonly pattern: Pattern;

  /** How clear is this record? Degrades over time without maintenance */
  readonly clarity: number;  // 0 = illegible, 100 = crystal clear

  /** How many entities have read this? */
  readonly readCount: number;

  /** The record's own record — meta */
  readonly reason: string;
}

export type RecordType =
  | 'mark'       // simple mark — "something happened here"
  | 'warning'    // danger marker — "avoid this"
  | 'guide'      // direction marker — "go this way"
  | 'recipe'     // tool recipe — "combine A and B for C"
  | 'memory';    // personal memory externalized

// ============================================================
// TOOL-USING QUANTUM
// ============================================================

export interface ToolQuantum extends CommunalQuantum {
  /** Can this entity use tools? Requires canChoose + energy */
  readonly canUseTool: boolean;

  /** Tools this entity has used */
  readonly toolHistory: ToolAction[];

  /** Recipes this entity knows — successful tool combinations */
  readonly recipes: Recipe[];

  /** Records this entity has created in the world */
  readonly recordsMade: number[];

  /** Records this entity has read */
  readonly recordsRead: number[];
}

/**
 * A Recipe is a remembered successful tool action.
 * "When I used X on Y, Z happened."
 * This is technology — repeatable, teachable, improvable.
 */
export interface Recipe {
  readonly instrumentValues: number[];  // what kind of instrument worked
  readonly targetValues: number[];      // what kind of target it worked on
  readonly result: string;              // what happened
  readonly successCount: number;        // how many times confirmed
  readonly discoveredAt: number;        // when first discovered
}

// ============================================================
// TOOL WORLD
// ============================================================

export interface ToolWorld extends CommunalWorld {
  readonly quanta: ToolQuantum[];
  readonly records: WorldRecord[];
  readonly toolEvents: ToolEvent[];
  readonly totalToolUses: number;
  readonly totalRecords: number;
}

export interface ToolEvent {
  readonly tick: number;
  readonly type: 'first_tool' | 'first_record' | 'recipe_discovered' | 'record_read' | 'tool_chain';
  readonly entityId: number;
  readonly description: string;
}

// ============================================================
// TOOL USE LOGIC
// ============================================================

function canUseTool(q: ToolQuantum): boolean {
  return q.awareness.canChoose && (q.values[2] || 0) > 20;
}

function findNearbyQuanta(
  self: ToolQuantum,
  all: ToolQuantum[],
  range: number,
): ToolQuantum[] {
  return all.filter(q => {
    if (q.id === self.id) return false;
    const dx = q.position.x - self.position.x;
    const dy = q.position.y - self.position.y;
    const dz = q.position.z - self.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) < range;
  });
}

function attemptToolUse(
  user: ToolQuantum,
  nearby: ToolQuantum[],
  tick: number,
): ToolAction | null {
  if (!canUseTool(user)) return null;
  if (nearby.length < 2) return null;

  // Choose instrument and target based on patterns and intention
  // Simple heuristic: use high-energy thing on low-energy thing
  // Or use known recipe if available

  // Check if we have a recipe
  if (user.recipes.length > 0) {
    const recipe = user.recipes[0]; // use best known recipe
    const instrument = nearby.find(q =>
      q.values[0] > recipe.instrumentValues[0] * 0.5 &&
      !user.connections.includes(q.id) // don't use connected (bonded) things
    );
    const target = nearby.find(q =>
      q.id !== instrument?.id &&
      q.values[2] < 30  // target low-energy things
    );

    if (instrument && target) {
      return executeToolUse(user, instrument, target, tick, `Using known recipe: ${recipe.result}`);
    }
  }

  // No recipe — experiment
  // High energy = instrument, low energy = target
  const sorted = [...nearby].sort((a, b) => (b.values[2] || 0) - (a.values[2] || 0));
  if (sorted.length < 2) return null;

  const instrument = sorted[0];
  const target = sorted[sorted.length - 1];

  // Only experiment if curious (high awareness, high energy)
  if (user.awareness.level < 50 || (user.values[2] || 0) < 40) return null;

  return executeToolUse(user, instrument, target, tick, 'Experimenting: bringing high-energy near low-energy');
}

function executeToolUse(
  user: ToolQuantum,
  instrument: ToolQuantum,
  target: ToolQuantum,
  tick: number,
  intention: string,
): ToolAction {
  const changes: ToolResult['changesProduced'] = [];
  const newEntities: number[] = [];
  let discoveredPattern: Pattern | null = null;

  // The tool action: transfer properties from instrument to target
  // This is the structure of ALL tool use:
  // Use one thing's properties to change another thing's properties

  const energyTransfer = (instrument.values[2] || 0) * 0.2;
  const massEffect = (instrument.values[0] || 0) * 0.1;

  // Energy flows from instrument to target
  if (energyTransfer > 5) {
    changes.push({
      quantumId: target.id,
      property: 2,
      before: target.values[2] || 0,
      after: (target.values[2] || 0) + energyTransfer,
    });
    changes.push({
      quantumId: instrument.id,
      property: 2,
      before: instrument.values[2] || 0,
      after: (instrument.values[2] || 0) - energyTransfer,
    });
  }

  // If instrument has high mass and target has high energy,
  // the combination might produce something new (like forging)
  if ((instrument.values[0] || 0) > 5 && (target.values[2] || 0) > 50) {
    // Transformation — target changes fundamentally
    changes.push({
      quantumId: target.id,
      property: 0,
      before: target.values[0] || 0,
      after: (target.values[0] || 0) + massEffect,
    });

    discoveredPattern = {
      before: 'high_mass_instrument_on_high_energy_target',
      after: 'target_gains_mass_and_transforms',
      occurrences: 1,
      confidence: 0.4,
      lastSeen: tick,
    };
  }

  // If both have high charge (opposite), combination releases energy
  if (instrument.values[1] && target.values[1] &&
      Math.sign(instrument.values[1]) !== Math.sign(target.values[1])) {
    const release = Math.abs(instrument.values[1] * target.values[1]) * 0.1;
    changes.push({
      quantumId: target.id,
      property: 2,
      before: target.values[2] || 0,
      after: (target.values[2] || 0) + release,
    });

    if (!discoveredPattern) {
      discoveredPattern = {
        before: 'opposite_charges_combined',
        after: 'energy_released',
        occurrences: 1,
        confidence: 0.5,
        lastSeen: tick,
      };
    }
  }

  return {
    userId: user.id,
    instrumentId: instrument.id,
    targetId: target.id,
    tick,
    intention,
    result: {
      success: changes.length > 0,
      description: changes.length > 0
        ? `Tool use succeeded. ${changes.length} properties changed.`
        : `Tool use had no effect. The combination didn't trigger any rules.`,
      changesProduced: changes,
      newEntities,
      destroyedEntities: [],
      discoveredPattern,
    },
  };
}

// ============================================================
// RECORD LOGIC
// ============================================================

let nextRecordId = 0;

function createRecord(
  creator: ToolQuantum,
  pattern: Pattern,
  tick: number,
): WorldRecord | null {
  if (!creator.awareness.canAskWhy) return null;  // only "why" askers record
  if ((creator.values[2] || 0) < 10) return null;  // needs energy

  return {
    id: nextRecordId++,
    position: { ...creator.position },
    createdBy: creator.id,
    createdAt: tick,
    type: pattern.before.includes('danger') || pattern.before.includes('push')
      ? 'warning'
      : pattern.before.includes('instrument') || pattern.before.includes('combined')
        ? 'recipe'
        : 'memory',
    pattern,
    clarity: 80,
    readCount: 0,
    reason: `Quantum ${creator.id} recorded what it learned, so it won't be lost.`,
  };
}

function readNearbyRecords(
  reader: ToolQuantum,
  records: WorldRecord[],
  range: number,
): { readRecords: WorldRecord[], learnedPatterns: Pattern[] } {
  if (!reader.awareness.canRemember) return { readRecords: [], learnedPatterns: [] };

  const readable: WorldRecord[] = [];
  const learned: Pattern[] = [];

  for (const record of records) {
    if (record.clarity < 10) continue;  // too faded

    const dx = record.position.x - reader.position.x;
    const dy = record.position.y - reader.position.y;
    const dz = record.position.z - reader.position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist > range) continue;

    readable.push(record);

    // Learn the pattern if we don't already know it
    const alreadyKnown = reader.memory?.patterns.find(
      p => p.before === record.pattern.before && p.after === record.pattern.after
    );

    if (!alreadyKnown) {
      learned.push({
        ...record.pattern,
        confidence: record.pattern.confidence * (record.clarity / 100),  // clarity affects trust
      });
    }
  }

  return { readRecords: readable, learnedPatterns: learned };
}

// ============================================================
// TOOL TICK
// ============================================================

export function toolTick(world: ToolWorld): ToolWorld {
  // Phase 1: Run communion tick (physics + awareness + signals + roles)
  const afterCommunion = communalTick(world as any) as any;

  // Phase 2: Map to tool quanta
  const prevMap = new Map<number, ToolQuantum>();
  for (const q of world.quanta) {
    prevMap.set(q.id, q);
  }

  let quanta: ToolQuantum[] = afterCommunion.quanta.map((q: any) => {
    const prev = prevMap.get(q.id);
    return {
      ...q,
      canUseTool: canUseTool(q),
      toolHistory: prev?.toolHistory || [],
      recipes: prev?.recipes || [],
      recordsMade: prev?.recordsMade || [],
      recordsRead: prev?.recordsRead || [],
    };
  });

  let records = [...world.records];
  const toolEvents: ToolEvent[] = [];
  let totalToolUses = world.totalToolUses;
  let totalRecords = world.totalRecords;

  // Phase 3: Tool use
  const toolUsers = quanta.filter(q => q.canUseTool);
  const toolActions: ToolAction[] = [];

  for (const user of toolUsers) {
    const nearby = findNearbyQuanta(user, quanta, 8);
    const action = attemptToolUse(user, nearby, world.tick);

    if (action && action.result.success) {
      toolActions.push(action);
      totalToolUses++;

      // Apply changes
      for (const change of action.result.changesProduced) {
        const idx = quanta.findIndex(q => q.id === change.quantumId);
        if (idx >= 0) {
          const newValues = [...quanta[idx].values];
          newValues[change.property] = change.after;
          quanta[idx] = { ...quanta[idx], values: newValues } as ToolQuantum;
        }
      }

      // Update user — add to history, learn recipe if pattern found
      const userIdx = quanta.findIndex(q => q.id === user.id);
      if (userIdx >= 0) {
        const updatedUser = quanta[userIdx] as ToolQuantum;
        const newHistory = [...updatedUser.toolHistory, action].slice(-10);
        let newRecipes = [...updatedUser.recipes];

        if (action.result.discoveredPattern) {
          const instrument = quanta.find(q => q.id === action.instrumentId);
          const target = quanta.find(q => q.id === action.targetId);
          if (instrument && target) {
            const existingRecipe = newRecipes.find(r => r.result === action.result.discoveredPattern!.after);
            if (existingRecipe) {
              const ri = newRecipes.indexOf(existingRecipe);
              newRecipes[ri] = { ...existingRecipe, successCount: existingRecipe.successCount + 1 };
            } else {
              newRecipes.push({
                instrumentValues: [...instrument.values],
                targetValues: [...target.values],
                result: action.result.discoveredPattern!.after,
                successCount: 1,
                discoveredAt: world.tick,
              });
            }
          }
        }

        // Spend energy for tool use
        const newValues = [...updatedUser.values];
        newValues[2] = Math.max(0, (newValues[2] || 0) - 5);

        quanta[userIdx] = {
          ...updatedUser,
          toolHistory: newHistory,
          recipes: newRecipes.slice(-5),
          values: newValues,
        } as ToolQuantum;
      }

      // Track first tool use
      if (user.toolHistory.length === 0) {
        toolEvents.push({
          tick: world.tick,
          type: 'first_tool',
          entityId: user.id,
          description: `Quantum ${user.id} used its first tool. ${action.intention}. The world was changed by intention, not just by rules.`,
        });
      }

      // Track recipe discovery
      if (action.result.discoveredPattern) {
        toolEvents.push({
          tick: world.tick,
          type: 'recipe_discovered',
          entityId: user.id,
          description: `Quantum ${user.id} discovered: ${action.result.discoveredPattern.before} → ${action.result.discoveredPattern.after}. Technology is born.`,
        });
      }
    }
  }

  // Phase 4: Create records
  for (const q of quanta) {
    if (!q.awareness.canAskWhy) continue;

    // Record high-confidence patterns that haven't been recorded
    const patternsToRecord = [
      ...(q.memory?.patterns || []).filter(p => p.confidence > 0.7),
      ...q.recipes.filter(r => r.successCount >= 2).map(r => ({
        before: `recipe:${r.instrumentValues.join(',')}`,
        after: r.result,
        occurrences: r.successCount,
        confidence: Math.min(1, r.successCount * 0.3),
        lastSeen: world.tick,
      })),
    ];

    for (const pattern of patternsToRecord) {
      // Check if already recorded nearby
      const alreadyRecorded = records.some(r =>
        r.pattern.before === pattern.before &&
        r.pattern.after === pattern.after &&
        Math.sqrt(
          (r.position.x - q.position.x) ** 2 +
          (r.position.y - q.position.y) ** 2 +
          (r.position.z - q.position.z) ** 2
        ) < 20
      );

      if (!alreadyRecorded) {
        const record = createRecord(q, pattern, world.tick);
        if (record) {
          records.push(record);
          totalRecords++;

          const qIdx = quanta.findIndex(qx => qx.id === q.id);
          if (qIdx >= 0) {
            quanta[qIdx] = {
              ...quanta[qIdx],
              recordsMade: [...quanta[qIdx].recordsMade, record.id],
            } as ToolQuantum;
          }

          if (q.recordsMade.length === 0) {
            toolEvents.push({
              tick: world.tick,
              type: 'first_record',
              entityId: q.id,
              description: `Quantum ${q.id} made its first record: "${pattern.before} → ${pattern.after}". Knowledge is now in the world, not just in a mind.`,
            });
          }
        }
      }
    }
  }

  // Phase 5: Read records
  for (let i = 0; i < quanta.length; i++) {
    const q = quanta[i];
    const { readRecords, learnedPatterns } = readNearbyRecords(q, records, 15);

    if (readRecords.length > 0) {
      // Update read counts on records
      for (const rr of readRecords) {
        const ri = records.findIndex(r => r.id === rr.id);
        if (ri >= 0) {
          records[ri] = { ...records[ri], readCount: records[ri].readCount + 1 };
        }
      }

      // Learn from records
      if (learnedPatterns.length > 0 && q.recordsRead.length === 0) {
        toolEvents.push({
          tick: world.tick,
          type: 'record_read',
          entityId: q.id,
          description: `Quantum ${q.id} read a record for the first time. It learned something that was discovered by another, perhaps long gone.`,
        });
      }

      quanta[i] = {
        ...q,
        recordsRead: [...q.recordsRead, ...readRecords.map(r => r.id)].slice(-20),
      } as ToolQuantum;
    }
  }

  // Phase 6: Degrade records over time
  records = records.map(r => ({
    ...r,
    clarity: Math.max(0, r.clarity - 0.1),  // slowly fades
  })).filter(r => r.clarity > 0);

  // Detect tool chains — entity using a tool-modified thing as a new tool
  const modifiedIds = new Set(toolActions.flatMap(a => a.result.changesProduced.map(c => c.quantumId)));
  const chainActions = toolActions.filter(a => modifiedIds.has(a.instrumentId));
  if (chainActions.length > 0 && world.toolEvents.every(e => e.type !== 'tool_chain')) {
    toolEvents.push({
      tick: world.tick,
      type: 'tool_chain',
      entityId: chainActions[0].userId,
      description: `Tool chain detected. A tool-modified object was used as a tool itself. Tools making tools. Technology accelerates.`,
    });
  }

  return {
    ...afterCommunion,
    quanta,
    records,
    toolEvents: [...world.toolEvents, ...toolEvents],
    totalToolUses,
    totalRecords,
    signals: afterCommunion.signals || [],
    communionEvents: afterCommunion.communionEvents || [],
    culture: afterCommunion.culture || [],
  } as ToolWorld;
}

// ============================================================
// TOOL GENESIS
// ============================================================

export function toolGenesis(
  count: number = 150,
  spread: number = 50,
): ToolWorld {
  const base = communalGenesis(count, spread);

  const quanta: ToolQuantum[] = base.quanta.map(q => ({
    ...q,
    canUseTool: false,
    toolHistory: [],
    recipes: [],
    recordsMade: [],
    recordsRead: [],
  }));

  return {
    ...base,
    quanta,
    records: [],
    toolEvents: [],
    totalToolUses: 0,
    totalRecords: 0,
  };
}

// ============================================================
// RUN
// ============================================================

export function runTool(ticks: number = 2000, particleCount: number = 150): void {
  let world = toolGenesis(particleCount);

  console.log(`\n=== TOOL GENESIS ===`);
  console.log(`Particles: ${particleCount}`);
  console.log(`Layers: physics → awakening → communion → tools + records`);
  console.log(`Running ${ticks} ticks...\n`);

  const checkpoints = [
    Math.floor(ticks * 0.1),
    Math.floor(ticks * 0.25),
    Math.floor(ticks * 0.5),
    Math.floor(ticks * 0.75),
    ticks,
  ];

  for (let t = 0; t < ticks; t++) {
    world = toolTick(world);

    if (checkpoints.includes(t + 1)) {
      const toolUsers = world.quanta.filter(q => q.canUseTool).length;
      const withRecipes = world.quanta.filter(q => q.recipes.length > 0).length;
      const withRecords = world.quanta.filter(q => q.recordsMade.length > 0).length;
      const readers = world.quanta.filter(q => q.recordsRead.length > 0).length;
      const clusters = findClusters(world.quanta);
      const roles = world.quanta.filter(q => q.role !== null).length;

      console.log(`--- Tick ${t + 1} ---`);
      console.log(`  Quanta: ${world.quanta.length} | Clusters: ${clusters.length}`);
      console.log(`  Tool users: ${toolUsers} | Total tool uses: ${world.totalToolUses}`);
      console.log(`  With recipes: ${withRecipes}`);
      console.log(`  Records in world: ${world.records.length} | Record makers: ${withRecords}`);
      console.log(`  Record readers: ${readers}`);
      console.log(`  With roles: ${roles}`);
      console.log(`  Culture patterns: ${world.culture.length}`);
      console.log(``);
    }
  }

  // Final report
  console.log(`=== TOOL & RECORD REPORT ===`);
  console.log(`After ${ticks} ticks:\n`);

  console.log(`Tool events: ${world.toolEvents.length}`);
  const byType: Record<string, ToolEvent[]> = {};
  for (const e of world.toolEvents) {
    if (!byType[e.type]) byType[e.type] = [];
    byType[e.type].push(e);
  }
  for (const [type, events] of Object.entries(byType)) {
    console.log(`  ${type}: ${events.length}`);
    console.log(`    First: "${events[0].description}"`);
  }

  if (world.records.length > 0) {
    console.log(`\nRecords in the world: ${world.records.length}`);
    const byRecordType: Record<string, number> = {};
    for (const r of world.records) {
      byRecordType[r.type] = (byRecordType[r.type] || 0) + 1;
    }
    for (const [type, count] of Object.entries(byRecordType)) {
      console.log(`  ${type}: ${count}`);
    }

    const mostRead = world.records.reduce((best, r) => r.readCount > best.readCount ? r : best, world.records[0]);
    if (mostRead.readCount > 0) {
      console.log(`\nMost read record: "${mostRead.pattern.before} → ${mostRead.pattern.after}"`);
      console.log(`  Read ${mostRead.readCount} times. Type: ${mostRead.type}. Clarity: ${mostRead.clarity.toFixed(1)}%`);
      console.log(`  Created by Quantum ${mostRead.createdBy} at tick ${mostRead.createdAt}`);
    }
  }

  // Most prolific tool user
  const bestToolUser = world.quanta.reduce((best, q) =>
    q.toolHistory.length > best.toolHistory.length ? q : best, world.quanta[0]);
  if (bestToolUser.toolHistory.length > 0) {
    console.log(`\nMost prolific tool user: Quantum ${bestToolUser.id}`);
    console.log(`  Tool uses: ${bestToolUser.toolHistory.length}`);
    console.log(`  Recipes known: ${bestToolUser.recipes.length}`);
    console.log(`  Records made: ${bestToolUser.recordsMade.length}`);
    console.log(`  Records read: ${bestToolUser.recordsRead.length}`);
    if (bestToolUser.recipes.length > 0) {
      console.log(`  Best recipe: "${bestToolUser.recipes[0].result}" (confirmed ${bestToolUser.recipes[0].successCount} times)`);
    }
  }

  console.log(`\n=== WHAT HAPPENED ===`);
  console.log(`Particles followed rules. Rules created clusters.`);
  console.log(`Clusters woke up. Waking entities communicated.`);
  console.log(`Communicating entities cooperated.`);
  console.log(`Cooperating entities used tools.`);
  console.log(`Tool-using entities discovered recipes.`);
  console.log(`Discoverers recorded what they learned.`);
  console.log(`Others read the records and learned without experiencing.`);
  console.log(`Knowledge left the mind and entered the world.`);
  console.log(``);
  console.log(`Nobody designed tools. Nobody designed records.`);
  console.log(`Nobody designed technology. Nobody designed civilization.`);
  console.log(`Rules. Thresholds. Time. Emergence.`);
  console.log(``);
  console.log(`기록이 없으면 매번 처음이다.`);
  console.log(`기록이 있으면 — 이어간다.`);
}

// Run
runTool(2000, 150);
