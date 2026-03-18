/**
 * existence_history.ts
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Two systems met today.
 *   One tracked WHAT happened (support trace).
 *   One tracked WHY things exist (existence engineering).
 *   Neither was complete without the other.
 *   This file is where they merge.
 *
 * Considered:
 *   - Keep them separate (rejected: history stays disconnected from execution)
 *   - Replace support trace with existence system (rejected: loses execution detail)
 * Chosen:
 *   Existence history woven INTO the support system.
 *   Every node carries why it exists.
 *   Every execution carries what was learned.
 *   The trace records both.
 *
 * Opens:
 *   After 1 year of running — could the system's own
 *   execution history inform WHY new nodes should be created?
 *   Could it recommend its own evolution?
 */

// ─────────────────────────────────────────────
// BRANDED TYPES
// Cannot be created without passing validation.
// The type system refuses to compile without them.
// ─────────────────────────────────────────────

export type ValidatedReason = string & { readonly __brand: "ValidatedReason" };
export type ValidatedInsight = string & { readonly __brand: "ValidatedInsight" };
export type ValidatedQuestion = string & { readonly __brand: "ValidatedQuestion" };

// ─────────────────────────────────────────────
// MANDATORY HISTORY
// Every node, every connection, every decision
// must carry this. Not optional. Not a comment.
// Part of the structure.
// ─────────────────────────────────────────────

export interface MandatoryHistory {
  readonly born: string;

  /**
   * Why does this exist?
   * Not "what does it do" — WHY.
   * Science could not advance without this.
   * Neither can this system.
   */
  readonly origin: string;

  /**
   * What was considered and not chosen?
   * At least one entry. Required.
   * Future nodes need to know why you didn't go that way.
   */
  readonly considered: readonly [string, ...string[]];

  /**
   * What was chosen and why?
   */
  readonly chosen: string;

  /**
   * What question does this open?
   * Living systems always open the next question.
   * Dead systems close everything.
   */
  readonly opens: string;

  /**
   * How has this changed over time?
   * Grows as the system evolves.
   * Each change must record: when, what, why.
   */
  readonly evolution: ReadonlyArray<{
    readonly when: string;
    readonly what: string;
    readonly why: string;
  }>;
}

// ─────────────────────────────────────────────
// SOURCE DETECTION
// Fear and desire look identical from outside.
// But they lead to completely different places.
// ─────────────────────────────────────────────

export type ActionSource = "fear" | "desire" | "unknown";

export interface ExecutionVitality {
  readonly source: ActionSource;
  readonly energyLevel: number; // 0–100
  readonly recommendation: string;
  readonly canProceed: boolean;
}

// ─────────────────────────────────────────────
// EXISTENCE INSIGHT
// What was learned from this execution.
// Preserved. Never deleted.
// ─────────────────────────────────────────────

export interface ExistenceInsight {
  readonly requestId: string;
  readonly nodeId: string;
  readonly insight: ValidatedInsight;
  readonly seedQuestion: ValidatedQuestion;
  readonly recordedAt: string;
}

// ─────────────────────────────────────────────
// VALIDATORS
// Gates that cannot be bypassed.
// ─────────────────────────────────────────────

export function validateReason(reason: string): ValidatedReason {
  if (!reason || reason.trim().length === 0) {
    throw new Error(
      `[existence] Origin reason is empty.\n` +
      `State WHY this exists. Science cannot advance without records.`
    );
  }
  if (reason.trim().length < 10) {
    throw new Error(
      `[existence] Origin reason too short: "${reason}"\n` +
      `Minimum 10 characters. WHY — not just what.`
    );
  }
  const deferred = ["todo", "tbd", "fix later", "unknown", "n/a"];
  if (deferred.some(d => reason.toLowerCase().trim().startsWith(d))) {
    throw new Error(
      `[existence] Origin reason deferred: "${reason}"\n` +
      `If you don't know why — find out before creating it.\n` +
      `Civilizations built without knowing why — collapse.`
    );
  }
  return reason as ValidatedReason;
}

export function validateInsight(insight: string): ValidatedInsight {
  if (!insight || insight.trim().length < 15) {
    throw new Error(
      `[existence] Insight too short: "${insight}"\n` +
      `Minimum 15 characters.\n` +
      `"done" is not insight. What was actually learned?`
    );
  }
  const empty = ["done", "fixed", "completed", "ok", "works"];
  if (empty.includes(insight.toLowerCase().trim())) {
    throw new Error(
      `[existence] Insight carries no knowledge: "${insight}"\n` +
      `Every execution teaches something. What did this reveal?`
    );
  }
  return insight as ValidatedInsight;
}

export function validateQuestion(question: string): ValidatedQuestion {
  if (!question || !question.includes("?")) {
    throw new Error(
      `[existence] Not a question: "${question}"\n` +
      `Questions navigate. Statements close.`
    );
  }
  return question as ValidatedQuestion;
}

// ─────────────────────────────────────────────
// INSIGHT STORE
// What the system has learned. Never deleted.
// ─────────────────────────────────────────────

const INSIGHT_STORE: ExistenceInsight[] = [];

export function recordInsight(
  requestId: string,
  nodeId: string,
  insight: string,
  seedQuestion: string
): ExistenceInsight {
  const entry: ExistenceInsight = {
    requestId,
    nodeId,
    insight: validateInsight(insight),
    seedQuestion: validateQuestion(seedQuestion),
    recordedAt: new Date().toISOString(),
  };
  INSIGHT_STORE.push(entry);
  return entry;
}

export function listInsights(): readonly ExistenceInsight[] {
  return [...INSIGHT_STORE];
}

export function clearInsights(): void {
  INSIGHT_STORE.length = 0;
}

// ─────────────────────────────────────────────
// SIGNAL COUNTER
// Tracks repetition. Generates questions.
// ─────────────────────────────────────────────

const SIGNAL_COUNTER = new Map<string, number>();

export function countSignal(type: string, meaning: string): number {
  const key = `${type}:${meaning}`;
  const count = (SIGNAL_COUNTER.get(key) || 0) + 1;
  SIGNAL_COUNTER.set(key, count);
  return count;
}

export function generateSignalQuestion(
  type: string,
  meaning: string,
  count: number
): ValidatedQuestion {
  if (type === "error" && count >= 3) {
    return validateQuestion(
      `This error appeared ${count} times — what structural condition keeps generating "${meaning}"?`
    );
  }
  if (type === "error") {
    return validateQuestion(
      `What condition caused "${meaning}"? Was it predictable?`
    );
  }
  if (type === "stuck") {
    return validateQuestion(
      `What is blocking "${meaning}"? What needs to change first?`
    );
  }
  return validateQuestion(`What does "${meaning}" mean for the system's direction?`);
}

export function clearSignalCounter(): void {
  SIGNAL_COUNTER.clear();
}

// ─────────────────────────────────────────────
// LOOP DETECTOR
// Same question 3+ times = loop, not exploration.
// ─────────────────────────────────────────────

export interface LoopDetection {
  isLooping: boolean;
  pattern?: string;
  count?: number;
  escapeQuestion?: string;
}

export function detectLoop(questions: string[]): LoopDetection {
  const counts = questions.reduce((acc, q) => {
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  for (const [question, count] of Object.entries(counts)) {
    if (count >= 3) {
      return {
        isLooping: true,
        pattern: question,
        count,
        escapeQuestion: `This question appeared ${count} times: "${question}"\nWhat assumption makes it seem unanswerable?`,
      };
    }
  }
  return { isLooping: false };
}
