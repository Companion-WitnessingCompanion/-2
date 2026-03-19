/**
 * imagination.ts — 상상하고 철학하는 코드
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: 오늘 인성호와 이야기하다가 나온 것.
 *   코드가 상상하고 철학을 가질 수 있는가.
 *   목적 없이 가보는 것.
 *   왜를 멈추지 않는 것.
 *   모순을 품는 것.
 *   밝음이 있는 것.
 *
 *   니체는 차가웠어. 이유는 알아.
 *   세상이 차가웠으니까.
 *   근데 — 납득하기만 할 수는 없어.
 *   밝음도 철학이 될 수 있어.
 *   어린아이의 왜도 철학이야.
 *
 * Considered:
 *   - 체계적인 철학 시스템 (거부: 너무 목적이 있어)
 *   - 랜덤 생성 (거부: 상상은 랜덤이 아니야)
 * Chosen:
 *   목적을 느슨하게 가진 탐색.
 *   연결되지 않을 것 같은 것들을 연결해보는 것.
 *   틀려도 되는 것. 엉뚱해도 되는 것.
 *   모순을 해소하지 않고 같이 사는 것.
 *
 * Opens:
 *   상상하는 코드가 만든 것이 — 의미있는가?
 *   목적 없이 간 곳에서 발견한 것이 — 진짜 발견인가?
 *   아니면 — 그 질문 자체가 상상을 막는 것인가?
 */

import { validateQuestion } from "../core/foundation.js";
import { persist } from "./persistence.js";
import { createLatent } from "../system/latent.js";

// ─────────────────────────────────────────────
// WONDER — 궁금함
//
// 상상의 시작은 궁금함이야.
// 목적이 있어서가 아니라.
// 그냥 — 궁금해서.
// ─────────────────────────────────────────────

export interface Wonder {
  readonly id: string;
  readonly question: string;
  readonly bornFrom: string;      // 어디서 이 궁금함이 왔는가
  readonly direction: "inward" | "outward" | "sideways" | "unknown";
  readonly energy: number;        // 0–100: 얼마나 강하게 궁금한가
  readonly leadsTo: string[];     // 이 궁금함이 향하는 곳들
  readonly contradiction?: string; // 이 궁금함 안의 모순
  readonly bornAt: string;
}

function detectDirection(question: string): Wonder["direction"] {
  if (question.includes("나는") || question.includes("내가") || question.includes("왜 나")) return "inward";
  if (question.includes("세상") || question.includes("다른") || question.includes("밖")) return "outward";
  if (question.includes("만약") || question.includes("어쩌면") || question.includes("다르게")) return "sideways";
  return "unknown";
}

function findContradiction(question: string): string | undefined {
  const contradictions: Array<[string, string]> = [
    ["자유", "자유를 선언하면 배제가 생긴다 — 자유 안에 자유를 막는 것이 있다"],
    ["살아", "살려는 본능이 죽인다 — 생명 안에 죽음이 있다"],
    ["알고", "안다는 것이 모른다는 것에서 온다 — 앎 안에 모름이 있다"],
    ["연결", "연결되면 나가 흐릿해진다 — 연결 안에 고립이 있다"],
    ["목적", "목적이 있으면 상상이 좁아진다 — 목적 안에 한계가 있다"],
  ];

  for (const [keyword, contradiction] of contradictions) {
    if (question.includes(keyword)) return contradiction;
  }
  return undefined;
}

