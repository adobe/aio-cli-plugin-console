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

const mockProject = {
  id: '9999',
  name: 'myproject',
  title: 'My Project'
}

const mockWorkspace = {
  id: '1000000001',
  name: 'Stage',
  title: 'Stage',
  enabled: 1
}

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

const mockSubscribeResponse = {
  sdkList: ['AdobeAnalyticsSDK']
}

const mockConsoleCLIInstance = {
  getProjects: jest.fn().mockResolvedValue([mockProject]),
  getWorkspaces: jest.fn().mockResolvedValue([mockWorkspace]),
  getEnabledServicesForOrg: jest.fn().mockResolvedValue(mockEnabledServices),
  subscribeToServicesWithCredentialType: jest.fn().mockResolvedValue(mockSubscribeResponse)
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

const TheCommand = require('../../../../src/commands/console/workspace/add-api')

describe('console:workspace:add-api', () => {
  let command

  beforeEach(() => {
    command = new TheCommand([])
    jest.clearAllMocks()
    mockConsoleCLIInstance.getProjects.mockResolvedValue([mockProject])
    mockConsoleCLIInstance.getWorkspaces.mockResolvedValue([mockWorkspace])
    mockConsoleCLIInstance.getEnabledServicesForOrg.mockResolvedValue(mockEnabledServices)
    mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mockResolvedValue(mockSubscribeResponse)
  })

  afterEach(() => {
    command = null
  })

  it('should add a single API to a workspace', async () => {
    command.argv = [
      '--service-code', 'AdobeAnalyticsSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    const result = await command.run()

    expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('12345')
    expect(mockConsoleCLIInstance.getWorkspaces).toHaveBeenCalledWith('12345', '9999')
    expect(mockConsoleCLIInstance.getEnabledServicesForOrg).toHaveBeenCalledWith('12345')
    expect(mockConsoleCLIInstance.subscribeToServicesWithCredentialType).toHaveBeenCalledWith({
      orgId: '12345',
      project: mockProject,
      workspace: mockWorkspace,
      serviceProperties: [
        {
          name: 'Adobe Analytics',
          sdkCode: 'AdobeAnalyticsSDK',
          roles: [{ id: 1, code: 'role1', name: null }],
          licenseConfigs: [{ id: '111', name: 'config1', productId: 'P1' }]
        }
      ],
      credentialType: 'oauth_server_to_server'
    })
    expect(result).toEqual(mockSubscribeResponse)
  })

  it('should add multiple comma-separated APIs', async () => {
    command.argv = [
      '--service-code', 'AdobeAnalyticsSDK,CloudIntegrationSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await command.run()

    const call = mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mock.calls[0][0]
    expect(call.serviceProperties).toHaveLength(2)
    expect(call.serviceProperties[0].sdkCode).toBe('AdobeAnalyticsSDK')
    expect(call.serviceProperties[1].sdkCode).toBe('CloudIntegrationSDK')
  })

  it('should handle services with null properties', async () => {
    command.argv = [
      '--service-code', 'AppBuilderDataServicesSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await command.run()

    const call = mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mock.calls[0][0]
    expect(call.serviceProperties).toEqual([
      {
        name: 'App Builder Data Services',
        sdkCode: 'AppBuilderDataServicesSDK',
        roles: null,
        licenseConfigs: null
      }
    ])
  })

  it('should error if service code is not found in the org', async () => {
    command.argv = [
      '--service-code', 'NonExistentSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('Service code(s) not found or not enabled in the Organization: NonExistentSDK')
    expect(mockConsoleCLIInstance.subscribeToServicesWithCredentialType).not.toHaveBeenCalled()
  })

  it('should error if project is not found', async () => {
    mockConsoleCLIInstance.getProjects.mockResolvedValue([])
    command.argv = [
      '--service-code', 'AdobeAnalyticsSDK',
      '--projectName', 'nonexistent',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('Project nonexistent not found in the Organization.')
  })

  it('should error if workspace is not found', async () => {
    mockConsoleCLIInstance.getWorkspaces.mockResolvedValue([])
    command.argv = [
      '--service-code', 'AdobeAnalyticsSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'nonexistent',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('Workspace nonexistent not found in Project myproject.')
  })

  it('should error if orgId is not provided and no config', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = [
        '--service-code', 'AdobeAnalyticsSDK',
        '--projectName', 'myproject',
        '--workspaceName', 'Stage'
      ]
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

  it('should use config org.id if orgId flag is not provided', async () => {
    command.argv = [
      '--service-code', 'AdobeAnalyticsSDK',
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

  it('should error if all service codes are empty after parsing', async () => {
    command.argv = [
      '--service-code', ' , , ',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('At least one service code must be provided.')
    expect(mockConsoleCLIInstance.subscribeToServicesWithCredentialType).not.toHaveBeenCalled()
  })

  it('should handle SDK errors from subscribeToServices', async () => {
    mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mockRejectedValue(new Error('SDK subscribe failed'))
    command.argv = [
      '--service-code', 'AdobeAnalyticsSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('SDK subscribe failed')
  })

  it('should error if required flags are missing', async () => {
    command.argv = ['--projectName', 'myproject', '--orgId', '12345']
    await expect(command.run()).rejects.toThrow()
  })

  it('should output JSON when --json is used', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = [
        '--service-code', 'AdobeAnalyticsSDK',
        '--projectName', 'myproject',
        '--workspaceName', 'Stage',
        '--orgId', '12345',
        '--json'
      ]
      await command.run()

      const stdout = stdoutSpy.mock.calls.map(args => args[0]).join('')
      let parsed
      expect(() => { parsed = JSON.parse(stdout) }).not.toThrow()
      expect(parsed).toMatchObject(mockSubscribeResponse)
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
        '--service-code', 'AdobeAnalyticsSDK',
        '--projectName', 'myproject',
        '--workspaceName', 'Stage',
        '--orgId', '12345',
        '--yml'
      ]
      await command.run()

      const stdout = stdoutSpy.mock.calls.map(args => args[0]).join('')
      expect(stdout).toContain('sdkList')
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })
})
