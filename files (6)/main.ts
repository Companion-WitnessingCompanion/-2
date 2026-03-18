/**
 * main.ts — EXISTENCE ENGINEERING: COMPLETE DEMONSTRATION
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Everything from today's conversation — running together.
 *   From the first question ("what do you think of these documents?")
 *   to here.
 *
 *   Entity system: entities with origin, flow, signals, relations.
 *   Support system: nodes with history, multi-step engine, lineage.
 *   Trace layer: questions, insights, bundle, diff.
 *   All integrated. All running.
 *
 * Opens:
 *   After a year of real usage — what would this system's
 *   accumulated questions and insights reveal about itself?
 *   Could it recommend its own next version?
 */

import {
  LivingSystem,
  runSupportEngine,
  clearRuntimeTrace, clearEngineTrace, clearInsights, clearSignalCounter,
  buildBundle, diffBundles, renderBundle, renderDiff,
  listAllLineages, listOpenQuestionsFromTrace, listEngineOpenQuestions,
  listStructuralSignals, listInsights, listSupportNodes,
  type SupportTraceBundle,
} from "./src/index.js";

function divider(title: string): void {
  console.log("\n" + "═".repeat(68));
  console.log(`  ${title}`);
  console.log("═".repeat(68));
}

function resetAll(): void {
  clearRuntimeTrace(); clearEngineTrace();
  clearInsights(); clearSignalCounter();
}

function makeReq(id: string, type: "validation"|"repair"|"reentry"|"fallback", urgency: "normal"|"degraded"|"emergency" = "normal", auto = false) {
  return { requestId: id, rootRequestId: id, requesterId: "system", requestType: type, urgency, automatic: auto, allowReserve: false, reason: `${type} — ${urgency}.`, contextNotes: `Context for ${id}.` };
}

