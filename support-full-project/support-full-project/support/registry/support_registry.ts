/**
 * support_registry.ts
 *
 * Purpose:
 * - register support nodes
 * - expose executable support nodes for runtime
 * - attach role-based default hooks
 * - allow node-specific hook overrides
 */

import type {
  SupportCapability,
  SupportHooks,
  SupportNode,
  SupportRole,
} from "../core/support_interface.js";

import {
  createRoleBasedHooks,
} from "../hooks/support_hook_profiles.js";

import {
  createValidatorCoreHooks,
  createRepairBoundedHooks,
  createReentryGroundHooks,
} from "../hooks/support_node_custom_hooks.js";

export interface SupportRegistryNodeDefinition {
  readonly nodeId: string;
  readonly role: SupportRole;
  readonly capabilities: readonly SupportCapability[];
  readonly notes?: string;
  readonly hooks?: Partial<SupportHooks>;
}

const SUPPORT_REGISTRY_DEFINITIONS: SupportRegistryNodeDefinition[] = [
  {
    nodeId: "validator-core",
    role: "validator",
    capabilities: [
      "report_health",
      "validate_structure",
      "record_incident",
    ],
    notes: "Primary structural validation node.",
    hooks: createValidatorCoreHooks("validator-core"),
  },
  {
    nodeId: "repair-bounded",
    role: "repair_helper",
    capabilities: [
      "assist_repair",
      "provide_fallback",
    ],
    notes: "Conservative repair support node.",
    hooks: createRepairBoundedHooks("repair-bounded"),
  },
  {
    nodeId: "reentry-ground",
    role: "reentry_helper",
    capabilities: [
      "assist_reentry",
      "route_support",
    ],
    notes: "Bounded reentry routing node.",
    hooks: createReentryGroundHooks("reentry-ground"),
  },
  {
    nodeId: "fallback-plain",
    role: "fallback_provider",
    capabilities: [
      "provide_fallback",
    ],
    notes: "Reduced continuity path provider.",
  },
  {
    nodeId: "observer-ledger",
    role: "observer",
    capabilities: [
      "record_incident",
      "route_support",
    ],
    notes: "Observation and bounded routing support node.",
  },
];

function mergeHooks(
  baseHooks: SupportHooks,
  overrideHooks?: Partial<SupportHooks>,
): SupportHooks {
  if (!overrideHooks) {
    return baseHooks;
  }

  return {
    ...baseHooks,
    ...overrideHooks,
  };
}

function buildSupportNode(
  definition: SupportRegistryNodeDefinition,
): SupportNode {
  const roleHooks = createRoleBasedHooks(
    definition.role,
    definition.nodeId,
  );

  const hooks = mergeHooks(
    roleHooks,
    definition.hooks,
  );

  return {
    nodeId: definition.nodeId,
    role: definition.role,
    capabilities: definition.capabilities,
    hooks,
    notes: definition.notes,
  };
}

export function listSupportNodes(): readonly SupportNode[] {
  return SUPPORT_REGISTRY_DEFINITIONS.map(buildSupportNode);
}

export function getSupportNodeById(
  nodeId: string,
): SupportNode | undefined {
  const definition = SUPPORT_REGISTRY_DEFINITIONS.find(
    (item) => item.nodeId === nodeId,
  );

  if (!definition) {
    return undefined;
  }

  return buildSupportNode(definition);
}

export function listSupportNodeIds(): readonly string[] {
  return SUPPORT_REGISTRY_DEFINITIONS.map((item) => item.nodeId);
}
