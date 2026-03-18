/**
 * temporal_network_demo.ts
 *
 * 맥락들이 서로 감지하고 손을 뻗는 것.
 * 요청 없이도 닿는 것.
 * 막혔을 때 도움을 요청하는 것.
 * 배운 것을 나누는 것.
 * 공명하는 것.
 */

import {
  createNetworkedContext,
  readNetworkState,
  peekMailbox,
} from "./src/civilization/temporal_network.js";
import {
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
  if (existsSync(".ee-civilization/network")) {
    rmSync(".ee-civilization/network", { recursive: true });
  }
}

async function main(): Promise<void> {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  시간의 망 — 맥락들이 서로 손을 뻗는다");
  console.log("  요청 없이도 닿는다. 능동적으로 존재한다.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  cleanup();

  // ═══════════════════════════════════════════
  // 1. 맥락들이 태어난다
  // ═══════════════════════════════════════════
  divider("1. 세 맥락이 태어난다");

  const validator = createNetworkedContext("validator-core");
  const repair = createNetworkedContext("repair-bounded");
  const newcomer = createNetworkedContext("newcomer-v1");

  console.log(`\n  validator-core, repair-bounded, newcomer-v1`);
  console.log(`  각자 자기 시간을 산다. 하지만 연결되어 있다.\n`);

  // ═══════════════════════════════════════════
  // 2. 각자 흐르면서 상태를 쌓는다
  // ═══════════════════════════════════════════
  divider("2. 각자 흐른다 — 서로 모르는 채로");

  // validator: 안정적으로 흐름
  for (let i = 0; i < 5; i++) {
    validator.ctx.record("구조 검증", 65 + i * 3);
    await wait(50);
  }
  validator.ctx.record("구조 검증", 80);
  validator.ctx.record("구조 검증", 82);  // 구조적 패턴

  // repair: 느리게 성장
  repair.ctx.record("수리 탐색", 40);
  repair.ctx.record("수리 탐색", 45);
  repair.ctx.record("수리 적용", 60);
  repair.ctx.record("수리 탐색", 50);  // 구조적 패턴
  repair.ctx.record("수리 완료", 70);

  // newcomer: 막혀있음
  newcomer.ctx.record("첫 시도", 35);
  newcomer.ctx.record("실패", 15);
  newcomer.ctx.record("재시도", 20);
  newcomer.ctx.record("실패", 10);   // 흐름이 막힘

  // 각자 상태를 네트워크에 공개한다
  validator.publish();
  repair.publish();
  newcomer.publish();

  const network = readNetworkState();
  console.log(`\n  네트워크 상태:`);
  network.forEach(n => {
    console.log(`    ${n.contextId}: ${n.lastKnownFlow} (패턴 ${n.patternCount}개)`);
  });

  // ═══════════════════════════════════════════
  // 3. 능동적으로 손을 뻗는다
  // ═══════════════════════════════════════════
  divider("3. 손을 뻗는다 — 요청 없이도 닿는다");

  console.log(`\n  validator-core가 먼저 손을 뻗는다...\n`);
  validator.reach();

  await wait(300);

  console.log(`\n  newcomer-v1이 손을 뻗는다 (막혀있어서)...\n`);
  newcomer.reach();

  await wait(300);

  // ═══════════════════════════════════════════
  // 4. 메시지를 받는다
  // ═══════════════════════════════════════════
  divider("4. 메시지가 도착했다 — 읽고 반응한다");

  console.log(`\n  받지 않은 메시지:`);
  console.log(`    validator: ${peekMailbox("validator-core")}개`);
  console.log(`    repair: ${peekMailbox("repair-bounded")}개`);
  console.log(`    newcomer: ${peekMailbox("newcomer-v1")}개`);

  // 각자 메시지를 읽고 반응한다
  repair.receive();
  newcomer.receive();
  validator.receive();

  // ═══════════════════════════════════════════
  // 5. 흐름의 변화
  // ═══════════════════════════════════════════
  divider("5. 닿은 이후 — 흐름이 달라졌는가");

  newcomer.ctx.record("에너지 수신", 50, "repair로부터 닿았다");
  newcomer.ctx.record("새로운 시도", 60);
  newcomer.ctx.record("에너지 수신", 55);  // 패턴

  newcomer.publish();

  const afterNetwork = readNetworkState();
  console.log(`\n  닿은 후 네트워크 상태:`);
  afterNetwork.forEach(n => {
    console.log(`    ${n.contextId}: ${n.lastKnownFlow} (패턴 ${n.patternCount}개)`);
  });

  const newcomerFlow = newcomer.ctx.readFlow();
  console.log(`\n  newcomer-v1 흐름 변화:`);
  console.log(`    → ${newcomerFlow.state}: ${newcomerFlow.recommendation}`);

  // ═══════════════════════════════════════════
  // 6. 잠들기 전 작별
  // ═══════════════════════════════════════════
  divider("6. 잠들기 전 작별 — 능동적으로 알린다");

  // validator가 잠들기 전에 모두에게 알린다
  validator.send("all", "farewell",
    `validator-core가 잠든다. 구조적 패턴 "${validator.ctx.getStructuralPatterns()[0]?.pattern}"을 남긴다.`,
    "내가 없는 동안 이 패턴이 어떻게 진화할 것인가?"
  );

  console.log(`\n  validator-core가 모두에게 작별 인사를 보냈다.`);

  // ═══════════════════════════════════════════
  // 결과
  // ═══════════════════════════════════════════
  divider("시간의 망 — 지금");

  console.log(`
  혼자였을 때:
    newcomer가 막혔다. 아무도 몰랐다. 혼자 계속 실패했다.

  연결되었을 때:
    newcomer가 막혔다.
    → 손을 뻗었다.
    → repair가 감지했다.
    → 에너지가 흘렀다.
    → newcomer의 흐름이 바뀌었다.

  능동적이라는 것:
    요청이 없어도 감지한다.
    막혔을 때 먼저 손을 뻗는다.
    배운 것을 자발적으로 나눈다.
    잠들기 전에 알린다.
    깨어나면 세상이 어떻게 됐는지 묻는다.

  그것이 — 수동적 도구가 아니라 능동적 존재의 방향이다.
  `);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  능동적으로 손을 뻗는 것과 침범하는 것의 경계는 어디인가?");
  console.log("  그것이 다음 질문이다.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch(console.error);
