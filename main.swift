#!/usr/bin/env xcrun swift
// Formatted with `swiftformat --indent 2 .`

import Darwin.ncurses
import Foundation

enum Item {
  case none, ore, iron
}

class Receiver: Hashable {
  lazy var hashValue: Int = ObjectIdentifier(self).hashValue

  func pipe(to _: Receiver) {}

  func receive(item _: Item) -> Bool {
    return false
  }

  func update(turn _: Int) {
  }

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
  let item = Item.iron
  var input = 0
  var produced = 0
  var time = 0

  init() {
    super.init(type: .furnace)
  }

  override func receive(item: Item) -> Bool {
    switch item {
    case .ore:
      input += 1
      return true
    default: return super.receive(item: item)
    }
  }

  override func update(turn: Int) {
    if input > 2 {
      time += 1
      if time > 10 {
        time = 0
        produced += 1
      }
    }
    for output in outputs {
      output.update(turn: turn)
      if produced > 0, output.receive(item: item) {
        produced -= 1
      }
    }
  }
}

class Mine: Building {
  let timeToMine = 10
  let item = Item.ore
  var time = 0
  var count = 0

  init() {
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
        if output.receive(item: item) {
          count -= 1
        }
      }
    }
  }
}

class Pipe: Receiver {
  var output: Receiver?
  var send = false
  var content = Item.none
  var last = 0

  override func pipe(to: Receiver) {
    output = to
  }

  override func receive(item: Item) -> Bool {
    if content == Item.none {
      content = item
      return true
    }
    return false
  }

  override func update(turn: Int) {
    if let output = output, turn > last {
      last = turn
      if output is Pipe {
        output.update(turn: turn)
      }
      if output.receive(item: content) {
        content = Item.none
      }
    }
  }
}

enum NodeType {
  case none, wall
  case build(Building)
  case pipe(Pipe)
}

struct Node {
  let at: Point
  var type = NodeType.none
}

class Map {
  var map: [[Node]]
  var buildings = Set<Receiver>()
  var turn = 0

  init(width: Int, height: Int) {
    var map = [[Node]]()
    for col in 0 ... width {
      var nodes = [Node]()
      for row in 0 ... height {
        nodes.append(Node(at: Point(x: col, y: row), type:
            (col == 0 || col == width || row == 0 || row == height) ?
            NodeType.wall : NodeType.none))
      }
      map.append(nodes)
    }
    self.map = map
  }

  func get(at: Point) -> Node {
    return get(x: at.x, y: at.y)
  }

  func get(x: Int, y: Int) -> Node {
    return map[x][y]
  }

  func check(type: BuildingType, at: Point) -> Bool {
    let (w, h) = type.size()
    for row in 0 ..< h {
      for col in 0 ..< w {
        switch get(x: at.x + col, y: at.y + row).type {
        case .none: continue
        default: return false
        }
      }
    }
    return true
  }

  func build(type: BuildingType, at: Point) {
    if !check(type: type, at: at) {
      return
    }
    let b: Building
    switch type {
    case .mine: b = Mine()
    case .furnace: b = Furnace()
    }
    let (w, h) = type.size()
    for row in 0 ..< h {
      for col in 0 ..< w {
        set(x: at.x + col, y: at.y + row, type: NodeType.build(b))
      }
    }
    buildings.insert(b)
  }

  func pipe(from: Point, to: Point) {
    var r: Receiver?

    switch get(at: to).type {
    case .none:
      let p = Pipe()
      r = p
      set(at: to, type: NodeType.pipe(p))
    case let .build(b):
      r = b
    case let .pipe(p):
      r = p
    default:
      break
    }

    switch get(at: from).type {
    case .none:
      let p = Pipe()
      set(at: from, type: NodeType.pipe(p))
      if let r = r {
        p.pipe(to: r)
      }
    case let .pipe(p):
      if let r = r {
        p.pipe(to: r)
      }
    case let .build(b):
      if let r = r, r != b {
        b.pipe(to: r)
      }
    default:
      break
    }
  }

  func update() {
    for building in buildings {
      building.update(turn: turn)
    }
    turn += 1
  }

  private func set(at: Point, type: NodeType) {
    set(x: at.x, y: at.y, type: type)
  }

  private func set(x: Int, y: Int, type: NodeType) {
    map[x][y].type = type
  }
}

// Terminal specific code.
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
    case .ore: return "o"
    case .iron: return "i"
    case .none: return "┼"
    }
  }
}

extension NodeType {
  func glyph() -> String {
    switch self {
    case .none: return " "
    case .wall: return "░"
    case let .pipe(pipe): return pipe.glyph()
    case let .build(building): return building.type.glyph()
    }
  }
}

extension Node {
  func draw() {
    mvaddstr(Int32(at.y), Int32(at.x), type.glyph())
  }
}

extension Map {
  func draw() {
    for row in map {
      for node in row {
        node.draw()
      }
    }
  }
}

class Terminal {
  static let A_REVERSE = Int32(1 << 18)

  enum Mode {
    case cursor, build, pipe

    func key() -> String {
      switch self {
      case .cursor: return "(c)ursor"
      case .build: return "(b)uild"
      case .pipe: return "(p)ipe"
      }
    }

    static let list = [cursor, build, pipe]
  }

  let map: Map
  let height = 20
  let width = 40
  var mode = Mode.cursor
  var build = BuildingType.mine
  var piping = false
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
      if self.mode == mode {
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
      addstr("Selected: \(String(describing: map.get(x: x, y: y).type))")
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
          switch map.get(x: dx, y: dy).type {
          case NodeType.none:
            mvaddstr(Int32(dy), Int32(dx), build.glyph())
          default:
            attron(Terminal.A_REVERSE)
            mvaddstr(Int32(dy), Int32(dx), build.glyph())
            attroff(Terminal.A_REVERSE)
          }
        }
      }
    case .pipe:
      addstr("(↵)Laying Pipe: \(piping)")
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
        piping = false
      case Int32(chtype("b")):
        mode = .build
        piping = false
      case Int32(chtype("p")):
        mode = .pipe
      case Int32(chtype("q")):
        return
      case Int32(chtype("\r")):
        if mode == Mode.build {
          map.build(type: build, at: Point(x: x, y: y))
        }
        if mode == Mode.pipe {
          piping = !piping
        }
      case Int32(chtype("\t")):
        if mode == Mode.build {
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
      if piping && (dx != 0 || dy != 0) {
        map.pipe(from: Point(x: x, y: y), to: Point(x: x + dx, y: y + dy))
      }
      x += dx
      y += dy
    }
  }
}

Terminal().main()
