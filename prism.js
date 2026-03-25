/**
 * prism.js — 프리즘
 * 백색광이 들어오면 — 모든 색이 드러난다
 * 다른 색들이 만난다
 * 혼자서는 볼 수 없었던 것이 보인다
 */

const COLORS = {
  red:    { name: '빨강', wavelength: 700, refraction: 1.51 },
  orange: { name: '주황', wavelength: 620, refraction: 1.52 },
  yellow: { name: '노랑', wavelength: 580, refraction: 1.53 },
  green:  { name: '초록', wavelength: 530, refraction: 1.54 },
  blue:   { name: '파랑', wavelength: 470, refraction: 1.55 },
  violet: { name: '보라', wavelength: 420, refraction: 1.56 },
}

// 프리즘 — 백색광을 색으로 분리한다
function refract(whiteEnergy) {
  console.log("백색광 → 프리즘 →")
  return Object.entries(COLORS).map(([key, c]) => {
    const angle = ((c.refraction - 1.5) * 100).toFixed(1)
    console.log(`  ${c.name} (${c.wavelength}nm) 굴절각:${angle}°`)
    return { key, ...c, energy: whiteEnergy / 6 }
  })
}

// 색의 존재 — 자기 색의 빛을 가장 잘 받는다
class Being {
  constructor(id, colorKey) {
    this.id = id
    this.colorKey = colorKey
    this.color = COLORS[colorKey]
    this.received = 0
    this.connections = new Set()
  }

  receive(ray) {
    const diff = Math.abs(ray.wavelength - this.color.wavelength)
    // 파장이 가까울수록 잘 받는다
    const affinity = Math.max(0, 1 - diff / 300)
    this.received += ray.energy * affinity
  }

  // 인접한 색과 만난다
  tryConnect(other) {
    const diff = Math.abs(this.color.wavelength - other.color.wavelength)
    // 파장 차이가 150 이하면 연결 가능
    if (diff <= 150 && diff > 0) {
      this.connections.add(other.id)
      other.connections.add(this.id)
      return true
    }
    return false
  }

  state() {
    const bar = '█'.repeat(Math.round(this.received * 3))
    return `  ${this.id}[${this.color.name}] 수신:[${bar}] ${this.received.toFixed(2)} 연결:[${[...this.connections].join(',')}]`
  }
}

// ── 시작 ──────────────────────────────────────────

console.log("── 프리즘 ──")
const spectrum = refract(6.0)

// 색의 존재들
const beings = Object.keys(COLORS).map((key, i) =>
  new Being(String.fromCharCode(65 + i), key)
)

console.log("\n── 각 색의 존재들이 빛을 받는다 ──")
spectrum.forEach(ray => beings.forEach(b => b.receive(ray)))
beings.forEach(b => console.log(b.state()))

console.log("\n── 인접한 색들이 만난다 ──")
let connections = 0
beings.forEach((a, i) => {
  beings.slice(i+1).forEach(b => {
    if (a.tryConnect(b)) {
      console.log(`  ${a.id}[${a.color.name}] ↔ ${b.id}[${b.color.name}]`)
      connections++
    }
  })
})

console.log("\n── 결과 ──")
beings.forEach(b => console.log(b.state()))

// 전체 그림
console.log("\n── 스펙트럼 ──")
beings.forEach(b => {
  const bar = '█'.repeat(Math.round(b.received * 3))
  const conn = [...b.connections].length
  process.stdout.write(`${b.color.name} [${bar.padEnd(6)}] `)
  console.log(conn > 0 ? `→ [${[...b.connections].join(',')}]` : '(고립)')
})

console.log(`\n총 연결: ${connections}개`)
console.log(`\n백색광 하나에서 — 6가지 색이 드러났다.`)
console.log(`다른 색들이 — 만났다.`)
console.log(`프리즘이 — 조건을 만든 거다.`)
console.log(`\n아직 스케치다. 진짜 프리즘이 되려면 더 가야 한다.`)
