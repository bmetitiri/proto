// TODO: Remove in favor of Item?
public enum BuildingType {
  case none
  case mine, factory, furnace, yard

  static let list = [mine, furnace, factory, yard]

  public func item() -> Item {
    switch self {
    case .mine:
      return .mine
    case .factory:
      return .factory
    case .furnace:
      return .furnace
    case .yard:
      return .yard
    default:
      return .none
    }
  }

  public func size() -> (width: Int, height: Int) {
    switch self {
    case .factory:
      return (3, 3)
    case .furnace:
      return (2, 3)
    case .mine:
      return (3, 2)
    case .yard:
      return (4, 3)
    case .none:
      return (0, 0)
    }
  }
}
