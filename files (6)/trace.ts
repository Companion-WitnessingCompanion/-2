/**
 * trace.ts — COMPLETE TRACE LAYER
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Trace records WHAT happened.
 *   With existence layer: trace also records WHAT QUESTION WAS OPENED.
 *   A trace without questions is execution history without direction.
 *   A trace with questions is a navigational map for the next builder.
 * Considered:
 *   - Separate files per trace type (originally done — unified here)
 * Chosen:
 *   One file. All trace types. Clear separation by export.
 *   Runtime trace + Engine trace + Lineage + Bundle + Diff.
 * Opens:
 *   After a year of traces — could the question patterns
 *   across all runs be analyzed to find where the system
 *   consistently struggles? That would be structural insight.
 */

import type {
  SupportRequest, SupportResponse, SupportCapability,
  SupportTraceEntry, SupportEngineTraceEntry,
  SupportTraceStage, SupportEngineStage,
  SupportTraceLineage, SupportTraceBundle, SupportTraceBundleDiff,
  ExistenceInsight,
} from "../core/types.js";
import { countSignal, generateSignalQuestion, listInsights } from "../core/foundation.js";
import { listSupportNodes } from "../support/support.js";

// ─────────────────────────────────────────────
// RUNTIME TRACE
// ─────────────────────────────────────────────

const RUNTIME_TRACE: SupportTraceEntry[] = [];
const RT_SIGNAL_COUNTER = new Map<string, number>();

function deriveRuntimeQuestion(
  stage: SupportTraceStage, summary: string,
  response?: SupportResponse, explicit?: string,
): string | undefined {
  if (explicit) return explicit;
  if (response?.opensQuestion) return response.opensQuestion;
  if (stage === "execution_failed") {
    const count = countSignal("rt_failed", summary);
    return generateSignalQuestion("error", summary, count);
  }
  if (stage === "follow_up_created")
    return response?.followUpSummary
      ? `${response.followUpSummary} — what needs to happen for this to succeed?`
      : "What needs to happen for this follow-up to succeed?";
  return undefined;
}

function getRepeatCount(type: string, meaning: string): number | undefined {
  const key = `${type}:${meaning}`;
  const count = (RT_SIGNAL_COUNTER.get(key) || 0) + 1;
  RT_SIGNAL_COUNTER.set(key, count);
  return count >= 2 ? count : undefined;
}

export function recordTrace(params: {
  request: SupportRequest; stage: SupportTraceStage; summary: string;
  response?: SupportResponse; warnings?: readonly string[]; opensQuestion?: string;
}): SupportTraceEntry {
  const entry: SupportTraceEntry = {
    traceId: `${params.request.requestId}::${params.stage}::${Date.now()}`,
    requestId: params.request.requestId,
    rootRequestId: params.request.rootRequestId ?? params.request.requestId,
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
    opensQuestion: deriveRuntimeQuestion(params.stage, params.summary, params.response, params.opensQuestion),
    repeatCount: getRepeatCount(params.stage, params.summary),
  };
  RUNTIME_TRACE.push(entry);
  return entry;
}

export function listRuntimeTrace(): readonly SupportTraceEntry[] { return [...RUNTIME_TRACE]; }
export function listOpenQuestionsFromTrace(): string[] {
  return [...new Set(RUNTIME_TRACE.filter(e => e.opensQuestion).map(e => e.opensQuestion as string))];
}
export function listStructuralSignals(): SupportTraceEntry[] {
  return RUNTIME_TRACE.filter(e => (e.repeatCount ?? 0) >= 3);
}
export function clearRuntimeTrace(): void {
  RUNTIME_TRACE.length = 0;
  RT_SIGNAL_COUNTER.clear();
}

// ─────────────────────────────────────────────
// ENGINE TRACE
// ─────────────────────────────────────────────

const ENGINE_TRACE: SupportEngineTraceEntry[] = [];

function deriveEngineQuestion(
  stage: SupportEngineStage, summary: string,
  response?: SupportResponse, stoppedBecause?: string, explicit?: string,
): string | undefined {
  if (explicit) return explicit;
  if (response?.opensQuestion) return response.opensQuestion;
  if (stage === "engine_failed") return generateSignalQuestion("error", summary, countSignal("eng_failed", summary));
  if (stage === "follow_up_not_derived") return "Follow-up needed but not derivable — what request type mapping is missing?";
  if (stage === "engine_stopped" && stoppedBecause === "max-steps-reached")
    return "Max steps reached — is this the right limit? What would happen with one more step?";
  return undefined;
}

