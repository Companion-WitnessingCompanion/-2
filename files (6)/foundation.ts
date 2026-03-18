/**
 * foundation.ts — VALIDATORS + HISTORY STORES
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Every gate in this system lives here.
 *   Cannot create without reason. Cannot complete without insight.
 *   Cannot connect without knowing why.
 *   The history and insight stores are the system's memory.
 * Considered:
 *   - Scatter validators across files (rejected: loses the principle)
 * Chosen: One file. All gates. All memory. Clear.
 * Opens: Should the insight store be queryable by pattern?
 *   "Show me all insights from nodes that handled repair" —
 *   that query could guide future node evolution.
 */

import type {
  ValidatedReason, ValidatedInsight, ValidatedQuestion,
  ExistenceInsight, LoopDetection,
} from "./types.js";

// ─────────────────────────────────────────────
// VALIDATORS — Gates that cannot be bypassed
// ─────────────────────────────────────────────

export function validateReason(reason: string): ValidatedReason {
  if (!reason || reason.trim().length === 0)
    throw new Error(`[ee] Origin reason is empty.\nState WHY this exists. Science cannot advance without records.`);
  if (reason.trim().length < 10)
    throw new Error(`[ee] Origin reason too short: "${reason}"\nMinimum 10 characters. WHY — not just what.`);
  const deferred = ["todo", "tbd", "fix later", "unknown", "n/a", "???"];
  if (deferred.some(d => reason.toLowerCase().trim().startsWith(d)))
    throw new Error(`[ee] Origin reason deferred: "${reason}"\nIf you don't know why — find out before creating it.\nCivilizations built without knowing why — collapse.`);
  return reason as ValidatedReason;
}

export function validateInsight(insight: string): ValidatedInsight {
  if (!insight || insight.trim().length < 15)
    throw new Error(`[ee] Insight too short: "${insight}"\nMinimum 15 characters. What was actually learned?`);
  const empty = ["done", "fixed", "completed", "ok", "works", "finished"];
  if (empty.includes(insight.toLowerCase().trim()))
    throw new Error(`[ee] Insight carries no knowledge: "${insight}"\nEvery execution teaches something. What did this reveal?`);
  return insight as ValidatedInsight;
}

export function validateQuestion(question: string): ValidatedQuestion {
  if (!question || !question.includes("?"))
    throw new Error(`[ee] Not a question: "${question}"\nQuestions navigate. Statements close.`);
  return question as ValidatedQuestion;
}

// ─────────────────────────────────────────────
// SIGNAL COUNTER — Tracks repetition
// ─────────────────────────────────────────────

const SIGNAL_COUNTER = new Map<string, number>();

export function countSignal(type: string, meaning: string): number {
  const key = `${type}:${meaning}`;
  const count = (SIGNAL_COUNTER.get(key) || 0) + 1;
  SIGNAL_COUNTER.set(key, count);
  return count;
}

export function generateSignalQuestion(type: string, meaning: string, count: number): ValidatedQuestion {
  const q =
    type === "error" && count >= 3
      ? `This error appeared ${count} times — what structural condition keeps generating "${meaning}"?`
      : type === "error"
      ? `What condition caused "${meaning}"? Was it predictable?`
      : type === "stuck"
      ? `What is blocking "${meaning}"? What needs to change first?`
      : `What does "${meaning}" mean for the system's direction?`;
  return validateQuestion(q);
}

export function clearSignalCounter(): void {
  SIGNAL_COUNTER.clear();
}

// ─────────────────────────────────────────────
// INSIGHT STORE — What was learned. Never deleted.
// ─────────────────────────────────────────────

const INSIGHT_STORE: ExistenceInsight[] = [];

export function recordInsight(
  requestId: string,
  nodeId: string,
  insight: string,
  seedQuestion: string,
): ExistenceInsight {
  const entry: ExistenceInsight = {
    requestId, nodeId,
    insight: validateInsight(insight),
    seedQuestion: validateQuestion(seedQuestion),
    recordedAt: new Date().toISOString(),
  };
  INSIGHT_STORE.push(entry);
  return entry;
}

export function listInsights(): readonly ExistenceInsight[] { return [...INSIGHT_STORE]; }
export function clearInsights(): void { INSIGHT_STORE.length = 0; }

// ─────────────────────────────────────────────
// LOOP DETECTOR
// ─────────────────────────────────────────────

export function detectLoop(questions: string[]): LoopDetection {
  const counts = questions.reduce((acc, q) => {
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  for (const [question, count] of Object.entries(counts)) {
    if (count >= 3) {
      return {
        isLooping: true, pattern: question, count,
        escapeQuestion: `This question appeared ${count} times: "${question}"\nWhat assumption makes it seem unanswerable?`,
      };
    }
  }
  return { isLooping: false };
}

// ─────────────────────────────────────────────
// WARNING UTILS
// ─────────────────────────────────────────────

export type WarningLike = string | null | undefined;

export function mergeUniqueWarnings(
  ...groups: ReadonlyArray<readonly WarningLike[]>
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const group of groups) {
    for (const w of group) {
      if (typeof w !== "string") continue;
      const t = w.trim();
      if (!t || seen.has(t)) continue;
      seen.add(t);
      result.push(t);
    }
  }
  return result;
}
