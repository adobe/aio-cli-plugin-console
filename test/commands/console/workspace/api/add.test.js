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
    properties: {
      roles: [{ id: 1, code: 'role1', name: null }],
      licenseConfigs: [
        { id: 'lc1', name: 'Analytics all access', productId: 'P1' },
        { id: 'lc2', name: 'Analytics - Adobe IO DEMO', productId: 'P1' }
      ]
    }
  },
  {
    name: 'I/O Events',
    code: 'CloudIntegrationSDK',
    type: 'entp',
    properties: { roles: null, licenseConfigs: null }
  },
  {
    name: 'App Builder Data Services',
    code: 'AppBuilderDataServicesSDK',
    type: 'entp',
    properties: null
  }
]

const mockSubscribeResponse = { sdkList: ['AdobeAnalyticsSDK'] }

const mockConsoleCLIInstance = {
  getProjects: jest.fn().mockResolvedValue([mockProject]),
  getWorkspaces: jest.fn().mockResolvedValue([mockWorkspace]),
  getEnabledServicesForOrg: jest.fn().mockResolvedValue(mockEnabledServices),
  getServicePropertiesFromWorkspaceWithCredentialType: jest.fn().mockResolvedValue([]),
  subscribeToServicesWithCredentialType: jest.fn().mockResolvedValue(mockSubscribeResponse)
}

jest.mock('@adobe/aio-cli-lib-console', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn(),
  OAUTH_SERVER_TO_SERVER_CREDENTIAL: 'oauth_server_to_server',
  JWT_CREDENTIAL: 'jwt'
}))

const TheCommand = require('../../../../../src/commands/console/workspace/api/add')
const { parseLicenseConfigFlags, resolveLicenseConfigs, assertSubscribeSuccess, pickServiceForCode, dedupeServicesByCode, mergeServiceProperties } = TheCommand

describe('parseLicenseConfigFlags', () => {
  it('should parse a single sdkCode with one profile', () => {
    expect(parseLicenseConfigFlags(['AdobeAnalyticsSDK=profileA'])).toEqual({
      AdobeAnalyticsSDK: ['profileA']
    })
  })

  it('should parse a single sdkCode with multiple profiles', () => {
    expect(parseLicenseConfigFlags(['AdobeAnalyticsSDK=profileA,profileB'])).toEqual({
      AdobeAnalyticsSDK: ['profileA', 'profileB']
    })
  })

  it('should parse multiple sdkCodes', () => {
    expect(parseLicenseConfigFlags([
      'AdobeAnalyticsSDK=profileA',
      'OtherSDK=X,Y'
    ])).toEqual({
      AdobeAnalyticsSDK: ['profileA'],
      OtherSDK: ['X', 'Y']
    })
  })

  it('should merge repeated entries for the same sdkCode', () => {
    expect(parseLicenseConfigFlags([
      'AdobeAnalyticsSDK=profileA',
      'AdobeAnalyticsSDK=profileB,profileC'
    ])).toEqual({
      AdobeAnalyticsSDK: ['profileA', 'profileB', 'profileC']
    })
  })

  it('should throw on value missing =', () => {
    expect(() => parseLicenseConfigFlags(['AdobeAnalyticsSDK'])).toThrow('Invalid --license-config value')
  })

  it('should throw on value starting with =', () => {
    expect(() => parseLicenseConfigFlags(['=profileA'])).toThrow('Invalid --license-config value')
  })

  it('should throw on value with empty profile list', () => {
    expect(() => parseLicenseConfigFlags(['AdobeAnalyticsSDK='])).toThrow('Invalid --license-config value')
  })

  it('should throw on whitespace-only profiles', () => {
    expect(() => parseLicenseConfigFlags(['AdobeAnalyticsSDK= , '])).toThrow('Invalid --license-config value')
  })
})

