import Darwin.ncurses
import PipesCore

extension Map {
  func draw() {
    for x in 0 ... width {
      for y in 0 ... height {
        mvaddstr(Int32(y), Int32(x), get(at: Point(x: x, y: y)).type().glyph())
      }
    }
  }
}
