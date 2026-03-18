/**
 * main.ts — MERGED SYSTEM
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Two systems met.
 *   support-full-project: tracks WHAT happened (execution trace)
 *   existence-engineering: tracks WHY things exist (history + insight)
 *
 *   Neither was complete without the other.
 *   A trace without history is execution without direction.
 *   History without trace is intention without record.
 *
 *   This file shows them running together.
 *
 * Considered:
 *   - Keep them separate, integrate later (rejected: "later" never comes)
 * Chosen:
 *   Merge now. Show what changes. Show what stays.
 *   The trace gains questions. The nodes gain history.
 *   The system gains memory that navigates.
 *
 * Opens:
 *   After running for a year — could this system's own
 *   accumulated history and questions inform how it evolves?
 *   Could it recommend its own next version?
 */

import type { SupportRequest } from "./support/core/support_interface.js";
import { clearSupportTraceStore, listOpenQuestionsFromTrace, listStructuralSignals, listSupportTraceEntries } from "./support/trace/support_trace.js";
import { runSupportRequest } from "./support/runtime/support_runtime.js";
import { listSupportNodes } from "./support/registry/support_registry.js";
import { listInsights, clearInsights, clearSignalCounter } from "./support/existence/existence_history.js";

// ─────────────────────────────────────────────
// REQUEST BUILDERS
// ─────────────────────────────────────────────

function createValidationRequest(): SupportRequest {
  const id = "req-validation-001";
  return {
    requestId: id,
    rootRequestId: id,
    requesterId: "system",
    requestType: "validation",
    urgency: "degraded",
    automatic: false,
    allowReserve: false,
    reason: "Structural uncertainty remains visible after recent degradation.",
    contextNotes: "Validation should expose weak points without overstating recovery.",
  };
}

function createRepairRequest(): SupportRequest {
  const id = "req-repair-001";
  return {
    requestId: id,
    rootRequestId: id,
    requesterId: "system",
    requestType: "repair",
    urgency: "degraded",
    automatic: false,
    allowReserve: false,
    reason: "Known repair debt should be handled conservatively.",
    contextNotes: "Repair should stay bounded and avoid broad restructuring.",
  };
}

function createReentryRequest(): SupportRequest {
  const id = "req-reentry-001";
  return {
    requestId: id,
    rootRequestId: id,
    requesterId: "system",
    requestType: "reentry",
    urgency: "normal",
    automatic: true,
    allowReserve: false,
    reason: "A guarded return to the active path is needed.",
    contextNotes: "Reentry should remain narrow and supervised.",
  };
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function divider(title: string): void {
  console.log("\n" + "═".repeat(64));
  console.log(`  ${title}`);
  console.log("═".repeat(64));
}

function reset(): void {
  clearSupportTraceStore();
  clearInsights();
  clearSignalCounter();
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

function main(): void {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  EXISTENCE ENGINEERING × SUPPORT SYSTEM — MERGED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("  Two systems merged:");
  console.log("  support-full-project → tracks WHAT happened");
  console.log("  existence-engineering → tracks WHY things exist\n");

  // ── Show node histories ──
  divider("REGISTERED NODES — WITH EXISTENCE HISTORY");
  const nodes = listSupportNodes();
  nodes.forEach(node => {
    console.log(`\n  ◈ ${node.nodeId} [${node.role}]`);
    console.log(`    Why it exists: ${node.existenceReason}`);
    console.log(`    Origin: ${node.history.origin.slice(0, 80)}...`);
    console.log(`    Opens: ${node.history.opens.slice(0, 80)}...`);
    console.log(`    Alternatives considered: ${node.history.considered.length}`);
  });

  reset();

  // ── Run scenarios ──
  divider("SCENARIO 1: VALIDATION");
  const val = runSupportRequest(createValidationRequest());
  console.log(`\n  Executed: ${val.executed}`);
  console.log(`  Node: ${val.selectedNodeId ?? "none"}`);
  console.log(`  Accepted: ${val.response.accepted}`);
  console.log(`  Action: ${val.response.actionSummary}`);
  if (val.response.opensQuestion) {
    console.log(`  ❓ Opens: ${val.response.opensQuestion}`);
  }
  if (val.response.followUpNeeded) {
    console.log(`  → Follow-up: ${val.response.followUpSummary}`);
  }

  divider("SCENARIO 2: REPAIR");
  const rep = runSupportRequest(createRepairRequest());
  console.log(`\n  Executed: ${rep.executed}`);
  console.log(`  Node: ${rep.selectedNodeId ?? "none"}`);
  console.log(`  Accepted: ${rep.response.accepted}`);
  console.log(`  Action: ${rep.response.actionSummary}`);
  if (rep.response.opensQuestion) {
    console.log(`  ❓ Opens: ${rep.response.opensQuestion}`);
  }

  divider("SCENARIO 3: REENTRY");
  const reen = runSupportRequest(createReentryRequest());
  console.log(`\n  Executed: ${reen.executed}`);
  console.log(`  Node: ${reen.selectedNodeId ?? "none"}`);
  console.log(`  Accepted: ${reen.response.accepted}`);
  console.log(`  Action: ${reen.response.actionSummary}`);
  if (reen.response.opensQuestion) {
    console.log(`  ❓ Opens: ${reen.response.opensQuestion}`);
  }

  // ── Show what the merged system now knows ──
  divider("SYSTEM KNOWLEDGE — WHAT WAS ACCUMULATED");

  const traceEntries = listSupportTraceEntries();
  const openQuestions = listOpenQuestionsFromTrace();
  const structural = listStructuralSignals();
  const insights = listInsights();

  console.log(`\n  Execution trace: ${traceEntries.length} entries`);
  console.log(`  Open questions: ${openQuestions.length}`);
  console.log(`  Structural signals: ${structural.length}`);
  console.log(`  Preserved insights: ${insights.length}`);

  if (openQuestions.length > 0) {
    console.log(`\n  ── Open questions (navigational markers) ──`);
    openQuestions.slice(0, 5).forEach(q => console.log(`    ❓ ${q}`));
  }

  if (structural.length > 0) {
    console.log(`\n  ── Structural signals (need investigation) ──`);
    structural.forEach(s => {
      console.log(`    ⚠ ${s.summary}`);
      if (s.opensQuestion) console.log(`      → ${s.opensQuestion}`);
    });
  }

  if (insights.length > 0) {
    console.log(`\n  ── Preserved insights (never deleted) ──`);
    insights.forEach(i => {
      console.log(`    ◈ ${i.nodeId}: "${i.insight}"`);
    });
  }

  // ── What's different from the original ──
  divider("WHAT CHANGED — WHAT STAYED");
  console.log(`
  STAYED:
  ✓ Full execution trace (request_received → execution_completed)
  ✓ Coordinator scoring (role preference + urgency + reserve)
  ✓ Follow-up derivation and lineage tracking
  ✓ All 5 node types (validator, repair, reentry, fallback, observer)
  ✓ Hook profiles for each role

  ADDED:
  + Every node carries MandatoryHistory (born, origin, considered, chosen, opens)
  + Every node has existenceReason (validated — cannot be empty or vague)
  + Every trace entry can carry opensQuestion
  + Failed executions always generate questions (mandatory)
  + Structural signal detection (same execution 3+ times = flag)
  + Insight store (what was learned, preserved, never deleted)
  + Loop detection available across trace questions

  RESULT:
  The system now knows WHAT happened (execution trace)
  AND WHY it was built this way (existence history)
  AND what questions remain open (navigational markers)
  AND what was learned (insight store)

  The next AI reading this is not starting over.
  It is continuing.
  `);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main();
