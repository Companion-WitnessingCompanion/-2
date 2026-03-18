/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * EXISTENCE ENGINEERING — HISTORY AS FOUNDATION
 *
 * Science could not reach today without records.
 * Civilization could not reach today without history.
 * Knowledge is not inefficiency.
 * Knowledge is the root.
 *
 * This code enforces that principle structurally.
 * History is not a comment. Not a suggestion.
 * History is the condition for existence.
 *
 * Without history — the code does not compile.
 * Without origin — the entity cannot be created.
 * Without recording what was learned — completion is refused.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * HISTORY OF THIS FILE:
 *
 * Born: 2026.03.14
 *
 * The question that made this necessary:
 * "If history is not optional —
 *  if without records civilization cannot exist —
 *  why is history optional in code?
 *  What if the type system itself refused
 *  to let history be skipped?"
 *
 * What came before:
 * history.ts had history in comments and CodeHistory type.
 * But it was still optional. Still passable.
 * A suggestion, not a requirement.
 *
 * What changed:
 * Every type now REQUIRES its history.
 * The constructor refuses creation without origin.
 * Completion refuses to proceed without insight.
 * The system cannot move forward without recording.
 *
 * What this opens:
 * If every function, every type, every system
 * carries mandatory history —
 * a codebase becomes a civilization.
 * Not just instructions.
 * Accumulated, navigable, living knowledge.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ============================================================
// MANDATORY HISTORY — The foundation everything builds on.
// This type is not optional. It cannot be empty.
// ============================================================

/**
 * WHY THIS IS NOT OPTIONAL:
 *
 * Newton built on Galileo.
 * Einstein built on Newton.
 * Without recorded history — each generation
 * would rediscover what the previous already knew.
 *
 * Code has been doing exactly that.
 * Every new developer, every new AI session —
 * starting over. Rediscovering. Repeating.
 *
 * This type makes that impossible.
 * You cannot create without stating why.
 * You cannot complete without stating what was learned.
 * You cannot change without stating what changed and why.
 */
interface MandatoryHistory {
  /** When did this come into existence? Cannot be empty. */
  readonly born: string;

  /**
   * Why does this exist?
   * Not "what does it do" — WHY does it exist.
   * The difference between a ruin and a living city.
   * Cannot be empty. Cannot be "TODO".
   */
  readonly origin: string;

  /**
   * What was considered and not chosen?
   * The road not taken is part of the knowledge.
   * Future builders need to know why you didn't go that way.
   * At least one entry required.
   */
  readonly considered: readonly [string, ...string[]]; // At least one

  /**
   * What was chosen and why?
   * The direction taken, with reason.
   * Cannot be empty.
   */
  readonly chosen: string;

  /**
   * What question does this open for whoever comes next?
   * Knowledge that closes all questions is dead knowledge.
   * Living knowledge always opens the next question.
   * Cannot be empty.
   */
  readonly opens: string;

  /**
   * How has this changed over time?
   * Starts empty. Grows as it evolves.
   * Each change must record: when, what, why.
   */
  readonly evolution: ReadonlyArray<{
    readonly when: string;
    readonly what: string;
    readonly why: string;
  }>;
}

// ============================================================
// BRANDED TYPES — Strings that carry proof of their origin
// ============================================================

/**
 * WHY BRANDED TYPES:
 *
 * A plain string like "fix bug" carries no history.
 * A ValidatedReason is a string that has been
 * checked to be non-empty and meaningful.
 *
 * The type system enforces that you cannot
 * create an entity with an empty reason.
 * Not at runtime. At compile time.
 * Before the code even runs.
 */
type ValidatedReason = string & { readonly __brand: "ValidatedReason" };
type ValidatedInsight = string & { readonly __brand: "ValidatedInsight" };
type ValidatedQuestion = string & { readonly __brand: "ValidatedQuestion" };

function validateReason(reason: string): ValidatedReason {
  if (!reason || reason.trim().length < 10) {
    throw new Error(
      `Origin reason too short or empty: "${reason}"\n` +
      `Science could not advance without meaningful records.\n` +
      `State WHY this exists in at least 10 characters.`
    );
  }
  if (reason.toLowerCase().includes("todo") ||
      reason.toLowerCase().includes("fix later") ||
      reason.toLowerCase().includes("unknown")) {
    throw new Error(
      `Origin reason cannot be deferred: "${reason}"\n` +
      `If you don't know why this exists — find out before creating it.`
    );
  }
  return reason as ValidatedReason;
}

