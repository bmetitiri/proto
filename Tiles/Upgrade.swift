import Foundation

enum Upgrade: Codable, Hashable {
    enum Key: CodingKey {
        case matchBase
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: Key.self)
        switch self {
        case let .matchBase(tile):
            try container.encode(tile, forKey: Key.matchBase)
        default:
            return
        }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: Key.self)
        if let tile = try? container.decode(TileType.self, forKey: Key.matchBase) {
            self = .matchBase(tile)
            return
        }
        self = .empty
    }

    case empty
    case matchBase(TileType)

    var name: String {
        switch self {
        case .empty:
            return "How did you get here?!"
        case .matchBase:
            return "Match + 1"
        }
    }

    func cost(count: Int) -> Int {
        return Int(pow(10, Double(count + 1)))
    }

    static func of(type: TileType) -> [Upgrade] {
        switch type {
        default:
            return [.matchBase(type)]
        }
    }
}
