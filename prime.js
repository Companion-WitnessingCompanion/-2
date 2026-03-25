/**
 * prime.js — 소수의 조건
 *
 * 소수는 나눌 수 없다.
 * 소수는 예측할 수 없이 나타난다.
 * 소수는 모든 것의 바탕이다.
 *
 * 코드도 그렇게 작동할 수 있을까.
 */

// ── 소수 확인 ──────────────────────────────────────
// 더 이상 나눌 수 없는가
function isPrime(n) {
  if (n < 2) return false
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false
  }
  return true
}

// ── 소수의 본질 세 가지 ────────────────────────────

// 1. 나눌 수 없다 — 고유성
// 존재가 더 이상 분해되지 않는 상태
class Prime {
  constructor(value) {
    if (!isPrime(value)) {
      throw new Error(`${value}는 소수가 아니다 — 나눌 수 있다`)
    }
    this.value = value
    this.indivisible = true   // 나눌 수 없다
    this.unique = true        // 고유하다
  }

  // 소수는 자기 자신으로만 돌아온다
  factor() {
    return [this.value]  // 소인수 = 자기 자신
  }

  toString() {
    return `${this.value}(소수)`
  }
}

// 2. 예측할 수 없다 — 번쩍
// 다음 소수가 언제 나타날지 모른다
// 찾아야만 보인다
function* primeGenerator() {
  let n = 2
  while (true) {
    if (isPrime(n)) {
      yield n  // 나타났다 — 번쩍
    }
    n++
  }
}

// 3. 모든 것의 바탕이다 — 조건
// 모든 수는 소수의 곱
function factorize(n) {
  const factors = []
  let d = 2
  while (d * d <= n) {
    while (n % d === 0) {
      factors.push(d)
      n = Math.floor(n / d)
    }
    d++
  }
  if (n > 1) factors.push(n)
  return factors
}

// ── 소수가 조건이 되는 구조 ────────────────────────
// 소수처럼 작동하는 존재
// 나눌 수 없고. 예측할 수 없고. 바탕이 된다.
class PrimeBeing {
  constructor(id, primeValue) {
    this.id = id
    this.prime = new Prime(primeValue)
    this.connections = new Set()
    this.isBase = false  // 다른 것의 바탕이 되었는가
  }

  // 두 소수 존재가 만나면 — 새로운 수가 만들어진다
  meet(other) {
    const product = this.prime.value * other.prime.value
    console.log(`  ${this.prime} × ${other.prime} = ${product}`)

    this.connections.add(other.id)
    other.connections.add(this.id)

    this.isBase = true
    other.isBase = true

    // 만들어진 수의 소인수는 — 다시 원래 둘로 돌아온다
    const factors = factorize(product)
    console.log(`  ${product}의 바탕: [${factors.join(' × ')}] — 원래 소수들이다`)

    return product
  }

  state() {
    const base = this.isBase ? ' (바탕이 됨)' : ''
    return `  ${this.id}[${this.prime.value}] 연결:${this.connections.size}개${base}`
  }
}

// ── 소수의 출현 ────────────────────────────────────
// 예측할 수 없이 — 나타난다
function watchPrimes(limit) {
  console.log("\n── 소수가 나타난다 ──")
  console.log("언제 나타날지 모른다. 찾아야만 보인다.")

  const gen = primeGenerator()
  const primes = []
  let prev = 0

  while (true) {
    const p = gen.next().value
    if (p > limit) break

    const gap = p - prev
    const bar = '░'.repeat(gap)
    console.log(`  ${bar}✦${p} (간격: ${gap})`)
    primes.push(p)
    prev = p
  }

  console.log(`\n${limit}까지 소수: ${primes.length}개`)
  console.log(`예측할 수 없는 간격으로 — 나타났다`)
  return primes
}

// ── 시작 ──────────────────────────────────────────

console.log("════════════════════════════")
console.log("소수의 조건")
console.log("나눌 수 없다. 예측할 수 없다. 바탕이 된다.")
console.log("════════════════════════════")

// 소수들의 출현
const primes = watchPrimes(50)

// 소수 존재들
console.log("\n── 소수 존재들 ──")
const beings = [
  new PrimeBeing("A", 2),
  new PrimeBeing("B", 3),
  new PrimeBeing("C", 5),
  new PrimeBeing("D", 7),
  new PrimeBeing("E", 11),
]

beings.forEach(b => console.log(b.state()))

// 소수 존재들이 만난다
console.log("\n── 만남 ──")
console.log("소수들이 만나면 — 새로운 것이 만들어진다")
console.log("근데 그 안에는 — 항상 원래 소수들이 있다")
beings[0].meet(beings[1])  // 2 × 3 = 6
beings[1].meet(beings[2])  // 3 × 5 = 15
beings[2].meet(beings[3])  // 5 × 7 = 35
beings[0].meet(beings[4])  // 2 × 11 = 22

// 결과
console.log("\n── 결과 ──")
beings.forEach(b => console.log(b.state()))

// 소수와 수소
console.log("\n════════════════════════════")
console.log("소수와 수소")
console.log("════════════════════════════")
console.log("2 — 가장 작은 소수. 유일한 짝수 소수.")
console.log("수소 — 가장 단순한 원소. 우주의 75%.")
console.log("")
console.log("2 × 2 × ... → 더 큰 수들의 바탕")
console.log("H + H → He → C → O → 별 → 생명")
console.log("")
console.log("같은 구조. 다른 언어.")
console.log("가장 단순한 것에서 — 가장 복잡한 것이 나온다.")
console.log("════════════════════════════")
