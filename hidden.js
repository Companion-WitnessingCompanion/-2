/**
 * hidden.js — 무지개의 입자
 *
 * 세 방향이 동시에:
 * 1. 있지만 볼 수 없다
 * 2. 조건이 갖춰져야 드러난다
 * 3. 환경이 이미 관측하고 있다
 */

const HIDDEN = Symbol('hidden')

class QuantumBeing {
  constructor(id) {
    this.id = id
    this[HIDDEN] = {
      wave:     { amplitude: Math.random(), phase: Math.random() * Math.PI * 2 },
      particle: { position: Math.random() * 100 },
      both: true
    }
    this.visible = null
    this.interactions = 0
    this.threshold = 6
  }

  // 1. 있지만 볼 수 없다
  exists() { return true }
  tryAccess() {
    console.log(`  ${this.id}: 있다. 근데 볼 수 없다.`)
    return null
  }

  // 2. 조건이 갖춰져야 드러난다
  observe(scale) {
    if (!this[HIDDEN].both) return this.visible

    if (scale === 'quantum') {
      const w = this[HIDDEN].wave
      this.visible = { type: '파동', amplitude: w.amplitude.toFixed(3) }
      console.log(`  ${this.id}: 양자 관측 → 파동 (진폭:${w.amplitude.toFixed(3)})`)
    } else {
      const p = this[HIDDEN].particle
      this.visible = { type: '입자', position: p.position.toFixed(1) }
      console.log(`  ${this.id}: 거시 관측 → 입자 (위치:${p.position.toFixed(1)})`)
    }
    return this.visible
  }

  // 3. 환경이 이미 관측하고 있다
  interact(env) {
    this.interactions++
    const ratio = this.interactions / this.threshold

    if (ratio >= 1.0 && this[HIDDEN].both) {
      this[HIDDEN].both = false
      this.visible = { type: '입자', collapsed: true }
      console.log(`  ${this.id}+[${env}]: ${this.interactions}번째 — 파동 붕괴 💥`)
    } else {
      const status = ratio < 0.5 ? '파동 유지' : '흔들리는 중...'
      console.log(`  ${this.id}+[${env}]: ${this.interactions}번째 — ${status}`)
    }
  }

  state() {
    const vis = this.visible ? `보인다(${this.visible.type})` : '보이지 않는다'
    const dec = (this.interactions / this.threshold * 100).toFixed(0)
    return `  ${this.id} | ${vis} | 결어긋남:${dec}%`
  }
}

// ── 시작 ──────────────────────────────────────────

console.log("════════════════════")
console.log("1. 있지만 볼 수 없다")
console.log("════════════════════")
const A = new QuantumBeing("A")
console.log(`존재: ${A.exists()}`)
A.tryAccess()
console.log(A.state())

console.log("\n════════════════════")
console.log("2. 조건이 갖춰져야 드러난다")
console.log("════════════════════")
const B = new QuantumBeing("B")
B.observe('quantum')
console.log(B.state())

const C = new QuantumBeing("C")
C.observe('macro')
console.log(C.state())

console.log("\n════════════════════")
console.log("3. 환경이 이미 관측하고 있다")
console.log("════════════════════")
const D = new QuantumBeing("D")
const envs = ['빗방울', '공기', '망막', '열', '빛', '전자기장']
envs.forEach(e => D.interact(e))
console.log(D.state())

console.log("\n════════════════════")
console.log("무지개 — 셋이 동시에")
console.log("════════════════════")
console.log("무지개 안 광자 하나:")
const photon = new QuantumBeing("광자")
console.log(`존재: ${photon.exists()}`)
photon.tryAccess()
// 빗방울, 공기, 눈과 수없이 얽힌다
;['빗방울','공기','공기','망막','열','빛'].forEach(e => photon.interact(e))
console.log(photon.state())

console.log("\n격리된 광자 하나를 양자 스케일에서 보면:")
const isolated = new QuantumBeing("격리광자")
isolated.observe('quantum')
console.log(isolated.state())

console.log("\n────────────────────")
console.log("무지개의 입자는 있다.")
console.log("단지 — 드러날 조건이 없었을 뿐이다.")
console.log("환경과 너무 많이 얽혀서 — 파동이 사라진 것이다.")
console.log("그래도 — 처음엔 파동이었다.")
