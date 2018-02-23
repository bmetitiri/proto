import Darwin.ncurses
import Foundation
import PipesCore

class Terminal {
  static let A_REVERSE = Int32(1 << 18)

  let map: Map
  let height = 20
  let width = 40
  var mode = Mode.cursor
  var build = Item.mine
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
    map.inventory[.mine] = 2
    map.inventory[.furnace] = 2
    map.inventory[.factory] = 1
    map.inventory[.yard] = 1
  }

  func buildable() -> [Item] {
    return map.inventory.flatMap { k, v in
      v > 0 && k != .none ? k : nil
    }
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
      let node = map.get(at: Point(x: x, y: y))
      switch node.type() {
      case .factory:
        addstr("(↹)Selected: ")
        for type in node.options() {
          if node.subtype() == type {
            attron(Terminal.A_REVERSE)
            addstr(String(describing: type))
            attroff(Terminal.A_REVERSE)
          } else {
            addstr(String(describing: type))
          }
          addstr(" ")
        }
      default:
        addstr("Selected: \(String(describing: map.get(at: Point(x: x, y: y))))")
      }
    case .build:
      addstr("(↹)Selected: ")
      for type in buildable() {
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

  @objc func tick() {
    map.update()
  }

  func main() {
    // Source: https://github.com/lyft/Kronos/blob/master/Example/main.swift
    let timer = Timer.scheduledTimer(timeInterval: 0.2, target: self,
                                     selector: #selector(tick),
                                     userInfo: nil, repeats: true)
    loop: while RunLoop.current.run(mode: .defaultRunLoopMode,
                                    before: Date(timeIntervalSinceNow: 0.01)) {
      map.draw()
      draw()
      move(Int32(y), Int32(x))
      var dx = 0
      var dy = 0
      nodelay(stdscr, true)
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
        break loop
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
    timer.invalidate()
    endwin()
  }
}
