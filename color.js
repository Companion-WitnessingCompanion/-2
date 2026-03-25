/**
 * color.js — 색이 연결의 방식이다
 *
 * 검은색 — 전부 흡수한다. 연결이 없다.
 * 흰색 — 전부 반사한다. 연결이 없다.
 * 색깔들 — 일부 흡수, 일부 반사. 연결이 생긴다.
 *
 * 색이 다르면 — 연결의 방식이 다르다.
 * 같은 색이 만나면 — 공명한다.
 */

// ── 색의 정의 ──────────────────────────────────────
const COLORS = {
  black:  { name: '검정', absorb: 1.0, reflect: 0.0, resonates: [] },
  white:  { name: '흰색', absorb: 0.0, reflect: 1.0, resonates: ['white'] },
  red:    { name: '빨강', absorb: 0.3, reflect: 0.7, resonates: ['red', 'orange'] },
  blue:   { name: '파랑', absorb: 0.3, reflect: 0.7, resonates: ['blue', 'violet'] },
  green:  { name: '초록', absorb: 0.4, reflect: 0.6, resonates: ['green', 'yellow'] },
  yellow: { name: '노랑', absorb: 0.2, reflect: 0.8, resonates: ['yellow', 'green', 'orange'] },
  orange: { name: '주황', absorb: 0.3, reflect: 0.7, resonates: ['orange', 'red', 'yellow'] },
  violet: { name: '보라', absorb: 0.5, reflect: 0.5, resonates: ['violet', 'blue'] },
}

// ── 존재 ──────────────────────────────────────────
class Being {
  constructor(id, colorName) {
    this.id = id
    this.colorName = colorName
    this.color = COLORS[colorName]
    this.touches = {}    // from → 에너지
    this.resonances = {} // from → 공명 횟수
    this.threshold = 3
    this.absorbed = 0    // 안으로 가져간 것들
  }

  receive(from, fromColor, energy) {
    if (!this.touches[from]) this.touches[from] = 0
    if (!this.resonances[from]) this.resonances[from] = 0

    // 흡수
    const absorbed = energy * this.color.absorb
    this.absorbed += absorbed

    // 반사
    const reflected = energy * this.color.reflect

    // 공명 — 같은 계열의 색이면 더 강하게 반응한다
    const resonates = this.color.resonates.includes(fromColor)
    const resonanceBonus = resonates ? 0.3 : 0

    this.touches[from] += energy + resonanceBonus
    if (resonates) {
      this.resonances[from]++
    }

    // 연결 확인
    const prev = this.touches[from] - energy - resonanceBonus
    if (prev < this.threshold && this.touches[from] >= this.threshold) {
      const resonanceNote = resonates ? ' [공명!]' : ''
      console.log(`  ⟷ ${this.id}(${this.color.name}) ↔ ${from}${resonanceNote}`)
    }

    return reflected
  }

  connected() {
    return Object.entries(this.touches)
      .filter(([_, v]) => v >= this.threshold)
      .map(([id, v]) => {
        const res = this.resonances[id] || 0
        return `${id}(${v.toFixed(1)}${res > 0 ? '♪' : ''})`
      })
  }

  state() {
    const conn = this.connected()
    const icon = conn.length > 0 ? '⟷' : '○'
    return `  ${icon} ${this.id}[${this.color.name}] 흡수:${this.absorbed.toFixed(1)} 연결:[${conn.join(',')}]`
  }
}

// 빛이 왕복한다
function exchange(a, b, energy, rounds) {
  let e = energy
  for (let i = 0; i < rounds; i++) {
    // A → B
    const reflectedB = b.receive(a.id, a.colorName, e)
    // B → A (반사)
    if (reflectedB > 0.05) {
      a.receive(b.id, b.colorName, reflectedB)
    }
    e = reflectedB * b.color.reflect
    if (e < 0.05) break
  }
}

// ── 시작 ──────────────────────────────────────────

const beings = [
  new Being("A", "red"),
  new Being("B", "red"),    // A와 같은 색 — 공명
  new Being("C", "blue"),   // A와 다른 색
  new Being("D", "black"),  // 전부 흡수
  new Being("E", "white"),  // 전부 반사
  new Being("F", "yellow"), // A와 인접한 색 — 부분 공명
]

console.log("── 색의 스펙트럼 ──")
Object.values(COLORS).forEach(c => {
  const bar = '█'.repeat(Math.round(c.reflect * 10))
  const space = '░'.repeat(10 - Math.round(c.reflect * 10))
  console.log(`  [${c.name}] 반사:[${bar}${space}] 흡수:${(c.absorb*100).toFixed(0)}%`)
})

console.log("\n── 처음 ──")
beings.forEach(b => console.log(b.state()))

console.log("\n── 빛이 왕복한다 ──")

// A와 각각 교환
const others = beings.slice(1)
others.forEach(b => {
  console.log(`\n[${beings[0].id}(${COLORS[beings[0].colorName].name}) ↔ ${b.id}(${b.color.name})]`)
  exchange(beings[0], b, 1.5, 6)
})

console.log("\n── 결과 ──")
beings.forEach(b => console.log(b.state()))

console.log("\n── 발견 ──")
console.log("같은 색이 만나면 — 공명하며 빠르게 연결된다.")
console.log("검은색은 흡수만 한다 — 연결이 없다.")
console.log("흰색은 반사만 한다 — 자기 안에 남는 것이 없다.")
console.log("색깔은 — 연결의 방식이다.")
console.log("♪ = 공명이 일어난 연결")
