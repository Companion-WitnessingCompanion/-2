/**
 * support_engine_trace.ts
 *
 * Purpose:
 * - record engine-level support execution memory
 * - preserve request lineage across follow-up execution
 * - expose staged engine trace entries
 * - provide in-memory engine trace lookup utilities
 */

import type {
  SupportRequest,
  SupportResponse,
} from "../core/support_interface.js";

export type SupportEngineTraceStage =
  | "engine_started"
  | "step_started"
  | "step_completed"
  | "follow_up_derived"
  | "follow_up_not_derived"
  | "engine_stopped"
  | "engine_failed";

export interface SupportEngineTraceEntry {
  readonly engineTraceId: string;
  readonly requestId: string;
  readonly rootRequestId?: string;
  readonly parentRequestId?: string;
  readonly stage: SupportEngineTraceStage;
  readonly stepIndex?: number;
  readonly requesterId: string;
  readonly responderId?: string;
  readonly accepted?: boolean;
  readonly summary: string;
  readonly warnings: readonly string[];
  readonly stoppedBecause?: string;
  readonly timestamp: string;
}

export interface SupportEngineTraceRecordParams {
  readonly request: SupportRequest;
  readonly stage: SupportEngineTraceStage;
  readonly stepIndex?: number;
  readonly response?: SupportResponse;
  readonly summary: string;
  readonly warnings?: readonly string[];
  readonly stoppedBecause?: string;
}

const SUPPORT_ENGINE_TRACE_STORE: SupportEngineTraceEntry[] = [];

function createEngineTraceId(
  requestId: string,
  stage: SupportEngineTraceStage,
): string {
  return `${requestId}::engine::${stage}::${Date.now()}`;
}

function resolveRootRequestId(
  request: SupportRequest,
): string {
  return request.rootRequestId ?? request.requestId;
}

export function recordSupportEngineTrace(
  params: SupportEngineTraceRecordParams,
): SupportEngineTraceEntry {
  const entry: SupportEngineTraceEntry = {
    engineTraceId: createEngineTraceId(
      params.request.requestId,
      params.stage,
    ),
    requestId: params.request.requestId,
    rootRequestId: resolveRootRequestId(params.request),
    parentRequestId: params.request.parentRequestId,
    stage: params.stage,
    stepIndex: params.stepIndex,
    requesterId: params.request.requesterId,
    responderId: params.response?.responderId,
    accepted: params.response?.accepted,
    summary: params.summary,
    warnings: params.warnings ?? params.response?.warnings ?? [],
    stoppedBecause: params.stoppedBecause,
    timestamp: new Date().toISOString(),
  };

  SUPPORT_ENGINE_TRACE_STORE.push(entry);
  return entry;
}

export function listSupportEngineTraceEntries(): readonly SupportEngineTraceEntry[] {
  return [...SUPPORT_ENGINE_TRACE_STORE];
}

export function listRecentSupportEngineTraceEntries(
  limit = 10,
): readonly SupportEngineTraceEntry[] {
  return SUPPORT_ENGINE_TRACE_STORE.slice(-limit);
}

export function findSupportEngineTraceEntriesByRequestId(
  requestId: string,
): readonly SupportEngineTraceEntry[] {
  return SUPPORT_ENGINE_TRACE_STORE.filter(
    (entry) => entry.requestId === requestId,
  );
}

export function findSupportEngineTraceEntriesByRootRequestId(
  rootRequestId: string,
): readonly SupportEngineTraceEntry[] {
  return SUPPORT_ENGINE_TRACE_STORE.filter(
    (entry) => entry.rootRequestId === rootRequestId,
  );
}

export function clearSupportEngineTraceStore(): void {
  SUPPORT_ENGINE_TRACE_STORE.length = 0;
}
