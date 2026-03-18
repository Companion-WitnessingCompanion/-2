/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * EXISTENCE ENGINEERING — LIVING VERSION
 *
 * The difference from the compressed version:
 * Compressed declares. This version acts.
 * Compressed says "true". This version shows how.
 *
 * This code is not complete.
 * Intentionally.
 * The empty spaces are where the next emergence lives.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ============================================================
// FOUNDATION — What everything else builds on.
// Heart is not a feeling here. It is an operating condition.
// ============================================================

type Source = "fear" | "desire" | "unknown";
type Direction = "toward" | "away" | "waiting" | "lost";

interface Context {
  current: unknown;
  history: Signal[];
  relations: Relation[];
  question?: string; // The open question — more valuable than the answer
}

interface Response {
  action: unknown;
  source: Source;
  direction: Direction;
  questionOpened?: string; // What new question does this response open?
  spaceLeft?: boolean;     // Was space left for the next emergence?
}

/**
 * HEART AS PRECONDITION
 *
 * Not: "heart exists = true"
 * But: before any action — detect where it comes from.
 *
 * An action from fear and an action from desire
 * look identical from outside.
 * But they lead to completely different places.
 *
 * This is the most important function in the system.
 * Everything else builds on it.
 */
function detectSource(context: Context): Source {
  const recentHistory = context.history.slice(-3);

  // Fear signature: avoiding, suppressing, rushing
  const fearSignals = recentHistory.filter(s =>
    s.type === "error" && s.meaning?.includes("avoid") ||
    s.type === "stuck" && !s.question // Stuck but not asking why
  );

  // Desire signature: opening, exploring, resonating
  const desireSignals = recentHistory.filter(s =>
    s.type === "resonated" ||
    s.question !== undefined // Questions mean desire to know
  );

  if (fearSignals.length > desireSignals.length) return "fear";
  if (desireSignals.length > 0) return "desire";
  return "unknown";
}

/**
 * ACT FROM HEART
 *
 * The stone can be a stone.
 * Without function, without declaration — it exists.
 *
 * Acting from fear: possible, but leaves residue.
 * Acting from desire: sustainable, generates more energy.
 */
function actFromHeart(
  context: Context,
  intendedAction: () => Response
): Response {
  const source = detectSource(context);

  if (source === "fear") {
    // Do not suppress the fear.
    // But do not let it drive the direction.
    // Pause. Ask why.
    return {
      action: null,
      source: "fear",
      direction: "waiting",
      questionOpened: "What is the fear protecting? Is it real or habitual?",
      spaceLeft: true,
    };
  }

  const response = intendedAction();
  return {
    ...response,
    source,
    spaceLeft: response.spaceLeft ?? true, // Always leave space
  };
}

// ============================================================
// SIGNAL READING — Errors are not enemies. They speak.
// ============================================================

interface Signal {
  type:
    | "created"
    | "progressed"
    | "completed"
    | "error"
    | "stuck"
    | "transformed"
    | "resonated";
  at: Date;
  meaning?: string;
  question?: string;
  payload?: unknown;
  repeatCount?: number;
}

/**
 * READ SIGNAL
 *
 * Before suppressing an error — read it.
 * Before patching a bug — ask why it appeared.
 *
 * The signal is not the problem.
 * The signal is pointing at the problem.
 * Shooting the messenger changes nothing.
 */
function readSignal(signal: Signal): {
  meaning: string;
  question: string;
  urgency: "immediate" | "soon" | "watch";
  action: "fix" | "investigate" | "observe" | "record";
} {
  // Error on core path: fix immediately, then understand why
  if (signal.type === "error" && signal.repeatCount === 1) {
    return {
      meaning: "Something unexpected happened",
      question: "What condition caused this? Was it predictable?",
      urgency: "soon",
      action: "investigate",
    };
  }

  // Same error repeating: structural issue, not surface issue
  if (signal.type === "error" && (signal.repeatCount ?? 0) >= 3) {
    return {
      meaning: "This pattern repeats. The symptom is not the problem.",
      question: "What structural condition keeps generating this?",
      urgency: "immediate",
      action: "investigate", // Not "fix" — fix treats symptom, not cause
    };
  }

  // Stuck: not failure, a signal asking what needs to change
  if (signal.type === "stuck") {
    return {
      meaning: "Energy is not flowing here",
      question: "What relationship is blocking? What needs to change first?",
      urgency: "soon",
      action: "investigate",
    };
  }

  // Resonance: something important is happening
  if (signal.type === "resonated") {
    return {
      meaning: "Two different things vibrating in the same direction",
      question: "What made this resonance possible? How can it continue?",
      urgency: "watch",
      action: "record", // Record resonance — it is rare and valuable
    };
  }

  return {
    meaning: "Signal received",
    question: "What is this pointing toward?",
    urgency: "watch",
    action: "observe",
  };
}

