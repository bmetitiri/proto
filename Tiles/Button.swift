import SpriteKit

class Button: SKSpriteNode {
    weak var menu: MenuPresenter?
    var touch: UITouch?
    let type: TileType
    let close: () -> Void

    required init?(coder _: NSCoder) {
        fatalError("How did you get here?!")
    }

    init(menu: MenuPresenter?, type: TileType, close: @escaping () -> Void) {
        self.menu = menu
        self.type = type
        self.close = close
        super.init(
            texture: nil,
            color: UIColor.white,
            size: CGSize(width: Tile.sideLength, height: Tile.sideLength)
        )
        isUserInteractionEnabled = true
        zPosition += 1
        let count = Upgrade.of(type: type).filter {
            $0.cost(count: Save.active.upgrades[$0] ?? 0) < Save.active.total[type] ?? 0
        }.count
        let label = SKLabelNode(fontNamed: "Chalkduster")
        label.fontColor = UIColor.black
        label.fontSize = 13
        label.text = "\(count)"
        label.verticalAlignmentMode = .center
        addChild(label)
    }

    override func touchesBegan(_ touches: Set<UITouch>, with _: UIEvent?) {
        guard let touch = touches.first else { return }
        self.touch = touch
    }

    override func touchesEnded(_ touches: Set<UITouch>, with _: UIEvent?) {
        guard let touch = touch, touches.contains(touch), let menu = menu else { return }
        menu.show(type: type, after: close)
    }
}
