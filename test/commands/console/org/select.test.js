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
const SelectCommand = require('../../../../src/commands/console/org/select')

const getOrganizations = () => ({
  ok: true,
  body: [
    { id: '1', code: 'CODE01', name: 'ORG01', type: 'entp' },
    { id: '2', code: 'CODE02', name: 'ORG02', type: 'entp' },
    { id: '3', code: 'CODE03', name: 'ORG03', type: 'entp' },
    { id: '4', code: 'CODE03', name: 'ORG03', type: 'not_entp' }
  ]
})

const getOrganizationsError = () => ({
  ok: false,
  body: []
})

const mockConfigGet = (key) => {
  const consoleConfig = {
    'org.id': 1,
    'org.code': 'CODE01',
    'org.name': 'ORG01'
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
  const orgId = SelectCommand.args[0]
  expect(orgId.name).toEqual('orgId')
  expect(orgId.required).toEqual(true)
  expect(orgId.description).toBeDefined()
})

test('flags', async () => {
  expect(SelectCommand.flags.help.type).toBe('boolean')
})

describe('console:org:select', () => {
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

  describe('successfully select org', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({ getOrganizations }))
      config.get.mockImplementation(mockConfigGet)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('should select the provided org', async () => {
      try {
        command.argv = ['1']
        await command.run()
      } catch (e) {
        console.log(e)
      }
      expect(stdout.output).toMatchFixture('org/select.txt')
      expect(handleError).not.toHaveBeenCalled()
    })
  })

  describe('fail to list org', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({ getOrganizations: getOrganizationsError }))
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('throw Error retrieving Orgs', async () => {
      let error
      try {
        command.argv = ['1']
        await command.run()
      } catch (e) {
        error = e
      }
      expect(error.toString()).toEqual('Error: Error retrieving Orgs')
    })
  })

  describe('invalid org id', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({
        getOrganizations: jest.fn(() => ({
          ok: true,
          body: []
        }))
      }))
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('throw Invalid OrgId', async () => {
      let error
      try {
        command.argv = ['1']
        await command.run()
      } catch (e) {
        error = e
      }
      expect(error.toString()).toEqual('Error: Invalid OrgId')
    })
  })

  describe('error selecting org', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({
        getOrganizations
      }))
      command.setConfig = jest.fn(() => {
        throw new Error('Error')
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('throw Invalid OrgId', async () => {
      let error
      try {
        command.argv = ['1']
        await command.run()
      } catch (e) {
        error = e
      }
      expect(error.toString()).toEqual('Error: Failed to select Org')
    })
  })
})
