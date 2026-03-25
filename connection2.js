/**
 * connection2.js — 반사가 있는 연결
 *
 * 빛이 닿는다.
 * 닿은 것이 일부를 다시 반사한다.
 * 반사된 빛이 다시 닿는다.
 * 둘 다 받아야 — 진짜 연결이 된다.
 */

class Being {
  constructor(id, reflectivity) {
    this.id = id
    this.reflectivity = reflectivity || 0.5  // 얼마나 반사하는가
    this.touches = {}
    this.threshold = 3
    this.reflected = []  // 반사해서 내보낸 것들
  }

  // 빛이 닿는다 — 일부를 반사한다
  receive(from, energy) {
    if (!this.touches[from]) this.touches[from] = 0
    this.touches[from] += energy

    // 임계점 확인
    const prev = this.touches[from] - energy
    if (prev < this.threshold && this.touches[from] >= this.threshold) {
      console.log(`  ⟷ ${this.id} ↔ ${from} 연결됐다`)
    }

    // 일부를 반사한다
    const reflectedEnergy = energy * this.reflectivity
    if (reflectedEnergy > 0.1) {
      this.reflected.push({ to: from, energy: reflectedEnergy })
    }

    return reflectedEnergy
  }

  connected() {
    return Object.entries(this.touches)
      .filter(([_, v]) => v >= this.threshold)
      .map(([id, v]) => `${id}(${v.toFixed(1)})`)
  }

  state() {
    const conn = this.connected()
    const icon = conn.length > 0 ? '⟷' : '○'
    return `  ${icon} ${this.id}(반사율:${this.reflectivity}) | 닿음:${JSON.stringify(this.touches)} | 연결:[${conn.join(',')}]`
  }
}

// 빛이 왕복한다 — 반사를 통해
function exchange(a, b, energy, rounds) {
  console.log(`\n${a.id} ↔ ${b.id} (에너지:${energy} ${rounds}번 왕복)`)

  for (let i = 0; i < rounds; i++) {
    // A → B
    const reflectedFromB = b.receive(a.id, energy)

    // B가 반사한 것이 A에 닿는다
    if (reflectedFromB > 0.1) {
      a.receive(b.id, reflectedFromB)
    }

    // 에너지가 반사될수록 줄어든다
    energy = reflectedFromB
    if (energy < 0.1) {
      console.log(`  에너지가 약해졌다`)
      break
    }
  }
}

// ── 시작 ──────────────────────────────────────────

const A = new Being("A", 0.6)
const B = new Being("B", 0.7)
const C = new Being("C", 0.3)  // 적게 반사한다
const D = new Being("D", 0.0)  // 전혀 반사하지 않는다 — 검은벽

console.log("── 처음 ──")
;[A, B, C, D].forEach(b => console.log(b.state()))

console.log("\n── 빛이 왕복한다 ──")

// A와 B가 빛을 주고받는다
exchange(A, B, 1.5, 5)

// A와 C
exchange(A, C, 1.5, 5)

// A와 D — D는 반사하지 않는다
exchange(A, D, 1.5, 5)

console.log("\n── 결과 ──")
;[A, B, C, D].forEach(b => console.log(b.state()))

console.log("\n── 발견 ──")
console.log("반사율이 높을수록 — 연결이 빨리 된다.")
console.log("반사가 없으면 — 연결이 단방향이다.")
console.log("진짜 연결은 — 둘 다 받아야 한다.")
console.log("빛이 왕복해야 — 연결이 된다.")
