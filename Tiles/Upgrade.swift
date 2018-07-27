import Foundation

enum Upgrade: Codable, Hashable {
    enum Key: CodingKey {
        case matchBase
        case comboBonus
        case rainbowAdapter
        case capacity
    }

    case empty
    case matchBase(TileType)
    case comboBonus(TileType)
    case rainbowAdapter(TileType)
    case capacity(TileType)

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: Key.self)
        if let tile = try? container.decode(TileType.self, forKey: Key.matchBase) {
            self = .matchBase(tile)
            return
        }
        if let tile = try? container.decode(TileType.self, forKey: Key.comboBonus) {
            self = .comboBonus(tile)
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

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: Key.self)
        switch self {
        case let .matchBase(tile):
            try container.encode(tile, forKey: Key.matchBase)
        case let .comboBonus(tile):
            try container.encode(tile, forKey: Key.comboBonus)
        case let .rainbowAdapter(tile):
            try container.encode(tile, forKey: Key.rainbowAdapter)
        case let .capacity(tile):
            try container.encode(tile, forKey: Key.capacity)
        case .empty:
            return
        }
    }

    static let comboBase = 1.01
    static let capacityMultiplier = 5

    static func of(type: TileType) -> [Upgrade] {
        switch type {
        default:
            return [.matchBase(type), .comboBonus(type), .rainbowAdapter(type), .capacity(type)]
        }
    }

    var name: String {
        switch self {
        case .matchBase:
            return "Match + 1"
        case .comboBonus:
            return "Combo + 1%"
        case .rainbowAdapter:
            return "Rainbow Adapter"
        case .capacity:
            return "Capacity ↑"
        case .empty:
            return "How did you get here?!"
        }
    }

    func cost(count: Int) -> Int {
        switch self {
        case .matchBase:
            return Int(20.0 * pow(1.1, Double(count)))
        case .comboBonus:
            return Int(50.0 * pow(1.15, Double(count)))
        case .rainbowAdapter:
            return Int(100.0 * pow(1.2, Double(count)))
        case .capacity:
            return Int(200.0 * pow(1.3, Double(count)))
        case .empty:
            return 0
        }
    }
}
