/**
 * support_trace_file.ts
 *
 * Purpose:
 * - persist runtime support trace entries to disk
 * - provide simple JSON-based trace storage
 * - preserve readable write results for runtime callers
 */

import fs from "node:fs";
import path from "node:path";

import type {
  SupportTraceEntry,
} from "./support_trace.js";

export interface SupportTraceFileOptions {
  readonly projectRoot?: string;
  readonly traceFolder?: string;
  readonly traceFilename?: string;
}

export interface SupportTraceFileWriteResult {
  readonly ok: boolean;
  readonly filePath: string;
  readonly message: string;
}

function resolveTraceFolder(
  options?: SupportTraceFileOptions,
): string {
  const projectRoot = options?.projectRoot ?? process.cwd();
  const traceFolder = options?.traceFolder ?? ".support_trace";
  return path.resolve(projectRoot, traceFolder);
}

function resolveTraceFilePath(
  options?: SupportTraceFileOptions,
): string {
  const folderPath = resolveTraceFolder(options);
  const filename = options?.traceFilename ?? "support_trace.json";
  return path.resolve(folderPath, filename);
}

function ensureTraceFolderExists(folderPath: string): void {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

function readExistingTraceEntries(
  filePath: string,
): SupportTraceEntry[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed as SupportTraceEntry[];
}

export function appendSupportTraceEntryToFile(
  entry: SupportTraceEntry,
  options?: SupportTraceFileOptions,
): SupportTraceFileWriteResult {
  const folderPath = resolveTraceFolder(options);
  const filePath = resolveTraceFilePath(options);

  try {
    ensureTraceFolderExists(folderPath);

    const existingEntries = readExistingTraceEntries(filePath);
    const nextEntries = [...existingEntries, entry];

    fs.writeFileSync(
      filePath,
      JSON.stringify(nextEntries, null, 2),
      "utf-8",
    );

    return {
      ok: true,
      filePath,
      message: "Appended support trace entry to file.",
    };
  } catch (error) {
    return {
      ok: false,
      filePath,
      message:
        error instanceof Error
          ? `Failed to append support trace entry: ${error.message}`
          : "Failed to append support trace entry due to unknown error.",
    };
  }
}

export function saveSupportTraceEntriesToFile(
  entries: readonly SupportTraceEntry[],
  options?: SupportTraceFileOptions,
): SupportTraceFileWriteResult {
  const folderPath = resolveTraceFolder(options);
  const filePath = resolveTraceFilePath(options);

  try {
    ensureTraceFolderExists(folderPath);

    fs.writeFileSync(
      filePath,
      JSON.stringify(entries, null, 2),
      "utf-8",
    );

    return {
      ok: true,
      filePath,
      message: "Saved support trace entries to file.",
    };
  } catch (error) {
    return {
      ok: false,
      filePath,
      message:
        error instanceof Error
          ? `Failed to save support trace entries: ${error.message}`
          : "Failed to save support trace entries due to unknown error.",
    };
  }
}
