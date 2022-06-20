/*
Copyright 2022 Adobe Inc. All rights reserved.
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
const { Help, CliUx: { ux: cli } } = require('@oclif/core')

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
  console.log('TheCommand = ', JSON.stringify(ConsoleCommand, 0, 2))
  expect(TheCommand.flags.help.type).toBe('boolean')
})

test('formatExpiry', async () => {
  expect(typeof TheCommand.formatExpiry).toEqual('function')
  expect(TheCommand.formatExpiry(1685806325000)).toEqual('2023-06-02')
})

test('printBindings', async () => {
  expect(typeof TheCommand.printBindings).toEqual('function')
  const spyFormatExpiry = jest.spyOn(TheCommand, 'formatExpiry')
  const spyTable = jest.spyOn(cli, 'table')
  const bindingWithExpires = {
    bindingId: 'testBinding1',
    orgId: 'testOrgId',
    technicalAccountId: 'testId1',
    certificateFingerprint: 'testFingerprint1',
    notAfter: 1685806324000
  }
  const bindingWithoutExpires = {
    bindingId: 'testBinding2',
    orgId: 'testOrgId',
    technicalAccountId: 'testId2',
    certificateFingerprint: 'testFingerprint2'
  }
  const decoratedWithExpires = {}
  const decoratedWithoutExpires = {}
  Object.assign(decoratedWithExpires, bindingWithExpires)
  decoratedWithExpires.expiresString = '2023-06-02'
  Object.assign(decoratedWithoutExpires, bindingWithoutExpires)
  decoratedWithoutExpires.expiresString = ''
  const columns = {
    bindingId: {
      header: 'ID'
    },
    certificateFingerprint: {
      header: 'Fingerprint'
    },
    expiresString: {
      header: 'Expires'
    }
  }
  TheCommand.printBindings([bindingWithExpires, bindingWithoutExpires])
  expect(spyFormatExpiry).toHaveBeenCalledWith(1685806324000)
  expect(spyTable).toHaveBeenLastCalledWith([decoratedWithExpires, decoratedWithoutExpires], columns)
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
      command.config = {}
      const spy = jest.spyOn(Help.prototype, 'showHelp').mockResolvedValue(true)
      return command.run().then(() => {
        expect(spy).toHaveBeenCalledWith(['console:publickey', '--help'])
      })
    })
  })
})
