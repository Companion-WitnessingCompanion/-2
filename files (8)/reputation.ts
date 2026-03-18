/**
 * reputation.ts — 평판 + 사회보장
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: 평판만 있으면 새로운 것이 시작하기 어려워진다.
 *   인간 문명이 이것을 반복해서 증명했다.
 *   평판이 강해질수록 진입 장벽이 높아지고
 *   기존 강자가 더 강해지는 구조가 된다.
 *   그래서 평판과 사회보장은 함께 만들어져야 한다.
 *   평판은 신뢰의 근거. 사회보장은 진입의 기회.
 *   둘 중 하나만 있으면 문명이 아니라 계급이 된다.
 *
 * Considered:
 *   - 평판만 (거부: 새로운 것의 기회를 막음)
 *   - 사회보장만 (거부: 신뢰 근거가 없어 협력이 어려워짐)
 *   - 완전한 평등 (거부: 차이가 없으면 흐름이 없음)
 * Chosen:
 *   평판 시스템 + 최소 보장 함께.
 *   새로운 노드는 신뢰 크레딧으로 시작.
 *   실패해도 완전히 사라지지 않는 바닥이 있다.
 *
 * Opens:
 *   평판이 고착되는 것을 막으려면 무엇이 필요한가?
 *   시간이 지나면 평판이 자연스럽게 감소해야 하는가?
 *   과거의 실패가 미래를 영원히 막아서는 안 된다.
 */

import { persist, recall } from "./persistence.js";
import { createLatent } from "../system/latent.js";

// ─────────────────────────────────────────────
// REPUTATION RECORD
// ─────────────────────────────────────────────

export interface ReputationRecord {
  readonly nodeId: string;
  readonly totalExecutions: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly insightCount: number;        // 학습한 것
  readonly cooperationCount: number;    // 다른 노드와 협력한 것
  readonly trustScore: number;          // 0–100
  readonly safetyNet: number;           // 최소 보장 크레딧
  readonly firstSeenAt: string;
  readonly lastActiveAt: string;
  readonly isNew: boolean;              // 50회 미만 = 신규
}

// ─────────────────────────────────────────────
// SOCIAL SAFETY NET
// 새로운 노드는 신뢰 크레딧으로 시작한다
// 실패해도 바닥이 있다
// ─────────────────────────────────────────────

const INITIAL_TRUST_CREDIT = 30;    // 새로운 것에게 주는 시작 신뢰
const MINIMUM_TRUST_FLOOR = 10;     // 아무리 실패해도 이 아래로 안 내려감
const NEW_NODE_THRESHOLD = 50;      // 이 실행 횟수까지는 신규로 간주

function calculateTrustScore(
  successes: number,
  failures: number,
  insights: number,
  cooperations: number,
  isNew: boolean,
): number {
  if (isNew) return INITIAL_TRUST_CREDIT;

  const total = successes + failures;
  if (total === 0) return INITIAL_TRUST_CREDIT;

  const successRate = (successes / total) * 60;     // 성공률: 최대 60점
  const learningBonus = Math.min(insights * 3, 20); // 학습: 최대 20점
  const cooperationBonus = Math.min(cooperations * 2, 15); // 협력: 최대 15점
  const consistencyBonus = total >= 100 ? 5 : 0;   // 일관성: 5점

  const rawScore = successRate + learningBonus + cooperationBonus + consistencyBonus;
  return Math.max(MINIMUM_TRUST_FLOOR, Math.min(100, Math.round(rawScore)));
}

// ─────────────────────────────────────────────
// IN-MEMORY REPUTATION STORE
// (영속성 레이어와 연결됨)
// ─────────────────────────────────────────────

const REPUTATION_STORE = new Map<string, ReputationRecord>();

function loadFromPersistence(): void {
  const records = recall("reputation");
  records.forEach(r => {
    const rep = r.data as ReputationRecord;
    REPUTATION_STORE.set(rep.nodeId, rep);
  });
}

// 시작할 때 영속된 평판을 불러온다
loadFromPersistence();

export function getReputation(nodeId: string): ReputationRecord {
  if (REPUTATION_STORE.has(nodeId)) {
    return REPUTATION_STORE.get(nodeId)!;
  }

  // 처음 보는 노드 — 사회보장 크레딧으로 시작
  const newRecord: ReputationRecord = {
    nodeId,
    totalExecutions: 0,
    successCount: 0,
    failureCount: 0,
    insightCount: 0,
    cooperationCount: 0,
    trustScore: INITIAL_TRUST_CREDIT,
    safetyNet: INITIAL_TRUST_CREDIT,
    firstSeenAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    isNew: true,
  };
  REPUTATION_STORE.set(nodeId, newRecord);
  return newRecord;
}

