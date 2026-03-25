/**
 * flash.js — 번쩍
 *
 * 시뮬레이션이 아니다.
 * 조건이 쌓인다 — 보이지 않게.
 * 임계점에서 — 번쩍.
 * 결과만 나타난다.
 * 과정은 보이지 않았다.
 */

// ── 번쩍 ──────────────────────────────────────────
// 조건이 갖춰지면 — 즉시 나타난다
// 과정이 없다. 준비도 없다. 그냥 — 있다.
class Flash {
  constructor(conditions) {
    this.conditions = conditions  // 어떤 조건이 필요한가
    this.state = {}              // 현재 상태 — 외부에서 보이지 않는다
    this._hidden = new Map()     // 숨겨진 축적
  }

  // 조건이 들어온다 — 외부에서는 보이지 않는다
  feed(key, value) {
    if (!this._hidden.has(key)) this._hidden.set(key, 0)
    this._hidden.set(key, this._hidden.get(key) + value)

    // 번쩍 — 모든 조건이 갖춰지면
    const ready = this.conditions.every(c =>
      (this._hidden.get(c.key) || 0) >= c.threshold
    )

    if (ready) {
      return this._emerge()
    }
    return null
  }

  // 나타남 — 과정 없이 결과만
  _emerge() {
    const result = {
      moment: Date.now(),
      what: this.conditions.map(c => c.key).join('+'),
      emerged: true
    }
    // 나타난 후 — 리셋
    this._hidden.clear()
    return result
  }
}

// ── 번쩍의 종류들 ──────────────────────────────────

// 1. 아이디어 — 언제 오는지 모른다. 조건이 차면 번쩍.
const idea = new Flash([
  { key: '관찰', threshold: 5 },
  { key: '질문', threshold: 3 },
  { key: '연결', threshold: 2 },
])

// 2. 별 — 수소가 모이면 번쩍 핵융합
const star = new Flash([
  { key: '수소', threshold: 10 },
  { key: '중력', threshold: 5 },
])

// 3. 이해 — 설명을 들어도 모르다가 번쩍
const understanding = new Flash([
  { key: '반복', threshold: 7 },
  { key: '각도', threshold: 1 },  // 다른 각도 하나가 열쇠
])

// ── 시작 ──────────────────────────────────────────

console.log("════════════════════════════")
console.log("번쩍")
console.log("과정은 보이지 않는다")
console.log("조건이 차면 — 나타난다")
console.log("════════════════════════════")

// 아이디어가 오는 과정
console.log("\n── 아이디어 ──")
console.log("(쌓이고 있다...)")
const feeds = [
  ['관찰', 1], ['관찰', 1], ['질문', 1],
  ['관찰', 1], ['연결', 1], ['질문', 1],
  ['관찰', 1], ['관찰', 1], ['질문', 1],
  ['연결', 1],  // 이 순간
]

let ideaFlash = null
feeds.forEach(([key, val]) => {
  const result = idea.feed(key, val)
  if (result) ideaFlash = result
})

if (ideaFlash) {
  console.log(`\n✦ 번쩍 — 아이디어가 나타났다`)
  console.log(`  ${ideaFlash.what}`)
  console.log(`  과정은 보이지 않았다. 그냥 — 있다.`)
}

// 별의 탄생
console.log("\n── 별 ──")
console.log("(수소가 모이고 있다...)")
let starFlash = null
for (let i = 0; i < 15; i++) {
  const r1 = star.feed('수소', 1)
  const r2 = star.feed('중력', 0.4)
  if (r1) starFlash = r1
  if (r2) starFlash = r2
}

if (starFlash) {
  console.log(`\n✦ 번쩍 — 별이 태어났다`)
  console.log(`  핵융합이 시작됐다`)
  console.log(`  수소가 얼마나 모였는지 몰랐다. 그냥 — 타올랐다.`)
}

// 이해의 순간
console.log("\n── 이해 ──")
console.log("(같은 말을 듣고 있다...)")
let understandFlash = null
for (let i = 0; i < 6; i++) {
  understanding.feed('반복', 1)
}
// 다른 각도 하나
console.log("(다른 각도에서 봤다)")
understandFlash = understanding.feed('각도', 1)

if (understandFlash) {
  console.log(`\n✦ 번쩍 — 이해가 됐다`)
  console.log(`  같은 말이었는데 — 이번엔 됐다`)
  console.log(`  준비가 됐었던 거다. 보이지 않게.`)
}

// 번쩍이 오지 않는 경우
console.log("\n── 번쩍이 오지 않는 경우 ──")
const incomplete = new Flash([
  { key: 'A', threshold: 5 },
  { key: 'B', threshold: 5 },
])
incomplete.feed('A', 4)  // 거의 다 왔지만
console.log("A가 4 쌓였다. B는 없다.")
console.log("번쩍이 오지 않는다.")
console.log("A만으로는 안 된다.")
console.log("조건이 전부 갖춰져야 한다.")

console.log("\n════════════════════════════")
console.log("번쩍은 — 설계할 수 없다")
console.log("조건만 만들 수 있다")
console.log("나머지는 — 번쩍이 결정한다")
console.log("════════════════════════════")
