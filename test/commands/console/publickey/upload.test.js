/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Command } = require('@oclif/core')
const { stdout } = require('stdout-stderr')
const fs = require('fs')

// mock data

const configOrgId = '012'
const configProjectId = '123'
const configWorkspaceId = '234'
const consoleConfig = {
  project: {
    id: configProjectId,
    name: 'THE_PROJECT',
    workspace: {
      id: configWorkspaceId,
      name: 'Production'
    }
  }
}

const binding1 = {
  bindingId: 'b1',
  orgId: 'orgId',
  technicalAccountId: 'ta1',
  certificateFingerprint: 'cf1',
  notAfter: 1685806324000
}
const binding2 = {
  bindingId: 'b2',
  orgId: 'orgId',
  technicalAccountId: 'ta2',
  certificateFingerprint: 'cf2',
  notAfter: 1685806325000
}

const mockConsoleCLIInstance = {}
/** @private */
function setDefaultMockConsoleCLI () {
  mockConsoleCLIInstance.getWorkspaceConfig = jest.fn().mockResolvedValue(consoleConfig)
  mockConsoleCLIInstance.getBindingsForWorkspace = jest.fn().mockResolvedValue([binding1])
  mockConsoleCLIInstance.uploadAndBindCertificateToWorkspace = jest.fn().mockResolvedValue(binding2)
  mockConsoleCLIInstance.getCertificateFingerprint = jest.fn().mockResolvedValue({ certificateFingerprint: 'cf2' })
}
jest.mock('@adobe/aio-cli-lib-console', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn()
}))
jest.spyOn(fs, 'statSync').mockImplementation(file => {
  if (file === 'certificate_pub.crt') {
    return { isFile: () => { return true } }
  } else if (file === 'a_directory') {
    return { isFile: () => { return false } }
  } else {
    throw new Error('file does not exist')
  }
})
jest.spyOn(fs, 'readFileSync').mockImplementation(file => {
  if (file === 'certificate_pub.crt') {
    return Buffer.from('a PEM encoded cert')
  } else {
    throw new Error('dOEs NoT c()MUPt3')
  }
})

const UploadAndBindCommand = require('../../../../src/commands/console/publickey/upload')

const config = require('@adobe/aio-lib-core-config')
/** @private */
function setDefaultMockConfigGet () {
  config.get.mockReset()
  config.get.mockImplementation(key => {
    if (key === 'console.org.id') {
      return configOrgId
    }
    if (key === 'console.project.id') {
      return configProjectId
    }
    if (key === 'console.workspace.id') {
      return configWorkspaceId
    }
  })
}

test('exports', async () => {
  expect(typeof UploadAndBindCommand).toEqual('function')
  expect(UploadAndBindCommand.prototype instanceof Command).toBeTruthy()
})

