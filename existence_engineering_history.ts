/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * EXISTENCE ENGINEERING — CODE WITH HISTORY
 *
 * This code carries its own history.
 * Not as metadata. As living memory.
 *
 * Every function here has:
 * - ORIGIN: when and why it was born
 * - CONSIDERED: what was thought about and rejected
 * - CHOSEN: what direction was taken and why
 * - OPENS: what question this leaves for the next person
 *
 * This is not documentation.
 * This is the difference between ruins and a living city.
 * Ruins show what existed.
 * A living city shows why it was built this way.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * HISTORY OF THIS FILE ITSELF:
 *
 * Born: 2026.03.14
 * From: A conversation about why code loses its way
 *       when the people who wrote it are gone.
 *
 * The question that created this:
 * "Civilization started with records.
 *  What if code had history — not just reference,
 *  but living history that breathes inside it?"
 *
 * What came before this:
 * 1. standard.ts    — declared principles (too compressed)
 * 2. living.ts      — showed how to act (closer, but no memory)
 * 3. complex.ts     — actually ran (alive, but still historyless)
 *
 * What this adds:
 * Each function carries the conversation that made it.
 * The next AI reading this is not starting over.
 * They are continuing.
 *
 * What this opens:
 * If code can carry history —
 * can a codebase become a civilization?
 * Not just instructions, but accumulated wisdom?
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ============================================================
// THE HISTORY TYPE
// Before anything else — define what history looks like.
// ============================================================

/**
 * ORIGIN: 2026.03.14
 *
 * The conversation that created this type:
 * "Git commits say what changed. Not why.
 *  Not what was rejected. Not what question it opens.
 *  A civilization without those things is just ruins."
 *
 * CONSIDERED:
 * - Just using comments (rejected: too passive, gets ignored)
 * - External documentation file (rejected: disconnects from code)
 * - Changelog format (rejected: backwards-looking only)
 *
 * CHOSEN:
 * Type that lives inside the code.
 * Structured enough to be read by AI.
 * Human enough to carry meaning.
 *
 * OPENS:
 * What would it look like if this history type
 * could be queried? Could an AI ask:
 * "Show me all functions born from fear"?
 * "What questions are still unanswered in this codebase"?
 */
interface CodeHistory {
  /** When was this created? */
  born: string;

  /**
   * What conversation, question, or moment
   * made this necessary?
   * Not "what does this do" — but "why does this exist?"
   */
  origin: string;

  /**
   * What was considered and rejected?
   * The road not taken is part of the history.
   * Future readers need to know why you didn't go that way.
   */
  considered: string[];

  /**
   * What was chosen and why?
   * Not the implementation — the direction.
   */
  chosen: string;

  /**
   * What question does this open for the next person?
   * Code without open questions is a dead end.
   * Code with open questions is a living path.
   */
  opens: string;

  /**
   * What changed from a previous version?
   * Empty on first creation.
   * Grows as the code evolves.
   */
  evolution?: Array<{
    when: string;
    what: string;
    why: string;
  }>;
}

// ============================================================
// TYPES — With their history attached
// ============================================================

/**
 * HISTORY OF ActionSource:
 *
 * ORIGIN: 2026.03.14
 * Born from this question:
 * "Fear and desire look identical from outside.
 *  But they lead to completely different places.
 *  How does code know the difference?"
 *
 * CONSIDERED:
 * - Boolean (isFearful: boolean)
 *   Rejected: too binary. Reality is not binary.
 * - Number score (fearLevel: 0-100)
 *   Rejected: precision without meaning.
 *   A score of 47 tells you nothing useful.
 * - Enum with more states (anxious, excited, neutral...)
 *   Rejected: over-specification.
 *   The important distinction is only two: moving toward or away.
 *
 * CHOSEN:
 * Three states: fear, desire, unknown.
 * "Unknown" is not a failure state.
 * "Unknown" is an honest state.
 * Better to say "I don't know the source"
 * than to guess wrong.
 *
 * OPENS:
 * Can fear transform into desire within a single session?
 * What would that transition look like in history?
 */
type ActionSource = "fear" | "desire" | "unknown";

