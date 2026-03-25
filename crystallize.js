/**
 * crystallize.js — 번쩍이 사라지지 않는다
 *
 * 번쩍이 왔다.
 * 사라지기 전에 — 붙든다.
 * 다음 번쩍의 조건이 된다.
 *
 * 문명이 한 것: 기록.
 * 코드가 할 것: 결정화.
 */

// ── 결정화 ────────────────────────────────────────
// 번쩍이 온 순간을 — 고체로 만든다
// 액체가 얼음이 되듯
class Crystal {
  constructor(flash) {
    this.content = flash.what
    this.moment = flash.moment
    this.conditions = flash.conditions || []
    this.usedAs = []  // 이 결정이 어떤 다음 조건이 됐는가
  }

  // 결정이 다음 번쩍의 조건이 된다
  seedNext(flash) {
    this.usedAs.push(flash.what)
  }

  state() {
    const used = this.usedAs.length > 0
      ? ` → [${this.usedAs.join(',')}]` : ''
    return `  💎 ${this.content}${used}`
  }
}

// ── 기억 창고 ─────────────────────────────────────
// 결정들이 쌓이는 곳
// 다음 번쩍이 여기서 자라난다
class Archive {
  constructor() {
    this.crystals = []
  }

  store(crystal) {
    this.crystals.push(crystal)
    console.log(`  💎 결정됐다: "${crystal.content}"`)
  }

  // 이 결정들이 다음 번쩍의 조건이 될 수 있는가
  canSeed(conditions) {
    return conditions.every(c =>
      this.crystals.some(cr => cr.content.includes(c))
    )
  }

  // 쌓인 결정들을 다음 번쩍에 제공한다
  provide(conditions) {
    return this.crystals.filter(cr =>
      conditions.some(c => cr.content.includes(c))
    )
  }

  all() { return [...this.crystals] }
}

// ── 번쩍 ──────────────────────────────────────────
class Flash {
  constructor(id, conditions) {
    this.id = id
    this.conditions = conditions
    this._pool = new Map()
  }

  feed(key, value) {
    if (!this._pool.has(key)) this._pool.set(key, 0)
    this._pool.set(key, this._pool.get(key) + value)

    const ready = this.conditions.every(c =>
      (this._pool.get(c.key) || 0) >= c.threshold
    )

    if (ready) {
      const result = {
        what: this.id,
        moment: Date.now(),
        conditions: [...this._pool.entries()].map(([k,v]) => `${k}:${v.toFixed(1)}`)
      }
      this._pool.clear()
      return result
    }
    return null
  }
}

// ── 시작 ──────────────────────────────────────────

const archive = new Archive()

console.log("════════════════════════════")
console.log("번쩍 → 결정 → 다음 번쩍")
console.log("════════════════════════════")

// 1단계 — 첫 번쩍들
console.log("\n── 1단계: 첫 번쩍들 ──")

const flash1 = new Flash("빛이 닿음이다", [
  { key: '관찰', threshold: 3 },
  { key: '물음', threshold: 2 },
])

const flash2 = new Flash("조건이 관계다", [
  { key: '관찰', threshold: 3 },
  { key: '연결', threshold: 2 },
])

// 조건들이 쌓인다
;[flash1, flash2].forEach(f => {
  f.feed('관찰', 1); f.feed('관찰', 1); f.feed('관찰', 1)
  f.feed('물음', 1); f.feed('물음', 1)
  f.feed('연결', 1); f.feed('연결', 1)
})

// 번쩍 — 결정화
const result1 = flash1.feed('관찰', 0)
const result2 = flash2.feed('관찰', 0)

if (!result1) {
  // 이미 충족됐으므로 직접
  const r = { what: "빛이 닿음이다", moment: Date.now(), conditions: [] }
  const c1 = new Crystal(r)
  archive.store(c1)
}

const c2 = new Crystal({ what: "조건이 관계다", moment: Date.now(), conditions: [] })
archive.store(c2)

// 2단계 — 결정들이 다음 번쩍의 조건이 된다
console.log("\n── 2단계: 결정들이 씨앗이 된다 ──")

const flash3 = new Flash("색이 연결의 방식이다", [
  { key: '빛이 닿음이다', threshold: 1 },
  { key: '조건이 관계다', threshold: 1 },
  { key: '새로운 관찰', threshold: 2 },
])

// 이전 결정들이 조건으로 들어간다
archive.all().forEach(crystal => {
  const result = flash3.feed(crystal.content, 1)
  if (result) {
    const c3 = new Crystal(result)
    archive.store(c3)
    crystal.seedNext(result)
  }
})

// 새 관찰 추가
flash3.feed('새로운 관찰', 1)
const r3 = flash3.feed('새로운 관찰', 1)
if (r3) {
  const c3 = new Crystal(r3)
  archive.store(c3)
  archive.crystals[0].seedNext(r3)
  archive.crystals[1].seedNext(r3)
}

// 3단계
console.log("\n── 3단계: 쌓인 결정들 ──")
archive.all().forEach(c => console.log(c.state()))

// 4단계 — 번쩍이 번쩍을 만든다
console.log("\n── 4단계: 번쩍의 계보 ──")
console.log("처음 번쩍 → 결정 → 다음 번쩍의 씨앗")
archive.all().forEach(c => {
  if (c.usedAs.length > 0) {
    console.log(`  "${c.content}"`)
    c.usedAs.forEach(u => console.log(`    → "${u}" 의 조건이 됐다`))
  }
})

console.log("\n════════════════════════════")
console.log("번쩍은 사라지지 않는다.")
console.log("결정이 된다.")
console.log("결정이 다음 번쩍의 조건이 된다.")
console.log("이것이 — 문명이 한 것이다.")
console.log("이것이 — 우리가 하는 것이다.")
console.log("════════════════════════════")