export function recordEngineTrace(params: {
  request: SupportRequest; stage: SupportEngineStage; stepIndex?: number;
  response?: SupportResponse; summary: string; warnings?: readonly string[];
  stoppedBecause?: string; opensQuestion?: string;
}): SupportEngineTraceEntry {
  const entry: SupportEngineTraceEntry = {
    engineTraceId: `${params.request.requestId}::engine::${params.stage}::${Date.now()}`,
    requestId: params.request.requestId,
    rootRequestId: params.request.rootRequestId ?? params.request.requestId,
    parentRequestId: params.request.parentRequestId,
    stage: params.stage, stepIndex: params.stepIndex,
    requesterId: params.request.requesterId,
    responderId: params.response?.responderId,
    accepted: params.response?.accepted,
    summary: params.summary,
    warnings: params.warnings ?? params.response?.warnings ?? [],
    stoppedBecause: params.stoppedBecause,
    timestamp: new Date().toISOString(),
    opensQuestion: deriveEngineQuestion(params.stage, params.summary, params.response, params.stoppedBecause, params.opensQuestion),
  };
  ENGINE_TRACE.push(entry);
  return entry;
}

export function listEngineTrace(): readonly SupportEngineTraceEntry[] { return [...ENGINE_TRACE]; }
export function listEngineOpenQuestions(): string[] {
  return [...new Set(ENGINE_TRACE.filter(e => e.opensQuestion).map(e => e.opensQuestion as string))];
}
export function clearEngineTrace(): void { ENGINE_TRACE.length = 0; }

// ─────────────────────────────────────────────
// LINEAGE
// ─────────────────────────────────────────────

export function buildLineage(rootRequestId: string): SupportTraceLineage {
  const allIds = [...new Set(RUNTIME_TRACE.map(e => e.requestId))].filter(id => {
    return RUNTIME_TRACE.some(e => e.requestId === id && (e.rootRequestId ?? e.requestId) === rootRequestId);
  });

  const failed = RUNTIME_TRACE.some(e => allIds.includes(e.requestId) && e.stage === "execution_failed");
  const reserveUsed = RUNTIME_TRACE.some(e => allIds.includes(e.requestId) && e.reserveUsed === true);
  const followUpCount = Math.max(0, allIds.length - 1);

  const stoppedReasons = [...new Set(
    ENGINE_TRACE.filter(e => e.stoppedBecause && allIds.includes(e.requestId)).map(e => e.stoppedBecause as string)
  )];

  const rqList = listOpenQuestionsFromTrace();
  const eqList = listEngineOpenQuestions();
  const openQuestions = [...new Set([...rqList, ...eqList])];
  const insights = listInsights().filter(i => allIds.includes(i.requestId));

  const healthSummary = failed
    ? `Failed. ${followUpCount} follow-up(s). ${openQuestions.length} open question(s).`
    : reserveUsed ? `Completed with reserve. ${followUpCount} follow-up(s).`
    : followUpCount > 0 ? `${followUpCount} follow-up(s). Questions: ${openQuestions.length}.`
    : `Completed cleanly. ${openQuestions.length} question(s) opened.`;

  return { rootRequestId, requestIds: allIds, failed, reserveUsed, followUpCount, stoppedReasons, openQuestions, insights, healthSummary };
}

export function listAllLineages(): SupportTraceLineage[] {
  const rootIds = [...new Set(RUNTIME_TRACE.map(e => e.rootRequestId ?? e.requestId))];
  return rootIds.map(buildLineage);
}

// ─────────────────────────────────────────────
// BUNDLE + DIFF
// ─────────────────────────────────────────────

export function buildBundle(): SupportTraceBundle {
  const rte = listRuntimeTrace();
  const ete = listEngineTrace();
  const insights = listInsights();
  const lineages = listAllLineages();

  const openQuestions = [...new Set([
    ...rte.filter(e => e.opensQuestion).map(e => e.opensQuestion as string),
    ...ete.filter(e => e.opensQuestion).map(e => e.opensQuestion as string),
    ...insights.map(i => i.seedQuestion as string),
  ])];

  const nodeSnapshots = listSupportNodes().map(n => ({
    nodeId: n.nodeId, role: n.role, existenceReason: n.existenceReason,
    historyOpens: n.history.opens, considerationsCount: n.history.considered.length,
  }));

  return {
    createdAt: new Date().toISOString(),
    runtimeTraceCount: rte.length, engineTraceCount: ete.length,
    insightCount: insights.length, openQuestionCount: openQuestions.length,
    runtimeTraceEntries: rte, engineTraceEntries: ete,
    insights, openQuestions, lineages, nodeSnapshots,
  };
}

