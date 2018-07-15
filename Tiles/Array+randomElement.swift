import Foundation

// TODO: Remove after Swift 4.2
extension Array {
    func randomElement() -> Element? {
        if isEmpty { return nil }
        return self[Int(arc4random_uniform(UInt32(self.count)))]
    }
}
