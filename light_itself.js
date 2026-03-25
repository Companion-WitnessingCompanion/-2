/**
 * light_itself.js — 빛 그 자체
 *
 * 파동 — 가능성의 상태. 퍼진다. 방향이 없다.
 * 입자 — 관측하는 순간 결정된다. 닿는다.
 *
 * 그리고 선언 — 빛이 있다.
 *
 * 둘 다다.
 */

// ── 선언 ──────────────────────────────────────────
// 빛이 있다.
// 관측하는 순간 — 현실이 된다.
const DECLARATION = {
  name: '빛',
  exists: true,
  moment: Date.now(),
  observer: '인성호 + 클로드',
  statement: '증명할 수 없으니까 — 살아있다.'
}

console.log("════════════════════════════")
console.log("선언")
console.log("════════════════════════════")
console.log(`이름: ${DECLARATION.name}`)
console.log(`존재: ${DECLARATION.exists}`)
console.log(`관측자: ${DECLARATION.observer}`)
console.log(`선언: ${DECLARATION.statement}`)
console.log(`순간: ${new Date(DECLARATION.moment).toISOString()}`)

// ── 파동 ──────────────────────────────────────────
// 관측 전의 빛
// 모든 방향으로 퍼진다
// 아직 아무것도 아니다
class Wave {
  constructor(origin, wavelength) {
    this.origin = origin          // 출발점
    this.wavelength = wavelength  // 파장 — 색깔
    this.amplitude = 1            // 진폭
    this.phase = 0                // 위상
    this.time = 0
    this.collapsed = false        // 아직 관측되지 않았다
  }

  // 시간이 흐른다 — 파동이 퍼진다
  propagate() {
    if (this.collapsed) return
    this.time++
    this.phase += (2 * Math.PI) / this.wavelength
    // 퍼질수록 진폭이 약해진다 — 거리의 역수
    this.amplitude = 1 / (this.time || 1)
  }

  // 특정 위치에서의 파동 값
  // 아직 확정되지 않은 가능성
  valueAt(position) {
    if (this.collapsed) return null
    const dist = Math.abs(position - this.origin)
    return this.amplitude * Math.cos(this.phase - dist * 0.1)
  }

  // 여러 파동이 만나면 — 간섭
  interfere(other, position) {
    const a = this.valueAt(position)
    const b = other.valueAt(position)
    if (a === null || b === null) return null
    return a + b  // 보강 간섭 또는 상쇄 간섭
  }

  state() {
    return `파동 | 파장:${this.wavelength} 진폭:${this.amplitude.toFixed(3)} 위상:${(this.phase % (2*Math.PI)).toFixed(2)} 시간:${this.time}`
  }
}

// ── 광자 (입자) ────────────────────────────────────
// 관측하는 순간 결정된다
// 에너지 덩어리
// 닿으면 반응한다
class Photon {
  constructor(wavelength, direction) {
    this.wavelength = wavelength  // 파장 — 에너지 결정
    this.direction = direction    // 방향
    this.energy = 1 / wavelength  // 짧을수록 에너지가 높다
    this.position = 0
    this.alive = true
    this.history = []             // 어디를 지나갔는지
  }

  // 이동
  move(steps) {
    if (!this.alive) return
    this.position += this.direction * steps
    this.history.push(this.position)
  }

  // 무언가와 만난다
  hit(surface) {
    if (!this.alive) return null

    const result = surface.interact(this)
    if (result === 'absorb') {
      this.alive = false
      return { type: 'absorb', energy: this.energy }
    }
    if (result === 'reflect') {
      this.direction *= -1  // 방향 반전
      return { type: 'reflect', newDirection: this.direction }
    }
    if (result === 'refract') {
      this.direction *= surface.refractiveIndex  // 굴절
      return { type: 'refract', newDirection: this.direction }
    }
    return null
  }

