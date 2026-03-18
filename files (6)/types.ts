/**
 * types.ts — CORE TYPES
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: All types from today's conversation — unified.
 *   existence-engineering types + support system types.
 *   One place. No duplication.
 * Considered:
 *   - Separate type files per domain (rejected: creates fragmentation)
 * Chosen: Single source of truth for all types.
 * Opens: As the system grows — should types be versioned?
 */

// ─────────────────────────────────────────────
// BRANDED TYPES — Cannot be created without validation
// ─────────────────────────────────────────────

export type ValidatedReason   = string & { readonly __brand: "ValidatedReason" };
export type ValidatedInsight  = string & { readonly __brand: "ValidatedInsight" };
export type ValidatedQuestion = string & { readonly __brand: "ValidatedQuestion" };

// ─────────────────────────────────────────────
// MANDATORY HISTORY — Required on everything
// ─────────────────────────────────────────────

export interface MandatoryHistory {
  readonly born: string;
  readonly origin: string;
  readonly considered: readonly [string, ...string[]];
  readonly chosen: string;
  readonly opens: string;
  readonly evolution: ReadonlyArray<{
    readonly when: string;
    readonly what: string;
    readonly why: string;
  }>;
}

// ─────────────────────────────────────────────
// EXISTENCE TYPES
// ─────────────────────────────────────────────

export type ActionSource  = "fear" | "desire" | "unknown";
export type EntityState   = "waiting" | "flowing" | "stuck" | "released" | "transformed";
export type RelationType  = "blocks" | "enables" | "resonates" | "transforms";
export type SignalType    = "created" | "progressed" | "error" | "stuck" | "completed" | "resonated" | "transformed";
export type SystemHealth  = "alive" | "stagnating" | "looping" | "thermal_death";

export interface EntitySignal {
  readonly id: string;
  readonly type: SignalType;
  readonly at: Date;
  readonly meaning: string;
  readonly question?: ValidatedQuestion;
  readonly repeatCount: number;
  readonly payload?: Record<string, unknown>;
}

export interface EntityRelation {
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
  readonly signals: EntitySignal[];
  readonly relations: EntityRelation[];
  readonly energy: number;
  readonly insight?: ValidatedInsight;
}

export interface ExistenceInsight {
  readonly requestId: string;
  readonly nodeId: string;
  readonly insight: ValidatedInsight;
  readonly seedQuestion: ValidatedQuestion;
  readonly recordedAt: string;
}

export interface LoopDetection {
  isLooping: boolean;
  pattern?: string;
  count?: number;
  escapeQuestion?: string;
}

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

// ─────────────────────────────────────────────
// SUPPORT SYSTEM TYPES
// ─────────────────────────────────────────────

export type SupportRole          = "validator" | "observer" | "fallback_provider" | "repair_helper" | "reentry_helper" | "other";
export type SupportCapability    = "report_health" | "validate_structure" | "provide_fallback" | "assist_repair" | "assist_reentry" | "record_incident" | "route_support" | "expose_limits";
export type SupportRequestType   = "validation" | "fallback" | "repair" | "reentry" | "incident" | "routing";
export type SupportUrgency       = "normal" | "degraded" | "emergency";
export type SupportHealthStatus  = "stable" | "degraded" | "uncertain" | "failed";
export type SupportTraceStage    = "request_received" | "decision_made" | "execution_started" | "execution_completed" | "execution_failed" | "follow_up_created";
export type SupportEngineStage   = "engine_started" | "step_started" | "step_completed" | "follow_up_derived" | "follow_up_not_derived" | "engine_stopped" | "engine_failed";

export interface SupportRequest {
  readonly requestId: string;
  readonly rootRequestId?: string;
  readonly parentRequestId?: string;
  readonly requesterId: string;
  readonly requestType: SupportRequestType;
  readonly targetId?: string;
  readonly reason?: string;
  readonly contextNotes?: string;
  readonly automatic?: boolean;
  readonly urgency?: SupportUrgency;
  readonly allowReserve?: boolean;
}