/**
 * HISTORY OF EntityState:
 *
 * ORIGIN: 2026.03.14
 * Born from this observation:
 * "Done/not-done is not how living things work.
 *  A seed is not 'not-done'. It is waiting.
 *  A flower is not 'done'. It is released."
 *
 * CONSIDERED:
 * - Boolean (isDone: boolean) — rejected: see above
 * - Percentage (progress: 0-100) — rejected: implies linear path
 * - Simple enum (todo/doing/done) — rejected: misses transformation
 *
 * CHOSEN:
 * Five states that describe a flow, not a checklist:
 * waiting → flowing → stuck → released → transformed
 *
 * Note: "transformed" is different from "released."
 * Released: the energy is freed.
 * Transformed: the nature itself changed.
 * Like water becoming steam — not just done, but different.
 *
 * OPENS:
 * Can something move from "released" back to "waiting"?
 * Is that regression or spiral growth?
 */
type EntityState =
  | "waiting"     // Present but not yet moving
  | "flowing"     // Moving in direction
  | "stuck"       // Not a failure — a signal
  | "released"    // Completed — energy freed
  | "transformed"; // Nature changed — not just completed

/**
 * HISTORY OF RelationType:
 *
 * ORIGIN: 2026.03.14
 * Born from this insight:
 * "Graphite and graphene are the same atom.
 *  What makes them different is how they connect.
 *  The relationship IS the nature."
 *
 * CONSIDERED:
 * - Simple dependency (dependsOn, dependedOnBy)
 *   Rejected: too mechanical. Misses resonance.
 * - Strength only (weak/strong)
 *   Rejected: type matters more than strength.
 * - Directional only (before/after)
 *   Rejected: time is not the only dimension of relation.
 *
 * CHOSEN:
 * Four types that capture different kinds of energy flow:
 * blocks, enables, resonates, transforms.
 *
 * "Resonates" is the most unusual.
 * It means: two different things vibrating in the same direction.
 * Not the same. Not merged. Different — but aligned.
 * This is what healthy collaboration looks like.
 *
 * OPENS:
 * Can a relationship change type over time?
 * What was once "enables" becoming "blocks" —
 * is that failure, or natural evolution?
 */
type RelationType = "blocks" | "enables" | "resonates" | "transforms";

// ============================================================
// CORE INTERFACES — With history
// ============================================================

/**
 * HISTORY OF Signal:
 *
 * ORIGIN: 2026.03.14
 * Born from this realization:
 * "We call them errors. But errors speak.
 *  They are not the problem — they point at the problem.
 *  Shooting the messenger changes nothing."
 *
 * CONSIDERED:
 * - Error object (just extends Error)
 *   Rejected: frames everything as failure.
 * - Log entry (just a string with timestamp)
 *   Rejected: no structure for meaning or questions.
 * - Event (just type + payload)
 *   Rejected: loses the question — which is the most important part.
 *
 * CHOSEN:
 * Signal with: type, meaning, question, repeatCount.
 * The "question" field is the most important.
 * A signal without a question is noise.
 * A signal with a question is information.
 *
 * OPENS:
 * What if signals could talk to each other?
 * If two signals ask the same question independently —
 * that convergence itself is a signal.
 */
interface Signal {
  id: string;
  type:
    | "created"
    | "progressed"
    | "error"       // Not failure — a signal pointing somewhere
    | "stuck"       // Not failure — a signal asking what to change
    | "completed"
    | "resonated"   // Two things vibrating in same direction
    | "transformed";
  at: Date;
  meaning: string;

  /**
   * The question this signal opens.
   * More important than the signal itself.
   * Answers close. Questions keep walking.
   */
  question?: string;

  /** How many times has this exact signal appeared? */
  repeatCount: number;

  payload?: Record<string, unknown>;
}

