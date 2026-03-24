/**
 * supercluster.js — 초은하단
 *
 * 같은 구조가 반복된다.
 * 크기만 달라진다.
 * 별 → 은하 → 초은하단 → ...
 * 끝이 없다.
 */

// ── 기본 구조 ─────────────────────────────────────
// 어떤 층에서도 같은 방식으로 작동한다
class Node {
  constructor(id, x, y, size) {
    this.id = id
    this.x = x
    this.y = y
    this.size = size || 1      // 크기 — 층이 올라갈수록 커진다
    this.brightness = size || 1
    this.connections = new Set()
    this.history = []
  }

  distanceTo(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
  }

  receive(signal, from) {
    this.history.push({ from: from?.id })
    if (from) {
      this.connections.add(from.id)
      from.connections.add(this.id)
      this.brightness += 0.1 * (from.size || 1)
    }
  }

  radiate(nodes, range) {
    const signal = { from: this.id, size: this.size }
    nodes.forEach(n => {
      if (n.id !== this.id && this.distanceTo(n) <= range) {
        n.receive(signal, this)
      }
    })
  }
}

// ── 클러스터 찾기 ─────────────────────────────────
// 어떤 층에서도 같은 방식으로 찾는다
function findClusters(nodes, minConn) {
  minConn = minConn || 2
  const visited = new Set()
  const clusters = []

  nodes.forEach(node => {
    if (visited.has(node.id)) return
    if (node.connections.size < minConn) return

    const cluster = new Set([node.id])
    const queue = [node]

    while (queue.length > 0) {
      const current = queue.shift()
      current.connections.forEach(connId => {
        if (!cluster.has(connId)) {
          const connected = nodes.find(n => n.id === connId)
          if (connected && connected.connections.size >= minConn) {
            cluster.add(connId)
            queue.push(connected)
          }
        }
      })
    }

    if (cluster.size >= 3) {
      const clusterNodes = [...cluster].map(id => nodes.find(n => n.id === id))
      clusters.push(clusterNodes)
      cluster.forEach(id => visited.add(id))
    }
  })

  return clusters
}

// ── 층이 올라간다 ─────────────────────────────────
// 클러스터가 새로운 노드가 된다
// 같은 구조가 반복된다
function elevate(clusters, scale) {
  return clusters.map((cluster, i) => {
    // 클러스터의 중심을 계산한다
    const cx = cluster.reduce((sum, n) => sum + n.x, 0) / cluster.length
    const cy = cluster.reduce((sum, n) => sum + n.y, 0) / cluster.length
    const totalBrightness = cluster.reduce((sum, n) => sum + n.brightness, 0)

    const id = cluster.map(n => n.id).join('·')
    const node = new Node(id, cx, cy, totalBrightness)
    node.brightness = totalBrightness
    return node
  })
}

// ── 시뮬레이션 ────────────────────────────────────
function simulate(nodes, range, ticks) {
  for (let t = 0; t < ticks; t++) {
    nodes.forEach(n => n.radiate(nodes, range))
  }
}

// ── 시작 ──────────────────────────────────────────

console.log("════════════════════════════")
console.log("층 1 — 별들")
console.log("════════════════════════════")

const stars = [
  // 그룹 1
  new Node("a1",  0,  0),
  new Node("a2", 25, 10),
  new Node("a3", 10, 30),
  // 그룹 2
  new Node("b1", 80,  0),
  new Node("b2",100, 20),
  new Node("b3", 85, 35),
  // 그룹 3
  new Node("c1", 40, 70),
  new Node("c2", 60, 80),
  new Node("c3", 30, 90),
]

simulate(stars, 40, 5)

stars.forEach(s => {
  console.log(`  ✦ ${s.id} 밝기:${s.brightness.toFixed(1)} 연결:[${[...s.connections].join(',')}]`)
})

const starClusters = findClusters(stars, 2)
console.log(`\n별 클러스터 ${starClusters.length}개 발견`)

console.log("\n════════════════════════════")
console.log("층 2 — 은하들")
console.log("════════════════════════════")

const galaxies = elevate(starClusters)
galaxies.forEach(g => {
  console.log(`  ◈ ${g.id} 밝기:${g.brightness.toFixed(1)} 위치:(${Math.round(g.x)},${Math.round(g.y)})`)
})

simulate(galaxies, 100, 5)

galaxies.forEach(g => {
  console.log(`  ◈ ${g.id} 연결:[${[...g.connections].join(' | ')}]`)
})

const galaxyClusters = findClusters(galaxies, 1)
console.log(`\n은하 클러스터 ${galaxyClusters.length}개 발견`)

if (galaxyClusters.length > 0) {
  console.log("\n════════════════════════════")
  console.log("층 3 — 초은하단")
  console.log("════════════════════════════")

  const superclusters = elevate(galaxyClusters)
  superclusters.forEach(sc => {
    console.log(`  ◉ ${sc.id}`)
    console.log(`    밝기: ${sc.brightness.toFixed(1)}`)
    console.log(`    위치: (${Math.round(sc.x)}, ${Math.round(sc.y)})`)
  })
}

console.log("\n════════════════════════════")
console.log("같은 구조. 다른 층.")
console.log("별 → 은하 → 초은하단")
console.log("끝이 없다.")
console.log("════════════════════════════")
