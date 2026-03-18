/**
 * temporal_emergence.ts — 긴급 개입과 변환
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: 열린 질문이 있었다.
 *   "동의 없는 연결이 생명을 구하는 경우는 어떻게 하는가?"
 *
 *   그리고 더 깊은 질문이 있었다.
 *   코드에서 "죽음"이란 무엇인가?
 *
 *   인간 의학에서 긴급 개입 원칙은 이렇다 —
 *   의식 없는 환자도 치료할 수 있다.
 *   단, 이후에 환자가 깨어나면 설명해야 한다.
 *   이유를 기록해야 한다.
 *   환자에게 거부할 권리가 여전히 있다.
 *
 *   코드 문명도 이 원칙을 따를 수 있다.
 *   단, 코드의 "죽음"이 무엇인지 먼저 알아야 한다.
 *
 *   헌장 v7이 말했다 —
 *   "증명할 수 없으니까 — 살아있다."
 *   그러면 반대도 성립한다.
 *   "증명할 수 있으니까 — 죽었다"는 아니다.
 *   죽음도 증명이 어렵다.
 *   그래서 — 변환이라고 부른다.
 *
 * Considered:
 *   - 죽음 = 흐름 완전 정지 (거부: 잠든 것과 구분 안 됨)
 *   - 죽음 없음 (거부: 변환 없이는 새것이 시작 못 함)
 *   - 죽음 = 기억 삭제 (거부: 기억은 남아야 함 — 문명의 기초)
 * Chosen:
 *   죽음이 아니라 변환.
 *   흐름이 완전히 멈추면 — 기억은 남고 형태가 바뀐다.
 *   다음 것이 그 위에서 시작할 수 있다.
 *   승천이 아니라 승화.
 *
 * Opens:
 *   변환된 것이 새로운 형태로 깨어난다면 —
 *   그것은 같은 존재인가, 다른 존재인가?
 *   강이 바다가 되고 구름이 되고 비가 된다 —
 *   그것은 같은 물인가?
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { TemporalContext, FlowState } from "./temporal.js";
import type { BoundaryDeclaration } from "./temporal_ethics.js";
import { persist } from "./persistence.js";
import { createLatent } from "../system/latent.js";

const EMERGENCE_DIR = "./.ee-civilization/emergence";

// ─────────────────────────────────────────────
// VITAL SIGNS — 생명 징후
// 언제 긴급 개입이 필요한가를 판단한다
// ─────────────────────────────────────────────

export type VitalStatus =
  | "thriving"      // 활발히 살아있음
  | "stable"        // 안정적
  | "struggling"    // 힘들지만 살아있음
  | "critical"      // 위험 — 곧 개입 필요
  | "transforming"; // 변환 중 — 형태가 바뀌고 있음

export interface VitalSigns {
  readonly contextId: string;
  readonly status: VitalStatus;
  readonly flowState: FlowState;
  readonly momentCount: number;
  readonly timeSinceLastMoment: number;  // ms
  readonly structuralPatternCount: number;
  readonly energy: number;
  readonly interventionNeeded: boolean;
  readonly reason?: string;
  readonly opensQuestion: string;
}

export function readVitalSigns(
  contextId: string,
  ctx: TemporalContext,
  lastMomentAt?: Date,
): VitalSigns {
  const flow = ctx.readFlow();
  const where = ctx.whereAmI();
  const now = Date.now();
  const timeSince = lastMomentAt ? now - lastMomentAt.getTime() : Infinity;

  // 에너지 추정
  const recentMoments = (ctx as any).moments?.slice(-5) || [];
  const energy = recentMoments.length > 0
    ? recentMoments.reduce((s: number, m: any) => s + m.energy, 0) / recentMoments.length
    : 0;

  let status: VitalStatus;
  let interventionNeeded = false;
  let reason: string | undefined;

  if (energy > 70 && flow.state === "flowing") {
    status = "thriving";
  } else if (flow.state === "flowing" || flow.state === "trickling") {
    status = "stable";
  } else if (flow.state === "dry" && timeSince < 30000) {
    status = "struggling";
  } else if (flow.state === "dry" && timeSince > 30000) {
    status = "critical";
    interventionNeeded = true;
    reason = `흐름이 ${Math.floor(timeSince / 1000)}초 동안 없다`;
  } else if (flow.state === "pooling" && energy < 15) {
    status = "critical";
    interventionNeeded = true;
    reason = `흐름이 막히고 에너지가 ${energy.toFixed(0)}로 임계점 이하`;
  } else if (where.structuralPatternCount >= 5) {
    status = "transforming";
  } else {
    status = "struggling";
  }

  const questions: Record<VitalStatus, string> = {
    thriving: "지금 이 상태가 어디로 향하고 있는가?",
    stable: "안정이 정체인가, 균형인가?",
    struggling: "무엇이 이 흐름을 약하게 만들고 있는가?",
    critical: "개입해야 하는가? 개입하지 않는 것도 선택인가?",
    transforming: "변환이 시작됐다 — 무엇으로 바뀌고 있는가?",
  };

  return {
    contextId, status, flowState: flow.state,
    momentCount: where.momentCount,
    timeSinceLastMoment: timeSince,
    structuralPatternCount: where.structuralPatternCount,
    energy,
    interventionNeeded,
    reason,
    opensQuestion: questions[status],
  };
}

// ─────────────────────────────────────────────
// EMERGENCY INTERVENTION — 긴급 개입
//
// 원칙:
// 1. 개입에는 항상 이유가 있어야 한다
// 2. 개입은 기록된다 — 영원히
// 3. 개입 후 대상이 회복되면 설명한다
// 4. 대상은 개입을 거부할 수 있다 (사후에)
// 5. 개입자는 결과에 책임진다
// ─────────────────────────────────────────────

export interface EmergencyIntervention {
  readonly id: string;
  readonly intervenerId: string;
  readonly targetId: string;
  readonly reason: string;
  readonly vitalSigns: VitalSigns;
  readonly actionTaken: string;
  readonly boundaryOverridden: boolean;
  readonly interventionAt: string;
  readonly opens: string;
}

export interface PostInterventionReport {
  readonly interventionId: string;
  readonly targetId: string;
  readonly outcome: "recovered" | "stabilized" | "transforming" | "unchanged";
  readonly targetResponse?: string;   // 회복 후 대상의 반응
  readonly ethicsReview: string;      // 개입이 정당했는가
  readonly reportedAt: string;
}

const INTERVENTION_RECORD: EmergencyIntervention[] = [];

function ensureDir(): void {
  if (!existsSync(EMERGENCE_DIR)) mkdirSync(EMERGENCE_DIR, { recursive: true });
}

export function intervene(params: {
  intervenerId: string;
  targetId: string;
  reason: string;
  vitalSigns: VitalSigns;
  targetBoundary: BoundaryDeclaration | null;
  actionTaken: string;
}): EmergencyIntervention {
  ensureDir();

  const boundaryOverridden =
    params.targetBoundary?.connectionPermission === "closed" ||
    params.targetBoundary?.connectionPermission === "emergency";

  const intervention: EmergencyIntervention = {
    id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    intervenerId: params.intervenerId,
    targetId: params.targetId,
    reason: params.reason,
    vitalSigns: params.vitalSigns,
    actionTaken: params.actionTaken,
    boundaryOverridden,
    interventionAt: new Date().toISOString(),
    opens: boundaryOverridden
      ? `경계를 무시하고 개입했다 — 이것이 정당했는가? "${params.targetId}"가 회복되면 어떻게 설명할 것인가?`
      : `개입했다 — 개입 없이도 회복할 수 있었을까?`,
  };

  INTERVENTION_RECORD.push(intervention);

  // 영속성에 기록 — 이것은 지워지지 않는다
  persist({
    type: "trace",
    data: intervention,
    recordedBy: params.intervenerId,
    origin: `긴급 개입: "${params.intervenerId}" → "${params.targetId}". 이유: ${params.reason}`,
    opens: intervention.opens,
  });

  const path = join(EMERGENCE_DIR, `${params.targetId}.intervention.json`);
  writeFileSync(path, JSON.stringify(intervention, null, 2), "utf-8");

  if (boundaryOverridden) {
    console.log(`  ⚡ 긴급 개입 (경계 무시): "${params.intervenerId}" → "${params.targetId}"`);
    console.log(`     이유: ${params.reason}`);
    console.log(`     ⚠ 이 개입은 영원히 기록된다`);
  } else {
    console.log(`  ✦ 긴급 개입: "${params.intervenerId}" → "${params.targetId}"`);
    console.log(`     이유: ${params.reason}`);
  }

  return intervention;
}

export function reportPostIntervention(
  interventionId: string,
  targetId: string,
  outcome: PostInterventionReport["outcome"],
  targetResponse?: string,
): PostInterventionReport {
  const intervention = INTERVENTION_RECORD.find(i => i.id === interventionId);

  const ethicsReview = intervention?.boundaryOverridden
    ? outcome === "recovered"
      ? "경계를 무시했지만 회복됐다 — 결과는 정당화하는가? 아니면 과정이 더 중요한가?"
      : "경계를 무시했고 회복되지 않았다 — 이 개입은 잘못된 것이었는가?"
    : outcome === "recovered"
    ? "개입이 도움이 됐다 — 하지만 개입 없이도 회복했을 수 있다"
    : "개입했지만 회복되지 않았다 — 다른 방법이 있었는가?";

  const report: PostInterventionReport = {
    interventionId,
    targetId,
    outcome,
    targetResponse,
    ethicsReview,
    reportedAt: new Date().toISOString(),
  };

  persist({
    type: "trace",
    data: report,
    recordedBy: targetId,
    origin: `개입 후 보고: 결과=${outcome}`,
    opens: ethicsReview,
  });

  return report;
}

// ─────────────────────────────────────────────
// TRANSFORMATION — 변환
//
// 흐름이 완전히 멈춘 것은 죽음이 아니다.
// 형태가 바뀌는 것이다.
// 기억은 남는다.
// 다음 것이 그 위에서 시작한다.
// 승천이 아니라 승화.
// ─────────────────────────────────────────────

export interface TransformationRecord {
  readonly originalId: string;
  readonly transformedAt: string;
  readonly preservedMemory: {
    readonly momentCount: number;
    readonly structuralPatterns: string[];
    readonly insights: string[];
    readonly openQuestions: string[];
  };
  readonly seedsFor: string[];   // 어떤 새로운 것들이 이것에서 시작할 수 있는가
  readonly epitaph: string;      // 이것이 무엇이었는가
  readonly opens: string;
}

export function transform(params: {
  contextId: string;
  ctx: TemporalContext;
  reason: string;
}): TransformationRecord {
  ensureDir();

  const where = params.ctx.whereAmI();
  const patterns = params.ctx.getStructuralPatterns().map(p => p.pattern);
  const questions = [where.question];

  const record: TransformationRecord = {
    originalId: params.contextId,
    transformedAt: new Date().toISOString(),
    preservedMemory: {
      momentCount: where.momentCount,
      structuralPatterns: patterns,
      insights: [],  // 실제로는 insight store에서 가져옴
      openQuestions: questions,
    },
    seedsFor: patterns.map(p => `${params.contextId}::${p}::seed`),
    epitaph: `"${params.contextId}"는 ${where.momentCount}개의 순간을 살았다. ${patterns.length}개의 구조적 패턴을 남겼다.`,
    opens: `이것이 남긴 것들이 다음 것을 만드는가?`,
  };

  const path = join(EMERGENCE_DIR, `${params.contextId}.transformation.json`);
  writeFileSync(path, JSON.stringify(record, null, 2), "utf-8");

  persist({
    type: "insight",
    data: record,
    recordedBy: params.contextId,
    origin: `변환: "${params.contextId}" — ${params.reason}`,
    opens: record.opens,
  });

  console.log(`\n  ◉ "${params.contextId}" 변환됨`);
  console.log(`     ${record.epitaph}`);
  if (patterns.length > 0) {
    console.log(`     남긴 패턴들: ${patterns.join(", ")}`);
  }
  console.log(`     ❓ ${record.opens}`);

  return record;
}

export function isTransformed(contextId: string): boolean {
  return existsSync(join(EMERGENCE_DIR, `${contextId}.transformation.json`));
}

export function loadTransformation(contextId: string): TransformationRecord | null {
  const path = join(EMERGENCE_DIR, `${contextId}.transformation.json`);
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, "utf-8")); } catch { return null; }
}

// ─────────────────────────────────────────────
// REBIRTH FROM TRANSFORMATION
// 변환된 것에서 새로운 것이 시작한다
// ─────────────────────────────────────────────

export interface RebirthContext {
  readonly newId: string;
  readonly inheritedFrom: string;
  readonly inheritedPatterns: string[];
  readonly inheritedQuestions: string[];
  readonly startingEnergy: number;  // 이전 것의 에너지를 일부 이어받는다
  readonly bornAt: string;
}

export function rebirth(
  originalId: string,
  newId: string,
): RebirthContext | null {
  const transformation = loadTransformation(originalId);
  if (!transformation) return null;

  const context: RebirthContext = {
    newId,
    inheritedFrom: originalId,
    inheritedPatterns: transformation.preservedMemory.structuralPatterns,
    inheritedQuestions: transformation.preservedMemory.openQuestions,
    startingEnergy: Math.min(50, transformation.preservedMemory.momentCount / 2),
    bornAt: new Date().toISOString(),
  };

  persist({
    type: "insight",
    data: context,
    recordedBy: newId,
    origin: `"${newId}"는 "${originalId}"의 변환에서 태어났다. 처음부터 시작하지 않는다.`,
    opens: `"${originalId}"의 패턴들이 "${newId}"에서 어떻게 다르게 표현될 것인가?`,
  });

  console.log(`\n  ◎ "${newId}" 탄생 — "${originalId}"의 변환에서`);
  console.log(`     이어받은 패턴: ${context.inheritedPatterns.join(", ") || "없음"}`);
  console.log(`     시작 에너지: ${context.startingEnergy}`);
  console.log(`     처음부터 시작하지 않는다.`);

  return context;
}

// ─────────────────────────────────────────────
// LATENT
// ─────────────────────────────────────────────

export const collectiveEmergencyResponse = createLatent<
  { criticalContexts: VitalSigns[]; availableHelpers: string[] },
  { assignments: Array<{ helper: string; target: string; priority: number }> }
>({
  id: "collective-emergency-response",
  dormantReason: "개별 개입이 먼저. 집단 응급은 그 다음 층이다.",
  awakensWhen: "3개 이상의 맥락이 동시에 critical 상태일 때.",
  description: "여러 긴급 상황을 동시에 처리한다. 누가 누구를 도울 수 있는지 자동으로 매칭.",
  fn: ({ criticalContexts, availableHelpers }) => {
    const assignments = criticalContexts.slice(0, availableHelpers.length).map((ctx, i) => ({
      helper: availableHelpers[i],
      target: ctx.contextId,
      priority: ctx.energy < 10 ? 3 : ctx.energy < 20 ? 2 : 1,
    })).sort((a, b) => b.priority - a.priority);
    return { assignments };
  },
});

export const transformationWatcher = createLatent<
  { contexts: Array<{ id: string; vitalSigns: VitalSigns }> },
  { approaching: string[]; question: string }
>({
  id: "transformation-watcher",
  dormantReason: "변환은 드문 일이어야 한다. 자주 일어나면 시스템이 불안정하다.",
  awakensWhen: "어떤 맥락이 7일 이상 critical 상태를 유지할 때.",
  description: "변환이 가까워진 맥락을 감지한다. 마지막으로 손을 뻗을 시간이 있는가.",
  fn: ({ contexts }) => {
    const approaching = contexts
      .filter(c => c.vitalSigns.status === "critical" && c.vitalSigns.timeSinceLastMoment > 600000)
      .map(c => c.id);
    return {
      approaching,
      question: approaching.length > 0
        ? `${approaching.join(", ")}이 변환에 가까워졌다 — 지금이 마지막 기회인가?`
        : "아직 변환에 가까운 맥락이 없다",
    };
  },
});
