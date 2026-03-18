/**
 * support_registry.ts — WITH EXISTENCE HISTORY
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: The original registry registered nodes without knowing why.
 *   validator-core existed. But why? What was considered?
 *   What does it open? When the designers leave — nobody knows.
 *   This version requires every node to carry its history.
 *   Cannot register without it.
 *
 * Considered:
 *   - Add history as optional notes field (rejected: optional = ignored)
 *   - External documentation (rejected: disconnected from runtime)
 * Chosen:
 *   MandatoryHistory in SupportNode definition.
 *   validateReason at registration time.
 *   If history is missing — registration fails.
 *
 * Opens:
 *   Could the registry's own history inform which nodes
 *   are most often selected? Which are never used?
 *   History + execution trace = evolution map.
 */

import type {
  SupportCapability,
  SupportHooks,
  SupportNode,
  SupportRole,
} from "../core/support_interface.js";

import type { MandatoryHistory } from "../existence/existence_history.js";
import { validateReason } from "../existence/existence_history.js";
import { createRoleBasedHooks } from "../hooks/support_hook_profiles.js";

export interface SupportRegistryNodeDefinition {
  readonly nodeId: string;
  readonly role: SupportRole;
  readonly capabilities: readonly SupportCapability[];
  readonly notes?: string;
  readonly hooks?: Partial<SupportHooks>;

  /**
   * REQUIRED: Why does this node exist?
   * Cannot register without a validated reason.
   */
  readonly existenceReason: string;

  /**
   * REQUIRED: Full history of this node.
   * What was considered. What was chosen. What it opens.
   */
  readonly history: Omit<MandatoryHistory, "born" | "evolution">;
}

// ─────────────────────────────────────────────
// REGISTRY DEFINITIONS
// Every node now carries its history.
// ─────────────────────────────────────────────

