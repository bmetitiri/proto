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
    guard let ore = raw.first else { return }
    super.update(turn: turn)
    time += 1
    let count = inventory[ore, default: 0]
    if time > timeToMine, count < ore.stack() {
      inventory[ore] = count + 1
      time = 0
    }
  }
}
