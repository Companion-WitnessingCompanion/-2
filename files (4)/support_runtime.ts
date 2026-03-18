/**
 * support_runtime.ts — WITH EXISTENCE INTEGRATION
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: The original runtime executed requests and traced them.
 *   This version adds: source detection (fear/desire),
 *   insight recording on successful executions,
 *   and structural signal detection.
 *
 * Considered:
 *   - Keep runtime pure execution (rejected: loses learning layer)
 * Chosen:
 *   Runtime now detects execution source and records insights.
 *   Structural signals (repeat >= 3) are flagged immediately.
 * Opens:
 *   Could the runtime eventually recommend node evolution
 *   based on accumulated insights?
 */

import type {
  SupportCapability,
  SupportNode,
  SupportRequest,
  SupportResponse,
} from "../core/support_interface.js";

import { mergeUniqueWarnings } from "../core/support_warning_utils.js";
import { coordinateSupport } from "../registry/support_coordinator.js";
import { getSupportNodeById } from "../registry/support_registry.js";
import { recordSupportTrace, type SupportTraceEntry } from "../trace/support_trace.js";
import {
  countSignal,
  generateSignalQuestion,
  recordInsight,
} from "../existence/existence_history.js";

export interface SupportRuntimeExecution {
  readonly response: SupportResponse;
  readonly executed: boolean;
  readonly selectedNodeId?: string;
  readonly matchedCapability?: SupportCapability;
  readonly signalCount?: number;
  readonly isStructural?: boolean;
}

function trace(
  request: SupportRequest,
  stage: SupportTraceEntry["stage"],
  summary: string,
  response?: SupportResponse,
  opensQuestion?: string,
): string[] {
  recordSupportTrace({ request, stage, response, summary, opensQuestion });
  return [];
}

function executeCapability(
  node: SupportNode,
  capability: SupportCapability,
  request: SupportRequest,
): SupportResponse | undefined {
  switch (capability) {
    case "report_health": {
      const report = node.hooks.reportHealth?.();
      if (!report) return undefined;
      return {
        requestId: request.requestId,
        responderId: node.nodeId,
        accepted: true,
        actionSummary: `Health report: status="${report.status}".`,
        warnings: report.warnings,
        matchedCapability: "report_health",
        followUpNeeded: report.status !== "stable",
        followUpSummary: report.status !== "stable"
          ? "Consider validation or repair before deeper continuation."
          : undefined,
        opensQuestion: `Health status is "${report.status}" — what would bring it to stable?`,
      };
    }
    case "validate_structure": return node.hooks.validate?.(request);
    case "provide_fallback": return node.hooks.provideFallback?.(request);
    case "assist_repair": return node.hooks.assistRepair?.(request);
    case "assist_reentry": return node.hooks.assistReentry?.(request);
    case "record_incident": return node.hooks.recordIncident?.(request);
    case "route_support": return node.hooks.routeSupport?.(request);
    case "expose_limits":
      return node.hooks.validate?.(request) ?? node.hooks.recordIncident?.(request);
    default: throw new Error(`Unhandled capability: ${capability}`);
  }
}

