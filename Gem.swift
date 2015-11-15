import SpriteKit

func getColor(type:Int)->UIColor {
  let color = type & 0x1f
  switch color {
    case 1<<0:
      return UIColor.redColor()
    case 1<<1:
      return UIColor.greenColor()
    case 1<<2:
      return UIColor.blueColor()
    case 1<<3:
      return UIColor.purpleColor()
    case 1<<4:
      return UIColor.yellowColor()
    default:
      return UIColor.blackColor()
  }
}

class Gem: SKSpriteNode {
  static let size = 40
  let board:Board
  let type:Int
  var x = -1
  var y = -1
  var falling = false
  var down:Gem?
  var left:Gem?
  init(board:Board, x:Int, y:Int, type:Int = 0) {
    self.board = board
    self.type = type == 0 ? 1 << Int(arc4random_uniform(5)) : type
    super.init(texture: nil, color: getColor(self.type), size: CGSize(width: Gem.size, height: Gem.size))
    board.addChild(self)
    move(x, y:y)
  }
  required init?(coder c: NSCoder) {
    fatalError("NSCoding not supported")
  }
  func move(x:Int, y:Int, stay:Bool = false) -> Bool {
    self.x = x
    self.y = y
    if !stay {
      position = getPoint()
    }
    return board.set(self, x:self.x, y:self.y)
  }
  func remove(animate:Bool = false) {
    board.set(nil, x:x, y:y)
    if animate {
      zPosition = CGFloat(board.rows - y)
      let rotate = Double(arc4random_uniform(100)) / 100.0
      runAction(SKAction.group([
        SKAction.scaleTo(2.5, duration:0.2),
        SKAction.rotateByAngle(CGFloat(M_PI_4 - M_PI_2*rotate), duration:0.2)
      ])) {
        self.removeFromParent()
      }
    } else {
      self.removeFromParent()
    }
  }
  func fall() {
    falling = true
    board.falling.insert(self)
    board.set(nil, x:self.x, y:self.y)
    move(x, y:y-1, stay:true)
    runAction(SKAction.moveTo(getPoint(), duration:0.3), completion: {
      self.falling = false
      self.board.settle(self)
    })
  }
  func match(gems: Gem...) -> Bool {
    if falling || type < 0 {
      return false
    }
    var test = self.type
    for gem in gems {
      test &= gem.type
      if gem.falling || type < 0 {
        return false
      }
    }
    return test != 0
  }
  func getPoint() -> CGPoint {
    return CGPoint(x: x * Gem.size + Gem.size / 2, y: y * Gem.size + Gem.size / 2)
  }
}