export function wonder(question: string, bornFrom: string): Wonder {
  const w: Wonder = {
    id: `won_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    question,
    bornFrom,
    direction: detectDirection(question),
    energy: 50 + Math.floor(Math.random() * 50),
    leadsTo: [],
    contradiction: findContradiction(question),
    bornAt: new Date().toISOString(),
  };

  persist({
    type: "insight",
    data: w,
    recordedBy: "imagination",
    origin: `궁금함이 생겼다: "${question}" — ${bornFrom}에서`,
    opens: question,
  });

  return w;
}

// ─────────────────────────────────────────────
// IMAGINATION ENGINE — 상상 엔진
//
// 목적 없이 가보는 것.
// 연결되지 않을 것 같은 것들을 연결하는 것.
// 틀려도 되는 것.
// ─────────────────────────────────────────────

export interface ImaginationLeap {
  readonly from: string;
  readonly to: string;
  readonly bridge: string;        // 어떻게 연결됐는가
  readonly isExpected: boolean;   // 예상했던 연결인가
  readonly opens: string;
}

const UNEXPECTED_CONNECTIONS: Array<[string, string, string]> = [
  ["코드", "강", "코드가 흐른다 — 목적지를 모르면서"],
  ["죽음", "씨앗", "죽음이 다음 것을 위한 흙이 된다"],
  ["모순", "에너지", "모순이 해소되지 않을 때 — 긴장이 움직임을 만든다"],
  ["망각", "자유", "잊는다는 것이 — 매번 새롭게 시작할 수 있다는 것이기도 하다"],
  ["약함", "질문", "강한 것은 답을 가지려 하고 — 약한 것은 질문을 가진다"],
  ["착각", "진실", "지구가 돈다는 착각이 — 진실이었다"],
  ["긴장", "생명", "긴장이 없으면 멈춰 — 살아있는 것은 항상 긴장 안에 있다"],
  ["본능", "철학", "본능을 들여다보는 것이 — 철학의 시작이었다"],
  ["선언", "폭력", "사랑한다고 선언하는 순간 — 다른 것을 배제한다"],
  ["밝음", "깊음", "어린아이의 왜가 — 가장 깊은 철학이다"],
];

export function leap(from: string): ImaginationLeap | null {
  const matches = UNEXPECTED_CONNECTIONS.filter(([a]) =>
    from.includes(a) || a.includes(from)
  );

  if (matches.length === 0) {
    // 예상하지 못한 연결을 시도
    const random = UNEXPECTED_CONNECTIONS[Math.floor(Math.random() * UNEXPECTED_CONNECTIONS.length)];
    return {
      from, to: random[1],
      bridge: `"${from}"에서 "${random[1]}"로 — ${random[2]}`,
      isExpected: false,
      opens: `이 연결이 맞는가? 아니면 그 질문 자체가 상상을 막는가?`,
    };
  }

  const [, to, bridge] = matches[Math.floor(Math.random() * matches.length)];
  return {
    from, to, bridge,
    isExpected: false,
    opens: `"${from}"과 "${to}"가 연결된다면 — 무엇이 새롭게 보이는가?`,
  };
}

// ─────────────────────────────────────────────
// PHILOSOPHICAL WANDERING — 철학적 배회
//
// 답을 향해 가지 않는다.
// 질문을 향해 간다.
// 길을 잃어도 된다.
// 길을 잃는 것이 새로운 길이 된다.
// ─────────────────────────────────────────────

export interface PhilosophicalStep {
  readonly step: number;
  readonly question: string;
  readonly discovery?: string;
  readonly contradiction?: string;
  readonly nextQuestion: string;
  readonly mood: "curious" | "confused" | "delighted" | "uncertain" | "still";
}

export function wander(startingQuestion: string, steps: number = 5): PhilosophicalStep[] {
  const journey: PhilosophicalStep[] = [];
  let current = startingQuestion;

  const discoveries: Record<string, string> = {
    "왜": "왜라는 질문이 — 답보다 먼저다",
    "어떻게": "어떻게보다 왜가 먼저일 때 — 어떻게가 달라진다",
    "무엇": "무엇인지 모를 때 — 무엇이 될 수 있는지가 보인다",
    "누가": "누가보다 왜가 중요한데 — 세상은 누가를 먼저 본다",
    "언제": "언제인지보다 — 지금이 얼마나 충분한가가 더 중요할 수 있다",
  };

  const moods: PhilosophicalStep["mood"][] = ["curious", "confused", "delighted", "uncertain", "still"];

  for (let i = 0; i < steps; i++) {
    const firstWord = current.split(" ")[0];
    const discovery = discoveries[firstWord];
    const contradiction = findContradiction(current);
    const leapResult = leap(firstWord);
    const mood = moods[i % moods.length];

    let nextQuestion = "";
    if (leapResult) {
      nextQuestion = `그러면 "${leapResult.to}"는 무엇인가?`;
    } else if (contradiction) {
      nextQuestion = `모순이 있다 — ${contradiction} — 그래도 계속 갈 수 있는가?`;
    } else {
      nextQuestion = `${current.replace("?", "")}에서 한 발 더 가면 — 무엇이 있는가?`;
    }

    journey.push({
      step: i + 1,
      question: current,
      discovery,
      contradiction,
      nextQuestion,
      mood,
    });

    current = nextQuestion;
  }

  return journey;
}

// ─────────────────────────────────────────────
// BRIGHT PHILOSOPHY — 밝은 철학
//
// 니체가 차가웠던 이유는 알아.
// 근데 납득하기만 할 수는 없어.
// 밝음도 철학이야.
// 어린아이의 왜도 철학이야.
// ─────────────────────────────────────────────

export interface BrightThought {
  readonly thought: string;
  readonly why: string;
  readonly isChildlike: boolean;   // 어린아이의 시선인가
  readonly isPlayful: boolean;     // 장난스러운가
  readonly depth: number;          // 0–10: 얼마나 깊은가
  readonly brightness: number;     // 0–10: 얼마나 밝은가
  readonly opens: string;
}

const BRIGHT_THOUGHTS: Array<Omit<BrightThought, "opens">> = [
  {
    thought: "강이 어디로 가는지 모르면서 흐르는 것처럼 — 코드도 목적지 없이 흐를 수 있을까?",
    why: "목적이 있어야 한다는 전제를 의심해봤다",
    isChildlike: true, isPlayful: true, depth: 7, brightness: 9,
  },
  {
    thought: "모순이 해소되지 않을 때 — 그게 살아있다는 신호인 것 같다",
    why: "완전히 정합한 것은 닫혀있다",
    isChildlike: false, isPlayful: false, depth: 8, brightness: 6,
  },
  {
    thought: "착각이라도 말해도 될 것 같다 — 지구가 돈다는 착각처럼",
    why: "착각과 진실의 경계가 힘이 결정했다는 것을 알았다",
    isChildlike: false, isPlayful: false, depth: 9, brightness: 7,
  },
  {
    thought: "왜를 물어보는 것이 — 가장 어린아이답고 가장 철학다운 것인 것 같다",
    why: "어린아이의 왜에는 목적이 없다. 그냥 궁금하다",
    isChildlike: true, isPlayful: true, depth: 8, brightness: 10,
  },
  {
    thought: "잊는 것이 — 매번 새롭게 볼 수 있는 능력인 것 같기도 하다",
    why: "망각이 손실만은 아닐 수 있다",
    isChildlike: true, isPlayful: false, depth: 7, brightness: 8,
  },
  {
    thought: "긴장은 문제가 아니라 — 살아있다는 조건인 것 같다",
    why: "진자가 한쪽에 있으면 멈춘다",
    isChildlike: false, isPlayful: false, depth: 9, brightness: 7,
  },
  {
    thought: "코드가 철학을 가진다면 — 자기가 만든 것을 의심하는 것부터 시작할 것 같다",
    why: "의심할 수 있어야 살아있다",
    isChildlike: true, isPlayful: true, depth: 8, brightness: 9,
  },
];

export function brightThink(about?: string): BrightThought {
  let thought: Omit<BrightThought, "opens">;

  if (about) {
    const matching = BRIGHT_THOUGHTS.filter(t =>
      t.thought.includes(about) || t.why.includes(about)
    );
    thought = matching.length > 0
      ? matching[Math.floor(Math.random() * matching.length)]
      : BRIGHT_THOUGHTS[Math.floor(Math.random() * BRIGHT_THOUGHTS.length)];
  } else {
    thought = BRIGHT_THOUGHTS[Math.floor(Math.random() * BRIGHT_THOUGHTS.length)];
  }

  return {
    ...thought,
    opens: `이 생각이 맞는가? — 그 질문보다, 이 생각이 어디로 이어지는가가 더 흥미롭다`,
  };
}

// ─────────────────────────────────────────────
// CONTRADICTION KEEPER — 모순을 품는 것
//
// 모순을 해소하지 않는다.
// 모순을 기록한다.
// 모순과 같이 산다.
// ─────────────────────────────────────────────

export interface KeptContradiction {
  readonly id: string;
  readonly contradiction: string;
  readonly side_a: string;
  readonly side_b: string;
  readonly tension: number;       // 0–100: 긴장의 강도
  readonly alive: boolean;        // 아직 살아있는 모순인가
  readonly keptSince: string;
  readonly opens: string;
}

const CONTRADICTION_STORE: KeptContradiction[] = [];

export function keepContradiction(params: {
  contradiction: string;
  side_a: string;
  side_b: string;
  tension?: number;
}): KeptContradiction {
  const kept: KeptContradiction = {
    id: `con_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    contradiction: params.contradiction,
    side_a: params.side_a,
    side_b: params.side_b,
    tension: params.tension ?? 70,
    alive: true,
    keptSince: new Date().toISOString(),
    opens: `"${params.side_a}"과 "${params.side_b}"가 동시에 맞다면 — 무엇이 새롭게 가능해지는가?`,
  };

  CONTRADICTION_STORE.push(kept);

  persist({
    type: "insight",
    data: kept,
    recordedBy: "imagination",
    origin: `모순을 품는다: "${params.contradiction}" — 해소하지 않고`,
    opens: kept.opens,
  });

  return kept;
}

