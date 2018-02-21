import Foundation

public class Map {
  public let width: Int
  public let height: Int
  // TODO: Probably should not be public.
  public var inventory = Dictionary<BuildingType, Int>()
  var map: [[Node]]
  var nodes = Set<Receiver>()
  // TODO: Change to weak referenced.
  var buildings = Set<Receiver>()
  var turn = 0

  public init(width: Int, height: Int) {
    let seed = Int(arc4random())
    self.width = width
    self.height = height
    map = Array(repeating: Array(repeating: Node(value: nil, ore: .none),
                                 count: height + 1),
                count: width + 1)
    for col in 0 ... width {
      for row in 0 ... height {
        if col == 0 || col == width || row == 0 || row == height {
          set(x: col, y: row, value: Wall())
        } else {
          if cos(Double(col + seed) / 8) + sin(Double(row + seed) / 4) > 1.8 {
            map[col][row].ore = .iron_ore
          }
          if sin(Double(col - seed) / 8) + cos(Double(row - seed) / 4) > 1.8 {
            map[col][row].ore = .stone
          }
          if sin(Double(col + seed) / 8) + cos(Double(row + seed) / 4) > 1.8 {
            map[col][row].ore = .copper_ore
          }
        }
      }
    }
  }

  public func get(at: Point) -> Node {
    return get(x: at.x, y: at.y)
  }

  public func check(type: BuildingType, at: Point) -> Bool {
    if inventory[type, default: 0] <= 0 {
      return false
    }
    let (w, h) = type.size()
    for row in 0 ..< h {
      for col in 0 ..< w {
        if at.x + col >= width || at.y + row >= height {
          return false
        }
        let node = get(x: at.x + col, y: at.y + row)
        switch node.value {
        case .none: continue
        default: return false
        }
      }
    }
    return type == .mine ? ores(type: type, at: at).count > 0 : true
  }

  public func build(type: BuildingType, at: Point) {
    if !check(type: type, at: at) {
      return
    }
    inventory[type, default: 0] -= 1
    let b: Building
    switch type {
    case .mine: b = Mine(raw: ores(type: type, at: at))
    case .furnace: b = Furnace()
    case .factory: b = Factory()
    case .yard: b = Yard(map: self)
    case .none: return
    }
    let (w, h) = type.size()
    for row in 0 ..< h {
      for col in 0 ..< w {
        set(x: at.x + col, y: at.y + row, value: b)
      }
    }
    buildings.insert(b)
  }

  public func pipe(from: Point, to: Point) {
    var r = get(at: to).value
    if r == nil {
      r = Pipe()
      set(at: to, value: r!)
    }

    switch get(at: from).value {
    case .none:
      let p = Pipe()
      set(at: from, value: p)
      if let r = r {
        p.pipe(to: r)
      }
    case let p as Pipe:
      if let r = r {
        p.pipe(to: r)
      }
    case let b as Building:
      if let r = r, r != b {
        b.pipe(to: r)
      }
    default:
      break
    }
  }

  public func delete(at: Point) {
    let value = get(at: at).value
    if let value = value {
      switch value {
      case is Wall: return
      case let building as Building:
        buildings.remove(building)
        inventory[building.type, default: 0] += 1
      default: break
      }
      nodes.remove(value)
    }
    set(at: at, value: nil)
  }

  public func update() {
    for building in buildings {
      building.update(turn: turn)
    }
    turn += 1
  }

  private func ores(type: BuildingType, at: Point) -> Set<Item> {
    var ores = Set<Item>()
    let (w, h) = type.size()
    for row in 0 ..< h {
      for col in 0 ..< w {
        let ore = get(x: at.x + col, y: at.y + row).ore
        if ore != .none {
          ores.insert(ore)
        }
      }
    }
    return ores
  }

  private func get(x: Int, y: Int) -> Node {
    return map[x][y]
  }

  private func set(at: Point, value: Receiver?) {
    set(x: at.x, y: at.y, value: value)
  }

  private func set(x: Int, y: Int, value: Receiver?) {
    if let value = value {
      nodes.insert(value)
    }
    map[x][y].value = value
  }
}
