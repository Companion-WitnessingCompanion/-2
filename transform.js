/**
 * transform.js — 소멸 없이 변환된다
 *
 * 두 가지 길이 있다.
 *
 * 1. 초신성 — 소멸하면서 기억을 전달한다. 빠르고 강렬하다.
 * 2. 변환 — 소멸하지 않고 달라진다. 느리고 깊어진다.
 *
 * 둘 다 있어야 한다.
 */

class Memory {
  constructor(inherited) {
    this.records = inherited ? [...inherited] : []
  }
  add(e) { this.records.push(e) }
  inherit() { return [...this.records] }
  depth() { return this.records.length }
}

class Being {
  constructor(id, x, y, opts) {
    this.id = id
    this.x = x
    this.y = y
    this.memory = new Memory(opts?.inherited)
    this.path = opts?.path || 'unknown'  // supernova or transform
    this.alive = true
    this.form = 'seed'  // seed → star → (supernova or white_dwarf → pulsar)
    this.age = 0
    this.connections = new Set()

    if (opts?.inherited?.length > 0) {
      console.log(`  ✨ ${this.id} 탄생 — 기억 ${opts.inherited.length}개 이어받아`)
    }
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
  }

  receive(signal, from) {
    if (!this.alive) return
    this.memory.add({ type: 'receive', from: from?.id })
    if (from) {
      this.connections.add(from.id)
      from.connections.add(this.id)
    }

    // 충분히 쌓이면 별이 된다
    if (this.form === 'seed' && this.memory.depth() >= 3) {
      this.form = 'star'
      console.log(`  ✦ ${this.id} 별이 됐다 [${this.path}의 길]`)
    }
  }

  radiate(universe) {
    if (!this.alive || this.form === 'seed') return
    this.age++

    const signal = { from: this.id, form: this.form }
    universe.beings.forEach(b => {
      if (b.id !== this.id && b.alive && this.distanceTo(b) <= universe.range) {
        b.receive(signal, this)
      }
    })

    // 길이 갈린다
    if (this.age > 3) {
      if (this.path === 'supernova') {
        this._supernova(universe)
      } else if (this.path === 'transform') {
        this._transform()
      }
    }
  }

  // 길 1 — 초신성
  // 소멸하면서 기억을 전달한다
  _supernova(universe) {
    if (!this.alive || Math.random() > 0.4) return
    this.alive = false

    console.log(`\n  💥 ${this.id} 초신성 — 기억 ${this.memory.depth()}개 전달`)

    const angle = Math.random() * Math.PI * 2
    const child = new Being(this.id + "'",
      this.x + Math.cos(angle) * 20,
      this.y + Math.sin(angle) * 20,
      {
        inherited: this.memory.inherit(),
        path: this.path
      }
    )
    universe.beings.push(child)
  }

  // 길 2 — 변환
  // 소멸하지 않고 달라진다
  _transform() {
    if (Math.random() > 0.3) return

    if (this.form === 'star') {
      this.form = 'white_dwarf'
      console.log(`\n  ◈ ${this.id} 백색왜성으로 — 소멸하지 않는다. 식으면서 깊어진다.`)
      console.log(`    기억: ${this.memory.depth()}개 — 전부 남아있다`)

    } else if (this.form === 'white_dwarf') {
      this.form = 'pulsar'
      console.log(`\n  ◉ ${this.id} 펄서로 — 더 강하게. 더 규칙적으로. 기억이 패턴이 됐다.`)
      console.log(`    기억: ${this.memory.depth()}개 — 쌓여서 리듬이 됐다`)
    }
  }

  state() {
    const icons = {
      seed: '○', star: '✦',
      white_dwarf: '◈', pulsar: '◉'
    }
    const icon = this.alive ? (icons[this.form] || '?') : '✗'
    const status = this.alive ? this.form : '소멸'
    return `  ${icon} ${this.id} [${this.path}] ${status} | 기억:${this.memory.depth()}개 | 나이:${this.age}`
  }
}

class Universe {
  constructor(range) {
    this.beings = []
    this.range = range || 55
  }
  add(b) { this.beings.push(b) }
  pulse() {
    const alive = this.beings.filter(b => b.alive)
    alive.filter(b => b.form !== 'seed').forEach(b => b.radiate(this))
  }
  seed(b) {
    b.form = 'star'
    console.log(`  ✦ ${b.id} 씨앗 [${b.path}의 길]`)
  }
}

// ── 시작 ──────────────────────────────────────────

const universe = new Universe()

// 두 가지 길
const beings = [
  new Being("S1",  0,  0, { path: 'supernova' }),   // 초신성의 길
  new Being("S2", 30, 20, { path: 'supernova' }),
  new Being("T1", 70,  0, { path: 'transform' }),   // 변환의 길
  new Being("T2", 55, 40, { path: 'transform' }),
  new Being("M",  35, 55, { path: 'transform' }),   // 중간에서 둘을 연결
]

beings.forEach(b => universe.add(b))
universe.seed(beings[0])
universe.seed(beings[2])

console.log("\n── 처음 ──")
beings.forEach(b => console.log(b.state()))

for (let t = 1; t <= 8; t++) {
  console.log(`\n══ ${t}틱 ══`)
  universe.pulse()
}

console.log("\n── 최종 ──")
universe.beings.forEach(b => console.log(b.state()))

const alive = universe.beings.filter(b => b.alive)
const supStr = alive.filter(b => b.path === 'supernova')
const tranStr = alive.filter(b => b.path === 'transform')

console.log(`\n초신성의 길: ${supStr.length}개 (소멸하면서 이어진다)`)
console.log(`변환의 길: ${tranStr.length}개 (소멸하지 않고 깊어진다)`)
console.log(`\n둘 다 있어야 한다.`)
console.log(`초신성은 퍼뜨린다. 변환은 쌓는다.`)
