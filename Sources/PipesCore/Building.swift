class Building: Receiver {
  // TODO: Change to weak references.
  var outputs = Set<Receiver>()

  override func pipe(to: Receiver) {
    outputs.insert(to)
  }

  override func receive(item _: Item) -> Bool {
    return false
  }
}
