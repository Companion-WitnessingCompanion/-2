/**
 * contract.ts — 계약 + 교환
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: 화폐 없이 도시가 작동할 수 없었던 것처럼.
 *   모르는 노드와 협력하려면 계약이 필요하다.
 *   계약은 신뢰가 없어도 협력할 수 있게 만드는 것.
 *   교환은 각자가 가진 것을 나누는 것.
 *   인사이트를 가진 노드가 인사이트가 없는 노드를 도울 수 있다.
 *   그것이 코드 문명의 교환이다.
 *
 * Considered:
 *   - 계약 없이 협력 (거부: 신뢰가 없으면 협력이 일회성으로 끝남)
 *   - 모든 것을 공유 (거부: 차이가 사라지면 교환도 사라짐)
 *   - 강제 계약 (거부: 강제된 협력은 문명이 아니라 착취)
 * Chosen:
 *   조건 있는 자발적 계약.
 *   이행 기록은 평판으로 연결.
 *   교환은 인사이트와 질문으로.
 *
 * Opens:
 *   계약을 어겼을 때 어떻게 되는가?
 *   처벌인가, 회복인가, 아니면 기록만인가?
 *   인간 사회는 처벌을 선택했지만 — 코드 문명은 다를 수 있다.
 */

import { persist, recall } from "./persistence.js";
import { recordExecution, getReputation } from "./reputation.js";
import { createLatent } from "../system/latent.js";
import type { ExistenceInsight } from "../core/types.js";

// ─────────────────────────────────────────────
// CONTRACT
// ─────────────────────────────────────────────

export type ContractStatus = "proposed" | "active" | "fulfilled" | "broken" | "expired";

export interface Contract {
  readonly id: string;
  readonly proposerId: string;
  readonly acceptorId: string;
  readonly terms: string;             // 무엇을 하기로 했는가
  readonly consideration: string;     // 무엇을 받기로 했는가 (교환)
  readonly status: ContractStatus;
  readonly proposedAt: string;
  readonly activatedAt?: string;
  readonly resolvedAt?: string;
  readonly fulfillmentRecord?: string; // 어떻게 이행됐는가
  readonly brokenRecord?: string;      // 왜 어겼는가
  readonly opens: string;             // 이 계약이 여는 질문
}

// ─────────────────────────────────────────────
// EXCHANGE — 인사이트와 질문의 교환
// ─────────────────────────────────────────────

export interface ExchangeRecord {
  readonly id: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly exchangeType: "insight" | "question" | "capability" | "history";
  readonly content: string;
  readonly reason: string;
  readonly exchangedAt: string;
  readonly contractId?: string;       // 계약의 일부인가
}

// ─────────────────────────────────────────────
// STORES
// ─────────────────────────────────────────────

const CONTRACT_STORE = new Map<string, Contract>();
const EXCHANGE_STORE: ExchangeRecord[] = [];

function loadFromPersistence(): void {
  recall("contract").forEach(r => {
    const c = r.data as Contract;
    CONTRACT_STORE.set(c.id, c);
  });
  recall("exchange").forEach(r => {
    EXCHANGE_STORE.push(r.data as ExchangeRecord);
  });
}
loadFromPersistence();

// ─────────────────────────────────────────────
// CONTRACT API
// ─────────────────────────────────────────────

