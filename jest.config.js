module.exports = {
  'collectCoverage': true,
  testRegex: '/test/[^_]*/*.js$',
  collectCoverageFrom: ['./src/**/*.js'],
  'reporters': [
    'default',
    'jest-junit'
  ],
  'testEnvironment': 'node',
  'setupFilesAfterEnv': [
    './test/__setup__/jest.setup.js'
  ]
}
