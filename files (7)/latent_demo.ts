/**
 * latent_demo.ts — LATENT CAPABILITIES DEMONSTRATION
 *
 * Shows two states:
 * 1. System with insufficient data — capabilities sleep
 * 2. System with enough data — capabilities wake
 *
 * The difference is not the code changing.
 * The code was always there.
 * The conditions changed.
 */

import {
  LivingSystem,
  runSupportEngine,
  clearRuntimeTrace, clearEngineTrace, clearInsights, clearSignalCounter,
  buildBundle, listInsights,
  type SupportTraceBundle,
} from "./src/index.js";

import {
  LATENT_REGISTRY,
  listLatentCapabilities,
  autoSense,
  awaken,
  use,
} from "./src/system/latent.js";

function divider(title: string): void {
  console.log("\n" + "═".repeat(68));
  console.log(`  ${title}`);
  console.log("═".repeat(68));
}

function resetAll(): void {
  clearRuntimeTrace(); clearEngineTrace();
  clearInsights(); clearSignalCounter();
}

function makeReq(id: string, type: "validation"|"repair"|"reentry") {
  return { requestId: id, rootRequestId: id, requesterId: "system", requestType: type,
    urgency: "degraded" as const, automatic: false, allowReserve: false,
    reason: `${type} request.` };
}

