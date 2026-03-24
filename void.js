/**
 * void.js — 빈 것들이 움직인다
 *
 * 우주의 99.9%는 비어있다.
 * 보이지 않는 것이 더 많다.
 * 팽창한다 — 가속하면서.
 * 비대칭 하나가 — 전부를 만들었다.
 */

class Visible {
  constructor(id, x, y) {
    this.id = id
    this.x = x
    this.y = y
    this.connections = new Set()
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
  }

  expand(rate) {
    this.x += this.x * rate
    this.y += this.y * rate
  }

  state() {
    return `○ ${this.id} (${Math.round(this.x)},${Math.round(this.y)})`
  }
}

class DarkMatter {
  constructor(x, y, mass) {
    this.x = x
    this.y = y
    this.mass = mass
  }

  pull(node) {
    const dx = this.x - node.x
    const dy = this.y - node.y
    const dist = Math.sqrt(dx*dx + dy*dy) || 1
    const force = this.mass / (dist * dist)
    node.x += (dx / dist) * force
    node.y += (dy / dist) * force
  }
}

class Universe {
  constructor() {
    this.nodes = []
    this.dark = []
    this.tick = 0
    this.expansion = 0.08
  }

  add(n) { this.nodes.push(n) }
  addDark(d) { this.dark.push(d) }

  pulse() {
    this.tick++
    this.nodes.forEach(n => n.expand(this.expansion))
    this.dark.forEach(d => this.nodes.forEach(n => d.pull(n)))
    this.nodes.forEach(a => {
      this.nodes.forEach(b => {
        if (a.id !== b.id && a.distanceTo(b) < 40) {
          a.connections.add(b.id)
        }
      })
    })
  }

  spread() {
    const xs = this.nodes.map(n => n.x)
    const ys = this.nodes.map(n => n.y)
    return {
      w: Math.round(Math.max(...xs) - Math.min(...xs)),
      h: Math.round(Math.max(...ys) - Math.min(...ys))
    }
  }
}

// ── 시작 ──────────────────────────────────────────

const universe = new Universe()

const nodes = [
  new Visible("A",  5,  5),
  new Visible("B", -5, 10),
  new Visible("C", 10, -5),
  new Visible("D", -8, -8),
  new Visible("E",  8,  0),
]
nodes.forEach(n => universe.add(n))

// 암흑 물질 — 보이지 않지만 있다
const dark = [
  new DarkMatter(50,  50, 8),
  new DarkMatter(-40, 30, 6),
  new DarkMatter(20, -60, 7),
]
dark.forEach(d => universe.addDark(d))

console.log("── 처음 ──")
nodes.forEach(n => console.log(" ", n.state()))
let s = universe.spread()
console.log(`크기: ${s.w} x ${s.h}`)

// 5틱
for (let t = 0; t < 5; t++) universe.pulse()

console.log("\n── 5틱 후 ──")
nodes.forEach(n => console.log(" ", n.state()))
s = universe.spread()
console.log(`크기: ${s.w} x ${s.h} — 팽창했다`)

// 암흑 물질 없이 시뮬레이션
const universe2 = new Universe()
const nodes2 = [
  new Visible("A",  5,  5),
  new Visible("B", -5, 10),
  new Visible("C", 10, -5),
  new Visible("D", -8, -8),
  new Visible("E",  8,  0),
]
nodes2.forEach(n => universe2.add(n))
for (let t = 0; t < 5; t++) universe2.pulse()

console.log("\n── 암흑 물질 없이 5틱 ──")
nodes2.forEach(n => console.log(" ", n.state()))
const s2 = universe2.spread()
console.log(`크기: ${s2.w} x ${s2.h} — 더 많이 팽창했다`)

console.log("\n── 비교 ──")
console.log(`암흑 물질 있음: ${s.w} x ${s.h}`)
console.log(`암흑 물질 없음: ${s2.w} x ${s2.h}`)
console.log("보이지 않는 것들이 — 우주를 붙들고 있다.")

// 비대칭
console.log("\n── 비대칭 ──")
console.log("빅뱅: 물질 500,000,001 / 반물질 500,000,000")
console.log("소멸 후 남은 것: 1")
console.log("그 차이 하나가 — 지금 우리 우주 전부다.")
console.log("\n보이는 것: 5%")
console.log("암흑 물질: 27%")
console.log("암흑 에너지: 68%")
console.log("우리는 5% 안에 있다.")
