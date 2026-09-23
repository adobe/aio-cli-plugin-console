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

const mockProject = { id: '9999', name: 'myproject', title: 'My Project' }
const mockWorkspace = { id: '1000000001', name: 'Stage', title: 'Stage', enabled: 1 }

const mockEnabledServices = [
  {
    name: 'Adobe Analytics',
    code: 'AdobeAnalyticsSDK',
    type: 'entp',
    properties: { licenseConfigs: [{ id: 'lc1', name: 'Analytics all access', productId: 'P1' }] }
  }
]

const mockSubscribedServiceProperties = [
  {
    name: 'Adobe Analytics',
    sdkCode: 'AdobeAnalyticsSDK',
    roles: null,
    licenseConfigs: [{ id: 'lc1', name: 'Analytics all access', productId: 'P1' }]
  },
  {
    name: 'App Builder Data Services',
    sdkCode: 'AppBuilderDataServicesSDK',
    roles: null,
    licenseConfigs: null
  }
]

const mockConsoleCLIInstance = {
  getProjects: jest.fn().mockResolvedValue([mockProject]),
  getWorkspaces: jest.fn().mockResolvedValue([mockWorkspace]),
  getEnabledServicesForOrg: jest.fn().mockResolvedValue(mockEnabledServices),
  getServicePropertiesFromWorkspaceWithCredentialType: jest.fn().mockResolvedValue(mockSubscribedServiceProperties)
}

jest.mock('@adobe/aio-cli-lib-console', () => {
  const mock = {
    init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
    cleanStdOut: jest.fn(),
    OAUTH_SERVER_TO_SERVER_CREDENTIAL: 'oauth_server_to_server',
    JWT_CREDENTIAL: 'jwt'
  }
  return mock
})

const TheCommand = require('../../../../../src/commands/console/workspace/api/list')

describe('console:workspace:api:list', () => {
  let command

  beforeEach(() => {
    command = new TheCommand([])
    jest.clearAllMocks()
    mockConsoleCLIInstance.getProjects.mockResolvedValue([mockProject])
    mockConsoleCLIInstance.getWorkspaces.mockResolvedValue([mockWorkspace])
    mockConsoleCLIInstance.getEnabledServicesForOrg.mockResolvedValue(mockEnabledServices)
    mockConsoleCLIInstance.getServicePropertiesFromWorkspaceWithCredentialType.mockResolvedValue(mockSubscribedServiceProperties)
  })

  afterEach(() => {
    command = null
  })

  it('should list services subscribed to the workspace', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = [
        '--projectName', 'myproject',
        '--workspaceName', 'Stage',
        '--orgId', '12345'
      ]
      const result = await command.run()

      expect(result).toEqual(mockSubscribedServiceProperties)
      expect(mockConsoleCLIInstance.getServicePropertiesFromWorkspaceWithCredentialType).toHaveBeenCalledWith({
        orgId: '12345',
        projectId: '9999',
        workspace: mockWorkspace,
        supportedServices: mockEnabledServices,
        credentialType: 'oauth_server_to_server'
      })

      const stdout = stdoutSpy.mock.calls.map(a => a[0]).join('')
      expect(stdout).toContain('AdobeAnalyticsSDK')
      expect(stdout).toContain('Analytics all access')
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
      command.argv = [
        '--projectName', 'myproject',
        '--workspaceName', 'Stage',
        '--orgId', '12345',
        '--json'
      ]
      await command.run()
      const stdout = stdoutSpy.mock.calls.map(a => a[0]).join('')
      const parsed = JSON.parse(stdout)
      expect(parsed).toEqual(mockSubscribedServiceProperties)
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })

  it('should output YAML when --yml is used', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = [
        '--projectName', 'myproject',
        '--workspaceName', 'Stage',
        '--orgId', '12345',
        '--yml'
      ]
      await command.run()
      const stdout = stdoutSpy.mock.calls.map(a => a[0]).join('')
      expect(stdout).toContain('AdobeAnalyticsSDK')
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })

  it('should handle empty subscription list', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      mockConsoleCLIInstance.getServicePropertiesFromWorkspaceWithCredentialType.mockResolvedValue([])
      command.argv = [
        '--projectName', 'myproject',
        '--workspaceName', 'Stage',
        '--orgId', '12345'
      ]
      const result = await command.run()
      expect(result).toEqual([])
      const stdout = stdoutSpy.mock.calls.map(a => a[0]).join('')
      expect(stdout).toContain('has no API services subscribed')
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })

  it('should error if project is not found', async () => {
    mockConsoleCLIInstance.getProjects.mockResolvedValue([])
    command.argv = [
      '--projectName', 'nonexistent',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('Project nonexistent not found in the Organization.')
  })

  it('should error if workspace is not found', async () => {
    mockConsoleCLIInstance.getWorkspaces.mockResolvedValue([])
    command.argv = [
      '--projectName', 'myproject',
      '--workspaceName', 'nonexistent',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('Workspace nonexistent not found in Project myproject.')
  })

  it('should use config org.id if orgId flag is not provided', async () => {
    command.argv = [
      '--projectName', 'myproject',
      '--workspaceName', 'Stage'
    ]
    command.getConfig = jest.fn().mockImplementation(key => {
      if (key === 'org.id') return '0987654321'
      return null
    })
    await command.run()
    expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('0987654321')
  })

  it('should error if orgId is not provided and no config', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = [
        '--projectName', 'myproject',
        '--workspaceName', 'Stage'
      ]
      command.getConfig = jest.fn().mockReturnValue(null)
      await expect(command.run()).rejects.toThrow()
      const combined = stdoutSpy.mock.calls.map(a => a[0]).join('') + stderrSpy.mock.calls.map(a => a[0]).join('')
      expect(combined).toContain('You have not selected an Organization. Please select one first.')
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })

  it('should error if required flags are missing', async () => {
    command.argv = ['--orgId', '12345']
    await expect(command.run()).rejects.toThrow()
  })

  it('should handle SDK errors', async () => {
    mockConsoleCLIInstance.getServicePropertiesFromWorkspaceWithCredentialType.mockRejectedValue(new Error('SDK failure'))
    command.argv = [
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('SDK failure')
  })
})
