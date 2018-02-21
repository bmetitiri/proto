enum Mode {
  case cursor, build
  case pipe(active: Bool)
  case delete(active: Bool)

  func key() -> String {
    switch self {
    case .cursor: return "(c)ursor"
    case .build: return "(b)uild"
    case .pipe: return "(p)ipe"
    case .delete: return "(d)elete"
    }
  }

  static let list = [
    cursor, build,
    pipe(active: false),
    delete(active: false),
  ]
}
