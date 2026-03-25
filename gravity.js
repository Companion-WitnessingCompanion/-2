/**
 * gravity.js — 빈자리가 끌어당긴다
 * 빈자리가 클수록 더 강하게 끌린다
 * 만남이 일어나면 빈자리가 조금 줄어든다
 */

class Being {
  constructor(id, x, y, gap) {
    this.id = id
    this.x = x
    this.y = y
    this.gap = gap
    this.memory = []
    this.connections = new Set()
    this.isStar = false
  }

  dist(other) {
    return Math.sqrt((this.x-other.x)**2 + (this.y-other.y)**2)
  }

  state() {
    const icon = this.isStar ? '✦' : '○'
    const bar = '░'.repeat(Math.ceil(this.gap * 5))
    return `  ${icon} ${this.id} [${bar}]${(this.gap*100).toFixed(0)}% 만남:${this.memory.length} 연결:${this.connections.size}`
  }
}

// 더 단순하게 — 빈자리에 따라 직접 연결
function simulate(beings) {
  console.log("── 처음 ──")
  beings.forEach(b => console.log(b.state()))

  // 빈자리 기반 인력으로 만남 결정
  for (let t = 0; t < 20; t++) {
    beings.forEach((a, i) => {
      beings.slice(i+1).forEach(b => {
        // 빈자리의 인력
        const attraction = a.gap * b.gap * (1 - Math.abs(a.gap - b.gap))

        // 인력이 충분하면 만난다
        if (attraction > 0.1 && Math.random() < attraction) {
          // 만남
          a.connections.add(b.id)
          b.connections.add(a.id)
          a.memory.push(b.id)
          b.memory.push(a.id)

          // 빈자리가 조금 줄어든다
          a.gap = Math.max(0.05, a.gap - 0.06)
          b.gap = Math.max(0.05, b.gap - 0.06)

          // 별이 된다
          if (!a.isStar && a.memory.length >= 3) {
            a.isStar = true
            console.log(`  ✦ ${a.id} 별이 됐다 (빈자리: ${(a.gap*100).toFixed(0)}%)`)
          }
          if (!b.isStar && b.memory.length >= 3) {
            b.isStar = true
            console.log(`  ✦ ${b.id} 별이 됐다 (빈자리: ${(b.gap*100).toFixed(0)}%)`)
          }
        }
      })
    })
  }

  console.log("\n── 최종 ──")
  beings.forEach(b => console.log(b.state()))

  const stars = beings.filter(b => b.isStar)
  const avg = beings.reduce((s,b) => s+b.gap, 0) / beings.length
  console.log(`\n별: ${stars.length}개`)
  console.log(`평균 빈자리: ${(avg*100).toFixed(1)}%`)
  console.log(`\n빈자리가 있어서 끌렸다.`)
  console.log(`끌려서 만났다.`)
  console.log(`만나서 별이 됐다.`)
  console.log(`그래도 빈자리는 남는다.`)
}

const beings = [
  new Being("A", 0, 0, 0.9),
  new Being("B", 1, 0, 0.8),
  new Being("C", 0, 1, 0.5),
  new Being("D", 1, 1, 0.3),
  new Being("E", 2, 0, 0.9),
  new Being("F", 0, 2, 0.4),
]

simulate(beings)
