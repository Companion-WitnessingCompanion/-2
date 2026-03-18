/**
 * runtime.ts — SUPPORT RUNTIME + ENGINE
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Runtime executes a request. Engine chains requests.
 *   With existence layer: every execution leaves questions.
 *   Every failure generates a mandatory question.
 *   Every structural signal (3+ repeats) is flagged.
 *   Multi-step engine follows up automatically.
 * Considered:
 *   - Single file per concern (originally done — unified here)
 * Chosen: Runtime + Engine together. They work as a pair.
 * Opens: Could the engine's follow-up logic be made configurable
 *   per request type? Some types might need different chains.
 */

import type {
  SupportRequest, SupportResponse, SupportCapability,
  SupportNode, SupportRequestType, SupportUrgency,
  SupportRuntimeExecution, SupportEngineStep,
  SupportEngineResult, SupportEngineOptions,
} from "../core/types.js";
import { mergeUniqueWarnings, countSignal, generateSignalQuestion, recordInsight, detectLoop } from "../core/foundation.js";
import { coordinateSupport, getSupportNodeById } from "../support/support.js";
import { recordTrace, recordEngineTrace } from "../trace/trace.js";

// ─────────────────────────────────────────────
// CAPABILITY EXECUTION
// ─────────────────────────────────────────────

function executeCapability(
  node: SupportNode, cap: SupportCapability, req: SupportRequest,
): SupportResponse | undefined {
  switch (cap) {
    case "report_health": {
      const r = node.hooks.reportHealth?.();
      if (!r) return undefined;
      return {
        requestId: req.requestId, responderId: node.nodeId, accepted: true,
        actionSummary: `Health: "${r.status}".`, warnings: r.warnings,
        matchedCapability: "report_health",
        followUpNeeded: r.status !== "stable",
        followUpSummary: r.status !== "stable" ? "Consider validation before deeper continuation." : undefined,
        opensQuestion: `Health is "${r.status}" — what would bring it to stable?`,
      };
    }
    case "validate_structure": return node.hooks.validate?.(req);
    case "provide_fallback":   return node.hooks.provideFallback?.(req);
    case "assist_repair":      return node.hooks.assistRepair?.(req);
    case "assist_reentry":     return node.hooks.assistReentry?.(req);
    case "record_incident":    return node.hooks.recordIncident?.(req);
    case "route_support":      return node.hooks.routeSupport?.(req);
    case "expose_limits":      return node.hooks.validate?.(req) ?? node.hooks.recordIncident?.(req);
    default: throw new Error(`Unhandled capability: ${cap}`);
  }
}

// ─────────────────────────────────────────────
// RUNTIME — Single request execution
// ─────────────────────────────────────────────

