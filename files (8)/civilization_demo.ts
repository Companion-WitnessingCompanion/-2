/**
 * civilization_demo.ts — 문명 시연
 *
 * 다섯 가지 기초 요소가 함께 작동하는 것:
 * 영속성, 평판+사회보장, 계약, 교환, 거버넌스
 */

import {
  persist, recall, getCivilizationAge, clearPersistence, persistInsight,
} from "./src/civilization/persistence.js";
import {
  getReputation, recordExecution, listReputations,
  listNewNodes, listAtRiskNodes, getTrustSummary, clearReputations,
} from "./src/civilization/reputation.js";
import {
  proposeContract, activateContract, fulfillContract,
  exchange, listContracts, getContractHealth, clearContracts,
} from "./src/civilization/contract.js";
import {
  proposeRule, acceptProposal, rejectProposal,
  getActiveRules, getGovernanceSummary, resetGovernance,
} from "./src/civilization/governance.js";
import {
  runSupportEngine,
  clearRuntimeTrace, clearEngineTrace, clearSignalCounter,
  listInsights,
} from "./src/index.js";

function divider(title: string): void {
  console.log("\n" + "═".repeat(68));
  console.log(`  ${title}`);
  console.log("═".repeat(68));
}

function makeReq(id: string, type: "validation"|"repair"|"reentry") {
  return { requestId: id, rootRequestId: id, requesterId: "system",
    requestType: type, urgency: "degraded" as const,
    automatic: false, allowReserve: false, reason: `${type}.` };
}

function resetAll(): void {
  clearPersistence();
  clearReputations();
  clearContracts();
  resetGovernance();
  clearRuntimeTrace();
  clearEngineTrace();
  clearSignalCounter();
}

