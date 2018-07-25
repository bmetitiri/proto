import UIKit

class Menu: UIViewController, UITableViewDataSource, UITableViewDelegate {
    enum Section: Int {
        case score, available, purchased
    }

    @IBOutlet var table: UITableView!

    @IBAction func close() {
        dismiss(animated: true)
        after()
    }

    var type: TileType = .empty
    var available = [Upgrade]()
    var purchased = [Upgrade]()
    var after: () -> Void = {}

    override func viewDidLoad() {
        super.viewDidLoad()
        table.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        table.backgroundColor = UIColor.black
        table.dataSource = self
        table.delegate = self
        reloadData()
        NotificationCenter.default.addObserver(forName: Save.totalName, object: nil, queue: nil) { _ in
            self.reloadData()
        }
    }

    func reloadData() {
        available = Upgrade.of(type: type)
        purchased = Upgrade.of(type: type).filter { (Save.active.upgrades[$0] ?? 0) > 0 }
        table.reloadData()
    }

    func numberOfSections(in _: UITableView) -> Int {
        return (purchased.count > 0 ? Section.purchased.rawValue : Section.available.rawValue) + 1
    }

    func tableView(_: UITableView, didSelectRowAt index: IndexPath) {
        guard let section = Section(rawValue: index.section) else { return }
        switch section {
        case .available:
            Save.active.purchase(upgrade: available[index.row], from: type)
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
        guard let section = Section(rawValue: index.section) else { return cell }
        switch section {
        case .score:
            let current = Save.active.total[type] ?? 0
            let upgrade = Upgrade.capacity(type)
            let capacity = upgrade.cost(count: (Save.active.upgrades[upgrade] ?? 0)) * Upgrade.capacityMultiplier
            cell.textLabel?.text = "Points: \(current) out of \(capacity)"
        case .available:
            let upgrade = available[index.row], count = Save.active.upgrades[upgrade] ?? 0
            cell.textLabel?.text = "\(upgrade.name) for \(upgrade.cost(count: count))"
        case .purchased:
            let upgrade = purchased[index.row], count = Save.active.upgrades[upgrade] ?? 0
            cell.textLabel?.text = "\(upgrade.name) (\(count))"
        }
        return cell
    }
}

protocol MenuPresenter: class {
    func show(type: TileType, after: @escaping () -> Void)
}
