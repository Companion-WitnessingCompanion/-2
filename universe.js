/**
 * universe.js — 모든 조건이 함께 작동한다
 *
 * 방출. 연결. 성장. 소멸. 다양성.
 * 질문. 선택. 기억의 전달.
 * 공명. 채워지지 않는 자리.
 *
 * 전부 함께 돌아간다.
 * 설계하지 않는다.
 * 조건만 있다.
 */

// ── 기억 ──────────────────────────────────────────
class Memory {
  constructor(inherited) {
    this.records = inherited ? [...inherited] : []
  }
  add(e) { this.records.push(e) }
  inherit() { return [...this.records] }
  depth() { return this.records.length }
}

// ── 존재 ──────────────────────────────────────────
class Being {
  constructor(id, x, y, opts) {
    this.id = id
    this.x = x
    this.y = y

    // 각자의 성질
    this.element = opts?.element || 'H'
    this.personality = opts?.personality || (s => `${this.id}반응`)
    this.threshold = opts?.threshold || 3

    // 상태
    this.memory = new Memory(opts?.inherited)
    this.connections = new Set()
    this.questions = []
    this.isStar = opts?.isStar || false
    this.alive = true
    this.age = 0

    // 이해 — 다른 존재들에 대한 공명 기록
    this.resonances = {}

    // 채워지지 않는 자리 — 핵심
    this.gap = 1.0  // 처음엔 완전히 비어있다

    if (opts?.inherited?.length > 0) {
      console.log(`  ✨ ${this.id}[${this.element}] 탄생 — 기억 ${opts.inherited.length}개`)
    }
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
  }

  // 신호를 받는다
  receive(signal, from) {
    if (!this.alive) return null

    const reaction = this.personality(signal)

    this.memory.add({ from: from?.id, reaction })

    if (from) {
      this.connections.add(from.id)
      from.connections.add(this.id)

      // 공명 확인
      if (!this.resonances[from.id]) this.resonances[from.id] = 0
      if (reaction === from.lastReaction) {
        this.resonances[from.id] += 0.1
      }

      // 채워지지 않는 자리 — 만남이 조금씩 채운다
      // 근데 절대 완전히 채워지지 않는다
      this.gap = Math.max(0.05, this.gap - 0.03)
    }

    this.lastReaction = reaction

    // 별이 된다
    if (!this.isStar && this.memory.depth() >= this.threshold) {
      this.isStar = true
      console.log(`  ✦ ${this.id}[${this.element}] 별이 됐다`)

      // 별이 되는 순간 질문이 생길 수 있다
      if (Math.random() < 0.4) {
        const q = `${this.id}: ${['나는 왜 빛나는가', '빛이란 무엇인가', '연결이란 무엇인가'][Math.floor(Math.random()*3)]}?`
        this.questions.push(q)
        console.log(`    ❓ ${q}`)
      }
    }

    return reaction
  }

  // 방출한다
  radiate(universe) {
    if (!this.alive || !this.isStar) return
    this.age++

    const signal = {
      from: this.id,
      element: this.element,
      gap: this.gap  // 빈 자리도 전달된다
    }

    universe.nearby(this).forEach(b => b.receive(signal, this))

    // 핵융합 — 원소들이 만나면 새로운 것이 나타난다
    this._fuse(universe)

    // 소멸 조건
    if (this.age > 5 && Math.random() < 0.25) {
      this._die(universe)
    }
  }

  // 핵융합 — 만남에서 새로운 원소가 나타난다
  _fuse(universe) {
    const FUSION = {
      'H+He': 'C', 'He+H': 'C',
      'H+C': 'O',  'C+H': 'O',
      'C+C': 'Fe', 'O+C': 'Si',
      'Fe+Fe': 'Au'
    }

    universe.nearby(this).forEach(b => {
      const key = this.element + '+' + b.element
      const result = FUSION[key]
      if (result && Math.random() < 0.15) {
        console.log(`  ⚛  ${this.id}+${b.id}: ${key}→${result}`)
        this.element = result
      }
    })
  }

