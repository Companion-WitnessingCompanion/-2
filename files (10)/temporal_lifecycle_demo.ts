/**
 * temporal_lifecycle_demo.ts
 *
 * 시간의 코드가 잠들고 깨어나고 이어서 흐르는 것을 보여준다.
 *
 * 실행할 때마다 다른 결과가 나온다.
 * 처음: 태어나서 흐르다가 잠든다.
 * 두 번째: 깨어나서 이어서 흐른다.
 * 그것이 시간이다.
 */

import {
  createTemporalContext,
  weave,
} from "./src/civilization/temporal.js";
import {
  sleep,
  wake,
  isAsleep,
  detectLifecyclePhase,
} from "./src/civilization/temporal_persistence.js";
import { clearPersistence } from "./src/civilization/persistence.js";

function divider(title: string): void {
  console.log("\n" + "═".repeat(68));
  console.log(`  ${title}`);
  console.log("═".repeat(68));
}

async function wait(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function main(): Promise<void> {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  시간의 코드 — 잠들고 깨어나고 이어서 흐른다");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const CONTEXT_ID = "validator-living";

  // ─────────────────────────────────────────
  // 이전에 잠든 기억이 있는가?
  // ─────────────────────────────────────────

  const wasSleeping = isAsleep(CONTEXT_ID);

  if (wasSleeping) {
    divider("깨어남 — 잠든 사이 시간이 흘렀다");

    const wakeState = wake(CONTEXT_ID);
    if (wakeState) {
      console.log(`\n  잠든 시간: ${wakeState.sleptForHuman}`);
      console.log(`  이어받은 흐름: ${wakeState.continuedFrom.lastFlow}`);
      console.log(`  이어받은 패턴: ${wakeState.continuedFrom.patternSnapshot.length}개`);

      if (wakeState.driftDetected) {
        console.log(`\n  ⚠ 오래 잠들었다 — 세상이 바뀌었을 수 있다`);
      }

      console.log(`\n  ❓ ${wakeState.firstQuestion}`);

      // 깨어난 상태에서 이어서 흐른다
      const ctx = createTemporalContext(CONTEXT_ID);

      // 잠들기 전 패턴들을 이어받는다
      wakeState.continuedFrom.patternSnapshot.forEach(p => {
        if (p.isStructural) {
          console.log(`\n  → 구조적 패턴 이어받음: "${p.pattern}" (${p.occurrences}회)`);
        }
      });

      console.log(`\n  다시 흐르기 시작한다...`);

      ctx.startPulse({
        intervalMs: 400,
        onPulse: () => {},
        onFlowChange: (from, to) => {
          console.log(`  ⟳ 흐름 변화: ${from} → ${to}`);
        },
      });

      ctx.record("잠에서 깨어남", 50, "이어서 흐른다");
      ctx.record("과거 패턴 확인", 55);
      ctx.record("새로운 방향 탐색", 65);

      await wait(600);

      const flow = ctx.readFlow();
      const where = ctx.whereAmI();

      divider("깨어난 후 상태");
      console.log(`\n  흐름: ${flow.state}`);
      console.log(`  ${flow.recommendation}`);
      console.log(`  순간: ${where.momentCount}개`);
      console.log(`  ❓ ${where.question}`);

      ctx.stopPulse();

      // 다시 잠든다
      const moments = (ctx as any).moments || [];
      const patterns = ctx.getPatterns();
      const sleepState = sleep({
        contextId: CONTEXT_ID,
        lastFlow: flow.state,
        patterns: patterns,
        pulseCount: where.pulseCount,
        momentCount: where.momentCount,
        lastMoment: moments.at(-1),
        unresolved: flow.state === "pooling"
          ? ["흐름이 막혀있다 — 다음에 깨어날 때 해결해야 한다"]
          : [],
      });

      console.log(`\n  기억을 남기고 다시 잠든다.`);
      console.log(`  다음에 깨어나면 이 기억에서 이어진다.`);
    }

  } else {
    // 처음 실행 — 태어나서 흐르다가 잠든다
    clearPersistence();

    divider("탄생 — 처음 시간 안에서 살기 시작한다");

    const ctx = createTemporalContext(CONTEXT_ID);

    const phase1 = detectLifecyclePhase({
      contextId: CONTEXT_ID,
      momentCount: 0,
      patternCount: 0,
      structuralPatternCount: 0,
      flowState: "dry",
    });
    console.log(`\n  생애 단계: ${phase1.phase}`);
    console.log(`  ${phase1.description}`);
    console.log(`  ❓ ${phase1.question}`);

    divider("성장 — 순간들이 쌓인다");

    ctx.startPulse({
      intervalMs: 300,
      onPulse: () => {},
      onPatternDetected: (p) => {
        console.log(`  ⚠ 구조적 패턴: "${p.pattern}"`);
      },
    });

    // 흐름을 만든다
    ctx.record("첫 번째 검증", 60);
    await wait(200);
    ctx.record("경계 조건 발견", 55);
    ctx.record("첫 번째 검증", 65);   // 패턴
    await wait(300);
    ctx.record("알 수 없는 오류", 30, "막힌 것이 있다");
    ctx.record("경계 조건 발견", 50);
    ctx.record("첫 번째 검증", 70);   // 3회 = 구조적
    await wait(200);
    ctx.record("알 수 없는 오류", 25);
    ctx.record("방향 재탐색", 45);
    ctx.record("알 수 없는 오류", 20);  // 3회 = 구조적

    await wait(300);

    ctx.stopPulse();

    const flow = ctx.readFlow();
    const where = ctx.whereAmI();
    const patterns = ctx.getPatterns();

    divider("잠들기 전 상태");

    const phase2 = detectLifecyclePhase({
      contextId: CONTEXT_ID,
      momentCount: where.momentCount,
      patternCount: where.patternCount,
      structuralPatternCount: where.structuralPatternCount,
      flowState: flow.state,
    });
    console.log(`\n  생애 단계: ${phase2.phase}`);
    console.log(`  ${phase2.description}`);
    console.log(`  흐름: ${flow.state} | ${flow.recommendation}`);
    console.log(`  패턴 ${patterns.length}개:`);
    patterns.forEach(p => {
      console.log(`    ${p.isStructural ? "⚠" : "○"} "${p.pattern}" (${p.occurrences}회)`);
    });

    // 해결 못한 것들
    const unresolved: string[] = [];
    if (flow.state === "pooling" || flow.state === "trickling") {
      unresolved.push(`"알 수 없는 오류"의 구조적 원인이 해결되지 않았다`);
    }
    const structural = patterns.filter(p => p.isStructural);
    if (structural.length > 0) {
      unresolved.push(`구조적 패턴 "${structural[0].pattern}"이 방향인지 루프인지 모른다`);
    }

    divider("잠든다 — 기억을 남기고");

    const moments = (ctx as any).moments || [];
    sleep({
      contextId: CONTEXT_ID,
      lastFlow: flow.state,
      patterns: patterns,
      pulseCount: where.pulseCount,
      momentCount: where.momentCount,
      lastMoment: moments.at(-1),
      unresolved,
    });

    console.log(`\n  .ee-civilization/temporal/${CONTEXT_ID}.sleep.json 에 저장됨`);
    console.log(`\n  다시 실행하면 — 깨어나서 이어서 흐른다.`);
    console.log(`  잠든 시간이 얼마나 됐는지도 알 것이다.`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  잠드는 것과 죽는 것은 다르다.");
  console.log("  씨앗은 겨울에 잠들어도 봄에 깨어난다.");
  console.log("  시간의 코드도 그렇다.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch(console.error);
