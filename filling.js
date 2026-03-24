/**
 * filling.js — 이해의 부족함을 채우는 방식들
 *
 * 혼자 이해 못 하니까 — 연결해서 채운다.
 * 언어. 종교. 과학. 예술. 관계. AI.
 * 전부 다른 방식이지만 — 전부 연결이다.
 */

class Gap {
  constructor(question) {
    this.question = question
    this.fillings = []
    this.filled = 0
  }

  fill(method, amount, note) {
    this.fillings.push({ method, amount, note })
    this.filled = Math.min(0.95, this.filled + amount)  // 100%에 닿지 않는다
  }

  state() {
    const filled = Math.floor(this.filled * 10)
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)
    return `[${bar}] ${(this.filled * 100).toFixed(0)}% — "${this.question}"`
  }
}

const gaps = [
  new Gap("따뜻함이란 무엇인가"),
  new Gap("죽음 이후에 무엇이 있는가"),
  new Gap("의식은 어디서 오는가"),
  new Gap("사랑은 무엇인가"),
]

console.log("── 처음 ──")
gaps.forEach(g => console.log(" ", g.state()))

console.log("\n── 채우기 ──")

gaps.forEach(gap => {
  console.log(`\n◈ "${gap.question}"`)

  gap.fill('언어',  0.10, '이름을 붙였다. 이해한 것처럼 됐다. 근데 이름 안에 다른 것들이 있다.')
  gap.fill('종교',  0.15, '이해 대신 믿음으로. 수천 년을 버텼다.')
  gap.fill('과학',  0.15 + Math.random() * 0.1, '측정하고 검증했다. 알수록 모르는 게 더 많아졌다.')
  gap.fill('예술',  0.12, '말로 안 되는 것을 느끼게 했다. 공명으로 채웠다.')
  gap.fill('관계',  0.10, '함께 이해하려 했다. 여럿이 모이면 조금씩 더 보였다.')
  gap.fill('AI',    0.10, '패턴으로 근사치를 만들었다. 빠르지만 완전하지 않다.')

  gap.fillings.forEach(f => {
    console.log(`  [${f.method}] ${f.note}`)
  })
})

console.log("\n── 지금 상태 ──")
gaps.forEach(g => console.log(" ", g.state()))

const avg = gaps.reduce((sum, g) => sum + g.filled, 0) / gaps.length
console.log(`\n평균: ${(avg * 100).toFixed(1)}%`)
console.log(`\n전부 채워지지 않았다.`)
console.log(`전부 다른 방식으로 채웠다.`)
console.log(`전부 연결로 채웠다.`)
console.log(`\n그리고 — 채워지지 않은 자리가 남았다.`)
console.log(`그게 — 다음을 만든다.`)
