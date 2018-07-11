import SpriteKit

class Board: SKNode {
    let width = 10
    let height = 10
    var board = [Tile?](repeating: nil, count: 10 * 10) // width * height

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        if let data = userData, let board = data["board"] as? [Tile] {
            self.board = board
        }
        position = CGPoint(
            x: (Double(-width) + 0.5) * Double(Tile.sideLength) / 2,
            y: (Double(-height) + 0.5) * Double(Tile.sideLength) / 2)
        tick()
    }

    func get(x: Int, y: Int) -> Tile? {
        let i = y * height + x
        return 0 <= i && i < board.count ? board[i] : nil
    }

    func set(x: Int, y: Int, tile: Tile?) {
        let i = y * height + x
        if 0 <= i && i < board.count {
            board[y * height + x] = tile
        }
    }

    func tick() {
        isUserInteractionEnabled = false
        let delay = fall()
        if delay > 0 {
            run(SKAction.wait(forDuration: delay), completion: tick)
        }
        isUserInteractionEnabled = true
    }

    func fall() -> TimeInterval {
        var delay = 0.0
        for x in 0 ..< width {
            for y in 0 ..< height {
                if let tile = get(x: x, y: y) {
                    if tile.type == .empty { print(tile) }
                } else {
                    if y == height - 1 {
                        let sprite = Tile(type: TileType.random, x: x, y: y + 1)
                        set(x: x, y: y, tile: sprite)
                        addChild(sprite)
                        sprite.move(x: x, y: y)
                        delay = Tile.fallTime
                    } else if let above = get(x: x, y: y + 1) {
                        set(x: x, y: y + 1, tile: nil)
                        set(x: x, y: y, tile: above)
                        above.move(x: x, y: y)
                        delay = Tile.fallTime
                    }
                }
            }
        }
        return delay
    }
}
