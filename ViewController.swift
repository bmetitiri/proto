import SpriteKit
import UIKit
 
class ViewController: UIViewController {
 
  override func viewDidLoad() {
    super.viewDidLoad()

    let skView = SKView(frame: view.bounds)
    self.view.addSubview(skView)
    skView.ignoresSiblingOrder = true

    let scene = GameScene(size: view.bounds.size)
    skView.presentScene(scene)
  }
  override func prefersStatusBarHidden() -> Bool {
    return true
  }
  override func supportedInterfaceOrientations() -> UIInterfaceOrientationMask {
    return UIInterfaceOrientationMask.Portrait
  }
}
