import Foundation
import PipesCore

class Game {
  let controls: Controls
  let map: Map

  init() {
    let height = 20
    let width = 40
    map = Map(width: width, height: height)
    map.inventory[.mine] = 2
    map.inventory[.furnace] = 2
    map.inventory[.factory] = 1
    map.inventory[.yard] = 1

    controls = Controls(map: map)
  }

  @objc func tick() {
    map.update()
  }

  func main() {
    // Source: https://github.com/lyft/Kronos/blob/master/Example/main.swift
    let timer = Timer.scheduledTimer(timeInterval: 0.2, target: self,
                                     selector: #selector(tick),
                                     userInfo: nil, repeats: true)
    while RunLoop.current.run(mode: .defaultRunLoopMode,
                              before: Date(timeIntervalSinceNow: 0.01)) {
      controls.update()
      if case Mode.quit = controls.mode {
        break
      }
      map.draw()
      controls.draw()
    }
    timer.invalidate()
  }
}
