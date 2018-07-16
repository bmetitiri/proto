import UIKit

class Menu: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
    }

    @IBAction func close() {
        dismiss(animated: true)
    }
}

protocol MenuPresenter: class {
    func show()
}
