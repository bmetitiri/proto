import SpriteKit

class Score: SKNode {
    enum Source {
        case turn, total

        var name: NSNotification.Name {
            switch self {
            case .total:
                return Save.totalName
            case .turn:
                return Save.turnName
            }
        }

        var scores: [TileType: Int] {
            switch self {
            case .total:
                return Save.active.total
            case .turn:
                return Save.active.turn
            }
        }
    }

    let source: Source
    var displays: [TileType: SKLabelNode] = [:]

    required init?(coder _: NSCoder) {
        fatalError("How did you get here?!")
    }

    init(source: Source) {
        self.source = source
        super.init()
        for (i, type) in TileType.all.enumerated() {
            let per = Controller.width / TileType.all.count
            let display = SKLabelNode(fontNamed: "Chalkduster")
            display.fontColor = type.color
            display.fontSize = 15
            display.horizontalAlignmentMode = .center
            display.position.x = CGFloat(i * per + per / 2)
            displays[type] = display
            addChild(display)
        }
        NotificationCenter.default.addObserver(forName: source.name, object: nil, queue: nil) { _ in
            self.reloadData()
        }
    }

    func format(score: Int) -> String {
        if score > 1_000_000 {
            return String(score / 1_000_000) + "M"
        }
        if score > 10000 {
            return String(score / 1000) + "k"
        }
        if score > 1000 {
            return String(Double(score) / 1000.0).prefix(3) + "k"
        }
        return String(score)
    }

    func merge(into: Score) {
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

    func reloadData() {
        for type in TileType.all {
            guard let display = displays[type] else { continue }
            let count = source.scores[type] ?? 0
            if count == 0 {
                display.text = ""
                continue
            }
            switch source {
            case .total:
                if count == Save.active.capacity(type: type) {
                    display.fontColor = UIColor.white
                } else {
                    display.fontColor = type.color
                }
                display.text = format(score: count)
            case .turn:
                if source.scores.count == TileType.all.count && Upgrade.rainbowLevel > 0 {
                    display.fontColor = UIColor.white
                } else {
                    display.fontColor = type.color
                }
                display.text = format(score: Save.active.score(type: type, count: count))
            }
        }
    }
}