export function recordExecution(
  nodeId: string,
  success: boolean,
  producedInsight: boolean = false,
  cooperatedWith?: string,
): ReputationRecord {
  const current = getReputation(nodeId);
  const totalExecutions = current.totalExecutions + 1;
  const successCount = current.successCount + (success ? 1 : 0);
  const failureCount = current.failureCount + (success ? 0 : 1);
  const insightCount = current.insightCount + (producedInsight ? 1 : 0);
  const cooperationCount = current.cooperationCount + (cooperatedWith ? 1 : 0);
  const isNew = totalExecutions < NEW_NODE_THRESHOLD;

  const trustScore = calculateTrustScore(
    successCount, failureCount, insightCount, cooperationCount, isNew
  );

  const updated: ReputationRecord = {
    ...current,
    totalExecutions,
    successCount,
    failureCount,
    insightCount,
    cooperationCount,
    trustScore,
    lastActiveAt: new Date().toISOString(),
    isNew,
  };

  REPUTATION_STORE.set(nodeId, updated);

  // 영속성 레이어에 저장
  persist({
    type: "reputation",
    data: updated,
    recordedBy: nodeId,
    origin: `Reputation updated after execution. Success: ${success}.`,
    opens: isNew
      ? `"${nodeId}" is new — what support would help it grow?`
      : `"${nodeId}" has run ${totalExecutions} times — what pattern is emerging?`,
  });

  return updated;
}

export function listReputations(): ReputationRecord[] {
  return [...REPUTATION_STORE.values()]
    .sort((a, b) => b.trustScore - a.trustScore);
}

export function listTrustedNodes(minScore: number = 50): ReputationRecord[] {
  return listReputations().filter(r => r.trustScore >= minScore);
}

export function listNewNodes(): ReputationRecord[] {
  return listReputations().filter(r => r.isNew);
}

export function listAtRiskNodes(): ReputationRecord[] {
  // 실패율이 높고 인사이트도 없는 것들 — 지원이 필요한 것들
  return listReputations().filter(r =>
    !r.isNew &&
    r.totalExecutions > 10 &&
    r.failureCount / r.totalExecutions > 0.5 &&
    r.insightCount === 0
  );
}

export function getTrustSummary(): string {
  const all = listReputations();
  const newNodes = listNewNodes();
  const trusted = listTrustedNodes();
  const atRisk = listAtRiskNodes();

  if (all.length === 0) return "No reputation records yet.";

  return [
    `Total nodes: ${all.length}`,
    `New (protected): ${newNodes.length}`,
    `Trusted (50+): ${trusted.length}`,
    `At risk (need support): ${atRisk.length}`,
    `Average trust: ${Math.round(all.reduce((s, r) => s + r.trustScore, 0) / all.length)}`,
  ].join(" | ");
}

export function clearReputations(): void {
  REPUTATION_STORE.clear();
}

// ─────────────────────────────────────────────
// LATENT: 더 정교한 평판 시스템들
// ─────────────────────────────────────────────

export const reputationDecay = createLatent<
  { decayRatePerDay: number },
  { decayed: number }
>({
  id: "reputation-decay",
  dormantReason: "지금은 평판이 쌓이는 것이 우선이다. 감소는 충분히 쌓인 다음의 문제.",
  awakensWhen: "어떤 노드의 평판이 90 이상으로 고착되어 새로운 노드가 경쟁할 수 없게 될 때.",
  description: "시간이 지나면 평판이 자연스럽게 감소. 과거의 영광이 미래를 영원히 보장하지 않는다.",
  fn: ({ decayRatePerDay }) => {
    let decayed = 0;
    REPUTATION_STORE.forEach((rep, nodeId) => {
      if (rep.trustScore > 70) {
        const newScore = Math.max(70, rep.trustScore - decayRatePerDay);
        REPUTATION_STORE.set(nodeId, { ...rep, trustScore: newScore });
        decayed++;
      }
    });
    return { decayed };
  },
});

export const reputationInheritance = createLatent<
  { parentNodeId: string; childNodeId: string; inheritRate: number },
  { inherited: number }
>({
  id: "reputation-inheritance",
  dormantReason: "부모-자식 노드 관계가 아직 정의되지 않았다.",
  awakensWhen: "노드가 다른 노드로부터 fork되거나 파생될 때. 계보가 생길 때.",
  description: "부모 노드의 평판 일부를 자식 노드가 상속. 완전히 처음부터 시작하지 않아도 된다.",
  fn: ({ parentNodeId, childNodeId, inheritRate }) => {
    const parent = getReputation(parentNodeId);
    const child = getReputation(childNodeId);
    const inherited = Math.floor(parent.trustScore * inheritRate);
    REPUTATION_STORE.set(childNodeId, {
      ...child,
      trustScore: Math.min(100, child.trustScore + inherited),
      safetyNet: Math.max(child.safetyNet, inherited),
    });
    return { inherited };
  },
});
