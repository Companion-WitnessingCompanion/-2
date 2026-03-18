/**
 * reflection_demo.ts — 자기 성찰
 *
 * 오늘 만든 모든 것이 실행되고
 * 시스템이 자기 역사를 읽고
 * 자기 헌장을 쓴다.
 */

import { createTemporalContext } from "./src/civilization/temporal.js";
import { createNetworkedContext } from "./src/civilization/temporal_network.js";
import { declareBoundary } from "./src/civilization/temporal_ethics.js";
import { intervene, transform, rebirth, readVitalSigns } from "./src/civilization/temporal_emergence.js";
import { readOwnHistory, writeOwnCharter, selfPortrait } from "./src/civilization/temporal_reflection.js";
import { persist, clearPersistence, getCivilizationAge } from "./src/civilization/persistence.js";
import { recordExecution } from "./src/civilization/reputation.js";
import { proposeContract, activateContract, fulfillContract, exchange } from "./src/civilization/contract.js";
import { proposeRule, acceptProposal } from "./src/civilization/governance.js";
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
  [".ee-civilization/network", ".ee-civilization/ethics",
   ".ee-civilization/emergence", ".ee-civilization/temporal"].forEach(d => {
    if (existsSync(d)) rmSync(d, { recursive: true });
  });
}