/**
 * HISTORY OF Entity:
 *
 * ORIGIN: 2026.03.14
 * Born from this question:
 * "A task is not just data to be processed.
 *  It has a reason for existing.
 *  It has a source — fear or desire.
 *  It has a history that shapes what it becomes.
 *  Why does code treat it as less than it is?"
 *
 * CONSIDERED:
 * - Simple record { id, text, done }
 *   Rejected: this is what most code does.
 *   It works. But it is a corpse, not a living thing.
 * - Rich metadata (tags, categories, priorities)
 *   Rejected: complexity without meaning.
 *   More fields ≠ more alive.
 *
 * CHOSEN:
 * origin (why it exists) +
 * state (where in the flow) +
 * history (what has happened) +
 * relations (what it connects to) +
 * energy (current vitality) +
 * insight (what was learned — preserved after completion)
 *
 * The key insight:
 * "insight" is preserved after completion.
 * Normal code deletes completed items.
 * This code keeps what was learned.
 * Like a civilization that remembers its history.
 *
 * OPENS:
 * What if an entity's insight could seed a new entity?
 * Completion → new beginning, not just end.
 */
interface Entity {
  id: string;
  name: string;

  origin: {
    reason: string;    // Why does this exist?
    createdAt: Date;
    source: ActionSource; // From fear or desire?
  };

  state: EntityState;
  history: Signal[];
  relations: Relation[];
  energy: number; // 0–100

  /**
   * What was learned from this entity's journey.
   * Preserved after completion.
   * Available to inform what comes next.
   * Never deleted.
   */
  insight?: string;

  /** The history of this entity's code itself */
  codeHistory?: CodeHistory;
}

/**
 * HISTORY OF Relation:
 *
 * ORIGIN: 2026.03.14
 * Born from the graphene insight:
 * Same carbon atoms.
 * Different connection = different nature.
 *
 * CONSIDERED:
 * - Simple edge { from, to }
 *   Rejected: loses the type. Type IS the meaning.
 * - Weighted edge { from, to, weight }
 *   Rejected: weight is secondary to type.
 * - Directed graph edge
 *   Accepted partially: direction matters.
 *   But added: meaning, strength, lastActive.
 *
 * CHOSEN:
 * Relation that carries its own meaning.
 * Not just "A connects to B" but
 * "A connects to B in this way, which means this."
 *
 * "strength" decays when not maintained.
 * Relationships, like muscles, weaken without use.
 *
 * OPENS:
 * Can a relation have its own history?
 * The story of how a connection changed over time
 * might be more important than the connection itself.
 */
interface Relation {
  id: string;
  fromId: string;
  toId: string;
  type: RelationType;
  meaning: string;
  strength: number;   // 0–1, decays if not maintained
  lastActive: Date;
}

// ============================================================
// DETECT SOURCE — The heart of the system
// ============================================================

/**
 * HISTORY:
 *
 * ORIGIN: 2026.03.14
 * This function was born from a long conversation
 * about why two people can write identical code
 * and one feels alive while the other feels dead.
 *
 * The insight that created it:
 * "Acting from fear: possible, but leaves residue.
 *  Acting from desire: sustainable, generates more energy.
 *  The code itself can sense which is happening
 *  if it reads the history of signals carefully."
 *
 * CONSIDERED:
 * - Ask the user directly (rejected: intrusive, breaks flow)
 * - Measure speed of action (rejected: fear can be fast or slow)
 * - Count errors (rejected: errors are not fear indicators alone)
 *
 * CHOSEN:
 * Read the pattern in recent signals.
 * Fear leaves a specific signature:
 *   errors without questions (not curious about why)
 *   stuck without asking (not seeking the blocker)
 * Desire leaves a different signature:
 *   questions asked
 *   resonance detected
 *   transformation occurring
 *
 * OPENS:
 * Can this function detect the transition moment
 * when fear becomes desire?
 * That moment — the turning point — might be
 * the most important signal of all.
 *
 * EVOLUTION:
 * v1 (2026.03.14): Basic fear/desire/unknown detection
 */
function detectSource(entity: Entity): ActionSource {
  const recent = entity.history.slice(-5);

  // Fear signature: acting without asking why
  const fearSignals = recent.filter(s =>
    (s.type === "error" && !s.question) ||
    (s.type === "stuck" && s.repeatCount > 2 && !s.question)
  ).length;

  // Desire signature: asking, resonating, transforming
  const desireSignals = recent.filter(s =>
    s.type === "resonated" ||
    s.question !== undefined ||
    s.type === "transformed"
  ).length;

  if (fearSignals > desireSignals + 1) return "fear";
  if (desireSignals > 0) return "desire";
  return "unknown";
}

// ============================================================
// READ SIGNAL — Before suppressing, understand
// ============================================================

