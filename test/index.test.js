const index = require('../src')

describe('index', () => {
  test('exports', () => {
    expect(typeof index).toEqual('object')
  })

  test('return accessToken', () => {
    expect(index.index.name).toBe('ConsoleCommand')
    expect(index['select-integration'].name).toBe('selectIntegration')
    expect(index['reset-integration'].name).toBe('resetIntegration')
    expect(index['list-integrations'].name).toBe('listIntegrations')
    expect(index['selected-integration'].name).toBe('selectedIntegration')
    expect(index.integration.name).toBe('integration')
  })
})
