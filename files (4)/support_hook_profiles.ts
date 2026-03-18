/**
 * support_hook_profiles.ts — WITH EXISTENCE HISTORY
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Hooks needed to carry what they learned from each execution.
 *   Original hooks returned responses. This version also carries
 *   opensQuestion — so each response leaves a navigational marker.
 * Considered:
 *   - Keep hooks pure response generators (rejected: loses learning)
 * Chosen:
 *   Add opensQuestion to responses where meaningful.
 *   Hooks that handle degraded/emergency states always open questions.
 * Opens:
 *   Should hooks have access to the full insight store?
 *   Could a hook that has "seen this before" respond differently?
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
  opensQuestion?: string;
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
    opensQuestion: params.opensQuestion,
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
    reportHealth: () => buildHealthReport({
      sourceId: nodeId,
      status: "degraded",
      visibleThinness: true,
      summary: "Validator sees enough to continue observation, but not enough to claim stable restoration.",
      warnings: ["Validation health reporting should be read as caution, not recovery confirmation."],
    }),
    validate: (req) => buildResponse({
      request: req,
      responderId: nodeId,
      accepted: true,
      matchedCapability: "validate_structure",
      actionSummary: "Validator reviewed structural consistency and exposed visible weak points.",
      warnings: req.urgency === "emergency"
        ? ["Emergency validation should be followed by bounded repair or fallback."]
        : [],
      followUpNeeded: req.urgency === "degraded" || req.urgency === "emergency",
      followUpSummary: (req.urgency === "degraded" || req.urgency === "emergency")
        ? "Consider repair support after validation findings."
        : undefined,
      opensQuestion: "What did this validation expose that was not visible before?",
    }),
    recordIncident: (req) => buildResponse({
      request: req,
      responderId: nodeId,
      accepted: true,
      matchedCapability: "record_incident",
      actionSummary: "Validator recorded a structural incident for later review.",
      warnings: [],
      opensQuestion: "Does this incident match a pattern seen before? Is it structural?",
    }),
  };
}

export function createRepairHelperHooks(nodeId: string): SupportHooks {
  return {
    assistRepair: (req) => buildResponse({
      request: req,
      responderId: nodeId,
      accepted: true,
      matchedCapability: "assist_repair",
      actionSummary: "Repair helper proposed a bounded repair path instead of wide restructuring.",
      warnings: [],
      followUpNeeded: true,
      followUpSummary: "Run validation after repair to confirm stability.",
      opensQuestion: "Was the repair bounded enough? What was left intentionally untouched?",
    }),
    provideFallback: (req) => buildResponse({
      request: req,
      responderId: nodeId,
      accepted: true,
      matchedCapability: "provide_fallback",
      actionSummary: "Repair helper provided a conservative fallback while repair remains incomplete.",
      warnings: ["Fallback is temporary. Do not mistake it for full restoration."],
      followUpNeeded: true,
      followUpSummary: "Follow fallback with validation or repair completion.",
      opensQuestion: "How long can this fallback sustain before repair becomes urgent?",
    }),
  };
}

export function createReentryHelperHooks(nodeId: string): SupportHooks {
  return {
    assistReentry: (req) => buildResponse({
      request: req,
      responderId: nodeId,
      accepted: true,
      matchedCapability: "assist_reentry",
      actionSummary: "Reentry helper guided a bounded return path into the active support flow.",
      warnings: req.automatic === true
        ? ["Automatic reentry should stay conservative until validation confirms stability."]
        : [],
      followUpNeeded: true,
      followUpSummary: "Run repair or validation after reentry to avoid false continuity.",
      opensQuestion: "Is this reentry real continuity or supervised hypothesis? What would confirm it?",
    }),
    routeSupport: (req) => buildResponse({
      request: req,
      responderId: nodeId,
      accepted: true,
      matchedCapability: "route_support",
      actionSummary: "Reentry helper redirected the request toward a safer continuation path.",
      warnings: [],
      opensQuestion: "Was the routing conservative enough given current system state?",
    }),
  };
}

export function createFallbackProviderHooks(nodeId: string): SupportHooks {
  return {
    provideFallback: (req) => buildResponse({
      request: req,
      responderId: nodeId,
      accepted: true,
      matchedCapability: "provide_fallback",
      actionSummary: "Fallback provider exposed a reduced but survivable path for continued operation.",
      warnings: ["Fallback preserves continuity but does not fully restore the original path."],
      followUpNeeded: true,
      followUpSummary: "Use validation after fallback to confirm if deeper repair is required.",
      opensQuestion: "What would need to be true for fallback to no longer be necessary?",
    }),
  };
}

export function createObserverHooks(nodeId: string): SupportHooks {
  return {
    recordIncident: (req) => buildResponse({
      request: req,
      responderId: nodeId,
      accepted: true,
      matchedCapability: "record_incident",
      actionSummary: "Observer recorded the event without overstating recovery or repair.",
      warnings: [],
      opensQuestion: "Is this a new incident type or a pattern of existing ones?",
    }),
    routeSupport: (req) => buildResponse({
      request: req,
      responderId: nodeId,
      accepted: true,
      matchedCapability: "route_support",
      actionSummary: "Observer redirected the request to a more appropriate support role.",
      warnings: [],
      opensQuestion: "Was this routing the right call? What would have happened without it?",
    }),
  };
}

export function createRoleBasedHooks(role: SupportRole, nodeId: string): SupportHooks {
  switch (role) {
    case "validator": return createValidatorHooks(nodeId);
    case "repair_helper": return createRepairHelperHooks(nodeId);
    case "reentry_helper": return createReentryHelperHooks(nodeId);
    case "fallback_provider": return createFallbackProviderHooks(nodeId);
    case "observer": return createObserverHooks(nodeId);
    default: return {};
  }
}
