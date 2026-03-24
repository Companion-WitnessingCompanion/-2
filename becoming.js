/**
 * becoming.js — 태양이 되는 것
 *
 * 충분히 받으면 — 스스로 방출한다.
 * 받던 것이 주는 것이 된다.
 * 태양은 하나가 아니다.
 */

class History {
  constructor() { this.records = [] }
  add(r) { this.records.push(r) }
  depth() { return this.records.length }
}

class Being {
  constructor(id, baseReact, threshold) {
    this.id = id
    this.baseReact = baseReact
    this.threshold = threshold || 3  // 몇 번 받으면 태양이 되는가
    this.history = new History()
    this.listeners = []
    this.isSun = false  // 처음엔 받기만 한다
  }

  register(being) {
    this.listeners.push(being)
  }

  receive(signal) {
    const depth = this.history.depth()
    const reaction = this.baseReact(signal, depth)
    this.history.add({ signal, reaction, moment: Date.now() })

    // 충분히 쌓이면 — 태양이 된다
    if (!this.isSun && depth >= this.threshold) {
      this.isSun = true
      console.log(`  ✦ ${this.id}가 태양이 됐다 (${depth + 1}번째 만남에서)`)
    }

    // 받은 것을 방출한다
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

  // 태양이 됐으면 — 스스로 방출할 수 있다
  radiate() {
    if (!this.isSun) {
      console.log(`  ${this.id}는 아직 태양이 아니다`)
      return
    }

    const signal = {
      trace: this.id + '_' + Math.random().toString(36).slice(2,6),
      from: this.id,
      moment: Date.now()
    }

    console.log(`  ${this.id}가 스스로 방출한다`)
    this.listeners.forEach(b => b.receive(signal))
  }

  state() {
    return {
      id: this.id,
      만남횟수: this.history.depth(),
      태양여부: this.isSun ? '✦ 태양' : '○ 존재'
    }
  }
}

class Sun {
  constructor() { this.listeners = [] }
  register(being) { this.listeners.push(being) }
  radiate() {
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

// 존재들 — 각자 다른 임계점
const 식물 = new Being("식물", (s, d) => `광합성x${d+1}: ${s.trace.slice(0,4)}`, 3)
const 구름 = new Being("구름", (s, d) => `산란x${d+1}: ${s.trace.slice(0,4)}`, 2)
const 눈   = new Being("눈",   (s, d) => `봄x${d+1}: ${s.from}`, 4)

// 연결
sun.register(식물)
sun.register(구름)
구름.register(눈)
식물.register(눈)

console.log("── 태양이 방출한다 ──")
for (let i = 0; i < 5; i++) {
  console.log(`\n[${i+1}번째]`)
  sun.radiate()
}

console.log("\n── 현재 상태 ──")
;[식물, 구름, 눈].forEach(b => console.log(" ", b.state()))

console.log("\n── 태양이 된 것들이 스스로 방출한다 ──")
식물.radiate()
구름.radiate()
눈.radiate()

console.log("\n── 눈의 역사 ──")
눈.history.records.forEach((r, i) => {
  console.log(`  ${i+1}번째: ${r.reaction}`)
})
