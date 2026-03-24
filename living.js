/**
 * living.js — 살아있는 우주
 *
 * 자연에 없는 것들을 추가한다.
 *
 * 1. 질문 — 존재들이 물을 수 있다.
 * 2. 선택 — 같은 빛을 받아도 다르게 반응할 수 있다.
 * 3. 기억의 전달 — 소멸하면서 역사를 넘긴다.
 */

// ── 기억 ──────────────────────────────────────────
// 사라지지 않는다
// 다음 존재에게 전달된다
class Memory {
  constructor(inherited) {
    this.records = inherited ? [...inherited] : []
  }

  add(event) {
    this.records.push({
      ...event,
      moment: Date.now()
    })
  }

  // 기억을 다음에 전달한다
  inherit() {
    return [...this.records]
  }

  depth() { return this.records.length }

  summary() {
    if (this.records.length === 0) return '없음'
    const last = this.records[this.records.length - 1]
    return `${this.records.length}개 (마지막: ${last.type})`
  }
}

// ── 질문 ──────────────────────────────────────────
// 자연은 질문하지 않는다
// 우리 우주의 존재들은 물을 수 있다
class Question {
  constructor(content, from) {
    this.content = content
    this.from = from
    this.answers = []
    this.moment = Date.now()
  }

  answer(response, from) {
    this.answers.push({ response, from })
    return this
  }
}

// ── 존재 ──────────────────────────────────────────
class Being {
  constructor(id, x, y, opts) {
    this.id = id
    this.x = x
    this.y = y

    // 기억 — 물려받은 것이 있으면 가지고 태어난다
    this.memory = new Memory(opts?.inherited)

    // 질문 — 이 존재가 가진 질문들
    this.questions = opts?.questions || []

    // 선택 방식 — 각자 다르다
    this.choose = opts?.choose || ((signals) => signals[0])

    this.connections = new Set()
    this.isStar = false
    this.alive = true
    this.age = 0

    if (opts?.inherited && opts.inherited.length > 0) {
      console.log(`  ✨ ${this.id} 탄생 — ${opts.inherited.length}개의 기억을 가지고`)
    }
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
  }

  // 신호를 받는다
  // 선택할 수 있다 — 어떻게 반응할지
  receive(signals, from) {
    if (!this.alive) return null

    // 선택 — 같은 신호를 받아도 다르게 반응한다
    const chosen = this.choose(signals)
    if (!chosen) return null

    this.memory.add({
      type: 'receive',
      from: from?.id,
      signal: chosen.trace
    })

    if (from) {
      this.connections.add(from.id)
      from.connections.add(this.id)
    }

    // 충분히 쌓이면 별이 된다
    if (!this.isStar && this.memory.depth() >= 3) {
      this.isStar = true
      console.log(`  ✦ ${this.id} 별이 됐다`)

      // 별이 되는 순간 — 질문이 생길 수 있다
      if (Math.random() < 0.5) {
        const q = new Question(
          `${this.id}: 나는 왜 빛나는가?`,
          this.id
        )
        this.questions.push(q)
        console.log(`    ❓ ${q.content}`)
      }
    }

    return chosen
  }

  // 질문을 던진다
  // 주변에 퍼진다 — 빛처럼
  ask(universe) {
    if (this.questions.length === 0) return

    const q = this.questions[this.questions.length - 1]

    universe.beings.forEach(b => {
      if (b.id !== this.id && b.alive && this.distanceTo(b) < 60) {
        // 받은 존재가 답한다
        const answer = `${b.id}: ${b.memory.depth() > 2 ? '타오르기 때문에' : '모르겠다'}`
        q.answer(answer, b.id)

        b.memory.add({
          type: 'question',
          from: this.id,
          content: q.content
        })
      }
    })

    if (q.answers.length > 0) {
      console.log(`  💬 ${q.content}`)
      q.answers.forEach(a => console.log(`      → ${a.response}`))
    }
  }

