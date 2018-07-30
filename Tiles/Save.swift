import Foundation

class Save: Codable {
    static var loaded: Save?
    static var active: Save {
        if let loaded = loaded {
            return loaded
        }
        if let path = Save.path,
            let save = try? PropertyListDecoder().decode(Save.self, from: Data(contentsOf: path)) {
            loaded = save
            return save
        }
        loaded = Save()
        return loaded!
    }

    static let totalName = Notification.Name("total")
    static let turnName = Notification.Name("turn")
    static let path: URL? = FileManager.default.urls(
        for: .documentDirectory,
        in: .userDomainMask
    ).first?.appendingPathComponent("tiles")

    var tiles = [TileType]()
    var total = [TileType: Int]()
    var turn = [TileType: Int]()
    var upgrades = [Upgrade: Int]()
    var rainbowMultiplier: Int {
        // Check for all tile colors being used in a turn, then find least upgraded rainbow adapter.
        if turn.count == TileType.all.count {
            return Upgrade.rainbowLevel + 1
        }
        return 1
    }

    func capacity(type: TileType) -> Int {
        let upgrade = Upgrade.capacity(type)
        return upgrade.cost(count: (upgrades[upgrade] ?? 0)) * Upgrade.capacityMultiplier
    }

    func comboMultiplier(type: TileType) -> Double {
        guard let count = turn[type], count > 1 else { return 1 }
        return 1 + Upgrade.comboBase * Double(upgrades[Upgrade.comboBonus(type)] ?? 0) * Double(count - 1)
    }

    func save() {
        if let path = Save.path {
            try? PropertyListEncoder().encode(self).write(to: path)
        }
    }

    func add(match: TileType) {
        turn[match] = (turn[match] ?? 0) + 1
        NotificationCenter.default.post(name: Save.turnName, object: turn)
    }

    func score(type: TileType, count: Int) -> Int {
        let perMatch = 1 + (upgrades[Upgrade.matchBase(type)] ?? 0)
        return Int(Double(count * perMatch) * comboMultiplier(type: type)) * rainbowMultiplier
    }

    func commit(tiles: [TileType]) {
        self.tiles = tiles
        for (type, count) in turn {
            total[type] = min(
                (total[type] ?? 0) + score(type: type, count: count),
                capacity(type: type)
            )
        }
        turn.removeAll()
        NotificationCenter.default.post(name: Save.totalName, object: total)
        NotificationCenter.default.post(name: Save.turnName, object: turn)
    }

    func purchase(upgrade: Upgrade, from: TileType) {
        let count = upgrades[upgrade] ?? 0
        let cost = upgrade.cost(count: count)
        let current = total[from] ?? 0
        if current >= cost {
            total[from] = current - cost
            upgrades[upgrade] = count + 1
            if upgrade == Upgrade.empty {
                total.removeAll()
                turn.removeAll()
                upgrades.removeAll()
                NotificationCenter.default.post(name: Save.turnName, object: turn)
            }
        }
        NotificationCenter.default.post(name: Save.totalName, object: total)
    }
}
