/**
 * EXISTENCE ENGINEERING — LIVING SYSTEM
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: All previous versions had history as optional.
 *         This version makes history the foundation.
 *         Cannot create without origin.
 *         Cannot complete without insight.
 *         Cannot connect without reason.
 * Considered:
 *   - Functional API (considered, not rejected —
 *     class chosen because state accumulates over time)
 *   - Database backend (future direction, not now)
 * Chosen:
 *   Class that enforces history at every gate.
 *   Each method is a gate — pass through with history
 *   or be refused.
 * Opens:
 *   What would this system look like after 10 years
 *   of mandatory history? Would it become navigable
 *   like a well-documented civilization?
 */

import type {
  Entity,
  Relation,
  Signal,
  ActionSource,
  RelationType,
  EntityState,
  SystemObservation,
  EntityCreateParams,
  CompletionParams,
  MandatoryHistory,
  ValidatedInsight,
  ValidatedQuestion,
} from "./types.js";
import { validateReason, validateInsight, validateQuestion } from "./validators.js";
import { SignalFactory } from "./signals.js";

export class LivingSystem {
  private readonly entities: Map<string, Entity> = new Map();
  private readonly allRelations: Relation[] = [];
  private readonly systemSignals: Signal[] = [];
  private readonly signalFactory = new SignalFactory();

  // ─────────────────────────────────────────────
  // CREATE — History required. No exceptions.
  // ─────────────────────────────────────────────

  create(params: EntityCreateParams): Entity {
    const validatedReason = validateReason(params.reason);

    const history: MandatoryHistory = {
      born: new Date().toISOString().split("T")[0],
      ...params.historyEntry,
      evolution: [],
    };

    const birthSignal = this.signalFactory.create(
      "created",
      `"${params.name}" came into existence`,
      { question: `What will "${params.name}" make possible?` }
    );

    const entity: Entity = {
      id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: params.name,
      origin: {
        reason: validatedReason,
        createdAt: new Date(),
        source: params.source ?? "unknown",
        history,
      },
      state: "waiting",
      signals: [birthSignal],
      relations: [],
      energy: 70,
    };

    this.entities.set(entity.id, entity);
    this.systemSignals.push(birthSignal);
    return entity;
  }

  // ─────────────────────────────────────────────
  // PROGRESS — Detect source. Act accordingly.
  // ─────────────────────────────────────────────

  progress(entityId: string, action: string): {
    entity: Entity;
    signal: Signal;
    sourceDetected: ActionSource;
  } {
    const entity = this.getOrThrow(entityId);
    const source = this.detectSource(entity);

    if (source === "fear" && entity.energy < 30) {
      const pauseSignal = this.signalFactory.create(
        "stuck",
        `Paused — fear detected with low energy`,
        { question: "What is the fear protecting? Is it real or habitual?" }
      );
      const updated = this.update(entity, {
        state: "stuck",
        signals: [...entity.signals, pauseSignal],
      });
      return { entity: updated, signal: pauseSignal, sourceDetected: source };
    }

    const signal = this.signalFactory.create("progressed", action);
    const updated = this.update(entity, {
      state: "flowing",
      signals: [...entity.signals, signal],
      energy: Math.max(0, entity.energy - (source === "fear" ? 10 : 5)),
    });

    this.systemSignals.push(signal);
    return { entity: updated, signal, sourceDetected: source };
  }

  // ─────────────────────────────────────────────
  // HANDLE ERROR — Read before suppressing.
  // ─────────────────────────────────────────────

  handleError(entityId: string, errorMeaning: string, question?: string): {
    entity: Entity;
    signal: Signal;
    isStructural: boolean;
    structuralQuestion?: string;
  } {
    const entity = this.getOrThrow(entityId);
    const signal = this.signalFactory.create("error", errorMeaning, { question });
    const reading = this.signalFactory.read(signal);

    const updated = this.update(entity, {
      state: reading.isStructural ? "stuck" : entity.state,
      signals: [...entity.signals, signal],
      energy: Math.max(0, entity.energy - 10),
    });

    this.systemSignals.push(signal);
    return {
      entity: updated,
      signal,
      isStructural: reading.isStructural,
      structuralQuestion: reading.isStructural
        ? signal.question
        : undefined,
    };
  }

  // ─────────────────────────────────────────────
  // COMPLETE — Insight required. Seed required.
  // The gate cannot be bypassed.
  // ─────────────────────────────────────────────

  complete(entityId: string, params: CompletionParams): {
    entity: Entity & {
      insight: ValidatedInsight;
      seedForNext: ValidatedQuestion;
    };
    whatBecomesNext: string;
  } {
    const entity = this.getOrThrow(entityId);

    // Both will throw if invalid
    const insight = validateInsight(params.insight);
    const seed = validateQuestion(params.seedQuestion);

    const daysAlive = Math.round(
      (Date.now() - entity.origin.createdAt.getTime()) / 86400000
    );

    const completionSignal = this.signalFactory.create(
      "completed",
      `"${entity.name}" completed after ${daysAlive} day(s)`,
      {
        question: params.seedQuestion,
        payload: { insight, daysAlive },
      }
    );

    const completed = this.update(entity, {
      state: "released",
      signals: [...entity.signals, completionSignal],
      insight,
      energy: Math.min(100, entity.energy + 20),
    }) as Entity & { insight: ValidatedInsight; seedForNext: ValidatedQuestion };

    // Attach seed to completed entity
    Object.assign(completed, { seedForNext: seed });

    this.systemSignals.push(completionSignal);

    const enabled = this.allRelations.filter(
      r => r.fromId === entityId && r.type === "enables"
    );

    const whatBecomesNext = enabled.length > 0
      ? `Now enabled: ${enabled.map(r => r.meaning).join("; ")}`
      : `Insight preserved: "${insight}"`;

    return { entity: completed, whatBecomesNext };
  }