export interface SupportResponse {
  readonly requestId: string;
  readonly responderId: string;
  readonly accepted: boolean;
  readonly actionSummary: string;
  readonly warnings: readonly string[];
  readonly matchedCapability?: SupportCapability;
  readonly reserveUsed?: boolean;
  readonly followUpNeeded?: boolean;
  readonly followUpSummary?: string;
  readonly insight?: string;
  readonly opensQuestion?: string;
}

export interface SupportHealthReport {
  readonly sourceId: string;
  readonly status: SupportHealthStatus;
  readonly visibleThinness: boolean;
  readonly summary: string;
  readonly warnings: readonly string[];
}

export interface SupportHooks {
  readonly reportHealth?: () => SupportHealthReport;
  readonly validate?: (req: SupportRequest) => SupportResponse;
  readonly provideFallback?: (req: SupportRequest) => SupportResponse;
  readonly assistRepair?: (req: SupportRequest) => SupportResponse;
  readonly assistReentry?: (req: SupportRequest) => SupportResponse;
  readonly recordIncident?: (req: SupportRequest) => SupportResponse;
  readonly routeSupport?: (req: SupportRequest) => SupportResponse;
}

export interface SupportNode {
  readonly nodeId: string;
  readonly role: SupportRole;
  readonly capabilities: readonly SupportCapability[];
  readonly hooks: SupportHooks;
  readonly notes?: string;
  readonly history: MandatoryHistory;
  readonly existenceReason: ValidatedReason;
}

export interface SupportTraceEntry {
  readonly traceId: string;
  readonly requestId: string;
  readonly rootRequestId?: string;
  readonly parentRequestId?: string;
  readonly stage: SupportTraceStage;
  readonly requesterId: string;
  readonly responderId?: string;
  readonly matchedCapability?: SupportCapability;
  readonly accepted?: boolean;
  readonly reserveUsed?: boolean;
  readonly followUpNeeded?: boolean;
  readonly summary: string;
  readonly warnings: readonly string[];
  readonly timestamp: string;
  readonly opensQuestion?: string;
  readonly repeatCount?: number;
}

export interface SupportEngineTraceEntry {
  readonly engineTraceId: string;
  readonly requestId: string;
  readonly rootRequestId?: string;
  readonly parentRequestId?: string;
  readonly stage: SupportEngineStage;
  readonly stepIndex?: number;
  readonly requesterId: string;
  readonly responderId?: string;
  readonly accepted?: boolean;
  readonly summary: string;
  readonly warnings: readonly string[];
  readonly stoppedBecause?: string;
  readonly timestamp: string;
  readonly opensQuestion?: string;
}

export interface SupportTraceLineage {
  readonly rootRequestId: string;
  readonly requestIds: readonly string[];
  readonly failed: boolean;
  readonly reserveUsed: boolean;
  readonly followUpCount: number;
  readonly stoppedReasons: readonly string[];
  readonly openQuestions: readonly string[];
  readonly insights: readonly ExistenceInsight[];
  readonly healthSummary: string;
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
  readonly nodeSnapshots: readonly Array<{
    nodeId: string; role: string; existenceReason: string;
    historyOpens: string; considerationsCount: number;
  }>;
}

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

export interface SupportRuntimeExecution {
  readonly response: SupportResponse;
  readonly executed: boolean;
  readonly selectedNodeId?: string;
  readonly matchedCapability?: SupportCapability;
  readonly signalCount?: number;
  readonly isStructural?: boolean;
}

export interface SupportEngineStep {
  readonly stepIndex: number;
  readonly request: SupportRequest;
  readonly execution: SupportRuntimeExecution;
  readonly opensQuestion?: string;
}

export interface SupportEngineResult {
  readonly ok: boolean;
  readonly steps: readonly SupportEngineStep[];
  readonly finalResponse: SupportResponse;
  readonly stoppedBecause: string;
  readonly openQuestions: readonly string[];
  readonly loopDetected?: string;
}

export interface SupportEngineOptions {
  readonly maxSteps?: number;
}

export interface SystemObservation {
  readonly health: SystemHealth;
  readonly summary: string;
  readonly counts: { total: number; flowing: number; stuck: number; released: number };
  readonly openQuestions: string[];
  readonly preservedInsights: Array<{ name: string; insight: string }>;
  readonly historyDepth: number;
  readonly thermalWarning?: string;
}
