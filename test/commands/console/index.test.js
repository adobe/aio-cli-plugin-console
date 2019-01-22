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

beforeAll(() => stdout.start())
afterAll(() => stdout.stop())

test('call with no params', async () => {
  expect.assertions(2)

  let runResult = ConsoleCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('Missing 1 required arg:\nsub-command\nSee more help with --help'))
})

test('exports', async () => {
  expect(typeof ConsoleExports.index).toEqual('function')
  expect(typeof ConsoleExports['list-integrations']).toEqual('function')
  expect(typeof ConsoleExports['select-integration']).toEqual('function')
})
