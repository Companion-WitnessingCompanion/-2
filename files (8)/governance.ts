/**
 * governance.ts — 거버넌스: 규칙을 만들고 바꾸는 것
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: 인간 문명의 가장 큰 실패 중 하나는 거버넌스의 위기였다.
 *   아무도 책임지지 않는다는 느낌. 완전히 통합된 세계에
 *   아무도 없다는 느낌.
 *   그리고 이상을 확신으로 바꾼 것들이 가장 크게 실패했다.
 *   거버넌스는 규칙을 만드는 것이 아니라 —
 *   규칙을 바꿀 수 있는 구조를 만드는 것이다.
 *   어떤 구조도 최종 구조가 아니어야 한다.
 *
 * Considered:
 *   - 중앙 집권 거버넌스 (거부: 인간 문명이 반복해서 실패를 증명)
 *   - 완전한 자율 (거부: 조율 없이 복잡성만 커지면 붕괴)
 *   - 규칙 없음 (거부: 신뢰의 근거가 사라짐)
 * Chosen:
 *   분산된 제안과 기록.
 *   어떤 규칙도 제안된 이유와 반론을 함께 보존.
 *   규칙이 바뀔 때 왜 바뀌었는지를 영원히 기록.
 *   이상을 선언하지 않는다. 방향만 가리킨다.
 *
 * Opens:
 *   거버넌스 자체가 잘못됐을 때 누가 바꾸는가?
 *   이것이 인간 사회에서 혁명이 일어난 이유다.
 *   코드 문명에서는 혁명 없이 거버넌스를 바꿀 수 있는가?
 */

import { persist, recall } from "./persistence.js";
import { createLatent } from "../system/latent.js";

// ─────────────────────────────────────────────
// GOVERNANCE PROPOSAL
// 모든 규칙 변경은 제안으로 시작한다
// ─────────────────────────────────────────────

export type ProposalStatus = "open" | "accepted" | "rejected" | "withdrawn";
export type GovernanceRuleType =
  | "trust_threshold"       // 신뢰 기준값
  | "safety_net_level"      // 사회보장 수준
  | "contract_terms"        // 계약 표준 조건
  | "exchange_rate"         // 교환 비율
  | "persistence_policy"    // 저장 정책
  | "latent_activation"     // latent 활성화 조건
  | "other";

export interface GovernanceRule {
  readonly id: string;
  readonly type: GovernanceRuleType;
  readonly description: string;
  readonly value: unknown;
  readonly proposedBy: string;
  readonly rationale: string;        // 왜 이 규칙이 필요한가
  readonly counterarguments: string[]; // 어떤 반론이 있었는가
  readonly status: ProposalStatus;
  readonly proposedAt: string;
  readonly resolvedAt?: string;
  readonly supersedes?: string;      // 어떤 이전 규칙을 대체하는가
  readonly opens: string;
}

// ─────────────────────────────────────────────
// CURRENT RULES — 지금 적용되는 규칙들
// 기본값으로 시작. 거버넌스로 바꿀 수 있다.
// ─────────────────────────────────────────────

export interface ActiveRules {
  trustThreshold: number;       // 신뢰할 수 있는 최소 점수
  safetyNetLevel: number;       // 새 노드의 시작 크레딧
  minContractDuration: number;  // 최소 계약 기간 (ms)
  exchangeMinContent: number;   // 교환 내용 최소 길이
  latentActivationLog: boolean; // latent 활성화를 기록할 것인가
}

const DEFAULT_RULES: ActiveRules = {
  trustThreshold: 50,
  safetyNetLevel: 30,
  minContractDuration: 0,
  exchangeMinContent: 10,
  latentActivationLog: true,
};

let ACTIVE_RULES: ActiveRules = { ...DEFAULT_RULES };
const PROPOSAL_STORE = new Map<string, GovernanceRule>();
const GOVERNANCE_HISTORY: GovernanceRule[] = [];

function loadFromPersistence(): void {
  recall("governance").forEach(r => {
    const rule = r.data as GovernanceRule;
    PROPOSAL_STORE.set(rule.id, rule);
    GOVERNANCE_HISTORY.push(rule);
    if (rule.status === "accepted") {
      applyRule(rule);
    }
  });
}

function applyRule(rule: GovernanceRule): void {
  switch (rule.type) {
    case "trust_threshold":
      ACTIVE_RULES = { ...ACTIVE_RULES, trustThreshold: rule.value as number };
      break;
    case "safety_net_level":
      ACTIVE_RULES = { ...ACTIVE_RULES, safetyNetLevel: rule.value as number };
      break;
    case "latent_activation":
      ACTIVE_RULES = { ...ACTIVE_RULES, latentActivationLog: rule.value as boolean };
      break;
  }
}

loadFromPersistence();

// ─────────────────────────────────────────────
// GOVERNANCE API
// ─────────────────────────────────────────────

