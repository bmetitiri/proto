public struct Node {
  weak var value: Receiver?
  var ore: Item

  public func type() -> Item {
    guard let value = value else { return ore }
    return value.type
  }

  public func subtype() -> Item {
    switch value {
    case let pipe as Pipe:
      return pipe.content
    case let factory as Factory:
      return factory.target
    default:
      return .none
    }
  }

  public func options() -> [Item] {
    switch value {
    case is Factory:
      return Item.list.filter { $0.recipe() != nil }
    default:
      return []
    }
  }

  public func select(item: Item) {
    guard options().contains(item) else { return }
    switch value {
    case let factory as Factory:
      factory.target = item
    default:
      break
    }
  }
}