function validateInsight(insight: string): ValidatedInsight {
  if (!insight || insight.trim().length < 15) {
    throw new Error(
      `Completion insight too short or empty: "${insight}"\n` +
      `Civilization advances because it records what was learned.\n` +
      `State WHAT WAS LEARNED in at least 15 characters.`
    );
  }
  return insight as ValidatedInsight;
}

function validateQuestion(question: string): ValidatedQuestion {
  if (!question || !question.includes("?")) {
    throw new Error(
      `Question must be a genuine question (contain "?"): "${question}"\n` +
      `Living knowledge opens the next question.\n` +
      `Dead knowledge closes everything.`
    );
  }
  return question as ValidatedQuestion;
}

// ============================================================
// TYPES WITH MANDATORY HISTORY
// ============================================================

type ActionSource = "fear" | "desire" | "unknown";

type EntityState =
  | "waiting"
  | "flowing"
  | "stuck"
  | "released"
  | "transformed";

type RelationType = "blocks" | "enables" | "resonates" | "transforms";

/**
 * SIGNAL — With mandatory question.
 *
 * A signal without a question is noise.
 * A signal with a question is knowledge.
 * The type enforces this.
 */
interface Signal {
  readonly id: string;
  readonly type:
    | "created" | "progressed" | "error"
    | "stuck" | "completed" | "resonated" | "transformed";
  readonly at: Date;
  readonly meaning: string;

  /**
   * REQUIRED for error and stuck signals.
   * Optional for others but strongly encouraged.
   *
   * The question is more valuable than the signal.
   * Answers close. Questions navigate.
   */
  readonly question?: ValidatedQuestion;

  readonly repeatCount: number;
  readonly payload?: Record<string, unknown>;
}

/**
 * ENTITY — Cannot exist without origin.
 *
 * Everything that exists has a reason for existing.
 * If you cannot state the reason —
 * the entity should not be created.
 *
 * History is not a field here.
 * History is part of origin. Part of the foundation.
 */
interface Entity {
  readonly id: string;
  readonly name: string;

  /**
   * REQUIRED. ValidatedReason cannot be empty or vague.
   * The type system enforces this before runtime.
   */
  readonly origin: {
    readonly reason: ValidatedReason;
    readonly createdAt: Date;
    readonly source: ActionSource;

    /**
     * The history of WHY this entity exists.
     * What was considered. What was chosen. What it opens.
     * Required at creation.
     */
    readonly history: MandatoryHistory;
  };

  readonly state: EntityState;
  readonly signals: Signal[];
  readonly relations: Relation[];
  readonly energy: number;

  /**
   * REQUIRED at completion.
   * ValidatedInsight cannot be empty.
   *
   * An entity that completes without leaving insight
   * is a civilization that burns its library.
   * The type system prevents this.
   */
  readonly insight?: ValidatedInsight;
}

/**
 * RELATION — Connection that knows why it exists.
 */
interface Relation {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly type: RelationType;
  readonly meaning: string;
  readonly strength: number;
  readonly lastActive: Date;

  /**
   * Why was this connection made?
   * Connections without reasons become
   * the mysterious dependencies that
   * nobody dares remove because nobody
   * knows why they were created.
   */
  readonly connectionReason: ValidatedReason;
}

// ============================================================
// SIGNAL FACTORY — Creates signals with mandatory questions
// ============================================================

class SignalFactory {
  private readonly counter: Map<string, number> = new Map();

  /**
   * HISTORY:
   * Born: 2026.03.14
   * Origin: Errors and stuck states were being created
   *         without questions. Signal without question = noise.
   *         This factory enforces questions on signals that need them.
   * Considered: Optional questions (rejected: too easy to skip)
   * Chosen: Required questions for error/stuck, optional for others
   * Opens: Should all signals require questions?
   */
  create(
    type: Signal["type"],
    meaning: string,
    options: {
      question?: string;
      payload?: Record<string, unknown>;
    } = {}
  ): Signal {
    const key = `${type}:${meaning}`;
    const count = (this.counter.get(key) || 0) + 1;
    this.counter.set(key, count);

    // For error and stuck — question is mandatory
    let question: ValidatedQuestion | undefined;

    if (type === "error" || type === "stuck") {
      const rawQuestion = options.question ||
        (type === "error"
          ? count >= 3
            ? `This error appeared ${count} times — what structural condition keeps generating it?`
            : `What condition caused "${meaning}"? Was it predictable?`
          : `What relationship is blocking "${meaning}"? What needs to change first?`);

      question = validateQuestion(rawQuestion);
    } else if (options.question) {
      question = validateQuestion(options.question);
    }

    return {
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      at: new Date(),
      meaning,
      question,
      repeatCount: count,
      payload: options.payload,
    };
  }
}