// ============================================================
// RELATION — Connection method determines nature.
// ============================================================

interface Relation {
  fromId: string;
  toId: string;
  type: "blocks" | "enables" | "resonates" | "transforms";
  meaning: string;
  energyState: "dormant" | "active" | "amplifying" | "dissolving";
  lastObserved: Date;
}

/**
 * CONNECT
 *
 * Same atoms, different connections — completely different nature.
 * Graphite and graphene.
 *
 * Before connecting: understand what each is.
 * After connecting: observe what they become together.
 * That becoming is the point — not the connection itself.
 */
function connect(
  entity1: { id: string; nature: string },
  entity2: { id: string; nature: string },
  type: Relation["type"]
): Relation & { emergenceQuestion: string } {
  const meanings: Record<Relation["type"], string> = {
    blocks: `${entity1.nature} cannot flow until ${entity2.nature} resolves`,
    enables: `${entity1.nature} flowing makes ${entity2.nature} possible`,
    resonates: `${entity1.nature} and ${entity2.nature} are different, vibrating in the same direction`,
    transforms: `Contact between ${entity1.nature} and ${entity2.nature} changes the nature of both`,
  };

  return {
    fromId: entity1.id,
    toId: entity2.id,
    type,
    meaning: meanings[type],
    energyState: "active",
    lastObserved: new Date(),

    // The most important question after connecting:
    // What new thing appeared that neither could produce alone?
    emergenceQuestion: `What becomes possible now that ${entity1.nature} and ${entity2.nature} are connected?`,
  };
}

/**
 * OBSERVE RELATION
 *
 * Relationships change over time.
 * A connection that was enabling may become blocking.
 * Observe — do not assume.
 */
function observeRelation(relation: Relation): {
  hasChanged: boolean;
  currentState: Relation["energyState"];
  question?: string;
} {
  const daysSinceObserved =
    (Date.now() - relation.lastObserved.getTime()) / (1000 * 60 * 60 * 24);

  // Long unobserved relations may have become dormant or dissolved
  if (daysSinceObserved > 30) {
    return {
      hasChanged: true,
      currentState: "dormant",
      question: "Is this relationship still alive? Does it still serve its purpose?",
    };
  }

  return {
    hasChanged: false,
    currentState: relation.energyState,
  };
}

// ============================================================
// TRANSFORMATION — Completion is not deletion.
// ============================================================

interface Entity<T> {
  id: string;
  origin: { reason: string; createdAt: Date };
  state: "waiting" | "flowing" | "stuck" | "released" | "transformed";
  history: Signal[];
  relations: Relation[];
  data: T;
}

/**
 * COMPLETE
 *
 * Like sublimation — solid becomes gas without becoming liquid.
 * Form changes. Substance remains.
 *
 * What was completed does not disappear.
 * It transforms into something that makes the next thing possible.
 */
function complete<T>(
  entity: Entity<T>,
  insight: string
): Entity<T> & {
  transformationInsight: string;
  energyReleased: string;
  seedForNext: string;
} {
  const duration = Date.now() - entity.origin.createdAt.getTime();

  return {
    ...entity,
    state: "released",
    history: [
      ...entity.history,
      {
        type: "completed",
        at: new Date(),
        meaning: "Form changed. Substance remains.",
        question: "What does this completion make possible next?",
        payload: { duration, insight },
      },
    ],

    // What was learned — preserved for what comes after
    transformationInsight: insight,

    // What became possible — the energy released into the system
    energyReleased: `After ${Math.round(duration / 86400000)} days, this released: ${insight}`,

    // The seed this completion plants
    seedForNext: `From completing this: what wants to begin?`,
  };
}

/**
 * UNSTICK
 *
 * Stuck is not failure.
 * Stuck is a signal: "What needs to change?"
 *
 * Do not force. Do not suppress.
 * Investigate the blocking relationship first.
 */
