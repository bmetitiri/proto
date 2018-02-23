// TODO: Switch to internal inventory?
class Yard: Receiver {
  override class func size() -> (width: Int, height: Int) {
    return (4, 3)
  }

  var map: Map

  init(map: Map) {
    self.map = map
    super.init(type: .yard)
  }

  override func receive(item: Item) -> Bool {
    if item != .none {
      map.inventory[item, default: 0] += 1
      return true
    }
    return super.receive(item: item)
  }
}
