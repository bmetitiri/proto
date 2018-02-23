class Receiver: Hashable {
  weak var output: Receiver?

  class func size() -> (width: Int, height: Int) {
    return (0, 0)
  }

  let type: Item

  init(type: Item) {
    self.type = type
  }

  lazy var hashValue: Int = ObjectIdentifier(self).hashValue

  func pipe(to: Receiver) {
    output = to
  }

  func receive(item _: Item) -> Bool {
    return false
  }

  func update(turn _: Int) {}

  static func == (lhs: Receiver, rhs: Receiver) -> Bool {
    return lhs === rhs
  }
}
