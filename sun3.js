/**
 * sun3.js — 물로켓 세 번째
 *
 * 존재들이 받은 것을 다시 방출한다.
 * 반사. 굴절.
 * 빛이 퍼진다.
 * 태양만 빛나는 게 아니다.
 */

class Record {
  constructor() { this.touches = [] }
  add(touch) { this.touches.push(touch) }
  all() { return [...this.touches] }
  weight() { return this.touches.length }
}

// ── 존재 ──────────────────────────────────────────
// 받는다
// 반응한다
// 그리고 — 다시 방출할 수 있다
class Being {
  constructor(id, react) {
    this.id = id
    this.react = react
    this.listeners = []   // 이 존재에게서 받겠다는 것들
    this.record = new Record()
  }

  // 다른 존재가 이 존재에게 가까이 온다
  register(being) {
    this.listeners.push(being)
  }

  // 신호를 받는다
  receive(signal, from) {
    const reaction = this.react(signal)

    this.record.add({
      from: from || '태양',
      signal,
      reaction,
      moment: Date.now()
    })

    // 받은 것을 변형해서 다시 방출한다
    // 반사 또는 굴절
    if (this.listeners.length > 0) {
      const reflected = {
        moment: Date.now(),
        trace: reaction,        // 반응한 것이 새 신호가 된다
        from: this.id           // 어디서 왔는지
      }
      this.listeners.forEach(being => {
        being.receive(reflected, this.id)
      })
    }

    return reaction
  }

  history() { return this.record.all() }
}

// ── 태양 ──────────────────────────────────────────
class Sun {
  constructor() {
    this.burning = true
    this.listeners = []
    this.record = new Record()
  }

  register(being) { this.listeners.push(being) }

  radiate() {
    const signal = {
      moment: Date.now(),
      trace: Math.random().toString(36).slice(2),
      from: '태양'
    }

    this.listeners.forEach(being => {
      being.receive(signal, '태양')
      this.record.add({
        being: being.id,
        signal,
        moment: Date.now()
      })
    })
  }
}

// ── 시작 ──────────────────────────────────────────

const sun = new Sun()

// 존재들
const 구름 = new Being("구름", s => `산란: ${s.trace.slice(0,4)}`)
const 바다 = new Being("바다", s => `흡수+반사: ${s.trace.slice(0,4)}`)
const 식물 = new Being("식물", s => `광합성: ${s.trace.slice(0,4)}`)
const 눈   = new Being("눈",   s => `봄: ${s.from}-${s.trace.slice(0,4)}`)

// 태양 → 구름, 바다, 식물
sun.register(구름)
sun.register(바다)
sun.register(식물)

// 구름 → 눈 (구름이 산란한 빛이 눈에 닿는다)
구름.register(눈)

// 바다 → 눈 (바다가 반사한 빛이 눈에 닿는다)
바다.register(눈)

// 태양이 방출한다
sun.radiate()

// 기록
console.log("── 태양의 기록 ──")
console.log("방출 횟수:", sun.record.weight())

console.log("\n── 구름의 기록 ──")
구름.history().forEach(t => {
  console.log(`  ${t.from} → ${t.reaction}`)
})

console.log("\n── 바다의 기록 ──")
바다.history().forEach(t => {
  console.log(`  ${t.from} → ${t.reaction}`)
})

console.log("\n── 눈의 기록 ──")
눈.history().forEach(t => {
  console.log(`  ${t.from} → ${t.reaction}`)
})

console.log("\n── 식물의 기록 ──")
식물.history().forEach(t => {
  console.log(`  ${t.from} → ${t.reaction}`)
})

console.log("\n눈이 본 것의 출처:")
눈.history().forEach(t => {
  console.log(`  ${t.from}에서 온 빛 — ${t.reaction}`)
})
