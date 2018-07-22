import SpriteKit
import UIKit

class Controller: UIViewController, MenuPresenter {
    static let width = 200
    static let height = 300
    var board: Board?
    var path: URL? {
        return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.appendingPathComponent("tiles")
    }

    override func viewDidLoad() {
        let save: Save?
        if let path = path {
            save = try? PropertyListDecoder().decode(Save.self, from: Data(contentsOf: path))
        } else {
            save = nil
        }
        board = Board(menu: self, save: save)
        super.viewDidLoad()
        let scene = SKScene(size: CGSize(width: Controller.width, height: Controller.height))
        scene.backgroundColor = UIColor.black
        scene.scaleMode = .aspectFit
        scene.addChild(board!)
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
        guard let board = board, let menu = UIStoryboard(
            name: "Menu",
            bundle: nil
        ).instantiateViewController(withIdentifier: "Menu") as? Menu else { return }
        menu.board = board
        menu.type = type
        present(menu, animated: true)
    }

    func save() {
        if let board = board, let path = path {
            try? PropertyListEncoder().encode(board.data()).write(to: path)
        }
    }
}
