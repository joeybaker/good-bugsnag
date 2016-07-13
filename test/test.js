import test from 'tape'
import GoodBugsnag from '../index.js'
import {Readable} from 'stream'
import hoek from 'hoek'
import sinon from 'sinon'
import boom from 'boom'
import mockResponse from './fixtures/response.json'

const apiKey = 'xxxx'

const createReadStream = (done = hoek.ignore) => {
  const result = new Readable({objectMode: true})

  result._read = hoek.ignore
  result.once('end', done)

  return result
}

const createReporter = (events, config = {apiKey}) => {
  return new GoodBugsnag(events, config)
}

const messages = {
  error: {
    event: 'error'
  , timestamp: Date.now()
  , data: new Error('err')
  }
  , request: {
    event: 'request'
    , timestamp: Date.now()
    , tags: ['request']
    , data: 'you made a request'
    , pid: 32910
    , id: '1419005623332:new-host.local:48767:i3vrb3z7:10000'
    , method: 'get'
    , path: '/'
  }
}

test('good-bugsnag#constructor', (t) => {
  t.throws(
    () => new GoodBugsnag()
  , 'errors if no API key is passed'
  )

  t.equal(
    typeof GoodBugsnag
    , 'function'
    , `exports a function because that's what Good requires`
  )

  t.end()
})

test('good-bugsnag#init', (t) => {
  const onData = sinon.spy(GoodBugsnag, 'onData')
  const reporter = createReporter()
  const stream = createReadStream()
  const done = sinon.stub()

  t.doesNotThrow(
    reporter.init.bind(reporter, stream, null, done)
  , 'does not throw'
  )

  t.ok(
    done.calledOnce
  , 'calls the callback'
  )


  onData.restore()
  t.end()
})

test('good-bugsnag#onData', (t) => {
  const {onData} = GoodBugsnag
  const handleErrorStub = sinon.stub(GoodBugsnag, 'handleError')
  const handleRequestErrorStub = sinon.stub(GoodBugsnag, 'handleRequestError')

  onData(messages.error)
  t.ok(
    handleErrorStub.calledOnce
  , 'matches error events'
  )

  onData(messages.request)
  t.ok(
    handleRequestErrorStub.calledOnce
  , 'matches request error events'
  )

  handleErrorStub.restore()
  handleRequestErrorStub.restore()
  t.end()
})

test('good-bugsnag#getErrorFromData', (t) => {
  const {getErrorFromData} = GoodBugsnag
  const message = 'oops'
  const boomErr = boom.notFound(message)

  t.equal(
    getErrorFromData({data: boomErr}).message
    , message
    , 'pulls message off of boom Errors'
  )

  t.equal(
    getErrorFromData(mockResponse).message
    , mockResponse.data.response.output.payload.message
    , 'pulls message off of a response'
  )
  t.end()
})
