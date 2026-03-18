import { buildSupportTraceBundleArchiveIndex, type SupportTraceBundleArchiveEntry, type SupportTraceBundleArchiveIndexOptions } from "./support_trace_bundle_archive_index.js";
import { diffSupportTraceBundles, type SupportTraceBundleDiffOptions, type SupportTraceBundleDiffResult } from "./support_trace_bundle_diff.js";
import { buildSupportTraceBundleDiffReport, type SupportTraceBundleDiffReport } from "./support_trace_bundle_diff_report.js";
import { renderSupportTraceBundleDiffMarkdown } from "./support_trace_bundle_diff_markdown.js";
import { saveSupportTraceBundleDiffMarkdownToFile, type SupportTraceBundleDiffMarkdownFileOptions, type SupportTraceBundleDiffMarkdownFileWriteResult } from "./support_trace_bundle_diff_markdown_file.js";
import { mergeUniqueWarnings } from "../core/support_warning_utils.js";
export interface SupportTraceBundleDiffRuntimeOptions { readonly archiveIndexOptions?: SupportTraceBundleArchiveIndexOptions; readonly diffOptions?: SupportTraceBundleDiffOptions; readonly persistMarkdown?: boolean; readonly markdownFileOptions?: SupportTraceBundleDiffMarkdownFileOptions; }
export interface SupportTraceBundleDiffRuntimeResult { readonly ok:boolean; readonly beforeTimestamp?:string; readonly afterTimestamp?:string; readonly diffResult?:SupportTraceBundleDiffResult; readonly diffReport?:SupportTraceBundleDiffReport; readonly markdown?:string; readonly markdownWrite?:SupportTraceBundleDiffMarkdownFileWriteResult; readonly warnings:readonly string[]; readonly message:string; }
function listComparableArchiveEntries(options?: SupportTraceBundleDiffRuntimeOptions): readonly SupportTraceBundleArchiveEntry[] {
  return buildSupportTraceBundleArchiveIndex(options?.archiveIndexOptions).entries.filter((entry)=>entry.complete);
}
export function runLatestSupportTraceBundleDiff(options?: SupportTraceBundleDiffRuntimeOptions): SupportTraceBundleDiffRuntimeResult {
  const comparableEntries = listComparableArchiveEntries(options);
  if (comparableEntries.length < 2) return { ok:false, warnings:["At least two complete archived bundle snapshots are required for diff execution."], message:"Diff runtime could not start because fewer than two complete snapshots were available." };
  const afterEntry = comparableEntries[0];
  const beforeEntry = comparableEntries[1];
  const diffResult = diffSupportTraceBundles(beforeEntry.timestamp, afterEntry.timestamp, options?.diffOptions);
  const diffReport = buildSupportTraceBundleDiffReport(diffResult);
  const markdown = renderSupportTraceBundleDiffMarkdown(diffReport);
  let markdownWrite: SupportTraceBundleDiffMarkdownFileWriteResult | undefined;
  let warnings: string[] = [];
  if (options?.persistMarkdown === true) {
    markdownWrite = saveSupportTraceBundleDiffMarkdownToFile(markdown, beforeEntry.timestamp, afterEntry.timestamp, options?.markdownFileOptions);
    if (!markdownWrite.ok) warnings = mergeUniqueWarnings(warnings, [`Diff markdown save failed: ${markdownWrite.message}`]);
  }
  return { ok:true, beforeTimestamp:beforeEntry.timestamp, afterTimestamp:afterEntry.timestamp, diffResult, diffReport, markdown, markdownWrite, warnings, message:`Diff runtime completed for "${beforeEntry.timestamp}" -> "${afterEntry.timestamp}".` };
}
