/**
 * support_interface.ts — WITH EXISTENCE HISTORY
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: The original support_interface.ts defined what nodes do.
 *   But not why they exist, what was considered, what they open.
 *   A node without history is a ruin — present but unexplainable.
 *   This version adds MandatoryHistory to SupportNode.
 *   Now every node carries why it was created.
 *
 * Considered:
 *   - Keep history in separate documentation (rejected: disconnects from code)
 *   - Make history optional field (rejected: optional means skipped)
 * Chosen:
 *   MandatoryHistory as required field in SupportNode.
 *   Cannot register a node without stating why it exists.
 *   Cannot run without this foundation.
 *
 * Opens:
 *   Should SupportRequest also carry history?
 *   Why was THIS request created, not just what type it is?
 */

import type { MandatoryHistory, ValidatedReason } from "../existence/existence_history.js";

export type SupportRole =
  | "validator"
  | "observer"
  | "fallback_provider"
  | "repair_helper"
  | "reentry_helper"
  | "other";

export type SupportCapability =
  | "report_health"
  | "validate_structure"
  | "provide_fallback"
  | "assist_repair"
  | "assist_reentry"
  | "record_incident"
  | "route_support"
  | "expose_limits";

export type SupportRequestType =
  | "validation"
  | "fallback"
  | "repair"
  | "reentry"
  | "incident"
  | "routing";

export type SupportUrgency =
  | "normal"
  | "degraded"
  | "emergency";

export type SupportHealthStatus =
  | "stable"
  | "degraded"
  | "uncertain"
  | "failed";

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

  /**
   * NEW: What was learned from this response?
   * Optional — but encouraged.
   * Responses that record insight improve the system over time.
   */
  readonly insight?: string;

  /**
   * NEW: What question does this response open?
   * Living systems always leave a question.
   */
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
  readonly validate?: (request: SupportRequest) => SupportResponse;
  readonly provideFallback?: (request: SupportRequest) => SupportResponse;
  readonly assistRepair?: (request: SupportRequest) => SupportResponse;
  readonly assistReentry?: (request: SupportRequest) => SupportResponse;
  readonly recordIncident?: (request: SupportRequest) => SupportResponse;
  readonly routeSupport?: (request: SupportRequest) => SupportResponse;
}

export interface SupportNode {
  readonly nodeId: string;
  readonly role: SupportRole;
  readonly capabilities: readonly SupportCapability[];
  readonly hooks: SupportHooks;
  readonly notes?: string;

  /**
   * NEW: MANDATORY HISTORY
   *
   * Every node must carry why it was created.
   * Without this — when the original designers are gone,
   * nobody knows why this node exists.
   * And nobody dares remove it. Or modify it.
   * It becomes sacred through ignorance.
   *
   * History prevents sacred ignorance.
   */
  readonly history: MandatoryHistory;

  /**
   * NEW: Why this node was chosen for this role.
   * Validated — cannot be empty or vague.
   */
  readonly existenceReason: ValidatedReason;
}
