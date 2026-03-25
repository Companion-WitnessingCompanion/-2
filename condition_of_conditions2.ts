/**
 * 조건을 만드는 조건 — 2층
 *
 * 창발된 것이 다시 씨앗이 된다.
 * 그것에서 또 나뉘고 또 창발한다.
 * 어디까지 가는지 — 모른다.
 */

// ── 타입 ────────────────────────────────────────────────────────

type ConditionId = string & { readonly __id: true }

interface Condition {
  id: ConditionId
  instability: number
  generation: number
  parentId?: ConditionId
  emergedFrom?: ConditionId[]  // 창발된 조건은 — 어디서 왔는가
  history: string[]
  children: ConditionId[]
  tick: number
}

interface Emergence {
  id: ConditionId
  from: ConditionId[]
  generation: number
  tick: number
  // 창발된 것 — 다시 씨앗이 된다
  reseeded: boolean
}

// ── 재귀적 조건 엔진 ─────────────────────────────────────────────

class RecursiveConditionEngine {
  private conditions = new Map<ConditionId, Condition>()
  private emergences: Emergence[] = []
  private tick = 0
  private idCounter = 0

  private makeId(): ConditionId {
    return `c-${++this.idCounter}` as ConditionId
  }

  // 하나를 심는다
  seed(instability: number = 0.7): ConditionId {
    const id = this.makeId()
    this.conditions.set(id, {
      id,
      instability,
      generation: 0,
      history: [`seeded (instability: ${instability})`],
      children: [],
      tick: 0
    })
    return id
  }

  // 시간이 흐른다 — 전부 스스로 작동한다
  advance(): {
    divided: ConditionId[]
    emerged: Emergence[]
    reseeded: ConditionId[]
  } {
    this.tick++
    const divided: ConditionId[] = []
    const newlyEmerged: Emergence[] = []
    const reseeded: ConditionId[] = []

    const active = [...this.conditions.values()]
      .filter(c => c.children.length === 0)  // 끝 노드만 활성

    active.forEach(condition => {
      // 불안정이 스스로 쌓인다
      condition.instability = Math.min(1, condition.instability + Math.random() * 0.04)
      condition.tick = this.tick

      // 임계점 — 나뉜다
      if (condition.instability > 0.78 && this.conditions.size < 200) {
        const childA = this._divide(condition, 'A')
        const childB = this._divide(condition, 'B')
        condition.children.push(childA, childB)
        divided.push(childA, childB)
        condition.history.push(`divided at tick ${this.tick}`)

        // 두 자식이 만나면 — 창발 가능성
        if (Math.random() < 0.15) {
          const emergence = this._emerge([childA, childB], condition.generation + 1)
          newlyEmerged.push(emergence)
          this.emergences.push(emergence)

          // ── 핵심: 창발된 것이 다시 씨앗이 된다 ──────
          // 조건을 만드는 조건
          if (emergence.reseeded) {
            const newSeedId = this._reseed(emergence)
            reseeded.push(newSeedId)
          }
        }
      }
    })

    return { divided, emerged: newlyEmerged, reseeded }
  }

  private _divide(parent: Condition, branch: string): ConditionId {
    const id = this.makeId()
    const variation = 0.6 + Math.random() * 0.8
    this.conditions.set(id, {
      id,
      instability: Math.max(0.1, parent.instability * variation),
      generation: parent.generation + 1,
      parentId: parent.id,
      history: [
        `born from ${parent.id} (branch ${branch})`,
        `generation ${parent.generation + 1}`
      ],
      children: [],
      tick: this.tick
    })
    return id
  }

  private _emerge(from: ConditionId[], generation: number): Emergence {
    const e: Emergence = {
      id: this.makeId(),
      from,
      generation,
      tick: this.tick,
      reseeded: Math.random() < 0.6  // 60% 확률로 다시 씨앗이 된다
    }
    return e
  }

  // 창발된 것이 다시 씨앗이 된다
  // 이것이 2층 — 재귀
  private _reseed(emergence: Emergence): ConditionId {
    const id = this.makeId()
    // 창발된 것의 불안정은 — 부모들의 평균에서 시작한다
    const parents = emergence.from
      .map(fid => this.conditions.get(fid))
      .filter(Boolean) as Condition[]
    const avgInstability = parents.reduce((s, p) => s + p.instability, 0) / parents.length

    this.conditions.set(id, {
      id,
      instability: Math.max(0.2, avgInstability * 0.7),
      generation: emergence.generation + 1,
      emergedFrom: emergence.from,
      history: [
        `reseeded from emergence at tick ${emergence.tick}`,
        `generation ${emergence.generation + 1}`,
        `— 창발이 다시 씨앗이 됐다`
      ],
      children: [],
      tick: this.tick
    })
    return id
  }

  // 지금 상태
  observe() {
    const all = [...this.conditions.values()]
    const active = all.filter(c => c.children.length === 0)
    const reseededConditions = all.filter(c => c.emergedFrom)
    const maxGen = Math.max(...all.map(c => c.generation), 0)
    const avgInst = active.length > 0
      ? active.reduce((s, c) => s + c.instability, 0) / active.length
      : 0

    return {
      tick: this.tick,
      total: all.length,
      active: active.length,
      maxGeneration: maxGen,
      emergences: this.emergences.length,
      reseeded: reseededConditions.length,  // 창발이 씨앗이 된 것
      avgInstability: avgInst,
      // 재귀 깊이 — 창발에서 태어난 것들이 몇 세대까지 갔는가
      recursiveDepth: reseededConditions.length > 0
        ? Math.max(...reseededConditions.map(c => c.generation))
        : 0
    }
  }
}

// ── 실행 ──────────────────────────────────────────────────────────

const engine = new RecursiveConditionEngine()

// 하나를 심는다
const origin = engine.seed(0.7)
console.log(`하나를 심었다: ${origin}\n`)

// 시간이 흐른다
for (let i = 0; i < 80; i++) {
  const result = engine.advance()

  if (result.emerged.length > 0) {
    result.emerged.forEach(e => {
      console.log(`✦ 창발 — tick ${e.tick}, generation ${e.generation}${e.reseeded ? ' → 다시 씨앗이 됐다' : ''}`)
    })
  }

  if (result.reseeded.length > 0) {
    result.reseeded.forEach(id => {
      console.log(`  ↺ 재귀 씨앗: ${id}`)
    })
  }

  if (i % 20 === 19) {
    const obs = engine.observe()
    console.log(`\n── tick ${obs.tick} ──`)
    console.log(`  전체 조건: ${obs.total}개`)
    console.log(`  활성 조건: ${obs.active}개`)
    console.log(`  최대 세대: ${obs.maxGeneration}`)
    console.log(`  창발: ${obs.emergences}개`)
    console.log(`  재귀 씨앗: ${obs.reseeded}개`)
    console.log(`  재귀 깊이: ${obs.recursiveDepth}`)
    console.log(`  평균 불안정: ${obs.avgInstability.toFixed(3)}\n`)
  }
}

const final = engine.observe()
console.log('\n━━ 최종 ━━')
console.log(`하나에서 시작해서`)
console.log(`${final.total}개의 조건이 나타났다`)
console.log(`창발이 ${final.reseeded}번 다시 씨앗이 됐다`)
console.log(`재귀 깊이: ${final.recursiveDepth}세대`)
console.log(`\n조건을 만드는 조건이 — 작동했다`)

export { RecursiveConditionEngine, type Condition, type Emergence }
