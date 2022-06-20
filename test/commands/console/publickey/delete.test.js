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
  mockConsoleCLIInstance.getBindingsForWorkspace = jest.fn().mockResolvedValue([binding1, binding2])
  mockConsoleCLIInstance.deleteBindingFromWorkspace = jest.fn().mockResolvedValue(true)
}
jest.mock('@adobe/aio-cli-lib-console', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn()
}))

const DeleteCommand = require('../../../../src/commands/console/publickey/delete')

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
  expect(typeof DeleteCommand).toEqual('function')
  expect(DeleteCommand.prototype instanceof Command).toBeTruthy()
})

test('description', async () => {
  expect(DeleteCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(DeleteCommand.aliases).toBeDefined()
  expect(DeleteCommand.aliases).toBeInstanceOf(Array)
})

test('flags', async () => {
  expect(DeleteCommand.flags.help.type).toBe('boolean')
  expect(DeleteCommand.flags.orgId.type).toBe('option')
  expect(DeleteCommand.flags.projectId.type).toBe('option')
  expect(DeleteCommand.flags.workspaceId.type).toBe('option')
})

describe('console:publickey:delete', () => {
  let command
  beforeEach(() => {
    setDefaultMockConsoleCLI()
    setDefaultMockConfigGet()
    config.set.mockReset()
    command = new DeleteCommand([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  test('should delete binding1', async () => {
    command.argv = ['b1']
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toEqual(expect.stringContaining('Deleted binding b1'))
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace)
    expect(mockConsoleCLIInstance.deleteBindingFromWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace, binding1)
  })

  test('should delete binding1 by fingerprint', async () => {
    command.argv = ['cf1']
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toEqual(expect.stringContaining('Deleted binding b1'))
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace)
    expect(mockConsoleCLIInstance.deleteBindingFromWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace, binding1)
  })

  test('should delete binding2', async () => {
    command.argv = ['b2']
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toEqual(expect.stringContaining('Deleted binding b2'))
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace)
    expect(mockConsoleCLIInstance.deleteBindingFromWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace, binding2)
  })

  test('should delete binding2 by fingerprint', async () => {
    command.argv = ['cf2']
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toEqual(expect.stringContaining('Deleted binding b2'))
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace)
    expect(mockConsoleCLIInstance.deleteBindingFromWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace, binding2)
  })

  test('should delete binding when passing orgId, projectId, workspaceId as flags', async () => {
    command.argv = ['--orgId', '000', '--projectId', '999', '--workspaceId', '321', 'b2']
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toEqual(expect.stringContaining('Deleted binding b2'))
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith('000', consoleConfig.project, consoleConfig.project.workspace)
    expect(mockConsoleCLIInstance.deleteBindingFromWorkspace).toHaveBeenCalledWith('000', consoleConfig.project, consoleConfig.project.workspace, binding2)
  })

  test('should error if binding not found', async () => {
    command.argv = ['b2']
    mockConsoleCLIInstance.getBindingsForWorkspace = jest.fn().mockResolvedValue([binding1])
    await expect(command.run()).rejects.toThrow('No binding found with bindingId or fingerprint b2')
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace)
    expect(mockConsoleCLIInstance.deleteBindingFromWorkspace).toHaveBeenCalledTimes(0)
  })

  test('should error if binding not deleted', async () => {
    command.argv = ['b2']
    mockConsoleCLIInstance.deleteBindingFromWorkspace = jest.fn().mockResolvedValue(false)
    await expect(command.run()).rejects.toThrow('Failed to delete binding b2 from workspace Production')
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace)
    expect(mockConsoleCLIInstance.deleteBindingFromWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace, binding2)
  })

  test('should throw error no org selected', async () => {
    command.argv = ['b2']
    config.get.mockImplementation(k => undefined)
    await expect(command.run()).rejects.toThrowError()
    expect(stdout.output).toMatchFixture('publickey/noOrg-error.txt')
  })

  test('should throw error no project selected', async () => {
    command.argv = ['b2']
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
    command.argv = ['b2']
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
    command.argv = ['b2']
    mockConsoleCLIInstance.getBindingsForWorkspace.mockRejectedValue(new Error('invalid workspace'))
    const spy = jest.spyOn(command, 'error')
    await expect(command.run()).rejects.toThrowError()
    expect(spy).toHaveBeenCalledWith('invalid workspace')
  })
})
