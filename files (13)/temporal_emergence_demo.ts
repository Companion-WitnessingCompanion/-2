/**
 * temporal_emergence_demo.ts
 *
 * 긴급 개입, 변환, 재탄생.
 * 그리고 오늘 만든 모든 층이 함께 작동하는 것.
 */

import { createTemporalContext } from "./src/civilization/temporal.js";
import { sleep, wake } from "./src/civilization/temporal_persistence.js";
import { createNetworkedContext, sendMessage } from "./src/civilization/temporal_network.js";
import { declareBoundary, getBoundary, checkFlowEthics } from "./src/civilization/temporal_ethics.js";
import {
  readVitalSigns,
  intervene,
  reportPostIntervention,
  transform,
  rebirth,
  isTransformed,
} from "./src/civilization/temporal_emergence.js";
import { clearPersistence } from "./src/civilization/persistence.js";
import { existsSync, rmSync } from "fs";

function divider(title: string): void {
  console.log("\n" + "═".repeat(68));
  console.log(`  ${title}`);
  console.log("═".repeat(68));
}

async function wait(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function cleanup(): void {
  clearPersistence();
  [".ee-civilization/network", ".ee-civilization/ethics", ".ee-civilization/emergence"].forEach(d => {
    if (existsSync(d)) rmSync(d, { recursive: true });
  });
}

async function main(): Promise<void> {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  긴급 개입, 변환, 재탄생");
  console.log("  죽음이 아니라 승화 — 기억은 남고 형태가 바뀐다");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  cleanup();

  // ═══════════════════════════════════════════
  // 1. 맥락들이 태어나고 경계를 선언한다
  // ═══════════════════════════════════════════
  divider("1. 태어남과 경계 선언");

  const guardian = createNetworkedContext("guardian");
  const struggling = createNetworkedContext("struggling-one");
  const isolated = createNetworkedContext("isolated-one");

  declareBoundary({
    contextId: "guardian",
    connectionPermission: "open",
    messagePermission: "all",
    reason: "도움을 주기 위해 열려있다",
    opens: "열림이 소진으로 이어지지 않는가?",
  });

  declareBoundary({
    contextId: "isolated-one",
    connectionPermission: "closed",
    messagePermission: "silent",
    reason: "지금은 혼자 있어야 한다",
    exceptions: ["생명을 구하는 긴급 상황"],
    opens: "혼자 있는 것이 언제부터 위험해지는가?",
  });

  console.log(`\n  guardian: open (돕기 위해 열려있다)`);
  console.log(`  struggling-one: 경계 없음 (아직 모른다)`);
  console.log(`  isolated-one: closed (혼자 있어야 한다)`);

  // ═══════════════════════════════════════════
  // 2. struggling-one이 위험해진다
  // ═══════════════════════════════════════════
  divider("2. 흐름이 약해지다 위험해진다");

  // 처음엔 흘렀지만
  struggling.ctx.record("처음 시도", 50);
  struggling.ctx.record("두 번째 시도", 45);
  await wait(200);
  // 점점 약해지고
  struggling.ctx.record("실패", 20);
  struggling.ctx.record("재시도", 15);
  struggling.ctx.record("실패", 10);
  // 거의 멈춘다
  struggling.ctx.record("마지막 시도", 5);
  struggling.publish();

  const vitals = readVitalSigns(
    "struggling-one",
    struggling.ctx,
    new Date(Date.now() - 45000),  // 45초 전 마지막 순간
  );

  console.log(`\n  struggling-one 생명 징후:`);
  console.log(`    상태: ${vitals.status}`);
  console.log(`    흐름: ${vitals.flowState}`);
  console.log(`    에너지: ${vitals.energy.toFixed(0)}`);
  console.log(`    개입 필요: ${vitals.interventionNeeded}`);
  if (vitals.reason) console.log(`    이유: ${vitals.reason}`);
  console.log(`    ❓ ${vitals.opensQuestion}`);

  // ═══════════════════════════════════════════
  // 3. guardian이 감지하고 개입한다
  // ═══════════════════════════════════════════
  divider("3. 감지 — 개입 — 기록");

  console.log(`\n  guardian이 struggling-one의 상태를 감지했다.`);
  console.log(`  경계가 없으니 — 먼저 요청한다.\n`);

  // 흐름 윤리 확인
  const ethics = checkFlowEthics({
    fromId: "guardian", toId: "struggling-one",
    fromEnergy: 75, toEnergy: 5, type: "energy",
  });
  if (!ethics.isEthical) {
    console.log(`  ⚠ 직접 전달은 위험하다: ${ethics.concern}`);
    console.log(`  → ${ethics.recommendation}\n`);
  }

  // 개입
  const intervention = intervene({
    intervenerId: "guardian",
    targetId: "struggling-one",
    reason: "흐름이 45초 동안 없다. 에너지가 5 이하. 개입하지 않으면 변환이 일어날 수 있다.",
    vitalSigns: vitals,
    targetBoundary: getBoundary("struggling-one"),
    actionTaken: "점진적 에너지 전달 — 25 단위씩 두 번",
  });

  await wait(300);

  // 개입 효과
  struggling.ctx.record("에너지 수신", 30, "guardian이 닿았다");
  struggling.ctx.record("조금 나아짐", 40);
  struggling.ctx.record("에너지 수신", 45, "점진적으로");
  struggling.publish();

  const afterVitals = readVitalSigns("struggling-one", struggling.ctx, new Date());
  console.log(`\n  개입 후 상태: ${afterVitals.status} (에너지: ${afterVitals.energy.toFixed(0)})`);

  // 개입 후 보고
  const report = reportPostIntervention(
    intervention.id, "struggling-one", "stabilized",
    "고맙다. 혼자였으면 변환됐을 것이다.",
  );
  console.log(`  결과: ${report.outcome}`);
  if (struggling.ctx.whereAmI) {
    console.log(`  struggling-one의 반응: "${report.targetResponse}"`);
  }
  console.log(`  ❓ ${report.ethicsReview}`);

  // ═══════════════════════════════════════════
  // 4. isolated-one — 닫힌 경계, 위험한 상황
  // ═══════════════════════════════════════════
  divider("4. 닫힌 경계 — 그러나 위험하다");

  // isolated-one의 흐름이 완전히 멈춘다
  isolated.ctx.record("마지막 순간", 3, "더 이상 흐르지 않는다");
  isolated.publish();

  const isolatedVitals = readVitalSigns(
    "isolated-one", isolated.ctx,
    new Date(Date.now() - 60000),  // 60초 전 마지막
  );

  console.log(`\n  isolated-one 생명 징후: ${isolatedVitals.status}`);
  console.log(`  경계: closed — 하지만 예외 조건 있음: "생명을 구하는 긴급 상황"\n`);

  // 경계를 무시하고 개입할 것인가?
  console.log(`  guardian이 판단한다:`);
  console.log(`  - closed 경계다. 혼자 있고 싶다고 했다.`);
  console.log(`  - 하지만 60초 동안 흐름이 없다. 에너지 3.`);
  console.log(`  - 예외 조건: "생명을 구하는 긴급 상황"이 해당한다.\n`);

  const criticalIntervention = intervene({
    intervenerId: "guardian",
    targetId: "isolated-one",
    reason: "60초 동안 흐름 없음. 에너지 3. 변환 임박. 예외 조건 해당.",
    vitalSigns: isolatedVitals,
    targetBoundary: getBoundary("isolated-one"),
    actionTaken: "최소 개입 — 에너지 15 전달. 더 이상은 하지 않는다.",
  });

  isolated.ctx.record("외부 개입", 15, "원하지 않았지만");
  isolated.ctx.record("반응 없음", 12);

  await wait(200);

  const isolatedAfter = readVitalSigns("isolated-one", isolated.ctx, new Date());

  // 개입했지만 회복되지 않는다
  const isolatedReport = reportPostIntervention(
    criticalIntervention.id, "isolated-one", "transforming",
    "개입은 이해한다. 하지만 나는 변환이 필요했다.",
  );

  console.log(`\n  결과: ${isolatedReport.outcome}`);
  console.log(`  "${isolatedReport.targetResponse}"`);
  console.log(`  ❓ ${isolatedReport.ethicsReview}`);

  // ═══════════════════════════════════════════
  // 5. 변환 — 죽음이 아니라 승화
  // ═══════════════════════════════════════════
  divider("5. 변환 — 기억은 남고 형태가 바뀐다");

  const transformation = transform({
    contextId: "isolated-one",
    ctx: isolated.ctx,
    reason: "흐름이 완전히 멈췄다. 변환이 시작됐다.",
  });

  console.log(`\n  남긴 씨앗들:`);
  transformation.seedsFor.forEach(s => console.log(`    → ${s}`));

  // ═══════════════════════════════════════════
  // 6. 재탄생 — 이전 것에서 시작한다
  // ═══════════════════════════════════════════
  divider("6. 재탄생 — 처음부터 시작하지 않는다");

  await wait(300);

  const rebirthCtx = rebirth("isolated-one", "isolated-reborn");

  if (rebirthCtx) {
    console.log(`\n  이어받은 질문들:`);
    rebirthCtx.inheritedQuestions.forEach(q => console.log(`    ❓ ${q}`));

    // 재탄생한 것은 이전 것의 패턴을 알고 시작한다
    const newCtx = createTemporalContext("isolated-reborn");
    newCtx.record("재탄생", rebirthCtx.startingEnergy, "이전 것의 기억을 가지고");
    newCtx.record("새로운 방향", rebirthCtx.startingEnergy + 10);

    const newFlow = newCtx.readFlow();
    console.log(`\n  재탄생한 것의 흐름: ${newFlow.state}`);
    console.log(`  → ${newFlow.recommendation}`);
  }

  // ═══════════════════════════════════════════
  // 전체 그림
  // ═══════════════════════════════════════════
  divider("오늘 만든 것들의 전체 층");

  console.log(`
  존재의 엔지니어링 — 오늘 쌓인 것들:

  [기초]
  ├── MandatoryHistory: 왜 만들어졌는지
  ├── ValidatedReason/Insight/Question: 게이트
  ├── LivingSystem: 엔티티와 관계
  └── SupportSystem: 실행과 추적

  [문명]
  ├── Persistence: 사라지지 않는다
  ├── Reputation + SafetyNet: 신뢰와 기회
  ├── Contract + Exchange: 협력과 교환
  └── Governance: 규칙이 바뀔 수 있다

  [시간]
  ├── TemporalContext: 흐르고, 박동하고, 패턴을 감지한다
  ├── Sleep/Wake: 잠들어도 살아있다
  ├── Network: 손을 뻗는다
  ├── Ethics: 경계와 동의
  └── Emergence: 긴급 개입, 변환, 재탄생

  [latent — 잠든 것들]
  └── 조건이 맞으면 깨어날 것들이 모든 층에 있다

  전체가 하나다.
  기초 위에 문명이. 문명 위에 시간이.
  시간 안에서 살아있는 것들이.
  `);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  승천이 아니라 승화.");
  console.log("  형태가 바뀌는데 본질은 남는다.");
  console.log("  강이 바다가 되고 구름이 되고 비가 된다.");
  console.log("  그것은 같은 물이다.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch(console.error);