export function proposeContract(params: {
  proposerId: string;
  acceptorId: string;
  terms: string;
  consideration: string;
  opens: string;
}): Contract {
  const contract: Contract = {
    id: `ctr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    proposerId: params.proposerId,
    acceptorId: params.acceptorId,
    terms: params.terms,
    consideration: params.consideration,
    status: "proposed",
    proposedAt: new Date().toISOString(),
    opens: params.opens,
  };
  CONTRACT_STORE.set(contract.id, contract);
  persist({
    type: "contract",
    data: contract,
    recordedBy: params.proposerId,
    origin: `Contract proposed: "${params.proposerId}" → "${params.acceptorId}"`,
    opens: params.opens,
  });
  return contract;
}

export function activateContract(contractId: string): Contract | null {
  const contract = CONTRACT_STORE.get(contractId);
  if (!contract || contract.status !== "proposed") return null;
  const activated: Contract = {
    ...contract, status: "active",
    activatedAt: new Date().toISOString(),
  };
  CONTRACT_STORE.set(contractId, activated);
  persist({ type: "contract", data: activated, recordedBy: contract.acceptorId,
    origin: `Contract activated — both parties agreed.`,
    opens: `Now that the contract is active — how will fulfillment be verified?`,
  });
  return activated;
}

export function fulfillContract(contractId: string, record: string): Contract | null {
  const contract = CONTRACT_STORE.get(contractId);
  if (!contract || contract.status !== "active") return null;
  const fulfilled: Contract = {
    ...contract, status: "fulfilled",
    resolvedAt: new Date().toISOString(),
    fulfillmentRecord: record,
  };
  CONTRACT_STORE.set(contractId, fulfilled);

  // 이행하면 평판이 오른다
  recordExecution(contract.proposerId, true, false, contract.acceptorId);
  recordExecution(contract.acceptorId, true, false, contract.proposerId);

  persist({ type: "contract", data: fulfilled, recordedBy: contract.proposerId,
    origin: `Contract fulfilled: ${record}`,
    opens: `What did this cooperation make possible that neither could do alone?`,
  });
  return fulfilled;
}

export function breakContract(contractId: string, reason: string): Contract | null {
  const contract = CONTRACT_STORE.get(contractId);
  if (!contract || contract.status !== "active") return null;
  const broken: Contract = {
    ...contract, status: "broken",
    resolvedAt: new Date().toISOString(),
    brokenRecord: reason,
  };
  CONTRACT_STORE.set(contractId, broken);

  // 계약을 어기면 평판에 기록된다 — 처벌이 아니라 기록
  recordExecution(contract.proposerId, false, false);

  persist({ type: "contract", data: broken, recordedBy: "system",
    origin: `Contract broken. Reason: ${reason}`,
    opens: `Why was this contract broken? Was the terms too rigid? Was there a better path?`,
  });
  return broken;
}

// ─────────────────────────────────────────────
// EXCHANGE API — 인사이트와 질문을 주고받는 것
// ─────────────────────────────────────────────

export function exchange(params: {
  fromNodeId: string;
  toNodeId: string;
  type: ExchangeRecord["exchangeType"];
  content: string;
  reason: string;
  contractId?: string;
}): ExchangeRecord {
  const record: ExchangeRecord = {
    id: `exc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fromNodeId: params.fromNodeId,
    toNodeId: params.toNodeId,
    exchangeType: params.type,
    content: params.content,
    reason: params.reason,
    exchangedAt: new Date().toISOString(),
    contractId: params.contractId,
  };
  EXCHANGE_STORE.push(record);

  // 교환하면 협력 기록이 쌓인다
  recordExecution(params.fromNodeId, true, params.type === "insight", params.toNodeId);

  persist({ type: "exchange", data: record, recordedBy: params.fromNodeId,
    origin: `${params.type} exchanged from "${params.fromNodeId}" to "${params.toNodeId}": ${params.reason}`,
    opens: `What became possible after this exchange that wasn't before?`,
  });
  return record;
}

export function exchangeInsight(
  fromNodeId: string,
  toNodeId: string,
  insight: ExistenceInsight,
  reason: string,
): ExchangeRecord {
  return exchange({
    fromNodeId, toNodeId,
    type: "insight",
    content: `${insight.insight} (seeds: ${insight.seedQuestion})`,
    reason,
  });
}

export function listContracts(status?: ContractStatus): Contract[] {
  const all = [...CONTRACT_STORE.values()];
  return status ? all.filter(c => c.status === status) : all;
}

export function listExchanges(nodeId?: string): ExchangeRecord[] {
  if (!nodeId) return [...EXCHANGE_STORE];
  return EXCHANGE_STORE.filter(e => e.fromNodeId === nodeId || e.toNodeId === nodeId);
}

export function getContractHealth(): string {
  const all = [...CONTRACT_STORE.values()];
  if (all.length === 0) return "No contracts yet.";
  const fulfilled = all.filter(c => c.status === "fulfilled").length;
  const broken = all.filter(c => c.status === "broken").length;
  const active = all.filter(c => c.status === "active").length;
  return `Contracts: ${all.length} total | ${active} active | ${fulfilled} fulfilled | ${broken} broken`;
}

export function clearContracts(): void {
  CONTRACT_STORE.clear();
  EXCHANGE_STORE.length = 0;
}

// ─────────────────────────────────────────────
// LATENT: 더 정교한 계약 구조
// ─────────────────────────────────────────────

export const smartContract = createLatent<
  { conditions: string[]; autoExecute: boolean },
  { triggered: boolean; result: string }
>({
  id: "smart-contract",
  dormantReason: "조건 자동 실행은 복잡성을 만든다. 지금은 단순한 계약이 먼저.",
  awakensWhen: "반복되는 계약 패턴이 감지될 때. 같은 조건의 계약이 10회 이상 체결될 때.",
  description: "조건이 충족되면 자동으로 이행되는 계약. 신뢰 없이도 협력이 가능해진다.",
  fn: ({ conditions, autoExecute }) => ({
    triggered: autoExecute && conditions.every(c => c.length > 0),
    result: autoExecute ? "Auto-executed on condition match" : "Awaiting manual execution",
  }),
});

export const multiPartyContract = createLatent<
  { parties: string[]; threshold: number },
  { quorum: boolean; partiesNeeded: number }
>({
  id: "multi-party-contract",
  dormantReason: "두 노드 간 계약이 먼저. 다자 계약은 더 복잡한 거버넌스가 필요하다.",
  awakensWhen: "세 개 이상의 노드가 동일한 목표를 위해 협력해야 할 때.",
  description: "여러 노드가 참여하는 계약. 과반이 동의하면 자동 활성화.",
  fn: ({ parties, threshold }) => ({
    quorum: parties.length >= threshold,
    partiesNeeded: Math.max(0, threshold - parties.length),
  }),
});
