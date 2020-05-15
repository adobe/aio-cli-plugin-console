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

const { Command } = require('@oclif/command')
const { stdout } = require('stdout-stderr')
const sdk = require('@adobe/aio-lib-console')
const ListCommand = require('../../../../src/commands/console/workspace/list')
const ConsoleCommand = require('../../../../src/commands/console')

const getWorkspacesForProject = () => ({
  ok: true,
  body: [
    { id: 1, name: 'WRKSPC1', enabled: 1 },
    { id: 2, name: 'WRKSPC2', enabled: 1 }
  ]
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
  let command
  let handleError

  beforeEach(() => {
    command = new ListCommand([])
    handleError = jest.spyOn(command, 'error')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  describe('successfully list workspaces', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({ getWorkspacesForProject }))
      command.getConfig = jest.fn(() => '111')
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('should return list of workspaces', async () => {
      try {
        await command.run()
      } catch (e) {
        console.log(e)
      }
      expect(stdout.output).toMatchFixture('workspace/list.txt')
      expect(handleError).not.toHaveBeenCalled()
    })

    test('should return list of workspaces as json', async () => {
      command.argv = ['--json']
      try {
        await command.run()
      } catch (e) {
        console.log(e)
      }
      expect(JSON.parse(stdout.output)).toMatchFixtureJson('workspace/list.json')
      expect(handleError).not.toHaveBeenCalled()
    })

    test('should return list of workspaces as yaml', async () => {
      command.argv = ['--yml']
      try {
        await command.run()
      } catch (e) {
        console.log(e)
      }
      expect(stdout.output).toEqual(expect.stringContaining('id: 1'))
      expect(stdout.output).toEqual(expect.stringContaining('id: 2'))
      expect(stdout.output).toEqual(expect.stringContaining('name: WRKSPC1'))
      expect(stdout.output).toEqual(expect.stringContaining('name: WRKSPC2'))
      expect(handleError).not.toHaveBeenCalled()
    })
  })

  describe('fail to list workspaces', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    test('should throw error no org selected', async () => {
      await command.run()
      expect(stdout.output).toMatchFixture('workspace/list-error1.txt')
    })
  })

  test('should throw error no project selected', async () => {
    command.getConfig = jest.fn()
    command.getConfig.mockImplementation(key => {
      if (key === ConsoleCommand.CONFIG_KEYS.ORG) {
        return { name: 'THE_ORG', id: 123 }
      }
      return null
    })
    await command.run()
    expect(stdout.output).toMatchFixture('workspace/list-error2.txt')
  })

  test('should throw Error retrieving Project', async () => {
    command.getConfig = jest.fn()
    command.getConfig.mockImplementation(key => {
      throw new Error('Some Error')
    })
    await expect(command.run()).rejects.toThrow('Some Error')
  })
})