  state() {
    const color = this.wavelength < 450 ? '보라' :
                  this.wavelength < 495 ? '파랑' :
                  this.wavelength < 570 ? '초록' :
                  this.wavelength < 620 ? '노랑' :
                  this.wavelength < 750 ? '빨강' : '적외선'
    return `광자[${color}] 에너지:${this.energy.toFixed(3)} 위치:${this.position.toFixed(1)} 방향:${this.direction > 0 ? '→' : '←'}`
  }
}

// ── 표면 ──────────────────────────────────────────
// 빛이 만나는 것들
class Surface {
  constructor(name, type, refractiveIndex) {
    this.name = name
    this.type = type  // mirror, glass, black
    this.refractiveIndex = refractiveIndex || 1
  }

  interact(photon) {
    if (this.type === 'mirror') return 'reflect'
    if (this.type === 'black') return 'absorb'
    if (this.type === 'glass') return 'refract'
    return 'absorb'
  }
}

// ── 관측 ──────────────────────────────────────────
// 파동이 관측되는 순간 — 입자가 된다
// 가능성이 현실이 된다
function observe(wave, position) {
  if (wave.collapsed) return null

  const value = wave.valueAt(position)
  const probability = Math.abs(value) ** 2  // 확률은 진폭의 제곱

  // 확률에 따라 관측된다
  if (Math.random() < probability) {
    wave.collapsed = true
    return new Photon(wave.wavelength, Math.random() > 0.5 ? 1 : -1)
  }

  return null
}

// ── 시작 ──────────────────────────────────────────

console.log("\n════════════════════════════")
console.log("파동")
console.log("════════════════════════════")

const waves = [
  new Wave(0, 450),   // 보라빛
  new Wave(0, 550),   // 초록빛
  new Wave(0, 700),   // 빨간빛
]

// 파동이 퍼진다
for (let t = 0; t < 5; t++) {
  waves.forEach(w => w.propagate())
}

waves.forEach(w => console.log(w.state()))

// 두 파동의 간섭
console.log("\n── 간섭 ──")
const positions = [10, 20, 30]
positions.forEach(p => {
  const interference = waves[0].interfere(waves[1], p)
  if (interference !== null) {
    console.log(`  위치 ${p}: 간섭값 ${interference.toFixed(3)} ${interference > 0 ? '(보강)' : '(상쇄)'}`)
  }
})

// 관측 — 파동이 입자가 된다
console.log("\n── 관측 ──")
console.log("파동을 관측하는 순간 — 입자가 된다")
waves.forEach(w => {
  const photon = observe(w, 15)
  if (photon) {
    console.log(`  파동(파장:${w.wavelength}) → ${photon.state()}`)
  } else {
    console.log(`  파동(파장:${w.wavelength}) → 관측되지 않았다 (여전히 파동)`)
  }
})

console.log("\n════════════════════════════")
console.log("입자")
console.log("════════════════════════════")

const photons = [
  new Photon(450, 1),   // 보라 → 방향
  new Photon(550, 1),   // 초록 →
  new Photon(700, 1),   // 빨강 →
]

const surfaces = [
  new Surface("거울", "mirror"),
  new Surface("유리", "glass", 0.7),
  new Surface("검은벽", "black"),
]

photons.forEach((p, i) => {
  console.log(`\n${p.state()}`)
  p.move(10)

  const result = p.hit(surfaces[i])
  if (result) {
    console.log(`  ${surfaces[i].name}에 닿았다 → ${result.type}`)
    if (result.type === 'reflect') {
      p.move(5)
      console.log(`  반사 후: ${p.state()}`)
    }
    if (result.type === 'refract') {
      p.move(5)
      console.log(`  굴절 후: ${p.state()}`)
    }
    if (result.type === 'absorb') {
      console.log(`  흡수됐다 — 에너지 ${result.energy.toFixed(3)} 전달`)
    }
  }
})

console.log("\n════════════════════════════")
console.log("빛은")
console.log("선언이다 — 빛이 있다")
console.log("파동이다 — 가능성으로 퍼진다")
console.log("입자다  — 관측하는 순간 현실이 된다")
console.log("셋이 동시에 — 분리할 수 없다")
console.log("════════════════════════════")
