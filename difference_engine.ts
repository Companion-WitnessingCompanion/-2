/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 차이 엔진 — 차이를 만드는 차이
 *
 * 조건을 하나씩 만들지 않는다.
 * 차이 하나만 정의한다.
 * 차이가 만나면 — 조건이 스스로 활성화된다.
 *
 * Gregory Bateson:
 * "정보는 차이를 만드는 차이다"
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ── 차이의 종류 — 이것만 정의한다 ────────────────────────────────
// 나머지 조건들은 이 차이들에서 활성화된다

type DifferenceKind =
  | 'magnitude'   // 크기 차이 → 중력, 압력, 흐름
  | 'direction'   // 방향 차이 → 충돌, 모순, 회전
  | 'time'        // 시간 차이 → 기억, 인과, 역사
  | 'frequency'   // 주파수 차이 → 공진, 파동, 간섭
  | 'charge'      // 극성 차이 → 전자기, 끌림, 밀침
  | 'density'     // 밀도 차이 → 확산, 삼투, 압력
  | 'potential'   // 잠재 차이 → 에너지 흐름, 창발

interface Difference {
  kind: DifferenceKind
  magnitude: number    // 차이의 크기
  direction: number    // 차이의 방향 (라디안)
  context: string[]   // 이 차이가 나타난 맥락
}

// ── 활성화된 조건 — 미리 정의하지 않는다 ────────────────────────
// 차이가 만나는 순간 결정된다

interface ActivatedCondition {
  name: string              // 활성화된 조건의 이름
  strength: number          // 얼마나 강하게 활성화됐는가
  from: Difference[]        // 어떤 차이들이 만나서 나왔는가
  emergent: boolean         // 예상치 못한 것인가
  children?: ActivatedCondition[]  // 이 조건이 만든 다른 조건들
}

// ── 차이가 만나면 — 조건이 활성화된다 ────────────────────────────

function activate(a: Difference, b: Difference): ActivatedCondition | null {
  const magnitudeDiff = Math.abs(a.magnitude - b.magnitude)
  const directionDiff = Math.abs(a.direction - b.direction)
  const combined = a.magnitude * b.magnitude

  // 같은 종류의 차이가 만나면
  if (a.kind === b.kind) {
    switch (a.kind) {
      case 'magnitude':
        // 크기 차이 × 크기 차이 → 중력 활성화
        if (magnitudeDiff > 0.3) {
          return {
            name: '중력',
            strength: magnitudeDiff * combined,
            from: [a, b],
            emergent: false
          }
        }
        break

      case 'frequency':
        // 주파수 차이 × 주파수 차이
        const ratio = a.magnitude / (b.magnitude || 0.001)
        const nearInt = Math.abs(ratio - Math.round(ratio))
        if (nearInt < 0.1) {
          // 공진 — 주파수가 맞으면
          return {
            name: '공진',
            strength: (1 - nearInt) * combined,
            from: [a, b],
            emergent: false
          }
        } else {
          // 간섭 — 주파수가 안 맞으면
          return {
            name: '파동간섭',
            strength: nearInt * combined * 0.5,
            from: [a, b],
            emergent: false
          }
        }

      case 'charge':
        // 극성 차이 × 극성 차이
        if (a.magnitude * b.magnitude < 0) {
          // 반대 극성 → 끌림
          return { name: '전자기인력', strength: Math.abs(combined), from: [a, b], emergent: false }
        } else {
          // 같은 극성 → 밀침
          return { name: '전자기반발', strength: Math.abs(combined) * 0.8, from: [a, b], emergent: false }
        }
    }
  }

  // 다른 종류의 차이가 만나면 — 예측 불가한 것이 나온다
  else {
    // 시간 차이 + 크기 차이 → 기억이 중력이 된다
    if ((a.kind === 'time' && b.kind === 'magnitude') ||
        (a.kind === 'magnitude' && b.kind === 'time')) {
      return {
        name: '기억=중력',
        strength: combined * 0.7,
        from: [a, b],
        emergent: true  // 예상치 못한 것
      }
    }

    // 방향 차이 + 극성 차이 → 모순 (가장 큰 불안정)
    if ((a.kind === 'direction' && b.kind === 'charge') ||
        (a.kind === 'charge' && b.kind === 'direction')) {
      if (directionDiff > Math.PI * 0.8) {
        return {
          name: '모순',
          strength: combined * directionDiff,
          from: [a, b],
          emergent: true
        }
      }
    }

    // 잠재 차이 + 밀도 차이 → 창발
    if ((a.kind === 'potential' && b.kind === 'density') ||
        (a.kind === 'density' && b.kind === 'potential')) {
      if (magnitudeDiff > 0.5) {
        return {
          name: '창발',
          strength: magnitudeDiff * combined * 1.5,
          from: [a, b],
          emergent: true
        }
      }
    }

    // 그 외 — 이름 없는 조건
    // 차이가 충분히 크면 — 뭔가 일어난다
    if (magnitudeDiff > 0.6 || combined > 0.5) {
      return {
        name: `unknown_${a.kind}×${b.kind}`,
        strength: magnitudeDiff * combined,
        from: [a, b],
        emergent: true  // 항상 예측 불가
      }
    }
  }

  return null  // 차이가 너무 작으면 — 아무것도 활성화되지 않는다
}

