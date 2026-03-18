/**
 * support_trace_lineage.ts — WITH EXISTENCE HISTORY
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Lineage tracks the full family of requests —
 *   root request + all follow-ups.
 *   With existence layer: lineage now also accumulates
 *   open questions and insights across the whole family.
 *   The lineage becomes a navigable history, not just a tree.
 *
 * Considered:
 *   - Track only request IDs (rejected: loses the meaning)
 *   - Flat list without hierarchy (rejected: lineage IS the hierarchy)
 * Chosen:
 *   Lineage tree with accumulated questions and insights.
 *   A lineage that failed leaves questions about why.
 *   A lineage that succeeded leaves questions about what's next.
 * Opens:
 *   Could lineages from different time periods be compared?
 *   Same root request type, different outcomes — what changed?
 */

import { listSupportTraceEntries, listOpenQuestionsFromTrace } from "./support_trace.js";
import { listSupportEngineTraceEntries, listEngineOpenQuestions } from "./support_engine_trace.js";
import { listInsights, type ExistenceInsight } from "../existence/existence_history.js";

export interface SupportTraceJourney {
  readonly requestId: string;
  readonly rootRequestId: string;
  readonly parentRequestId?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly responderId?: string;
  readonly matchedCapability?: string;
  readonly accepted: boolean;
  readonly reserveUsed: boolean;
  readonly followUpNeeded: boolean;
  readonly failed: boolean;
  readonly warningCount: number;
  readonly openQuestions: readonly string[];
}

export interface SupportTraceLineage {
  readonly rootRequestId: string;
  readonly requestIds: readonly string[];
  readonly journeys: readonly SupportTraceJourney[];
  readonly reserveUsed: boolean;
  readonly failed: boolean;
  readonly followUpCount: number;
  readonly stoppedReasons: readonly string[];
  readonly openQuestions: readonly string[];
  readonly insights: readonly ExistenceInsight[];
  readonly healthSummary: string;
}

export function buildSupportTraceJourney(requestId: string): SupportTraceJourney {
  const entries = listSupportTraceEntries().filter(e => e.requestId === requestId);
  const sorted = [...entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const last = sorted.at(-1);

  const openQuestions = [...new Set(
    entries.filter(e => e.opensQuestion).map(e => e.opensQuestion as string)
  )];

  return {
    requestId,
    rootRequestId: last?.rootRequestId ?? requestId,
    parentRequestId: last?.parentRequestId,
    startedAt: sorted[0]?.timestamp,
    completedAt: last?.timestamp,
    responderId: last?.responderId,
    matchedCapability: last?.matchedCapability,
    accepted: entries.some(e => e.accepted === true),
    reserveUsed: entries.some(e => e.reserveUsed === true),
    followUpNeeded: entries.some(e => e.followUpNeeded === true),
    failed: entries.some(e => e.stage === "execution_failed"),
    warningCount: entries.reduce((n, e) => n + e.warnings.length, 0),
    openQuestions,
  };
}

export function listKnownSupportRequestIds(): readonly string[] {
  return [...new Set(listSupportTraceEntries().map(e => e.requestId))].sort();
}

export function listKnownRootRequestIds(): readonly string[] {
  return [...new Set(
    listSupportTraceEntries().map(e => e.rootRequestId ?? e.requestId)
  )].sort();
}

export function buildSupportTraceLineage(rootRequestId: string): SupportTraceLineage {
  const allIds = listKnownSupportRequestIds().filter(id => {
    const entries = listSupportTraceEntries().filter(e => e.requestId === id);
    return entries.some(e => (e.rootRequestId ?? e.requestId) === rootRequestId);
  });

  const journeys = allIds.map(buildSupportTraceJourney);

  // Accumulated open questions from all runtime + engine traces
  const runtimeQuestions = listOpenQuestionsFromTrace();
  const engineQuestions = listEngineOpenQuestions();
  const allOpenQuestions = [...new Set([...runtimeQuestions, ...engineQuestions])];

  // Insights related to this lineage
  const lineageInsights = listInsights().filter(
    i => allIds.includes(i.requestId)
  );

  const failed = journeys.some(j => j.failed);
  const reserveUsed = journeys.some(j => j.reserveUsed);
  const followUpCount = Math.max(0, allIds.length - 1);
  const stoppedReasons = [...new Set(
    listSupportEngineTraceEntries()
      .filter(e => e.stoppedBecause && allIds.includes(e.requestId))
      .map(e => e.stoppedBecause as string)
  )];

  const healthSummary = failed
    ? `Lineage contains failure. ${followUpCount} follow-up(s). ${allOpenQuestions.length} open question(s).`
    : reserveUsed
    ? `Lineage completed with reserve. ${followUpCount} follow-up(s).`
    : followUpCount > 0
    ? `Lineage involved ${followUpCount} follow-up(s). Questions remain: ${allOpenQuestions.length}.`
    : `Lineage completed cleanly. ${allOpenQuestions.length} question(s) opened for next time.`;

  return {
    rootRequestId,
    requestIds: allIds,
    journeys,
    reserveUsed,
    failed,
    followUpCount,
    stoppedReasons,
    openQuestions: allOpenQuestions,
    insights: lineageInsights,
    healthSummary,
  };
}

export function listAllSupportTraceLineages(): readonly SupportTraceLineage[] {
  return listKnownRootRequestIds().map(buildSupportTraceLineage);
}

export function listFailedSupportTraceLineages(): readonly SupportTraceLineage[] {
  return listAllSupportTraceLineages().filter(l => l.failed);
}
