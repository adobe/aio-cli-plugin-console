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

const { Command } = require('@oclif/command')
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

const bindings = [
  {
    bindingId: 'b1',
    orgId: 'orgId',
    technicalAccountId: 'ta1',
    certificateFingerprint: 'cf1',
    notAfter: 1685806324000
  },
  {
    bindingId: 'b2',
    orgId: 'orgId',
    technicalAccountId: 'ta2',
    certificateFingerprint: 'cf2',
    notAfter: 1685806325000
  }
]

const mockConsoleCLIInstance = {}
/** @private */
function setDefaultMockConsoleCLI () {
  mockConsoleCLIInstance.getWorkspaceConfig = jest.fn().mockResolvedValue(consoleConfig)
  mockConsoleCLIInstance.getBindingsForWorkspace = jest.fn().mockResolvedValue(bindings)
}
jest.mock('@adobe/aio-cli-lib-console', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn()
}))

const ListCommand = require('../../../../src/commands/console/publickey/list')

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
  expect(typeof ListCommand).toEqual('function')
  expect(ListCommand.prototype instanceof Command).toBeTruthy()
})

test('description', async () => {
  expect(ListCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(ListCommand.aliases).toBeDefined()
  expect(ListCommand.aliases).toBeInstanceOf(Array)
})

test('flags', async () => {
  expect(ListCommand.flags.help.type).toBe('boolean')
  expect(ListCommand.flags.json.type).toBe('boolean')
  expect(ListCommand.flags.yml.type).toBe('boolean')
  expect(ListCommand.flags.orgId.type).toBe('option')
  expect(ListCommand.flags.projectId.type).toBe('option')
  expect(ListCommand.flags.workspaceId.type).toBe('option')
})

describe('console:publickey:list', () => {
  let command
  beforeEach(() => {
    setDefaultMockConsoleCLI()
    setDefaultMockConfigGet()
    config.set.mockReset()
    command = new ListCommand([])
  })

  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  test('should return list of bindings', async () => {
    command.argv = []
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toMatchFixture('publickey/list.txt')
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith(configOrgId, consoleConfig.project, consoleConfig.project.workspace)
  })

  test('should return list of bindings when passing orgId, projectId, workspaceId as flags', async () => {
    command.argv = ['--orgId', '000', '--projectId', '999', '--workspaceId', '321']
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toMatchFixture('publickey/list.txt')
    expect(mockConsoleCLIInstance.getBindingsForWorkspace).toHaveBeenCalledWith('000', consoleConfig.project, consoleConfig.project.workspace)
  })

  test('should return list of bindings as json', async () => {
    command.argv = ['--json']
    await expect(command.run()).resolves.not.toThrowError()

    expect(JSON.parse(stdout.output)).toMatchFixtureJson('publickey/list.json')
  })

  test('should return list of bindings as yaml', async () => {
    command.argv = ['--yml']
    await expect(command.run()).resolves.not.toThrowError()

    expect(stdout.output).toEqual(expect.stringContaining('bindingId: b1'))
    expect(stdout.output).toEqual(expect.stringContaining('bindingId: b2'))
    expect(stdout.output).toEqual(expect.stringContaining('certificateFingerprint: cf1'))
    expect(stdout.output).toEqual(expect.stringContaining('certificateFingerprint: cf2'))
  })

  test('should throw error no org selected', async () => {
    command.argv = []
    config.get.mockImplementation(k => undefined)
    await expect(command.run()).rejects.toThrowError()
    expect(stdout.output).toMatchFixture('publickey/noOrg-error.txt')
  })

  test('should throw error no project selected', async () => {
    command.argv = []
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
    command.argv = []
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
    command.argv = []
    mockConsoleCLIInstance.getBindingsForWorkspace.mockRejectedValue(new Error('invalid workspace'))
    const spy = jest.spyOn(command, 'error')
    await expect(command.run()).rejects.toThrowError()
    expect(spy).toHaveBeenCalledWith('invalid workspace')
  })
})
