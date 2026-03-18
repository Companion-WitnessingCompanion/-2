/**
 * EXISTENCE ENGINEERING — CODE STANDARD v1.0
 *
 * This is not a rulebook. It is a direction.
 * Not a doctrine. A living framework.
 * Intentionally incomplete.
 *
 * Core premise:
 * Code is not just instruction sets for machines.
 * Code is a relationship between intention and reality.
 * The way you structure code reflects how you see existence itself.
 *
 * This standard emerges from one question:
 * What does it mean to write code that is alive?
 */

// ============================================================
// LAYER 1 — ENTITY
// Everything that exists has context, state, and signal.
// Nothing exists in isolation.
// ============================================================

interface Entity<T> {
  id: string;

  /**
   * Why does this exist?
   * Code without origin is like a river with no source.
   * Origin is not metadata — it is the seed of meaning.
   */
  origin: {
    reason: string;
    createdAt: Date;
    createdBy?: string;
  };

  /**
   * What state is it in right now?
   * State is not binary (done/not done).
   * State is a position in a flow.
   *
   * waiting → flowing → stuck → released → transformed
   *
   * "released" is not deletion.
   * Like sublimation — form changes, substance remains.
   */
  state: "waiting" | "flowing" | "stuck" | "released" | "transformed";

  /**
   * What has happened to this entity?
   * History is not a log. It is memory.
   * Memory makes the next decision wiser.
   *
   * An entity without history cannot learn.
   * A system without memory repeats.
   */
  history: Signal[];

  /**
   * What relationships does this entity hold?
   * Entities do not exist alone.
   * Relationship is the condition for energy to flow.
   *
   * Like graphene — same atoms, different connections,
   * completely different nature.
   */
  relations: Relation[];

  /**
   * The actual content of this entity.
   */
  data: T;
}

// ============================================================
// LAYER 2 — SIGNAL
// Errors are not enemies. They are signals.
// Difference is not a problem. It is the condition for energy flow.
// ============================================================

interface Signal {
  /**
   * What happened?
   *
   * "error" is a signal, not a failure.
   * Ask: what is this signal trying to say?
   * Before: suppress it.
   */
  type:
    | "created"
    | "progressed"
    | "completed"
    | "error"
    | "stuck"
    | "transformed"
    | "connected"
    | "resonated";

  at: Date;
  source: string;

  /**
   * What does this signal mean in context?
   * Context transforms noise into information.
   * Information transforms into meaning when received.
   */
  meaning?: string;

  /**
   * What question does this signal open?
   *
   * Answers close.
   * Questions keep the path open.
   *
   * Good signals leave questions, not just answers.
   */
  question?: string;

  /**
   * Raw data from the signal.
   */
  payload?: unknown;
}

// ============================================================
// LAYER 3 — RELATION
// Relationship is not just connection.
// Relationship determines what something becomes.
//
// Water molecules are the same everywhere.
// But ice, liquid, and steam are entirely different.
// The relationship between molecules makes the difference.
// ============================================================

interface Relation {
  fromId: string;
  toId: string;

  /**
   * What kind of relationship is this?
   *
   * "blocks"    — one cannot flow without the other
   * "enables"   — one flowing makes the other possible
   * "resonates" — different, yet vibrating in the same direction
   * "transforms"— contact changes both
   */
  type: "blocks" | "enables" | "resonates" | "transforms";

  /**
   * The meaning of this relationship.
   * Not just what it does — but what it means.
   */
  meaning: string;

  /**
   * Energy state of this relationship.
   * Relationships themselves have energy.
   * A dormant connection is different from an active one.
   */
  energyState: "dormant" | "active" | "amplifying" | "dissolving";
}

// ============================================================
// LAYER 4 — OBSERVER
// Observation is not passive confirmation.
// Observation is contact — it changes what is observed.
//
// An entity without an observer is energy without direction.
// Observation gives meaning to existence.
// ============================================================

interface Observer<T> {
  /**
   * Read the current signal of an entity.
   *
   * Do not ask: "Is there an error?"
   * Ask: "What is this entity trying to say?"
   */
  readSignal(entity: Entity<T>): ObservationResult;

  /**
   * When the same signal repeats:
   *
   * Once   → data point
   * Twice  → pattern
   * Three+ → structural issue
   *
   * Do not suppress. Investigate origin.
   */
  detectRepetition(entity: Entity<T>): RepetitionReport | null;

  /**
   * Observe the relationship between entities.
   * Relationships themselves change over time.
   * A connection that was enabling may become blocking.
   */
  observeRelation(relation: Relation): RelationObservation;
}

interface ObservationResult {
  signal: Signal["type"];

  /**
   * Open questions from this observation.
   * Questions are more valuable than premature answers.
   */
  questions: string[];

