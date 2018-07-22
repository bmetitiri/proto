import SpriteKit

struct Save: Codable {
    let tiles: [TileType]
    let total: [TileType: Int]
    let turn: [TileType: Int]
    let upgrades: [Upgrade: Int]
}

class Board: SKNode {
    weak var menu: MenuPresenter?
    static let slideMinimum = 2
    static let mergeTime = 0.3
    let width = 10
    let height = 10
    let total = Score()
    let turn = Score()
    let buttons = SKNode()
    var upgrades = [Upgrade: Int]()
    var board: [Tile?]
    var touch: UITouch?
    var select: Select?

    func data() -> Save {
        return Save(
            tiles: board.map { $0?.type ?? .empty },
            total: total.scores,
            turn: turn.scores,
            upgrades: upgrades
        )
    }

    required init?(coder _: NSCoder) {
        fatalError("How did you get here?!")
    }

    init(menu: MenuPresenter, save: Save?) {
        self.menu = menu
        board = [Tile?](repeating: nil, count: width * height)
        super.init()
        if let save = save {
            board = save.tiles.enumerated().map { i, tile in
                guard tile != .empty else { return nil }
                let tile = Tile(type: tile, x: i % width, y: i / width)
                addChild(tile)
                return tile
            }
            for (type, count) in save.total {
                total.add(type: type, count: count)
            }
            for (type, count) in save.turn {
                turn.add(type: type, count: count)
            }
            upgrades = save.upgrades
        }
        addChild(buttons)
        total.position.y = 280
        addChild(total)
        turn.position.y = 240
        addChild(turn)
        tick()
    }

    func get(x: Int, y: Int) -> Tile? {
        guard 0 <= x, x < width, 0 <= y, y < height else { return nil }
        return board[y * width + x]
    }

    func set(x: Int, y: Int, tile: Tile?) {
        guard 0 <= x, x < width, 0 <= y, y < height else { return }
        board[y * width + x] = tile
        if let tile = tile, !children.contains(tile) {
            addChild(tile)
        }
    }

    func tick() {
        buttons.removeAllChildren()
        isUserInteractionEnabled = false
        let fallDelay = fall()
        if fallDelay > 0 {
            run(SKAction.wait(forDuration: fallDelay), completion: tick)
            return
        }
        let clearDelay = clear()
        if clearDelay > 0 {
            run(SKAction.wait(forDuration: clearDelay), completion: tick)
            return
        }
        isUserInteractionEnabled = true
        addButtons()
        turn.merge(into: total)
    }

    func addButtons() {
        for x in 0 ..< width - 1 {
            for y in 0 ..< height - 1 {
                if let tile = get(x: x, y: y),
                    tile.type == get(x: x, y: y + 1)?.type,
                    tile.type == get(x: x + 1, y: y)?.type,
                    tile.type == get(x: x + 1, y: y + 1)?.type {
                    let button = Button(menu: menu, type: tile.type)
                    button.position = CGPoint(
                        x: tile.position.x + CGFloat(Tile.sideLength / 2),
                        y: tile.position.y + CGFloat(Tile.sideLength / 2)
                    )
                    button.zRotation = CGFloat(Double.pi / 4)
                    buttons.addChild(button)
                }
            }
        }
    }

    func fall() -> TimeInterval {
        var delay = 0.0
        for x in 0 ..< width {
            for y in 0 ..< height {
                guard get(x: x, y: y) == nil else { continue }
                if y == height - 1 {
                    let sprite = Tile(type: TileType.random, x: x, y: y + 1)
                    set(x: x, y: y, tile: sprite)
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
        return delay
    }

    func handleMatch(tiles: Tile...) -> Set<Tile> {
        guard tiles.count > 0 else { return Set<Tile>() }
        let tile = Tile(copy: tiles[tiles.count / 2])
        addChild(tile)
        tile.zPosition += 1
        tile.run(SKAction.move(
            to: convert(turn.point(type: tile.type),
                        from: turn), duration: Board.mergeTime)) {
            self.turn.add(type: tile.type, count: 1 + (self.upgrades[Upgrade.matchBase(tile.type)] ?? 0))
        }
        tile.remove()
        return Set<Tile>(tiles)
    }

    func clear() -> TimeInterval {
        var dead = Set<Tile>()
        for x in 0 ..< width {
            for y in 0 ..< height {
                guard let tile = get(x: x, y: y) else { continue }
                if let tile1 = get(x: x + 1, y: y),
                    let tile2 = get(x: x + 2, y: y),
                    tile.type == tile1.type && tile1.type == tile2.type {
                    dead.formUnion(handleMatch(tiles: tile, tile1, tile2))
                }
                guard y < height - 2 else { continue }
                if let tile1 = get(x: x, y: y + 1),
                    let tile2 = get(x: x, y: y + 2),
                    tile.type == tile1.type && tile1.type == tile2.type {
                    dead.formUnion(handleMatch(tiles: tile, tile1, tile2))
                }
            }
        }
        for tile in dead {
            set(x: tile.x, y: tile.y, tile: nil)
            tile.remove()
        }
        return dead.count > 0 ? Tile.removeTime : 0
    }

    func check(direction: Select.Direction, tile: Tile) -> Bool {
        switch direction {
        case .horizontal:
            let up = get(x: tile.x, y: tile.y - 1)?.type == tile.type
            let down = get(x: tile.x, y: tile.y + 1)?.type == tile.type
            if up && down {
                return true
            }
            if up && tile.type == get(x: tile.x, y: tile.y - 2)?.type {
                return true
            }
            if down && tile.type == get(x: tile.x, y: tile.y + 2)?.type {
                return true
            }
        case .vertical:
            let right = get(x: tile.x + 1, y: tile.y)?.type == tile.type
            let left = get(x: tile.x - 1, y: tile.y)?.type == tile.type
            if left && right {
                return true
            }
            if left && tile.type == get(x: tile.x - 2, y: tile.y)?.type {
                return true
            }
            if right && tile.type == get(x: tile.x + 2, y: tile.y)?.type {
                return true
            }
        }
        return false
    }

    override func touchesBegan(_ touches: Set<UITouch>, with _: UIEvent?) {
        buttons.isHidden = true
        guard let touch = touches.first, atPoint(touch.location(in: self)) is Tile else { return }
        self.touch = touch
    }

    override func touchesMoved(_ touches: Set<UITouch>, with _: UIEvent?) {
        guard let touch = touch, touches.contains(touch) else { return }
        let from = touch.previousLocation(in: self)
        let to = touch.location(in: self)
        let dx = to.x - from.x
        let dy = to.y - from.y
        if select == nil {
            guard max(abs(dx), abs(dy)) > CGFloat(Board.slideMinimum) else { return }
            guard let tile = atPoint(from) as? Tile else { return }
            select = Select(board: self, start: tile, direction: abs(dx) > abs(dy) ? .horizontal : .vertical)
            addChild(select!)
        }
        select!.move(x: dx, y: dy)
    }

    override func touchesEnded(_: Set<UITouch>, with _: UIEvent?) {
        buttons.isHidden = false
        guard let select = select else { return }
        select.drop()
        self.select = nil
        tick()
    }
}
