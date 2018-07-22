import SpriteKit
import UIKit

class Controller: UIViewController, MenuPresenter {
    static let width = 200
    static let height = 300

    override func viewDidLoad() {
        super.viewDidLoad()
        let scene = SKScene(size: CGSize(width: Controller.width, height: Controller.height))
        scene.backgroundColor = UIColor.black
        scene.scaleMode = .aspectFit
        scene.addChild(Board(menu: self))
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

    func show(type: TileType) {
        guard let menu = UIStoryboard(
            name: "Menu",
            bundle: nil
        ).instantiateViewController(withIdentifier: "Menu") as? Menu else { return }
        menu.type = type
        present(menu, animated: true)
    }
}
