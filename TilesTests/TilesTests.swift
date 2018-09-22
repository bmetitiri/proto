@testable import Tiles
import XCTest

class TilesTests: XCTestCase {
    func testScore() {
        XCTAssertEqual(Score.format(score: 1), "1")
        XCTAssertEqual(Score.format(score: 123), "123")
        XCTAssertEqual(Score.format(score: 1000), "1.0k")
        XCTAssertEqual(Score.format(score: 1005), "1.0k")
        XCTAssertEqual(Score.format(score: 1500), "1.5k")
        XCTAssertEqual(Score.format(score: 2010), "2.0k")
        XCTAssertEqual(Score.format(score: 5500), "5.5k")
        XCTAssertEqual(Score.format(score: 12300), "12k")
        XCTAssertEqual(Score.format(score: 999_999), "999k")
        XCTAssertEqual(Score.format(score: 1_234_567), "1.2M")
        XCTAssertEqual(Score.format(score: 450_789_000), "450M")
        XCTAssertEqual(Score.format(score: 1_234_567_890_987_765_432), "1.2E")
    }
}
