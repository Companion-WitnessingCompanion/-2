/**
 * support_warning_utils.ts
 *
 * Purpose:
 * - merge warnings from multiple support layers
 * - preserve original order
 * - remove exact duplicate warning messages
 * - ignore empty / null / undefined warning values
 */

export type WarningLike = string | null | undefined;

function normalizeWarning(warning: WarningLike): string | undefined {
  if (typeof warning !== "string") {
    return undefined;
  }

  const trimmed = warning.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed;
}

export function dedupeWarnings(
  warnings: readonly WarningLike[],
): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const warning of warnings) {
    const normalized = normalizeWarning(warning);

    if (!normalized) {
      continue;
    }

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

export function mergeUniqueWarnings(
  ...warningGroups: ReadonlyArray<readonly WarningLike[]>
): string[] {
  const flattened: WarningLike[] = [];

  for (const group of warningGroups) {
    flattened.push(...group);
  }

  return dedupeWarnings(flattened);
}

export function appendUniqueWarning(
  warnings: readonly WarningLike[],
  nextWarning: WarningLike,
): string[] {
  return dedupeWarnings([...warnings, nextWarning]);
}
