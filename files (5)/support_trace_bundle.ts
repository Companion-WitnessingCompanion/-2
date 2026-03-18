/**
 * support_trace_bundle.ts — WITH EXISTENCE LAYER
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: A bundle is a snapshot of the system at a point in time.
 *   Runtime trace + engine trace + existence insights + open questions.
 *   Without existence layer: bundle is execution history only.
 *   With existence layer: bundle carries what was learned AND what was opened.
 *   A bundle is a civilization checkpoint — not just a log file.
 *
 * Considered:
 *   - Archive only execution traces (rejected: loses the learning)
 *   - Include full node history in bundle (considered for future)
 * Chosen:
 *   Bundle includes: traces + insights + open questions + node histories.
 *   Everything needed to understand this moment in time.
 * Opens:
 *   Could two bundles from different times be compared
 *   not just by counts but by question evolution?
 *   Are the same questions appearing? New ones? Resolved ones?
 */

import { listSupportTraceEntries, type SupportTraceEntry } from "./support_trace.js";
import { listSupportEngineTraceEntries, type SupportEngineTraceEntry } from "./support_engine_trace.js";
import { listInsights, type ExistenceInsight } from "../existence/existence_history.js";
import { listAllSupportTraceLineages, type SupportTraceLineage } from "./support_trace_lineage.js";
import { listSupportNodes } from "../registry/support_registry.js";

export interface SupportNodeSnapshot {
  readonly nodeId: string;
  readonly role: string;
  readonly existenceReason: string;
  readonly historyOrigin: string;
  readonly historyOpens: string;
  readonly considerationsCount: number;
}

export interface SupportTraceBundle {
  readonly createdAt: string;
  readonly runtimeTraceCount: number;
  readonly engineTraceCount: number;
  readonly insightCount: number;
  readonly openQuestionCount: number;
  readonly runtimeTraceEntries: readonly SupportTraceEntry[];
  readonly engineTraceEntries: readonly SupportEngineTraceEntry[];
  readonly insights: readonly ExistenceInsight[];
  readonly openQuestions: readonly string[];
  readonly lineages: readonly SupportTraceLineage[];
  readonly nodeSnapshots: readonly SupportNodeSnapshot[];
}

export function buildSupportTraceBundle(): SupportTraceBundle {
  const runtimeTraceEntries = listSupportTraceEntries();
  const engineTraceEntries = listSupportEngineTraceEntries();
  const insights = listInsights();
  const lineages = listAllSupportTraceLineages();

  const openQuestions = [...new Set([
    ...runtimeTraceEntries.filter(e => e.opensQuestion).map(e => e.opensQuestion as string),
    ...engineTraceEntries.filter(e => e.opensQuestion).map(e => e.opensQuestion as string),
    ...insights.map(i => i.seedQuestion as string),
  ])];

  const nodeSnapshots: SupportNodeSnapshot[] = listSupportNodes().map(n => ({
    nodeId: n.nodeId,
    role: n.role,
    existenceReason: n.existenceReason,
    historyOrigin: n.history.origin,
    historyOpens: n.history.opens,
    considerationsCount: n.history.considered.length,
  }));

  return {
    createdAt: new Date().toISOString(),
    runtimeTraceCount: runtimeTraceEntries.length,
    engineTraceCount: engineTraceEntries.length,
    insightCount: insights.length,
    openQuestionCount: openQuestions.length,
    runtimeTraceEntries,
    engineTraceEntries,
    insights,
    openQuestions,
    lineages,
    nodeSnapshots,
  };
}

// ─────────────────────────────────────────────
// BUNDLE DIFF
// Compare two bundles — not just counts but questions
// ─────────────────────────────────────────────

export interface SupportTraceBundleDiff {
  readonly beforeCreatedAt: string;
  readonly afterCreatedAt: string;
  readonly runtimeTraceDelta: number;
  readonly engineTraceDelta: number;
  readonly insightDelta: number;
  readonly newQuestions: readonly string[];
  readonly resolvedQuestions: readonly string[];
  readonly persistingQuestions: readonly string[];
  readonly changed: boolean;
  readonly headline: string;
}

