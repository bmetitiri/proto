import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  func application(application: UIApplication, willFinishLaunchingWithOptions launchOptions: [NSObject : AnyObject]?) -> Bool {
    window = UIWindow(frame: UIScreen.mainScreen().bounds)
    if let window = window {
        window.rootViewController = ViewController()
        window.makeKeyAndVisible()
    }
    return true
  }
  func applicationDidEnterBackground(application: UIApplication) {
  }
}