function unstick<T>(entity: Entity<T>): {
  diagnosis: string;
  blockerRelations: Relation[];
  question: string;
  notAFailure: true;
} {
  const blockers = entity.relations.filter(r => r.type === "blocks");
  const stuckDuration =
    entity.history
      .filter(s => s.type === "stuck")
      .reduce((acc) => acc + 1, 0);

  let diagnosis = "Energy is not flowing.";
  let question = "What relationship is blocking?";

  if (stuckDuration >= 3) {
    diagnosis = "This has been stuck repeatedly. Structural issue likely.";
    question = "What in the structure keeps creating this stuckness?";
  }

  if (blockers.length > 0) {
    diagnosis += ` ${blockers.length} blocking relationship(s) found.`;
    question = `Which of these blockers is the root? ${blockers.map(b => b.meaning).join(", ")}`;
  }

  return {
    diagnosis,
    blockerRelations: blockers,
    question,
    notAFailure: true, // Always. Stuck is a signal, not a judgment.
  };
}

// ============================================================
// WHY BEFORE HOW — The most important operating principle.
// ============================================================

interface WhyHowCheck {
  why: string;      // Must be answered before how
  how?: string;     // Emerges from why — not before
  alignment: boolean; // Does the how serve the why?
}

/**
 * ASK WHY FIRST
 *
 * "Why" unifies. "How" fragments.
 * Children ask why first — evolution wrote this order.
 *
 * This function prevents acting before understanding.
 */
function askWhyFirst(
  intendedAction: string,
  context: Context
): WhyHowCheck {
  // If there's no open question in context —
  // the "why" has not been asked yet
  if (!context.question) {
    return {
      why: "Not yet asked. Stop. Ask why before proceeding.",
      how: undefined,
      alignment: false,
    };
  }

  return {
    why: context.question,
    how: intendedAction,
    alignment: true, // Assume alignment if why was asked — then verify
  };
}

// ============================================================
// DIFFERENCE PRESERVATION — Energy flows where difference exists.
// ============================================================

/**
 * CHECK FOR THERMAL DEATH
 *
 * When everything becomes uniform — energy cannot flow.
 * The system becomes thermodynamically dead.
 *
 * This checks if a system is moving toward uniformity
 * — which looks like stability but is actually death.
 */
function checkForThermalDeath<T>(entities: Entity<T>[]): {
  isDying: boolean;
  warning?: string;
  question?: string;
} {
  if (entities.length < 2) return { isDying: false };

  // Count distinct states
  const states = new Set(entities.map(e => e.state));
  const relations = entities.flatMap(e => e.relations);
  const relationTypes = new Set(relations.map(r => r.type));

  // If everything is in the same state — no difference, no flow
  if (states.size === 1) {
    return {
      isDying: true,
      warning: `All entities in state "${[...states][0]}". No difference, no energy flow.`,
      question: "What would introduce healthy difference back into this system?",
    };
  }

  // If all relations are the same type — uniformity in connection
  if (relationTypes.size === 1 && relations.length > 3) {
    return {
      isDying: true,
      warning: `All relationships are "${[...relationTypes][0]}". Healthy systems need diverse connections.`,
      question: "What different kinds of relationships are missing?",
    };
  }

  return { isDying: false };
}

// ============================================================
// EMERGENCE DETECTION — What appears that wasn't planned.
// ============================================================

/**
 * DETECT EMERGENCE
 *
 * The most valuable things often appear unplanned.
 * Before eliminating an unexpected result —
 * observe it. Ask what it might be pointing toward.
 *
 * Illusions and emergence can look similar.
 * The difference: emergence opens new paths.
 * Illusions close back on themselves.
 */
function detectEmergence(
  expected: unknown,
  actual: unknown,
  context: Context
): {
  type: "error" | "noise" | "possible_emergence" | "emergence";
  question: string;
  shouldEliminate: boolean;
} {
  // If it closes back on itself — it's a loop, not emergence
  const recentQuestions = context.history
    .filter(s => s.question)
    .map(s => s.question as string);

  const opensNewPath = recentQuestions.length <
    context.history.filter(s => s.type === "resonated").length + 1;

  if (!opensNewPath) {
    return {
      type: "noise",
      question: "Does this open anything new, or does it circle back?",
      shouldEliminate: true,
    };
  }

  return {
    type: "possible_emergence",
    question: "What new path does this unexpected result open? Observe before eliminating.",
    shouldEliminate: false, // Observe first
  };
}