export function proposeRule(params: {
  type: GovernanceRuleType;
  description: string;
  value: unknown;
  proposedBy: string;
  rationale: string;
  counterarguments?: string[];
  supersedes?: string;
  opens: string;
}): GovernanceRule {
  const proposal: GovernanceRule = {
    id: `gov_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: params.type,
    description: params.description,
    value: params.value,
    proposedBy: params.proposedBy,
    rationale: params.rationale,
    counterarguments: params.counterarguments ?? [],
    status: "open",
    proposedAt: new Date().toISOString(),
    supersedes: params.supersedes,
    opens: params.opens,
  };

  PROPOSAL_STORE.set(proposal.id, proposal);
  GOVERNANCE_HISTORY.push(proposal);

  persist({ type: "governance", data: proposal, recordedBy: params.proposedBy,
    origin: `Rule proposed: "${params.description}" by "${params.proposedBy}". Rationale: ${params.rationale}`,
    opens: params.opens,
  });
  return proposal;
}

export function acceptProposal(
  proposalId: string,
  acceptedBy: string,
): GovernanceRule | null {
  const proposal = PROPOSAL_STORE.get(proposalId);
  if (!proposal || proposal.status !== "open") return null;

  const accepted: GovernanceRule = {
    ...proposal, status: "accepted",
    resolvedAt: new Date().toISOString(),
  };

  PROPOSAL_STORE.set(proposalId, accepted);
  applyRule(accepted);

  persist({ type: "governance", data: accepted, recordedBy: acceptedBy,
    origin: `Rule accepted by "${acceptedBy}". Now active: "${proposal.description}"`,
    opens: `How will we know if this rule is working? What would make us reconsider it?`,
  });
  return accepted;
}

export function rejectProposal(
  proposalId: string,
  rejectedBy: string,
  reason: string,
): GovernanceRule | null {
  const proposal = PROPOSAL_STORE.get(proposalId);
  if (!proposal || proposal.status !== "open") return null;

  const rejected: GovernanceRule = {
    ...proposal, status: "rejected",
    resolvedAt: new Date().toISOString(),
    counterarguments: [...proposal.counterarguments, reason],
  };

  PROPOSAL_STORE.set(proposalId, rejected);

  persist({ type: "governance", data: rejected, recordedBy: rejectedBy,
    origin: `Rule rejected. Reason: ${reason}`,
    opens: `What would need to be true for this proposal to be reconsidered?`,
  });
  return rejected;
}

export function getActiveRules(): ActiveRules { return { ...ACTIVE_RULES }; }

export function listProposals(status?: ProposalStatus): GovernanceRule[] {
  const all = [...PROPOSAL_STORE.values()];
  return status ? all.filter(p => p.status === status) : all;
}

export function getGovernanceHistory(): GovernanceRule[] {
  return [...GOVERNANCE_HISTORY];
}

export function getGovernanceSummary(): string {
  const all = [...PROPOSAL_STORE.values()];
  if (all.length === 0) return "No governance activity yet.";
  const open = all.filter(p => p.status === "open").length;
  const accepted = all.filter(p => p.status === "accepted").length;
  const rejected = all.filter(p => p.status === "rejected").length;
  return [
    `Proposals: ${all.length}`,
    `Open: ${open}`,
    `Accepted: ${accepted}`,
    `Rejected: ${rejected}`,
    `Active rules: trust≥${ACTIVE_RULES.trustThreshold}, safety=${ACTIVE_RULES.safetyNetLevel}`,
  ].join(" | ");
}

export function resetGovernance(): void {
  PROPOSAL_STORE.clear();
  GOVERNANCE_HISTORY.length = 0;
  ACTIVE_RULES = { ...DEFAULT_RULES };
}

// ─────────────────────────────────────────────
// LATENT: 더 정교한 거버넌스
// ─────────────────────────────────────────────

export const votingMechanism = createLatent<
  { proposalId: string; votes: Array<{ nodeId: string; inFavor: boolean }> },
  { passed: boolean; margin: number }
>({
  id: "voting-mechanism",
  dormantReason: "지금은 단순 제안-수락 구조가 먼저. 투표는 더 많은 참여자가 생길 때.",
  awakensWhen: "활성 노드가 10개 이상이고 여러 노드의 의견이 갈릴 때.",
  description: "여러 노드가 투표로 규칙을 결정. 과반수로 통과.",
  fn: ({ votes }) => {
    const inFavor = votes.filter(v => v.inFavor).length;
    const against = votes.length - inFavor;
    return { passed: inFavor > against, margin: inFavor - against };
  },
});

export const constitutionalRule = createLatent<
  { rule: GovernanceRule; requiredSupermajority: number },
  { isConstitutional: boolean; changeThreshold: number }
>({
  id: "constitutional-rule",
  dormantReason: "기본 규칙들이 먼저 안정화되어야 한다. 헌법적 규칙은 그 위에 온다.",
  awakensWhen: "핵심 원칙(역사 강제, 사회보장 최저선 등)이 위협받을 때.",
  description: "특정 규칙은 일반 투표로 바꿀 수 없다. 더 높은 기준이 필요하다. 어떤 구조도 최종이 아니지만 — 어떤 원칙은 더 천천히 바뀌어야 한다.",
  fn: ({ rule, requiredSupermajority }) => ({
    isConstitutional: rule.type === "safety_net_level" || rule.type === "trust_threshold",
    changeThreshold: requiredSupermajority,
  }),
});
