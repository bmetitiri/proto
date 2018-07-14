import SpriteKit
import UIKit

class Controller: UIViewController {
    let board = Board()
    override func viewDidLoad() {
        super.viewDidLoad()
        let scene = SKScene(size: CGSize(width: 200, height: 200))
        scene.scaleMode = .aspectFit
        scene.addChild(board)
        let skView = SKView(frame: view.bounds)
        skView.ignoresSiblingOrder = true
        skView.presentScene(scene)
        view.addSubview(skView)
    }
}
