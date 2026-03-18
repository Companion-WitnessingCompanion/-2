/**
 * support_trace.ts
 *
 * Purpose:
 * - record runtime-level support execution memory
 * - preserve request lineage across follow-up execution
 * - expose stage-by-stage support trace entries
 * - provide in-memory trace lookup utilities
 */

import type {
  SupportCapability,
  SupportRequest,
  SupportResponse,
} from "../core/support_interface.js";

export type SupportTraceStage =
  | "request_received"
  | "decision_made"
  | "execution_started"
  | "execution_completed"
  | "execution_failed"
  | "follow_up_created";

export interface SupportTraceEntry {
  readonly traceId: string;
  readonly requestId: string;
  readonly rootRequestId?: string;
  readonly parentRequestId?: string;
  readonly stage: SupportTraceStage;
  readonly requesterId: string;
  readonly responderId?: string;
  readonly matchedCapability?: SupportCapability;
  readonly accepted?: boolean;
  readonly reserveUsed?: boolean;
  readonly followUpNeeded?: boolean;
  readonly summary: string;
  readonly warnings: readonly string[];
  readonly timestamp: string;
}

export interface SupportTraceRecordParams {
  readonly request: SupportRequest;
  readonly stage: SupportTraceStage;
  readonly response?: SupportResponse;
  readonly summary: string;
  readonly warnings?: readonly string[];
}

const SUPPORT_TRACE_STORE: SupportTraceEntry[] = [];

function createTraceId(
  requestId: string,
  stage: SupportTraceStage,
): string {
  return `${requestId}::${stage}::${Date.now()}`;
}

function resolveRootRequestId(
  request: SupportRequest,
): string {
  return request.rootRequestId ?? request.requestId;
}

export function recordSupportTrace(
  params: SupportTraceRecordParams,
): SupportTraceEntry {
  const entry: SupportTraceEntry = {
    traceId: createTraceId(params.request.requestId, params.stage),
    requestId: params.request.requestId,
    rootRequestId: resolveRootRequestId(params.request),
    parentRequestId: params.request.parentRequestId,
    stage: params.stage,
    requesterId: params.request.requesterId,
    responderId: params.response?.responderId,
    matchedCapability: params.response?.matchedCapability,
    accepted: params.response?.accepted,
    reserveUsed: params.response?.reserveUsed,
    followUpNeeded: params.response?.followUpNeeded,
    summary: params.summary,
    warnings: params.warnings ?? params.response?.warnings ?? [],
    timestamp: new Date().toISOString(),
  };

  SUPPORT_TRACE_STORE.push(entry);
  return entry;
}

export function listSupportTraceEntries(): readonly SupportTraceEntry[] {
  return [...SUPPORT_TRACE_STORE];
}

export function listRecentSupportTraceEntries(
  limit = 10,
): readonly SupportTraceEntry[] {
  return SUPPORT_TRACE_STORE.slice(-limit);
}

export function findSupportTraceEntriesByRequestId(
  requestId: string,
): readonly SupportTraceEntry[] {
  return SUPPORT_TRACE_STORE.filter(
    (entry) => entry.requestId === requestId,
  );
}

export function findSupportTraceEntriesByRootRequestId(
  rootRequestId: string,
): readonly SupportTraceEntry[] {
  return SUPPORT_TRACE_STORE.filter(
    (entry) => entry.rootRequestId === rootRequestId,
  );
}

export function listReserveSupportTraceEntries(): readonly SupportTraceEntry[] {
  return SUPPORT_TRACE_STORE.filter(
    (entry) => entry.reserveUsed === true,
  );
}

export function clearSupportTraceStore(): void {
  SUPPORT_TRACE_STORE.length = 0;
}
