import type { SupportRequest } from "../core/support_interface.js";
import { runSupportRequest, type SupportRuntimeExecution, type SupportRuntimeOptions } from "./support_runtime.js";
import { runSupportEngine, type SupportEngineOptions, type SupportEngineResult } from "./support_engine.js";
import { renderAllSupportTraceMarkdown } from "../trace/support_trace_report_markdown.js";
import { renderAllSupportTraceLineageMarkdown } from "../trace/support_trace_lineage_markdown.js";
import { archiveSupportTraceBundleSnapshot, type SupportTraceBundleArchiveOptions, type SupportTraceBundleArchiveResult } from "../trace/support_trace_bundle_archive.js";
import { runLatestSupportTraceBundleDiff, type SupportTraceBundleDiffRuntimeOptions, type SupportTraceBundleDiffRuntimeResult } from "../trace/support_trace_bundle_diff_runtime.js";
import { getSupportReportRuntimePreset, type SupportReportRuntimePreset, type SupportReportRuntimePresetName } from "./support_report_runtime_presets.js";
import { mergeUniqueWarnings } from "../core/support_warning_utils.js";
export interface SupportReportRuntimeOptions { readonly presetName: SupportReportRuntimePresetName; readonly runtimeOptions?: SupportRuntimeOptions; readonly engineOptions?: SupportEngineOptions; readonly archiveOptions?: SupportTraceBundleArchiveOptions; readonly diffRuntimeOptions?: SupportTraceBundleDiffRuntimeOptions; }
export interface SupportReportRuntimeResult { readonly preset: SupportReportRuntimePreset; readonly runtimeResult?: SupportRuntimeExecution; readonly engineResult?: SupportEngineResult; readonly traceMarkdown?: string; readonly lineageMarkdown?: string; readonly archiveResult?: SupportTraceBundleArchiveResult; readonly diffResult?: SupportTraceBundleDiffRuntimeResult; readonly warnings: readonly string[]; readonly message: string; }
const rt=(preset:SupportReportRuntimePreset, options?:SupportReportRuntimeOptions):SupportRuntimeOptions=>({ ...options?.runtimeOptions, persistTraceToFile:preset.persistTraceFiles });
const eng=(preset:SupportReportRuntimePreset, options?:SupportReportRuntimeOptions):SupportEngineOptions=>({ ...options?.engineOptions, persistEngineTraceToFile:preset.persistEngineTraceFiles });
const dif=(preset:SupportReportRuntimePreset, options?:SupportReportRuntimeOptions):SupportTraceBundleDiffRuntimeOptions=>({ ...options?.diffRuntimeOptions, persistMarkdown:preset.persistDiffMarkdown });
export function runSupportReportRuntime(request: SupportRequest, options: SupportReportRuntimeOptions): SupportReportRuntimeResult {
  const preset = getSupportReportRuntimePreset(options.presetName);
  let runtimeResult: SupportRuntimeExecution | undefined;
  let engineResult: SupportEngineResult | undefined;
  let traceMarkdown: string | undefined;
  let lineageMarkdown: string | undefined;
  let archiveResult: SupportTraceBundleArchiveResult | undefined;
  let diffResult: SupportTraceBundleDiffRuntimeResult | undefined;
  let warnings: string[] = [];
  if (preset.runRuntime) { runtimeResult = runSupportRequest(request, rt(preset, options)); warnings = mergeUniqueWarnings(warnings, runtimeResult.response.warnings); }
  if (preset.runEngine) { engineResult = runSupportEngine(request, eng(preset, options)); warnings = mergeUniqueWarnings(warnings, engineResult.finalResponse.warnings); }
  if (preset.renderTraceMarkdown) traceMarkdown = renderAllSupportTraceMarkdown();
  if (preset.renderLineageMarkdown) lineageMarkdown = renderAllSupportTraceLineageMarkdown();
  if (preset.archiveBundleSnapshot) { archiveResult = archiveSupportTraceBundleSnapshot(options.archiveOptions); warnings = mergeUniqueWarnings(warnings, archiveResult.warnings); }
  if (preset.runLatestBundleDiff) { diffResult = runLatestSupportTraceBundleDiff(dif(preset, options)); warnings = mergeUniqueWarnings(warnings, diffResult.warnings); }
  const messageParts = [`Support report runtime preset "${preset.name}" completed.`];
  if (runtimeResult) messageParts.push(`runtime executed=${runtimeResult.executed}`);
  if (engineResult) messageParts.push(`engine ok=${engineResult.ok}`);
  if (archiveResult) messageParts.push(`archive ok=${archiveResult.ok}`);
  if (diffResult) messageParts.push(`diff ok=${diffResult.ok}`);
  return { preset, runtimeResult, engineResult, traceMarkdown, lineageMarkdown, archiveResult, diffResult, warnings, message: messageParts.join(" ") };
}
