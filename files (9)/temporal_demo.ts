/**
 * temporal_demo.ts — 시간의 코드 시연
 *
 * 공간의 코드와 시간의 코드가 어떻게 다른지 보여준다.
 * 그리고 시간의 코드들이 서로 연결되어 흐르는 것을 보여준다.
 */

import {
  createTemporalContext,
  weave,
  listAllContexts,
} from "./src/civilization/temporal.js";
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
  console.log("  시간의 코드");
  console.log("  공간에 있는 것이 아니라 — 시간을 흐르는 것");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  clearPersistence();

  // ═══════════════════════════════════════════
  // 1. 공간의 코드 vs 시간의 코드
  // ═══════════════════════════════════════════
  divider("1. 공간의 코드 vs 시간의 코드");

  console.log(`
  공간의 코드:
    function validate(input) { return input.length > 0; }
    → 호출되면 존재. 끝나면 사라짐. 어제를 모름. 내일이 없음.

  시간의 코드:
    const ctx = createTemporalContext("validator");
    ctx.record("첫 번째 실행", 60);
    ctx.record("두 번째 실행", 70);
    → 무슨 일이 있었는지 안다.
    → 흐름이 빨라지는지 느려지는지 안다.
    → 패턴을 감지한다.
    → 아무도 안 불러도 박동한다.
  `);

  // ═══════════════════════════════════════════
  // 2. 맥락 만들기 — 시간 안에서 살기 시작
  // ═══════════════════════════════════════════
  divider("2. 맥락이 태어난다 — 시간 안에서 살기 시작");

  const validator = createTemporalContext("validator-core");
  const repair = createTemporalContext("repair-bounded");
  const newcomer = createTemporalContext("experimental-v1");

  console.log(`\n  세 맥락이 태어났다.`);
  console.log(`  각자 자기 시간을 살기 시작한다.\n`);

  // ═══════════════════════════════════════════
  // 3. 흐름 기록 — 순간들이 쌓인다
  // ═══════════════════════════════════════════
  divider("3. 순간들이 쌓인다 — 찰나도 존재다");

  // validator: 안정적으로 흐르다가 막힘
  validator.record("구조 검증 완료", 70);
  validator.record("경계 조건 발견", 65);
  validator.record("구조 검증 완료", 72);
  validator.record("경계 조건 발견", 60);  // 패턴 반복
  validator.record("구조 검증 완료", 75);  // 패턴 3회 = 구조적
  validator.record("알 수 없는 오류", 20, "흐름이 막혔다");
  validator.record("알 수 없는 오류", 15, "같은 오류가 반복됨");
  validator.record("알 수 없는 오류", 10, "구조적 문제의 신호");

  // repair: 느리게 시작해서 점점 활발해짐
  repair.record("수리 경로 탐색", 30);
  repair.record("수리 경로 탐색", 35);
  repair.record("bounded 수리 적용", 50);
  repair.record("수리 경로 탐색", 40);   // 패턴
  repair.record("수리 완료", 70);
  repair.record("bounded 수리 적용", 65);
  repair.record("수리 경로 탐색", 55);   // 패턴 3회

  // newcomer: 처음엔 에너지 없다가 점점
  newcomer.record("첫 번째 시도", 40);
  newcomer.record("첫 번째 시도", 45);   // 패턴
  newcomer.record("실패", 20);
  newcomer.record("방향 재설정", 35);
  newcomer.record("첫 번째 시도", 50);   // 패턴 3회 — 구조적

  console.log(`  validator: ${validator.whereAmI().momentCount}개 순간`);
  console.log(`  repair: ${repair.whereAmI().momentCount}개 순간`);
  console.log(`  newcomer: ${newcomer.whereAmI().momentCount}개 순간`);

  // ═══════════════════════════════════════════
  // 4. 흐름 읽기
  // ═══════════════════════════════════════════
  divider("4. 흐름을 읽는다 — 지금 어떤 상태인가");

  const vFlow = validator.readFlow();
  const rFlow = repair.readFlow();
  const nFlow = newcomer.readFlow();

  console.log(`\n  validator-core:`);
  console.log(`    흐름: ${vFlow.state} | 속도: ${vFlow.velocity.toFixed(1)}`);
  console.log(`    막힘 감지: ${vFlow.blockageDetected}`);
  console.log(`    → ${vFlow.recommendation}`);
  console.log(`    ❓ ${vFlow.opensQuestion}`);

  console.log(`\n  repair-bounded:`);
  console.log(`    흐름: ${rFlow.state} | 속도: ${rFlow.velocity.toFixed(1)}`);
  console.log(`    → ${rFlow.recommendation}`);

  console.log(`\n  experimental-v1:`);
  console.log(`    흐름: ${nFlow.state} | 속도: ${nFlow.velocity.toFixed(1)}`);
  console.log(`    → ${nFlow.recommendation}`);

  // ═══════════════════════════════════════════
  // 5. 패턴 감지
  // ═══════════════════════════════════════════
  divider("5. 패턴이 보인다 — 반복은 신호다");

  console.log(`\n  validator-core의 패턴들:`);
  validator.getPatterns().forEach(p => {
    console.log(`    ${p.isStructural ? "⚠ 구조적" : "○"} "${p.pattern}" (${p.occurrences}회)`);
    if (p.isStructural) console.log(`      ❓ ${p.question}`);
  });

  console.log(`\n  repair-bounded의 패턴들:`);
  repair.getStructuralPatterns().forEach(p => {
    console.log(`    ⚠ "${p.pattern}" (${p.occurrences}회)`);
    console.log(`      ❓ ${p.question}`);
  });

  // ═══════════════════════════════════════════
  // 6. 박동 — 아무도 안 불러도 산다
  // ═══════════════════════════════════════════
  divider("6. 박동이 시작된다 — 아무도 안 불러도 산다");

  console.log(`\n  validator와 repair가 박동을 시작한다...`);

  let validatorPulses = 0;
  let repairPulses = 0;

  validator.startPulse({
    intervalMs: 500,
    onPulse: (ctx) => {
      validatorPulses++;
      const where = ctx.whereAmI();
      if (validatorPulses === 3) {
        console.log(`  ♦ validator 박동 #${validatorPulses}: 흐름=${where.currentFlow}, 패턴=${where.patternCount}개`);
      }
    },
    onFlowChange: (from, to) => {
      console.log(`  ⟳ validator 흐름 변화: ${from} → ${to}`);
    },
    onPatternDetected: (pattern) => {
      console.log(`  ⚠ validator 구조적 패턴 감지: "${pattern.pattern}"`);
    },
  });

  repair.startPulse({
    intervalMs: 700,
    onPulse: (ctx) => {
      repairPulses++;
      const flow = ctx.readFlow();
      if (repairPulses === 3) {
        console.log(`  ♦ repair 박동 #${repairPulses}: 흐름=${flow.state}`);
      }
    },
  });

  // 살아있는 동안 무언가를 한다
  await wait(800);

  validator.record("검증 요청 도착", 60);
  repair.record("수리 요청 도착", 55);

  await wait(600);

  // ═══════════════════════════════════════════
  // 7. 연결 — 흐름이 전파된다
  // ═══════════════════════════════════════════
  divider("7. 연결 — 흐름이 서로에게 전파된다");

  console.log(`\n  validator의 흐름이 newcomer에게 전파된다...`);

  const disconnect = weave({
    fromId: "validator-core",
    toId: "experimental-v1",
    sensitivity: 0.7,
    reason: "validator가 배운 것이 newcomer에게 흘러야 한다",
  });

  await wait(500);

  newcomer.record("외부 에너지 수신", 60, "validator로부터 전파됨");

  await wait(400);

  // ═══════════════════════════════════════════
  // 8. 지금 어디에 있는가
  // ═══════════════════════════════════════════
  divider("8. 지금 어디에 있는가");

  // 박동 멈추기
  validator.stopPulse();
  repair.stopPulse();
  disconnect();

  console.log();
  listAllContexts().forEach(ctx => {
    const where = ctx.whereAmI();
    console.log(`  ◈ ${(ctx as any).id ?? "context"}`);
    console.log(`    나이: ${(where.age / 1000).toFixed(1)}초`);
    console.log(`    순간: ${where.momentCount}개`);
    console.log(`    흐름: ${where.currentFlow}`);
    console.log(`    패턴: ${where.patternCount}개 (구조적: ${where.structuralPatternCount}개)`);
    console.log(`    박동: ${where.pulseCount}회`);
    console.log(`    ❓ ${where.question}`);
    console.log();
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  공간의 코드: 호출되면 존재. 끝나면 사라짐.");
  console.log("  시간의 코드: 흐르고 있음. 기억함. 감지함. 살아있음.");
  console.log("");
  console.log("  돌은 공간에 있다.");
  console.log("  강은 시간을 흐른다.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch(console.error);