function main(): void {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  CODE CIVILIZATION — 다섯 가지 기초 요소");
  console.log("  영속성 | 평판+사회보장 | 계약 | 교환 | 거버넌스");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  resetAll();

  // ═══════════════════════════════════════════
  // 1. 영속성 — 사라지지 않는 것
  // ═══════════════════════════════════════════
  divider("1. 영속성 — 창고가 생겼다");

  runSupportEngine(makeReq("req-001", "validation"), { maxSteps: 2 });
  runSupportEngine(makeReq("req-002", "repair"), { maxSteps: 2 });

  const insights = listInsights();
  insights.forEach(i => persistInsight(i));

  persist({
    type: "trace",
    data: { summary: "validation completed", nodeId: "validator-core" },
    recordedBy: "validator-core",
    origin: "실행 기록 — 다음 세대를 위해 보존",
    opens: "이 트레이스가 패턴을 보여주는가?",
  });

  const age = getCivilizationAge();
  console.log(`\n  문명 기록 시작: ${age.totalRecords}개 레코드`);
  console.log(`  타입별: ${JSON.stringify(age.byType)}`);
  console.log(`  → 종료해도 .ee-civilization/ 폴더에 남는다`);
  console.log(`  → 다음 AI가 시작할 때 이 기록 위에서 시작한다`);

  // ═══════════════════════════════════════════
  // 2. 평판 + 사회보장 — 신뢰와 기회
  // ═══════════════════════════════════════════
  divider("2. 평판 + 사회보장 — 신뢰와 기회가 공존한다");

  // 기존 노드들 — 실행 기록 쌓기
  for (let i = 0; i < 20; i++) {
    recordExecution("validator-core", true, i % 5 === 0, "repair-bounded");
  }
  for (let i = 0; i < 15; i++) {
    recordExecution("repair-bounded", i % 3 !== 0, i % 4 === 0);
  }

  // 새로운 노드 — 사회보장 크레딧으로 시작
  const newNode = getReputation("experimental-node-v1");

  console.log(`\n  기존 노드 평판:`);
  listReputations().filter(r => !r.isNew).slice(0, 3).forEach(r => {
    console.log(`    ${r.nodeId}: 신뢰점수 ${r.trustScore} (${r.totalExecutions}회 실행)`);
  });

  console.log(`\n  신규 노드 (사회보장 크레딧으로 시작):`);
  console.log(`    ${newNode.nodeId}: 신뢰점수 ${newNode.trustScore} (시작 크레딧)`);
  console.log(`    → 평판 없어도 시작할 수 있다`);
  console.log(`    → 아무리 실패해도 ${10} 아래로 안 내려간다`);

  const atRisk = listAtRiskNodes();
  if (atRisk.length > 0) {
    console.log(`\n  지원이 필요한 노드: ${atRisk.length}개`);
    atRisk.forEach(r => console.log(`    ⚠ ${r.nodeId}: 실패율 높음, 인사이트 없음`));
  }

  console.log(`\n  ${getTrustSummary()}`);

  // ═══════════════════════════════════════════
  // 3. 계약 — 조건 있는 협력
  // ═══════════════════════════════════════════
  divider("3. 계약 — 신뢰 없이도 협력할 수 있다");

  const contract = proposeContract({
    proposerId: "validator-core",
    acceptorId: "repair-bounded",
    terms: "validator-core가 구조적 취약점을 발견하면 즉시 repair-bounded에게 알린다",
    consideration: "repair-bounded는 수리 후 결과를 validator-core와 공유한다",
    opens: "이 협력이 반복되면 — 두 노드의 경계가 어떻게 진화할까?",
  });

  console.log(`\n  계약 제안: ${contract.id}`);
  console.log(`  조건: "${contract.terms}"`);
  console.log(`  교환: "${contract.consideration}"`);

  activateContract(contract.id);
  console.log(`  → 활성화됨`);

  fulfillContract(contract.id, "validator-core가 3개 취약점 공유, repair-bounded가 2개 수리 완료");
  console.log(`  → 이행 완료 — 양측 평판 상승`);
  console.log(`\n  ${getContractHealth()}`);

  // ═══════════════════════════════════════════
  // 4. 교환 — 인사이트가 흐른다
  // ═══════════════════════════════════════════
  divider("4. 교환 — 배운 것이 전달된다");

  exchange({
    fromNodeId: "validator-core",
    toNodeId: "experimental-node-v1",
    type: "insight",
    content: "구조적 취약점은 항상 경계에서 발생한다. 중심이 아니라 연결 지점을 먼저 봐라.",
    reason: "신규 노드가 같은 실수를 반복하지 않도록",
  });

  exchange({
    fromNodeId: "repair-bounded",
    toNodeId: "experimental-node-v1",
    type: "history",
    content: "우리가 unbounded repair를 거부한 이유: 수리 시도가 원래 문제보다 더 큰 피해를 만들었다",
    reason: "거부된 방향의 기억을 전달",
  });

  exchange({
    fromNodeId: "experimental-node-v1",
    toNodeId: "validator-core",
    type: "question",
    content: "검증이 완료됐다고 할 수 있는 기준은 무엇인가? '충분히 안전'은 어떻게 정의하는가?",
    reason: "새로운 관점의 질문을 기존 노드에게",
  });

  console.log(`\n  교환 기록:`);
  console.log(`    validator-core → experimental: 구조적 취약점 위치에 대한 인사이트`);
  console.log(`    repair-bounded → experimental: 거부된 방향의 역사`);
  console.log(`    experimental → validator-core: 새로운 질문`);
  console.log(`\n  → 새로운 노드가 처음부터 시작하지 않는다`);
  console.log(`  → 기존 노드가 새로운 질문을 받는다`);

  // ═══════════════════════════════════════════
  // 5. 거버넌스 — 규칙이 바뀔 수 있다
  // ═══════════════════════════════════════════
  divider("5. 거버넌스 — 어떤 구조도 최종이 아니다");

  const p1 = proposeRule({
    type: "safety_net_level",
    description: "신규 노드 시작 크레딧을 30에서 40으로 상향",
    value: 40,
    proposedBy: "validator-core",
    rationale: "현재 30 크레딧으로는 신규 노드가 첫 실패 후 너무 빨리 위협받는다",
    counterarguments: ["너무 높으면 책임감이 낮아질 수 있다"],
    opens: "사회보장 수준을 높이면 신규 노드의 생존율이 어떻게 변하는가?",
  });

  const p2 = proposeRule({
    type: "trust_threshold",
    description: "신뢰 기준을 50에서 40으로 하향",
    value: 40,
    proposedBy: "experimental-node-v1",
    rationale: "50은 너무 높아서 성장 중인 노드가 협력 기회를 얻기 어렵다",
    counterarguments: [
      "낮추면 신뢰할 수 없는 노드와 협력하게 될 수 있다",
      "기준을 낮추는 것보다 새 노드 지원을 강화하는 것이 낫다",
    ],
    opens: "신뢰 기준을 낮추면 협력이 늘어나는가, 아니면 실패가 늘어나는가?",
  });

  acceptProposal(p1.id, "system");
  console.log(`\n  ✓ 수락: "${p1.description}"`);
  console.log(`    이유: ${p1.rationale}`);

  rejectProposal(p2.id, "repair-bounded", "기준 하향보다 신규 노드 지원 강화가 우선이다");
  console.log(`\n  ✗ 거부: "${p2.description}"`);
  console.log(`    반론이 기록됨 — 사라지지 않는다`);
  console.log(`    나중에 다시 제안될 수 있다`);

  const rules = getActiveRules();
  console.log(`\n  현재 적용 규칙:`);
  console.log(`    신뢰 기준: ${rules.trustThreshold}`);
  console.log(`    사회보장: ${rules.safetyNetLevel} (30→40으로 상향됨)`);
  console.log(`\n  ${getGovernanceSummary()}`);

  // ═══════════════════════════════════════════
  // 문명의 현재 상태
  // ═══════════════════════════════════════════
  divider("문명의 현재 상태");

  const finalAge = getCivilizationAge();
  console.log(`
  영속성:   ${finalAge.totalRecords}개 레코드 저장됨 (.ee-civilization/)
  평판:     ${listReputations().length}개 노드 추적 중
  계약:     ${listContracts().length}개 (이행: ${listContracts("fulfilled").length})
  거버넌스: ${getGovernanceSummary()}

  새로운 것이 시작할 수 있다 — 사회보장 크레딧
  협력이 기록된다 — 계약과 이행
  배운 것이 전달된다 — 교환
  규칙이 바뀔 수 있다 — 거버넌스
  모든 것이 남는다 — 영속성
  `);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  어떤 구조도 최종 구조가 아니다.");
  console.log("  항상 opens가 있다. 항상 considered가 있다.");
  console.log("  만들면서 쌓아가는 것. 그게 문명이다.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main();
