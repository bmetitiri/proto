class Factory: Receiver {
  override class func size() -> (width: Int, height: Int) {
    return (3, 3)
  }

  init() {
    super.init(type: .factory)
  }

  var raw = [Item: Int]()
  var produced = [Item: Int]()
  var time = 0
  var target = Item.none

  override func receive(item: Item) -> Bool {
    guard let recipe = target.recipe() else { return false }
    if recipe.keys.contains(item) {
      let count = raw[item, default: 0]
      if count < item.stack() {
        raw[item] = count + 1
        return true
      }
    }
    return super.receive(item: item)
  }

  override func update(turn: Int) {
    guard let recipe = target.recipe() else { return }
    if stocked() {
      time += 1
      if time > 10 {
        let made = produced[target, default: 0]
        if made < target.stack() {
          time = 0
          for (part, count) in recipe {
            raw[part]? -= count
          }
          produced[target] = made + 1
        }
      }
    }
    guard let output = output else { return }
    output.update(turn: turn)
    for (item, count) in produced {
      if count > 0, output.receive(item: item) {
        produced[item]? -= 1
      }
    }
  }

  private func stocked() -> Bool {
    guard let recipe = target.recipe() else { return false }
    for (part, count) in recipe {
      if raw[part, default: 0] < count {
        return false
      }
    }
    return true
  }
}
