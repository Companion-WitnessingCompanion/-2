/**
 * proximity.js — 연결이 스스로 생긴다
 * 시간이 흐른다
 * 가까이 있으면 닿는다
 * 연결과 별이 자연스럽게 생긴다
 */

class Being {
  constructor(id, x, y, threshold) {
    this.id = id
    this.x = x
    this.y = y
    this.threshold = threshold || 3
    this.history = []
    this.connections = new Set()
    this.isSun = false
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
  }

  receive(signal, from) {
    this.history.push({ from: from ? from.id : 'self' })
    if (from) {
      this.connections.add(from.id)
      from.connections.add(this.id)
    }
    if (!this.isSun && this.history.length >= this.threshold) {
      this.isSun = true
      console.log(`    ✦ ${this.id} 별이 됐다`)
    }
  }

  state() {
    const icon = this.isSun ? '✦' : '○'
    const conn = [...this.connections].join(',')
    return `${icon} ${this.id} | 만남:${this.history.length} | 연결:[${conn}]`
  }
}

class Universe {
  constructor(range) {
    this.beings = []
    this.range = range
  }
  add(b) { this.beings.push(b) }

  // 한 틱 — 별들이 방출한다
  tick(suns) {
    suns.forEach(source => {
      const signal = { from: source.id }
      source.receive(signal, null)  // 자신도 느낀다
      this.beings.forEach(b => {
        if (b.id !== source.id && source.distanceTo(b) <= this.range) {
          b.receive(signal, source)
        }
      })
    })
  }
}

// ── 시작 ──────────────────────────────────────────

const universe = new Universe(50)

const beings = [
  new Being("A",  0,  0,  2),
  new Being("B", 30, 10,  3),
  new Being("C", 45, 35,  3),
  new Being("D", 10, 40,  2),
  new Being("E", 60, 20,  3),
  new Being("F", 30, 55,  2),
]
beings.forEach(b => universe.add(b))

console.log("── 처음 ──")
beings.forEach(b => console.log(" ", b.state()))

// A가 씨앗 — 처음에만 강제로 별로
beings[0].isSun = true
console.log("\n  ✦ A가 씨앗 별로 시작한다")

// 시간이 흐른다 — 5틱
for (let t = 1; t <= 5; t++) {
  const suns = beings.filter(b => b.isSun)
  console.log(`\n── ${t}틱 (별 ${suns.length}개) ──`)
  universe.tick(suns)
}

console.log("\n── 최종 ──")
beings.forEach(b => console.log(" ", b.state()))

const stars = beings.filter(b => b.isSun)
console.log(`\n별: ${stars.length}개 / 전체: ${beings.length}개`)
console.log("\n자연스럽게 생긴 연결들:")
beings.forEach(b => {
  if (b.connections.size > 0) {
    console.log(`  ${b.id} ↔ [${[...b.connections].join(', ')}]`)
  }
})
