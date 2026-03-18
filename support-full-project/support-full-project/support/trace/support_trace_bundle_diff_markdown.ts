import type { SupportTraceBundleDiffReport } from "./support_trace_bundle_diff_report.js";
import { buildSupportTraceBundleDiffReport } from "./support_trace_bundle_diff_report.js";
import type { SupportTraceBundleDiffResult } from "./support_trace_bundle_diff.js";
const yesNo = (v:boolean)=>v?"yes":"no";
export function renderSupportTraceBundleDiffMarkdown(report: SupportTraceBundleDiffReport): string {
  const lines = [
    "# Support Trace Bundle Diff",
    "",
    `**Headline:** ${report.headline}`,
    "",
    `- Before timestamp: **${report.beforeTimestamp}**`,
    `- After timestamp: **${report.afterTimestamp}**`,
    `- Changed: **${yesNo(report.changed)}**`,
    `- Runtime trace count before: **${report.runtimeTraceCountBefore}**`,
    `- Runtime trace count after: **${report.runtimeTraceCountAfter}**`,
    `- Runtime trace count delta: **${report.runtimeTraceCountDelta}**`,
    `- Engine trace count before: **${report.engineTraceCountBefore}**`,
    `- Engine trace count after: **${report.engineTraceCountAfter}**`,
    `- Engine trace count delta: **${report.engineTraceCountDelta}**`,
    "",
  ];
  if (report.summaryLines.length) {
    lines.push("## Summary", "");
    for (const line of report.summaryLines) lines.push(`- ${line}`);
    lines.push("");
  }
  return lines.join("\n");
}
export const renderSupportTraceBundleDiffMarkdownFromResult = (diff: SupportTraceBundleDiffResult): string => renderSupportTraceBundleDiffMarkdown(buildSupportTraceBundleDiffReport(diff));
