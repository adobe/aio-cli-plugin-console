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
  { id: 1, name: 'WRKSPC1', enabled: 1 },
  { id: 2, name: 'WRKSPC2', enabled: 1 }
]
const configOrgId = '012'
const configProjectId = '123'

const mockConsoleCLIInstance = {}
/** @private */
function setDefaultMockConsoleCLI () {
  mockConsoleCLIInstance.getWorkspaces = jest.fn().mockResolvedValue(workspaces)
}
jest.mock('@adobe/aio-cli-lib-console', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn()
}))

const ListCommand = require('../../../../src/commands/console/workspace/list')

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
  command = new ListCommand([])
})

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
  expect(ListCommand.aliases.length).toBeGreaterThan(0)
})

test('flags', async () => {
  expect(ListCommand.flags.help.type).toBe('boolean')
  expect(ListCommand.flags.json.type).toBe('boolean')
  expect(ListCommand.flags.yml.type).toBe('boolean')
})

describe('console:workspace:list', () => {
  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  test('should return list of workspaces', async () => {
    command.argv = []
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toMatchFixture('workspace/list.txt')
    expect(mockConsoleCLIInstance.getWorkspaces).toHaveBeenCalledWith(configOrgId, configProjectId)
  })

  test('should return list of workspaces when passing orgId and projectId as flags', async () => {
    command.argv = ['--orgId', '000', '--projectId', '999']
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toMatchFixture('workspace/list.txt')
    expect(mockConsoleCLIInstance.getWorkspaces).toHaveBeenCalledWith('000', '999')
  })

  test('should return list of workspaces as json', async () => {
    command.argv = ['--json']
    await expect(command.run()).resolves.not.toThrowError()

    expect(JSON.parse(stdout.output)).toMatchFixtureJson('workspace/list.json')
  })

  test('should return list of workspaces as yaml', async () => {
    command.argv = ['--yml']
    await expect(command.run()).resolves.not.toThrowError()

    expect(stdout.output).toEqual(expect.stringContaining('id: 1'))
    expect(stdout.output).toEqual(expect.stringContaining('id: 2'))
    expect(stdout.output).toEqual(expect.stringContaining('name: WRKSPC1'))
    expect(stdout.output).toEqual(expect.stringContaining('name: WRKSPC2'))
  })

  test('should throw error no org selected', async () => {
    command.argv = []
    config.get.mockImplementation(k => undefined)
    await expect(command.run()).rejects.toThrowError()
    expect(stdout.output).toMatchFixture('workspace/list-error1.txt')
  })

  test('should throw error no project selected', async () => {
    command.argv = []
    config.get.mockImplementation(key => {
      if (key === 'console.org.id') {
        return 123
      }
      if (key === 'console.org.name') {
        return 'THE_ORG'
      }
      return null
    })
    await expect(command.run()).rejects.toThrowError()
    expect(stdout.output).toMatchFixture('workspace/list-error2.txt')
  })

  test('should throw Error for getWorkspacesForProject', async () => {
    command.argv = []
    mockConsoleCLIInstance.getWorkspaces.mockRejectedValue(new Error('Error retrieving Workspaces'))
    await expect(command.run()).rejects.toThrow('Error retrieving Workspaces')
  })
})
