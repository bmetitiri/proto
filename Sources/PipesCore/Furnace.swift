// TODO: Merge commonalities with Factory.
class Furnace: Building {
  var raw = [Item: Int]()
  var produced = [Item: Int]()
  var time = 0

  init() {
    super.init(type: .furnace)
  }

  override func receive(item: Item) -> Bool {
    if item.smelt() != .none {
      let count = raw[item, default: 0]
      if count < item.stack() {
        raw[item] = count + 1
        return true
      }
    }
    return super.receive(item: item)
  }

  override func update(turn: Int) {
    time += 1
    for (ore, count) in raw {
      if count > 2, time > 10 {
        let made = produced[ore, default: 0]
        if made < ore.smelt().stack() {
          time = 0
          raw[ore] = count - 2
          produced[ore.smelt()] = made + 1
        }
      }
    }
    for output in outputs {
      output.update(turn: turn)
      for (item, count) in produced {
        if count > 0, output.receive(item: item) {
          produced[item]? -= 1
        }
      }
    }
  }
}
