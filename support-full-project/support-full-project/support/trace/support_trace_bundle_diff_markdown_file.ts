import fs from "node:fs";
import path from "node:path";
import { buildRangeFilename } from "../core/support_filename_utils.js";
export interface SupportTraceBundleDiffMarkdownFileOptions { readonly projectRoot?: string; readonly reportFolder?: string; readonly filename?: string; }
export interface SupportTraceBundleDiffMarkdownFileWriteResult { readonly ok: boolean; readonly filePath: string; readonly message: string; }
function resolveDiffMarkdownFolder(options?: SupportTraceBundleDiffMarkdownFileOptions): string {
  const projectRoot = options?.projectRoot ?? process.cwd();
  const reportFolder = options?.reportFolder ?? ".support_trace_bundle_diff";
  return path.resolve(projectRoot, reportFolder);
}
function resolveDiffMarkdownFilename(beforeTimestamp: string, afterTimestamp: string, options?: SupportTraceBundleDiffMarkdownFileOptions): string {
  if (options?.filename) return options.filename;
  return buildRangeFilename({ baseName: "support_trace_bundle_diff", beforeValue: beforeTimestamp, afterValue: afterTimestamp, extension: ".md" });
}
export function saveSupportTraceBundleDiffMarkdownToFile(markdown: string, beforeTimestamp: string, afterTimestamp: string, options?: SupportTraceBundleDiffMarkdownFileOptions): SupportTraceBundleDiffMarkdownFileWriteResult {
  const folder = resolveDiffMarkdownFolder(options);
  const filePath = path.resolve(folder, resolveDiffMarkdownFilename(beforeTimestamp, afterTimestamp, options));
  try {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(filePath, markdown, "utf-8");
    return { ok: true, filePath, message: "Saved support trace bundle diff markdown to file." };
  } catch (error) {
    return { ok: false, filePath, message: error instanceof Error ? `Failed to save support trace bundle diff markdown: ${error.message}` : "Failed to save support trace bundle diff markdown due to unknown error." };
  }
}
