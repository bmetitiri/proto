import SpriteKit
 
class GameScene: SKScene {
  var initial:UITouch?
  var initialLoc:CGPoint?
  var selection:Selection?
  var board:Board = Board()
  override func didMoveToView(view: SKView) {
    backgroundColor = UIColor.blackColor()
    addChild(board)
  }
  override func touchesBegan(touches: Set<UITouch>, withEvent event: UIEvent?) {
    initial = touches.first!
    initialLoc = initial!.locationInNode(self)
  }
  override func touchesMoved(touches: Set<UITouch>, withEvent event: UIEvent?) {
    if let initial = initial, initialLoc = initialLoc where touches.contains(initial) {
      let loc = initial.locationInNode(self)
      let dx = abs(loc.x - initialLoc.x)
      let dy = abs(loc.y - initialLoc.y)
      if let selection = selection {
        selection.move(loc)
      } else if max(dx, dy) > 5 {
        if dx > dy {
          selection = Selection(board:board, point:initialLoc, vertical:false)
          addChild(selection!)
        } else {
          selection = Selection(board:board, point:initialLoc, vertical:true)
          addChild(selection!)
        }
      }
    }
  }
  override func touchesEnded(touches: Set<UITouch>, withEvent event: UIEvent?) {
    if let touch = initial, sel = selection where touches.contains(touch) {
      let loc = touch.locationInNode(self)
      initial = nil
      initialLoc = nil
      board.inject(sel.drop(loc))
      selection = nil
    }
  }
}
