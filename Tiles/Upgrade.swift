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

    static let comboBase = 0.1
    static let capacityMultiplier = 5
    static var rainbowLevel: Int {
        return TileType.all.map { Save.active.upgrades[Upgrade.rainbowAdapter($0)] ?? 0 }.min() ?? 0
    }

    static func of(type: TileType) -> [Upgrade] {
        let base: [Upgrade] = [
            .matchBase(type),
            .rainbowAdapter(type),
            .comboBonus(type),
            .capacity(type),
        ].filter { $0.available }
        switch type {
        case .red:
            return base + [.empty]
        default:
            return base
        }
    }

    var available: Bool {
        switch self {
        case let .rainbowAdapter(tile):
            return Save.active.upgrades[.matchBase(tile)] ?? 0 >= 5
        case let .comboBonus(tile):
            return Save.active.upgrades[.matchBase(tile)] ?? 0 >= 10
        case let .capacity(tile):
            return Save.active.upgrades[.capacity(tile)] != nil ||
                Save.active.total[tile] ?? 0 > Save.active.capacity(type: tile) / 2
        default:
            return true
        }
    }

    var name: String {
        switch self {
        case .matchBase:
            return "Match + 1"
        case .comboBonus:
            return "Combo + 10%"
        case .rainbowAdapter:
            return "Rainbow Adapter"
        case .capacity:
            return "Capacity ↑"
        case .empty:
            return "RESET GAME"
        }
    }

    var description: String {
        switch self {
        case .matchBase:
            return "Increase base match amount"
        case .comboBonus:
            return "Add 10% to total per combo"
        case .rainbowAdapter:
            return "Collect all colors to unlock multiplier"
        case .capacity:
            return "Raise max amount"
        case .empty:
            return "No refunds!"
        }
    }

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

    func cost(count: Int) -> Int {
        switch self {
        case .matchBase:
            return Int(20.0 * pow(1.1, Double(count)))
        case .rainbowAdapter:
            return Int(100.0 * pow(1.2, Double(count)))
        case .comboBonus:
            return Int(200.0 * pow(1.15, Double(count)))
        case .capacity:
            return Int(200.0 * pow(1.3, Double(count)))
        case .empty:
            return Save.active.capacity(type: .red)
        }
    }

    func to(type: TileType) -> Upgrade {
        switch self {
        case .matchBase: return .matchBase(type)
        case .rainbowAdapter: return .rainbowAdapter(type)
        case .comboBonus: return .comboBonus(type)
        case .capacity: return .capacity(type)
        default: return self
        }
    }
}
