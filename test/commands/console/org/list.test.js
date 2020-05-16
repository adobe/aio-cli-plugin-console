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
const ListCommand = require('../../../../src/commands/console/org/list')

const getOrganizations = () => ({
  ok: true,
  body: [
    { id: 1, code: 'CODE01', name: 'ORG01', type: 'entp' },
    { id: 2, code: 'CODE02', name: 'ORG02', type: 'entp' },
    { id: 3, code: 'CODE03', name: 'ORG03', type: 'entp' },
    { id: 3, code: 'CODE03', name: 'ORG03', type: 'not_entp' }
  ]
})

const getOrganizationsError = () => ({
  ok: false,
  body: [],
  error: 'Some Error'
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
  expect(ListCommand.flags.json.char).toBe('j')
  expect(ListCommand.flags.json.exclusive).toEqual(['yml'])
  expect(ListCommand.flags.yml.type).toBe('boolean')
  expect(ListCommand.flags.yml.char).toBe('y')
  expect(ListCommand.flags.yml.exclusive).toEqual(['json'])
})

describe('console:org:list', () => {
  let command

  beforeEach(() => {
    command = new ListCommand([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  describe('successfully list orgs', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({ getOrganizations }))
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('should return list of orgs', async () => {
      await expect(command.run()).resolves.not.toThrowError()
      expect(stdout.output).toMatchFixture('org/list.txt')
    })

    test('should return list of orgs as json', async () => {
      command.argv = ['--json']
      await expect(command.run()).resolves.not.toThrowError()
      expect(JSON.parse(stdout.output)).toMatchFixtureJson('org/list.json')
    })

    test('should return list of orgs as yaml', async () => {
      command.argv = ['--yml']
      await expect(command.run()).resolves.not.toThrowError()
      expect(stdout.output).toMatchFixture('org/list.yml')
    })
  })

  describe('fail to list org', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({ getOrganizations: getOrganizationsError }))
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('should return list of orgs', async () => {
      await expect(command.run()).rejects.toThrowError(new Error('Error retrieving Orgs'))
    })
  })
})
