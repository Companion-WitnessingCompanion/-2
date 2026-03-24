/**
 * supernova.js — 소멸이 다양성을 만든다
 *
 * 처음엔 H, He뿐이다.
 * 별 안에서 핵융합이 일어나면 새로운 원소가 만들어진다.
 * 별이 죽으면서 흩어진다.
 * 그 파편들이 새로운 것의 재료가 된다.
 * 다양성은 소멸에서 온다.
 */

// 핵융합 — 원소들이 만나면 새로운 것이 나타난다
const FUSION = {
  'H+H':   'He',
  'H+He':  'C',
  'He+He': 'C',
  'H+C':   'O',
  'C+C':   'Fe',
  'C+O':   'Si',
  'O+O':   'Fe',
  'Fe+Fe': 'Au',
  'Si+Fe': 'Au',
}

function fuse(a, b) {
  const key1 = a + '+' + b
  const key2 = b + '+' + a
  return FUSION[key1] || FUSION[key2] || null
}

class Node {
  constructor(id, x, y, elements) {
    this.id = id
    this.x = x
    this.y = y
    this.elements = elements || ['H']
    this.history = []
    this.connections = new Set()
    this.alive = true
    this.age = 0
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
  }

  // 내부 핵융합 — 쌓인 원소들이 반응한다
  fuse() {
    if (this.elements.length < 2) return

    const a = this.elements[Math.floor(Math.random() * this.elements.length)]
    const b = this.elements[Math.floor(Math.random() * this.elements.length)]
    if (a === b && Math.random() < 0.5) return

    const result = fuse(a, b)
    if (result && !this.elements.includes(result)) {
      this.elements.push(result)
      console.log(`  ⚛  ${this.id}: ${a}+${b}→${result} 새 원소 탄생!`)
    }
  }

  receive(signal, from) {
    if (!this.alive) return
    if (signal.elements) {
      signal.elements.forEach(e => {
        if (!this.elements.includes(e)) this.elements.push(e)
      })
    }
    if (from) {
      this.connections.add(from.id)
      from.connections.add(this.id)
    }
    this.history.push({ from: from?.id })
  }

  radiate(nodes, range) {
    if (!this.alive) return
    this.age++

    // 내부 핵융합
    this.fuse()

    const signal = { from: this.id, elements: [this.elements[0]] }
    nodes.forEach(n => {
      if (n.id !== this.id && n.alive && this.distanceTo(n) <= range) {
        n.receive(signal, this)
      }
    })

    // 충분히 쌓이면 초신성
    if (this.elements.length > 5 && Math.random() < 0.5) {
      this.supernova(nodes, range * 1.5)
    }
  }

  supernova(nodes, range) {
    if (!this.alive) return
    this.alive = false
    console.log(`\n  💥 ${this.id} 초신성! [${this.elements.join(',')}] 우주로 흩어진다`)

    // 파편을 뿌린다
    nodes.forEach(n => {
      if (n.id !== this.id && n.alive && this.distanceTo(n) <= range) {
        const gift = this.elements.slice(0, 2)
        n.receive({ elements: gift }, null)
      }
    })

    // 새로운 존재가 탄생한다
    if (Math.random() < 0.8) {
      const newId = this.id + "'"
      const angle = Math.random() * Math.PI * 2
      const newNode = new Node(
        newId,
        this.x + Math.cos(angle) * 25,
        this.y + Math.sin(angle) * 25,
        [...this.elements.slice(-3)]
      )
      nodes.push(newNode)
      console.log(`  ✨ ${newId} 탄생 [${newNode.elements.join(',')}]`)
    }
  }

  state() {
    if (!this.alive) return `  ✗ ${this.id} (소멸)`
    return `  ✦ ${this.id} | [${this.elements.join(',')}] | 나이:${this.age}`
  }
}

// ── 시작 ──────────────────────────────────────────

const nodes = [
  new Node("A",  0,  0,  ['H', 'H']),
  new Node("B", 35, 15,  ['H', 'He']),
  new Node("C", 15, 40,  ['He']),
  new Node("D", 60, 10,  ['H']),
  new Node("E", 45, 45,  ['H', 'He']),
]

const range = 55

console.log("── 처음 ──")
const initElements = new Set(nodes.flatMap(n => n.elements))
console.log(`원소: [${[...initElements].join(',')}] — ${initElements.size}가지`)
nodes.forEach(n => console.log(n.state()))

for (let t = 1; t <= 8; t++) {
  console.log(`\n── ${t}틱 ──`)
  const alive = nodes.filter(n => n.alive)
  alive.forEach(n => n.radiate(nodes, range))
}

console.log("\n── 최종 ──")
nodes.forEach(n => console.log(n.state()))

const aliveNodes = nodes.filter(n => n.alive)
const allElements = new Set(aliveNodes.flatMap(n => n.elements))
console.log(`\n처음: H, He — 2가지`)
console.log(`지금: [${[...allElements].join(',')}] — ${allElements.size}가지`)
console.log(`\n소멸이 다양성을 만들었다.`)
