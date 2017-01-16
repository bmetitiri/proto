gintendo [![CircleCI](https://circleci.com/gh/arkie/gintendo.svg?style=shield)](https://circleci.com/gh/arkie/gintendo)
--------

A small library for pulling information from [nintendo.com](http://www.nintendo.com).

Currently used in:

- [Ninsendo](https://ninsend-o.appspot.com) - Simple app to send an email when
  there's a price reduction in the eshop.

To use in your own code:

- View the included [ninsendo](/ninsendo) sample Google App Engine app.
- Import the repository.

  ```import "github.com/arkie/gintendo"```

- Search for games by partial match on title to return a `Result` of `[]Game`.

  ```gintendo.Search("mario") ```

- Load `Game` details including price by game ID (found in `gintendo.Search`).

  ```gintendo.Load("VnTS_u2DBaJ5N-PXEJC-gWWMkSC5Rixm") ```
