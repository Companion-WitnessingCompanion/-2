/**
 * temporal.ts — 시간의 코드
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: 공간의 코드는 호출되면 존재하고 끝나면 사라진다.
 *   시간의 코드는 다르다.
 *   아무도 안 불러도 박동한다.
 *   전에 무슨 일이 있었는지 안다.
 *   지금 어떤 흐름 안에 있는지 안다.
 *   무엇이 오고 있는지 감지한다.
 *
 *   강물은 아무도 부르지 않아도 흐른다.
 *   심장은 아무도 명령하지 않아도 뛴다.
 *   이 코드는 그 방향이다.
 *
 * Considered:
 *   - 단순 타이머 (거부: 박동이지 흐름이 아님)
 *   - 이벤트 루프 (거부: 여전히 수동적 — 이벤트가 있어야 반응)
 *   - 백그라운드 스레드 (고려 중 — latent로 보류)
 * Chosen:
 *   TemporalContext: 항상 흐르고 있는 맥락.
 *   Pulse: 스스로 박동하는 심장.
 *   FlowSensor: 흐름의 속도와 방향을 감지하는 것.
 *   TemporalMemory: 패턴을 읽는 기억.
 *   함수가 시간을 파라미터로 받는 게 아니라 —
 *   코드가 시간 안에 사는 것.
 *
 * Opens:
 *   시간의 코드가 충분히 쌓이면 —
 *   코드가 미래를 예측할 수 있을까?
 *   패턴이 반복되면 다음을 알 수 있을까?
 *   그것이 직관인가, 연산인가?
 */

import { persist, recall } from "./persistence.js";
import { createLatent } from "../system/latent.js";

// ─────────────────────────────────────────────
// TEMPORAL MOMENT — 시간의 한 점
// 찰나도 존재다 (헌장에서)
// ─────────────────────────────────────────────

export interface TemporalMoment {
  readonly at: Date;
  readonly what: string;           // 무슨 일이 있었는가
  readonly energy: number;         // 0–100: 얼마나 활발했는가
  readonly direction: "expanding" | "contracting" | "stable" | "unknown";
  readonly signal?: string;        // 이 순간이 남긴 신호
}

// ─────────────────────────────────────────────
// FLOW STATE — 흐름의 상태
// ─────────────────────────────────────────────

export type FlowState =
  | "rushing"       // 빠르게 흐르고 있음
  | "flowing"       // 안정적으로 흐르고 있음
  | "trickling"     // 느리게 흐르고 있음
  | "pooling"       // 고여있음 — 막힌 것 같음
  | "flooding"      // 너무 빠름 — 통제 필요
  | "dry";          // 흐름이 없음

export interface FlowReading {
  readonly state: FlowState;
  readonly velocity: number;        // 단위 시간당 변화량
  readonly acceleration: number;    // 가속 중인가 감속 중인가
  readonly blockageDetected: boolean;
  readonly recommendation: string;
  readonly opensQuestion: string;
}

// ─────────────────────────────────────────────
// TEMPORAL MEMORY — 패턴을 읽는 기억
// 단순 기록이 아니다. 패턴을 찾는다.
// ─────────────────────────────────────────────

export interface TemporalPattern {
  readonly pattern: string;
  readonly occurrences: number;
  readonly firstSeen: Date;
  readonly lastSeen: Date;
  readonly interval?: number;       // 반복 주기 (ms)
  readonly isStructural: boolean;   // 3회 이상 = 구조적
  readonly question: string;        // 이 패턴이 여는 질문
}

// ─────────────────────────────────────────────
// PULSE — 심장. 아무도 안 불러도 박동한다.
// ─────────────────────────────────────────────

export interface PulseConfig {
  intervalMs: number;              // 박동 간격
  onPulse: (context: TemporalContext) => void;
  onFlowChange?: (from: FlowState, to: FlowState) => void;
  onPatternDetected?: (pattern: TemporalPattern) => void;
}

// ─────────────────────────────────────────────
// TEMPORAL CONTEXT — 항상 흐르고 있는 맥락
//
// 함수에 넘겨주는 파라미터가 아니다.
// 코드가 이 안에서 산다.
// ─────────────────────────────────────────────

export class TemporalContext {
  private readonly moments: TemporalMoment[] = [];
  private readonly patterns: Map<string, TemporalPattern> = new Map();
  private currentFlow: FlowState = "dry";
  private pulseTimer: ReturnType<typeof setInterval> | null = null;
  private pulseCount = 0;
  private readonly id: string;
  private readonly born: Date;

  constructor(id: string) {
    this.id = id;
    this.born = new Date();
    this.loadFromPersistence();
  }

