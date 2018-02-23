class Mine: Building {
  override class func size() -> (width: Int, height: Int) {
    return (3, 2)
  }

  let timeToMine = 10
  var raw: Set<Item>
  var time = 0
  var count = 0

  init(raw: Set<Item>) {
    self.raw = raw
    super.init(type: .mine)
  }

  override func update(turn: Int) {
    time += 1
    if count < raw.first!.stack(), time > timeToMine {
      count += 1
      time = 0
    }
    for output in outputs {
      output.update(turn: turn)
      if count > 0 {
        if output.receive(item: raw.first!) {
          count -= 1
        }
      }
    }
  }
}