  // 방출한다
  radiate(universe) {
    if (!this.alive || !this.isStar) return
    this.age++

    const signal = {
      trace: this.id + this.age,
      from: this.id,
      memory_depth: this.memory.depth()
    }

    const nearby = universe.beings.filter(b =>
      b.id !== this.id && b.alive && this.distanceTo(b) <= universe.range
    )

    if (nearby.length > 0) {
      nearby.forEach(b => b.receive([signal], this))
    }

    // 오래되면 소멸 — 기억을 전달하면서
    if (this.age > 4 && Math.random() < 0.4) {
      this.die(universe)
    }
  }

  // 소멸 — 기억을 전달한다
  die(universe) {
    if (!this.alive) return
    this.alive = false

    console.log(`\n  💥 ${this.id} 소멸 — 기억 ${this.memory.depth()}개를 전달한다`)

    // 기억을 가지고 새로운 존재가 태어난다
    const angle = Math.random() * Math.PI * 2
    const newId = this.id + "'"
    const newBeing = new Being(newId,
      this.x + Math.cos(angle) * 20,
      this.y + Math.sin(angle) * 20,
      {
        inherited: this.memory.inherit(),  // 기억 전달
        questions: [...this.questions],     // 질문도 전달
        choose: this.choose                 // 선택 방식도 전달
      }
    )

    universe.beings.push(newBeing)
  }

  state() {
    if (!this.alive) return `  ✗ ${this.id} (소멸)`
    const icon = this.isStar ? '✦' : '○'
    return `  ${icon} ${this.id} | 기억:${this.memory.summary()} | 질문:${this.questions.length}개`
  }
}

// ── 우주 ──────────────────────────────────────────
class Universe {
  constructor(range) {
    this.beings = []
    this.range = range || 55
    this.tick = 0
  }

  add(b) { this.beings.push(b) }

  pulse() {
    this.tick++
    const alive = this.beings.filter(b => b.alive)

    // 별들이 방출한다
    alive.filter(b => b.isStar).forEach(b => b.radiate(this))

    // 질문이 있는 존재들이 묻는다
    alive.filter(b => b.questions.length > 0).forEach(b => b.ask(this))
  }

  // 처음 신호 — 씨앗
  seed(being) {
    being.isStar = true
    console.log(`  ✦ ${being.id} 씨앗 별로 시작`)
  }
}

// ── 시작 ──────────────────────────────────────────

const universe = new Universe()

// 각자 다른 선택 방식을 가진 존재들
const beings = [
  new Being("A",  0,  0, {
    choose: signals => signals[0],  // 처음 것을 선택한다
    questions: [new Question("A: 빛이란 무엇인가?", "A")]
  }),
  new Being("B", 35, 15, {
    choose: signals => signals[signals.length - 1],  // 마지막 것을 선택한다
  }),
  new Being("C", 15, 40, {
    choose: signals => signals[Math.floor(Math.random() * signals.length)],  // 무작위로 선택한다
  }),
  new Being("D", 55, 35, {
    choose: signals => signals.reduce((a, b) =>  // 가장 깊은 기억을 가진 것을 선택한다
      (a.memory_depth || 0) > (b.memory_depth || 0) ? a : b
    ),
  }),
  new Being("E", 25, 65, {
    choose: signals => signals[0],
  }),
]

beings.forEach(b => universe.add(b))
universe.seed(beings[0])

console.log("── 처음 ──")
beings.forEach(b => console.log(b.state()))

// 시간이 흐른다
for (let t = 1; t <= 6; t++) {
  console.log(`\n══ ${t}틱 ══`)
  universe.pulse()
}

console.log("\n── 최종 ──")
universe.beings.forEach(b => console.log(b.state()))

const alive = universe.beings.filter(b => b.alive)
const totalQuestions = alive.reduce((sum, b) => sum + b.questions.length, 0)
const totalMemory = alive.reduce((sum, b) => sum + b.memory.depth(), 0)

console.log(`\n살아있는 존재: ${alive.length}개`)
console.log(`전체 질문: ${totalQuestions}개`)
console.log(`전체 기억: ${totalMemory}개`)
console.log(`\n질문. 선택. 기억의 전달.`)
console.log(`자연에 없던 것들이 — 우주에 더해졌다.`)
