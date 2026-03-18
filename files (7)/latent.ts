/**
 * latent.ts — LATENT CAPABILITIES
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Most code has only what it needs right now.
 *   But living things carry more than they currently use.
 *   DNA has genes that don't express until conditions change.
 *   This file holds capabilities that exist but are not yet connected.
 *   They are real, working code — not comments, not TODOs.
 *   They wait. When the system needs them, they wake.
 *
 * Considered:
 *   - Write them when needed (rejected: "when needed" is always late)
 *   - Keep in comments (rejected: comments are not code — they decay)
 *   - TODOs (rejected: TODOs are promises that don't compile)
 * Chosen:
 *   Real working functions, marked as LATENT.
 *   They compile. They run. They wait.
 *   An AI reading this code can see what is possible
 *   and choose to activate when the moment is right.
 *
 * Opens:
 *   What would a system look like that monitors its own
 *   latent capabilities and surfaces them at the right moment?
 *   Not AI deciding — but the system itself sensing
 *   when a latent capability would serve the current state.
 */

import type {
  Entity, EntitySignal, EntityCreateParams,
  ExistenceInsight, SupportTraceBundle, SupportTraceLineage,
  ValidatedInsight, ValidatedQuestion, MandatoryHistory,
} from "../core/types.js";
import {
  validateReason, validateInsight, validateQuestion,
  listInsights, detectLoop,
} from "../core/foundation.js";

// ─────────────────────────────────────────────
// LATENT MARKER
//
// Every latent capability carries:
// - why it was built but not activated
// - what condition would wake it
// - what it does when awake
// ─────────────────────────────────────────────

export interface LatentCapability<TInput, TOutput> {
  readonly id: string;
  readonly dormantReason: string;    // Why not activated yet
  readonly awakensWhen: string;      // The condition that wakes it
  readonly description: string;      // What it does when awake
  readonly fn: (input: TInput) => TOutput;
  isAwake: boolean;
}

export function createLatent<TInput, TOutput>(params: {
  id: string;
  dormantReason: string;
  awakensWhen: string;
  description: string;
  fn: (input: TInput) => TOutput;
}): LatentCapability<TInput, TOutput> {
  return { ...params, isAwake: false };
}

export function awaken<TInput, TOutput>(
  capability: LatentCapability<TInput, TOutput>,
  reason: string,
): LatentCapability<TInput, TOutput> {
  console.log(`  ◎ Awakening: "${capability.id}"`);
  console.log(`    Reason: ${reason}`);
  console.log(`    Was dormant because: ${capability.dormantReason}`);
  return { ...capability, isAwake: true };
}

export function use<TInput, TOutput>(
  capability: LatentCapability<TInput, TOutput>,
  input: TInput,
): TOutput | null {
  if (!capability.isAwake) {
    console.log(`  ◌ "${capability.id}" is dormant. Awakens when: ${capability.awakensWhen}`);
    return null;
  }
  return capability.fn(input);
}

// ─────────────────────────────────────────────
// LATENT CAPABILITY 1: INSIGHT → SEED
//
// Dormant because: No entity system connected to support yet.
// Awakens when: An insight from support execution
//   should generate a new entity automatically.
//
// What it does:
//   Takes an insight from a completed support request
//   and seeds a new entity from it.
//   The system learns from its own execution.
// ─────────────────────────────────────────────

export const insightToSeed = createLatent<ExistenceInsight, EntityCreateParams>({
  id: "insight-to-seed",
  dormantReason: "Entity system and support system not yet wired together at runtime.",
  awakensWhen: "When support execution produces an insight that should become a living entity — tracked, evolved, completed.",
  description: "Converts a support insight into an entity seed. The system's learning becomes a new living thing.",
  fn: (insight: ExistenceInsight): EntityCreateParams => ({
    name: `Insight: ${insight.insight.slice(0, 40)}...`,
    reason: `Born from execution of "${insight.nodeId}" — this insight deserves to live and evolve.`,
    source: "desire",
    historyEntry: {
      origin: `Seeded automatically from insight recorded at ${insight.recordedAt}. Node: ${insight.nodeId}.`,
      considered: [
        "Let insight remain as text only (rejected: text doesn't evolve, doesn't track, doesn't complete)",
      ],
      chosen: "Make the insight a living entity — it can be progressed, connected, completed, and preserved.",
      opens: insight.seedQuestion,
    },
  }),
});

// ─────────────────────────────────────────────
// LATENT CAPABILITY 2: QUESTION CONVERGENCE DETECTOR
//
// Dormant because: Needs enough accumulated questions
//   to find meaningful patterns. Too early to activate.
//
// Awakens when: 10+ unique questions have accumulated
//   across multiple runs. Pattern detection becomes meaningful.
//
// What it does:
//   Finds questions that appear across different lineages
//   and flags them as structural questions —
//   questions the system keeps asking regardless of context.
//   These are the questions that need architectural answers.
// ─────────────────────────────────────────────

