class Furnace: Building {
  override class func size() -> (width: Int, height: Int) {
    return (2, 3)
  }

  var raw = [Item: Int]()
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
    super.update(turn: turn)
    time += 1
    for (ore, count) in raw {
      if count > 2, time > 10 {
        let made = inventory[ore, default: 0]
        if made < ore.smelt().stack() {
          time = 0
          raw[ore] = count - 2
          inventory[ore.smelt()] = made + 1
        }
      }
    }
  }
}