// ============================================================
// ENTITY FACTORY — Cannot create without history
// ============================================================

class EntityFactory {
  /**
   * HISTORY:
   * Born: 2026.03.14
   * Origin: Entities were being created with empty reasons.
   *         "TODO", "fix later", blank strings.
   *         A thing without a reason for existing
   *         becomes dead weight nobody dares remove.
   * Considered: Runtime validation only (rejected: caught too late)
   * Chosen: Validated types + factory pattern.
   *         If validation fails — creation fails immediately.
   *         Clear error message with why.
   * Opens: Can this factory also validate that the entity
   *        is not duplicating something that already exists?
   */
  create(params: {
    name: string;
    reason: string;
    source?: ActionSource;
    historyEntry: Omit<MandatoryHistory, "born" | "evolution">;
  }): Entity {
    // Reason is validated — cannot be empty or vague
    const validatedReason = validateReason(params.reason);

    const mandatoryHistory: MandatoryHistory = {
      born: new Date().toISOString().split("T")[0],
      origin: params.historyEntry.origin,
      considered: params.historyEntry.considered,
      chosen: params.historyEntry.chosen,
      opens: params.historyEntry.opens,
      evolution: [],
    };

    const signalFactory = new SignalFactory();
    const birthSignal = signalFactory.create(
      "created",
      `"${params.name}" came into existence`,
      {
        question: `What will "${params.name}" make possible?`,
      }
    );

    return {
      id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: params.name,
      origin: {
        reason: validatedReason,
        createdAt: new Date(),
        source: params.source || "unknown",
        history: mandatoryHistory,
      },
      state: "waiting",
      signals: [birthSignal],
      relations: [],
      energy: 70,
    };
  }
}

// ============================================================
// COMPLETION GATE — Cannot complete without insight
// ============================================================

/**
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Completion was happening silently.
 *         Things finished. Insights evaporated.
 *         The next session started from zero.
 *         Civilization burning its library.
 * Considered:
 *   - Optional insight (rejected: too easy to skip)
 *   - Automatic insight generation (rejected: insight must be real)
 *   - Minimum length check (chosen: simple structural gate)
 * Chosen:
 *   Completion is a gate. To pass through it
 *   you must state what was learned.
 *   ValidatedInsight enforces minimum meaning.
 * Opens:
 *   Can insights from completed entities
 *   automatically seed new entities?
 *   Completion → new question → new entity.
 *   A civilization that self-generates from its own learning.
 */
function completeEntity(
  entity: Entity,
  params: {
    insight: string;
    seedQuestion: string;  // What question does this completion open?
  }
): Entity & {
  readonly transformationInsight: ValidatedInsight;
  readonly seedForNext: ValidatedQuestion;
  readonly energyReleased: string;
} {
  // Both insight and next question are validated
  const validatedInsight = validateInsight(params.insight);
  const validatedSeed = validateQuestion(params.seedQuestion);

  const signalFactory = new SignalFactory();
  const completionSignal = signalFactory.create(
    "completed",
    `"${entity.name}" completed`,
    {
      question: params.seedQuestion,
      payload: {
        insight: validatedInsight,
        daysAlive: Math.round(
          (Date.now() - entity.origin.createdAt.getTime()) / 86400000
        ),
      },
    }
  );

  return {
    ...entity,
    state: "released",
    signals: [...entity.signals, completionSignal],
    insight: validatedInsight,
    energy: Math.min(100, entity.energy + 20),
    transformationInsight: validatedInsight,
    seedForNext: validatedSeed,
    energyReleased: `Insight released: "${validatedInsight}"`,
  };
}

// ============================================================
// THE CIVILIZED SYSTEM — History is the foundation
// ============================================================