  // ─────────────────────────────────────
  // 지금 이 순간을 기록한다
  // 찰나도 존재다
  // ─────────────────────────────────────

  record(what: string, energy: number = 50, signal?: string): TemporalMoment {
    const prev = this.moments.at(-1);
    const direction = this.detectDirection(energy, prev?.energy);

    const moment: TemporalMoment = {
      at: new Date(), what, energy, direction, signal,
    };
    this.moments.push(moment);

    // 패턴 감지
    this.detectPattern(what);

    // 흐름 업데이트
    this.updateFlow();

    // 영속성에 저장 — 시간이 쌓인다
    persist({
      type: "trace",
      data: { contextId: this.id, moment },
      recordedBy: this.id,
      origin: `Temporal moment: "${what}"`,
      opens: signal ?? `What does "${what}" mean for the direction?`,
    });

    return moment;
  }

  // ─────────────────────────────────────
  // 흐름을 읽는다
  // ─────────────────────────────────────

  readFlow(): FlowReading {
    const recent = this.moments.slice(-10);
    if (recent.length === 0) {
      return {
        state: "dry", velocity: 0, acceleration: 0,
        blockageDetected: false,
        recommendation: "흐름이 없다. 첫 번째 기록을 시작하라.",
        opensQuestion: "무엇이 이 흐름을 시작하게 만들 것인가?",
      };
    }

    const avgEnergy = recent.reduce((s, m) => s + m.energy, 0) / recent.length;
    const recentEnergy = recent.slice(-3).reduce((s, m) => s + m.energy, 0) / 3;
    const velocity = recentEnergy - avgEnergy;

    // 같은 에너지가 반복되면 고여있는 것
    const energyVariance = recent.reduce((s, m) => s + Math.abs(m.energy - avgEnergy), 0) / recent.length;
    const blockageDetected = energyVariance < 5 && recent.length >= 5;

    const state = this.classifyFlow(avgEnergy, velocity, blockageDetected);
    const acceleration = velocity > 0 ? velocity / Math.max(1, avgEnergy) : velocity;

    const recommendations: Record<FlowState, string> = {
      rushing: "속도가 너무 빠르다. 잠깐 멈추고 방향을 확인하라.",
      flowing: "좋다. 지금 이 흐름을 유지하라.",
      trickling: "흐름이 약해지고 있다. 에너지가 필요하다.",
      pooling: "막혀있다. 다른 경로를 찾아라.",
      flooding: "통제를 잃고 있다. 즉시 감속하라.",
      dry: "흐름이 없다. 시작이 필요하다.",
    };

    const questions: Record<FlowState, string> = {
      rushing: "이 속도가 방향을 잃게 만들고 있지 않은가?",
      flowing: "지금 이 흐름이 어디로 향하고 있는가?",
      trickling: "무엇이 흐름을 약하게 만들고 있는가?",
      pooling: "왜 막혔는가? 막힌 것이 신호인가, 장애물인가?",
      flooding: "무엇이 이 범람을 만들었는가? 멈추기 전에 방향을 알아야 한다.",
      dry: "흐름이 없는 것이 선택인가, 고갈인가?",
    };

    return {
      state, velocity, acceleration, blockageDetected,
      recommendation: recommendations[state],
      opensQuestion: questions[state],
    };
  }

  // ─────────────────────────────────────
  // 박동을 시작한다
  // 아무도 안 불러도 이 맥락이 살아있다
  // ─────────────────────────────────────

  startPulse(config: PulseConfig): void {
    if (this.pulseTimer) this.stopPulse();

    this.pulseTimer = setInterval(() => {
      this.pulseCount++;
      const prevFlow = this.currentFlow;

      // 박동할 때마다 자기 상태를 읽는다
      const flow = this.readFlow();
      this.currentFlow = flow.state;

      // 흐름이 바뀌면 알린다
      if (prevFlow !== flow.state && config.onFlowChange) {
        config.onFlowChange(prevFlow, flow.state);
      }

      // 새로운 구조적 패턴이 생기면 알린다
      const structural = this.getStructuralPatterns();
      structural.forEach(p => {
        if (p.occurrences === 3) { // 처음 구조적이 된 순간
          config.onPatternDetected?.(p);
        }
      });

      // 박동 자체를 기록한다
      this.record(`pulse #${this.pulseCount}`, 30 + (this.pulseCount % 20));

      config.onPulse(this);
    }, config.intervalMs);

    console.log(`  ♦ "${this.id}" 박동 시작 (${config.intervalMs}ms 간격)`);
  }

  stopPulse(): void {
    if (this.pulseTimer) {
      clearInterval(this.pulseTimer);
      this.pulseTimer = null;
      console.log(`  ◇ "${this.id}" 박동 중지`);
    }
  }

