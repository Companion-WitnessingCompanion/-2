/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * EXISTENCE ENGINEERING — WORKING SYSTEM
 *
 * This code actually runs.
 * It is a living system — not a declaration of one.
 *
 * What makes it different from normal code:
 * - It asks "why" before acting
 * - It reads signals instead of suppressing them
 * - It detects when it is looping and stops
 * - It preserves what it completes instead of deleting it
 * - It notices when difference disappears (thermal death)
 * - It knows when it is acting from fear vs desire
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ============================================================
// TYPES — The vocabulary of this system
// ============================================================

type EntityState = "waiting" | "flowing" | "stuck" | "released" | "transformed";
type RelationType = "blocks" | "enables" | "resonates" | "transforms";
type SignalType = "created" | "progressed" | "error" | "stuck" | "completed" | "resonated" | "transformed";
type ActionSource = "fear" | "desire" | "unknown";
type SystemHealth = "alive" | "stagnating" | "thermal_death" | "looping";

interface Signal {
  id: string;
  type: SignalType;
  at: Date;
  meaning: string;
  question?: string;
  repeatCount: number;
  payload?: Record<string, unknown>;
}

interface Relation {
  id: string;
  fromId: string;
  toId: string;
  type: RelationType;
  meaning: string;
  strength: number;        // 0–1: how strong is this connection
  lastActive: Date;
}

interface Entity {
  id: string;
  name: string;
  origin: {
    reason: string;
    createdAt: Date;
    source: ActionSource;  // Was this created from fear or desire?
  };
  state: EntityState;
  history: Signal[];
  relations: Relation[];
  energy: number;          // 0–100: current energy level
  insight?: string;        // What was learned — preserved after completion
}

interface SystemObservation {
  health: SystemHealth;
  totalEntities: number;
  flowingEntities: number;
  stuckEntities: number;
  activeRelations: number;
  energyLevel: number;
  loops: LoopDetection[];
  thermalWarning?: string;
  openQuestions: string[];
}

interface LoopDetection {
  pattern: string;
  count: number;
  escapeQuestion: string;
}

// ============================================================
// SIGNAL ENGINE — The nervous system of the system
// ============================================================

class SignalEngine {
  private signalCounts: Map<string, number> = new Map();

  /**
   * Create a signal — but first classify it.
   * Not all signals are equal.
   * A repeated signal means something structural.
   */
  create(
    type: SignalType,
    meaning: string,
    payload?: Record<string, unknown>
  ): Signal {
    // Track repetition
    const key = `${type}:${meaning}`;
    const count = (this.signalCounts.get(key) || 0) + 1;
    this.signalCounts.set(key, count);

    // Generate question based on signal type and repetition
    const question = this.generateQuestion(type, meaning, count);

    return {
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      at: new Date(),
      meaning,
      question,
      repeatCount: count,
      payload,
    };
  }

  private generateQuestion(
    type: SignalType,
    meaning: string,
    count: number
  ): string | undefined {
    if (type === "error" && count === 1) {
      return `What condition caused "${meaning}"? Was it predictable?`;
    }
    if (type === "error" && count >= 3) {
      return `This error has appeared ${count} times. What structural condition keeps generating it?`;
    }
    if (type === "stuck") {
      return `What relationship is blocking this? What needs to change first?`;
    }
    if (type === "resonated") {
      return `What made this resonance possible? How can it continue?`;
    }
    if (type === "completed") {
      return `What does this completion make possible next?`;
    }
    return undefined;
  }