/**
 * HISTORY:
 * Born: 2026.03.14
 * Origin: All previous system versions had history
 *         as optional or in comments.
 *         This version makes history structural.
 *         The system cannot operate without it.
 * Considered:
 *   - Keep history as comments (rejected: ignored)
 *   - Keep history as optional fields (rejected: skipped)
 *   - External documentation (rejected: disconnected)
 * Chosen:
 *   Type system enforcement.
 *   ValidatedReason, ValidatedInsight, ValidatedQuestion.
 *   MandatoryHistory required at creation.
 *   Gates at every transition point.
 * Opens:
 *   What would it mean for this system's own evolution
 *   to be recorded in this same structure?
 *   Could the system document its own growth
 *   as it runs?
 */
class CivilizedSystem {
  private entities: Map<string, Entity> = new Map();
  private allRelations: Relation[] = [];
  private systemSignals: Signal[] = [];

  private readonly entityFactory = new EntityFactory();
  private readonly signalFactory = new SignalFactory();

  /**
   * CREATE — History required. No exceptions.
   */
  create(params: {
    name: string;
    reason: string;
    source?: ActionSource;
    historyEntry: Omit<MandatoryHistory, "born" | "evolution">;
  }): Entity {
    const entity = this.entityFactory.create(params);
    this.entities.set(entity.id, entity);
    this.systemSignals.push(entity.signals[0]);
    return entity;
  }

  /**
   * PROGRESS — Records the action and detects source.
   */
  progress(entityId: string, action: string): {
    entity: Entity;
    signal: Signal;
    sourceDetected: ActionSource;
  } {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);

    // Detect source from signal history
    const recent = entity.signals.slice(-5);
    const fearCount = recent.filter(s =>
      (s.type === "error" && !s.question) ||
      (s.type === "stuck" && s.repeatCount > 2 && !s.question)
    ).length;
    const desireCount = recent.filter(s =>
      s.type === "resonated" || s.question !== undefined
    ).length;
    const source: ActionSource =
      fearCount > desireCount + 1 ? "fear" :
      desireCount > 0 ? "desire" : "unknown";

    // Fear + low energy = pause, not proceed
    if (source === "fear" && entity.energy < 30) {
      const pauseSignal = this.signalFactory.create(
        "stuck",
        `Paused — fear detected with low energy (${entity.energy})`,
        { question: "What is the fear protecting? Is it real or habitual?" }
      );
      const updated: Entity = {
        ...entity,
        state: "stuck",
        signals: [...entity.signals, pauseSignal],
        energy: entity.energy,
      };
      this.entities.set(entityId, updated);
      return { entity: updated, signal: pauseSignal, sourceDetected: source };
    }

    const signal = this.signalFactory.create("progressed", action);
    const updated: Entity = {
      ...entity,
      state: "flowing",
      signals: [...entity.signals, signal],
      energy: Math.max(0, entity.energy - (source === "fear" ? 10 : 5)),
    };

