/**
 * support_engine.ts
 *
 * Purpose:
 * - execute one support request
 * - derive bounded follow-up requests when needed
 * - preserve request lineage across follow-up execution
 * - record engine-level staged trace
 * - optionally persist engine trace entries to file
 */

import type {
  SupportRequest,
  SupportRequestType,
  SupportResponse,
  SupportUrgency,
} from "../core/support_interface.js";

import {
  mergeUniqueWarnings,
} from "../core/support_warning_utils.js";

import {
  runSupportRequest,
  type SupportRuntimeExecution,
  type SupportRuntimeOptions,
} from "./support_runtime.js";

import {
  recordSupportEngineTrace,
  type SupportEngineTraceEntry,
} from "../trace/support_engine_trace.js";

import {
  appendSupportEngineTraceEntryToFile,
  type SupportEngineTraceFileOptions,
} from "../trace/support_engine_trace_file.js";

export interface SupportEngineOptions {
  readonly maxSteps?: number;
  readonly runtimeOptions?: SupportRuntimeOptions;
  readonly persistEngineTraceToFile?: boolean;
  readonly engineTraceFileOptions?: SupportEngineTraceFileOptions;
}

export interface SupportEngineStep {
  readonly stepIndex: number;
  readonly request: SupportRequest;
  readonly execution: SupportRuntimeExecution;
}

export interface SupportEngineResult {
  readonly ok: boolean;
  readonly steps: readonly SupportEngineStep[];
  readonly finalResponse: SupportResponse;
  readonly stoppedBecause: string;
}

function deriveNextRequestType(
  response: SupportResponse,
  currentRequest: SupportRequest,
): SupportRequestType | undefined {
  if (!response.followUpNeeded) {
    return undefined;
  }

  if (currentRequest.requestType === "fallback") {
    return "validation";
  }

  if (currentRequest.requestType === "repair") {
    return "validation";
  }

  if (currentRequest.requestType === "reentry") {
    return "repair";
  }

  return undefined;
}

function deriveNextUrgency(
  currentUrgency: SupportUrgency | undefined,
): SupportUrgency {
  if (!currentUrgency) {
    return "degraded";
  }

  if (currentUrgency === "normal") {
    return "degraded";
  }

  return currentUrgency;
}

function buildFollowUpRequest(
  currentRequest: SupportRequest,
  response: SupportResponse,
  stepIndex: number,
): SupportRequest | undefined {
  const nextType = deriveNextRequestType(response, currentRequest);

  if (!nextType) {
    return undefined;
  }

  const rootRequestId =
    currentRequest.rootRequestId ?? currentRequest.requestId;

  const nextRequestId = `${rootRequestId}::followup::${stepIndex + 1}`;

  return {
    requestId: nextRequestId,
    rootRequestId,
    parentRequestId: currentRequest.requestId,
    requesterId: currentRequest.requesterId,
    requestType: nextType,
    targetId: currentRequest.targetId,
    reason:
      response.followUpSummary ??
      `Auto-generated follow-up after ${currentRequest.requestType}.`,
    contextNotes:
      `Generated from follow-up path after step ${stepIndex}. Previous responder: ${response.responderId}.`,
    automatic: true,
    urgency: deriveNextUrgency(currentRequest.urgency),
    allowReserve: false,
  };
}

function persistEngineTraceEntryIfNeeded(
  entry: SupportEngineTraceEntry,
  options?: SupportEngineOptions,
): string[] {
  if (options?.persistEngineTraceToFile !== true) {
    return [];
  }

  const writeResult = appendSupportEngineTraceEntryToFile(
    entry,
    options.engineTraceFileOptions,
  );

  if (writeResult.ok) {
    return [];
  }

  return [`Engine trace file persistence failed: ${writeResult.message}`];
}

function engineTraceAndMaybePersist(params: {
  request: SupportRequest;
  stage: SupportEngineTraceEntry["stage"];
  stepIndex?: number;
  response?: SupportResponse;
  summary: string;
  warnings?: readonly string[];
  stoppedBecause?: string;
  options?: SupportEngineOptions;
}): string[] {
  const entry = recordSupportEngineTrace({
    request: params.request,
    stage: params.stage,
    stepIndex: params.stepIndex,
    response: params.response,
    summary: params.summary,
    warnings: params.warnings,
    stoppedBecause: params.stoppedBecause,
  });

  return persistEngineTraceEntryIfNeeded(entry, params.options);
}

