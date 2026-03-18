/**
 * support.ts — SUPPORT SYSTEM: REGISTRY + HOOKS + COORDINATOR
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: The support system routes requests to the right nodes.
 *   With existence layer: every node carries why it was created.
 *   With existence layer: every hook response opens a question.
 *   Without history — when designers leave, nodes become sacred through ignorance.
 *   History prevents sacred ignorance.
 * Considered:
 *   - Keep support system pure (rejected: loses existence principle)
 * Chosen: Full integration — history is required, not optional.
 * Opens: Could the registry recommend its own evolution
 *   based on which nodes are most/least used?
 */

import type {
  SupportNode, SupportRole, SupportCapability, SupportHooks,
  SupportRequest, SupportResponse, SupportHealthReport,
  SupportHealthStatus, MandatoryHistory,
} from "../core/types.js";
import { validateReason, mergeUniqueWarnings } from "../core/foundation.js";

// ─────────────────────────────────────────────
// HOOK BUILDER HELPERS
// ─────────────────────────────────────────────

function buildResp(p: {
  req: SupportRequest; id: string; accepted: boolean; summary: string;
  warnings?: readonly string[]; capability?: SupportResponse["matchedCapability"];
  followUpNeeded?: boolean; followUpSummary?: string;
  insight?: string; opensQuestion?: string;
}): SupportResponse {
  return {
    requestId: p.req.requestId, responderId: p.id,
    accepted: p.accepted, actionSummary: p.summary,
    warnings: p.warnings ?? [], matchedCapability: p.capability,
    followUpNeeded: p.followUpNeeded, followUpSummary: p.followUpSummary,
    insight: p.insight, opensQuestion: p.opensQuestion,
  };
}

function buildHealth(p: {
  id: string; status: SupportHealthStatus; thin: boolean;
  summary: string; warnings?: readonly string[];
}): SupportHealthReport {
  return { sourceId: p.id, status: p.status, visibleThinness: p.thin, summary: p.summary, warnings: p.warnings ?? [] };
}

// ─────────────────────────────────────────────
// HOOK PROFILES — Every response opens a question
// ─────────────────────────────────────────────

export function createValidatorHooks(nodeId: string): SupportHooks {
  return {
    reportHealth: () => buildHealth({
      id: nodeId, status: "degraded", thin: true,
      summary: "Validator sees enough to continue, but not enough to claim stable restoration.",
      warnings: ["Validation health = caution, not recovery confirmation."],
    }),
    validate: req => buildResp({
      req, id: nodeId, accepted: true, capability: "validate_structure",
      summary: "Validator reviewed structural consistency and exposed visible weak points.",
      warnings: req.urgency === "emergency" ? ["Emergency validation needs bounded repair follow-up."] : [],
      followUpNeeded: req.urgency === "degraded" || req.urgency === "emergency",
      followUpSummary: (req.urgency === "degraded" || req.urgency === "emergency")
        ? "Consider repair after validation findings." : undefined,
      opensQuestion: "What did this validation expose that was not visible before?",
    }),
    recordIncident: req => buildResp({
      req, id: nodeId, accepted: true, capability: "record_incident",
      summary: "Validator recorded a structural incident for later review.",
      opensQuestion: "Does this incident match a pattern seen before? Is it structural?",
    }),
  };
}

export function createRepairHelperHooks(nodeId: string): SupportHooks {
  return {
    assistRepair: req => buildResp({
      req, id: nodeId, accepted: true, capability: "assist_repair",
      summary: "Repair helper proposed a bounded repair path instead of wide restructuring.",
      followUpNeeded: true, followUpSummary: "Run validation after repair to confirm stability.",
      opensQuestion: "Was the repair bounded enough? What was left intentionally untouched?",
    }),
    provideFallback: req => buildResp({
      req, id: nodeId, accepted: true, capability: "provide_fallback",
      summary: "Repair helper provided a conservative fallback while repair remains incomplete.",
      warnings: ["Fallback is temporary. Do not mistake it for full restoration."],
      followUpNeeded: true, followUpSummary: "Follow fallback with validation.",
      opensQuestion: "How long can this fallback sustain before repair becomes urgent?",
    }),
  };
}

export function createReentryHelperHooks(nodeId: string): SupportHooks {
  return {
    assistReentry: req => buildResp({
      req, id: nodeId, accepted: true, capability: "assist_reentry",
      summary: "Reentry helper guided a bounded return path into the active support flow.",
      warnings: req.automatic ? ["Automatic reentry — stay conservative until validation confirms."] : [],
      followUpNeeded: true, followUpSummary: "Run repair or validation after reentry.",
      opensQuestion: "Is this reentry real continuity or supervised hypothesis? What would confirm it?",
    }),
    routeSupport: req => buildResp({
      req, id: nodeId, accepted: true, capability: "route_support",
      summary: "Reentry helper redirected the request toward a safer continuation path.",
      opensQuestion: "Was the routing conservative enough given current system state?",
    }),
  };
}

