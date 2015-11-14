import SpriteKit

class Board: SKNode {
  let scoreLabel:SKLabelNode = SKLabelNode()
  let columns:Int
  let rows:Int
  var score = 0
  var board = [Gem?]()
  var extra = [Gem]()
  var falling = Set<Gem>()
  init(columns:Int = 8, rows:Int = 8) {
    self.columns = columns
    self.rows = rows
    super.init()
    board = [Gem?](count:columns*rows, repeatedValue: nil)
    for x in 0..<columns {
      for y in 0..<rows {
        _ = Gem(board:self, x:x, y:y)
      }
    }
    scoreLabel.position = CGPoint(x:columns * Gem.size - 5, y:rows * Gem.size + 5)
    scoreLabel.horizontalAlignmentMode = SKLabelHorizontalAlignmentMode.Right
    addChild(scoreLabel)
    update();
  }
  required init?(coder c: NSCoder) {
    fatalError("NSCoding not supported")
  }
  func get(x: Int, y: Int) -> Gem? {
    if x < 0 || x >= columns || y < 0 || y >= rows {
      return nil
    }
    return board[y*columns + x]
  }
  func getCoord(point:CGPoint) -> (Int, Int) {
    return (Int(point.x) / Gem.size, Int(point.y) / Gem.size)
  }
  // Only called from Gem.
  func set(gem: Gem?, x: Int, y: Int) -> Bool {
    if x < 0 || x >= columns || y < 0 || y >= rows {
      return false
    }
    board[y*columns + x] = gem
    return true
  }
  func inject(gems:[Gem]) {
    extra += gems
  }
  func settle(gem:Gem) {
    falling.remove(gem)
    if falling.count == 0 {
      update()
    }
  }
  func update() {
    var dirty = false
    falling = Set<Gem>()
    for x in 0..<columns {
      if get(x, y:rows-1) == nil {
        if extra.count > 0 {
          let gem = extra.removeAtIndex(0)
          addChild(gem)
          gem.move(x, y:rows, stay:true)
          gem.fall()
          dirty = true;
        } else {
          let gem = Gem(board:self, x:x, y:rows)
          gem.fall()
          dirty = true;
        }
      }
    }
    for x in 0..<columns {
      for y in 0..<rows {
        if let gem = get(x, y:y) {
          gem.down = nil
          gem.left = nil
          if let left = get(x-1, y:y), left2 = get(x-2, y:y) {
            if gem.match(left, left2) {
              if left2.left == nil {
                left2.left = left2
              }
              left.left = left2.left
              gem.left = left2.left
            }
          }
          if let down = get(x, y:y-1) {
            if let down2 = get(x, y:y-2) {
              if gem.match(down, down2) {
                if down2.down == nil {
                  down2.down = down2
                }
                down.down = down2.down
                gem.down = down2.down
              }
            }
          }
        }
      }
    }
    var delta = 0
    for x in 0..<columns {
      for y in 0..<rows {
        if let gem = get(x, y:y) {
          if gem.down != nil || gem.left != nil {
            if let down = gem.down {
              delta += gem.y - down.y
            }
            if let left = gem.left {
              delta += gem.x - left.x
            }
            gem.remove(true)
            dirty = true
          } else if y > 0 && get(x, y:y-1) == nil {
            gem.fall()
            dirty = true
          }
        }
      }
    }
    score += delta
    scoreLabel.text = String(score)
    if dirty {
      update()
    }
  }
}
