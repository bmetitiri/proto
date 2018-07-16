import SpriteKit

class Button: SKSpriteNode {
    weak var menu: MenuPresenter?
    var touch: UITouch?
    let type: TileType

    required init?(coder _: NSCoder) {
        fatalError("How did you get here?!")
    }

    init(menu: MenuPresenter?, type: TileType) {
        self.menu = menu
        self.type = type
        super.init(
            texture: nil,
            color: UIColor.white,
            size: CGSize(width: Tile.sideLength, height: Tile.sideLength)
        )
        isUserInteractionEnabled = true
        zPosition += 1
    }

    override func touchesBegan(_ touches: Set<UITouch>, with _: UIEvent?) {
        guard let touch = touches.first else { return }
        self.touch = touch
    }

    override func touchesEnded(_ touches: Set<UITouch>, with _: UIEvent?) {
        guard let touch = touch, touches.contains(touch), let menu = menu else { return }
        menu.show()
    }
}
