import Foundation

enum Upgrade: Codable, Hashable {
    enum Key: CodingKey {
        case matchBase
        case rainbowAdapter
        case capacity
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: Key.self)
        switch self {
        case let .matchBase(tile):
            try container.encode(tile, forKey: Key.matchBase)
        case let .rainbowAdapter(tile):
            try container.encode(tile, forKey: Key.rainbowAdapter)
        case let .capacity(tile):
            try container.encode(tile, forKey: Key.capacity)
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
        if let tile = try? container.decode(TileType.self, forKey: Key.capacity) {
            self = .capacity(tile)
            return
        }
        self = .empty
    }

    case empty
    case matchBase(TileType)
    case rainbowAdapter(TileType)
    case capacity(TileType)

    static let capacityMultiplier = 4

    static func of(type: TileType) -> [Upgrade] {
        switch type {
        default:
            return [.matchBase(type), .rainbowAdapter(type), .capacity(type)]
        }
    }

    var name: String {
        switch self {
        case .empty:
            return "How did you get here?!"
        case .matchBase:
            return "Match + 1"
        case .rainbowAdapter:
            return "Rainbow Adapter"
        case .capacity:
            // TODO: Show current / next capacity.
            // let cap = cost(count: (Save.active.upgrades[self] ?? 0) + 1) * Upgrade.capacityMultiplier
            return "Capacity ↑"
        }
    }

    func cost(count: Int) -> Int {
        switch self {
        case .matchBase:
            return Int(20.0 * pow(1.1, Double(count)))
        case .rainbowAdapter:
            return Int(50.0 * pow(1.15, Double(count)))
        case .capacity:
            return Int(100.0 * pow(1.2, Double(count)))
        default:
            return 0
        }
    }
}
