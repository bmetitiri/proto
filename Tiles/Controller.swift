import SpriteKit
import UIKit

class Controller: UIViewController {
    let board = Board()
    override func viewDidLoad() {
        super.viewDidLoad()
        let scene = SKScene(size: CGSize(width: 200, height: 300))
        scene.backgroundColor = UIColor.black
        scene.scaleMode = .aspectFit
        scene.addChild(board)
        let skView = SKView(frame: view.bounds)
        skView.ignoresSiblingOrder = true
        skView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(skView)
        NSLayoutConstraint.activate([
            skView.topAnchor.constraint(equalTo: view.layoutMarginsGuide.topAnchor),
            skView.trailingAnchor.constraint(equalTo: view.layoutMarginsGuide.trailingAnchor),
            skView.bottomAnchor.constraint(equalTo: view.layoutMarginsGuide.bottomAnchor),
            skView.leadingAnchor.constraint(equalTo: view.layoutMarginsGuide.leadingAnchor),
        ])
        skView.presentScene(scene)
    }
}