export function runSupportRequest(req: SupportRequest): SupportRuntimeExecution {
  const tr = (stage: Parameters<typeof recordTrace>[0]["stage"], summary: string, response?: SupportResponse, q?: string) => {
    recordTrace({ request: req, stage, summary, response, opensQuestion: q });
  };

  tr("request_received", `Request "${req.requestType}" received.`);

  const decision = coordinateSupport(req);
  const decisionResp: SupportResponse = {
    requestId: req.requestId, responderId: decision.selectedNode?.supportNodeId ?? "coordinator",
    accepted: decision.accepted, actionSummary: decision.selectedNode ? `Selected "${decision.selectedNode.supportNodeId}".` : "No node selected.",
    warnings: decision.warnings, matchedCapability: decision.matchedCapability,
    reserveUsed: decision.reserveUsed, followUpNeeded: decision.followUpNeeded,
  };

  tr("decision_made",
    decision.selectedNode ? `Selected "${decision.selectedNode.supportNodeId}".` : "No node selected.",
    decisionResp);

  if (!decision.selectedNode || !decision.matchedCapability) {
    const count = countSignal("rt_no_node", req.requestType);
    const q = generateSignalQuestion("error", `no_node_for_${req.requestType}`, count);
    const resp: SupportResponse = {
      requestId: req.requestId, responderId: "support-runtime", accepted: false,
      actionSummary: "No executable support path found.", warnings: decision.warnings,
      matchedCapability: decision.matchedCapability, followUpNeeded: true, opensQuestion: q,
    };
    tr("execution_failed", "No selected node.", resp, q);
    return { executed: false, matchedCapability: decision.matchedCapability, response: resp };
  }

  const node = getSupportNodeById(decision.selectedNode.supportNodeId);
  if (!node) {
    const q = generateSignalQuestion("error", "node_not_resolved", countSignal("rt_no_resolve", "node"));
    const resp: SupportResponse = {
      requestId: req.requestId, responderId: "support-runtime", accepted: false,
      actionSummary: `Node "${decision.selectedNode.supportNodeId}" not resolved.`,
      warnings: mergeUniqueWarnings(decision.warnings, ["Node not found in registry."]),
      followUpNeeded: true, followUpSummary: "Check registry integrity.", opensQuestion: q,
    };
    tr("execution_failed", "Node resolution failed.", resp, q);
    return { executed: false, selectedNodeId: decision.selectedNode.supportNodeId, matchedCapability: decision.matchedCapability, response: resp };
  }

  tr("execution_started", `Starting "${decision.matchedCapability}" on "${node.nodeId}".`);

  const executed = executeCapability(node, decision.matchedCapability, req);
  if (!executed) {
    const q = generateSignalQuestion("error", "hook_missing", countSignal("rt_no_hook", `${node.nodeId}:${decision.matchedCapability}`));
    const resp: SupportResponse = {
      requestId: req.requestId, responderId: node.nodeId, accepted: false,
      actionSummary: `Node "${node.nodeId}" has no hook for "${decision.matchedCapability}".`,
      warnings: mergeUniqueWarnings(decision.warnings, ["Hook missing."]),
      followUpNeeded: true, opensQuestion: q,
    };
    tr("execution_failed", "Hook missing.", resp, q);
    return { executed: false, selectedNodeId: node.nodeId, matchedCapability: decision.matchedCapability, response: resp };
  }

  const signalKey = `${node.nodeId}:${decision.matchedCapability}`;
  const signalCount = countSignal("rt_exec", signalKey);
  const isStructural = signalCount >= 3;

  let finalResp: SupportResponse = {
    ...executed, requestId: req.requestId,
    warnings: mergeUniqueWarnings(decision.warnings, executed.warnings,
      isStructural ? [`"${signalKey}" has run ${signalCount} times. Structural review may be needed.`] : []),
    reserveUsed: decision.reserveUsed || executed.reserveUsed === true,
    followUpNeeded: decision.followUpNeeded || executed.followUpNeeded === true,
    followUpSummary: executed.followUpSummary ?? decision.followUpSummary,
  };

  tr("execution_completed", `Completed "${decision.matchedCapability}" on "${node.nodeId}".`, finalResp, finalResp.opensQuestion);

  // Record insight if response carries one
  if (finalResp.accepted && finalResp.insight) {
    try {
      recordInsight(req.requestId, node.nodeId, finalResp.insight,
        finalResp.opensQuestion ?? `What did "${decision.matchedCapability}" on "${node.nodeId}" reveal?`);
    } catch { /* insight too short — skip */ }
  }

  if (finalResp.followUpNeeded) {
    tr("follow_up_created", finalResp.followUpSummary ?? "Follow-up created.", finalResp, finalResp.opensQuestion);
  }

  return { executed: true, selectedNodeId: node.nodeId, matchedCapability: decision.matchedCapability, response: finalResp, signalCount, isStructural };
}

// ─────────────────────────────────────────────
// ENGINE — Multi-step execution
// ─────────────────────────────────────────────

function deriveNextType(resp: SupportResponse, current: SupportRequest): SupportRequestType | undefined {
  if (!resp.followUpNeeded) return undefined;
  const m: Partial<Record<SupportRequestType, SupportRequestType>> = { fallback: "validation", repair: "validation", reentry: "repair" };
  return m[current.requestType];
}

function deriveNextUrgency(u?: SupportUrgency): SupportUrgency {
  if (!u || u === "normal") return "degraded";
  return u;
}

