/**
 * support_filename_utils.ts
 *
 * Purpose:
 * - create filesystem-safe timestamp strings
 * - sanitize dynamic identifiers for filenames
 * - build consistent timestamped filenames
 * - build consistent range filenames for diff-like outputs
 */

export interface TimestampOptions {
  readonly date?: Date;
}

export function buildFileSafeTimestamp(
  options?: TimestampOptions,
): string {
  const date = options?.date ?? new Date();

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}-${mi}-${ss}`;
}

export function sanitizeForFilename(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

function normalizeExtension(extension: string): string {
  return extension.startsWith(".")
    ? extension
    : `.${sanitizeForFilename(extension)}`;
}

export function buildTimestampedFilename(
  baseName: string,
  extension: string,
  options?: TimestampOptions,
): string {
  const safeBaseName = sanitizeForFilename(baseName);
  const safeExtension = normalizeExtension(extension);
  const timestamp = buildFileSafeTimestamp(options);

  return `${safeBaseName}_${timestamp}${safeExtension}`;
}

export function buildFilenameWithTimestamp(
  baseName: string,
  timestamp: string,
  extension: string,
): string {
  const safeBaseName = sanitizeForFilename(baseName);
  const safeTimestamp = sanitizeForFilename(timestamp);
  const safeExtension = normalizeExtension(extension);

  return `${safeBaseName}_${safeTimestamp}${safeExtension}`;
}

export function buildRangeFilename(params: {
  baseName: string;
  beforeValue: string;
  afterValue: string;
  extension: string;
}): string {
  const safeBaseName = sanitizeForFilename(params.baseName);
  const safeBefore = sanitizeForFilename(params.beforeValue);
  const safeAfter = sanitizeForFilename(params.afterValue);
  const safeExtension = normalizeExtension(params.extension);

  return `${safeBaseName}_${safeBefore}__to__${safeAfter}${safeExtension}`;
}