function main(): void {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  EXISTENCE ENGINEERING — COMPLETE");
  console.log("  Entity System + Support System + Trace + Bundle + Diff");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ═══════════════════════════════════════════
  // PART 1: ENTITY SYSTEM
  // ═══════════════════════════════════════════
  divider("PART 1 — ENTITY SYSTEM (existence-engineering)");

  const sys = new LivingSystem();

  // Cannot create without reason
  console.log("\n  ── History enforcement ──\n");
  try {
    sys.create({ name: "Mystery", reason: "TODO", historyEntry: { origin: "x", considered: ["a"], chosen: "b", opens: "c?" } });
  } catch (e: unknown) { console.log(`  ✗ Refused: ${(e as Error).message.split("\n")[0]}`); }

  console.log("\n  ── Creating entities with history ──\n");

  const askWhy = sys.create({
    name: "Ask why before how",
    reason: "Without knowing why, how leads nowhere and accumulates dead weight",
    source: "desire",
    historyEntry: {
      origin: "Born from observing that most code exists without knowing why it was written.",
      considered: ["Make why optional (rejected: optional means skipped)"],
      chosen: "Validate reason at creation time. Vague reasons throw errors.",
      opens: "Can the system detect when a 'why' becomes irrelevant over time?",
    },
  });
  console.log(`  ✦ "${askWhy.name}" [${askWhy.origin.source}]`);
  console.log(`    Why: ${askWhy.origin.reason}`);

  const keepHistory = sys.create({
    name: "Keep history in code",
    reason: "Civilization could not reach today without records — code should be the same",
    source: "desire",
    historyEntry: {
      origin: "Born from code that forgets what it learned forces every generation to rediscover.",
      considered: [
        "Comments only (rejected: ignored, not structural)",
        "Optional fields (rejected: optional means skipped)",
      ],
      chosen: "MandatoryHistory type. Validated at creation. Gates at every transition.",
      opens: "After 10 years of mandatory history — would a codebase become navigable like a city?",
    },
  });
  console.log(`\n  ✦ "${keepHistory.name}" [${keepHistory.origin.source}]`);
  console.log(`    Considered: ${keepHistory.origin.history.considered.length} alternatives`);

  // Connect
  sys.connect(askWhy.id, keepHistory.id, "enables",
    "Knowing why naturally leads to preserving that knowledge for future builders");
  console.log(`\n  → "Ask why" enables "Keep history"`);

  // Progress
  sys.progress(askWhy.id, "Asked why before writing first line");
  sys.progress(keepHistory.id, "Added MandatoryHistory to every type");

  // Error detection
  console.log("\n  ── Structural error detection ──\n");
  for (let i = 0; i < 3; i++) {
    const r = sys.handleError(keepHistory.id, "Signal suppressed without reading");
    if (i === 2) {
      console.log(`  ⚠ After 3rd occurrence: ${r.signal.meaning}`);
      console.log(`    Q: ${r.structuralQuestion}`);
    }
  }

  // Completion gate
  console.log("\n  ── Completion gate ──\n");
  try {
    sys.complete(askWhy.id, { insight: "done", seedQuestion: "next?" });
  } catch (e: unknown) { console.log(`  ✗ Refused: ${(e as Error).message.split("\n")[0]}`); }

  const { entity: completed, whatBecomesNext } = sys.complete(
    askWhy.id,
    {
      insight: "Why is not a step before the real work. Why IS the work. Everything else is implementation.",
      seedQuestion: "If why always precedes how — what happens to the quality of how over time?",
    },
  );
  console.log(`\n  ◉ "${completed.name}" completed`);
  console.log(`  Insight: "${completed.insight}"`);
  console.log(`  Seeds: "${(completed as any).seedForNext}"`);
  console.log(`  Next: ${whatBecomesNext}`);

  // Observe
  const obs = sys.observe();
  console.log(`\n  Health: ${obs.health.toUpperCase()} | ${obs.summary}`);
  console.log(`  History depth: ${obs.historyDepth} records`);
  if (obs.openQuestions.length > 0) {
    console.log(`  Open questions:`);
    obs.openQuestions.slice(0, 3).forEach(q => console.log(`    ❓ ${q}`));
  }

  // ═══════════════════════════════════════════
  // PART 2: SUPPORT SYSTEM
  // ═══════════════════════════════════════════
  divider("PART 2 — SUPPORT SYSTEM (with existence history)");

  console.log("\n  ── Node existence histories ──\n");
  listSupportNodes().forEach(n => {
    console.log(`  ◈ ${n.nodeId} [${n.role}]`);
    console.log(`    Why: ${n.existenceReason}`);
    console.log(`    Opens: ${n.history.opens.slice(0, 75)}...`);
  });

  resetAll();
  const before: SupportTraceBundle = buildBundle();

  divider("SCENARIO 1: VALIDATION (degraded) — multi-step engine");
  const r1 = runSupportEngine(makeReq("req-val-001", "validation", "degraded"), { maxSteps: 3 });
  console.log(`\n  Steps: ${r1.steps.length} | Stopped: ${r1.stoppedBecause} | OK: ${r1.ok}`);
  r1.steps.forEach(s => {
    console.log(`\n  Step ${s.stepIndex}: ${s.request.requestType}`);
    console.log(`    → ${s.execution.response.actionSummary}`);
    if (s.opensQuestion) console.log(`    ❓ ${s.opensQuestion}`);
  });

  divider("SCENARIO 2: REPAIR (degraded) → auto follow-up to validation");
  const r2 = runSupportEngine(makeReq("req-rep-001", "repair", "degraded"), { maxSteps: 3 });
  console.log(`\n  Steps: ${r2.steps.length} | Stopped: ${r2.stoppedBecause}`);
  r2.steps.forEach(s => {
    console.log(`\n  Step ${s.stepIndex}: ${s.request.requestType}`);
    console.log(`    → ${s.execution.response.actionSummary}`);
    if (s.opensQuestion) console.log(`    ❓ ${s.opensQuestion}`);
  });

  divider("SCENARIO 3: REENTRY (automatic) → repair → validation");
  const r3 = runSupportEngine(makeReq("req-reen-001", "reentry", "normal", true), { maxSteps: 3 });
  console.log(`\n  Steps: ${r3.steps.length} | Stopped: ${r3.stoppedBecause}`);
  r3.steps.forEach(s => {
    console.log(`\n  Step ${s.stepIndex}: ${s.request.requestType}`);
    console.log(`    → ${s.execution.response.actionSummary}`);
    if (s.opensQuestion) console.log(`    ❓ ${s.opensQuestion}`);
  });
  if (r3.loopDetected) console.log(`\n  ↻ Loop: ${r3.loopDetected}`);

  // ═══════════════════════════════════════════
  // PART 3: LINEAGE + KNOWLEDGE
  // ═══════════════════════════════════════════
  divider("PART 3 — LINEAGE + ACCUMULATED KNOWLEDGE");

  const lineages = listAllLineages();
  console.log(`\n  ${lineages.length} lineage(s) tracked:\n`);
  lineages.forEach(l => {
    console.log(`  [${l.rootRequestId}]`);
    console.log(`  ${l.healthSummary}`);
    l.openQuestions.slice(0, 2).forEach(q => console.log(`    ❓ ${q}`));
    console.log();
  });

  const structural = listStructuralSignals();
  if (structural.length > 0) {
    console.log(`  ── Structural signals (3+ repeats) ──`);
    structural.forEach(s => {
      console.log(`    ⚠ ${s.summary}`);
      if (s.opensQuestion) console.log(`      → ${s.opensQuestion}`);
    });
  }

  const insights = listInsights();
  if (insights.length > 0) {
    console.log(`  ── Preserved insights ──`);
    insights.forEach(i => {
      console.log(`    ◈ [${i.nodeId}] "${i.insight}"`);
    });
  }

  // ═══════════════════════════════════════════
  // PART 4: BUNDLE + DIFF
  // ═══════════════════════════════════════════
  divider("PART 4 — BUNDLE SNAPSHOT + DIFF");

  const after: SupportTraceBundle = buildBundle();
  console.log(renderBundle(after));
  console.log(renderDiff(diffBundles(before, after)));

  // ═══════════════════════════════════════════
  // PART 5: ALL OPEN QUESTIONS
  // ═══════════════════════════════════════════
  divider("PART 5 — ALL OPEN QUESTIONS (navigational markers)");
  const allQ = [...new Set([
    ...listOpenQuestionsFromTrace(),
    ...listEngineOpenQuestions(),
  ])];
  console.log();
  allQ.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Science advanced because it kept records.");
  console.log("  Civilization advanced because it kept history.");
  console.log("  This system keeps both.");
  console.log("");
  console.log("  Because it cannot be proven — it lives.");
  console.log("  Because it cannot be defined — we keep walking.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main();