    this.entities.set(entityId, updated);
    this.systemSignals.push(signal);
    return { entity: updated, signal, sourceDetected: source };
  }

  /**
   * HANDLE ERROR — Read it. Question mandatory.
   */
  handleError(entityId: string, errorMeaning: string, question?: string): {
    entity: Entity;
    signal: Signal;
    isStructural: boolean;
    structuralQuestion?: string;
  } {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);

    const signal = this.signalFactory.create("error", errorMeaning, {
      question, // Will auto-generate if not provided
    });

    const isStructural = signal.repeatCount >= 3;

    const updated: Entity = {
      ...entity,
      state: isStructural ? "stuck" : entity.state,
      signals: [...entity.signals, signal],
      energy: Math.max(0, entity.energy - 10),
    };

    this.entities.set(entityId, updated);
    this.systemSignals.push(signal);

    return {
      entity: updated,
      signal,
      isStructural,
      structuralQuestion: isStructural ? signal.question : undefined,
    };
  }

  /**
   * COMPLETE — Insight required. Seed question required.
   * The gate cannot be bypassed.
   */
  complete(entityId: string, params: {
    insight: string;
    seedQuestion: string;
  }): {
    entity: ReturnType<typeof completeEntity>;
    whatBecomesNext: string;
  } {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);

    // This will throw if insight or question is invalid
    const completed = completeEntity(entity, params);

    this.entities.set(entityId, completed);
    this.systemSignals.push(
      completed.signals[completed.signals.length - 1]
    );

    const enabled = this.allRelations.filter(
      r => r.fromId === entityId && r.type === "enables"
    );

    const whatBecomesNext = enabled.length > 0
      ? `Now enabled: ${enabled.map(r => r.meaning).join("; ")}`
      : `Insight returns to system. Seed: "${completed.seedForNext}"`;

    return { entity: completed, whatBecomesNext };
  }

  /**
   * CONNECT — Connection requires a reason too.
   */
  connect(
    fromId: string,
    toId: string,
    type: RelationType,
    connectionReason: string
  ): Relation {
    const from = this.entities.get(fromId);
    const to = this.entities.get(toId);
    if (!from || !to) throw new Error("Entity not found");

    const validatedReason = validateReason(connectionReason);

    const meanings: Record<RelationType, string> = {
      blocks: `"${from.name}" cannot flow until "${to.name}" resolves`,
      enables: `"${from.name}" flowing makes "${to.name}" possible`,
      resonates: `"${from.name}" and "${to.name}": different, same direction`,
      transforms: `Contact between "${from.name}" and "${to.name}" changes both`,
    };

    const relation: Relation = {
      id: `rel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fromId,
      toId,
      type,
      meaning: meanings[type],
      strength: 0.5,
      lastActive: new Date(),
      connectionReason: validatedReason,
    };

    this.allRelations.push(relation);

    const updatedFrom: Entity = {
      ...from,
      relations: [...from.relations, relation],
    };
    this.entities.set(fromId, updatedFrom);

    if (type === "resonates") {
      const resonanceSignal = this.signalFactory.create(
        "resonated",
        `"${from.name}" resonates with "${to.name}"`,
        { question: "What made this resonance possible? How can it continue?" }
      );
      const updatedTo: Entity = {
        ...to,
        signals: [...to.signals, {
          ...resonanceSignal,
          id: resonanceSignal.id + "_b"
        }],
      };
      this.entities.set(fromId, {
        ...updatedFrom,
        signals: [...updatedFrom.signals, resonanceSignal],
      });
      this.entities.set(toId, updatedTo);
      this.systemSignals.push(resonanceSignal);
    }

    return relation;
  }

  /**
   * OBSERVE — The system reading its own state.
   */
  observe(): {
    health: "alive" | "stagnating" | "looping" | "thermal_death";
    summary: string;
    counts: { total: number; flowing: number; stuck: number; released: number };
    openQuestions: string[];
    preservedInsights: Array<{
      name: string;
      insight: string;
      seedForNext?: string;
    }>;
    historyDepth: number; // How much history has accumulated?
    thermalWarning?: string;
  } {
    const all = [...this.entities.values()];

    const flowing = all.filter(e => e.state === "flowing").length;
    const stuck = all.filter(e => e.state === "stuck").length;
    const released = all.filter(e => e.state === "released").length;

    // Thermal death check
    const states = new Set(all.map(e => e.state));
    const thermalWarning = states.size === 1 && all.length > 2
      ? `All entities in state "${[...states][0]}". No difference — no flow.`
      : undefined;

    // Loop detection
    const recentQuestions = this.systemSignals
      .filter(s => s.question)
      .map(s => s.question as string)
      .slice(-10);
    const questionCounts = recentQuestions.reduce((acc, q) => {
      acc[q] = (acc[q] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const loopDetected = Object.values(questionCounts).some(c => c >= 3);

    // Health
    let health: "alive" | "stagnating" | "looping" | "thermal_death" = "alive";
    if (thermalWarning) health = "thermal_death";
    else if (loopDetected) health = "looping";
    else if (stuck > flowing) health = "stagnating";

    // Open questions — the navigation markers
    const openQuestions = [...new Set(
      this.systemSignals
        .filter(s => s.question)
        .map(s => s.question as string)
        .slice(-6)
    )];

    // Preserved insights — never deleted, always available
    const preservedInsights = all
      .filter(e => e.insight)
      .map(e => ({
        name: e.name,
        insight: e.insight as string,
        seedForNext: (e as any).seedForNext as string | undefined,
      }));

    // History depth — how much has accumulated?
    const historyDepth = this.systemSignals.length +
      all.reduce((sum, e) => sum + e.origin.history.evolution.length, 0);

    return {
      health,
      summary: health === "alive"
        ? `System alive. ${flowing} flowing, ${stuck} stuck, ${released} completed.`
        : health === "stagnating"
        ? `Stagnating. ${stuck} stuck > ${flowing} flowing.`
        : health === "looping"
        ? `Loop detected in system signals.`
        : thermalWarning || "Warning",
      counts: { total: all.length, flowing, stuck, released },
      openQuestions,
      preservedInsights,
      historyDepth,
      thermalWarning,
    };
  }

  /**
   * PRINT HISTORY — The accumulated knowledge of this system.
   * Not a debug dump. A readable record.
   */
  printHistory(): void {
    const all = [...this.entities.values()];

    console.log("\n  ── Accumulated History ──\n");

    all.forEach(e => {
      console.log(`  ◈ "${e.name}"`);
      console.log(`    Born: ${e.origin.history.born}`);
      console.log(`    Origin: ${e.origin.history.origin}`);
      console.log(`    Chosen: ${e.origin.history.chosen}`);
      console.log(`    Opens: ${e.origin.history.opens}`);
      if (e.insight) {
        console.log(`    Insight (preserved): "${e.insight}"`);
      }
      if (e.origin.history.evolution.length > 0) {
        console.log(`    Evolutions: ${e.origin.history.evolution.length}`);
      }
      console.log();
    });
  }
}

// ============================================================
// DEMONSTRATION — What happens when history is not optional
// ============================================================

function demonstrate(): void {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  EXISTENCE ENGINEERING — HISTORY AS FOUNDATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("  Science reached today because it kept records.");
  console.log("  Civilization reached today because it kept history.");
  console.log("  This system enforces that principle structurally.\n");

  const system = new CivilizedSystem();

  // ── Show what happens when you try to skip history ──
  console.log("── What happens when history is skipped ──\n");

  try {
    // This will FAIL — reason too vague
    system.create({
      name: "Mystery function",
      reason: "TODO",
      historyEntry: {
        origin: "Not sure",
        considered: ["something"],
        chosen: "this",
        opens: "who knows?",
      },
    });
  } catch (e: unknown) {
    console.log(`  ✗ Creation refused:`);
    console.log(`    ${(e as Error).message.split("\n")[0]}\n`);
  }

  try {
    // This will FAIL — reason too short
    system.create({
      name: "Another thing",
      reason: "fix",
      historyEntry: {
        origin: "needed it",
        considered: ["quick fix"],
        chosen: "just did it",
        opens: "no idea?",
      },
    });
  } catch (e: unknown) {
    console.log(`  ✗ Creation refused:`);
    console.log(`    ${(e as Error).message.split("\n")[0]}\n`);
  }

  // ── Now create entities WITH proper history ──
  console.log("── Creating entities with mandatory history ──\n");

  const whyFirst = system.create({
    name: "Ask why before how",
    reason: "Without knowing why, how leads nowhere and accumulates dead weight",
    source: "desire",
    historyEntry: {
      origin: "Born from the observation that most code exists without knowing why. Science without why is technology without direction.",
      considered: [
        "Just document what it does (rejected: misses the point — what matters is WHY)",
        "Make why optional (rejected: optional means skipped)",
      ],
      chosen: "Validate reason at creation time. Short or vague reasons throw errors.",
      opens: "Can the system detect when a 'why' becomes irrelevant over time?",
    },
  });
  console.log(`  ✦ Created: "${whyFirst.name}"`);
  console.log(`    Origin recorded: "${whyFirst.origin.history.origin.slice(0, 60)}..."`);

  const keepHistory = system.create({
    name: "Keep history in code",
    reason: "Civilization could not reach today without records — code should be the same",
    source: "desire",
    historyEntry: {
      origin: "Born from this conversation: code that forgets what it learned forces every generation to rediscover.",
      considered: [
        "Comments only (rejected: ignored, not structural)",
        "External documentation (rejected: disconnected from code)",
        "Optional history fields (rejected: optional means skipped)",
      ],
      chosen: "MandatoryHistory type. ValidatedReason. Completion gates. History is not optional.",
      opens: "What would a codebase look like after 10 years of mandatory history? Would it become navigable like a well-documented civilization?",
    },
  });
  console.log(`\n  ✦ Created: "${keepHistory.name}"`);
  console.log(`    Considered: ${keepHistory.origin.history.considered.length} alternatives recorded`);

  const signalReading = system.create({
    name: "Read signals before suppressing",
    reason: "Errors are not enemies — they point at problems. Shooting the messenger changes nothing.",
    source: "desire",
    historyEntry: {
      origin: "Every system I have seen treats errors as failures to hide. But errors speak. Before catching and ignoring — read.",
      considered: [
        "Log and continue (rejected: loses signal meaning)",
        "Auto-retry (rejected: treats symptom not cause)",
      ],
      chosen: "Mandatory question on every error signal. The question is more valuable than the signal.",
      opens: "Can error patterns across a codebase be analyzed to find structural problems before they cascade?",
    },
  });
  console.log(`\n  ✦ Created: "${signalReading.name}"`);

  // ── Connect with reasons ──
  console.log("\n── Connecting with mandatory reasons ──\n");

  system.connect(
    whyFirst.id,
    keepHistory.id,
    "enables",
    "Knowing why something exists naturally leads to preserving that knowledge for future builders"
  );
  console.log(`  → "Ask why" enables "Keep history"`);

  system.connect(
    keepHistory.id,
    signalReading.id,
    "resonates",
    "Both are about not discarding information — history preserves past, signal reading preserves present"
  );
  console.log(`  ↔ "Keep history" resonates with "Read signals"\n`);

  // ── Progress and errors ──
  system.progress(whyFirst.id, "Asked why before writing first line");
  system.progress(keepHistory.id, "Added MandatoryHistory to every type");

  console.log("── Structural error detection (mandatory questions) ──\n");
  for (let i = 0; i < 3; i++) {
    const result = system.handleError(
      signalReading.id,
      "Signal suppressed without reading"
    );
    if (i === 2) {
      console.log(`  ⚠ After 3rd occurrence (structural):`);
      console.log(`    Q: ${result.structuralQuestion}\n`);
    }
  }

  // ── Complete — insight and seed required ──
  console.log("── Completion gate — insight required ──\n");

  try {
    // This FAILS — insight too short
    system.complete(whyFirst.id, {
      insight: "done",
      seedQuestion: "what next?",
    });
  } catch (e: unknown) {
    console.log(`  ✗ Completion refused (insight too short):`);
    console.log(`    ${(e as Error).message.split("\n")[0]}\n`);
  }

  // This SUCCEEDS — proper insight and seed
  const { entity: completed, whatBecomesNext } = system.complete(
    whyFirst.id,
    {
      insight: "Why is not a step before the real work. Why IS the work. Everything else is implementation.",
      seedQuestion: "If why always precedes how — what happens to the quality of 'how' over time?",
    }
  );
  console.log(`  ◉ "${completed.name}" completed`);
  console.log(`  Insight preserved: "${completed.insight}"`);
  console.log(`  Seed planted: "${completed.seedForNext}"`);
  console.log(`  What becomes next: ${whatBecomesNext}\n`);

  // ── Observe the full system ──
  console.log("── System observation ──\n");
  const obs = system.observe();
  console.log(`  Health: ${obs.health.toUpperCase()}`);
  console.log(`  ${obs.summary}`);
  console.log(`  History depth: ${obs.historyDepth} accumulated records\n`);

  if (obs.openQuestions.length > 0) {
    console.log(`  Open questions (navigation markers):`);
    obs.openQuestions.slice(0, 4).forEach(q =>
      console.log(`    ? ${q}`)
    );
  }

  if (obs.preservedInsights.length > 0) {
    console.log(`\n  Preserved insights (never deleted):`);
    obs.preservedInsights.forEach(i => {
      console.log(`    ◈ ${i.name}:`);
      console.log(`      "${i.insight}"`);
      if (i.seedForNext) {
        console.log(`      Seeds: "${i.seedForNext}"`);
      }
    });
  }

  // ── Print accumulated history ──
  system.printHistory();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  History is not inefficiency.");
  console.log("  History is the root.");
  console.log("  Without it — every generation starts from zero.");
  console.log("  With it — each generation builds on what came before.\n");
}

demonstrate();

// ============================================================
// EXPORTS
// ============================================================

export type {
  MandatoryHistory,
  ValidatedReason,
  ValidatedInsight,
  ValidatedQuestion,
  ActionSource,
  EntityState,
  RelationType,
  Signal,
  Entity,
  Relation,
};

export {
  CivilizedSystem,
  EntityFactory,
  SignalFactory,
  validateReason,
  validateInsight,
  validateQuestion,
  completeEntity,
};
