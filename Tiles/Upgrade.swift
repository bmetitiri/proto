import Foundation

enum Upgrade: Codable, Hashable {
    enum Key: CodingKey {
        case matchBase
        case rainbowAdapter
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: Key.self)
        switch self {
        case let .matchBase(tile):
            try container.encode(tile, forKey: Key.matchBase)
        case let .rainbowAdapter(tile):
            try container.encode(tile, forKey: Key.rainbowAdapter)
        case .empty:
            return
        }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: Key.self)
        if let tile = try? container.decode(TileType.self, forKey: Key.matchBase) {
            self = .matchBase(tile)
            return
        }
        if let tile = try? container.decode(TileType.self, forKey: Key.rainbowAdapter) {
            self = .rainbowAdapter(tile)
            return
        }
        self = .empty
    }

    case empty
    case matchBase(TileType)
    case rainbowAdapter(TileType)

    var name: String {
        switch self {
        case .empty:
            return "How did you get here?!"
        case .matchBase:
            return "Match + 1"
        case .rainbowAdapter:
            return "Rainbow Adapter"
        }
    }

    func cost(count: Int) -> Int {
        switch self {
        case .matchBase:
            return Int(20.0 * pow(1.1, Double(count)))
        case .rainbowAdapter:
            return Int(50.0 * pow(1.1, Double(count)))
        default:
            return 0
        }
    }

    static func of(type: TileType) -> [Upgrade] {
        switch type {
        default:
            return [.matchBase(type), .rainbowAdapter(type)]
        }
    }
}
