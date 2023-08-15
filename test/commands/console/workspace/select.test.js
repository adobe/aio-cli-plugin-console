/*
Copyright 2020 Adobe. All rights reserved.
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
const workspaces = [
  { id: 111, name: 'workspace1', enabled: 1 },
  { id: 222, name: 'workspace2', enabled: 1 }
]
const selectedWorkspace = workspaces[0]
const configOrgId = '012'
const configProjectId = '123'

const mockConsoleCLIInstance = {}
/** @private */
function setDefaultMockConsoleCLI () {
  mockConsoleCLIInstance.getWorkspaces = jest.fn().mockResolvedValue(workspaces)
  mockConsoleCLIInstance.promptForSelectWorkspace = jest.fn().mockResolvedValue(selectedWorkspace)
}
jest.mock('@adobe/aio-cli-lib-console', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn()
}))

const SelectCommand = require('../../../../src/commands/console/workspace/select')

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
  })
}

let command
beforeEach(() => {
  setDefaultMockConsoleCLI()
  setDefaultMockConfigGet()
  config.set.mockReset()
  command = new SelectCommand()
})

test('exports', async () => {
  expect(typeof SelectCommand).toEqual('function')
  expect(SelectCommand.prototype instanceof Command).toBeTruthy()
})

test('description', async () => {
  expect(SelectCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(SelectCommand.aliases).toBeDefined()
  expect(SelectCommand.aliases).toBeInstanceOf(Array)
  expect(SelectCommand.aliases.length).toBeGreaterThan(0)
})

test('args', async () => {
  expect(SelectCommand.args).toBeDefined()
  expect(SelectCommand.args).toBeInstanceOf(Object)

  const workspaceIdOrName = SelectCommand.args.workspaceIdOrName
  expect(workspaceIdOrName).toBeDefined()
  expect(workspaceIdOrName.description).toEqual('Adobe Developer Console Workspace id or Workspace name')
  expect(workspaceIdOrName.required).toEqual(false)
})

describe('console:workspace:select', () => {
  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })
  test('should select the provided workspaceId', async () => {
    command.argv = ['111']
    await expect(command.run()).resolves.not.toThrow()
    expect(mockConsoleCLIInstance.getWorkspaces).toHaveBeenCalledWith(configOrgId, configProjectId)
    expect(mockConsoleCLIInstance.promptForSelectWorkspace).toHaveBeenCalledWith(
      workspaces, { workspaceId: '111', workspaceName: '111' }, { allowCreate: false }
    )
    expect(config.set).toHaveBeenCalledWith(
      'console.workspace', { name: selectedWorkspace.name, id: selectedWorkspace.id }
    )
  })

  test('should select the provided workspaceName', async () => {
    command.argv = ['name']
    await expect(command.run()).resolves.not.toThrow()
    expect(mockConsoleCLIInstance.getWorkspaces).toHaveBeenCalledWith(configOrgId, configProjectId)
    expect(mockConsoleCLIInstance.promptForSelectWorkspace).toHaveBeenCalledWith(
      workspaces, { workspaceId: 'name', workspaceName: 'name' }, { allowCreate: false }
    )
    expect(config.set).toHaveBeenCalledWith(
      'console.workspace', { name: selectedWorkspace.name, id: selectedWorkspace.id }
    )
  })

  test('should select the provided workspaceName with specified projectId and orgId', async () => {
    command.argv = ['name', '--projectId', '000', '--orgId', '3214']
    await expect(command.run()).resolves.not.toThrow()
    expect(mockConsoleCLIInstance.getWorkspaces).toHaveBeenCalledWith('3214', '000')
    expect(mockConsoleCLIInstance.promptForSelectWorkspace).toHaveBeenCalledWith(
      workspaces, { workspaceId: 'name', workspaceName: 'name' }, { allowCreate: false }
    )
    expect(config.set).toHaveBeenCalledWith(
      'console.workspace', { name: selectedWorkspace.name, id: selectedWorkspace.id }
    )
  })

  test('should prompt to select if workspace is not provided', async () => {
    command.argv = []
    await expect(command.run()).resolves.not.toThrow()
    expect(mockConsoleCLIInstance.getWorkspaces).toHaveBeenCalledWith(configOrgId, configProjectId)
    expect(mockConsoleCLIInstance.promptForSelectWorkspace).toHaveBeenCalledWith(
      workspaces, { workspaceId: null, workspaceName: null }, { allowCreate: false }
    )
    expect(config.set).toHaveBeenCalledWith(
      'console.workspace', { name: selectedWorkspace.name, id: selectedWorkspace.id }
    )
  })
  test('should throw error if no org is selected nor passed by flag', async () => {
    config.get.mockImplementation(k => undefined)
    command.argv = ['111']
    await expect(command.run()).rejects.toThrow()
    expect(stdout.output).toMatchFixture('workspace/select-error1.txt')
  })

  test('should throw error if no project is selected nor passed by flag', async () => {
    config.get.mockImplementation(k => {
      if (k === 'console.org.name') {
        return 'THE_ORG'
      }
      if (k === 'console.org.id') {
        return 123
      }
      return undefined
    })
    command.argv = ['111']
    await expect(command.run()).rejects.toThrow()
    expect(stdout.output).toMatchFixture('workspace/select-error2.txt')
  })

  test('error while retrieving workspaces', async () => {
    command.argv = []
    mockConsoleCLIInstance.getWorkspaces.mockRejectedValue(new Error('Error retrieving Workspaces'))
    await expect(command.run()).rejects.toThrow('Error retrieving Workspaces')
  })
})