describe('resolveLicenseConfigs', () => {
  const available = [
    { id: 'lc1', name: 'ProfileA', productId: 'P1' },
    { id: 'lc2', name: 'ProfileB', productId: 'P1' }
  ]

  it('should match profiles by id', () => {
    expect(resolveLicenseConfigs(available, ['lc1'], 'X')).toEqual([available[0]])
  })

  it('should match profiles by name', () => {
    expect(resolveLicenseConfigs(available, ['ProfileB'], 'X')).toEqual([available[1]])
  })

  it('should match a profile by productId', () => {
    const single = [
      { id: '875473476', name: 'Default Frame.io Enterprise', productId: 'AA458DFE4F7020A0441A' }
    ]
    expect(resolveLicenseConfigs(single, ['AA458DFE4F7020A0441A'], 'FrameioAPISDK')).toEqual([single[0]])
  })

  it('should match multiple profiles mixing id and name', () => {
    expect(resolveLicenseConfigs(available, ['lc1', 'ProfileB'], 'X')).toEqual(available)
  })

  it('should throw when a profile cannot be matched', () => {
    expect(() => resolveLicenseConfigs(available, ['bogus'], 'X'))
      .toThrow('Product profile(s) not found for service X: bogus')
  })
})

describe('pickServiceForCode', () => {
  it('should return undefined when no service matches the code', () => {
    expect(pickServiceForCode([{ code: 'A', type: 'entp' }], 'B')).toBeUndefined()
  })

  it('should return the single match when there is no duplicate', () => {
    const s = { code: 'A', type: 'entp', properties: { licenseConfigs: [{ id: 'lc1' }] } }
    expect(pickServiceForCode([s], 'A')).toBe(s)
  })

  it('should prefer the entp record with populated licenseConfigs when a code appears twice', () => {
    // Repro of the Frame.io case in getEnabledServicesForOrg
    const adobeid = { code: 'FrameioAPISDK', type: 'adobeid', properties: null }
    const entp = {
      code: 'FrameioAPISDK',
      type: 'entp',
      properties: { licenseConfigs: [{ id: '875473476', productId: 'AA458DFE4F7020A0441A' }] }
    }
    expect(pickServiceForCode([adobeid, entp], 'FrameioAPISDK')).toBe(entp)
  })

  it('should fall back to an entp record without profiles before an adobeid record', () => {
    const adobeid = { code: 'X', type: 'adobeid', properties: null }
    const entp = { code: 'X', type: 'entp', properties: null }
    expect(pickServiceForCode([adobeid, entp], 'X')).toBe(entp)
  })

  it('should fall back to the first match when no entp record exists', () => {
    const a = { code: 'Y', type: 'adobeid' }
    const b = { code: 'Y', type: 'adobeid' }
    expect(pickServiceForCode([a, b], 'Y')).toBe(a)
  })
})

describe('dedupeServicesByCode', () => {
  it('should return a single record per code, preferring entp+licenseConfigs', () => {
    const services = [
      { code: 'FrameioAPISDK', type: 'adobeid', properties: null },
      { code: 'FrameioAPISDK', type: 'entp', properties: { licenseConfigs: [{ id: 'lc1' }] } },
      { code: 'OtherSDK', type: 'entp' }
    ]
    const deduped = dedupeServicesByCode(services)
    expect(deduped).toHaveLength(2)
    expect(deduped.find(s => s.code === 'FrameioAPISDK')).toBe(services[1])
    expect(deduped.find(s => s.code === 'OtherSDK')).toBe(services[2])
  })

  it('should be a no-op when no duplicates exist', () => {
    const services = [{ code: 'A', type: 'entp' }, { code: 'B', type: 'entp' }]
    expect(dedupeServicesByCode(services)).toEqual(services)
  })
})

describe('mergeServiceProperties', () => {
  it('should append new services when there is no overlap', () => {
    const existing = [{ sdkCode: 'A' }]
    const requested = [{ sdkCode: 'B' }]
    expect(mergeServiceProperties(existing, requested)).toEqual([{ sdkCode: 'A' }, { sdkCode: 'B' }])
  })

  it('should let the requested entry win for overlapping sdkCodes', () => {
    const existing = [{ sdkCode: 'A', licenseConfigs: [{ id: 'old' }] }]
    const requested = [{ sdkCode: 'A', licenseConfigs: [{ id: 'new' }] }]
    expect(mergeServiceProperties(existing, requested)).toEqual([{ sdkCode: 'A', licenseConfigs: [{ id: 'new' }] }])
  })

  it('should preserve existing services not in the requested list', () => {
    const existing = [{ sdkCode: 'KeepMe' }, { sdkCode: 'Override' }]
    const requested = [{ sdkCode: 'Override', updated: true }]
    expect(mergeServiceProperties(existing, requested)).toEqual([
      { sdkCode: 'KeepMe' },
      { sdkCode: 'Override', updated: true }
    ])
  })
})

