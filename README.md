# chromeExtAccessControl

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)

Extension for chrome-like browser that enables manipulations with HTTP Access Control.
Can be used to send requests outside currently visited web page's domain.
It's written in ECMA6 except GUI that is written in vanilla js.

# Install
```
npm install
gulp

# for dev building, etc. use one of these
gulp build # one-time build of everything (default job)
gulp browserifyWatch # convertion on source file(s) change
gulp buildStats # prints original, build and minified file sizes
gulp clean # removes all build files
```

# Usage
After running build there will be two directories in `build/` directory both with same structure.
`regular` contains build handy for development and debugging. `min` contains minified version for plugin;
use this version to pack extension in chrome(resulting extension size will be smaller).
Load choosen version of package into browser.

## Permission rules
Rules are made of two regular expressions - first for url request is originating from and second for request target url.
While experiencing problems double check that you are using regular expressions and not chrome's "match pattern" instead.
