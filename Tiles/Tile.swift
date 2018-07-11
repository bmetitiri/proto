import SpriteKit

enum TileType {
    case empty
    case red
    case blue
    case green

    var color: UIColor {
        switch self {
        case .empty: return UIColor.clear
        case .red: return UIColor.red
        case .blue: return UIColor.blue
        case .green: return UIColor.green
        }
    }

    static var random: TileType {
        let colors = [TileType.red, TileType.blue, TileType.green]
        return colors[Int(arc4random_uniform(UInt32(colors.count)))]
    }
}

class Tile: SKSpriteNode {
    static let sideLength = 20
    static let fallTime = 0.1
    static let removeTime = 0.5
    let type: TileType
    var x: Int, y: Int

    required init?(coder _: NSCoder) {
        fatalError("How did you get here?!")
    }

    var point: CGPoint {
        return CGPoint(x: x * Tile.sideLength, y: y * Tile.sideLength)
    }

    init(type: TileType, x: Int, y: Int) {
        self.x = x
        self.y = y
        self.type = type
        super.init(texture: nil, color: type.color, size: CGSize(width: Tile.sideLength, height: Tile.sideLength))
        position = point
    }

    func move(x: Int, y: Int) {
        self.x = x
        self.y = y
        run(SKAction.move(to: point, duration: Tile.fallTime))
    }

    func remove() {
        let angle = Double(arc4random_uniform(100)) / 100 - 0.5
        run(SKAction.group([
            SKAction.rotate(byAngle: CGFloat(Double.pi * angle), duration: Tile.removeTime),
            SKAction.scale(by: -0.5, duration: Tile.removeTime),
        ])) { self.removeFromParent() }
    }
}
