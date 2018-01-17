#!/usr/bin/env xcrun swift
// Formatted with `swiftformat --indent 2 .`

import Darwin.ncurses

enum Resource {
  case copper, iron
}

enum Item {
  case none
  case ore(Resource)
  case bar(Resource)
}

class Receiver: Hashable {
  lazy var hashValue: Int = ObjectIdentifier(self).hashValue

  func pipe(to _: Receiver) {}

  func receive(item _: Item) -> Bool {
    return false
  }

  func update(turn _: Int) {}

  static func == (lhs: Receiver, rhs: Receiver) -> Bool {
    return lhs === rhs
  }
}

struct Point {
  let x: Int
  let y: Int
}

enum BuildingType {
  case mine, furnace

  func size() -> (width: Int, height: Int) {
    switch self {
    case .mine:
      return (3, 2)
    case .furnace:
      return (2, 3)
    }
  }

  static let list = [mine, furnace]
}

class Building: Receiver {
  var type: BuildingType
  // TODO: Change to weak references.
  var outputs = Set<Receiver>()

  init(type: BuildingType) {
    self.type = type
  }

  override func pipe(to: Receiver) {
    outputs.insert(to)
  }

  override func receive(item _: Item) -> Bool {
    return false
  }
}

class Furnace: Building {
  var ores = [Resource: Int]()
  var produced = [Resource: Int]()
  var time = 0

  init() {
    super.init(type: .furnace)
  }

  override func receive(item: Item) -> Bool {
    switch item {
    case let .ore(item):
      let count = ores[item, default: 0]
      if count < 10 {
        ores[item] = count + 1
        return true
      }
      fallthrough
    default: return super.receive(item: item)
    }
  }

  override func update(turn: Int) {
    time += 1
    for (ore, count) in ores {
      if count > 2, time > 10 {
        let made = produced[ore, default: 0]
        if made < 10 {
          time = 0
          ores[ore] = count - 2
          produced[ore] = made + 1
        }
      }
    }
    for output in outputs {
      output.update(turn: turn)
      for (item, count) in produced {
        if count > 0, output.receive(item: .bar(item)) {
          produced[item]? -= 1
        }
      }
    }
  }
}

class Mine: Building {
  let timeToMine = 10
  var ores: Set<Resource>
  var time = 0
  var count = 0

  init(ores: Set<Resource>) {
    self.ores = ores
    super.init(type: .mine)
  }

  override func update(turn: Int) {
    time += 1
    if count < 10, time > timeToMine {
      count += 1
      time = 0
    }
    for output in outputs {
      output.update(turn: turn)
      if count > 0 {
        if output.receive(item: .ore(ores.first!)) {
          count -= 1
        }
      }
    }
  }
}

class Pipe: Receiver {
  weak var output: Receiver?
  var send = false
  var content = Item.none
  var last = 0

  override func pipe(to: Receiver) {
    output = to
  }

  override func receive(item: Item) -> Bool {
    switch content {
    case .none:
      content = item
      return true
    default:
      return false
    }
  }

  override func update(turn: Int) {
    if let output = output, turn > last {
      last = turn
      if let output = output as? Pipe, output.last < turn {
        output.update(turn: turn)
      }
      if output.receive(item: content) {
        content = Item.none
      }
    }
  }
}

class Wall: Receiver {}

struct Node {
  weak var value: Receiver?
  var ore: Resource?
}

class Map {
  let width: Int
  let height: Int
  var map: [[Node]]
  var nodes = Set<Receiver>()
  // TODO: Change to weak referenced.
  var buildings = Set<Receiver>()
  var turn = 0

  init(width: Int, height: Int) {
    let seed = Int(arc4random())
    self.width = width
    self.height = height
    map = Array(repeating: Array(repeating: Node(), count: height + 1),
                count: width + 1)
    for col in 0 ... width {
      for row in 0 ... height {
        if col == 0 || col == width || row == 0 || row == height {
          set(x: col, y: row, value: Wall())
        } else {
          if cos(Double(col + seed) / 8) + sin(Double(row + seed) / 4) > 1.8 {
            map[col][row].ore = .iron
          }
          if sin(Double(col + seed) / 8) + cos(Double(row + seed) / 4) > 1.8 {
            map[col][row].ore = .copper
          }
        }
      }
    }
  }

  func get(at: Point) -> Node {
    return get(x: at.x, y: at.y)
  }

  func get(x: Int, y: Int) -> Node {
    return map[x][y]
  }

  func ores(type: BuildingType, at: Point) -> Set<Resource> {
    var ores = Set<Resource>()
    let (w, h) = type.size()
    for row in 0 ..< h {
      for col in 0 ..< w {
        if let ore = get(x: at.x + col, y: at.y + row).ore {
          ores.insert(ore)
        }
      }
    }
    return ores
  }

