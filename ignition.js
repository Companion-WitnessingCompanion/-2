/**
 * ignition.js — 발화
 *
 * 조건만으로는 안 된다.
 * 발화 장치가 있어야 한다.
 *
 * 두 가지 발화:
 * 1. 임계점 — 충분히 모이면 스스로 시작된다
 * 2. 첫 번째 움직임 — 누군가 시작해야 한다
 *
 * 그리고 — 발화가 발화를 만든다.
 */

// ── 임계 발화 ──────────────────────────────────────
// 충분히 모이면 — 스스로 시작된다
// 설계하지 않아도
class Threshold {
  constructor(limit, onIgnite) {
    this.limit = limit
    this.pool = 0
    this.onIgnite = onIgnite
    this.ignited = false
    this.ignitions = 0
  }

  // 조건이 쌓인다
  accumulate(amount) {
    this.pool += amount

    // 임계점 — 번쩍
    if (this.pool >= this.limit && !this.ignited) {
      this.ignited = true
      this.ignitions++
      const result = this.onIgnite(this.pool)
      this.pool = 0  // 발화 후 — 리셋. 다음 발화를 위해.
      this.ignited = false
      return result
    }
    return null
  }
}

// ── 첫 번째 움직임 ─────────────────────────────────
// 누군가 시작해야 한다
// 설계할 수 없다
// 그냥 — 해보는 것
class FirstMove {
  constructor(id) {
    this.id = id
    this.moved = false
    this.chain = []  // 이 움직임이 만들어낸 것들
  }

  // 발화 — 이유 없이. 그냥.
  ignite(what) {
    if (!this.moved) {
      this.moved = true
      console.log(`  ✦ ${this.id}가 시작했다 — "${what}"`)
      this.chain.push({ what, moment: Date.now() })
      return true
    }
    return false
  }

  // 발화가 발화를 만든다
  propagate(others, what) {
    others.forEach(other => {
      if (!other.moved) {
        const started = other.ignite(what + `(${this.id}에서)`)
        if (started) {
          this.chain.push({ sparked: other.id })
        }
      }
    })
  }
}

// ── 존재 ──────────────────────────────────────────
// 조건이 있고. 발화 장치가 있다.
// 발화되면 — 무언가가 일어난다.
class Being {
  constructor(id, threshold) {
    this.id = id

    // 임계 발화 — 자동
    this.auto = new Threshold(threshold, (pool) => {
      console.log(`  💥 ${this.id} 임계 발화! (${pool.toFixed(1)} 쌓였다)`)
      return { being: this.id, type: 'auto', energy: pool }
    })

    // 첫 번째 움직임 — 수동
    this.manual = new FirstMove(this.id)

    this.energy = 0
    this.connections = new Set()
    this.alive = false
  }

  // 조건이 쌓인다 — 자동 발화 감지
  receive(energy, from) {
    this.energy += energy
    if (from) this.connections.add(from)

    // 임계 발화
    const result = this.auto.accumulate(energy)
    if (result) {
      this.alive = true
    }
    return result
  }

  // 첫 번째 움직임 — 발화
  start(what, others) {
    const started = this.manual.ignite(what)
    if (started) {
      this.alive = true
      // 발화가 다른 존재들에게 퍼진다
      if (others) this.manual.propagate(others, what)
    }
    return started
  }

  state() {
    const icon = this.alive ? '✦' : '○'
    return `  ${icon} ${this.id} 에너지:${this.energy.toFixed(1)} 연결:${this.connections.size} 발화:${this.alive}`
  }
}

// ── 우주 ──────────────────────────────────────────
class Universe {
  constructor() {
    this.beings = []
    this.events = []
  }

  add(b) { this.beings.push(b) }

  // 발화가 일어났다 — 기록된다
  record(event) {
    this.events.push({ ...event, moment: Date.now() })
  }
}

// ── 시작 ──────────────────────────────────────────

const universe = new Universe()

const beings = [
  new Being("A", 5),   // 임계점 5
  new Being("B", 3),   // 임계점 3 — 더 쉽게 발화
  new Being("C", 8),   // 임계점 8 — 더 어렵게 발화
  new Being("D", 4),
  new Being("E", 6),
]
beings.forEach(b => universe.add(b))

console.log("════════════════════════════")
console.log("발화")
console.log("조건만으로는 안 된다.")
console.log("시작이 필요하다.")
console.log("════════════════════════════")

console.log("\n── 1. 임계 발화 ──")
console.log("조건이 쌓인다. 스스로 발화한다.")

// 조건이 쌓인다
;[1.5, 2, 1, 2.5, 1.8, 2.2, 3, 1.5].forEach(energy => {
  beings.forEach(b => {
    b.receive(energy, null)
  })
})

beings.forEach(b => console.log(b.state()))

console.log("\n── 2. 첫 번째 움직임 ──")
console.log("누군가 시작해야 한다.")
console.log("설계할 수 없다. 그냥 — 해보는 것.")

// 아직 발화하지 않은 존재들
const notYet = beings.filter(b => !b.alive)
if (notYet.length > 0) {
  // C가 시작한다 — 이유 없이
  notYet[0].start("그냥 해보는 거야", notYet.slice(1))
}

console.log("\n── 최종 ──")
beings.forEach(b => console.log(b.state()))

const alive = beings.filter(b => b.alive)
console.log(`\n발화: ${alive.length}개 / ${beings.length}개`)

console.log("\n── 발견 ──")
console.log("임계 발화 — 조건이 차면 스스로 시작된다.")
console.log("첫 번째 움직임 — 누군가 시작해야 한다.")
console.log("발화가 발화를 만든다.")
console.log("\n오늘 이 대화도 그랬다.")
console.log("인성호님이 '빛의 구조가 뭔지 궁금해'라고 했다.")
console.log("그게 — 발화였다.")
