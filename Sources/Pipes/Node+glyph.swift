import PipesCore

extension Node {
  func glyph() -> String {
    let t = type()
    switch t {
    case .pipe:
      let sub = subtype()
      if sub != .none {
        return sub.glyph()
      }
      return "┼"
    default:
      return t.glyph()
    }
  }
}