  func check(type: BuildingType, at: Point) -> Bool {
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

  func build(type: BuildingType, at: Point) {
    if !check(type: type, at: at) {
      return
    }
    let b: Building
    switch type {
    case .mine: b = Mine(ores: ores(type: type, at: at))
    case .furnace: b = Furnace()
    }
    let (w, h) = type.size()
    for row in 0 ..< h {
      for col in 0 ..< w {
        set(x: at.x + col, y: at.y + row, value: b)
      }
    }
    buildings.insert(b)
  }

  func pipe(from: Point, to: Point) {
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

  func delete(at: Point) {
    let value = get(at: at).value
    if let value = value {
      switch value {
      case is Wall: return
      case is Building:
        buildings.remove(value)
      default: break
      }
      nodes.remove(value)
    }
    set(at: at, value: nil)
  }

  func update() {
    for building in buildings {
      building.update(turn: turn)
    }
    turn += 1
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

// Terminal specific code.
extension Resource {
  func glyph() -> String {
    switch self {
    case .copper: return "c"
    case .iron: return "i"
    }
  }
}

extension BuildingType {
  func glyph() -> String {
    switch self {
    case .mine: return "☭"
    case .furnace: return "♨"
    }
  }
}

extension Pipe {
  func glyph() -> String {
    switch content {
    case let .ore(r): return r.glyph()
    case let .bar(r): return r.glyph().uppercased()
    case .none: return "┼"
    }
  }
}

extension Node {
  func draw(at: Point) {
    let glyph: String
    switch value {
    case let pipe as Pipe: glyph = pipe.glyph()
    case let building as Building: glyph = building.type.glyph()
    case is Wall: glyph = "░"
    default:
      if let o = ore {
        glyph = o.glyph()
      } else {
        glyph = " "
      }
    }
    mvaddstr(Int32(at.y), Int32(at.x), glyph)
  }
}

extension Map {
  func draw() {
    for (x, row) in map.enumerated() {
      for (y, node) in row.enumerated() {
        node.draw(at: Point(x: x, y: y))
      }
    }
  }
}

class Terminal {
  static let A_REVERSE = Int32(1 << 18)

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

  let map: Map
  let height = 20
  let width = 40
  var mode = Mode.cursor
  var build = BuildingType.mine
  var x = 1
  var y = 1

  init() {
    setlocale(LC_ALL, "en_US")
    initscr()
    cbreak()
    keypad(stdscr, true)
    noecho()
    nonl()

    map = Map(width: width, height: height)
  }

  deinit {
    endwin()
  }

  func draw() {
    move(Int32(height) + 1, 0)
    for mode in Mode.list {
      if self.mode.key() == mode.key() {
        attron(Terminal.A_REVERSE)
        addstr(mode.key())
        attroff(Terminal.A_REVERSE)
      } else {
        addstr(mode.key())
      }
      addstr(" ")
    }
    addstr("(q)uit")
    move(Int32(height) + 2, 0)
    clrtoeol()
    switch mode {
    case .cursor:
      addstr("Selected: \(String(describing: map.get(x: x, y: y)))")
    case .build:
      addstr("(↹)Selected: ")
      for type in BuildingType.list {
        if build == type {
          attron(Terminal.A_REVERSE)
          addstr(String(describing: type))
          attroff(Terminal.A_REVERSE)
        } else {
          addstr(String(describing: type))
        }
        addstr(" ")
      }
      let (w, h) = build.size()
      let checked = map.check(type: build, at: Point(x: x, y: y))
      if !checked {
        attron(Terminal.A_REVERSE)
      }
      for row in 0 ..< h {
        for col in 0 ..< w {
          let dx = x + col
          if dx > width {
            continue
          }
          let dy = y + row
          if dy > height {
            continue
          }
          mvaddstr(Int32(dy), Int32(dx), build.glyph())
        }
      }
      attroff(Terminal.A_REVERSE)
    case let .pipe(active):
      addstr("(↵)Laying Pipe: \(active)")
    case let .delete(active):
      addstr("(↵)Deleting: \(active)")
    }
  }

  func main() {
    while true {
      map.update()
      map.draw()
      draw()
      move(Int32(y), Int32(x))
      var dx = 0
      var dy = 0
      let ch = getch()
      switch ch {
      case Int32(chtype("c")):
        mode = .cursor
      case Int32(chtype("b")):
        mode = .build
      case Int32(chtype("p")):
        mode = .pipe(active: false)
      case Int32(chtype("d")):
        mode = .delete(active: false)
      case Int32(chtype("q")):
        return
      case Int32(chtype("\r")):
        switch mode {
        case Mode.build:
          map.build(type: build, at: Point(x: x, y: y))
        case let Mode.pipe(active):
          mode = Mode.pipe(active: !active)
        case let Mode.delete(active):
          mode = Mode.delete(active: !active)
        default: break
        }
      case Int32(chtype("\t")):
        if case Mode.build = mode {
          build = BuildingType.list[
            (BuildingType.list.index(of: build)! + 1) %
              BuildingType.list.count
          ]
        }
      case KEY_LEFT, Int32(chtype("h")):
        if x > 0 {
          dx = -1
        }
      case KEY_RIGHT, Int32(chtype("l")):
        if x < width {
          dx = 1
        }
      case KEY_UP, Int32(chtype("k")):
        if y > 0 {
          dy = -1
        }
      case KEY_DOWN, Int32(chtype("j")):
        if y < height {
          dy = 1
        }
      default:
        break
      }
      if case let Mode.pipe(active) = mode, active, dx != 0 || dy != 0 {
        map.pipe(from: Point(x: x, y: y), to: Point(x: x + dx, y: y + dy))
      }
      x += dx
      y += dy
      if case let Mode.delete(active) = mode, active {
        map.delete(at: Point(x: x, y: y))
      }
    }
  }
}

Terminal().main()
