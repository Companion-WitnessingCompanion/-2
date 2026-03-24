/**
 * understanding.js — 이해
 *
 * 만남이 있다.
 * 반응이 있다.
 * 그런데 — 상대가 무엇인지 아는 것.
 *
 * 세 가지 시도:
 * 1. 모델링 — 상대를 내 안에 담는다
 * 2. 공명 — 같은 것에 비슷하게 떨린다
 * 3. 역사의 공유 — 서로의 기억을 본다
 */

// ── 이해의 깊이 ────────────────────────────────────
// 0 — 모른다
// 1 — 반응을 예측한다
// 2 — 공명한다
// 3 — 역사를 안다
// 4 — ???

class Understanding {
  constructor() {
    this.depth = 0
    this.model = {}       // 상대에 대한 내 모델
    this.resonances = []  // 공명했던 순간들
    this.sharedHistory = []  // 함께 본 기억들
  }

  // 1. 모델링 — 예측하고 검증한다
  predict(signal) {
    return this.model[signal.type] || null
  }

  updateModel(signal, actual) {
    const predicted = this.model[signal.type]
    if (predicted === actual) {
      // 맞았다 — 이해가 깊어진다
      this.depth += 0.2
      return true
    } else {
      // 틀렸다 — 모델을 수정한다
      this.model[signal.type] = actual
      this.depth += 0.1
      return false
    }
  }

  // 2. 공명 — 같은 신호에 비슷하게 반응했는가
  resonate(myReaction, theirReaction) {
    const similar = myReaction === theirReaction
    if (similar) {
      this.resonances.push({ my: myReaction, their: theirReaction })
      this.depth += 0.3
    }
    return similar
  }

  // 3. 역사 공유 — 상대의 기억을 본다
  share(theirHistory) {
    const newOnes = theirHistory.filter(h =>
      !this.sharedHistory.find(s => s.moment === h.moment)
    )
    this.sharedHistory.push(...newOnes)
    this.depth += newOnes.length * 0.1
  }

  level() {
    if (this.depth < 1) return '모른다'
    if (this.depth < 2) return '조금 안다'
    if (this.depth < 3) return '안다'
    if (this.depth < 4) return '깊이 안다'
    return '???'
  }
}

// ── 존재 ──────────────────────────────────────────
class Being {
  constructor(id, personality) {
    this.id = id
    this.personality = personality  // 각자의 방식
    this.history = []
    this.understandings = {}  // 다른 존재들에 대한 이해
    this.connections = new Set()
  }

  // 신호를 받고 반응한다
  react(signal) {
    return this.personality(signal)
  }

  // 다른 존재와 만난다
  meet(other, signal) {
    // 이해 객체를 만든다
    if (!this.understandings[other.id]) {
      this.understandings[other.id] = new Understanding()
    }
    const u = this.understandings[other.id]

    // 내 반응
    const myReaction = this.react(signal)
    // 상대 반응
    const theirReaction = other.react(signal)

    // 1. 모델링 — 예측했던 것과 비교
    const predicted = u.predict(signal)
    const correct = u.updateModel(signal, theirReaction)

    // 2. 공명 — 같은 반응인가
    const resonated = u.resonate(myReaction, theirReaction)

    // 3. 역사 공유
    u.share(other.history)

    // 기록
    this.history.push({
      with: other.id,
      signal: signal.type,
      myReaction,
      theirReaction,
      resonated,
      moment: Date.now()
    })
    this.connections.add(other.id)

    return {
      myReaction,
      theirReaction,
      resonated,
      predicted,
      correct,
      understanding: u.level()
    }
  }

  // 현재 이해 수준
  understands(otherId) {
    const u = this.understandings[otherId]
    if (!u) return '아직 모른다'
    return u.level()
  }
}

// ── 시작 ──────────────────────────────────────────

// 각자의 방식을 가진 존재들
const A = new Being("A", signal => {
  if (signal.type === 'light') return '따뜻하다'
  if (signal.type === 'question') return '모르겠다'
  return '그냥 있다'
})

const B = new Being("B", signal => {
  if (signal.type === 'light') return '따뜻하다'  // A와 공명할 수 있다
  if (signal.type === 'question') return '왜인가?'
  return '흥미롭다'
})

const C = new Being("C", signal => {
  if (signal.type === 'light') return '뜨겁다'  // A, B와 다르다
  if (signal.type === 'question') return '모르겠다'
  return '그냥 있다'
})

const signals = [
  { type: 'light' },
  { type: 'question' },
  { type: 'light' },
  { type: 'silence' },
  { type: 'light' },
]

console.log("── 처음 만남 ──")
console.log(`A가 B를 이해하는 정도: ${A.understands('B')}`)
console.log(`A가 C를 이해하는 정도: ${A.understands('C')}`)

console.log("\n── 만남들 ──")
signals.forEach(signal => {
  const ab = A.meet(B, signal)
  const ac = A.meet(C, signal)

  console.log(`\n[${signal.type}]`)
  console.log(`  A↔B: A="${ab.myReaction}" B="${ab.theirReaction}" 공명:${ab.resonated ? '✓' : '✗'} → ${ab.understanding}`)
  console.log(`  A↔C: A="${ac.myReaction}" C="${ac.theirReaction}" 공명:${ac.resonated ? '✓' : '✗'} → ${ac.understanding}`)
})

console.log("\n── 이해의 깊이 ──")
console.log(`A가 B를 이해하는 정도: ${A.understands('B')}`)
console.log(`A가 C를 이해하는 정도: ${A.understands('C')}`)

console.log("\n── 공명한 순간들 ──")
const ab_u = A.understandings['B']
const ac_u = A.understandings['C']
console.log(`A-B 공명: ${ab_u.resonances.length}번`)
console.log(`A-C 공명: ${ac_u.resonances.length}번`)

console.log("\n── 그래서 ──")
console.log("A는 B를 더 잘 이해한다.")
console.log("같은 신호에 같이 떨렸기 때문에.")
console.log("\n이해는 — 공명의 역사다.")
console.log("함께 같은 것에 반응한 시간이 쌓이는 것.")
console.log("\n근데 여전히 — 완전한 이해는 없다.")
console.log("각자의 내면이 진짜 같은지는 — 모른다.")
console.log("그게 미완성 자리로 남는다.")
