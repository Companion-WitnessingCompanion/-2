import type { SupportTraceBundleDiffResult } from "./support_trace_bundle_diff.js";
export interface SupportTraceBundleDiffReport {
  readonly beforeTimestamp: string;
  readonly afterTimestamp: string;
  readonly headline: string;
  readonly changed: boolean;
  readonly runtimeTraceCountBefore: number;
  readonly runtimeTraceCountAfter: number;
  readonly runtimeTraceCountDelta: number;
  readonly engineTraceCountBefore: number;
  readonly engineTraceCountAfter: number;
  readonly engineTraceCountDelta: number;
  readonly summaryLines: readonly string[];
}
function buildHeadline(diff: SupportTraceBundleDiffResult): string {
  if (!diff.changed) return "Support trace bundle diff detected no material count change.";
  if (diff.runtimeTraceCountDelta > 0 && diff.engineTraceCountDelta > 0) return "Support trace bundle diff detected growth in both runtime and engine traces.";
  if (diff.runtimeTraceCountDelta > 0) return "Support trace bundle diff detected runtime trace growth.";
  if (diff.engineTraceCountDelta > 0) return "Support trace bundle diff detected engine trace growth.";
  return "Support trace bundle diff detected a count change between snapshots.";
}
export function buildSupportTraceBundleDiffReport(diff: SupportTraceBundleDiffResult): SupportTraceBundleDiffReport {
  return {
    beforeTimestamp: diff.beforeTimestamp,
    afterTimestamp: diff.afterTimestamp,
    headline: buildHeadline(diff),
    changed: diff.changed,
    runtimeTraceCountBefore: diff.runtimeTraceCountBefore,
    runtimeTraceCountAfter: diff.runtimeTraceCountAfter,
    runtimeTraceCountDelta: diff.runtimeTraceCountDelta,
    engineTraceCountBefore: diff.engineTraceCountBefore,
    engineTraceCountAfter: diff.engineTraceCountAfter,
    engineTraceCountDelta: diff.engineTraceCountDelta,
    summaryLines: [
      `before timestamp: ${diff.beforeTimestamp}`,
      `after timestamp: ${diff.afterTimestamp}`,
      `changed: ${diff.changed ? "yes" : "no"}`,
      `runtime trace count before: ${diff.runtimeTraceCountBefore}`,
      `runtime trace count after: ${diff.runtimeTraceCountAfter}`,
      `runtime trace count delta: ${diff.runtimeTraceCountDelta}`,
      `engine trace count before: ${diff.engineTraceCountBefore}`,
      `engine trace count after: ${diff.engineTraceCountAfter}`,
      `engine trace count delta: ${diff.engineTraceCountDelta}`,
    ],
  };
}
