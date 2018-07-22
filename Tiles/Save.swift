import Foundation

class Save: Codable {
    var tiles = [TileType]()
    var total = [TileType: Int]()
    var turn = [TileType: Int]()
    var upgrades = [Upgrade: Int]()

    func save() {
        if let path = Save.path {
            try? PropertyListEncoder().encode(self).write(to: path)
        }
    }

    func add(match: TileType) {
        turn[match] = (turn[match] ?? 0) + (upgrades[Upgrade.matchBase(match)] ?? 0) + 1
        NotificationCenter.default.post(name: Save.turn, object: turn)
    }

    func commit(tiles: [TileType]) {
        self.tiles = tiles
        for (type, count) in turn {
            total[type] = (total[type] ?? 0) + count
        }
        turn.removeAll()
        NotificationCenter.default.post(name: Save.total, object: total)
        NotificationCenter.default.post(name: Save.turn, object: turn)
    }

    func purchase(upgrade: Upgrade, from: TileType) {
        let count = upgrades[upgrade] ?? 0
        let cost = upgrade.cost(count: count)
        let current = total[from] ?? 0
        if current >= cost {
            total[from] = current - cost
            upgrades[upgrade] = count + 1
        }
        NotificationCenter.default.post(name: Save.total, object: total)
    }

    static var path: URL? {
        return FileManager.default.urls(
            for: .documentDirectory,
            in: .userDomainMask
        ).first?.appendingPathComponent("tiles")
    }

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
        return Save()
    }

    static let total = Notification.Name("total")
    static let turn = Notification.Name("turn")
}
