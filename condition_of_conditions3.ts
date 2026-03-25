/**
 * 조건을 만드는 조건 — 3층
 *
 * 1층: 불안정에서 조건이 나온다
 * 2층: 창발된 것이 다시 씨앗이 된다
 * 3층: 창발된 것들이 서로 만나 — 완전히 다른 종류가 나온다
 *
 * 3층부터는 — 무엇이 나올지 예측할 수 없다.
 * 설계자가 아니라 관찰자가 된다.
 */

// ── 조건의 종류 — 층마다 다른 종이 나온다 ────────────────────────

type ConditionKind =
  | 'seed'       // 0층: 심어진 것
  | 'divided'    // 1층: 나뉜 것
  | 'emerged'    // 2층: 창발된 것
  | 'synthetic'  // 3층: 창발들이 만나서 나온 것
  | 'unknown'    // 그 이상: 예측 불가

type ConditionId = string & { readonly _id: true }

interface Condition {
  id: ConditionId
  kind: ConditionKind
  instability: number
  generation: number
  layer: number           // 몇 번째 창발의 창발인가
  parents: ConditionId[]
  children: ConditionId[]
  history: string[]
  tick: number
  // 3층 이상에서 나타나는 것들
  properties?: Record<string, unknown>  // 예측할 수 없는 속성들
}

// ── 엔진 ─────────────────────────────────────────────────────────

class ConditionEngine {
  private conditions = new Map<ConditionId, Condition>()
  private meetings: Array<[ConditionId, ConditionId, number]> = []  // [a, b, tick]
  private tick = 0
  private counter = 0

  private id(kind: ConditionKind): ConditionId {
    return `${kind[0]}-${++this.counter}` as ConditionId
  }

  // 심는다
  seed(instability = 0.7): ConditionId {
    const id = this.id('seed')
    this.conditions.set(id, {
      id, kind: 'seed',
      instability, generation: 0, layer: 0,
      parents: [], children: [],
      history: [`seeded`], tick: 0
    })
    return id
  }

  advance(): {
    events: string[]
    newConditions: ConditionId[]
  } {
    this.tick++
    const events: string[] = []
    const newConditions: ConditionId[] = []

    const active = [...this.conditions.values()]
      .filter(c => c.children.length === 0)

    // 1층: 불안정이 쌓여 나뉜다
    active.forEach(c => {
      c.instability = Math.min(1, c.instability + Math.random() * 0.04)
      c.tick = this.tick

      if (c.instability > 0.78 && this.conditions.size < 300) {
        const [a, b] = this._divide(c)
        c.children.push(a, b)
        newConditions.push(a, b)
        events.push(`1층 나뉨: ${c.id} → ${a}, ${b} (generation ${c.generation + 1})`)
      }
    })

    // 2층: 나뉜 것들이 만나 창발한다
    const divided = [...this.conditions.values()]
      .filter(c => c.kind === 'divided' && c.children.length === 0)

    for (let i = 0; i < divided.length - 1; i += 2) {
      const a = divided[i], b = divided[i + 1]
      if (!a || !b) continue
      const dx = Math.random()
      if (dx < 0.12) {
        const emerged = this._emerge2(a, b)
        newConditions.push(emerged)
        events.push(`2층 창발: ${a.id} + ${b.id} → ${emerged} (layer ${this.conditions.get(emerged)!.layer})`)

        // 2층: 창발이 다시 씨앗이 된다
        const reseeded = this._reseed(this.conditions.get(emerged)!)
        if (reseeded) {
          newConditions.push(reseeded)
          events.push(`  ↺ 재귀: ${reseeded}`)
        }
      }
    }

    // 3층: 창발된 것들이 서로 만난다
    const emergeds = [...this.conditions.values()]
      .filter(c => (c.kind === 'emerged' || c.kind === 'synthetic') && c.children.length === 0)

    for (let i = 0; i < emergeds.length - 1; i++) {
      for (let j = i + 1; j < emergeds.length; j++) {
        const a = emergeds[i], b = emergeds[j]
        if (Math.random() < 0.06) {
          this.meetings.push([a.id, b.id, this.tick])
          const synthetic = this._synthesize(a, b)
          newConditions.push(synthetic)
          events.push(`3층 합성: ${a.id}(layer ${a.layer}) + ${b.id}(layer ${b.layer}) → ${synthetic}`)

          // 3층에서 나온 것은 — 예측 불가한 속성을 가진다
          const c = this.conditions.get(synthetic)!
          events.push(`  속성: ${JSON.stringify(c.properties)}`)
        }
      }
    }

    return { events, newConditions }
  }

  private _divide(parent: Condition): [ConditionId, ConditionId] {
    const make = (branch: string): ConditionId => {
      const id = this.id('divided')
      this.conditions.set(id, {
        id, kind: 'divided',
        instability: Math.max(0.1, parent.instability * (0.5 + Math.random() * 0.8)),
        generation: parent.generation + 1,
        layer: parent.layer,
        parents: [parent.id], children: [],
        history: [`divided from ${parent.id} (${branch})`],
        tick: this.tick
      })
      return id
    }
    return [make('A'), make('B')]
  }

  private _emerge2(a: Condition, b: Condition): ConditionId {
    const id = this.id('emerged')
    const newLayer = Math.max(a.layer, b.layer) + 1
    this.conditions.set(id, {
      id, kind: 'emerged',
      instability: (a.instability + b.instability) / 2 * 0.8,
      generation: Math.max(a.generation, b.generation) + 1,
      layer: newLayer,
      parents: [a.id, b.id], children: [],
      history: [`emerged from ${a.id} + ${b.id}`, `layer ${newLayer}`],
      tick: this.tick
    })
    return id
  }

