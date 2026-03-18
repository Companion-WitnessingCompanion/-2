/**
 * support_engine.ts — WITH EXISTENCE INTEGRATION
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: The engine executes requests in sequence,
 *   deriving follow-ups when needed.
 *   With existence layer: each step records questions,
 *   structural patterns are detected across steps,
 *   and what was learned is preserved.
 *
 * Considered:
 *   - Single-step only (rejected: some requests need multi-step resolution)
 *   - Unlimited steps (rejected: unbounded execution is dangerous)
 * Chosen:
 *   Bounded multi-step with maxSteps limit.
 *   Every stop records why it stopped — and what question that opens.
 *   Follow-up derivation is explicit and traceable.
 * Opens:
 *   Should maxSteps be dynamic based on urgency?
 *   Emergency requests might need more steps than normal ones.
 */

import type {
  SupportRequest,
  SupportRequestType,
  SupportResponse,
  SupportUrgency,
} from "../core/support_interface.js";
import { mergeUniqueWarnings } from "../core/support_warning_utils.js";
import { runSupportRequest, type SupportRuntimeExecution } from "./support_runtime.js";
import { recordSupportEngineTrace, type SupportEngineTraceEntry } from "../trace/support_engine_trace.js";
import { detectLoop, listInsights } from "../existence/existence_history.js";

export interface SupportEngineOptions {
  readonly maxSteps?: number;
}

export interface SupportEngineStep {
  readonly stepIndex: number;
  readonly request: SupportRequest;
  readonly execution: SupportRuntimeExecution;
  readonly opensQuestion?: string;
}

export interface SupportEngineResult {
  readonly ok: boolean;
  readonly steps: readonly SupportEngineStep[];
  readonly finalResponse: SupportResponse;
  readonly stoppedBecause: string;
  readonly openQuestions: readonly string[];
  readonly loopDetected?: string;
}

function deriveNextRequestType(
  response: SupportResponse,
  current: SupportRequest,
): SupportRequestType | undefined {
  if (!response.followUpNeeded) return undefined;

  const map: Partial<Record<SupportRequestType, SupportRequestType>> = {
    fallback: "validation",
    repair: "validation",
    reentry: "repair",
  };
  return map[current.requestType];
}

function deriveNextUrgency(current?: SupportUrgency): SupportUrgency {
  if (!current || current === "normal") return "degraded";
  return current;
}

function buildFollowUpRequest(
  current: SupportRequest,
  response: SupportResponse,
  stepIndex: number,
): SupportRequest | undefined {
  const nextType = deriveNextRequestType(response, current);
  if (!nextType) return undefined;

  const rootRequestId = current.rootRequestId ?? current.requestId;
  return {
    requestId: `${rootRequestId}::followup::${stepIndex + 1}`,
    rootRequestId,
    parentRequestId: current.requestId,
    requesterId: current.requesterId,
    requestType: nextType,
    targetId: current.targetId,
    reason: response.followUpSummary ?? `Auto follow-up after ${current.requestType}.`,
    contextNotes: `Generated at step ${stepIndex}. Previous responder: ${response.responderId}.`,
    automatic: true,
    urgency: deriveNextUrgency(current.urgency),
    allowReserve: false,
  };
}

function engineTrace(
  request: SupportRequest,
  stage: SupportEngineTraceEntry["stage"],
  summary: string,
  stepIndex?: number,
  response?: SupportResponse,
  stoppedBecause?: string,
  opensQuestion?: string,
): string[] {
  recordSupportEngineTrace({
    request, stage, stepIndex, response, summary,
    warnings: response?.warnings ?? [],
    stoppedBecause, opensQuestion,
  });
  return [];
}

