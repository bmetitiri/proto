import SpriteKit

class Select: SKCropNode {
    enum Direction {
        case vertical, horizontal
    }

    let board: Board
    let start: Tile
    let direction: Direction
    let background: SKSpriteNode
    let tiles: SKNode = SKNode()

    required init?(coder _: NSCoder) {
        fatalError("How did you get here?!")
    }

    init(board: Board, start: Tile, direction: Direction) {
        self.board = board
        self.start = start
        self.direction = direction
        switch direction {
        case .horizontal:
            background = SKSpriteNode(
                color: UIColor.black,
                size: CGSize(width: board.width * Tile.sideLength, height: Tile.sideLength)
            )
            background.position.x = (CGFloat(board.width / 2) - 0.5) * CGFloat(Tile.sideLength)
            background.position.y = start.position.y
        case .vertical:
            background = SKSpriteNode(
                color: UIColor.black,
                size: CGSize(width: Tile.sideLength, height: board.height * Tile.sideLength)
            )
            background.position.x = start.position.x
            background.position.y = (CGFloat(board.height / 2) - 0.5) * CGFloat(Tile.sideLength)
        }
        super.init()
        switch direction {
        case .horizontal:
            for x in 0 ..< board.width {
                guard let tile = board.get(x: x, y: start.y) else { continue }
                tiles.addChild(Tile(copy: tile))
            }
        case .vertical:
            for y in 0 ..< board.height {
                guard let tile = board.get(x: start.x, y: y) else { continue }
                tiles.addChild(Tile(copy: tile))
            }
        }
        addChild(background)
        addChild(tiles)
        maskNode = background
    }

    func move(x: CGFloat, y: CGFloat) {
        switch direction {
        case .horizontal:
            tiles.position.x += x
            for tile in tiles.children {
                guard let tile = tile as? Tile else { continue }
                if tile.point.x + tiles.position.x < 0 {
                    tile.x += board.width
                    tile.position = tile.point
                } else if tile.point.x + tiles.position.x > CGFloat(Tile.sideLength * board.width) {
                    tile.x -= board.width
                    tile.position = tile.point
                }
                if tile.point.x + tiles.position.x > CGFloat(Tile.sideLength * (board.width - 1)) {
                    background.color = tile.type.color
                }
            }
        case .vertical:
            tiles.position.y += y
            for tile in tiles.children {
                guard let tile = tile as? Tile else { continue }
                if tile.point.y + tiles.position.y < 0 {
                    tile.y += board.height
                    tile.position = tile.point
                } else if tile.point.y + tiles.position.y > CGFloat(Tile.sideLength * board.height) {
                    tile.y -= board.height
                    tile.position = tile.point
                }
                if tile.point.y + tiles.position.y > CGFloat(Tile.sideLength * (board.height - 1)) {
                    background.color = tile.type.color
                }
            }
        }
    }
}