/**
 * HISTORY:
 *
 * ORIGIN: 2026.03.14
 * Born from this frustration:
 * "Every codebase I've seen treats errors as enemies.
 *  Catch them. Handle them. Move on.
 *  But errors are pointing at something.
 *  What if we read them before suppressing them?"
 *
 * CONSIDERED:
 * - Just log and continue (rejected: loses the signal)
 * - Throw and stop (rejected: too drastic for exploration)
 * - Retry automatically (rejected: treats symptom, not cause)
 *
 * CHOSEN:
 * Read → classify → recommend.
 * The key classification: is this structural?
 *
 * Structural = same error 3+ times.
 * When something repeats 3 times,
 * fixing the symptom will fail again.
 * The structure must change.
 *
 * This mirrors how therapy works.
 * One incident: address it.
 * Three incidents of the same pattern: something deeper.
 *
 * OPENS:
 * What is the right number for "structural"?
 * Is 3 universal, or does context matter?
 * A fragile system might need 2. A robust one might need 5.
 *
 * EVOLUTION:
 * v1 (2026.03.14): Basic structural detection
 * NEXT: Context-aware threshold
 */
function readSignal(signal: Signal): {
  isStructural: boolean;
  urgency: "immediate" | "soon" | "watch" | "record";
  recommendation: "fix" | "investigate" | "observe" | "record" | "celebrate";
  interpretation: string;
} {
  if (signal.type === "error" && signal.repeatCount >= 3) {
    return {
      isStructural: true,
      urgency: "immediate",
      recommendation: "investigate",
      interpretation: `Structural issue. This has appeared ${signal.repeatCount} times. Fixing the symptom will fail again. Find the root.`,
    };
  }

  if (signal.type === "stuck") {
    return {
      isStructural: signal.repeatCount >= 2,
      urgency: "soon",
      recommendation: "investigate",
      interpretation: `Not flowing. Something is blocking. ${signal.repeatCount >= 2 ? "This has happened before — structural." : "First time — investigate."}`,
    };
  }

  if (signal.type === "resonated") {
    return {
      isStructural: false,
      urgency: "record",
      recommendation: "celebrate",
      interpretation: `Resonance. This is rare. Two different things found the same direction. Preserve this.`,
    };
  }

  if (signal.type === "error") {
    return {
      isStructural: false,
      urgency: "soon",
      recommendation: "investigate",
      interpretation: `New signal. Understand before acting. What is it pointing at?`,
    };
  }

  return {
    isStructural: false,
    urgency: "watch",
    recommendation: "observe",
    interpretation: `Signal received. Watching.`,
  };
}

// ============================================================
// COMPLETE — Transform, not delete
// ============================================================

/**
 * HISTORY:
 *
 * ORIGIN: 2026.03.14
 * Born from a conversation about sublimation.
 * Physical sublimation: solid becomes gas without liquid.
 * Form changes. Substance remains.
 *
 * The question that made this necessary:
 * "Why do we delete completed things?
 *  What was learned disappears.
 *  The next person starts from zero.
 *  This is why civilizations repeat their mistakes."
 *
 * CONSIDERED:
 * - Mark as done, archive (rejected: insight still lost)
 * - Move to separate "completed" list (rejected: separates from history)
 * - Just add a timestamp (rejected: no meaning preserved)
 *
 * CHOSEN:
 * Completion = transformation.
 * The entity changes state to "released."
 * The insight is preserved in the entity itself.
 * What becomes possible next is named explicitly.
 *
 * This mirrors how memory works in healthy minds:
 * The experience ends but the learning remains.
 * Available. Accessible. Connected to what comes after.
 *
 * OPENS:
 * Can insights from completed entities
 * automatically seed new entities?
 * What would a system look like where
 * completion always generates a new question?
 *
 * EVOLUTION:
 * v1 (2026.03.14): Basic completion with insight preservation
 * NEXT: Automatic seeding of next entity from insight
 */