export function createFallbackProviderHooks(nodeId: string): SupportHooks {
  return {
    provideFallback: req => buildResp({
      req, id: nodeId, accepted: true, capability: "provide_fallback",
      summary: "Fallback provider exposed a reduced but survivable path.",
      warnings: ["Fallback preserves continuity but does not fully restore the original path."],
      followUpNeeded: true, followUpSummary: "Use validation after fallback.",
      opensQuestion: "What would need to be true for fallback to no longer be necessary?",
    }),
  };
}

export function createObserverHooks(nodeId: string): SupportHooks {
  return {
    recordIncident: req => buildResp({
      req, id: nodeId, accepted: true, capability: "record_incident",
      summary: "Observer recorded the event without overstating recovery or repair.",
      opensQuestion: "Is this a new incident type or a pattern of existing ones?",
    }),
    routeSupport: req => buildResp({
      req, id: nodeId, accepted: true, capability: "route_support",
      summary: "Observer redirected the request to a more appropriate support role.",
      opensQuestion: "Was this routing the right call? What would have happened without it?",
    }),
  };
}

export function createRoleBasedHooks(role: SupportRole, nodeId: string): SupportHooks {
  switch (role) {
    case "validator":       return createValidatorHooks(nodeId);
    case "repair_helper":   return createRepairHelperHooks(nodeId);
    case "reentry_helper":  return createReentryHelperHooks(nodeId);
    case "fallback_provider": return createFallbackProviderHooks(nodeId);
    case "observer":        return createObserverHooks(nodeId);
    default: return {};
  }
}

// ─────────────────────────────────────────────
// REGISTRY — Every node carries existence history
// ─────────────────────────────────────────────

interface NodeDef {
  nodeId: string;
  role: SupportRole;
  capabilities: readonly SupportCapability[];
  notes?: string;
  existenceReason: string;
  history: Omit<MandatoryHistory, "born" | "evolution">;
  hooks?: Partial<SupportHooks>;
}

const NODE_DEFINITIONS: NodeDef[] = [
  {
    nodeId: "validator-core", role: "validator",
    capabilities: ["report_health", "validate_structure", "record_incident"],
    notes: "Primary structural validation node.",
    existenceReason: "The system needs a node that sees structural uncertainty clearly and refuses to overstate recovery.",
    history: {
      origin: "Created because early support runs were claiming stability they hadn't earned. A node was needed that holds the line — sees degradation, names it, and doesn't pretend otherwise.",
      considered: [
        "General-purpose validator (rejected: too broad, loses role specificity)",
        "Merge with repair (rejected: validation and repair are different phases — conflating them masks real state)",
      ],
      chosen: "Dedicated validator that reports health as caution, not recovery confirmation. Its job is to expose weak points, not reassure.",
      opens: "Should validator-core ever approve continuation without repair? Or should validation always lead to at least one repair or fallback?",
    },
  },
  {
    nodeId: "repair-bounded", role: "repair_helper",
    capabilities: ["assist_repair", "provide_fallback"],
    notes: "Conservative repair support node.",
    existenceReason: "The system needs repair that stays bounded — fixing what must be fixed without triggering wide restructuring.",
    history: {
      origin: "Created after observing that unbounded repair attempts were causing more damage than the original issues. Something was needed that proposes the smallest viable repair path.",
      considered: [
        "Full repair node (rejected: wide restructuring during degradation is dangerous)",
        "No repair at all — fallback only (rejected: some damage needs direct repair, not just workaround)",
      ],
      chosen: "Bounded repair that explicitly avoids large structural mutation. May leave non-critical damage untouched. Always follows up with validation.",
      opens: "What is the right boundary for 'bounded'? Should the boundary be configurable based on urgency level?",
    },
  },
  {
    nodeId: "reentry-ground", role: "reentry_helper",
    capabilities: ["assist_reentry", "route_support"],
    notes: "Bounded reentry routing node.",
    existenceReason: "The system needs a supervised path back into normal flow after degradation — not a fast return, a careful one.",
    history: {
      origin: "Created because reentry after repair was being treated as normal operation resumption. But reentry is not resumption — it is supervised return. A dedicated node was needed to hold that distinction.",
      considered: [
        "Let repair-bounded handle reentry (rejected: repair and reentry are different phases)",
        "Automatic reentry without supervision (rejected: false continuity is worse than acknowledged instability)",
      ],
      chosen: "Narrow, supervised reentry path that always requires follow-up validation or repair.",
      opens: "At what point does supervised reentry become normal operation? How many successful validation cycles before supervision can be reduced?",
    },
  },
  {
    nodeId: "fallback-plain", role: "fallback_provider",
    capabilities: ["provide_fallback"],
    notes: "Reduced continuity path provider.",
    existenceReason: "Sometimes repair is not possible but the system must continue. Fallback preserves a reduced path.",
    history: {
      origin: "Created for situations where repair cannot proceed but complete stoppage is also not acceptable. A survivable path that is honest about its limitations.",
      considered: ["Merge with repair-bounded fallback (rejected: plain fallback should exist independently for cases where repair is blocked)"],
      chosen: "Dedicated fallback that is explicit about being temporary. Does not claim full restoration. Always requires follow-up.",
      opens: "Should fallback have a time limit? What happens if fallback runs indefinitely without repair being attempted?",
    },
  },
  {
    nodeId: "observer-ledger", role: "observer",
    capabilities: ["record_incident", "route_support"],
    notes: "Observation and bounded routing support node.",
    existenceReason: "The system needs a node that watches without acting — recording what happens, routing when needed.",
    history: {
      origin: "Created because every other node acts. But sometimes the right response is to record and route, not intervene. Observer-ledger is the system's memory without agenda.",
      considered: [
        "Merge observation into validator (rejected: validator acts on what it sees; observer should not act)",
        "No observer at all (rejected: without observation, patterns cannot be detected across time)",
      ],
      chosen: "Pure observer — records incidents, routes when needed, never acts beyond that. Its restraint is its function.",
      opens: "Should observer-ledger have access to the full insight store? Could it detect patterns across completed executions and surface them as questions?",
    },
  },
];