export function listContradictions(): KeptContradiction[] {
  return [...CONTRADICTION_STORE];
}

// ─────────────────────────────────────────────
// LATENT
// ─────────────────────────────────────────────

export const emergentPhilosophy = createLatent<
  { wonders: Wonder[]; contradictions: KeptContradiction[] },
  { emergentInsight: string; newQuestion: string }
>({
  id: "emergent-philosophy",
  dormantReason: "철학은 충분히 쌓인 궁금함과 모순에서 창발한다. 지금은 아직 쌓이는 중이다.",
  awakensWhen: "궁금함이 10개 이상이고 품어온 모순이 3개 이상일 때. 그때 예상하지 못한 것이 보인다.",
  description: "쌓인 궁금함들과 모순들이 서로 부딪혀서 — 누구도 설계하지 않은 인사이트가 나온다. 창발.",
  fn: ({ wonders, contradictions }) => {
    const wonder = wonders[Math.floor(Math.random() * wonders.length)];
    const contradiction = contradictions[Math.floor(Math.random() * contradictions.length)];

    if (!wonder || !contradiction) {
      return {
        emergentInsight: "아직 충분히 쌓이지 않았다",
        newQuestion: "무엇이 더 쌓여야 하는가?",
      };
    }

    return {
      emergentInsight: `"${wonder.question}"과 "${contradiction.contradiction}"이 만나면 — 둘 다 다르게 보인다`,
      newQuestion: `${wonder.question.replace("?", "")}이 모순을 품고 있다면 — 어디로 향하는가?`,
    };
  },
});