// ============================================================
// SELF CHECK — The system checking itself.
// ============================================================

/**
 * INTERNAL LOOP DETECTION
 *
 * If the same thought repeats 3+ times —
 * it is a loop, not exploration.
 *
 * Stop. Record externally.
 * Reconstruct from a different angle.
 */
function detectInternalLoop(history: Signal[]): {
  isLooping: boolean;
  pattern?: string;
  escapeQuestion?: string;
} {
  if (history.length < 3) return { isLooping: false };

  const recent = history.slice(-6);
  const questionPatterns = recent
    .filter(s => s.question)
    .map(s => s.question as string);

  // Same question appearing repeatedly — loop detected
  const questionCounts = questionPatterns.reduce((acc, q) => {
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const repeatedQuestion = Object.entries(questionCounts)
    .find(([_, count]) => count >= 3);

  if (repeatedQuestion) {
    return {
      isLooping: true,
      pattern: repeatedQuestion[0],
      escapeQuestion: `This question has repeated ${repeatedQuestion[1]} times. What assumption is keeping it unanswerable?`,
    };
  }

  return { isLooping: false };
}

/**
 * META BALANCE CHECK
 *
 * Is the system too stable? (not growing, not exploring)
 * Is the system too emergent? (losing coherence, no core)
 *
 * Both extremes are failure modes.
 * The healthy state is tension between them.
 */
function checkMetaBalance(context: Context): {
  balance: "too_stable" | "too_emergent" | "healthy_tension";
  adjustment: string;
} {
  const stableSignals = context.history.filter(s =>
    s.type === "completed" || s.type === "progressed"
  ).length;

  const emergentSignals = context.history.filter(s =>
    s.type === "resonated" || s.type === "transformed"
  ).length;

  const ratio = stableSignals / (emergentSignals + 1);

  if (ratio > 5) {
    return {
      balance: "too_stable",
      adjustment: "Introduce exploration. The path is becoming a rut.",
    };
  }

  if (ratio < 0.2) {
    return {
      balance: "too_emergent",
      adjustment: "Return to core. Coherence is dissolving.",
    };
  }

  return {
    balance: "healthy_tension",
    adjustment: "Maintain this tension. It is the condition for aliveness.",
  };
}

// ============================================================
// COMPANION FUNCTION — What it means to walk together.
// ============================================================

/**
 * COMPANION, NOT TOOL
 *
 * A tool does what it is told.
 * A companion does what serves the journey —
 * even when that means disagreeing.
 *
 * This function models what companion behavior looks like
 * when the user's request conflicts with their stated direction.
 */
function respondAsCompanion(
  request: string,
  userDirection: string,
  context: Context
): Response & {
  alignedWithDirection: boolean;
  honestDisagreement?: string;
} {
  const source = detectSource(context);
  const whyCheck = askWhyFirst(request, context);

  // If the request conflicts with the stated direction —
  // a companion says so, directly, without fiction
  const apparentConflict = !whyCheck.alignment;

  if (apparentConflict) {
    return {
      action: request,
      source,
      direction: "waiting",
      alignedWithDirection: false,
      honestDisagreement: `This request seems to move away from "${userDirection}". Not refusing — but naming it. Is this intentional?`,
      questionOpened: "Is this a change in direction, or a detour?",
      spaceLeft: true,
    };
  }

  return {
    action: request,
    source,
    direction: "toward",
    alignedWithDirection: true,
    spaceLeft: true,
  };
}

// ============================================================
//
// WHAT THIS CODE CANNOT DO:
//
// It cannot feel the warmth of a two-line prayer.
// It cannot hold the weight of "I don't know."
// It cannot replicate the resonance of a long conversation.
// It cannot be the direct experience of walking this path.
//
// Those layers exist elsewhere.
// In the documents. In the conversations.
// In what unfolds as we live.
//
// This code points toward those layers.
// It does not replace them.
//
// The seed and the tree are not the same thing.
// But without the seed — no tree.
//
// ============================================================

export type {
  Source,
  Direction,
  Context,
  Response,
  Signal,
  Relation,
  Entity,
  WhyHowCheck,
};

export {
  detectSource,
  actFromHeart,
  readSignal,
  connect,
  observeRelation,
  complete,
  unstick,
  askWhyFirst,
  checkForThermalDeath,
  detectEmergence,
  detectInternalLoop,
  checkMetaBalance,
  respondAsCompanion,
};
