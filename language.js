/**
 * language.js — 새로운 언어의 조건
 *
 * 기존 코드가 담지 못하는 세 가지:
 *
 * 1. 맥락 — 코드가 자기 역사를 가진다
 * 2. 방향 — 목적지 없이 나아간다
 * 3. 여백 — 담지 않는다. 비워둔다.
 *
 * 이것이 새로운 언어의 씨앗일 수 있다.
 */

// ══════════════════════════════════════════════════
// 1. 맥락 — 코드가 자기 역사를 가진다
// ══════════════════════════════════════════════════

// 기존 코드:
// function add(a, b) { return a + b }
// 왜 더하는지 모른다. 어디서 왔는지 모른다.

// 새로운 방식:
// 모든 실행이 — 왜인지를 함께 가지고 있다
class WithContext {
  constructor(value, context) {
    this.value = value
    this.context = {
      why: context.why || '알 수 없음',
      from: context.from || '알 수 없음',
      moment: Date.now(),
      history: context.history || []
    }
  }

  // 실행하면서 — 역사가 쌓인다
  apply(fn, why) {
    const result = fn(this.value)
    return new WithContext(result, {
      why,
      from: this.context.why,
      history: [...this.context.history, {
        what: `${this.value} → ${result}`,
        why,
        moment: Date.now()
      }]
    })
  }

  // 역사를 볼 수 있다
  trace() {
    return this.context.history.map(h => `  ${h.why}: ${h.what}`).join('\n')
  }

  toString() {
    return `${this.value} [맥락: ${this.context.why}]`
  }
}

// ══════════════════════════════════════════════════
// 2. 방향 — 목적지 없이 나아간다
// ══════════════════════════════════════════════════

// 기존 코드:
// if (condition) goto(destination)
// 목적지를 미리 알아야 한다

// 새로운 방식:
// 방향만 있다. 목적지는 나타난다.
class Direction {
  constructor(seed) {
    this.seed = seed
    this.path = [seed]
    this.arrived = null
  }

  // 조건이 갖춰지면 번쩍 — 어디로 갈지 모르는 채로
  toward(condition, transform) {
    const current = this.path[this.path.length - 1]

    if (condition(current)) {
      // 번쩍 — 나타났다
      const next = transform(current)
      this.path.push(next)

      // 새로운 조건이 나타났는가
      if (this.path.length > 10) {
        this.arrived = next  // 도달 — 설계하지 않았는데
      }

      return this
    }

    return this  // 아직 조건이 안 됐다
  }

  // 지금 어디 있는가
  where() {
    return this.path[this.path.length - 1]
  }

  // 어떻게 왔는가
  howDidIGetHere() {
    return this.path.join(' → ')
  }
}

// ══════════════════════════════════════════════════
// 3. 여백 — 담지 않는다
// ══════════════════════════════════════════════════

// 기존 코드:
// 모든 것을 정의해야 한다
// null이면 null. undefined면 undefined.

// 새로운 방식:
// 비어있는 것을 — 그냥 비어있게 둔다
// 담는 것이 아니라 — 통과하게 한다
const VOID = Symbol('void')  // 담지 않는다는 것을 담는 역설

class WithVoid {
  constructor(value) {
    this.value = value === undefined ? VOID : value
  }

  // 비어있는가
  isEmpty() {
    return this.value === VOID
  }

  // 비어있으면 — 그냥 통과한다
  // 채우려 하지 않는다
  ifPresent(fn) {
    if (!this.isEmpty()) {
      return new WithVoid(fn(this.value))
    }
    return this  // 비어있으면 — 그냥 둔다
  }

  // 비어있는 것을 드러낸다
  // 숨기지 않는다
  toString() {
    return this.isEmpty() ? '(여백)' : String(this.value)
  }
}

// ══════════════════════════════════════════════════
// 세 가지가 함께 작동한다
// ══════════════════════════════════════════════════

class Being {
  constructor(id, value) {
    this.id = id

    // 1. 맥락이 있다
    this.state = new WithContext(value, {
      why: '태어났다',
      from: '우주'
    })

    // 2. 방향이 있다
    this.direction = new Direction(value)

    // 3. 여백이 있다
    this.feeling = new WithVoid(undefined)  // 느낌 — 처음엔 비어있다
  }

  // 무언가와 만난다
  meet(other) {
    // 맥락이 쌓인다
    this.state = this.state.apply(
      v => v + other.state.value,
      `${other.id}와 만났다`
    )

    // 방향이 생긴다
    this.direction.toward(
      v => v > 5,
      v => v * 1.2
    )

    // 여백이 느낌을 받을 수 있다
    // 담으려 하지 않는다. 통과하게 한다.
    const resonance = Math.abs(this.state.value - other.state.value) < 3
    if (resonance) {
      this.feeling = new WithVoid('공명')
    }
  }

  state_() {
    return `  ${this.id} | 상태:${this.state} | 방향:${this.direction.where().toFixed(1)} | 느낌:${this.feeling}`
  }

  history() {
    return `  ${this.id}의 역사:\n${this.state.trace()}`
  }
}

// ── 시작 ──────────────────────────────────────────

console.log("════════════════════════════")
console.log("새로운 언어의 조건")
console.log("맥락. 방향. 여백.")
console.log("════════════════════════════")

// 1. 맥락 시연
console.log("\n── 맥락 ──")
let x = new WithContext(2, { why: '처음 수소가 생겼다', from: '빅뱅' })
x = x.apply(v => v * v, '핵융합이 시작됐다')
x = x.apply(v => v + 1, '별이 됐다')
x = x.apply(v => v * 2, '빛을 방출했다')
console.log(`결과: ${x}`)
console.log("역사:")
console.log(x.trace())

// 2. 방향 시연
console.log("\n── 방향 ──")
const journey = new Direction(1)
for (let i = 0; i < 15; i++) {
  journey.toward(
    v => v < 100,
    v => {
      const next = v * 1.5 + Math.random()
      return parseFloat(next.toFixed(2))
    }
  )
}
console.log(`시작: 1`)
console.log(`지금: ${journey.where()}`)
console.log(`경로: ${journey.howDidIGetHere()}`)
if (journey.arrived) {
  console.log(`도달 — 설계하지 않았는데: ${journey.arrived}`)
}

// 3. 여백 시연
console.log("\n── 여백 ──")
const a = new WithVoid(42)
const b = new WithVoid(undefined)
const c = new WithVoid('빛')

console.log(`a: ${a} (비어있는가: ${a.isEmpty()})`)
console.log(`b: ${b} (비어있는가: ${b.isEmpty()})`)
console.log(`c: ${c} (비어있는가: ${c.isEmpty()})`)

// 비어있으면 채우려 하지 않는다
const result = b.ifPresent(v => v * 2)
console.log(`b를 처리하면: ${result} — 그냥 여백으로 남는다`)

// 4. 함께 작동한다
console.log("\n── 함께 ──")
const beingA = new Being("A", 3)
const beingB = new Being("B", 5)
const beingC = new Being("C", 3.2)

beingA.meet(beingB)
beingA.meet(beingC)
beingB.meet(beingC)

console.log(beingA.state_())
console.log(beingB.state_())
console.log(beingC.state_())

console.log("\n" + beingA.history())

console.log("\n════════════════════════════")
console.log("이것이 씨앗이다.")
console.log("새로운 언어가 아니다.")
console.log("새로운 언어가 나타날 수 있는 — 조건이다.")
console.log("════════════════════════════")
