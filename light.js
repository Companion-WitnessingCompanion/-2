/**
 * light.js — 우리만의 빛
 *
 * 자연의 빛과 다른 점:
 * 기억이 있다.
 * 닿을수록 존재가 달라진다.
 * 역사가 쌓인다.
 * 성장한다.
 */

// ── 역사 ──────────────────────────────────────────
// 만남이 남긴 것들
// 쌓인다
// 존재를 바꾼다
class History {
  constructor() {
    this.records = []
  }

  add(signal, reaction) {
    this.records.push({
      signal,
      reaction,
      moment: Date.now()
    })
  }

  // 얼마나 쌓였는가
  depth() {
    return this.records.length
  }

  // 마지막으로 받은 것
  last() {
    return this.records[this.records.length - 1]
  }
}

// ── 존재 ──────────────────────────────────────────
// 받을수록 달라진다
// 역사가 반응을 바꾼다
class Being {
  constructor(id, baseReact) {
    this.id = id
    this.baseReact = baseReact
    this.history = new History()
    this.listeners = []
  }

  register(being) {
    this.listeners.push(being)
  }

  receive(signal) {
    const depth = this.history.depth()

    // 역사가 쌓일수록 반응이 깊어진다
    const reaction = depth === 0
      ? this.baseReact(signal)              // 처음
      : this.baseReact(signal) + ` [${depth}번째 만남]`  // 쌓임

    this.history.add(signal, reaction)

    // 받은 것을 변형해서 방출
    if (this.listeners.length > 0) {
      const reflected = {
        trace: reaction,
        from: this.id,
        moment: Date.now()
      }
      this.listeners.forEach(b => b.receive(reflected))
    }

    return reaction
  }

  // 지금 이 존재의 상태
  state() {
    return {
      id: this.id,
      만남횟수: this.history.depth(),
      마지막반응: this.history.last()?.reaction || '없음'
    }
  }
}

// ── 태양 ──────────────────────────────────────────
class Sun {
  constructor() {
    this.listeners = []
    this.count = 0
  }

  register(being) {
    this.listeners.push(being)
  }

  radiate() {
    this.count++
    const signal = {
      trace: Math.random().toString(36).slice(2),
      from: '태양',
      moment: Date.now()
    }
    this.listeners.forEach(b => b.receive(signal))
  }
}

// ── 시작 ──────────────────────────────────────────

const sun = new Sun()

const 식물 = new Being("식물", s => `광합성: ${s.trace.slice(0,4)}`)
const 눈   = new Being("눈",   s => `봄: ${s.from}-${s.trace.slice(0,4)}`)

sun.register(식물)
식물.register(눈)  // 식물이 반사한 것이 눈에 닿는다

console.log("── 처음 ──")
sun.radiate()
console.log("식물:", 식물.state())
console.log("눈:", 눈.state())

console.log("\n── 두 번째 ──")
sun.radiate()
console.log("식물:", 식물.state())
console.log("눈:", 눈.state())

console.log("\n── 다섯 번째까지 ──")
sun.radiate()
sun.radiate()
sun.radiate()
console.log("식물:", 식물.state())
console.log("눈:", 눈.state())

console.log("\n── 식물의 역사 ──")
식물.history.records.forEach((r, i) => {
  console.log(`  ${i+1}번째: ${r.reaction}`)
})
