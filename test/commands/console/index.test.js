/*
Copyright 2018 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const ConsoleCommand = require('../../../src/commands/console')
const ConsoleExports = require('../../../src')
const {stdout} = require('stdout-stderr')
const ListIntegrationsCommand = require('../../../src/commands/console/list-integrations')

beforeAll(() => stdout.start())
afterAll(() => stdout.stop())

describe('ConsoleCommand (index) ', () => {
  test('call with no params', async () => {
    let spy = jest.spyOn(ConsoleCommand, 'run')
    let spyList = jest.spyOn(ListIntegrationsCommand, 'run').mockImplementation(() => Promise.resolve())
    await ConsoleCommand.run([])

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spyList).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith([])
    expect(spyList).toHaveBeenCalledWith(['--passphrase=undefined'])
  })

  test('exports', async () => {
    expect(typeof ConsoleExports.index).toEqual('function')
    expect(typeof ConsoleExports['list-integrations']).toEqual('function')
    expect(typeof ConsoleExports['select-integration']).toEqual('function')
  })
})

describe('basic command properties', () => {
  test('has a description', () => {
    expect(ConsoleCommand.description).toBeDefined()
  })

  test('has a examples', () => {
    expect(ConsoleCommand.examples).toBeDefined()
  })

  test('has flags', () => {
    expect(ConsoleCommand.flags).toBeDefined()
  })
})
