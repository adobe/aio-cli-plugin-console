/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const mockEnabledServices = [
  {
    name: 'Adobe Analytics',
    code: 'AdobeAnalyticsSDK',
    type: 'entp',
    properties: {
      roles: [{ id: 1, code: 'role1', name: null }],
      licenseConfigs: [{ id: '111', name: 'config1', productId: 'P1' }]
    }
  },
  {
    name: 'I/O Events',
    code: 'CloudIntegrationSDK',
    type: 'entp',
    properties: {
      roles: null,
      licenseConfigs: null
    }
  },
  {
    name: 'App Builder Data Services',
    code: 'AppBuilderDataServicesSDK',
    type: 'entp',
    properties: null
  }
]

const mockConsoleCLIInstance = {
  getEnabledServicesForOrg: jest.fn().mockResolvedValue(mockEnabledServices)
}

jest.mock('@adobe/aio-cli-lib-console', () => {
  const mock = {
    init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
    cleanStdOut: jest.fn()
  }
  return mock
})

const TheCommand = require('../../../../src/commands/console/workspace/list-apis')

describe('console:workspace:list-apis', () => {
  let command

  beforeEach(() => {
    command = new TheCommand([])
    jest.clearAllMocks()
    mockConsoleCLIInstance.getEnabledServicesForOrg.mockResolvedValue(mockEnabledServices)
  })

  afterEach(() => {
    command = null
  })

  it('should list enabled services for the org', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = ['--orgId', '12345']
      const result = await command.run()

      expect(mockConsoleCLIInstance.getEnabledServicesForOrg).toHaveBeenCalledWith('12345')
      expect(result).toEqual(mockEnabledServices)

      const stdout = stdoutSpy.mock.calls.map(args => args[0]).join('')
      expect(stdout).toContain('AdobeAnalyticsSDK')
      expect(stdout).toContain('CloudIntegrationSDK')
      expect(stdout).toContain('AppBuilderDataServicesSDK')
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })

  it('should output JSON when --json is used', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = ['--orgId', '12345', '--json']
      await command.run()

      const stdout = stdoutSpy.mock.calls.map(args => args[0]).join('')
      let parsed
      expect(() => { parsed = JSON.parse(stdout) }).not.toThrow()
      expect(parsed).toEqual(mockEnabledServices)
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })

  it('should output YAML when --yml is used', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = ['--orgId', '12345', '--yml']
      await command.run()

      const stdout = stdoutSpy.mock.calls.map(args => args[0]).join('')
      expect(stdout).toContain('AdobeAnalyticsSDK')
      expect(stdout).toContain('CloudIntegrationSDK')
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })

  it('should handle empty services list', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      mockConsoleCLIInstance.getEnabledServicesForOrg.mockResolvedValue([])
      command.argv = ['--orgId', '12345']
      const result = await command.run()

      expect(result).toEqual([])
      const stdout = stdoutSpy.mock.calls.map(args => args[0]).join('')
      expect(stdout).toContain('No enabled API services found')
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })

  it('should use config org.id if orgId flag is not provided', async () => {
    command.argv = []
    command.getConfig = jest.fn().mockImplementation(key => {
      if (key === 'org.id') return '0987654321'
      return null
    })
    await command.run()
    expect(mockConsoleCLIInstance.getEnabledServicesForOrg).toHaveBeenCalledWith('0987654321')
  })

  it('should error if orgId is not provided and no config', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = []
      command.getConfig = jest.fn().mockReturnValue(null)
      await expect(command.run()).rejects.toThrow()

      const stdout = stdoutSpy.mock.calls.map(args => args[0]).join('')
      const stderr = stderrSpy.mock.calls.map(args => args[0]).join('')
      const combined = stdout + stderr
      expect(combined).toContain('You have not selected an Organization. Please select one first.')
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })

  it('should handle SDK errors', async () => {
    mockConsoleCLIInstance.getEnabledServicesForOrg.mockRejectedValue(new Error('API failure'))
    command.argv = ['--orgId', '12345']
    await expect(command.run()).rejects.toThrow('API failure')
  })
})
