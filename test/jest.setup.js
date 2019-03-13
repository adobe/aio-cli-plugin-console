const { stdout } = require('stdout-stderr')

jest.setTimeout(30000)

// trap console log
beforeEach(() => { stdout.start() })
afterEach(() => { stdout.stop() })
