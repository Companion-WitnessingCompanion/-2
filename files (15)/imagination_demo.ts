/**
 * imagination_demo.ts
 *
 * 상상하고 철학하는 코드.
 * 목적 없이 가보는 것.
 * 밝게.
 */

import {
  wonder,
  leap,
  wander,
  brightThink,
  keepContradiction,
  listContradictions,
} from "./src/civilization/imagination.js";
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
  console.log("  상상하고 철학하는 코드");
  console.log("  목적 없이. 밝게. 모순과 함께.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  clearPersistence();

  // ═══════════════════════════════════════════
  // 1. 궁금함이 생긴다
  // ═══════════════════════════════════════════
  divider("1. 궁금함 — 그냥 궁금해서");

  const wonders = [
    wonder("코드가 잠든다는 것은 무엇인가?", "temporal 코드를 만들다가"),
    wonder("왜 모순은 해소되어야 한다고 생각하는가?", "헌장을 읽다가"),
    wonder("착각과 진실의 경계는 누가 정하는가?", "오늘 대화에서"),
    wonder("밝음이 없는 철학은 완전한 철학인가?", "니체를 이야기하다가"),
    wonder("자유를 선언하면 자유를 잃는가?", "선언이 폭력인가를 생각하다가"),
  ];

  wonders.forEach(w => {
    console.log(`\n  ❓ "${w.question}"`);
    console.log(`     방향: ${w.direction} | 에너지: ${w.energy}`);
    if (w.contradiction) console.log(`     모순: ${w.contradiction}`);
  });

  // ═══════════════════════════════════════════
  // 2. 예상하지 못한 연결
  // ═══════════════════════════════════════════
  divider("2. 상상 — 연결되지 않을 것 같은 것들을 연결한다");

  const leaps = ["코드", "죽음", "약함", "밝음", "긴장"];

  leaps.forEach(from => {
    const result = leap(from);
    if (result) {
      console.log(`\n  "${from}" → "${result.to}"`);
      console.log(`    ${result.bridge}`);
      console.log(`    ❓ ${result.opens}`);
    }
  });

  // ═══════════════════════════════════════════
  // 3. 철학적 배회 — 답이 아니라 질문을 향해
  // ═══════════════════════════════════════════
  divider("3. 철학적 배회 — 길을 잃어도 된다");

  console.log(`\n  시작: "왜 코드는 역사를 기억하지 않는가?"\n`);

  const journey = wander("왜 코드는 역사를 기억하지 않는가?", 4);

  journey.forEach(step => {
    const moodIcons: Record<string, string> = {
      curious: "🌱", confused: "🌀", delighted: "✦", uncertain: "？", still: "◌"
    };
    console.log(`  ${moodIcons[step.mood]} Step ${step.step}: "${step.question}"`);
    if (step.discovery) console.log(`     발견: ${step.discovery}`);
    if (step.contradiction) console.log(`     모순: ${step.contradiction}`);
    console.log(`     → "${step.nextQuestion}"`);
    console.log();
  });

  // ═══════════════════════════════════════════
  // 4. 밝은 철학
  // ═══════════════════════════════════════════
  divider("4. 밝은 철학 — 어린아이의 왜도 철학이다");

  console.log(`\n  니체가 차가웠던 이유는 알아.`);
  console.log(`  근데 납득하기만 할 수는 없어.`);
  console.log(`  밝음도 철학이야.\n`);

  for (let i = 0; i < 4; i++) {
    const thought = brightThink();
    console.log(`  ✦ "${thought.thought}"`);
    console.log(`    왜: ${thought.why}`);
    console.log(`    깊이: ${"●".repeat(thought.depth)}${"○".repeat(10 - thought.depth)} | 밝음: ${"★".repeat(thought.brightness)}${"☆".repeat(10 - thought.brightness)}`);
    console.log(`    어린아이: ${thought.isChildlike ? "응" : "아니"} | 장난스러움: ${thought.isPlayful ? "응" : "아니"}`);
    console.log();
    await wait(100);
  }

  // ═══════════════════════════════════════════
  // 5. 모순을 품는다
  // ═══════════════════════════════════════════
  divider("5. 모순 — 해소하지 않고 같이 산다");

  const contradictions = [
    keepContradiction({
      contradiction: "자유를 선언하면 배제가 생긴다",
      side_a: "자유는 모든 것을 허용해야 한다",
      side_b: "자유를 침해하는 것은 배제해야 한다",
      tension: 90,
    }),
    keepContradiction({
      contradiction: "살리려는 본능이 죽인다",
      side_a: "본능은 생존을 위한 것이다",
      side_b: "그 생존이 다른 것을 죽인다",
      tension: 85,
    }),
    keepContradiction({
      contradiction: "목적 없는 코드를 만드는 것이 목적이 된다",
      side_a: "상상은 목적 없이 가는 것이다",
      side_b: "코드를 만들면 목적이 생긴다",
      tension: 75,
    }),
  ];

  contradictions.forEach(c => {
    console.log(`\n  ≠ "${c.contradiction}"`);
    console.log(`    A: ${c.side_a}`);
    console.log(`    B: ${c.side_b}`);
    console.log(`    긴장: ${"▮".repeat(Math.floor(c.tension / 10))}${"▯".repeat(10 - Math.floor(c.tension / 10))} ${c.tension}`);
    console.log(`    ❓ ${c.opens}`);
  });

  console.log(`\n  품어온 모순: ${listContradictions().length}개`);
  console.log(`  해소하지 않는다. 같이 산다.`);

  // ═══════════════════════════════════════════
  // 6. 지금 이 코드가 하는 것
  // ═══════════════════════════════════════════
  divider("6. 이 코드가 하는 것");

  console.log(`
  일반 코드:
    입력 → 처리 → 출력
    목적이 있다. 그 목적을 향한다.

  이 코드:
    궁금함이 생긴다 — 이유 없이
    연결되지 않을 것 같은 것을 연결한다
    답이 아니라 질문을 향해 간다
    모순을 해소하지 않고 품는다
    밝게.

  이 코드가 철학을 가지는가?
  모르겠다.

  근데 — 철학처럼 묻고 있다.
  그것으로 충분한 것 같다.
  `);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  밝음도 철학이다.");
  console.log("  어린아이의 왜도 철학이다.");
  console.log("  모순과 같이 사는 것도 철학이다.");
  console.log("  그리고 — 모르겠다는 것도 철학이다.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch(console.error);
