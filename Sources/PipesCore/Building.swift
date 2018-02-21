class Building: Receiver {
  var type: BuildingType
  // TODO: Change to weak references.
  var outputs = Set<Receiver>()

  init(type: BuildingType) {
    self.type = type
  }

  override func pipe(to: Receiver) {
    outputs.insert(to)
  }

  override func receive(item _: Item) -> Bool {
    return false
  }
}
