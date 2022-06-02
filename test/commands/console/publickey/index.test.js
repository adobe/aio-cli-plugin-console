/*
Copyright 2020 Adobe Inc. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const TheCommand = require('../../../../src/commands/console/publickey')
const ConsoleCommand = require('../../../../src/commands/console')
const Help = require('@oclif/plugin-help').default

test('exports', async () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype instanceof ConsoleCommand).toBeTruthy()
})

test('description', async () => {
  expect(TheCommand.description).toBeDefined()
})

test('args', async () => {
  expect(TheCommand.args).toBeUndefined()
})

test('flags', async () => {
  expect(TheCommand.flags.help.type).toBe('boolean')
})

describe('instance methods', () => {
  let command

  beforeEach(() => {
    command = new TheCommand([])
  })

  describe('run', () => {
    test('exists', async () => {
      expect(command.run).toBeInstanceOf(Function)
    })

    test('returns help file for console command', () => {
      const spy = jest.spyOn(Help.prototype, 'showHelp').mockReturnValue(true)
      return command.run().then(() => {
        expect(spy).toHaveBeenCalledWith(['console:publickey', '--help'])
      })
    })
  })
})
