import UIKit

class Menu: UIViewController, UITableViewDataSource, UITableViewDelegate {
    enum Section: Int {
        case score, available, purchased
    }

    @IBOutlet var table: UITableView!

    @IBAction func close() {
        dismiss(animated: true)
    }

    weak var board: Board?
    var type: TileType = .empty
    var available = [Upgrade]()
    var purchased = [Upgrade]()

    override func viewDidLoad() {
        super.viewDidLoad()
        table.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        table.backgroundColor = UIColor.black
        table.dataSource = self
        table.delegate = self
        load()
    }

    func load() {
        guard let board = board else { return }
        available = Upgrade.of(type: type)
        purchased = Upgrade.of(type: type).filter { (board.upgrades[$0] ?? 0) > 0 }
        table.reloadData()
    }

    func numberOfSections(in _: UITableView) -> Int {
        // Number of Section cases.
        return purchased.count > 0 ? 3 : 2
    }

    func tableView(_: UITableView, didSelectRowAt index: IndexPath) {
        guard let section = Section(rawValue: index.section), let board = board else { return }
        switch section {
        case .available:
            let upgrade = available[index.row]
            let count = board.upgrades[upgrade] ?? 0
            let cost = upgrade.cost(count: count)
            let current = board.total.scores[type] ?? 0
            if current >= cost {
                board.upgrades[upgrade] = count + 1
                board.total.add(type: type, count: -cost)
            }
            load()
        default:
            return
        }
    }

    func tableView(_: UITableView, titleForHeaderInSection section: Int) -> String? {
        guard let section = Section(rawValue: section) else { return nil }
        switch section {
        case .available:
            return "Available"
        case .purchased:
            return "Purchased"
        default:
            return ""
        }
    }

    func tableView(_: UITableView, numberOfRowsInSection section: Int) -> Int {
        guard let section = Section(rawValue: section) else { return 0 }
        switch section {
        case .score:
            return 1
        case .available:
            return available.count
        case .purchased:
            return purchased.count
        }
    }

    func tableView(_: UITableView, cellForRowAt index: IndexPath) -> UITableViewCell {
        let cell = table.dequeueReusableCell(withIdentifier: "cell", for: index)
        cell.backgroundColor = UIColor.clear
        cell.textLabel?.textColor = type.color
        guard let section = Section(rawValue: index.section), let board = board else { return cell }
        switch section {
        case .score:
            let current = board.total.scores[type] ?? 0
            cell.textLabel?.text = "Points: \(current)"
        case .available:
            let upgrade = available[index.row], count = board.upgrades[upgrade] ?? 0
            cell.textLabel?.text = "\(upgrade.name) for \(upgrade.cost(count: count))"
        case .purchased:
            let upgrade = purchased[index.row], count = board.upgrades[upgrade] ?? 0
            cell.textLabel?.text = "\(upgrade.name) (\(count))"
        }
        return cell
    }
}

protocol MenuPresenter: class {
    func show(type: TileType)
}
