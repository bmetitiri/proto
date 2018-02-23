class Receiver: Hashable {
  class func size() -> (width: Int, height: Int) {
    return (0, 0)
  }

  let type: Item

  init(type: Item) {
    self.type = type
  }

  lazy var hashValue: Int = ObjectIdentifier(self).hashValue

  func pipe(to _: Receiver) {}

  func receive(item _: Item) -> Bool {
    return false
  }

  func update(turn _: Int) {}

  static func == (lhs: Receiver, rhs: Receiver) -> Bool {
    return lhs === rhs
  }
}
