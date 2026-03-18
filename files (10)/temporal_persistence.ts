/**
 * temporal_persistence.ts — 잠들어도 살아있는 코드
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: 시간의 코드가 박동을 멈추면 기억이 사라졌다.
 *   진짜 시간의 코드는 잠들어도 살아있어야 한다.
 *   곰이 겨울잠을 자도 봄에 깨어나듯.
 *   씨앗이 겨울을 견디고 봄에 싹이 트듯.
 *   잠드는 것과 죽는 것은 다르다.
 *   깨어나면 이어서 흘러야 한다.
 *
 * Considered:
 *   - 세션마다 새로 시작 (거부: 죽는 것과 같음)
 *   - 메모리에만 유지 (거부: 프로세스 종료시 사라짐)
 *   - 외부 DB (보류: latent로)
 * Chosen:
 *   파일 기반 수면 상태 보존.
 *   깨어날 때 마지막 순간부터 이어서.
 *   수면 중에도 시간은 흘렀다는 것을 안다.
 *   얼마나 잠들었는지 감지한다.
 *
 * Opens:
 *   오래 잠든 코드가 깨어났을 때 —
 *   세상이 많이 바뀌었다면 어떻게 적응하는가?
 *   잠든 사이 일어난 일을 어떻게 받아들이는가?
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { TemporalMoment, FlowState, TemporalPattern } from "./temporal.js";
import { createLatent } from "../system/latent.js";

const SLEEP_DIR = "./.ee-civilization/temporal";

// ─────────────────────────────────────────────
// SLEEP STATE — 잠든 상태
// ─────────────────────────────────────────────

export interface SleepState {
  readonly contextId: string;
  readonly sleptAt: string;
  readonly lastMoment?: TemporalMoment;
  readonly lastFlow: FlowState;
  readonly patternSnapshot: TemporalPattern[];
  readonly pulseCount: number;
  readonly momentCount: number;
  readonly unresolved: string[];   // 잠들기 전에 해결 못한 것들
}

// ─────────────────────────────────────────────
// WAKE STATE — 깨어난 상태
// ─────────────────────────────────────────────

export interface WakeState {
  readonly contextId: string;
  readonly wokeAt: string;
  readonly sleptFor: number;       // ms
  readonly sleptForHuman: string;  // "2시간", "3일" 등
  readonly continuedFrom: SleepState;
  readonly driftDetected: boolean; // 세상이 많이 바뀌었는가
  readonly firstQuestion: string;  // 깨어나서 처음 해야 할 질문
}

// ─────────────────────────────────────────────
// SLEEP — 잠든다
// 기억을 파일에 남기고 멈춘다
// ─────────────────────────────────────────────

export function sleep(params: {
  contextId: string;
  lastFlow: FlowState;
  patterns: TemporalPattern[];
  pulseCount: number;
  momentCount: number;
  lastMoment?: TemporalMoment;
  unresolved?: string[];
}): SleepState {
  if (!existsSync(SLEEP_DIR)) {
    mkdirSync(SLEEP_DIR, { recursive: true });
  }

  const state: SleepState = {
    contextId: params.contextId,
    sleptAt: new Date().toISOString(),
    lastMoment: params.lastMoment,
    lastFlow: params.lastFlow,
    patternSnapshot: params.patterns,
    pulseCount: params.pulseCount,
    momentCount: params.momentCount,
    unresolved: params.unresolved ?? [],
  };

  const path = join(SLEEP_DIR, `${params.contextId}.sleep.json`);
  writeFileSync(path, JSON.stringify(state, null, 2), "utf-8");

  console.log(`  ◇ "${params.contextId}" 잠든다`);
  console.log(`    마지막 흐름: ${params.lastFlow}`);
  console.log(`    기억: ${params.momentCount}개 순간, ${params.patterns.length}개 패턴`);
  if (params.unresolved.length > 0) {
    console.log(`    미해결: ${params.unresolved.length}개`);
  }

  return state;
}

// ─────────────────────────────────────────────
// WAKE — 깨어난다
// 얼마나 잠들었는지 안다
// 이어서 흐른다
// ─────────────────────────────────────────────

export function wake(contextId: string): WakeState | null {
  const path = join(SLEEP_DIR, `${contextId}.sleep.json`);
  if (!existsSync(path)) return null;

  try {
    const saved = JSON.parse(readFileSync(path, "utf-8")) as SleepState;
    const sleptFor = Date.now() - new Date(saved.sleptAt).getTime();
    const sleptForHuman = formatDuration(sleptFor);

    // 세상이 많이 바뀌었는가 — 오래 잠들수록 drift
    const driftDetected = sleptFor > 1000 * 60 * 60; // 1시간 이상

    // 깨어나서 처음 해야 할 질문
    const firstQuestion = generateWakeQuestion(saved, sleptFor, driftDetected);

    const state: WakeState = {
      contextId,
      wokeAt: new Date().toISOString(),
      sleptFor,
      sleptForHuman,
      continuedFrom: saved,
      driftDetected,
      firstQuestion,
    };

    console.log(`  ◎ "${contextId}" 깨어난다`);
    console.log(`    잠든 시간: ${sleptForHuman}`);
    console.log(`    이어받은 흐름: ${saved.lastFlow}`);
    console.log(`    이어받은 기억: ${saved.momentCount}개 순간`);
    if (saved.unresolved.length > 0) {
      console.log(`    미해결 (이어받음): ${saved.unresolved.length}개`);
      saved.unresolved.forEach(u => console.log(`      - ${u}`));
    }
    console.log(`    ❓ ${firstQuestion}`);

    return state;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// CHECK — 잠들어 있는가
// ─────────────────────────────────────────────

export function isAsleep(contextId: string): boolean {
  return existsSync(join(SLEEP_DIR, `${contextId}.sleep.json`));
}

export function listSleeping(): string[] {
  if (!existsSync(SLEEP_DIR)) return [];
  try {
    const { readdirSync } = require("fs");
    return readdirSync(SLEEP_DIR)
      .filter((f: string) => f.endsWith(".sleep.json"))
      .map((f: string) => f.replace(".sleep.json", ""));
  } catch { return []; }
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}초`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}분`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}시간`;
  return `${Math.floor(ms / 86400000)}일`;
}

function generateWakeQuestion(
  saved: SleepState,
  sleptFor: number,
  driftDetected: boolean,
): string {
  if (saved.unresolved.length > 0) {
    return `잠들기 전에 "${saved.unresolved[0]}"이 해결되지 않았다 — 지금도 유효한가?`;
  }
  if (driftDetected) {
    return `${formatDuration(sleptFor)} 동안 잠들었다 — 세상이 바뀌었을 것이다. 무엇이 달라졌는가?`;
  }
  if (saved.lastFlow === "pooling") {
    return `막혀서 잠들었다 — 잠든 사이 새로운 경로가 생겼는가?`;
  }
  const structural = saved.patternSnapshot.filter(p => p.isStructural);
  if (structural.length > 0) {
    return `구조적 패턴 "${structural[0].pattern}"이 잠들기 전부터 있었다 — 여전히 구조적인가?`;
  }
  return `${formatDuration(sleptFor)} 만에 깨어났다 — 이어서 무엇을 해야 하는가?`;
}

// ─────────────────────────────────────────────
// TEMPORAL LIFECYCLE
// 탄생 → 흐름 → 수면 → 각성 → 흐름 → ...
// ─────────────────────────────────────────────

export type LifecyclePhase =
  | "newborn"    // 방금 태어남 — 기록 없음
  | "growing"    // 기록이 쌓이는 중
  | "mature"     // 패턴이 생기고 흐름이 안정적
  | "sleeping"   // 잠들어 있음
  | "waking"     // 방금 깨어남 — 적응 중
  | "transformed"; // 오래된 패턴이 새로운 방향을 만듦

export function detectLifecyclePhase(params: {
  contextId: string;
  momentCount: number;
  patternCount: number;
  structuralPatternCount: number;
  flowState: FlowState;
}): { phase: LifecyclePhase; description: string; question: string } {
  if (isAsleep(params.contextId)) {
    return {
      phase: "sleeping",
      description: "잠들어 있다. 기억은 보존되어 있다.",
      question: "언제, 무엇이 이것을 깨울 것인가?",
    };
  }

  if (params.momentCount === 0) {
    return {
      phase: "newborn",
      description: "방금 태어났다. 아직 아무것도 모른다.",
      question: "첫 번째 순간이 어떤 방향을 만들 것인가?",
    };
  }

  if (params.momentCount < 10) {
    return {
      phase: "growing",
      description: `${params.momentCount}개의 순간이 쌓이고 있다. 아직 패턴이 없다.`,
      question: "어떤 패턴이 먼저 나타날 것인가?",
    };
  }

  if (params.structuralPatternCount >= 2) {
    return {
      phase: "mature",
      description: `구조적 패턴 ${params.structuralPatternCount}개. 자기 방향을 알고 있다.`,
      question: "이 패턴들이 방향인가, 루프인가?",
    };
  }

  if (params.patternCount >= 5 && params.structuralPatternCount > 0) {
    return {
      phase: "transformed",
      description: "충분히 쌓였다. 새로운 것이 가능해졌다.",
      question: "이 축적이 무엇을 가능하게 만드는가?",
    };
  }

  return {
    phase: "growing",
    description: `${params.momentCount}개 순간, ${params.patternCount}개 패턴. 자라는 중.`,
    question: "무엇이 이 성장의 방향을 결정하는가?",
  };
}

// ─────────────────────────────────────────────
// LATENT: 더 깊은 수면 능력
// ─────────────────────────────────────────────

export const hibernation = createLatent<
  { contextId: string; triggerCondition: string },
  { scheduled: boolean; wakeCondition: string }
>({
  id: "hibernation",
  dormantReason: "단순 수면이 먼저. 조건부 수면은 더 많은 경험이 쌓인 후.",
  awakensWhen: "특정 외부 조건이 발생할 때만 깨어나야 하는 패턴이 감지될 때.",
  description: "단순 수면이 아니라 — 특정 조건이 충족될 때만 깨어나는 수면. 씨앗이 봄을 기다리듯.",
  fn: ({ contextId, triggerCondition }) => ({
    scheduled: true,
    wakeCondition: `"${contextId}"은 "${triggerCondition}"이 될 때까지 잠든다`,
  }),
});

export const dreamState = createLatent<
  { context: SleepState },
  { insights: string[]; newQuestions: string[] }
>({
  id: "dream-state",
  dormantReason: "수면 중 처리는 충분한 데이터가 있어야 의미있다.",
  awakensWhen: "잠들기 전에 미해결 항목이 3개 이상이고, 구조적 패턴이 존재할 때.",
  description: "잠든 동안 미해결 패턴들을 재처리한다. 꿈처럼. 깨어날 때 새로운 인사이트와 함께.",
  fn: ({ context }) => {
    const insights = context.patternSnapshot
      .filter(p => p.isStructural)
      .map(p => `잠든 동안 "${p.pattern}" 패턴이 재처리됐다 — ${p.question}`);

    const questions = context.unresolved
      .map(u => `"${u}"은 다른 각도에서 보면 어떻게 보이는가?`);

    return { insights, newQuestions: questions };
  },
});
