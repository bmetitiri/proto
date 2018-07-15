import SpriteKit

class Score: SKNode {
    var scores: [TileType: Int] = [:]
    var displays: [TileType: SKLabelNode] = [:]

    required init?(coder _: NSCoder) {
        fatalError("This shouldn't be needed")
    }

    override init() {
        super.init()
        for (i, type) in TileType.all.enumerated() {
            let display = SKLabelNode(fontNamed: "Chalkduster")
            display.fontColor = type.color
            display.horizontalAlignmentMode = .center
            let per = Controller.width / TileType.all.count
            display.position.x = CGFloat(i * per + per / 2)
            displays[type] = display
            addChild(display)
        }
    }

    func point(type: TileType) -> CGPoint {
        let pos = displays[type]?.position ?? CGPoint(x: 0, y: 0)
        return CGPoint(x: pos.x + position.x, y: pos.y + position.y)
    }

    func add(type: TileType) {
        scores[type] = (scores[type] ?? 0) + 1
        guard let display = displays[type], let score = scores[type] else { return }
        display.text = String(score)
    }

    func clear() {
        scores.removeAll()
        for (_, display) in displays {
            display.text = ""
        }
    }
}
