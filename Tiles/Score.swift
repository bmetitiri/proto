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
            let per = Controller.width / TileType.all.count
            let display = SKLabelNode(fontNamed: "Chalkduster")
            display.fontColor = type.color
            display.fontSize = 20
            display.horizontalAlignmentMode = .center
            display.position.x = CGFloat(i * per + per / 2)
            displays[type] = display
            addChild(display)
        }
    }

    func merge(into: Score) {
        for (type, count) in scores {
            into.add(type: type, count: count)
        }
        scores.removeAll()
        for (type, display) in displays {
            if let copy = display.copy() as? SKNode {
                addChild(copy)
                copy.run(SKAction.group([
                    SKAction.move(to: convert(into.point(type: type), from: into), duration: Board.mergeTime),
                    SKAction.scale(by: 0.1, duration: Board.mergeTime),
                ])) { copy.removeFromParent() }
            }
            display.text = ""
        }
    }

    func point(type: TileType) -> CGPoint {
        return displays[type]?.position ?? CGPoint.zero
    }

    func add(type: TileType, count: Int = 1) {
        scores[type] = (scores[type] ?? 0) + count
        guard let display = displays[type], let score = scores[type] else { return }
        display.text = String(score)
    }
}