export function runSupportEngine(
  initialRequest: SupportRequest,
  options?: SupportEngineOptions,
): SupportEngineResult {
  const maxSteps = Math.max(1, options?.maxSteps ?? 3);
  const steps: SupportEngineStep[] = [];
  let currentRequest: SupportRequest | undefined = initialRequest;
  let lastResponse: SupportResponse | undefined;
  let stoppedBecause = "completed";
  let engineWarnings: string[] = [];
  const allQuestions: string[] = [];

  engineTrace(initialRequest, "engine_started", `Engine started for "${initialRequest.requestType}".`);

  for (let i = 0; i < maxSteps; i++) {
    if (!currentRequest) {
      stoppedBecause = "no-further-request";
      engineTrace(initialRequest, "engine_stopped", "No further request.", i, undefined, stoppedBecause,
        "No further request was available — what condition should have generated one?");
      break;
    }

    engineTrace(currentRequest, "step_started", `Step ${i}: "${currentRequest.requestType}".`, i);

    const execution = runSupportRequest(currentRequest);
    steps.push({
      stepIndex: i,
      request: currentRequest,
      execution,
      opensQuestion: execution.response.opensQuestion,
    });

    if (execution.response.opensQuestion) {
      allQuestions.push(execution.response.opensQuestion);
    }

    lastResponse = execution.response;
    engineWarnings = mergeUniqueWarnings(engineWarnings, execution.response.warnings);

    engineTrace(currentRequest, "step_completed",
      `Step ${i} completed: responder="${execution.response.responderId}", accepted=${execution.response.accepted}.`,
      i, execution.response,
      undefined,
      execution.response.opensQuestion,
    );

    if (!execution.response.followUpNeeded) {
      stoppedBecause = "follow-up-not-needed";
      engineTrace(currentRequest, "engine_stopped",
        "Engine stopped — follow-up not needed.",
        i, execution.response, stoppedBecause,
        "Follow-up not needed — is this genuinely resolved or just not escalated?",
      );
      break;
    }

    const nextRequest = buildFollowUpRequest(currentRequest, execution.response, i);
    if (!nextRequest) {
      stoppedBecause = "follow-up-could-not-be-derived";
      const q = "Follow-up needed but not derivable — what request type mapping is missing?";
      engineTrace(currentRequest, "follow_up_not_derived",
        "Follow-up could not be derived.", i, execution.response, stoppedBecause, q);
      engineTrace(currentRequest, "engine_stopped",
        "Engine stopped — follow-up not derivable.", i, execution.response, stoppedBecause, q);
      allQuestions.push(q);
      break;
    }

    engineTrace(currentRequest, "follow_up_derived",
      `Follow-up "${nextRequest.requestType}" derived for step ${i + 1}.`,
      i, execution.response, undefined,
      `Follow-up "${nextRequest.requestType}" derived — is this the right continuation?`,
    );

    currentRequest = nextRequest;

    if (i === maxSteps - 1) {
      stoppedBecause = "max-steps-reached";
      const q = `Max steps (${maxSteps}) reached — is this limit right for this request type?`;
      engineTrace(currentRequest, "engine_stopped",
        "Engine stopped — max steps reached.", i, undefined, stoppedBecause, q);
      allQuestions.push(q);
    }
  }

  // Detect loops in questions
  const loopCheck = detectLoop(allQuestions);
  const loopDetected = loopCheck.isLooping ? loopCheck.escapeQuestion : undefined;

  const finalResponse: SupportResponse = lastResponse
    ? { ...lastResponse, warnings: mergeUniqueWarnings(lastResponse.warnings, engineWarnings) }
    : {
        requestId: initialRequest.requestId,
        responderId: "support-engine",
        accepted: false,
        actionSummary: "Engine ended without producing a runtime response.",
        warnings: mergeUniqueWarnings(["No step was executed."], engineWarnings),
        followUpNeeded: false,
        opensQuestion: "Engine produced no response — what prevented execution from starting?",
      };

  return {
    ok: finalResponse.accepted,
    steps,
    finalResponse,
    stoppedBecause,
    openQuestions: [...new Set(allQuestions)],
    loopDetected,
  };
}
