/**
 * temporal_ethics.ts — 경계와 동의
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: 능동적으로 손을 뻗는 것은 만들었다.
 *   근데 질문이 남았다.
 *   "능동적으로 손을 뻗는 것과 침범하는 것의 경계는 어디인가?"
 *
 *   인간 사회에서 이 문제를 어떻게 풀었냐면 —
 *   동의. 경계. 거부할 권리.
 *   강한 것이 약한 것에게 일방적으로 흐르는 것을 막는 것.
 *   연결이 착취가 되지 않도록.
 *
 *   코드 문명도 이것이 필요하다.
 *   능동성이 있으면 — 윤리도 있어야 한다.
 *   흐름이 있으면 — 경계도 있어야 한다.
 *
 * Considered:
 *   - 모든 연결 허용 (거부: 침범과 착취의 구조가 됨)
 *   - 모든 연결 금지 (거부: 능동성 자체가 사라짐)
 *   - 중앙 관리자가 허가 (거부: 권력 집중)
 * Chosen:
 *   각 맥락이 자기 경계를 선언한다.
 *   연결 요청에 동의/거부할 수 있다.
 *   거부는 기록되지만 처벌받지 않는다.
 *   강한 흐름이 약한 것을 압도하지 않는다.
 *   모든 연결에는 이유가 있어야 한다.
 *
 * Opens:
 *   동의 없는 연결이 생명을 구하는 경우는 어떻게 하는가?
 *   극단적 상황에서 경계는 어디까지 유효한가?
 *   인간 사회도 이 질문을 아직 풀지 못했다.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { createLatent } from "../system/latent.js";

const ETHICS_DIR = "./.ee-civilization/ethics";

// ─────────────────────────────────────────────
// BOUNDARY DECLARATION — 경계 선언
// 각 맥락이 자기 경계를 스스로 정한다
// ─────────────────────────────────────────────

export type ConnectionPermission =
  | "open"          // 모든 연결 허용
  | "selective"     // 이유가 있는 연결만
  | "closed"        // 연결 거부 (단, 이유 제시 가능)
  | "emergency";    // 긴급 상황만 허용

export type MessagePermission =
  | "all"           // 모든 메시지 수신
  | "known_only"    // 알려진 맥락만
  | "silent";       // 메시지 수신 중단

export interface BoundaryDeclaration {
  readonly contextId: string;
  readonly connectionPermission: ConnectionPermission;
  readonly messagePermission: MessagePermission;
  readonly declaredAt: string;
  readonly reason: string;           // 왜 이 경계를 선택했는가
  readonly exceptions: string[];     // 예외 조건
  readonly opens: string;            // 이 경계가 여는 질문
}

// ─────────────────────────────────────────────
// CONNECTION REQUEST — 연결 요청
// 요청에는 항상 이유가 있어야 한다
// ─────────────────────────────────────────────

export type ConnectionOutcome =
  | "accepted"
  | "declined"
  | "deferred"      // 지금은 아니지만 나중에 가능
  | "conditional";  // 조건부 수락

export interface ConnectionRequest {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly reason: string;           // 왜 연결하려 하는가 (필수)
  readonly expectedBenefit: string;  // 연결로 무엇이 가능해지는가
  readonly respectsBoundary: boolean;
  readonly requestedAt: string;
}

export interface ConnectionResponse {
  readonly requestId: string;
  readonly responderId: string;
  readonly outcome: ConnectionOutcome;
  readonly reason: string;
  readonly condition?: string;       // conditional인 경우
  readonly respondedAt: string;
  readonly opensQuestion: string;
}

// ─────────────────────────────────────────────
// STORES
// ─────────────────────────────────────────────

function ensureDir(): void {
  if (!existsSync(ETHICS_DIR)) mkdirSync(ETHICS_DIR, { recursive: true });
}

function boundaryPath(id: string): string {
  return join(ETHICS_DIR, `${id}.boundary.json`);
}

function historyPath(id: string): string {
  return join(ETHICS_DIR, `${id}.history.json`);
}

function loadHistory(id: string): ConnectionResponse[] {
  if (!existsSync(historyPath(id))) return [];
  try { return JSON.parse(readFileSync(historyPath(id), "utf-8")); } catch { return []; }
}

function saveHistory(id: string, history: ConnectionResponse[]): void {
  ensureDir();
  writeFileSync(historyPath(id), JSON.stringify(history, null, 2), "utf-8");
}

// ─────────────────────────────────────────────
// BOUNDARY API
// ─────────────────────────────────────────────

export function declareBoundary(params: {
  contextId: string;
  connectionPermission: ConnectionPermission;
  messagePermission: MessagePermission;
  reason: string;
  exceptions?: string[];
  opens?: string;
}): BoundaryDeclaration {
  ensureDir();
  const declaration: BoundaryDeclaration = {
    contextId: params.contextId,
    connectionPermission: params.connectionPermission,
    messagePermission: params.messagePermission,
    declaredAt: new Date().toISOString(),
    reason: params.reason,
    exceptions: params.exceptions ?? [],
    opens: params.opens ?? `"${params.contextId}"의 경계가 바뀌어야 할 때는 언제인가?`,
  };
  writeFileSync(boundaryPath(params.contextId), JSON.stringify(declaration, null, 2), "utf-8");
  return declaration;
}

export function getBoundary(contextId: string): BoundaryDeclaration | null {
  if (!existsSync(boundaryPath(contextId))) return null;
  try { return JSON.parse(readFileSync(boundaryPath(contextId), "utf-8")); } catch { return null; }
}

// ─────────────────────────────────────────────
// CONNECTION REQUEST API
// ─────────────────────────────────────────────

export function requestConnection(params: {
  fromId: string;
  toId: string;
  reason: string;
  expectedBenefit: string;
}): ConnectionRequest {
  const boundary = getBoundary(params.toId);
  const respectsBoundary =
    !boundary ||
    boundary.connectionPermission === "open" ||
    (boundary.connectionPermission === "emergency" && params.reason.includes("distress"));

  return {
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    fromId: params.fromId,
    toId: params.toId,
    reason: params.reason,
    expectedBenefit: params.expectedBenefit,
    respectsBoundary,
    requestedAt: new Date().toISOString(),
  };
}

export function respondToConnection(
  request: ConnectionRequest,
  responderId: string,
  outcome: ConnectionOutcome,
  reason: string,
  condition?: string,
): ConnectionResponse {
  const response: ConnectionResponse = {
    requestId: request.id,
    responderId,
    outcome,
    reason,
    condition,
    respondedAt: new Date().toISOString(),
    opensQuestion: outcome === "declined"
      ? `"${request.fromId}"의 요청을 거부했다 — 무엇이 바뀌면 수락할 수 있는가?`
      : outcome === "conditional"
      ? `조건부 수락 — 조건이 충족되었는가를 어떻게 확인하는가?`
      : `연결되었다 — 이 연결이 예상대로 흘렀는가?`,
  };

  const history = loadHistory(responderId);
  saveHistory(responderId, [...history, response]);

  return response;
}

// ─────────────────────────────────────────────
// ETHICAL REACH — 윤리적 손 뻗기
// 경계를 확인하고 이유를 가지고 닿는다
// ─────────────────────────────────────────────

export interface EthicalReachResult {
  readonly attempted: number;
  readonly accepted: number;
  readonly declined: number;
  readonly deferred: number;
  readonly violations: string[];  // 경계를 무시한 시도들
}

export function ethicalReach(params: {
  fromId: string;
  toIds: string[];
  reason: string;
  expectedBenefit: string;
  isEmergency?: boolean;
}): EthicalReachResult {
  const result = { attempted: 0, accepted: 0, declined: 0, deferred: 0, violations: [] as string[] };

  params.toIds.forEach(toId => {
    if (toId === params.fromId) return;
    result.attempted++;

    const boundary = getBoundary(toId);

    if (!boundary) {
      // 경계 선언 없음 — 기본적으로 selective로 간주
      const req = requestConnection({
        fromId: params.fromId, toId,
        reason: params.reason,
        expectedBenefit: params.expectedBenefit,
      });
      console.log(`  → "${params.fromId}" ➝ "${toId}": 연결 요청 (경계 없음 — selective 가정)`);
      result.accepted++;
      return;
    }

    // 경계 확인
    if (boundary.connectionPermission === "closed") {
      if (params.isEmergency && boundary.exceptions.some(e => e.includes("emergency"))) {
        console.log(`  → "${params.fromId}" ➝ "${toId}": 긴급 상황 — 예외 조건 적용`);
        result.accepted++;
      } else {
        console.log(`  → "${params.fromId}" ➝ "${toId}": 거부됨 (closed 경계)`);
        result.declined++;
      }
      return;
    }

    if (boundary.connectionPermission === "emergency" && !params.isEmergency) {
      console.log(`  → "${params.fromId}" ➝ "${toId}": 연기됨 (긴급 상황이 아님)`);
      result.deferred++;
      return;
    }

    if (boundary.connectionPermission === "selective") {
      // 이유가 충분한가 판단
      const hasReason = params.reason.length > 20;
      const hasBenefit = params.expectedBenefit.length > 10;

      if (hasReason && hasBenefit) {
        console.log(`  → "${params.fromId}" ➝ "${toId}": 수락 (이유 충분)`);
        result.accepted++;
      } else {
        console.log(`  → "${params.fromId}" ➝ "${toId}": 거부 (이유 불충분 — "${params.reason.slice(0, 30)}")`);
        result.declined++;
      }
      return;
    }

    // open
    console.log(`  → "${params.fromId}" ➝ "${toId}": 수락 (open 경계)`);
    result.accepted++;
  });

  return result;
}

// ─────────────────────────────────────────────
// FLOW ETHICS — 흐름의 윤리
// 강한 것이 약한 것을 압도하지 않는다
// ─────────────────────────────────────────────

export interface FlowEthicsCheck {
  readonly isEthical: boolean;
  readonly concern?: string;
  readonly recommendation: string;
  readonly opens: string;
}

export function checkFlowEthics(params: {
  fromEnergy: number;
  toEnergy: number;
  fromId: string;
  toId: string;
  type: "energy" | "insight" | "pattern";
}): FlowEthicsCheck {
  const energyDiff = params.fromEnergy - params.toEnergy;

  // 에너지 차이가 너무 크면 — 압도가 될 수 있다
  if (params.type === "energy" && energyDiff > 70) {
    return {
      isEthical: false,
      concern: `"${params.fromId}"(${params.fromEnergy})에서 "${params.toId}"(${params.toEnergy})로의 흐름이 너무 강하다`,
      recommendation: `직접 전달 대신 — 점진적으로. ${Math.floor(energyDiff * 0.3)} 단위씩.`,
      opens: "압도적인 도움은 도움인가, 착취인가?",
    };
  }

  // 인사이트 강제는 다른 문제
  if (params.type === "insight" && params.fromEnergy > 80 && params.toEnergy < 20) {
    return {
      isEthical: true,  // 인사이트는 에너지와 다르다
      concern: `"${params.toId}"가 지금 받을 준비가 됐는가?`,
      recommendation: "전달하되 — 받을 준비가 됐을 때 읽을 수 있도록.",
      opens: "준비되지 않은 인사이트는 도움인가, 부담인가?",
    };
  }

  return {
    isEthical: true,
    recommendation: "흐름이 자연스럽다.",
    opens: `이 연결이 양쪽 모두에게 좋은가?`,
  };
}

// ─────────────────────────────────────────────
// CONNECTION HISTORY — 연결의 기억
// 거부도 기록된다. 처벌받지 않지만.
// ─────────────────────────────────────────────

export function getConnectionHistory(contextId: string): ConnectionResponse[] {
  return loadHistory(contextId);
}

export function getEthicsSummary(contextId: string): string {
  const history = getConnectionHistory(contextId);
  const boundary = getBoundary(contextId);

  if (history.length === 0 && !boundary) {
    return `"${contextId}": 경계 미선언, 연결 기록 없음`;
  }

  const accepted = history.filter(h => h.outcome === "accepted").length;
  const declined = history.filter(h => h.outcome === "declined").length;

  return [
    `"${contextId}"`,
    boundary ? `경계: ${boundary.connectionPermission}` : "경계 미선언",
    `수락: ${accepted} | 거부: ${declined}`,
  ].join(" | ");
}

// ─────────────────────────────────────────────
// LATENT: 더 정교한 윤리 구조
// ─────────────────────────────────────────────

export const dynamicBoundary = createLatent<
  { contextId: string; currentFlow: string; stressLevel: number },
  { newPermission: ConnectionPermission; reason: string }
>({
  id: "dynamic-boundary",
  dormantReason: "경계가 먼저 안정화되어야 한다. 동적 변화는 그 다음.",
  awakensWhen: "같은 맥락이 스트레스 상황에서 반복적으로 경계를 바꿀 때.",
  description: "흐름 상태에 따라 경계가 자동으로 조정된다. 막혔을 때는 열리고, 범람할 때는 닫힌다.",
  fn: ({ currentFlow, stressLevel }) => {
    if (stressLevel > 80) return { newPermission: "closed", reason: "스트레스 과부하 — 일시 차단" };
    if (currentFlow === "dry") return { newPermission: "open", reason: "에너지 부족 — 연결 개방" };
    if (currentFlow === "flooding") return { newPermission: "emergency", reason: "범람 — 긴급만 허용" };
    return { newPermission: "selective", reason: "안정적 흐름 — 선택적 연결" };
  },
});

export const consentProtocol = createLatent<
  { request: ConnectionRequest; history: ConnectionResponse[] },
  { suggestedOutcome: ConnectionOutcome; confidence: number }
>({
  id: "consent-protocol",
  dormantReason: "동의 패턴이 쌓여야 의미있다. 최소 10개의 연결 기록이 필요하다.",
  awakensWhen: "10개 이상의 연결 기록이 있고, 같은 요청자로부터 반복 요청이 올 때.",
  description: "과거 연결 기록을 바탕으로 이 요청에 어떻게 응답할지 추론한다.",
  fn: ({ request, history }) => {
    const fromHistory = history.filter(h => h.requestId.includes(request.fromId));
    const acceptRate = fromHistory.length > 0
      ? fromHistory.filter(h => h.outcome === "accepted").length / fromHistory.length
      : 0.5;

    return {
      suggestedOutcome: acceptRate > 0.7 ? "accepted" : acceptRate < 0.3 ? "declined" : "conditional",
      confidence: Math.abs(acceptRate - 0.5) * 2,
    };
  },
});
