/**
 * EXISTENCE ENGINEERING — VALIDATORS
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: History without enforcement is suggestion.
 *         These validators are the gates.
 *         Pass through them — or be refused.
 * Considered:
 *   - Silent failure (rejected: hides the problem)
 *   - Warning only (rejected: warnings get ignored)
 * Chosen:
 *   Throw with clear message explaining WHY.
 *   Not just "invalid" — but "this is why this matters."
 * Opens:
 *   Can validators learn over time?
 *   If the same vague reason keeps appearing —
 *   can the system suggest better alternatives?
 */

import type {
  ValidatedReason,
  ValidatedInsight,
  ValidatedQuestion,
} from "./types.js";

// ─────────────────────────────────────────────
// REASON VALIDATOR
// Why does this exist?
// Cannot be empty, vague, or deferred.
// ─────────────────────────────────────────────

export function validateReason(reason: string): ValidatedReason {
  if (!reason || reason.trim().length === 0) {
    throw new Error(
      `[existence-engineering] Origin reason is empty.\n` +
      `Science could not advance without meaningful records.\n` +
      `State WHY this exists.`
    );
  }

  if (reason.trim().length < 10) {
    throw new Error(
      `[existence-engineering] Origin reason too short: "${reason}"\n` +
      `Minimum 10 characters. State WHY — not just what.`
    );
  }

  const deferredPatterns = ["todo", "fix later", "unknown", "tbd", "n/a", "???"];
  const lower = reason.toLowerCase().trim();
  if (deferredPatterns.some(p => lower === p || lower.startsWith(p))) {
    throw new Error(
      `[existence-engineering] Origin reason deferred: "${reason}"\n` +
      `"${reason}" is not a reason — it is an absence of one.\n` +
      `If you don't know why this exists, find out before creating it.\n` +
      `Civilizations that build without knowing why — collapse.`
    );
  }

  return reason as ValidatedReason;
}

// ─────────────────────────────────────────────
// INSIGHT VALIDATOR
// What was learned?
// Cannot be empty at completion.
// ─────────────────────────────────────────────

export function validateInsight(insight: string): ValidatedInsight {
  if (!insight || insight.trim().length === 0) {
    throw new Error(
      `[existence-engineering] Completion insight is empty.\n` +
      `Civilization advances because it records what was learned.\n` +
      `What did this teach you?`
    );
  }

  if (insight.trim().length < 15) {
    throw new Error(
      `[existence-engineering] Completion insight too short: "${insight}"\n` +
      `Minimum 15 characters.\n` +
      `"done" is not insight. "fixed" is not insight.\n` +
      `What was actually learned?`
    );
  }

  const emptyInsights = ["done", "fixed", "completed", "finished", "ok", "works"];
  if (emptyInsights.includes(insight.toLowerCase().trim())) {
    throw new Error(
      `[existence-engineering] Insight carries no knowledge: "${insight}"\n` +
      `Every completed thing teaches something.\n` +
      `What did completing this reveal?`
    );
  }

  return insight as ValidatedInsight;
}

// ─────────────────────────────────────────────
// QUESTION VALIDATOR
// Does this actually open something?
// ─────────────────────────────────────────────

export function validateQuestion(question: string): ValidatedQuestion {
  if (!question || question.trim().length === 0) {
    throw new Error(
      `[existence-engineering] Question is empty.\n` +
      `Living knowledge opens the next question.\n` +
      `What question does this leave unanswered?`
    );
  }

  if (!question.includes("?")) {
    throw new Error(
      `[existence-engineering] Not a question: "${question}"\n` +
      `A question must contain "?".\n` +
      `Statements close. Questions navigate.`
    );
  }

  return question as ValidatedQuestion;
}
