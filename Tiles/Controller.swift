import SpriteKit
import UIKit

struct Save: Codable {
    let tiles: [TileType]
    let total: [TileType: Int]
    let turn: [TileType: Int]
}

class Controller: UINavigationController, MenuPresenter {
    static let width = 200
    static let height = 280
    let container = UIView()
    var board: Board?
    var header: Header?

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
        header = Header(save: save)
        board = Board(menu: self, total: header!, save: save)
        super.viewDidLoad()
        guard let board = board, let header = header else { return }
        navigationBar.isHidden = true
        header.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(header)
        NSLayoutConstraint.activate([
            header.topAnchor.constraint(equalTo: view.layoutMarginsGuide.topAnchor),
            header.trailingAnchor.constraint(equalTo: view.layoutMarginsGuide.trailingAnchor),
            header.leadingAnchor.constraint(equalTo: view.layoutMarginsGuide.leadingAnchor),
        ])
        container.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(container)
        NSLayoutConstraint.activate([
            container.topAnchor.constraint(equalTo: header.bottomAnchor),
            container.trailingAnchor.constraint(equalTo: view.layoutMarginsGuide.trailingAnchor),
            container.bottomAnchor.constraint(equalTo: view.layoutMarginsGuide.bottomAnchor),
            container.leadingAnchor.constraint(equalTo: view.layoutMarginsGuide.leadingAnchor),
        ])
        let scene = SKScene(size: CGSize(width: Controller.width, height: Controller.height))
        scene.backgroundColor = UIColor.black
        scene.scaleMode = .aspectFit
        scene.addChild(board)
        let skView = SKView(frame: view.bounds)
        skView.ignoresSiblingOrder = true
        skView.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(skView)
        NSLayoutConstraint.activate([
            skView.topAnchor.constraint(equalTo: container.topAnchor),
            skView.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            skView.bottomAnchor.constraint(equalTo: container.bottomAnchor),
            skView.leadingAnchor.constraint(equalTo: container.leadingAnchor),
        ])
        skView.presentScene(scene)
    }

    override func pushViewController(_ viewController: UIViewController, animated _: Bool) {
        addChildViewController(viewController)
        viewController.view.frame.origin.y = container.bounds.size.height
        container.addSubview(viewController.view)
        UIView.animate(withDuration: 0.2, animations: { () -> Void in
            viewController.view.frame = self.container.bounds
        }) { _ in
            viewController.didMove(toParentViewController: self)
        }
    }

    override func popViewController(animated _: Bool) -> UIViewController? {
        guard let viewController = viewControllers.popLast() else { return nil }
        UIView.animate(withDuration: 0.2, animations: { () -> Void in
            viewController.view.frame.origin.y = self.container.bounds.size.height
        }) { _ in
            viewController.view.removeFromSuperview()
            viewController.removeFromParentViewController()
            viewController.didMove(toParentViewController: nil)
        }
        return viewController
    }

    func show(type: TileType) {
        guard let menu = UIStoryboard(
            name: "Menu",
            bundle: nil
        ).instantiateViewController(withIdentifier: "Menu") as? Menu else { return }
        menu.type = type
        pushViewController(menu, animated: true)
    }

    func save() {
        guard let board = board, let header = header, let path = path else { return }
        try? PropertyListEncoder().encode(Save(
            tiles: board.board.map { $0?.type ?? .empty },
            total: header.scores,
            turn: board.turn.scores
        )).write(to: path)
    }
}