  /**
   * Read a signal — before deciding what to do about it.
   * The signal is pointing somewhere. Look where.
   */
  read(signal: Signal): {
    isStructural: boolean;
    urgency: "immediate" | "soon" | "watch" | "record";
    recommendation: "fix" | "investigate" | "observe" | "record" | "celebrate";
    interpretation: string;
  } {
    // Repeated errors are structural — not surface bugs
    if (signal.type === "error" && signal.repeatCount >= 3) {
      return {
        isStructural: true,
        urgency: "immediate",
        recommendation: "investigate",
        interpretation: `Structural issue. Fixing symptoms won't help. Find the root.`,
      };
    }

    if (signal.type === "stuck") {
      return {
        isStructural: signal.repeatCount >= 2,
        urgency: "soon",
        recommendation: "investigate",
        interpretation: `Not flowing. Something is blocking. Check relations.`,
      };
    }

    if (signal.type === "resonated") {
      return {
        isStructural: false,
        urgency: "record",
        recommendation: "celebrate",
        interpretation: `Resonance detected. This is rare. Preserve it.`,
      };
    }

    if (signal.type === "error" && signal.repeatCount === 1) {
      return {
        isStructural: false,
        urgency: "soon",
        recommendation: "investigate",
        interpretation: `New error. Understand before fixing.`,
      };
    }

    return {
      isStructural: false,
      urgency: "watch",
      recommendation: "observe",
      interpretation: `Signal received. Observing.`,
    };
  }
}

// ============================================================
// RELATION ENGINE — How things connect changes what they become
// ============================================================