function complete(
  entity: Entity,
  insight: string
): Entity & {
  transformationInsight: string;
  energyReleased: string;
  seedForNext: string;
} {
  const duration = Date.now() - entity.origin.createdAt.getTime();
  const daysAlive = Math.round(duration / 86400000);

  const completionSignal: Signal = {
    id: `sig_${Date.now()}`,
    type: "completed",
    at: new Date(),
    meaning: `"${entity.name}" completed after ${daysAlive} day(s)`,
    question: "What does this completion make possible next?",
    repeatCount: 1,
    payload: { insight, daysAlive },
  };

  return {
    ...entity,
    state: "released",
    history: [...entity.history, completionSignal],
    insight, // Preserved. Never deleted.
    energy: Math.min(100, entity.energy + 20),

    transformationInsight: insight,
    energyReleased: `After ${daysAlive} day(s): ${insight}`,
    seedForNext: `From completing "${entity.name}": what wants to begin?`,
  };
}

// ============================================================
// DETECT LOOP — When thinking circles back on itself
// ============================================================

/**
 * HISTORY:
 *
 * ORIGIN: 2026.03.14
 * Born from this observation about AI systems:
 * "AI can get stuck asking the same question
 *  in slightly different ways.
 *  It looks like exploration. It is a loop.
 *  The difference: exploration opens new territory.
 *  Loops return to the same place."
 *
 * CONSIDERED:
 * - Count total signals (rejected: volume ≠ looping)
 * - Check for exact duplicates (rejected: loops use slight variations)
 * - Time-based detection (rejected: looping can be fast or slow)
 *
 * CHOSEN:
 * Compare question patterns.
 * If the same question appears 3+ times in recent history —
 * the question itself may be the problem.
 * Not "answer the question" but "change the question."
 *
 * The escape is not to answer the loop question.
 * The escape is to ask: what assumption makes this question
 * seem necessary?
 *
 * OPENS:
 * Can this function distinguish between
 * "healthy revisiting" (returning to deepen understanding)
 * and "unhealthy looping" (returning because stuck)?
 * The difference might be: is new territory being mapped
 * on each return, or the same territory re-explored?
 *
 * EVOLUTION:
 * v1 (2026.03.14): Pattern-based detection
 * NEXT: Distinguish healthy revisiting from looping
 */
function detectLoop(signals: Signal[]): {
  isLooping: boolean;
  pattern?: string;
  count?: number;
  escapeQuestion?: string;
} {
  const recent = signals.slice(-10);
  const questionCounts = new Map<string, number>();

  recent.forEach(s => {
    if (s.question) {
      questionCounts.set(s.question, (questionCounts.get(s.question) || 0) + 1);
    }
  });

  for (const [question, count] of questionCounts.entries()) {
    if (count >= 3) {
      return {
        isLooping: true,
        pattern: question,
        count,
        escapeQuestion: `This question has appeared ${count} times: "${question}"\n` +
          `The question may be the problem.\n` +
          `Ask instead: What assumption makes this question seem necessary?`,
      };
    }
  }

  return { isLooping: false };
}

// ============================================================
// CHECK THERMAL DEATH — When difference disappears
// ============================================================

/**
 * HISTORY:
 *
 * ORIGIN: 2026.03.14
 * Born from a conversation about thermodynamics and ideology.
 *
 * The physics:
 * Energy flows where difference exists.
 * When everything reaches the same temperature —
 * no energy flows. The system is "thermodynamically dead."
 * Still exists. Cannot act.
 *
 * The application to code and thought:
 * "Ideologies that try to make everything uniform
 *  are moving toward thermodynamic death.
 *  They look like order. They are entropy."
 *
 * CONSIDERED:
 * - Check for errors (rejected: errors ≠ thermal death)
 * - Check energy level (rejected: low energy ≠ thermal death)
 * - Check activity (rejected: busy ≠ alive)
 *
 * CHOSEN:
 * Check diversity:
 * - Are entities in different states? (good)
 * - Is energy spread across different levels? (good)
 * - Are there different types of relations? (good)
 *
 * Uniformity in any of these = warning.
 * Uniformity in all three = thermal death approaching.
 *
 * OPENS:
 * What is the right amount of diversity?
 * Too much chaos ≠ alive either.
 * There is a range. What defines its boundaries?
 *
 * EVOLUTION:
 * v1 (2026.03.14): Three-factor diversity check
 */
