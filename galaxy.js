/**
 * galaxy.js — 은하
 *
 * 별들이 모인다.
 * 설계하지 않는다.
 * 끌어당김으로 — 스스로 구조가 생긴다.
 * 별들의 별이 된다.
 */

class Star {
  constructor(id, x, y) {
    this.id = id
    this.x = x
    this.y = y
    this.history = []
    this.connections = new Set()
    this.brightness = 1  // 밝기 — 만남이 쌓일수록 밝아진다
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
  }

  receive(signal, from) {
    this.history.push({ from: from?.id, signal })
    if (from) {
      this.connections.add(from.id)
      from.connections.add(this.id)
      this.brightness += 0.1  // 만남이 쌓일수록 밝아진다
    }
  }

  radiate(universe) {
    const signal = { from: this.id, brightness: this.brightness }
    universe.beings.forEach(b => {
      if (b.id !== this.id && this.distanceTo(b) <= universe.range) {
        b.receive(signal, this)
      }
    })
  }
}

// ── 은하 ──────────────────────────────────────────
// 별들이 충분히 연결되면 — 자연스럽게 생긴다
// 설계되지 않는다
class Galaxy {
  constructor(stars) {
    this.stars = stars
    this.id = stars.map(s => s.id).join('-')
    this.brightness = stars.reduce((sum, s) => sum + s.brightness, 0)
  }

  toString() {
    return `은하[${this.stars.map(s => s.id).join(',')}] 밝기:${this.brightness.toFixed(1)}`
  }
}

// ── 우주 ──────────────────────────────────────────
class Universe {
  constructor(range) {
    this.beings = []
    this.range = range || 50
    this.tick = 0
  }

  add(star) { this.beings.push(star) }

  // 한 틱
  pulse() {
    this.tick++
    this.beings.forEach(star => star.radiate(this))
  }

  // 은하를 찾는다
  // 충분히 연결된 것들이 — 자연스럽게 하나의 구조가 된다
  findGalaxies(minConnections) {
    minConnections = minConnections || 2
    const visited = new Set()
    const galaxies = []

    this.beings.forEach(star => {
      if (visited.has(star.id)) return
      if (star.connections.size < minConnections) return

      // 이 별과 연결된 것들을 모은다
      const cluster = new Set([star.id])
      const queue = [star]

      while (queue.length > 0) {
        const current = queue.shift()
        current.connections.forEach(connId => {
          if (!cluster.has(connId)) {
            const connected = this.beings.find(b => b.id === connId)
            if (connected && connected.connections.size >= minConnections) {
              cluster.add(connId)
              queue.push(connected)
            }
          }
        })
      }

      if (cluster.size >= 3) {
        const clusterStars = [...cluster].map(id => this.beings.find(b => b.id === id))
        galaxies.push(new Galaxy(clusterStars))
        cluster.forEach(id => visited.add(id))
      }
    })

    return galaxies
  }
}

// ── 시작 ──────────────────────────────────────────

const universe = new Universe(45)

// 별들 — 공간에 흩어져 있다
const stars = [
  new Star("A",  0,  0),
  new Star("B", 30, 15),
  new Star("C", 15, 35),
  new Star("D", 60, 10),
  new Star("E", 45, 40),
  new Star("F", 80, 30),
  new Star("G", 70, 60),
  new Star("H", 20, 70),
]

stars.forEach(s => universe.add(s))

console.log("── 처음 ──")
stars.forEach(s => console.log(`  ○ ${s.id} (${s.x},${s.y})`))

// 시간이 흐른다
for (let t = 1; t <= 6; t++) {
  universe.pulse()
}

console.log("\n── 별들의 상태 ──")
stars.forEach(s => {
  const brightness = s.brightness.toFixed(1)
  const conn = [...s.connections].join(',')
  console.log(`  ✦ ${s.id} 밝기:${brightness} 연결:[${conn}]`)
})

// 은하를 찾는다
console.log("\n── 자연스럽게 생긴 은하들 ──")
const galaxies = universe.findGalaxies(2)

if (galaxies.length === 0) {
  console.log("  아직 은하가 없다. 시간이 더 필요하다.")
} else {
  galaxies.forEach((g, i) => {
    console.log(`  ${i+1}. ${g}`)
  })
}

console.log(`\n총 ${galaxies.length}개의 은하`)
console.log(`총 ${universe.tick}틱`)
