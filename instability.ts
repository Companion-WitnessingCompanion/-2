/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 불안정의 가능성 — 핵심 조건으로서
 *
 * 오늘 탐색에서 나온 것:
 * 완전히 안정된 것은 아무것도 일어나지 않는다.
 * 불안정의 가능성이 — 조건이다.
 *
 * 이 코드는 불안정을 제거하지 않는다.
 * 어디서 불안정을 허용하고
 * 어디서 안정을 유지할지 — 그 경계를 설계한다.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ── 브랜드 타입 — 불안정이 통과했는지 추적한다 ──────────────────

type Stable<T> = T & { readonly __stable: true }
type Unstable<T> = T & { readonly __unstable: true; readonly __tension: number }
type Emerged<T> = T & { readonly __emerged: true; readonly __from: string }

// ── 불안정의 수준 ────────────────────────────────────────────────

interface InstabilityLevel {
  value: number        // 0 = 완전 안정 (아무것도 안 일어남), 1 = 임계점
  source: string       // 어디서 온 불안정인가
  history: string[]    // 어떻게 쌓였는가
}

// ── 핵심 — 불안정을 의도적으로 설계하는 컨테이너 ───────────────

class UnstableField<T> {
  private _value: T
  private _instability: InstabilityLevel
  private _threshold: number
  private _history: Array<{ value: T; tension: number; moment: number }>

  constructor(
    initial: T,
    opts: {
      instability?: number    // 초기 불안정 수준
      threshold?: number      // 임계점 — 넘으면 창발
      source?: string
    } = {}
  ) {
    this._value = initial
    this._threshold = opts.threshold ?? 0.8
    this._instability = {
      value: opts.instability ?? 0.3,
      source: opts.source ?? 'unknown',
      history: [`created with instability ${opts.instability ?? 0.3}`]
    }
    this._history = [{ value: initial, tension: this._instability.value, moment: Date.now() }]
  }

  // 읽기 — 항상 같지 않다. 불안정 수준에 따라 달라진다.
  read(): T | Unstable<T> {
    if (this._instability.value > 0.5) {
      // 불안정이 높으면 — 값이 흔들린다는 것을 표시한다
      return Object.assign({}, this._value as any, {
        __unstable: true,
        __tension: this._instability.value
      }) as Unstable<T>
    }
    return this._value
  }

  // 쓰기 — 불안정을 쌓는다
  write(next: T, reason: string): void {
    const prev = this._value
    this._value = next
    this._instability.value = Math.min(1, this._instability.value + 0.1)
    this._instability.history.push(`${reason} (tension: ${this._instability.value.toFixed(2)})`)
    this._history.push({ value: next, tension: this._instability.value, moment: Date.now() })

    // 임계점을 넘으면 — 창발을 알린다
    if (this._instability.value >= this._threshold) {
      this._instability.history.push('threshold reached — emergence possible')
    }
  }

  // 안정화 — 의도적으로 안정시킨다
  // 완전히 안정시키지 않는다 — 최소한의 불안정을 유지한다
  stabilize(floor: number = 0.1): Stable<T> {
    this._instability.value = Math.max(floor, this._instability.value * 0.5)
    this._instability.history.push(`stabilized to ${this._instability.value.toFixed(2)} (floor: ${floor})`)
    return Object.assign({}, this._value as any, { __stable: true }) as Stable<T>
  }

  // 창발 — 임계점을 넘으면 새로운 것이 나타난다
  emerge<R>(
    transform: (current: T, history: typeof this._history) => R,
    reason: string
  ): Emerged<R> | null {
    if (this._instability.value < this._threshold) {
      // 아직 임계점 미만 — 창발 없음
      return null
    }
    const result = transform(this._value, this._history)
    this._instability.value = 0.1  // 창발 후 — 다시 시작
    this._instability.history.push(`emerged: ${reason}`)
    return Object.assign({}, result as any, {
      __emerged: true,
      __from: reason
    }) as Emerged<R>
  }