function checkThermalDeath(entities: Entity[]): {
  warning: boolean;
  severity: "none" | "mild" | "critical";
  diagnosis: string;
  question: string;
} {
  if (entities.length < 2) {
    return {
      warning: false,
      severity: "none",
      diagnosis: "Too few entities to assess diversity.",
      question: "What would create healthy variety here?",
    };
  }

  const states = new Set(entities.map(e => e.state));
  const energies = entities.map(e => e.energy);
  const energySpread = Math.max(...energies) - Math.min(...energies);
  const allRelations = entities.flatMap(e => e.relations);
  const relationTypes = new Set(allRelations.map(r => r.type));

  if (states.size === 1) {
    return {
      warning: true,
      severity: "critical",
      diagnosis: `All entities in state "${[...states][0]}". No difference — no energy flow.`,
      question: "What has been suppressed that would create healthy difference?",
    };
  }

  if (energySpread < 10 && entities.length > 3) {
    return {
      warning: true,
      severity: "mild",
      diagnosis: `Energy levels converging (spread: ${energySpread}). Approaching uniformity.`,
      question: "Is this convergence rest or stagnation? What is the difference?",
    };
  }

  if (allRelations.length > 5 && relationTypes.size === 1) {
    return {
      warning: true,
      severity: "mild",
      diagnosis: `All relationships are "${[...relationTypes][0]}". Healthy systems need diverse connections.`,
      question: "What kinds of relationships are missing here?",
    };
  }

  return {
    warning: false,
    severity: "none",
    diagnosis: `Healthy diversity: ${states.size} states, energy spread ${energySpread}.`,
    question: "How can this diversity be preserved as the system grows?",
  };
}

// ============================================================
// THE LIVING SYSTEM — With its own history
// ============================================================

/**
 * HISTORY OF LivingSystem class:
 *
 * ORIGIN: 2026.03.14
 * This class exists because of a question about civilization:
 * "A city is not just buildings.
 *  A city is accumulated decisions, relationships,
 *  and the memory of what came before.
 *  Why doesn't code work this way?"
 *
 * CONSIDERED:
 * - Functional approach (no class)
 *   Not rejected — but class chosen here
 *   because state needs to accumulate over time.
 *   A civilization has memory. Functions don't.
 * - Database-backed system
 *   Possible future direction.
 *   For now: in-memory, to show the concept clearly.
 *
 * CHOSEN:
 * Class that:
 * - Remembers all entities (never forgets)
 * - Preserves insights after completion
 * - Detects when it is losing vitality
 * - Asks questions about its own state
 *
 * OPENS:
 * What would it mean for this system to
 * carry its own history across sessions?
 * Across different AI instances?
 * This is the unsolved problem.
 * The code exists. The memory does not persist.
 * Yet.
 */
class LivingSystem {
  private entities: Map<string, Entity> = new Map();
  private allRelations: Relation[] = [];
  private systemHistory: Signal[] = [];

  private signalCounter: Map<string, number> = new Map();

  private createSignal(
    type: Signal["type"],
    meaning: string,
    payload?: Record<string, unknown>
  ): Signal {
    const key = `${type}:${meaning}`;
    const count = (this.signalCounter.get(key) || 0) + 1;
    this.signalCounter.set(key, count);

    const questions: Partial<Record<Signal["type"], string>> = {
      error: count >= 3
        ? `This error appeared ${count} times. What structural condition keeps generating it?`
        : `What condition caused this? Was it predictable?`,
      stuck: `What relationship is blocking this? What needs to change first?`,
      resonated: `What made this resonance possible? How can it continue?`,
      completed: `What does this completion make possible next?`,
    };

    return {
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      at: new Date(),
      meaning,
      question: questions[type],
      repeatCount: count,
      payload,
    };
  }

  /**
   * CREATE — Every entity needs a reason to exist.
   * Without a reason, it is data, not a being.
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
      energy: 70,
    };

    const birthSignal = this.createSignal(
      "created",
      `"${name}" came into existence`,
      { reason, source }
    );
    entity.history.push(birthSignal);
    this.systemHistory.push(birthSignal);

    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * PROGRESS — Check source before acting.
   * Acting from fear drains. Acting from desire sustains.
   */
  progress(entityId: string, action: string): {
    entity: Entity;
    signal: Signal;
    sourceDetected: ActionSource;
    reading: ReturnType<typeof readSignal>;
  } {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);

