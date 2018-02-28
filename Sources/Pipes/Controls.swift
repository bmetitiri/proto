import Darwin.ncurses
import PipesCore

class Controls {
  static let A_REVERSE = Int32(1 << 18)

  var map: Map
  var mode = Mode.cursor
  var build = Item.mine
  var x = 1
  var y = 1

  init(map: Map) {
    self.map = map
    setlocale(LC_ALL, "en_US")
    initscr()
    cbreak()
    keypad(stdscr, true)
    nodelay(stdscr, true)
    noecho()
    nonl()
  }

  deinit {
    endwin()
  }

  func buildable() -> [Item] {
    return map.inventory.flatMap { k, v in
      v > 0 && k != .none ? k : nil
    }
  }

  func menu<T: Equatable>(options: [T], selected: T) {
    for option in options {
      if option == selected {
        attron(Controls.A_REVERSE)
        addstr(String(describing: option))
        attroff(Controls.A_REVERSE)
      } else {
        addstr(String(describing: option))
      }
      addstr(" ")
    }
  }

  func draw() {
    move(Int32(map.height) + 1, 0)
    menu(options: Mode.list.map { $0.key() }, selected: mode.key())
    move(Int32(map.height) + 2, 0)
    clrtoeol()
    switch mode {
    case .cursor:
      let node = map.get(at: Point(x: x, y: y))
      switch node.type() {
      case .factory:
        addstr("(↹)Selected: ")
        menu(options: node.options(), selected: node.subtype())
      default:
        addstr("Selected: \(String(describing: map.get(at: Point(x: x, y: y))))")
      }
    case .build:
      addstr("(↹)Selected: ")
      menu(options: buildable(), selected: build)
      let (w, h) = build.size()
      let checked = map.check(type: build, at: Point(x: x, y: y))
      if !checked {
        attron(Controls.A_REVERSE)
      }
      for row in 0 ..< h {
        for col in 0 ..< w {
          let dx = x + col
          if dx > map.width {
            continue
          }
          let dy = y + row
          if dy > map.height {
            continue
          }
          mvaddstr(Int32(dy), Int32(dx), build.glyph())
        }
      }
      attroff(Controls.A_REVERSE)
    case let .pipe(active):
      addstr("(↵)Laying Pipe: \(active)")
    case let .delete(active):
      addstr("(↵)Deleting: \(active)")
    case .quit:
      break
    }
    move(Int32(y), Int32(x))
  }

  func update() {
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
      mode = .quit
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
      switch mode {
      case Mode.build:
        let buildable = self.buildable()
        build = buildable.count > 0 ? buildable[
          ((buildable.index(of: build) ?? -1) + 1) %
            buildable.count
        ] : .none
      case Mode.cursor:
        let node = map.get(at: Point(x: x, y: y))
        if node.type() == .factory {
          let options = node.options()
          node.select(item: options[
            ((options.index(of: node.subtype()) ?? -1) + 1) %
              options.count
          ])
        }
      default:
        break
      }
    case KEY_LEFT, Int32(chtype("h")):
      if x > 0 {
        dx = -1
      }
    case KEY_RIGHT, Int32(chtype("l")):
      if x < map.width {
        dx = 1
      }
    case KEY_UP, Int32(chtype("k")):
      if y > 0 {
        dy = -1
      }
    case KEY_DOWN, Int32(chtype("j")):
      if y < map.height {
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
