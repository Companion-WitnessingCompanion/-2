/**
 * support_trace.ts — WITH EXISTENCE QUESTIONS
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: The original trace recorded WHAT happened.
 *   Stage, responder, accepted, warnings.
 *   But not what was learned. Not what question was opened.
 *   A trace without questions is execution history without direction.
 *   This version adds opensQuestion to every trace entry.
 *
 * Considered:
 *   - Keep trace pure execution data (considered — but rejects insight)
 * Chosen:
 *   Add opensQuestion to SupportTraceEntry.
 *   Errors and stuck states get mandatory questions (via existence layer).
 *   Other stages get optional questions.
 *   The trace becomes navigable, not just searchable.
 *
 * Opens:
 *   Could the questions accumulated in the trace over time
 *   be surfaced as a "question map" of the system?
 *   The places where the system keeps asking the same question
 *   are the places that need structural attention.
 */

import type {
  SupportCapability,
  SupportRequest,
  SupportResponse,
} from "../core/support_interface.js";

import {
  countSignal,
  generateSignalQuestion,
} from "../existence/existence_history.js";

export type SupportTraceStage =
  | "request_received"
  | "decision_made"
  | "execution_started"
  | "execution_completed"
  | "execution_failed"
  | "follow_up_created";

export interface SupportTraceEntry {
  readonly traceId: string;
  readonly requestId: string;
  readonly rootRequestId?: string;
  readonly parentRequestId?: string;
  readonly stage: SupportTraceStage;
  readonly requesterId: string;
  readonly responderId?: string;
  readonly matchedCapability?: SupportCapability;
  readonly accepted?: boolean;
  readonly reserveUsed?: boolean;
  readonly followUpNeeded?: boolean;
  readonly summary: string;
  readonly warnings: readonly string[];
  readonly timestamp: string;

  /**
   * NEW: What question does this trace entry open?
   *
   * Errors always get questions (mandatory via existence layer).
   * Failed executions always get questions.
   * Other stages may get questions.
   *
   * The question turns a record into a navigational marker.
   * Future AI reading this trace knows where to look next.
   */
  readonly opensQuestion?: string;

  /**
   * NEW: How many times has this pattern appeared?
   * When repeatCount >= 3 — structural issue.
   * The question becomes structural too.
   */
  readonly repeatCount?: number;
}

export interface SupportTraceRecordParams {
  readonly request: SupportRequest;
  readonly stage: SupportTraceStage;
  readonly response?: SupportResponse;
  readonly summary: string;
  readonly warnings?: readonly string[];
  readonly opensQuestion?: string;
}

const SUPPORT_TRACE_STORE: SupportTraceEntry[] = [];

function createTraceId(requestId: string, stage: SupportTraceStage): string {
  return `${requestId}::${stage}::${Date.now()}`;
}

function resolveRootRequestId(request: SupportRequest): string {
  return request.rootRequestId ?? request.requestId;
}

function deriveQuestion(
  params: SupportTraceRecordParams
): { question: string | undefined; repeatCount: number | undefined } {
  // Explicit question always wins
  if (params.opensQuestion) {
    return { question: params.opensQuestion, repeatCount: undefined };
  }

  // Response may carry a question
  if (params.response?.opensQuestion) {
    return { question: params.response.opensQuestion, repeatCount: undefined };
  }

  // Failed executions always get questions
  if (params.stage === "execution_failed") {
    const count = countSignal("failed", params.summary);
    const question = generateSignalQuestion("error", params.summary, count);
    return { question, repeatCount: count };
  }

  // Follow-up creation always gets a question
  if (params.stage === "follow_up_created") {
    return {
      question: params.response?.followUpSummary
        ? `${params.response.followUpSummary} — what needs to happen for this follow-up to succeed?`
        : "What needs to happen for this follow-up to succeed?",
      repeatCount: undefined,
    };
  }

  return { question: undefined, repeatCount: undefined };
}

export function recordSupportTrace(
  params: SupportTraceRecordParams,
): SupportTraceEntry {
  const { question, repeatCount } = deriveQuestion(params);

  const entry: SupportTraceEntry = {
    traceId: createTraceId(params.request.requestId, params.stage),
    requestId: params.request.requestId,
    rootRequestId: resolveRootRequestId(params.request),
    parentRequestId: params.request.parentRequestId,
    stage: params.stage,
    requesterId: params.request.requesterId,
    responderId: params.response?.responderId,
    matchedCapability: params.response?.matchedCapability,
    accepted: params.response?.accepted,
    reserveUsed: params.response?.reserveUsed,
    followUpNeeded: params.response?.followUpNeeded,
    summary: params.summary,
    warnings: params.warnings ?? params.response?.warnings ?? [],
    timestamp: new Date().toISOString(),
    opensQuestion: question,
    repeatCount,
  };

  SUPPORT_TRACE_STORE.push(entry);
  return entry;
}

export function listSupportTraceEntries(): readonly SupportTraceEntry[] {
  return [...SUPPORT_TRACE_STORE];
}

export function listRecentSupportTraceEntries(limit = 10): readonly SupportTraceEntry[] {
  return SUPPORT_TRACE_STORE.slice(-limit);
}

export function findSupportTraceEntriesByRequestId(requestId: string): readonly SupportTraceEntry[] {
  return SUPPORT_TRACE_STORE.filter(e => e.requestId === requestId);
}

export function findSupportTraceEntriesByRootRequestId(rootRequestId: string): readonly SupportTraceEntry[] {
  return SUPPORT_TRACE_STORE.filter(e => e.rootRequestId === rootRequestId);
}

/**
 * NEW: Get all open questions from the trace.
 * These are the navigational markers of the system.
 * Where the system keeps asking questions = where it needs attention.
 */
export function listOpenQuestionsFromTrace(): string[] {
  return [...new Set(
    SUPPORT_TRACE_STORE
      .filter(e => e.opensQuestion)
      .map(e => e.opensQuestion as string)
  )];
}

/**
 * NEW: Find structurally repeated signals.
 * RepeatCount >= 3 = structural issue.
 */
export function listStructuralSignals(): SupportTraceEntry[] {
  return SUPPORT_TRACE_STORE.filter(e => (e.repeatCount ?? 0) >= 3);
}

export function listReserveSupportTraceEntries(): readonly SupportTraceEntry[] {
  return SUPPORT_TRACE_STORE.filter(e => e.reserveUsed === true);
}

export function clearSupportTraceStore(): void {
  SUPPORT_TRACE_STORE.length = 0;
}