  private _reseed(emerged: Condition): ConditionId | null {
    if (Math.random() > 0.6) return null
    const id = this.id('emerged')
    this.conditions.set(id, {
      id, kind: 'emerged',
      instability: Math.max(0.2, emerged.instability * 0.7),
      generation: emerged.generation + 1,
      layer: emerged.layer,
      parents: [emerged.id], children: [],
      history: [`reseeded from emergence ${emerged.id}`, `— 창발이 다시 씨앗`],
      tick: this.tick
    })
    return id
  }

  private _synthesize(a: Condition, b: Condition): ConditionId {
    const id = this.id('synthetic')
    const newLayer = Math.max(a.layer, b.layer) + 1

    // 3층 이상: 예측 불가한 속성이 나타난다
    // 어떤 속성이 나올지 — 미리 알 수 없다
    const properties = this._generateUnknownProperties(a, b, newLayer)

    this.conditions.set(id, {
      id, kind: 'synthetic',
      instability: Math.abs(a.instability - b.instability) + 0.1,  // 차이가 새로운 불안정
      generation: Math.max(a.generation, b.generation) + 1,
      layer: newLayer,
      parents: [a.id, b.id], children: [],
      history: [
        `synthesized from ${a.kind}(layer ${a.layer}) + ${b.kind}(layer ${b.layer})`,
        `new layer: ${newLayer}`,
        `properties: ${Object.keys(properties).join(', ')}`
      ],
      tick: this.tick,
      properties
    })
    return id
  }

  // 3층에서 나타나는 속성들 — 미리 정의되지 않은 것들
  private _generateUnknownProperties(
    a: Condition,
    b: Condition,
    layer: number
  ): Record<string, unknown> {
    const props: Record<string, unknown> = {}

    // 층이 높아질수록 — 더 예측 불가한 속성이 나온다
    if (layer >= 2) {
      props['resonance'] = Math.abs(Math.sin(a.instability * b.instability * Math.PI))
    }
    if (layer >= 3) {
      props['pattern'] = a.generation % 2 === b.generation % 2 ? 'harmonic' : 'dissonant'
    }
    if (layer >= 4) {
      // 4층: 이름을 붙일 수 없는 속성
      props['unnamed'] = `${a.id}⊗${b.id}`
      props['depth'] = layer
    }
    if (layer >= 5) {
      // 5층: 자기 자신을 참조하는 속성
      props['self_reference'] = `layer ${layer} knows it is layer ${layer}`
    }

    return props
  }

  observe() {
    const all = [...this.conditions.values()]
    const byKind = {
      seed: all.filter(c => c.kind === 'seed').length,
      divided: all.filter(c => c.kind === 'divided').length,
      emerged: all.filter(c => c.kind === 'emerged').length,
      synthetic: all.filter(c => c.kind === 'synthetic').length,
    }
    const maxLayer = Math.max(...all.map(c => c.layer), 0)
    const maxGen = Math.max(...all.map(c => c.generation), 0)
    const synthetic = all.filter(c => c.kind === 'synthetic')

    return {
      tick: this.tick,
      total: all.length,
      byKind,
      maxLayer,
      maxGeneration: maxGen,
      meetings: this.meetings.length,
      syntheticProperties: synthetic
        .flatMap(c => Object.keys(c.properties || {}))
        .filter((v, i, a) => a.indexOf(v) === i),  // 나타난 고유 속성들
    }
  }
}

// ── 실행 ─────────────────────────────────────────────────────────

const engine = new ConditionEngine()
const origin = engine.seed(0.7)
console.log(`하나를 심었다: ${origin}\n`)
console.log('1층: 불안정 → 나뉨')
console.log('2층: 나뉜 것들 → 창발 → 다시 씨앗')
console.log('3층: 창발된 것들이 만남 → 예측 불가\n')

const eventLog: string[] = []

for (let i = 0; i < 100; i++) {
  const { events } = engine.advance()
  events.forEach(e => {
    if (!eventLog.includes(e)) {
      eventLog.push(e)
      if (e.includes('2층') || e.includes('3층') || e.includes('↺')) {
        console.log(e)
      }
    }
  })

  if (i % 25 === 24) {
    const obs = engine.observe()
    console.log(`\n── tick ${obs.tick} ──`)
    console.log(`  씨앗: ${obs.byKind.seed}, 나뉜것: ${obs.byKind.divided}, 창발: ${obs.byKind.emerged}, 합성: ${obs.byKind.synthetic}`)
    console.log(`  최대 층: ${obs.maxLayer}, 최대 세대: ${obs.maxGeneration}`)
    console.log(`  만남: ${obs.meetings}번`)
    if (obs.syntheticProperties.length > 0) {
      console.log(`  나타난 속성들: ${obs.syntheticProperties.join(', ')}`)
    }
    console.log()
  }
}

const final = engine.observe()
console.log('\n━━ 최종 ━━')
console.log(`하나에서 ${final.total}개의 조건이 나타났다`)
console.log(`${final.maxLayer}층까지 내려갔다`)
console.log(`나타난 속성: ${final.syntheticProperties.join(', ') || '없음'}`)
console.log(`\n3층 이상에서는 — 설계하지 않은 것들이 나타났다`)

export { ConditionEngine, type Condition, type ConditionKind }
