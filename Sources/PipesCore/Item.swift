public enum Item {
  case none
  case copper_ore, iron_ore, stone
  case copper, iron
  case circuit, gear, pipe
  case factory, furnace, mine, yard
  case wall
  // TODO: Temporary render value.
  case empty_pipe

  public static let list = [
    copper_ore, iron_ore, stone,
    copper, iron,
    circuit, gear, pipe,
    factory, furnace, mine, yard,
  ]

  func build() -> BuildingType {
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

  public func recipe() -> Dictionary<Item, Int>? {
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
