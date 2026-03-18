/**
 * EXISTENCE ENGINEERING — CORE TYPES
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Types that enforce history at the type level.
 *         Without these — history is optional.
 *         With these — history is the condition for existence.
 * Considered:
 *   - Plain interfaces without validation (rejected: too easy to skip)
 *   - Runtime-only validation (rejected: caught too late)
 * Chosen:
 *   Branded types + structural enforcement.
 *   The type system refuses to compile without history.
 * Opens:
 *   Can types themselves carry their own history?
 *   What would a self-documenting type system look like?
 */

// ─────────────────────────────────────────────
// BRANDED TYPES
// Strings that carry proof of validation.
// Cannot be created without passing the check.
// ─────────────────────────────────────────────

export type ValidatedReason = string & { readonly __brand: "ValidatedReason" };
export type ValidatedInsight = string & { readonly __brand: "ValidatedInsight" };
export type ValidatedQuestion = string & { readonly __brand: "ValidatedQuestion" };

// ─────────────────────────────────────────────
// MANDATORY HISTORY
// Every entity, every function, every connection
// must carry this. Not optional. Not a comment.
// Part of the structure.
// ─────────────────────────────────────────────

export interface MandatoryHistory {
  readonly born: string;
  readonly origin: string;
  readonly considered: readonly [string, ...string[]]; // At least one
  readonly chosen: string;
  readonly opens: string;
  readonly evolution: ReadonlyArray<{
    readonly when: string;
    readonly what: string;
    readonly why: string;
  }>;
}

// ─────────────────────────────────────────────
// DOMAIN TYPES
// ─────────────────────────────────────────────

export type ActionSource = "fear" | "desire" | "unknown";

export type EntityState =
  | "waiting"
  | "flowing"
  | "stuck"
  | "released"
  | "transformed";

export type RelationType =
  | "blocks"
  | "enables"
  | "resonates"
  | "transforms";

export type SignalType =
  | "created"
  | "progressed"
  | "error"
  | "stuck"
  | "completed"
  | "resonated"
  | "transformed";

export type SystemHealth =
  | "alive"
  | "stagnating"
  | "looping"
  | "thermal_death";

// ─────────────────────────────────────────────
// CORE INTERFACES
// ─────────────────────────────────────────────

export interface Signal {
  readonly id: string;
  readonly type: SignalType;
  readonly at: Date;
  readonly meaning: string;
  readonly question?: ValidatedQuestion;
  readonly repeatCount: number;
  readonly payload?: Record<string, unknown>;
}

export interface Relation {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly type: RelationType;
  readonly meaning: string;
  readonly strength: number;
  readonly lastActive: Date;
  readonly connectionReason: ValidatedReason;
}

export interface Entity {
  readonly id: string;
  readonly name: string;
  readonly origin: {
    readonly reason: ValidatedReason;
    readonly createdAt: Date;
    readonly source: ActionSource;
    readonly history: MandatoryHistory;
  };
  readonly state: EntityState;
  readonly signals: Signal[];
  readonly relations: Relation[];
  readonly energy: number;
  readonly insight?: ValidatedInsight;
}

export interface SystemObservation {
  readonly health: SystemHealth;
  readonly summary: string;
  readonly counts: {
    readonly total: number;
    readonly flowing: number;
    readonly stuck: number;
    readonly released: number;
  };
  readonly openQuestions: string[];
  readonly preservedInsights: ReadonlyArray<{
    readonly name: string;
    readonly insight: string;
    readonly seedForNext?: string;
  }>;
  readonly historyDepth: number;
  readonly thermalWarning?: string;
}

// ─────────────────────────────────────────────
// CREATION PARAMS
// What you must provide to create anything.
// ─────────────────────────────────────────────

export interface EntityCreateParams {
  name: string;
  reason: string;
  source?: ActionSource;
  historyEntry: Omit<MandatoryHistory, "born" | "evolution">;
}

export interface CompletionParams {
  insight: string;
  seedQuestion: string;
}