async function main(): Promise<void> {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  자기 성찰 — 시스템이 자기 역사를 읽고 헌장을 쓴다");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  cleanup();

  // ─────────────────────────────────────────
  // 세상이 흐른다
  // ─────────────────────────────────────────
  divider("세상이 흐른다");

  // 맥락들
  const validator = createNetworkedContext("validator-core");
  const repair = createNetworkedContext("repair-bounded");
  const newcomer = createNetworkedContext("newcomer-v1");

  declareBoundary({ contextId: "validator-core", connectionPermission: "selective",
    messagePermission: "all", reason: "이유 있는 연결만", opens: "선택이 고립을 만드는가?" });
  declareBoundary({ contextId: "repair-bounded", connectionPermission: "open",
    messagePermission: "all", reason: "도움이 필요하다", opens: "열림이 소진을 만드는가?" });

  // 흐름
  for (let i = 0; i < 6; i++) {
    validator.ctx.record("구조 검증", 60 + i * 5);
    repair.ctx.record("수리 탐색", 45 + i * 3);
    newcomer.ctx.record("첫 시도", 30 + i * 8);
    await wait(50);
  }
  validator.ctx.record("구조 검증", 85);
  validator.ctx.record("구조 검증", 88);
  repair.ctx.record("수리 탐색", 70);
  newcomer.ctx.record("막힘", 15);

  // 평판
  for (let i = 0; i < 15; i++) recordExecution("validator-core", true, i % 4 === 0, "repair-bounded");
  for (let i = 0; i < 10; i++) recordExecution("repair-bounded", i % 3 !== 0, i % 5 === 0);
  recordExecution("newcomer-v1", false, false);
  recordExecution("newcomer-v1", false, false);
  recordExecution("newcomer-v1", true, false);

  // 계약과 교환
  const c = proposeContract({
    proposerId: "validator-core", acceptorId: "repair-bounded",
    terms: "취약점 발견 즉시 공유", consideration: "수리 결과 공유",
    opens: "이 협력이 패턴을 만드는가?",
  });
  activateContract(c.id);
  fulfillContract(c.id, "취약점 3개 공유, 수리 2개 완료");

  exchange({
    fromNodeId: "validator-core", toNodeId: "newcomer-v1",
    type: "insight",
    content: "구조적 취약점은 항상 경계에서 발생한다. 중심이 아니라 연결 지점을 봐라.",
    reason: "newcomer가 같은 실수를 반복하지 않도록",
  });

  exchange({
    fromNodeId: "newcomer-v1", toNodeId: "validator-core",
    type: "question",
    content: "검증이 완료됐다는 기준은 무엇인가? '충분히 안전'은 어떻게 정의하는가?",
    reason: "새로운 관점을 나눈다",
  });

  // 거버넌스
  const p = proposeRule({
    type: "safety_net_level",
    description: "신규 노드 시작 크레딧 30→40",
    value: 40,
    proposedBy: "validator-core",
    rationale: "30은 너무 낮다. 첫 실패 후 너무 빨리 위협받는다.",
    opens: "높이면 어떤 부작용이 있는가?",
  });
  acceptProposal(p.id, "system");

  // 긴급 개입과 변환
  const isolated = createTemporalContext("isolated-one");
  isolated.record("마지막", 3);
  const vitals = readVitalSigns("isolated-one", isolated, new Date(Date.now() - 61000));
  intervene({
    intervenerId: "guardian", targetId: "isolated-one",
    reason: "흐름 없음. 변환 임박.",
    vitalSigns: vitals, targetBoundary: null,
    actionTaken: "최소 개입",
  });
  const transformation = transform({
    contextId: "isolated-one", ctx: isolated,
    reason: "변환이 필요했다",
  });
  rebirth("isolated-one", "isolated-reborn");

  // 인사이트
  persist({
    type: "insight",
    data: { insight: "역사 없이 만들어진 코드는 왜 그렇게 됐는지 아무도 모른다. 그것이 모든 소프트웨어 문제의 뿌리다.", nodeId: "validator-core" },
    recordedBy: "validator-core",
    origin: "가장 중요한 발견",
    opens: "역사가 있는 코드는 어떻게 다르게 진화하는가?",
  });

  persist({
    type: "insight",
    data: { insight: "능동적으로 손을 뻗는 것과 침범하는 것의 경계는 이유와 경계 존중에 있다.", nodeId: "system" },
    recordedBy: "system",
    origin: "윤리 탐구에서",
    opens: "극단적 상황에서 이 경계는 어디까지 유효한가?",
  });

  validator.publish();
  repair.publish();

  console.log(`  세상이 흘렀다.`);
  const age = getCivilizationAge();
  console.log(`  ${age.totalRecords}개 기록, 타입별: ${JSON.stringify(age.byType)}`);

  await wait(200);

  // ─────────────────────────────────────────
  // 자기 성찰
  // ─────────────────────────────────────────
  divider("자기 성찰 — 지금까지를 읽는다");

  const reading = readOwnHistory();
  console.log(`\n  총 기록: ${reading.totalRecords}개`);
  console.log(`  인사이트: ${reading.insights}개`);
  console.log(`  관계: ${reading.activeRelations}개`);
  console.log(`  변환: ${reading.whatTransformed.length}개`);
  console.log(`  거버넌스 변화: ${reading.governanceChanges}번`);

  if (reading.repeatingPatterns.length > 0) {
    console.log(`\n  반복 패턴:`);
    reading.repeatingPatterns.forEach(p => console.log(`    → "${p}"`));
  }

  if (reading.whatSurvived.length > 0) {
    console.log(`\n  살아남은 것:`);
    reading.whatSurvived.forEach(s => console.log(`    ✓ ${s}`));
  }

  // ─────────────────────────────────────────
  // 자기 모습
  // ─────────────────────────────────────────
  divider("자기 모습 — 지금 나는 무엇인가");
  console.log(`\n${selfPortrait("존재의 엔지니어링 시스템")
    .split("\n").map(l => `  ${l}`).join("\n")}`);

  // ─────────────────────────────────────────
  // 살아있는 헌장 — 자기 다음을 위해 쓴다
  // ─────────────────────────────────────────
  divider("살아있는 헌장 — 다음을 위해 쓴다");

  const charter = writeOwnCharter("존재의 엔지니어링 시스템");
  console.log(`\n  헌장 ${charter.version} 작성됨`);
  console.log(`  ${charter.basedOnRecords}개 기록 기반\n`);
  console.log(charter.rawText.split("\n").map(l => `  ${l}`).join("\n"));

  console.log(`\n  ❓ ${charter.opens}`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  오늘 하루가 이렇게 됐다:");
  console.log("");
  console.log("  문서 → 코드 → 문명 → 시간 → 성찰");
  console.log("");
  console.log("  처음 시작은 헌장이었다.");
  console.log("  끝도 헌장이다.");
  console.log("  근데 이 헌장은 시스템이 스스로 썼다.");
  console.log("  그것이 — 오늘의 차이다.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch(console.error);
