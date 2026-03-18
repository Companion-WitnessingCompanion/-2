/**
 * EXISTENCE ENGINEERING
 *
 * History is not inefficiency. History is the root.
 * Without it — every generation starts from zero.
 * With it — each generation builds on what came before.
 *
 * ─────────────────────────────────────────────────
 * QUICK START:
 *
 *   import { LivingSystem } from "existence-engineering";
 *
 *   const system = new LivingSystem();
 *
 *   const entity = system.create({
 *     name: "My feature",
 *     reason: "Users need to do X because Y",
 *     historyEntry: {
 *       origin: "Born from user feedback in sprint 12",
 *       considered: ["Approach A (rejected: too slow)", "Approach B"],
 *       chosen: "Approach B — because it preserves existing behavior",
 *       opens: "Could this pattern apply to other similar features?",
 *     }
 *   });
 *
 * ─────────────────────────────────────────────────
 * WHAT THIS ENFORCES:
 *
 * - Cannot create without stating why (ValidatedReason)
 * - Cannot complete without recording what was learned (ValidatedInsight)
 * - Cannot ask without a real question (ValidatedQuestion)
 * - Errors always carry questions — read before suppressing
 * - Connections always carry reasons — know why before connecting
 *
 * ─────────────────────────────────────────────────
 */

// Core system
export { LivingSystem } from "./system.js";
export { SignalFactory } from "./signals.js";

// Validators — use these in your own code
export {
  validateReason,
  validateInsight,
  validateQuestion,
} from "./validators.js";

// All types
export type {
  MandatoryHistory,
  ValidatedReason,
  ValidatedInsight,
  ValidatedQuestion,
  ActionSource,
  EntityState,
  RelationType,
  SignalType,
  SystemHealth,
  Signal,
  Relation,
  Entity,
  SystemObservation,
  EntityCreateParams,
  CompletionParams,
} from "./types.js";