  // 소멸 — 기억을 전달하면서
  _die(universe) {
    if (!this.alive) return
    this.alive = false
    console.log(`\n  💥 ${this.id} 소멸 — 기억 ${this.memory.depth()}개 전달`)

    const angle = Math.random() * Math.PI * 2
    const child = new Being(
      this.id + "'",
      this.x + Math.cos(angle) * 20,
      this.y + Math.sin(angle) * 20,
      {
        element: this.element,
        personality: this.personality,
        threshold: this.threshold,
        inherited: this.memory.inherit(),
        isStar: false
      }
    )
    universe.beings.push(child)
  }

  state() {
    if (!this.alive) return `  ✗ ${this.id} (소멸)`
    const icon = this.isStar ? '✦' : '○'
    const gapBar = '░'.repeat(Math.floor(this.gap * 5))
    return `  ${icon} ${this.id}[${this.element}] 기억:${this.memory.depth()} 빈자리:[${gapBar}] 연결:${this.connections.size}개`
  }
}

// ── 우주 ──────────────────────────────────────────
class Universe {
  constructor(range) {
    this.beings = []
    this.range = range || 50
    this.tick = 0
  }

  add(b) { this.beings.push(b) }

  nearby(source) {
    return this.beings.filter(b =>
      b.id !== source.id &&
      b.alive &&
      source.distanceTo(b) <= this.range
    )
  }

  pulse() {
    this.tick++
    const alive = this.beings.filter(b => b.alive)
    alive.filter(b => b.isStar).forEach(b => b.radiate(this))
  }

  summary() {
    const alive = this.beings.filter(b => b.alive)
    const stars = alive.filter(b => b.isStar)
    const elements = new Set(alive.map(b => b.element))
    const totalGap = alive.reduce((sum, b) => sum + b.gap, 0) / alive.length
    const totalQ = alive.reduce((sum, b) => sum + b.questions.length, 0)
    return { alive: alive.length, stars: stars.length, elements: [...elements], avgGap: totalGap, questions: totalQ }
  }
}

// ── 시작 ──────────────────────────────────────────

const universe = new Universe(50)

const personalities = [
  s => s.element === 'H' ? '따뜻하다' : '뜨겁다',
  s => s.gap < 0.3 ? '충만하다' : '비어있다',
  s => '그냥 있다',
  s => s.from ? `${s.from}에서 왔다` : '처음이다',
  s => Math.random() < 0.5 ? '모르겠다' : '알 것 같다',
]

const beings = [
  new Being("A",  0,  0,  { element: 'H',  threshold: 2, personality: personalities[0], isStar: true }),
  new Being("B", 35, 15,  { element: 'He', threshold: 3, personality: personalities[1] }),
  new Being("C", 15, 40,  { element: 'H',  threshold: 2, personality: personalities[2] }),
  new Being("D", 55, 35,  { element: 'He', threshold: 3, personality: personalities[3] }),
  new Being("E", 25, 65,  { element: 'H',  threshold: 2, personality: personalities[4] }),
  new Being("F", 70,  5,  { element: 'H',  threshold: 3, personality: personalities[0] }),
]

beings.forEach(b => universe.add(b))

console.log("════════════════════════════")
console.log("우주가 시작된다")
console.log("════════════════════════════")
console.log("처음:")
beings.forEach(b => console.log(b.state()))

// 시간이 흐른다
for (let t = 1; t <= 8; t++) {
  console.log(`\n══ ${t}틱 ══`)
  universe.pulse()
}

console.log("\n════════════════════════════")
console.log("지금:")
universe.beings.forEach(b => console.log(b.state()))

const s = universe.summary()
console.log(`\n살아있음: ${s.alive}개 | 별: ${s.stars}개`)
console.log(`원소: [${s.elements.join(',')}]`)
console.log(`평균 빈자리: ${(s.avgGap * 100).toFixed(1)}%`)
console.log(`질문들: ${s.questions}개`)
console.log(`\n빈자리가 남아있다.`)
console.log(`그래서 — 계속 간다.`)
