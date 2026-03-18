import fs from "node:fs";
import path from "node:path";
export interface SupportTraceBundleArchiveIndexOptions { readonly projectRoot?: string; readonly archiveFolder?: string; }
export interface SupportTraceBundleArchiveEntry { readonly timestamp: string; readonly jsonFilename?: string; readonly markdownFilename?: string; readonly complete: boolean; }
export interface SupportTraceBundleArchiveIndex { readonly archiveFolder: string; readonly entries: readonly SupportTraceBundleArchiveEntry[]; }
function resolveArchiveFolder(options?: SupportTraceBundleArchiveIndexOptions): string {
  const projectRoot = options?.projectRoot ?? process.cwd();
  const archiveFolder = options?.archiveFolder ?? ".support_bundle_archive";
  return path.resolve(projectRoot, archiveFolder);
}
function extractTimestamp(filename: string): string | undefined {
  const jsonMatch = filename.match(/^support_trace_bundle_(.+)\.json$/);
  if (jsonMatch) return jsonMatch[1];
  const markdownMatch = filename.match(/^support_trace_bundle_(.+)\.md$/);
  if (markdownMatch) return markdownMatch[1];
  return undefined;
}
export function buildSupportTraceBundleArchiveIndex(options?: SupportTraceBundleArchiveIndexOptions): SupportTraceBundleArchiveIndex {
  const archiveFolder = resolveArchiveFolder(options);
  if (!fs.existsSync(archiveFolder)) return { archiveFolder, entries: [] };
  const files = fs.readdirSync(archiveFolder);
  const byTimestamp = new Map<string, { jsonFilename?: string; markdownFilename?: string }>();
  for (const filename of files) {
    const timestamp = extractTimestamp(filename);
    if (!timestamp) continue;
    const existing = byTimestamp.get(timestamp) ?? {};
    if (filename.endsWith(".json")) existing.jsonFilename = filename;
    if (filename.endsWith(".md")) existing.markdownFilename = filename;
    byTimestamp.set(timestamp, existing);
  }
  const entries: SupportTraceBundleArchiveEntry[] = [...byTimestamp.entries()].map(([timestamp, value]) => ({
    timestamp,
    jsonFilename: value.jsonFilename,
    markdownFilename: value.markdownFilename,
    complete: Boolean(value.jsonFilename && value.markdownFilename),
  })).sort((a,b)=>b.timestamp.localeCompare(a.timestamp));
  return { archiveFolder, entries };
}
