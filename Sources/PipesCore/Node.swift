public struct Node {
  weak var value: Receiver?
  var ore: Item

  public func type() -> Item {
    switch value {
    case let pipe as Pipe:
      if pipe.content != .none {
        return pipe.content
      } else {
        return .empty_pipe
      }
    case let building as Building:
      return building.type.item()
    case is Wall:
      return .wall
    default:
      return ore
    }
  }

  // TODO: Also not sure about this interface.
  public var craft: Item {
    get {
      switch value {
      case let factory as Factory:
        return factory.target
      default:
        return .none
      }
    }
    set(item) {
      switch value {
      case let factory as Factory:
        factory.target = item
      default:
        break
      }
    }
  }
}
