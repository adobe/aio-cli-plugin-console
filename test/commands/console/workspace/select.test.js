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
const SelectCommand = require('../../../../src/commands/console/workspace/select')

const getWorkspace = () => ({
  ok: true,
  body: { id: 111, name: 'workspace1', enabled: 1 }
})

const getWorkspaceError = () => ({
  ok: false,
  body: []
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
  const workspaceId = SelectCommand.args[0]
  expect(workspaceId.name).toEqual('workspaceId')
  expect(workspaceId.required).toEqual(false)
})

describe('console:workspace:select', () => {
  let command
  let handleError

  beforeEach(() => {
    command = new SelectCommand([])
    handleError = jest.spyOn(command, 'error')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  describe('successfully select workspace', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({ getWorkspace }))
      command.getConfig = jest.fn(() => '111')
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('should select the provided workspace', async () => {
      try {
        command.argv = ['111']
        await command.run()
      } catch (e) {
        console.log(e)
      }
      expect(stdout.output).toMatchFixture('workspace/select.txt')
      expect(handleError).not.toHaveBeenCalled()
    })
  })

  describe('fail to select workspaces', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({ getWorkspacesForProject: getWorkspaceError }))
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('should throw error no org selected', async () => {
      let error
      try {
        command.argv = ['1']
        await command.run()
      } catch (e) {
        error = e
      }
      expect(error.toString()).toEqual('Error: No Organization selected')
    })

    test('should throw error no project selected', async () => {
      let error
      command.getConfig = jest.fn()
      command.getConfig.mockReturnValueOnce('111')
      try {
        command.argv = ['1']
        await command.run()
      } catch (e) {
        error = e
      }
      expect(error.toString()).toEqual('Error: No Project selected')
    })
  })
})
