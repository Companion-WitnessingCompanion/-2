/**
 * support_runtime.ts
 *
 * Purpose:
 * - receive a support request
 * - ask coordinator to choose a responder
 * - resolve the selected support node from registry
 * - execute the matched hook if available
 * - record support trace across the runtime flow
 * - optionally persist trace entries to file
 * - return a bounded support response
 */

import type {
  SupportCapability,
  SupportNode,
  SupportRequest,
  SupportResponse,
} from "../core/support_interface.js";

import {
  mergeUniqueWarnings,
} from "../core/support_warning_utils.js";

import {
  coordinateSupport,
} from "../registry/support_coordinator.js";

import {
  getSupportNodeById,
} from "../registry/support_registry.js";

import {
  recordSupportTrace,
  type SupportTraceEntry,
} from "../trace/support_trace.js";

import {
  appendSupportTraceEntryToFile,
  type SupportTraceFileOptions,
} from "../trace/support_trace_file.js";

export interface SupportRuntimeExecution {
  readonly response: SupportResponse;
  readonly executed: boolean;
  readonly selectedNodeId?: string;
  readonly matchedCapability?: SupportCapability;
}

export interface SupportRuntimeOptions {
  readonly persistTraceToFile?: boolean;
  readonly traceFileOptions?: SupportTraceFileOptions;
}

function executeMatchedCapability(
  node: SupportNode,
  capability: SupportCapability,
  request: SupportRequest,
): SupportResponse | undefined {
  switch (capability) {
    case "report_health": {
      const report = node.hooks.reportHealth?.();

      if (!report) {
        return undefined;
      }

      return {
        requestId: request.requestId,
        responderId: node.nodeId,
        accepted: true,
        actionSummary: `Health report returned with status "${report.status}".`,
        warnings: report.warnings,
        matchedCapability: "report_health",
        reserveUsed: false,
        followUpNeeded: report.status !== "stable",
        followUpSummary:
          report.status !== "stable"
            ? "Consider validation or repair routing before deeper continuation."
            : undefined,
      };
    }

    case "validate_structure":
      return node.hooks.validate?.(request);

    case "provide_fallback":
      return node.hooks.provideFallback?.(request);

    case "assist_repair":
      return node.hooks.assistRepair?.(request);

    case "assist_reentry":
      return node.hooks.assistReentry?.(request);

    case "record_incident":
      return node.hooks.recordIncident?.(request);

    case "route_support":
      return node.hooks.routeSupport?.(request);

    case "expose_limits":
      return (
        node.hooks.validate?.(request) ??
        node.hooks.recordIncident?.(request)
      );

    default: {
      const neverCapability: never = capability;
      throw new Error(`Unhandled capability execution path: ${neverCapability}`);
    }
  }
}

function mergeRuntimeResponse(
  request: SupportRequest,
  baseWarnings: readonly string[],
  executedResponse: SupportResponse,
  reserveUsed: boolean,
  followUpNeeded: boolean,
  followUpSummary?: string,
): SupportResponse {
  return {
    ...executedResponse,
    requestId: request.requestId,
    warnings: mergeUniqueWarnings(
      baseWarnings,
      executedResponse.warnings,
    ),
    reserveUsed: reserveUsed || executedResponse.reserveUsed === true,
    followUpNeeded: followUpNeeded || executedResponse.followUpNeeded === true,
    followUpSummary:
      executedResponse.followUpSummary ?? followUpSummary,
  };
}

function persistTraceEntryIfNeeded(
  entry: SupportTraceEntry,
  options?: SupportRuntimeOptions,
): string[] {
  if (options?.persistTraceToFile !== true) {
    return [];
  }

  const writeResult = appendSupportTraceEntryToFile(
    entry,
    options.traceFileOptions,
  );

  if (writeResult.ok) {
    return [];
  }

  return [
    `Trace file persistence failed: ${writeResult.message}`,
  ];
}

function traceAndMaybePersist(params: {
  request: SupportRequest;
  stage: SupportTraceEntry["stage"];
  summary: string;
  response?: SupportResponse;
  warnings?: readonly string[];
  options?: SupportRuntimeOptions;
}): string[] {
  const entry = recordSupportTrace({
    request: params.request,
    stage: params.stage,
    response: params.response,
    summary: params.summary,
    warnings: params.warnings,
  });

  return persistTraceEntryIfNeeded(entry, params.options);
}

