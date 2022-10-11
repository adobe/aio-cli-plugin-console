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

const { stdout } = require('stdout-stderr')

const TestCommand = require('../../../src/commands/console/open')
const config = require('@adobe/aio-lib-core-config')
const { PROD_ENV, STAGE_ENV, DEFAULT_ENV } = require('@adobe/aio-lib-env')

jest.mock('@oclif/core', () => {
  return {
    ...jest.requireActual('@oclif/core'),
    CliUx: {
      ux: {
        open: jest.fn()
      }
    }
  }
})
const { Command, CliUx: { ux: cli } } = require('@oclif/core')

let command
beforeEach(() => {
  config.get.mockReset()
  delete process.env.AIO_CLI_ENV
  command = new TestCommand([])
})

let ORIGINAL_AIO_CLI_ENV
beforeAll(() => {
  ORIGINAL_AIO_CLI_ENV = process.env.AIO_CLI_ENV
})
afterAll(() => {
  process.env.AIO_CLI_ENV = ORIGINAL_AIO_CLI_ENV
})

test('exports', async () => {
  expect(typeof TestCommand).toEqual('function')
  expect(TestCommand.prototype instanceof Command).toBeTruthy()
})

test('description', async () => {
  expect(TestCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(TestCommand.aliases).toBeDefined()
  expect(TestCommand.aliases).toBeInstanceOf(Array)
  expect(TestCommand.aliases.length).toBeGreaterThan(0)
})

test('flags', async () => {
  expect(TestCommand.flags.help.type).toBe('boolean')
})

describe('console:open', () => {
  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  test('should open a browser', async () => {
    await expect(command.run()).resolves.not.toThrowError()
    expect(cli.open).toHaveBeenCalledWith('https://developer.adobe.com/console/projects')
  })


  test('should open a browser (stage_env)', async () => {
    process.env.AIO_CLI_ENV = STAGE_ENV
    await expect(command.run()).resolves.not.toThrowError()
    expect(cli.open).toHaveBeenCalledWith('https://developer-stage.adobe.com/console/projects')
  })

  test('should open a browser with selected project', async () => {
    config.get.mockReturnValue('{ project: { id:"1234", org_id: "5678"}}')
    await expect(command.run()).resolves.not.toThrowError()
    expect(cli.open).toHaveBeenLastCalledWith('https://developerd.adobe.com/console/projects')
  })

})