describe('assertSubscribeSuccess', () => {
  it('should not throw on a normal success response', () => {
    expect(() => assertSubscribeSuccess({ sdkList: ['AdobeAnalyticsSDK'] })).not.toThrow()
  })

  it('should not throw on null/undefined', () => {
    expect(() => assertSubscribeSuccess(null)).not.toThrow()
    expect(() => assertSubscribeSuccess(undefined)).not.toThrow()
  })

  it('should not throw on empty error arrays', () => {
    expect(() => assertSubscribeSuccess({ sdkList: [], error: [], errorDetails: [] })).not.toThrow()
  })

  it('should surface the JIL "requires selection of a product" error', () => {
    const jilErrorResponse = {
      error: ['FrameioAPISDK'],
      errorDetails: [{
        sdkCode: 'FrameioAPISDK',
        domain: 'JIL',
        code: 400,
        message: 'Service FrameioAPISDK requires selection of a product'
      }]
    }
    expect(() => assertSubscribeSuccess(jilErrorResponse))
      .toThrow(/Failed to add API service\(s\)[\s\S]*FrameioAPISDK: Service FrameioAPISDK requires selection of a product/)
  })

  it('should fall back to error[] when errorDetails is missing', () => {
    expect(() => assertSubscribeSuccess({ error: ['SomeSDK'] }))
      .toThrow(/Failed to add API service\(s\)[\s\S]*SomeSDK/)
  })

  it('should format error details that lack a sdkCode', () => {
    expect(() => assertSubscribeSuccess({
      errorDetails: [{ domain: 'JIL', code: 500, message: 'kaboom' }]
    })).toThrow(/Failed to add API service\(s\)[\s\S]*kaboom/)
  })

  it('should fall back to JSON.stringify when an error detail lacks a message', () => {
    expect(() => assertSubscribeSuccess({
      errorDetails: [{ sdkCode: 'WeirdSDK', code: 418 }]
    })).toThrow(/Failed to add API service\(s\)[\s\S]*WeirdSDK:[\s\S]*"code":\s*418/)
  })

  it('should tolerate a null entry inside errorDetails', () => {
    expect(() => assertSubscribeSuccess({
      errorDetails: [null]
    })).toThrow(/Failed to add API service\(s\)/)
  })
})