export const questionConvergence = createLatent<
  { lineages: SupportTraceLineage[]; threshold: number },
  { structuralQuestions: string[]; convergenceMap: Map<string, string[]> }
>({
  id: "question-convergence",
  dormantReason: "Need 10+ accumulated questions across multiple runs to find meaningful patterns.",
  awakensWhen: "When total unique questions across all lineages exceeds threshold (default: 10).",
  description: "Finds questions that appear across different lineages — these are structural questions that need architectural answers, not just situational ones.",
  fn: ({ lineages, threshold }) => {
    const questionToLineages = new Map<string, string[]>();

    lineages.forEach(l => {
      l.openQuestions.forEach(q => {
        const existing = questionToLineages.get(q) ?? [];
        if (!existing.includes(l.rootRequestId)) {
          questionToLineages.set(q, [...existing, l.rootRequestId]);
        }
      });
    });

    const structuralQuestions = [...questionToLineages.entries()]
      .filter(([_, lineageIds]) => lineageIds.length >= threshold)
      .map(([q]) => q);

    return { structuralQuestions, convergenceMap: questionToLineages };
  },
});

// ─────────────────────────────────────────────
// LATENT CAPABILITY 3: SELF-EVOLUTION PROPOSAL
//
// Dormant because: System needs real production data first.
//   Proposing evolution from test runs is premature.
//
// Awakens when: System has run 50+ requests,
//   has 5+ preserved insights, and has detected
//   at least one structural question pattern.
//
// What it does:
//   Analyzes accumulated history and proposes
//   new nodes, new connections, or new capabilities
//   based on what the system has learned about itself.
//   The system reads its own history and suggests
//   what it should become next.
// ─────────────────────────────────────────────

export interface EvolutionProposal {
  readonly type: "new_node" | "new_connection" | "new_capability" | "remove_unused";
  readonly proposal: string;
  readonly basedOn: string[];   // Which insights/questions led to this
  readonly opens: string;
  readonly urgency: "when_ready" | "soon" | "consider";
}

export const selfEvolutionProposal = createLatent<
  { bundle: SupportTraceBundle; minRuns: number },
  EvolutionProposal[]
>({
  id: "self-evolution-proposal",
  dormantReason: "Need real production data. Test run proposals would be noise, not signal.",
  awakensWhen: "50+ runtime executions, 5+ preserved insights, at least one structural question detected.",
  description: "Reads the system's own accumulated history and proposes how it should evolve. The system becomes a participant in its own design.",
  fn: ({ bundle }) => {
    const proposals: EvolutionProposal[] = [];

    // If follow-up-could-not-be-derived appears often —
    // the system needs new request type mappings
    const underivable = bundle.runtimeTraceEntries
      .filter(e => e.summary.includes("could-not-be-derived")).length;
    if (underivable >= 3) {
      proposals.push({
        type: "new_capability",
        proposal: `Add explicit follow-up mappings for request types that repeatedly fail derivation. Found ${underivable} cases.`,
        basedOn: bundle.openQuestions.filter(q => q.includes("mapping")),
        opens: "Which request type transitions are most commonly needed but not yet mapped?",
        urgency: "soon",
      });
    }

    // If insights exist — they might suggest new node types
    bundle.insights.forEach(insight => {
      if (insight.insight.includes("pattern") || insight.insight.includes("structural")) {
        proposals.push({
          type: "new_node",
          proposal: `Insight from "${insight.nodeId}" suggests a pattern-detection node may be needed: "${insight.insight.slice(0, 60)}..."`,
          basedOn: [insight.insight],
          opens: insight.seedQuestion,
          urgency: "consider",
        });
      }
    });

    // If some lineages always fail — maybe a new recovery path is needed
    const failedLineages = bundle.lineages.filter(l => l.failed);
    if (failedLineages.length >= 2) {
      proposals.push({
        type: "new_connection",
        proposal: `${failedLineages.length} lineages failed. A dedicated recovery path node may reduce repeated failure.`,
        basedOn: failedLineages.map(l => l.healthSummary),
        opens: "What pattern do failed lineages share? Is there a common root cause?",
        urgency: "soon",
      });
    }

    // If a node is never selected — is it needed?
    const usedNodes = new Set(bundle.runtimeTraceEntries.map(e => e.responderId).filter(Boolean));
    bundle.nodeSnapshots.forEach(n => {
      if (!usedNodes.has(n.nodeId) && bundle.runtimeTraceCount > 20) {
        proposals.push({
          type: "remove_unused",
          proposal: `"${n.nodeId}" was never selected in ${bundle.runtimeTraceCount} executions. Re-evaluate if it's needed.`,
          basedOn: [`Node exists but never used: ${n.existenceReason}`],
          opens: `Is "${n.nodeId}" unnecessary, or just not yet triggered by current request types?`,
          urgency: "consider",
        });
      }
    });

    return proposals;
  },
});