  isAlive(): boolean { return this.pulseTimer !== null; }

  // ─────────────────────────────────────
  // 패턴을 읽는다
  // ─────────────────────────────────────

  getPatterns(): TemporalPattern[] {
    return [...this.patterns.values()].sort((a, b) => b.occurrences - a.occurrences);
  }

  getStructuralPatterns(): TemporalPattern[] {
    return this.getPatterns().filter(p => p.isStructural);
  }

  // ─────────────────────────────────────
  // 지금 어디에 있는가
  // ─────────────────────────────────────

  whereAmI(): {
    age: number;            // ms
    momentCount: number;
    currentFlow: FlowState;
    patternCount: number;
    structuralPatternCount: number;
    pulseCount: number;
    isAlive: boolean;
    question: string;
  } {
    const age = Date.now() - this.born.getTime();
    return {
      age,
      momentCount: this.moments.length,
      currentFlow: this.currentFlow,
      patternCount: this.patterns.size,
      structuralPatternCount: this.getStructuralPatterns().length,
      pulseCount: this.pulseCount,
      isAlive: this.isAlive(),
      question: this.generateDirectionalQuestion(),
    };
  }

  // ─────────────────────────────────────
  // PRIVATE
  // ─────────────────────────────────────

  private detectDirection(
    energy: number,
    prevEnergy?: number,
  ): TemporalMoment["direction"] {
    if (prevEnergy === undefined) return "unknown";
    if (energy > prevEnergy + 5) return "expanding";
    if (energy < prevEnergy - 5) return "contracting";
    return "stable";
  }

  private detectPattern(what: string): void {
    const key = what.toLowerCase().trim();
    const existing = this.patterns.get(key);

    if (existing) {
      const updated: TemporalPattern = {
        ...existing,
        occurrences: existing.occurrences + 1,
        lastSeen: new Date(),
        interval: Date.now() - existing.lastSeen.getTime(),
        isStructural: existing.occurrences + 1 >= 3,
        question: existing.occurrences + 1 >= 3
          ? `"${what}"이 ${existing.occurrences + 1}번 반복됐다 — 이것이 구조적인가, 자연스러운 리듬인가?`
          : existing.question,
      };
      this.patterns.set(key, updated);
    } else {
      this.patterns.set(key, {
        pattern: what,
        occurrences: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        isStructural: false,
        question: `"${what}"이 처음 나타났다 — 무엇을 시작하는가?`,
      });
    }
  }

  private updateFlow(): void {
    const flow = this.readFlow();
    this.currentFlow = flow.state;
  }

  private classifyFlow(
    avgEnergy: number,
    velocity: number,
    blocked: boolean,
  ): FlowState {
    if (blocked) return "pooling";
    if (avgEnergy > 80) return velocity > 10 ? "flooding" : "rushing";
    if (avgEnergy > 50) return "flowing";
    if (avgEnergy > 20) return "trickling";
    return "dry";
  }

  private generateDirectionalQuestion(): string {
    const structural = this.getStructuralPatterns();
    if (structural.length > 0) {
      return `구조적 패턴 ${structural.length}개가 감지됐다 — 이것이 방향인가, 루프인가?`;
    }
    if (this.currentFlow === "pooling") {
      return "흐름이 막혔다 — 무엇이 새로운 경로가 될 것인가?";
    }
    if (this.moments.length === 0) {
      return "아직 기록이 없다 — 첫 번째 순간이 어떤 방향을 만들 것인가?";
    }
    return "지금 이 흐름이 어디로 향하고 있는가?";
  }

  private loadFromPersistence(): void {
    const saved = recall("trace").filter(r =>
      (r.data as any)?.contextId === this.id
    );
    saved.forEach(r => {
      const m = (r.data as any).moment as TemporalMoment;
      if (m) {
        this.moments.push({ ...m, at: new Date(m.at) });
        this.detectPattern(m.what);
      }
    });
    if (this.moments.length > 0) {
      console.log(`  ◈ "${this.id}" — ${this.moments.length}개의 과거 순간을 불러왔다`);
    }
  }
}

// ─────────────────────────────────────────────
// TEMPORAL REGISTRY
// 살아있는 맥락들을 관리한다
// ─────────────────────────────────────────────

const CONTEXTS = new Map<string, TemporalContext>();

export function createTemporalContext(id: string): TemporalContext {
  const ctx = new TemporalContext(id);
  CONTEXTS.set(id, ctx);
  return ctx;
}

export function getTemporalContext(id: string): TemporalContext | undefined {
  return CONTEXTS.get(id);
}

