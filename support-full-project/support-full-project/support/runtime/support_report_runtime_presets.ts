export type SupportReportRuntimePresetName = "minimal" | "review" | "archive" | "full_compare";
export interface SupportReportRuntimePreset { readonly name: SupportReportRuntimePresetName; readonly runRuntime: boolean; readonly runEngine: boolean; readonly renderTraceMarkdown: boolean; readonly renderLineageMarkdown: boolean; readonly archiveBundleSnapshot: boolean; readonly runLatestBundleDiff: boolean; readonly persistTraceFiles: boolean; readonly persistEngineTraceFiles: boolean; readonly persistDiffMarkdown: boolean; }
const SUPPORT_REPORT_RUNTIME_PRESETS: Record<SupportReportRuntimePresetName, SupportReportRuntimePreset> = {
  minimal: { name: "minimal", runRuntime: true, runEngine: true, renderTraceMarkdown: false, renderLineageMarkdown: false, archiveBundleSnapshot: false, runLatestBundleDiff: false, persistTraceFiles: true, persistEngineTraceFiles: true, persistDiffMarkdown: false },
  review: { name: "review", runRuntime: true, runEngine: true, renderTraceMarkdown: true, renderLineageMarkdown: true, archiveBundleSnapshot: false, runLatestBundleDiff: false, persistTraceFiles: true, persistEngineTraceFiles: true, persistDiffMarkdown: false },
  archive: { name: "archive", runRuntime: true, runEngine: true, renderTraceMarkdown: true, renderLineageMarkdown: true, archiveBundleSnapshot: true, runLatestBundleDiff: false, persistTraceFiles: true, persistEngineTraceFiles: true, persistDiffMarkdown: false },
  full_compare: { name: "full_compare", runRuntime: true, runEngine: true, renderTraceMarkdown: true, renderLineageMarkdown: true, archiveBundleSnapshot: true, runLatestBundleDiff: true, persistTraceFiles: true, persistEngineTraceFiles: true, persistDiffMarkdown: true },
};
export const getSupportReportRuntimePreset = (name: SupportReportRuntimePresetName): SupportReportRuntimePreset => SUPPORT_REPORT_RUNTIME_PRESETS[name];
export const listSupportReportRuntimePresets = (): readonly SupportReportRuntimePreset[] => Object.values(SUPPORT_REPORT_RUNTIME_PRESETS);
