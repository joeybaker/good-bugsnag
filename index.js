import {Squeeze} from 'good-squeeze'
import {Transform} from 'stream'
import hoek from 'hoek'
import bugsnag from 'bugsnag'
import omit from 'lodash/object/omit'
import get from 'lodash/object/get.js'

export default class BugsnagReporter extends Transform {
  static defaultOptions = {
    events: {
      log: 'error'
    , error: '*'
    , request: 'error'
    }
    , config: {
      autoNotify: false
    }
  }

  static handleError (data) {
    bugsnag.notify(data.error || data, omit(data, 'error'))
  }

  static handleRequestError (data) {
    const err = BugsnagReporter.getErrorFromData(data)
    if (!err) return

    const errorName = err.toString().replace('Error: ', '')
    const options = {
      ...data
    , errorName
    , context: data.path
    , groupingHash: data.event
    , severity: 'error'
    }

    bugsnag.notify(err, options)
  }

  static handleLogError (data) {
    const err = BugsnagReporter.getErrorFromData(data)
    if (!err) return

    const errorName = err.toString().replace('Error: ', '')
    bugsnag.notify(err, Object.assign({}, data, {
      errorName
    , groupingHash: data.event
    , severity: 'error'
    }))
  }

  static getErrorFromData (info) {
    const {data} = info

    if (data instanceof Error) return data
    else if (get(data, 'response.isBoom')) {
      return get(data, 'response.output.payload', new Error('Response err' + data))
    }
    else if (data.isBoom) return data
    else if (data.error) return data.error
    else if (data.err) return data.err
    else {
      let err

      try {
        const jsonString = JSON.stringify(info)
        const message = `error log message found without an error. Add \`{error: new Error()}\` to the log data: ${jsonString}`
        err = new Error(message)
      }
      catch (e) {
        err = new Error(info)
      }
      finally {
        bugsnag.notify(err, info)
      }
    }
  }

  static onData (data) {
    switch (data.event) {
      case 'error':
        BugsnagReporter.handleError(data)
        break
      case 'request':
        BugsnagReporter.handleRequestError(data)
        break
      case 'log':
        BugsnagReporter.handleLogError(data)
        break
      default:
        BugsnagReporter.handleLogError(data)
        break
    }
  }

  constructor (events = {}, config = {}) {
    super({objectMode: true, decodeStrings: false})

    if (!(this instanceof BugsnagReporter)) {
      return new BugsnagReporter(events, config)
    }

    hoek.assert(config.apiKey, 'config.apiKey must be a string. ')

    bugsnag.register(config.apiKey, hoek.applyToDefaults(BugsnagReporter.defaultOptions.config, config))

    this._subscription = Squeeze.subscription(hoek.applyToDefaults(BugsnagReporter.defaultOptions.events, events))
  }

  _transform (chunk, enc, cb) {
    if (Squeeze.filter(this._subscription, chunk)) {
      BugsnagReporter.onData(chunk)
    }

    cb()
  }
}
