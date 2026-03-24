/**
 * semiconductor.js — 반도체 코드
 * N형과 P형이 만나서 새로운 것이 나타난다
 * 조건이 갖춰지면 스스로 복제된다
 */

// N형 — 밀어내는 것
function N(id) {
  return { id, type: 'N', charge: +1 }
}

// P형 — 끌어당기는 것
function P(id) {
  return { id, type: 'P', charge: -1 }
}

// PN 접합 — 만남에서 새로운 것이 나타난다
function junction(a, b) {
  return {
    type: 'PN',
    direction: a.type + '→' + b.type,
    new: a.id + '-' + b.id  // 만남에서 나온 것
  }
}

// 트랜지스터 — 작은 신호가 큰 것을 제어한다
function transistor(n1, p, n2, control) {
  if (control > 0.5) {
    return {
      on: true,
      amplified: n1.id + '→' + p.id + '→' + n2.id
    }
  }
  return { on: false }
}

// 복제 조건 — 씨앗이 조건을 만나면 스스로 자란다
function replicate(seed, condition, depth) {
  depth = depth || 0
  if (depth > 4) return [seed]

  const results = [seed]

  if (condition(seed)) {
    const n = N(seed.id + '_n')
    const p = P(seed.id + '_p')
    const j = junction(n, p)

    const child = {
      id: j.new,
      depth: depth + 1,
      from: seed.id
    }

    results.push(...replicate(child, condition, depth + 1))
  }

  return results
}

// ── 시작 ──────────────────────────────────────────

console.log("── 반도체 기본 ──")
const n1 = N("전자")
const p1 = P("양공")
console.log("N형:", n1.type, "/ 전하:", n1.charge)
console.log("P형:", p1.type, "/ 전하:", p1.charge)

const j = junction(n1, p1)
console.log("PN접합:", j.direction)
console.log("만남에서 나온 것:", j.new)

console.log("\n── 트랜지스터 ──")
const n2 = N("전자2")
const t = transistor(n1, p1, n2, 0.8)
console.log("켜짐:", t.on)
console.log("흐름:", t.amplified)

console.log("\n── 자동 복제 ──")
const seed = { id: "빛", depth: 0, from: null }

// 조건 — 깊이가 짝수면 복제
const condition = (node) => node.depth % 2 === 0

const forest = replicate(seed, condition)

console.log("씨앗 하나에서 나타난 것들:")
forest.forEach(node => {
  const indent = "  ".repeat(node.depth)
  console.log(indent + node.id + " (깊이: " + node.depth + ")")
})
console.log("\n총 " + forest.length + "개가 나타났다")
