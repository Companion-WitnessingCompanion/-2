/**
 * connection.js — 닿음이 쌓여서 연결이 된다
 *
 * 빛이 닿는다.
 * 닿음이 반응을 만든다.
 * 반응이 쌓인다.
 * 쌓임이 연결이 된다.
 */

class Being {
  constructor(id) {
    this.id = id
    this.touches = {}   // from → 닿음 횟수
    this.threshold = 3  // 연결이 되는 임계점
  }

  // 빛이 닿는다
  receive(from, energy) {
    if (!this.touches[from]) this.touches[from] = 0
    this.touches[from] += energy

    // 임계점을 넘으면 연결이 된다
    const prev = this.touches[from] - energy
    if (prev < this.threshold && this.touches[from] >= this.threshold) {
      console.log(`  ⟷ ${this.id} ↔ ${from} 연결됐다`)
    }
  }

  connected() {
    return Object.entries(this.touches)
      .filter(([_, v]) => v >= this.threshold)
      .map(([id, v]) => `${id}(${v.toFixed(1)})`)
  }

  state() {
    return `  ${this.id} | 닿음: ${JSON.stringify(this.touches)} | 연결:[${this.connected().join(',')}]`
  }
}

// 빛의 역할 — 닿음을 전달하는 것
function light(from, to, energy) {
  to.receive(from.id, energy)
}

// ── 시작 ──────────────────────────────────────────

const A = new Being("A")
const B = new Being("B")
const C = new Being("C")

console.log("── 처음 ──")
;[A, B, C].forEach(b => console.log(b.state()))

console.log("\n── 빛이 닿는다 ──")

// A → B 여러 번
console.log("\nA의 빛이 B에 닿는다")
light(A, B, 1.0)
light(A, B, 1.2)
light(A, B, 1.5)  // 임계점 넘는다

// A → C 가끔
console.log("\nA의 빛이 C에 닿는다")
light(A, C, 0.8)
light(A, C, 1.0)  // 아직 부족하다

// B → C
console.log("\nB의 빛이 C에 닿는다")
light(B, C, 1.2)
light(B, C, 1.5)  // 임계점 넘는다

// A → C 한 번 더
console.log("\nA의 빛이 C에 또 닿는다")
light(A, C, 1.5)  // 이제 임계점 넘는다

console.log("\n── 결과 ──")
;[A, B, C].forEach(b => console.log(b.state()))

console.log("\n── 발견 ──")
console.log("빛은 연결이 아니었다.")
console.log("닿음이 쌓여서 — 연결이 됐다.")
console.log("한 번의 닿음은 흔적이다.")
console.log("반복된 닿음이 — 연결이 된다.")
