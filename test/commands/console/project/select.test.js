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
const config = require('@adobe/aio-lib-core-config')
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

  beforeEach(() => {
    command = new SelectCommand([])
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
      // Project id
      command.argv = ['1001', '--orgId', '1']
      await expect(command.run()).resolves.not.toThrowError()
      expect(stdout.output).toMatchFixture('project/select.txt')
    })

    test('should select a project with given projectId', async () => {
      command.argv = ['1001']
      await expect(command.run()).resolves.not.toThrowError()
      expect(stdout.output).toMatchFixture('project/select.txt')
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
      command.argv = ['1001']
      await expect(command.run()).rejects.toThrowError()
      expect(stdout.output).toMatchFixture('project/select-error.txt')
    })

    test('should throw Error retrieving Project', async () => {
      sdk.init.mockImplementation(() => ({ getProject: getProjectError }))
      command.argv = ['1001']
      await expect(command.run()).rejects.toThrowError(new Error('Error retrieving Project'))
    })
  })
})
