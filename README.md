# good-bugsnag [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-url]][daviddm-image] [![Build Status][travis-image]][travis-url]

A [good](https://github.com/hapijs/good) reporter implementation to write [hapi](http://hapijs.com/) server events to the [Bugsnag](https://bugsnag.com). ou'll need a [bugsnag account](https://bugsnag.com/user/new) and API key to use this plugin.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [Install](#install)
- [Usage](#usage)
- [Methods](#methods)
- [Events](#events)
- [Tests](#tests)
- [Developing](#developing)
  - [Requirements](#requirements)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```sh
npm i -S good-bugsnag
```


## Usage

```js
import goodBugsnag from 'good-bugsnag'
import good from 'good'

const reporters = [
  {reporter: goodBugsnag, config: {apiKey: 'xxxxx'}}
]

server.register({
    register: good
  , options: {reporters}
})
```

## Methods
### `goodBugsnag(<Object> events, <Object> config)`
Creates a new GoodBugsnag object with the following arguments:

- `events`: an object of key value pairs.
  - `key`: one of the supported [good events](https://github.com/hapijs/good). Events, will send their data to Bugsnag.
  - `value`: a single string or an array of strings to filter incoming events. "\*" indicates no filtering. `null` and `undefined` are assumed to be "\*".
  - defaults:

      ```js
      {
        log: 'error'
      , error: '*'
      , request: 'error'
      }
      ```

- `[config]`: configuration object with the following available keys
  - `apiKey`: **required** your bugsnag API key.
  - `autoNotify`: defaults to `false`: Allows Hapi to report uncaught exceptions and send them via Good, rather than Bugsnag handling them on it's own. You probably want to leave this as the default.
  - any valid [Bugsnag configuration option](https://bugsnag.com/docs/notifiers/node#configuration)

## Tests
Tests are in [tape](https://github.com/substack/tape).


* `npm test` will run the tests
* `npm run tdd` will run the tests on every file change.

## Developing
To publish, run `npm run release -- [{patch,minor,major}]`

_NOTE: you might need to `sudo ln -s /usr/local/bin/node /usr/bin/node` to ensure node is in your path for the git hooks to work_

### Requirements
* **npm > 2.0.0** So that passing args to a npm script will work. `npm i -g npm`
* **git > 1.8.3** So that `git push --follow-tags` will work. `brew install git`

## License

Artistic 2.0 © [Joey Baker](http://byjoeybaker.com) and contributors. A copy of the license can be found in the file `LICENSE`.


[npm-url]: https://npmjs.org/package/good-bugsnag
[npm-image]: https://badge.fury.io/js/good-bugsnag.svg
[travis-url]: https://travis-ci.org/joeybaker/good-bugsnag
[travis-image]: https://travis-ci.org/joeybaker/good-bugsnag.svg?branch=master
[daviddm-url]: https://david-dm.org/joeybaker/good-bugsnag.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/joeybaker/good-bugsnag