export function runSupportEngine(
  initialRequest: SupportRequest,
  options?: SupportEngineOptions,
): SupportEngineResult {
  const maxSteps = Math.max(1, options?.maxSteps ?? 2);

  const steps: SupportEngineStep[] = [];
  let currentRequest: SupportRequest | undefined = initialRequest;
  let lastResponse: SupportResponse | undefined;
  let stoppedBecause = "completed";
  let engineWarnings: string[] = [];

  engineWarnings = mergeUniqueWarnings(
    engineWarnings,
    engineTraceAndMaybePersist({
      request: initialRequest,
      stage: "engine_started",
      stepIndex: 0,
      summary: `Support engine started for request "${initialRequest.requestType}".`,
      warnings: [],
      options,
    }),
  );

  for (let i = 0; i < maxSteps; i += 1) {
    if (!currentRequest) {
      stoppedBecause = "no-further-request";

      engineWarnings = mergeUniqueWarnings(
        engineWarnings,
        engineTraceAndMaybePersist({
          request: initialRequest,
          stage: "engine_stopped",
          stepIndex: i,
          summary:
            "Support engine stopped because no further request was available.",
          warnings: [],
          stoppedBecause,
          options,
        }),
      );

      break;
    }

    engineWarnings = mergeUniqueWarnings(
      engineWarnings,
      engineTraceAndMaybePersist({
        request: currentRequest,
        stage: "step_started",
        stepIndex: i,
        summary: `Engine step ${i} started for request type "${currentRequest.requestType}".`,
        warnings: [],
        options,
      }),
    );

    const execution = runSupportRequest(
      currentRequest,
      options?.runtimeOptions,
    );

    steps.push({
      stepIndex: i,
      request: currentRequest,
      execution,
    });

    lastResponse = execution.response;

    engineWarnings = mergeUniqueWarnings(
      engineWarnings,
      engineTraceAndMaybePersist({
        request: currentRequest,
        stage: "step_completed",
        stepIndex: i,
        response: execution.response,
        summary:
          `Engine step ${i} completed with responder "${execution.response.responderId}" and accepted=${execution.response.accepted}.`,
        warnings: execution.response.warnings,
        options,
      }),
    );

    if (!execution.response.followUpNeeded) {
      stoppedBecause = "follow-up-not-needed";

      engineWarnings = mergeUniqueWarnings(
        engineWarnings,
        engineTraceAndMaybePersist({
          request: currentRequest,
          stage: "engine_stopped",
          stepIndex: i,
          response: execution.response,
          summary:
            "Support engine stopped because follow-up was not needed after the current step.",
          warnings: execution.response.warnings,
          stoppedBecause,
          options,
        }),
      );

      break;
    }

    const nextRequest = buildFollowUpRequest(
      currentRequest,
      execution.response,
      i,
    );

    if (!nextRequest) {
      stoppedBecause = "follow-up-could-not-be-derived";

      engineWarnings = mergeUniqueWarnings(
        engineWarnings,
        engineTraceAndMaybePersist({
          request: currentRequest,
          stage: "follow_up_not_derived",
          stepIndex: i,
          response: execution.response,
          summary:
            "Follow-up was needed, but the engine could not derive the next request type.",
          warnings: execution.response.warnings,
          stoppedBecause,
          options,
        }),
      );

      engineWarnings = mergeUniqueWarnings(
        engineWarnings,
        engineTraceAndMaybePersist({
          request: currentRequest,
          stage: "engine_stopped",
          stepIndex: i,
          response: execution.response,
          summary:
            "Support engine stopped because follow-up could not be derived.",
          warnings: execution.response.warnings,
          stoppedBecause,
          options,
        }),
      );

      break;
    }

    engineWarnings = mergeUniqueWarnings(
      engineWarnings,
      engineTraceAndMaybePersist({
        request: currentRequest,
        stage: "follow_up_derived",
        stepIndex: i,
        response: execution.response,
        summary:
          `Follow-up request "${nextRequest.requestType}" was derived for next engine step.`,
        warnings: execution.response.warnings,
        options,
      }),
    );

    currentRequest = nextRequest;

    if (i == maxSteps - 1) {
      stoppedBecause = "max-steps-reached";

      engineWarnings = mergeUniqueWarnings(
        engineWarnings,
        engineTraceAndMaybePersist({
          request: currentRequest,
          stage: "engine_stopped",
          stepIndex: i,
          summary:
            "Support engine stopped because maximum step count was reached.",
          warnings: [],
          stoppedBecause,
          options,
        }),
      );
    }
  }

  const finalResponse: SupportResponse =
    lastResponse
      ? {
          ...lastResponse,
          warnings: mergeUniqueWarnings(
            lastResponse.warnings,
            engineWarnings,
          ),
        }
      : {
          requestId: initialRequest.requestId,
          responderId: "support-engine",
          accepted: false,
          actionSummary:
            "Support engine ended without producing any runtime response.",
          warnings: mergeUniqueWarnings(
            ["No runtime step was executed."],
            engineWarnings,
          ),
          followUpNeeded: false,
        };

  if (!lastResponse) {
    engineWarnings = mergeUniqueWarnings(
      engineWarnings,
      engineTraceAndMaybePersist({
        request: initialRequest,
        stage: "engine_failed",
        stepIndex: 0,
        response: finalResponse,
        summary:
          "Support engine failed to produce any runtime response.",
        warnings: finalResponse.warnings,
        stoppedBecause,
        options,
      }),
    );
  }

  const finalMergedWarnings = mergeUniqueWarnings(
    finalResponse.warnings,
    engineWarnings,
  );

  return {
    ok: finalResponse.accepted,
    steps,
    finalResponse: {
      ...finalResponse,
      warnings: finalMergedWarnings,
    },
    stoppedBecause,
  };
}