describe('console:workspace:api:add', () => {
  let command

  beforeEach(() => {
    command = new TheCommand([])
    jest.clearAllMocks()
    mockConsoleCLIInstance.getProjects.mockResolvedValue([mockProject])
    mockConsoleCLIInstance.getWorkspaces.mockResolvedValue([mockWorkspace])
    mockConsoleCLIInstance.getEnabledServicesForOrg.mockResolvedValue(mockEnabledServices)
    mockConsoleCLIInstance.getServicePropertiesFromWorkspaceWithCredentialType.mockResolvedValue([])
    mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mockResolvedValue(mockSubscribeResponse)
  })

  afterEach(() => {
    command = null
  })

  it('should add a single API to a workspace', async () => {
    command.argv = [
      '--service-code', 'AppBuilderDataServicesSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    const result = await command.run()

    expect(mockConsoleCLIInstance.subscribeToServicesWithCredentialType).toHaveBeenCalledWith({
      orgId: '12345',
      project: mockProject,
      workspace: mockWorkspace,
      serviceProperties: [
        {
          name: 'App Builder Data Services',
          sdkCode: 'AppBuilderDataServicesSDK',
          roles: null,
          licenseConfigs: null
        }
      ],
      credentialType: 'oauth_server_to_server'
    })
    expect(result).toEqual(mockSubscribeResponse)
  })

  it('should add multiple comma-separated APIs', async () => {
    command.argv = [
      '--service-code', 'CloudIntegrationSDK,AppBuilderDataServicesSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await command.run()

    const call = mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mock.calls[0][0]
    expect(call.serviceProperties).toHaveLength(2)
    expect(call.serviceProperties[0].sdkCode).toBe('CloudIntegrationSDK')
    expect(call.serviceProperties[1].sdkCode).toBe('AppBuilderDataServicesSDK')
  })

  it('should add a service with product profiles by name', async () => {
    command.argv = [
      '--service-code', 'AdobeAnalyticsSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345',
      '--license-config', 'AdobeAnalyticsSDK=Analytics - Adobe IO DEMO'
    ]
    await command.run()

    const call = mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mock.calls[0][0]
    expect(call.serviceProperties).toEqual([
      {
        name: 'Adobe Analytics',
        sdkCode: 'AdobeAnalyticsSDK',
        roles: [{ id: 1, code: 'role1', name: null }],
        licenseConfigs: [{ id: 'lc2', name: 'Analytics - Adobe IO DEMO', productId: 'P1' }]
      }
    ])
  })

  it('should add a service with product profiles by id', async () => {
    command.argv = [
      '--service-code', 'AdobeAnalyticsSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345',
      '--license-config', 'AdobeAnalyticsSDK=lc1,lc2'
    ]
    await command.run()

    const call = mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mock.calls[0][0]
    expect(call.serviceProperties[0].licenseConfigs).toHaveLength(2)
    expect(call.serviceProperties[0].licenseConfigs.map(lc => lc.id)).toEqual(['lc1', 'lc2'])
  })

  it('should error if a service requires profiles but none provided', async () => {
    command.argv = [
      '--service-code', 'AdobeAnalyticsSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow(/require one or more product profiles[\s\S]*Analytics all access/)
    expect(mockConsoleCLIInstance.subscribeToServicesWithCredentialType).not.toHaveBeenCalled()
  })

  it('should error if a requested profile is not available', async () => {
    command.argv = [
      '--service-code', 'AdobeAnalyticsSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345',
      '--license-config', 'AdobeAnalyticsSDK=UnknownProfile'
    ]
    await expect(command.run()).rejects.toThrow('Product profile(s) not found for service AdobeAnalyticsSDK: UnknownProfile')
  })

  it('should error on malformed --license-config value', async () => {
    command.argv = [
      '--service-code', 'AdobeAnalyticsSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345',
      '--license-config', 'not-a-valid-value'
    ]
    await expect(command.run()).rejects.toThrow('Invalid --license-config value')
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
      '--service-code', 'AppBuilderDataServicesSDK',
      '--projectName', 'nonexistent',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('Project nonexistent not found in the Organization.')
  })

  it('should error if workspace is not found', async () => {
    mockConsoleCLIInstance.getWorkspaces.mockResolvedValue([])
    command.argv = [
      '--service-code', 'AppBuilderDataServicesSDK',
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
        '--service-code', 'AppBuilderDataServicesSDK',
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

  it('should use config org.id if orgId flag is not provided', async () => {
    command.argv = [
      '--service-code', 'AppBuilderDataServicesSDK',
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

  it('should error if required flags are missing', async () => {
    command.argv = ['--projectName', 'myproject', '--orgId', '12345']
    await expect(command.run()).rejects.toThrow()
  })

  it('should error if all service codes are empty after parsing', async () => {
    command.argv = [
      '--service-code', ' , , ',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('At least one service code must be provided.')
  })

  it('should handle SDK errors from subscribeToServices', async () => {
    mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mockRejectedValue(new Error('SDK subscribe failed'))
    command.argv = [
      '--service-code', 'AppBuilderDataServicesSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('SDK subscribe failed')
  })

  it('should prefer the entp duplicate service record when adobeid is listed first', async () => {
    // Repro of the Frame.io shape in getEnabledServicesForOrg: same sdkCode
    // appears once as adobeid (no licenseConfigs) and once as entp (with
    // licenseConfigs). The pre-dedup code subscribed against the adobeid
    // record and dropped --license-config silently.
    mockConsoleCLIInstance.getEnabledServicesForOrg.mockResolvedValue([
      { name: 'Frame.io API', code: 'FrameioAPISDK', type: 'adobeid', properties: null },
      {
        name: 'Frame.io API',
        code: 'FrameioAPISDK',
        type: 'entp',
        properties: {
          roles: [{ id: 1102, code: 'frame.s2s.all', name: null }],
          licenseConfigs: [{ id: '875473476', name: 'Default Frame.io Enterprise', productId: 'AA458DFE4F7020A0441A' }]
        }
      }
    ])
    command.argv = [
      '--service-code', 'FrameioAPISDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345',
      '--license-config', 'FrameioAPISDK=875473476'
    ]
    await command.run()

    const call = mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mock.calls[0][0]
    expect(call.serviceProperties).toHaveLength(1)
    expect(call.serviceProperties[0].sdkCode).toBe('FrameioAPISDK')
    expect(call.serviceProperties[0].licenseConfigs).toEqual([
      { id: '875473476', name: 'Default Frame.io Enterprise', productId: 'AA458DFE4F7020A0441A' }
    ])
  })

  it('should merge new services with services already on the credential', async () => {
    // JIL's PUT-services replaces the credential's service list, so the
    // command must submit the union of existing + new.
    mockConsoleCLIInstance.getServicePropertiesFromWorkspaceWithCredentialType.mockResolvedValue([
      { name: 'Existing SDK', sdkCode: 'ExistingSDK', roles: null, licenseConfigs: null }
    ])
    command.argv = [
      '--service-code', 'AppBuilderDataServicesSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await command.run()

    const call = mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mock.calls[0][0]
    expect(call.serviceProperties.map(sp => sp.sdkCode)).toEqual(['ExistingSDK', 'AppBuilderDataServicesSDK'])
  })

  it('should not fail when fetching existing services errors out', async () => {
    // A brand-new workspace has no credential yet; the lib's getServiceProperties
    // call may reject. The command should fall back to "no existing services".
    mockConsoleCLIInstance.getServicePropertiesFromWorkspaceWithCredentialType.mockRejectedValue(new Error('No credential'))
    command.argv = [
      '--service-code', 'AppBuilderDataServicesSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await command.run()

    const call = mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mock.calls[0][0]
    expect(call.serviceProperties.map(sp => sp.sdkCode)).toEqual(['AppBuilderDataServicesSDK'])
  })

  it('should surface JIL embedded errors as a CLI error', async () => {
    mockConsoleCLIInstance.subscribeToServicesWithCredentialType.mockResolvedValue({
      error: ['AppBuilderDataServicesSDK'],
      errorDetails: [{
        sdkCode: 'AppBuilderDataServicesSDK',
        domain: 'JIL',
        code: 400,
        message: 'Service AppBuilderDataServicesSDK requires selection of a product'
      }]
    })
    command.argv = [
      '--service-code', 'AppBuilderDataServicesSDK',
      '--projectName', 'myproject',
      '--workspaceName', 'Stage',
      '--orgId', '12345'
    ]
    await expect(command.run()).rejects.toThrow('requires selection of a product')
  })

  it('should output JSON when --json is used', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = [
        '--service-code', 'AppBuilderDataServicesSDK',
        '--projectName', 'myproject',
        '--workspaceName', 'Stage',
        '--orgId', '12345',
        '--json'
      ]
      await command.run()
      const stdout = stdoutSpy.mock.calls.map(a => a[0]).join('')
      const parsed = JSON.parse(stdout)
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
        '--service-code', 'AppBuilderDataServicesSDK',
        '--projectName', 'myproject',
        '--workspaceName', 'Stage',
        '--orgId', '12345',
        '--yml'
      ]
      await command.run()
      const stdout = stdoutSpy.mock.calls.map(a => a[0]).join('')
      expect(stdout).toContain('sdkList')
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })
})
