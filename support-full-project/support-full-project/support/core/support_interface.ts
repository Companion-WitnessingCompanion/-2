/**
 * support_interface.ts
 *
 * Purpose:
 * - define shared support request/response language
 * - define support roles, capabilities, and urgency levels
 * - preserve request lineage across follow-up execution
 * - provide the common contract used by registry/runtime/engine/trace
 */

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

  /**
   * Root lineage id for the whole request family.
   * - initial request: usually equal to requestId
   * - follow-up request: inherited from the original root request
   */
  readonly rootRequestId?: string;

  /**
   * Direct parent request id.
   * - absent for an initial request
   * - present for a follow-up request derived from a previous request
   */
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
}
