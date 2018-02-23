import PipesCore

extension Item {
  func glyph() -> String {
    switch self {
    case .copper_ore: return "c"
    case .iron_ore: return "i"
    case .stone: return "s"
    case .copper: return "C"
    case .iron: return "I"
    case .gear: return "*"
    case .pipe: return "/"
    case .circuit: return "Ω"
    case .mine: return "☭"
    case .furnace: return "♨"
    case .factory: return "♳"
    case .yard: return "☑︎"
    case .wall: return "░"
    case .none: return " "
    }
  }
}