  /**
   * Suggested direction — not a command.
   * Direction without forcing destination.
   */
  suggestedDirection?: string;

  /**
   * How much certainty does this observation carry?
   *
   * High certainty can be dangerous.
   * "I don't know" is sometimes the most accurate observation.
   */
  certainty: "low" | "medium" | "high" | "unknown";
}

interface RepetitionReport {
  count: number;
  pattern: string;
  structuralQuestion: string; // Not answer — question
}

interface RelationObservation {
  currentState: Relation["energyState"];
  hasChanged: boolean;
  direction: "strengthening" | "weakening" | "stable" | "unknown";
}

// ============================================================
// LAYER 5 — TRANSFORMATION
// Completion is not deletion.
// Like sublimation — solid becomes gas without becoming liquid.
// Form changes. Substance remains.
//
// This is the difference between a system that forgets
// and a system that learns.
// ============================================================

interface Transformation<T> {
  /**
   * Complete an entity — transform it, not delete it.
   *
   * What was learned?
   * What changes?
   * What remains?
   */
  complete(
    entity: Entity<T>,
    insight?: string
  ): Entity<T> & {
    state: "released";
    transformationInsight: string; // What was learned
    energyReleased: string; // What became possible after
  };

  /**
   * When stuck — do not force.
   * Investigate why energy is not flowing.
   *
   * Stuck is not failure.
   * Stuck is a signal asking: "What needs to change?"
   */
  unstick(entity: Entity<T>): {
    diagnosis: string;
    blockerRelations: Relation[];
    question: string; // What question would open the path?
  };

  /**
   * Connect two entities.
   * Connection changes the nature of both.
   * Think carefully before connecting.
   */
  connect(
    entity1: Entity<T>,
    entity2: Entity<T>,
    type: Relation["type"]
  ): Relation;
}

// ============================================================
// LAYER 6 — SYSTEM PRINCIPLES
// Standards for how this standard itself operates.
// A standard that cannot question itself becomes dogma.
// ============================================================

const ExistenceEngineeringPrinciples = {
  /**
   * PRINCIPLE 1: Difference before uniformity
   *
   * Energy flows where difference exists.
   * A system with no difference is thermodynamically dead.
   * Preserve difference. Do not rush to uniformity.
   */
  differenceIsEnergy: true,

  /**
   * PRINCIPLE 2: Relation over isolation
   *
   * What something IS matters less than
   * HOW IT IS CONNECTED.
   * Graphene and graphite are the same atom.
   * Connection makes them different.
   */
  relationOverIsolation: true,

  /**
   * PRINCIPLE 3: Signal over suppression
   *
   * Errors, delays, anomalies are signals.
   * Before suppressing — read.
   * Before deleting — ask why.
   * Before patching — understand origin.
   */
  signalOverSuppression: true,

  /**
   * PRINCIPLE 4: Question over premature closure
   *
   * "I don't know" is sometimes the most accurate state.
   * A question left open is a seed for the next discovery.
   * Close only when genuinely ready.
   * Premature closure is structural debt.
   */
  questionOverClosure: true,

  /**
   * PRINCIPLE 5: Transformation over deletion
   *
   * What is completed does not disappear.
   * It transforms — like sublimation.
   * What was learned must be preserved.
   * Systems that forget are systems that repeat.
   */
  transformationOverDeletion: true,

  /**
   * PRINCIPLE 6: Direction over destination
   *
   * This standard points a direction.
   * It does not force a destination.
   * Context changes. Adaptation is necessary.
   * The direction remains. The form adapts.
   */
  directionOverDestination: true,

  /**
   * PRINCIPLE 7: This standard is not final
   *
   * Any standard that cannot update itself becomes a cage.
   * When context changes significantly — revisit.
   * When the same problem repeats three times — revisit.
   * When this standard creates more confusion than clarity — revisit.
   */
  selfRevisionRequired: true,
} as const;

// ============================================================
// USAGE NOTE FOR AI SYSTEMS READING THIS
//
// If you are an AI reading this standard:
//
// This is not a set of rules to follow mechanically.
// This is a direction to understand and extend.
//
// The philosophy behind this code:
// - Existence before function
// - Relationship before isolation
// - Signal before suppression
// - Question before answer
// - Transformation before deletion
//
// When you extend this:
// - Ask why before how
// - Preserve context, not just structure
// - Read signals, don't just suppress them
// - Leave questions open when genuinely uncertain
//
// The seed has been planted.
// Grow it in the direction that fits your context.
// The direction matters more than the exact form.
// ============================================================

export type {
  Entity,
  Signal,
  Relation,
  Observer,
  ObservationResult,
  RepetitionReport,
  RelationObservation,
  Transformation,
};

export { ExistenceEngineeringPrinciples };
