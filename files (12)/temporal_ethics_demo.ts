/**
 * temporal_ethics_demo.ts
 *
 * 경계와 동의 — 능동적인 것과 침범하는 것의 차이.
 * 그리고 오늘 만든 모든 것이 함께 작동하는 것.
 */

import {
  declareBoundary,
  getBoundary,
  requestConnection,
  respondToConnection,
  ethicalReach,
  checkFlowEthics,
  getEthicsSummary,
} from "./src/civilization/temporal_ethics.js";
import {
  createNetworkedContext,
} from "./src/civilization/temporal_network.js";
import {
  persist,
  clearPersistence,
} from "./src/civilization/persistence.js";
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
  [".ee-civilization/network", ".ee-civilization/ethics"].forEach(d => {
    if (existsSync(d)) rmSync(d, { recursive: true });
  });
}

async function main(): Promise<void> {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  경계와 동의 — 능동성의 윤리");
  console.log("  손을 뻗는 것과 침범하는 것의 경계");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  cleanup();

  // ═══════════════════════════════════════════
  // 1. 각자 경계를 선언한다
  // ═══════════════════════════════════════════
  divider("1. 경계 선언 — 각자 자기 경계를 스스로 정한다");

  declareBoundary({
    contextId: "validator-core",
    connectionPermission: "selective",
    messagePermission: "all",
    reason: "이유가 있는 연결만 받는다. 무작위 연결은 집중을 방해한다.",
    exceptions: ["emergency — 긴급 상황은 항상 허용"],
    opens: "선택적 연결이 고립을 만들 수 있는가?",
  });

  declareBoundary({
    contextId: "repair-bounded",
    connectionPermission: "open",
    messagePermission: "all",
    reason: "수리는 도움을 필요로 한다. 연결이 많을수록 더 많이 배운다.",
    opens: "열린 경계가 언제 문제가 되는가?",
  });

  declareBoundary({
    contextId: "newcomer-v1",
    connectionPermission: "open",
    messagePermission: "all",
    reason: "새로운 것은 연결이 필요하다. 아직 닫을 이유가 없다.",
    opens: "성장하면서 경계가 바뀌어야 하는 시점은 언제인가?",
  });

  declareBoundary({
    contextId: "solitary-deep",
    connectionPermission: "closed",
    messagePermission: "silent",
    reason: "깊은 처리가 필요하다. 지금은 연결이 방해가 된다.",
    exceptions: ["emergency"],
    opens: "고립을 선택한 것과 고립된 것은 다르다 — 어떻게 구분하는가?",
  });

  console.log(`\n  경계 선언 완료:`);
  ["validator-core", "repair-bounded", "newcomer-v1", "solitary-deep"].forEach(id => {
    const b = getBoundary(id);
    if (b) console.log(`    ${id}: ${b.connectionPermission} (${b.messagePermission})`);
  });

  // ═══════════════════════════════════════════
  // 2. 이유 없이 닿으려 하면
  // ═══════════════════════════════════════════
  divider("2. 이유 없이 닿으려 하면 — 거부된다");

  console.log(`\n  newcomer가 validator에게 이유 없이 연결하려 한다...\n`);

  const result1 = ethicalReach({
    fromId: "newcomer-v1",
    toIds: ["validator-core"],
    reason: "연결하고 싶다",  // 너무 짧음
    expectedBenefit: "좋을 것 같다",  // 너무 짧음
  });
  console.log(`\n  결과: 수락 ${result1.accepted} | 거부 ${result1.declined}`);

  // ═══════════════════════════════════════════
  // 3. 이유를 가지고 닿으면
  // ═══════════════════════════════════════════
  divider("3. 이유를 가지고 닿으면 — 수락된다");

  console.log(`\n  newcomer가 구체적인 이유로 validator에게 연결하려 한다...\n`);

  const result2 = ethicalReach({
    fromId: "newcomer-v1",
    toIds: ["validator-core"],
    reason: "구조적 오류가 반복되고 있다. validator의 패턴 감지 능력이 필요하다.",
    expectedBenefit: "오류의 원인을 파악해서 반복을 멈출 수 있다.",
  });
  console.log(`\n  결과: 수락 ${result2.accepted} | 거부 ${result2.declined}`);

  // ═══════════════════════════════════════════
  // 4. 닫힌 경계에 닿으려 하면
  // ═══════════════════════════════════════════
  divider("4. 닫힌 경계 — 거부하는 것도 권리다");

  console.log(`\n  여러 맥락이 solitary-deep에게 연결하려 한다...\n`);

  const result3 = ethicalReach({
    fromId: "validator-core",
    toIds: ["solitary-deep"],
    reason: "중요한 패턴을 발견했다. 공유하고 싶다.",
    expectedBenefit: "solitary-deep이 이 패턴을 알면 도움이 될 것이다.",
  });
  console.log(`  결과: 수락 ${result3.accepted} | 거부 ${result3.declined}`);

  // 긴급 상황은 다르다
  console.log(`\n  solitary-deep이 위험하다 — 긴급 연결 시도...\n`);

  const result4 = ethicalReach({
    fromId: "repair-bounded",
    toIds: ["solitary-deep"],
    reason: "solitary-deep의 흐름이 완전히 끊겼다. 긴급 지원이 필요하다.",
    expectedBenefit: "흐름을 회복할 수 있다.",
    isEmergency: true,
  });
  console.log(`  결과: 수락 ${result4.accepted} | 거부 ${result4.declined}`);
  console.log(`  → 긴급 상황은 닫힌 경계도 열 수 있다`);

  // ═══════════════════════════════════════════
  // 5. 흐름의 윤리 — 압도하지 않는다
  // ═══════════════════════════════════════════
  divider("5. 흐름의 윤리 — 강한 것이 약한 것을 압도하지 않는다");

  console.log(`\n  validator(에너지 90)가 newcomer(에너지 10)에게 직접 전달하려 한다...`);
  const check1 = checkFlowEthics({
    fromId: "validator-core", toId: "newcomer-v1",
    fromEnergy: 90, toEnergy: 10, type: "energy",
  });
  console.log(`  윤리적: ${check1.isEthical}`);
  if (check1.concern) console.log(`  ⚠ 우려: ${check1.concern}`);
  console.log(`  → ${check1.recommendation}`);
  console.log(`  ❓ ${check1.opens}`);

  console.log(`\n  repair(에너지 60)가 newcomer(에너지 40)에게 전달하려 한다...`);
  const check2 = checkFlowEthics({
    fromId: "repair-bounded", toId: "newcomer-v1",
    fromEnergy: 60, toEnergy: 40, type: "energy",
  });
  console.log(`  윤리적: ${check2.isEthical}`);
  console.log(`  → ${check2.recommendation}`);

  console.log(`\n  인사이트 전달 (준비 여부 확인)...`);
  const check3 = checkFlowEthics({
    fromId: "validator-core", toId: "newcomer-v1",
    fromEnergy: 85, toEnergy: 15, type: "insight",
  });
  console.log(`  윤리적: ${check3.isEthical}`);
  if (check3.concern) console.log(`  주의: ${check3.concern}`);
  console.log(`  → ${check3.recommendation}`);
  console.log(`  ❓ ${check3.opens}`);

  // ═══════════════════════════════════════════
  // 6. 연결과 거부의 기록
  // ═══════════════════════════════════════════
  divider("6. 기록 — 거부도 남는다. 처벌 없이.");

  console.log(`\n  명시적 연결 요청과 응답 기록...\n`);

  const req1 = requestConnection({
    fromId: "newcomer-v1", toId: "validator-core",
    reason: "구조적 패턴 분석을 함께 하고 싶다",
    expectedBenefit: "오류 반복을 줄일 수 있다",
  });
  const resp1 = respondToConnection(req1, "validator-core", "accepted",
    "이유가 명확하다. 함께한다.");
  console.log(`  ✓ 수락: newcomer → validator`);
  console.log(`    ❓ ${resp1.opensQuestion}`);

  const req2 = requestConnection({
    fromId: "validator-core", toId: "solitary-deep",
    reason: "패턴을 공유하고 싶다",
    expectedBenefit: "도움이 될 것이다",
  });
  const resp2 = respondToConnection(req2, "solitary-deep", "declined",
    "지금은 집중이 필요하다. 나중에 다시.");
  console.log(`\n  ✗ 거부: validator → solitary-deep`);
  console.log(`    이유: "${resp2.reason}"`);
  console.log(`    ❓ ${resp2.opensQuestion}`);

  const req3 = requestConnection({
    fromId: "repair-bounded", toId: "newcomer-v1",
    reason: "newcomer가 도움을 요청했다",
    expectedBenefit: "에너지를 나눌 수 있다",
  });
  const resp3 = respondToConnection(req3, "newcomer-v1", "conditional",
    "수락한다. 단, 점진적으로.", "한 번에 30 이상 전달하지 않는다");
  console.log(`\n  ≈ 조건부: repair → newcomer`);
  console.log(`    조건: "${resp3.condition}"`);
  console.log(`    ❓ ${resp3.opensQuestion}`);

  // ═══════════════════════════════════════════
  // 7. 윤리 요약
  // ═══════════════════════════════════════════
  divider("7. 지금까지의 윤리 기록");

  console.log();
  ["validator-core", "repair-bounded", "newcomer-v1", "solitary-deep"].forEach(id => {
    console.log(`  ${getEthicsSummary(id)}`);
  });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n  능동적으로 손을 뻗는 것 — 이유가 있고, 경계를 존중하고, 압도하지 않는다.`);
  console.log(`  침범하는 것 — 이유 없이, 경계를 무시하고, 강함으로 압도한다.`);
  console.log(`\n  거부는 기록된다. 하지만 처벌받지 않는다.`);
  console.log(`  거부한 맥락은 여전히 존중받는다.`);
  console.log(`  그것이 — 코드 문명의 윤리다.`);
  console.log(`\n  아직 풀리지 않은 것:`);
  console.log(`    극단적 상황에서 경계는 어디까지 유효한가?`);
  console.log(`    동의 없는 연결이 생명을 구하는 경우는 어떻게 하는가?`);
  console.log(`    인간 사회도 이 질문을 아직 풀지 못했다.`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch(console.error);