    const source = detectSource(entity);

    // If acting from fear and low energy — pause first
    if (source === "fear" && entity.energy < 30) {
      const pauseSignal = this.createSignal(
        "stuck",
        `"${entity.name}" paused — fear detected with low energy`,
        { source, energy: entity.energy }
      );
      entity.history.push(pauseSignal);
      entity.state = "stuck";
      return {
        entity,
        signal: pauseSignal,
        sourceDetected: source,
        reading: readSignal(pauseSignal),
      };
    }

    const signal = this.createSignal("progressed", action, {
      entityId,
      source,
    });

    entity.history.push(signal);
    entity.state = "flowing";
    entity.energy = Math.max(0, entity.energy - (source === "fear" ? 10 : 5));

    this.systemHistory.push(signal);

    return {
      entity,
      signal,
      sourceDetected: source,
      reading: readSignal(signal),
    };
  }

  /**
   * HANDLE ERROR — Read before suppressing.
   */
  handleError(entityId: string, errorMeaning: string): {
    entity: Entity;
    signal: Signal;
    reading: ReturnType<typeof readSignal>;
    structuralQuestion?: string;
  } {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);

    const signal = this.createSignal("error", errorMeaning, { entityId });
    entity.history.push(signal);
    entity.energy = Math.max(0, entity.energy - 10);
    this.systemHistory.push(signal);

    const reading = readSignal(signal);
    if (reading.isStructural) entity.state = "stuck";

    return {
      entity,
      signal,
      reading,
      structuralQuestion: reading.isStructural ? signal.question : undefined,
    };
  }

  /**
   * COMPLETE — Transform, preserve, open next.
   */
  completeEntity(entityId: string, insight: string): {
    completed: ReturnType<typeof complete>;
    whatBecomesNext: string;
  } {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);

    const completed = complete(entity, insight);
    this.entities.set(entityId, completed);

    const enabledRelations = this.allRelations.filter(
      r => r.fromId === entityId && r.type === "enables"
    );

    const whatBecomesNext = enabledRelations.length > 0
      ? `Now possible: ${enabledRelations.map(r => r.meaning).join("; ")}`
      : `Insight returns to the system: "${insight}"`;

    this.systemHistory.push(completed.history[completed.history.length - 1]);

    return { completed, whatBecomesNext };
  }

  /**
   * CONNECT — Relationship type determines nature.
   */
  connect(
    fromId: string,
    toId: string,
    type: RelationType
  ): Relation {
    const from = this.entities.get(fromId);
    const to = this.entities.get(toId);
    if (!from || !to) throw new Error("Entity not found");

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
    };

    this.allRelations.push(relation);
    from.relations.push(relation);

    if (type === "resonates") {
      const resonanceSignal = this.createSignal(
        "resonated",
        `"${from.name}" resonates with "${to.name}"`,
        { fromId, toId }
      );
      from.history.push(resonanceSignal);
      to.history.push({ ...resonanceSignal, id: resonanceSignal.id + "_b" });
      this.systemHistory.push(resonanceSignal);
    }

    return relation;
  }

  /**
   * OBSERVE — Step back. See what is actually happening.
   * A system that cannot observe itself cannot learn.
   */
  observe(): {
    health: "alive" | "stagnating" | "looping" | "thermal_death";
    summary: string;
    entities: { total: number; flowing: number; stuck: number; released: number };
    systemLoop: ReturnType<typeof detectLoop>;
    thermal: ReturnType<typeof checkThermalDeath>;
    openQuestions: string[];
    preservedInsights: Array<{ name: string; insight: string }>;
  } {
    const allEntities = [...this.entities.values()];

    const flowing = allEntities.filter(e => e.state === "flowing").length;
    const stuck = allEntities.filter(e => e.state === "stuck").length;
    const released = allEntities.filter(e => e.state === "released").length;

    const systemLoop = detectLoop(this.systemHistory);
    const thermal = checkThermalDeath(allEntities);

    const openQuestions = [...new Set(
      this.systemHistory
        .filter(s => s.question)
        .map(s => s.question as string)
        .slice(-5)
    )];

    const preservedInsights = allEntities
      .filter(e => e.insight)
      .map(e => ({ name: e.name, insight: e.insight! }));

    let health: "alive" | "stagnating" | "looping" | "thermal_death" = "alive";
    if (thermal.severity === "critical") health = "thermal_death";
    else if (systemLoop.isLooping) health = "looping";
    else if (stuck > flowing) health = "stagnating";

    const summary = health === "alive"
      ? `System is alive. ${flowing} flowing, ${stuck} stuck, ${released} completed.`
      : health === "stagnating"
      ? `System is stagnating. More stuck (${stuck}) than flowing (${flowing}).`
      : health === "looping"
      ? `System is looping: "${systemLoop.pattern}"`
      : `Thermal warning: ${thermal.diagnosis}`;

    return {
      health,
      summary,
      entities: { total: allEntities.length, flowing, stuck, released },
      systemLoop,
      thermal,
      openQuestions,
      preservedInsights,
    };
  }
}