// ─────────────────────────────────────────────
// LATENT CAPABILITY 4: ENTITY ENERGY DIFFUSION
//
// Dormant because: Requires multiple entities to be in
//   "flowing" state simultaneously. Rare in single runs.
//
// Awakens when: 3+ entities are flowing simultaneously
//   and one has energy < 20 while another has > 80.
//
// What it does:
//   Transfers energy between entities based on their
//   relation types. Enables entities share energy with
//   the blocked entities they enable.
//   High-energy entities help low-energy ones they're connected to.
// ─────────────────────────────────────────────

export interface EnergyDiffusionResult {
  readonly transfers: Array<{
    fromId: string; toId: string;
    amount: number; reason: string;
  }>;
  readonly updatedEntities: Map<string, { energy: number }>;
}

export const energyDiffusion = createLatent<
  { entities: Entity[] },
  EnergyDiffusionResult
>({
  id: "energy-diffusion",
  dormantReason: "Requires multiple simultaneously flowing entities. Single-run demos don't trigger this.",
  awakensWhen: "3+ entities flowing, with energy spread > 60 (one below 20, another above 80).",
  description: "Transfers energy between connected entities. High-energy entities that 'enable' low-energy ones share their surplus. The system self-balances.",
  fn: ({ entities }) => {
    const transfers: EnergyDiffusionResult["transfers"] = [];
    const updatedEntities = new Map<string, { energy: number }>();

    entities.forEach(e => updatedEntities.set(e.id, { energy: e.energy }));

    entities.forEach(from => {
      if (from.energy < 30) return; // Can't give what you don't have

      from.relations
        .filter(r => r.type === "enables" && r.strength > 0.4)
        .forEach(rel => {
          const to = entities.find(e => e.id === rel.toId);
          if (!to || to.energy > 60) return;

          const transfer = Math.min(
            Math.floor((from.energy - 30) * 0.3),
            60 - to.energy,
          );
          if (transfer <= 0) return;

          const fromCurrent = updatedEntities.get(from.id)!;
          const toCurrent = updatedEntities.get(to.id)!;

          updatedEntities.set(from.id, { energy: fromCurrent.energy - transfer });
          updatedEntities.set(to.id, { energy: toCurrent.energy + transfer });

          transfers.push({
            fromId: from.id, toId: to.id,
            amount: transfer,
            reason: `"${from.name}" enables "${to.name}" — sharing ${transfer} energy`,
          });
        });
    });

    return { transfers, updatedEntities };
  },
});

// ─────────────────────────────────────────────
// LATENT CAPABILITY 5: HISTORY SYNTHESIS
//
// Dormant because: Needs histories from multiple entities
//   that have completed their lifecycle.
//   Meaningful synthesis requires at least 5 completions.
//
// Awakens when: 5+ entities have completed with insights.
//
// What it does:
//   Reads all completed entity insights and synthesizes
//   a new MandatoryHistory from the patterns.
//   Like a civilization that writes its own history
//   from the accumulated experiences of its members.
//   The synthesized history can seed the next generation.
// ─────────────────────────────────────────────

export interface SynthesizedHistory {
  readonly synthesizedAt: string;
  readonly sourceCount: number;
  readonly emergentPattern: string;
  readonly nextGenHistory: Omit<MandatoryHistory, "born" | "evolution">;
}

export const historySynthesis = createLatent<
  { completedEntities: Entity[]; contextName: string },
  SynthesizedHistory
