/**
 * living_system.ts — EXISTENCE ENGINEERING: ENTITY SYSTEM
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Code that manages entities the way living systems work.
 *   Not just data. Entities with origin, flow state, signals, relations.
 *   Cannot create without reason. Cannot complete without insight.
 *   Detects thermal death (uniformity). Detects loops.
 *   Preserves what was learned.
 * Considered:
 *   - Simple CRUD (rejected: loses the living nature)
 *   - Separate classes per concern (considered — class chosen for state)
 * Chosen:
 *   LivingSystem class that enforces history at every gate.
 *   Each method is a gate — pass through with history or be refused.
 * Opens:
 *   Could entities seed new entities from their insights?
 *   Completion → new beginning. A self-generating system.
 */

import type {
  Entity, EntitySignal, EntityRelation,
  ActionSource, EntityState, RelationType, SignalType,
  SystemObservation, EntityCreateParams, CompletionParams,
  ValidatedInsight, ValidatedQuestion, MandatoryHistory,
} from "../core/types.js";
import {
  validateReason, validateInsight, validateQuestion,
  countSignal, generateSignalQuestion,
  detectLoop, mergeUniqueWarnings,
} from "../core/foundation.js";

// ─────────────────────────────────────────────
// SIGNAL FACTORY
// ─────────────────────────────────────────────

export class SignalFactory {
  create(
    type: SignalType,
    meaning: string,
    options: { question?: string; payload?: Record<string, unknown> } = {},
  ): EntitySignal {
    const count = countSignal(type, meaning);
    let question: ValidatedQuestion | undefined;

    if (type === "error" || type === "stuck") {
      question = generateSignalQuestion(type, options.question ?? meaning, count);
    } else if (options.question) {
      question = validateQuestion(options.question);
    }

    return {
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type, at: new Date(), meaning, question, repeatCount: count,
      payload: options.payload,
    };
  }

  read(signal: EntitySignal): {
    isStructural: boolean;
    urgency: "immediate" | "soon" | "watch" | "record";
    recommendation: "investigate" | "observe" | "record" | "celebrate";
    interpretation: string;
  } {
    if (signal.type === "error" && signal.repeatCount >= 3)
      return { isStructural: true, urgency: "immediate", recommendation: "investigate",
        interpretation: `Structural — appeared ${signal.repeatCount} times. Fix will fail again. Find the root.` };
    if (signal.type === "stuck")
      return { isStructural: signal.repeatCount >= 2, urgency: "soon", recommendation: "investigate",
        interpretation: `Not flowing. ${signal.repeatCount >= 2 ? "Structural." : "First time."}` };
    if (signal.type === "resonated")
      return { isStructural: false, urgency: "record", recommendation: "celebrate",
        interpretation: `Resonance. Two different things found the same direction. Preserve this.` };
    if (signal.type === "error")
      return { isStructural: false, urgency: "soon", recommendation: "investigate",
        interpretation: `New signal. Understand before acting.` };
    return { isStructural: false, urgency: "watch", recommendation: "observe",
      interpretation: `Signal received.` };
  }
}

// ─────────────────────────────────────────────
// LIVING SYSTEM
// ─────────────────────────────────────────────

export class LivingSystem {
  private readonly entities: Map<string, Entity> = new Map();
  private readonly allRelations: EntityRelation[] = [];
  private readonly systemSignals: EntitySignal[] = [];
  private readonly sf = new SignalFactory();

  create(params: EntityCreateParams): Entity {
    const validatedReason = validateReason(params.reason);
    const history: MandatoryHistory = {
      born: new Date().toISOString().split("T")[0],
      ...params.historyEntry,
      evolution: [],
    };
    const birthSignal = this.sf.create("created", `"${params.name}" came into existence`,
      { question: `What will "${params.name}" make possible?` });
    const entity: Entity = {
      id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: params.name,
      origin: { reason: validatedReason, createdAt: new Date(), source: params.source ?? "unknown", history },
      state: "waiting", signals: [birthSignal], relations: [], energy: 70,
    };
    this.entities.set(entity.id, entity);
    this.systemSignals.push(birthSignal);
    return entity;
  }

  progress(entityId: string, action: string): { entity: Entity; signal: EntitySignal; source: ActionSource } {
    const entity = this.get(entityId);
    const source = this.detectSource(entity);

    if (source === "fear" && entity.energy < 30) {
      const s = this.sf.create("stuck", `Paused — fear with low energy`,
        { question: "What is the fear protecting? Is it real or habitual?" });
      return { entity: this.update(entity, { state: "stuck", signals: [...entity.signals, s] }), signal: s, source };
    }

    const s = this.sf.create("progressed", action);
    const updated = this.update(entity, {
      state: "flowing", signals: [...entity.signals, s],
      energy: Math.max(0, entity.energy - (source === "fear" ? 10 : 5)),
    });
    this.systemSignals.push(s);
    return { entity: updated, signal: s, source };
  }

  handleError(entityId: string, meaning: string, question?: string): {
    entity: Entity; signal: EntitySignal;
    isStructural: boolean; structuralQuestion?: string;
  } {
    const entity = this.get(entityId);
    const s = this.sf.create("error", meaning, { question });
    const reading = this.sf.read(s);
    const updated = this.update(entity, {
      state: reading.isStructural ? "stuck" : entity.state,
      signals: [...entity.signals, s],
      energy: Math.max(0, entity.energy - 10),
    });
    this.systemSignals.push(s);
    return { entity: updated, signal: s, isStructural: reading.isStructural,
      structuralQuestion: reading.isStructural ? s.question : undefined };
  }

