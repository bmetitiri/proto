class Pipe: Receiver {
  weak var output: Receiver?
  var send = false
  var content = Item.none
  var last = 0

  init() {
    super.init(type: .pipe)
  }

  override func pipe(to: Receiver) {
    output = to
  }

  override func receive(item: Item) -> Bool {
    switch content {
    case .none:
      content = item
      return true
    default:
      return false
    }
  }

  override func update(turn: Int) {
    if let output = output, turn > last {
      last = turn
      if let output = output as? Pipe, output.last < turn {
        output.update(turn: turn)
      }
      if output.receive(item: content) {
        content = Item.none
      }
    }
  }
}
