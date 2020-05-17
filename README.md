[![Build Status](https://travis-ci.org/waltz-controls/waltz-user-actions-plugin.svg?branch=master)](https://travis-ci.org/waltz-controls/waltz-user-actions-plugin)
![GitHub package.json version](https://img.shields.io/github/package-json/v/waltz-controls/waltz-user-actions-plugin)

[![Docs](https://img.shields.io/badge/Docs-Generated-green.svg)](https://waltz-controls.github.io/waltz-user-actions-plugin/)


# waltz-user-actions-plugin



```bash
npm install @waltz-controls/waltz-user-actions-plugin --registry=https://npm.pkg.github.com/waltz-controls
```

## Usage:

```js
//main.js
app.registerController(new UserActionController())

//foo.js
await app.getController(kControllerUserAction).submit(new UserAction(/*...*/))
```

## Runtime dependencies

1. `@waltz-controls/middleware`
2. `@waltz-controls/waltz-tango-rest-plugin`