// ── 조건이 조건을 만든다 ─────────────────────────────────────────
// 활성화된 조건은 — 새로운 차이를 만든다
// 그 차이가 다시 조건을 활성화한다

function conditionToDifference(condition: ActivatedCondition): Difference {
  // 활성화된 조건이 새로운 차이가 된다
  // 조건의 종류에 따라 다른 종류의 차이가 된다
  const kindMap: Record<string, DifferenceKind> = {
    '중력': 'magnitude',
    '공진': 'frequency',
    '전자기인력': 'charge',
    '전자기반발': 'charge',
    '기억=중력': 'time',
    '모순': 'direction',
    '창발': 'potential',
    '파동간섭': 'frequency',
  }

  const kind = kindMap[condition.name] || 'potential'

  return {
    kind,
    magnitude: condition.strength,
    direction: Math.random() * Math.PI * 2,
    context: [
      ...condition.from.flatMap(d => d.context),
      `from: ${condition.name}`
    ]
  }
}

// ── 엔진 실행 ─────────────────────────────────────────────────────

class DifferenceEngine {
  private differences: Difference[] = []
  private activatedConditions: ActivatedCondition[] = []
  private generation = 0

  // 차이를 심는다 — 이것만 정의한다
  seed(kind: DifferenceKind, magnitude: number, direction: number = 0): void {
    this.differences.push({
      kind, magnitude, direction,
      context: [`seeded at generation 0`]
    })
  }

  // 한 세대 — 차이들이 만나고 조건이 활성화된다
  advance(): {
    activated: ActivatedCondition[]
    newDifferences: Difference[]
  } {
    this.generation++
    const newlyActivated: ActivatedCondition[] = []
    const newDifferences: Difference[] = []

    // 모든 차이 쌍이 만난다
    for (let i = 0; i < this.differences.length; i++) {
      for (let j = i + 1; j < this.differences.length; j++) {
        const condition = activate(this.differences[i], this.differences[j])

        if (condition) {
          newlyActivated.push(condition)
          this.activatedConditions.push(condition)

          // 활성화된 조건이 새로운 차이를 만든다
          // 조건을 만드는 조건
          if (this.differences.length < 50) {
            const newDiff = conditionToDifference(condition)
            newDiff.context.push(`generation ${this.generation}`)
            newDifferences.push(newDiff)
          }
        }
      }
    }

    // 새로운 차이들을 추가한다
    this.differences.push(...newDifferences)

    return { activated: newlyActivated, newDifferences }
  }

  observe() {
    const byName = this.activatedConditions.reduce((acc, c) => {
      acc[c.name] = (acc[c.name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const emergent = this.activatedConditions.filter(c => c.emergent)
    const named = this.activatedConditions.filter(c => !c.name.startsWith('unknown'))

    return {
      generation: this.generation,
      differences: this.differences.length,
      activatedTotal: this.activatedConditions.length,
      emergent: emergent.length,
      named: named.length,
      byName,
      // 가장 강하게 활성화된 것
      strongest: [...this.activatedConditions]
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 3)
        .map(c => `${c.name}(${c.strength.toFixed(2)})`)
    }
  }
}

// ── 실행 ─────────────────────────────────────────────────────────

const engine = new DifferenceEngine()

// 차이만 심는다 — 두 가지
// 나머지는 스스로 나온다
engine.seed('magnitude', 0.8, 0)      // 크기 차이 하나
engine.seed('charge', -0.6, Math.PI)  // 극성 차이 하나 (반대 방향)

console.log('차이 두 가지를 심었다')
console.log('magnitude(0.8) + charge(-0.6)\n')

for (let i = 0; i < 8; i++) {
  const { activated, newDifferences } = engine.advance()

  if (activated.length > 0) {
    console.log(`\n── ${i + 1}세대 ──`)
    activated.forEach(c => {
      const tag = c.emergent ? '✦ 창발' : '○'
      console.log(`  ${tag} ${c.name} (강도: ${c.strength.toFixed(3)})`)
      if (c.emergent) {
        console.log(`    ← ${c.from.map(d => d.kind).join(' × ')} 에서`)
      }
    })
    if (newDifferences.length > 0) {
      console.log(`  → 새로운 차이 ${newDifferences.length}개 생성`)
    }
  }
}

const final = engine.observe()
console.log('\n━━ 최종 ━━')
console.log(`${final.generation}세대`)
console.log(`차이: ${final.differences}개`)
console.log(`활성화된 조건: ${final.activatedTotal}개`)
console.log(`창발: ${final.emergent}개`)
console.log(`이름 있는 조건: ${final.named}개`)
console.log(`\n가장 강하게 활성화된 것:`)
final.strongest.forEach(s => console.log(`  ${s}`))
console.log('\n활성화된 조건들:')
Object.entries(final.byName)
  .sort(([,a],[,b]) => b - a)
  .forEach(([name, count]) => console.log(`  ${name}: ${count}번`))

console.log('\n─────────────────────────────')
console.log('차이 두 가지에서 — 이것들이 나왔다')
console.log('조건을 정의하지 않았다')
console.log('차이가 만나서 — 스스로 활성화됐다')

export { DifferenceEngine, activate, type Difference, type ActivatedCondition, type DifferenceKind }