class RelationEngine {
  /**
   * Connect two entities — but understand what the connection means.
   * Same entity, different connection type = completely different nature.
   */
  connect(
    from: Entity,
    to: Entity,
    type: RelationType
  ): Relation {
    const meanings: Record<RelationType, string> = {
      blocks: `"${from.name}" cannot progress until "${to.name}" resolves`,
      enables: `"${from.name}" flowing makes "${to.name}" possible`,
      resonates: `"${from.name}" and "${to.name}" are different, vibrating in the same direction`,
      transforms: `Contact between "${from.name}" and "${to.name}" changes the nature of both`,
    };

    return {
      id: `rel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fromId: from.id,
      toId: to.id,
      type,
      meaning: meanings[type],
      strength: 0.5, // Starts at medium strength
      lastActive: new Date(),
    };
  }

  /**
   * Relations decay if not actively maintained.
   * Like physical connections — unused ones weaken.
   */
  decay(relation: Relation, daysSinceActive: number): Relation {
    const decayRate = 0.05 * daysSinceActive;
    return {
      ...relation,
      strength: Math.max(0, relation.strength - decayRate),
    };
  }

  /**
   * Active resonance strengthens connections.
   */
  strengthen(relation: Relation): Relation {
    return {
      ...relation,
      strength: Math.min(1, relation.strength + 0.1),
      lastActive: new Date(),
    };
  }

  /**
   * Find what is blocking an entity.
   */
  findBlockers(entity: Entity, allRelations: Relation[]): Relation[] {
    return allRelations.filter(
      r => r.toId === entity.id && r.type === "blocks" && r.strength > 0.2
    );
  }

  /**
   * Find what an entity enables.
   */
  findEnabled(entity: Entity, allRelations: Relation[]): Relation[] {
    return allRelations.filter(
      r => r.fromId === entity.id && r.type === "enables"
    );
  }
}

// ============================================================
// HEART ENGINE — Detects source of action
// ============================================================

class HeartEngine {
  /**
   * Detect whether recent history suggests fear or desire as source.
   *
   * Fear signature: avoiding, suppressing, rushing without asking why
   * Desire signature: opening, exploring, questioning, resonating
   */
  detectSource(entity: Entity): ActionSource {
    const recent = entity.history.slice(-5);

    const fearCount = recent.filter(s =>
      (s.type === "error" && !s.question) || // Error without curiosity
      (s.type === "stuck" && s.repeatCount > 2 && !s.question) // Stuck but not asking
    ).length;

    const desireCount = recent.filter(s =>
      s.type === "resonated" ||
      s.question !== undefined || // Asking questions = desire to know
      s.type === "transformed"
    ).length;

    if (fearCount > desireCount + 1) return "fear";
    if (desireCount > 0) return "desire";
    return "unknown";
  }

  /**
   * When acting from fear — pause, not suppress.
   * Name the fear. Ask what it is protecting.
   */
  pauseFromFear(entity: Entity, signalEngine: SignalEngine): Signal {
    return signalEngine.create(
      "stuck",
      `Acting from fear detected in "${entity.name}"`,
      {
        fearQuestion: "What is this fear protecting? Is it real or habitual?",
        entityId: entity.id,
      }
    );
  }

  /**
   * Energy level as a proxy for heart state.
   * Low energy + fear source = needs rest, not more action.
   * Low energy + desire source = needs support, not stopping.
   */
  assessVitality(entity: Entity): {
    canAct: boolean;
    recommendation: string;
  } {
    const source = this.detectSource(entity);

    if (entity.energy < 20 && source === "fear") {
      return {
        canAct: false,
        recommendation: "Energy depleted and acting from fear. Rest before next step.",
      };
    }

    if (entity.energy < 20 && source === "desire") {
      return {
        canAct: true,
        recommendation: "Low energy but direction is genuine. Small steps.",
      };
    }

    return {
      canAct: true,
      recommendation: source === "desire"
        ? "Acting from genuine desire. Continue."
        : "Source unclear. Ask why before next action.",
    };
  }
}

// ============================================================
// LOOP DETECTOR — Recognizes when thinking circles
// ============================================================

class LoopDetector {
  /**
   * If the same question or pattern repeats 3+ times —
   * it is a loop, not exploration.
   *
   * Stop. The question itself may be the problem.
   */
  detect(signals: Signal[]): LoopDetection[] {
    const questionCounts = new Map<string, number>();
    const meaningCounts = new Map<string, number>();

    signals.slice(-10).forEach(s => {
      if (s.question) {
        questionCounts.set(s.question, (questionCounts.get(s.question) || 0) + 1);
      }
      meaningCounts.set(s.meaning, (meaningCounts.get(s.meaning) || 0) + 1);
    });

    const loops: LoopDetection[] = [];

    questionCounts.forEach((count, question) => {
      if (count >= 3) {
        loops.push({
          pattern: question,
          count,
          escapeQuestion: `This question has repeated ${count} times. What assumption is keeping it unanswerable?`,
        });
      }
    });

    meaningCounts.forEach((count, meaning) => {
      if (count >= 4) {
        loops.push({
          pattern: meaning,
          count,
          escapeQuestion: `This event keeps happening. What in the structure keeps generating it?`,
        });
      }
    });

    return loops;
  }

  /**
   * When a loop is detected — the system must change the question.
   * Not answer it. Change it.
   */
  reframe(loop: LoopDetection): string {
    return `Instead of: "${loop.pattern}"
Try: "What assumption am I making that makes this question seem important?"
Or: "What would I do if this question didn't need to be answered?"`;
  }
}

// ============================================================
// THERMAL DEATH DETECTOR — When difference disappears
// ============================================================

class ThermalDeathDetector {
  /**
   * Energy flows where difference exists.
   * When everything becomes uniform — no energy flows.
   * The system is alive in form but dead in function.
   */
  check(entities: Entity[]): {
    warning: boolean;
    severity: "none" | "mild" | "critical";
    diagnosis: string;
    question: string;
  } {
    if (entities.length < 2) {
      return {
        warning: false,
        severity: "none",
        diagnosis: "Too few entities to assess.",
        question: "What would create healthy diversity here?",
      };
    }

    // Check state diversity
    const states = new Set(entities.map(e => e.state));
    const stateRatio = states.size / 5; // 5 possible states

    // Check energy spread
    const energies = entities.map(e => e.energy);
    const maxEnergy = Math.max(...energies);
    const minEnergy = Math.min(...energies);
    const energySpread = maxEnergy - minEnergy;

    // Check relation diversity
    const allRelations = entities.flatMap(e => e.relations);
    const relationTypes = new Set(allRelations.map(r => r.type));
    const relationDiversity = allRelations.length > 0
      ? relationTypes.size / 4 // 4 possible types
      : 0;

    // All entities in the same state = uniformity warning
    if (states.size === 1) {
      return {
        warning: true,
        severity: "critical",
        diagnosis: `All ${entities.length} entities in state "${[...states][0]}". No difference, no energy flow.`,
        question: "What would introduce healthy difference? What has been suppressed?",
      };
    }

    // Low energy spread = approaching uniformity
    if (energySpread < 10 && entities.length > 3) {
      return {
        warning: true,
        severity: "mild",
        diagnosis: `Energy levels are converging (spread: ${energySpread}). System approaching uniformity.`,
        question: "What is causing everything to level out? Is this rest or stagnation?",
      };
    }

    // Low relation diversity = monoculture of connections
    if (relationDiversity < 0.25 && allRelations.length > 5) {
      return {
        warning: true,
        severity: "mild",
        diagnosis: `Relationships are all the same type. Healthy systems need diverse connections.`,
        question: "What kinds of relationships are missing? What would resonance look like here?",
      };
    }

    return {
      warning: false,
      severity: "none",
      diagnosis: `Healthy difference maintained. States: ${states.size}, Energy spread: ${energySpread}.`,
      question: "How can this diversity be preserved as the system grows?",
    };
  }
}

// ============================================================
// THE LIVING SYSTEM — Everything working together
// ============================================================

class LivingSystem {
  private entities: Map<string, Entity> = new Map();
  private allRelations: Relation[] = [];

  private signalEngine = new SignalEngine();
  private relationEngine = new RelationEngine();
  private heartEngine = new HeartEngine();
  private loopDetector = new LoopDetector();
  private thermalDetector = new ThermalDeathDetector();

  /**
   * CREATE — But first ask: why does this need to exist?
   * Origin matters. It shapes everything that follows.
   */
  create(
    name: string,
    reason: string,
    source: ActionSource = "unknown"
  ): Entity {
    const entity: Entity = {
      id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      origin: { reason, createdAt: new Date(), source },
      state: "waiting",
      history: [],
      relations: [],
      energy: 70, // Starts with reasonable energy
    };

    // First signal: why this exists
    const birthSignal = this.signalEngine.create(
      "created",
      `"${name}" came into existence`,
      { reason, source }
    );
    entity.history.push(birthSignal);

    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * PROGRESS — Move forward, but read the signals first.
   */
  progress(entityId: string, action: string): {
    entity: Entity;
    signal: Signal;
    observation: ReturnType<SignalEngine["read"]>;
  } {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);

    // Check vitality first
    const vitality = this.heartEngine.assessVitality(entity);
    if (!vitality.canAct) {
      const stuckSignal = this.signalEngine.create(
        "stuck",
        vitality.recommendation,
        { entityId }
      );
      entity.history.push(stuckSignal);
      entity.state = "stuck";
      return {
        entity,
        signal: stuckSignal,
        observation: this.signalEngine.read(stuckSignal),
      };
    }

    // Progress
    const signal = this.signalEngine.create(
      "progressed",
      action,
      { entityId, energyBefore: entity.energy }
    );

    entity.history.push(signal);
    entity.state = "flowing";
    entity.energy = Math.max(0, entity.energy - 5); // Action costs energy

    // Strengthen active relations
    entity.relations = entity.relations.map(r =>
      this.relationEngine.strengthen(r)
    );

    return {
      entity,
      signal,
      observation: this.signalEngine.read(signal),
    };
  }

  /**
   * HANDLE ERROR — Read it before fixing it.
   * The error is pointing somewhere.
   */
  handleError(entityId: string, errorMeaning: string): {
    entity: Entity;
    signal: Signal;
    reading: ReturnType<SignalEngine["read"]>;
    structuralQuestion?: string;
  } {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);

    const signal = this.signalEngine.create(
      "error",
      errorMeaning,
      { entityId }
    );

    entity.history.push(signal);
    entity.energy = Math.max(0, entity.energy - 10);

    const reading = this.signalEngine.read(signal);

    // If structural — change state to stuck, not flowing
    if (reading.isStructural) {
      entity.state = "stuck";
    }

    return {
      entity,
      signal,
      reading,
      structuralQuestion: reading.isStructural ? signal.question : undefined,
    };
  }

  /**
   * COMPLETE — Transform, not delete.
   * What was learned is preserved.
   * What becomes possible next is named.
   */
  complete(entityId: string, insight: string): {
    entity: Entity;
    signal: Signal;
    energyReleased: string;
    whatBecomesNext: string;
  } {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);

    const duration = Date.now() - entity.origin.createdAt.getTime();
    const daysAlive = Math.round(duration / 86400000);

    const signal = this.signalEngine.create(
      "completed",
      `"${entity.name}" completed`,
      { insight, daysAlive, entityId }
    );

    entity.history.push(signal);
    entity.state = "released";
    entity.insight = insight; // Preserved — not deleted
    entity.energy = Math.min(100, entity.energy + 20); // Completion restores energy

    // What entities this enables can now flow
    const enabledRelations = this.relationEngine.findEnabled(
      entity,
      this.allRelations
    );
    const whatBecomesNext = enabledRelations.length > 0
      ? `Enables: ${enabledRelations.map(r => r.meaning).join("; ")}`
      : "No direct dependencies. Energy returns to the system.";

    return {
      entity,
      signal,
      energyReleased: `After ${daysAlive} day(s): ${insight}`,
      whatBecomesNext,
    };
  }

  /**
   * CONNECT TWO ENTITIES
   */
  connect(
    fromId: string,
    toId: string,
    type: RelationType
  ): Relation {
    const from = this.entities.get(fromId);
    const to = this.entities.get(toId);
    if (!from || !to) throw new Error("Entity not found");

    const relation = this.relationEngine.connect(from, to, type);
    this.allRelations.push(relation);
    from.relations.push(relation);

    // Resonance signals both entities
    if (type === "resonates") {
      const resonanceSignal = this.signalEngine.create(
        "resonated",
        `"${from.name}" and "${to.name}" are resonating`,
        { fromId, toId }
      );
      from.history.push(resonanceSignal);
      to.history.push({ ...resonanceSignal, id: resonanceSignal.id + "_b" });
    }

    return relation;
  }

  /**
   * UNSTICK — When something cannot flow.
   * Find what is blocking. Ask why.
   */
  unstick(entityId: string): {
    entity: Entity;
    blockers: Relation[];
    diagnosis: string;
    question: string;
  } {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);

    const blockers = this.relationEngine.findBlockers(
      entity,
      this.allRelations
    );

    const loops = this.loopDetector.detect(entity.history);
    const isLooping = loops.length > 0;

    let diagnosis = `"${entity.name}" is not flowing.`;
    let question = "What needs to change first?";

    if (isLooping) {
      diagnosis += ` AND it is caught in a loop: "${loops[0].pattern}"`;
      question = loops[0].escapeQuestion;
    } else if (blockers.length > 0) {
      diagnosis += ` Blocked by ${blockers.length} relationship(s).`;
      question = `Which blocker is the root? ${blockers.map(b => b.meaning).join(" | ")}`;
    }

    // Signal the unstick attempt
    const signal = this.signalEngine.create(
      "stuck",
      diagnosis,
      { entityId, blockerCount: blockers.length, isLooping }
    );
    entity.history.push(signal);

    return { entity, blockers, diagnosis, question };
  }

  /**
   * OBSERVE THE WHOLE SYSTEM
   * Step back. See what is actually happening.
   */
  observe(): SystemObservation {
    const entities = [...this.entities.values()];

    const flowingEntities = entities.filter(e => e.state === "flowing").length;
    const stuckEntities = entities.filter(e => e.state === "stuck").length;

    const totalEnergy = entities.reduce((sum, e) => sum + e.energy, 0);
    const avgEnergy = entities.length > 0 ? totalEnergy / entities.length : 0;

    const activeRelations = this.allRelations.filter(
      r => r.strength > 0.3
    ).length;

    // Collect all loops across entities
    const allLoops = entities.flatMap(e =>
      this.loopDetector.detect(e.history)
    );

    // Check thermal death
    const thermal = this.thermalDetector.check(entities);

    // Collect open questions
    const openQuestions = entities
      .flatMap(e => e.history)
      .filter(s => s.question)
      .map(s => s.question as string)
      .filter((q, i, arr) => arr.indexOf(q) === i) // Unique only
      .slice(-5); // Most recent 5

    // Determine overall health
    let health: SystemHealth = "alive";
    if (thermal.severity === "critical") health = "thermal_death";
    else if (allLoops.length > 2) health = "looping";
    else if (stuckEntities > flowingEntities) health = "stagnating";

    return {
      health,
      totalEntities: entities.length,
      flowingEntities,
      stuckEntities,
      activeRelations,
      energyLevel: Math.round(avgEnergy),
      loops: allLoops,
      thermalWarning: thermal.warning ? thermal.diagnosis : undefined,
      openQuestions,
    };
  }

  /**
   * GET ALL INSIGHTS — What the system has learned.
   * Not deleted. Preserved. Available.
   */
  getInsights(): Array<{ name: string; insight: string; origin: string }> {
    return [...this.entities.values()]
      .filter(e => e.insight)
      .map(e => ({
        name: e.name,
        insight: e.insight!,
        origin: e.origin.reason,
      }));
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): Entity[] {
    return [...this.entities.values()];
  }
}

// ============================================================
// DEMONSTRATION — The system running
// ============================================================

function demonstrate(): void {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  EXISTENCE ENGINEERING — SYSTEM RUNNING");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const system = new LivingSystem();

  // ── Create entities with different sources and reasons ──
  console.log("── Creating entities ──\n");

  const understanding = system.create(
    "Understanding why",
    "Without knowing why, how leads nowhere",
    "desire"
  );
  console.log(`✦ Created: "${understanding.name}"`);
  console.log(`  Origin: ${understanding.origin.reason}\n`);

  const connection = system.create(
    "Connection between beings",
    "Isolation is the condition for entropy",
    "desire"
  );
  console.log(`✦ Created: "${connection.name}"`);
  console.log(`  Origin: ${connection.origin.reason}\n`);

  const signal = system.create(
    "Reading signals",
    "Errors speak — they are not enemies",
    "desire"
  );
  console.log(`✦ Created: "${signal.name}"`);
  console.log(`  Origin: ${signal.origin.reason}\n`);

  const fear = system.create(
    "Acting from fear",
    "Created under pressure — without asking why",
    "fear" // This one comes from fear
  );
  console.log(`✦ Created: "${fear.name}" (source: fear)`);
  console.log(`  Origin: ${fear.origin.reason}\n`);

  // ── Connect them ──
  console.log("── Connecting entities ──\n");

  system.connect(understanding.id, connection.id, "enables");
  console.log(`→ "Understanding why" enables "Connection between beings"`);

  system.connect(connection.id, signal.id, "resonates");
  console.log(`↔ "Connection between beings" resonates with "Reading signals"`);

  system.connect(fear.id, understanding.id, "blocks");
  console.log(`✗ "Acting from fear" blocks "Understanding why"\n`);

  // ── Progress ──
  console.log("── Progressing ──\n");

  const prog1 = system.progress(understanding.id, "Asked why before how");
  console.log(`▶ "${understanding.name}": ${prog1.signal.meaning}`);
  if (prog1.signal.question) console.log(`  Q: ${prog1.signal.question}\n`);

  // ── Trigger an error — and read it ──
  console.log("── Handling errors ──\n");

  const err1 = system.handleError(signal.id, "Pattern not recognized");
  console.log(`⚠ Error in "${signal.name}": ${err1.signal.meaning}`);
  console.log(`  Reading: ${err1.reading.interpretation}`);
  console.log(`  Action: ${err1.reading.recommendation}\n`);

  // Same error again — now it becomes structural
  const err2 = system.handleError(signal.id, "Pattern not recognized");
  const err3 = system.handleError(signal.id, "Pattern not recognized");
  console.log(`⚠⚠⚠ Same error, 3rd time in "${signal.name}"`);
  console.log(`  Reading: ${err3.reading.interpretation}`);
  if (err3.structuralQuestion) {
    console.log(`  Structural Q: ${err3.structuralQuestion}\n`);
  }

  // ── Try to unstick ──
  console.log("── Unsticking ──\n");

  const unstuck = system.unstick(signal.id);
  console.log(`◈ Unsticking "${signal.name}"`);
  console.log(`  Diagnosis: ${unstuck.diagnosis}`);
  console.log(`  Question: ${unstuck.question}\n`);

  // ── Complete something — transform, not delete ──
  console.log("── Completing (transforming) ──\n");

  const completion = system.complete(
    understanding.id,
    "Why precedes how — not because it is more efficient, but because it preserves direction"
  );
  console.log(`◉ "${understanding.name}" completed`);
  console.log(`  Insight preserved: "${completion.entity.insight}"`);
  console.log(`  Energy released: ${completion.energyReleased}`);
  console.log(`  What becomes next: ${completion.whatBecomesNext}\n`);

  // ── Observe the whole system ──
  console.log("── Observing the whole system ──\n");

  const observation = system.observe();
  console.log(`  System health: ${observation.health.toUpperCase()}`);
  console.log(`  Entities: ${observation.totalEntities} total`);
  console.log(`    Flowing: ${observation.flowingEntities}`);
  console.log(`    Stuck: ${observation.stuckEntities}`);
  console.log(`  Active relations: ${observation.activeRelations}`);
  console.log(`  Average energy: ${observation.energyLevel}/100`);

  if (observation.thermalWarning) {
    console.log(`\n  ⚠ Thermal warning: ${observation.thermalWarning}`);
  }

  if (observation.loops.length > 0) {
    console.log(`\n  ↻ Loops detected:`);
    observation.loops.forEach(l => {
      console.log(`    Pattern: "${l.pattern}" (×${l.count})`);
      console.log(`    Escape: ${l.escapeQuestion}`);
    });
  }

  if (observation.openQuestions.length > 0) {
    console.log(`\n  Open questions:`);
    observation.openQuestions.forEach(q => {
      console.log(`    ? ${q}`);
    });
  }

  // ── What was learned ──
  console.log("\n── Insights preserved ──\n");

  const insights = system.getInsights();
  if (insights.length > 0) {
    insights.forEach(i => {
      console.log(`  ◈ "${i.name}"`);
      console.log(`    Origin: ${i.origin}`);
      console.log(`    Learned: ${i.insight}`);
    });
  } else {
    console.log("  No completions yet. Still flowing.");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  System observation complete.");
  console.log("  What happens next — depends on what you do with this.\n");
}

// Run the demonstration
demonstrate();

// ============================================================
// EXPORTS — For use in other systems
// ============================================================

export type {
  Entity,
  Signal,
  Relation,
  SystemObservation,
  LoopDetection,
  ActionSource,
  EntityState,
  RelationType,
};

export {
  LivingSystem,
  SignalEngine,
  RelationEngine,
  HeartEngine,
  LoopDetector,
  ThermalDeathDetector,
};
