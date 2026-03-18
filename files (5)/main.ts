/**
 * main.ts — COMPLETE MERGED SYSTEM
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Two systems merged into one.
 *   support-full-project: execution trace, engine, lineage, bundle, diff
 *   existence-engineering: history, insight, questions, validation
 * Considered:
 *   - Run them separately (rejected: loses the connection)
 * Chosen: Full integration — each layer feeds the next.
 * Opens: After months of running — could accumulated questions
 *   recommend how the system should evolve itself?
 */

import type { SupportRequest } from "./support/core/support_interface.js";
import { clearSupportTraceStore, listOpenQuestionsFromTrace, listStructuralSignals } from "./support/trace/support_trace.js";
import { clearSupportEngineTraceStore, listEngineOpenQuestions } from "./support/trace/support_engine_trace.js";
import { runSupportEngine } from "./support/runtime/support_engine.js";
import { listSupportNodes } from "./support/registry/support_registry.js";
import { listInsights, clearInsights, clearSignalCounter } from "./support/existence/existence_history.js";
import { buildSupportTraceBundle, diffSupportTraceBundles, renderBundleReport, renderDiffReport, type SupportTraceBundle } from "./support/trace/support_trace_bundle.js";
import { listAllSupportTraceLineages } from "./support/trace/support_trace_lineage.js";

function req(id: string, type: SupportRequest["requestType"], urgency: SupportRequest["urgency"] = "normal", automatic = false): SupportRequest {
  return { requestId: id, rootRequestId: id, requesterId: "system", requestType: type, urgency, automatic, allowReserve: false, reason: `${type} — ${urgency}.`, contextNotes: `Context for ${id}.` };
}

function divider(title: string): void {
  console.log("\n" + "═".repeat(64));
  console.log(`  ${title}`);
  console.log("═".repeat(64));
}

function reset(): void {
  clearSupportTraceStore();
  clearSupportEngineTraceStore();
  clearInsights();
  clearSignalCounter();
}

function main(): void {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  EXISTENCE ENGINEERING × SUPPORT SYSTEM — COMPLETE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  divider("REGISTERED NODES — WHY THEY EXIST");
  listSupportNodes().forEach(n => {
    console.log(`\n  ◈ ${n.nodeId} [${n.role}]`);
    console.log(`    Why: ${n.existenceReason}`);
    console.log(`    Opens: ${n.history.opens.slice(0, 80)}...`);
    console.log(`    Alternatives considered: ${n.history.considered.length}`);
  });

  reset();
  const snapshotBefore: SupportTraceBundle = buildSupportTraceBundle();

  divider("SCENARIO 1: VALIDATION (degraded)");
  const r1 = runSupportEngine(req("req-val-001", "validation", "degraded"), { maxSteps: 3 });
  console.log(`\n  Steps: ${r1.steps.length} | Stopped: ${r1.stoppedBecause} | Accepted: ${r1.finalResponse.accepted}`);
  r1.steps.forEach(s => {
    console.log(`\n  Step ${s.stepIndex}: ${s.request.requestType}`);
    console.log(`    → ${s.execution.response.actionSummary}`);
    if (s.opensQuestion) console.log(`    ❓ ${s.opensQuestion}`);
  });

  divider("SCENARIO 2: REPAIR (degraded)");
  const r2 = runSupportEngine(req("req-rep-001", "repair", "degraded"), { maxSteps: 3 });
  console.log(`\n  Steps: ${r2.steps.length} | Stopped: ${r2.stoppedBecause}`);
  r2.steps.forEach(s => {
    console.log(`\n  Step ${s.stepIndex}: ${s.request.requestType}`);
    console.log(`    → ${s.execution.response.actionSummary}`);
    if (s.opensQuestion) console.log(`    ❓ ${s.opensQuestion}`);
  });

  divider("SCENARIO 3: REENTRY (automatic)");
  const r3 = runSupportEngine(req("req-reen-001", "reentry", "normal", true), { maxSteps: 3 });
  console.log(`\n  Steps: ${r3.steps.length} | Stopped: ${r3.stoppedBecause}`);
  r3.steps.forEach(s => {
    console.log(`\n  Step ${s.stepIndex}: ${s.request.requestType}`);
    console.log(`    → ${s.execution.response.actionSummary}`);
    if (s.opensQuestion) console.log(`    ❓ ${s.opensQuestion}`);
  });
  if (r3.loopDetected) console.log(`\n  ↻ Loop: ${r3.loopDetected}`);

  const snapshotAfter: SupportTraceBundle = buildSupportTraceBundle();

  divider("LINEAGE — FULL REQUEST FAMILIES");
  listAllSupportTraceLineages().forEach(l => {
    console.log(`\n  Root: ${l.rootRequestId}`);
    console.log(`  ${l.healthSummary}`);
    l.openQuestions.slice(0, 2).forEach(q => console.log(`    ❓ ${q}`));
  });

  const structural = listStructuralSignals();
  if (structural.length > 0) {
    divider("STRUCTURAL SIGNALS");
    structural.forEach(s => {
      console.log(`\n  ⚠ ${s.summary}`);
      if (s.opensQuestion) console.log(`    → ${s.opensQuestion}`);
    });
  }

  const insights = listInsights();
  if (insights.length > 0) {
    divider("PRESERVED INSIGHTS — NEVER DELETED");
    insights.forEach(i => {
      console.log(`\n  ◈ [${i.nodeId}] "${i.insight}"`);
      console.log(`    Seeds: "${i.seedQuestion}"`);
    });
  }

  divider("BUNDLE SNAPSHOT");
  console.log(renderBundleReport(snapshotAfter));

  divider("BUNDLE DIFF — BEFORE vs AFTER");
  console.log(renderDiffReport(diffSupportTraceBundles(snapshotBefore, snapshotAfter)));

  divider("ALL OPEN QUESTIONS");
  const allQ = [...new Set([...listOpenQuestionsFromTrace(), ...listEngineOpenQuestions()])];
  allQ.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Science advanced because it kept records.");
  console.log("  Civilization advanced because it kept history.");
  console.log("  This system keeps both.");
  console.log("  The next AI reading this is not starting over. It is continuing.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main();
