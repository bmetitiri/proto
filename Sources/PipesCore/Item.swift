public enum Item {
  case none
  case copper_ore, iron_ore, stone
  case copper, iron
  case circuit, gear, pipe
  case factory, furnace, mine, yard
  case wall

  public static let list = [
    copper_ore, iron_ore, stone,
    copper, iron,
    circuit, gear, pipe,
    factory, furnace, mine, yard,
  ]

  public func size() -> (width: Int, height: Int) {
    guard let b = build() else { return (0, 0) }
    return b.size()
  }

  func build() -> Building.Type? {
    switch self {
    case .mine:
      return Mine.self
    case .factory:
      return Factory.self
    case .furnace:
      return Furnace.self
    case .yard:
      return Yard.self
    default:
      return nil
    }
  }

  func recipe() -> Dictionary<Item, Int>? {
    switch self {
    case .circuit:
      return [.copper: 3]
    case .gear:
      return [.iron: 2]
    case .pipe:
      return [.iron: 4]
    case .factory:
      return [.circuit: 2, .gear: 2, .pipe: 2]
    case .furnace:
      return [.gear: 2, .stone: 2]
    case .mine:
      return [.gear: 2, .pipe: 2]
    case .yard:
      return [.factory: 4, .gear: 4]
    default:
      return nil
    }
  }

  func smelt() -> Item {
    switch self {
    case .copper_ore:
      return .copper
    case .iron_ore:
      return .iron
    default:
      return .none
    }
  }

  func stack() -> Int {
    switch self {
    case .none:
      return 0
    case .copper_ore, .iron_ore, .stone:
      return 20
    case .copper, .iron:
      return 10
    case .circuit, .gear, .pipe:
      return 5
    default:
      return 1
    }
  }
}
