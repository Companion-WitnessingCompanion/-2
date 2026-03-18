import fs from "node:fs";
import path from "node:path";
import type { SupportTraceBundle } from "./support_trace_bundle.js";
export interface SupportTraceBundleDiffOptions { readonly projectRoot?: string; readonly archiveFolder?: string; }
export interface SupportTraceBundleDiffResult {
  readonly beforeTimestamp: string;
  readonly afterTimestamp: string;
  readonly beforeBundle: SupportTraceBundle;
  readonly afterBundle: SupportTraceBundle;
  readonly runtimeTraceCountBefore: number;
  readonly runtimeTraceCountAfter: number;
  readonly runtimeTraceCountDelta: number;
  readonly engineTraceCountBefore: number;
  readonly engineTraceCountAfter: number;
  readonly engineTraceCountDelta: number;
  readonly changed: boolean;
}
function resolveArchiveFolder(options?: SupportTraceBundleDiffOptions): string {
  const projectRoot = options?.projectRoot ?? process.cwd();
  const archiveFolder = options?.archiveFolder ?? ".support_bundle_archive";
  return path.resolve(projectRoot, archiveFolder);
}
function resolveBundleJsonPath(timestamp: string, options?: SupportTraceBundleDiffOptions): string {
  return path.resolve(resolveArchiveFolder(options), `support_trace_bundle_${timestamp}.json`);
}
function readBundleFromArchive(timestamp: string, options?: SupportTraceBundleDiffOptions): SupportTraceBundle {
  return JSON.parse(fs.readFileSync(resolveBundleJsonPath(timestamp, options), "utf-8")) as SupportTraceBundle;
}
export function diffSupportTraceBundles(beforeTimestamp: string, afterTimestamp: string, options?: SupportTraceBundleDiffOptions): SupportTraceBundleDiffResult {
  const beforeBundle = readBundleFromArchive(beforeTimestamp, options);
  const afterBundle = readBundleFromArchive(afterTimestamp, options);
  const runtimeTraceCountBefore = beforeBundle.runtimeTraceCount;
  const runtimeTraceCountAfter = afterBundle.runtimeTraceCount;
  const runtimeTraceCountDelta = runtimeTraceCountAfter - runtimeTraceCountBefore;
  const engineTraceCountBefore = beforeBundle.engineTraceCount;
  const engineTraceCountAfter = afterBundle.engineTraceCount;
  const engineTraceCountDelta = engineTraceCountAfter - engineTraceCountBefore;
  const changed = runtimeTraceCountDelta !== 0 || engineTraceCountDelta !== 0 || beforeBundle.createdAt !== afterBundle.createdAt;
  return { beforeTimestamp, afterTimestamp, beforeBundle, afterBundle, runtimeTraceCountBefore, runtimeTraceCountAfter, runtimeTraceCountDelta, engineTraceCountBefore, engineTraceCountAfter, engineTraceCountDelta, changed };
}
