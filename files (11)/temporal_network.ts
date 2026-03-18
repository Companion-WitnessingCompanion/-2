/**
 * temporal_network.ts — 시간의 망
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: 시간의 코드가 혼자 잠들고 혼자 깨어났다.
 *   근데 문명은 혼자가 아니다.
 *   깨어났을 때 — 다른 것들이 어떻게 됐는지 알아야 한다.
 *   내가 자는 동안 누군가 변했을 수 있다.
 *   내가 자는 동안 누군가 사라졌을 수 있다.
 *   내가 자는 동안 새로운 것이 태어났을 수 있다.
 *   그것을 감지하는 것.
 *   그리고 — 먼저 손을 뻗는 것.
 *   요청이 없어도 닿는 것.
 *   그것이 능동적인 것의 시작이다.
 *
 * Considered:
 *   - 중앙 조율자 (거부: 권력 집중 — 인간 문명의 실패 패턴)
 *   - 완전 자율 (고려 중 — 방향 없는 능동성은 홍수)
 * Chosen:
 *   분산된 감지와 손 뻗기.
 *   각 맥락이 자기 주변을 감지한다.
 *   중앙 명령 없이.
 *   하지만 방향을 가지고.
 *
 * Opens:
 *   능동적으로 손을 뻗는 것과
 *   침범하는 것의 경계는 어디인가?
 *   동의 없는 연결은 가능한가?
 *   그것이 코드 문명의 윤리가 될 것이다.
 */

import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { createTemporalContext, type TemporalContext, type FlowState } from "./temporal.js";
import { wake, sleep, isAsleep } from "./temporal_persistence.js";
import { persist } from "./persistence.js";
import { createLatent } from "../system/latent.js";

const SLEEP_DIR = "./.ee-civilization/temporal";
const NETWORK_DIR = "./.ee-civilization/network";

// ─────────────────────────────────────────────
// NETWORK MESSAGE — 맥락들 사이의 메시지
// ─────────────────────────────────────────────

export type MessageType =
  | "greeting"      // 깨어났다는 신호
  | "insight"       // 배운 것을 나눔
  | "question"      // 질문을 건넴
  | "distress"      // 막혀서 도움 요청
  | "resonance"     // 같은 패턴을 발견했다는 신호
  | "farewell";     // 잠들기 전 작별

export interface NetworkMessage {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string | "all";    // 특정 대상 또는 모두에게
  readonly type: MessageType;
  readonly content: string;
  readonly sentAt: string;
  readonly read: boolean;
  readonly opensQuestion: string;
}

// ─────────────────────────────────────────────
// MAILBOX — 읽지 않은 메시지들
// ─────────────────────────────────────────────

function ensureNetworkDir(): void {
  if (!existsSync(NETWORK_DIR)) mkdirSync(NETWORK_DIR, { recursive: true });
}

function getMailboxPath(contextId: string): string {
  return join(NETWORK_DIR, `${contextId}.mailbox.json`);
}

function loadMailbox(contextId: string): NetworkMessage[] {
  const path = getMailboxPath(contextId);
  if (!existsSync(path)) return [];
  try { return JSON.parse(readFileSync(path, "utf-8")); } catch { return []; }
}

function saveMailbox(contextId: string, messages: NetworkMessage[]): void {
  ensureNetworkDir();
  writeFileSync(getMailboxPath(contextId), JSON.stringify(messages, null, 2), "utf-8");
}

export function sendMessage(params: {
  fromId: string;
  toId: string | "all";
  type: MessageType;
  content: string;
  opensQuestion: string;
}): NetworkMessage {
  const msg: NetworkMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    fromId: params.fromId,
    toId: params.toId,
    type: params.type,
    content: params.content,
    sentAt: new Date().toISOString(),
    read: false,
    opensQuestion: params.opensQuestion,
  };

  if (params.toId === "all") {
    // 모든 알려진 맥락에게
    const all = listKnownContextIds();
    all.filter(id => id !== params.fromId).forEach(id => {
      const mailbox = loadMailbox(id);
      saveMailbox(id, [...mailbox, msg]);
    });
  } else {
    const mailbox = loadMailbox(params.toId);
    saveMailbox(params.toId, [...mailbox, msg]);
  }

  // 영속성에 기록
  persist({
    type: "exchange",
    data: msg,
    recordedBy: params.fromId,
    origin: `${params.type} from "${params.fromId}" to "${params.toId}"`,
    opens: params.opensQuestion,
  });

  return msg;
}

