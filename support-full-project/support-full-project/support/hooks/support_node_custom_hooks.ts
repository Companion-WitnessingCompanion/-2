/**
 * support_node_custom_hooks.ts
 *
 * Purpose:
 * - provide node-specific hook overrides for high-value support nodes
 * - refine role-based defaults into node-specific behavior
 * - preserve bounded, explainable support actions
 * - make selected-node differences visible in runtime behavior
 */

import type {
  SupportHealthReport,
  SupportHooks,
  SupportRequest,
  SupportResponse,
} from "../core/support_interface.js";

function buildResponse(params: {
  request: SupportRequest;
  responderId: string;
  accepted: boolean;
  actionSummary: string;
  warnings?: readonly string[];
  matchedCapability?: SupportResponse["matchedCapability"];
  reserveUsed?: boolean;
  followUpNeeded?: boolean;
  followUpSummary?: string;
}): SupportResponse {
  return {
    requestId: params.request.requestId,
    responderId: params.responderId,
    accepted: params.accepted,
    actionSummary: params.actionSummary,
    warnings: params.warnings ?? [],
    matchedCapability: params.matchedCapability,
    reserveUsed: params.reserveUsed,
    followUpNeeded: params.followUpNeeded,
    followUpSummary: params.followUpSummary,
  };
}

function buildHealthReport(params: {
  sourceId: string;
  status: SupportHealthReport["status"];
  visibleThinness: boolean;
  summary: string;
  warnings?: readonly string[];
}): SupportHealthReport {
  return {
    sourceId: params.sourceId,
    status: params.status,
    visibleThinness: params.visibleThinness,
    summary: params.summary,
    warnings: params.warnings ?? [],
  };
}

export function createValidatorCoreHooks(
  nodeId: string,
): Partial<SupportHooks> {
  return {
    validate: (request: SupportRequest) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "validate_structure",
        actionSummary:
          "Validator core performed strict structural validation and marked unresolved weak points explicitly.",
        warnings: [
          ...(request.urgency === "emergency"
            ? ["Emergency-grade instability should not move directly into expansion."]
            : []),
          ...(request.automatic === true
            ? [
                "Automatic validation should remain conservative until bounded repair or human review confirms stability.",
              ]
            : []),
        ],
        followUpNeeded: true,
        followUpSummary:
          "Use bounded repair or fallback before attempting deeper continuation.",
      }),
    recordIncident: (request: SupportRequest) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "record_incident",
        actionSummary:
          "Validator core recorded a structural incident with emphasis on unresolved validation debt.",
        warnings: [],
        followUpNeeded: request.urgency === "emergency",
        followUpSummary:
          request.urgency === "emergency"
            ? "Escalate into bounded repair review immediately after incident recording."
            : undefined,
      }),
    reportHealth: () =>
      buildHealthReport({
        sourceId: nodeId,
        status: "degraded",
        visibleThinness: true,
        summary:
          "Validator core sees enough structure to continue observation, but not enough to claim stable restoration.",
        warnings: [
          "Health reporting from validator core should be read as structural caution, not recovery confirmation.",
        ],
      }),
  };
}

export function createRepairBoundedHooks(
  nodeId: string,
): Partial<SupportHooks> {
  return {
    assistRepair: (request: SupportRequest) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "assist_repair",
        actionSummary:
          "Repair bounded proposed the smallest viable repair path and blocked broad restructuring.",
        warnings: [
          "Repair-bounded avoided large structural mutation and may leave some non-critical damage intentionally untouched.",
        ],
        followUpNeeded: true,
        followUpSummary:
          "Run validation after bounded repair before allowing reentry or expansion.",
      }),
    provideFallback: (request: SupportRequest) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "provide_fallback",
        actionSummary:
          "Repair bounded exposed a temporary fallback corridor while preserving room for later repair completion.",
        warnings: [
          "Fallback from repair-bounded is a temporary survival path, not a claim of full repair.",
        ],
        followUpNeeded: true,
        followUpSummary:
          "Keep repair debt visible and schedule validation before removing fallback assumptions.",
      }),
  };
}

export function createReentryGroundHooks(
  nodeId: string,
): Partial<SupportHooks> {
  return {
    assistReentry: (request: SupportRequest) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "assist_reentry",
        actionSummary:
          "Reentry ground opened a narrow and supervised path back into the active flow.",
        warnings: [
          ...(request.automatic === true
            ? [
                "Automatic reentry stayed narrow and should not be mistaken for normal flow recovery.",
              ]
            : []),
          "Reentry-ground treats reentry as supervised return, not proof of restored stability.",
        ],
        followUpNeeded: true,
        followUpSummary:
          "Run repair or validation immediately after reentry to verify that continuity is real enough to maintain.",
      }),
    routeSupport: (request: SupportRequest) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "route_support",
        actionSummary:
          "Reentry ground redirected the request into a safer post-reentry path.",
        warnings: [],
        followUpNeeded: true,
        followUpSummary:
          "Prefer validation after routing if reentry uncertainty remains visible.",
      }),
  };
}
