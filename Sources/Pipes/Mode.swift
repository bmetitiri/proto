enum Mode {
  case cursor, build, quit
  case pipe(active: Bool)
  case delete(active: Bool)

  func key() -> String {
    switch self {
    case .cursor: return "(c)ursor"
    case .build: return "(b)uild"
    case .pipe: return "(p)ipe"
    case .delete: return "(d)elete"
    case .quit: return "(q)uit"
    }
  }

  static let list = [
    cursor, build,
    pipe(active: false),
    delete(active: false),
    quit,
  ]
}