  // ─────────────────────────────────────────────
  // CONNECT — Connection requires a reason.
  // ─────────────────────────────────────────────

  connect(
    fromId: string,
    toId: string,
    type: RelationType,
    connectionReason: string
  ): Relation {
    const from = this.getOrThrow(fromId);
    const to = this.getOrThrow(toId);
    const validatedReason = validateReason(connectionReason);

    const meanings: Record<RelationType, string> = {
      blocks: `"${from.name}" cannot flow until "${to.name}" resolves`,
      enables: `"${from.name}" flowing makes "${to.name}" possible`,
      resonates: `"${from.name}" and "${to.name}": different, same direction`,
      transforms: `Contact between "${from.name}" and "${to.name}" changes both`,
    };

    const relation: Relation = {
      id: `rel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fromId,
      toId,
      type,
      meaning: meanings[type],
      strength: 0.5,
      lastActive: new Date(),
      connectionReason: validatedReason,
    };

    this.allRelations.push(relation);
    this.update(from, { relations: [...from.relations, relation] });

    if (type === "resonates") {
      const resonanceSignal = this.signalFactory.create(
        "resonated",
        `"${from.name}" resonates with "${to.name}"`,
        { question: "What made this resonance possible? How can it continue?" }
      );
      this.systemSignals.push(resonanceSignal);
    }

    return relation;
  }

  // ─────────────────────────────────────────────
  // OBSERVE — The system reading itself.
  // ─────────────────────────────────────────────

  observe(): SystemObservation {
    const all = [...this.entities.values()];
    const flowing = all.filter(e => e.state === "flowing").length;
    const stuck = all.filter(e => e.state === "stuck").length;
    const released = all.filter(e => e.state === "released").length;

    // Thermal death check
    const states = new Set(all.map(e => e.state));
    const thermalWarning = states.size === 1 && all.length > 2
      ? `All entities in state "${[...states][0]}". No difference — no flow.`
      : undefined;

    // Loop detection
    const recentQ = this.systemSignals
      .filter(s => s.question)
      .map(s => s.question as string)
      .slice(-10);
    const qCounts = recentQ.reduce((acc, q) => {
      acc[q] = (acc[q] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const looping = Object.values(qCounts).some(c => c >= 3);

    let health: SystemObservation["health"] = "alive";
    if (thermalWarning) health = "thermal_death";
    else if (looping) health = "looping";
    else if (stuck > flowing) health = "stagnating";

    const openQuestions = [...new Set(
      this.systemSignals
        .filter(s => s.question)
        .map(s => s.question as string)
        .slice(-6)
    )];

    const preservedInsights = all
      .filter(e => e.insight)
      .map(e => ({
        name: e.name,
        insight: e.insight as string,
        seedForNext: (e as any).seedForNext as string | undefined,
      }));

    const historyDepth = this.systemSignals.length +
      all.reduce((sum, e) =>
        sum + e.origin.history.evolution.length, 0
      );

    const summary =
      health === "alive"
        ? `System alive. ${flowing} flowing, ${stuck} stuck, ${released} completed.`
        : health === "stagnating"
        ? `Stagnating. ${stuck} stuck > ${flowing} flowing.`
        : health === "looping"
        ? `Loop detected.`
        : thermalWarning ?? "Warning";

    return {
      health,
      summary,
      counts: { total: all.length, flowing, stuck, released },
      openQuestions,
      preservedInsights,
      historyDepth,
      thermalWarning,
    };
  }

  // ─────────────────────────────────────────────
  // PRINT HISTORY — Readable accumulated knowledge.
  // ─────────────────────────────────────────────

  printHistory(): void {
    const all = [...this.entities.values()];
    console.log("\n  ── Accumulated History ──\n");
    all.forEach(e => {
      console.log(`  ◈ "${e.name}" [born: ${e.origin.history.born}]`);
      console.log(`    Why it exists: ${e.origin.history.origin}`);
      console.log(`    What was chosen: ${e.origin.history.chosen}`);
      console.log(`    What it opens: ${e.origin.history.opens}`);
      if (e.insight) {
        console.log(`    Insight preserved: "${e.insight}"`);
      }
      console.log();
    });
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): Entity[] {
    return [...this.entities.values()];
  }

  // ─────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────

  private getOrThrow(id: string): Entity {
    const entity = this.entities.get(id);
    if (!entity) throw new Error(`[existence-engineering] Entity "${id}" not found`);
    return entity;
  }

  private update(
    entity: Entity,
    changes: Partial<{
      state: EntityState;
      signals: Signal[];
      relations: Relation[];
      energy: number;
      insight: ValidatedInsight;
    }>
  ): Entity {
    const updated: Entity = { ...entity, ...changes };
    this.entities.set(entity.id, updated);
    return updated;
  }

  private detectSource(entity: Entity): ActionSource {
    const recent = entity.signals.slice(-5);
    const fear = recent.filter(s =>
      (s.type === "error" && !s.question) ||
      (s.type === "stuck" && s.repeatCount > 2 && !s.question)
    ).length;
    const desire = recent.filter(s =>
      s.type === "resonated" || s.question !== undefined
    ).length;
    if (fear > desire + 1) return "fear";
    if (desire > 0) return "desire";
    return "unknown";
  }
}