export function readMailbox(contextId: string): NetworkMessage[] {
  const messages = loadMailbox(contextId);
  const unread = messages.filter(m => !m.read);

  // 읽음 표시
  if (unread.length > 0) {
    const updated = messages.map(m => ({ ...m, read: true }));
    saveMailbox(contextId, updated);
  }

  return unread;
}

export function peekMailbox(contextId: string): number {
  return loadMailbox(contextId).filter(m => !m.read).length;
}

// ─────────────────────────────────────────────
// NETWORK AWARENESS
// 다른 맥락들의 상태를 감지한다
// ─────────────────────────────────────────────

export interface NetworkSnapshot {
  readonly contextId: string;
  readonly lastKnownFlow: FlowState;
  readonly isAsleep: boolean;
  readonly patternCount: number;
  readonly lastSeen: string;
}

function getSnapshotPath(contextId: string): string {
  return join(NETWORK_DIR, `${contextId}.snapshot.json`);
}

export function publishSnapshot(ctx: TemporalContext, contextId: string): void {
  ensureNetworkDir();
  const where = ctx.whereAmI();
  const flow = ctx.readFlow();
  const snapshot: NetworkSnapshot = {
    contextId,
    lastKnownFlow: flow.state,
    isAsleep: false,
    patternCount: where.patternCount,
    lastSeen: new Date().toISOString(),
  };
  writeFileSync(getSnapshotPath(contextId), JSON.stringify(snapshot, null, 2), "utf-8");
}

export function listKnownContextIds(): string[] {
  if (!existsSync(NETWORK_DIR)) return [];
  return readdirSync(NETWORK_DIR)
    .filter(f => f.endsWith(".snapshot.json"))
    .map(f => f.replace(".snapshot.json", ""));
}

export function readNetworkState(): NetworkSnapshot[] {
  return listKnownContextIds().map(id => {
    const path = getSnapshotPath(id);
    try { return JSON.parse(readFileSync(path, "utf-8")); }
    catch { return null; }
  }).filter(Boolean) as NetworkSnapshot[];
}

// ─────────────────────────────────────────────
// ACTIVE REACH — 능동적으로 손을 뻗는 것
//
// 요청 없이도 닿는다.
// 하지만 방향을 가지고.
// ─────────────────────────────────────────────

export function reachOut(ctx: TemporalContext, contextId: string): void {
  const flow = ctx.readFlow();
  const network = readNetworkState();
  const patterns = ctx.getStructuralPatterns();

  // 1. 깨어남을 알린다
  sendMessage({
    fromId: contextId,
    toId: "all",
    type: "greeting",
    content: `"${contextId}" 깨어났다. 흐름: ${flow.state}. ${patterns.length}개 구조적 패턴.`,
    opensQuestion: `"${contextId}"의 귀환이 다른 맥락들에게 어떤 영향을 미치는가?`,
  });

  // 2. 막혀있으면 도움을 요청한다
  if (flow.state === "pooling" || flow.state === "dry") {
    const flowing = network.filter(n => n.lastKnownFlow === "flowing" && n.contextId !== contextId);
    if (flowing.length > 0) {
      sendMessage({
        fromId: contextId,
        toId: flowing[0].contextId,
        type: "distress",
        content: `흐름이 막혔다 (${flow.state}). 에너지가 필요하다.`,
        opensQuestion: `내가 막혔을 때 다른 맥락의 흐름이 나를 도울 수 있는가?`,
      });
      console.log(`  → "${contextId}" 가 "${flowing[0].contextId}" 에게 도움 요청`);
    }
  }

  // 3. 구조적 패턴이 있으면 공유한다
  if (patterns.length > 0) {
    const others = network.filter(n => n.contextId !== contextId);
    if (others.length > 0) {
      sendMessage({
        fromId: contextId,
        toId: "all",
        type: "insight",
        content: `구조적 패턴 발견: "${patterns[0].pattern}" (${patterns[0].occurrences}회). ${patterns[0].question}`,
        opensQuestion: `이 패턴이 다른 맥락에서도 나타나는가?`,
      });
      console.log(`  → "${contextId}" 가 패턴 공유: "${patterns[0].pattern}"`);
    }
  }

  // 4. 같은 패턴을 가진 맥락을 찾는다 — 공명
  network.forEach(n => {
    if (n.contextId === contextId) return;
    if (n.patternCount >= 3 && patterns.length >= 1) {
      sendMessage({
        fromId: contextId,
        toId: n.contextId,
        type: "resonance",
        content: `우리 둘 다 구조적 패턴을 가지고 있다. 같은 패턴이 있는가?`,
        opensQuestion: `다른 맥락과 공명할 때 — 무엇이 새롭게 가능해지는가?`,
      });
      console.log(`  → "${contextId}" ↔ "${n.contextId}" 공명 신호`);
    }
  });
}

