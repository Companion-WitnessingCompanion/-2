/**
 * support_engine_trace_file.ts
 *
 * Purpose:
 * - persist engine-level support trace entries to disk
 * - provide simple JSON-based engine trace storage
 * - preserve readable write results for engine callers
 */

import fs from "node:fs";
import path from "node:path";

import type {
  SupportEngineTraceEntry,
} from "./support_engine_trace.js";

export interface SupportEngineTraceFileOptions {
  readonly projectRoot?: string;
  readonly traceFolder?: string;
  readonly traceFilename?: string;
}

export interface SupportEngineTraceFileWriteResult {
  readonly ok: boolean;
  readonly filePath: string;
  readonly message: string;
}

function resolveEngineTraceFolder(
  options?: SupportEngineTraceFileOptions,
): string {
  const projectRoot = options?.projectRoot ?? process.cwd();
  const traceFolder = options?.traceFolder ?? ".support_engine_trace";
  return path.resolve(projectRoot, traceFolder);
}

function resolveEngineTraceFilePath(
  options?: SupportEngineTraceFileOptions,
): string {
  const folderPath = resolveEngineTraceFolder(options);
  const filename = options?.traceFilename ?? "support_engine_trace.json";
  return path.resolve(folderPath, filename);
}

function ensureEngineTraceFolderExists(folderPath: string): void {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

function readExistingEngineTraceEntries(
  filePath: string,
): SupportEngineTraceEntry[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed as SupportEngineTraceEntry[];
}

export function appendSupportEngineTraceEntryToFile(
  entry: SupportEngineTraceEntry,
  options?: SupportEngineTraceFileOptions,
): SupportEngineTraceFileWriteResult {
  const folderPath = resolveEngineTraceFolder(options);
  const filePath = resolveEngineTraceFilePath(options);

  try {
    ensureEngineTraceFolderExists(folderPath);

    const existingEntries = readExistingEngineTraceEntries(filePath);
    const nextEntries = [...existingEntries, entry];

    fs.writeFileSync(
      filePath,
      JSON.stringify(nextEntries, null, 2),
      "utf-8",
    );

    return {
      ok: true,
      filePath,
      message: "Appended support engine trace entry to file.",
    };
  } catch (error) {
    return {
      ok: false,
      filePath,
      message:
        error instanceof Error
          ? `Failed to append support engine trace entry: ${error.message}`
          : "Failed to append support engine trace entry due to unknown error.",
    };
  }
}

export function saveSupportEngineTraceEntriesToFile(
  entries: readonly SupportEngineTraceEntry[],
  options?: SupportEngineTraceFileOptions,
): SupportEngineTraceFileWriteResult {
  const folderPath = resolveEngineTraceFolder(options);
  const filePath = resolveEngineTraceFilePath(options);

  try {
    ensureEngineTraceFolderExists(folderPath);

    fs.writeFileSync(
      filePath,
      JSON.stringify(entries, null, 2),
      "utf-8",
    );

    return {
      ok: true,
      filePath,
      message: "Saved support engine trace entries to file.",
    };
  } catch (error) {
    return {
      ok: false,
      filePath,
      message:
        error instanceof Error
          ? `Failed to save support engine trace entries: ${error.message}`
          : "Failed to save support engine trace entries due to unknown error.",
    };
  }
}