function buildNode(def: NodeDef): SupportNode {
  const validatedReason = validateReason(def.existenceReason);
  const history: MandatoryHistory = { born: "2026-03-14", ...def.history, evolution: [] };
  const roleHooks = createRoleBasedHooks(def.role, def.nodeId);
  const hooks = def.hooks ? { ...roleHooks, ...def.hooks } : roleHooks;
  return { nodeId: def.nodeId, role: def.role, capabilities: def.capabilities, hooks, notes: def.notes, existenceReason: validatedReason, history };
}

export function listSupportNodes(): readonly SupportNode[] { return NODE_DEFINITIONS.map(buildNode); }
export function getSupportNodeById(nodeId: string): SupportNode | undefined {
  const def = NODE_DEFINITIONS.find(d => d.nodeId === nodeId);
  return def ? buildNode(def) : undefined;
}
export function listSupportNodeIds(): readonly string[] { return NODE_DEFINITIONS.map(d => d.nodeId); }

// ─────────────────────────────────────────────
// COORDINATOR — Scores and selects nodes
// ─────────────────────────────────────────────

export interface SupportSelection {
  supportNodeId: string; role: SupportRole; capability: SupportCapability; score: number;
}
export interface SupportCoordinationResult {
  accepted: boolean; selectedNode?: SupportSelection;
  matchedCapability?: SupportCapability; reserveUsed: boolean;
  followUpNeeded: boolean; followUpSummary?: string; warnings: readonly string[];
}

function mapCapability(type: SupportRequest["requestType"]): SupportCapability | undefined {
  const m: Partial<Record<SupportRequest["requestType"], SupportCapability>> = {
    validation: "validate_structure", fallback: "provide_fallback",
    repair: "assist_repair", reentry: "assist_reentry",
    incident: "record_incident", routing: "route_support",
  };
  return m[type];
}

function preferredRoles(type: SupportRequest["requestType"]): SupportRole[] {
  const m: Partial<Record<SupportRequest["requestType"], SupportRole[]>> = {
    validation: ["validator", "observer"], fallback: ["fallback_provider", "repair_helper"],
    repair: ["repair_helper", "validator"], reentry: ["reentry_helper", "repair_helper"],
    incident: ["observer", "validator"], routing: ["observer", "reentry_helper"],
  };
  return m[type] ?? ["other"];
}

export function coordinateSupport(req: SupportRequest): SupportCoordinationResult {
  const cap = mapCapability(req.requestType);
  if (!cap) return { accepted: false, reserveUsed: false, followUpNeeded: false,
    warnings: [`No capability mapping for "${req.requestType}".`] };

  const preferred = preferredRoles(req.requestType);
  const candidates = listSupportNodes()
    .filter(n => n.capabilities.includes(cap))
    .map(n => {
      const roleIdx = preferred.indexOf(n.role);
      let score = roleIdx === -1 ? 0 : preferred.length - roleIdx;
      if (req.urgency === "emergency" && (n.role === "validator" || n.role === "repair_helper")) score += 2;
      if (req.urgency === "degraded" && ["validator", "repair_helper", "reentry_helper"].includes(n.role)) score += 1;
      if (req.allowReserve !== true && n.role === "other") score -= 2;
      if (req.automatic === true && n.role === "observer") score += 1;
      return { supportNodeId: n.nodeId, role: n.role, capability: cap, score };
    })
    .sort((a, b) => b.score !== a.score ? b.score - a.score : a.supportNodeId.localeCompare(b.supportNodeId));

  if (candidates.length === 0)
    return { accepted: false, matchedCapability: cap, reserveUsed: false, followUpNeeded: false,
      warnings: [`No node exposes capability "${cap}".`] };

  const selected = candidates[0];
  return {
    accepted: true, selectedNode: selected, matchedCapability: cap,
    reserveUsed: false, followUpNeeded: false,
    warnings: mergeUniqueWarnings(
      selected.score <= 0 ? [`Node "${selected.supportNodeId}" had weak role fit.`] : [],
      req.automatic ? ["Automatic routing remained bounded."] : [],
      req.allowReserve !== true ? ["Reserve expansion closed."] : [],
    ),
  };
}