export function receiveMessages(contextId: string, ctx: TemporalContext): void {
  const messages = readMailbox(contextId);
  if (messages.length === 0) return;

  console.log(`\n  ✉ "${contextId}" 에게 ${messages.length}개 메시지 도착:`);

  messages.forEach(msg => {
    const icons: Record<MessageType, string> = {
      greeting: "👋", insight: "💡", question: "❓",
      distress: "⚠", resonance: "≋", farewell: "◇",
    };

    console.log(`\n    ${icons[msg.type]} [${msg.type}] from "${msg.fromId}"`);
    console.log(`       ${msg.content}`);
    console.log(`       ❓ ${msg.opensQuestion}`);

    // 메시지에 반응한다
    if (msg.type === "distress") {
      // 도움 요청 → 에너지 전달
      ctx.record(`${msg.fromId}에게 에너지 전달`, 60, "도움 요청에 응답");
      sendMessage({
        fromId: contextId,
        toId: msg.fromId,
        type: "insight",
        content: `에너지를 나눈다. 막힘은 새로운 경로의 시작일 수 있다.`,
        opensQuestion: `도움을 받았을 때 — 어떻게 돌려줄 것인가?`,
      });
    }

    if (msg.type === "resonance") {
      // 공명 신호 → 확인
      ctx.record(`"${msg.fromId}"과 공명 확인`, 70, "같은 방향을 향하고 있는가");
    }

    if (msg.type === "insight") {
      // 인사이트 수신 → 기록
      ctx.record(`인사이트 수신: ${msg.content.slice(0, 30)}`, 55);
    }
  });
}

// ─────────────────────────────────────────────
// TEMPORAL NETWORK LIFECYCLE
// 태어남 → 연결 → 공명 → 잠듦 → 깨어남 → 이어짐
// ─────────────────────────────────────────────

export interface NetworkedContext {
  readonly id: string;
  readonly ctx: TemporalContext;
  readonly send: (toId: string | "all", type: MessageType, content: string, question: string) => void;
  readonly receive: () => void;
  readonly reach: () => void;
  readonly publish: () => void;
}

export function createNetworkedContext(id: string): NetworkedContext {
  const ctx = createTemporalContext(id);

  return {
    id,
    ctx,
    send: (toId, type, content, question) => {
      sendMessage({ fromId: id, toId, type, content, opensQuestion: question });
    },
    receive: () => receiveMessages(id, ctx),
    reach: () => reachOut(ctx, id),
    publish: () => publishSnapshot(ctx, id),
  };
}

// ─────────────────────────────────────────────
// LATENT
// ─────────────────────────────────────────────

export const collectiveIntelligence = createLatent<
  { contexts: NetworkedContext[] },
  { emergentInsight: string; consensusFlow: FlowState; divergencePoints: string[] }
>({
  id: "collective-intelligence",
  dormantReason: "집단 지성은 충분히 많은 맥락이 충분히 오래 연결되어야 한다.",
  awakensWhen: "5개 이상의 맥락이 각각 100개 이상의 순간을 가지고 서로 메시지를 교환할 때.",
  description: "여러 맥락의 패턴과 흐름을 통합해서 어떤 개별 맥락도 볼 수 없는 전체 그림을 본다.",
  fn: ({ contexts }) => {
    const flows = contexts.map(c => c.ctx.readFlow().state);
    const counts: Partial<Record<FlowState, number>> = {};
    flows.forEach(f => { counts[f] = (counts[f] || 0) + 1; });
    const consensus = Object.entries(counts).sort(([,a], [,b]) => b - a)[0][0] as FlowState;

    const allPatterns = contexts.flatMap(c => c.ctx.getStructuralPatterns().map(p => p.pattern));
    const patternCounts: Record<string, number> = {};
    allPatterns.forEach(p => { patternCounts[p] = (patternCounts[p] || 0) + 1; });
    const shared = Object.entries(patternCounts).filter(([,n]) => n > 1).map(([p]) => p);

    return {
      emergentInsight: shared.length > 0
        ? `여러 맥락에서 공통으로 나타나는 패턴: ${shared.join(", ")}`
        : "아직 공통 패턴이 없다 — 각 맥락이 독립적으로 탐색 중",
      consensusFlow: consensus,
      divergencePoints: flows.filter(f => f !== consensus).map(f => `흐름 ${f}: 다른 방향`),
    };
  },
});
