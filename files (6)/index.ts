/**
 * index.ts — EXISTENCE ENGINEERING: COMPLETE
 *
 * Everything from today — unified.
 *
 * ─────────────────────────────────────────────
 * WHAT'S IN HERE:
 *
 * CORE
 *   Types              — All shared types (branded, interfaces, enums)
 *   Foundation         — Validators, signal counter, insight store, loop detector, warnings
 *
 * ENTITY SYSTEM (existence-engineering)
 *   LivingSystem       — Entities with origin, state, signals, relations
 *   SignalFactory      — Signal creation with auto-questions
 *
 * SUPPORT SYSTEM (support-full-project + existence layer)
 *   support.ts         — Registry (with MandatoryHistory), hooks, coordinator
 *   runtime.ts         — Single request execution + multi-step engine
 *
 * TRACE LAYER
 *   trace.ts           — Runtime trace, engine trace, lineage, bundle, diff, renderers
 *
 * ─────────────────────────────────────────────
 * QUICK START — Entity System:
 *
 *   import { LivingSystem } from "existence-engineering";
 *   const sys = new LivingSystem();
 *   const entity = sys.create({
 *     name: "My feature",
 *     reason: "Users need X because Y (at least 10 chars)",
 *     historyEntry: {
 *       origin: "Born from user feedback in sprint 12",
 *       considered: ["Option A (rejected: too slow)"],
 *       chosen: "Option B — preserves existing behavior",
 *       opens: "Could this pattern apply to similar features?",
 *     }
 *   });
 *
 * QUICK START — Support System:
 *
 *   import { runSupportEngine } from "existence-engineering";
 *   const result = runSupportEngine(
 *     { requestId: "req-001", rootRequestId: "req-001",
 *       requesterId: "system", requestType: "validation",
 *       urgency: "degraded" },
 *     { maxSteps: 3 }
 *   );
 *
 * ─────────────────────────────────────────────
 * WHAT THIS ENFORCES:
 *
 *   Cannot create without reason (ValidatedReason — min 10 chars, no "TODO")
 *   Cannot complete without insight (ValidatedInsight — min 15 chars, not "done")
 *   Cannot question without "?" (ValidatedQuestion)
 *   Cannot register a node without MandatoryHistory
 *   Errors always open questions (mandatory in trace)
 *   3+ repeats = structural signal
 *   Loop detection across question patterns
 *   Insights preserved — never deleted
 *
 * ─────────────────────────────────────────────
 */

// Core types
export type {
  ValidatedReason, ValidatedInsight, ValidatedQuestion,
  MandatoryHistory, ActionSource, EntityState, RelationType,
  SignalType, SystemHealth, EntitySignal, EntityRelation, Entity,
  ExistenceInsight, LoopDetection, EntityCreateParams, CompletionParams,
  SystemObservation,
  SupportRole, SupportCapability, SupportRequestType, SupportUrgency,
  SupportHealthStatus, SupportTraceStage, SupportEngineStage,
  SupportRequest, SupportResponse, SupportHealthReport, SupportHooks,
  SupportNode, SupportTraceEntry, SupportEngineTraceEntry,
  SupportTraceLineage, SupportTraceBundle, SupportTraceBundleDiff,
  SupportRuntimeExecution, SupportEngineStep, SupportEngineResult,
  SupportEngineOptions,
} from "./core/types.js";

// Foundation
export {
  validateReason, validateInsight, validateQuestion,
  countSignal, generateSignalQuestion, clearSignalCounter,
  recordInsight, listInsights, clearInsights,
  detectLoop, mergeUniqueWarnings,
} from "./core/foundation.js";

// Entity system
export { LivingSystem, SignalFactory } from "./system/living_system.js";

// Support system
export {
  listSupportNodes, getSupportNodeById, listSupportNodeIds,
  coordinateSupport,
  createValidatorHooks, createRepairHelperHooks, createReentryHelperHooks,
  createFallbackProviderHooks, createObserverHooks, createRoleBasedHooks,
} from "./support/support.js";

// Runtime + Engine
export { runSupportRequest, runSupportEngine } from "./support/runtime.js";

// Trace layer
export {
  recordTrace, listRuntimeTrace, listOpenQuestionsFromTrace,
  listStructuralSignals, clearRuntimeTrace,
  recordEngineTrace, listEngineTrace, listEngineOpenQuestions, clearEngineTrace,
  buildLineage, listAllLineages,
  buildBundle, diffBundles, renderBundle, renderDiff,
} from "./trace/trace.js";