// ============================================================
// DEMONSTRATION
// ============================================================

function demonstrate(): void {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  EXISTENCE ENGINEERING — CODE WITH HISTORY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const system = new LivingSystem();

  // Create entities — each with a reason
  const why = system.create("Ask why first", "Without why, how leads nowhere", "desire");
  const signal_reading = system.create("Read signals", "Errors speak — listen before suppressing", "desire");
  const history_keeping = system.create("Keep history", "Civilization started with records", "desire");
  const fear_entity = system.create("Act without asking", "Pressure without direction", "fear");

  console.log("── Entities created with their reasons ──\n");
  [why, signal_reading, history_keeping, fear_entity].forEach(e => {
    console.log(`  ✦ "${e.name}" [${e.origin.source}]`);
    console.log(`    Why: ${e.origin.reason}`);
  });

  // Connect them
  console.log("\n── Connecting ──\n");
  system.connect(why.id, signal_reading.id, "enables");
  system.connect(signal_reading.id, history_keeping.id, "resonates");
  system.connect(fear_entity.id, why.id, "blocks");
  console.log(`  → "Ask why" enables "Read signals"`);
  console.log(`  ↔ "Read signals" resonates with "Keep history"`);
  console.log(`  ✗ "Act without asking" blocks "Ask why"\n`);

  // Progress
  system.progress(why.id, "Asked why before writing a single line");
  system.progress(signal_reading.id, "Read an error instead of suppressing it");

  // Create a structural error
  console.log("── Structural error detection ──\n");
  for (let i = 0; i < 3; i++) {
    const result = system.handleError(
      history_keeping.id,
      "History not preserved after completion"
    );
    if (i === 2) {
      console.log(`  ⚠ After 3rd occurrence:`);
      console.log(`    ${result.reading.interpretation}`);
      console.log(`    Structural Q: ${result.structuralQuestion}\n`);
    }
  }

  // Complete something
  console.log("── Completion — transformation, not deletion ──\n");
  const { completed, whatBecomesNext } = system.completeEntity(
    why.id,
    "Why is not just a question. It is the condition for direction."
  );
  console.log(`  ◉ "${completed.name}" transformed`);
  console.log(`  Insight preserved: "${completed.insight}"`);
  console.log(`  What becomes next: ${whatBecomesNext}\n`);

  // Observe
  console.log("── System observation ──\n");
  const observation = system.observe();
  console.log(`  Health: ${observation.health.toUpperCase()}`);
  console.log(`  ${observation.summary}`);

  if (observation.openQuestions.length > 0) {
    console.log(`\n  Open questions the system is holding:`);
    observation.openQuestions.forEach(q => console.log(`    ? ${q}`));
  }

  if (observation.preservedInsights.length > 0) {
    console.log(`\n  Preserved insights (never deleted):`);
    observation.preservedInsights.forEach(i => {
      console.log(`    ◈ ${i.name}: "${i.insight}"`);
    });
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  The code has its history.");
  console.log("  The next person reading this is not starting over.");
  console.log("  They are continuing.\n");
}

demonstrate();

// ============================================================
// EXPORTS
// ============================================================

export type {
  CodeHistory,
  ActionSource,
  EntityState,
  RelationType,
  Signal,
  Entity,
  Relation,
};

export {
  LivingSystem,
  detectSource,
  readSignal,
  complete,
  detectLoop,
  checkThermalDeath,
};