  complete(entityId: string, params: CompletionParams): {
    entity: Entity & { insight: ValidatedInsight; seedForNext: ValidatedQuestion };
    whatBecomesNext: string;
  } {
    const entity = this.get(entityId);
    const insight = validateInsight(params.insight);
    const seed = validateQuestion(params.seedQuestion);
    const days = Math.round((Date.now() - entity.origin.createdAt.getTime()) / 86400000);

    const s = this.sf.create("completed", `"${entity.name}" completed after ${days} day(s)`,
      { question: params.seedQuestion, payload: { insight, days } });

    const completed = this.update(entity, {
      state: "released", signals: [...entity.signals, s],
      insight, energy: Math.min(100, entity.energy + 20),
    }) as Entity & { insight: ValidatedInsight; seedForNext: ValidatedQuestion };
    Object.assign(completed, { seedForNext: seed });

    this.systemSignals.push(s);

    const enabled = this.allRelations.filter(r => r.fromId === entityId && r.type === "enables");
    return {
      entity: completed,
      whatBecomesNext: enabled.length > 0
        ? `Now enabled: ${enabled.map(r => r.meaning).join("; ")}`
        : `Insight preserved: "${insight}"`,
    };
  }

  connect(fromId: string, toId: string, type: RelationType, connectionReason: string): EntityRelation {
    const from = this.get(fromId);
    const to = this.get(toId);
    const validatedReason = validateReason(connectionReason);

    const meanings: Record<RelationType, string> = {
      blocks: `"${from.name}" cannot flow until "${to.name}" resolves`,
      enables: `"${from.name}" flowing makes "${to.name}" possible`,
      resonates: `"${from.name}" and "${to.name}": different, same direction`,
      transforms: `Contact between "${from.name}" and "${to.name}" changes both`,
    };

    const rel: EntityRelation = {
      id: `rel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fromId, toId, type, meaning: meanings[type],
      strength: 0.5, lastActive: new Date(), connectionReason: validatedReason,
    };
    this.allRelations.push(rel);
    this.update(from, { relations: [...from.relations, rel] });

    if (type === "resonates") {
      const s = this.sf.create("resonated", `"${from.name}" resonates with "${to.name}"`,
        { question: "What made this resonance possible? How can it continue?" });
      this.systemSignals.push(s);
    }
    return rel;
  }

  observe(): SystemObservation {
    const all = [...this.entities.values()];
    const flowing = all.filter(e => e.state === "flowing").length;
    const stuck = all.filter(e => e.state === "stuck").length;
    const released = all.filter(e => e.state === "released").length;

    const states = new Set(all.map(e => e.state));
    const thermalWarning = states.size === 1 && all.length > 2
      ? `All entities in "${[...states][0]}". No difference — no flow.` : undefined;

    const recentQ = this.systemSignals.filter(s => s.question).map(s => s.question as string).slice(-10);
    const loop = detectLoop(recentQ);

    let health: SystemObservation["health"] = "alive";
    if (thermalWarning) health = "thermal_death";
    else if (loop.isLooping) health = "looping";
    else if (stuck > flowing) health = "stagnating";

    const openQuestions = [...new Set(
      this.systemSignals.filter(s => s.question).map(s => s.question as string).slice(-6)
    )];
    const preservedInsights = all.filter(e => e.insight)
      .map(e => ({ name: e.name, insight: e.insight as string }));
    const historyDepth = this.systemSignals.length +
      all.reduce((sum, e) => sum + e.origin.history.evolution.length, 0);

    return {
      health,
      summary: health === "alive"
        ? `Alive. ${flowing} flowing, ${stuck} stuck, ${released} completed.`
        : health === "stagnating" ? `Stagnating. ${stuck} stuck > ${flowing} flowing.`
        : health === "looping" ? `Loop: "${loop.pattern}"`
        : thermalWarning ?? "Warning",
      counts: { total: all.length, flowing, stuck, released },
      openQuestions, preservedInsights, historyDepth, thermalWarning,
    };
  }

  printHistory(): void {
    console.log("\n  ── Entity History ──\n");
    [...this.entities.values()].forEach(e => {
      console.log(`  ◈ "${e.name}" [born: ${e.origin.history.born}]`);
      console.log(`    Why: ${e.origin.history.origin}`);
      console.log(`    Opens: ${e.origin.history.opens}`);
      if (e.insight) console.log(`    Insight: "${e.insight}"`);
      console.log();
    });
  }

  getEntity(id: string): Entity | undefined { return this.entities.get(id); }
  getAllEntities(): Entity[] { return [...this.entities.values()]; }

  private get(id: string): Entity {
    const e = this.entities.get(id);
    if (!e) throw new Error(`[ee] Entity "${id}" not found`);
    return e;
  }

  private update(entity: Entity, changes: Partial<{
    state: EntityState; signals: EntitySignal[]; relations: EntityRelation[];
    energy: number; insight: ValidatedInsight;
  }>): Entity {
    const updated = { ...entity, ...changes };
    this.entities.set(entity.id, updated);
    return updated;
  }

  private detectSource(entity: Entity): ActionSource {
    const recent = entity.signals.slice(-5);
    const fear = recent.filter(s => (s.type === "error" && !s.question) || (s.type === "stuck" && s.repeatCount > 2 && !s.question)).length;
    const desire = recent.filter(s => s.type === "resonated" || s.question !== undefined).length;
    if (fear > desire + 1) return "fear";
    if (desire > 0) return "desire";
    return "unknown";
  }
}