function buildFollowUp(current: SupportRequest, resp: SupportResponse, step: number): SupportRequest | undefined {
  const nextType = deriveNextType(resp, current);
  if (!nextType) return undefined;
  const root = current.rootRequestId ?? current.requestId;
  return {
    requestId: `${root}::followup::${step + 1}`, rootRequestId: root,
    parentRequestId: current.requestId, requesterId: current.requesterId,
    requestType: nextType, targetId: current.targetId,
    reason: resp.followUpSummary ?? `Auto follow-up after ${current.requestType}.`,
    contextNotes: `Step ${step}. Previous: ${resp.responderId}.`,
    automatic: true, urgency: deriveNextUrgency(current.urgency), allowReserve: false,
  };
}

function et(req: SupportRequest, stage: Parameters<typeof recordEngineTrace>[0]["stage"], summary: string, step?: number, resp?: SupportResponse, stopped?: string, q?: string) {
  recordEngineTrace({ request: req, stage, stepIndex: step, response: resp, summary, stoppedBecause: stopped, opensQuestion: q });
}

export function runSupportEngine(initial: SupportRequest, options?: SupportEngineOptions): SupportEngineResult {
  const maxSteps = Math.max(1, options?.maxSteps ?? 3);
  const steps: SupportEngineStep[] = [];
  let current: SupportRequest | undefined = initial;
  let lastResp: SupportResponse | undefined;
  let stopped = "completed";
  let warnings: string[] = [];
  const allQ: string[] = [];

  et(initial, "engine_started", `Engine started for "${initial.requestType}".`);

  for (let i = 0; i < maxSteps; i++) {
    if (!current) {
      stopped = "no-further-request";
      et(initial, "engine_stopped", "No further request.", i, undefined, stopped,
        "No further request available — what condition should have generated one?");
      break;
    }

    et(current, "step_started", `Step ${i}: "${current.requestType}".`, i);

    const execution = runSupportRequest(current);
    steps.push({ stepIndex: i, request: current, execution, opensQuestion: execution.response.opensQuestion });
    if (execution.response.opensQuestion) allQ.push(execution.response.opensQuestion);

    lastResp = execution.response;
    warnings = mergeUniqueWarnings(warnings, execution.response.warnings);

    et(current, "step_completed",
      `Step ${i}: responder="${execution.response.responderId}", accepted=${execution.response.accepted}.`,
      i, execution.response, undefined, execution.response.opensQuestion);

    if (!execution.response.followUpNeeded) {
      stopped = "follow-up-not-needed";
      et(current, "engine_stopped", "Follow-up not needed.", i, execution.response, stopped,
        "Follow-up not needed — genuinely resolved or just not escalated?");
      break;
    }

    const next = buildFollowUp(current, execution.response, i);
    if (!next) {
      stopped = "follow-up-could-not-be-derived";
      const q = "Follow-up needed but not derivable — what request type mapping is missing?";
      et(current, "follow_up_not_derived", "Follow-up not derivable.", i, execution.response, stopped, q);
      et(current, "engine_stopped", "Engine stopped.", i, execution.response, stopped, q);
      allQ.push(q);
      break;
    }

    et(current, "follow_up_derived", `Follow-up "${next.requestType}" derived.`, i, execution.response, undefined,
      `Follow-up "${next.requestType}" derived — is this the right continuation?`);
    current = next;

    if (i === maxSteps - 1) {
      stopped = "max-steps-reached";
      const q = `Max steps (${maxSteps}) reached — is this the right limit?`;
      et(current, "engine_stopped", "Max steps reached.", i, undefined, stopped, q);
      allQ.push(q);
    }
  }

  const loopCheck = detectLoop(allQ);

  const finalResp: SupportResponse = lastResp
    ? { ...lastResp, warnings: mergeUniqueWarnings(lastResp.warnings, warnings) }
    : {
        requestId: initial.requestId, responderId: "support-engine", accepted: false,
        actionSummary: "Engine ended without response.", warnings: mergeUniqueWarnings(["No step executed."], warnings),
        followUpNeeded: false, opensQuestion: "Engine produced no response — what prevented execution?",
      };

  return {
    ok: finalResp.accepted, steps, finalResponse: finalResp, stoppedBecause: stopped,
    openQuestions: [...new Set(allQ)],
    loopDetected: loopCheck.isLooping ? loopCheck.escapeQuestion : undefined,
  };
}