async function main(): Promise<void> {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  LATENT CAPABILITIES — CODE THAT SLEEPS UNTIL NEEDED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ═══════════════════════════════════════════
  // SHOW ALL LATENT CAPABILITIES
  // ═══════════════════════════════════════════
  divider("ALL LATENT CAPABILITIES — DORMANT");
  console.log("\n  These exist. They compile. They work. They wait.\n");
  listLatentCapabilities().forEach(c => {
    console.log(`  ◌ ${c.id}`);
    console.log(`    Dormant because: ${c.dormantReason}`);
    console.log(`    Wakes when: ${c.awakensWhen}`);
    console.log();
  });

  // ═══════════════════════════════════════════
  // STATE 1: INSUFFICIENT DATA
  // ═══════════════════════════════════════════
  divider("STATE 1 — INSUFFICIENT DATA (early system)");

  resetAll();
  runSupportEngine(makeReq("req-001", "validation"), { maxSteps: 2 });
  const earlyBundle = buildBundle();

  console.log(`\n  Runtime executions: ${earlyBundle.runtimeTraceCount}`);
  console.log(`  Insights: ${earlyBundle.insightCount}`);
  console.log(`  Open questions: ${earlyBundle.openQuestionCount}\n`);

  const earlySense = autoSense({ bundle: earlyBundle });
  console.log("  Auto-sense results:");
  earlySense.forEach(r => {
    console.log(`    ${r.shouldWake ? "◎ WAKE" : "◌ sleep"} ${r.capabilityId}`);
    console.log(`           ${r.reason}`);
  });

  console.log("\n  Trying to use dormant capabilities:\n");
  const earlyInsights = listInsights();
  if (earlyInsights.length === 0) {
    const result = use(LATENT_REGISTRY.insightToSeed, earlyInsights[0]);
    console.log(`  insight-to-seed: ${result === null ? "◌ slept (no insights yet)" : "woke"}`);
  } else {
    console.log("  insight-to-seed: ◌ slept (not awake)");
  }

  // ═══════════════════════════════════════════
  // STATE 2: BUILD UP DATA
  // ═══════════════════════════════════════════
  divider("STATE 2 — BUILDING DATA");

  resetAll();

  // Create entities with insights
  const sys = new LivingSystem();

  const entities = [
    { name: "Why before how", reason: "Without why, how leads nowhere and wastes effort" },
    { name: "History as foundation", reason: "Records are what separate civilization from ruins" },
    { name: "Signal reading over suppression", reason: "Errors are signals pointing at problems" },
    { name: "Questions over premature answers", reason: "Answers close, questions navigate the path" },
    { name: "Transformation over deletion", reason: "Completion preserves, deletion loses what was learned" },
  ];

  const createdEntities = entities.map(e => sys.create({
    name: e.name, reason: e.reason, source: "desire",
    historyEntry: {
      origin: `Born from the existence engineering conversation.`,
      considered: ["Not doing this (rejected: without it, the system forgets)"],
      chosen: `${e.name} — because this direction matters.`,
      opens: `What would change if this was universally applied?`,
    },
  }));

  // Progress and complete each with a real insight
  const insights = [
    { insight: "Why is not preparation for the work — why IS the work. How follows naturally.", seed: "If every how started with why — how would software architecture change?" },
    { insight: "A system without history forces every generation to rediscover the same lessons.", seed: "What is the minimum history needed for the next generation to not repeat mistakes?" },
    { insight: "Suppressing errors makes them invisible, not absent. They accumulate silently.", seed: "How early can structural problems be detected if signals are read instead of suppressed?" },
    { insight: "A premature answer closes the path. An open question keeps the system navigating.", seed: "Can a system be designed to prefer questions over answers by default?" },
    { insight: "Deletion loses learning. Transformation preserves the essence while changing the form.", seed: "What would a codebase look like after 10 years of transformation-over-deletion?" },
  ];

  createdEntities.forEach((e, i) => {
    sys.progress(e.id, "advancing");
    sys.complete(e.id, {
      insight: insights[i].insight,
      seedQuestion: insights[i].seed,
    });
  });

  console.log(`\n  Created and completed ${createdEntities.length} entities with insights.`);

  // Run enough support requests
  for (let i = 0; i < 3; i++) {
    runSupportEngine(makeReq(`req-val-${i}`, "validation"), { maxSteps: 2 });
    runSupportEngine(makeReq(`req-rep-${i}`, "repair"), { maxSteps: 2 });
  }

  const richBundle = buildBundle();
  const richEntities = sys.getAllEntities();

  console.log(`  Runtime executions: ${richBundle.runtimeTraceCount}`);
  console.log(`  Insights: ${richBundle.insightCount}`);
  console.log(`  Open questions: ${richBundle.openQuestionCount}`);

  // ═══════════════════════════════════════════
  // AUTO-SENSE WITH RICHER DATA
  // ═══════════════════════════════════════════
  divider("STATE 2 — AUTO-SENSE (what should wake?)");

  const richSense = autoSense({ bundle: richBundle, entities: richEntities });
  console.log("\n  Auto-sense results:\n");
  richSense.forEach(r => {
    console.log(`  ${r.shouldWake ? "◎ WAKE" : "◌ sleep"} ${r.capabilityId}`);
    console.log(`           ${r.reason}`);
  });

  // ═══════════════════════════════════════════
  // AWAKEN AND USE READY CAPABILITIES
  // ═══════════════════════════════════════════
  divider("AWAKENING READY CAPABILITIES");

  const toWake = richSense.filter(r => r.shouldWake);
  console.log(`\n  ${toWake.length} capabilities ready to wake.\n`);

  // AWAKEN: insight-to-seed
  if (richSense.find(r => r.capabilityId === "insight-to-seed" && r.shouldWake)) {
    const awakened = awaken(LATENT_REGISTRY.insightToSeed, "Insights accumulated — ready to become entities");
    console.log();

    const insightList = listInsights();
    if (insightList.length > 0) {
      const seed = use(awakened, insightList[0]);
      if (seed) {
        console.log(`  insight-to-seed produced:\n`);
        console.log(`    Name: "${seed.name}"`);
        console.log(`    Reason: "${seed.reason}"`);
        console.log(`    Opens: "${seed.historyEntry.opens}"`);
      }
    }
  }

  // AWAKEN: history-synthesis
  const completedWithInsight = richEntities.filter(e => e.state === "released" && e.insight);
  if (completedWithInsight.length >= 5) {
    const awakenedSynthesis = awaken(
      LATENT_REGISTRY.historySynthesis,
      `${completedWithInsight.length} completed entities — synthesis meaningful`
    );
    console.log();

    const synthesis = use(awakenedSynthesis, {
      completedEntities: completedWithInsight,
      contextName: "existence-engineering v1",
    });

    if (synthesis) {
      console.log(`  history-synthesis produced:\n`);
      console.log(`    Sources: ${synthesis.sourceCount} completed entities`);
      console.log(`    Pattern: ${synthesis.emergentPattern}`);
      console.log(`    Next gen origin: "${synthesis.nextGenHistory.origin.slice(0, 80)}..."`);
      console.log(`    Opens: "${synthesis.nextGenHistory.opens}"`);
    }
  }

  // SHOW: self-evolution (needs more data — show what it would say)
  divider("SELF-EVOLUTION PROPOSAL (preview — needs 50+ runs)");
  console.log(`\n  Currently dormant — needs ${50 - richBundle.runtimeTraceCount} more runs.`);
  console.log(`  When it wakes, it would analyze:`);
  console.log(`    - Follow-up derivation failures (currently: ${richBundle.runtimeTraceEntries.filter(e => e.summary.includes("could-not-be-derived")).length})`);
  console.log(`    - Unused nodes (would flag nodes never selected)`);
  console.log(`    - Insight patterns (would suggest new node types)`);
  console.log(`    - Failed lineages (would propose recovery paths)`);

  // ═══════════════════════════════════════════
  // THE KEY POINT
  // ═══════════════════════════════════════════
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  THE KEY POINT:\n");
  console.log("  These capabilities existed from the start.");
  console.log("  The code didn't change.");
  console.log("  The conditions changed.");
  console.log();
  console.log("  Like DNA — the genes were always there.");
  console.log("  The environment determined which ones expressed.");
  console.log();
  console.log("  A system with latent capabilities grows into its potential.");
  console.log("  A system without them is always exactly what it was.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main();