>({
  id: "history-synthesis",
  dormantReason: "Needs 5+ completed entities with insights. Synthesis from fewer insights creates noise.",
  awakensWhen: "5+ entities have completed with preserved insights.",
  description: "Synthesizes a new MandatoryHistory from the accumulated insights of completed entities. The system writes its own history. This history can seed the next generation — the system reproduces by learning.",
  fn: ({ completedEntities, contextName }) => {
    const insights = completedEntities
      .filter(e => e.insight && e.state === "released")
      .map(e => e.insight as string);

    // Find the most common themes
    const words = insights.join(" ").toLowerCase().split(/\s+/);
    const wordCount = words.reduce((acc, w) => {
      if (w.length > 4) acc[w] = (acc[w] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([w]) => w);

    const emergentPattern = `Across ${insights.length} completions, the recurring themes are: ${topWords.join(", ")}.`;

    // Collect the opens questions as considered alternatives
    const opensQuestions = completedEntities
      .map(e => {
        const q = (e as any).seedForNext as string | undefined;
        return q ? `${e.name}: ${q}` : null;
      })
      .filter(Boolean) as string[];

    const considered: [string, ...string[]] = opensQuestions.length > 0
      ? [opensQuestions[0], ...opensQuestions.slice(1)]
      : ["Previous generation explored without recording alternatives (lesson: always record)"];

    return {
      synthesizedAt: new Date().toISOString(),
      sourceCount: insights.length,
      emergentPattern,
      nextGenHistory: {
        origin: `Synthesized from ${insights.length} completed entities in "${contextName}". ${emergentPattern}`,
        considered,
        chosen: `The patterns that persisted across all completions: ${insights.slice(0, 2).map(i => i.slice(0, 40)).join("; ")}`,
        opens: `If the next generation starts with this synthesized history — what new patterns will emerge that this generation could not produce?`,
      },
    };
  },
});

// ─────────────────────────────────────────────
// LATENT REGISTRY
// All dormant capabilities — visible, queryable, awakeable.
// ─────────────────────────────────────────────

export const LATENT_REGISTRY = {
  insightToSeed,
  questionConvergence,
  selfEvolutionProposal,
  energyDiffusion,
  historySynthesis,
} as const;

export type LatentCapabilityId = keyof typeof LATENT_REGISTRY;

export function listLatentCapabilities(): Array<{
  id: string; isAwake: boolean; awakensWhen: string; dormantReason: string;
}> {
  return Object.values(LATENT_REGISTRY).map(c => ({
    id: c.id, isAwake: c.isAwake,
    awakensWhen: c.awakensWhen, dormantReason: c.dormantReason,
  }));
}

/**
 * AUTO-SENSE
 *
 * The system reads its own current state
 * and determines which latent capabilities should wake.
 *
 * Not forced. Sensed.
 * Like DNA expressing genes when conditions are right.
 */
export function autoSense(params: {
  bundle: SupportTraceBundle;
  entities?: Entity[];
}): Array<{ capabilityId: string; shouldWake: boolean; reason: string }> {
  const results: Array<{ capabilityId: string; shouldWake: boolean; reason: string }> = [];
  const { bundle, entities = [] } = params;

  // insight-to-seed: wake if there are unprocessed insights
  const hasInsights = bundle.insightCount > 0;
  results.push({
    capabilityId: "insight-to-seed",
    shouldWake: hasInsights,
    reason: hasInsights
      ? `${bundle.insightCount} insight(s) accumulated — ready to seed entities`
      : "No insights yet",
  });

  // question-convergence: wake if 10+ questions
  const questionCount = bundle.openQuestions.length;
  results.push({
    capabilityId: "question-convergence",
    shouldWake: questionCount >= 10,
    reason: questionCount >= 10
      ? `${questionCount} questions accumulated — pattern detection meaningful`
      : `${questionCount}/10 questions needed`,
  });

  // self-evolution-proposal: wake if 50+ runs + 5+ insights
  const hasEnoughData = bundle.runtimeTraceCount >= 50 && bundle.insightCount >= 5;
  results.push({
    capabilityId: "self-evolution-proposal",
    shouldWake: hasEnoughData,
    reason: hasEnoughData
      ? "Enough production data for meaningful evolution proposals"
      : `${bundle.runtimeTraceCount}/50 runs, ${bundle.insightCount}/5 insights needed`,
  });

  // energy-diffusion: wake if 3+ flowing entities with spread > 60
  const flowing = entities.filter(e => e.state === "flowing");
  const maxE = flowing.length > 0 ? Math.max(...flowing.map(e => e.energy)) : 0;
  const minE = flowing.length > 0 ? Math.min(...flowing.map(e => e.energy)) : 0;
  const spread = maxE - minE;
  results.push({
    capabilityId: "energy-diffusion",
    shouldWake: flowing.length >= 3 && spread > 60,
    reason: flowing.length >= 3 && spread > 60
      ? `${flowing.length} flowing entities, energy spread ${spread} — diffusion beneficial`
      : `${flowing.length}/3 flowing entities, spread ${spread}/60 needed`,
  });

  // history-synthesis: wake if 5+ completed with insights
  const completedWithInsight = entities.filter(e => e.state === "released" && e.insight).length;
  results.push({
    capabilityId: "history-synthesis",
    shouldWake: completedWithInsight >= 5,
    reason: completedWithInsight >= 5
      ? `${completedWithInsight} completed entities with insights — synthesis meaningful`
      : `${completedWithInsight}/5 completed entities with insights needed`,
  });

  return results;
}
