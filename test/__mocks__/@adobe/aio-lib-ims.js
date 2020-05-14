const mockConsole = {
  getToken: jest.fn(() => 'VALID_TOKEN'),
  context: {
    getCli: jest.fn(() => 'stage'),
    setCli: jest.fn()
  }
}

module.exports = mockConsole
