import {Squeeze as squeeze} from 'good-squeeze'
import hoek from 'hoek'
import bugsnag from 'bugsnag'
import omit from 'lodash/object/omit'

export default class BugsnagReporter {
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
    bugsnag.notify(data.error, omit(data, 'error'))
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
    bugsnag.notify(err, Object.assign(data, {
      errorName
    , groupingHash: data.event
    , severity: 'error'
    }))
  }

  static getErrorFromData (info) {
    const {data} = info

    if (data instanceof Error) return data
    else if (data.error) return data.error
    else if (data.err) return data.err
    else {
      const jsonString = JSON.stringify(info)
      const message = `error log message found without an error. Add \`{error: new Error()}\` to the log data: ${jsonString}`
      const err = new Error(message)
      bugsnag.notify(err, info)
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

  constructor (events, config = {}) {
    if (!(this instanceof BugsnagReporter)) {
      return new BugsnagReporter(events, config)
    }

    hoek.assert(config.apiKey, 'config.apiKey must be a string. ')

    bugsnag.register(config.apiKey, hoek.applyToDefaults(BugsnagReporter.defaultOptions.config, config))

    this.squeeze = squeeze(hoek.applyToDefaults(BugsnagReporter.defaultOptions.events, events))
  }

  init (readStream, emitter, done) {
    this.squeeze.on('data', BugsnagReporter.onData)

    readStream.pipe(this.squeeze)
    done()
  }
}