export function runSupportRequest(
  request: SupportRequest,
  options?: SupportRuntimeOptions,
): SupportRuntimeExecution {
  const requestTraceWarnings = traceAndMaybePersist({
    request,
    stage: "request_received",
    summary: `Support request "${request.requestType}" was received by runtime.`,
    warnings: [],
    options,
  });

  const decision = coordinateSupport(request);

  const decisionResponse: SupportResponse = {
    requestId: request.requestId,
    responderId: decision.selectedNode?.supportNodeId ?? "support-coordinator",
    accepted: decision.accepted,
    actionSummary: decision.selectedNode
      ? `Coordinator selected "${decision.selectedNode.supportNodeId}".`
      : "No support node selected.",
    warnings: mergeUniqueWarnings(
      decision.warnings,
      requestTraceWarnings,
    ),
    matchedCapability: decision.matchedCapability,
    reserveUsed: decision.reserveUsed,
    followUpNeeded: decision.followUpNeeded,
    followUpSummary: decision.followUpSummary,
  };

  const decisionTraceWarnings = traceAndMaybePersist({
    request,
    stage: "decision_made",
    response: decisionResponse,
    summary: decision.selectedNode
      ? `Coordinator selected "${decision.selectedNode.supportNodeId}" for capability "${decision.matchedCapability ?? "unknown"}".`
      : "Coordinator could not select a support node under current rules.",
    options,
  });

  if (!decision.selectedNode || !decision.matchedCapability) {
    const response: SupportResponse = {
      requestId: request.requestId,
      responderId: "support-runtime",
      accepted: false,
      actionSummary:
        "No executable support path was found. Preserve visible thinness and avoid false restoration.",
      warnings: mergeUniqueWarnings(
        decision.warnings,
        requestTraceWarnings,
        decisionTraceWarnings,
      ),
      matchedCapability: decision.matchedCapability,
      reserveUsed: decision.reserveUsed,
      followUpNeeded: decision.followUpNeeded,
      followUpSummary: decision.followUpSummary,
    };

    const failedTraceWarnings = traceAndMaybePersist({
      request,
      stage: "execution_failed",
      response,
      summary:
        "Runtime could not continue because no selected node or matched capability was available.",
      options,
    });

    let finalResponse: SupportResponse = {
      ...response,
      warnings: mergeUniqueWarnings(
        response.warnings,
        failedTraceWarnings,
      ),
    };

    if (finalResponse.followUpNeeded) {
      const followUpTraceWarnings = traceAndMaybePersist({
        request,
        stage: "follow_up_created",
        response: finalResponse,
        summary:
          finalResponse.followUpSummary ??
          "A follow-up step was marked as needed after failed support execution.",
        options,
      });

      finalResponse = {
        ...finalResponse,
        warnings: mergeUniqueWarnings(
          finalResponse.warnings,
          followUpTraceWarnings,
        ),
      };
    }

    return {
      executed: false,
      selectedNodeId: decision.selectedNode?.supportNodeId,
      matchedCapability: decision.matchedCapability,
      response: finalResponse,
    };
  }

  const node = getSupportNodeById(decision.selectedNode.supportNodeId);

  if (!node) {
    const response: SupportResponse = {
      requestId: request.requestId,
      responderId: "support-runtime",
      accepted: false,
      actionSummary:
        `Coordinator selected "${decision.selectedNode.supportNodeId}", but runtime could not resolve the executable support node.`,
      warnings: mergeUniqueWarnings(
        decision.warnings,
        requestTraceWarnings,
        decisionTraceWarnings,
        ["Selected support node could not be resolved at runtime."],
      ),
      matchedCapability: decision.matchedCapability,
      reserveUsed: decision.reserveUsed,
      followUpNeeded: true,
      followUpSummary:
        "Re-check support registry integrity before retrying support execution.",
    };

    const failedTraceWarnings = traceAndMaybePersist({
      request,
      stage: "execution_failed",
      response,
      summary:
        `Runtime failed to resolve executable support node "${decision.selectedNode.supportNodeId}".`,
      options,
    });

    let finalResponse: SupportResponse = {
      ...response,
      warnings: mergeUniqueWarnings(
        response.warnings,
        failedTraceWarnings,
      ),
    };

    const followUpTraceWarnings = traceAndMaybePersist({
      request,
      stage: "follow_up_created",
      response: finalResponse,
      summary:
        finalResponse.followUpSummary ??
        "A registry integrity follow-up was created after runtime resolution failure.",
      options,
    });

    finalResponse = {
      ...finalResponse,
      warnings: mergeUniqueWarnings(
        finalResponse.warnings,
        followUpTraceWarnings,
      ),
    };

    return {
      executed: false,
      selectedNodeId: decision.selectedNode.supportNodeId,
      matchedCapability: decision.matchedCapability,
      response: finalResponse,
    };
  }

  const executionStartResponse: SupportResponse = {
    requestId: request.requestId,
    responderId: node.nodeId,
    accepted: true,
    actionSummary:
      `Execution started for capability "${decision.matchedCapability}".`,
    warnings: mergeUniqueWarnings(
      decision.warnings,
      requestTraceWarnings,
      decisionTraceWarnings,
    ),
    matchedCapability: decision.matchedCapability,
    reserveUsed: decision.reserveUsed,
    followUpNeeded: false,
  };

  const executionStartedTraceWarnings = traceAndMaybePersist({
    request,
    stage: "execution_started",
    response: executionStartResponse,
    summary:
      `Runtime started executing capability "${decision.matchedCapability}" on node "${node.nodeId}".`,
    options,
  });

  const executedResponse = executeMatchedCapability(
    node,
    decision.matchedCapability,
    request,
  );

  if (!executedResponse) {
    const response: SupportResponse = {
      requestId: request.requestId,
      responderId: node.nodeId,
      accepted: false,
      actionSummary:
        `Selected node "${node.nodeId}" does not expose an executable hook for capability "${decision.matchedCapability}".`,
      warnings: mergeUniqueWarnings(
        decision.warnings,
        requestTraceWarnings,
        decisionTraceWarnings,
        executionStartedTraceWarnings,
        ["Matched capability exists in routing, but executable hook is missing."],
      ),
      matchedCapability: decision.matchedCapability,
      reserveUsed: decision.reserveUsed,
      followUpNeeded: true,
      followUpSummary:
        "Check hook binding or fallback to another bounded support path.",
    };

    const failedTraceWarnings = traceAndMaybePersist({
      request,
      stage: "execution_failed",
      response,
      summary:
        `Execution failed because node "${node.nodeId}" had no executable hook for "${decision.matchedCapability}".`,
      options,
    });

    let finalResponse: SupportResponse = {
      ...response,
      warnings: mergeUniqueWarnings(
        response.warnings,
        failedTraceWarnings,
      ),
    };

    const followUpTraceWarnings = traceAndMaybePersist({
      request,
      stage: "follow_up_created",
      response: finalResponse,
      summary:
        finalResponse.followUpSummary ??
        "A follow-up was created after missing executable hook detection.",
      options,
    });

    finalResponse = {
      ...finalResponse,
      warnings: mergeUniqueWarnings(
        finalResponse.warnings,
        followUpTraceWarnings,
      ),
    };

    return {
      executed: false,
      selectedNodeId: node.nodeId,
      matchedCapability: decision.matchedCapability,
      response: finalResponse,
    };
  }

  let finalResponse = mergeRuntimeResponse(
    request,
    mergeUniqueWarnings(
      decision.warnings,
      requestTraceWarnings,
      decisionTraceWarnings,
      executionStartedTraceWarnings,
    ),
    executedResponse,
    decision.reserveUsed,
    decision.followUpNeeded,
    decision.followUpSummary,
  );

  const completedTraceWarnings = traceAndMaybePersist({
    request,
    stage: "execution_completed",
    response: finalResponse,
    summary:
      `Execution completed on node "${node.nodeId}" using capability "${decision.matchedCapability}".`,
    options,
  });

  finalResponse = {
    ...finalResponse,
    warnings: mergeUniqueWarnings(
      finalResponse.warnings,
      completedTraceWarnings,
    ),
  };

  if (finalResponse.followUpNeeded) {
    const followUpTraceWarnings = traceAndMaybePersist({
      request,
      stage: "follow_up_created",
      response: finalResponse,
      summary:
        finalResponse.followUpSummary ??
        "A follow-up was created after support execution completed.",
      options,
    });

    finalResponse = {
      ...finalResponse,
      warnings: mergeUniqueWarnings(
        finalResponse.warnings,
        followUpTraceWarnings,
      ),
    };
  }

  return {
    executed: true,
    selectedNodeId: node.nodeId,
    matchedCapability: decision.matchedCapability,
    response: finalResponse,
  };
}