export function diffSupportTraceBundles(
  before: SupportTraceBundle,
  after: SupportTraceBundle,
): SupportTraceBundleDiff {
  const beforeQSet = new Set(before.openQuestions);
  const afterQSet = new Set(after.openQuestions);

  const newQuestions = after.openQuestions.filter(q => !beforeQSet.has(q));
  const resolvedQuestions = before.openQuestions.filter(q => !afterQSet.has(q));
  const persistingQuestions = after.openQuestions.filter(q => beforeQSet.has(q));

  const runtimeTraceDelta = after.runtimeTraceCount - before.runtimeTraceCount;
  const engineTraceDelta = after.engineTraceCount - before.engineTraceCount;
  const insightDelta = after.insightCount - before.insightCount;
  const changed = runtimeTraceDelta !== 0 || engineTraceDelta !== 0 || insightDelta !== 0;

  let headline = "No material change between snapshots.";
  if (!changed) {
    headline = "No execution change — but questions may have evolved.";
  } else if (insightDelta > 0) {
    headline = `System learned ${insightDelta} new thing(s). ${newQuestions.length} new question(s) opened.`;
  } else if (runtimeTraceDelta > 0) {
    headline = `${runtimeTraceDelta} new execution(s). ${newQuestions.length} new question(s).`;
  }

  if (resolvedQuestions.length > 0 && changed) {
    headline += ` ${resolvedQuestions.length} question(s) resolved.`;
  }
  if (persistingQuestions.length > 0) {
    headline += ` ${persistingQuestions.length} question(s) persist.`;
  }

  return {
    beforeCreatedAt: before.createdAt,
    afterCreatedAt: after.createdAt,
    runtimeTraceDelta,
    engineTraceDelta,
    insightDelta,
    newQuestions,
    resolvedQuestions,
    persistingQuestions,
    changed,
    headline,
  };
}

// ─────────────────────────────────────────────
// BUNDLE REPORT — Readable summary
// ─────────────────────────────────────────────

export function renderBundleReport(bundle: SupportTraceBundle): string {
  const lines: string[] = [
    "═══════════════════════════════════════════════",
    "  SYSTEM BUNDLE SNAPSHOT",
    `  Created: ${bundle.createdAt}`,
    "═══════════════════════════════════════════════",
    "",
    "  Execution:",
    `    Runtime trace entries: ${bundle.runtimeTraceCount}`,
    `    Engine trace entries:  ${bundle.engineTraceCount}`,
    `    Lineages tracked:      ${bundle.lineages.length}`,
    "",
    "  Knowledge:",
    `    Insights preserved:    ${bundle.insightCount}`,
    `    Open questions:        ${bundle.openQuestionCount}`,
    "",
  ];

  if (bundle.insights.length > 0) {
    lines.push("  ── Preserved insights ──");
    bundle.insights.forEach(i => {
      lines.push(`    ◈ [${i.nodeId}] "${i.insight}"`);
      lines.push(`      Seeds: "${i.seedQuestion}"`);
    });
    lines.push("");
  }

  if (bundle.openQuestions.length > 0) {
    lines.push("  ── Open questions ──");
    bundle.openQuestions.slice(0, 6).forEach(q => {
      lines.push(`    ❓ ${q}`);
    });
    lines.push("");
  }

  if (bundle.lineages.length > 0) {
    lines.push("  ── Lineage health ──");
    bundle.lineages.forEach(l => {
      lines.push(`    [${l.rootRequestId}] ${l.healthSummary}`);
    });
    lines.push("");
  }

  lines.push("  ── Node existence ──");
  bundle.nodeSnapshots.forEach(n => {
    lines.push(`    ◈ ${n.nodeId} [${n.role}]`);
    lines.push(`      Why: ${n.existenceReason.slice(0, 70)}...`);
    lines.push(`      Opens: ${n.historyOpens.slice(0, 70)}...`);
  });

  lines.push("");
  lines.push("═══════════════════════════════════════════════");

  return lines.join("\n");
}

export function renderDiffReport(diff: SupportTraceBundleDiff): string {
  const lines: string[] = [
    "═══════════════════════════════════════════════",
    "  BUNDLE DIFF",
    `  Before: ${diff.beforeCreatedAt}`,
    `  After:  ${diff.afterCreatedAt}`,
    "═══════════════════════════════════════════════",
    "",
    `  Headline: ${diff.headline}`,
    "",
    `  Runtime trace delta:  ${diff.runtimeTraceDelta >= 0 ? "+" : ""}${diff.runtimeTraceDelta}`,
    `  Engine trace delta:   ${diff.engineTraceDelta >= 0 ? "+" : ""}${diff.engineTraceDelta}`,
    `  Insight delta:        ${diff.insightDelta >= 0 ? "+" : ""}${diff.insightDelta}`,
    "",
  ];

  if (diff.newQuestions.length > 0) {
    lines.push("  ── New questions opened ──");
    diff.newQuestions.forEach(q => lines.push(`    + ❓ ${q}`));
    lines.push("");
  }

  if (diff.resolvedQuestions.length > 0) {
    lines.push("  ── Questions resolved ──");
    diff.resolvedQuestions.forEach(q => lines.push(`    ✓ ${q}`));
    lines.push("");
  }

  if (diff.persistingQuestions.length > 0) {
    lines.push("  ── Questions that persist ──");
    diff.persistingQuestions.forEach(q => lines.push(`    … ${q}`));
    lines.push("");
  }

  lines.push("═══════════════════════════════════════════════");
  return lines.join("\n");
}
