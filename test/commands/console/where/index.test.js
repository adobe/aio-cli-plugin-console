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
const WhereCommand = require('../../../../src/commands/console/where')
const mockLogger = require('@adobe/aio-lib-core-logging')

beforeEach(() => {
  mockLogger.mockReset()
})

test('exports', async () => {
  expect(typeof WhereCommand).toEqual('function')
  expect(WhereCommand.prototype instanceof Command).toBeTruthy()
})

test('description', async () => {
  expect(WhereCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(WhereCommand.aliases).toEqual(['where'])
})

test('flags', async () => {
  expect(WhereCommand.flags.help.type).toBe('boolean')
  expect(WhereCommand.flags.json.char).toBe('j')
  expect(WhereCommand.flags.json.exclusive).toEqual(['yml'])
  expect(WhereCommand.flags.yml.type).toBe('boolean')
  expect(WhereCommand.flags.yml.char).toBe('y')
  expect(WhereCommand.flags.yml.exclusive).toEqual(['json'])
})

test('debug logs', async () => {
  expect(mockLogger.calledWithFirst).toEqual(['@adobe/aio-cli-plugin-console:where', { provider: 'debug' }])
  const command = new WhereCommand([])
  command.printConsoleConfig = jest.fn()
  await command.run()
  expect(mockLogger.debug).toHaveBeenCalled()
})

describe('where', () => {
  let command
  beforeEach(() => {
    command = new WhereCommand()
    command.printConsoleConfig = jest.fn()
  })
  test('<no flags>', async () => {
    command.argv = []
    await command.run()
    expect(command.printConsoleConfig).toHaveBeenCalledWith({})
  })
  test('--json', async () => {
    command.argv = ['--json']
    await command.run()
    expect(command.printConsoleConfig).toHaveBeenCalledWith({ alternativeFormat: 'json' })
  })
  test('--yml', async () => {
    command.argv = ['--yml']
    await command.run()
    expect(command.printConsoleConfig).toHaveBeenCalledWith({ alternativeFormat: 'yml' })
  })
})
