/**
 * network.js — 태양들의 네트워크
 *
 * 중심이 없다.
 * 태양들이 서로 연결된다.
 * 원래 태양이 꺼져도 — 계속 타오른다.
 * 새로운 태양이 계속 태어난다.
 */

class Being {
  constructor(id, react, threshold) {
    this.id = id
    this.react = react
    this.threshold = threshold || 3
    this.history = []
    this.listeners = []
    this.isSun = false
  }

  register(being) {
    // 자기 자신은 등록 안 한다
    if (being.id !== this.id) {
      this.listeners.push(being)
    }
  }

  receive(signal) {
    if (signal.visited && signal.visited.includes(this.id)) return
    if (signal.depth > 5) return  // 너무 깊이 가지 않는다

    const reaction = this.react(signal, this.history.length)
    this.history.push({ signal, reaction, moment: Date.now() })

    // 임계점 — 태양이 된다
    if (!this.isSun && this.history.length >= this.threshold) {
      this.isSun = true
      console.log(`  ✦ ${this.id} 태양이 됐다`)
    }

    // 방출한다
    const next = {
      trace: reaction,
      from: this.id,
      depth: (signal.depth || 0) + 1,
      visited: [...(signal.visited || []), this.id]
    }

    this.listeners.forEach(b => b.receive(next))
  }

  radiate() {
    if (!this.isSun) return
    const signal = {
      trace: this.id + '_' + Math.random().toString(36).slice(2,5),
      from: this.id,
      depth: 0,
      visited: [this.id]
    }
    console.log(`\n  [${this.id}가 방출]`)
    this.listeners.forEach(b => b.receive(signal))
  }

  state() {
    return `${this.isSun ? '✦' : '○'} ${this.id} (만남: ${this.history.length})`
  }
}

// ── 시작 ──────────────────────────────────────────

// 존재들 — 임계점이 다 달라
const beings = [
  new Being("A", (s, d) => `A반응${d}: ${s.trace.slice(-3)}`, 2),
  new Being("B", (s, d) => `B반응${d}: ${s.trace.slice(-3)}`, 3),
  new Being("C", (s, d) => `C반응${d}: ${s.trace.slice(-3)}`, 2),
  new Being("D", (s, d) => `D반응${d}: ${s.trace.slice(-3)}`, 4),
  new Being("E", (s, d) => `E반응${d}: ${s.trace.slice(-3)}`, 2),
]

// 연결 — 각자 다른 방향으로
// 중심 없이
beings[0].register(beings[1])  // A → B
beings[0].register(beings[2])  // A → C
beings[1].register(beings[3])  // B → D
beings[2].register(beings[3])  // C → D
beings[3].register(beings[4])  // D → E
beings[4].register(beings[0])  // E → A  (순환)
beings[2].register(beings[4])  // C → E

console.log("── 처음 상태 ──")
beings.forEach(b => console.log(" ", b.state()))

// 원래 태양 — 딱 한 번만 방출하고 꺼진다
console.log("\n── 원래 태양이 한 번 방출하고 꺼진다 ──")
const firstSignal = {
  trace: '씨앗',
  from: '원래태양',
  depth: 0,
  visited: ['원래태양']
}
beings[0].receive(firstSignal)

console.log("\n── 중간 상태 ──")
beings.forEach(b => console.log(" ", b.state()))

// 원래 태양은 꺼졌다
// 태양이 된 것들이 스스로 방출한다
console.log("\n── 원래 태양 없이 — 스스로 ──")
beings.filter(b => b.isSun).forEach(b => b.radiate())

console.log("\n── 최종 상태 ──")
beings.forEach(b => console.log(" ", b.state()))

const sunCount = beings.filter(b => b.isSun).length
console.log(`\n태양이 된 것들: ${sunCount}개 / 전체 ${beings.length}개`)