  // 상태 — 지금 어디에 있는가
  status(): {
    tension: number
    atThreshold: boolean
    history: string[]
    writtenTimes: number
  } {
    return {
      tension: this._instability.value,
      atThreshold: this._instability.value >= this._threshold,
      history: this._instability.history,
      writtenTimes: this._history.length
    }
  }
}

// ── 관계 — 불안정이 전달된다 ─────────────────────────────────────

class UnstableRelation<A, B> {
  private _fieldA: UnstableField<A>
  private _fieldB: UnstableField<B>
  private _transfers: number = 0

  constructor(a: UnstableField<A>, b: UnstableField<B>) {
    this._fieldA = a
    this._fieldB = b
  }

  // 만남 — 불안정이 서로에게 전달된다
  meet(reason: string): void {
    const statusA = this._fieldA.status()
    const statusB = this._fieldB.status()

    // 더 불안정한 것이 덜 불안정한 것을 흔든다
    if (statusA.tension > statusB.tension) {
      // A가 B를 흔든다
      const transfer = (statusA.tension - statusB.tension) * 0.1
      this._fieldB.write(this._fieldB.read() as B, `disturbed by relation: ${reason} (+${transfer.toFixed(3)})`)
    } else {
      // B가 A를 흔든다
      const transfer = (statusB.tension - statusA.tension) * 0.1
      this._fieldA.write(this._fieldA.read() as A, `disturbed by relation: ${reason} (+${transfer.toFixed(3)})`)
    }

    this._transfers++
  }

  transfers(): number { return this._transfers }
}

// ── 사용 예시 ─────────────────────────────────────────────────────

// 예시 1 — 코드 시스템에서 불안정을 설계한다
interface UserDecision {
  choice: string
  confidence: number
}

// 사용자의 결정은 — 처음엔 불안정하다
const decision = new UnstableField<UserDecision>(
  { choice: 'unknown', confidence: 0 },
  { instability: 0.7, threshold: 0.9, source: 'user-input' }
)

// 상태 추가 — 불안정이 쌓인다
decision.write({ choice: 'option-A', confidence: 0.3 }, 'first attempt')
decision.write({ choice: 'option-A', confidence: 0.5 }, 'reconsidered')
decision.write({ choice: 'option-B', confidence: 0.4 }, 'changed mind')

// 임계점에 도달했는가
const status = decision.status()
console.log('tension:', status.tension)
console.log('at threshold:', status.atThreshold)
console.log('history:', status.history)

// 창발 — 충분히 불안정해지면 새로운 것이 나타난다
const emerged = decision.emerge(
  (current, history) => ({
    finalChoice: current.choice,
    confidence: current.confidence,
    iterations: history.length,
    // 역사를 보고 패턴을 찾는다
    pattern: history.length > 3 ? 'oscillating' : 'converging'
  }),
  'decision-emerged-from-uncertainty'
)

if (emerged) {
  console.log('창발:', emerged)
  console.log('패턴:', emerged.pattern)
}

// 예시 2 — 두 시스템이 만날 때 불안정이 전달된다
interface Config { value: string }
interface State { phase: string }

const configField = new UnstableField<Config>(
  { value: 'initial' },
  { instability: 0.2, source: 'config' }
)

const stateField = new UnstableField<State>(
  { phase: 'idle' },
  { instability: 0.6, source: 'runtime' }
)

const relation = new UnstableRelation(configField, stateField)

// 만남 — 불안정이 전달된다
relation.meet('system-startup')
relation.meet('config-change')

console.log('config tension after meeting:', configField.status().tension)
console.log('state tension after meeting:', stateField.status().tension)
console.log('transfers:', relation.transfers())

export {
  UnstableField,
  UnstableRelation,
  type Stable,
  type Unstable,
  type Emerged,
  type InstabilityLevel
}
