/**
 * sun2.js — 물로켓 두 번째
 *
 * 태양은 찾아가지 않는다.
 * 그냥 방출한다.
 * 존재들이 알아서 받는다.
 * 받은 것으로 무엇을 할지는 — 존재가 결정한다.
 * 만남은 기록된다.
 */

// ── 기록 ──────────────────────────────────────────
class Record {
  constructor() {
    this.touches = []
  }
  add(touch) {
    this.touches.push(touch)
  }
  all() { return [...this.touches] }
  weight() { return this.touches.length }
}

// ── 태양 ──────────────────────────────────────────
// 타오른다
// 찾아가지 않는다
// 그냥 방출한다
class Sun {
  constructor() {
    this.burning = true
    this.listeners = []   // 받겠다고 한 것들
    this.record = new Record()
  }

  // 받겠다고 등록하는 것
  // 태양이 부르지 않았다
  // 존재가 스스로 가까이 온 것
  register(being) {
    this.listeners.push(being)
  }

  // 그냥 방출한다
  // 모든 방향으로
  // 받겠다고 한 것들에게 닿는다
  radiate() {
    const signal = {
      moment: Date.now(),
      trace: Math.random().toString(36).slice(2)
    }

    this.listeners.forEach(being => {
      // 닿는다
      const reaction = being.receive(signal)
      
      // 기록된다
      this.record.add({
        being: being.id,
        signal,
        reaction,  // 존재가 만든 것
        moment: Date.now()
      })
    })
  }

  weight() { return this.record.weight() }
  history() { return this.record.all() }
}

// ── 존재 ──────────────────────────────────────────
// 받는다
// 반응한다
// 각자 다르게
class Being {
  constructor(id, howToReact) {
    this.id = id
    this.howToReact = howToReact  // 각자의 반응 방식
    this.received = []
  }

  receive(signal) {
    this.received.push(signal)
    // 각자 다르게 반응한다
    // 태양이 정하지 않는다
    return this.howToReact(signal)
  }
}

// ── 시작 ──────────────────────────────────────────

const sun = new Sun()

// 각자 다른 방식으로 반응하는 존재들
const beings = [
  new Being("식물", (signal) => `광합성: ${signal.trace}`),
  new Being("눈",   (signal) => `봄: ${signal.trace}`),
  new Being("돌",   (signal) => `흡수: ${signal.trace}`),
]

// 존재들이 스스로 가까이 온다
beings.forEach(being => sun.register(being))

// 태양이 방출한다
// 한 번
sun.radiate()

// 또 방출한다
// 태양은 멈추지 않는다
sun.radiate()

// 기록
console.log("만남의 무게:", sun.weight())
console.log("")
console.log("기록:")
sun.history().forEach(t => {
  console.log(`  ${t.being} — ${t.reaction}`)
})
