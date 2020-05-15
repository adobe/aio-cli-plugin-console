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
const config = require('@adobe/aio-cli-config')
const SelectCommand = require('../../../../src/commands/console/project/select')

const getProject = () => ({
  ok: true,
  body: {
    appId: null,
    date_created: '2020-04-29T10:14:17.000Z',
    date_last_modified: '2020-04-29T10:14:17.000Z',
    deleted: 0,
    description: 'Description 1',
    id: '1000000001',
    name: 'name1',
    org_id: 1001,
    title: 'Title 1',
    type: 'default'
  }
})

const getProjectError = () => ({
  ok: false,
  body: []
})

const mockConfigGet = (key) => {
  const consoleConfig = {
    'org.id': 1,
    'org.code': 'CODE01',
    'org.name': 'ORG01',
    'project.id': '1000000001',
    'project.name': 'name1'
  }
  const orgKey = key.replace('$console.', '')
  return consoleConfig[orgKey]
}

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
  const projectId = SelectCommand.args[0]
  expect(projectId.name).toEqual('projectId')
  expect(projectId.required).toEqual(true)
  expect(projectId.description).toBeDefined()
})

test('flags', async () => {
  expect(SelectCommand.flags.help.type).toBe('boolean')
  expect(SelectCommand.flags.orgId.type).toBe('option')
})

describe('console:project:select', () => {
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

  describe('successfully select a project', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({ getProject }))
      config.get.mockImplementation(mockConfigGet)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('should select a project with given projectId and orgId', async () => {
      try {
        // Project id
        command.argv = ['1001', '--orgId', '1']
        await command.run()
      } catch (e) {
        console.log(e)
      }
      expect(stdout.output).toMatchFixture('project/select.txt')
      expect(handleError).not.toHaveBeenCalled()
    })

    test('should select a project with given projectId', async () => {
      try {
        // Project id
        command.argv = ['1001']
        await command.run()
      } catch (e) {
        console.log(e)
      }
      expect(stdout.output).toMatchFixture('project/select.txt')
      expect(handleError).not.toHaveBeenCalled()
    })
  })

  describe('fail to select project', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({ getProject }))
      config.get.mockImplementation(mockConfigGet)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('should throw error if org not set', async () => {
      config.get.mockReturnValue(undefined)
      let error
      try {
        // Project id
        command.argv = ['1001']
        await command.run()
      } catch (e) {
        error = e
        console.log(e)
      }
      expect(error.toString()).toEqual('Error: No Organization selected')
    })

    test('should throw Error retrieving Project', async () => {
      sdk.init.mockImplementation(() => ({ getProject: getProjectError }))

      let error
      try {
        // Project id
        command.argv = ['1001']
        await command.run()
      } catch (e) {
        error = e
        console.log(e)
      }
      expect(error.toString()).toEqual('Error: Error retrieving Project')
    })

    test('should throw Invalid Project ID', async () => {
      sdk.init.mockImplementation(() => ({
        getProject: jest.fn(() => ({
          ok: true
        }))
      }))

      let error
      try {
        // Project id
        command.argv = ['1001']
        await command.run()
      } catch (e) {
        error = e
        console.log(e)
      }
      expect(error.toString()).toEqual('Error: Invalid Project ID')
    })

    test('should throw Failed to select Project', async () => {
      command.setConfig = jest.fn(() => {
        throw new Error('Error')
      })

      let error
      try {
        // Project id
        command.argv = ['1001']
        await command.run()
      } catch (e) {
        error = e
        console.log(e)
      }
      expect(error.toString()).toEqual('Error: Failed to select Project')
      expect(handleError).toHaveBeenCalled()
    })
  })
})
