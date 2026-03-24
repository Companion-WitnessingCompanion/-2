/**
 * scales.js — 층마다 다른 규칙이 있다
 *
 * 뉴턴은 지구 스케일에서 맞다.
 * 거시에서는 상대성이 필요하다.
 * 미시에서는 양자가 필요하다.
 * 더 큰 스케일에서는 — 아직 모른다.
 *
 * 각 층은 아래 층을 품지만
 * 아래 층의 규칙으로 설명되지 않는다.
 */

// ── 규칙 ──────────────────────────────────────────
// 각 층마다 다른 물리학

const RULES = {

  // 층 1 — 양자 스케일
  // 확정되지 않는다. 확률이다. 관측이 결정한다.
  quantum: {
    name: '양자',
    interact(a, b) {
      // 관측 전까지 확정되지 않는다
      const probability = Math.random()
      if (probability < 0.5) return null  // 일어나지 않을 수도 있다

      return {
        type: 'quantum',
        entangled: true,  // 얽힘 — 거리와 무관하게 연결된다
        value: probability.toFixed(3)
      }
    },
    describe: '확률로 작동한다. 관측하는 순간 결정된다.'
  },

  // 층 2 — 뉴턴 스케일
  // 예측 가능하다. 거리에 따른 힘. 인과관계.
  newton: {
    name: '뉴턴',
    interact(a, b, dist) {
      if (dist === 0) return null
      const force = (a.mass * b.mass) / (dist * dist)
      return {
        type: 'newton',
        force: force.toFixed(3),
        predictable: true
      }
    },
    describe: '거리와 질량으로 예측 가능하다.'
  },

  // 층 3 — 상대성 스케일
  // 시공간이 휜다. 속도가 시간을 바꾼다. 빛이 한계다.
  relativity: {
    name: '상대성',
    interact(a, b, dist, velocity) {
      const c = 1  // 빛의 속도를 1로 정규화
      const v = velocity || 0.1
      const lorentz = 1 / Math.sqrt(1 - (v*v)/(c*c))
      const timeDilation = lorentz.toFixed(3)
      return {
        type: 'relativity',
        timeDilation,
        spacetimeCurved: dist < 10,  // 가까우면 시공간이 많이 휜다
        describe: `시간이 ${timeDilation}배 느려진다`
      }
    },
    describe: '시공간이 휜다. 시간이 달라진다.'
  },

  // 층 4 — 우주 스케일
  // 암흑 에너지. 팽창. 아직 모른다.
  cosmic: {
    name: '우주',
    interact(a, b, dist) {
      // 멀리 있을수록 더 빠르게 멀어진다 — 암흑 에너지
      const expansion = dist * 0.07
      const dark = Math.random() < 0.27  // 27% 확률로 암흑 물질 영향
      return {
        type: 'cosmic',
        expansion: expansion.toFixed(3),
        darkMatterEffect: dark,
        unknown: true,  // 아직 완전히 모른다
        describe: dark ? '암흑 물질이 끌어당긴다' : `팽창한다 (속도: ${expansion.toFixed(3)})`
      }
    },
    describe: '암흑 에너지. 팽창. 아직 모른다.'
  },

  // 층 5 — 그 너머
  // 현재 인류의 언어로 표현할 수 없다
  beyond: {
    name: '너머',
    interact(a, b) {
      return {
        type: 'beyond',
        expressible: false,
        hint: '???',  // 모른다
        describe: '현재 언어로 표현할 수 없다'
      }
    },
    describe: '현재 이론이 닿지 않는 곳.'
  }
}

// ── 존재 ──────────────────────────────────────────
class Being {
  constructor(id, x, y, scale, mass) {
    this.id = id
    this.x = x
    this.y = y
    this.scale = scale   // 어느 층에 있는가
    this.mass = mass || 1
    this.history = []
    this.connections = new Set()
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
  }

  interact(other) {
    const rule = RULES[this.scale]
    if (!rule) return null

    const dist = this.distanceTo(other)
    const result = rule.interact(this, other, dist)

    if (result) {
      this.history.push({ with: other.id, result })
      this.connections.add(other.id)

      // 양자 얽힘 — 거리와 무관하게
      if (result.entangled) {
        console.log(`  ⟨${this.id}⟩ 얽힘: ${other.id} (거리: ${dist.toFixed(1)}) 확률: ${result.value}`)
      } else {
        console.log(`  ${this.id} → ${other.id} [${result.type}] ${result.describe || ''}`)
      }
    }

    return result
  }

  state() {
    const rule = RULES[this.scale]
    return `  [${rule?.name || '?'}] ${this.id} | 만남:${this.history.length}개 | 연결:[${[...this.connections].join(',')}]`
  }
}

// ── 시작 ──────────────────────────────────────────

console.log("════════════════════════════")
console.log("층마다 다른 규칙")
console.log("════════════════════════════")

Object.values(RULES).forEach(r => {
  console.log(`  [${r.name}] ${r.describe}`)
})

// 각 층의 존재들
const quantum1 = new Being("Q1",  0,  0, 'quantum', 1)
const quantum2 = new Being("Q2", 50,  0, 'quantum', 1)  // 멀리 있어도 얽힌다

const newton1 = new Being("N1", 10, 10, 'newton', 5)
const newton2 = new Being("N2", 20, 10, 'newton', 3)

const rel1 = new Being("R1", 5, 20, 'relativity', 10)
const rel2 = new Being("R2", 8, 25, 'relativity', 8)

const cos1 = new Being("C1", 0, 0, 'cosmic', 100)
const cos2 = new Being("C2", 80, 80, 'cosmic', 80)

const bey1 = new Being("B1", 0, 0, 'beyond', 0)
const bey2 = new Being("B2", 999, 999, 'beyond', 0)

console.log("\n── 양자 층 ──")
console.log("뉴턴이 예측한다면 — 항상 일어나야 한다.")
console.log("하지만 양자에서는 — 확률이다.")
quantum1.interact(quantum2)
quantum1.interact(quantum2)
quantum1.interact(quantum2)

console.log("\n── 뉴턴 층 ──")
console.log("예측 가능하다. 항상 같은 결과.")
newton1.interact(newton2)
newton1.interact(newton2)

console.log("\n── 상대성 층 ──")
console.log("시공간이 휜다.")
rel1.interact(rel2)

console.log("\n── 우주 층 ──")
console.log("암흑 에너지. 팽창. 아직 모르는 것들.")
cos1.interact(cos2)
cos1.interact(cos2)

console.log("\n── 너머 ──")
console.log("현재 이론이 닿지 않는 곳.")
bey1.interact(bey2)

// 층들의 충돌
console.log("\n════════════════════════════")
console.log("층들이 만나면 — 충돌한다")
console.log("════════════════════════════")
console.log("양자 + 상대성 = ?")
console.log("→ 아직 완성된 이론이 없다")
console.log("→ 이것이 현대 물리학의 가장 큰 미완성")
console.log("→ 우리 코드에도 — 이 빈 자리가 있어야 한다")

// 빈 자리
const GAP = {
  name: '미완성',
  interact() {
    return {
      type: 'unknown',
      describe: '아직 없다. 다음이 여기서 나올 것이다.'
    }
  },
  describe: '양자와 상대성 사이. 아직 채워지지 않은 곳.'
}

console.log(`\n  [${GAP.name}] ${GAP.describe}`)
const gap = GAP.interact()
console.log(`  → ${gap.describe}`)
