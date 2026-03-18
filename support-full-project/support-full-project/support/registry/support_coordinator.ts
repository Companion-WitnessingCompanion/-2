/**
 * support_coordinator.ts
 *
 * Purpose:
 * - coordinate support node selection
 * - map request types to support capabilities
 * - prefer role-appropriate responders
 * - preserve bounded, explainable routing
 */

import type {
  SupportCapability,
  SupportRequest,
  SupportRequestType,
  SupportRole,
} from "../core/support_interface.js";

import {
  mergeUniqueWarnings,
} from "../core/support_warning_utils.js";

import {
  listSupportNodes,
} from "./support_registry.js";

export interface SupportSelection {
  readonly supportNodeId: string;
  readonly role: SupportRole;
  readonly capability: SupportCapability;
  readonly score: number;
}

export interface SupportCoordinationResult {
  readonly accepted: boolean;
  readonly selectedNode?: SupportSelection;
  readonly matchedCapability?: SupportCapability;
  readonly reserveUsed: boolean;
  readonly followUpNeeded: boolean;
  readonly followUpSummary?: string;
  readonly warnings: readonly string[];
}

function mapRequestTypeToCapability(
  requestType: SupportRequestType,
): SupportCapability | undefined {
  switch (requestType) {
    case "validation":
      return "validate_structure";
    case "fallback":
      return "provide_fallback";
    case "repair":
      return "assist_repair";
    case "reentry":
      return "assist_reentry";
    case "incident":
      return "record_incident";
    case "routing":
      return "route_support";
    default:
      return undefined;
  }
}

function getPreferredRolesForRequestType(
  requestType: SupportRequestType,
): readonly SupportRole[] {
  switch (requestType) {
    case "validation":
      return ["validator", "observer"];
    case "fallback":
      return ["fallback_provider", "repair_helper"];
    case "repair":
      return ["repair_helper", "validator"];
    case "reentry":
      return ["reentry_helper", "repair_helper"];
    case "incident":
      return ["observer", "validator"];
    case "routing":
      return ["observer", "reentry_helper"];
    default:
      return ["other"];
  }
}

function roleScore(
  role: SupportRole,
  preferredRoles: readonly SupportRole[],
): number {
  const index = preferredRoles.indexOf(role);

  if (index === -1) {
    return 0;
  }

  return preferredRoles.length - index;
}

function urgencyBonus(
  request: SupportRequest,
  role: SupportRole,
): number {
  if (request.urgency === "emergency") {
    if (role === "validator" || role === "repair_helper") {
      return 2;
    }

    return 0;
  }

  if (request.urgency === "degraded") {
    if (
      role === "validator" ||
      role === "repair_helper" ||
      role === "reentry_helper"
    ) {
      return 1;
    }
  }

  return 0;
}

function reservePenalty(
  request: SupportRequest,
  role: SupportRole,
): number {
  if (request.allowReserve === true) {
    return 0;
  }

  if (role === "other") {
    return -2;
  }

  return 0;
}

function automaticAdjustment(
  request: SupportRequest,
  role: SupportRole,
): number {
  if (request.automatic !== true) {
    return 0;
  }

  if (role === "observer") {
    return 1;
  }

  return 0;
}

function scoreCandidate(params: {
  request: SupportRequest;
  role: SupportRole;
  preferredRoles: readonly SupportRole[];
}): number {
  return (
    roleScore(params.role, params.preferredRoles) +
    urgencyBonus(params.request, params.role) +
    reservePenalty(params.request, params.role) +
    automaticAdjustment(params.request, params.role)
  );
}

export function coordinateSupport(
  request: SupportRequest,
): SupportCoordinationResult {
  const matchedCapability = mapRequestTypeToCapability(request.requestType);

  if (!matchedCapability) {
    return {
      accepted: false,
      reserveUsed: false,
      followUpNeeded: false,
      warnings: [
        `No support capability mapping exists for request type "${request.requestType}".`,
      ],
    };
  }

  const preferredRoles = getPreferredRolesForRequestType(request.requestType);

  const candidates = listSupportNodes()
    .filter((node) => node.capabilities.includes(matchedCapability))
    .map((node) => ({
      supportNodeId: node.nodeId,
      role: node.role,
      capability: matchedCapability,
      score: scoreCandidate({
        request,
        role: node.role,
        preferredRoles,
      }),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.supportNodeId.localeCompare(b.supportNodeId);
    });

  if (candidates.length === 0) {
    return {
      accepted: false,
      matchedCapability,
      reserveUsed: false,
      followUpNeeded: false,
      warnings: [
        `No registered support node exposes capability "${matchedCapability}".`,
      ],
    };
  }

  const selectedNode = candidates[0];

  const warnings = mergeUniqueWarnings(
    selectedNode.score <= 0
      ? [
          `Selected support node "${selectedNode.supportNodeId}" matched capability but had weak role preference fit.`,
        ]
      : [],
    request.automatic === true
      ? [
          "Automatic support routing remained bounded and may prefer conservative continuation.",
        ]
      : [],
    request.allowReserve !== true
      ? [
          "Reserve expansion remained closed unless explicitly allowed by the request.",
        ]
      : [],
  );

  return {
    accepted: true,
    selectedNode,
    matchedCapability,
    reserveUsed: false,
    followUpNeeded: false,
    warnings,
  };
}