test('description', async () => {
  expect(UploadAndBindCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(UploadAndBindCommand.aliases).toBeDefined()
  expect(UploadAndBindCommand.aliases).toBeInstanceOf(Array)
})

test('flags', async () => {
  expect(UploadAndBindCommand.flags.help.type).toBe('boolean')
  expect(UploadAndBindCommand.flags.json.type).toBe('boolean')
  expect(UploadAndBindCommand.flags.yml.type).toBe('boolean')
  expect(UploadAndBindCommand.flags.orgId.type).toBe('option')
  expect(UploadAndBindCommand.flags.projectId.type).toBe('option')
  expect(UploadAndBindCommand.flags.workspaceId.type).toBe('option')
})

describe('console:publickey:upload', () => {
  let command
  beforeEach(() => {
    setDefaultMockConsoleCLI()
    setDefaultMockConfigGet()
    config.set.mockReset()
    command = new UploadAndBindCommand([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  test('should return uploaded binding', async () => {
    command.argv = ['certificate_pub.crt']
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toMatchFixture('publickey/upload.txt')
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace)
    expect(mockConsoleCLIInstance.uploadAndBindCertificateToWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace, 'certificate_pub.crt')
  })

  test('should return uploaded binding when passing orgId, projectId, workspaceId as flags', async () => {
    command.argv = ['--orgId', '000', '--projectId', '999', '--workspaceId', '321', 'certificate_pub.crt']
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toMatchFixture('publickey/upload.txt')
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith('000', consoleConfig.project, consoleConfig.project.workspace)
    expect(mockConsoleCLIInstance.uploadAndBindCertificateToWorkspace).toHaveBeenCalledWith('000', consoleConfig.project, consoleConfig.project.workspace, 'certificate_pub.crt')
  })

  test('should return uploaded binding even if it exists', async () => {
    command.argv = ['certificate_pub.crt']
    mockConsoleCLIInstance.getBindingsForWorkspace = jest.fn().mockResolvedValue([binding1, binding2])
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toMatchFixture('publickey/upload.txt')
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace)
    expect(mockConsoleCLIInstance.uploadAndBindCertificateToWorkspace).toHaveBeenCalledTimes(0)
  })

  test('should return list of single binding as json', async () => {
    command.argv = ['--json', 'certificate_pub.crt']
    await expect(command.run()).resolves.not.toThrowError()
    expect(JSON.parse(stdout.output)).toMatchFixtureJson('publickey/upload.json')
  })

  test('should return list of single binding bindings as yaml', async () => {
    command.argv = ['--yml', 'certificate_pub.crt']
    await expect(command.run()).resolves.not.toThrowError()

    expect(stdout.output).toEqual(expect.stringContaining('bindingId: b2'))
    expect(stdout.output).toEqual(expect.stringContaining('certificateFingerprint: cf2'))
  })

  test('should throw error if file not found', async () => {
    command.argv = ['no_file.crt']
    const spy = jest.spyOn(command, 'error')
    await expect(command.run()).rejects.toThrowError()
    expect(spy).toHaveBeenCalledWith('Invalid publicKey file: no_file.crt')
  })

  test('should throw error if file is directory', async () => {
    command.argv = ['a_directory']
    const spy = jest.spyOn(command, 'error')
    await expect(command.run()).rejects.toThrowError()
    expect(spy).toHaveBeenCalledWith('Invalid publicKey file: a_directory')
  })

  test('should throw error no org selected', async () => {
    command.argv = ['certificate_pub.crt']
    config.get.mockImplementation(k => undefined)
    await expect(command.run()).rejects.toThrowError()
    expect(stdout.output).toMatchFixture('publickey/noOrg-error.txt')
  })

  test('should throw error no project selected', async () => {
    command.argv = ['certificate_pub.crt']
    config.get.mockImplementation(key => {
      if (key === 'console.org.id') {
        return '012'
      }
      if (key === 'console.org.name') {
        return 'THE_ORG'
      }
      return null
    })
    await expect(command.run()).rejects.toThrowError()
    expect(stdout.output).toMatchFixture('publickey/noProj-error.txt')
  })

  test('should throw error no workspace selected', async () => {
    command.argv = ['certificate_pub.crt']
    config.get.mockImplementation(key => {
      if (key === 'console.org.id') {
        return '012'
      }
      if (key === 'console.org.name') {
        return 'THE_ORG'
      }
      if (key === 'console.project.id') {
        return '123'
      }
      if (key === 'console.project.name') {
        return 'THE_PROJECT'
      }
      return null
    })
    await expect(command.run()).rejects.toThrowError()
    expect(stdout.output).toMatchFixture('publickey/noWork-error.txt')
  })

  test('should print error message if getBindingsForWorkspace error', async () => {
    command.argv = ['certificate_pub.crt']
    mockConsoleCLIInstance.getBindingsForWorkspace.mockRejectedValue(new Error('invalid workspace'))
    const spy = jest.spyOn(command, 'error')
    await expect(command.run()).rejects.toThrowError()
    expect(spy).toHaveBeenCalledWith('invalid workspace')
  })
})
