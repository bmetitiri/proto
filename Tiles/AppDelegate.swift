import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions _: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        guard let window = window else { return false }
        window.rootViewController = Main()
        window.makeKeyAndVisible()
        return true
    }

    func applicationDidEnterBackground(_: UIApplication) {
        Save.active.save()
    }
}