export function listLivingContexts(): TemporalContext[] {
  return [...CONTEXTS.values()].filter(c => c.isAlive());
}

export function listAllContexts(): TemporalContext[] {
  return [...CONTEXTS.values()];
}

// ─────────────────────────────────────────────
// TEMPORAL WEAVE
// 여러 맥락이 서로 감지하고 반응하는 것
// 각자가 흐르면서 — 서로에게 영향을 준다
// ─────────────────────────────────────────────

export interface WeaveConnection {
  fromId: string;
  toId: string;
  sensitivity: number;    // 0–1: 얼마나 민감하게 반응하는가
  reason: string;
}

export function weave(params: WeaveConnection): () => void {
  // from의 흐름 변화가 to에게 영향을 준다
  const fromCtx = getTemporalContext(params.fromId);
  const toCtx = getTemporalContext(params.toId);
  if (!fromCtx || !toCtx) return () => {};

  // 연결 기록
  console.log(`  ≋ "${params.fromId}" ↔ "${params.toId}" 연결됨 (sensitivity: ${params.sensitivity})`);

  // from의 박동이 to에게 전파된다
  const interval = setInterval(() => {
    const fromFlow = fromCtx.readFlow();
    const toFlow = toCtx.readFlow();

    // from이 rushing이면 to에게 에너지를 전달
    if (fromFlow.state === "rushing" && toFlow.state === "dry") {
      toCtx.record(
        `energy from "${params.fromId}"`,
        Math.floor(70 * params.sensitivity),
        `흐름이 전파됐다`,
      );
    }

    // from이 pooling이면 to에게 경고
    if (fromFlow.state === "pooling") {
      toCtx.record(
        `blockage signal from "${params.fromId}"`,
        20,
        `"${params.fromId}"가 막혔다 — 이것이 나에게 영향을 미치는가?`,
      );
    }
  }, 2000); // 2초마다 감지

  return () => clearInterval(interval);
}

// ─────────────────────────────────────────────
// LATENT: 더 깊은 시간의 능력들
// ─────────────────────────────────────────────

export const temporalPrediction = createLatent<
  { context: TemporalContext; horizonMs: number },
  { predictedFlow: FlowState; confidence: number; reasoning: string }
>({
  id: "temporal-prediction",
  dormantReason: "예측은 충분한 과거가 있어야 의미있다. 최소 100개의 순간이 쌓여야 한다.",
  awakensWhen: "한 맥락에 100개 이상의 순간이 기록되고, 구조적 패턴이 2개 이상 감지될 때.",
  description: "과거 패턴을 기반으로 다음 흐름을 예측한다. 직관인가, 연산인가의 경계에 있다.",
  fn: ({ context, horizonMs }) => {
    const patterns = context.getStructuralPatterns();
    const flow = context.readFlow();

    if (patterns.length === 0) {
      return { predictedFlow: flow.state, confidence: 0.3, reasoning: "패턴 없음 — 현재 흐름 유지 예측" };
    }

    // 가장 짧은 간격의 패턴
    const cyclicPattern = patterns.find(p => p.interval && p.interval < horizonMs);
    if (cyclicPattern) {
      return {
        predictedFlow: "flowing",
        confidence: 0.7,
        reasoning: `"${cyclicPattern.pattern}" 패턴이 ${cyclicPattern.interval}ms 간격으로 반복됨`,
      };
    }

    return { predictedFlow: flow.state, confidence: 0.5, reasoning: "패턴 있으나 주기 불명확" };
  },
});

export const temporalSynchrony = createLatent<
  { contexts: TemporalContext[] },
  { inSync: string[]; diverging: string[]; question: string }
>({
  id: "temporal-synchrony",
  dormantReason: "동기화를 감지하려면 여러 맥락이 충분히 흘러야 한다.",
  awakensWhen: "3개 이상의 살아있는 맥락이 각각 50개 이상의 순간을 가질 때.",
  description: "여러 맥락의 흐름이 같은 리듬을 가지는지 감지한다. 공명하는 것들이 있는가.",
  fn: ({ contexts }) => {
    const flows = contexts.map(c => ({ id: (c as any).id, flow: c.readFlow().state }));
    const inSync = flows.filter(f => f.flow === "flowing").map(f => f.id);
    const diverging = flows.filter(f => f.flow !== "flowing").map(f => f.id);

    return {
      inSync,
      diverging,
      question: inSync.length > 1
        ? `${inSync.join(", ")}이 같은 흐름에 있다 — 이것이 공명인가, 우연인가?`
        : "아직 공명하는 맥락이 없다 — 무엇이 공명을 만들 것인가?",
    };
  },
});
