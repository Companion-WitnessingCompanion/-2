/**
 * support_hook_profiles.ts
 *
 * Purpose:
 * - provide differentiated default hooks by support role
 * - make support node behavior role-specific by default
 * - preserve bounded, explainable support actions
 * - provide safe defaults before node-specific overrides
 */

import type {
  SupportHealthReport,
  SupportHooks,
  SupportRequest,
  SupportResponse,
  SupportRole,
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

export function createValidatorHooks(nodeId: string): SupportHooks {
  return {
    reportHealth: () =>
      buildHealthReport({
        sourceId: nodeId,
        status: "degraded",
        visibleThinness: true,
        summary:
          "Validator sees enough structure to continue observation, but not enough to claim stable restoration.",
        warnings: [
          "Validation-oriented health reporting should be read as caution, not recovery confirmation.",
        ],
      }),
    validate: (request) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "validate_structure",
        actionSummary:
          "Validator reviewed structural consistency and exposed visible weak points.",
        warnings:
          request.urgency === "emergency"
            ? ["Emergency validation should be followed by bounded repair or fallback."]
            : [],
        followUpNeeded:
          request.urgency === "degraded" || request.urgency === "emergency",
        followUpSummary:
          request.urgency === "degraded" || request.urgency === "emergency"
            ? "Consider repair support after validation findings."
            : undefined,
      }),
    recordIncident: (request) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "record_incident",
        actionSummary:
          "Validator recorded a structural incident for later review.",
        warnings: [],
      }),
  };
}

export function createRepairHelperHooks(nodeId: string): SupportHooks {
  return {
    assistRepair: (request) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "assist_repair",
        actionSummary:
          "Repair helper proposed a bounded repair path instead of wide restructuring.",
        warnings: [],
        followUpNeeded: true,
        followUpSummary:
          "Run validation after repair to confirm the structure is stable enough to continue.",
      }),
    provideFallback: (request) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "provide_fallback",
        actionSummary:
          "Repair helper provided a conservative fallback path while repair remains incomplete.",
        warnings: [
          "Fallback is temporary and should not be mistaken for full restoration.",
        ],
        followUpNeeded: true,
        followUpSummary:
          "Follow fallback with validation or repair completion.",
      }),
  };
}

export function createReentryHelperHooks(nodeId: string): SupportHooks {
  return {
    assistReentry: (request) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "assist_reentry",
        actionSummary:
          "Reentry helper guided a bounded return path into the active support flow.",
        warnings:
          request.automatic === true
            ? [
                "Automatic reentry should stay conservative until validation confirms stability.",
              ]
            : [],
        followUpNeeded: true,
        followUpSummary:
          "Run repair or validation after reentry to avoid false continuity.",
      }),
    routeSupport: (request) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "route_support",
        actionSummary:
          "Reentry helper redirected the request toward a safer continuation path.",
        warnings: [],
      }),
  };
}

export function createFallbackProviderHooks(nodeId: string): SupportHooks {
  return {
    provideFallback: (request) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "provide_fallback",
        actionSummary:
          "Fallback provider exposed a reduced but survivable path for continued operation.",
        warnings: [
          "Fallback preserves continuity but does not fully restore the original path.",
        ],
        followUpNeeded: true,
        followUpSummary:
          "Use validation after fallback to confirm whether deeper repair is still required.",
      }),
  };
}

export function createObserverHooks(nodeId: string): SupportHooks {
  return {
    recordIncident: (request) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "record_incident",
        actionSummary:
          "Observer recorded the event without overstating recovery or repair.",
        warnings: [],
      }),
    routeSupport: (request) =>
      buildResponse({
        request,
        responderId: nodeId,
        accepted: true,
        matchedCapability: "route_support",
        actionSummary:
          "Observer redirected the request to a more appropriate support role.",
        warnings: [],
      }),
  };
}

export function createRoleBasedHooks(
  role: SupportRole,
  nodeId: string,
): SupportHooks {
  switch (role) {
    case "validator":
      return createValidatorHooks(nodeId);
    case "repair_helper":
      return createRepairHelperHooks(nodeId);
    case "reentry_helper":
      return createReentryHelperHooks(nodeId);
    case "fallback_provider":
      return createFallbackProviderHooks(nodeId);
    case "observer":
      return createObserverHooks(nodeId);
    case "other":
    default:
      return {};
  }
}
