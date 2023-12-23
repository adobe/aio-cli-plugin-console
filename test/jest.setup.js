const { stdout, stderr } = require('stdout-stderr')
const fs = jest.requireActual('fs')
const eol = require('eol')
const path = require('path')

jest.setTimeout(30000)

// don't touch the real fs
// jest.mock('fs', () => require('jest-plugin-fs/mock'))

// clear env variables

// trap console log
beforeEach(() => { stdout.start(); stderr.start() })
afterEach(() => { stdout.stop(); stderr.stop() })

// helper for fixtures
global.fixtureFile = (output) => {
  const fixturePath = path.join(__dirname, '__fixtures__', output)
  return fs.readFileSync(fixturePath).toString()
}

// helper for fixtures
global.fixtureJson = (output) => {
  const fixturePath = path.join(__dirname, '__fixtures__', output)
  return JSON.parse(fs.readFileSync(fixturePath).toString())
}

// fixture matcher
expect.extend({
  toMatchFixture (received, argument) {
    const val = global.fixtureFile(argument)
    // eslint-disable-next-line jest/no-standalone-expect
    expect(eol.auto(received)).toEqual(eol.auto(val))
    return { pass: true }
  }
})

/**
 * clean trailing whitespace which will vary with different terminal settings
 *
 * @param {string} input input to clean
 * @returns {string} trimmed string
 */
function cleanWhite (input) {
  return eol.split(input).map(line => { return line.trim() }).join(eol.auto)
}

expect.extend({
  toMatchFixtureIgnoreWhite (received, argument) {
    const val = cleanWhite(global.fixtureFile(argument))
    // eat white
    // eslint-disable-next-line jest/no-standalone-expect
    expect(cleanWhite(received)).toEqual(val)
    return { pass: true }
  }
})

expect.extend({
  toMatchFixtureJson (received, argument) {
    const val = global.fixtureJson(argument)
    // eslint-disable-next-line jest/no-standalone-expect
    expect(received).toEqual(val)
    return { pass: true }
  }
})
