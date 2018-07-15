import SpriteKit

enum TileType {
    case empty
    case red
    case orange
    case yellow
    case blue
    case violet

    var color: UIColor {
        switch self {
        case .empty: return UIColor.clear
        case .red: return UIColor(red: 0.92, green: 0.27, blue: 0.55, alpha: 1.0)
        case .orange: return UIColor(red: 0.94, green: 0.44, blue: 0.18, alpha: 1.0)
        case .yellow: return UIColor(red: 0.91, green: 0.83, blue: 0.38, alpha: 1.0)
        case .blue: return UIColor(red: 0.11, green: 0.60, blue: 0.82, alpha: 1.0)
        case .violet: return UIColor(red: 0.64, green: 0.42, blue: 0.74, alpha: 1.0)
        }
    }

    static var all: [TileType] {
        return [TileType.red, TileType.orange, TileType.yellow, TileType.blue, TileType.violet]
    }

    static var random: TileType {
        return TileType.all[Int(arc4random_uniform(UInt32(TileType.all.count)))]
    }
}

class Tile: SKSpriteNode {
    static let sideLength = 20
    static let fallTime = 0.1
    static let removeTime = 0.5
    let type: TileType
    var x: Int, y: Int

    var point: CGPoint {
        return CGPoint(x: x * Tile.sideLength + Tile.sideLength / 2, y: y * Tile.sideLength + Tile.sideLength / 2)
    }

    required init?(coder _: NSCoder) {
        fatalError("How did you get here?!")
    }

    init(type: TileType, x: Int, y: Int) {
        self.x = x
        self.y = y
        self.type = type
        super.init(texture: nil, color: type.color, size: CGSize(width: Tile.sideLength, height: Tile.sideLength))
        position = point
    }

    convenience init(copy: Tile) {
        self.init(type: copy.type, x: copy.x, y: copy.y)
    }

    func move(x: Int, y: Int) {
        self.x = x
        self.y = y
        run(SKAction.move(to: point, duration: Tile.fallTime))
    }

    func remove() {
        run(SKAction.group([
            SKAction.rotate(byAngle: CGFloat(Double.pi * drand48() - Double.pi / 2), duration: Tile.removeTime),
            SKAction.scale(by: 0, duration: Tile.removeTime),
        ])) { self.removeFromParent() }
    }
}
