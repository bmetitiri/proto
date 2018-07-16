import UIKit

class Menu: UIViewController {
    @IBOutlet var table: UITableView!
    var type: TileType = .empty

    override func viewDidLoad() {
        super.viewDidLoad()
        table.backgroundColor = type.color
    }

    @IBAction func close() {
        dismiss(animated: true)
    }
}

protocol MenuPresenter: class {
    func show(type: TileType)
}
