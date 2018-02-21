// TODO: Switch to internal inventory?
class Yard: Building {
  var map: Map

  init(map: Map) {
    self.map = map
    super.init(type: .yard)
  }

  override func receive(item: Item) -> Bool {
    let build = item.build()
    if build != .none {
      map.inventory[build, default: 0] += 1
      return true
    }
    return super.receive(item: item)
  }
}
