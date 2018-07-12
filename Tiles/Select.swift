import SpriteKit

class Select: SKNode {
    let board: Board
    let start: Tile

    required init?(coder _: NSCoder) {
        fatalError("How did you get here?!")
    }

    init(board: Board, start: Tile) {
        self.board = board
        self.start = start
        super.init()
    }

    func move(x _: CGFloat, y _: CGFloat) {
    }
}
