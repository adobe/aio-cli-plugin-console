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

const mockConsoleCLIInstance = {}
const orgs = [
  { id: '1', code: 'CODE01', name: 'ORG01', type: 'entp' },
  { id: '2', code: 'CODE02', name: 'ORG02', type: 'entp' },
  { id: '3', code: 'CODE03', name: 'ORG03', type: 'entp' },
  { id: '33', code: 'CODE03', name: 'ORG03', type: 'not_entp' }
]
const selectedOrg = { id: '1', code: 'CODE01', name: 'ORG01', type: 'entp' }
/** @private */
function setDefaultMockConsoleCLI () {
  mockConsoleCLIInstance.getOrganizations = jest.fn().mockResolvedValue(orgs)
  mockConsoleCLIInstance.promptForSelectOrganization = jest.fn().mockResolvedValue(selectedOrg)
}
jest.mock('@adobe/generator-aio-console/lib/console-cli', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn()
}))

const config = require('@adobe/aio-lib-core-config')
const SelectCommand = require('../../../../src/commands/console/org/select')

let command
beforeEach(() => {
  command = new SelectCommand([])
  setDefaultMockConsoleCLI()
  config.set.mockReset()
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
  const orgCode = SelectCommand.args[0]
  expect(orgCode.name).toEqual('orgCode')
  expect(orgCode.required).toEqual(false)
  expect(orgCode.description).toBeDefined()
})

test('flags', async () => {
  expect(SelectCommand.flags.help.type).toBe('boolean')
})

describe('console:org:select', () => {
  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  test('should select the provided org code', async () => {
    command.argv = [selectedOrg.code]
    await expect(command.run()).resolves.not.toThrowError()
    expect(mockConsoleCLIInstance.promptForSelectOrganization).toHaveBeenCalledWith(orgs, { orgCode: selectedOrg.code, orgId: selectedOrg.code })
    // stores the org configuration
    expect(config.set).toHaveBeenCalledWith('console.org', { code: selectedOrg.code, id: selectedOrg.id, name: selectedOrg.name })
  })
  test('should select the provided org id', async () => {
    command.argv = [selectedOrg.id]
    await expect(command.run()).resolves.not.toThrowError()
    expect(mockConsoleCLIInstance.promptForSelectOrganization).toHaveBeenCalledWith(orgs, { orgCode: selectedOrg.id, orgId: selectedOrg.id })
    // stores the org configuration
    expect(config.set).toHaveBeenCalledWith('console.org', { code: selectedOrg.code, id: selectedOrg.id, name: selectedOrg.name })
  })
  test('should prompt for selection if no org is provided', async () => {
    command.argv = []
    await expect(command.run()).resolves.not.toThrowError()
    expect(mockConsoleCLIInstance.promptForSelectOrganization).toHaveBeenCalledWith(orgs, { orgCode: undefined, orgId: undefined })
    // stores the org configuration
    expect(config.set).toHaveBeenCalledWith('console.org', { code: selectedOrg.code, id: selectedOrg.id, name: selectedOrg.name })
  })

  test('throw Error retrieving Orgs', async () => {
    mockConsoleCLIInstance.getOrganizations.mockRejectedValue(new Error('error org'))
    await expect(command.run()).rejects.toThrowError(new Error('error org'))
  })

  test('throw error with provided org', async () => {
    mockConsoleCLIInstance.promptForSelectOrganization.mockRejectedValue(new Error('error bad org'))
    await expect(command.run(['yo'])).rejects.toThrowError(new Error('error bad org'))
  })

  test('error during config set', async () => {
    config.set.mockImplementation(() => { throw new Error('bad config') })
    await expect(command.run()).rejects.toThrow(new Error('bad config'))
  })
})