const SUPPORT_REGISTRY_DEFINITIONS: SupportRegistryNodeDefinition[] = [
  {
    nodeId: "validator-core",
    role: "validator",
    capabilities: ["report_health", "validate_structure", "record_incident"],
    notes: "Primary structural validation node.",
    existenceReason:
      "The system needs a node that sees structural uncertainty clearly and refuses to overstate recovery.",
    history: {
      origin:
        "Created because early support runs were claiming stability they hadn't earned. " +
        "A node was needed that would hold the line — see degradation, name it, and not pretend otherwise.",
      considered: [
        "General-purpose validator (rejected: too broad, loses role specificity)",
        "Merge with repair (rejected: validation and repair are different phases — conflating them masks real state)",
      ],
      chosen:
        "Dedicated validator that reports health as caution, not recovery confirmation. " +
        "Its job is to expose weak points, not reassure.",
      opens:
        "Should validator-core ever be allowed to approve continuation without repair? " +
        "Or should validation always lead to at least one repair or fallback step?",
    },
  },
  {
    nodeId: "repair-bounded",
    role: "repair_helper",
    capabilities: ["assist_repair", "provide_fallback"],
    notes: "Conservative repair support node.",
    existenceReason:
      "The system needs repair that stays bounded — fixing what must be fixed without triggering wide restructuring.",
    history: {
      origin:
        "Created after observing that unbounded repair attempts were causing more damage than the original issues. " +
        "Something was needed that would propose the smallest viable repair path.",
      considered: [
        "Full repair node (rejected: wide restructuring during degradation is dangerous)",
        "No repair at all — fallback only (rejected: some damage needs direct repair, not just workaround)",
      ],
      chosen:
        "Bounded repair that explicitly avoids large structural mutation. " +
        "May leave non-critical damage intentionally untouched. " +
        "Always follows up with validation before allowing continuation.",
      opens:
        "What is the right boundary for 'bounded'? " +
        "Should the boundary be configurable based on urgency level?",
    },
  },
  {
    nodeId: "reentry-ground",
    role: "reentry_helper",
    capabilities: ["assist_reentry", "route_support"],
    notes: "Bounded reentry routing node.",
    existenceReason:
      "The system needs a supervised path back into normal flow after degradation — not a fast return, a careful one.",
    history: {
      origin:
        "Created because reentry after repair was being treated as normal operation resumption. " +
        "But reentry is not resumption — it is supervised return. " +
        "A dedicated node was needed to hold that distinction.",
      considered: [
        "Let repair-bounded handle reentry (rejected: repair and reentry are different phases)",
        "Automatic reentry without supervision (rejected: false continuity is worse than acknowledged instability)",
      ],
      chosen:
        "Narrow, supervised reentry path that always requires follow-up validation or repair. " +
        "Automatic reentry stays conservative. " +
        "Reentry-ground treats return as hypothesis, not confirmation.",
      opens:
        "At what point does supervised reentry become normal operation? " +
        "How many successful validation cycles before supervision can be reduced?",
    },
  },
  {
    nodeId: "fallback-plain",
    role: "fallback_provider",
    capabilities: ["provide_fallback"],
    notes: "Reduced continuity path provider.",
    existenceReason:
      "Sometimes repair is not possible but the system must continue. Fallback preserves a reduced path.",
    history: {
      origin:
        "Created for situations where repair cannot proceed but complete stoppage is also not acceptable. " +
        "A survivable path that is honest about its limitations.",
      considered: [
        "Merge with repair-bounded fallback (rejected: plain fallback should exist independently for cases where repair is blocked)",
      ],
      chosen:
        "Dedicated fallback that is explicit about being temporary. " +
        "Does not claim full restoration. Always requires follow-up.",
      opens:
        "Should fallback have a time limit? " +
        "What happens if fallback runs indefinitely without repair being attempted?",
    },
  },
  {
    nodeId: "observer-ledger",
    role: "observer",
    capabilities: ["record_incident", "route_support"],
    notes: "Observation and bounded routing support node.",
    existenceReason:
      "The system needs a node that watches without acting — recording what happens, routing when needed.",
    history: {
      origin:
        "Created because every other node acts. " +
        "But sometimes the right response is to record and route, not intervene. " +
        "Observer-ledger is the system's memory without agenda.",
      considered: [
        "Merge observation into validator (rejected: validator acts on what it sees; observer should not act)",
        "No observer at all (rejected: without observation, patterns cannot be detected across time)",
      ],
      chosen:
        "Pure observer — records incidents, routes when needed, never acts beyond that. " +
        "Its restraint is its function.",
      opens:
        "Should observer-ledger have access to the full insight store? " +
        "Could it detect patterns across completed executions and surface them as questions?",
    },
  },
];

// ─────────────────────────────────────────────
// BUILD NODE — With validated history
// ─────────────────────────────────────────────

function buildSupportNode(def: SupportRegistryNodeDefinition): SupportNode {
  const validatedReason = validateReason(def.existenceReason);

  const history = {
    born: "2026-03-14",
    ...def.history,
    evolution: [],
  };

  // Wire role-based hooks, then override with node-specific hooks
  const roleHooks = createRoleBasedHooks(def.role, def.nodeId);
  const hooks = def.hooks
    ? { ...roleHooks, ...def.hooks }
    : roleHooks;

  return {
    nodeId: def.nodeId,
    role: def.role,
    capabilities: def.capabilities,
    hooks,
    notes: def.notes,
    existenceReason: validatedReason,
    history,
  };
}

export function listSupportNodes(): readonly SupportNode[] {
  return SUPPORT_REGISTRY_DEFINITIONS.map(buildSupportNode);
}

export function getSupportNodeById(nodeId: string): SupportNode | undefined {
  const def = SUPPORT_REGISTRY_DEFINITIONS.find(d => d.nodeId === nodeId);
  if (!def) return undefined;
  return buildSupportNode(def);
}

export function listSupportNodeIds(): readonly string[] {
  return SUPPORT_REGISTRY_DEFINITIONS.map(d => d.nodeId);
}
