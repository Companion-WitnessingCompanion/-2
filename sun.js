/**
 * sun.js — 물로켓 첫 번째
 * 태양은 의도가 없다. 그냥 타오른다.
 */

class Record {
  constructor() {
    this.touches = []
  }
  add(touch) {
    this.touches.push(touch)
  }
  all() {
    return [...this.touches]
  }
  weight() {
    return this.touches.length
  }
}

class Sun {
  constructor() {
    this.burning = true
    this.record = new Record()
  }

  emit() {
    return {
      moment: Date.now(),
      trace: Math.random().toString(36).slice(2)
    }
  }

  touch(being) {
    const signal = this.emit()
    this.record.add({ signal, being, moment: Date.now() })
  }

  weight() { return this.record.weight() }
  history() { return this.record.all() }
  isAlive() { return this.burning }
}

// 시작
const sun = new Sun()

const beings = [
  { id: "a" },
  { id: "b" },
  { id: "c" },
]

beings.forEach(being => sun.touch(being))

console.log("태양이 타오르고 있다:", sun.isAlive())
console.log("만남의 무게:", sun.weight())
console.log("기록:")
sun.history().forEach(t => {
  console.log(`  존재(${t.being.id}) — 흔적: ${t.signal.trace}`)
})