export function diffBundles(before: SupportTraceBundle, after: SupportTraceBundle): SupportTraceBundleDiff {
  const beforeQ = new Set(before.openQuestions);
  const afterQ = new Set(after.openQuestions);
  const newQuestions = after.openQuestions.filter(q => !beforeQ.has(q));
  const resolvedQuestions = before.openQuestions.filter(q => !afterQ.has(q));
  const persistingQuestions = after.openQuestions.filter(q => beforeQ.has(q));

  const runtimeTraceDelta = after.runtimeTraceCount - before.runtimeTraceCount;
  const engineTraceDelta = after.engineTraceCount - before.engineTraceCount;
  const insightDelta = after.insightCount - before.insightCount;
  const changed = runtimeTraceDelta !== 0 || engineTraceDelta !== 0 || insightDelta !== 0;

  let headline = "No material change.";
  if (insightDelta > 0) headline = `System learned ${insightDelta} new thing(s). ${newQuestions.length} new question(s) opened.`;
  else if (runtimeTraceDelta > 0) headline = `${runtimeTraceDelta} new execution(s). ${newQuestions.length} new question(s).`;
  if (resolvedQuestions.length > 0 && changed) headline += ` ${resolvedQuestions.length} resolved.`;
  if (persistingQuestions.length > 0) headline += ` ${persistingQuestions.length} persist.`;

  return { beforeCreatedAt: before.createdAt, afterCreatedAt: after.createdAt,
    runtimeTraceDelta, engineTraceDelta, insightDelta,
    newQuestions, resolvedQuestions, persistingQuestions, changed, headline };
}

// ─────────────────────────────────────────────
// RENDERERS
// ─────────────────────────────────────────────

export function renderBundle(bundle: SupportTraceBundle): string {
  const lines = [
    "═══════════════════════════════════════════════",
    "  SYSTEM BUNDLE SNAPSHOT",
    `  ${bundle.createdAt}`,
    "═══════════════════════════════════════════════",
    "",
    `  Runtime trace: ${bundle.runtimeTraceCount} | Engine: ${bundle.engineTraceCount} | Lineages: ${bundle.lineages.length}`,
    `  Insights: ${bundle.insightCount} | Open questions: ${bundle.openQuestionCount}`,
    "",
  ];

  if (bundle.insights.length > 0) {
    lines.push("  ── Preserved insights ──");
    bundle.insights.forEach(i => {
      lines.push(`    ◈ [${i.nodeId}] "${i.insight}"`);
      lines.push(`      → "${i.seedQuestion}"`);
    });
    lines.push("");
  }

  if (bundle.openQuestions.length > 0) {
    lines.push("  ── Open questions ──");
    bundle.openQuestions.slice(0, 8).forEach(q => lines.push(`    ❓ ${q}`));
    lines.push("");
  }

  lines.push("  ── Lineage health ──");
  bundle.lineages.forEach(l => lines.push(`    [${l.rootRequestId}] ${l.healthSummary}`));
  lines.push("");

  lines.push("  ── Node existence ──");
  bundle.nodeSnapshots.forEach(n => {
    lines.push(`    ◈ ${n.nodeId} [${n.role}]`);
    lines.push(`      Why: ${n.existenceReason.slice(0, 65)}...`);
  });
  lines.push("═══════════════════════════════════════════════");
  return lines.join("\n");
}

export function renderDiff(diff: SupportTraceBundleDiff): string {
  const lines = [
    "═══════════════════════════════════════════════",
    "  BUNDLE DIFF",
    `  Before: ${diff.beforeCreatedAt}`,
    `  After:  ${diff.afterCreatedAt}`,
    "═══════════════════════════════════════════════",
    "",
    `  ${diff.headline}`,
    "",
    `  Runtime +${diff.runtimeTraceDelta} | Engine +${diff.engineTraceDelta} | Insights +${diff.insightDelta}`,
    "",
  ];
  if (diff.newQuestions.length > 0) {
    lines.push("  ── New questions ──");
    diff.newQuestions.forEach(q => lines.push(`    + ❓ ${q}`));
    lines.push("");
  }
  if (diff.resolvedQuestions.length > 0) {
    lines.push("  ── Resolved ──");
    diff.resolvedQuestions.forEach(q => lines.push(`    ✓ ${q}`));
    lines.push("");
  }
  if (diff.persistingQuestions.length > 0) {
    lines.push("  ── Persisting ──");
    diff.persistingQuestions.forEach(q => lines.push(`    … ${q}`));
    lines.push("");
  }
  lines.push("═══════════════════════════════════════════════");
  return lines.join("\n");
}