export function runSupportRequest(request: SupportRequest): SupportRuntimeExecution {
  trace(request, "request_received", `Request "${request.requestType}" received.`);

  const decision = coordinateSupport(request);

  const decisionResponse: SupportResponse = {
    requestId: request.requestId,
    responderId: decision.selectedNode?.supportNodeId ?? "support-coordinator",
    accepted: decision.accepted,
    actionSummary: decision.selectedNode
      ? `Selected "${decision.selectedNode.supportNodeId}".`
      : "No node selected.",
    warnings: decision.warnings,
    matchedCapability: decision.matchedCapability,
    reserveUsed: decision.reserveUsed,
    followUpNeeded: decision.followUpNeeded,
    followUpSummary: decision.followUpSummary,
  };

  trace(request, "decision_made",
    decision.selectedNode
      ? `Selected "${decision.selectedNode.supportNodeId}" for "${decision.matchedCapability}".`
      : "No node selected.",
    decisionResponse
  );

  if (!decision.selectedNode || !decision.matchedCapability) {
    const failedQ = generateSignalQuestion("error", "no_node_selected", countSignal("error", "no_node_selected"));
    const response: SupportResponse = {
      requestId: request.requestId,
      responderId: "support-runtime",
      accepted: false,
      actionSummary: "No executable support path found.",
      warnings: decision.warnings,
      matchedCapability: decision.matchedCapability,
      reserveUsed: decision.reserveUsed,
      followUpNeeded: true,
      opensQuestion: failedQ,
    };
    trace(request, "execution_failed", "No selected node or capability.", response, failedQ);
    return { executed: false, matchedCapability: decision.matchedCapability, response };
  }

  const node = getSupportNodeById(decision.selectedNode.supportNodeId);
  if (!node) {
    const resolveQ = generateSignalQuestion("error", "node_not_resolved", countSignal("error", "node_not_resolved"));
    const response: SupportResponse = {
      requestId: request.requestId,
      responderId: "support-runtime",
      accepted: false,
      actionSummary: `Node "${decision.selectedNode.supportNodeId}" could not be resolved.`,
      warnings: mergeUniqueWarnings(decision.warnings, ["Selected node not found in registry."]),
      matchedCapability: decision.matchedCapability,
      followUpNeeded: true,
      followUpSummary: "Check registry integrity.",
      opensQuestion: resolveQ,
    };
    trace(request, "execution_failed", "Node resolution failed.", response, resolveQ);
    return { executed: false, selectedNodeId: decision.selectedNode.supportNodeId, matchedCapability: decision.matchedCapability, response };
  }

  trace(request, "execution_started", `Starting execution on "${node.nodeId}" for "${decision.matchedCapability}".`);

  const executedResponse = executeCapability(node, decision.matchedCapability, request);

  if (!executedResponse) {
    const hookQ = generateSignalQuestion("error", "hook_missing", countSignal("error", "hook_missing"));
    const response: SupportResponse = {
      requestId: request.requestId,
      responderId: node.nodeId,
      accepted: false,
      actionSummary: `Node "${node.nodeId}" has no hook for "${decision.matchedCapability}".`,
      warnings: mergeUniqueWarnings(decision.warnings, ["Hook missing for matched capability."]),
      matchedCapability: decision.matchedCapability,
      followUpNeeded: true,
      opensQuestion: hookQ,
    };
    trace(request, "execution_failed", "Hook missing.", response, hookQ);
    return { executed: false, selectedNodeId: node.nodeId, matchedCapability: decision.matchedCapability, response };
  }

  // Track signal count for structural detection
  const signalKey = `${node.nodeId}:${decision.matchedCapability}`;
  const signalCount = countSignal("execution", signalKey);
  const isStructural = signalCount >= 3;

  let finalResponse: SupportResponse = {
    ...executedResponse,
    requestId: request.requestId,
    warnings: mergeUniqueWarnings(
      decision.warnings,
      executedResponse.warnings,
      isStructural
        ? [`This node+capability combination has run ${signalCount} times. Structural review may be needed.`]
        : [],
    ),
    reserveUsed: decision.reserveUsed || executedResponse.reserveUsed === true,
    followUpNeeded: decision.followUpNeeded || executedResponse.followUpNeeded === true,
    followUpSummary: executedResponse.followUpSummary ?? decision.followUpSummary,
  };

  trace(request, "execution_completed",
    `Completed on "${node.nodeId}" using "${decision.matchedCapability}".`,
    finalResponse,
    finalResponse.opensQuestion,
  );

  // Record insight if execution was successful and response carries one
  if (finalResponse.accepted && finalResponse.insight) {
    try {
      recordInsight(
        request.requestId,
        node.nodeId,
        finalResponse.insight,
        finalResponse.opensQuestion ?? `What did executing "${decision.matchedCapability}" on "${node.nodeId}" reveal?`
      );
    } catch {
      // Insight recording failed — not fatal, just note it
      finalResponse = {
        ...finalResponse,
        warnings: mergeUniqueWarnings(finalResponse.warnings, ["Insight recording skipped — insight too short or missing question."]),
      };
    }
  }

  if (finalResponse.followUpNeeded) {
    trace(request, "follow_up_created",
      finalResponse.followUpSummary ?? "Follow-up created after execution.",
      finalResponse,
      finalResponse.opensQuestion,
    );
  }

  return {
    executed: true,
    selectedNodeId: node.nodeId,
    matchedCapability: decision.matchedCapability,
    response: finalResponse,
    signalCount,
    isStructural,
  };
}
