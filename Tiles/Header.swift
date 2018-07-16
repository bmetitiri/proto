import UIKit

class Header: UIStackView, Score {
    var scores: [TileType: Int] = [:]
    var displays: [TileType: UILabel] = [:]

    required init(coder _: NSCoder) {
        fatalError("How did you get here?!")
    }

    init(save: Save?) {
        if let save = save {
            scores = save.total
        }
        super.init(frame: CGRect.zero)
        distribution = .fillEqually
        for type in TileType.all {
            let display = UILabel(frame: CGRect.zero)
            display.font = UIFont(name: "Chalkduster", size: 16)
            display.textColor = type.color
            display.textAlignment = .center
            if let score = scores[type] {
                display.text = String(score)
            }
            displays[type] = display
            addArrangedSubview(display)
        }
    }

    func add(type: TileType, value: Int = 1) {
        scores[type] = (scores[type] ?? 0) + value
        guard let display = displays[type], let score = scores[type] else { return }
        display.text = String(score)
    }
}

protocol Score: class {
    func add(type: TileType, value: Int)
}
