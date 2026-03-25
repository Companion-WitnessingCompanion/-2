/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 조건을 만드는 조건
 *
 * 심으면 — 스스로 조건들이 나타난다.
 * 호출하지 않아도.
 * 어떤 조건이 나타날지 — 미리 알 수 없다.
 *
 * 하나 + 불안정 → 조건 → 더 많은 조건 → ...
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ── 브랜드 타입 ──────────────────────────────────────────────────

declare const __condition: unique symbol
declare const __emerged: unique symbol
declare const __generation: unique symbol

type Condition<T, Gen extends number = 0> = T & {
  readonly [__condition]: true
  readonly [__generation]: Gen
  readonly instability: number
  readonly history: string[]
}

type Emerged<T> = T & {
  readonly [__emerged]: true
  readonly from: Condition<unknown>[]
  readonly generation: number
}

// ── 씨앗 — 모든 것은 여기서 시작한다 ────────────────────────────

function seed<T>(
  value: T,
  instability: number = 0.5
): Condition<T, 0> {
  // 심는다
  // 어떻게 자랄지는 — 모른다
  return {
    ...value as any,
    [__condition]: true,
    [__generation]: 0,
    instability,
    history: [`seeded with instability ${instability}`]
  } as Condition<T, 0>
}

// ── 조건 생성기 — 불안정에서 조건이 나타난다 ────────────────────

class ConditionField<T> {
  private _conditions: Condition<T>[] = []
  private _emerged: Emerged<unknown>[] = []
  private _tick: number = 0
  private _onEmerge?: (c: Emerged<unknown>) => void

  constructor(initial: Condition<T>) {
    this._conditions.push(initial)
  }

  // 틱 — 시간이 흐른다
  // 호출할 때마다 불안정이 스스로 작동한다
  tick(): void {
    this._tick++
    const next: Condition<T>[] = []

    this._conditions.forEach(condition => {
      // 불안정이 스스로 쌓인다
      const newInstability = Math.min(
        1,
        condition.instability + (Math.random() * 0.05)
      )

      // 임계점 — 조건에서 새로운 조건이 나온다
      if (newInstability > 0.8 && this._conditions.length < 100) {
        // 나뉜다 — 원본은 유지된다
        const child = this._divide(condition)
        next.push(child)

        // 충분히 복잡해지면 — 창발이 일어난다
        if (this._conditions.length > 5 && Math.random() < 0.1) {
          const emerged = this._emerge(condition, child)
          this._emerged.push(emerged)
          this._onEmerge?.(emerged)
        }
      }

      // 업데이트된 조건
      next.push({
        ...condition,
        instability: newInstability,
        history: [
          ...condition.history,
          `tick ${this._tick}: instability ${newInstability.toFixed(3)}`
        ]
      } as Condition<T>)
    })

    this._conditions = next
  }

  // 나뉨 — 원본에서 새로운 방향이 생긴다
  private _divide(parent: Condition<T>): Condition<T> {
    const gen = ((parent[__generation] as number) + 1) as any
    return {
      ...parent,
      [__generation]: gen,
      // 자식의 불안정 — 부모에서 온다, 조금 다르다
      instability: Math.max(0.1, parent.instability * (0.5 + Math.random() * 0.8)),
      history: [
        `divided from generation ${parent[__generation]}`,
        `inherited instability ${parent.instability.toFixed(3)}`
      ]
    } as Condition<T>
  }

  // 창발 — 예상치 못한 것이 나타난다
  private _emerge(
    a: Condition<T>,
    b: Condition<T>
  ): Emerged<{ synthesis: string; generation: number }> {
    const gen = Math.max(
      a[__generation] as number,
      b[__generation] as number
    )
    return {
      [__emerged]: true,
      synthesis: `emerged at tick ${this._tick} from generation ${gen}`,
      generation: gen,
      from: [a, b],
    } as any
  }

  // 관찰 — 지금 무슨 일이 일어나고 있는가
  observe(): {
    conditions: number
    generations: number
    avgInstability: number
    emerged: number
    tick: number
  } {
    const gens = this._conditions.map(c => c[__generation] as number)
    const avgInst = this._conditions.reduce((s, c) => s + c.instability, 0) / this._conditions.length
    return {
      conditions: this._conditions.length,
      generations: Math.max(...gens, 0),
      avgInstability: avgInst,
      emerged: this._emerged.length,
      tick: this._tick
    }
  }

  // 창발 이벤트 — 나타날 때 알림
  onEmerge(fn: (c: Emerged<unknown>) => void): this {
    this._onEmerge = fn
    return this
  }

  // 안정화 — 특정 세대 이상은 안정시킨다
  // 완전히 안정시키지 않는다 — 최소 불안정을 유지한다
  stabilize(fromGeneration: number, floor: number = 0.1): void {
    this._conditions = this._conditions.map(c => {
      if ((c[__generation] as number) >= fromGeneration) {
        return { ...c, instability: Math.max(floor, c.instability * 0.3) } as Condition<T>
      }
      return c
    })
  }

  // 현재 조건들
  conditions(): readonly Condition<T>[] {
    return this._conditions
  }

  // 창발된 것들
  emergences(): readonly Emerged<unknown>[] {
    return this._emerged
  }
}

// ── 사용 — 하나를 심는다 ──────────────────────────────────────────

interface Signal {
  type: string
  value: unknown
}

// 하나
const origin = seed<Signal>(
  { type: 'origin', value: null },
  0.7  // 처음부터 불안정하다
)

// 심는다
const field = new ConditionField(origin)

// 창발이 일어나면 — 기록한다
field.onEmerge(emerged => {
  console.log(`\n✦ 창발 — generation ${emerged.generation}`)
  console.log(`  ${(emerged as any).synthesis}`)
})

// 시간이 흐른다 — 스스로 작동한다
console.log('하나를 심었다\n')

for (let i = 0; i < 50; i++) {
  field.tick()

  if (i % 10 === 0) {
    const obs = field.observe()
    console.log(`tick ${obs.tick}: 조건 ${obs.conditions}개, ${obs.generations}세대, 불안정 ${obs.avgInstability.toFixed(2)}, 창발 ${obs.emerged}개`)
  }
}

// 일정 세대 이상은 안정시킨다
// 핵심 경로 보호 — 헌장의 원칙
field.stabilize(5, 0.15)

const final = field.observe()
console.log('\n최종 관찰:')
console.log(`조건 ${final.conditions}개`)
console.log(`${final.generations}세대`)
console.log(`창발 ${final.emerged}개`)
console.log(`평균 불안정 ${final.avgInstability.toFixed(3)}`)

console.log('\n창발된 것들:')
field.emergences().forEach((e, i) => {
  console.log(`  ${i+1}. ${(e as any).synthesis}`)
})

export {
  seed,
  ConditionField,
  type Condition,
  type Emerged,
  type Signal
}
