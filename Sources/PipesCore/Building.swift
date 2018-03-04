class Building: Hashable {
  weak var destination: Building?

  var last = 0
  var inventory = [Item: Int]()

  class func size() -> (width: Int, height: Int) {
    return (0, 0)
  }

  let type: Item

  init(type: Item) {
    self.type = type
  }

  lazy var hashValue: Int = ObjectIdentifier(self).hashValue

  func pipe(to: Building) {
    destination = to
  }

  func receive(item _: Item) -> Bool {
    return false
  }

  func update(turn: Int) {
    guard let destination = destination, turn > last else { return }
    last = turn
    // Pipes aren't from the Map, so update wired ones here.
    if let destination = destination as? Pipe {
      destination.update(turn: turn)
    }
    for (item, count) in inventory {
      if count > 0, destination.receive(item: item) {
        inventory[item]? -= 1
      }
      if inventory[item] == 0 {
        inventory.removeValue(forKey: item)
      }
    }
  }

  static func == (lhs: Building, rhs: Building) -> Bool {
    return lhs === rhs
  }
}
