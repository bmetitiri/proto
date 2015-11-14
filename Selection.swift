import SpriteKit

class Selection: SKNode {
  let vertical:Bool
  let board:Board
  let initial:CGPoint
  let x:Int
  let y:Int
  init(board:Board, point:CGPoint, vertical:Bool) {
    self.vertical = vertical
    self.board = board
    self.initial = point
    (x, y) = board.getCoord(initial)
    super.init()
    each { x, y in
      if let gem = self.board.get(x, y:y) {
        gem.remove()
        self.addChild(gem)
        _ = Gem(board:self.board, x:x, y:y, type:-1)
      }
    }
  }
  required init?(coder c: NSCoder) {
    fatalError("NSCoding not supported")
  }
  func each(fn:(Int, Int) -> ()) {
    if vertical {
      for y in 0..<board.rows {
        fn(x, y)
      }
    } else {
      for x in 0..<board.columns {
        fn(x, y)
      }
    }
  }
  func move(new:CGPoint) {
    if vertical {
      position.y = new.y - initial.y
    } else {
      position.x = new.x - initial.x
    }
  }
  func drop(new:CGPoint) -> [Gem] {
    let (nx, ny) = board.getCoord(new)
    let offset = vertical ? ny - y : nx - x
    removeFromParent()
    return set(test(offset) ? offset : 0)
  }
  func test(offset:Int) -> Bool {
    for case let gem as Gem in children {
      if vertical {
        if let left = board.get(gem.x-1, y:gem.y+offset) {
          if let left2 = board.get(gem.x-2, y:gem.y+offset)
              where gem.match(left, left2) {
            return true
          } else if let right = board.get(gem.x+1, y:gem.y+offset)
              where gem.match(left, right) {
            return true
          }
        }
        if let right = board.get(gem.x+1, y:gem.y+offset),
            right2 = board.get(gem.x+2, y:gem.y+offset)
            where gem.match(right, right2) {
          return true
        }
      } else {
        if let down = board.get(gem.x+offset, y:gem.y-1) {
          if let down2 = board.get(gem.x+offset, y:gem.y-2)
              where gem.match(down, down2) {
            return true
          } else if let up = board.get(gem.x+offset, y:gem.y+1)
              where gem.match(up, down) {
            return true
          }
        }
        if let up = board.get(gem.x+offset, y:gem.y+1),
            up2 = board.get(gem.x+offset, y:gem.y+2)
            where gem.match(up, up2) {
          return true
        }
      }
    }
    return false
  }
  func set(offset:Int) -> [Gem] {
    each { x, y in
      if let gem = self.board.get(x, y:y) {
        gem.remove()
      }
    }
    var extra = [Gem]()
    for case let gem as Gem in children {
      gem.removeFromParent()
      if vertical {
        if gem.move(gem.x, y:gem.y + offset) {
          board.addChild(gem)
        } else {
          extra.append(gem)
        }
      } else {
        if gem.move(gem.x + offset, y:gem.y) {
          board.addChild(gem)
        } else {
          extra.append(gem)
        }
      }
    }
    board.update();
    return extra;
  }
}
